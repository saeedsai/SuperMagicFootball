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
 stat:(p,k)=>p.src?.[k]??p[k]??0,
 norm:(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d}}
}).reactToTeleportTrick;
function fixture(side,hold=.35,{ahead=80,across=0,nearest=true,trick='teleport'}={}){
 const carrier={t:1-side,keeper:false,src:{magicTrick:trick},x:300,y:240,face:side===0?-1:1,dx:side===0?-1:1,dy:0,dribbleHold:hold};
 const forward=carrier.dx,target={t:side,keeper:false,src:{},x:carrier.x+forward*ahead,y:carrier.y+across,z:0,stun:0,cd:0,action:'idle',actionTimer:0};
 const other={t:side,keeper:false,src:{},x:carrier.x+forward*(nearest?ahead+100:Math.max(1,ahead-15)),y:carrier.y+(nearest?160:0),z:0,stun:0,cd:0,action:'idle',actionTimer:0};
 const g={ball:{owner:carrier},players:[carrier,target,other],controlled:[0,0],inControl:()=>false,slides:0,jumps:0,
  tackle(p,slide){if(!slide)return false;this.slides++;p.action='slide';p.actionTimer=.48;p.slideTimer=.4;p.cd=.68;return true;},
  jump(p){this.jumps++;p.action='jump';p.actionTimer=.5;p.z=22;p.vz=420;return true;}};
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


test('CPU times the existing JUMP counter when only the Teleport landing corridor is reachable',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(const level of [1,2,3,4]){
  const {g,carrier,target}=fixture(side,.35,{ahead:90,across:10}),dt=1/fps,reaction=aiData[level].reaction;
  let elapsed=.35,startedAt=null;
  while(elapsed<1&&!g.jumps&&!g.slides){
   carrier.dribbleHold=elapsed;react.call(g,target,dt,reaction);
   if(g.jumps)startedAt=elapsed;
   elapsed=Math.min(1,elapsed+dt);
  }
  assert.equal(g.jumps,1,aiData[level].name+', team '+side+', '+fps+'Hz');
  assert.equal(g.slides,0,'a defender outside the slide lane must use JUMP');
  assert.equal(target.action,'jump');assert.ok(target.actionTimer>0&&target.z>=20);
  assert.ok(startedAt>=.88-dt&&startedAt<1,'JUMP is timed near the existing cast: '+startedAt);
  carrier.dribbleHold=1;
  assert.equal(resolve.call(g,carrier),true,'the real Teleport resolver accepts the airborne JUMP');
  assert.equal(g.events.at(-1).countered,true,'the JUMP blocks the Teleport arrival');
  assert.equal(carrier.x,300,'a countered Teleport does not move the carrier');
 }
});

test('a selected human slide-lane marker can be backed up by a CPU JUMP-lane responder',()=>{
 for(const side of [0,1]){
  const {g,carrier,target,other}=fixture(side,.7,{ahead:75,across:0}),forward=carrier.dx;
  target.i=4;other.i=3;
  Object.assign(target,{x:carrier.x+forward*75,y:carrier.y,action:'idle',actionTimer:0});
  Object.assign(other,{x:carrier.x+forward*90,y:carrier.y+10,action:'idle',actionTimer:0});
  g.controlled[side]=target.i;g.inControl=team=>team===side;
  let elapsed=.7;
  while(elapsed<1&&!g.jumps&&!g.slides){
   carrier.dribbleHold=elapsed;react.call(g,other,1/60,.09);elapsed+=1/60;
  }
  assert.equal(g.jumps,1,'CPU uses JUMP from the secondary corridor on team '+side);
  assert.equal(g.slides,0);
  assert.equal(other.action,'jump');
  assert.equal(target.action,'idle','the selected human keeps control');
  assert.equal(g.controlled[side],target.i);
  carrier.dribbleHold=1;
  assert.equal(resolve.call(g,carrier),true);
  assert.equal(g.events.at(-1).countered,true,'the CPU JUMP is accepted by the resolver');
 }
});

test('Teleport JUMP counters reject rear, wide, distant and wrong-trick lanes; Rookie remains too slow',()=>{
 for(const side of [0,1]){
  for(const options of [
   {ahead:70,across:39},{ahead:90,across:40},{ahead:110,across:0},{ahead:90,across:10,trick:'scream'}
  ]){
   const f=fixture(side,.9,options);
   react.call(f.g,f.target,.02,0);
   assert.equal(f.g.jumps,0,JSON.stringify(options));
   assert.equal(f.g.slides,0,JSON.stringify(options));
  }
  const slow=fixture(side,.35,{ahead:90,across:10});
  let elapsed=.35;const dt=1/60;
  while(elapsed<1&&!slow.g.jumps){slow.carrier.dribbleHold=elapsed;
   react.call(slow.g,slow.target,dt,aiData[0].reaction);elapsed=Math.min(1,elapsed+dt);}
  assert.equal(slow.g.jumps,0,'Rookie cannot beat the visible warning on team '+side);
 }
});

