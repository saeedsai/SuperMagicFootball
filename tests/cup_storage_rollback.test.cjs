const test=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {resolve}=require('node:path');
const api=async()=> (await import(pathToFileURL(resolve('src/modules/cup_slots.js')).href)).CUP_SLOTS;
const campaign=(club=2)=>({id:'cup_UEFA',compId:'UEFA',club,participants:[club,3,4,5],phase:'league',roundIdx:0,history:[],rounds:[],groups:[],table:{[club]:{},3:{},4:{},5:{}},earned:0,winner:null,knockout:null});
function memory(){
 const map=new Map();let failure='ok';
 return {map,fail:x=>failure=x,getItem:k=>map.has(k)?map.get(k):null,
  setItem(k,v){map.set(k,String(v));if(failure==='throw-once'){failure='ok';throw Error('after-write');}
   if(failure==='throw-then-corrupt-rollback'){failure='corrupt-rollback';throw Error('after-write');}
   if(failure==='corrupt-rollback'){failure='ok';map.set(k,'rollback-discarded');}
   if(failure==='drop-once'){failure='ok';map.set(k,'discarded');}
   if(failure==='always-throw')throw Error('persistent-failure');},
  removeItem:k=>map.delete(k)};
}
test('SAVE-102 rolls back an after-write exception and preserves active slot',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,campaign());
 const previous=db.getItem('legend_cupSlots');db.fail('throw-once');
 assert.throws(()=>v.save(2,campaign(9)),/after-write/);
 assert.equal(db.getItem('legend_cupSlots'),previous);
 assert.equal(v.active,1);assert.equal(v.list()[1].occupied,false);
 v.save(2,campaign(9));assert.equal(v.load(2).club,9);
});
test('SAVE-102 detects silent mutation and restores original bytes',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,campaign());
 const previous=db.getItem('legend_cupSlots');db.fail('drop-once');
 assert.throws(()=>v.save(2,campaign(9)),/not retained/);
 assert.equal(db.getItem('legend_cupSlots'),previous);
 assert.equal(v.active,1);assert.equal(v.list()[1].occupied,false);
});
test('SAVE-102 reports rollback failure rather than claiming successful persistence',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,campaign());
 db.fail('always-throw');assert.throws(()=>v.save(2,campaign(9)),/save failed and rollback failed: persistent-failure/);
 assert.equal(v.active,1);assert.equal(v.list()[1].occupied,false);
 assert.match(v.error,/rollback failed/);
 assert.throws(()=>v.save(3,campaign(10)),/cannot be modified/);
});
test('SAVE-102 rejects silent rollback corruption and blocks future writes',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,campaign());
 db.fail('throw-then-corrupt-rollback');
 assert.throws(()=>v.save(2,campaign(9)),/rollback failed: after-write; rollback: previous Cup save bytes were not restored/);
 assert.match(v.error,/rollback failed/);
 assert.throws(()=>v.save(3,campaign(10)),/cannot be modified/);
});
test('SAVE-102 preserves ten slots and legacy migration after rollback repair',async()=>{
 const db=memory(),mod=await api(),v=mod.create(db);
 for(let n=1;n<=10;n++)v.save(n,campaign(n+10));
 assert.equal(v.firstEmpty(),null);assert.equal(mod.create(db).load(4).club,14);
 const old=memory(),m=mod.create(old);assert.equal(m.importLegacy(campaign(8)),true);
 assert.equal(mod.create(old).load(1).club,8);
});
test('SAVE-102 failed first save restores absence of vault key',async()=>{
 const db=memory(),v=(await api()).create(db);
 assert.equal(db.getItem('legend_cupSlots'),null);
 db.fail('throw-once');
 assert.throws(()=>v.save(1,campaign()),/after-write/);
 assert.equal(db.getItem('legend_cupSlots'),null);
 assert.equal(v.hasVault,false);
 assert.equal(v.list()[0].occupied,false);
 v.save(1,campaign());
 assert.equal(v.hasVault,true);
});
