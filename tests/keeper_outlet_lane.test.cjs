'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ai=fs.readFileSync('src/modules/ai.js','utf8');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const start=ai.indexOf('function keeperOutletLane(');
const end=ai.indexOf('function keeperShotReadY(',start);
assert.ok(start>=0&&end>start,'locate production keeper outlet helper');
const helper=vm.runInNewContext('(function(){'+ai.slice(start,end)+';return keeperOutletLane;})()', {});
const keeper=(x=0,y=0)=>({t:0,x,y,keeper:true});
const rival=(x,y,extra={})=>({t:1,x,y,stun:0,z:0,down:false,...extra});
const target={x:500,y:0};

test('keeper rejects a short outlet when a defender is closing into the flight corridor',()=>{
 const result=helper(keeper(),target,[rival(250,115,{moveVY:-220})],480);
 assert.equal(result.clear,false);
 assert.ok(result.interception<95);
});

test('keeper retains an outlet when the nearest defender is moving away from its corridor',()=>{
 const result=helper(keeper(),target,[rival(250,110,{moveVY:220})],480);
 assert.equal(result.clear,true);
 assert.ok(result.interception>95);
 assert.ok(result.endpoint>145);
});

test('receiver movement is included in the predicted arrival pocket',()=>{
 const result=helper(keeper(),{x:500,y:0,moveVY:300},[rival(500,180)],480);
 assert.equal(result.clear,false);
 assert.ok(result.endpoint<145);
});

test('a faster long clearance can pass a corridor that is unsafe for a slower short throw',()=>{
 const defender=[rival(480,190,{moveVY:-70})];
 const short=helper(keeper(),target,defender,480);
 const long=helper(keeper(),target,defender,950);
 assert.equal(short.clear,false);
 assert.equal(long.clear,true);
 assert.ok(long.flightSeconds<short.flightSeconds);
});

test('moving-defender safety mirrors for the opposite goal',()=>{
 const left=helper(keeper(0,0),target,[rival(250,115,{moveVY:-220})],480);
 const right=helper(keeper(2400,0),{x:1900,y:0},[
  rival(2150,115,{t:0,moveVY:-220})
 ],480);
 assert.equal(left.clear,false);
 assert.equal(right.clear,false);
 assert.ok(Math.abs(left.interception-right.interception)<1e-9);
});

test('stunned, downed, knocked-down and high-airborne opponents cannot block an outlet',()=>{
 const inactive=[
  rival(250,0,{stun:1}),rival(250,0,{down:true}),
  rival(250,0,{shotImpactKnockdownTimer:.2}),rival(250,0,{z:40})
 ];
 const result=helper(keeper(),target,inactive,480);
 assert.equal(result.clear,true);
 assert.equal(result.endpoint,Infinity);
 assert.equal(result.interception,Infinity);
});

test('legacy velocity fields remain supported when move velocity is absent',()=>{
 const result=helper(keeper(),target,[rival(250,115,{vy:-220})],480);
 assert.equal(result.clear,false);
 assert.ok(result.interception<95);
});

test('invalid keeper or target coordinates fail closed',()=>{
 assert.equal(helper(null,target,[],480).clear,false);
 assert.equal(helper(keeper(),{x:NaN,y:0},[],480).clear,false);
});

test('the real engine uses projected lane safety for short, long and rollout distribution',()=>{
 assert.ok(engine.includes('return keeperOutletLane(p,q,opponents,flightSpeed)'));
 assert.ok(engine.includes("const flightSpeed=mode==='long'||pressured?950:480;"));
 assert.ok(engine.includes('this.keeperPassingLane(p,{x,y},950)'));
 assert.ok(engine.includes('keeperOutletScore(p,a.q,a.safe)-keeperOutletScore(p,b.q,b.safe)'));
});
