'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('all platforms default to one-tap automatic Host Game and Find Games',()=>{
 const lobby=read('src/modules/lan-lobby.js');
 assert.ok(lobby.includes('return mountAutoLanLobby(root,options)'));
 assert.ok(!lobby.includes("hostname==='saeedsai.github.io'"));
 assert.ok(!lobby.includes('lanServerIp'));
});
test('secure hosted signaling endpoint is configurable and lobby shows connection failures',()=>{
 const signal=read('src/modules/lan-auto-signal.js');
 const auto=read('src/modules/lan-auto-lobby.js');
 assert.ok(signal.includes('SMF_LAN_SIGNAL_URL'));
 assert.ok(signal.includes('wss:'));
 assert.ok(signal.includes("onState('unconfigured')"));
 assert.ok(signal.includes("hostname==='saeedsai.github.io'"));
 assert.ok(auto.includes('id="autoHost"')&&auto.includes('id="autoFind"'));
 assert.ok(auto.includes('requires an online signaling service'));
});

test('host and find do not promise rooms when signaling is unconfigured',()=>{
 const auto=read('src/modules/lan-auto-lobby.js');
 assert.ok(auto.includes("signalState='connecting'"));
 assert.ok(auto.includes("signalState=s"));
 assert.ok(auto.includes("function host(){if(signalState==='unconfigured')"));
 assert.ok(auto.includes("function find(){if(signalState==='unconfigured')"));
});

test('public Pages automatically selects deployed secure signaling endpoint',async()=>{
 const source=read('src/modules/lan-auto-signal.js');
 const previousLocation=globalThis.location;
 const previousEndpoint=globalThis.SMF_LAN_SIGNAL_URL;
 const states=[];
 let socketUrl='';
 try{
  globalThis.location={protocol:'https:',hostname:'saeedsai.github.io',host:'saeedsai.github.io'};
  delete globalThis.SMF_LAN_SIGNAL_URL;
  const {connectLanSignal}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  class Socket {constructor(url){socketUrl=url;this.readyState=0} addEventListener(){} close(){}}
  const connection=connectLanSignal({WebSocketImpl:Socket,onState:s=>states.push(s)});
  assert.equal(socketUrl,'wss://supermagicfootball-lan-signal.onrender.com/lan-signal');
  assert.equal(connection.ready,false);
  connection.close();
 }finally{
  if(previousLocation===undefined)delete globalThis.location;else globalThis.location=previousLocation;
  if(previousEndpoint===undefined)delete globalThis.SMF_LAN_SIGNAL_URL;else globalThis.SMF_LAN_SIGNAL_URL=previousEndpoint;
 }
});

test('host consent is not falsely acknowledged after signaling disconnect',()=>{
 const auto=read('src/modules/lan-auto-lobby.js');
 assert.ok(auto.includes("if(!send({type:'decision',roomId,requestId:m.requestId,accept:true}))return status("));
 assert.ok(auto.includes("if(!send({type:'decision',roomId,requestId:m.requestId,accept:false}))return status("));
 assert.ok(auto.includes("Discovery disconnected. Cannot approve guest"));
 assert.ok(auto.includes("Discovery disconnected. Cannot reject guest"));
});
