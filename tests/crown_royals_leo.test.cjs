'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Leo transparent reference atlas is distinct from Alex and wired to offline fixture',()=>{
 const leo=fs.readFileSync(path.join(root,'assets/crown_royals/leo_three_views.png'));
 const alex=fs.readFileSync(path.join(root,'assets/crown_royals/alex_three_views.png'));
 assert.equal(leo.subarray(1,4).toString(),'PNG');
 assert.equal(leo.readUInt32BE(16),132);assert.equal(leo.readUInt32BE(20),90);
 assert.ok(!leo.equals(alex));
 for(const [p,pattern] of [['src/modules/crownroyals.js',/crown_royals_reference_leo/],['scripts/build.py',/leo_three_views\.png/],['sw.js',/leo_three_views\.png/]]) assert.match(read(p),pattern);
});
test('Leo is independent and original Concept Royals remains in roster',()=>{
 const ui=read('src/modules/ui.js');
 assert.match(ui,/id:CONCEPT_DEMO_ID,index:TEAMS\.length,name:'Concept Royals FC'/);
 assert.match(ui,/crown_royals_reference_alex/);
 assert.match(ui,/crown_royals_reference_leo/);
 assert.match(ui,/i===9\|\|i===0/);
});
