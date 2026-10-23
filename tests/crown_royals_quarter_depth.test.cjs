'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync('src/modules/crownroyals.js','utf8');
test('quarter rendering is a separate cached two-plane projection for every reference sprite',()=>{
 assert.match(src,/function quarterSprite\(atlas,kind\)/);
 assert.match(src,/atlas\.quarters\[key\]=canvas/);
 assert.match(src,/g\.drawImage\(source,baseX,0,48,90,0,0,45,90\)/);
 assert.match(src,/g\.drawImage\(source,96,0,36,90,15,0,36,90\)/);
 assert.match(src,/source=projected\|\|atlas\.painted\|\|atlas\.image/);
 assert.match(src,/bespoke quarter art pending/);
 assert.doesNotMatch(src,/ctx\.scale\(\.86,1\)/);
});
