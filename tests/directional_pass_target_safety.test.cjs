'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/shotfeel.js'),'utf8');
const context=vm.createContext({AI:{}});
vm.runInContext(source.replace(/^import .*;\s*$/m,'').replace(/export \{SHOTFEEL\};/,'globalThis.SHOTFEEL=SHOTFEEL;'),context);
const choose=context.SHOTFEEL.teammateInDirection;
const from={x:500,y:500};
for(const sign of [-1,1]){
 test(`side ${sign}: nearer aligned teammate beats slightly straighter remote player`,()=>{
  const near={x:500+sign*180,y:500+35};
  const far={x:500+sign*950,y:500};
  assert.equal(choose(from,[far,near],{x:sign,y:0}),near);
 });
 test(`side ${sign}: markedly better aligned teammate still wins`,()=>{
  const near={x:500+sign*160,y:500+130};
  const far={x:500+sign*700,y:500};
  assert.equal(choose(from,[near,far],{x:sign,y:0}),far);
 });
 test(`side ${sign}: rejects behind, off-axis, too-near and too-far receivers`,()=>{
  const valid={x:500+sign*210,y:500};
  const invalid=[{x:500-sign*200,y:500},{x:500+sign*90,y:800},
    {x:500+sign*20,y:500},{x:500+sign*1600,y:500}];
  assert.equal(choose(from,[...invalid,valid],{x:sign,y:0},1150),valid);
 });
 test(`side ${sign}: skips stunned and malformed teammates`,()=>{
  const valid={x:500+sign*180,y:500};
  const bad=[null,{}, {x:NaN,y:500},{x:500+sign*200,y:500,stun:1},from];
  assert.equal(choose(from,[...bad,valid],{x:sign,y:0}),valid);
 });
}
test('no input, invalid direction and empty eligible cohort return null',()=>{
 assert.equal(choose(from,[],{x:1,y:0}),null);
 assert.equal(choose(from,[{x:700,y:500}],{x:0,y:0}),null);
 assert.equal(choose(from,[{x:700,y:500}],{x:NaN,y:0}),null);
 assert.equal(choose(from,[{x:700,y:500}],{x:1,y:0},10),null);
 assert.equal(choose(null,[{x:700,y:500}],{x:1,y:0}),null);
 assert.equal(choose(from,null,{x:1,y:0}),null);
});
test('stable tie breaks toward nearer receiver',()=>{
 const near={x:700,y:500};const far={x:900,y:500};
 assert.equal(choose(from,[far,near],{x:1,y:0}),near);
});
test('direction magnitude does not affect selected receiver',()=>{
 const a={x:650,y:500},b={x:1000,y:500};
 assert.equal(choose(from,[a,b],{x:1,y:0}),choose(from,[a,b],{x:100,y:0}));
});
test('existing shot feel helpers remain exposed',()=>{
 for(const name of ['launchPower','flightDrag','impactFactor','contactEnergy','lanePreference','aiFinishingPriority']){
  assert.equal(typeof context.SHOTFEEL[name],'function');
 }
});
