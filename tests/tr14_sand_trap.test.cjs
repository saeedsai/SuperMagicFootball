'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8'),render=fs.readFileSync('src/modules/render.js','utf8');
const F=mechanics.world.field,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};};
const verifiedTier=player=>player?.statsVerified===true?player.verifiedTier??'Gold':null;
function method(name,next,globals={}){const a=engine.indexOf(`\n ${name}(`),b=engine.indexOf(`\n ${next}(`,a);assert.ok(a>=0&&b>a,`extract ${name}`);return vm.runInNewContext('({'+engine.slice(a,b)+'})',globals)[name];}
const trick=method('tryMagicTrick','updateSpinBumpFx',{F,clamp,norm,STATS:{verifiedRatingTierForPlayer:verifiedTier},distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??0,placeBananaPeel:()=>[],placeIcePatch:()=>[]});
const updateFx=method('updateSandTrapFx','updateFieldTrickFx',{});
function setup(side=0,tier='Gold',verified=true){
 const p={t:side,x:F.x+F.w/2,y:F.y+F.h/2,face:side===0?1:-1,dx:side===0?1:-1,dy:0,z:0,keeper:false,stun:0,fatigue:.2,magicReadyAt:0,action:'idle',src:{id:'sand-caster',name:'Sand caster',role:'FW',magicTrick:'sandTrap',dribbling:65,statsVerified:verified,verifiedTier:tier}};
 const ball={owner:p,x:p.x,y:p.y,z:0};const log=[];
 const g={clock:3,players:[p],ball,rideBall:null,fatigueLedger:[{},{}],burst:(...a)=>log.push(['burst',...a]),emit:(...a)=>log.push(['emit',...a])};
 return{g,p,ball,log};
}
function rival(p,side,patch={}){const sign=side===0?1:-1;return{t:1-side,x:p.x+sign*40,y:p.y,face:-sign,dx:-sign,dy:0,z:0,keeper:false,stun:0,action:'idle',actionTimer:0,src:{name:'Target',defence:30},...patch};}

test('TR14 Sand Trap fails closed unless source-verified Gold or higher',()=>{
 for(const [tier,verified,expected] of [['Common',true,false],['Silver',true,false],['Gold',true,true],['Star',true,true],['Superstar',true,true],['Gold',false,false]]){
  const {g,p,ball,log}=setup(0,tier,verified);g.players=[p,rival(p,0)];
  assert.equal(trick.call(g,p),expected,`${tier}, statsVerified=${verified}, tier claims are not trusted unless verified`);
  if(!expected){assert.equal(ball.owner,p);assert.equal(p.magicReadyAt,0);assert.equal(p.fatigue,.2);assert.equal(log.length,0);}
 }
});

test('verified Gold+ Sand Trap retains ball, uses Spin Bump cooldown/cost bounds and roots only in-range target',()=>{
 for(const side of [0,1]){
  const {g,p,ball,log}=setup(side),q=rival(p,side);g.players=[p,q];
  const start={x:q.x,y:q.y};assert.equal(trick.call(g,p),true);
  assert.equal(ball.owner,p);assert.equal(p.magicReadyAt,g.clock+6);assert.ok(Math.abs(p.fatigue-.245)<1e-9);
  assert.equal(q.stun,.38);assert.equal(q.action,'hurt');assert.equal(q.actionTimer,.38);assert.equal(q.sandTrapFx,.38);
  assert.deepEqual([q.x,q.y],[start.x,start.y],'Sand Trap roots rather than pushes the rival');
  assert.equal(log.at(-1)[1],'magicTrick');assert.equal(log.at(-1)[2].trick,'sandTrap');assert.equal(log.at(-1)[2].countered,false);
 }
});

test('Sand Trap honors grounded slide, jump and read counters; stunned and out-of-range targets are untouched',()=>{
 const counterCases=[{action:'slide',actionTimer:.2,z:0},{action:'jump',z:20},{action:'idle',z:0,src:{name:'reader',defence:90}}];
 for(const side of [0,1])for(const counter of counterCases){
  const {g,p,ball}=setup(side),q=rival(p,side,counter);g.players=[p,q];assert.equal(trick.call(g,p),true);assert.equal(ball.owner,p);assert.equal(q.stun,0);assert.equal(q.sandTrapFx,undefined);
 }
 const {g,p}=setup(),stunned=rival(p,0,{stun:.5}),far=rival(p,0,{x:p.x+83});g.players=[p,stunned,far];assert.equal(trick.call(g,p),true);assert.equal(stunned.stun,.5);assert.equal(far.stun,0);
});

test('Sand Trap cue expires in the live update and uses a steady reduced-flash Canvas mark',()=>{
 const p={sandTrapFx:.38};updateFx.call({},p,1/60);assert.ok(Math.abs(p.sandTrapFx-(.38-1/60))<1e-9);updateFx.call({},p,1);assert.equal(p.sandTrapFx,0);
 assert.match(engine,/this\.updateSandTrapFx\(p,dt\)/);assert.match(render,/drawSandTrap\(ctx,remaining,reducedFlash=false\)/);
 assert.match(render,/p\.sandTrapFx/);assert.match(render,/SAND TRAP/);assert.match(render,/reducedFlash\?\.48/);
});
