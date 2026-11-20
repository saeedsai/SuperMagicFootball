'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf(' reactToWindMudTrick(p,dt,reactionSeconds){');
const end=source.indexOf('\n resolveMaceSweep(',start);
assert.ok(start>=0&&end>start,'Wind/Mud reaction method exists');
const react=vm.runInNewContext('({'+source.slice(start,end)+'})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)
}).reactToWindMudTrick;
function setup(){
 const carrier={t:1,keeper:false,src:{magicTrick:'wind'},x:0,y:0,dribbleHold:.5};
 const make=(x)=>({t:0,keeper:false,src:{},x,y:0,z:0,face:1,stun:0,action:'idle',actionTimer:0});
 const near=make(12),second=make(24),third=make(35);
 const game={ball:{owner:carrier},players:[carrier,near,second,third],jumps:[],
  jump(p){this.jumps.push(p);p.z=22;p.action='jump';p.actionTimer=.28;return true;}};
 return {game,carrier,near,second,third};
}
test('second defender can independently read the Wind/Mud wind-up',()=>{
 for(const trick of ['wind','mud']){
  const s=setup();s.carrier.src.magicTrick=trick;
  assert.equal(react.call(s.game,s.second,0,0),true);
  assert.deepEqual(s.game.jumps,[s.second]);
  assert.equal(s.second.action,'jump');
 }
});
test('third defender is excluded from the bounded two-defender AI response',()=>{
 const s=setup();assert.equal(react.call(s.game,s.third,0,0),false);
 assert.equal(s.game.jumps.length,0);
});
test('out-of-range and wrong-trick carriers do not trigger a defensive jump',()=>{
 const far=setup();far.second.x=121;
 assert.equal(react.call(far.game,far.second,0,0),false);
 const wrong=setup();wrong.carrier.src.magicTrick='banana';
 assert.equal(react.call(wrong.game,wrong.second,0,0),false);
 assert.equal(wrong.game.jumps.length,0);
});
test('a defender clearly facing away cannot read a Wind/Mud wind-up behind them',()=>{
 const s=setup();s.second.x=35;s.second.face=1;
 assert.equal(react.call(s.game,s.second,0,0),false);
 assert.equal(s.game.jumps.length,0);
});
