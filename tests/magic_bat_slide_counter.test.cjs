'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=engine.indexOf(' tryMagicTrick(p){'),end=engine.indexOf(' // Consume a Banana Peel',start);
assert.ok(start>0&&end>start,'extract the actual match-engine Magic Trick method');
const cast=vm.runInNewContext('({'+engine.slice(start,end)+'})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 stat:(p,k)=>p.src?.[k]??50,
 clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
 norm:(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m}},
 F:{x:0,y:0,w:1200,h:700},
 placeBananaPeel:()=>{throw Error('unexpected banana')},
 placeIcePatch:()=>{throw Error('unexpected ice')}
}).tryMagicTrick;
function setup({side=0,z=0,action='slide',timer=.25,id='bat',face}={}){
 const attacker={t:side,x:side?500:200,y:300,keeper:false,stun:0,fatigue:0,dx:0,dy:0,face:side?-1:1,src:{id:'a',name:'Caster',magicTrick:id,dribbling:90}};
 const defender={t:1-side,x:side?450:250,y:300,z,keeper:false,stun:0,dx:0,dy:0,face:face??(side?-1:1),action,actionTimer:timer,src:{id:'b',name:'Defender',defence:30}};
 const events=[],game={players:[attacker,defender],ball:{owner:attacker},clock:2,magicHazards:[],fatigueLedger:[{},{}],burst:()=>{},emit:(kind,data)=>events.push({kind,...data})};
 return {attacker,defender,events,game,fire:()=>cast.call(game,attacker)};
}
test('MAGIC-BAT-SLIDE-01: active grounded SHOOT-slide parries Bat from both sides',()=>{
 for(const side of [0,1]){
  const {attacker,defender,events,game,fire}=setup({side});
  assert.equal(fire(),true);assert.equal(defender.stun,0);assert.equal(defender.action,'slide');
  assert.equal(events[0].trick,'bat');assert.equal(events[0].countered,true);
  assert.equal(attacker.magicReadyAt,8);assert.equal(attacker.fatigue,.035);
  assert.equal(game.fatigueLedger[side].a,.035);
  assert.equal(fire(),false,'cooldown still prevents a free second cast');
 }
});
test('Expired, non-slide, low-jump and invalid-height defenders cannot parry Bat',()=>{
 for(const opts of [{timer:0},{timer:-.01},{timer:NaN},{action:'run'},{z:19.9,action:'run'},{z:NaN}]){
  const {defender,events,fire}=setup(opts);
  assert.equal(fire(),true);assert.equal(defender.stun,.32);
  assert.equal(defender.action,'hurt');assert.equal(events[0].countered,false);
 }
});
test('Facing/closing defence remains available, while other Tricks are unaffected',()=>{
 const {defender,events,fire}=setup({action:'run',timer:0,face:-1});
 defender.dx=-1;defender.src.defence=95;
 assert.equal(fire(),true);assert.equal(defender.stun,0);assert.equal(events[0].countered,true);
 const freeze=setup({id:'freeze',action:'run',timer:0});
 assert.equal(freeze.fire(),true);assert.equal(freeze.defender.stun,.65);
 const scream=setup({id:'scream',z:20});
 assert.equal(scream.fire(),true);assert.equal(scream.defender.stun,0);
});
test('Player Studio describes SHOOT parry and game still uses exactly four actions',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(engine,/batParried=id==='bat'&&inRange&&rival\.action==='slide'/);
 assert.match(ui,/bat:'[^']*SHOOT-slide parries the bat while grounded/);
 assert.match(engine,/p\.magicReadyAt=this\.clock\+6/);
 assert.doesNotMatch(engine,/fifthAction/);
});

test('MAGIC-BAT-JUMP-01: airborne JUMP evades Bat from both sides with original caster cost',()=>{
 for(const side of [0,1]){
  const {attacker,defender,events,game,fire}=setup({side,z:20,action:'run',timer:0});
  assert.equal(fire(),true);assert.equal(defender.stun,0);assert.equal(defender.action,'run');
  assert.equal(events[0].trick,'bat');assert.equal(events[0].countered,true);
  assert.equal(attacker.magicReadyAt,8);assert.equal(attacker.fatigue,.035);
  assert.equal(game.fatigueLedger[side].a,.035);
  assert.equal(fire(),false,'jump dodge cannot bypass caster cooldown');
 }
});
test('Bat JUMP dodge requires height and range; grounded SHOOT-slide still parries',()=>{
 for(const z of [0,19.99,NaN]){
  const {defender,events,fire}=setup({z,action:'run',timer:0});
  assert.equal(fire(),true);assert.equal(defender.stun,.32);
  assert.equal(events[0].countered,false);
 }
 const far=setup({z:30,action:'run',timer:0});far.defender.x=far.attacker.x+200;
 assert.equal(far.fire(),true);assert.equal(far.events[0].countered,false);
 const slide=setup({z:0,action:'slide',timer:.25});
 assert.equal(slide.fire(),true);assert.equal(slide.events[0].countered,true);
 const other=setup({z:30,action:'run',timer:0,id:'teleport'});
 assert.equal(other.fire(),true);assert.equal(other.events[0].countered,false,'Bat JUMP does not cancel Teleport');
});
test('Bat JUMP counter is documented in Player Studio without a fifth action',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(engine,/batDodged=id==='bat'&&inRange&&Number\.isFinite\(rival\.z\)&&rival\.z>=20/);
 assert.match(ui,/bat:'[^']*JUMP above the swing to evade it/);
 assert.match(engine,/freezeDodged\|\|freezeParried\|\|batDodged\|\|batParried/);
});
