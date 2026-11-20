'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf(' rollKeeper(p){');
const end=source.indexOf('\n command(p,a)',start);
assert.ok(start>=0&&end>start,'rollKeeper must exist');
const roll=source.slice(start,end);
const mapStart=roll.indexOf('.map(q=>{');
const mapEnd=roll.indexOf('   // Rollouts are deliberate',mapStart);
assert.ok(mapStart>=0&&mapEnd>mapStart,'rollout selection must predict landing');
const mapper=vm.runInNewContext('(function(p,keeperPassingLane,q){const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));return [q]'+roll.slice(mapStart,mapEnd).trim()+'[0];})');
test('moving outlet safety is evaluated at led landing point',()=>{
 const seen=[];
 const p={x:0,y:0};
 const q={x:300,y:100,moveVX:100,moveVY:-50};
 const v=mapper(p,(keeper,target)=>{seen.push(target);return {clear:target.x<320&&target.y>90};},q);
 assert.equal(seen[0].x,314);assert.equal(seen[0].y,93);
 assert.equal(v.safe.clear,true);
});
test('unsafe led landing is rejected even if original receiver position was safe',()=>{
 const q={x:300,y:100,moveVX:300,moveVY:0};
 const v=mapper({x:0,y:0},(p,target)=>({clear:target.x<325}),q);
 assert.equal(v.landing.x,335);assert.equal(v.safe.clear,false);
});
test('invalid movement retains current position for lane assessment',()=>{
 const q={x:300,y:100,moveVX:NaN,moveVY:Infinity};
 const v=mapper({x:0,y:0},(p,target)=>({clear:target.x===300&&target.y===100}),q);
 assert.equal(v.safe.clear,true);
});
