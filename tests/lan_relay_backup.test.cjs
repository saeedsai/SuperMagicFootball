'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const session='relay_session_123456789abcdef';
const roomId='room_0123456789abcdef0123456789abcdef';
const hello=role=>({protocol:1,type:'hello',role,session,build:'0.11.4.3',sequence:0});
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('P2P-RELAY-01 two participants complete host-approved transport hello and live input/snapshot',async()=>{
 const {createLanRelayPeerConnection}=await import('../src/modules/lan-relay-peer.js');
 let host,guest;const sent=[];
 const toGuest={send(packet){sent.push(['host',packet.type]);if(packet.type!=='relay-frame')return false;
  queueMicrotask(()=>guest?.receiveRelayFrame(packet.data));return true;}};
 const toHost={send(packet){sent.push(['guest',packet.type]);if(packet.type!=='relay-frame')return false;
  queueMicrotask(()=>host?.receiveRelayFrame(packet.data));return true;}};
 host=createLanRelayPeerConnection(hello('host'),{connection:toGuest,roomId});
 guest=createLanRelayPeerConnection(hello('guest'),{connection:toHost,roomId});
 try{
  assert.equal(host.relay,true);assert.equal(guest.relay,true);
  const offer=await host.createOffer(),answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  await Promise.all([host.awaitReady(1200),guest.awaitReady(1200)]);
  assert.equal(host.ready,true);assert.equal(guest.ready,true);
  guest.sendGuestInput(0,['shoot','jump'],.5,-.25);
  await tick();
  const input=host.advanceHostFrame(0);
  assert.equal(input.received,true);
  assert.deepEqual(input.input.buttons,['shoot','jump']);
  assert.equal(input.input.dx,.5);
  const snapshots=[];
  const sub=guest.subscribeGuestMatchState(s=>snapshots.push(s));
  assert.equal(host.sendHostMatchState({tick:0,clockMs:100,scores:{home:1,away:0},
    ball:{x:.25,y:-.5,z:.1},players:[{slot:0,x:0,y:0},{slot:11,x:.2,y:-.3}]}),true);
  await tick();
  assert.equal(snapshots.length,1);
  assert.equal(snapshots[0].scores.home,1);
  assert.equal(snapshots[0].players[1].slot,11);
  sub.dispose();
  assert.ok(sent.some(([from,type])=>from==='host'&&type==='relay-frame'));
  assert.ok(sent.some(([from,type])=>from==='guest'&&type==='relay-frame'));
  host.disconnectRelay();
  assert.equal(host.ready,false);
  assert.equal(host.transportState,'failed');
 }finally{host.dispose();guest.dispose();}
});

test('P2P-RELAY-01 rejects unauthorized room identifiers, offline use and oversize payloads',async()=>{
 const {createLanRelayPeerConnection}=await import('../src/modules/lan-relay-peer.js');
 assert.throws(()=>createLanRelayPeerConnection(hello('host'),{connection:{send(){return true}},roomId:'invalid'}),/Invalid approved relay/);
 const peer=createLanRelayPeerConnection(hello('host'),{connection:{send(){return true}},roomId});
 try{
  await peer.createOffer();
  await peer.acceptAnswer(JSON.stringify({protocol:1,kind:'answer',session,build:'0.11.4.3',sdp:'v=0\\r\\ns=smf-approved-relay\\r\\nt=0 0\\r\\n'}));
  assert.throws(()=>peer.peer.channel.send('x'.repeat(25000)),/relay unavailable/i);
 }finally{peer.dispose()}
});

test('P2P-RELAY-01 broker permits only two approved internet endpoints, with rate and size bounds',()=>{
 const broker=fs.readFileSync('scripts/lan-server.mjs','utf8');
 const lobby=fs.readFileSync('src/modules/lan-auto-lobby.js','utf8');
 assert.match(broker,/room\.scope!=='internet-p2p'/);
 assert.match(broker,/!room\.relay\|\|!room\.guest/);
 assert.match(broker,/ws!==room\.host&&ws!==room\.guest/);
 assert.match(broker,/MAX_RELAY_FRAMES_PER_SECOND/);
 assert.match(broker,/MAX_RELAY_WIRE/);
 assert.match(lobby,/m\.type==='relay-offer'/);
 assert.match(lobby,/m\.type==='relay-answer'/);
 assert.match(lobby,/activeRelay\|\|peer/);
});

