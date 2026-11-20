'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf('function keeperOutletScore(');
const end=source.indexOf('class GameEngine{',start);
assert.ok(start>=0&&end>start);
const score=vm.runInNewContext('(function(distance){'+source.slice(start,end)+'return keeperOutletScore;})',{})((a,b)=>Math.hypot(a.x-b.x,a.y-b.y));
const keeper={x:0,y:0},near={x:200,y:0},far={x:320,y:0};
test('keeper favors a safer short outlet over a marked nearest teammate',()=>{
 const defenders=[{x:205,y:5,stun:0,z:0}];
 assert.ok(score(keeper,far,defenders)<score(keeper,near,defenders));
});
test('without pressure keeper prefers nearest clear outlet',()=>{
 assert.ok(score(keeper,near,[])<score(keeper,far,[]));
});
test('downed, stunned and high-airborne opponents do not pressure reception',()=>{
 for(const q of [{x:205,y:5,stun:1},{x:205,y:5,down:true},{x:205,y:5,z:40}]){
  assert.equal(score(keeper,near,[q]),200);
 }
});
test('long clearance fallback and safe lane requirement are retained',()=>{
 assert.match(source,/shortOptions=scored\.filter\(v=>v\.safe\.clear/);
 assert.match(source,/const long=!shortAllowed/);
 assert.match(source,/keeperClearanceTarget\(p,scored,opponents\)/);
});
