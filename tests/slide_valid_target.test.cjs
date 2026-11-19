'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const begin=source.indexOf('  const canSlideTarget=q=>');
const end=source.indexOf('  // Prefer a ball carrier',begin);
assert.ok(begin>0&&end>begin,'production tackle selection found');
const select=(slide,players,ballOwner)=>vm.runInNewContext(
 '(function(slide,players,ball){const p={t:0};'+source.slice(begin,end).replace('const near=this.players.filter','const near=players.filter').replaceAll('this.ball.owner','ball.owner')+'return {near,owner};})',
 {})(slide,players,{owner:ballOwner});
test('slide ignores high airborne and downed opponents while retaining grounded targets',()=>{
 const high={t:1,z:42,action:'jump'},down={t:1,z:0,action:'shotDown'};
 const rising={t:1,z:0,action:'shotGetUp'},ground={t:1,z:0,action:'run'};
 const r=select(true,[high,down,rising,ground],high);
 assert.equal(r.near.length,1);assert.equal(r.near[0],ground);
 assert.equal(r.owner,null);
 assert.equal(select(true,[ground],ground).owner,ground);
});
test('ordinary standing tackle keeps existing selection and null owner',()=>{
 const high={t:1,z:42,action:'jump'},down={t:1,z:0,action:'shotDown'};
 const r=select(false,[high,down],high);
 assert.equal(r.near.length,2);assert.equal(r.owner,high);
 assert.equal(select(true,[],null).owner,null);
});
