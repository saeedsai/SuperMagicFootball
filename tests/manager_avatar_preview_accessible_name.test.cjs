'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('src/modules/ui.js','utf8');

test('custom portrait accessible name identifies manager versus player context',()=>{
 const canvas=source.match(/<canvas id="customPortrait"[^>]*>/)?.[0];
 assert.ok(canvas,'custom portrait canvas exists');
 assert.match(canvas,/role="img"/);
 assert.match(canvas,/aria-label="\$\{studioManagerContext\?'Rotatable manager preview':'Rotatable player preview'\}"/,
  'screen readers should not announce the Career manager portrait as a player');
});
