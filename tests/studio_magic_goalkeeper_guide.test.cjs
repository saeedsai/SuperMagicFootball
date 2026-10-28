'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
test('STUDIO-GK-HELP-01 goalkeeper eligibility preview never suggests equipping',()=>{
 const match=src.match(/function studioMagicEligibilityGuide\(player\)\{[\s\S]*?\n\}/);
 assert.ok(match,'eligibility guide exists');
 const guide=vm.runInNewContext(match[0]+';studioMagicEligibilityGuide',{studioMagicEligible:()=>false});
 const message=guide({role:'GK',rating:99,magicTrick:'banana'});
 assert.match(message,/Goalkeepers cannot equip Magic Tricks/);
 assert.match(message,/no Trick can be saved/);
 assert.doesNotMatch(message,/You may keep or remove/);
 assert.match(guide({role:'MF',magicTrick:'banana'}),/keep or remove/);
});
