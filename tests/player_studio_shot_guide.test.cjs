'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('function studioShotPreviewGuide(');
const end=source.indexOf('// Read-only Super Defence tier preview:',start);
assert.ok(start>=0&&end>start,'Super Shot guide must be present in actual Studio UI');
const guideSource=source.slice(start,end);
const guide=vm.runInNewContext('(()=>{'+guideSource+';return studioShotPreviewGuide})()',{
 SHOTS:{zigzag:{name:'Zigzag'},meteor:{name:'Meteor'}}
});

test('Super Shot preview describes current equipped shot and selected level',()=>{
 assert.match(guide('keep','zigzag',4),/Level 4: Zigzag/);
 assert.match(guide('keep','zigzag',4),/Current selection retained/);
});
test('Super Shot preview describes removal without applying it',()=>{
 assert.match(guide('none','zigzag',3),/removed only after SAVE SUPER SHOT/);
});
test('Super Shot preview describes a different selected move without saving',()=>{
 assert.match(guide('meteor',null,5),/Level 5: Meteor.*Preview selection only/);
});
test('Super Shot preview tolerates empty and legacy unknown abilities',()=>{
 assert.match(guide('keep',null,0),/Level 1: No equipped Super Shot/);
 assert.match(guide('keep','legacyShot',2),/Previously equipped Super Shot/);
});
test('Super Shot guide is read-only and rendered as an accessible live status',()=>{
 assert.doesNotMatch(guideSource,/localStorage|saveCareer|storeCharacterChanges|edits\s*=/);
 const studio=source.slice(source.indexOf('function showPlayerStudio('),source.indexOf('function getAppearance()'));
 assert.match(studio,/id="studioShotGuide" role="status" aria-live="polite"/);
 assert.match(studio,/studioShotPreviewGuide\('keep'/);
});
test('shot selection and tier both refresh the live guide and existing icon',()=>{
 const studio=source.slice(source.indexOf('function showPlayerStudio('),source.indexOf('function getAppearance()'));
 assert.match(studio,/if\(category==='shot'\).*studioShotPreviewGuide\(select\.value/);
 assert.match(studio,/shotTierSelect\.addEventListener\('change',\(\)=>previewUpdates\.studioShotAbility\?\.\(\)\)/);
 assert.match(studio,/target\.innerHTML=ABILITY_ICONS\.icon\(category,chosen\)/);
 assert.match(source,/function saveStudioShot\(\)/);
});
