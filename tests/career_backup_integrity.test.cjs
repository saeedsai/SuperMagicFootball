'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

const memory=()=>{
 const rows=new Map();
 return {getItem:key=>rows.has(key)?rows.get(key):null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)};
};
const career=(club)=>({club,season:2,week:4,members:[club],fixtures:Array.from({length:14},()=>[]),history:[],
 roster:Array.from({length:12},(_,i)=>({id:`p${club}-${i}`})),
 table:{[club]:{pts:4,gf:1,ga:0}},facilities:{training:1},cup:{stage:0},cash:100});
const api=async()=> (await import('../src/modules/career_slots.js')).CAREER_SLOTS;

test('SAVE-103 Career backup roundtrips all slots and active selection',async()=>{
 const slots=(await api()).create(memory());slots.save(3,career(3),'Club Three');slots.save(5,career(5),'Club Five');slots.load(3);
 const backup=slots.exportBackup(),restored=(await api()).create(memory());
 assert.equal(restored.importBackup(backup),2);
 assert.equal(restored.active,3);
 assert.equal(restored.list()[2].name,'Club Three');
 assert.equal(restored.list()[4].name,'Club Five');
 assert.deepEqual(JSON.parse(restored.exportBackup()),JSON.parse(backup));
});

test('SAVE-103 Career backup rejects tampering and malformed saves without changing storage',async()=>{
 const slots=(await api()).create(memory());slots.save(1,career(1),'live');
 const before=slots.exportBackup(),tampered=JSON.parse(before);tampered.payload=tampered.payload.replace('live','lost');
 assert.throws(()=>slots.importBackup(JSON.stringify(tampered),{overwrite:true}),/integrity/);
 assert.throws(()=>slots.importBackup('not json',{overwrite:true}),/JSON/);
 assert.equal(slots.exportBackup(),before);
});

test('SAVE-103 Career import requires explicit overwrite and validates team references',async()=>{
 const source=(await api()).create(memory());source.save(2,career(2),'external');
 const occupied=(await api()).create(memory());occupied.save(1,career(1),'local');
 const before=occupied.exportBackup();
 assert.throws(()=>occupied.importBackup(source.exportBackup()),/confirm overwrite/);
 assert.throws(()=>occupied.inspectBackup(source.exportBackup(),()=>false),/unavailable teams/);
 assert.equal(occupied.exportBackup(),before);
 assert.equal(occupied.importBackup(source.exportBackup(),{overwrite:true,validator:c=>c.club===2}),1);
 assert.equal(occupied.list()[1].name,'external');
});

test('SAVE-103 Career import requires a boolean overwrite confirmation before writes',async()=>{
 const source=(await api()).create(memory());source.save(2,career(2),'external');
 const occupied=(await api()).create(memory());occupied.save(1,career(1),'keep');
 const before=occupied.exportBackup();
 for(const overwrite of [1,'true','false',{},[]]){
  assert.throws(()=>occupied.importBackup(source.exportBackup(),{overwrite}),/overwrite confirmation must be boolean/);
  assert.equal(occupied.exportBackup(),before,'invalid confirmation cannot replace existing slots');
 }
 assert.throws(()=>occupied.importBackup(source.exportBackup(),null),/options must be an object/);
 assert.equal(occupied.exportBackup(),before);
});

test('SAVE-103 Career slot load validates current team references before switching active slot',async()=>{
 const db=memory(),slots=(await api()).create(db);
 slots.save(1,career(1),'available');slots.save(2,career(2),'stale');slots.load(1);
 const before=db.getItem('legend_careerSlots');
 assert.throws(()=>slots.load(2,saved=>saved.club===1),/unavailable teams/);
 assert.equal(slots.active,1,'a rejected restore does not switch the active slot');
 assert.equal(db.getItem('legend_careerSlots'),before,'rejection is read-only');
 assert.equal(slots.load(2,saved=>saved.club===2).club,2);
 assert.equal(slots.active,2);
});

test('SAVE-103 Career import rolls back partial storage writes and keeps live state',async()=>{
 const db=memory(),live=(await api()).create(db),source=(await api()).create(memory());
 live.save(1,career(1),'keep');source.save(4,career(4),'restore');
 const before=db.getItem('legend_careerSlots'),backup=source.exportBackup(),original=db.setItem.bind(db);
 let failOnce=true;
 db.setItem=(key,value)=>{original(key,value);if(failOnce){failOnce=false;throw Error('simulated power loss');}};
 assert.throws(()=>live.importBackup(backup,{overwrite:true}),/simulated power loss/);
 assert.equal(db.getItem('legend_careerSlots'),before);
 assert.equal(live.list()[0].name,'keep');
 assert.equal(live.list()[3].occupied,false);
});

