'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const leagueImport=import('../src/modules/custom_league.js');
const teams=Array.from({length:20},(_,id)=>({id,name:`Club ${id+1}`,rank:48+(id*17)%45}));

test('scheduled away Custom League fixtures launch with the opponent home and normalize results to club perspective',async()=>{
 const {createCustomLeague,customLeagueCurrent,advanceCustomLeague,customLeagueScoreForClub}=await leagueImport;
 const state=createCustomLeague(3,[0,1,2,3,4],teams),fixture=customLeagueCurrent(state);
 assert.equal(fixture.home,false);
 assert.equal(fixture.opponent,2);
 const clubScore=customLeagueScoreForClub(fixture,[2,1]);
 assert.deepEqual(clubScore,[1,2]);
 const next=advanceCustomLeague(state,teams,clubScore);
 const result=next.history.find(row=>row.userControlled);
 assert.deepEqual([result.home,result.away,result.homeGoals,result.awayGoals],[2,3,2,1]);
 assert.equal(next.table['2'].gf,2);
 assert.equal(next.table['3'].gf,1);
 assert.equal(next.version,1,'the existing campaign schema remains unchanged');
 const ui=readFileSync('src/modules/ui.js','utf8');
 assert.ok(ui.includes('home=fixture.home?customLeagueRun.club:fixture.opponent;away=fixture.home?fixture.opponent:customLeagueRun.club'));
 assert.ok(ui.includes('customLeagueScoreForClub(scheduled,ev.score)'));
 assert.ok(ui.includes('awardLocalMatchTokens(ev,clubScore)'));
});

test('scheduled home Custom League fixtures preserve engine score order and reject invalid result input',async()=>{
 const {createCustomLeague,customLeagueCurrent,customLeagueScoreForClub}=await leagueImport;
 const fixture=customLeagueCurrent(createCustomLeague(0,[0,1,2,3,4],teams));
 assert.equal(fixture.home,true);
 assert.deepEqual(customLeagueScoreForClub(fixture,[3,1]),[3,1]);
 for(const bad of [null,[1],[1,2,3],[31,0],[-1,0],[1.5,0],['2',0]])
  assert.throws(()=>customLeagueScoreForClub(fixture,bad),/valid Custom League match result/i);
 const away=customLeagueCurrent(createCustomLeague(3,[0,1,2,3,4],teams));
 assert.throws(()=>customLeagueScoreForClub({...away,bye:true},[1,0]),/valid Custom League match result/i);
});
