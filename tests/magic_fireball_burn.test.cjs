'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const render=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
const start=engine.indexOf(' tryMagicTrick(p){'),end=engine.indexOf(' updateSpinBumpFx(p,dt){',start);
assert.ok(start>0&&end>start,'real engine trick methods found');
const methods=engine.slice(start,end).replace(/}\r?\n (?=[A-Za-z_$][\w$]*\([^)]*\)\{)/g,'},\n');
const gameMethods=vm.runInNewContext('({'+methods+'})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??50,
 clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
 FIREBALL_BURN_SECONDS:.48,
 norm:(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}},
 F:{x:0,y:0,w:1200,h:700},
 placeBananaPeel:()=>[],placeIcePatch:()=>[],
});
function setup({action='run',timer=0,z=0,distance=100}={}){
 const attacker={t:0,x:200,y:300,keeper:false,stun:0,fatigue:0,dx:0,dy:0,face:1,
  src:{id:'caster',name:'Caster',magicTrick:'fireball',dribbling:90}};
 const defender={t:1,x:attacker.x+distance,y:300,z,action,actionTimer:timer,keeper:false,stun:0,dx:0,dy:0,face:1,
  fireballBurnFx:0,src:{id:'defender',name:'Defender',defence:30}};
 const events=[],game={players:[attacker,defender],ball:{owner:attacker},clock:2,magicHazards:[],fatigueLedger:[{},{}],burst:()=>{},emit:(kind,data)=>events.push({kind,...data})};
 return {attacker,defender,events,game,fire:()=>gameMethods.tryMagicTrick.call(game,attacker)};
}

test('uncountered Fireball adds a short, non-damaging burn cue without extending the existing stun',()=>{
 const {defender,fire}=setup();assert.equal(fire(),true);
 assert.equal(defender.fireballBurnFx,.48);assert.equal(defender.stun,.32);
 assert.equal(defender.health,undefined);assert.equal(defender.damage,undefined);
});

test('Fireball counterplay prevents burn; airborne JUMP and active grounded SHOOT-slide still work',()=>{
 for(const counter of [{z:25},{action:'slide',timer:.2}]){
  const {defender,events,fire}=setup(counter);assert.equal(fire(),true);
  assert.equal(events[0].countered,true);assert.equal(defender.fireballBurnFx,0);assert.equal(defender.stun,0);
 }
 const expiredSlide=setup({action:'slide',timer:0});expiredSlide.fire();
 assert.equal(expiredSlide.defender.fireballBurnFx,.48,'an expired slide does not count as counterplay');
});

test('burn cue expires by elapsed time, clamps at zero and never changes match health or control state',()=>{
 const source=engine.match(/ updateFireballBurn\(p,dt\)\{[^}]+\}/)?.[0];assert.ok(source,'pure timer update is present');
 const update=vm.runInNewContext('({'+source.trim()+'})').updateFireballBurn;
 const player={fireballBurnFx:.48,stun:.32,health:100,action:'hurt'};
 update(player,.2);assert.ok(Math.abs(player.fireballBurnFx-.28)<1e-9);
 update(player,1);assert.equal(player.fireballBurnFx,0);
 update(player,-1);assert.equal(player.fireballBurnFx,0);
 for(const hz of [30,60,120]){
  const playerAtRate={fireballBurnFx:.48};
  for(let i=0;i<hz;i++)update(playerAtRate,1/hz);
  assert.equal(playerAtRate.fireballBurnFx,0,`${hz}Hz elapsed-time updates expire the visual cue`);
 }
 assert.equal(player.stun,.32);assert.equal(player.health,100);assert.equal(player.action,'hurt');
 assert.match(engine,/fireballBurnFx:0/,'new/reset match players start without the temporary cue');
 assert.match(render,/p\.fireballBurnFx\/\.48/,'cue fades as the temporary timer expires');
 assert.doesNotMatch(render,/fireballBurnFx[^\n]{0,180}flash|fireballBurnFx[^\n]{0,180}shake/i,
  'the cue has no screen flash or shake and remains compatible with reduced-flash mode');
});
