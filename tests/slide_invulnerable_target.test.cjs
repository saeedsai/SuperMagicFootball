'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf('  const canSlideTarget=q=>');
const end=source.indexOf('  // Prefer a ball carrier',start);
assert.ok(start>0&&end>start,'production slide target selector found');
const select=(slide,players,owner)=>vm.runInNewContext('(function(slide,players,ball){const p={t:0};'+source.slice(start,end).replace('const near=this.players.filter','const near=players.filter').replaceAll('this.ball.owner','ball.owner')+'return {near,owner};})',{})(slide,players,{owner});
test('slide ignores temporarily invulnerable opponent and favors available grounded carrier',()=>{
 const immune={t:1,z:0,action:'run',invuln:.7};
 const available={t:1,z:0,action:'run',invuln:0};
 const r=select(true,[immune,available],immune);
 assert.equal(r.near.length,1);assert.equal(r.near[0],available);assert.equal(r.owner,null);
 assert.equal(select(true,[available],available).owner,available);
});
test('ordinary PASS poke also skips a protected carrier; immunity expiry restores contact eligibility',()=>{
 const immune={t:1,z:0,action:'run',invuln:.7};
 assert.equal(select(false,[immune],immune).owner,null);
 assert.equal(select(false,[immune],immune).near.length,0);
 immune.invuln=0;
 assert.equal(select(false,[immune],immune).owner,immune);
 assert.equal(select(false,[immune],immune).near.length,1);
 assert.equal(select(true,[immune],immune).owner,immune);
 assert.equal(select(true,[immune],immune).near.length,1);
});
