'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const render=fs.readFileSync('src/modules/render.js','utf8');
const F=mechanics.world.field,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};};
function method(name,next,globals={}){const a=engine.indexOf(`\n ${name}(`),b=engine.indexOf(`\n ${next}(`,a);assert.ok(a>=0&&b>a,`extract ${name}`);return vm.runInNewContext('({'+engine.slice(a,b)+'})',globals)[name];}
const trick=method('tryMagicTrick','updateSpinBumpFx',{F,clamp,norm,distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??0,
 STATS:{verifiedRatingTierForPlayer:source=>source?.verifiedTier??null},
 placeBananaPeel:()=>[],placeIcePatch:()=>[],fieldAbility:()=>null,abilityLevel:()=>0,levelModifiers:()=>({})});
const updateFx=method('updateSpinBumpFx','updateSandTrapFx',{});
function setup(side=0,id='spinBump'){
 const p={t:side,x:F.x+F.w/2,y:F.y+F.h/2,face:side===0?1:-1,dx:side===0?1:-1,dy:0,z:0,keeper:false,stun:0,fatigue:.2,magicReadyAt:0,action:'idle',src:{id:'caster',name:'Caster',magicTrick:id,dribbling:65,verifiedTier:'Gold'}};
 const ball={owner:p,x:p.x,y:p.y,z:0};const hits=[];
 const g={clock:3,players:[p],ball,rideBall:null,fatigueLedger:[{},{}],burst:(...a)=>hits.push(['burst',...a]),emit:(...a)=>hits.push(['emit',...a])};
 return{g,p,ball,hits};
}
function rival(p,side,patch={}){const sign=side===0?1:-1;return{t:1-side,x:p.x+sign*40,y:p.y,face:-sign,dx:-sign,dy:0,z:0,keeper:false,stun:0,action:'idle',actionTimer:0,src:{name:'Target',defence:30},...patch};}

test('TR14 Spin Bump reaches 82, keeps possession, applies bounded 0.38s stun/push and common cooldown',()=>{
 for(const side of [0,1]){
  const {g,p,ball,hits}=setup(side),q=rival(p,side);g.players=[p,q];
  assert.equal(trick.call(g,p),true);assert.equal(ball.owner,p,'successful trick retains possession');
  assert.equal(p.magicReadyAt,g.clock+6);assert.ok(Math.abs(p.fatigue-.245)<1e-9,'cost is .045');
  assert.equal(q.stun,.38);assert.equal(q.action,'hurt');assert.equal(q.actionTimer,.38);
  assert.ok(Math.abs(Math.hypot(q.x-(p.x+(side===0?40:-40)),q.y-p.y)-30)<1e-8,'push is exactly 30 units and mirrors by side');
  assert.equal(p.spinBumpFx,.38);assert.equal(hits.at(-1)[0],'emit');assert.equal(hits.at(-1)[1],'magicTrick');assert.equal(hits.at(-1)[2].trick,'spinBump');assert.equal(hits.at(-1)[2].countered,false);
 }
});

test('TR14 Spin Bump requires verified Gold+ at runtime and leaves grandfathered equipment untouched',()=>{
 for(const tier of [null,'Common','Silver']){
  const {g,p,ball,hits}=setup(0);p.src.verifiedTier=tier;
  assert.equal(trick.call(g,p),false,`${tier||'unverified'} player cannot activate Spin Bump`);
  assert.equal(p.src.magicTrick,'spinBump','runtime refusal does not strip the saved choice');
  assert.equal(p.magicReadyAt,0,'refusal does not start cooldown');
  assert.equal(p.fatigue,.2,'refusal does not charge fatigue');
  assert.equal(ball.owner,p,'refusal leaves possession unchanged');
  assert.deepEqual(hits,[],'refusal has no gameplay or visual side effects');
 }
 for(const tier of ['Gold','Star','Superstar']){
  const {g,p}=setup(0);p.src.verifiedTier=tier;
  assert.equal(trick.call(g,p),true,`${tier} player can activate Spin Bump`);
 }
});

test('grounded active SHOOT-slide, JUMP at z>=20, and facing plus closing Defense counters the bump',()=>{
 const counters=[
  {action:'slide',actionTimer:.2,z:0,src:{name:'slide',defence:0}},
  {action:'jump',actionTimer:.2,z:20,src:{name:'jump',defence:0}},
  {action:'idle',actionTimer:0,z:0,src:{name:'read',defence:90}}
 ];
 for(const side of [0,1])for(const c of counters){
  const {g,p,ball}=setup(side),q=rival(p,side,c);g.players=[p,q];
  assert.equal(trick.call(g,p),true);assert.equal(ball.owner,p);
  assert.equal(q.stun,0);assert.equal(q.action,c.action);assert.ok(Math.hypot(q.x-(p.x+(side===0?40:-40)),q.y-p.y)<1e-9);
 }
});

test('Spin Bump excludes stunned rivals, refuses out-of-reach targets, and does not chain',()=>{
 const {g,p,ball}=setup(0),stunned=rival(p,0,{stun:.6}),far=rival(p,0,{x:p.x+83,stun:0});
 g.players=[p,stunned,far];assert.equal(trick.call(g,p),true);assert.equal(ball.owner,p);assert.equal(stunned.stun,.6);assert.equal(far.stun,0);
 const second=setup(1),already=rival(second.p,1,{stun:.4});second.g.players=[second.p,already];
 assert.equal(trick.call(second.g,second.p),true);assert.equal(already.stun,.4);assert.equal(second.ball.owner,second.p);
});

test('Spin Bump lifecycle clamps at zero and renderer exposes bounded named steady/active tell',()=>{
 const p={spinBumpFx:.38};updateFx.call({},p,1/30);assert.ok(Math.abs(p.spinBumpFx-(.38-1/30))<1e-9);
 updateFx.call({},p,1);assert.equal(p.spinBumpFx,0);
 assert.match(engine,/this\.updateSpinBumpFx\(p,dt\)/,'live player update expires the cue');
 assert.match(render,/drawSpinBump\(ctx,remaining,reducedFlash=false\)/);
 assert.match(render,/SPIN BUMP/);assert.match(render,/SLIDE · JUMP · READ/);
 assert.match(render,/p\.spinBumpFx/);
});
