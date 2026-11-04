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
function method(name,next,globals={}){
 const a=engine.indexOf(`\n ${name}(`),b=engine.indexOf(`\n ${next}(`,a);
 assert.ok(a>=0&&b>a,`extract ${name}`);
 return vm.runInNewContext('({'+engine.slice(a,b)+'})',globals)[name];
}
const trick=method('tryMagicTrick','updateSpinBumpFx',{
 F,clamp,norm,STATS:{verifiedRatingTierForPlayer:p=>p?.statsVerified===true?p.verifiedTier:null},
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??0,
 placeBananaPeel:()=>[],placeIcePatch:()=>[]
});
const updateFx=method('updateFieldTrickFx','updateFireballBurn',{});
function setup(side=0,tier='Gold',verified=true){
 const sign=side===0?1:-1;
 const p={t:side,x:F.x+F.w/2,y:F.y+F.h/2,face:sign,dx:sign,dy:0,z:0,keeper:false,
  stun:0,fatigue:.2,magicReadyAt:0,action:'idle',src:{id:'wind-caster',name:'Wind caster',role:'FW',
   magicTrick:'wind',dribbling:70,statsVerified:verified,verifiedTier:tier}};
 const q={t:1-side,x:p.x+sign*40,y:p.y,face:-sign,dx:0,dy:0,z:0,keeper:false,stun:0,
  action:'idle',actionTimer:0,src:{name:'Target',defence:25}};
 const ball={owner:p,x:p.x,y:p.y,z:0},events=[];
 const g={clock:4,players:[p,q],ball,rideBall:null,fatigueLedger:[{},{}],
  emit:(type,data)=>events.push({type,...data}),burst(){}};
 return{g,p,q,ball,events};
}

test('Wind fails closed without verified Gold+, possession, a target in range, or an available cooldown',()=>{
 for(const [tier,verified,expected] of [['Common',true,false],['Silver',true,false],['Gold',false,false],
  ['Gold',true,true],['Star',true,true],['Superstar',true,true]]){
  const {g,p,ball}=setup(0,tier,verified);assert.equal(trick.call(g,p),expected);
  if(!expected){assert.equal(ball.owner,p);assert.equal(p.magicReadyAt,0);assert.equal(p.fatigue,.2);}
 }
 const noBall=setup();noBall.ball.owner=null;assert.equal(trick.call(noBall.g,noBall.p),false);
 const far=setup();far.q.x=far.p.x+121;assert.equal(trick.call(far.g,far.p),true);
 assert.equal(far.q.windTrickFx,undefined,'out-of-range cast has no target effect');
 const cooling=setup();cooling.p.magicReadyAt=5;assert.equal(trick.call(cooling.g,cooling.p),false);
});

test('Wind pushes a nearby opponent away in either attack direction, preserves possession, and applies bounded cost/cooldown',()=>{
 for(const side of [0,1]){
  const {g,p,q,ball,events}=setup(side),before={x:q.x,y:q.y};
  assert.equal(trick.call(g,p),true);assert.equal(ball.owner,p);
  assert.equal(p.magicReadyAt,g.clock+6);assert.ok(Math.abs(p.fatigue-.245)<1e-9);
  assert.equal(q.stun,0);assert.equal(q.windTrickFx,.35);
  const displacement=Math.hypot(q.x-before.x,q.y-before.y);
  assert.ok(Math.abs(displacement-28)<1e-9,`push=${displacement}`);
  assert.ok((q.x-before.x)*(q.x-p.x)+(q.y-before.y)*(q.y-p.y)>0,'push points away from caster');
  assert.equal(events.at(-1).type,'magicTrick');assert.equal(events.at(-1).trick,'wind');
  assert.equal(events.at(-1).countered,false);
 }
});

test('grounded slide, jump, and a facing+closing defensive read counter Wind without moving the target',()=>{
 const counters=[{action:'slide',actionTimer:.2,z:0},{action:'jump',z:20}];
 for(const side of [0,1])for(const counter of [...counters,
  {action:'idle',face:side===0?-1:1,dx:side===0?-1:1,z:0,src:{name:'reader',defence:90}}]){
  const {g,p,q,ball,events}=setup(side);Object.assign(q,counter);
  const before={x:q.x,y:q.y};assert.equal(trick.call(g,p),true);
  assert.equal(ball.owner,p);assert.equal(q.windTrickFx,undefined);
  assert.deepEqual([q.x,q.y],[before.x,before.y]);
  // Wind excludes airborne rivals before choosing its single target, so a
  // jump dodges with no target selected rather than a direct counter event.
  assert.equal(events.at(-1).countered,counter.action!=='jump');
 }
});

test('Wind visual cue expires and reduced-flash renderer keeps the readable field label',()=>{
 const p={windTrickFx:.35};updateFx.call({},p,1/60);
 assert.ok(Math.abs(p.windTrickFx-(.35-1/60))<1e-9);
 updateFx.call({},p,1);assert.equal(p.windTrickFx,0);
 assert.match(engine,/this\.updateFieldTrickFx\(p,dt\)/);
 assert.match(render,/drawFieldTrick\(ctx,kind,remaining,reducedFlash=false\)/);
 assert.match(render,/p\.windTrickFx/);assert.match(render,/WIND/);
 assert.match(render,/reducedFlash/);
});
