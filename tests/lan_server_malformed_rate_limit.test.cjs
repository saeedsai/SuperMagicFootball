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
async function openSocket(url){
 return new Promise((resolve,reject)=>{
  const socket=new WebSocket(url),timer=setTimeout(()=>{socket.terminate();reject(new Error('WebSocket open timed out'));},5000);
  socket.once('open',()=>{clearTimeout(timer);resolve(socket);});
  socket.once('error',error=>{clearTimeout(timer);reject(error);});
 });
}
test('LAN server rate-limits malformed signaling frames before JSON can bypass the message budget',{timeout:20000},async t=>{
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
 const socket=await openSocket(url);
 const closed=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('malformed message flood was not closed')),5000);
  socket.once('close',(code,reason)=>{clearTimeout(timer);resolve({code,reason:String(reason)});});
 });
 for(let i=0;i<121;i++)socket.send('{');
 const result=await closed;
 assert.equal(result.code,1008);
 assert.equal(result.reason,'Signaling rate limit');
});
