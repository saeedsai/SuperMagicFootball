'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const characterSource=fs.readFileSync('src/modules/characterart.js','utf8').replace(/export \{CHARACTER_ART\};?\s*$/,'');
const renderSource=fs.readFileSync('src/modules/render.js','utf8');
const CHARACTER_ART=vm.runInNewContext(characterSource+'\nCHARACTER_ART',{});

test('turn counter-lean is bounded, neutral at rest and mirrors across view sides',()=>{
 const lean=CHARACTER_ART.turnCounterLean;
 assert.equal(lean(0,1),0);
 assert.equal(lean(0,-1),0);
 for(const lag of [.05,.2,.48,.65,1,10]){
  assert.ok(Math.abs(lean(lag,1))<=.14);
  assert.ok(Math.abs(lean(lag,-1))<=.14);
  assert.ok(Math.abs(lean(-lag,1))<=.14);
  assert.equal(lean(lag,-1),-lean(lag,1),'opposite view signs mirror the local torso pivot');
  assert.equal(lean(-lag,1),-lean(lag,1),'opposite turn directions have opposite torso response');
 }
 assert.equal(lean(NaN,1),0);
 assert.equal(lean(Infinity,1),0);
 assert.equal(lean(-Infinity,-1),0);
});

test('renderer passes only eased facing lag to the existing connected upper-body pivot',()=>{
 assert.match(renderSource,/CHARACTER_ART\.draw\(ctx,p,av,team,view,\{[^}]*\bturnLag\b/);
 assert.match(characterSource,/const turnLean=turnCounterLean\(opt\.turnLag,view\?\.side\)/);
 assert.match(characterSource,/if\(turnLean\)\{c\.translate\(0,-24\);c\.rotate\(turnLean\);c\.translate\(0,24\)\}/);
 assert.match(renderSource,/const pose=ARTPOSE\.easeHeading\(previous,target,this\.frameDelta\|\|1\/60\)/);
 assert.match(renderSource,/if\(turnLag\)ctx\.rotate\(Math\.max\(-\.095,Math\.min\(\.095,turnLag\*\.12\)\)\)/);
});
