'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const aiData=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8')).aiLevels;
function methodSource(name){
 const start=engine.indexOf(`\n ${name}(`),tail=start<0?-1:engine.slice(start+1).search(/\n [A-Za-z_$][\w$]*\(/);
 assert.ok(start>=0&&tail>=0,`extract ${name}`);
 const end=start+1+tail;
	return engine.slice(start,end);
}
function method(name,globals={}){return vm.runInNewContext('({'+methodSource(name)+'})',globals)[name];}
const react=method('reactToScreamTrick',{distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??p[k]??0});
function fixture(side,hold=.35,nearest=true){
 const carrier={t:1-side,keeper:false,src:{magicTrick:'scream'},x:300,y:240,dribbleHold:hold};
 const target={t:side,keeper:false,src:{},x:nearest?390:550,y:240,z:0,stun:0,cd:0,dx:0,dy:0,moveVX:0,moveVY:0,action:'idle',actionTimer:0};
 const other={t:side,keeper:false,src:{},x:nearest?560:330,y:240,z:0,stun:0,action:'idle',actionTimer:0};
 const g={ball:{owner:carrier},players:[carrier,target,other],jumps:0,slides:0,
  jump(p){this.jumps++;p.z=22;p.action='jump';p.actionTimer=.5;return true;},
  tackle(p,slide=false){if(!slide||p.cd>0)return false;this.slides++;p.action='slide';p.actionTimer=.48;p.slideTimer=.48;p.cd=.68;return true;}
 };
 return {g,carrier,target,other};
}

test('CPU reacts to the exact nearby Scream carrier using difficulty timing before its held-dribble cast',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(const level of [1,2,3,4]){
  const {g,carrier,target}=fixture(side),dt=1/fps,reaction=aiData[level].reaction;
  let elapsed=0,jumpedAt=null;
  while(elapsed<1){elapsed=Math.min(1,elapsed+dt);carrier.dribbleHold=elapsed;
   react.call(g,target,dt,reaction);if(g.jumps){jumpedAt=elapsed;break;}}
  assert.ok(jumpedAt!==null&&jumpedAt<1,`team ${side}, ${fps}Hz, ${aiData[level].name} should jump before the 1s cast`);
  assert.equal(target.z,22);assert.equal(target.action,'jump');
 }
});

test('Scream CPU times a close grounded SHOOT-slide in the final wind-up at 30/60/120Hz from both teams',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(const level of [1,2,3,4]){
  const {g,carrier,target}=fixture(side),dt=1/fps;
  target.x=carrier.x+55;
  let elapsed=.35,holdAtSlide=null;
  while(elapsed<1&&!g.slides&&!g.jumps){
   carrier.dribbleHold=elapsed;
   react.call(g,target,dt,aiData[level].reaction);
   if(g.slides)holdAtSlide=elapsed;
   elapsed=Math.min(1,elapsed+dt);
  }
  assert.equal(g.slides,1,aiData[level].name+' side '+side+' '+fps+'Hz must use the close Scream slide');
  assert.equal(g.jumps,0,'close slide should remain the selected counter');
  assert.ok(holdAtSlide>=.84&&holdAtSlide<1,'slide must overlap the final Scream wind-up');
  assert.equal(target.action,'slide');assert.ok(target.actionTimer>0);
 }
});

test('Scream close slide falls back to JUMP when cooldown, range or slide dispatch prevents it',()=>{
 for(const side of [0,1]){
  const cooling=fixture(side,.7);cooling.target.x=cooling.carrier.x+55;cooling.target.cd=.2;
  assert.equal(react.call(cooling.g,cooling.target,.1,.02),true);
  assert.equal(cooling.g.slides,0);assert.equal(cooling.g.jumps,1,'cooldown preserves the existing JUMP counter');

  const outside=fixture(side,.7);outside.target.x=outside.carrier.x+65;
  assert.equal(react.call(outside.g,outside.target,.1,.02),true);
  assert.equal(outside.g.slides,0);assert.equal(outside.g.jumps,1,'outside the short slide lane keeps JUMP');

  const failed=fixture(side,.9);failed.target.x=failed.carrier.x+55;failed.g.tackle=()=>false;
  assert.equal(react.call(failed.g,failed.target,.1,.02),true);
  assert.equal(failed.g.slides,0);assert.equal(failed.g.jumps,1,'failed slide dispatch falls back safely');
 }
});

