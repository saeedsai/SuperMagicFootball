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
function setup({side=0,z=0,id='freeze',face}={}){
 const attacker={t:side,x:side?500:200,y:300,keeper:false,stun:0,fatigue:0,dx:0,dy:0,face:side?-1:1,src:{id:'a',name:'Caster',magicTrick:id,dribbling:90}};
 const defender={t:1-side,x:side?450:250,y:300,z,keeper:false,stun:0,dx:0,dy:0,face:face??(side?-1:1),src:{id:'b',name:'Defender',defence:30}};
 const events=[],game={players:[attacker,defender],ball:{owner:attacker},clock:2,magicHazards:[],fatigueLedger:[{},{}],burst:()=>{},emit:(kind,data)=>events.push({kind,...data})};
 return {attacker,defender,events,game,fire:()=>cast.call(game,attacker)};
}
test('Freeze JUMP counter works from either team and still spends caster cost',()=>{
 for(const side of [0,1]){
  const {attacker,defender,events,game,fire}=setup({side,z:20});
  assert.equal(fire(),true);assert.equal(defender.stun,0);assert.equal(defender.action,undefined);
  assert.equal(events[0].trick,'freeze');assert.equal(events[0].countered,true);
  assert.equal(attacker.magicReadyAt,8);assert.equal(attacker.fatigue,.035);
  assert.equal(game.fatigueLedger[side].a,.035);assert.equal(fire(),false);
 }
});
test('Grounded, early jump and invalid height still freeze',()=>{
 for(const z of [0,2,19.99,NaN]){
  const {defender,events,fire}=setup({z});
  assert.equal(fire(),true);assert.equal(defender.stun,.65);
  assert.equal(defender.action,'hurt');assert.equal(events[0].countered,false);
 }
});
test('Directional defence still counters Freeze; other Tricks unchanged',()=>{
 const {defender,events,fire}=setup({face:-1,z:0});
 defender.dx=-1;defender.src.defence=95;
 assert.equal(fire(),true);assert.equal(defender.stun,0);assert.equal(events[0].countered,true);
 const bat=setup({id:'bat',z:20});assert.equal(bat.fire(),true);assert.equal(bat.defender.stun,.32);
 const scream=setup({id:'scream',z:20});assert.equal(scream.fire(),true);assert.equal(scream.defender.stun,0);
});
test('Player Studio explains existing JUMP; no fifth action or new save field',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(engine,/freezeDodged=id==='freeze'&&inRange&&Number\.isFinite\(rival\.z\)&&rival\.z>=20/);
 assert.match(ui,/freeze:'[^']*JUMP above the freezing pulse to dodge it/);
 assert.match(engine,/p\.magicReadyAt=this\.clock\+6/);
 assert.doesNotMatch(engine,/fifthAction/);
});
