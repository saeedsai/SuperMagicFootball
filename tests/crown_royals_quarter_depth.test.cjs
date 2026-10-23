'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync('src/modules/crownroyals.js','utf8');
test('unapproved quarter composites are not shipped as finished authored views',()=>{
 assert.match(src,/quarterViews:'Alex authored; others nearest-view placeholders'/);
 const svg=fs.readFileSync('assets/crown_royals/alex_quarter_views.svg','utf8');
 assert.match(svg,/data-orientation="rear-facing"/);
 assert.match(svg,/width="96" height="90"/);
 assert.doesNotMatch(svg,/<rect\b|<image\b|background\s*:/i);
 assert.match(src,/const sprite=authoredQuarter\?quarterAlex\.image/);
 assert.match(src,/paintedViews:3/);
 assert.doesNotMatch(src,/function quarterSprite\(/);
});
