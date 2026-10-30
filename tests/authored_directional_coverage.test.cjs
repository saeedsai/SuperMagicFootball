'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/directional_animation.js','utf8').replace(/^export \{[^\n]+\};?\s*$/m,'');
const context=vm.createContext({});
vm.runInContext(source+'\nthis.coverage=authoredDirectionalCoverage;this.headings=HEADINGS;',context);
const coverage=context.coverage;
test('all eight independently authored idle views are required',()=>{
 const complete=new Set(Array.from(context.headings,heading=>`idle/${heading}/0`));
 const report=coverage(complete,{actions:['idle']});
 assert.equal(report.present,8);assert.equal(report.required,8);
 assert.equal(report.complete,true);assert.deepEqual(Array.from(report.missing),[]);
 assert.equal(Object.isFrozen(report),true);
 assert.equal(Object.isFrozen(report.byAction.idle),true);
});
test('a mirrored view does not count as independently authored art',()=>{
 const report=coverage(new Set(['run/E/0','idle/S/0']),{actions:['run'],frames:1});
 assert.equal(report.present,1);assert.equal(report.required,8);
 assert.equal(report.complete,false);
 assert.ok(report.missing.includes('run/W/0'));
 assert.ok(!report.missing.includes('run/E/0'));
});
test('every action frame and heading must exist for complete motion',()=>{
 const frames=new Set(Array.from(context.headings).flatMap(h=>[0,1,2,3].map(i=>`kick/${h}/${i}`)));
 assert.equal(coverage(frames,{actions:['kick'],frames:4}).complete,true);
 frames.delete('kick/NW/3');
 const partial=coverage(frames,{actions:['kick'],frames:4});
 assert.equal(partial.present,31);assert.equal(partial.required,32);
 assert.deepEqual(Array.from(partial.missing),['kick/NW/3']);
});
test('Map false entries, inherited object keys and missing catalogs are not authored',()=>{
 const map=new Map([['slide/W/0',true],['slide/E/0',false]]);
 assert.equal(coverage(map,{actions:['slide'],frames:1}).present,1);
 const inherited=Object.create({'idle/E/0':true});
 assert.equal(coverage(inherited,{actions:['idle']}).present,0);
 assert.equal(coverage(null,{actions:['idle']}).missing.length,8);
});
test('invalid action names cannot become art path keys and frame count is bounded',()=>{
 const report=coverage(new Set(['../escape/S/0']),{actions:['../escape','idle','idle'],frames:999});
 assert.equal(report.required,8);assert.equal(report.present,0);
 assert.equal(coverage(new Set(),{actions:[]}).complete,false);
 assert.equal(coverage(new Set(),{actions:['run'],frames:-1}).required,32);
});
test('cross-realm catalogs are counted consistently without mutating them',()=>{
 const vmSet=vm.runInContext("new Set(['keeper/N/0'])",context);
 const vmMap=vm.runInContext("new Map([['keeper/N/0', {src:'north'}]])",context);
 for(const catalog of [vmSet,vmMap,new Set(['keeper/N/0']),new Map([['keeper/N/0',{src:'north'}]])]){
  const report=coverage(catalog,{actions:['keeper'],frames:1});
  assert.equal(report.present,1);
  assert.equal(report.byAction.keeper.required,8);
  assert.equal(Object.isFrozen(report.missing),true);
 }
});
