'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const player of ['alex','leo']){
 test(`Crown Royals ${player} quarter atlas has transparent, bounded authored frames`,()=>{
  const svg=fs.readFileSync(path.join(root,'assets','crown_royals',player+'_quarter_views.svg'),'utf8');
  assert.match(svg,/<svg\b[^>]*\bwidth="96"[^>]*\bheight="90"[^>]*\bviewBox="0 0 96 90"/);
  assert.doesNotMatch(svg,/<(?:rect|image|foreignObject|pattern)\b/i,'no opaque sheet or embedded backdrop');
  assert.doesNotMatch(svg,/\b(?:href|xlink:href)\s*=\s*["'](?:https?:|data:)/i,'no remote/embedded backdrop');
  assert.match(svg,/<g\s+transform="translate\(0 0\)"/);
  assert.match(svg,/<g\s+transform="translate\(96 0\) scale\(-1 1\)"/);
  assert.ok((svg.match(/<path\b/g)||[]).length>=10,'both poses need independent visible shapes');
  assert.doesNotMatch(svg,/<(?:script|style)\b/i,'static-only vector sprites');
 });
}
