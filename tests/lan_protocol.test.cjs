'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../src/modules/lan_protocol.js');
const session='host_1234567890';
const hello={protocol:1,type:'hello',session,sequence:0,role:'host',build:'0.9.29.2'};
const input={protocol:1,type:'input',session,sequence:1,frame:42,buttons:['pass','jump'],dx:1,dy:0};
test('LAN-001 two-client hello packets round-trip without network side effects',async()=>{
 const p=await load();assert.deepEqual(p.parseLanPacket(p.serializeLanPacket(hello)),p.normalizeLanPacket(hello));
 assert.equal(p.normalizeLanPacket({...hello,role:'guest'}).role,'guest');
});
test('LAN-001 four-button input packet is canonical and immutable',async()=>{
 const p=await load(),clean=p.normalizeLanPacket(input);
 assert.deepEqual(clean.buttons,['pass','jump']);assert.ok(Object.isFrozen(clean.buttons));
 assert.deepEqual(p.parseLanPacket(p.serializeLanPacket(input)),clean);
});
test('LAN-001 rejects malformed protocol, sessions, roles and versions',async()=>{
 const p=await load();
 for(const packet of [{...hello,protocol:2},{...hello,session:'bad'},{...hello,session:{toString:()=>session}},{...hello,role:'spectator'},{...hello,build:'dev'},{...hello,build:{toString:()=>hello.build}},{...hello,sequence:-1},Object.create(null),null])assert.throws(()=>p.normalizeLanPacket(packet));
});
test('LAN-001 rejects duplicate, unknown and fifth action buttons',async()=>{
 const p=await load();
 for(const buttons of [['pass','pass'],['pass','shoot','dribble','jump','extra'],['kick'],['PASS']])assert.throws(()=>p.normalizeLanPacket({...input,buttons}));
});
test('LAN-001 rejects impossible direction, frame and packet size',async()=>{
 const p=await load();
 for(const packet of [{...input,dx:2},{...input,dy:0.5},{...input,frame:-1},{...input,frame:Infinity}])assert.throws(()=>p.normalizeLanPacket(packet));
 assert.throws(()=>p.parseLanPacket('x'.repeat(4097)));assert.throws(()=>p.parseLanPacket('{'));
});
test('LAN-001 rejects stale/replayed input and wrong-session injection',async()=>{
 const p=await load();assert.deepEqual(p.acceptLanPacket(input,session,1),{accepted:false,lastSequence:1});
 assert.equal(p.acceptLanPacket(input,session,0).accepted,true);
 assert.throws(()=>p.acceptLanPacket(input,'other_1234567890',0));
});
test('LAN-001 discards extra untrusted fields during normalization',async()=>{
 const p=await load(),clean=p.normalizeLanPacket({...input,admin:true,debug:'x'});
 assert.equal(Object.hasOwn(clean,'admin'),false);assert.equal(Object.hasOwn(clean,'debug'),false);
});

test('LAN-002 complementary peers complete a version-matched session handshake',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 assert.deepEqual(p.validateLanHandshake(hello,guest),{
  session,build:hello.build,localRole:'host',remoteRole:'guest'
 });
 assert.equal(p.validateLanHandshake(guest,hello).localRole,'guest');
 assert.ok(Object.isFrozen(p.validateLanHandshake(hello,guest)));
});
test('LAN-002 rejects divergent builds, sessions, duplicate roles and replayed hellos',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 for(const remote of [
  hello,{...guest,build:'0.9.29.3'},{...guest,session:'guest_1234567890'},
  {...guest,sequence:1},input
 ])assert.throws(()=>p.validateLanHandshake(hello,remote));
 assert.throws(()=>p.validateLanHandshake({...hello,sequence:1},guest));
});

