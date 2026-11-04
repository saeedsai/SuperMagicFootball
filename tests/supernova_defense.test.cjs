'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const render=fs.readFileSync('src/modules/render.js','utf8');
const abilitySource=fs.readFileSync('src/modules/abilities.js','utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/export \{ABILITIES\};?/,'' );
const ABILITIES=vm.runInNewContext(abilitySource+'\nABILITIES;',{
 GAME_ASSETS:{mechanics},SPECIALS:{abilityLevel:()=>2,levelModifiers:()=>({fatigue:1})},
 STATS:{verifiedRatingTierForPlayer:()=> 'Gold'}
});
const method=(name,next,globals)=>{
 const start=engine.indexOf(`\n ${name}(`),end=engine.indexOf(`\n ${next}(`,start);
 assert.ok(start>0&&end>start,`extract ${name}`);
 return vm.runInNewContext('({'+engine.slice(start,end)+'\n})',globals)[name];
};
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const F=mechanics.world.field;
const activate=method('activateDefence','activateKeeperSuper',{
 fieldAbility:ABILITIES.fieldAbility,abilityReady:(p,m)=>!!(m&&p.stun<=0&&p.abilityCd<=0&&p.fatigue+m.cost<=.98),
 abilityLevel:()=>2,levelModifiers:()=>({stun:1}),distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 norm:(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}},clamp,F,
 stat:(p,k)=>p.src?.[k]??55,impactStun:()=>.7
});
const updateNova=method('updateSupernova','tryDribbleTrick',{clamp,F,norm:(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}}});

function setup(side=0,reducedFlash=false){
 const centerX=F.x+F.w*.5,centerY=F.y+F.h*.5;
 const p={t:side,x:centerX+(side===0?-90:90),y:centerY,face:side===0?1:-1,keeper:false,
  stun:0,invuln:0,cd:0,abilityCd:0,fatigue:0,
  src:{id:'nova-defender',name:'Nova Defender',role:'DF',superDefenceLevel:2,
   superAbility:{type:'defence',id:'supernova',level:2},aggression:65,defence:70}};
 const events=[],effects=[];
 const game={players:[p],ball:{owner:null,x:centerX,y:centerY,z:0,vx:0,vy:0,vz:0,attacker:1-side,canCollect:0},
  magicWalls:[],supernova:null,options:{reducedFlash},flash:0,shake:0,events,
  spendStamina:(player,kind)=>{effects.push(['stamina',kind]);player.fatigue+=.065},
  burst:(...args)=>effects.push(['burst',...args]),emit:(type,data)=>events.push({type,...data})};
 return {game,p,events,effects,centerX,centerY};
}

test('SD12 activation uses existing defender action, has strict bounded telegraph, cooldown, cost and no stacking',()=>{
 const move=mechanics.defensiveAbilities.supernova;
 assert.equal(move.cooldown,16);assert.equal(move.cost,.065);assert.equal(move.radius,142);assert.equal(move.telegraph,.85);
 assert.ok(ABILITIES.studioDefenceChoices({role:'DF'},1).some(m=>m.id==='supernova'));
 assert.equal(ABILITIES.withStudioDefence({id:'d',role:'DF'},'supernova',1).superAbility.id,'supernova');
 for(const side of [0,1]){
  const {game,p,events,effects,centerX,centerY}=setup(side);
  assert.equal(activate.call(game,p),true);
  assert.equal(game.supernova.team,side);assert.equal(game.supernova.x,p.x);assert.equal(game.supernova.y,p.y);
  assert.equal(game.supernova.radius,142);assert.equal(game.supernova.remaining,.85);assert.equal(game.supernova.telegraph,.85);
  assert.equal(p.abilityCd,16);assert.ok(Math.abs(p.fatigue-.065)<1e-9);assert.equal(p.action,'defenceSuper');
  assert.equal(events[0].type,'supernovaTelegraph');assert.equal(events[0].radius,142);assert.equal(events[0].seconds,.85);
  assert.ok(Math.hypot(centerX-p.x,centerY-p.y)<move.radius);
  p.abilityCd=0;assert.equal(activate.call(game,p),false,'cannot stack an active telegraph');
  assert.equal(effects.filter(e=>e[0]==='stamina').length,1);
  p.abilityCd=0;game.magicWalls=[{team:1-side}];
  assert.equal(activate.call(game,p),false,'cannot stack a nova on an active Magic Wall');
  assert.equal(effects.filter(e=>e[0]==='stamina').length,1);
 }
});

