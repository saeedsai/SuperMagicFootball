'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/modules/artpose.js','utf8').replace(/export \{ARTPOSE\};?\s*$/,'');
const ARTPOSE=vm.runInNewContext(source+'\nARTPOSE',{});

test('shot-down holds, then get-up eases through a braced push to standing',()=>{
 const start=ARTPOSE.shotImpactRecoveryPose('shotGetUp',.24,1);
 const push=ARTPOSE.shotImpactRecoveryPose('shotGetUp',.12,1);
 const stand=ARTPOSE.shotImpactRecoveryPose('shotGetUp',0,1);
 assert.deepEqual({...start},{progress:0,support:0,angle:1.32,lift:0});
 assert.ok(push.progress>.49&&push.progress<.51);
 assert.ok(push.support>.99,'arms brace at the middle of the push-up');
 assert.ok(push.angle>0&&push.angle<start.angle,'torso unrolls toward upright');
 assert.equal(push.lift,5,'torso rises gradually off the turf');
 assert.deepEqual({...stand},{progress:1,support:0,angle:0,lift:10});
 assert.deepEqual({...ARTPOSE.shotImpactRecoveryPose('shotDown',.1,1)},{progress:0,support:0,angle:0,lift:0});
});

test('get-up is deterministic, clamped, and mirrors tilt without changing lift',()=>{
 for(const timer of [-1,0,.06,.12,.18,.24,1]){
  const left=ARTPOSE.shotImpactRecoveryPose('shotGetUp',timer,-1);
  const right=ARTPOSE.shotImpactRecoveryPose('shotGetUp',timer,1);
  assert.deepEqual({...left},{...ARTPOSE.shotImpactRecoveryPose('shotGetUp',timer,-1)});
  assert.equal(left.progress,right.progress);assert.equal(left.support,right.support);assert.equal(left.lift,right.lift);
  assert.ok(Math.abs(left.angle)<=1.32&&Math.abs(right.angle)<=1.32);
  assert.ok(left.progress>=0&&left.progress<=1&&left.support>=0&&left.support<=1&&left.lift>=0&&left.lift<=10);
 }
});
