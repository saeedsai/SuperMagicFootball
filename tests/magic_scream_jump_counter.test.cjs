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
function setup({z=0,side=0,id='scream',face}={}){
 const attacker={t:side,x:side?500:200,y:300,keeper:false,stun:0,fatigue:0,dx:0,dy:0,face:side?-1:1,src:{id:'a',name:'Caster',magicTrick:id,dribbling:90}};
 const defender={t:1-side,x:side?450:250,y:300,z,keeper:false,stun:0,dx:0,dy:0,face:face??(side?-1:1),src:{id:'b',name:'Defender',defence:30}};
 const events=[],game={players:[attacker,defender],ball:{owner:attacker},clock:2,magicHazards:[],fatigueLedger:[{},{}],burst:()=>{},emit:(kind,data)=>events.push({kind,...data})};
 return {attacker,defender,events,game,fire:()=>cast.call(game,attacker)};
}
test('MAGIC-SCREAM-JUMP-01: airborne JUMP dodges Scream from both attack directions',()=>{
 for(const side of [0,1]){
  const {attacker,defender,events,game,fire}=setup({z:20,side});
  assert.equal(fire(),true);assert.equal(defender.stun,0);assert.equal(defender.action,undefined);
  assert.equal(events[0].trick,'scream');assert.equal(events[0].countered,true);
  assert.equal(attacker.magicReadyAt,8);assert.equal(attacker.fatigue,.035);
  assert.equal(game.fatigueLedger[side].a,.035);
  assert.equal(fire(),false,'cooldown still prevents a free repeat cast');
 }
});
test('Grounded, low airborne and invalid-height targets still receive Scream',()=>{
 for(const z of [0,19.9,NaN]){
  const {defender,events,fire}=setup({z});
  assert.equal(fire(),true);assert.equal(defender.stun,.32);
  assert.equal(defender.action,'hurt');assert.equal(events[0].countered,false);
 }
});
test('Directional defence still counters grounded Scream; unrelated Tricks keep prior behavior',()=>{
 const {defender,events,fire}=setup({z:0,face:-1});
 defender.dx=-1;defender.src.defence=95;
 assert.equal(fire(),true);assert.equal(defender.stun,0);assert.equal(events[0].countered,true);
 const freeze=setup({z:25,id:'freeze'});
 assert.equal(freeze.fire(),true);assert.equal(freeze.defender.stun,.65);
 const fireball=setup({z:20,id:'fireball'});
 assert.equal(fireball.fire(),true);assert.equal(fireball.defender.stun,0);
});
test('Player Studio documents existing JUMP counter; no extra action or save field',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(engine,/screamDodged=id==='scream'&&inRange&&Number\.isFinite\(rival\.z\)&&rival\.z>=20/);
 assert.match(ui,/scream:'[^']*JUMP above the shockwave to dodge it/);
 assert.match(engine,/p\.magicReadyAt=this\.clock\+6/);
 assert.doesNotMatch(engine,/fifthAction/);
});
