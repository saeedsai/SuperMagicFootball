'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync('src/modules/crownroyals.js','utf8');
test('unapproved quarter composites are not shipped as finished authored views',()=>{
 assert.match(src,/quarterViews:'nearest-view placeholders'/);
 assert.match(src,/paintedViews:3/);
 assert.doesNotMatch(src,/function quarterSprite\(/);
});
