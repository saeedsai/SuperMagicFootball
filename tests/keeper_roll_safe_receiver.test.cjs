'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ai=fs.readFileSync('src/modules/ai.js','utf8');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const helperStart=ai.indexOf('function keeperOutletLane(');
const helperEnd=ai.indexOf('function keeperShotReadY(',helperStart);
assert.ok(helperStart>=0&&helperEnd>helperStart);
const laneFor=vm.runInNewContext('(function(){'+ai.slice(helperStart,helperEnd)+';return keeperOutletLane;})()', {});
const start=source.indexOf('function keeperOutletScore(');
const end=source.indexOf('class GameEngine{',start);
assert.ok(start>=0&&end>start);
const score=vm.runInNewContext('(function(distance){'+source.slice(start,end)+'return keeperOutletScore;})',{})((a,b)=>Math.hypot(a.x-b.x,a.y-b.y));
const keeper={x:0,y:0,t:0,keeper:true},near={x:180,y:0},far={x:310,y:0};
const lane=(receiver,defenders)=>laneFor(keeper,receiver,defenders,480);
test('keeper roll chooses safer outlet when nearest receiver is tightly marked',()=>{
 const defenders=[{x:180,y:110,t:1,stun:0,z:0}];
 const nearLane=lane(near,defenders),farLane=lane(far,defenders);
 assert.equal(nearLane.clear,false);
 assert.equal(farLane.clear,true);
 assert.ok(score(keeper,far,farLane)<score(keeper,near,nearLane));
});
test('keeper roll retains closest outlet when no defender is present',()=>{
 assert.ok(score(keeper,near,lane(near,[]))<score(keeper,far,lane(far,[])));
});
test('rollout filters downed and knocked-down receivers while keeping clear-lane fallback',()=>{
 const section=source.slice(source.indexOf(' rollKeeper(p){'),source.indexOf('\n command(p,a)',source.indexOf(' rollKeeper(p){')));
 assert.match(section,/\.filter\(v=>v\.safe\.clear&&!v\.q\.down&&\(v\.q\.shotImpactKnockdownTimer\|\|0\)<=0\)/);
 assert.match(section,/keeperOutletScore\(p,a\.landing,a\.safe\)/);
 assert.match(section,/if\(!receiver\)return false/);
 assert.match(section,/this\.ball\.passTarget=receiver\.src\.id/);
 assert.match(section,/this\.keeperPassingLane\(p,landing,480,0\)/);
});