test('P2P-RELAY-02 real auto lobby reaches both playable match callbacks without WebRTC candidates', {timeout:8000},async()=>{
 const {mountAutoLanLobby}=await import('../src/modules/lan-auto-lobby.js');
 const oldDoc=globalThis.document,oldLocation=globalThis.location,oldRtc=globalThis.RTCPeerConnection;
 class Element extends EventTarget {
  constructor(){super();this.children=[];this.textContent='';this.className='';this.value='';this.onclick=null;}
  replaceChildren(...items){this.children=items;this.textContent=''}
  append(...items){this.children.push(...items)}
  click(){this.onclick?.();this.dispatchEvent(new Event('click'))}
 }
 const root=()=>{const elements=new Map();return {elements,innerHTML:'',querySelector(id){if(!elements.has(id))elements.set(id,new Element());return elements.get(id)}}};
 const host=root(),guest=root(),sides={},ready={},room={};
 function emit(side,message){queueMicrotask(()=>sides[side].onEvent(message))}
 function send(side,packet){
  switch(packet.type){
   case 'host':
    Object.assign(room,{roomId:packet.roomId,name:packet.name,build:packet.build,scope:'internet-p2p'});
    emit('host',{type:'host-registered',roomId:room.roomId});
    emit('guest',{type:'room-announce',...room,full:false});break;
   case 'rooms':
    emit('guest',{type:'rooms-snapshot',rooms:room.roomId?[{...room,full:false}]:[]});break;
   case 'join':
    Object.assign(room,{guestRequestId:packet.requestId,guestName:packet.guestName});
    emit('host',{type:'join-request',roomId:room.roomId,requestId:packet.requestId,guestName:packet.guestName});break;
   case 'decision':
    if(packet.accept===true){
     emit('guest',{type:'join-accept',roomId:room.roomId,requestId:room.guestRequestId,hostName:room.name});
     emit('host',{type:'guest-approved',roomId:room.roomId,requestId:room.guestRequestId,guestName:room.guestName});
    }break;
   case 'relay-offer': emit('guest',{...packet});break;
   case 'relay-answer': emit('host',{...packet});break;
   case 'relay-frame': emit(side==='host'?'guest':'host',{...packet});break;
   case 'leave':break;
   default:throw Error('Unexpected signaling packet '+packet.type);
  }
  return true;
 }
 const signalFactory=side=>handlers=>{sides[side]=handlers;return {ready:true,send:packet=>send(side,packet),close(){}}};
 let stopHost,stopGuest;
 try{
  globalThis.document={createElement:()=>new Element()};
  globalThis.location={hostname:'saeedsai.github.io',origin:'https://saeedsai.github.io'};
  globalThis.RTCPeerConnection=undefined; // force failed direct RTC -> fallback
  stopHost=mountAutoLanLobby(host,{internet:true,build:'0.11.4.3',signalFactory:signalFactory('host'),onReady:(peer,role,name)=>ready.host={peer,role,name}});
  stopGuest=mountAutoLanLobby(guest,{internet:true,build:'0.11.4.3',signalFactory:signalFactory('guest'),onReady:(peer,role,name)=>ready.guest={peer,role,name}});
  sides.host.onState('connected');sides.guest.onState('connected');
  host.querySelector('#autoPlayerName').value='Alice';guest.querySelector('#autoPlayerName').value='Bob';
  host.querySelector('#autoHost').click();guest.querySelector('#autoFind').click();
  for(let i=0;i<50&&guest.querySelector('#autoRooms').children.length===0;i++)await new Promise(r=>setTimeout(r,0));
  assert.equal(guest.querySelector('#autoRooms').children.length,1);
  guest.querySelector('#autoRooms').children[0].click();
  for(let i=0;i<50&&host.querySelector('#autoApproval').children.length<2;i++)await new Promise(r=>setTimeout(r,0));
  assert.match(host.querySelector('#autoApproval').children[0].textContent,/Bob wants to join/);
  host.querySelector('#autoApproval').children[1].click();
  for(let i=0;i<150&&(!ready.host||!ready.guest);i++)await new Promise(r=>setTimeout(r,10));
  assert.ok(ready.host&&ready.guest,'both lobby callbacks must establish live match');
  assert.equal(ready.host.peer.relay,true);assert.equal(ready.guest.peer.relay,true);
  assert.equal(ready.host.peer.ready,true);assert.equal(ready.guest.peer.ready,true);
  assert.equal(ready.host.name,'Bob');assert.equal(ready.guest.name,'Alice');
  ready.guest.peer.sendGuestInput(0,['pass'],0,-1);
  await new Promise(r=>setImmediate(r));
  assert.deepEqual(ready.host.peer.advanceHostFrame(0).input.buttons,['pass']);
 }finally{
  stopHost?.();stopGuest?.();
  globalThis.document=oldDoc;globalThis.location=oldLocation;globalThis.RTCPeerConnection=oldRtc;
 }
});

