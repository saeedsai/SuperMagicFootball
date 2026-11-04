'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

const apis=async()=>[
 (await runtimeImport).scoutAcademy,
 (await moduleImport).CAREER.scoutAcademy,
];
const makeCareer=()=>({club:4,season:2,week:3,cash:10000000,facilities:{academy:1},scouted:[],
 roster:Array.from({length:12},(_,i)=>({id:`starter_${i}`,name:`Starter ${i}`,num:i+1,shot:'standard',shotName:'Standard'}))});

test('Career academy scouting preserves its fee, generated fields, and ID progression',async()=>{
 const outputs=[];
 for(const scout of await apis()){
  const career=makeCareer(),initial=career.cash;
  const first=scout(career),second=scout(career);
  assert.equal(career.cash,initial-5000000);
  assert.equal(career.scouted.length,2);
  assert.notEqual(first.id,second.id);
  assert.equal(first.id,'youth_4_2_3_0');
  assert.equal(second.id,'youth_4_2_3_1');
  assert.equal(first.fictional,true);
  outputs.push(career.scouted);
 }
 assert.deepEqual(outputs[0],outputs[1],'standalone and modular scout generation stay identical');
});

test('Career academy scouting rejects malformed prerequisites or budgets without charging',async()=>{
 for(const scout of await apis())for(const invalid of [
  {...makeCareer(),cash:NaN},
  {...makeCareer(),cash:-1},
  {...makeCareer(),cash:100},
  {...makeCareer(),roster:[]},
  {...makeCareer(),facilities:{academy:NaN}},
  {...makeCareer(),facilities:{academy:-1}},
  {...makeCareer(),facilities:{academy:1.5}},
  {...makeCareer(),scouted:{}},
 ]){
  const before=structuredClone(invalid);
  assert.throws(()=>scout(invalid));
  assert.deepEqual(invalid,before,'failed scouting cannot charge or append a candidate');
 }
});
