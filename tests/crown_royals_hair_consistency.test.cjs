'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const art=fs.readFileSync('src/modules/crownroyals.js','utf8');
test('Alex side and Leo headband corrections are applied to the shared painted atlas',()=>{
 assert.match(art,/function correctedAtlas\(image,name\)/);
 assert.match(art,/name==='alex'&&x>=96&&y<30/);
 assert.match(art,/name==='leo'&&y>=13&&y<=21/);
 assert.match(art,/atlas\.painted\|\|atlas\.image/g);
 assert.equal((art.match(/atlas\.painted\|\|atlas\.image/g)||[]).length,3);
 assert.match(art,/hairCorrected/);
});
test('hair corrections do not mutate old Concept Hero or roster metadata',()=>{
 assert.doesNotMatch(art,/CONCEPT_HERO\.draw/);
 assert.match(art,/crown_royals_reference_alex/);
 assert.match(art,/crown_royals_reference_leo/);
});
