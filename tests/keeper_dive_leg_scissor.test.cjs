'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/modules/characterart.js','utf8')
 .replace(/export \{CHARACTER_ART\};?\s*$/,'');
const CHARACTER_ART=vm.runInNewContext(source+'\nCHARACTER_ART',{});
const pose=CHARACTER_ART.keeperDiveLegPose;
const keys=['phase','travel','raise','tuck','extend','toePitch'];
const values=value=>Object.fromEntries(keys.map(key=>[key,Object.is(value[key],-0)?0:value[key]]));

test('keeper dive folds the lead knee while the far leg trails through the real dive phase',()=>{
 for(const action of ['keeperDive','keeperDiveCatch']){
  const startNear=pose(action,0,true,.6),startFar=pose(action,0,false,.6);
  assert.equal(startNear.phase,0);assert.equal(startFar.phase,0);
  const near=pose(action,.30,true,.3),far=pose(action,.30,false,.3);
  assert.equal(near.phase,.5);assert.equal(far.phase,.5);
  assert.ok(near.travel>0&&far.travel<0,'legs separate into a scissor instead of remaining a rigid pair');
  assert.ok(near.raise>far.raise,'lead knee lifts above the trailing boot');
  assert.ok(near.tuck>far.tuck,'lead knee folds more than the trailing leg');
  assert.ok(far.extend>near.extend,'far leg lengthens through the dive');
  assert.ok(near.toePitch<0&&far.toePitch>0,'boots flex in opposite directions');
  const fullNear=pose(action,.60,true),fullFar=pose(action,.60,false);
  assert.equal(fullNear.phase,1);assert.equal(fullFar.phase,1);
  assert.ok(fullNear.raise<=7.5&&fullFar.extend<=.68);
 }
});

test('keeper recovery begins at the exact dive terminal leg pose and eases back to neutral',()=>{
 for(const near of [false,true]){
  const terminal=values(pose('keeperDive',.60,near));
  const recoveryStart=values(pose('keeperRecover',0,near,.34));
  assert.deepEqual(recoveryStart,terminal);
  const recoveryMiddle=pose('keeperRecover',0,near,.17);
  assert.ok(recoveryMiddle.phase>.49&&recoveryMiddle.phase<.51);
  const rest=pose('keeperRecover',0,near,0);
  assert.deepEqual(values(rest),{phase:0,travel:0,raise:0,tuck:0,extend:0,toePitch:0});
 }
});

test('Super Defence uses its full dive scissor and malformed timing stays finite and bounded',()=>{
 const special=pose('keeperSuper',NaN,true,0);
 assert.equal(special.phase,1);
 for(const sample of [
  pose('keeperDive',NaN,true),pose('keeperDive',Infinity,false),
  pose('keeperDive',-1,true),pose('keeperDive',9,false),
  pose('keeperRecover',0,true,NaN),pose('keeperRecover',0,false,Infinity),
  pose('idle',.3,true,.34)
 ]){
  for(const key of keys)assert.ok(Number.isFinite(sample[key]),key+' must remain finite');
  assert.ok(sample.phase>=0&&sample.phase<=1);
  assert.ok(Math.abs(sample.travel)<=10&&sample.raise<=7.5);
  assert.ok(sample.tuck<=.48&&sample.extend<=.68&&Math.abs(sample.toePitch)<=.14);
 }
});

test('the actual character leg painter consumes the keeper-only pose without touching simulation state',()=>{
 assert.match(source,/const diveLeg=p\.keeper\?keeperDiveLegPose\(p\.action,p\.diveElapsed,near,p\.actionTimer\):null/);
 assert.match(source,/const travel=.*\+\(diveLeg\?\.travel\|\|0\)/);
 assert.match(source,/const raise=.*\+\(diveLeg\?\.raise\|\|0\)/);
 assert.match(source,/const toePitch=divePhase>0\?diveLeg\.toePitch/);
});
