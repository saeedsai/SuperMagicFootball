'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
test('STUDIO-TRICK-PROGRESS-02 distinguishes missing legacy rating from zero',()=>{
 const fn=src.match(/function studioMagicUnlockProgress\(player\)\{[\s\S]*?\n\}/);
 assert.ok(fn);
 const guide=vm.runInNewContext(fn[0]+';studioMagicUnlockProgress',{playerOVR:p=>p.ovr,verifiedRatingTierForPlayer:p=>p?.verifiedTier??null});
 assert.match(guide({role:'MF',rating:null,ovr:88}),/No verified canonical Gold tier/);
 assert.match(guide({role:'MF',rating:'',ovr:88}),/No verified canonical Gold tier/);
 assert.match(guide({role:'MF',rating:99,ovr:99}),/No verified canonical Gold tier/);
 assert.match(guide({role:'MF',rating:99,ovr:99,verifiedTier:'Gold'}),/Gold.*available/);
 assert.match(guide({role:'GK',rating:99,ovr:99}),/unavailable/);
 assert.match(guide({role:'GK',rating:99,ovr:99}),/unavailable/);
});
