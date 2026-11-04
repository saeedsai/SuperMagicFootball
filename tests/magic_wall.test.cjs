'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const abilities=fs.readFileSync('src/modules/abilities.js','utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/export \{ABILITIES\};?/,'' );
const ABILITIES=vm.runInNewContext(abilities+'\nABILITIES;',{
 GAME_ASSETS:{mechanics},SPECIALS:{abilityLevel:()=>2,levelModifiers:()=>({fatigue:1})},
 STATS:{verifiedRatingTierForPlayer:()=> 'Gold'}
});
const method=(name,next,globals)=>{
 const start=engine.indexOf(`\n ${name}(`),end=engine.indexOf(`\n ${next}(`,start);
 assert.ok(start>0&&end>start,`extract ${name}`);
 return vm.runInNewContext('({'+engine.slice(start,end)+'})',globals)[name];
};
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const F=mechanics.world.field;
const activate=method('activateDefence','activateKeeperSuper',{
 fieldAbility:ABILITIES.fieldAbility,abilityReady:(p,m)=>!!(m&&p.stun<=0&&p.abilityCd<=0&&p.fatigue+m.cost<=.98),
 abilityLevel:()=>2,levelModifiers:()=>({stun:1}),distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 norm:(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}},clamp,F,
 stat:(p,k)=>p.src?.[k]??55,impactStun:()=>.7
});
const resolvePlayers=method('resolveMagicWalls','updateMagicWalls',{clamp,F});
const updateWalls=method('updateMagicWalls','updateSupernova',{clamp,F});
const collideBall=method('resolveMagicWallBall','updateBall',{clamp,F});

function setup(side=0){
 const p={t:side,x:F.x+F.w*(side===0?.36:.64),y:F.y+F.h*.5,face:side===0?1:-1,keeper:false,
  stun:0,invuln:0,cd:0,abilityCd:0,fatigue:0,
  src:{id:'wall-defender',name:'Wall Defender',role:'DF',superDefenceLevel:2,
   superAbility:{type:'defence',id:'magicWall',level:2},aggression:65,defence:70}};
 const events=[],effects=[];
 const game={players:[p],ball:{owner:null,x:p.x,y:p.y,z:0,vx:0,vy:0,vz:0},magicWalls:[],
  spendStamina:(player,kind)=>{effects.push(['stamina',kind]);player.fatigue+=.065},
  burst:(...args)=>effects.push(['burst',...args]),emit:(type,data)=>events.push({type,...data}),shake:0};
 return {game,p,events,effects};
}
const wall={team:0,x:600,y:500,halfLength:104,thickness:13,height:66,duration:1,arm:0};

test('SD11 wall is a bounded defender move with existing action, cooldown, fatigue and a single active barrier cap',()=>{
 const def=mechanics.defensiveAbilities.magicWall;
 assert.equal(def.cooldown,12);assert.equal(def.cost,.065);assert.equal(def.range,112);
 assert.equal(def.halfLength,104);assert.equal(def.duration,2.4);assert.equal(def.height,66);
 assert.ok(ABILITIES.studioDefenceChoices({role:'DF'},1).some(m=>m.id==='magicWall'));
 assert.equal(ABILITIES.withStudioDefence({id:'d',role:'DF'},'magicWall',1).superAbility.id,'magicWall');
 for(const side of [0,1]){
  const {game,p,events,effects}=setup(side);
  assert.equal(activate.call(game,p),true);
  const placed=game.magicWalls[0];assert.equal(game.magicWalls.length,1);assert.equal(placed.team,side);
  assert.equal(placed.arm,.35);assert.equal(placed.duration,2.4);
  assert.ok(placed.x>=F.x+def.thickness&&placed.x<=F.x+F.w-def.thickness);
  assert.ok(placed.y>=F.y+def.halfLength&&placed.y<=F.y+F.h-def.halfLength);
  assert.equal(p.abilityCd,12);assert.ok(Math.abs(p.fatigue-.065)<1e-9);assert.equal(p.action,'defenceSuper');
  assert.equal(events[0].id,'magicWall');assert.equal(events[0].hits,0);
  p.abilityCd=0;assert.equal(activate.call(game,p),false,'active wall blocks repeat placement');
  assert.equal(game.magicWalls.length,1);assert.equal(effects.filter(x=>x[0]==='stamina').length,1);
  p.abilityCd=0;game.magicWalls[0].team=1-side;
  assert.equal(activate.call(game,p),false,'an opposing active wall also blocks stacking');
  assert.equal(game.magicWalls.length,1);assert.equal(effects.filter(x=>x[0]==='stamina').length,1);
 }
});