test('nova waits through its telegraph, hits only in-radius grounded rivals, and respects jump/slide counters',()=>{
 for(const side of [0,1]){
  const {game,p,events}=setup(side);
  const target={t:1-side,x:p.x+p.face*55,y:p.y,z:0,stun:0,action:'idle',actionTimer:0,keeper:false,src:{name:'Target'}};
  const jumper={...target,x:p.x+p.face*80,z:24,src:{name:'Jumper'}};
  const slider={...target,x:p.x+p.face*105,action:'slide',actionTimer:.2,src:{name:'Slider'}};
  const escaped={...target,x:p.x+p.face*185,src:{name:'Escaped'}};
  const keeper={...target,x:p.x+p.face*20,keeper:true,src:{name:'Keeper'}};
  const friend={...target,t:side,x:p.x+p.face*20,src:{name:'Friend'}};
  game.players=[p,target,jumper,slider,escaped,keeper,friend];
  game.supernova={team:side,x:p.x,y:p.y,radius:142,remaining:.85,telegraph:.85,stun:.72,push:48};
  updateNova.call(game,.84);
  assert.ok(game.supernova&&game.supernova.remaining>0);assert.equal(target.stun,0,'no early damage');
  updateNova.call(game,.02);
  assert.equal(game.supernova,null);assert.equal(target.stun,.72);assert.equal(target.action,'hurt');
  assert.equal(jumper.stun,0);assert.equal(slider.stun,0);assert.equal(escaped.stun,0);assert.equal(keeper.stun,0);assert.equal(friend.stun,0);
  assert.equal(events.at(-1).hits,1);assert.equal(events.at(-1).evaded,2);
  assert.ok(Math.abs(target.x-(p.x+p.face*103))<1e-9,'push direction mirrors with the defending side');
 }
});

test('nova can dislodge a carrier or deflect a loose opposing ball with a bounded impulse',()=>{
 const {game,p}=setup(0);const carrier={t:1,x:p.x+40,y:p.y,z:0,stun:0,action:'idle',actionTimer:0,keeper:false,src:{name:'Carrier'}};
 game.players=[p,carrier];game.ball.owner=carrier;game.supernova={team:0,x:p.x,y:p.y,radius:142,remaining:.01,telegraph:.85,stun:.72,push:48};
 updateNova.call(game,.02);
 assert.equal(game.ball.owner,null);assert.ok(Math.hypot(game.ball.vx,game.ball.vy)<=205.001);
 const loose=setup(0);loose.game.ball={owner:null,x:p.x+30,y:p.y,z:20,vx:0,vy:0,vz:0,attacker:1,canCollect:0};
 loose.game.players=[loose.p];loose.game.supernova={team:0,x:loose.p.x,y:loose.p.y,radius:142,remaining:.01,telegraph:.85,stun:.72,push:48};
 updateNova.call(loose.game,.02);
 assert.ok(Math.abs(Math.hypot(loose.game.ball.vx,loose.game.ball.vy)-245)<1e-9);assert.equal(loose.game.ball.vz,120);
});

test('reduced-flash mode keeps the same gameplay and telegraph while suppressing screen flash and shake',()=>{
 const {game,p,effects}=setup(0,true);assert.equal(activate.call(game,p),true);
 assert.equal(game.flash,0);assert.equal(game.shake,0);assert.equal(effects.at(-1)[4],4,'activation emits fewer particles');
 const eventCount=game.events.length;game.players=[p,{t:1,x:p.x+15,y:p.y,z:0,stun:0,action:'idle',actionTimer:0,keeper:false,src:{name:'Rival'}}];
 updateNova.call(game,.86);
 assert.equal(game.events.length,eventCount+1);assert.equal(game.events.at(-1).hits,1);
 assert.equal(game.flash,0);assert.equal(game.shake,0);assert.equal(effects.at(-1)[4],5,'impact remains localized in reduced-flash mode');
 assert.equal(mechanics.defaultOptions.reducedFlash,false);
 assert.match(render,/function drawSupernova\(ctx,nova,reducedFlash=false\)/);
 assert.match(render,/this\.drawSupernova\(ctx,game\.supernova,!!game\.options\?\.reducedFlash\)/);
 assert.match(render,/ctx\.arc\(nova\.x,nova\.y,nova\.radius/,'full blast radius is visible during the strict telegraph');
 assert.match(engine,/this\.supernova=null;this\.spawnPlayers\(\)/,'kickoff clears any telegraph');
});

test('Supernova reduced-flash fallback respects OS motion preference unless saved explicitly',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 const start=ui.indexOf("const storedOptions=store.get('options',{}),opt={...DEFAULT_OPTIONS,...storedOptions};");
 const end=ui.indexOf('input.setBindings(',start);
 assert.ok(start>=0&&end>start,'the installed settings loader preserves the reduced-flash preference');
 const source=ui.slice(start,end)+'\nthis.result=opt;';
 const create=(saved,systemReduced)=>{const context={DEFAULT_OPTIONS:{reducedFlash:false,ballModel:'classic',stadium:'classic'},STADIUMS:mechanics.stadiums,store:{get:()=>saved},matchMedia:()=>({matches:systemReduced}),VISUALFEEL:{validBallModel:value=>value},renderer:{setRenderQuality(){}}};vm.runInNewContext(source,context);return context.result;};
 assert.equal(create({},true).reducedFlash,true,'first launch follows OS preference');
 assert.equal(create({reducedFlash:false},true).reducedFlash,false,'saved explicit opt-out wins');
 assert.equal(create({reducedFlash:true},false).reducedFlash,true,'saved explicit opt-in stays enabled');
});
