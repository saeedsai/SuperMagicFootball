'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=async()=> (await import('../src/modules/cup_slots.js')).CUP_SLOTS;

const campaign=()=>({id:'cup_UEFA',compId:'UEFA',club:1,participants:[1,2,3,4],phase:'league',roundIdx:0,
 history:[],rounds:[],groups:[],table:{1:{},2:{},3:{},4:{}},earned:0,winner:null,knockout:null});
const memory=()=>{const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};
function checksum(payload){let hash=2166136261;for(let i=0;i<payload.length;i++){hash^=payload.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}return hash.toString(16).padStart(8,'0');}
function invalidHistoryBackup(backup,row=null){
 const envelope=JSON.parse(backup),payload=JSON.parse(envelope.payload);
 payload.slots[0].tournament.history=[row];
 envelope.payload=JSON.stringify(payload);envelope.checksum=checksum(envelope.payload);
 return JSON.stringify(envelope);
}

test('Cup slot validation rejects null or non-object history rows before persistence',async()=>{
 const CUP_SLOTS=await api();
 const valid=campaign();
 assert.equal(CUP_SLOTS.validTournament(valid),true);
 for(const row of [null,undefined,'bad',12,[]])
  assert.equal(CUP_SLOTS.validTournament({...valid,history:[row]}),false);
 assert.equal(CUP_SLOTS.validTournament({...valid,history:[{kind:'league',a:1,b:2,round:1,scoreA:'<img src=x onerror=alert(1)>',scoreB:0}]}),false,
  'history scores must be numeric before a backup can be accepted');
 const storage=memory(),slots=CUP_SLOTS.create(storage);
 assert.throws(()=>slots.save(1,{...valid,history:[null]},'bad history'),/invalid Cup campaign/);
 assert.equal(storage.getItem('legend_cupSlots'),null);
});

test('Cup history score renderer converts hostile and out-of-range values to harmless placeholders',()=>{
 const vm=require('node:vm'),ui=require('node:fs').readFileSync('src/modules/ui.js','utf8');
 const match=ui.match(/function formatCupHistoryScore\(value\)\{[^\n]+\}/);
 assert.ok(match,'history score display must use the shared formatting guard');
 const format=vm.runInNewContext('('+match[0]+')');
 assert.equal(format(2),'2');assert.equal(format(0),'0');
 for(const value of ['<img src=x onerror=alert(1)>',-1,1000,null,{},2.5])assert.equal(format(value),'—');
 assert.match(ui,/formatCupHistoryScore\(h\.scoreA\).*formatCupHistoryScore\(h\.scoreB\)/);
});

test('Cup backup preview and import reject a null history entry without writes',async()=>{
 const CUP_SLOTS=await api();
 const storage=memory(),source=CUP_SLOTS.create(memory()),target=CUP_SLOTS.create(storage);
 source.save(1,campaign(),'source');
 const backup=invalidHistoryBackup(source.exportBackup()),before=storage.getItem('legend_cupSlots');
 assert.throws(()=>target.inspectBackup(backup),/Invalid Cup backup slots or tournament data/);
 assert.throws(()=>target.importBackup(backup,{overwrite:true}),/Invalid Cup backup slots or tournament data/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.equal(target.list().some(slot=>slot.occupied),false);
});

test('Cup backup preview and import reject hostile score markup without writes',async()=>{
 const CUP_SLOTS=await api(),storage=memory(),source=CUP_SLOTS.create(memory()),target=CUP_SLOTS.create(storage);
 source.save(1,campaign(),'source');
 const hostile={kind:'league',a:1,b:2,round:1,scoreA:'<img src=x onerror=alert(1)>',scoreB:0};
 const backup=invalidHistoryBackup(source.exportBackup(),hostile),before=storage.getItem('legend_cupSlots');
 assert.throws(()=>target.inspectBackup(backup),/Invalid Cup backup slots or tournament data/);
 assert.throws(()=>target.importBackup(backup,{overwrite:true}),/Invalid Cup backup slots or tournament data/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.equal(target.list().some(slot=>slot.occupied),false);
});

test('standalone and modular tournament restore reject null history rows',async()=>{
 const fs=require('node:fs'),{fileURLToPath}=require('node:url'),previousFetch=globalThis.fetch;
 try{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
  const assets=await import('../src/assets.js');await assets.loadAssets();
  const [{TEAMS,SHOTS},{installExpansion},{installContinentalClubs},standalone,moduleTournament]=await Promise.all([
   import('../src/data.js'),import('../src/expanded.js'),import('../src/continental.js'),
   import('../src/tournaments.js'),import('../src/modules/tournaments.js'),
  ]);
  installExpansion(TEAMS,SHOTS);
  const mapping=installContinentalClubs(TEAMS,SHOTS),fresh=standalone.createTournament('UEFA',mapping.UEFA[0],TEAMS,mapping);
  const invalid={...fresh,history:[null]};
  assert.equal(standalone.validateTournament(invalid,TEAMS),false);
  assert.equal(moduleTournament.TOURNAMENTS.validateTournament(invalid,TEAMS),false);
  assert.equal(standalone.validateTournament(fresh,TEAMS),true);
  assert.equal(moduleTournament.TOURNAMENTS.validateTournament(fresh,TEAMS),true);
 }finally{if(previousFetch===undefined)delete globalThis.fetch;else globalThis.fetch=previousFetch;}
});
