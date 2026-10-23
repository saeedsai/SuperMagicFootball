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
 for(const packet of [{...hello,protocol:2},{...hello,session:'bad'},{...hello,role:'spectator'},{...hello,build:'dev'},{...hello,sequence:-1},Object.create(null),null])assert.throws(()=>p.normalizeLanPacket(packet));
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
