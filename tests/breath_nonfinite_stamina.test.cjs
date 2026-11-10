const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/fitness.js'),'utf8');
const context={};
vm.runInNewContext(source.replace(/export \\{FITNESS\\};?/g,'')+'\\nthis.F=FITNESS',context);
const F=context.F;

test('nonfinite Stamina never grants maximum Breath capacity or cheaper sprint',()=>{
 for(const stamina of [NaN,Infinity,-Infinity,undefined]){
  const cap=F.breathCapacity(stamina);
  assert.equal(cap,F.breathCapacity(1),'invalid Stamina must use minimum safe capacity');
  assert.ok(Number.isFinite(cap));
  assert.equal(F.dribbleHoldBreathRate(stamina),F.dribbleHoldBreathRate(1));
  const start=cap;
  const sprint=F.breathTick(start,stamina,1,F.breathMovementIntensity(1,true));
  assert.equal(sprint,F.breathTick(start,1,1,F.breathMovementIntensity(1,true)));
  assert.equal(F.spendBreath(start,stamina,'shoot'),F.spendBreath(start,1,'shoot'));
  assert.equal(F.breathPenalty(cap,stamina),F.breathPenalty(cap,1));
 }
});

test('finite Stamina retains the existing capacity, carrying and sprint progression',()=>{
 for(const stamina of [1,25,50,75,100]){
  const cap=F.breathCapacity(stamina);
  assert.ok(cap>=3&&cap<=10);
  const ordinary=F.breathTick(cap,stamina,1,F.breathMovementIntensity(1));
  const sprint=F.breathTick(cap,stamina,1,F.breathMovementIntensity(1,true));
  assert.ok(sprint<ordinary-1.3);
  assert.ok(cap-ordinary<.2);
  assert.ok(F.breathTick(cap/2,stamina,1,0)>cap/2);
 }
});
