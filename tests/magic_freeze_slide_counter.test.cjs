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
function setup({side=0,z=0,id='freeze',action='run',timer=0,dist=50}={}){
 const dir=side?-1:1;
 const attacker={t:side,x:side?500:200,y:300,keeper:false,stun:0,fatigue:0,dx:0,dy:0,face:dir,src:{id:'a',name:'Caster',magicTrick:id,dribbling:90}};
 const defender={t:1-side,x:attacker.x+dir*dist,y:300,z,action,actionTimer:timer,keeper:false,stun:0,dx:0,dy:0,face:dir,src:{id:'b',name:'Defender',defence:30}};
 const events=[],game={players:[attacker,defender],ball:{owner:attacker},clock:2,magicHazards:[],fatigueLedger:[{},{}],burst:()=>{},emit:(kind,data)=>events.push({kind,...data})};
 return {attacker,defender,events,game,fire:()=>cast.call(game,attacker)};
}
test('Active grounded SHOOT-slide parries Freeze from either team and caster still pays',()=>{
 for(const side of [0,1]){
  const {attacker,defender,events,game,fire}=setup({side,action:'slide',timer:.25});
  assert.equal(fire(),true);assert.equal(defender.stun,0);assert.equal(defender.action,'slide');
  assert.equal(events[0].trick,'freeze');assert.equal(events[0].countered,true);
  assert.equal(attacker.magicReadyAt,8);assert.equal(attacker.fatigue,.035);
  assert.equal(game.fatigueLedger[side].a,.035);assert.equal(fire(),false,'no cooldown bypass');
 }
});
test('Expired, airborne, far or non-slide defenders still get frozen',()=>{
 const cases=[{action:'slide',timer:0},{action:'slide',timer:-1},{action:'slide',timer:NaN},
  {action:'run',timer:.25},{action:'punch',timer:.25},{action:'slide',timer:.25,z:NaN}];
 for(const c of cases){
  const {defender,events,fire}=setup(c);
  assert.equal(fire(),true);
  assert.equal(events[0].countered,false,JSON.stringify(c));
  assert.equal(defender.stun,.65,JSON.stringify(c));
 }
 const far=setup({action:'slide',timer:.25,dist:200});
 assert.equal(far.fire(),true);assert.equal(far.defender.stun,0,'out of range: nobody is frozen');assert.equal(far.events[0].countered,false);
 // z>=20 is the pre-existing JUMP dodge, not the slide parry.
 const air=setup({action:'slide',timer:.25,z:25});assert.equal(air.fire(),true);assert.equal(air.events[0].countered,true);
});
test('Slide parry is specific to Freeze; other tricks and Bat behaviour unchanged',()=>{
 for(const id of ['fireball','scream']){
  const t=setup({id,action:'slide',timer:.25});
  assert.equal(t.fire(),true);assert.equal(t.events[0].countered,false,id+' not slide-parried');assert.equal(t.defender.stun,.32);
 }
 const bat=setup({id:'bat',action:'slide',timer:.25});assert.equal(bat.fire(),true);assert.equal(bat.events[0].countered,true);
 const jump=setup({z:30});assert.equal(jump.fire(),true);assert.equal(jump.events[0].countered,true);
});
test('Freeze slide counter is documented without a fifth action or new save field',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(engine,/freezeParried=id==='freeze'&&inRange&&rival\.action==='slide'/);
 assert.match(engine,/freezeDodged\|\|freezeParried\|\|batDodged/);
 assert.match(ui,/freeze:'[^']*grounded defensive SHOOT-slide to cut through it/);
 assert.match(engine,/p\.magicReadyAt=this\.clock\+6/);
 assert.doesNotMatch(engine,/fifthAction/);
});
