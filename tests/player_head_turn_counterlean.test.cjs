'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/modules/characterart.js','utf8').replace(/export \{CHARACTER_ART\};?\s*$/,'');
const CHARACTER_ART=vm.runInNewContext(source+'\nCHARACTER_ART',{});

test('turning head counter-lean is neutral at rest, bounded, and mirrors across views',()=>{
 const lean=CHARACTER_ART.headTurnCounterLean;
 assert.equal(lean(0,1),0);
 assert.equal(lean(0,-1),0);
 for(const lag of [.05,.2,.48,.65,.68,1,10]){
  assert.ok(Math.abs(lean(lag,1))<=.095);
  assert.ok(Math.abs(lean(lag,-1))<=.095);
  assert.equal(lean(lag,-1),-lean(lag,1));
  assert.equal(lean(-lag,1),-lean(lag,1));
 }
 assert.equal(lean(NaN,1),0);
 assert.equal(lean(Infinity,1),0);
});

test('head turn response is applied only to the face pivot alongside the existing torso response',()=>{
 assert.match(source,/const headLean=headTurnCounterLean\(opt\.turnLag,view\?\.side\)/);
 assert.match(source,/face\(c,k,av,colors\.skin,colors\.hair,\{\.\.\.opt,headCounterLean:headLean/);
 assert.match(source,/if\(opt\.headCounterLean\)c\.rotate\(opt\.headCounterLean\)/);
 assert.match(source,/if\(turnLean\)\{c\.translate\(0,-24\);c\.rotate\(turnLean\);c\.translate\(0,24\)\}/);
});
