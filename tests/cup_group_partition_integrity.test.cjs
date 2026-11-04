'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const api=async()=> (await import('../src/modules/cup_slots.js')).CUP_SLOTS;
const campaign=()=>({id:'cup_CAF',compId:'CAF',club:1,participants:[1,2,3,4,5,6,7,8],phase:'league',roundIdx:0,
 history:[],rounds:[[[1,3],[2,4],[5,7],[6,8]]],groups:[[1,3,5,7],[2,4,6,8]],
 table:Object.fromEntries([1,2,3,4,5,6,7,8].map(id=>[id,{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}])),earned:0,winner:null,knockout:null});
const memory=()=>{const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};
function rewriteBackup(backup,groups){
 const envelope=JSON.parse(backup),payload=JSON.parse(envelope.payload);payload.slots[0].tournament.groups=groups;
 envelope.payload=JSON.stringify(payload);let hash=2166136261;
 for(let i=0;i<envelope.payload.length;i++){hash^=envelope.payload.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}
 envelope.checksum=hash.toString(16).padStart(8,'0');return JSON.stringify(envelope);
}
test('Cup group metadata partitions participants and keeps scheduled league fixtures inside groups',async()=>{
 const CUP=await api(),valid=campaign();assert.equal(CUP.validTournament(valid),true);
 assert.equal(CUP.validTournament({...valid,groups:[[1,3,5],[2,4,6,8]]}),false,'missing participants must fail');
 assert.equal(CUP.validTournament({...valid,groups:[[1,3,5,7],[2,4,6,8,8]]}),false,'duplicate team assignment must fail');
 assert.equal(CUP.validTournament({...valid,rounds:[[[1,2],[3,5]]]}),false,'cross-group fixtures must fail');
 assert.equal(CUP.validTournament({...valid,groups:[]}),true,'legacy empty grouping metadata remains accepted');
});
test('Cup save and rechecksummed backup reject malformed group metadata without writes',async()=>{
 const CUP=await api(),storage=memory(),target=CUP.create(storage),source=CUP.create(memory());
 source.save(1,campaign(),'valid grouped Cup');const backup=rewriteBackup(source.exportBackup(),[[1,3,5],[2,4,6,7,8]]);
 const before=storage.getItem('legend_cupSlots');
 assert.throws(()=>target.save(1,{...campaign(),groups:[[1,3,5],[2,4,6,7,8]]},'invalid'),/invalid Cup campaign/);
 assert.throws(()=>target.inspectBackup(backup),/Invalid Cup backup slots or tournament data/);
 assert.throws(()=>target.importBackup(backup,{overwrite:true}),/Invalid Cup backup slots or tournament data/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
});
