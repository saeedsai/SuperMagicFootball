/** Live CPU-halftime tactics method, extracted verbatim from modular engine.js. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=source.indexOf(' autoAdaptCpuHalftime(){');
const end=source.indexOf('\n getFitnessReport(team=0){',start);
assert(start>0&&end>start,'real engine CPU halftime adaptation method is present');
assert(source.includes("this.autoSubstituteCpu();this.autoAdaptCpuHalftime();this.emit('halftime')"),
       'run CPU tactics after ordinary substitution and before halftime event');
const adapt=vm.runInNewContext('({'+source.slice(start,end)+'})').autoAdaptCpuHalftime;
function setup(score=[0,1],opts={}){
 const presets={attack:'Balanced',defence:'Balanced',formation:'2-1-2',
  captain:3,penalty:4,lineup:[0,1,2,3,4,5]};
 const g={humans:1,mode:'career',half:2,clock:0,matchState:'paused',
  score:[...score],teamPlans:[{...presets},{...presets,lineup:[...presets.lineup]}],
  rosters:[[],[]],substitutionsUsed:[0,0],events:[],changes:[],
  applyPlan(t,p){assert.equal(t,1);assert.equal(this.matchState,'paused');
    this.changes.push({team:t,plan:p});this.teamPlans[t]=p;return p;},
  emit(type,data){this.events.push({type,...data});},
  autoAdaptCpuHalftime:adapt,...opts};
 const original=JSON.stringify({presets,rosters:g.rosters,substitutionsUsed:g.substitutionsUsed});
 return {g,presets,original};
}
test('trailing CPU raises pressure and directness, without changing formation/lineup or quotas',()=>{
 const {g,presets}=setup([2,0]);
 assert.equal(g.autoAdaptCpuHalftime(),true);
 assert.equal(g.teamPlans[1].attack,'Direct');
 assert.equal(g.teamPlans[1].defence,'High Press');
 assert.deepEqual(Array.from(g.teamPlans[1].lineup),presets.lineup);
 assert.equal(g.teamPlans[1].formation,presets.formation);
 assert.equal(g.teamPlans[1].captain,presets.captain);
 assert.deepEqual(g.substitutionsUsed,[0,0]);
 assert.equal(g.changes.length,1);
 assert.deepEqual(g.events.map(x=>x.type),['cpuTacticalShift']);
 assert.equal(g.events[0].reason,'trailing');
 assert.deepEqual(Array.from(g.events[0].score),[2,0]);
});
test('leading CPU adopts possession and deep block',()=>{
 const {g}=setup([0,3]);assert.equal(g.autoAdaptCpuHalftime(),true);
 assert.equal(g.teamPlans[1].attack,'Possession');
 assert.equal(g.teamPlans[1].defence,'Deep Block');
 assert.equal(g.events[0].reason,'leading');
});
test('level score does not change any plan and emits no event',()=>{
 const {g}=setup([1,1]);let before=JSON.stringify(g.teamPlans);
 assert.equal(g.autoAdaptCpuHalftime(),false);
 assert.equal(JSON.stringify(g.teamPlans),before);
 assert.equal(g.changes.length,0);assert.equal(g.events.length,0);
});
test('two humans and training have no automatic halftime manager',()=>{
 for(const opts of [{humans:2},{mode:'training'},{humans:0}]){
  const {g}=setup([2,0],opts);
  assert.equal(g.autoAdaptCpuHalftime(),false);
  assert.equal(g.changes.length,0);assert.equal(g.events.length,0);
 }
});
test('guard prohibits pre-match, in-play, and later halftime changes',()=>{
 for(const opts of [{half:1},{half:3},{clock:1.25},{matchState:'play'},{matchState:'finished'},{matchState:'penalty'}]){
  const {g}=setup([2,0],opts);
  assert.equal(g.autoAdaptCpuHalftime(),false);
  assert.equal(g.changes.length,0);
 }
});
test('repeated calls cannot double-announce the same adaptation',()=>{
 const {g}=setup([0,4]);assert.equal(g.autoAdaptCpuHalftime(),true);
 assert.equal(g.autoAdaptCpuHalftime(),false);
 assert.equal(g.events.length,1);assert.equal(g.changes.length,1);
});
test('already-matched plan does not invoke applyPlan or emit phantom event',()=>{
 const {g}=setup([3,1]);g.teamPlans[1].attack='Direct';g.teamPlans[1].defence='High Press';
 assert.equal(g.autoAdaptCpuHalftime(),false);
 assert.equal(g.changes.length,0);assert.equal(g.events.length,0);
});
test('malformed scoreboard and missing plan fail closed',()=>{
 for(const score of [[NaN,1],[Infinity,2],[0,-Infinity],[],[3]]){
  const {g}=setup(score);assert.equal(g.autoAdaptCpuHalftime(),false);
  assert.equal(g.changes.length,0);
 }
 const {g}=setup([1,0]);g.teamPlans[1]=null;
 assert.equal(g.autoAdaptCpuHalftime(),false);
});
test('adaptation does not mutate source saved presets, other team or player data',()=>{
 const {g,presets,original}=setup([0,3]);
 g.autoAdaptCpuHalftime();
 assert.deepEqual(g.teamPlans[0],presets);
 assert.equal(JSON.stringify({presets,rosters:g.rosters,substitutionsUsed:g.substitutionsUsed}),original);
 assert.notStrictEqual(g.teamPlans[1],presets);
 assert(!source.slice(start,end).includes('store.put'));
});
test('the method is integrated exactly at real first-half transition only',()=>{
 assert.equal(source.split('this.autoAdaptCpuHalftime();').length-1,1);
 const trigger=source.indexOf('this.autoAdaptCpuHalftime();');
 const context=source.slice(trigger-200,trigger+160);
 assert(context.includes("this.half=2;this.clock=0;"),context);
 assert(context.includes("this.matchState='paused';"),context);
 assert(context.includes("this.emit('halftime')"),context);
});
