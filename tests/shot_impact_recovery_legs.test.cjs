'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/modules/characterart.js','utf8').replace(/export \{CHARACTER_ART\};?\s*$/,'');
const CHARACTER_ART=vm.runInNewContext(source+'\nCHARACTER_ART',{});

test('shot get-up plants one knee under the hips while the far leg remains extended',()=>{
 const brace=CHARACTER_ART.shotRecoveryBrace;
 assert.equal(brace('shotDown',.2),0);
 assert.equal(brace('idle',.12),0);
 assert.equal(brace('shotGetUp',.24),0);
 assert.ok(brace('shotGetUp',.12)>.99,'midpoint drives a clear planted-knee pose');
 assert.equal(brace('shotGetUp',0),0,'legs settle as the player stands');
 for(const timer of [-1,0,.03,.06,.12,.18,.21,.24,1]){
  const phase=brace('shotGetUp',timer);
  assert.ok(Number.isFinite(phase)&&phase>=0&&phase<=1);
  assert.equal(phase,brace('shotGetUp',timer),'phase remains deterministic');
 }
});

test('recovery knee tuck is near-leg biased and leaves the stand gait intact',()=>{
 const source=fs.readFileSync('src/modules/characterart.js','utf8');
 assert.match(source,/const recoveryBrace=shotRecoveryBrace\(p\.action,p\.actionTimer\)/);
 assert.match(source,/const plantedLeg=sign===1\?recoveryBrace:recoveryBrace\*\.14/);
 assert.match(source,/thighX\+travel\*\.48-sign\*10\*plantedLeg/);
 assert.match(source,/thighX\+travel-sign\*18\*plantedLeg/);
 assert.match(source,/const gait=run\*\(sign===1\?1:-1\)/);
});

test('launched-player pose flails one leg and tucks the far leg on the existing impact pulse',()=>{
 const source=fs.readFileSync('src/modules/characterart.js','utf8');
 const leg=source.slice(source.indexOf('function drawLeg('),source.indexOf('function shotRecoveryBrace('));
 assert.match(leg,/const launch=clamp\(Number\(opt\.shotLaunchPose\?\.armSpread\)\|\|0,0,1\)/);
 assert.match(leg,/const launchKick=launch\*\(sign===1\?1:-\.55\),launchFold=launch\*\(sign===1\?\.22:\.72\)/);
 assert.match(leg,/launchKick\*17/,'near and far boots react asymmetrically to launch');
 assert.match(leg,/launchFold\*11/,'far boot tucks while the near leg extends');
 assert.match(source,/shotLaunchPose/,'launch pose is passed from the renderer into character art');
});
