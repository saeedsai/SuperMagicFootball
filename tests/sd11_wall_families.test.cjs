'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const render=fs.readFileSync('src/modules/render.js','utf8');
const abilities=fs.readFileSync('src/modules/abilities.js','utf8').replace(/^import .*;\s*$/gm,'').replace(/export \{ABILITIES\};?/,'');
const ABILITIES=vm.runInNewContext(abilities+'\nABILITIES;',{GAME_ASSETS:{mechanics},SPECIALS:{abilityLevel:()=>1,levelModifiers:()=>({fatigue:1})},STATS:{verifiedRatingTierForPlayer:()=> 'Superstar'}});
const wallIds=['magicWall','fireWall','iceWall','demonWall'];
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),F=mechanics.world.field;
const method=(name,next,globals)=>{
 const start=engine.indexOf(`\n ${name}(`),end=engine.indexOf(`\n ${next}(`,start);assert.ok(start>0&&end>start,name);
 return vm.runInNewContext('({'+engine.slice(start,end)+'})',globals)[name];
};
const activate=method('activateDefence','activateKeeperSuper',{
 fieldAbility:ABILITIES.fieldAbility,abilityReady:(p,m)=>!!(m&&p.stun<=0&&p.abilityCd<=0&&p.fatigue+m.cost<=.98),
 abilityLevel:p=>p.src.superDefenceLevel,levelModifiers:()=>({stun:1}),distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 norm:(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}},clamp,F,stat:(p,k)=>p.src?.[k]??55,impactStun:()=>.7
});
const resolve=method('resolveMagicWalls','updateMagicWalls',{clamp,F});
const update=method('updateMagicWalls','updateSupernova',{clamp,F});
const collide=method('resolveMagicWallBall','updateBall',{clamp,F});
const base=mechanics.defensiveAbilities.magicWall;
function gameFor(id='magicWall'){
 const move=mechanics.defensiveAbilities[id],tier={magicWall:1,fireWall:2,iceWall:3,demonWall:4}[id];
 const p={t:0,x:F.x+F.w*.36,y:F.y+F.h*.5,face:1,keeper:false,stun:0,abilityCd:0,cd:0,fatigue:0,
  src:{id:'wall-defender',name:'Defender',role:'DF',superDefenceLevel:tier,superAbility:{type:'defence',id,level:tier}}};
 const events=[],bursts=[];const game={players:[p],ball:{owner:null,x:p.x,y:p.y,z:0,vx:0,vy:0,vz:0},magicWalls:[],
  options:{reducedFlash:false},spendStamina(q,kind){q.fatigue+=move.cost;},burst(...args){bursts.push(args)},emit(type,data){events.push({type,...data})},shake:0};
 return {game,p,events,bursts,move};
}
test('SD11 all four wall choices are level-gated DF options with identical physics envelopes',()=>{
 const keys=['cooldown','cost','range','halfLength','thickness','duration','height'];
 for(const id of wallIds){const move=mechanics.defensiveAbilities[id];assert.equal(move.id,id);for(const key of keys)assert.equal(move[key],base[key],`${id}.${key}`);}
 assert.equal(new Set(wallIds.map(id=>mechanics.defensiveAbilities[id].color)).size,4);
 for(const [tier,expected] of [[1,['magicWall']],[2,['magicWall','fireWall']],[3,['magicWall','fireWall','iceWall']],[4,wallIds]]){
  const choices=ABILITIES.studioDefenceChoices({role:'DF'},tier).filter(x=>wallIds.includes(x.id)).map(x=>x.id);
  assert.deepEqual(Array.from(choices).sort(),expected.slice().sort(),`tier ${tier}`);
 }
 assert.deepEqual(Array.from(ABILITIES.studioDefenceChoices({role:'MF'},4)).map(x=>x.id),[]);
 for(const [id,tier] of [['fireWall',1],['iceWall',2],['demonWall',3]])assert.throws(()=>ABILITIES.withStudioDefence({role:'DF'},id,tier),/requires defence tier/);
 for(const [id,tier] of [['magicWall',1],['fireWall',2],['iceWall',3],['demonWall',4]])assert.equal(ABILITIES.withStudioDefence({id:'d',role:'DF'},id,tier).superAbility.id,id);
});
test('SD11 each family uses the same bounded placement, activation cost, active-wall cap and expiry',()=>{
 for(const id of wallIds){
  const {game,p,events,move}=gameFor(id);assert.equal(activate.call(game,p),true);
  const wall=game.magicWalls[0];assert.equal(game.magicWalls.length,1);assert.equal(wall.id,id);assert.equal(wall.color,move.color);
  assert.equal(wall.x,p.x+112);assert.equal(wall.y,p.y);assert.equal(wall.arm,.35);assert.equal(wall.duration,2.4);
  assert.equal(p.abilityCd,12);assert.equal(p.fatigue,.065);assert.equal(events[0].id,id);assert.equal(events[0].hits,0);
  p.abilityCd=0;assert.equal(activate.call(game,p),false,'the shared one-wall cap prevents stacking');
  game.magicWalls=[{...wall,duration:.1}];update.call(game,.11);assert.equal(game.magicWalls.length,0);
  assert.equal(events.find(e=>e.type==='magicWallExpired').id,id);
 }
 assert.match(engine,/this\.magicWalls=\[\];this\.supernova=null;this\.spawnPlayers\(\)/,'kickoff clears all temporary wall families');
});
test('SD11 all wall variants share grounded player/slide/ball collision outcomes',()=>{
 for(const id of wallIds){
  const wall={id,team:0,x:600,y:500,halfLength:104,thickness:13,height:66,duration:1,arm:0,
   particleColor:mechanics.defensiveAbilities[id].particleColor||mechanics.defensiveAbilities[id].color};
  const rival={t:1,keeper:false,z:0,stun:0,x:605,y:500,face:1,moveVX:90,dx:90,action:'run',actionTimer:.2,src:{name:'Rival'}};
  const game={magicWalls:[{...wall}],players:[rival],events:[],bursts:[],burst(...a){this.bursts.push(a)},emit(type,data){this.events.push({type,...data})}};
  resolve.call(game);assert.equal(rival.x,wall.x+wall.thickness+19,id+' blocks at the baseline position');
  const slider={...rival,t:1,x:wall.x,y:wall.y,z:0,stun:0,action:'slide',actionTimer:.3,src:{name:'Slider'}};
  game.magicWalls=[{...wall}];game.players=[slider];resolve.call(game);
  assert.equal(game.magicWalls.length,0);assert.equal(game.events.at(-1).type,'magicWallCounter');assert.equal(game.events.at(-1).id,id);
  assert.ok(game.bursts.at(-1)[2]===wall.particleColor,'type-specific counter particles keep wall identity');
  for(const side of [0,1]){
   const ball={x:wall.x+(side?-24:24),y:wall.y,z:15,vx:side?-260:260,vy:0,vz:0,attacker:1-side,canCollect:0,shot:{},strike:{},trail:[1]};
   const ballGame={ball,magicWalls:[{...wall,team:side?1:0}],events:[],bursts:[],burst(...a){this.bursts.push(a)},emit(type,data){this.events.push({type,...data})}};
   assert.equal(collide.call(ballGame,{x:wall.x+(side?24:-24),y:wall.y,z:15}),true);
   assert.ok(Math.abs(ball.vx-(side?72.8:-72.8))<1e-9);assert.equal(ball.shot,null);assert.equal(ball.strike,null);
   assert.equal(ballGame.events[0].type,'magicWallBall');assert.equal(ballGame.events[0].id,id);
  }
 }
});
test('SD11 Canvas profiles have separate procedural silhouettes and reduced-flash handling',()=>{
 for(const id of ['fireWall','iceWall','demonWall'])assert.match(render,new RegExp(`id==='${id}'`));
 assert.match(render,/drawMagicWalls\(ctx,game\.magicWalls,!!game\.options\?\.reducedFlash\)/);
 assert.match(render,/arming&&!reducedFlash\?\[8,7\]:\[\]/);
 assert.match(render,/wall\.id\|\|'magicWall'/);
});
