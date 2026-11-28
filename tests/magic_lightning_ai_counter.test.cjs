'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8');
function method(name,globals={}){
	const a=engine.indexOf(`\n ${name}(`),tail=a<0?-1:engine.slice(a+1).search(/\n [A-Za-z_$][\w$]*\(/);
	assert.ok(a>=0&&tail>=0,`extract ${name}`);
	const b=a+1+tail;
	return vm.runInNewContext('({'+engine.slice(a,b)+'})',globals)[name];
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const stat=(p,k)=>p.src?.[k]??0;
const face2d=(d,a)=>{
 if(!d||!a||!Number.isFinite(d.x)||!Number.isFinite(d.y)||!Number.isFinite(a.x)||!Number.isFinite(a.y))return false;
 let x=Number.isFinite(d.dx)?d.dx:0,y=Number.isFinite(d.dy)?d.dy:0,n=Math.hypot(x,y);
 if(n<=.1){x=Number.isFinite(d.moveVX)?d.moveVX:0;y=Number.isFinite(d.moveVY)?d.moveVY:0;n=Math.hypot(x,y);}
 if(n<=.1){x=d.face===-1?-1:1;y=0;n=1;}
 return (x/n)*(a.x-d.x)+(y/n)*(a.y-d.y)>0;
};
const readyStart=engine.indexOf('function lightningTargetReady('),readyEnd=engine.indexOf('\n}',readyStart)+2;
assert.ok(readyStart>=0&&readyEnd>readyStart,'Lightning shared target-readiness helper exists');
const lightningTargetReady=vm.runInNewContext('('+engine.slice(readyStart,readyEnd)+')');
const helperStart=engine.indexOf('function lightningDefenderCounters('),helperEnd=engine.indexOf('\n}',helperStart)+2;
assert.ok(helperStart>=0&&helperEnd>helperStart,'Lightning shared counter helper exists');
const lightningDefenderCounters=vm.runInNewContext('('+engine.slice(helperStart,helperEnd)+')',{defenderFacesCarrier2D:face2d,stat});
const react=method('reactToLightningTrick',{distance,lightningDefenderCounters,lightningTargetReady});
function setup(side=0,patch={}){
 const caster={t:1-side,keeper:false,x:1080,y:620,lightningPending:null};
 const cpu={t:side,x:1120,y:620,z:0,stun:0,action:'run',actionTimer:0,
  aiLightningThreat:null,aiLightningReaction:0,src:{id:'cpu',jumping:70},...patch};
 caster.lightningPending={remaining:.32,target:cpu};
 let jumps=0;const game={players:[caster,cpu],jump(p){jumps++;p.z=48;p.action='jump';p.actionTimer=.5;return true;}};
 return{game,caster,cpu,jumps:()=>jumps};
}

test('CPU reacts to the named Lightning warning at its existing difficulty timing across teams and rates',()=>{
 for(const level of mechanics.aiLevels)for(const side of [0,1])for(const hz of [30,60,120]){
  const {game,cpu,jumps}=setup(side);let warning=.32,frames=0;
  while(warning>1e-9&&frames<hz){
   warning=Math.max(0,warning-1/hz);game.players[0].lightningPending.remaining=warning;
   game.reactToLightningTrick=react;game.reactToLightningTrick(cpu,1/hz,level.reaction);
   frames++;
  }
  const expected=level.reaction<.32;
  assert.equal(jumps()>0,expected,`${level.name}, team ${side}, ${hz}Hz`);
  assert.equal(cpu.z>20,expected,`${level.name} uses the existing Jump counter`);
 }
});

test('Lightning CPU response ignores a synthetic target outside the existing 95-unit cast radius',()=>{
 const state=setup();state.cpu.x=1176;
 assert.equal(react.call(state.game,state.cpu,.02,.09),false);
 assert.equal(state.jumps(),0);
});

test('Lightning reaction ignores other targets and avoids interrupting existing jump, slide, stun, or keeper states',()=>{
 const absent=setup();absent.caster.lightningPending=null;
 assert.equal(react.call(absent.game,absent.cpu,.02,.09),false);
 assert.equal(absent.cpu.aiLightningThreat,null);assert.equal(absent.jumps(),0);
 const expired=setup();expired.caster.lightningPending.remaining=0;
 assert.equal(react.call(expired.game,expired.cpu,.02,.09),false);assert.equal(expired.jumps(),0);
 const wrong=setup();wrong.caster.lightningPending.target={t:wrong.cpu.t};
 assert.equal(react.call(wrong.game,wrong.cpu,.02,.09),false);assert.equal(wrong.jumps(),0);
 for(const patch of [{action:'jump',actionTimer:.2},{action:'slide',actionTimer:.2},{stun:.1},{keeper:true},{z:25}]){
  const state=setup(0,patch);
  assert.equal(react.call(state.game,state.cpu,.02,.09),false,JSON.stringify(patch));
  assert.equal(state.jumps(),0);
 }
});

test('A selected human Lightning marker keeps control while a ready CPU teammate backs them up',()=>{
 for(const side of [0,1])for(const hz of [30,60,120]){
  const caster={t:1-side,x:100,y:100,src:{dribbling:60},lightningPending:null};
  const target={t:side,i:3,x:150,y:100,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0,
   face:-1,dx:0,dy:0,moveVX:0,moveVY:0,src:{defence:20}};
  const backup={t:side,i:4,x:170,y:100,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0,
   face:-1,dx:0,dy:0,moveVX:0,moveVY:0,aiLightningThreat:null,aiLightningReaction:0,src:{defence:20}};
  caster.lightningPending={remaining:.32,target,backup};
  let jumps=0;const game={players:[caster,target,backup],jump(p){jumps++;p.z=4;p.vz=420;p.action='jump';p.actionTimer=.5;return true;}};
  let remaining=.32,frames=0;
  while(remaining>1e-9&&frames<hz&&backup.action!=='jump'){
   remaining=Math.max(0,remaining-1/hz);caster.lightningPending.remaining=remaining;
   react.call(game,backup,1/hz,.18);frames++;
  }
  assert.equal(backup.action,'jump',`side ${side}, ${hz}Hz: backup responds`);
  assert.ok(remaining>0,'backup starts before the warning expires');
  assert.equal(target.action,'idle','the selected human retains direct control');
  assert.equal(jumps,1);
 }
});
test('Lightning backup yields when the selected human has already started an effective counter',()=>{
 for(const side of [0,1])for(const patch of [
  {action:'jump',actionTimer:.3,z:20},
  {action:'slide',actionTimer:.2,z:0},
  {action:'idle',actionTimer:0,z:0,face:-1,dx:-1,dy:0,src:{defence:80}}
 ]){
  const caster={t:1-side,x:100,y:100,src:{dribbling:60},lightningPending:null};
  const target={t:side,i:3,x:150,y:100,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0,
   face:-1,dx:0,dy:0,moveVX:0,moveVY:0,src:{defence:20},...patch};
  const backup={t:side,i:4,x:170,y:100,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0,
   face:-1,dx:0,dy:0,moveVX:0,moveVY:0,aiLightningThreat:null,aiLightningReaction:0,src:{defence:20}};
  caster.lightningPending={remaining:.32,target,backup};
  let jumps=0;const game={players:[caster,target,backup],jump(){jumps++;return true;}};
  assert.equal(react.call(game,backup,1/60,.08),false);
  assert.equal(jumps,0);
 }
});
test('DriveAI dispatches the CPU response through the existing difficulty profile and controls remain unchanged',()=>{
 assert.match(engine,/this\.reactToLightningTrick\(p,dt,ai\.reaction\)/);
 const input=fs.readFileSync('src/modules/input.js','utf8');
 assert.match(input,/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
 assert.doesNotMatch(engine,/aiLightning(?:Threat|Reaction).*(?:localStorage|save|schema)/i);
});

test('Lightning CPU backup inherits the warning when the selected human begins an incomplete low jump',()=>{
 for(const side of [0,1]){
  const caster={t:1-side,x:100,y:100,src:{dribbling:60},lightningPending:null};
  const target={t:side,i:3,x:150,y:100,z:8,stun:0,down:false,invuln:0,action:'jump',actionTimer:.3,
   face:-1,dx:0,dy:0,moveVX:0,moveVY:0,src:{defence:20}};
  const backup={t:side,i:4,x:170,y:100,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0,
   face:-1,dx:0,dy:0,moveVX:0,moveVY:0,aiLightningThreat:null,aiLightningReaction:0,src:{defence:20}};
  caster.lightningPending={remaining:.32,target,backup};
  let jumps=0;const game={players:[caster,target,backup],jump(p){jumps++;p.z=48;p.action='jump';p.actionTimer=.5;return true;}};
  let remaining=.32,frames=0;
  while(remaining>1e-9&&frames<60&&backup.action!=='jump'){
   const dt=1/60;remaining=Math.max(0,remaining-dt);caster.lightningPending.remaining=remaining;
   react.call(game,backup,dt,.09);frames++;
  }
  assert.equal(backup.action,'jump','ready CPU teammate inherits the warning on side '+side);
  assert.equal(target.action,'jump','selected human keeps their incomplete jump animation');
  assert.equal(jumps,1);
 }
});
