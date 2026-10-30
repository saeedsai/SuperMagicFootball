'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const block=engine.match(/ tryMagicTrick\(p\)\{([\s\S]*?)\n \}\n \/\/ Consume a Banana Peel/);
assert.ok(block,'extract the real gameplay Magic Trick method');
const magic=new Function('p','stat','distance','norm','clamp','placeBananaPeel','placeIcePatch','F',block[1]);
const stat=(p,key)=>p.src[key]??0;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d};};
const clamp=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
const field={x:0,y:0,w:500,h:500};
function scenario({trick='hideBall',action='punch',timer=.25,z=0,face=1,dist=55,dx=0,ready=0,owner=true}={}){
 const carrier={t:0,x:100,y:100,face:1,dx:0,dy:0,stun:0,keeper:false,fatigue:.1,magicReadyAt:ready,
  src:{id:'carrier',name:'Carrier',magicTrick:trick,dribbling:85}};
 const defender={t:1,x:100-dist,y:100,face,dx,dy:0,stun:0,z,keeper:false,action,actionTimer:timer,
  src:{id:'defender',name:'Defender',defence:35}};
 const game={clock:10,ball:{owner:owner?carrier:null},players:[carrier,defender],fatigueLedger:[{},{}],
  magicHazards:[],events:[],bursts:[],burst(...args){this.bursts.push(args);},
  emit(type,data){this.events.push({type,...data});}};
 const fired=magic.call(game,carrier,stat,distance,norm,clamp,()=>[{kind:'banana'}],()=>[{kind:'ice'}],field);
 return {fired,carrier,defender,game,event:game.events.find(e=>e.type==='magicTrick')};
}
test('grounded, facing, close defensive PASS poke counters Hide Ball',()=>{
 assert.match(engine,/p\.action=slide\?'slide':'punch'/,'PASS uses the existing ordinary tackle action');
 const {fired,carrier,game,event}=scenario();
 assert.equal(fired,true);assert.equal(event.countered,true);
 assert.equal(carrier.trickGuard,undefined,'countered cast cannot grant ball concealment');
 assert.equal(carrier.magicReadyAt,16,'countered caster still pays cooldown');
 assert.equal(carrier.fatigue,.135,'countered caster still pays Energy');
 assert.equal(game.fatigueLedger[0].carrier,carrier.fatigue);
 assert.equal(game.bursts.length,1);
});
for(const [name,changes] of [
 ['expired PASS poke',{timer:0}],['backwards PASS poke',{face:-1}],
 ['airborne defender',{z:20}],['defender outside 70-unit poke reach',{dist:80}],
 ['idle defender',{action:'idle'}],['SHOOT slide rather than PASS poke',{action:'slide'}]
]){
 test(name+' does not cancel Hide Ball',()=>{
  const {fired,carrier,event}=scenario(changes);
  assert.equal(fired,true);assert.equal(event.countered,false);
  assert.equal(carrier.trickGuard,.65);
  assert.equal(carrier.magicReadyAt,16);
 });
}
test('PASS poke does not counter unrelated Freeze spell',()=>{
 const {event,defender,carrier}=scenario({trick:'freeze'});
 assert.equal(event.countered,false);
 assert.equal(defender.stun,.65);
 assert.equal(carrier.trickGuard,undefined);
});
test('cooldown and ball-possession checks still reject casts without spending resources',()=>{
 for(const changes of [{ready:12},{owner:false}]){
  const {fired,carrier,game}=scenario(changes);
  assert.equal(fired,false);assert.equal(carrier.fatigue,.1);
  assert.equal(game.events.length,0);
 }
});
