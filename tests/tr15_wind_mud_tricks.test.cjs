'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8'),render=fs.readFileSync('src/modules/render.js','utf8');
const F=mechanics.world.field,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};};
function method(name,next,globals={}){const a=engine.indexOf(`\n ${name}(`),b=engine.indexOf(`\n ${next}(`,a);assert.ok(a>=0&&b>a,`extract ${name}`);return vm.runInNewContext('({'+engine.slice(a,b)+'\n})',globals)[name];}
const globals={F,clamp,norm,STATS:{verifiedRatingTierForPlayer:p=>p?.statsVerified===true?p.verifiedTier:null},distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??0,placeBananaPeel:()=>[],placeIcePatch:()=>[]};
const trick=method('tryMagicTrick','updateSpinBumpFx',globals),update=method('updateFieldTrickFx','updateFireballBurn',{});
const speed=method('playerSpeed','moveAgile',{breathCapacity:()=>100,stat:()=>70,endurance:()=>1,moraleFactor:()=>1});
function setup(id='wind',side=0,verified=true){
 const p={t:side,x:F.x+F.w/2,y:F.y+F.h/2,face:side===0?1:-1,dx:side===0?1:-1,dy:0,z:0,keeper:false,stun:0,fatigue:.2,magicReadyAt:0,action:'idle',breath:100,morale:55,src:{id:'caster',name:'Caster',role:'FW',magicTrick:id,dribbling:60,statsVerified:verified,verifiedTier:'Gold'}};
 const q={t:1-side,x:p.x+(side===0?60:-60),y:p.y,face:side===0?-1:1,dx:0,dy:0,z:0,keeper:false,stun:0,action:'idle',actionTimer:0,src:{id:'target',name:'Target',defence:20}};
 const ball={owner:p,x:p.x,y:p.y,z:0},events=[];const g={clock:5,players:[p,q],ball,rideBall:null,options:{gameSpeed:1},fatigueLedger:[{},{}],emit:(type,data)=>events.push({type,...data}),burst(){}};return{g,p,q,ball,events};
}

test('Wind and Mud fail closed unless the carrier has a verified Gold+ tier',()=>{
 for(const id of ['wind','mud'])for(const [tier,verified,expected] of [['Common',true,false],['Silver',true,false],['Gold',false,false],['Gold',true,true],['Star',true,true],['Superstar',true,true]]){
  const s=setup(id,0,verified);s.p.src.verifiedTier=tier;assert.equal(trick.call(s.g,s.p),expected,`${id} ${tier} verified=${verified}`);
  if(!expected){assert.equal(s.ball.owner,s.p);assert.equal(s.p.magicReadyAt,0);assert.equal(s.p.fatigue,.2);}
 }
});

test('Wind pushes one nearby grounded opponent without stun; teammates, keepers and airborne players are ineligible',()=>{
 for(const side of [0,1]){
  const {g,p,q,ball}=setup('wind',side),start={x:q.x,y:q.y};g.players=[p,q];assert.equal(trick.call(g,p),true);
  assert.equal(ball.owner,p);assert.equal(p.magicReadyAt,g.clock+6);assert.ok(Math.abs(p.fatigue-.245)<1e-9);
  assert.equal(q.stun,0);assert.equal(q.windTrickFx,.35);assert.ok(Math.abs(Math.hypot(q.x-start.x,q.y-start.y)-28)<1e-8);
 }
 const side=setup('wind');const mate={...side.q,t:side.p.t,x:side.p.x+15};const keeper={...side.q,keeper:true,x:side.p.x+5};
 const airborne={...side.q,x:side.p.x+30,z:35};const grounded={...side.q,x:side.p.x+75,z:0};side.g.players=[side.p,mate,keeper,airborne,grounded];trick.call(side.g,side.p);
 assert.equal(mate.windTrickFx,undefined);assert.equal(keeper.windTrickFx,undefined);assert.equal(airborne.windTrickFx,undefined);assert.equal(grounded.windTrickFx,.35);
});

test('Mud slows only one eligible grounded opponent for .52s, never stacks, and recovers to normal speed',()=>{
 const {g,p,q,ball}=setup('mud');g.players=[p,q];const base=speed.call(g,q);assert.equal(trick.call(g,p),true);
 assert.equal(ball.owner,p);assert.equal(p.magicReadyAt,g.clock+6);assert.ok(Math.abs(p.fatigue-.245)<1e-9);
 assert.equal(q.mudSlowTimer,.52);assert.equal(q.mudTrickFx,.52);assert.equal(q.stun,0);assert.ok(Math.abs(speed.call(g,q)-base*.62)<1e-9);
 update.call(g,q,.1);assert.ok(Math.abs(q.mudSlowTimer-.42)<1e-9);const remaining=q.mudSlowTimer;
 const next={...setup('mud').p,t:0,x:p.x+8,y:p.y,src:{...p.src,id:'second-caster',magicTrick:'mud'}};g.players=[p,next,q];g.ball.owner=next;next.magicReadyAt=0;trick.call(g,next);
 assert.equal(q.mudSlowTimer,remaining,'a second trick cannot extend an active Mud duration');
 update.call(g,q,1);assert.equal(q.mudSlowTimer,0);assert.equal(q.mudTrickFx,0);assert.ok(Math.abs(speed.call(g,q)-base)<1e-9);
});

test('Wind and Mud have explicit slide/read counters and only affect the opposing team',()=>{
 for(const id of ['wind','mud'])for(const patch of [{action:'slide',actionTimer:.2,z:0},{action:'idle',z:0,face:-1,dx:-1,src:{name:'reader',defence:90}}]){
  const {g,p,q,ball}=setup(id);Object.assign(q,patch);const before={x:q.x,y:q.y};g.players=[p,q];trick.call(g,p);assert.equal(ball.owner,p);assert.equal(q.windTrickFx,undefined);assert.equal(q.mudSlowTimer,undefined);assert.deepEqual([q.x,q.y],[before.x,before.y]);
 }
});

test('field-trick cues have bounded recovery and steady reduced-flash rendering',()=>{
 const q={windTrickFx:.35,mudTrickFx:.52,mudSlowTimer:.52};update.call({},q,.1);
 assert.ok(Math.abs(q.windTrickFx-.25)<1e-9);assert.ok(Math.abs(q.mudTrickFx-.42)<1e-9);assert.ok(Math.abs(q.mudSlowTimer-.42)<1e-9);
 update.call({},q,1);assert.equal(q.windTrickFx,0);assert.equal(q.mudTrickFx,0);assert.equal(q.mudSlowTimer,0);
 assert.match(engine,/this\.updateFieldTrickFx\(p,dt\)/);assert.match(engine,/p\.mudSlowTimer>0\?\.62:1/);
 assert.match(render,/drawFieldTrick\(ctx,kind,remaining,reducedFlash=false\)/);assert.match(render,/WIND PUSH/);assert.match(render,/MUD · SLOWED/);
});
