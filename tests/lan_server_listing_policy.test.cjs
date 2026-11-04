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
function connect(url){
 const socket=new WebSocket(url,{headers:{Origin:'https://saeedsai.github.io','X-Forwarded-For':'203.0.113.50'}}),messages=[];
 socket.on('message',payload=>{try{messages.push(JSON.parse(String(payload)))}catch{}});
 return {socket,messages,opened:new Promise((resolve,reject)=>{socket.once('open',resolve);socket.once('error',reject);})};
}
async function receive(peer,type,predicate=()=>true,from=0){
 for(let i=0;i<300;i++){
  const message=peer.messages.slice(from).find(item=>item.type===type&&predicate(item));
  if(message)return message;
  await new Promise(resolve=>setTimeout(resolve,10));
 }
 throw new Error(`Timed out waiting for ${type}; received ${JSON.stringify(peer.messages.slice(from))}`);
}
function send(peer,message){peer.socket.send(JSON.stringify(message));}
async function closeSocket(socket){
 if(socket.readyState===WebSocket.CLOSED)return;
 await new Promise(resolve=>{const timer=setTimeout(()=>{socket.terminate();resolve();},1000);socket.once('close',()=>{clearTimeout(timer);resolve();});socket.close();});
}

test('hosted room scope and public listing changes fail closed',{timeout:20000},async t=>{
 const port=await freePort(),url=`ws://127.0.0.1:${port}/lan-signal`,server=spawn(process.execPath,['scripts/lan-server.mjs'],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],
  env:{...process.env,LAN_PORT:String(port),LAN_BIND:'127.0.0.1',LAN_MAX_CONNECTIONS:'8',SMF_SIGNAL_MODE:'hosted',SMF_PUBLIC_ORIGIN:'https://saeedsai.github.io',PYTHONUTF8:'1'}
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

 const observer=connect(url),host=connect(url),legacyHost=connect(url);
 await Promise.all([observer.opened,host.opened,legacyHost.opened]);
 t.after(async()=>{await Promise.all([observer,host,legacyHost].map(peer=>closeSocket(peer.socket)));});
 send(observer,{type:'rooms',scope:'internet-p2p'});
 await receive(observer,'rooms-snapshot');

 const privateRoom='room_private_01';
 send(host,{type:'host',roomId:privateRoom,name:'Private room',build:'test',scope:'internet-p2p',public:'false'});
 const malformed=await receive(host,'error',m=>m.message==='Invalid public listing choice');
 assert.equal(malformed.message,'Invalid public listing choice');
 const hostStart=host.messages.length;
 send(host,{type:'host',roomId:privateRoom,name:'Private room',build:'test',scope:'internet-p2p',public:false});
 await receive(host,'host-registered',m=>m.roomId===privateRoom,hostStart);

 let observerStart=observer.messages.length;
 send(observer,{type:'rooms',scope:'internet-p2p'});
 const privateSnapshot=await receive(observer,'rooms-snapshot',()=>true,observerStart);
 assert.deepEqual(privateSnapshot.rooms,[],'explicitly private rooms stay absent from directory snapshots');

 const rebindStart=host.messages.length,announceStart=observer.messages.length;
 send(host,{type:'host',roomId:privateRoom,name:'Private room',build:'test',scope:'lan',public:false});
 const mismatch=await receive(host,'error',m=>m.message==='Cannot change discovery scope for an active room',rebindStart);
 assert.equal(mismatch.message,'Cannot change discovery scope for an active room');
 assert.equal(observer.messages.slice(announceStart).some(m=>m.type==='room-announce'&&m.roomId===privateRoom),false,
  'a rejected scope change must not publish a formerly private room');
 observerStart=observer.messages.length;
 send(observer,{type:'rooms',scope:'internet-p2p'});
 const stillPrivate=await receive(observer,'rooms-snapshot',()=>true,observerStart);
 assert.deepEqual(stillPrivate.rooms,[],'rejected scope changes leave active room visibility unchanged');

 const publicStart=host.messages.length,publicAnnounceStart=observer.messages.length;
 send(host,{type:'host',roomId:privateRoom,name:'Private room',build:'test',scope:'internet-p2p',public:true});
 await receive(host,'host-registered',m=>m.roomId===privateRoom,publicStart);
 await receive(observer,'room-announce',m=>m.roomId===privateRoom,publicAnnounceStart);

 // Older clients that omit `public` retain the pre-LAN29 public behavior.
 const legacyRoom='room_legacy_01',legacyStart=legacyHost.messages.length,legacyAnnounceStart=observer.messages.length;
 send(legacyHost,{type:'host',roomId:legacyRoom,name:'Legacy room',build:'test',scope:'internet-p2p'});
 await receive(legacyHost,'host-registered',m=>m.roomId===legacyRoom,legacyStart);
 await receive(observer,'room-announce',m=>m.roomId===legacyRoom,legacyAnnounceStart);
});
