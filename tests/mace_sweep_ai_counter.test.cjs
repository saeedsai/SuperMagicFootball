'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const F=mechanics.world.field;
function method(name,globals={}){
	const a=engine.indexOf(`\n ${name}(`),tail=a<0?-1:engine.slice(a+1).search(/\n [A-Za-z_$][\w$]*\(/);
	assert.ok(a>=0&&tail>=0,`extract ${name}`);
	const b=a+1+tail;
	return vm.runInNewContext('({'+engine.slice(a,b)+'})',globals)[name];
}
const fieldAbility=src=>src?.superAbility?.type==='defence'?mechanics.defensiveAbilities[src.superAbility.id]:null;
const react=method('reactToMaceSweep',{fieldAbility});
function setup(side=0,patch={}){
 const defender={t:side,x:1100,y:620,keeper:false,maceSweepPending:null,
  src:{id:'mace',role:'DF',superAbility:{type:'defence',id:'maceSweep'}}};
 const cpu={t:1-side,x:1192,y:632,z:0,dashTimer:0,action:'run',actionTimer:0,
  aiMaceSweepThreat:null,aiMaceSweepReaction:0,src:{id:'cpu',jumping:70},...patch};
 defender.maceSweepPending={remaining:.24,target:cpu};
 let jumps=0;const game={players:[defender,cpu],jump(p){jumps++;p.z=48;p.action='jump';return true;}};
 return{game,defender,cpu,jumps:()=>jumps};
}

test('AI reacts to the targeted Mace Sweep warning according to existing difficulty reaction times',()=>{
 for(const level of mechanics.aiLevels)for(const side of [0,1])for(const fps of [30,60,120]){
  const {game,cpu,jumps}=setup(side);let remaining=.24,frames=0;
  while(remaining>1e-9&&frames<fps){
   game.reactToMaceSweep=react;game.reactToMaceSweep(cpu,1/fps,level.reaction);
   remaining=Math.max(0,remaining-1/fps);frames++;
  }
  const expected=level.reaction<.24;
  assert.equal(jumps()>0,expected,`${level.name}, team ${side}, ${fps}Hz`);
  assert.equal(cpu.z>20,expected,`${level.name} evades with the existing jump`);
 }
});

test('Mace reaction only applies to the named target; existing jump, dash, and slide evade without another response',()=>{
 const noThreat=setup();noThreat.game.players[0].maceSweepPending=null;
 assert.equal(react.call(noThreat.game,noThreat.cpu,.02,.09),false);
 assert.equal(noThreat.cpu.aiMaceSweepThreat,null);assert.equal(noThreat.cpu.aiMaceSweepReaction,0);
 const wrongTarget=setup();wrongTarget.game.players[0].maceSweepPending.target={t:1};
 assert.equal(react.call(wrongTarget.game,wrongTarget.cpu,.02,.09),false);assert.equal(wrongTarget.jumps(),0);
 for(const patch of [{z:25},{dashTimer:.2},{action:'slide',actionTimer:.2}]){
  const state=setup(0,patch);
  assert.equal(react.call(state.game,state.cpu,.02,.09),false,JSON.stringify(patch));
  assert.equal(state.jumps(),0);assert.equal(state.cpu.aiMaceSweepReaction,0);
 }
});

test('an active low jump is preserved through the Mace telegraph without a second jump',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(const level of mechanics.aiLevels){
  const state=setup(side,{z:12,action:'jump',actionTimer:.5,jumpCount:1});
  let jumps=0;state.game.jump=()=>{jumps++;return true;};
  let remaining=.24;
  while(remaining>1e-9){
   react.call(state.game,state.cpu,1/fps,level.reaction);
   assert.equal(jumps,0,`${level.name}, side ${side}, ${fps}Hz preserves the active jump`);
   state.cpu.actionTimer=Math.max(0,state.cpu.actionTimer-1/fps);
   remaining=Math.max(0,remaining-1/fps);
  }
 }
});

test('DriveAI routes the warning through difficulty reaction timing without changing input or save contracts',()=>{
 assert.match(engine,/this\.reactToMaceSweep\(p,dt,ai\.reaction\)/);
 assert.match(engine,/aiMaceSweepThreat/);assert.match(engine,/aiMaceSweepReaction/);
 const input=fs.readFileSync('src/modules/input.js','utf8');
 assert.match(input,/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
 assert.doesNotMatch(engine,/maceSweep.*(?:localStorage|save|schema)/i);
});
