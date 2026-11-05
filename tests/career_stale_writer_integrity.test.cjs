const test=require('node:test');
const assert=require('node:assert/strict');

function memory(){
 const data=new Map();
 return {getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
}
function career(club,week=0){return {club,season:1,week,members:[club],fixtures:[],history:[],
 roster:Array.from({length:12},(_,index)=>({id:'p'+index})),table:{},facilities:{training:1},cup:{stage:0},cash:100};}
function backupVault(slots){const envelope=JSON.parse(slots.exportBackup());assert.equal(envelope.format,'smf-career-backup');return JSON.parse(envelope.payload);}

test('a stale Career tab cannot replace a newer vault when saving another slot',async()=>{
 const {CAREER_SLOTS}=await import('../src/modules/career_slots.js');
 const storage=memory(),current=CAREER_SLOTS.create(storage),stale=CAREER_SLOTS.create(storage);
 current.save(1,career(1),'Current tab');
 const committed=storage.getItem('legend_careerSlots');

 assert.throws(()=>stale.save(2,career(2),'Stale tab'),/changed elsewhere/);
 assert.equal(storage.getItem('legend_careerSlots'),committed,'a rejected stale write leaves the newest bytes intact');
 assert.match(stale.error,/another tab/i,'the stale vault exposes an actionable conflict');
 assert.equal(stale.hasRecoverySnapshot,true,'the old trusted vault remains exportable');
 assert.deepEqual(backupVault(stale).slots,[null,null,null,null,null,null,null,null,null,null]);

 const reopened=CAREER_SLOTS.create(storage);
 assert.deepEqual(reopened.list().filter(slot=>slot.occupied).map(slot=>[slot.number,slot.name]),[[1,'Current tab']]);
});

test('a stale Career tab cannot replace newer progress in the same slot and its trusted copy remains exportable',async()=>{
 const {CAREER_SLOTS}=await import('../src/modules/career_slots.js');
 const storage=memory(),seed=CAREER_SLOTS.create(storage);
 seed.save(1,career(3,1),'Career');
 const current=CAREER_SLOTS.create(storage),stale=CAREER_SLOTS.create(storage);
 current.save(1,career(3,8),'Career');
 current.save(2,career(4,2),'Current extra slot');
 const committed=storage.getItem('legend_careerSlots');

 assert.throws(()=>stale.save(1,career(3,4),'Career'),/changed elsewhere/);
 assert.equal(storage.getItem('legend_careerSlots'),committed,'same-slot conflict preserves the newer season cursor and every other slot');
 assert.match(stale.error,/another tab/i);
 const recovery=backupVault(stale);
 assert.equal(recovery.slots[0].career.week,1,'the last trusted stale slot is available for export');
 assert.equal(recovery.slots[1],null);

 const reopened=CAREER_SLOTS.create(storage);
 assert.equal(reopened.getSlot(1).career.week,8);
 assert.equal(reopened.getSlot(2).name,'Current extra slot');
});
