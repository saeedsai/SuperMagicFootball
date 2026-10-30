'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=engine.indexOf(' tryMagicTrick(p){'),end=engine.indexOf(' // Consume a Banana Peel',start);
assert.ok(start>0&&end>start,'extract the real live Magic Trick method');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const cast=vm.runInNewContext('({'+engine.slice(start,end)+'})',{
 distance,stat:(p,k)=>p.src?.[k]??50,
 clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
 norm:(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m}},
 F:{x:0,y:0,w:1200,h:700},
 placeBananaPeel:()=>{throw Error('unexpected banana')},
 placeIcePatch:()=>{throw Error('unexpected ice')}
}).tryMagicTrick;
function setup({z=0,side=0,id='fireball',face}={}){
 const attacker={t:side,x:side?500:200,y:300,keeper:false,stun:0,fatigue:0,dx:0,dy:0,face:side?-1:1,src:{id:'a',name:'Caster',magicTrick:id,dribbling:90}};
 const defender={t:1-side,x:side?450:250,y:300,z,keeper:false,stun:0,dx:0,dy:0,face:face??(side?-1:1),src:{id:'b',name:'Defender',defence:30}};
 const events=[],game={players:[attacker,defender],ball:{owner:attacker},clock:2,magicHazards:[],fatigueLedger:[{},{}],burst:()=>{},emit:(kind,data)=>events.push({kind,...data})};
 return {attacker,defender,events,game,fire:()=>cast.call(game,attacker)};
}
test('MAGIC-FIREBALL-JUMP-01: airborne JUMP dodges Fireball from either attack direction',()=>{
 for(const side of [0,1]){
  const {attacker,defender,events,game,fire}=setup({z:20,side});
  assert.equal(fire(),true);
  assert.equal(defender.stun,0);
  assert.equal(defender.action,undefined);
  assert.equal(events[0].trick,'fireball');
  assert.equal(events[0].countered,true);
  assert.equal(attacker.magicReadyAt,8,'dodge still consumes original six-second cooldown');
  assert.equal(attacker.fatigue,.035,'dodge still costs original fatigue');
  assert.equal(game.fatigueLedger[side].a,.035);
  assert.equal(fire(),false,'cooldown still prevents repeated casts');
 }
});
test('Fireball still staggers grounded and low airborne defenders',()=>{
 for(const z of [0,19.9]){
  const {defender,events,fire}=setup({z});
  assert.equal(fire(),true);
  assert.equal(defender.stun,.32);
  assert.equal(defender.action,'hurt');
  assert.equal(events[0].countered,false);
 }
});
test('Existing facing/closing defence counter still applies and other Tricks retain their previous rules',()=>{
 const {defender,events,fire}=setup({z:0,face:-1});
 defender.dx=-1;defender.src.defence=95;
 assert.equal(fire(),true);
 assert.equal(defender.stun,0);
 assert.equal(events[0].countered,true);
 const other=setup({z:25,id:'bat'});
 assert.equal(other.fire(),true);
 assert.equal(other.defender.stun,0,'Bat now has its own airborne JUMP counter');
});
test('The Fireball counter uses existing JUMP, and Player Studio explains it',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(engine,/jumpDodged=id==='fireball'&&inRange&&Number\.isFinite\(rival\.z\)&&rival\.z>=20/);
 assert.match(ui,/fireball:'[^']*JUMP above the strike to dodge it/);
 assert.match(engine,/p\.magicReadyAt=this\.clock\+6/);
 assert.doesNotMatch(engine,/fifthAction/);
});
