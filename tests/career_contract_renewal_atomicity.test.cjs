'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');
const apis=async()=>[(await runtimeImport).renewContract,(await moduleImport).CAREER.renewContract];
function career({value=10000000,years=1,cash=100000000}={}){return {cash,roster:[{id:'player-1',num:9,value,contractYears:years,role:'FW'}]};}
test('contract renewal keeps its fee rule and replaces player/budget atomically in both APIs',async()=>{
 for(const renew of await apis()){
  const c=career(),original=c.roster[0];
  assert.equal(renew(c,0),2150000);
  assert.equal(c.cash,97850000);
  assert.equal(c.roster[0].contractYears,3);
  assert.equal(c.roster[0].id,'player-1');
  assert.equal(original.contractYears,1,'a failed or valid operation never mutates the prior player object');
  assert.notEqual(c.roster[0],original);
 }
});
test('legacy missing and zero renewal values retain the 5 million fallback',async()=>{
 for(const renew of await apis()){
  for(const v of ['missing','zero']){
   const c=career({years:undefined});if(v==='missing')delete c.roster[0].value;else c.roster[0].value=0;
   delete c.roster[0].contractYears;
   assert.equal(renew(c,0),1500000);
   assert.equal(c.cash,98500000);
   assert.equal(c.roster[0].contractYears,2);
  }
 }
});
test('invalid indexes and malformed contract fields fail without changing Career state',async()=>{
 for(const renew of await apis()){
  const base=career();base.roster.push(...Array.from({length:11},(_,i)=>({id:`p${i+2}`,contractYears:1,value:1000000})));
  for(const index of [1.5,-1,12,NaN,'0']){
   const c=structuredClone(base),before=structuredClone(c);
   assert.throws(()=>renew(c,index),/No player selected/);
   assert.deepEqual(c,before);
  }
  for(const key of ['value','contractYears','cash']){
   for(const bad of [NaN,Infinity,-1,'not-money']){
    const c=structuredClone(base);if(key==='cash')c.cash=bad;else c.roster[0][key]=bad;
    const before=structuredClone(c);
    assert.throws(()=>renew(c,0));
    assert.deepEqual(c,before,`${key}=${String(bad)} must not partially renew`);
   }
  }
 }
});
test('insufficient budget does not change a player term or cash',async()=>{
 for(const renew of await apis()){
  const c=career({cash:100});const before=structuredClone(c);
  assert.throws(()=>renew(c,0),/Not enough budget/);
  assert.deepEqual(c,before);
 }
});