test('LAN-003 host queues only future guest inputs and consumes each frame once',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 const original=p.createHostLanInputQueue(hello,guest);
 assert.ok(Object.isFrozen(original));
 const queued=p.enqueueGuestLanInput(original,input,40);
 assert.equal(queued.accepted,true);
 assert.equal(original.pending.length,0);
 assert.ok(Object.isFrozen(queued.state.pending));
 assert.equal(p.dequeueGuestLanInput(queued.state,41).packet,null);
 const consumed=p.dequeueGuestLanInput(queued.state,42);
 assert.deepEqual(consumed.packet,p.normalizeLanPacket(input));
 assert.equal(consumed.state.pending.length,0);
 assert.equal(p.dequeueGuestLanInput(consumed.state,42).packet,null);
});
test('LAN-003 blocks replay, stale frames, wrong sessions and excess lead',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 const original=p.createHostLanInputQueue(hello,guest);
 const first=p.enqueueGuestLanInput(original,input,40);
 assert.deepEqual(p.enqueueGuestLanInput(first.state,input,40).reason,'replay');
 assert.equal(p.enqueueGuestLanInput(first.state,{...input,sequence:2,frame:42},40).reason,'stale-frame');
 assert.equal(p.enqueueGuestLanInput(first.state,{...input,sequence:2,frame:39},40).reason,'stale-frame');
 assert.equal(p.enqueueGuestLanInput(first.state,{...input,sequence:2,frame:49},40).reason,'outside-frame-window');
 assert.equal(p.enqueueGuestLanInput(original,{...input,frame:39},40).reason,'outside-frame-window');
 assert.throws(()=>p.enqueueGuestLanInput(original,{...input,session:'other_1234567890'},40));
 assert.throws(()=>p.enqueueGuestLanInput(original,{...hello,role:'guest'},40));
 assert.throws(()=>p.createHostLanInputQueue(guest,hello));
 assert.throws(()=>p.enqueueGuestLanInput(original,input,-1));
});
test('LAN-003 accepts the maximum lead frame without exceeding bounded pending queue',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 let state=p.createHostLanInputQueue(hello,guest);
 for(let offset=0;offset<=p.LAN_INPUT_LEAD_FRAMES;offset++){
  const result=p.enqueueGuestLanInput(state,{...input,sequence:offset+1,frame:100+offset},100);
  assert.equal(result.accepted,true);state=result.state;
 }
 assert.equal(state.pending.length,p.LAN_INPUT_LEAD_FRAMES+1);
 assert.equal(p.enqueueGuestLanInput(state,{...input,sequence:100,frame:109},100).accepted,false);
 const consumed=p.dequeueGuestLanInput(state,103);
 assert.equal(consumed.packet.frame,103);
 assert.equal(consumed.state.pending.length,5);
});

test('LAN-004 missing guest frame resolves to deterministic neutral controls',async()=>{
 const p=await load(),host=p.createHostLanInputQueue(hello,{...hello,role:'guest'});
 const neutral=p.resolveGuestLanFrame(host,40);
 assert.equal(neutral.received,false);
 assert.deepEqual(neutral.input,{frame:40,buttons:[],dx:0,dy:0});
 assert.ok(Object.isFrozen(neutral.input.buttons));
 assert.equal(neutral.state.lastSequence,0);
});
test('LAN-004 consumes supplied guest input without changing future queued packets',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 let state=p.createHostLanInputQueue(hello,guest);
 state=p.enqueueGuestLanInput(state,{...input,frame:41},40).state;
 state=p.enqueueGuestLanInput(state,{...input,sequence:2,frame:42},40).state;
 const absent=p.resolveGuestLanFrame(state,40);
 assert.equal(absent.received,false);
 assert.equal(absent.state.pending.length,2);
 const present=p.resolveGuestLanFrame(absent.state,41);
 assert.equal(present.received,true);
 assert.deepEqual(present.input,{frame:41,buttons:['pass','jump'],dx:1,dy:0});
 assert.equal(present.state.pending.length,1);
 assert.equal(p.resolveGuestLanFrame(present.state,42).received,true);
});

