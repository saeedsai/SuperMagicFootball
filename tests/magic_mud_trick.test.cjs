'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8'),render=fs.readFileSync('src/modules/render.js','utf8');
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
  stun:0,fatigue:.2,magicReadyAt:0,action:'idle',src:{id:'mud-caster',name:'Mud caster',role:'FW',
   magicTrick:'mud',dribbling:70,statsVerified:verified,verifiedTier:tier}};
 const q={t:1-side,x:p.x+sign*40,y:p.y,face:-sign,dx:0,dy:0,z:0,keeper:false,stun:0,
  action:'idle',actionTimer:0,src:{name:'Target',defence:25}};
 const ball={owner:p,x:p.x,y:p.y,z:0},events=[];
 const g={clock:4,players:[p,q],ball,rideBall:null,fatigueLedger:[{},{}],
  emit:(type,data)=>events.push({type,...data}),burst(){}};
 return{g,p,q,ball,events};
}

test('Mud requires verified Gold+ and a ball-carrying outfield caster',()=>{
 for(const [tier,verified,expected] of [['Common',true,false],['Silver',true,false],['Gold',false,false],
  ['Gold',true,true],['Star',true,true],['Superstar',true,true]]){
  const {g,p,ball}=setup(0,tier,verified);assert.equal(trick.call(g,p),expected);
  if(!expected){assert.equal(ball.owner,p);assert.equal(p.magicReadyAt,0);assert.equal(p.fatigue,.2);}
 }
 const noBall=setup();noBall.ball.owner=null;assert.equal(trick.call(noBall.g,noBall.p),false);
 const noTarget=setup();noTarget.g.players=[noTarget.p];assert.equal(trick.call(noTarget.g,noTarget.p),true);
 assert.equal(noTarget.p.magicReadyAt,noTarget.g.clock+6);
 const cooldown=setup();cooldown.p.magicReadyAt=5;assert.equal(trick.call(cooldown.g,cooldown.p),false);
});

test('Mud slows the nearest grounded rival in range for .52s without stun or possession loss',()=>{
 for(const side of [0,1]){
  const {g,p,q,ball,events}=setup(side);assert.equal(trick.call(g,p),true);
  assert.equal(ball.owner,p);assert.equal(q.stun,0);assert.equal(q.mudSlowTimer,.52);assert.equal(q.mudTrickFx,.52);
  assert.equal(p.magicReadyAt,g.clock+6);assert.ok(Math.abs(p.fatigue-.245)<1e-9);
  assert.equal(events.at(-1).type,'magicTrick');assert.equal(events.at(-1).trick,'mud');
  assert.equal(events.at(-1).countered,false);
 }
 const outside=setup();outside.q.x=outside.p.x+101;
 assert.equal(trick.call(outside.g,outside.p),true);assert.equal(outside.q.mudSlowTimer,undefined);
});

test('grounded slide and jump avoid Mud, while an active slow cannot be refreshed by another Mud',()=>{
 const counters=[{action:'slide',actionTimer:.2,z:0},{action:'jump',z:20}];
 for(const side of [0,1])for(const counter of counters){
  const {g,p,q,ball,events}=setup(side);Object.assign(q,counter);
  assert.equal(trick.call(g,p),true);assert.equal(ball.owner,p);
  assert.equal(q.mudSlowTimer,undefined);assert.equal(q.mudTrickFx,undefined);
  assert.equal(events.at(-1).countered,counter.action==='slide',
   'grounded slide is a direct counter; an airborne target is excluded');
 }
 const active=setup();active.q.mudSlowTimer=.1;active.g.players=[active.p,active.q];
 assert.equal(trick.call(active.g,active.p),true);assert.equal(active.q.mudSlowTimer,.1);
 assert.equal(active.q.mudTrickFx,undefined);
});

test('Mud slow and cue decay; movement multiplier and readable reduced-flash cue remain bounded',()=>{
 const p={mudSlowTimer:.52,mudTrickFx:.52};updateFx.call({},p,.2);
 assert.ok(Math.abs(p.mudSlowTimer-.32)<1e-9);assert.ok(Math.abs(p.mudTrickFx-.32)<1e-9);
 updateFx.call({},p,1);assert.equal(p.mudSlowTimer,0);assert.equal(p.mudTrickFx,0);
 assert.match(engine,/this\.updateFieldTrickFx\(p,dt\)/);
 assert.match(engine,/\(p\.mudSlowTimer>0\?\.62:1\)/);
 assert.match(render,/drawFieldTrick\(ctx,kind,remaining,reducedFlash=false\)/);
 assert.match(render,/p\.mudTrickFx/);assert.match(render,/MUD/);assert.match(render,/reducedFlash/);
});
