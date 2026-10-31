'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=engine.indexOf(' tryMagicTrick(p){'),end=engine.indexOf(' // Consume a Banana Peel',start);
assert.ok(start>0&&end>start,'real engine method found');
const cast=vm.runInNewContext('({'+engine.slice(start,end)+'})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??50,
 clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
 norm:(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m}},
 F:{x:0,y:0,w:1200,h:700},
 placeBananaPeel:()=>{throw Error('unexpected banana')},
 placeIcePatch:()=>{throw Error('unexpected ice')}
}).tryMagicTrick;
function setup({side=0,z=0,id='scream',action='run',timer=0,dist=100}={}){
 const dir=side?-1:1;
 const attacker={t:side,x:side?600:200,y:300,keeper:false,stun:0,fatigue:0,dx:0,dy:0,face:dir,src:{id:'a',name:'Caster',magicTrick:id,dribbling:90}};
 const defender={t:1-side,x:attacker.x+dir*dist,y:300,z,action,actionTimer:timer,keeper:false,stun:0,dx:0,dy:0,face:dir,src:{id:'b',name:'Defender',defence:30}};
 const events=[],game={players:[attacker,defender],ball:{owner:attacker},clock:2,magicHazards:[],fatigueLedger:[{},{}],burst:()=>{},emit:(kind,data)=>events.push({kind,...data})};
 return {attacker,defender,events,game,fire:()=>cast.call(game,attacker)};
}
test('MAGIC-SCREAM-SLIDE-01: active grounded SHOOT-slide ducks Scream from either team; caster still pays',()=>{
 for(const side of [0,1]){
  const {attacker,defender,events,game,fire}=setup({side,action:'slide',timer:.25});
  assert.equal(fire(),true);assert.equal(defender.stun,0);assert.equal(defender.action,'slide');
  assert.equal(events[0].trick,'scream');assert.equal(events[0].countered,true);
  assert.equal(attacker.magicReadyAt,8);assert.equal(attacker.fatigue,.035);
  assert.equal(game.fatigueLedger[side].a,.035);assert.equal(fire(),false,'no cooldown bypass');
 }
});
test('Wide-range slide counters; expired, airborne, non-slide or out-of-range defenders still get hit',()=>{
 const wide=setup({action:'slide',timer:.25,dist:130});assert.equal(wide.fire(),true);assert.equal(wide.events[0].countered,true);
 const cases=[{action:'slide',timer:0},{action:'slide',timer:-1},{action:'slide',timer:NaN},
  {action:'run',timer:.25},{action:'punch',timer:.25},{action:'slide',timer:.25,z:NaN}];
 for(const c of cases){
  const {defender,events,fire}=setup(c);
  assert.equal(fire(),true);
  assert.equal(events[0].countered,false,JSON.stringify(c));
  assert.equal(defender.stun,.32,JSON.stringify(c));assert.equal(defender.action,'hurt');
 }
 const far=setup({action:'slide',timer:.25,dist:150});
 assert.equal(far.fire(),true);assert.equal(far.defender.stun,0,'out of range: nobody staggered');assert.equal(far.events[0].countered,false);
 const air=setup({action:'slide',timer:.25,z:25});assert.equal(air.fire(),true);assert.equal(air.events[0].countered,true,'JUMP dodge preserved');
});
test('Scream slide counter is its own rule; Fireball, Freeze, Bat slide parries and JUMP dodge unchanged',()=>{
 for(const id of ['fireball','freeze','bat']){
  const t=setup({id,action:'slide',timer:.25,dist:50});assert.equal(t.fire(),true);assert.equal(t.events[0].countered,true,id);
 }
 const hide=setup({id:'hideBall',action:'slide',timer:.25,dist:50});
 hide.fire();assert.equal(hide.defender.stun,0,'Hide Ball never staggers');
 const jump=setup({z:30});assert.equal(jump.fire(),true);assert.equal(jump.events[0].countered,true);
});
test('Scream slide counter is documented without a fifth action or new save field',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(engine,/screamParried=id==='scream'&&inRange&&rival\.action==='slide'/);
 assert.match(engine,/screamDodged\|\|screamParried/);
 assert.match(ui,/scream:'[^']*grounded defensive SHOOT-slide to slide under it/);
 assert.match(engine,/p\.magicReadyAt=this\.clock\+6/);
 assert.doesNotMatch(engine,/fifthAction/);
});
