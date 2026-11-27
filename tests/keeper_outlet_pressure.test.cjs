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
const score=vm.runInNewContext('(function(distance,stat,clamp){'+engine.slice(start,end)+'return keeperOutletScore;})',{})(
 (a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 (p,key)=>Number(p?.src?.[key]),
 (n,lo,hi)=>Math.max(lo,Math.min(hi,n))
);
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
test('keeper short outlet prefers live receiver input facing the incoming throw over stale facing',()=>{
 const safe={pressure:0,interception:Infinity};
 const toward={x:280,y:0,dx:-1,dy:0,face:1},away={x:280,y:0,dx:1,dy:0,face:-1};
 assert.ok(score(keeper,toward,safe)<score(keeper,away,safe));
});
test('neutral receiver input falls back to last facing while untracked targets stay neutral',()=>{
 const safe={pressure:0,interception:Infinity};
 const toward={x:280,y:0,dx:0,dy:0,face:-1},away={x:280,y:0,dx:0,dy:0,face:1};
 const noHeading={x:280,y:0},neutral={x:280,y:0,dx:0,dy:0};
 assert.ok(score(keeper,toward,safe)<score(keeper,away,safe));
 assert.equal(score(keeper,noHeading,safe),score(keeper,neutral,safe));
});
test('receiver facing preference cannot outweigh materially greater outlet pressure',()=>{
 const safe={pressure:0,interception:Infinity},pressured={pressure:60,interception:Infinity};
 const away={x:280,y:0,dx:1,dy:0,face:1},toward={x:280,y:0,dx:-1,dy:0,face:-1};
 assert.ok(score(keeper,away,safe)<score(keeper,toward,pressured));
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

test('short keeper outlets prefer stronger first-touch control when safety and facing tie',()=>{
 const safe={pressure:0,interception:Infinity};
 const low={x:280,y:0,dx:-1,dy:0,src:{dribbling:10,agility:10}};
 const high={x:280,y:0,dx:-1,dy:0,src:{dribbling:90,agility:90}};
 assert.ok(score(keeper,high,safe)<score(keeper,low,safe));
 assert.ok(Math.abs((score(keeper,low,safe)-score(keeper,high,safe))-12.8)<1e-9);
});
test('keeper control preference is capped and cannot outweigh materially greater lane pressure',()=>{
 const safe={pressure:0,interception:Infinity},pressured={pressure:17,interception:Infinity};
 const low={x:280,y:0,dx:-1,dy:0,src:{dribbling:1,agility:1}};
 const high={x:280,y:0,dx:-1,dy:0,src:{dribbling:100,agility:100}};
 const spread=score(keeper,low,safe)-score(keeper,high,safe);
 assert.ok(spread>15.8&&spread<=16);
 assert.ok(score(keeper,low,safe)<score(keeper,high,pressured));
});
test('point-only rollout targets retain a neutral control contribution',()=>{
 const safe={pressure:0,interception:Infinity};
 assert.equal(score(keeper,{x:280,y:0},safe),280);
});
const readinessStart=engine.indexOf('function keeperDistributionReceiverReady(');
const readinessEnd=engine.indexOf('function keeperOutletScore(',readinessStart);
assert.ok(readinessStart>=0&&readinessEnd>readinessStart,'production keeper receiver readiness helper exists');
const readiness=vm.runInNewContext('(function(){'+engine.slice(readinessStart,readinessEnd)+'return keeperDistributionReceiverReady;})()',{});
test('keeper distribution excludes teammates still settling a previous first touch',()=>{
 const receiver={keeper:false,down:false,stun:0,z:0,x:180,y:0,action:'idle',actionTimer:0};
 for(const timer of [undefined,null,0,-.01])assert.equal(readiness({...receiver,firstTouchControlTimer:timer}),true);
 for(const timer of [.001,.12,1,NaN,Infinity])assert.equal(readiness({...receiver,firstTouchControlTimer:timer}),false);
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
