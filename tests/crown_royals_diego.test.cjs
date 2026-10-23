'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('Diego has a unique three-view PNG and independent runtime/render references',()=>{
 const buf=fs.readFileSync('assets/crown_royals/diego_three_views.png');
 assert.equal(buf.subarray(1,4).toString(),'PNG');assert.equal(buf.readUInt32BE(16),132);assert.equal(buf.readUInt32BE(20),90);
 for(const other of ['alex','leo','kwame'])assert.ok(!buf.equals(fs.readFileSync('assets/crown_royals/'+other+'_three_views.png')));
 for(const path of ['src/modules/ui.js','src/modules/crownroyals.js'])assert.match(fs.readFileSync(path,'utf8'),/crown_royals_reference_diego/);
 assert.match(fs.readFileSync('scripts/build.py','utf8'),/CROWN_ROYALS_DIEGO_INLINE/);
 assert.match(fs.readFileSync('sw.js','utf8'),/diego_three_views\.png/);
 assert.match(fs.readFileSync('diego-visual-qa.html','utf8'),/Diego #4/);
});
