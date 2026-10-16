/** Real modular PK engine: two-human keeper movement/dive, solo CPU parity and score integrity. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const a=source.indexOf(' startPK(afterDraw=false){');
const b=source.indexOf('\n}\n\nreturn {GameEngine,WORLD}',a);
assert(a>0&&b>a,'extract real startPK and updatePK from modular runtime');
const methods=vm.runInNewContext('({'+source.slice(a,b).replace('\n updatePK(dt){',',\n updatePK(dt){')+'})',{
 WORLD:{goalTop:530,goalBottom:910},
 F:{x:100,w:2200},
 clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
 randomBetween:(a,b)=>(a+b)/2,
 aiTuning:()=>({id:2,keeperRead:.5}),
 stat:()=>80,
});
const cy=720;
function setup(humans=2){
 const events=[],presses={},states=[{x:0,y:0},{x:0,y:0}];
 const g={humans,mode:humans>=2?'versus':'quick',matchState:'play',
  events,score:[2,2],options:{difficulty:2},
  rosters:[[ {id:'h',shootAccuracy:80}],[{id:'a',shootAccuracy:80}]],
  teamPlans:[{penalty:0},{penalty:0}],substitutionsUsed:[0,0],
  input:{state:states,poll(){},just(t,action){return !!presses[t+':'+action]}},
  inControl(t){return t===0||t===1&&this.humans>=2},
  player(t){return {t,src:this.rosters[t][0]}},
  _closeShotAudits(){},emit(type,data={}){events.push({type,...data})},burst(){},
  startPK:methods.startPK,updatePK:methods.updatePK};
 g.startPK(true);g.pk.ready=0;
 return {g,states,presses,events};
}
const near=(x,y)=>assert(Math.abs(x-y)<1e-7,'Expected '+y+', received '+x);
function resolve(g,goal){
 g.pk.ready=0;g.pk.shotTimer=.001;g.pk.shotTargetY=goal?cy+80:cy;g.pk.saveY=cy;
 g.updatePK(.02);
}
test('local two human goalkeepers move on their own sides; the other input never moves them',()=>{
 const {g,states}=setup(2);
 states[0].y=1;
 g.updatePK(.04);
 near(g.pk.saveY,cy); // Away keeper is defending on the first kick
 states[1].y=.5;g.updatePK(.04);
 near(g.pk.saveY,cy+3.5);
 g.pk.turn=1;g.pk.ready=0;g.pk.saveY=cy;
 states[0].y=-.5;states[1].y=1;g.updatePK(.04);
 near(g.pk.saveY,cy-3.5);
});
test('human JUMP triggers exactly one keeper dive and boosts lateral speed while respecting cooldown',()=>{
 const {g,states,presses,events}=setup();
 states[1].y=1;presses['1:jump']=true;
 g.updatePK(.04);
 near(g.pk.saveY,cy+17.6);near(g.pk.diveCooldown,.8);
 assert.equal(events.filter(x=>x.type==='penaltyDive').length,1);
 g.updatePK(.04);
 near(g.pk.saveY,cy+35.2);
 assert.equal(events.filter(x=>x.type==='penaltyDive').length,1,'held JUMP cannot duplicate dive');
 assert(g.pk.diveCooldown>.7&&g.pk.diveCooldown<.8);
 g.pk.diveCooldown=0;presses['1:jump']=false;
 g.updatePK(.04);assert.equal(events.filter(x=>x.type==='penaltyDive').length,1);
});
test('keeper may steer during the live shot but cannot move outside the posts',()=>{
 const {g,states,presses}=setup();
 g.pk.shotTimer=.4;g.pk.shotMax=.8;g.pk.startX=2000;g.pk.startY=cy;
 g.pk.shotTargetY=cy+58;states[1].y=1;presses['1:jump']=true;
 g.updatePK(.04);
 near(g.pk.saveY,cy+22);
 near(g.pk.diveBoost,.38); // jump was triggered in the flight
 g.pk.saveY=905;g.updatePK(.04);near(g.pk.saveY,900);
});
test('human saves depend on actual positioning, not CPU prediction of shooter aim',()=>{
 const x=setup(2);x.g.pk.saveY=cy+44;x.g.pk.aim=cy-95;
 x.presses['0:shoot']=true;
 x.g.updatePK(.02);
 assert.equal(x.g.pk.stage,'shooting');
 near(x.g.pk.saveY,cy+44);
 assert.equal(x.g.pk.shotTimer,x.g.pk.shotMax);
 const solo=setup(1);solo.g.pk.saveY=cy+44;solo.g.pk.aim=cy-95;
 solo.presses['0:shoot']=true;solo.g.updatePK(.02);
 assert.equal(solo.g.pk.stage,'shooting');
 assert.notEqual(solo.g.pk.saveY,cy+44,'one-human keeper still uses original CPU commitment');
 assert.equal(solo.events.filter(e=>e.type==='penaltyDive').length,0);
});
test('defender input determines a save instead of an otherwise identical goal',()=>{
 const kick=direction=>{
  const {g,states,events}=setup(2);
  g.pk.shotTimer=.04;g.pk.shotMax=.8;g.pk.shotTargetY=cy+50;
  states[1].y=direction;
  g.updatePK(.04);
  return {g,events};
 };
 const save=kick(1),goal=kick(0);
 assert.deepEqual(Array.from(save.g.pk.kicks[0]),[false]);
 assert.deepEqual(Array.from(goal.g.pk.kicks[0]),[true]);
 assert.equal(save.events.filter(e=>e.type==='penaltyKick'&&e.goal===false).length,1);
 assert.equal(goal.events.filter(e=>e.type==='penaltyKick'&&e.goal===true).length,1);
});
test('single player defending keeper does not respond to phantom opponent steer or jump',()=>{
 const a=setup(1);a.states[1].y=1;a.presses['1:jump']=true;
 a.g.updatePK(.04);near(a.g.pk.saveY,cy);
 assert.equal(a.events.filter(e=>e.type==='penaltyDive').length,0);
 // Let the solo AI kick next: home human keeper is NOT in control either.
 a.g.pk.turn=1;a.g.pk.ready=0;a.g.pk.saveY=cy;
 a.states[0].y=1;a.presses['0:jump']=true;
 a.g.updatePK(.04);near(a.g.pk.saveY,cy);
 assert.equal(a.events.filter(e=>e.type==='penaltyDive').length,0);
});
test('multiplayer keeper resets cleanly each kick without changing regulation score or sudden death',()=>{
 const {g,states}=setup();
 states[1].y=1;g.updatePK(.04);
 assert(g.pk.saveY>cy);
 for(let i=0;i<10;i++){resolve(g,true);assert.equal(g.matchState,'penalty');}
 assert.deepEqual(Array.from(g.pk.kicks,x=>x.length),[5,5]);
 resolve(g,true);assert.equal(g.matchState,'penalty');
 resolve(g,false);assert.equal(g.matchState,'finished');
 assert.deepEqual(Array.from(g.score),[2,2]);
 assert.equal(g.events.filter(x=>x.type==='finished').length,1);
 assert.deepEqual(Array.from(g.events.find(x=>x.type==='finished').pkScore),[6,5]);
});
test('keeper movement is bounded against invalid/out-of-range input values',()=>{
 const {g,states}=setup();
 states[1].y=20;g.updatePK(.04);near(g.pk.saveY,cy+7);
 states[1].y=-20;g.updatePK(.04);near(g.pk.saveY,cy);
 states[1].y=Number.NaN;g.updatePK(.04);near(g.pk.saveY,cy);
});
