'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=async()=> (await import('../src/modules/cup_slots.js')).CUP_SLOTS;
const campaign=()=>({id:'cup_UEFA',compId:'UEFA',club:1,participants:[1,2,3,4],phase:'league',roundIdx:0,
 history:[],rounds:[],groups:[],table:{1:{},2:{},3:{},4:{}},earned:0,winner:null,knockout:null});
const memory=()=>{const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};
function checksum(payload){let hash=2166136261;for(let i=0;i<payload.length;i++){hash^=payload.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}return hash.toString(16).padStart(8,'0');}
function malformedTableBackup(backup,row){
 const envelope=JSON.parse(backup),payload=JSON.parse(envelope.payload);
 payload.slots[0].tournament.table[1]=row;
 envelope.payload=JSON.stringify(payload);envelope.checksum=checksum(envelope.payload);
 return JSON.stringify(envelope);
}

test('Cup table rows reject arrays, malformed counters, and inconsistent complete totals',async()=>{
 const CUP_SLOTS=await api(),valid=campaign();
 assert.equal(CUP_SLOTS.validTournament(valid),true,'incomplete legacy table objects remain readable');
 const complete={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};
 assert.equal(CUP_SLOTS.validTournament({...valid,table:{1:complete,2:{},3:{},4:{}}}),true);
 for(const row of [[],{p:'1'},{gf:-1},{pts:1.5},
  {p:1,w:0,d:0,l:0,gf:0,ga:0,pts:0}])
  assert.equal(CUP_SLOTS.validTournament({...valid,table:{...valid.table,1:row}}),false);
 const storage=memory(),slots=CUP_SLOTS.create(storage);
 assert.throws(()=>slots.save(1,{...valid,table:{...valid.table,1:[]}},'bad table'),/invalid Cup campaign/);
 assert.equal(storage.getItem('legend_cupSlots'),null);
});

test('Cup backup preview/import reject a malformed rechecksummed table without writes',async()=>{
 const CUP_SLOTS=await api(),storage=memory(),source=CUP_SLOTS.create(memory()),target=CUP_SLOTS.create(storage);
 source.save(1,campaign(),'source');
 const backup=malformedTableBackup(source.exportBackup(),[]),before=storage.getItem('legend_cupSlots');
 assert.throws(()=>target.inspectBackup(backup),/Invalid Cup backup slots or tournament data/);
 assert.throws(()=>target.importBackup(backup,{overwrite:true}),/Invalid Cup backup slots or tournament data/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.equal(target.list().some(slot=>slot.occupied),false);
});

test('Cup backup normal roundtrip preserves complete league table rows',async()=>{
 const CUP_SLOTS=await api(),source=CUP_SLOTS.create(memory()),target=CUP_SLOTS.create(memory()),tournament=campaign();
 tournament.table=Object.fromEntries(tournament.participants.map(id=>[id,{p:1,w:0,d:1,l:0,gf:1,ga:1,pts:1}]));
 source.save(1,tournament,'draw table');
 assert.equal(target.importBackup(source.exportBackup()),1);
 assert.deepEqual(target.activeTournament().table,tournament.table);
});
