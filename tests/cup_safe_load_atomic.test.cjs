'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const api=async()=> (await import('../src/modules/cup_slots.js')).CUP_SLOTS;
const storage=()=>{const rows=new Map();let writes=0;return {getItem:k=>rows.has(k)?rows.get(k):null,setItem:(k,v)=>{writes++;rows.set(k,String(v));},removeItem:k=>rows.delete(k),get writes(){return writes;}}};
const campaign=(club)=>({id:'cup_UEFA',compId:'UEFA',club,participants:[club,3,4,5],phase:'league',roundIdx:0,history:[],rounds:[],groups:[],table:{[club]:{},3:{},4:{},5:{}},earned:0,winner:null,knockout:null});
test('SAVE-102 invalid roster validation never changes active Cup slot or persisted bytes',async()=>{
 const db=storage(),v=(await api()).create(db);
 v.save(1,campaign(2));v.save(2,campaign(12));v.load(1);
 const before=db.getItem('legend_cupSlots'),writes=db.writes;
 assert.throws(()=>v.load(2,()=>false),/unavailable teams/);
 assert.equal(v.active,1);assert.equal(v.activeTournament().club,2);
 assert.equal(db.writes,writes);assert.equal(db.getItem('legend_cupSlots'),before);
 assert.equal(v.load(2,t=>t.club===12).club,12);assert.equal(v.active,2);
});
test('SAVE-102 exceptions and unsupported validators preserve selected Cup slot',async()=>{
 const db=storage(),v=(await api()).create(db);
 v.save(1,campaign(2));v.save(2,campaign(12));v.load(1);
 const before=db.getItem('legend_cupSlots'),writes=db.writes;
 assert.throws(()=>v.load(2,{}),/validator must be a function/);
 assert.throws(()=>v.load(2,()=>{throw Error('bad team')}),/bad team/);
 assert.equal(v.active,1);assert.equal(db.writes,writes);
 assert.equal(db.getItem('legend_cupSlots'),before);
});
test('SAVE-102 validator cannot mutate stored or returned Cup campaign',async()=>{
 const db=storage(),v=(await api()).create(db);
 v.save(1,campaign(2));v.save(2,campaign(12));
 const loaded=v.load(2,t=>{t.club=999;t.participants.push(999);return true;});
 assert.equal(loaded.club,12);assert.equal(loaded.participants.length,4);
 assert.equal(v.activeTournament().club,12);
});
test('SAVE-102 loading the current slot does not unnecessarily write storage',async()=>{
 const db=storage(),v=(await api()).create(db);v.save(1,campaign(2));
 const writes=db.writes,bytes=db.getItem('legend_cupSlots');
 assert.equal(v.load(1,t=>t.club===2).club,2);
 assert.throws(()=>v.load(1,t=>t.club===99),/unavailable teams/);
 assert.equal(db.writes,writes);assert.equal(db.getItem('legend_cupSlots'),bytes);
});
test('SAVE-102 invalid slot numbers are rejected without storage writes',async()=>{
 const db=storage(),v=(await api()).create(db);v.save(1,campaign(2));
 const writes=db.writes;
 for(const n of [0,11,1.5,'1',NaN,null])assert.throws(()=>v.load(n),/slot must be 1/);
 assert.equal(db.writes,writes);assert.equal(v.active,1);
});
