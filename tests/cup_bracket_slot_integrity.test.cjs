'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const importApi=import('../src/modules/cup_slots.js');

const campaign=(club=1)=>({id:'cup_UEFA',compId:'UEFA',club,participants:[1,2,3,4],phase:'knockout',roundIdx:0,
 history:[],rounds:[],groups:[],table:{1:{},2:{},3:{},4:{}},earned:0,winner:null,
 knockout:{matches:[[1,2],[3,4]],byes:[],stage:'SEMI-FINAL',remaining:4}});
const memory=()=>{const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};

test('Cup slot validation rejects malformed or foreign bracket identities',async()=>{
 const {CUP_SLOTS}=await importApi,valid=campaign();
 assert.equal(CUP_SLOTS.validTournament(valid),true);
 const invalid=[
  {...valid,knockout:{...valid.knockout,matches:[[1,99],[3,4]]}},
  {...valid,knockout:{...valid.knockout,matches:[[1,2],[2,3]]}},
  {...valid,knockout:{...valid.knockout,matches:[[2,3]]}},
  {...valid,knockout:{...valid.knockout,matches:[[1]]}},
  {...valid,knockout:{...valid.knockout,byes:[4,4]}},
  {...valid,knockout:{...valid.knockout,byes:[1],matches:[[1,2],[3,4]]}},
  {...valid,knockout:{...valid.knockout,stage:' '}},
  {...valid,roundIdx:-1},
 ];
 for(const tournament of invalid)assert.equal(CUP_SLOTS.validTournament(tournament),false);
});

test('Cup slots reject a malformed bracket before writing or activating it',async()=>{
 const {CUP_SLOTS}=await importApi,storage=memory(),slots=CUP_SLOTS.create(storage),bad=campaign();
 bad.knockout.matches[0]=[1,99];
 assert.throws(()=>slots.save(1,bad,'bad bracket'),/invalid Cup campaign/);
 assert.equal(storage.getItem('legend_cupSlots'),null);
 assert.equal(slots.activeTournament(),null);
});
