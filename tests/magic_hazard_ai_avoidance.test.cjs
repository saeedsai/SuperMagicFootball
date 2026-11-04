'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8');
function method(name,next,globals={}){
 const a=engine.indexOf(`\n ${name}(`),b=engine.indexOf(`\n ${next}(`,a);
 assert.ok(a>=0&&b>a,`extract ${name}`);
 return vm.runInNewContext('({'+engine.slice(a,b)+'\n})',globals)[name];
}
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};};
const aiTuning=value=>mechanics.aiLevels[Math.max(0,Math.min(4,Math.trunc(value)))];
const react=method('reactToMagicHazard','tryBicycleShot',{norm,aiTuning});
function setup(side=0,kind='ice'){
 const radius=kind==='ice'?35:27;
 const cpu={t:side,x:radius+5,y:0,keeper:false,z:0,stun:0,action:'run',actionTimer:0,jumpHold:0,
  src:{speedRating:60},breath:100,morale:55,aiHazardKey:null,aiHazardReaction:0,aiHazardEvading:false};
 const game={players:[cpu],magicHazards:[{kind,team:1-side,x:0,y:0,life:2.5,arm:0}],cpuLevel:()=>2,playerSpeed:()=>300,
  moveAgile(p,x,y,speed,dt){p.x+=x*speed*dt;p.y+=y*speed*dt;},staminaTick(){}};
 return{game,cpu};
}

test('CPU steers clear of active Banana Peel and Ice hazards across both teams, all difficulty profiles, and rates',()=>{
 for(const kind of ['banana','ice'])for(const level of mechanics.aiLevels)for(const side of [0,1])for(const hz of [30,60,120]){
  const {game,cpu}=setup(side,kind),radius=kind==='ice'?35:27;let frames=0;
  while(Math.hypot(cpu.x,cpu.y)<radius+12&&game.magicHazards[0].life>0&&frames<hz*2.5){
   game.magicHazards[0].life-=1/hz;
   game.reactToMagicHazard=react;game.reactToMagicHazard(cpu,1/hz,level.reaction);frames++;
  }
  assert.ok(Math.hypot(cpu.x,cpu.y)>=radius+12,`${kind}, ${level.name}, team ${side}, ${hz}Hz`);
  assert.ok(frames<hz*2.5,'CPU should clear the trap before its existing lifetime expires');
 }
});

test('CPU hazard avoidance ignores allied, unarmed, expired and distant traps, keepers, and active slide/jump counters',()=>{
 const ally=setup();ally.game.magicHazards[0].team=0;
 assert.equal(react.call(ally.game,ally.cpu,.02,.09),false);
 for(const patch of [{arm:.3},{life:0},{x:200},{team:0}]){
  const state=setup();Object.assign(state.game.magicHazards[0],patch);
  assert.equal(react.call(state.game,state.cpu,.02,.09),false,JSON.stringify(patch));
 }
 for(const patch of [{keeper:true},{z:30},{action:'slide',actionTimer:.2}]){
  const state=setup(0,'banana');Object.assign(state.cpu,patch);
  assert.equal(react.call(state.game,state.cpu,.02,.09),false,JSON.stringify(patch));
 }
});

test('At longer range, CPU respects its reaction delay before steering away',()=>{
 for(const kind of ['banana','ice']){
  const state=setup(0,kind),radius=kind==='ice'?35:27;
  state.cpu.x=radius+50;
  const start=state.cpu.x;
  assert.equal(react.call(state.game,state.cpu,.1,.3),false);
  assert.equal(state.cpu.x,start,'movement waits for CPU perception/reaction time');
  assert.equal(react.call(state.game,state.cpu,.1,.3),false);
  assert.equal(state.cpu.x,start);
  assert.equal(react.call(state.game,state.cpu,.1,.3),true);
  assert.ok(state.cpu.x>start,'CPU moves away when the reaction window ends');
 }
});

test('DriveAI dispatches hazard avoidance while retaining the four-button input contract',()=>{
 assert.match(engine,/this\.reactToMagicHazard\(p,dt,ai\.reaction\)/);
 assert.match(fs.readFileSync('src/modules/input.js','utf8'),/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
});
