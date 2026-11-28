'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const aiLevels=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8')).aiLevels;
function methodSource(name){const start=engine.indexOf(`\n ${name}(`),tail=start<0?-1:engine.slice(start+1).search(/\n [A-Za-z_$][\w$]*\(/);assert.ok(start>=0&&tail>=0,`extract ${name}`);return engine.slice(start,start+1+tail);}
const react=vmMethod('reactToWindMudTrick');
function vmMethod(name){return require('node:vm').runInNewContext('({'+methodSource(name)+'})',{distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)})[name];}
function fixture(side,trick,hold=.35){
 const carrier={t:1-side,keeper:false,src:{magicTrick:trick},x:300,y:240,dribbleHold:hold};
 const target={t:side,keeper:false,src:{},x:side===0?350:250,y:240,z:0,face:side===0?-1:1,stun:0,action:'idle',actionTimer:0};
 const backup={t:side,keeper:false,src:{},x:side===0?360:240,y:240,z:0,face:side===0?-1:1,stun:0,action:'idle',actionTimer:0};
 const third={t:side,keeper:false,src:{},x:side===0?370:230,y:240,z:0,face:side===0?-1:1,stun:0,action:'idle',actionTimer:0};
 const g={ball:{owner:carrier},players:[carrier,target,backup,third],jumps:0,jump(p){this.jumps++;p.z=22;p.action='jump';p.actionTimer=.28;return true}};
 return{g,carrier,target,backup,third};
}
test('CPU counters Wind and Mud holds at difficulty timing for either team and 30/60/120Hz',()=>{
 for(const trick of ['wind','mud'])for(const side of [0,1])for(const fps of [30,60,120])for(const level of [1,2,3,4]){
  const {g,carrier,target,backup}=fixture(side,trick),dt=1/fps,reaction=aiLevels[level].reaction;
  let elapsed=0,jumpedAt=null;
  while(elapsed<1){elapsed=Math.min(1,elapsed+dt);carrier.dribbleHold=elapsed;react.call(g,target,dt,reaction);if(g.jumps){jumpedAt=elapsed;break;}}
  assert.ok(jumpedAt!==null&&jumpedAt<1,`${trick}, team ${side}, ${fps}Hz, ${aiLevels[level].name} should jump before cast`);
  assert.equal(target.action,'jump');assert.equal(backup.action,'idle','only selected nearest defender reacts');
 }
});
test('Rookie, out-of-range, wrong-trick, already-slowed Mud target, and active human counters are preserved',()=>{
 for(const trick of ['wind','mud'])for(const side of [0,1]){
  const rookie=fixture(side,trick);for(let i=0;i<60;i++){rookie.carrier.dribbleHold=(i+1)/60;react.call(rookie.g,rookie.target,1/60,aiLevels[0].reaction);}assert.equal(rookie.g.jumps,0,'Rookie does not get a pre-cast jump');
  const far=fixture(side,trick,.7);far.target.x=far.carrier.x+(trick==='wind'?120:100)*(side===0?1:-1);react.call(far.g,far.target,.02,.09);assert.equal(far.g.jumps,0,'strict radius edge is outside');
  const wrong=fixture(side,trick,.7);wrong.carrier.src.magicTrick='banana';react.call(wrong.g,wrong.target,.02,.09);assert.equal(wrong.g.jumps,0);
  if(trick==='mud'){const slowed=fixture(side,trick,.7);slowed.target.mudSlowTimer=.2;react.call(slowed.g,slowed.target,.02,.09);assert.equal(slowed.g.jumps,0);}
  for(const state of [{action:'slide',actionTimer:.2,z:0},{action:'jump',actionTimer:.2,z:22}]){const counter=fixture(side,trick,.7);Object.assign(counter.target,state);react.call(counter.g,counter.target,.02,.09);assert.equal(counter.g.jumps,0);}
 }
});
test('Wind/Mud AI counter runs before ordinary tactics and matches the shared four-button counter rules',()=>{
 assert.match(engine,/this\.reactToWindMudTrick\(p,dt,ai\.reaction\)\|\|p\.aiWindMudThreat/);
 const trick=methodSource('tryMagicTrick');assert.match(trick,/fieldTrickSlid=fieldTrick&&rivals\.some\(q=>distance\(p,q\)<radius&&q\.action==='slide'/);assert.match(trick,/fieldTrickJumped=fieldTrick&&rivals\.some\(q=>distance\(p,q\)<radius&&q\.action==='jump'/);
});


test('Wind/Mud promotes the nearest ready defender who can read the live wind-up',()=>{
 for(const trick of ['wind','mud'])for(const side of [0,1])for(const mode of ['unavailable','turned-away']){
  const {g,carrier,target,backup,third}=fixture(side,trick,.7);
  const dir=side===0?1:-1;
  Object.assign(third,{down:false,stun:0,z:0,action:'idle',actionTimer:0,face:-dir,dx:0,dy:0,moveVX:0,moveVY:0});
  if(mode==='unavailable'){
   target.down=true;
   backup.action='hurt';backup.actionTimer=.3;
  }else{
   target.face=dir;target.dx=0;target.dy=0;
   backup.face=dir;backup.dx=0;backup.dy=0;
  }
  let elapsed=.7,steps=0;const dt=1/60,reaction=aiLevels[3].reaction;
  while(elapsed<.98&&!g.jumps&&steps<30){
   carrier.dribbleHold=elapsed;
   for(const defender of [target,backup,third])react.call(g,defender,dt,reaction);
   elapsed+=dt;steps++;
  }
  assert.equal(g.jumps,1,trick+', team '+side+', '+mode+': the third readable defender should counter');
  assert.equal(third.action,'jump');
  assert.notEqual(target.action,'jump');
  assert.notEqual(backup.action,'jump');
 }
});

test('An active nearest SLIDE keeps its existing counter slot while the next readable defender reacts',()=>{
 for(const trick of ['wind','mud'])for(const side of [0,1]){
  const {g,carrier,target,backup,third}=fixture(side,trick,.7);
  const dir=side===0?1:-1;
  Object.assign(target,{action:'slide',actionTimer:.3,face:dir,dx:0,dy:0});
  Object.assign(backup,{face:-dir,dx:0,dy:0});
  Object.assign(third,{face:-dir,dx:0,dy:0});
  let elapsed=.7,steps=0;const dt=1/60,reaction=aiLevels[3].reaction;
  while(elapsed<.98&&!g.jumps&&steps<30){
   carrier.dribbleHold=elapsed;
   for(const defender of [target,backup,third])react.call(g,defender,dt,reaction);
   elapsed+=dt;steps++;
  }
  assert.equal(g.jumps,1,trick+', team '+side+': the second readable defender should back up the active slide');
  assert.equal(target.action,'slide');
  assert.equal(backup.action,'jump');
  assert.equal(third.action,'idle','the two-defender reaction budget remains bounded');
 }
});
