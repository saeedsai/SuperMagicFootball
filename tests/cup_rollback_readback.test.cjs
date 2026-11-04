'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {resolve}=require('node:path');
const api=async()=> (await import(pathToFileURL(resolve('src/modules/cup_slots.js')).href)).CUP_SLOTS;
const campaign=(club=2)=>({id:'cup_UEFA',compId:'UEFA',club,participants:[club,3,4,5],phase:'league',roundIdx:0,history:[],rounds:[],groups:[],table:{[club]:{},3:{},4:{},5:{}},earned:0,winner:null,knockout:null});
function memory(){const map=new Map();return {map,getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};}

test('SAVE-103 verified Cup rollback tolerates adapters throwing after restoring existing bytes',async()=>{
 const db=memory(),slots=(await api()).create(db);slots.save(1,campaign(),'trusted');
 const trusted=slots.exportBackup(),previous=db.getItem('legend_cupSlots'),original=db.setItem.bind(db);let writes=0;
 db.setItem=(key,value)=>{writes++;original(key,value);throw Error(writes===1?'primary write failed':'rollback write failed');};
 assert.throws(()=>slots.save(2,campaign(9)),/primary write failed/);
 assert.equal(db.getItem('legend_cupSlots'),previous);
 assert.equal(slots.error,null,'matching readback means rollback succeeded despite adapter exception');
 assert.equal(slots.hasRecoverySnapshot,false);
 assert.equal(slots.active,1);
 assert.equal(slots.list()[1].occupied,false);
 assert.equal(slots.exportBackup(),trusted);
});

test('SAVE-103 verified Cup rollback tolerates remove adapters throwing after restoring absence',async()=>{
 const db=memory(),slots=(await api()).create(db),before=slots.exportBackup();
 const originalSet=db.setItem.bind(db),originalRemove=db.removeItem.bind(db);
 db.setItem=(key,value)=>{originalSet(key,value);throw Error('write adapter failed after write');};
 db.removeItem=key=>{originalRemove(key);throw Error('remove adapter failed after remove');};
 assert.throws(()=>slots.save(1,campaign()),/write adapter failed after write/);
 assert.equal(db.getItem('legend_cupSlots'),null);
 assert.equal(slots.error,null);
 assert.equal(slots.hasRecoverySnapshot,false);
 assert.equal(slots.hasVault,false);
 assert.equal(slots.exportBackup(),before);
});

test('SAVE-103 Cup rollback readback mismatch still blocks writes and exports trusted bytes',async()=>{
 const db=memory(),slots=(await api()).create(db);slots.save(1,campaign(),'trusted');
 const trusted=slots.exportBackup(),original=db.setItem.bind(db);let writes=0;
 db.setItem=(key,value)=>{writes++;original(key,writes===1?value:'corrupt rollback');throw Error(writes===1?'primary write failed':'rollback write failed');};
 assert.throws(()=>slots.save(2,campaign(9)),/rollback write failed/);
 assert.ok(slots.error?.includes('readback: previous Cup save bytes were not restored'));
 assert.equal(slots.hasRecoverySnapshot,true);
 assert.throws(()=>slots.save(3,campaign(10)),/cannot be modified/);
 assert.equal(slots.exportBackup(),trusted);
});
