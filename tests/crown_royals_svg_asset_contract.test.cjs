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
  // Slice at the two top-level frame openings: nested SVG groups can close
  // before the outer frame, so a non-greedy <g>...</g> regex is incorrect.
  const front=svg.indexOf('transform="translate(0 0)"');
  const rear=svg.indexOf('transform="translate(48 0)"');
  assert.ok(front>=0&&rear>front,'separate front and rear frame groups');
  for(const [name,body] of [['front',svg.slice(front,rear)],['rear',svg.slice(rear)]]){
   assert.ok((body.match(/<path\b/g)||[]).length>=5,`${name} quarter frame needs visible body geometry`);
  }
  assert.doesNotMatch(svg,/<(?:script|style)\b/i,'static-only vector sprites');
 });
}