test('a CPU keeps its Teleport JUMP through the first takeoff frames without duplicating it',()=>{
 for(const side of [0,1]){
  const {g,carrier,target}=fixture(side,.9,{ahead:90,across:10});
  react.call(g,target,.02,0);
  assert.equal(g.jumps,1);
  target.z=15;
  assert.equal(react.call(g,target,.02,0),false,'the small initial lift retains the earned threat');
  assert.equal(target.aiTeleportThreat,carrier);
  target.z=22;
  assert.equal(react.call(g,target,.02,0),false,'the airborne JUMP is already a counter');
  assert.equal(g.jumps,1,'no duplicate JUMP is issued');
 }
});

test('vertical-only directional input preserves the zero horizontal axis in Teleport counter lanes',()=>{
 for(const side of [0,1])for(const dy of [-1,1]){
  const {g,carrier,target}=fixture(side,.9);
  carrier.dx=0;carrier.dy=dy;carrier.face=dy>0?-1:1;
  target.x=carrier.x;target.y=carrier.y+dy*80;
  assert.equal(react.call(g,target,.2,.02),true,
   'vertical lane defender must start the existing slide counter for side '+side+' dy '+dy);
  assert.equal(g.slides,1);
  assert.equal(target.action,'slide');
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

test('Teleport AI selects a ready lane defender even when a closer opponent is outside the slide corridor',()=>{
 for(const side of [0,1]){
  const {g,carrier,target,other}=fixture(side,.7),forward=carrier.dx;
  target.x=carrier.x+forward*25;target.y=carrier.y+45;
  other.x=carrier.x+forward*75;other.y=carrier.y;
  let hold=.7;
  while(hold<1&&!g.slides){carrier.dribbleHold=hold;react.call(g,other,1/60,.09);hold+=1/60;}
  assert.equal(g.slides,1,'available lane defender responds despite nearer off-lane opponent');
  assert.equal(other.action,'slide');
 }
});

test('Teleport backs up a selected human lane marker with the nearest ready CPU teammate',()=>{
 for(const side of [0,1]){
  const {g,carrier,target,other}=fixture(side,.7),forward=carrier.dx;
  target.i=4;other.i=3;target.src={defence:20};carrier.src.dribbling=60;
  target.x=carrier.x+forward*55;target.y=carrier.y;other.x=carrier.x+forward*70;other.y=carrier.y;
  g.controlled[side]=target.i;g.inControl=team=>team===side;
  let hold=.7;
  while(hold<1&&!g.slides){carrier.dribbleHold=hold;react.call(g,other,1/60,.09);hold+=1/60;}
  assert.equal(g.slides,1,'CPU teammate backs up selected human marker');
  assert.equal(other.action,'slide');assert.ok(other.actionTimer>0);
  assert.equal(target.action,'idle','selected human keeps nearest marker control');
 }
});

test('Teleport does not duplicate a selected human JUMP, SHOOT-slide or Defence read',()=>{
 for(const side of [0,1])for(const patch of [
  {action:'jump',actionTimer:.3,z:22},
  {action:'slide',actionTimer:.3,slideTimer:.3,z:0},
  {action:'idle',actionTimer:0,z:0,dx:side===0?1:-1,dy:0,src:{defence:90}}
 ]){
  const {g,carrier,target,other}=fixture(side,.7),forward=carrier.dx;
  target.i=4;other.i=3;carrier.src.dribbling=60;
  target.x=carrier.x+forward*55;target.y=carrier.y;other.x=carrier.x+forward*70;other.y=carrier.y;
  Object.assign(target,patch);g.controlled[side]=target.i;g.inControl=team=>team===side;
  assert.equal(react.call(g,other,.1,.02),false,JSON.stringify(patch));
  assert.equal(g.slides,0,'existing human counter suppresses CPU backup');
  assert.equal(g.jumps,0,'existing human JUMP also suppresses CPU backup');
  assert.equal(other.action,'idle');
 }
});

test('active slide is preserved and AI dispatch uses only the existing tackle action',()=>{
 const {g,target}=fixture(0,.7);target.action='slide';target.actionTimer=.25;
 assert.equal(react.call(g,target,.04,.09),false);assert.equal(g.slides,0);assert.equal(target.actionTimer,.25);
 assert.match(engine,/if\(this\.reactToTeleportTrick\(p,dt,ai\.reaction\)\|\|p\.aiTeleportThreat\)return/);
 assert.match(engine,/this\.tackle\(p,true\)/);
 assert.match(engine,/if\(responder\.action==='jump'\)/);
 assert.match(engine,/this\.jump\(p\)/);
});
