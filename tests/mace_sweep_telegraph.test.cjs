'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8'),render=fs.readFileSync('src/modules/render.js','utf8');
const abilitySource=fs.readFileSync('src/modules/abilities.js','utf8').replace(/^import .*;\s*$/gm,'').replace(/export \{ABILITIES\};?/,'');
const ABILITIES=vm.runInNewContext(abilitySource+'\nABILITIES;',{
 GAME_ASSETS:{mechanics},STATS:{verifiedRatingTierForPlayer:p=>p?.verifiedTier||null},
 SPECIALS:{abilityLevel:()=>2,levelModifiers:()=>({fatigue:1})}
});
const F=mechanics.world.field,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};};
function method(name,next,globals={}){
 const a=engine.indexOf(`\n ${name}(`),b=engine.indexOf(`\n ${next}(`,a);
 assert.ok(a>=0&&b>a,`extract ${name}`);
 return vm.runInNewContext('({'+engine.slice(a,b)+'})',globals)[name];
}
const globals={fieldAbility:ABILITIES.fieldAbility,abilityReady:(p,m)=>!!(m&&p.stun<=0&&p.abilityCd<=0&&p.fatigue+m.cost<=.98),
 abilityLevel:()=>2,levelModifiers:()=>({stun:1}),distance,norm,clamp,F,stat:(p,k)=>p.src?.[k]??55,impactStun:()=>.8};
const activate=method('activateDefence','activateKeeperSuper',globals);
const resolve=method('resolveMaceSweep','updateMaceSweep',globals);
const update=method('updateMaceSweep','dribble',globals);
function setup(side=0,patch={}){
 const face=side===0?1:-1;
 const p={t:side,x:1100,y:620,face,keeper:false,stun:0,invuln:0,cd:0,abilityCd:0,fatigue:0,
  src:{id:'defender',name:'Defender',role:'DF',superDefenceLevel:2,dribbling:55,
   superAbility:{type:'defence',id:'maceSweep',level:2},aggression:70,defence:70}};
 const q={t:1-side,x:p.x+face*92,y:p.y+12,z:0,keeper:false,stun:0,invuln:0,dashTimer:0,action:'run',
  actionTimer:0,face:-face,dx:0,dy:0,src:{id:'carrier',name:'Carrier',strength:60,defence:60},...patch};
 const events=[],effects=[],game={players:[p,q],ball:{owner:q,x:q.x,y:q.y,z:0,vx:0,vy:0,vz:0},options:{},
  spendStamina(player,kind){effects.push(['stamina',kind]);player.fatigue+=mechanics.defensiveAbilities.maceSweep.cost;},
  burst(...args){effects.push(['burst',...args]);},emit(type,data){events.push({type,...data});},shake:0};
 return{game,p,q,events,effects};
}

test('Mace Sweep announces its target and gives a .24 second reaction window before any hit',()=>{
 for(const side of [0,1]){
  const {game,p,q,events,effects}=setup(side);
  assert.equal(activate.call(game,p),true);assert.equal(p.maceSweepPending.target,q);
  assert.equal(p.maceSweepPending.remaining,.24);assert.equal(q.stun,0);assert.equal(game.ball.owner,q);
  assert.equal(events[0].type,'maceSweepTelegraph');assert.equal(events[0].target,q.src.name);
  assert.equal(events[0].seconds,.24);assert.equal(events[0].range,mechanics.defensiveAbilities.maceSweep.range);
  assert.equal(p.abilityCd,10);assert.ok(Math.abs(p.fatigue-.065)<1e-9);
  assert.equal(effects.filter(e=>e[0]==='stamina').length,1);
 }
});

test('uncountered Mace Sweep resolves one bounded hit, releases possession, and preserves the old mirrored push',()=>{
 for(const side of [0,1]){
  const {game,p,q,events}=setup(side),startX=q.x;
  activate.call(game,p);assert.equal(resolve.call(game,p),true);
  assert.equal(q.action,'hurt');assert.ok(q.stun>0&&q.stun<=.58);assert.equal(q.invuln,1.1);
  assert.ok(Math.abs(q.x-startX)>20);assert.equal(game.ball.owner,null);
  assert.equal(game.ball.vx,side===0?280:-280);
  assert.equal(events.at(-1).type,'maceSweepResolved');assert.equal(events.at(-1).hit,true);
 }
});

test('grounded slide and facing defensive read counter the telegraph; jump, dash, arc exit, and lost target evade it',()=>{
 const cases=[
  [{action:'slide',actionTimer:.2,z:0},'slide'],
  [{face:-1,dx:-1,src:{defence:90}},'read'],
  [{z:21},'evade'],[{dashTimer:.2},'evade'],
  [{y:720},'evade'],[{remove:true},'evade']
 ];
 for(const [patch,counter] of cases){
  const {game,p,q,events}=setup(0);
  activate.call(game,p);
  if(patch.remove)game.players=game.players.filter(player=>player!==q);
  else Object.assign(q,patch);
  assert.equal(resolve.call(game,p),false);
  assert.equal(q.stun,0);assert.equal(game.ball.owner,q);
  assert.equal(events.at(-1)?.hit,false,`${counter} ${JSON.stringify(events)}`);
  if(counter==='slide'||counter==='read')assert.equal(events.at(-1).countered,true);
 }
});

test('caster stun interrupts without refund, timers resolve consistently at 30/60/120 Hz, and Canvas shows accessible counter cue',()=>{
 const interrupted=setup();activate.call(interrupted.game,interrupted.p);interrupted.p.stun=.2;
 assert.equal(update.call(interrupted.game,interrupted.p,1/60),false);
 assert.equal(interrupted.p.maceSweepPending,null);assert.equal(interrupted.q.stun,0);
 assert.equal(interrupted.events.at(-1).type,'maceSweepInterrupted');assert.equal(interrupted.p.abilityCd,10);
 for(const fps of [30,60,120]){
  const {game,p,q,events}=setup();activate.call(game,p);let frames=0;
  while(p.maceSweepPending?.remaining>1e-9&&frames<100){update.call(game,p,1/fps,true);frames++;}
  assert.equal(frames,Math.ceil(.24*fps-1e-9));assert.equal(p.maceSweepPending.remaining,0);
  resolve.call(game,p);assert.ok(q.stun>0);assert.equal(events.filter(e=>e.type==='defenceSuper'&&e.id==='maceSweep').length,1);
 }
 assert.match(engine,/this\.updateMaceSweep\(p,dt,true\)/);
 assert.match(engine,/this\.resolveMaceSweep\(p\)/);
 assert.match(render,/p\.maceSweepPending/);assert.match(render,/MACE · JUMP \/ SLIDE/);
 assert.match(render,/p\.maceSweepImpactFx/);
 const input=fs.readFileSync('src/modules/input.js','utf8');
 assert.match(input,/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
});