test('P2P-RELAY-03 guest-only WebRTC failure asks approved host for backup and starts both matches', {timeout:8000},async()=>{
 const {mountAutoLanLobby}=await import('../src/modules/lan-auto-lobby.js');
 const oldDoc=globalThis.document,oldLocation=globalThis.location,oldRtc=globalThis.RTCPeerConnection;
 class Element extends EventTarget {
  constructor(){super();this.children=[];this.textContent='';this.value='';this.className='';this.onclick=null;}
  replaceChildren(...items){this.children=items;this.textContent='';}
  append(...items){this.children.push(...items);}
  click(){this.onclick?.();this.dispatchEvent(new Event('click'));}
 }
 // Host can produce a direct SDP offer, but guest cannot create its own RTC peer.
 // Without a guest relay-request the host would wait 25 seconds for an answer.
 class DirectPeer extends EventTarget {
  constructor(){super();this.connectionState='connecting';this.iceConnectionState='checking';this.iceGatheringState='complete';}
  createDataChannel(label){const c=new EventTarget();c.label=label;c.readyState='connecting';c.send=()=>{};c.close=()=>{c.readyState='closed';};return c;}
  async createOffer(){return {type:'offer',sdp:'v=0\\r\\ns=direct\\r\\nt=0 0\\r\\n'};}
  async createAnswer(){return {type:'answer',sdp:'v=0\\r\\ns=direct\\r\\nt=0 0\\r\\n'};}
  async setLocalDescription(d){this.localDescription=d;}
  async setRemoteDescription(d){this.remoteDescription=d;}
  close(){this.connectionState='closed';this.iceConnectionState='closed';}
 }
 const root=()=>{const elements=new Map();return {innerHTML:'',elements,querySelector(id){
  if(!elements.has(id))elements.set(id,new Element());return elements.get(id);
 }}};
 const host=root(),guest=root(),handlers={},ready={},sent=[],room={};
 const emit=(side,message)=>queueMicrotask(()=>handlers[side].onEvent(message));
 function send(side,packet){
  sent.push([side,packet.type]);
  switch(packet.type){
   case 'host':Object.assign(room,{roomId:packet.roomId,name:packet.name,build:packet.build,scope:'internet-p2p'});
    emit('host',{type:'host-registered',roomId:room.roomId});emit('guest',{type:'room-announce',...room,full:false});break;
   case 'rooms':emit('guest',{type:'rooms-snapshot',rooms:room.roomId?[{...room,full:false}]:[]});break;
   case 'join':room.requestId=packet.requestId;room.guestName=packet.guestName;
    emit('host',{type:'join-request',roomId:room.roomId,requestId:room.requestId,guestName:room.guestName});break;
   case 'decision':if(packet.accept){
    emit('guest',{type:'join-accept',roomId:room.roomId,requestId:room.requestId,hostName:room.name});
    emit('host',{type:'guest-approved',roomId:room.roomId,requestId:room.requestId,guestName:room.guestName});
   }break;
   case 'offer':emit('guest',packet);break;
   case 'relay-request':assert.equal(side,'guest');emit('host',packet);break;
   case 'relay-offer':emit('guest',packet);break;
   case 'relay-answer':emit('host',packet);break;
   case 'relay-frame':emit(side==='host'?'guest':'host',packet);break;
   case 'leave':break;
   default:throw Error('Unexpected signaling packet '+packet.type);
  }
  return true;
 }
 const signalFactory=side=>callbacks=>{handlers[side]=callbacks;return {ready:true,send:packet=>send(side,packet),close(){}};};
 let stopHost,stopGuest;
 try{
  globalThis.document={createElement:()=>new Element()};
  globalThis.location={hostname:'saeedsai.github.io',origin:'https://saeedsai.github.io'};
  globalThis.RTCPeerConnection=DirectPeer;
  stopHost=mountAutoLanLobby(host,{internet:true,build:'0.11.4.3',signalFactory:signalFactory('host'),
   onReady:(peer,role)=>ready.host={peer,role}});
  stopGuest=mountAutoLanLobby(guest,{internet:true,build:'0.11.4.3',signalFactory:signalFactory('guest'),
   peerFactory:()=>{throw Error('Guest WebRTC unavailable');},
   onReady:(peer,role)=>ready.guest={peer,role}});
  handlers.host.onState('connected');handlers.guest.onState('connected');
  host.querySelector('#autoHost').click();guest.querySelector('#autoFind').click();
  for(let i=0;i<50&&!guest.querySelector('#autoRooms').children.length;i++)await new Promise(r=>setTimeout(r,0));
  assert.equal(guest.querySelector('#autoRooms').children.length,1);
  guest.querySelector('#autoRooms').children[0].click();
  for(let i=0;i<50&&host.querySelector('#autoApproval').children.length<2;i++)await new Promise(r=>setTimeout(r,0));
  host.querySelector('#autoApproval').children[1].click();
  for(let i=0;i<150&&(!ready.host||!ready.guest);i++)await new Promise(r=>setTimeout(r,10));
  assert.ok(sent.some(([side,type])=>side==='host'&&type==='offer'),'direct host SDP was offered');
  assert.ok(sent.some(([side,type])=>side==='guest'&&type==='relay-request'),'guest asked for backup without leaving');
  assert.ok(!sent.some(([side,type])=>side==='guest'&&type==='leave'),'guest kept approved room seat');
  assert.ok(ready.host&&ready.guest,'both matches start using approved fallback');
  assert.equal(ready.host.peer.relay,true);assert.equal(ready.guest.peer.relay,true);
  ready.guest.peer.sendGuestInput(0,['dribble'],.2,0);
  await new Promise(r=>setImmediate(r));
  assert.deepEqual(ready.host.peer.advanceHostFrame(0).input.buttons,['dribble']);
  const broker=fs.readFileSync('scripts/lan-server.mjs','utf8');
  assert.match(broker,/room\\.guest===ws&&!room\\.relay/,'only approved guest can request fallback');
 }finally{
  stopHost?.();stopGuest?.();
  globalThis.document=oldDoc;globalThis.location=oldLocation;globalThis.RTCPeerConnection=oldRtc;
 }
});

