const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/fitness.js'),'utf8');
const context={};
vm.runInNewContext(source.replace(/export \{FITNESS\};?/g,'')+'\nthis.F=FITNESS',context);
const F=context.F;

test('invalid frame durations preserve existing Breath without granting recovery or draining',()=>{
 for(const stamina of [1,50,100]){
  const cap=F.breathCapacity(stamina);
  for(const starting of [0,cap*.4,cap]){
   for(const seconds of [NaN,Infinity,-Infinity,undefined,-1]){
    for(const intensity of [0,.25,.6,1.5,1.7]){
     assert.equal(F.breathTick(starting,stamina,seconds,intensity),starting,
      'invalid elapsed time must leave Breath unchanged');
    }
   }
  }
 }
});

test('valid frame durations preserve cheap carrying, expensive sprint, and walking recovery',()=>{
 for(const stamina of [1,50,100]){
  const cap=F.breathCapacity(stamina),start=cap*.5;
  assert.equal(F.breathTick(start,stamina,0,1.5),start);
  const walk=F.breathTick(start,stamina,1,F.breathMovementIntensity(.25));
  // Compare drain from full capacity: low-Stamina half-cap clips sprint at zero.
  const run=F.breathTick(cap,stamina,1,F.breathMovementIntensity(1));
  const sprint=F.breathTick(cap,stamina,1,F.breathMovementIntensity(1,true));
  assert.ok(walk>start,'walking must recover Breath');
  assert.ok(run<cap&&cap-run<.2,'normal carrying must cost very little');
  assert.ok(sprint<run-1.3,'sprint must cost substantially more');
  assert.equal(F.breathTick(cap,stamina,1,0),cap,'recovery must respect cap');
 }
});
