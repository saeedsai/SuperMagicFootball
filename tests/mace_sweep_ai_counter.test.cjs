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
const stat=(p,key)=>p.src?.[key]??55;
const helperStart=engine.indexOf('function maceSweepDefensiveRead(');
const helperEnd=engine.indexOf('\n}',helperStart)+2;
assert.ok(helperStart>=0&&helperEnd>helperStart,'extract Mace Sweep read helper');
const maceSweepDefensiveRead=vm.runInNewContext(engine.slice(helperStart,helperEnd)+'\nmaceSweepDefensiveRead',{stat});
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const resolve=method('resolveMaceSweep',{fieldAbility,stat,maceSweepDefensiveRead,clamp,norm,distance,
 F:mechanics.world.field,abilityLevel:()=>2,levelModifiers:()=>({stun:1}),impactStun:()=>.8});
const react=method('reactToMaceSweep',{fieldAbility,maceSweepDefensiveRead});
function setup(side=0,patch={}){
 const face=side===0?1:-1;
 const defender={t:side,x:1100,y:620,face,keeper:false,stun:0,invuln:0,maceSweepPending:null,
  src:{id:'mace',role:'DF',dribbling:55,superAbility:{type:'defence',id:'maceSweep'}}};
 const cpu={t:1-side,x:1100+face*92,y:632,z:0,face:-face,dx:0,dy:0,moveVX:0,moveVY:0,
  stun:0,invuln:0,cd:0,dashTimer:0,action:'run',actionTimer:0,
  aiMaceSweepThreat:null,aiMaceSweepReaction:0,src:{id:'cpu',jumping:70,defence:70},...patch};
 defender.maceSweepPending={remaining:.24,target:cpu};
 let jumps=0;const events=[];
 const game={players:[defender,cpu],ball:{owner:cpu,x:cpu.x,y:cpu.y,z:0,vx:0,vy:0,vz:0},options:{},events,
  emit:(type,data)=>events.push({type,...data}),burst:()=>{},
  jump(p){jumps++;p.z=48;p.action='jump';return true;}};
 return{game,defender,cpu,jumps:()=>jumps,events};
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


test('neutral input can still make a grounded Mace Sweep read from live closing momentum',()=>{
 for(const side of [0,1]){
  const face=side===0?1:-1;
  const state=setup(side,{face:-face,dx:0,dy:0,moveVX:-face*180,moveVY:0,
   src:{id:'cpu',jumping:70,defence:80}});
  assert.equal(react.call(state.game,state.cpu,.016,.09),false);
  assert.equal(state.jumps(),0,'a defender already making the read must not waste its JUMP counter');
  assert.equal(state.cpu.action,'run');
  assert.equal(resolve.call(state.game,state.defender),false);
  assert.equal(state.cpu.stun,0);
  assert.equal(state.game.ball.owner,state.cpu,'a successful read preserves possession');
  assert.equal(state.events.at(-1)?.countered,true);
  assert.equal(state.events.at(-1)?.counter,'read');
 }
});

test('Mace Sweep momentum alone is insufficient when the defender faces away, retreats, or loses the Defence contest',()=>{
 for(const side of [0,1]){
  const face=side===0?1:-1;
  const cases=[
   {face:-face,moveVX:face*180,src:{id:'cpu',jumping:70,defence:80}},
   {face:face,moveVX:-face*180,src:{id:'cpu',jumping:70,defence:80}},
   {face:-face,moveVX:-face*180,src:{id:'cpu',jumping:70,defence:30}}
  ];
  for(const patch of cases){
   const state=setup(side,{dx:0,dy:0,moveVY:0,...patch});
   assert.equal(react.call(state.game,state.cpu,0,0),true);
   assert.equal(state.jumps(),1,'the existing JUMP response remains when no read is valid');
  }
 }
});
