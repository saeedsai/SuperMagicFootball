'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

const apis=async()=>[
 (await runtimeImport).trainPlayer,
 (await moduleImport).CAREER.trainPlayer,
];
const makeCareer=({cash=3000000,xp=0,level=1,training=1}={})=>({
 cash,facilities:{training},roster:[{id:'p1',role:'MF',xp,level,rating:70,potential:90,passing:70,stamina:70}],
});

test('Career training preserves the fee and normalizes legacy numeric XP and level fields',async()=>{
 for(const train of await apis()){
  const career=makeCareer({cash:3000000,xp:'80',level:'1'});
  const player=train(career,0);
  assert.equal(career.cash,1500000);
  assert.equal(player.xp,26);
  assert.equal(player.level,2);
  assert.equal(career.roster[0],player);
 }
});

test('Career training rejects malformed inputs without charging or changing the roster',async()=>{
 for(const train of await apis())for(const override of [
  {cash:NaN},
  {cash:-1},
  {cash:100},
  {xp:'bad'},
  {xp:-1},
  {level:'bad'},
  {training:'bad'},
  {training:-1},
 ]){
  const career=makeCareer(override),before=structuredClone(career);
  assert.throws(()=>train(career,0));
  assert.deepEqual(career,before,'rejected training cannot charge or advance player progress');
 }
 for(const train of await apis()){
  const career=makeCareer(),before=structuredClone(career);
  assert.throws(()=>train(career,1),/Player not found/);
  assert.throws(()=>train(career,'0'),/Player not found/);
  assert.deepEqual(career,before);
 }
});
