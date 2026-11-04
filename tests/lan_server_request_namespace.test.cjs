'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const WebSocket=require('ws');

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

test('LAN broker scopes pending request IDs by room and rejects forged cross-room decisions',{timeout:30000},async t=>{
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
 const hostA=client(url),hostB=client(url),guestA=client(url),guestB=client(url);
 await Promise.all([hostA.opened,hostB.opened,guestA.opened,guestB.opened]);
 t.after(async()=>{await Promise.all([hostA,hostB,guestA,guestB].map(peer=>closeSocket(peer.ws)));});

 const roomA='room_namespace_A',roomB='room_namespace_B',shared='request_shared_0001',second='request_shared_0002';
 hostA.ws.send(JSON.stringify({type:'host',roomId:roomA,name:'Room A',build:'test'}));
 hostB.ws.send(JSON.stringify({type:'host',roomId:roomB,name:'Room B',build:'test'}));
 await Promise.all([receive(hostA,'host-registered'),receive(hostB,'host-registered')]);
 const join=(peer,roomId,requestId)=>peer.ws.send(JSON.stringify({type:'join',roomId,requestId,build:'test'}));
 const decide=(peer,roomId,requestId,accept)=>peer.ws.send(JSON.stringify({type:'decision',roomId,requestId,accept}));

 join(guestA,roomA,shared);
 await receive(hostA,'join-request',m=>m.roomId===roomA&&m.requestId===shared);
 join(guestB,roomB,shared);
 await receive(hostB,'join-request',m=>m.roomId===roomB&&m.requestId===shared);

 // A decision from host A using room B's visible request ID must not consume
 // the distinct room B entry or notify either room B participant.
 decide(hostA,roomB,shared,true);
 await new Promise(resolve=>setTimeout(resolve,60));
 assert.equal(guestB.messages.some(m=>m.type==='join-accept'&&m.roomId===roomB&&m.requestId===shared),false);
 assert.equal(hostB.messages.some(m=>m.type==='guest-approved'&&m.roomId===roomB&&m.requestId===shared),false);

 // Leaving A cancels only A's pending request; B can still approve its guest.
 guestA.ws.send(JSON.stringify({type:'leave'}));
 await receive(hostA,'join-cancel',m=>m.roomId===roomA&&m.requestId===shared);
 decide(hostB,roomB,shared,true);
 await Promise.all([
  receive(guestB,'join-accept',m=>m.roomId===roomB&&m.requestId===shared),
  receive(hostB,'guest-approved',m=>m.roomId===roomB&&m.requestId===shared)
 ]);

 // Recreate the same-ID overlap. Host A's departure must remove only its
 // room's entry; host B's same-ID request remains approvable.
 join(guestA,roomA,second);
 await receive(hostA,'join-request',m=>m.roomId===roomA&&m.requestId===second);
 guestB.ws.send(JSON.stringify({type:'leave'}));
 await receive(hostB,'guest-left',m=>m.roomId===roomB);
 join(guestB,roomB,second);
 await receive(hostB,'join-request',m=>m.roomId===roomB&&m.requestId===second);

 hostA.ws.close();
 await receive(guestA,'join-reject',m=>m.roomId===roomA&&m.requestId===second&&m.reason==='host-left');
 decide(hostB,roomB,second,true);
 await Promise.all([
  receive(guestB,'join-accept',m=>m.roomId===roomB&&m.requestId===second),
  receive(hostB,'guest-approved',m=>m.roomId===roomB&&m.requestId===second)
 ]);
});

test('LAN expiry and guest-release helpers keep duplicate wire IDs distinct by stored room',async()=>{
 const expiry=await import(pathToFileURL(path.resolve('scripts/lan-pending-expiry.mjs')).href);
 const release=await import(pathToFileURL(path.resolve('scripts/lan-guest-release.mjs')).href);
 const hostA={},hostB={},guestA={},guestB={},pending=new Map([
  ['room_A:request_shared',{roomId:'room_A',requestId:'request_shared',host:hostA,guest:guestA,time:0}],
  ['room_B:request_shared',{roomId:'room_B',requestId:'request_shared',host:hostB,guest:guestB,time:0}]
 ]),rooms=new Map(),events=[];
 const send=(to,message)=>events.push({to,...message});
 assert.equal(expiry.expireLanPending(pending,send,30001),2);
 assert.equal(pending.size,0);
 assert.deepEqual(events.map(({roomId,requestId})=>[roomId,requestId]),[
  ['room_A','request_shared'],['room_A','request_shared'],['room_B','request_shared'],['room_B','request_shared']
 ]);
 pending.set('room_A:request_shared',{roomId:'room_A',requestId:'request_shared',host:hostA,guest:guestA});
 pending.set('room_B:request_shared',{roomId:'room_B',requestId:'request_shared',host:hostB,guest:guestB});
 events.length=0;
 assert.deepEqual(release.releaseLanGuest(guestA,rooms,pending,send),{cancelled:1,released:0});
 assert.equal(pending.has('room_A:request_shared'),false);
 assert.equal(pending.has('room_B:request_shared'),true);
 assert.deepEqual(events.map(({roomId,requestId})=>[roomId,requestId]),[['room_A','request_shared']]);
});
