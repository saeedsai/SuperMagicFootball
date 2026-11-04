'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

const apis=async()=>[
 (await runtimeImport).advanceCareer,
 (await moduleImport).CAREER.advanceCareer,
];
function makeCareer(){
 return {club:0,season:1,week:0,members:[0,1],fixtures:[[[0,1]]],
  table:{0:{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},1:{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}},
  cup:{stage:0,eliminated:false,pending:false,wins:0},cash:10000000,
  roster:[{id:'career-player',role:'MF',condition:100,injuryWeeks:0,xp:0,level:1,value:1000000}],
  facilities:{training:1,stadium:1,academy:1},history:[],leagueFinished:false};
}

test('Career rejects malformed league rounds and standings before changing saved state',async()=>{
 const corrupt=[];
 let c=makeCareer();c.fixtures[0]=[[0]];corrupt.push(c);
 c=makeCareer();c.fixtures[0]=[[0,0]];corrupt.push(c);
 c=makeCareer();c.fixtures[0]=[[0,9]];corrupt.push(c);
 c=makeCareer();c.fixtures[0]=[[0,1],[0,1]];corrupt.push(c);
 c=makeCareer();c.members=[0,1,2,3];c.fixtures=[[[0,1]]];c.table[2]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};c.table[3]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};corrupt.push(c);
 c=makeCareer();c.members=[0,1,1];corrupt.push(c);
 c=makeCareer();delete c.table[1];corrupt.push(c);
 c=makeCareer();c.table[1]=null;corrupt.push(c);
 c=makeCareer();c.table[1].p=-1;corrupt.push(c);
 for(const advance of await apis())for(const invalid of corrupt){
  const career=structuredClone(invalid),before=structuredClone(invalid);
  assert.throws(()=>advance(career,[{rank:60},{rank:60}],[1,0]),/Invalid Career (fixture schedule|standings table)/);
  assert.deepEqual(career,before,'a rejected schedule cannot alter result, standings, cash, roster progress, or history');
 }
});

test('Career still advances a valid complete league round',async()=>{
 for(const advance of await apis()){
  const career=makeCareer();
  assert.equal(advance(career,[{rank:60},{rank:60}],[1,0]).win,true);
  assert.equal(career.week,1);
  assert.deepEqual(career.table[0],{p:1,w:1,d:0,l:0,gf:1,ga:0,pts:3});
 }
});
