'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
const start=ui.indexOf('const STUDIO_MAGIC_TRICK_GUIDES=');
const end=ui.indexOf('function studioMagicEligibilityGuide(',start);
assert.ok(start>=0&&end>start,'use actual shipped Magic Trick preview implementation');
const guide=vm.runInNewContext('(()=>{'+ui.slice(start,end)+';return studioMagicGuide;})()',{});

test('STUDIO-TRICK-PREVIEW-02 locked players can read move and counter without equip instructions',()=>{
 const locked=guide('banana',null,false);
 assert.match(locked,/^Locked preview:/);
 assert.match(locked,/peel behind the carrier/);
 assert.match(locked,/SHOOT-slide can clear it/);
 assert.match(locked,/hold DRIBBLE for 1 second/);
 assert.match(locked,/Reach Star or Superstar \(91\+\) to equip/);
 assert.doesNotMatch(locked,/Press SAVE TRICK SELECTION/);
 const eligible=guide('banana',null,true);
 assert.match(eligible,/^Preview only:/);
 assert.match(eligible,/Press SAVE TRICK SELECTION/);
});

test('locked preview does not remove legacy keep and remove semantics',()=>{
 assert.match(guide('keep','ice',false),/^Equipped Trick:/);
 assert.match(guide('keep','ice',false),/KEEP CURRENT leaves the player unchanged/);
 assert.match(guide('none','ice',false),/stays active until SAVE TRICK SELECTION/);
 assert.match(guide('keep',null,false),/No Magic Trick equipped/);
 assert.match(guide('none',null,false),/No Magic Trick is equipped/);
});

test('all eight tricks are discoverable but locked save remains disabled and validated',()=>{
 assert.match(ui,/STUDIO_MAGIC_TRICKS\.map\(a=>`<option value=/);
 assert.doesNotMatch(ui,/\(studioMagicEligible\(player\)\?STUDIO_MAGIC_TRICKS:\[\]\)/);
 assert.match(ui,/id="studioMagicSaveRow"/);
 assert.match(ui,/const locked=!eligible&&choice!=='keep'&&choice!=='none'/);
 assert.match(ui,/save\.disabled=state\.disabled/);
 assert.match(ui,/save\.setAttribute\('aria-disabled',String\(state\.disabled\)\)/);
 assert.match(ui,/if\(id!=='keep'&&id!=='none'&&!studioMagicEligible\(player\)\)throw Error/);
 assert.match(ui,/if\(id==='keep'\|\|\(id==='none'&&!player\.magicTrick\)\|\|id===player\.magicTrick\)\{showPlayerStudio\(avatarIndex\);return;\}/);
});
