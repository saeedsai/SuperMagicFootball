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
const keeper={x:0,y:0},near={x:180,y:0},far={x:310,y:0};
test('keeper roll chooses safer outlet when nearest receiver is tightly marked',()=>{
 assert.ok(score(keeper,far,[{x:182,y:5,stun:0,z:0}])<score(keeper,near,[{x:182,y:5,stun:0,z:0}]));
});
test('keeper roll retains closest outlet when no defender is present',()=>{
 assert.ok(score(keeper,near,[])<score(keeper,far,[]));
});
test('rollout filters downed and knocked-down receivers while keeping clear-lane fallback',()=>{
 const section=source.slice(source.indexOf(' rollKeeper(p){'),source.indexOf('\n command(p,a)',source.indexOf(' rollKeeper(p){')));
 assert.match(section,/\.filter\(v=>v\.safe\.clear&&!v\.q\.down&&\(v\.q\.shotImpactKnockdownTimer\|\|0\)<=0\)/);
 assert.match(section,/keeperOutletScore\(p,a\.landing,rolloutOpponents\)/);
 assert.match(section,/if\(!receiver\)return false/);
 assert.match(section,/this\.ball\.passTarget=receiver\.src\.id/);
});