// Broker rejects UTF-8 payloads above 24,000 bytes. Do not claim success for
// a smaller UTF-16 string whose Unicode encoding will be silently dropped.
test('P2P-RELAY-04 enforces broker UTF-8 budget in both directions',async()=>{
 const {createLanRelayPeerConnection}=await import('../src/modules/lan-relay-peer.js');
 let host,guest;const forwarded=[];
 const toGuest={send(packet){forwarded.push(packet);queueMicrotask(()=>guest?.receiveRelayFrame(packet.data));return true;}};
 const toHost={send(packet){queueMicrotask(()=>host?.receiveRelayFrame(packet.data));return true;}};
 host=createLanRelayPeerConnection(hello('host'),{connection:toGuest,roomId});
 guest=createLanRelayPeerConnection(hello('guest'),{connection:toHost,roomId});
 try{
  const answer=await guest.acceptOffer(await host.createOffer());
  await host.acceptAnswer(answer);
  await Promise.all([host.awaitReady(1200),guest.awaitReady(1200)]);
  const accepted=[],channel=guest.peer.channel;
  channel.addEventListener('message',event=>accepted.push(event.data));
  const tooLarge='😀'.repeat(6001),withinLimit='😀'.repeat(5999);
  assert.ok(tooLarge.length<24000&&new TextEncoder().encode(tooLarge).byteLength>24000);
  assert.equal(new TextEncoder().encode(withinLimit).byteLength,23996);
  const before=forwarded.length;
  assert.throws(()=>host.peer.channel.send(tooLarge),/relay unavailable/i);
  assert.equal(forwarded.length,before,'oversized Unicode never reaches broker');
  guest.receiveRelayFrame(tooLarge);
  assert.deepEqual(accepted,[],'oversized inbound Unicode is discarded');
  host.peer.channel.send(withinLimit);
  await tick();
  assert.deepEqual(accepted,[withinLimit],'valid UTF-8 frame still crosses relay');
 }finally{host.dispose();guest.dispose();}
});

