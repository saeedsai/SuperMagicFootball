'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

const apis=async()=>[
 (await runtimeImport).recoverPlayer,
 (await moduleImport).CAREER.recoverPlayer,
];
const makeCareer=({cash=1000000,condition=50,injuryWeeks=2}={})=>({
 cash,roster:[{id:'p1',condition,injuryWeeks}],
});

test('Career player recovery preserves its fee and fitness improvements',async()=>{
 for(const recover of await apis()){
  const career=makeCareer({condition:'70',injuryWeeks:'2'});
  const player=recover(career,0);
  assert.equal(career.cash,500000);
  assert.equal(player.condition,95);
  assert.equal(player.injuryWeeks,1);
  assert.equal(career.roster[0],player);
 }
});

test('Career player recovery rejects malformed budgets or fitness without mutation',async()=>{
 for(const recover of await apis())for(const override of [
  {cash:NaN},
  {cash:-1},
  {cash:1},
  {condition:'bad'},
  {condition:Infinity},
  {injuryWeeks:'bad'},
  {injuryWeeks:NaN},
 ]){
  const career=makeCareer(override),before=structuredClone(career);
  assert.throws(()=>recover(career,0));
  assert.deepEqual(career,before,'rejected recovery cannot charge or rewrite player fitness');
 }
 for(const recover of await apis()){
  const career=makeCareer(),before=structuredClone(career);
  assert.throws(()=>recover(career,3),/No player selected/);
  assert.deepEqual(career,before);
 }
});