test('Rookie reaction remains late, and distant, wrong-trick, unheld, airborne or sliding states are not overridden',()=>{
 for(const side of [0,1]){
  const slow=fixture(side),dt=1/60;let elapsed=0;
  while(elapsed<1){elapsed=Math.min(1,elapsed+dt);slow.carrier.dribbleHold=elapsed;react.call(slow.g,slow.target,dt,aiData[0].reaction);}
  assert.equal(slow.g.jumps,0,'Rookie does not get an impossible pre-cast response');
  const far=fixture(side,.7,false);react.call(far.g,far.target,.02,.09);assert.equal(far.g.jumps,0);
  const wrong=fixture(side,.7);wrong.carrier.src.magicTrick='wind';react.call(wrong.g,wrong.target,.02,.09);assert.equal(wrong.g.jumps,0);
  const unheld=fixture(side,.2);react.call(unheld.g,unheld.target,.02,.09);assert.equal(unheld.g.jumps,0);
  for(const state of [{z:25,action:'jump',actionTimer:.3},{z:0,action:'slide',actionTimer:.3}]){
   const ready=fixture(side,.7);Object.assign(ready.target,state);react.call(ready.g,ready.target,.04,.09);assert.equal(ready.g.jumps,0);
  }
 }
});

test('Scream CPU response is wired into AI and preserves existing counter and control rules',()=>{
 assert.match(engine,/this\.reactToScreamTrick\(p,dt,ai\.reaction\)/);
	const trick=methodSource('tryMagicTrick');
 assert.match(trick,/screamDodged=id==='scream'/);assert.match(trick,/screamParried=id==='scream'/);
 assert.match(engine,/Hold DRIBBLE for >=1s/);
});

test('Scream CPU counter ignores nonfinite carrier and defender coordinates without jumping or stealing nearest selection',()=>{
 for(const side of [0,1]){
  for(const field of ['x','y'])for(const bad of [NaN,Infinity,-Infinity,undefined]){
   const invalidCarrier=fixture(side,.7);
   invalidCarrier.carrier[field]=bad;
   react.call(invalidCarrier.g,invalidCarrier.target,.1,.02);
   assert.equal(invalidCarrier.g.jumps,0,'invalid carrier must not trigger a jump');
   assert.equal(invalidCarrier.target.aiScreamThreat,null);

   const invalidTarget=fixture(side,.7);
   invalidTarget.target[field]=bad;
   react.call(invalidTarget.g,invalidTarget.target,.1,.02);
   assert.equal(invalidTarget.g.jumps,0,'invalid defender must not trigger a jump');
   assert.equal(invalidTarget.target.aiScreamThreat,null);
  }
  const valid=fixture(side,.7);
  react.call(valid.g,valid.target,.1,.02);
  assert.equal(valid.g.jumps,1,'valid nearest defender still counters');
  assert.equal(valid.target.z,22);
 }
});


test('Scream CPU counter selects the nearest eligible finite defender and ignores an invalid rival',()=>{
 for(const side of [0,1])for(const field of ['x','y'])for(const bad of [NaN,Infinity,-Infinity,undefined]){
  const {g,carrier,target,other}=fixture(side,.7);
  // The alternate defender is initially farther away; an invalid coordinate
  // must not displace the valid closest defender or poison its distance sort.
  other[field]=bad;
  assert.equal(react.call(g,target,.1,.02),true);
  assert.equal(g.jumps,1);
  assert.equal(target.z,22);
  assert.equal(other.z,0);

  const fallback=fixture(side,.7);
  fallback.target[field]=bad;
  fallback.other.x=350;
  fallback.other.y=240;
  assert.equal(react.call(fallback.g,fallback.other,.1,.02),true,
   'the next valid defender should be allowed to counter');
  assert.equal(fallback.g.jumps,1);
  assert.equal(fallback.other.z,22);
  assert.equal(fallback.target.z,0);
 }
});



test('Scream CPU hands the warning to the next ready defender when the nearest is unavailable',()=>{
 const unavailable=[
  ['down',p=>{p.down=true;}],['invulnerable',p=>{p.invuln=.3;}],
  ['shot-impact pending',p=>{p.shotImpactKnockdownPending=.3;}],
  ['shot-impact knockdown',p=>{p.shotImpactKnockdownTimer=.3;}],
  ['shot-impact rise',p=>{p.shotImpactRiseTimer=.3;}],
  ['shot down',p=>{p.action='shotDown';p.actionTimer=.3;}],
  ['getting up',p=>{p.action='shotGetUp';p.actionTimer=.3;}],
  ['hurt recovery',p=>{p.action='hurt';p.actionTimer=.3;}],
  ['jump below dodge height',p=>{p.action='jump';p.actionTimer=.3;p.z=8;}],
  ['invalid height',p=>{p.z=NaN;}]
 ];
 for(const side of [0,1])for(const [label,mark] of unavailable){
  const {g,carrier,target,other}=fixture(side,.7);other.x=carrier.x+95;other.y=carrier.y;mark(target);
  assert.equal(react.call(g,target,.1,.02),false,label+' nearest defender cannot react');
  assert.equal(react.call(g,other,.1,.02),true,label+' next active defender should JUMP');
  assert.equal(g.jumps,1,label+' must produce one response');assert.equal(other.action,'jump');
 }
});

