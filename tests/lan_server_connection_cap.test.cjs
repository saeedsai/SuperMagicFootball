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
function openSocket(url){
 return new Promise((resolve,reject)=>{
  const socket=new WebSocket(url),timer=setTimeout(()=>{socket.terminate();reject(new Error('WebSocket open timed out'));},5000);
  socket.once('open',()=>{clearTimeout(timer);resolve(socket);});
  socket.once('error',error=>{clearTimeout(timer);reject(error);});
 });
}
async function closeSocket(socket){
 if(socket.readyState===WebSocket.CLOSED)return;
 await new Promise(resolve=>{const timer=setTimeout(()=>{socket.terminate();resolve();},1000);socket.once('close',()=>{clearTimeout(timer);resolve();});socket.close();});
}
test('LAN server rejects a handshake above global cap and reuses capacity after disconnect',{timeout:20000},async t=>{
 const port=await freePort(),url=`ws://127.0.0.1:${port}/lan-signal`,server=spawn(process.execPath,['scripts/lan-server.mjs'],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],
  env:{...process.env,LAN_PORT:String(port),LAN_BIND:'127.0.0.1',LAN_MAX_CONNECTIONS:'2',PYTHONUTF8:'1'}
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
 const first=await openSocket(url),second=await openSocket(url);
 let thirdStatus=null;
 await new Promise((resolve,reject)=>{
  const third=new WebSocket(url),timer=setTimeout(()=>{third.terminate();reject(new Error('capacity rejection timed out'));},5000);
  third.once('unexpected-response',(_request,response)=>{clearTimeout(timer);thirdStatus=response.statusCode;response.resume();resolve();});
  third.once('open',()=>{clearTimeout(timer);third.close();reject(new Error('global cap accepted an excess WebSocket'));});
  third.once('error',()=>{});
 });
 assert.equal(thirdStatus,503);
 await closeSocket(first);
 const recovered=await openSocket(url);
 await closeSocket(second);await closeSocket(recovered);
});
