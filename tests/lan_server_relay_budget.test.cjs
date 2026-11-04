'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net');
const WebSocket=require('ws');

async function freePort(){
 const server=net.createServer();
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 await new Promise(resolve=>server.close(resolve));
 return port;
}
function connect(url,ip){
 const ws=new WebSocket(url,{headers:{Origin:'https://saeedsai.github.io','X-Forwarded-For':ip}}),messages=[];
 ws.on('message',payload=>{try{messages.push(JSON.parse(String(payload)))}catch{}});
 return {ws,messages,opened:new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);})};
}
async function receive(client,type,check=()=>true){
 for(let i=0;i<200;i++){
  const match=client.messages.find(message=>message.type===type&&check(message));
  if(match)return match;
  await new Promise(resolve=>setTimeout(resolve,10));
 }
 throw Error(`Timed out waiting for ${type}; received ${JSON.stringify(client.messages)}`);
}
async function closeSocket(socket){
 if(socket.readyState===WebSocket.CLOSED)return;
 await new Promise(resolve=>{const timer=setTimeout(()=>{socket.terminate();resolve();},1000);socket.once('close',()=>{clearTimeout(timer);resolve();});socket.close();});
}

test('LAN broker bounds approved relay ingress bytes and leaves the peer available',{timeout:20000},async t=>{
 const port=await freePort(),url=`ws://127.0.0.1:${port}/lan-signal`,server=spawn(process.execPath,['scripts/lan-server.mjs'],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],
  env:{...process.env,LAN_PORT:String(port),LAN_BIND:'127.0.0.1',SMF_SIGNAL_MODE:'hosted',SMF_PUBLIC_ORIGIN:'https://saeedsai.github.io',PYTHONUTF8:'1'}
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

 const host=connect(url,'203.0.113.11'),guest=connect(url,'198.51.100.22');
 await Promise.all([host.opened,guest.opened]);
 t.after(async()=>{await Promise.all([closeSocket(host.ws),closeSocket(guest.ws)]);});
 host.ws.send(JSON.stringify({type:'host',roomId:'room_relay_budget',name:'Relay Budget',build:'test',scope:'internet-p2p'}));
 await receive(host,'host-registered');
 guest.ws.send(JSON.stringify({type:'rooms',scope:'internet-p2p'}));
 await receive(guest,'rooms-snapshot');
 guest.ws.send(JSON.stringify({type:'join',roomId:'room_relay_budget',requestId:'request_budget01',build:'test'}));
 await receive(host,'join-request');
 host.ws.send(JSON.stringify({type:'decision',roomId:'room_relay_budget',requestId:'request_budget01',accept:true}));
 await receive(guest,'join-accept');
 await receive(host,'guest-approved');
 host.ws.send(JSON.stringify({type:'relay-offer',roomId:'room_relay_budget',sdp:'v=0\r\ntest'}));

 const small='valid-frame';
 guest.ws.send(JSON.stringify({type:'relay-frame',roomId:'room_relay_budget',data:small}));
 await receive(host,'relay-frame',frame=>frame.data===small);

 // 23 valid ~23KB frames exceed the 512KiB inbound window. A healthy peer
 // receives the bounded prefix; only the sender that exceeds the budget closes.
 const payload='x'.repeat(23000),closed=new Promise(resolve=>guest.ws.once('close',(code,reason)=>resolve({code,reason:String(reason)})));
 for(let i=0;i<23;i++)guest.ws.send(JSON.stringify({type:'relay-frame',roomId:'room_relay_budget',data:payload}));
 let timeout;
 const result=await Promise.race([closed,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('excess relay traffic was not closed')),5000);})]);
 clearTimeout(timeout);
 assert.equal(result.code,1008);
 assert.equal(host.ws.readyState,WebSocket.OPEN,'the receiving peer stays connected');
 assert.ok(host.messages.filter(message=>message.type==='relay-frame'&&message.data===payload).length>0,
  'valid relay frames are still forwarded before the sender exceeds its budget');
});
