'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const hazardModelPromise=import('../src/modules/magic-hazards.js');
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
 const cpu={t:side,x:radius+5,y:0,keeper:false,z:0,stun:0,action:'run',actionTimer:0,jumpHold:0,jumpCount:0,
  src:{speedRating:60},breath:100,morale:55,aiHazardKey:null,aiHazardReaction:0,aiHazardEvading:false};
 const game={players:[cpu],ball:{owner:null},magicHazards:[{kind,team:1-side,x:0,y:0,life:2.5,arm:0}],cpuLevel:()=>2,playerSpeed:()=>300,
  moveAgile(p,x,y,speed,dt){p.x+=x*speed*dt;p.y+=y*speed*dt;},
  jump(p){p.z=10;p.vz=420;p.jumpCount=1;p.action='jump';p.actionTimer=.5;return true;},staminaTick(){}};
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
 for(const patch of [{keeper:true},{z:30},{action:'slide',actionTimer:.2},{z:10,action:'jump',actionTimer:.2,jumpCount:1}]){
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

 
test('CPU clears a directly-ahead enemy Banana Peel or Ice Patch with the existing SHOOT slide',async()=>{
 const {disarmMagicHazards}=await import('../src/modules/magic-hazards.js');
 for(const kind of ['banana','ice'])for(const side of [0,1]){
  const {game,cpu}=setup(side,kind);
  cpu.dx=-1;cpu.dy=0;cpu.face=-1;cpu.cd=0;cpu.fatigue=.1;cpu.action='run';
  let slides=0;
  game.tackle=(player,slide)=>{
   slides++;
   if(!slide)return false;
   player.action='slide';player.actionTimer=.34;return true;
  };
  assert.equal(react.call(game,cpu,.016,0),true,kind+' team '+side);
  assert.equal(slides,1,'one normal SHOOT slide is committed');
  const cleared=disarmMagicHazards(game.magicHazards,game.players);
  assert.equal(cleared.disarmed.length,1);
  assert.equal(cleared.disarmed[0].player,cpu);
  assert.equal(cleared.hazards.length,0);
 }
});

test('CPU waits for its reaction delay before sweeping a trap in its path',()=>{
 const {game,cpu}=setup(0,'ice');
 cpu.x=65;cpu.dx=-1;cpu.dy=0;cpu.face=-1;cpu.cd=0;cpu.fatigue=.1;
 let slides=0;
 game.tackle=(player,slide)=>{slides++;player.action='slide';player.actionTimer=.34;return slide;};
 assert.equal(react.call(game,cpu,.1,.3),false);
 assert.equal(react.call(game,cpu,.1,.3),false);
 assert.equal(slides,0);
 assert.equal(react.call(game,cpu,.1,.3),true);
 assert.equal(slides,1);
});

test('CPU uses the existing JUMP when carrying or when a safe trap-clearing slide is blocked',()=>{
 for(const mode of ['carrying','opponent','teammate']){
  const {game,cpu}=setup(0,'banana');
  cpu.dx=-1;cpu.dy=0;cpu.face=-1;cpu.cd=0;cpu.fatigue=.1;
  if(mode==='carrying')game.ball.owner=cpu;
  if(mode==='opponent')game.players.push({t:1,x:cpu.x-20,y:0,z:0,stun:0,invuln:0,keeper:false,action:'run'});
  if(mode==='teammate')game.players.push({t:0,x:cpu.x+2,y:0,z:0,stun:0,keeper:false,action:'slide',actionTimer:.25});
  let slides=0,jumps=0;game.tackle=()=>{slides++;return true;};
  const baseJump=game.jump;game.jump=p=>{jumps++;return baseJump(p);};
  assert.equal(react.call(game,cpu,.016,0),true,mode);
  assert.equal(slides,0,mode+' must not commit a clearing slide');
  assert.equal(jumps,1,mode+' uses the existing JUMP counter');
  assert.equal(cpu.action,'jump');
  assert.equal(cpu.jumpCount,1);
  assert.equal(cpu.aiHazardEvading,true);
  assert.equal(game.ball.owner===cpu,mode==='carrying','the carrier keeps possession through the hop');
 }
});


test('an active first-frame JUMP counters Banana and Ice before vertical lift reaches 20',async()=>{
 const model=await hazardModelPromise;
 for(const kind of ['banana','ice']){
  const active=kind==='banana'?model.placeBananaPeel([],carrier,field):model.placeIcePatch([],carrier,field);
  const jumper={...rival,z:10,action:'jump',actionTimer:.5,jumpCount:1};
  const result=kind==='banana'?model.advanceBananaPeels(active,[jumper],.4):model.advanceIcePatches(active,[jumper],.4);
  assert.equal(result.slips.length,0,kind+' active JUMP must evade on its first lift frame');
  assert.equal(result.hazards.length,1,kind+' trap remains available after the dodge');
  const expired={...jumper,actionTimer:0};
  const expiredResult=kind==='banana'?model.advanceBananaPeels(active,[expired],.4):model.advanceIcePatches(active,[expired],.4);
  assert.equal(expiredResult.slips.length,1,kind+' expired JUMP is not a counter');
  const notJumping={...jumper,jumpCount:0};
  const groundedResult=kind==='banana'?model.advanceBananaPeels(active,[notJumping],.4):model.advanceIcePatches(active,[notJumping],.4);
  assert.equal(groundedResult.slips.length,1,kind+' missing jump count is not a counter');
 }
});
