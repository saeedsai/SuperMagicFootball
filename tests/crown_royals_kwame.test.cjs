'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('Kwame has third, independently painted source atlas',()=>{
 const image=fs.readFileSync('assets/crown_royals/kwame_three_views.png');
 assert.equal(image.subarray(1,4).toString(),'PNG');assert.equal(image.readUInt32BE(16),132);assert.equal(image.readUInt32BE(20),90);
 assert.ok(!image.equals(fs.readFileSync('assets/crown_royals/alex_three_views.png')));
 assert.ok(!image.equals(fs.readFileSync('assets/crown_royals/leo_three_views.png')));
 for(const p of ['src/modules/crownroyals.js','src/modules/ui.js'])assert.match(fs.readFileSync(p,'utf8'),/crown_royals_reference_kwame/);
 assert.match(fs.readFileSync('sw.js','utf8'),/kwame_three_views\.png/);
 assert.match(fs.readFileSync('scripts/build.py','utf8'),/CROWN_ROYALS_KWAME_INLINE/);
});
test('Kwame renderer preview uses his own identifier',()=>{
 const html=fs.readFileSync('kwame-visual-qa.html','utf8');
 assert.match(html,/Kwame #3/);assert.match(html,/crown_royals_reference_kwame/);
 assert.doesNotMatch(html,/crown_royals_reference_leo/);
});
