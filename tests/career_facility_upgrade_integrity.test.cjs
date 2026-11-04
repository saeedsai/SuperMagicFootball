'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

const apis=async()=>[
 (await runtimeImport).upgradeFacility,
 (await moduleImport).CAREER.upgradeFacility,
];
const makeCareer=()=>({cash:25000000,facilities:{training:1,stadium:1,academy:1}});

test('Career facility upgrade keeps the current level-based price and commits valid values',async()=>{
 for(const upgrade of await apis()){
  const career=makeCareer();
  assert.equal(upgrade(career,'training'),12500000);
  assert.equal(career.cash,12500000);
  assert.equal(career.facilities.training,2);
 }
});

test('Career facility upgrade rejects malformed levels or budgets without mutating state',async()=>{
 for(const upgrade of await apis()){
  for(const {level,cash} of [
   {level:NaN,cash:25000000},
   {level:-1,cash:25000000},
   {level:1.5,cash:25000000},
   {level:Number.MAX_SAFE_INTEGER,cash:25000000},
   {level:1,cash:NaN},
   {level:1,cash:Infinity},
   {level:1,cash:-1},
   {level:1,cash:100},
  ]){
   const career=makeCareer();career.facilities.training=level;career.cash=cash;
   const before=structuredClone(career);
   assert.throws(()=>upgrade(career,'training'));
   assert.deepEqual(career,before,'invalid upgrade leaves saved Career values untouched');
  }
 }
});
