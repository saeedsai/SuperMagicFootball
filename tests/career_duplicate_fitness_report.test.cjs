'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const modularImport=import('../src/modules/career.js');
const standaloneImport=import('../src/career.js');

const career=()=>({season:2,week:4,history:[],lastResult:{kind:'league'},cash:1000000,
 roster:[{id:'player-a',condition:88,energy:100,stamina:70,injuryWeeks:0},
  {id:'player-b',condition:73,energy:90,stamina:54,injuryWeeks:1}]});
const row=(id,overrides={})=>({id,seconds:100,fatigue:.6,condition:76,...overrides});

test('both Career runtimes reject duplicate player rows before persisting fitness',async()=>{
 const modular=(await modularImport).CAREER,standalone=await standaloneImport;
 for(const record of [modular.recordMatchFitness,standalone.recordMatchFitness]){
  const state=career(),before=structuredClone(state);
  const ambiguous=[row('player-a',{condition:84}),row('player-a',{condition:26,fatigue:.95,seconds:300})];
  assert.throws(()=>record(state,ambiguous),/Invalid Career fitness report/);
  assert.deepEqual(state,before,'duplicate report IDs must not apply an arbitrary last-row value');
 }
});
