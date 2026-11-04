'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net');
const fs=require('node:fs');
const vm=require('node:vm');
const WebSocket=require('ws');

test('LAN broker replay tombstones expire exactly at 30 seconds and reclaim a bounded room slot',()=>{
 const source=fs.readFileSync('scripts/lan-server.mjs','utf8').replace(/\r\n/g,'\n');
 const constants=source.slice(source.indexOf('const JOIN_REPLAY_TTL_MS='),source.indexOf('\nconst safeGuestName'));
 assert.ok(constants.includes('JOIN_REPLAY_TTL_MS=30000')&&constants.includes('MAX_JOIN_REPLAY_PER_ROOM=64'));
 const helperStart=source.indexOf('function pruneJoinReplay('),helperEnd=source.indexOf('\nconst roomScope=',helperStart);
 assert.ok(helperStart>=0&&helperEnd>helperStart,'join replay helper must exist in broker');
 const replay=vm.runInNewContext(`(()=>{${constants}\n${source.slice(helperStart,helperEnd)}\nreturn {rememberJoinReplay};})()`);
 const room={joinReplay:new Map()};
 for(let i=0;i<64;i++)assert.equal(replay.rememberJoinReplay(room,`request_${i}`,i*10),'');
 assert.equal(replay.rememberJoinReplay(room,'request_0',29999),'request-replay','ID remains reserved until its exact TTL boundary');
 assert.equal(replay.rememberJoinReplay(room,'request_new',29999),'request-replay-capacity','full live tombstone table fails closed');
 assert.equal(replay.rememberJoinReplay(room,'request_0',30000),'','ID may be reused at expiry');
 assert.equal(room.joinReplay.size,64,'the expired slot is reclaimed while newer tombstones remain');
 assert.equal(room.joinReplay.has('request_1'),true,'unexpired IDs stay protected');
});

async function freePort(){
 const server=net.createServer();
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 await new Promise(resolve=>server.close(resolve));
 return port;
}
function client(url){
 const ws=new WebSocket(url),messages=[];
 ws.on('message',payload=>{try{messages.push(JSON.parse(String(payload)))}catch{}});
 return {ws,messages,opened:new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);})};
}
async function receive(peer,type,predicate=()=>true){
 for(let i=0;i<300;i++){
  const message=peer.messages.find(item=>item.type===type&&predicate(item));
  if(message)return message;
  await new Promise(resolve=>setTimeout(resolve,10));
 }
 throw new Error(`Timed out waiting for ${type}; received ${JSON.stringify(peer.messages)}`);
}
async function closeSocket(socket){
 if(socket.readyState===WebSocket.CLOSED)return;
 await new Promise(resolve=>{const timer=setTimeout(()=>{socket.terminate();resolve();},1000);socket.once('close',()=>{clearTimeout(timer);resolve();});socket.close();});
}

test('LAN broker suppresses reused join IDs, accepts fresh IDs, and caps per-room replay memory',{timeout:30000},async t=>{
 const port=await freePort(),url=`ws://127.0.0.1:${port}/lan-signal`,server=spawn(process.execPath,['scripts/lan-server.mjs'],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],
  env:{...process.env,LAN_PORT:String(port),LAN_BIND:'127.0.0.1',LAN_MAX_CONNECTIONS:'4',PYTHONUTF8:'1'}
 });
 let output='';server.stdout.setEncoding('utf8').on('data',chunk=>output+=chunk);server.stderr.setEncoding('utf8').on('data',chunk=>output+=chunk);
 t.after(async()=>{if(server.exitCode===null){server.kill();await new Promise(resolve=>server.once('exit',resolve));}});
 let ready=false;
 for(let i=0;i<80&&!ready;i++){
  if(server.exitCode!==null)throw new Error(`LAN server exited early: ${output}`);
  try{ready=(await fetch(`http://127.0.0.1:${port}/healthz`)).status===200}catch{}
  if(!ready)await new Promise(resolve=>setTimeout(resolve,100));
 }
 assert.equal(ready,true,`LAN server failed to start: ${output}`);
 const host=client(url),guest=client(url);
 await Promise.all([host.opened,guest.opened]);
 t.after(async()=>{await Promise.all([closeSocket(host.ws),closeSocket(guest.ws)]);});

 const roomId='room_replay_01';
 host.ws.send(JSON.stringify({type:'host',roomId,name:'Replay Test',build:'test'}));
 await receive(host,'host-registered');
 async function request(requestId){
  guest.ws.send(JSON.stringify({type:'join',roomId,requestId,build:'test'}));
 }
 async function reject(requestId){
  host.ws.send(JSON.stringify({type:'decision',roomId,requestId,accept:false}));
  await receive(guest,'join-reject',message=>message.requestId===requestId);
 }

 const reused='request_replay0001';
 await request(reused);
 await receive(host,'join-request',message=>message.requestId===reused);
 await reject(reused);
 await request(reused);
 const replay=await receive(guest,'join-reject',message=>message.requestId===reused&&message.reason==='request-replay');
 assert.equal(replay.reason,'request-replay');
 await new Promise(resolve=>setTimeout(resolve,60));
 assert.equal(host.messages.filter(message=>message.type==='join-request'&&message.requestId===reused).length,1,
  'a decided request ID must not reopen the host approval prompt');

 const fresh='request_fresh000001';
 await request(fresh);
 await receive(host,'join-request',message=>message.requestId===fresh);
 await reject(fresh);

 // 64 accepted IDs are retained for at most 30 seconds. The explicit cap
 // fails closed for additional unique IDs instead of growing room memory.
 for(let i=0;i<62;i++){
  const requestId=`request_${String(i).padStart(8,'0')}`;
  await request(requestId);
  await receive(host,'join-request',message=>message.requestId===requestId);
  await reject(requestId);
 }
 const overLimit='request_over_limit01';
 await request(overLimit);
 const capacity=await receive(guest,'join-reject',message=>message.requestId===overLimit);
 assert.equal(capacity.reason,'request-replay-capacity');
 assert.equal(host.messages.filter(message=>message.type==='join-request').length,64,
  'over-capacity IDs must not create another pending host prompt');
});
