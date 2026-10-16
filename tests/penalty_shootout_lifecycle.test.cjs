/** Contract acceptance of the actual modular penalty-shootout state machine.
 * No duplicate shootout implementation: extract real GameEngine methods verbatim.
 */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const a=src.indexOf(' startPK(afterDraw=false){');
const b=src.indexOf('\n}\n\nreturn {GameEngine,WORLD}',a);
assert(a>=0&&b>a,'current playable GameEngine penalty methods must be present');
const methods=vm.runInNewContext('({'+src.slice(a,b).replace('\n updatePK(dt){',',\n updatePK(dt){')+'})',{
 WORLD:{goalTop:530,goalBottom:910},
 F:{x:100,w:2200},
 clamp:(n,lo,hi)=>Math.max(lo,Math.min(hi,n)),
 randomBetween:(lo,hi)=>(lo+hi)/2,
 aiTuning:()=>({id:2,keeperRead:.5}),
 stat:()=>75,
});
const snapshot=g=>JSON.stringify({score:g.score,rosters:g.rosters,teamPlans:g.teamPlans,substitutionsUsed:g.substitutionsUsed});
function create(afterDraw=false){
 const events=[],g={matchState:'play',humans:1,score:[2,2],events,
  pk:null,rosters:[[{id:'H',shootAccuracy:80}],[{id:'A',shootAccuracy:80}]],
  teamPlans:[{penalty:0},{penalty:0}],substitutionsUsed:[0,0],
  input:{poll(){},state:[{},{}],just:()=>false},
  inControl:()=>false,player:()=>({src:{gkSkill:78}}),
  _closeShotAudits(){},emit(type,value={}){events.push({type,...value})},burst(){},
  startPK:methods.startPK,updatePK:methods.updatePK};
 g.startPK(afterDraw);
 return g;
}
function kick(g,goal){
 assert.equal(g.matchState,'penalty','shootout cannot advance after it has finished');
 const p=g.pk,mid=720;
 p.ready=0;p.shotTimer=.001;p.shotMax=.8;p.stage='shooting';
 p.shotTargetY=goal?mid+70:mid;p.saveY=mid;
 g.updatePK(.02);
}
test('standalone start creates two empty kick ledgers without changing match identity',()=>{
 const g=create(false);
 assert.deepEqual(Array.from(g.pk.kicks,side=>Array.from(side)),[[],[]]);
 assert.equal(g.pk.turn,0);assert.equal(g.pk.afterDraw,false);
 assert.equal(g.events.filter(e=>e.type==='penaltyStart').length,1);
 assert.deepEqual(Array.from(g.score),[2,2]);
});
test('after one attempt turn changes exactly once and resets shot-stage state',()=>{
 const g=create();kick(g,true);
 assert.equal(g.pk.turn,1);assert.equal(g.pk.kicks[0][0],true);
 assert.equal(g.pk.kicks[1].length,0);
 assert.equal(g.pk.shotTimer,0);assert.equal(g.pk.stage,'ready');
 assert.equal(g.events.filter(e=>e.type==='penaltyKick').length,1);
 assert.equal(g.events.filter(e=>e.type==='finished').length,0);
});
test('first-five early clinch only when trailing side mathematically cannot catch up',()=>{
 const g=create();
 for(const score of [true,false,true,false,true]){kick(g,score);assert.equal(g.matchState,'penalty');}
 kick(g,false);
 assert.equal(g.matchState,'finished');
 assert.deepEqual(Array.from(g.pk.kicks,side=>side.length),[3,3]);
 assert.deepEqual(Array.from(g.score),[3,0]);
 const fin=g.events.filter(e=>e.type==='finished');assert.equal(fin.length,1);
 assert.equal(fin[0].winner,0);assert.deepEqual(Array.from(fin[0].pkScore),[3,0]);
 assert.equal(g.events.filter(e=>e.type==='penaltyKick').length,6);
});
test('sudden death cannot end on one unmatched sixth kick, only on completed pair',()=>{
 const g=create();
 for(let i=0;i<10;i++){kick(g,true);assert.equal(g.matchState,'penalty',i);}
 assert.deepEqual(Array.from(g.pk.kicks,side=>side.length),[5,5]);
 kick(g,true);
 assert.equal(g.matchState,'penalty');
 assert.equal(g.pk.turn,11);assert.equal(g.events.filter(e=>e.type==='finished').length,0);
 kick(g,false);
 assert.equal(g.matchState,'finished');assert.deepEqual(Array.from(g.score),[6,5]);
 assert.equal(g.events.filter(e=>e.type==='finished').length,1);
});
test('after regulation draw the shootout decides winner without rewriting regulation score',()=>{
 for(const winner of [0,1]){
  const g=create(true),before=snapshot(g);
  for(let i=0;i<10;i++)kick(g,true);
  kick(g,winner===0);
  assert.equal(g.matchState,'penalty');
  kick(g,winner===1);
  assert.equal(g.matchState,'finished');
  assert.equal(snapshot(g),before,'draw and roster/lineup/substitution data must remain untouched');
  const fin=g.events.find(e=>e.type==='finished');
  assert.equal(fin.winner,winner);
  assert.deepEqual(Array.from(fin.score),[2,2]);
  assert.deepEqual(Array.from(fin.pkScore),winner===0?[6,5]:[5,6]);
 }
});
test('an equal sixth pair must continue to seventh pair, then end without phantom kicks',()=>{
 const g=create(true);
 for(let i=0;i<12;i++){kick(g,true);assert.equal(g.matchState,'penalty',i);}
 kick(g,false);assert.equal(g.matchState,'penalty','seventh home miss is not a completed pair');
 kick(g,true);assert.equal(g.matchState,'finished');
 assert.deepEqual(Array.from(g.pk.kicks,side=>side.length),[7,7]);
 assert.equal(g.events.filter(e=>e.type==='penaltyKick').length,14);
 assert.equal(g.events.find(e=>e.type==='finished').winner,1);
});
