'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
// ESM gameplay modules are imported inside the asynchronous test.

// The actual WebRTC/game bridge is covered by lan_live_match and peer tests.
// This checks two independently mounted UIs, broker messages, host consent,
// automatic discovery and handoff without an external signaling dependency.
test('Online P2P two-client automatic room discovery requires host approval before common match handoff',async()=>{
 const {mountAutoLanLobby}=await import('../src/modules/lan-auto-lobby.js');
 const oldCrypto=Object.getOwnPropertyDescriptor(globalThis,'crypto');
 const oldDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
 const oldLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
 const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 class Element{
  constructor(){this.children=[];this.textContent='';this.listeners={};this.disabled=false;this.checked=false;this.value='';}
  replaceChildren(...items){this.children=items;}
  append(...items){this.children.push(...items);}
  addEventListener(name,fn){this.listeners[name]=fn;}
  removeEventListener(name,fn){if(this.listeners[name]===fn)delete this.listeners[name];}
  click(){this.listeners.click?.();}
 }
 const document={createElement(){return new Element();}};
 const createRoot=()=>{
  const nodes=new Map();
  return {innerHTML:'',querySelector(key){
   if(!nodes.has(key))nodes.set(key,new Element());
   return nodes.get(key);
  }};
 };
 const sockets=[],rooms=new Map(),ready=[];
 const broker=({onState,onEvent,internet})=>{
  const socket={onState,onEvent,scope:internet?'internet-p2p':'lan'};
  sockets.push(socket);
  return {get ready(){return true;},close(){socket.closed=true;},send(msg){
   if(msg.type==='host'){
    rooms.set(msg.roomId,{host:socket,name:msg.name,build:msg.build,scope:msg.scope??'lan',listed:msg.public!==false});
    socket.onEvent({type:'host-registered',roomId:msg.roomId});
   }
   if(msg.type==='rooms'){
    const listed=[...rooms].filter(([,room])=>room.scope===(msg.scope??'lan')&&(room.scope!=='internet-p2p'||room.listed)).map(([roomId,room])=>
      ({roomId,name:room.name,build:room.build,scope:room.scope,full:false}));
    socket.onEvent({type:'rooms-snapshot',rooms:listed});
   }
   if(msg.type==='join'){
    socket.joinedRoomId=msg.roomId;
    socket.requestId=msg.requestId;
    rooms.get(msg.roomId)?.host.onEvent({type:'join-request',roomId:msg.roomId,requestId:msg.requestId});
   }
   if(msg.type==='decision'&&msg.accept===true){
    const guest=sockets.find(s=>s.requestId===msg.requestId);
    guest?.onEvent({type:'join-accept',roomId:msg.roomId,requestId:msg.requestId});
    socket.onEvent({type:'guest-approved',roomId:msg.roomId,requestId:msg.requestId});
   }
   if(msg.type==='offer')
    for(const guest of sockets)if(guest!==socket&&guest.requestId)
      guest.onEvent({type:'offer',roomId:msg.roomId,sdp:msg.sdp});
   if(msg.type==='answer')
    rooms.get(msg.roomId)?.host.onEvent({type:'answer',roomId:msg.roomId,sdp:msg.sdp});
   return true;
  }};
 };
 const peerFactory=hello=>({
  ready:true,dispose(){},subscribeStatus(fn){fn({ready:true});return ()=>{};},
  awaitReady(){return Promise.resolve();},
  createOffer(){return Promise.resolve(JSON.stringify({
   protocol:1,kind:'offer',session:hello.session,build:hello.build,sdp:'v=0\r\nmatch\r\n'
  }));},
  acceptOffer(){return Promise.resolve(JSON.stringify({
   protocol:1,kind:'answer',session:hello.session,build:hello.build,sdp:'v=0\r\nanswer\r\n'
  }));},
  acceptAnswer(){return Promise.resolve();}
 });
 const timers={setIntervalImpl:()=>1,clearIntervalImpl:()=>{},setTimeoutImpl:()=>1,clearTimeoutImpl:()=>{}};
 const stops=[];
 try{
  let copiedInvite=null;
  Object.defineProperty(globalThis,'crypto',{configurable:true,value:webcrypto});
  Object.defineProperty(globalThis,'document',{configurable:true,value:document});
  Object.defineProperty(globalThis,'location',{configurable:true,value:{hostname:'saeedsai.github.io',origin:'https://saeedsai.github.io'}});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async value=>{copiedInvite=value}}}});
  const host=createRoot(),guest=createRoot();
  const options={...timers,internet:true,signalFactory:broker,peerFactory,build:require('../package.json').version,onReady:(peer,role)=>ready.push(role)};
  stops.push(mountAutoLanLobby(host,options));
  stops.push(mountAutoLanLobby(guest,options));
  sockets.forEach(sock=>sock.onState('connected'));
  host.querySelector('#autoHost').click();
  assert.equal(host.querySelector('#autoPublicListing').checked,false,'public listing is opt-in');
  guest.querySelector('#autoFind').click();
  assert.match(host.innerHTML,/ONLINE P2P/);
  assert.equal(rooms.size,1);
  assert.equal([...rooms.values()][0].scope,'internet-p2p');
  assert.equal(host.querySelector('#autoInviteShare').hidden,false,'host invite code is shown in its own share field');
  assert.equal(host.querySelector('#autoInviteDisplay').value,[...rooms.keys()][0],'share field matches registered room ID');
  assert.match(host.innerHTML,/autoCopyInvite/,'copy action is available beside the invite code');
  host.querySelector('#autoCopyInvite').click();
  await Promise.resolve();await Promise.resolve();
  assert.equal(copiedInvite,[...rooms.keys()][0],'copy action writes the shareable invite code');
  assert.equal(guest.querySelector('#autoRooms').children.length,0,'private room is not in the public directory');
  guest.querySelector('#autoInviteCode').value='  '+[...rooms.keys()][0].toUpperCase()+'  ';
  guest.querySelector('#autoJoinCode').click();
  assert.equal(sockets.at(-1).joinedRoomId,[...rooms.keys()][0],'whitespace and uppercase invite codes resolve to the canonical generated room ID');
  assert.equal(guest.querySelector('#autoStatus').textContent.startsWith('Waiting for host approval'),true,'invite code sends an approval request');
  assert.deepEqual(ready,[],'host approval is not automatic');
  assert.equal(host.querySelector('#autoApproval').children.length,3);
  host.querySelector('#autoApproval').children[1].onclick();
  for(let i=0;i<20;i++)await Promise.resolve();
  assert.deepEqual(ready.sort(),['guest','host'],'both peers enter the same live-match handoff');
  const secondHost=createRoot();stops.push(mountAutoLanLobby(secondHost,options));sockets.at(-1).onState('connected');
  secondHost.querySelector('#autoPublicListing').checked=true;
  secondHost.querySelector('#autoPublicListing').listeners.change();
  secondHost.querySelector('#autoHost').click();
  guest.querySelector('#autoFind').click();
  assert.equal(guest.querySelector('#autoRooms').children.length,1,'explicit public listing is discoverable');
 }finally{
  for(const stop of stops.reverse())stop?.();
  for(const [name,descriptor] of [['crypto',oldCrypto],['document',oldDocument],['location',oldLocation],['navigator',oldNavigator]]){
   if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];
  }
 }
});
