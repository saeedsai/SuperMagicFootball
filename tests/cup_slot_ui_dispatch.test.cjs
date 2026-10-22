'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const api=async()=> (await import('../src/modules/cup_slots.js')).CUP_SLOTS;
const storage=()=>{const m=new Map();let writes=0;return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{writes++;m.set(k,String(v));},removeItem:k=>m.delete(k),get writes(){return writes;}}};
const campaign=club=>({id:'cup_UEFA',compId:'UEFA',club,participants:[club,3,4,5],phase:'league',roundIdx:0,history:[],rounds:[],groups:[],table:{[club]:{},3:{},4:{},5:{}},earned:0,winner:null,knockout:null});
const source=fs.readFileSync('src/modules/ui.js','utf8');
const lines=source.split(/\r?\n/).filter(line=>/^\s*else if\(a\.startsWith\('cupSlotLoad_'\)\)/.test(line));
assert.equal(lines.length,1,'one Cup slot load dispatcher must be present');
const handler=lines[0].trim();
const fixture=async(confirmed=true)=>{
 const db=storage(),cupSlots=(await api()).create(db);
 cupSlots.save(1,campaign(2));cupSlots.save(2,campaign(100));cupSlots.save(3,campaign(12));cupSlots.load(1);
 let stored=0,draws=0;const alerts=[];
 const ctx={cupSlots,TEAMS:Array(30),validateTournament:t=>t.participants.every(id=>id>=0&&id<30),
  store:{put(){stored++;}},showTournament(){draws++;},alert:s=>alerts.push(s),confirm:()=>confirmed};
 const app=vm.runInNewContext(`(()=>{let continentalRun={club:2};function dispatch(a){if(false){}${handler}}return {dispatch,get current(){return continentalRun}}})()`,ctx);
 return {db,cupSlots,app,alerts,get stored(){return stored},get draws(){return draws}};
};
test('UI rejects unavailable Cup team without changing active slot or writing storage',async()=>{
 const f=await fixture(),bytes=f.db.getItem('legend_cupSlots'),writes=f.db.writes;
 f.app.dispatch('cupSlotLoad_2');
 assert.equal(f.cupSlots.active,1);assert.equal(f.app.current.club,2);
 assert.equal(f.db.getItem('legend_cupSlots'),bytes);assert.equal(f.db.writes,writes);
 assert.equal(f.stored,0);assert.equal(f.draws,0);assert.match(f.alerts[0],/unavailable teams/);
});
test('UI valid Cup load activates slot and shows tournament',async()=>{
 const f=await fixture();f.app.dispatch('cupSlotLoad_3');
 assert.equal(f.cupSlots.active,3);assert.equal(f.app.current.club,12);
 assert.equal(f.stored,1);assert.equal(f.draws,1);assert.equal(f.alerts.length,0);
});
test('UI load cancellation preserves active slot and campaign',async()=>{
 const f=await fixture(false),bytes=f.db.getItem('legend_cupSlots'),writes=f.db.writes;
 f.app.dispatch('cupSlotLoad_3');
 assert.equal(f.cupSlots.active,1);assert.equal(f.app.current.club,2);
 assert.equal(f.stored,0);assert.equal(f.draws,0);
 assert.equal(f.db.writes,writes);assert.equal(f.db.getItem('legend_cupSlots'),bytes);
});
