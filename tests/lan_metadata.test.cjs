'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../src/modules/lan-state-snapshot.js');
const base={type:'snapshot',version:1,roomId:'room_01234567890',
 hostId:'host_01234567890',tick:3,clockMs:1200,
 scores:{home:1,away:0},ball:{x:0,y:.25,z:.15},
 players:[{slot:0,x:-.5,y:0},{slot:11,x:.25,y:0}]};
const metadata={half:2,phase:'finished',controlled:{home:4,away:2},ballOwnerSlot:11};
test('LAN-047 old snapshot wire remains compatible',async()=>{
 const {encodeLanSnapshot,decodeLanSnapshot}=await load();
 const restored=decodeLanSnapshot(encodeLanSnapshot(base));
 assert.equal(restored.tick,3);
 assert.equal(Object.hasOwn(restored,'meta'),false);
});
test('LAN-047 match metadata survives bounded encode/decode with immutable fields',async()=>{
 const {encodeLanSnapshot,decodeLanSnapshot}=await load();
 const restored=decodeLanSnapshot(encodeLanSnapshot({...base,meta:metadata}));
 assert.deepEqual(restored.meta,metadata);
 assert.equal(Object.isFrozen(restored.meta),true);
 assert.equal(Object.isFrozen(restored.meta.controlled),true);
});
test('LAN-047 malformed phase, selected players or ownership is rejected',async()=>{
 const {encodeLanSnapshot}=await load();
 for(const meta of [
  {...metadata,half:3},
  {...metadata,phase:'eval'},
  {...metadata,controlled:{home:6,away:2}},
  {...metadata,controlled:{home:4,away:-1}},
  {...metadata,ballOwnerSlot:22},
  {...metadata,ballOwnerSlot:'11'},
  {...metadata,extra:true}
 ]){
  assert.throws(()=>encodeLanSnapshot({...base,meta}),/metadata/);
 }
});
