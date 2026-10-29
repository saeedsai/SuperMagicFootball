'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const match=src.match(/function studioAppearanceSaveState\(previous,appearance\)\{[\s\S]*?\n\}/);
assert.ok(match,'real Studio appearance state helper exists');
const state=vm.runInNewContext(match[0]+';studioAppearanceSaveState');
const a={skin:'#f1c8a5',hair:'#332211',style:1,face:2,eyes:3,brows:0,eyeColor:1,nose:2,lips:1,body:2,stature:0,exaggeration:1,beard:0,accessory:1,freckles:0,scar:0,tattoo:0};
test('STUDIO-APPEARANCE-STATE-01: complete unchanged selection disables save',()=>{
 const result=state({...a},{...a});assert.equal(result.disabled,true);assert.match(result.message,/already saved/);
});
test('STUDIO-APPEARANCE-STATE-01: edits, missing and legacy fields remain savable',()=>{
 for(const p of [{...a,face:4},{skin:a.skin,hair:a.hair},{...a,obsolete:'old'},null,[]]){
  const result=state(p,a);assert.equal(result.disabled,false);assert.match(result.message,/ready to save/);
 }
});
test('STUDIO-APPEARANCE-STATE-01: strict field equality prevents coercion',()=>{
 assert.equal(state({...a,face:'2'},a).disabled,false);
 assert.equal(state({...a,face:2},a).disabled,true);
});
test('Studio save-state hint and accessible button respond to appearance inputs',()=>{
 assert.match(src,/id="studioAppearanceSaveState" role="status" aria-live="polite"/);
 assert.match(src,/const saveState=studioAppearanceSaveState\(p\.appearance,appearance\)/);
 assert.match(src,/saveButton\.disabled=saveState\.disabled/);
 assert.match(src,/saveButton\.setAttribute\('aria-disabled',String\(saveState\.disabled\)\)/);
 assert.match(src,/saveHint\.textContent=saveState\.message/);
 assert.match(src,/e\.target\.id\?\.startsWith\('face_'\)/);
});
