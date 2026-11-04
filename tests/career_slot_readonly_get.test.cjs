'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

test('read-only Career slot copy preserves local bytes, active slot, and source object',async()=>{
 const [CAREER,data,expanded,slotModule]=await Promise.all([
  import('../src/career.js'),import('../src/data.js'),import('../src/expanded.js'),import('../src/modules/career_slots.js')
 ]);
 expanded.installExpansion(data.TEAMS,data.SHOTS);
 const club=data.TEAMS.find(team=>team.group==='club26'&&Array.isArray(team.customRoster));
 assert.ok(club);
 const bytes=new Map(),storage={getItem:key=>bytes.has(key)?bytes.get(key):null,setItem:(key,value)=>bytes.set(key,String(value)),removeItem:key=>bytes.delete(key)};
 const slots=slotModule.CAREER_SLOTS.create(storage),career=CAREER.createCareer(club.index,data.TEAMS);
 slots.save(2,career,'Remote copy source');
 const before=storage.getItem('legend_careerSlots'),active=slots.active,source=slots.getSlot(2);
 assert.equal(source.name,'Remote copy source');
 source.career.cash+=500000;
 source.name='mutated copy';
 assert.equal(storage.getItem('legend_careerSlots'),before);
 assert.equal(slots.active,active);
 assert.notEqual(slots.getSlot(2).career.cash,source.career.cash);
 assert.throws(()=>slots.getSlot(11),/Career slot/);
 assert.equal(storage.getItem('legend_careerSlots'),before);
});
