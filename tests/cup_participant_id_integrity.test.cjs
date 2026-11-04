'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=async()=> (await import('../src/modules/cup_slots.js')).CUP_SLOTS;
const campaign=()=>({id:'cup_UEFA',compId:'UEFA',club:1,participants:[1,2,3,4],phase:'league',roundIdx:0,
 history:[],rounds:[],groups:[],table:{1:{},2:{},3:{},4:{}},earned:0,winner:null,knockout:null});
const memory=()=>{const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};
function checksum(payload){let hash=2166136261;for(let i=0;i<payload.length;i++){hash^=payload.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}return hash.toString(16).padStart(8,'0');}
function unsafeParticipantBackup(backup){
 const envelope=JSON.parse(backup),payload=JSON.parse(envelope.payload),unsafeId=2**53;
 payload.slots[0].tournament.participants[3]=unsafeId;
 payload.slots[0].tournament.table[unsafeId]={};
 envelope.payload=JSON.stringify(payload);envelope.checksum=checksum(envelope.payload);
 return JSON.stringify(envelope);
}

test('Cup slot validation rejects participant IDs beyond safe integer precision',async()=>{
 const CUP_SLOTS=await api(),valid=campaign(),unsafeId=2**53;
 assert.equal(CUP_SLOTS.validTournament(valid),true);
 const invalid={...valid,participants:[1,2,3,unsafeId],table:{1:{},2:{},3:{},[unsafeId]:{}}};
 assert.equal(CUP_SLOTS.validTournament(invalid),false);
 const storage=memory(),slots=CUP_SLOTS.create(storage);
 assert.throws(()=>slots.save(1,invalid,'unsafe participant'),/invalid Cup campaign/);
 assert.equal(storage.getItem('legend_cupSlots'),null);
});

test('Cup backup preview/import reject unsafe participant IDs without writes',async()=>{
 const CUP_SLOTS=await api(),storage=memory(),source=CUP_SLOTS.create(memory()),target=CUP_SLOTS.create(storage);
 source.save(1,campaign(),'source');
 const backup=unsafeParticipantBackup(source.exportBackup()),before=storage.getItem('legend_cupSlots');
 assert.throws(()=>target.inspectBackup(backup),/Invalid Cup backup slots or tournament data/);
 assert.throws(()=>target.importBackup(backup,{overwrite:true}),/Invalid Cup backup slots or tournament data/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.equal(target.list().some(slot=>slot.occupied),false);
});
