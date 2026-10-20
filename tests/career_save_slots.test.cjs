const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const ui=readFileSync('src/modules/ui.js','utf8');
const fakeCareer=(club=3)=>({club,season:1,week:0,members:[club],fixtures:[],history:[],roster:Array.from({length:12},(_,i)=>({id:'p'+i})),table:{},facilities:{training:1},cup:{stage:0},cash:100});
const memory=()=>{const data=new Map();return {data,getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};};
async function slots(){return (await import('../src/modules/career_slots.js')).CAREER_SLOTS;}
test('ten independent Career slots and active selection survive relaunch',async()=>{
 const api=await slots(),db=memory(),vault=api.create(db);
 assert.equal(vault.list().length,10);
 for(let n=1;n<=10;n++)vault.save(n,fakeCareer(n),'Club '+n);
 assert.equal(vault.firstEmpty(),null);
 const reload=api.create(db);assert.equal(reload.active,10);assert.equal(reload.activeCareer().club,10);
 assert.equal(reload.load(3).club,3);assert.equal(reload.active,3);
 const c=reload.activeCareer();c.club=99;assert.equal(reload.activeCareer().club,3,'loaded object must not alias stored slot');
 assert.equal(api.create(db).load(10).club,10,'loading another slot must not modify it');
});
test('legacy single Career is copied into slot 1 without erasing original',async()=>{
 const api=await slots(),db=memory(),legacy=fakeCareer(42);db.setItem('legend_managerCareer',JSON.stringify(legacy));
 const vault=api.create(db);assert.equal(vault.importLegacy(legacy),true);
 assert.equal(vault.load(1).club,42);assert.equal(JSON.parse(db.getItem('legend_managerCareer')).club,42);
 assert.equal(api.create(db).importLegacy(fakeCareer(5)),false,'never overwrite an existing vault');
});
test('explicit overwrite and delete affect only chosen slot',async()=>{
 const api=await slots(),db=memory(),v=api.create(db);
 v.save(1,fakeCareer(1));v.save(2,fakeCareer(2));
 v.save(1,fakeCareer(11),'Renamed');assert.equal(v.load(1).club,11);assert.equal(v.list()[0].name,'Renamed');
 v.remove(1);assert.equal(v.list()[0].occupied,false);assert.equal(v.load(2).club,2);
 assert.throws(()=>v.load(1),/empty/);assert.throws(()=>v.save(0,fakeCareer()),/1–10/);
});
test('corruption and storage failure cannot destroy previous slots',async()=>{
 const api=await slots(),db=memory(),v=api.create(db);v.save(1,fakeCareer(7));
 const before=db.getItem('legend_careerSlots');const failing={getItem:db.getItem,setItem:()=>{throw Error('QuotaExceededError')}};
 assert.throws(()=>api.create(failing).save(2,fakeCareer(8)),/QuotaExceededError/);
 assert.equal(db.getItem('legend_careerSlots'),before);
 db.setItem('legend_careerSlots','{bad json');
 const blocked=api.create(db);assert.ok(blocked.error);assert.throws(()=>blocked.save(1,fakeCareer()),/cannot be modified/);
 assert.equal(db.getItem('legend_careerSlots'),'{bad json');
});
test('Career slot controls, legacy mirror and backup wiring exist',()=>{
 for(const token of ['navCareerSlots','careerSlotSave_','careerSlotLoad_','careerSlotDelete_','CAREER_SLOTS.create(localStorage)','careerSlots.save(','careerSlots.load(','careerSlots.remove(','careerSlots','managerCareer'])assert.ok(ui.includes(token),token);
});
