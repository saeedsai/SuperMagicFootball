const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/career_slots.js','utf8').replace(/export const CAREER_SLOTS=/,'this.CAREER_SLOTS=');
const context=vm.createContext({});
vm.runInContext(source,context);
const {create}=context.CAREER_SLOTS;
const career=()=>({club:2,members:[],fixtures:[],history:[],roster:Array.from({length:12},(_,id)=>({id})),table:{},facilities:{},cup:{},cash:100,week:4,season:2});
function storage(){let raw=null,writes=0,fail=false;return {
 getItem:()=>raw,
 setItem:(_key,value)=>{if(fail)throw Error('quota exceeded');raw=value;writes++},
 get writes(){return writes},get raw(){return raw},set fail(value){fail=value}
};}

test('rename keeps progress, timestamp, active selection and other slots intact',()=>{
 const db=storage(),slots=create(db);slots.save(1,career(),'Original');slots.save(2,career(),'Second');slots.load(1);
 const before=JSON.parse(db.raw),writes=db.writes;
 const result=slots.rename(2,'  A better name  ');
 const after=JSON.parse(db.raw);
 assert.equal(result.name,'A better name');
 assert.equal(slots.active,1);
 assert.equal(after.slots[1].savedAt,before.slots[1].savedAt);
 assert.deepEqual(after.slots[1].career,before.slots[1].career);
 assert.deepEqual(after.slots[0],before.slots[0]);
 assert.equal(db.writes,writes+1);
 assert.equal(slots.list().length,10);
});
test('unchanged rename avoids writes and does not alter timestamp',()=>{
 const db=storage(),slots=create(db);slots.save(1,career(),'Career');
 const writes=db.writes,before=db.raw;
 assert.equal(slots.rename(1,' Career ').name,'Career');
 assert.equal(db.writes,writes);assert.equal(db.raw,before);
});
test('rejects empty, nontext, invalid and unoccupied slot names',()=>{
 const db=storage(),slots=create(db);slots.save(1,career(),'Career');
 for(const value of ['', '  ',null,42])assert.throws(()=>slots.rename(1,value));
 assert.throws(()=>slots.rename(2,'New name'),/empty/);
 assert.throws(()=>slots.rename(11,'New name'),/1–10/);
 assert.equal(slots.list()[0].name,'Career');
});
test('long names stay within 60-character vault contract',()=>{
 const db=storage(),slots=create(db);slots.save(1,career(),'Career');
 const result=slots.rename(1,'x'.repeat(75));
 assert.equal(result.name.length,60);
 assert.equal(context.CAREER_SLOTS.validVault(JSON.parse(db.raw)),true);
});
test('storage failures leave the in-memory career unchanged',()=>{
 const db=storage(),slots=create(db);slots.save(1,career(),'Career');db.fail=true;
 assert.throws(()=>slots.rename(1,'New'),/quota exceeded/);
 assert.equal(slots.list()[0].name,'Career');
});
test('Career slot UI wires a rename control without adding gameplay actions',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/button\('RENAME','careerSlotRename_'\+s\.number\)/);
 assert.match(ui,/a\.startsWith\('careerSlotRename_'\)/);
 assert.match(ui,/careerSlots\.rename\(n,name\)/);
});

test('renaming works even when all ten slots are occupied',()=>{
 const db=storage(),slots=create(db);
 for(let n=1;n<=10;n++)slots.save(n,career(),'Career '+n);
 const before=JSON.parse(db.raw);
 slots.rename(4,'Season Two');
 const after=JSON.parse(db.raw);
 assert.equal(slots.firstEmpty(),null);
 assert.equal(after.active,10);
 assert.equal(after.slots[3].name,'Season Two');
 assert.deepEqual(after.slots[3].career,before.slots[3].career);
 assert.equal(after.slots[3].savedAt,before.slots[3].savedAt);
});
