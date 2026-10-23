'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/ability-icons.js'),'utf8')
 .replace('export {ABILITY_ICONS};','globalThis.ABILITY_ICONS=ABILITY_ICONS;');
const context={};
vm.runInNewContext(source,context);
const icons=context.ABILITY_ICONS;
test('every Super Shot has a deterministic, uniquely shaped ball',()=>{
 const ids=Object.keys(icons.SHOT_ICONS);
 assert.equal(ids.length,23);
 const shapes=ids.map(id=>{
  const html=icons.icon('shot',id,id);
  assert.match(html,new RegExp('data-shot-shape="'+id+'"'));
  assert.match(html,/role="img"/);
  assert.equal(html,icons.icon('shot',id,id),'stable across redraws');
  const shape=html.match(/data-shot-shape="[^"]+" d="([^"]+)"/);
  assert.ok(shape,'visible authored shape for '+id);
  return shape[1];
 });
 assert.equal(new Set(shapes).size,ids.length,'no two Super Shots share the same ball silhouette');
});
test('ability icons escape labels, keep non-shot styles and missing selection accessible',()=>{
 const html=icons.icon('shot','ninja','<img src=x onerror=alert(1)>');
 assert.ok(html.includes('&lt;img'));
 assert.ok(!html.includes('<img'));
 assert.match(icons.icon('trick','banana'),/abilityGlyph-trick/);
 assert.match(icons.icon('defence','drill'),/abilityGlyph-defence/);
 assert.match(icons.icon('dribble','rainbow'),/abilityGlyph-dribble/);
 assert.match(icons.icon('shot','not-real'),/Not equipped/);
});
