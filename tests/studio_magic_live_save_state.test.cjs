'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const match=src.match(/function studioMagicSaveState\(choice,equipped,eligible\)\{[\s\S]*?\n\}/);
assert.ok(match,'actual Magic Trick save-state helper exists');
const state=vm.runInNewContext(match[0]+';studioMagicSaveState');
test('STUDIO-MAGIC-LIVE-STATE-01: unchanged choices report no save needed',()=>{
 for(const [choice,equipped] of [['keep',null],['keep','banana'],['none',null],['banana','banana']]){
  const result=state(choice,equipped,true);
  assert.equal(result.disabled,true);
  assert.equal(result.unchanged,true);
  assert.match(result.message,/No Magic Trick change to save/);
 }
});
test('STUDIO-MAGIC-LIVE-STATE-01: locked previews explain the 91+ requirement',()=>{
 const result=state('teleport','banana',false);
 assert.equal(result.disabled,true);
 assert.equal(result.locked,true);
 assert.match(result.message,/locked.*91\+/i);
});
test('STUDIO-MAGIC-LIVE-STATE-01: valid changes remain actionable',()=>{
 for(const [choice,equipped,eligible] of [['banana',null,true],['none','banana',false],['ice','banana',true]]){
  const result=state(choice,equipped,eligible);
  assert.equal(result.disabled,false);
  assert.match(result.message,/ready to save/);
 }
});
test('Magic Trick live status is accessible, refreshed on selection and read-only',()=>{
 const studio=src.slice(src.indexOf('function showPlayerStudio('),src.indexOf('function getAppearance(){'));
 assert.match(studio,/id="studioMagicSaveState" role="status" aria-live="polite"/);
 assert.match(studio,/studioMagicSaveState\(select\.value,current,studioMagicEligible\(player\)\)/);
 assert.match(studio,/hint=\$\('studioMagicSaveState'\)/);
 assert.match(studio,/hint\.textContent=state\.message/);
 assert.match(studio,/save\.disabled=state\.disabled/);
 assert.match(studio,/save\.setAttribute\('aria-disabled',String\(state\.disabled\)\)/);
 assert.doesNotMatch(match[0],/localStorage|saveCareer|storeCharacterChanges/);
});
