'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const aiData=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8')).aiLevels;
const start=engine.indexOf(' reactToFireballTrick(p,dt,reactionSeconds){');
const end=engine.indexOf('\n reactToSpinSandTrick(',start);
assert.ok(start>=0&&end>start,'extract real Fireball CPU reaction helper');
const react=vm.runInNewContext('({'+engine.slice(start,end)+'})',{distance:(a,b)=>Math.hypot(a.x-b.x)})
 .reactToFireballTrick;
function fixture(side,hold=.35,{distance=90,nearest=true,trick='fireball',cooldown=0}={}){
 const carrier={t:1-side,keeper:false,src:{magicTrick:trick},x:300,y:240,dribbleHold:hold};
 const target={t:side,keeper:false,src:{},x:carrier.x+distance,y:carrier.y,z:0,stun:0,cd:cooldown,action:'idle',actionTimer:0};
 const other={t:side,keeper:false,src:{},x:carrier.x+(nearest?220:distance-15),y:carrier.y+(nearest?160:0),z:0,stun:0,action:'idle',actionTimer:0};
 const g={ball:{owner:carrier},players:[carrier,target,other],jumps:0,slides:0,
  jump(p){this.jumps++;p.z=22;p.action='jump';p.actionTimer=.5;return true;},
  tackle(p,slide=false){if(p.cd>0)return false;this.slides++;p.cd=slide?.68:.57;p.action=slide?'slide':'punch';p.actionTimer=slide?.48:.4;return true;}
 };
 return {g,carrier,target,other};
}

test('nearest in-range CPU defender jumps before Fireball at 30/60/120Hz from both sides',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(const level of [1,2,3,4]){
  const {g,carrier,target}=fixture(side),dt=1/fps,reaction=aiData[level].reaction;
  let elapsed=0,jumpedAt=null;
  while(elapsed<1){elapsed=Math.min(1,elapsed+dt);carrier.dribbleHold=elapsed;
   react.call(g,target,dt,reaction);if(g.jumps){jumpedAt=elapsed;break;}}
  assert.ok(jumpedAt!==null&&jumpedAt<1,`${aiData[level].name} side ${side} ${fps}Hz should dodge before cast`);
  assert.equal(target.z,22);assert.equal(target.action,'jump');
 }
});

test('Rookie remains too slow; no response to wrong, unheld, out-of-range or non-target casts',()=>{
 for(const side of [0,1]){
  const slow=fixture(side);let elapsed=0,dt=1/60;
  while(elapsed<1){elapsed=Math.min(1,elapsed+dt);slow.carrier.dribbleHold=elapsed;react.call(slow.g,slow.target,dt,aiData[0].reaction);}
  assert.equal(slow.g.jumps,0);
  for(const options of [{distance:120},{distance:121},{nearest:false},{trick:'scream'}]){
   const bad=fixture(side,.7,options);react.call(bad.g,bad.target,.02,.09);assert.equal(bad.g.jumps,0,JSON.stringify(options));
  }
  const unheld=fixture(side,.2);react.call(unheld.g,unheld.target,.02,.09);assert.equal(unheld.g.jumps,0);
  const sliding=fixture(side,.7);sliding.target.action='slide';sliding.target.actionTimer=.3;
  react.call(sliding.g,sliding.target,.02,.09);assert.equal(sliding.g.jumps,0);assert.equal(sliding.target.actionTimer,.3);
 }
});

test('close CPU defenders time a grounded SHOOT-slide late against Fireball, Freeze and Bat',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(const trick of ['fireball','freeze','bat'])for(let level=1;level<aiData.length;level++){
  const {g,carrier,target}=fixture(side,.35,{distance:55,trick}),dt=1/fps,reaction=aiData[level].reaction;
  let elapsed=.35;
  while(elapsed<1&&!g.slides&&!g.jumps){
   elapsed=Math.min(1,elapsed+dt);carrier.dribbleHold=elapsed;
   react.call(g,target,dt,reaction);
  }
  assert.equal(g.slides,1,aiData[level].name+' '+trick+' side '+side+' '+fps+'Hz');
  assert.equal(g.jumps,0,'close counter uses SHOOT-slide rather than JUMP');
  assert.ok(elapsed>=.84&&elapsed<1,'slide starts in the final wind-up window');
  assert.equal(target.action,'slide');assert.ok(target.actionTimer>0);
 }
});
test('Rookie cannot time the close slide; unavailable slide cooldown falls back to JUMP',()=>{
 for(const side of [0,1]){
  const slow=fixture(side,.35,{distance:55});let elapsed=.35,dt=1/120;
  while(elapsed<1&&!slow.g.slides&&!slow.g.jumps){
   elapsed=Math.min(1,elapsed+dt);slow.carrier.dribbleHold=elapsed;
   react.call(slow.g,slow.target,dt,aiData[0].reaction);
  }
  assert.equal(slow.g.slides,0);assert.equal(slow.g.jumps,0,'Rookie reaction remains too slow');
  const cooling=fixture(side,.35,{distance:55,cooldown:.2});elapsed=.35;
  while(elapsed<1&&!cooling.g.slides&&!cooling.g.jumps){
   elapsed=Math.min(1,elapsed+dt);cooling.carrier.dribbleHold=elapsed;
   react.call(cooling.g,cooling.target,dt,aiData[4].reaction);
  }
  assert.equal(cooling.g.slides,0);assert.equal(cooling.g.jumps,1,'a cooldown-blocked slide uses the existing airborne counter');
 }
});
test('close-range slide timing does not expand to defenders outside the short counter window',()=>{
 const state=fixture(0,.35,{distance:65});
 react.call(state.g,state.target,.12,.09);
 assert.equal(state.g.slides,0);assert.equal(state.g.jumps,1);
});

test('Fireball AI JUMP dispatch preserves the existing human JUMP/slide counter contract',()=>{
 assert.match(engine,/if\(this\.reactToFireballTrick\(p,dt,ai\.reaction\)\|\|p\.aiFireballThreat\)return/);
 assert.match(engine,/jumpDodged=id==='fireball'&&inRange/);assert.match(engine,/fireballParried=id==='fireball'&&inRange&&rival\.action==='slide'/);
 assert.match(engine,/p\.magicReadyAt=this\.clock\+6/);
});
