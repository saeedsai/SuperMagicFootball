'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
const match=src.match(/function studioMagicSaveState\(choice,equipped,eligible\)\{[\s\S]*?\n\}/);
assert.ok(match,'Studio Magic save state helper exists');
const state=vm.runInNewContext(match[0]+';studioMagicSaveState');
test('STUDIO-MAGIC-SAVE-STATE-01 disables keep and no-op removal for eligible players',()=>{
 for(const equipped of [null,undefined,'banana']){
  assert.equal(state('keep',equipped,true).disabled,true);
 }
 assert.equal(state('none',null,true).disabled,true);
 assert.equal(state('none','banana',true).disabled,false);
 assert.equal(state('banana','banana',true).disabled,true);
 assert.equal(state('rainbow','banana',true).disabled,false);
});
test('STUDIO-MAGIC-SAVE-STATE-01 preserves locked previews and legacy removal',()=>{
 assert.equal(state('rainbow',null,false).locked,true);
 assert.equal(state('rainbow',null,false).disabled,true);
 assert.equal(state('none','banana',false).disabled,false);
 assert.equal(state('banana','banana',false).disabled,true);
 assert.equal(state('keep','banana',false).disabled,true);
});
test('Studio Magic UI mirrors disabled state to accessible button and explains why',()=>{
 assert.match(src,/const state=studioMagicSaveState\(select\.value,current,studioMagicEligible\(player\)\)/);
 assert.match(src,/save\.disabled=state\.disabled/);
 assert.match(src,/save\.setAttribute\('aria-disabled',String\(state\.disabled\)\)/);
 assert.match(src,/No Magic Trick change to save/);
 assert.match(src,/if\(id==='keep'\|\|\(id==='none'&&!player\.magicTrick\)\|\|id===player\.magicTrick\)/);
});