// The first guest hello can arrive while the host relay is still connecting.
// Losing its later echo must not stall host readiness or the first game input.
test('P2P-RELAY-05 buffers early guest hello before host answer',async()=>{
 const {createLanRelayPeerConnection}=await import('../src/modules/lan-relay-peer.js');
 let host,guest,guestFrames=0;
 const toHost={send(packet){if(packet.type!=='relay-frame')return false;
  guestFrames++;if(guestFrames!==2)host.receiveRelayFrame(packet.data);return true;}};
 const toGuest={send(packet){if(packet.type!=='relay-frame')return false;
  guest.receiveRelayFrame(packet.data);return true;}};
 host=createLanRelayPeerConnection(hello('host'),{connection:toGuest,roomId});
 guest=createLanRelayPeerConnection(hello('guest'),{connection:toHost,roomId});
 try{
  const answer=await guest.acceptOffer(await host.createOffer());
  assert.equal(host.peer.channel.readyState,'connecting');
  assert.equal(guestFrames,1,'first hello reached connecting host');
  assert.equal(host.ready,false);
  await host.acceptAnswer(answer);
  await Promise.all([host.awaitReady(1200),guest.awaitReady(1200)]);
  assert.equal(host.ready,true,'host accepted buffered hello without echo');
  assert.equal(guest.ready,true);
  guest.sendGuestInput(0,['pass'],.25,-.25);
  const input=host.advanceHostFrame(0);
  assert.equal(input.received,true);
  assert.deepEqual(input.input.buttons,['pass']);
 }finally{host.dispose();guest.dispose();}
});

// Invalid early hellos must not consume the one pre-open handshake slot.
test('P2P-RELAY-06 rejects stale early session/build/role before valid guest hello',async()=>{
 const {createLanRelayPeerConnection}=await import('../src/modules/lan-relay-peer.js');
 let host,guest,guestFrames=0;
 const toHost={send(packet){if(packet.type!=='relay-frame')return false;
  guestFrames++;
  if(guestFrames===1){
   for(const fake of [{...hello('guest'),session:'stale_session'},
                       {...hello('guest'),build:'incompatible'},hello('host')]){
    host.receiveRelayFrame(JSON.stringify(fake));
   }
   host.receiveRelayFrame(packet.data);
  }else if(guestFrames!==2)host.receiveRelayFrame(packet.data);
  return true;
 }};
 const toGuest={send(packet){if(packet.type!=='relay-frame')return false;
  guest.receiveRelayFrame(packet.data);return true;}};
 host=createLanRelayPeerConnection(hello('host'),{connection:toGuest,roomId});
 guest=createLanRelayPeerConnection(hello('guest'),{connection:toHost,roomId});
 try{
  const answer=await guest.acceptOffer(await host.createOffer());
  assert.equal(host.peer.channel.readyState,'connecting');
  assert.equal(guestFrames,1,'valid guest hello follows three invalid predecessors');
  await host.acceptAnswer(answer);
  await Promise.all([host.awaitReady(1200),guest.awaitReady(1200)]);
  assert.equal(host.ready,true);assert.equal(guest.ready,true);
  guest.sendGuestInput(0,['dribble'],.4,-.1);
  const frame=host.advanceHostFrame(0);
  assert.equal(frame.received,true);
  assert.deepEqual(frame.input.buttons,['dribble']);
 }finally{host.dispose();guest.dispose();}
});

// The relay's pre-open slot must accept only hellos that the LAN protocol
// decoder will actually process (including its 4 KiB wire-size bound).
test('P2P-RELAY-07 oversized matching hello cannot starve valid early guest',async()=>{
 const {createLanRelayPeerConnection}=await import('../src/modules/lan-relay-peer.js');
 let host,guest,guestFrames=0;
 const toHost={send(packet){if(packet.type!=='relay-frame')return false;
  guestFrames++;
  if(guestFrames===1){
   const oversized=JSON.stringify({...hello('guest'),padding:'x'.repeat(4096)});
   assert.ok(oversized.length>4096&&oversized.length<24000);
   host.receiveRelayFrame(oversized);
   host.receiveRelayFrame(packet.data);
  }else if(guestFrames!==2)host.receiveRelayFrame(packet.data);
  return true;
 }};
 const toGuest={send(packet){if(packet.type!=='relay-frame')return false;
  guest.receiveRelayFrame(packet.data);return true;}};
 host=createLanRelayPeerConnection(hello('host'),{connection:toGuest,roomId});
 guest=createLanRelayPeerConnection(hello('guest'),{connection:toHost,roomId});
 try{
  const answer=await guest.acceptOffer(await host.createOffer());
  assert.equal(host.peer.channel.readyState,'connecting');
  assert.equal(guestFrames,1);
  await host.acceptAnswer(answer);
  await Promise.all([host.awaitReady(1200),guest.awaitReady(1200)]);
  assert.equal(host.ready,true);assert.equal(guest.ready,true);
  guest.sendGuestInput(0,['pass'],.3,0);
  const frame=host.advanceHostFrame(0);
  assert.equal(frame.received,true);
  assert.deepEqual(frame.input.buttons,['pass']);
 }finally{host.dispose();guest.dispose();}
});
