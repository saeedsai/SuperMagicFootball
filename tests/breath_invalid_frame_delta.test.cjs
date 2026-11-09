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

test('nonfinite movement intensity never causes instantaneous Breath drain',()=>{
 for(const stamina of [1,50,100]){
  const cap=F.breathCapacity(stamina),start=cap*.4;
  for(const intensity of [NaN,Infinity,-Infinity,undefined]){
   const next=F.breathTick(start,stamina,1,intensity);
   assert.ok(Number.isFinite(next),'Breath remains finite');
   assert.ok(next>=start,'invalid intensity cannot drain Breath');
   assert.ok(next<=cap,'recovery remains capped');
  }
  const run=F.breathTick(cap,stamina,1,F.breathMovementIntensity(1));
  const sprint=F.breathTick(cap,stamina,1,F.breathMovementIntensity(1,true));
  assert.ok(sprint<run-1.3,'valid sprint still costs substantially more than carrying');
 }
});

test('nonfinite analog magnitude cannot become a full-speed sprint',()=>{
 for(const magnitude of [NaN,Infinity,-Infinity,undefined]){
  for(const sprinting of [false,true]){
   for(const hyperdash of [false,true]){
    assert.equal(F.breathMovementIntensity(magnitude,sprinting,hyperdash),0,
     'invalid analog input must be treated as idle');
   }
  }
 }
 for(const magnitude of [0,.14,.25,.55,1]){
  const ordinary=F.breathMovementIntensity(magnitude);
  const sprint=F.breathMovementIntensity(magnitude,true);
  assert.ok(Number.isFinite(ordinary)&&Number.isFinite(sprint));
  if(magnitude>.14)assert.ok(sprint>ordinary,'valid sprint retains greater intensity');
 }
 for(const stamina of [1,50,100]){
  const cap=F.breathCapacity(stamina),start=cap*.4;
  const invalid=F.breathTick(start,stamina,1,F.breathMovementIntensity(Infinity,true));
  assert.ok(invalid>=start,'invalid input cannot drain Breath');
  const sprint=F.breathTick(cap,stamina,1,F.breathMovementIntensity(1,true));
  const run=F.breathTick(cap,stamina,1,F.breathMovementIntensity(1));
  assert.ok(sprint<run-1.3,'valid sprint drain contrast remains intact');
 }
});