test('SAVE-103 Career restore verifies absence when removeItem throws after rollback',async()=>{
 const db=memory(),live=(await api()).create(db),source=(await api()).create(memory());
 source.save(4,career(4),'incoming');
 const before=live.exportBackup(),originalSet=db.setItem.bind(db),originalRemove=db.removeItem.bind(db);
 let failWrite=true;
 db.setItem=(key,value)=>{originalSet(key,value);if(failWrite){failWrite=false;throw Error('primary write failed');}};
 db.removeItem=key=>{originalRemove(key);throw Error('remove adapter threw after removing key');};
 assert.throws(()=>live.importBackup(source.exportBackup(),{overwrite:true}),/primary write failed/);
 assert.equal(db.getItem('legend_careerSlots'),null,'rollback restored the originally absent key');
 assert.equal(live.error,null,'verified rollback leaves the vault usable');
 assert.equal(live.hasRecoverySnapshot,false,'a restored first-write failure must not expose a fake recovery snapshot');
 assert.equal(live.exportBackup(),before);
});

test('SAVE-103 Career restore verifies previous bytes when rollback setItem throws after restoring them',async()=>{
 const db=memory(),live=(await api()).create(db),source=(await api()).create(memory());
 live.save(1,career(1),'trusted');source.save(4,career(4),'incoming');
 const trusted=live.exportBackup(),original=db.setItem.bind(db);let writes=0;
 db.setItem=(key,value)=>{writes++;original(key,value);throw Error(writes===1?'primary write failed':'rollback write failed')};
 assert.throws(()=>live.importBackup(source.exportBackup(),{overwrite:true}),/primary write failed/);
 assert.equal(db.getItem('legend_careerSlots'),JSON.parse(trusted).payload,'rollback readback confirms exact trusted bytes');
 assert.equal(live.hasRecoverySnapshot,false);
 assert.equal(live.error,null,'verified restoration leaves the slot manager usable');
 assert.equal(live.exportBackup(),trusted,'export remains the same trusted save');
});

test('SAVE-103 Career backup exports its trusted snapshot when rollback readback differs',async()=>{
 const db=memory(),live=(await api()).create(db),source=(await api()).create(memory());
 live.save(1,career(1),'trusted');source.save(4,career(4),'incoming');
 const trusted=live.exportBackup(),original=db.setItem.bind(db);let writes=0;
 db.setItem=(key,value)=>{writes++;original(key,writes===1?value:'partial-corrupt-bytes');
  throw Error(writes===1?'primary write failed':'rollback write failed');};
 assert.throws(()=>live.importBackup(source.exportBackup(),{overwrite:true}),/rollback write failed/);
 assert.equal(live.hasRecoverySnapshot,true);
 assert.throws(()=>live.save(2,career(2)),/cannot be modified/);
 assert.equal(live.exportBackup(),trusted,'export uses the trusted pre-failure Career state');
});

test('SAVE-103 does not present an empty placeholder as a recovery export for corrupt storage',async()=>{
 const db=memory();db.setItem('legend_careerSlots','not-json');
 const slots=(await api()).create(db);
 assert.equal(slots.hasRecoverySnapshot,false);
 assert.throws(()=>slots.exportBackup(),/cannot be modified/);
});

test('SAVE-103 Career backup inspection is read-only and reports active slot',async()=>{
 const source=(await api()).create(memory());source.save(6,career(6),'preview');source.load(6);
 const target=(await api()).create(memory()),before=target.hasVault;
 const preview=target.inspectBackup(source.exportBackup(),c=>c.club===6);
 assert.equal(preview.active,6);assert.equal(preview.occupied,1);assert.equal(preview.slots[0].week,4);
 assert.equal(target.hasVault,before);
});

test('SAVE-103 Career backup rejects oversized payloads before storage changes',async()=>{
 const slots=(await api()).create(memory());slots.save(1,career(1),'existing');
 const before=slots.exportBackup(),envelope=JSON.parse(before);envelope.payload='x'.repeat(2000001);
 assert.throws(()=>slots.importBackup(JSON.stringify(envelope),{overwrite:true}),/2 MB|Unsupported Career backup format/);
 assert.equal(slots.exportBackup(),before);
});

