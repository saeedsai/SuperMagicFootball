'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const aiData=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8')).aiLevels;
const start=engine.indexOf(' reactToTeleportTrick(p,dt,reactionSeconds){');
const end=engine.indexOf('\n reactToSupernova(',start);
assert.ok(start>=0&&end>start,'extract real Teleport CPU reaction helper');
const react=vm.runInNewContext('({'+engine.slice(start,end)+'})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 norm:(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d}}
}).reactToTeleportTrick;
function fixture(side,hold=.35,{ahead=80,across=0,nearest=true,trick='teleport'}={}){
 const carrier={t:1-side,keeper:false,src:{magicTrick:trick},x:300,y:240,face:side===0?-1:1,dx:side===0?-1:1,dy:0,dribbleHold:hold};
 const forward=carrier.dx,target={t:side,keeper:false,src:{},x:carrier.x+forward*ahead,y:carrier.y+across,z:0,stun:0,cd:0,action:'idle',actionTimer:0};
 const other={t:side,keeper:false,src:{},x:carrier.x+forward*(nearest?ahead+100:Math.max(1,ahead-15)),y:carrier.y+(nearest?160:0),z:0,stun:0,cd:0,action:'idle',actionTimer:0};
 const g={ball:{owner:carrier},players:[carrier,target,other],slides:0,tackle(p,slide){if(!slide)return false;this.slides++;p.action='slide';p.actionTimer=.48;p.slideTimer=.4;p.cd=.68;return true}};
 return {g,carrier,target,other};
}

test('nearest lane CPU times the existing grounded slide to Teleport at 30/60/120Hz on both sides',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(const level of [1,2,3,4]){
  const {g,carrier,target}=fixture(side),dt=1/fps,reaction=aiData[level].reaction;
  let elapsed=.35,startedAt=null;
  while(elapsed<1&&!g.slides){carrier.dribbleHold=elapsed;react.call(g,target,dt,reaction);elapsed=Math.min(1,elapsed+dt);if(g.slides)startedAt=elapsed-dt;}
  assert.equal(g.slides,1,`${aiData[level].name} team ${side} ${fps}Hz should counter before the cast`);
  assert.equal(target.action,'slide');assert.ok(target.actionTimer>0);
  assert.ok(startedAt>=.88-dt&&startedAt<1,`slide starts near the existing cast, not early: ${startedAt}`);
 }
});

test('Rookie stays too slow, and rear/wide/distant/wrong-trick or non-nearest defenders do not slide',()=>{
 for(const side of [0,1]){
  const slow=fixture(side),dt=1/60;let elapsed=.35;
  while(elapsed<1&&!slow.g.slides){slow.carrier.dribbleHold=elapsed;react.call(slow.g,slow.target,dt,aiData[0].reaction);elapsed=Math.min(1,elapsed+dt);}
  assert.equal(slow.g.slides,0);
  for(const options of [{ahead:-30},{ahead:60,across:42},{ahead:140},{nearest:false},{trick:'scream'}]){
   const bad=fixture(side,.7,options);react.call(bad.g,bad.target,.01,.09);assert.equal(bad.g.slides,0,JSON.stringify(options));
  }
 }
});

test('active slide is preserved and AI dispatch uses only the existing tackle action',()=>{
 const {g,target}=fixture(0,.7);target.action='slide';target.actionTimer=.25;
 assert.equal(react.call(g,target,.04,.09),false);assert.equal(g.slides,0);assert.equal(target.actionTimer,.25);
 assert.match(engine,/if\(this\.reactToTeleportTrick\(p,dt,ai\.reaction\)\|\|p\.aiTeleportThreat\)return/);
 assert.match(engine,/this\.tackle\(p,true\)/);
});
