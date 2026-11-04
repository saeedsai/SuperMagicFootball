'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const aiData=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8')).aiLevels;
const start=engine.indexOf(' reactToFireballTrick(p,dt,reactionSeconds){');
const end=engine.indexOf('\n reactToSpinSandTrick(',start);
assert.ok(start>=0&&end>start,'extract the real burst-trick CPU reaction helper');
const react=vm.runInNewContext('({'+engine.slice(start,end)+'})',{distance:(a,b)=>Math.hypot(a.x-b.x)})
 .reactToFireballTrick;

function fixture(side,{distance=80,nearest=true,trick='freeze'}={}){
 const carrier={t:1-side,keeper:false,src:{magicTrick:trick},x:300,y:240,dribbleHold:.35};
 const target={t:side,keeper:false,src:{},x:carrier.x+distance,y:carrier.y,z:0,stun:0,action:'idle',actionTimer:0};
 const other={t:side,keeper:false,src:{},x:carrier.x+(nearest?220:distance-15),y:carrier.y+(nearest?160:0),z:0,stun:0,action:'idle',actionTimer:0};
 const game={ball:{owner:carrier},players:[carrier,target,other],jumps:0,
  jump(p){this.jumps++;p.z=22;p.action='jump';p.actionTimer=.5;return true;}};
 return {game,carrier,target};
}

test('CPU defenders jump the warned Freeze cast across difficulty, sides and simulation rates',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(let level=1;level<aiData.length;level++){
  const {game,carrier,target}=fixture(side),dt=1/fps,reaction=aiData[level].reaction;
  let elapsed=.35,jumpedAt=null;
  while(elapsed<1){elapsed=Math.min(1,elapsed+dt);carrier.dribbleHold=elapsed;
   react.call(game,target,dt,reaction);if(game.jumps){jumpedAt=elapsed;break;}}
  assert.ok(jumpedAt!==null&&jumpedAt<1,`${aiData[level].name}, team ${side}, ${fps}Hz should jump before Freeze casts`);
  assert.equal(target.action,'jump');assert.ok(target.z>=20,'the jump reaches Freeze’s established airborne counter height');
 }
});

test('Freeze reaction is limited to the nearest in-range target and leaves a live slide alone',()=>{
 for(const side of [0,1]){
  for(const options of [{distance:96},{distance:80,nearest:false},{trick:'banana'}]){
   const state=fixture(side,options);react.call(state.game,state.target,.02,.09);assert.equal(state.game.jumps,0,JSON.stringify(options));
  }
  const sliding=fixture(side);sliding.target.action='slide';sliding.target.actionTimer=.3;
  react.call(sliding.game,sliding.target,.02,.09);assert.equal(sliding.game.jumps,0);assert.equal(sliding.target.actionTimer,.3);
 }
});

test('the existing CPU dispatch covers Freeze through the held Fireball counter path; human counters remain unchanged',()=>{
 assert.match(engine,/if\(this\.reactToFireballTrick\(p,dt,ai\.reaction\)\|\|p\.aiFireballThreat\)return/);
 const trick=engine.slice(engine.indexOf('tryMagicTrick(p){'),engine.indexOf('updateSpinBumpFx(',engine.indexOf('tryMagicTrick(p){')));
 assert.match(trick,/freezeDodged=id==='freeze'&&inRange[\s\S]*?rival\.z>=20/);
 assert.match(trick,/freezeParried=id==='freeze'&&inRange&&rival\.action==='slide'/);
});
