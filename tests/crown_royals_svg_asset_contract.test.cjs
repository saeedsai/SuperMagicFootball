'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const player of ['alex','leo','kwame']){
 test(`Crown Royals ${player} quarter atlas has transparent, bounded authored frames`,()=>{
  const svg=fs.readFileSync(path.join(root,'assets','crown_royals',player+'_quarter_views.svg'),'utf8');
  assert.match(svg,/<svg\b[^>]*\bwidth="96"[^>]*\bheight="90"[^>]*\bviewBox="0 0 96 90"/);
  assert.doesNotMatch(svg,/<(?:rect|image|foreignObject|pattern)\b/i,'no opaque sheet or embedded backdrop');
  assert.doesNotMatch(svg,/\b(?:href|xlink:href)\s*=\s*["'](?:https?:|data:)/i,'no remote/embedded backdrop');
  assert.match(svg,/<g\s+transform="translate\(0 0\)"[^>]*>/);
  assert.match(svg,/<g\s+transform="translate\(48 0\)"[^>]*data-view="quarterBack"[^>]*data-orientation="rear-facing"/);
  assert.ok((svg.match(/<path\b/g)||[]).length>=10,'both poses need independent visible shapes');
  const groups=[...svg.matchAll(/<g\\s+transform="translate\\((0|48) 0\\)"[^>]*>([\\s\\S]*?)<\\/g>/g)];
  assert.equal(groups.length,2,'exactly two authored 48-pixel quarter frames');
  for(const [,offset,body] of groups){
   assert.ok((body.match(/<path\\b/g)||[]).length>=5,`quarter frame ${offset} needs distinct body geometry`);
  }
  assert.doesNotMatch(svg,/<(?:script|style)\b/i,'static-only vector sprites');
 });
}
