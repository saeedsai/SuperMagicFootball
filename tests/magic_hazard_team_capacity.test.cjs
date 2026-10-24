'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const model=import('../src/modules/magic-hazards.js');
const field={x:0,y:0,w:1000,h:600};
const carrier={t:0,x:300,y:300,dx:1,dy:0,face:1};
const enemy={...carrier,t:1};

test('both teams independently retain six Banana Peels and six Ice Patches',async()=>{
 const p=await model;let active=[];
 for(let i=0;i<18;i++){
  for(const t of [0,1]){
   active=p.placeBananaPeel(active,{...carrier,t,x:300+i*2},field);
   active=p.placeIcePatch(active,{...carrier,t,x:400+i*2},field);
  }
 }
 for(const kind of ['banana','ice']){
  for(const team of [0,1]){
   const expected=kind==='banana'?p.MAX_BANANA_PEELS:p.MAX_ICE_PATCHES;
   assert.equal(active.filter(h=>h.kind===kind&&h.team===team).length,expected);
  }
 }
 assert.equal(active.length,2*(p.MAX_BANANA_PEELS+p.MAX_ICE_PATCHES));
 assert.ok(active.every(h=>Object.isFrozen(h)));
});

test('evicting oldest own trap never evicts or mutates enemy traps',async()=>{
 const p=await model;
 for(const place of [p.placeBananaPeel,p.placeIcePatch]){
  let active=place([],enemy,field);
  const enemyTrap=active[0];
  for(let i=0;i<7;i++)active=place(active,{...carrier,x:300+i*10},field);
  assert.ok(active.includes(enemyTrap),'enemy trap reference must survive');
  assert.equal(active.filter(h=>h.team===0).length,6);
  assert.equal(active.filter(h=>h.team===1).length,1);
  assert.equal(active.filter(h=>h.team===0)[0].x,300+10- (place===p.placeBananaPeel?42:48));
 }
});

test('a defensive SHOOT slide clears only enemy traps even when both teams overlap',async()=>{
 const p=await model;let active=[];
 for(const c of [carrier,enemy]){
  active=p.placeBananaPeel(active,c,field);
  active=p.placeIcePatch(active,c,field);
 }
 const slide={t:0,x:252,y:300,z:0,stun:0,keeper:false,action:'slide',actionTimer:.2};
 const result=p.disarmMagicHazards(active,[slide]);
 assert.equal(result.disarmed.length,2);
 assert.ok(result.disarmed.every(d=>d.hazard.team===1&&d.player===slide));
 assert.equal(result.hazards.length,2);
 assert.ok(result.hazards.every(h=>h.team===0));
 assert.equal(p.advanceBananaPeels(result.hazards,[slide],.4).slips.length,0);
 assert.equal(p.advanceIcePatches(result.hazards,[slide],.4).slips.length,0);
});