test('only an opposing grounded player collides; an active SHOOT slide explicitly breaks the wall',()=>{
 const game={magicWalls:[{...wall}],players:[],events:[],bursts:[],
  burst(...a){this.bursts.push(a)},emit(type,data){this.events.push({type,...data})}};
 const rival={t:1,keeper:false,z:0,stun:0,x:wall.x+5,y:wall.y,face:1,moveVX:90,dx:90,action:'run',actionTimer:.2,src:{name:'Rival'}};
 const ally={...rival,t:0,x:wall.x+4};const keeper={...rival,keeper:true,x:wall.x+3};
 game.players=[rival,ally,keeper];resolvePlayers.call(game);
 assert.ok(rival.x>wall.x+wall.thickness);assert.equal(rival.moveVX,0);assert.equal(ally.x,wall.x+4);assert.equal(keeper.x,wall.x+3);
 const slider={...rival,t:1,x:wall.x,y:wall.y,action:'slide',actionTimer:.3,z:0,src:{name:'Slider'}};
 game.players=[slider];resolvePlayers.call(game);
 assert.equal(game.magicWalls.length,0);assert.equal(game.events[0].type,'magicWallCounter');assert.equal(game.events[0].counter,'slide');
});

test('wall deflects low opposing balls, ignores high, friendly and off-segment balls',()=>{
 for(const side of [0,1]){
  const current={x:wall.x+(side===0?24:-24),y:wall.y,z:15,vx:side===0?260:-260,vy:0,vz:0,attacker:1-side,canCollect:0,shot:{},strike:{},trail:[1]};
  const game={ball:current,magicWalls:[{...wall,team:side}],events:[],effects:[],burst(...a){this.effects.push(a)},emit(type,data){this.events.push({type,...data})}};
  const before={x:wall.x+(side===0?-24:24),y:wall.y,z:15};
  assert.equal(collideBall.call(game,before),true);
  assert.ok(Math.abs(current.vx-(side===0?-72.8:72.8))<1e-9);assert.equal(current.shot,null);assert.equal(current.strike,null);
  assert.equal(game.events[0].type,'magicWallBall');
 }
 for(const changes of [{z:70},{attacker:0},{y:wall.y+wall.halfLength+30}]){
  const ball={x:wall.x+5,y:wall.y,z:15,vx:100,vy:0,vz:0,attacker:1,canCollect:0};Object.assign(ball,changes);
  const game={ball,magicWalls:[{...wall}],burst(){},emit(){throw Error('must not collide')}};
  assert.equal(collideBall.call(game,{x:wall.x-20,y:changes.y??wall.y,z:15}),false);
 }
});

test('wall expires, expires in bounded time, and kickoff reset clears wall state',()=>{
 const game={magicWalls:[{...wall,duration:.1}],events:[],bursts:[],burst(...a){this.bursts.push(a)},emit(type,data){this.events.push({type,...data})}};
 updateWalls.call(game,.11);assert.equal(game.magicWalls.length,0);assert.equal(game.events[0].type,'magicWallExpired');
 assert.match(engine,/this\.magicWalls=\[\];this\.supernova=null;this\.spawnPlayers\(\)/,'kickoff clears temporary defenses');
 assert.match(engine,/this\.resolvePlayerContacts\(dt\);this\.resolveMagicWalls\(\);this\.updateMagicWalls\(dt\);/);
 assert.match(fs.readFileSync('src/modules/render.js','utf8'),/drawMagicWalls\(ctx,game\.magicWalls/,'renders a visible arming/live cue');
});
