'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const abilitySource=fs.readFileSync('src/modules/abilities.js','utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/export \{ABILITIES\};?/,'');
const ABILITIES=vm.runInNewContext(abilitySource+'\nABILITIES;',{
 GAME_ASSETS:{mechanics},STATS:{verifiedRatingTierForPlayer:p=>p?.verifiedTier||null},SPECIALS:{abilityLevel:()=>2,levelModifiers:()=>({fatigue:1})}
});
const methodStart=engine.indexOf('\n activateDefence(p){');
const methodEnd=engine.indexOf('\n activateKeeperSuper(',methodStart);
assert.ok(methodStart>0&&methodEnd>methodStart,'extract the real field-defense activation method');
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m};};
const activate=vm.runInNewContext('({'+engine.slice(methodStart,methodEnd)+'})',{
 fieldAbility:ABILITIES.fieldAbility,
 abilityReady:(p,move)=>!!(move&&p.stun<=0&&p.abilityCd<=0&&p.fatigue+move.cost<=.98),
 abilityLevel:()=>2,levelModifiers:()=>({stun:1}),distance,norm,clamp,
 F:mechanics.world.field,
 stat:(p,key)=>p.src?.[key]??55,
 impactStun:()=>.8
}).activateDefence;
const resolveMaceSweep=vm.runInNewContext('({'+engine.slice(engine.indexOf('\n resolveMaceSweep(p){'),engine.indexOf('\n updateMaceSweep(',engine.indexOf('\n resolveMaceSweep(p){')))+'})',{
 fieldAbility:ABILITIES.fieldAbility,abilityLevel:()=>2,levelModifiers:()=>({stun:1}),distance,norm,clamp,
 F:mechanics.world.field,stat:(p,key)=>p.src?.[key]??55,impactStun:()=>.8
}).resolveMaceSweep;

function setup(side=0,overrides={}){
 const face=side===0?1:-1;
 const p={t:side,x:1100,y:620,face,keeper:false,stun:0,invuln:0,cd:0,abilityCd:0,fatigue:0,
  src:{id:'defender',name:'Defender',role:'DF',superDefenceLevel:2,
   superAbility:{type:'defence',id:'maceSweep',level:2},aggression:70,defence:70}};
 const q={t:1-side,x:p.x+face*92,y:p.y+12,z:0,keeper:false,stun:0,invuln:0,dashTimer:0,
  src:{id:'carrier',name:'Carrier',strength:60,defence:60},...overrides};
 const friend={t:side,x:p.x+face*38,y:p.y,keeper:false,stun:0,invuln:0,src:{id:'friend'}};
 const events=[],effects=[];
 const game={players:[p,q,friend],ball:{owner:q,x:q.x,y:q.y,z:0,vx:0,vy:0,vz:0},
  spendStamina:(player,kind)=>{effects.push(['stamina',kind]);player.fatigue+=mechanics.defensiveAbilities.maceSweep.cost;},
  burst:(...args)=>effects.push(['burst',...args]),emit:(type,data)=>events.push({type,...data}),shake:0};
 return {game,p,q,friend,events,effects};
}

// Acceptance: a defender can equip the move, and its existing icon/cost catalogues resolve it.
test('SD10 MACE-SWEEP-01: defender equipment, icon, and shared fatigue cost are wired',()=>{
 const move=mechanics.defensiveAbilities.maceSweep;
 assert.equal(move.cooldown,10);assert.equal(move.cost,.065);assert.equal(move.range,148);
 assert.ok(ABILITIES.studioDefenceChoices({role:'DF'},1).some(x=>x.id==='maceSweep'));
 const equipped=ABILITIES.withStudioDefence({id:'stable',role:'DF',verifiedTier:'Gold'},'maceSweep',1);
 assert.equal(equipped.superAbility.id,'maceSweep');
 const fitness=fs.readFileSync('src/modules/fitness.js','utf8');
 assert.match(fitness,/defenceSuper:\.065/,'mace uses the established defenceSuper fatigue rate');
 const icons=fs.readFileSync('src/modules/ability-icons.js','utf8');
 assert.match(icons,/maceSweep:\['⚒️','#ffbd52'\]/);
});

// Acceptance: mirrored front-arc hits are single-target, bounded, readable and charge once.
test('SD10 MACE-SWEEP-02: mirrored forward sweep staggers, dislodges and pushes one carrier',()=>{
 for(const side of [0,1]){
  const {game,p,q,friend,events,effects}=setup(side);
  const oldX=q.x;
  assert.equal(activate.call(game,p),true);
  assert.equal(q.stun,0);
  assert.equal(p.maceSweepPending.remaining,.24);
  assert.equal(events[0].type,'maceSweepTelegraph');assert.equal(events[0].seconds,.24);
  assert.equal(resolveMaceSweep.call(game,p),true);
  assert.equal(q.action,'hurt');assert.ok(q.stun>0&&q.stun<=.58);
  assert.equal(q.invuln,1.1);assert.equal(friend.stun,0,'no friendly fire');
  assert.ok(Math.abs(q.x-oldX)>20,'push is directed away from the defender');
  assert.equal(game.ball.owner,null,'ball carrier loses possession');
  assert.equal(game.ball.vx,side===0?280:-280,'ball is released away from the defender in mirrored play');
  assert.equal(p.abilityCd,10);assert.equal(p.fatigue,.065);
  assert.equal(p.action,'defenceSuper');assert.equal(events[1].type,'defenceSuper');
  assert.equal(events[1].id,'maceSweep');assert.equal(events[1].hits,1);
  assert.ok(effects.some(x=>x[0]==='burst'&&x[3]==='#ffbd52'),'uses a distinct, non-graphic color cue');
  assert.equal(activate.call(game,p),false,'cooldown blocks repeat activation');
 }
});

// Acceptance: no valid forward grounded target means no cooldown, stamina, hit or visual event.
test('SD10 MACE-SWEEP-03: rear, wide, airborne, dashing and non-defender cases cost nothing',()=>{
 for(const [label,opts] of [
  ['behind',{x:1060,y:620}],
  ['outside arc',{x:1190,y:620+100}],
  ['airborne',{z:21}],
  ['dashing',{dashTimer:.2}],
 ]){
  const {game,p,q,events,effects}=setup(0,opts);
  if(label==='behind')q.x=opts.x;
  if(label==='outside arc'){q.x=opts.x;q.y=opts.y;}
  assert.equal(activate.call(game,p),false,label);
  assert.equal(p.abilityCd,0,label+' does not spend cooldown');
  assert.equal(p.fatigue,0,label+' does not spend stamina');
  assert.equal(q.stun,0);assert.equal(game.ball.owner,q);
  assert.equal(events.length,0);assert.equal(effects.length,0);
 }
 const {game,p,q,events,effects}=setup();p.src.role='MF';
 assert.equal(activate.call(game,p),false,'only a field defender can use the move');
 assert.equal(p.abilityCd,0);assert.equal(p.fatigue,0);assert.equal(q.stun,0);
 assert.equal(events.length,0);assert.equal(effects.length,0);
});

// Acceptance: four-button inputs stay unchanged; the move reuses the existing defense action/event.
test('SD10 MACE-SWEEP-04: existing four-action grammar and defense event are retained',()=>{
 const input=fs.readFileSync('src/modules/input.js','utf8');
 assert.match(input,/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
 assert.match(engine,/this\.emit\('defenceSuper',\{team:p\.t,player:p\.src\.name,id:move\.id/);
 assert.match(engine,/p\.action='defenceSuper'/);
});
