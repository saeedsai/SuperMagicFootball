'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const leagueImport=import('../src/modules/custom_league.js');
const teams=Array.from({length:20},(_,id)=>({id,name:`Club ${id+1}`,rank:48+(id*17)%45}));

test('Custom League creates a deterministic double round robin with mirrored return legs and odd-team byes',async()=>{
 const {createCustomLeague,customLeagueValid}=await leagueImport;
 for(let count=4;count<=16;count++){
  const ids=Array.from({length:count},(_,i)=>i+2),one=createCustomLeague(ids[0],ids,teams),two=createCustomLeague(ids[0],ids,teams);
  assert.deepEqual(one,two,`${count} entrants produce byte-equivalent JSON state`);
  assert.equal(one.rounds.length,(count%2?count:count-1)*2);
  assert.equal(one.rounds.reduce((n,r)=>n+r.matches.length,0),count*(count-1));
  assert.ok(one.rounds.every(r=>r.byes.length===count%2));
  assert.equal(customLeagueValid(one,teams),true);
  const half=one.rounds.length/2;
  for(let i=0;i<half;i++){
   assert.deepEqual(one.rounds[i+half].matches,one.rounds[i].matches.map(([home,away])=>[away,home]));
   assert.deepEqual(one.rounds[i+half].byes,one.rounds[i].byes);
  }
  for(const id of ids){
   const appearances=one.rounds.flatMap(r=>r.matches).filter(pair=>pair.includes(id)).length;
   assert.equal(appearances,2*(count-1));
  }
 }
});

test('Custom League validates entrants and rejects duplicate, missing, unknown, and out-of-range clubs',async()=>{
 const {createCustomLeague}=await leagueImport;
 for(const [club,ids] of [[0,null],[0,[]],[0,[0,1,2]],[0,[0,1,2,3,3]],[0,[0,1,2,99]],[15,[0,1,2,3]],[0,Array.from({length:17},(_,i)=>i)]])
  assert.throws(()=>createCustomLeague(club,ids,teams),/4–16 different existing teams/);
 assert.throws(()=>createCustomLeague(0,[0,1,2,3],[]),/4–16 different existing teams/);
});

test('campaign advances deterministic AI fixtures, player scores, standings and serializable results through season end',async()=>{
 const {createCustomLeague,customLeagueCurrent,customLeagueStandings,advanceCustomLeague,customLeagueValid}=await leagueImport;
 for(const count of [4,5,8,15,16]){
  const ids=Array.from({length:count},(_,i)=>i),campaign=createCustomLeague(ids[0],ids,teams);
  assert.equal(customLeagueValid(JSON.parse(JSON.stringify(campaign)),teams),true);
  let next=campaign,rounds=0;
  while(next.phase==='league'){
   const fixture=customLeagueCurrent(next);
   assert.equal(fixture.round,rounds+1);
   if(!fixture.bye){assert.throws(()=>advanceCustomLeague(next,teams,[31,0]),/valid score/i);assert.throws(()=>advanceCustomLeague(next,teams,[0,0,0]),/valid score/i);}
   next=advanceCustomLeague(next,teams,fixture.bye?null:[2,1]);
   rounds++;assert.equal(customLeagueValid(JSON.parse(JSON.stringify(next)),teams),true);
  }
  assert.equal(rounds,campaign.rounds.length);
  assert.equal(next.phase,'finished');assert.ok(ids.includes(next.winner));
  assert.equal(next.history.length,count*(count-1));
  assert.deepEqual(customLeagueStandings(next).map(x=>x.position),ids.map((_,i)=>i+1));
  assert.equal(customLeagueStandings(next).find(x=>x.id===0).p,2*(count-1));
  assert.equal(customLeagueStandings(next)[0].id,next.winner);
  assert.equal(JSON.stringify(JSON.parse(JSON.stringify(next))),JSON.stringify(next));
  assert.throws(()=>advanceCustomLeague(next,teams,[0,0]),/invalid or completed/i);
 }
});

