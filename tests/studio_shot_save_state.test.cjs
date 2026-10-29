'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const match=src.match(/function studioShotSaveState\(choice,tier,player\)\{[\s\S]*?\n\}/);
assert.ok(match,'real Super Shot save-state helper exists');
const SHOTS={fire:{name:'Fire Strike'},banana:{name:'Banana Shot'}};
const state=vm.runInNewContext(match[0]+';studioShotSaveState',{SHOTS,studioEliteEligible:p=>p.rating>=91});
const fire={type:'shoot',id:'fire',name:'Fire Strike',level:3};
const player={role:'MF',rating:92,shot:'fire',shotName:'Fire Strike',superShotLevel:3,superAbility:fire};
test('STUDIO-SHOT-STATE-01: unchanged explicit equipment disables saving',()=>{
 for(const choice of ['keep','fire']){
  const result=state(choice,3,player);
  assert.equal(result.disabled,true);assert.equal(result.unchanged,true);
  assert.match(result.message,/already saved/);
 }
});
test('STUDIO-SHOT-STATE-01: legacy first-time level and tier changes remain savable',()=>{
 for(const p of [{...player,superShotLevel:undefined},{...player,superAbility:{...fire,level:2}}]){
  const result=state('keep',3,p);
  assert.equal(result.disabled,false);assert.match(result.message,/ready to save/);
 }
 assert.equal(state('keep',4,player).disabled,false);
});
test('STUDIO-SHOT-STATE-01: new shot and stale name remain savable',()=>{
 assert.equal(state('banana',3,player).disabled,false);
 assert.equal(state('fire',3,{...player,shotName:'Old name'}).disabled,false);
});
test('STUDIO-SHOT-STATE-01: removed shot is a no-op but legacy missing fields are savable',()=>{
 const removed={role:'FW',rating:92,shot:null,shotName:'',superShotLevel:3};
 assert.equal(state('none',3,removed).disabled,true);
 assert.equal(state('none',3,{role:'FW',rating:92}).disabled,false);
});
test('STUDIO-SHOT-STATE-01: invalid tier, shot, role and eligibility fail closed',()=>{
 for(const [choice,tier,p] of [['fire',0,player],['unknown',3,player],['fire',3,{...player,role:'GK'}],['fire',3,{role:'FW',rating:80}]]){
  const result=state(choice,tier,p);assert.equal(result.disabled,true);
  assert.equal(result.invalid,true);assert.match(result.message,/eligible Super Shot/);
 }
});
test('Super Shot save feedback is accessible and updates for shot and tier',()=>{
 const studio=src.slice(src.indexOf('function showPlayerStudio('),src.indexOf('function getAppearance()'));
 assert.match(studio,/id="studioShotSaveState" role="status" aria-live="polite"/);
 assert.match(studio,/studioShotSaveState\(select\.value,\$\('studioShotTier'\)\?\.value,player\)/);
 assert.match(studio,/save\.disabled=state\.disabled/);
 assert.match(studio,/save\.setAttribute\('aria-disabled',String\(state\.disabled\)\)/);
 assert.match(studio,/hint\.textContent=state\.message/);
 assert.match(studio,/shotTierSelect\.addEventListener\('change',\(\)=>previewUpdates\.studioShotAbility\?\.\(\)\)/);
 assert.doesNotMatch(match[0],/localStorage|storeCharacterChanges|saveCareer/);
});
