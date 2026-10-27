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