test('selected club home/away orientation is consistent and byes only accept null score',async()=>{
 const {createCustomLeague,customLeagueCurrent,advanceCustomLeague}=await leagueImport;
 const state=createCustomLeague(4,[0,1,2,4,5],teams),home=state.rounds[0].matches.find(pair=>pair.includes(state.club));
 if(home){
  const result=advanceCustomLeague(state,teams,[3,1]).history.find(row=>row.userControlled);
  assert.equal(result.home,state.club===home[0]?state.club:home[0]);
  assert.deepEqual([result.homeGoals,result.awayGoals],home[0]===state.club?[3,1]:[1,3]);
 }
 const odd=createCustomLeague(0,[0,1,2,3,4],teams),bye=odd.rounds.findIndex(round=>round.byes.includes(0));
 let before=odd;for(let round=0;round<bye;round++)before=advanceCustomLeague(before,teams,customLeagueCurrent(before).bye?null:[1,0]);
 assert.equal(customLeagueCurrent(before).bye,true);
 assert.throws(()=>advanceCustomLeague(before,teams,[0,0]),/bye round/i);
 assert.equal(advanceCustomLeague(before,teams,null).roundIdx,bye+1);
});

test('validation rejects altered schedules, records, scores, standings, phase and save data',async()=>{
 const {createCustomLeague,customLeagueCurrent,customLeagueValid,advanceCustomLeague}=await leagueImport;
 const original=createCustomLeague(0,[0,1,2,3,4],teams);let played=original;
 while(customLeagueCurrent(played).bye)played=advanceCustomLeague(played,teams,null);
 played=advanceCustomLeague(played,teams,[2,0]);
 const tamper=mutate=>{const value=structuredClone(played);mutate(value);return value;};
 const corrupt=[
  tamper(c=>c.rounds[0].matches[0][0]=c.rounds[0].matches[0][1]),
  tamper(c=>c.history[0].homeGoals=31),
  tamper(c=>c.history.pop()),
  tamper(c=>c.table[0].pts++),
  tamper(c=>c.roundIdx=99),
  tamper(c=>c.phase='finished'),
  tamper(c=>c.winner=0),
  tamper(c=>c.seed=-1),
  tamper(c=>c.id='cup_CUSTOM'),
  tamper(c=>c.participants.reverse()),
 ];
 for(const bad of corrupt)assert.equal(customLeagueValid(bad,teams),false);
 const replayed=structuredClone(played),aiRow=replayed.history.find(row=>!row.userControlled);
 if(aiRow){
  aiRow.homeGoals=aiRow.homeGoals===0?1:aiRow.homeGoals-1;
  replayed.table=Object.fromEntries(replayed.participants.map(id=>[id,{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}]));
  for(const row of replayed.history){const h=replayed.table[row.home],a=replayed.table[row.away];h.p++;a.p++;h.gf+=row.homeGoals;h.ga+=row.awayGoals;a.gf+=row.awayGoals;a.ga+=row.homeGoals;
   if(row.homeGoals>row.awayGoals){h.w++;h.pts+=3;a.l++;}else if(row.homeGoals<row.awayGoals){a.w++;a.pts+=3;h.l++;}else{h.d++;a.d++;h.pts++;a.pts++;}}
  assert.equal(customLeagueValid(replayed,teams),false,'AI-controlled scores cannot be forged even with matching standings');
 }
 assert.equal(customLeagueValid(original,teams),true);
});

test('Custom League is reachable in Cups and keeps its campaign outside Career and Cup save schemas',async()=>{
 const {createCustomLeague}=await leagueImport;
 const ui=readFileSync('src/modules/ui.js','utf8'),career=readFileSync('src/modules/career.js','utf8'),cupSlots=readFileSync('src/modules/cup_slots.js','utf8');
 assert.match(ui,/navItem\('Custom League','customLeagueSetup'/);
 assert.match(ui,/data-action="customLeagueStart"/);
 assert.match(ui,/function saveCustomLeague\(value\)/);
 assert.match(ui,/careerStorage\.setItem\('legend_customLeague'/);
 assert.match(ui,/careerStorage\.getItem\('legend_customLeague'\)!==customLeagueStorageBaseline/,'older tabs cannot overwrite a newer Custom League campaign');
 assert.match(ui,/function customLeagueKickoff\(/);
 assert.match(ui,/function customLeagueBye\(/);
 assert.match(ui,/advanceCustomLeague\(customLeagueRun,TEAMS,ev\.score\)/);
 assert.match(career,/function createCareer\(/);
 assert.match(cupSlots,/const KEY='legend_cupSlots'/);
 const data=createCustomLeague(0,[0,1,2,3],teams);
 assert.equal(data.id,'league_CUSTOM');assert.equal(data.compId,'CUSTOM_LEAGUE');assert.equal(data.format,'custom-league');
 assert.equal(data.cup,undefined);assert.equal(data.roster,undefined);assert.equal(data.cash,undefined);
});