test('Scream keeps an already-effective nearest JUMP or SHOOT-slide as the counter instead of duplicating it',()=>{
 for(const side of [0,1])for(const state of [{z:22,action:'jump',actionTimer:.3},{z:0,action:'slide',actionTimer:.3}]){
  const {g,carrier,target,other}=fixture(side,.7);other.x=carrier.x+95;other.y=carrier.y;Object.assign(target,state);
  assert.equal(react.call(g,other,.1,.02),false);assert.equal(g.jumps,0,'the nearest active counter already protects the team');
 }
});

test('Scream does not invent a counter when every nearby defender is unavailable',()=>{
 for(const side of [0,1]){
  const {g,carrier,target,other}=fixture(side,.7);other.x=carrier.x+95;other.y=carrier.y;
  target.down=true;other.down=true;
  assert.equal(react.call(g,target,.1,.02),false);assert.equal(react.call(g,other,.1,.02),false);assert.equal(g.jumps,0);
 }
});


test('Scream backs up an idle selected-human marker with the nearest ready CPU teammate',()=>{
 for(const side of [0,1]){
  const {g,carrier,target,other}=fixture(side,.7),dir=side===0?1:-1;
  target.i=3;other.i=4;target.src={defence:20};carrier.src.dribbling=60;
  target.x=carrier.x+dir*55;target.y=carrier.y;other.x=carrier.x+dir*95;other.y=carrier.y;
  g.controlled=[0,0];g.controlled[side]=target.i;g.inControl=team=>team===side;
  let jumped=false;for(let i=0;i<20&&!jumped;i++)jumped=react.call(g,other,1/60,.09);
  assert.equal(jumped,true,'CPU teammate should take backup duty for side '+side);
  assert.equal(g.jumps,1);assert.equal(other.action,'jump');assert.equal(other.z,22);
  assert.equal(target.action,'idle','selected human retains control of the warning target');
  assert.equal(target.z,0);assert.equal(target.stun,0);
 }
});

test('Scream does not duplicate an effective selected-human JUMP, slide or Defence read',()=>{
 for(const side of [0,1])for(const patch of [
  {action:'jump',actionTimer:.3,z:22},
  {action:'slide',actionTimer:.3,z:0},
  {action:'idle',actionTimer:0,z:0,dx:side===0?-1:1,dy:0,face:side===0?-1:1,src:{defence:90}}
 ]){
  const {g,carrier,target,other}=fixture(side,.7),dir=side===0?1:-1;
  target.i=3;other.i=4;target.x=carrier.x+dir*55;target.y=carrier.y;other.x=carrier.x+dir*95;other.y=carrier.y;
  Object.assign(target,patch);carrier.src.dribbling=60;
  g.controlled=[0,0];g.controlled[side]=target.i;g.inControl=team=>team===side;
  assert.equal(react.call(g,other,.2,.02),false,JSON.stringify(patch));
  assert.equal(g.jumps,0,'no CPU backup when the selected human already counters');
 }
});

test('Scream backup ignores an early non-counter JUMP and fails closed without a ready CPU teammate',()=>{
 for(const side of [0,1]){
  const early=fixture(side,.7),dir=side===0?1:-1;
  early.target.i=3;early.other.i=4;early.target.x=early.carrier.x+dir*55;early.other.x=early.carrier.x+dir*95;
  early.g.controlled=[0,0];early.g.controlled[side]=early.target.i;early.g.inControl=team=>team===side;
  early.target.action='jump';early.target.actionTimer=.3;early.target.z=8;
  assert.equal(react.call(early.g,early.other,.1,.02),true,'early JUMP has not reached the existing 20-unit counter height');
  assert.equal(early.g.jumps,1);
  const none=fixture(side,.7);none.target.i=3;none.other.i=4;none.target.x=none.carrier.x+dir*55;
  none.other.x=none.carrier.x+dir*95;none.other.down=true;
  none.g.controlled=[0,0];none.g.controlled[side]=none.target.i;none.g.inControl=team=>team===side;
  assert.equal(react.call(none.g,none.other,.1,.02),false);assert.equal(none.g.jumps,0);
 }
});

