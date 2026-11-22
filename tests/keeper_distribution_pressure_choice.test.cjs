'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ai=fs.readFileSync('src/modules/ai.js','utf8');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const helperStart=ai.indexOf('function keeperOutletLane('),helperEnd=ai.indexOf('function keeperShotReadY(',helperStart);
assert.ok(helperStart>=0&&helperEnd>helperStart,'production keeper outlet lane exists');
const keeperOutletLane=vm.runInNewContext('(function(){'+ai.slice(helperStart,helperEnd)+';return keeperOutletLane;})()', {});
const readyStart=engine.indexOf('function keeperDistributionReceiverReady('),readyEnd=engine.indexOf('\nfunction keeperOutletScore(',readyStart);
assert.ok(readyStart>=0&&readyEnd>readyStart,'production receiver readiness helper exists');
const keeperDistributionReceiverReady=vm.runInNewContext('(function(){'+engine.slice(readyStart,readyEnd)+';return keeperDistributionReceiverReady;})()', {});
const scoreStart=engine.indexOf('function keeperOutletScore('),scoreEnd=engine.indexOf('\n}',scoreStart)+2;
assert.ok(scoreStart>=0&&scoreEnd>scoreStart,'production outlet score exists');
const keeperOutletScore=vm.runInNewContext('('+engine.slice(scoreStart,scoreEnd)+')',{distance});
const passStart=engine.indexOf('\n keeperPassingLane(p,q,'),passEnd=engine.indexOf('\n keeperClearanceTarget(',passStart);
assert.ok(passStart>=0&&passEnd>passStart,'production keeper lane method exists');
const keeperPassingLane=vm.runInNewContext('({'+engine.slice(passStart,passEnd)+'\n})',{keeperOutletLane}).keeperPassingLane;
const distStart=engine.indexOf('\n distributeKeeper(p,mode='),distEnd=engine.indexOf('\n\n // DRIBBLE while',distStart);
assert.ok(distStart>=0&&distEnd>distStart,'production distribution method exists');
const distributeKeeper=vm.runInNewContext('({'+engine.slice(distStart,distEnd)+'})',
 {distance,clamp,stat:()=>74,keeperOutletScore,keeperDistributionReceiverReady}).distributeKeeper;
function fixture(team,offset){
 const dir=team===0?1:-1;
 const keeper={t:team,keeper:true,x:team===0?216:2344.8,y:765,z:0,stun:0,down:false,
  action:'idle',actionTimer:0,cd:0,keeperHold:.3,src:{id:'keeper-'+team,name:'Keeper'}};
 const receiver={t:team,keeper:false,x:keeper.x+dir*430,y:keeper.y,z:0,stun:0,down:false,
  action:'idle',actionTimer:0,moveVX:0,moveVY:0,shotImpactKnockdownTimer:0,
  src:{id:'outlet-'+team,name:'Outlet'}};
 const opponent={t:1-team,keeper:false,x:keeper.x+dir*offset.x,y:keeper.y+offset.y,z:0,
  stun:0,down:false,action:'idle',actionTimer:0,moveVX:offset.vx||0,moveVY:offset.vy||0,
  src:{id:'marker-'+team,name:'Marker'}};
 const game={players:[keeper,receiver,opponent],ball:{owner:keeper},release:null,event:null,keeperPassingLane,
  keeperClearanceTarget(p){return {x:p.x+dir*900,y:p.y,receiver:null};},
  freeBall(p,dx,dy,speed,opts){this.release={dx,dy,speed,opts};this.ball.owner=null;this.ball.pass=!!opts.pass;},
  emit(type,data){this.event={type,...data};}};
 game.distributeKeeper=distributeKeeper;
 return {game,keeper,receiver,opponent,get release(){return game.release;},get event(){return game.event;}};
}
for(const team of [0,1]){
 test('team '+team+' keeps a safe short outlet under moderate off-lane pressure',()=>{
  const f=fixture(team,{x:60,y:250}),lane=f.game.keeperPassingLane(f.keeper,f.receiver,390+74*1.2);
  assert.equal(lane.clear,true,JSON.stringify(lane));
  assert.ok(distance(f.keeper,f.opponent)<330&&distance(f.keeper,f.opponent)>155);
  assert.equal(f.game.distributeKeeper(f.keeper,'auto'),true);
  assert.equal(f.event.mode,'short');assert.equal(f.event.pressured,true);
  assert.equal(f.event.target,f.receiver.src.name);
  assert.equal(f.release.opts.z,46);assert.equal(f.release.opts.vz,45);assert.equal(f.release.opts.power,6);
 });
 test('team '+team+' still clears long under immediate pressure or a blocked short lane',()=>{
  const immediate=fixture(team,{x:0,y:150}),immediateLane=immediate.game.keeperPassingLane(immediate.keeper,immediate.receiver,390+74*1.2);
  assert.equal(immediateLane.clear,true);
  assert.equal(immediate.game.distributeKeeper(immediate.keeper,'auto'),true);
  assert.equal(immediate.event.mode,'long');assert.equal(immediate.release.opts.z,36);assert.equal(immediate.release.opts.vz,315);
  const blocked=fixture(team,{x:215,y:12}),blockedLane=blocked.game.keeperPassingLane(blocked.keeper,blocked.receiver,390+74*1.2);
  assert.equal(blockedLane.clear,false);
  assert.equal(blocked.game.distributeKeeper(blocked.keeper,'auto'),true);
  assert.equal(blocked.event.mode,'long');assert.equal(blocked.release.opts.z,36);assert.equal(blocked.release.opts.vz,315);
 });
}
