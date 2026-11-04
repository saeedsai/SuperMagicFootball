'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const start=engine.indexOf('\n activateDefence(p){'),end=engine.indexOf('\n activateKeeperSuper(',start);
assert(start>=0&&end>start,'extract the actual field defense activation method');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const method=vm.runInNewContext('({'+engine.slice(start,end)+'})',{
 fieldAbility:src=>src?.superAbility?.type==='defence'?mechanics.defensiveAbilities[src.superAbility.id]:null,
 abilityReady:(p,m)=>!!(m&&p.stun<=0&&p.abilityCd<=0&&p.fatigue+m.cost<=.98),
 abilityLevel:p=>p.src.superDefenceLevel,levelModifiers:()=>({stun:1}),distance,norm:(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d}},clamp,
 F:mechanics.world.field,stat:(p,k)=>p.src?.[k]??55,impactStun:()=>.45
}).activateDefence;

function fixture(moveId,side=0,patch={}){
 const move=mechanics.defensiveAbilities[moveId],dir=side===0?1:-1;
 const attacker={t:side,x:1100,y:620,face:dir,keeper:false,stun:0,invuln:0,cd:0,abilityCd:0,fatigue:0,
  src:{id:'defender',name:'Defender',role:'DF',superDefenceLevel:2,superAbility:{type:'defence',id:moveId,level:2},aggression:60,defence:60}};
 const target={t:1-side,x:1100+dir*(moveId==='drill'?100:80),y:620,z:0,dashTimer:0,keeper:false,stun:0,invuln:0,
  action:'run',actionTimer:0,src:{id:'target',name:'Target',strength:60,defence:50},...patch};
 const events=[],effects=[],game={players:[attacker,target],ball:{owner:target,x:target.x,y:target.y,z:0,vx:0,vy:0,vz:0},
  spendStamina(p,key){effects.push(key);p.fatigue+=move.cost;},burst(){},emit(type,data){events.push({type,...data});},shake:0};
 return{game,attacker,target,events,effects};
}

test('grounded non-dashing players remain valid targets for immediate Drill and Shock Burst',()=>{
 for(const move of ['drill','burst'])for(const side of [0,1]){
  const {game,attacker,target,events,effects}=fixture(move,side);
  assert.equal(method.call(game,attacker),true,`${move} team ${side}`);
  assert.ok(target.stun>0);assert.equal(game.ball.owner,null);assert.ok(attacker.abilityCd>0);
  assert.ok(effects.length>0);assert.ok(events.some(e=>e.type==='defenceSuper'&&e.id===move));
 }
});

test('an active JUMP counters immediate defense for the full rising window at 30/60/120Hz',()=>{
 for(const move of ['drill','burst'])for(const side of [0,1])for(const hz of [30,60,120]){
  const state=fixture(move,side,{z:21,action:'jump',actionTimer:.42,jumpCount:1});
  const {game,attacker,target,events,effects}=state;let elapsed=0;
  while(elapsed<.12-1e-9){
   assert.equal(method.call(game,attacker),false,`${move} team ${side} ${hz}Hz airborne frame`);
   assert.equal(target.stun,0);assert.equal(attacker.abilityCd,0);assert.equal(effects.length,0);
   elapsed=Math.min(.12,elapsed+1/hz);target.actionTimer=Math.max(0,target.actionTimer-1/hz);
  }
  assert.equal(events.length,0);
  target.z=20;target.action='run';target.actionTimer=0;
  assert.equal(method.call(game,attacker),true,`${move} exact grounded threshold is still hittable`);
 }
});

test('an active DASH counters immediate defense until its timer expires at every simulation rate',()=>{
 for(const move of ['drill','burst'])for(const side of [0,1])for(const hz of [30,60,120]){
  const state=fixture(move,side,{dashTimer:.12}),{game,attacker,target,events,effects}=state;let elapsed=0;
  while(elapsed<.12-1e-9){
   assert.equal(method.call(game,attacker),false,`${move} team ${side} ${hz}Hz dash frame`);
   assert.equal(target.stun,0);assert.equal(attacker.abilityCd,0);assert.equal(effects.length,0);
   const step=Math.min(1/hz,.12-elapsed);elapsed+=step;target.dashTimer=Math.max(0,target.dashTimer-step);
  }
  assert.equal(events.length,0);assert.ok(target.dashTimer<1e-9);
  assert.equal(method.call(game,attacker),true,`${move} lands after dash recovery`);
 }
});

test('malformed counter state fails closed without spending a defensive move',()=>{
 for(const move of ['drill','burst'])for(const patch of [{z:NaN},{dashTimer:NaN}]){
  const {game,attacker,target,effects,events}=fixture(move,0,patch);
  assert.equal(method.call(game,attacker),false,`${move} ${JSON.stringify(patch)}`);
  assert.equal(target.stun,0);assert.equal(attacker.abilityCd,0);assert.equal(effects.length,0);assert.equal(events.length,0);
 }
});
