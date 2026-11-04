'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const WebSocket=require('ws');

async function freePort(){
 const server=net.createServer();
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 await new Promise(resolve=>server.close(resolve));
 return port;
}
async function openSocket(url,ip='203.0.113.11'){
 return new Promise((resolve,reject)=>{
  const socket=new WebSocket(url,{headers:{Origin:'https://saeedsai.github.io','X-Forwarded-For':ip}});
  const timer=setTimeout(()=>{socket.terminate();reject(new Error('WebSocket open timed out'));},5000);
  socket.once('open',()=>{clearTimeout(timer);resolve(socket);});
  socket.once('error',error=>{clearTimeout(timer);reject(error);});
 });
}
async function startBroker(t,port){
 const preload=path.resolve('tests/fixtures/lan-test-clock-preload.mjs');
 const server=spawn(process.execPath,['--import',pathToFileURL(preload).href,'scripts/lan-server.mjs'],{
  cwd:process.cwd(),stdio:['pipe','pipe','pipe'],
  env:{...process.env,LAN_PORT:String(port),LAN_BIND:'127.0.0.1',LAN_MAX_CONNECTIONS:'4',
   SMF_SIGNAL_MODE:'hosted',SMF_PUBLIC_ORIGIN:'https://saeedsai.github.io'}
 });
 let output='';
 server.stdout.setEncoding('utf8').on('data',chunk=>output+=chunk);
 server.stderr.setEncoding('utf8').on('data',chunk=>output+=chunk);
 t.after(async()=>{
  if(server.exitCode===null){server.kill();await new Promise(resolve=>server.once('exit',resolve));}
 });
 let ready=false;
 for(let i=0;i<80&&!ready;i++){
  if(server.exitCode!==null)throw new Error(`LAN broker exited early: ${output}`);
  try{ready=(await fetch(`http://127.0.0.1:${port}/healthz`)).status===200}catch{}
  if(!ready)await new Promise(resolve=>setTimeout(resolve,50));
 }
 assert.equal(ready,true,`LAN broker failed to start: ${output}`);
 return {server,getOutput:()=>output};
}
async function setClock(server,update,getOutput){
 const seen=getOutput().split('CLOCK_SET').length-1;
 server.stdin.write(JSON.stringify(update)+'\n');
 for(let i=0;i<100;i++){
  if(getOutput().split('CLOCK_SET').length-1>seen)return;
  await new Promise(resolve=>setTimeout(resolve,5));
 }
 throw new Error('test clock update was not acknowledged');
}
function waitForClose(socket){
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('signaling client did not close at the configured limit')),5000);
  socket.once('close',(code,reason)=>{clearTimeout(timer);resolve({code,reason:String(reason)});});
 });
}
async function waitForCount(predicate,description){
 for(let i=0;i<200;i++){
  if(predicate())return;
  await new Promise(resolve=>setTimeout(resolve,10));
 }
 throw new Error(`timed out waiting for ${description}`);
}
async function closeSocket(socket){
 if(socket.readyState===WebSocket.CLOSED)return;
 await new Promise(resolve=>{const timer=setTimeout(()=>{socket.terminate();resolve();},1000);socket.once('close',()=>{clearTimeout(timer);resolve();});socket.close();});
}
async function receive(socket,type,check=()=>true,messages=[]){
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{socket.off('message',onMessage);reject(new Error(`timed out waiting for ${type}`));},3000);
  function onMessage(payload){let message;try{message=JSON.parse(String(payload))}catch{return} messages.push(message);if(message.type===type&&check(message)){clearTimeout(timer);socket.off('message',onMessage);resolve(message)}}
  socket.on('message',onMessage);
 });
}

test('signaling-message window resets on monotonic elapsed time after wall-clock rollback',{timeout:15000},async t=>{
 const port=await freePort(),url=`ws://127.0.0.1:${port}/lan-signal`;
 const {server,getOutput}=await startBroker(t,port);
 const socket=await openSocket(url);
 t.after(()=>closeSocket(socket));
 const closed=waitForClose(socket);
 for(let i=0;i<119;i++)socket.send('{');
 socket.send(JSON.stringify({type:'rooms',scope:'internet-p2p'}));
 await receive(socket,'rooms-snapshot'); // confirms the first 120 messages were processed.
 await setClock(server,{wall:100000,elapsed:61000},getOutput); // wall rolled back; elapsed crossed 60 seconds.
 socket.send('{');
 await new Promise(resolve=>setTimeout(resolve,80));
 assert.equal(socket.readyState,WebSocket.OPEN,'the reset monotonic window accepts a fresh message');
 for(let i=0;i<120;i++)socket.send('{');
 const result=await closed;
 assert.equal(result.code,1008);
 assert.equal(result.reason,'Signaling rate limit');
});

test('relay byte window cannot be reset by a forward wall-clock jump',{timeout:20000},async t=>{
 const port=await freePort(),url=`ws://127.0.0.1:${port}/lan-signal`;
 const {server,getOutput}=await startBroker(t,port);
 const host=await openSocket(url,'203.0.113.11'),guest=await openSocket(url,'198.51.100.22');
 const hostMessages=[];
 host.on('message',payload=>{try{hostMessages.push(JSON.parse(String(payload)))}catch{}});
 guest.on('message',()=>{});
 t.after(async()=>{await Promise.all([closeSocket(host),closeSocket(guest)]);});
 host.send(JSON.stringify({type:'host',roomId:'room_clock_relay',name:'Clock Relay',build:'test',scope:'internet-p2p'}));
 await receive(host,'host-registered');
 guest.send(JSON.stringify({type:'rooms',scope:'internet-p2p'}));
 await receive(guest,'rooms-snapshot');
 guest.send(JSON.stringify({type:'join',roomId:'room_clock_relay',requestId:'request_clock01',build:'test'}));
 await receive(host,'join-request');
 host.send(JSON.stringify({type:'decision',roomId:'room_clock_relay',requestId:'request_clock01',accept:true}));
 await receive(guest,'join-accept');
 host.send(JSON.stringify({type:'relay-offer',roomId:'room_clock_relay',sdp:'v=0\\r\\ntest'}));
 await receive(guest,'relay-offer');
 const payload='x'.repeat(23000),closed=waitForClose(guest),payloadFrames=()=>hostMessages.filter(message=>message.type==='relay-frame'&&message.data===payload).length;
 for(let i=0;i<22;i++)guest.send(JSON.stringify({type:'relay-frame',roomId:'room_clock_relay',data:payload}));
 await waitForCount(()=>payloadFrames()===22,'the under-budget relay prefix');
 await setClock(server,{wall:1700000005000,elapsed:1000},getOutput); // forward wall jump, monotonic window unchanged.
 guest.send(JSON.stringify({type:'relay-frame',roomId:'room_clock_relay',data:payload}));
 const result=await closed;
 assert.equal(result.code,1008);
 assert.equal(result.reason,'Relay traffic limit');
 assert.equal(host.readyState,WebSocket.OPEN,'the receiving peer remains connected');
 assert.equal(payloadFrames(),22,'the over-budget frame is not forwarded');
});
