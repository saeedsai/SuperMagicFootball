'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const api=async()=>(await import('../src/modules/career_slots.js')).CAREER_SLOTS;
const career=club=>({club,season:2,week:3,members:[club],fixtures:[],history:[],roster:Array.from({length:12},(_,i)=>({id:'p'+i,condition:100})),table:{},facilities:{training:1},cup:{stage:0},cash:100});
const memory=()=>{const map=new Map();let writes=0,fail=false;
 return {getItem:k=>map.has(k)?map.get(k):null,setItem(k,v){writes++;if(fail){fail=false;throw Error('write denied')}map.set(k,String(v))},
  get writes(){return writes},failNext(){fail=true}};
};
test('Career copy uses first empty slot and preserves source, active selection and progress',async()=>{
 const db=memory(),v=(await api()).create(db);
 v.save(1,career(2),'Original');v.save(3,career(8),'Second');
 v.load(1);const before=v.activeCareer();
 assert.equal(v.duplicate(3),2);assert.equal(v.active,1);
 assert.deepEqual(v.activeCareer(),before);assert.equal(v.list()[1].name,'Second (copy)');
 assert.equal(v.list()[2].name,'Second');assert.equal(v.load(2).club,8);
 const copy=v.load(2);copy.roster[0].condition=0;
 assert.equal(v.load(3).roster[0].condition,100,'copy must not alias source');
 assert.equal((await api()).create(db).list()[1].occupied,true);
});
test('Career copy rejects invalid and empty source slots without writing',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,career(2));
 const writes=db.writes;
 for(const n of [0,11,1.5,'1',null])assert.throws(()=>v.duplicate(n),/slot must be 1/);
 assert.throws(()=>v.duplicate(2),/empty/);
 assert.equal(db.writes,writes);assert.equal(v.active,1);
});
test('Career copy cannot overwrite a full ten-slot vault',async()=>{
 const db=memory(),v=(await api()).create(db);
 for(let n=1;n<=10;n++)v.save(n,career(n),'Career '+n);
 v.load(5);const raw=db.getItem('legend_careerSlots'),writes=db.writes;
 assert.throws(()=>v.duplicate(1),/occupied/);
 assert.equal(v.active,5);assert.equal(db.writes,writes);assert.equal(db.getItem('legend_careerSlots'),raw);
});
test('failed copy leaves all existing saves untouched and supports retry',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,career(2));
 const before=db.getItem('legend_careerSlots');db.failNext();
 assert.throws(()=>v.duplicate(1),/write denied/);
 assert.equal(db.getItem('legend_careerSlots'),before);assert.equal(v.list()[1].occupied,false);
 assert.equal(v.duplicate(1),2);
});
test('copy label stays within 60 characters',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,career(2),'X'.repeat(60));
 v.duplicate(1);assert.equal(v.list()[1].name.length,60);
});
test('Career copy labels stay distinguishable at the 60-character limit and on repeat',async()=>{
 const db=memory(),v=(await api()).create(db);
 const long='X'.repeat(60);v.save(1,career(2),long);
 assert.equal(v.duplicate(1),2);
 assert.equal(v.duplicate(1),3);
 const names=v.list().map(s=>s.name);
 assert.equal(names[0],long,'original label must not change');
 assert.equal(names[1],'X'.repeat(53)+' (copy)');
 assert.equal(names[2],'X'.repeat(51)+' (copy 2)');
 assert.ok(names.every(name=>name.length<=60));
 assert.equal(v.active,1,'copy must not change the active slot');
 assert.equal(v.load(2).club,2);
 assert.equal(v.load(3).club,2);
});
test('Career copy gives a readable label to legacy blank-named slots',async()=>{
 const db=memory(),v=(await api()).create(db);v.save(1,career(2),'Original');
 const raw=JSON.parse(db.getItem('legend_careerSlots'));raw.slots[0].name='';
 const fresh=memory();fresh.setItem('legend_careerSlots',JSON.stringify(raw));
 const restored=(await api()).create(fresh);
 assert.equal(restored.duplicate(1),2);
 assert.equal(restored.list()[1].name,'Career 1 (copy)');
});
test('Career menu only offers COPY when space remains and dispatch preserves active game',()=>{
 const src=fs.readFileSync('src/modules/ui.js','utf8');
 const menu=src.match(/function showCareerSlots\(\)\{[\s\S]*?\n\}(?=\nfunction showCupSlots)/);
 assert.ok(menu,'Career slot screen must be present');
 let html='',copies=0;
 const slots=[{number:1,occupied:true,active:true,name:'Original',club:0,season:2,week:3,savedAt:new Date().toISOString()},{number:2,occupied:false,active:false}];
 const ctx={careerSlots:{list:()=>slots,firstEmpty:()=>slots.some(s=>!s.occupied)?2:null,error:null,duplicate(n){assert.equal(n,1);copies++}},
  career:null,TEAMS:[{name:'Home'}],escapeHTML:String,button:(name,a)=>'<button data-action="'+a+'">'+name+'</button>',
  page:(a,b,h)=>{html=h},alert(){throw Error('Unexpected alert')},showCareerSlots(){}};
 vm.runInNewContext(menu[0]+'\nshowCareerSlots()',ctx);
 assert.match(html,/careerSlotCopy_1/);
 slots[1].occupied=true;
 vm.runInNewContext(menu[0]+'\nshowCareerSlots()',ctx);
 assert.doesNotMatch(html,/careerSlotCopy_1/);
 const handler=src.split(/\r?\n/).find(l=>/^\s*else if\(a\.startsWith\('careerSlotCopy_'\)\)/.test(l));
 assert.ok(handler,'Career COPY dispatcher must exist');
 vm.runInNewContext('function dispatch(a){if(false){}'+handler+'}\ndispatch("careerSlotCopy_1")',ctx);
 assert.equal(copies,1);
});