test('LAN-005 guest input sender advances frames and sequence without mutating old state',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 const firstState=p.createGuestLanSender(guest,hello);
 const first=p.buildGuestLanInput(firstState,41,['jump','pass'],1,0);
 assert.equal(first.packet.sequence,1);
 assert.equal(first.packet.frame,41);
 assert.equal(firstState.lastSequence,0);
 assert.ok(Object.isFrozen(first.packet.buttons));
 const second=p.buildGuestLanInput(first.state,42,['shoot'],0,-1);
 assert.equal(second.packet.sequence,2);
 assert.equal(second.packet.dy,-1);
 assert.equal(p.enqueueGuestLanInput(p.createHostLanInputQueue(hello,guest),second.packet,40).accepted,true);
});
test('LAN-005 guest sender rejects stale frames and invalid controls atomically',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 const initial=p.createGuestLanSender(guest,hello);
 assert.throws(()=>p.createGuestLanSender(hello,guest));
 assert.throws(()=>p.buildGuestLanInput(initial,7,['kick'],0,0));
 assert.throws(()=>p.buildGuestLanInput(initial,7,['pass','pass'],0,0));
 assert.throws(()=>p.buildGuestLanInput(initial,7,['pass'],2,0));
 assert.equal(initial.lastSequence,0);
 const accepted=p.buildGuestLanInput(initial,7,['pass'],0,0);
 assert.throws(()=>p.buildGuestLanInput(accepted.state,7,['pass'],0,0));
 assert.throws(()=>p.buildGuestLanInput(accepted.state,6,['pass'],0,0));
 assert.throws(()=>p.buildGuestLanInput(accepted.state,1000000001,[],0,0));
});

test('LAN-006 sends canonical four-button packets only through an open channel',async()=>{
 const p=await load(),sent=[],channel={readyState:'open',send:x=>sent.push(x)};
 const length=p.sendLanChannelPacket(channel,input);
 assert.equal(sent.length,1);
 assert.equal(length,sent[0].length);
 assert.deepEqual(p.receiveLanChannelPacket({data:sent[0]},session,0).packet,p.normalizeLanPacket(input));
 assert.throws(()=>p.sendLanChannelPacket({...channel,readyState:'connecting'},input));
 assert.throws(()=>p.sendLanChannelPacket(channel,{...input,buttons:['kick']}));
 assert.equal(sent.length,1,'invalid packets are never sent');
});
test('LAN-006 rejects replayed, foreign-session, oversized and malformed network payloads',async()=>{
 const p=await load(),raw=p.serializeLanPacket(input);
 assert.equal(p.receiveLanChannelPacket(raw,session,1).accepted,false);
 assert.throws(()=>p.receiveLanChannelPacket(raw,'different_session_12',0));
 assert.throws(()=>p.receiveLanChannelPacket({data:'x'.repeat(4097)},session,0));
 assert.throws(()=>p.receiveLanChannelPacket({data:new Uint8Array([1,2,3])},session,0));
 assert.throws(()=>p.receiveLanChannelPacket({},session,0));
});

test('LAN-007 peer gate accepts hello before input and rejects replayed messages',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 const initial=p.createLanPeerGate(hello);
 assert.equal(initial.ready,false);
 const ready=p.receiveLanPeerPacket(initial,{data:p.serializeLanPacket(guest)});
 assert.equal(ready.kind,'ready');
 assert.equal(ready.state.ready,true);
 const first=p.receiveLanPeerPacket(ready.state,p.serializeLanPacket(input));
 assert.equal(first.kind,'input');
 assert.equal(first.packet.sequence,1);
 assert.equal(first.state.lastSequence,1);
 const repeat=p.receiveLanPeerPacket(first.state,p.serializeLanPacket(input));
 assert.equal(repeat.kind,'replay');
 assert.equal(repeat.state,first.state);
});
test('LAN-007 rejects premature input, mismatched peers and renegotiation',async()=>{
 const p=await load(),guest={...hello,role:'guest'};
 const state=p.createLanPeerGate(hello);
 assert.throws(()=>p.receiveLanPeerPacket(state,p.serializeLanPacket(input)));
 assert.throws(()=>p.receiveLanPeerPacket(state,p.serializeLanPacket({...guest,build:'0.9.29.3'})));
 assert.throws(()=>p.receiveLanPeerPacket(state,p.serializeLanPacket({...guest,session:'other_session_1234'})));
 assert.equal(state.ready,false);
 const ready=p.receiveLanPeerPacket(state,p.serializeLanPacket(guest)).state;
 assert.throws(()=>p.receiveLanPeerPacket(ready,p.serializeLanPacket(guest)));
 assert.throws(()=>p.receiveLanPeerPacket(ready,p.serializeLanPacket({...input,session:'other_session_1234'})));
 assert.equal(ready.lastSequence,0);
});
