'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/modules/artpose.js','utf8').replace(/export \{ARTPOSE\};?\s*$/,'');
const ARTPOSE=vm.runInNewContext(source+'\nARTPOSE',{});

test('opposite running legs alternate stance and use phase-opposed foot paths',()=>{
 for(const phase of [.2,1.1,2.4,3.7,5.8]){
  const near=ARTPOSE.runFootPose(phase,.8),far=ARTPOSE.runFootPose(phase+Math.PI,.8);
  assert.notEqual(near.stance,far.stance,'exactly one leg is in contact away from transitions');
  assert.ok(near.contactOffset*far.contactOffset<=0,'opposite legs offset in opposing directions');
  for(const pose of [near,far]){
   assert.ok(pose.kneeFlex>=0&&pose.kneeFlex<=.65);
   assert.ok(pose.toeFlex>=0&&pose.toeFlex<=.42);
  }
 }
});

test('stance and swing foot paths meet continuously at touchdown and toe-off',()=>{
 const epsilon=1e-7,speed=.9;
 for(const boundary of [0,Math.PI,Math.PI*2]){
  const before=ARTPOSE.runFootPose(boundary-epsilon,speed);
  const at=ARTPOSE.runFootPose(boundary,speed);
  const after=ARTPOSE.runFootPose(boundary+epsilon,speed);
  assert.ok(Math.abs(before.contactOffset-at.contactOffset)<1e-5);
  assert.ok(Math.abs(after.contactOffset-at.contactOffset)<1e-5);
  assert.ok(Math.abs(before.kneeFlex-after.kneeFlex)<1e-5);
  assert.ok(Math.abs(before.toeFlex-after.toeFlex)<1e-5);
 }
});

test('stationary pose keeps feet still and caller can reuse output storage',()=>{
 const scratch={};
 for(const phase of [0,.8,Math.PI,4,Math.PI*2]){
  const pose=ARTPOSE.runFootPose(phase,0,scratch);
  assert.equal(pose,scratch);
  assert.equal(pose.contactOffset,0);
  assert.equal(pose.kneeFlex,0);
  assert.equal(pose.toeFlex,0);
  assert.equal(typeof pose.stance,'boolean');
 }
});

test('gait outputs are bounded and independent of render sampling frequency',()=>{
 for(const angle of [-100*Math.PI,-1,0,.2,Math.PI,Math.PI*2,99*Math.PI]){
  const pose=ARTPOSE.runFootPose(angle,2);
  assert.ok(Math.abs(pose.contactOffset)<=9);
  assert.ok(pose.kneeFlex>=0&&pose.kneeFlex<=.65);
  assert.ok(pose.toeFlex>=0&&pose.toeFlex<=.42);
 }
 const duration=.6,frequency=17,reference=[];
 for(let frame=0;frame<=72;frame++){
  const time=frame/120;
  reference.push(ARTPOSE.runFootPose(time*frequency,.73));
 }
 for(const rate of [30,60,120])for(let frame=0;frame<=duration*rate;frame++){
  const time=frame/rate,index=Math.round(time*120),pose=ARTPOSE.runFootPose(time*frequency,.73),expected=reference[index];
  assert.equal(pose.stance,expected.stance);
  assert.ok(Math.abs(pose.contactOffset-expected.contactOffset)<1e-12);
  assert.ok(Math.abs(pose.kneeFlex-expected.kneeFlex)<1e-12);
  assert.ok(Math.abs(pose.toeFlex-expected.toeFlex)<1e-12);
 }
});

test('signature pace and player phase stay synchronized between body and feet',()=>{
 const render=fs.readFileSync('src/modules/render.js','utf8');
 assert.match(render,/const runPhase=ARTPOSE\.runPhase\(p\.anim,signatureMotion\?\.runRate,p\.i\);/);
 assert.match(render,/const oscillator=Math\.sin\(runPhase\);/);
 for(const rate of [.83,.91,1,1.08,1.25])for(const playerIndex of [0,3,11]){
  const phase=ARTPOSE.runPhase(.731,rate,playerIndex),oscillator=Math.sin(phase);
  assert.ok(Number.isFinite(oscillator));
  const near=ARTPOSE.runFootPose(phase,.8),far=ARTPOSE.runFootPose(phase+Math.PI,.8);
  assert.notEqual(near.stance,far.stance);
 }
});

test('renderer turf contact puffs align to both alternating foot touchdown phases',()=>{
 const render=fs.readFileSync('src/modules/render.js','utf8');
 const helperSource=render.match(/function runFootContactPulse\(phase\)\{[\s\S]*?\n\}/)?.[0];
 assert.ok(helperSource,'renderer exposes a focused touchdown pulse helper');
 const helperContext=vm.createContext({Math,Number,PI:Math.PI,clamp:(value,min,max)=>Math.max(min,Math.min(max,value))});
 vm.runInContext(`${helperSource}\nthis.runFootContactPulse=runFootContactPulse;`,helperContext);
 const pulse=helperContext.runFootContactPulse;
 for(const touchdown of [0,Math.PI,Math.PI*2])assert.equal(pulse(touchdown),1,'touchdown phase has full contact cue');
 assert.ok(pulse(.24)>.45&&pulse(.24)<.55,'cue fades smoothly away from touchdown');
 assert.equal(pulse(Math.PI/2),0,'mid-stride has no contact cue');
 for(const phase of [-100,-Math.PI,0,.1,Math.PI/2,Math.PI,10*Math.PI])assert.ok(pulse(phase)>=0&&pulse(phase)<=1);
 assert.match(render,/const contact=runFootContactPulse\(runPhase\)/,'contact cue shares the articulated run phase');
 assert.doesNotMatch(render,/Math\.sin\(\(Number\(p\.anim\)\|\|0\)\*17/,'legacy free-running dust phase is removed');
});
