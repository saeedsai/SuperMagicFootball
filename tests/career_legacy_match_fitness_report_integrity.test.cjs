'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {recordMatchFitness}=require('../src/career.js');

const fixture=()=>({season:2,week:4,history:[],roster:[
 {id:'player-a',name:'A',condition:88,injuryWeeks:0},
 {id:'player-b',name:'B',condition:73,injuryWeeks:1}
]});
const row=(id,overrides={})=>({id,seconds:100,fatigue:.6,condition:76,...overrides});

test('legacy Career rejects invalid match reports before mutating any roster player',()=>{
 for(const bad of [row('player-b',{condition:NaN}),row('player-b',{condition:101}),row('player-b',{fatigue:1.01}),row('player-b',{fatigue:NaN}),row('player-b',{seconds:Infinity}),row('',{}),null]){
  const career=fixture(),before=structuredClone(career);
  assert.throws(()=>recordMatchFitness(career,[row('player-a'),bad]),/Invalid Career fitness report/);
  assert.deepEqual(career,before,'a later malformed row cannot leave a partial fitness update');
 }
 for(const bad of [null,{},'fitness']){
  const career=fixture(),before=structuredClone(career);
  assert.throws(()=>recordMatchFitness(career,bad),/Invalid Career fitness report/);
  assert.deepEqual(career,before);
 }
});

test('legacy Career still applies valid match condition and deterministic injury output',()=>{
 const career=fixture();
 const report=recordMatchFitness(career,[row('player-a',{condition:68,fatigue:.82,seconds:240}),row('player-b',{condition:91,fatigue:.1,seconds:0})]);
 assert.equal(career.roster[0].condition,68);
 assert.equal(career.roster[1].condition,75,'unused player recovers two condition');
 assert.equal(report.players,2);
 assert.ok(Array.isArray(report.injuries));
 assert.equal(report.averageCondition,72);
});
