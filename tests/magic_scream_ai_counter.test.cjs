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
const react=method('reactToScreamTrick',{distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)});
function fixture(side,hold=.35,nearest=true){
 const carrier={t:1-side,keeper:false,src:{magicTrick:'scream'},x:300,y:240,dribbleHold:hold};
 const target={t:side,keeper:false,src:{},x:nearest?350:550,y:240,z:0,stun:0,action:'idle',actionTimer:0};
 const other={t:side,keeper:false,src:{},x:nearest?560:330,y:240,z:0,stun:0,action:'idle',actionTimer:0};
 const g={ball:{owner:carrier},players:[carrier,target,other],jumps:0,jump(p){this.jumps++;p.z=22;p.action='jump';return true}};
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
