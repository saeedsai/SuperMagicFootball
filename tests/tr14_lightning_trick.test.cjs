'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8'),render=fs.readFileSync('src/modules/render.js','utf8');
const F=mechanics.world.field,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};};
function method(name,next,globals={}){const a=engine.indexOf(`\n ${name}(`),b=engine.indexOf(`\n ${next}(`,a);assert.ok(a>=0&&b>a,`extract ${name}`);return vm.runInNewContext('({'+engine.slice(a,b)+'})',globals)[name];}
const globals={F,clamp,norm,STATS:{verifiedRatingTierForPlayer:p=>p?.statsVerified===true?p.verifiedTier:null},distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??0,placeBananaPeel:()=>[],placeIcePatch:()=>[]};
const trick=method('tryMagicTrick','updateSpinBumpFx',globals);
const update=method('updateLightningTrick','resolveLightningTrick',{});
const resolve=method('resolveLightningTrick','beginRideBall',{distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??0});
function setup(side=0,tier='Gold',verified=true){
 const p={t:side,x:F.x+F.w/2,y:F.y+F.h/2,face:side===0?1:-1,dx:side===0?1:-1,dy:0,z:0,keeper:false,stun:0,fatigue:.2,magicReadyAt:0,action:'idle',src:{id:'lightning-caster',name:'Caster',role:'FW',magicTrick:'lightning',dribbling:60,statsVerified:verified,verifiedTier:tier}};
 const q={t:1-side,x:p.x+(side===0?50:-50),y:p.y,face:side===0?-1:1,dx:0,dy:0,z:0,keeper:false,stun:0,action:'idle',actionTimer:0,src:{id:'target',name:'Defender',defence:20}};
 const ball={owner:p,x:p.x,y:p.y,z:0},events=[];const g={clock:4,players:[p,q],ball,rideBall:null,fatigueLedger:[{},{}],emit:(type,data)=>events.push({type,...data}),burst(){}};g.resolveLightningTrick=resolve.bind(g);return{g,p,q,ball,events};
}

test('Lightning fails closed without verified Gold+, carrier, live target or available cooldown',()=>{
 for(const [tier,verified,expected] of [['Common',true,false],['Silver',true,false],['Gold',false,false],['Gold',true,true],['Star',true,true],['Superstar',true,true]]){
  const {g,p}=setup(0,tier,verified);assert.equal(trick.call(g,p),expected);if(!expected){assert.equal(p.magicReadyAt,0);assert.equal(p.fatigue,.2);assert.equal(p.lightningPending,undefined);}
 }
 const noTarget=setup();noTarget.g.players=[noTarget.p];assert.equal(trick.call(noTarget.g,noTarget.p),false);
 const tooFar=setup();tooFar.q.x=tooFar.p.x+95;assert.equal(trick.call(tooFar.g,tooFar.p),false);
 const cooldown=setup();cooldown.p.magicReadyAt=5;assert.equal(trick.call(cooldown.g,cooldown.p),false);
});

test('Lightning starts a .32s target windup, preserves possession and resolves a bounded stun after the tell',()=>{
 for(const side of [0,1]){
  const {g,p,q,ball,events}=setup(side);assert.equal(trick.call(g,p),true);
  assert.equal(ball.owner,p);assert.equal(p.magicReadyAt,g.clock+6);assert.ok(Math.abs(p.fatigue-.245)<1e-9);
  assert.equal(q.stun,0);assert.equal(q.lightningMark,.32);assert.equal(p.lightningPending.remaining,.32);assert.equal(p.lightningPending.target,q);
  assert.equal(events[0].type,'lightningTrickWindup');assert.equal(events[0].seconds,.32);assert.equal(events[0].radius,95);
  assert.equal(update.call(g,p,.32,false),true);assert.equal(p.lightningPending,null);assert.equal(q.lightningMark,0);assert.equal(q.stun,.32);assert.equal(q.lightningFx,.32);
  assert.equal(events.at(-1).type,'lightningTrickResolved');assert.equal(events.at(-1).hit,true);assert.equal(ball.owner,p);
 }
});

test('near defender gets slide, jump and facing+closing reads during the windup; already-stunned targets never stack',()=>{
 const cases=[{action:'slide',actionTimer:.18,z:0},{action:'jump',z:20},{action:'idle',z:0,face:-1,dx:-1,src:{name:'read',defence:80}}];
 for(const c of cases){const {g,p,q,events}=setup();trick.call(g,p);Object.assign(q,c);update.call(g,p,.32,false);assert.equal(q.stun,0);assert.equal(q.lightningFx,undefined);assert.equal(events.at(-1).countered,true);}
 const {g,p,q,events}=setup();trick.call(g,p);q.stun=.12;update.call(g,p,.32,false);assert.equal(q.stun,.12);assert.equal(events.at(-1).hit,false);assert.equal(events.at(-1).countered,false);
 const noChain=setup();noChain.q.stun=.3;noChain.g.players=[noChain.p,noChain.q];assert.equal(trick.call(noChain.g,noChain.p),false);assert.equal(noChain.p.fatigue,.2);
});

test('Lightning windup interrupts cleanly; cue timers expire and the renderer offers steady reduced-flash marks',()=>{
 const {g,p,q,events}=setup();trick.call(g,p);p.stun=.1;assert.equal(update.call(g,p,1/60,false),false);assert.equal(p.lightningPending,null);assert.equal(q.lightningMark,0);assert.equal(events.at(-1).type,'lightningTrickInterrupted');
 const fresh=setup();trick.call(fresh.g,fresh.p);fresh.q.lightningMark=.32;fresh.q.lightningFx=.32;for(let i=0;i<20;i++)update.call(fresh.g,fresh.q,1/30,false);assert.equal(fresh.q.lightningMark,0);assert.equal(fresh.q.lightningFx,0);
 assert.match(engine,/this\.updateLightningTrick\(p,dt,true\)/);assert.match(engine,/resolveLightningTrick\(p\)/);
 assert.match(render,/drawLightningTrick\(ctx,remaining,phase='warning',reducedFlash=false\)/);assert.match(render,/LIGHTNING · EVADE/);assert.match(render,/p\.lightningMark/);
});
