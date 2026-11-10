const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/fitness.js'),'utf8');
const context={};
vm.runInNewContext(source.replace(/export \{FITNESS\};?/g,'')+'\nthis.F=FITNESS',context);
const F=context.F;

test('invalid Breath never bypasses the fatigue penalty',()=>{
 for(const stamina of [1,25,60,100,NaN,Infinity]){
  const cap=F.breathCapacity(stamina);
  for(const invalid of [NaN,Infinity,-Infinity,undefined]){
   assert.equal(F.breathPenalty(invalid,stamina),1.6,
    'invalid Breath must behave as empty, not full');
  }
  assert.equal(F.breathPenalty(0,stamina),1.6);
  assert.equal(F.breathPenalty(cap,stamina),1);
  assert.equal(F.breathPenalty(cap/2,stamina),1.3);
 }
});
test('valid Breath penalty remains bounded and monotonic',()=>{
 for(const stamina of [1,40,75,100]){
  const cap=F.breathCapacity(stamina);
  const samples=[-2,0,cap*.25,cap*.5,cap*.75,cap,cap+2];
  const penalties=samples.map(v=>F.breathPenalty(v,stamina));
  for(const p of penalties)assert.ok(p>=1&&p<=1.6);
  for(let i=1;i<penalties.length;i++)assert.ok(penalties[i]<=penalties[i-1]);
 }
});
