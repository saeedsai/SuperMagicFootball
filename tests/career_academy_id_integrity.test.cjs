'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

const apis=async()=>[
 (await runtimeImport).signAcademy,
 (await moduleImport).CAREER.signAcademy,
];
function fixture(id='academy-new'){
 return {career:{cash:10000000,
  roster:Array.from({length:12},(_,i)=>({id:i===0?12:`club-${i}`,num:i+1,value:1000000})),
  scouted:[{id,name:'Academy Player',num:13,value:4000000,role:'MF'}]},
 };
}

test('Career academy signing rejects duplicate cross-type or current-squad identities atomically',async()=>{
 for(const sign of await apis())for(const scenario of [
  {id:'12',releaseIndex:0},
  {id:'club-5',releaseIndex:0},
 ]){
  const {career}=fixture(scenario.id),before=structuredClone(career);
  assert.throws(()=>sign(career,0,scenario.releaseIndex),/already in your squad/);
  assert.deepEqual(career,before,'duplicate identity cannot charge or replace the roster');
 }
});

test('Career academy signing rejects missing or blank candidate identities atomically',async()=>{
 for(const sign of await apis())for(const scenario of [
  {missing:true},
  {id:''},
  {id:-1},
  {id:Number.MAX_SAFE_INTEGER+1},
 ]){
  const {career}=fixture();
  if(scenario.missing)delete career.scouted[0].id;else career.scouted[0].id=scenario.id;
  const before=structuredClone(career);
  assert.throws(()=>sign(career,0,0),/Invalid youth player identity/);
  assert.deepEqual(career,before,'invalid identity cannot charge or replace the roster');
 }
});
