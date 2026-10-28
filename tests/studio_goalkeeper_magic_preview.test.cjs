'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
const begin=ui.indexOf('const STUDIO_MAGIC_TRICK_GUIDES=');
const end=ui.indexOf('function saveStudioMagic(){',begin);
assert.ok(begin>0&&end>begin,'read-only preview uses the shipped Magic Trick descriptions');
const preview=vm.runInNewContext('(()=>{'+ui.slice(begin,end)+';return studioGoalkeeperMagicGuide;})()',{});

test('STUDIO-GK-PREVIEW-01 all eight Tricks expose their effect and defensive counter',()=>{
 const ids=['banana','ice','bat','fireball','freeze','scream','hideBall','teleport'];
 const guides=ids.map(id=>{
  const message=preview(id);
  assert.match(message,/^Goalkeeper preview only:/,id);
  assert.match(message,/counter|clear/i,id);
  assert.match(message,/goalkeepers cannot equip it/i,id);
  assert.match(message,/hold DRIBBLE for 1 second/i,id);
  assert.doesNotMatch(message,/SAVE TRICK SELECTION|Reach Star|91\+/i,id);
  return message;
 });
 assert.equal(new Set(guides).size,8);
 assert.match(preview(''),/Choose any Magic Trick/);
 assert.match(preview('toString'),/Choose any Magic Trick/,'prototype names are never valid Tricks');
 assert.match(preview('__proto__'),/Choose any Magic Trick/);
});

test('goalkeeper Studio panel is preview-only with live icon and no save control',()=>{
 const start=ui.indexOf('const magicSelector=');
 const end=ui.indexOf("studioGallerySignature='';",start);
 assert.ok(start>=0&&end>start);
 const selector=ui.slice(start,end);
 const keeper=selector.slice(selector.indexOf('TRICK — READ-ONLY PREVIEW'));
 assert.match(keeper,/id="studioGKMagicPreview"/);
 assert.match(keeper,/STUDIO_MAGIC_TRICKS\.map\(a=>/);
 assert.match(keeper,/id="studioGKMagicGuide" role="status" aria-live="polite"/);
 assert.match(keeper,/studioGoalkeeperMagicGuide\(''\)/);
 assert.doesNotMatch(keeper,/SAVE TRICK SELECTION|saveStudioMagic|KEEP CURRENT|REMOVE MAGIC TRICK/);
 assert.match(ui,/keeperTrickPreview\.addEventListener\('change',updateKeeperTrickPreview\)/);
 assert.match(ui,/guide\.textContent=studioGoalkeeperMagicGuide\(selected\)/);
 assert.match(ui,/icon\.innerHTML=ABILITY_ICONS\.icon\('trick',selected\|\|null\)/);
 assert.match(ui,/if\(!player\|\|player\.role==='GK'\)throw Error/,'serverless save handler still rejects goalkeeper edits');
});
