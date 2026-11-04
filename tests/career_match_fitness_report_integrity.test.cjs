'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const moduleImport=import('../src/modules/career.js');

const validRow=(id,overrides={})=>({id,seconds:100,fatigue:.6,condition:76,...overrides});
const fixture=()=>({
 cash:4000000,season:2,week:4,history:[],lastResult:{kind:'league'},
 roster:[
  {id:'player-a',condition:88,energy:100,stamina:70,injuryWeeks:0},
  {id:'player-b',condition:73,energy:90,stamina:54,injuryWeeks:1}
 ]
});

test('Career fitness report rejects malformed rows before changing any roster state',async()=>{
 const {CAREER}=await moduleImport;
 for(const badRow of [
  validRow('player-b',{condition:NaN}),
  validRow('player-b',{condition:101}),
  validRow('player-b',{fatigue:1.01}),
  validRow('player-b',{fatigue:NaN}),
  validRow('player-b',{seconds:Infinity}),
  validRow('',{}),
  null
 ]){
  const career=fixture(),before=structuredClone(career);
  assert.throws(()=>CAREER.recordMatchFitness(career,[validRow('player-a'),badRow]),/Invalid Career fitness report/);
  assert.deepEqual(career,before,'invalid report must not partially modify a Career');
 }
 for(const report of [null,{},'fitness']){
  const career=fixture(),before=structuredClone(career);
  assert.throws(()=>CAREER.recordMatchFitness(career,report),/Invalid Career fitness report/);
  assert.deepEqual(career,before);
 }
});

test('Career fitness report preserves valid match condition and next-fixture recovery',async()=>{
 const {CAREER}=await moduleImport,career=fixture();career.nextFixtureRestDays=0;
 const result=CAREER.recordMatchFitness(career,[
  validRow('player-a',{condition:68,fatigue:.82,seconds:240}),
  validRow('player-b',{condition:91,fatigue:.1,seconds:0})
 ]);
 assert.equal(career.roster[0].condition,68);
 assert.equal(career.roster[0].energy,18);
 assert.equal(career.roster[1].condition,75,'unused players recover two condition');
 assert.equal(result.players,2);
 assert.equal(result.injuries instanceof Array,true);
 assert.equal(result.averageCondition,72);
});
