'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const hazards=fs.readFileSync(path.join(root,'src/modules/magic-hazards.js'),'utf8');
const begin=ui.indexOf('const STUDIO_MAGIC_TRICK_GUIDES=');
const end=ui.indexOf('function saveStudioMagic(){',begin);
assert.ok(begin>0&&end>begin,'guide helpers must be present before save action');
const guideSource=ui.slice(begin,end);
const {guide,eligibility}=new Function('studioEliteEligible',guideSource+';return {guide:studioMagicGuide,eligibility:studioMagicEligibilityGuide};')(p=>Number(p?.rating)>=90);

test('all eight equipable Tricks have distinct, truthful live descriptions',()=>{
 const ids=['banana','ice','bat','fireball','freeze','scream','hideBall','teleport'];
 const catalogue=ui.slice(ui.indexOf('const STUDIO_MAGIC_TRICKS='),begin);
 const descriptions=ids.map(id=>{
  assert.match(catalogue,new RegExp("id:'"+id+"'"));
  assert.match(engine,new RegExp("'"+id+"'"));
  const text=guide(id,null);
  assert.ok(text.length>65,id+' missing detailed effect');
  assert.match(text,/counter|clear/i,id+' missing defensive counterplay');
  return text;
 });
 assert.equal(new Set(descriptions).size,8);
});
test('KEEP CURRENT, REMOVE and unknown saved equipment are safe previews',()=>{
 assert.match(guide('keep','banana'),/Equipped Trick:/);
 assert.match(guide('banana',null),/Preview only:/);
 assert.match(guide('banana',null),/SAVE TRICK SELECTION/);
 assert.match(guide('none','banana'),/REMOVE selected/);
 assert.match(guide('none','banana'),/until SAVE TRICK SELECTION/);
 assert.match(guide('keep',null),/No Magic Trick equipped/);
 assert.match(guide('keep','legacyUnknown'),/Unknown saved Trick/);
 assert.match(guide('invalid',null),/Unknown saved Trick/);
});
test('non-elite Magic Trick selection explains locks without changing legacy equipment',()=>{
 assert.match(eligibility({rating:65,role:'MF'}),/locked.*elite/i);
 assert.match(eligibility({rating:65,role:'MF'}),/Dribble Styles/);
 assert.match(eligibility({rating:65,magicTrick:'banana'}),/preserved/);
 assert.match(eligibility({rating:95}),/Eligible/);
 assert.match(ui,/id="studioMagicEligibility"/);
 assert.match(ui,/escapeHTML\(studioMagicEligibilityGuide\(player\)\)/);
});
test('Studio uses an accessible, read-only live guide that follows icon changes',()=>{
 assert.match(ui,/id="studioMagicGuide" role="status" aria-live="polite"/);
 assert.match(ui,/escapeHTML\(studioMagicGuide\('keep',player\.magicTrick\)\)/);
 assert.match(ui,/select\.addEventListener\('change',update\)/);
 assert.match(ui,/guide\.textContent=studioMagicGuide\(select\.value,current\)/);
 assert.match(ui,/if\(id==='keep'\)\{showPlayerStudio\(avatarIndex\);return;\}/);
});
test('trap preview matches existing arming durations and SHOOT-slide disarm',()=>{
 assert.match(hazards,/BANANA_ARM_TIME=\.25/);
 assert.match(hazards,/ICE_ARM_TIME=\.3/);
 assert.match(hazards,/function disarmMagicHazards/);
 assert.match(guide('banana'),/0\.25 seconds/);
 assert.match(guide('ice'),/0\.30 seconds/);
 assert.match(guide('banana'),/SHOOT-slide/);
 assert.match(guide('ice'),/SHOOT-slide/);
});
