'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const api=async()=>(await import('../src/modules/cup_slots.js')).CUP_SLOTS;
const campaign=club=>({id:'cup_UEFA',compId:'UEFA',club,participants:[club,3,4,5],phase:'league',roundIdx:0,history:[],rounds:[],groups:[],table:{[club]:{},3:{},4:{},5:{}},earned:0,winner:null,knockout:null});
const memory=()=>{const map=new Map();let writes=0,throwNext=false;
 return {getItem:k=>map.has(k)?map.get(k):null,setItem(k,v){writes++;if(throwNext){throwNext=false;throw Error('write denied')}map.set(k,String(v))},removeItem:k=>map.delete(k),get writes(){return writes},failNext(){throwNext=true}};
};
test('copy Cup campaign into first empty slot, preserving active game and source',async()=>{
 const db=memory(),v=(await api()).create(db);
 v.save(1,campaign(2),'Continental');v.save(3,campaign(8),'Second');
 v.load(1);const active=v.active,old=v.activeTournament();
 assert.equal(v.duplicate(3),2);
 assert.equal(v.active,active);assert.deepEqual(v.activeTournament(),old);
 assert.equal(v.list()[1].name,'Second (copy)');
 assert.equal(v.list()[2].name,'Second');
 assert.equal(v.load(2).club,8);
 assert.equal((await api()).create(db).list()[1].occupied,true);
});
test('copy refuses invalid and empty slots without writing',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,campaign(2));
 const writes=db.writes;
 for(const n of [0,11,1.5,'1',null])assert.throws(()=>v.duplicate(n),/slot must be 1/);
 assert.throws(()=>v.duplicate(2),/empty/);
 assert.equal(db.writes,writes);assert.equal(v.active,1);
});
test('copy never overwrites a full ten-slot vault',async()=>{
 const db=memory(),v=(await api()).create(db);
 for(let n=1;n<=10;n++)v.save(n,campaign(n+10),'Cup '+n);
 v.load(5);const raw=db.getItem('legend_cupSlots'),writes=db.writes;
 assert.throws(()=>v.duplicate(1),/occupied/);
 assert.equal(v.active,5);assert.equal(db.writes,writes);assert.equal(db.getItem('legend_cupSlots'),raw);
});
test('failed duplicate leaves original state untouched and supports retry',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,campaign(2));
 const before=db.getItem('legend_cupSlots');db.failNext();
 assert.throws(()=>v.duplicate(1),/write denied/);
 assert.equal(db.getItem('legend_cupSlots'),before);assert.equal(v.list()[1].occupied,false);
 assert.equal(v.duplicate(1),2);
});
test('copy label respects 60-character stored name limit',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,campaign(2),'X'.repeat(60));
 v.duplicate(1);assert.equal(v.list()[1].name.length,60);
});
test('Cup menu shows COPY only with spare slot and UI dispatch duplicates without overwrite',async()=>{
 const src=fs.readFileSync('src/modules/ui.js','utf8');
 const menu=src.match(/function showCupSlots\(\)\{[\s\S]*?\n\}(?=\nfunction showSaveMenu)/);
 assert.ok(menu);
 let html='';
 const state={slots:[{number:1,occupied:true,name:'Cup',compId:'UEFA',club:0,phase:'league',roundIdx:0,savedAt:new Date().toISOString()},{number:2,occupied:false}],copied:0};
 const ctx={cupSlots:{list:()=>state.slots,error:null,duplicate(n){assert.equal(n,1);state.copied++}},continentalRun:null,TEAMS:[{name:'Home'}],escapeHTML:String,
  button:(name,a)=>'<button data-action="'+a+'">'+name+'</button>',page:(a,b,h)=>{html=h},alert(){throw Error('Unexpected alert')},showCupSlots(){}};
 vm.runInNewContext(menu[0]+'\nshowCupSlots()',ctx);assert.match(html,/cupSlotCopy_1/);
 state.slots[1].occupied=true;vm.runInNewContext(menu[0]+'\nshowCupSlots()',ctx);assert.doesNotMatch(html,/cupSlotCopy_1/);
 const handler=src.split(/\r?\n/).find(l=>/^\s*else if\(a\.startsWith\('cupSlotCopy_'\)\)/.test(l));
 assert.ok(handler);
 vm.runInNewContext('function dispatch(a){if(false){}'+handler+'}\ndispatch("cupSlotCopy_1")',ctx);
 assert.equal(state.copied,1);
});
