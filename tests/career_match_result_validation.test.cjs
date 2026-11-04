'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

const apis=async()=>[
 (await runtimeImport).advanceCareer,
 (await moduleImport).CAREER.advanceCareer,
];
function makeCareer(kind='league'){
 return {club:0,season:1,week:0,members:[0,1],fixtures:[[[0,1]]],
  table:{0:{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},1:{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}},
  cup:{stage:0,eliminated:false,pending:kind==='cup',wins:0},cash:10000000,
  roster:[{id:'career-player',role:'MF',condition:100,injuryWeeks:0,xp:0,level:1,value:1000000}],
  facilities:{training:1,stadium:1,academy:1},history:[],leagueFinished:false};
}

test('Career rejects malformed or out-of-range results before changing any saved state',async()=>{
 const badScores=[undefined,null,[],[0],[0,1,2],[1.5,0],[-1,0],[0,31],[NaN,0],[Infinity,0],['1',0]];
 for(const advance of await apis())for(const score of badScores){
  const career=makeCareer(),before=structuredClone(career);
  assert.throws(()=>advance(career,[{rank:60},{rank:60}],score),/valid score/,
   `bad result ${String(score)} must be rejected`);
  assert.deepEqual(career,before,'rejected result must not change tables, cash, progression, or history');
 }
});

test('Career rejects invalid penalty winners atomically and accepts each player-side result',async()=>{
 for(const advance of await apis()){
  for(const penaltyWinner of [true,2,-1,'0',NaN]){
   const career=makeCareer('cup'),before=structuredClone(career);
   assert.throws(()=>advance(career,[{rank:60},{rank:60}],[0,0],penaltyWinner),/valid penalty winner/);
   assert.deepEqual(career,before,'invalid penalty metadata cannot advance the Cup or alter finances');
  }
  const playerWins=makeCareer('cup');
  const won=advance(playerWins,[{rank:60},{rank:60}],[0,0],0);
  assert.equal(won.win,true);assert.equal(playerWins.cup.stage,1);assert.equal(playerWins.cup.wins,1);
  const opponentWins=makeCareer('cup');
  const lost=advance(opponentWins,[{rank:60},{rank:60}],[0,0],1);
  assert.equal(lost.win,false);assert.equal(opponentWins.cup.eliminated,true);
 }
});

test('league draws ignore stray penalty-winner metadata for rewards and progression',async()=>{
 for(const advance of await apis()){
  const ordinaryDraw=makeCareer(),invalidShootoutDraw=makeCareer();
  const teams=[{rank:60},{rank:60}];
  const ordinaryResult=advance(ordinaryDraw,teams,[1,1]);
  const strayResult=advance(invalidShootoutDraw,teams,[1,1],0);
  assert.equal(ordinaryResult.win,false);
  assert.equal(strayResult.win,false,'a league draw has no shootout winner');
  assert.deepEqual(invalidShootoutDraw,ordinaryDraw,
   'league table, cash and player progression must match the ordinary draw path');
 }
});

