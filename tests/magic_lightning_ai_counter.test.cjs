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
const react=method('reactToLightningTrick');
function setup(side=0,patch={}){
 const caster={t:1-side,keeper:false,lightningPending:null};
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

test('DriveAI dispatches the CPU response through the existing difficulty profile and controls remain unchanged',()=>{
 assert.match(engine,/this\.reactToLightningTrick\(p,dt,ai\.reaction\)/);
 const input=fs.readFileSync('src/modules/input.js','utf8');
 assert.match(input,/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
 assert.doesNotMatch(engine,/aiLightning(?:Threat|Reaction).*(?:localStorage|save|schema)/i);
});
