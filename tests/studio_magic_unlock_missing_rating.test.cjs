'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
test('STUDIO-TRICK-PROGRESS-02 distinguishes missing legacy rating from zero',()=>{
 const fn=src.match(/function studioMagicUnlockProgress\(player\)\{[\s\S]*?\n\}/);
 assert.ok(fn);
 const guide=vm.runInNewContext(fn[0]+';studioMagicUnlockProgress',{playerOVR:p=>p.ovr});
 assert.match(guide({role:'MF',rating:null,ovr:88}),/Rating unknown/);
 assert.match(guide({role:'MF',rating:'',ovr:88}),/Rating unknown/);
 assert.match(guide({role:'MF',rating:91,ovr:80}),/unlocked/);
 assert.match(guide({role:'MF',rating:80,ovr:91}),/unlocked/);
 assert.match(guide({role:'GK',rating:99,ovr:99}),/unavailable/);
});
