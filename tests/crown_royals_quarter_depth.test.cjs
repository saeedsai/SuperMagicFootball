'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync('src/modules/crownroyals.js','utf8');
test('Alex Leo and Kwame have authored quarter projections; Diego remains a placeholder',()=>{
 assert.match(src,/quarterViews:'Reference-painted fallback active; mismatched SVG quarter art disabled'/);
 for(const name of ['alex','leo','kwame']){
  const svg=fs.readFileSync('assets/crown_royals/'+name+'_quarter_views.svg','utf8');
  assert.match(svg,/width="96" height="90"/);
  assert.doesNotMatch(svg,/<rect\b|<image\b|background\s*:/i);
  assert.match(svg,/data-(?:view|orientation)="quarterBack|data-orientation="rear-facing"/);
 }
 assert.match(src,/const sprite=authoredQuarter\?quarter\.image/);
 assert.match(src,/paintedViews:3/);
 assert.doesNotMatch(src,/function quarterSprite\(/);
});
