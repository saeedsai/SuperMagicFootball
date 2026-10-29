'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const moduleInput=fs.readFileSync(path.join(root,'src/modules/input.js'),'utf8');
const section=css.slice(css.lastIndexOf('/* VIZ-01:'));
test('VIZ-01 match controls retain exactly Pass Shoot Dribble Jump',()=>{
 const match=html.match(/<div id="touchButtons"[^>]*>(.*?)<\/div>/s);
 assert.ok(match,'match touch controls exist');
 const acts=[...match[1].matchAll(/<button\s+data-act="([^"]+)"/g)].map(m=>m[1]).sort();
 assert.deepEqual(acts,['dribble','jump','pass','shoot']);
 assert.match(html,/id="joyZone"/);
 assert.match(moduleInput,/bindTouch\(\)/);
});
test('VIZ-01 four-button arcade colors, accessible focus and active states',()=>{
 assert.ok(section,'VIZ-01 CSS exists');
 for(const action of ['jump','pass','shoot','dribble'])
   assert.match(section,new RegExp('#touchButtons \\.round\\.'+action+'\\{background:linear-gradient'));
 assert.match(section,/#touchButtons \.round:focus-visible/);
 assert.match(section,/#touchButtons \.round\.active/);
 assert.match(section,/#joyStick\{/);
 assert.match(section,/#joyKnob\{/);
});
test('VIZ-01 preserves safe-area, compact touch viewports and reduced motion',()=>{
 assert.match(section,/safe-area-inset-right/);
 assert.match(section,/safe-area-inset-bottom/);
 assert.match(section,/@media \(max-width:650px\),\(max-height:460px\)/);
 assert.match(section,/@media \(max-width:370px\) and \(orientation:portrait\)/);
 assert.match(section,/@media \(prefers-reduced-motion:reduce\)/);
 assert.match(css,/#touchButtons \.jump\{grid-column:2;grid-row:1\}/);
 assert.match(css,/#touchButtons \.pass\{grid-column:1;grid-row:2\}/);
 assert.match(css,/#touchButtons \.shoot\{grid-column:3;grid-row:2\}/);
 assert.match(css,/#touchButtons \.dribble\{grid-column:2;grid-row:3/);
});