test('Scream does not assign a second CPU backup when another teammate already counters',()=>{
 for(const side of [0,1]){
  const {g,carrier,target,other}=fixture(side,.7),dir=side===0?1:-1;
  target.i=3;other.i=4;target.x=carrier.x+dir*55;other.x=carrier.x+dir*95;
  const second={t:side,keeper:false,i:5,src:{defence:20},x:carrier.x+dir*110,y:carrier.y,z:22,stun:0,
   action:'jump',actionTimer:.3,down:false,invuln:0};
  other.action='idle';other.z=0;other.actionTimer=0;
  g.players.push(second);g.controlled=[0,0];g.controlled[side]=target.i;g.inControl=team=>team===side;
  assert.equal(react.call(g,other,.2,.02),false);assert.equal(g.jumps,0);
 }
});


test('Scream backup is not suppressed by a countering teammate outside the 135-unit radius',()=>{
 for(const side of [0,1]){
  const {g,carrier,target,other}=fixture(side,.7),dir=side===0?1:-1;
  target.i=3;other.i=4;target.x=carrier.x+dir*55;other.x=carrier.x+dir*95;
  const far={t:side,keeper:false,i:5,src:{defence:20},x:carrier.x+dir*145,y:carrier.y,z:22,stun:0,
   action:'jump',actionTimer:.3,down:false,invuln:0};
  g.players.push(far);g.controlled=[0,0];g.controlled[side]=target.i;g.inControl=team=>team===side;
  assert.equal(react.call(g,other,.1,.02),true,'only an in-range teammate counter may suppress backup');
  assert.equal(g.jumps,1);assert.equal(other.z,22);
 }
});

test('Scream resolver accepts the same ready teammate JUMP and SHOOT-slide backup candidates',()=>{
 const trick=methodSource('tryMagicTrick');
 assert.match(trick,/const counterRivals=\[[^\]]*'hideBall'[^\]]*\]\.includes\(id\)/);
 assert.match(trick,/screamDodged=id==='scream'&&inRange&&counterRivals\.some/);
 assert.match(trick,/screamParried=id==='scream'&&inRange&&counterRivals\.some/);
});

test('Scream CPU reaction fails safely on invalid reaction and frame timing',()=>{
 for(const side of [0,1])for(const bad of [NaN,Infinity,-Infinity,undefined]){
  const f=fixture(side,.7);
  assert.equal(react.call(f.g,f.target,.1,bad),false,'invalid difficulty reaction must not grant an instant JUMP');
  assert.equal(f.g.jumps,0);
  assert.ok(f.target.aiScreamReaction>.6,'invalid reaction uses conservative warning delay');
  for(const badDt of [NaN,Infinity,-Infinity,undefined]){
   const remaining=f.target.aiScreamReaction;
   assert.equal(react.call(f.g,f.target,badDt,bad),false);
   assert.equal(f.target.aiScreamReaction,remaining,'invalid frame duration cannot advance reaction');
  }
  assert.equal(react.call(f.g,f.target,.7,bad),true,'valid elapsed time still permits existing JUMP counter');
  assert.equal(f.g.jumps,1);
 }
});

test('Scream CPU countdown recovers corrupt saved reaction state without an instant counter',()=>{
 for(const side of [0,1])for(const bad of [NaN,-Infinity,undefined,-2]){
  const f=fixture(side,.7);
  f.target.aiScreamThreat=f.carrier;
  f.target.aiScreamReaction=bad;
  assert.equal(react.call(f.g,f.target,.1,.12),false);
  assert.equal(f.g.jumps,0,'corrupt countdown cannot grant a free immediate jump');
  assert.ok(f.target.aiScreamReaction>=.6&&Number.isFinite(f.target.aiScreamReaction));
  assert.equal(react.call(f.g,f.target,.7,.12),true);
  assert.equal(f.g.jumps,1);
 }
 for(const side of [0,1]){
  const f=fixture(side,.7);
  f.target.aiScreamThreat=f.carrier;
  f.target.aiScreamReaction=Infinity;
  assert.equal(react.call(f.g,f.target,.1,.12),false,'completed counter sentinel stays spent');
  assert.equal(f.g.jumps,0);
 }
});
