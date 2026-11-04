'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const start=ui.indexOf("let continentalRun=store.get('continentalRun',null);");
const end=ui.indexOf('\nlet continentSelection=',start);
assert.ok(start>=0&&end>start,'Cup startup restore block is present');
const startup=ui.slice(start,end);
const cupImport=import('../src/modules/cup_slots.js');
function memory(initial={}){
 const data=new Map(Object.entries(initial));
 return {getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
}
function tournament(id,club){return {id:'cup_UEFA',compId:'UEFA',club,participants:[1,2,3,4],phase:'league',roundIdx:0,history:[],rounds:[],groups:[],table:{1:{},2:{},3:{},4:{}},earned:0,winner:null,knockout:null,label:id};}
async function boot(storage,teams=[{}, {}, {}, {}, {}]){
 const store={get(key,fallback){const raw=storage.getItem('legend_'+key);if(raw===null)return fallback;try{return JSON.parse(raw)}catch{return fallback}},put(key,value){storage.setItem('legend_'+key,JSON.stringify(value));}};
 const slots=(await cupImport).CUP_SLOTS;
 const context={store,careerStorage:storage,CUP_SLOTS:slots,validateTournament:(t,available)=>Boolean(t&&Number.isInteger(t.club)&&available[t.club]),TEAMS:teams,console};
 return vm.runInNewContext(`(()=>{${startup};return {continentalRun,cupSlots};})()`,context);
}

test('an existing Cup vault with an empty active slot does not reactivate the legacy mirror',async()=>{
 const legacy=tournament('legacy',1);
 const storage=memory({'legend_cupSlots':JSON.stringify({schema:1,active:1,slots:Array(10).fill(null)}),'legend_continentalRun':JSON.stringify(legacy)});
 const legacyBytes=storage.getItem('legend_continentalRun');
 const {continentalRun,cupSlots}=await boot(storage);
 assert.equal(cupSlots.hasVault,true);
 assert.equal(cupSlots.activeTournament(),null);
 assert.equal(continentalRun,null,'an empty active slot is authoritative over stale legacy data');
 assert.equal(storage.getItem('legend_continentalRun'),legacyBytes,'legacy bytes remain recoverable and untouched');
});

test('occupied active Cup slot overrides a different legacy mirror at startup',async()=>{
 const storage=memory();
 const slots=(await cupImport).CUP_SLOTS.create(storage);
 slots.save(3,tournament('saved',2),'Saved');slots.load(3);
 const legacy=tournament('legacy',1);
 storage.setItem('legend_continentalRun',JSON.stringify(legacy));
 const {continentalRun,cupSlots}=await boot(storage);
 assert.equal(cupSlots.active,3);
 assert.equal(continentalRun.club,2);
 assert.equal(continentalRun.label,'saved');
});

test('a legacy-only Cup save still migrates into the first active slot',async()=>{
 const legacy=tournament('legacy',1);
 const storage=memory({'legend_continentalRun':JSON.stringify(legacy)});
 const {continentalRun,cupSlots}=await boot(storage);
 assert.equal(cupSlots.active,1);
 assert.equal(cupSlots.list()[0].occupied,true);
 assert.equal(continentalRun.label,'legacy');
});

test('an invalid saved active Cup reference fails closed instead of falling back to legacy',async()=>{
 const storage=memory();
 const slots=(await cupImport).CUP_SLOTS.create(storage);
 const unknown=tournament('unknown',99);unknown.participants=[99,2,3,4];unknown.table={99:{},2:{},3:{},4:{}};slots.save(1,unknown,'Unavailable');
 storage.setItem('legend_continentalRun',JSON.stringify(tournament('legacy',1)));
 const {continentalRun}=await boot(storage);
 assert.equal(continentalRun,null);
});



