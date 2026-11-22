'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ai=fs.readFileSync('src/modules/ai.js','utf8');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const helperStart=ai.indexOf('function keeperOutletLane(');
const helperEnd=ai.indexOf('function keeperShotReadY(',helperStart);
assert.ok(helperStart>=0&&helperEnd>helperStart,'production keeper outlet helper exists');
const laneFor=vm.runInNewContext('(function(){'+ai.slice(helperStart,helperEnd)+';return keeperOutletLane;})()', {});
const start=engine.indexOf('function keeperOutletScore(');
const end=engine.indexOf('class GameEngine{',start);
assert.ok(start>=0&&end>start);
const score=vm.runInNewContext('(function(distance){'+engine.slice(start,end)+'return keeperOutletScore;})',{})((a,b)=>Math.hypot(a.x-b.x,a.y-b.y));
const keeper={x:0,y:0,t:0,keeper:true},near={x:180,y:0},far={x:310,y:0};
const lane=(receiver,defenders)=>laneFor(keeper,receiver,defenders,480);
test('keeper favors a clear farther outlet over a shorter outlet under endpoint pressure',()=>{
 const defenders=[{x:180,y:110,t:1,stun:0,z:0}];
 const nearLane=lane(near,defenders),farLane=lane(far,defenders);
 assert.equal(nearLane.clear,false);
 assert.equal(farLane.clear,true);
 assert.ok(score(keeper,far,farLane)<score(keeper,near,nearLane));
});
test('without pressure keeper prefers nearest clear outlet',()=>{
 assert.ok(score(keeper,near,lane(near,[]))<score(keeper,far,lane(far,[])));
});
test('downed, stunned and high-airborne opponents do not pressure reception',()=>{
 for(const q of [{x:205,y:5,stun:1},{x:205,y:5,down:true},{x:205,y:5,z:40}]){
  const safe=lane(near,[q]);
  assert.equal(safe.pressure,0);
  assert.equal(safe.interception,Infinity);
  assert.equal(score(keeper,near,safe),180);
 }
});
test('a marginally clear flight corridor is ranked below a wider safe corridor',()=>{
 const receiver={x:360,y:0};
 const marginal=lane(receiver,[{x:180,y:110,t:1,stun:0,z:0}]);
 const open=lane(receiver,[{x:180,y:260,t:1,stun:0,z:0}]);
 assert.equal(marginal.clear,true);
 assert.equal(open.clear,true);
 assert.ok(marginal.interception<open.interception);
 assert.ok(score(keeper,receiver,marginal)>score(keeper,receiver,open));
});
test('long clearance fallback and safe lane requirement are retained',()=>{
 assert.match(engine,/const shortSpeed=390\+quality\*1\.2/);
 assert.match(engine,/mates\.map\(q=>\(\{q,safe:this\.keeperPassingLane\(p,q,shortSpeed\)\}\)\)/);
 assert.match(engine,/const shortOptions=shortScored\.filter\(v=>v\.safe\.clear/);
 assert.match(engine,/const shortAllowed=mode!=='long'&&!immediatePressure&&shortOptions\.length>0/);
 assert.match(engine,/const long=!shortAllowed/);
 assert.match(engine,/keeperClearanceTarget\(p,scored,opponents\)/);
 assert.match(engine,/Math\.max\(0,170-interception\)\*\.65/);
});
