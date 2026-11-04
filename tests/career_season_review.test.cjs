'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const careerImport=import('../src/modules/career.js');

function makeCompletedCareer({club=0,members=[0,1],table,cup,season=3,week=14,fixtures}={}){
 return {club,season,week,fixtures:fixtures??Array.from({length:14},()=>[]),leagueFinished:true,members,
  table:table??Object.fromEntries(members.map((id,index)=>[id,{p:14,w:8-index,d:2,l:4,gf:20-index,ga:12,pts:26-index*3}])),
  cup:cup??{stage:3,eliminated:false,pending:false,wins:3},history:[{kind:'league',a:1,b:0}],
 };
}

test('season review summarizes a completed real Career fixture loop without changing it',async()=>{
 const C=(await careerImport).CAREER;
 const teams=Array.from({length:8},(_,id)=>({id:'club_'+id,name:'Club '+id,group:'club26',flag:'C'+id,
  continent:'UEFA',rank:55+id,customRoster:Array.from({length:12},(_,i)=>({id:`p${id}_${i}`,name:`Player ${id}-${i}`,
   role:['GK','DF','DF','DF','MF','MF','MF','MF','FW','FW','FW','FW'][i],age:22,level:1,xp:0,power:50,shoot:35,defense:40,value:4000000}))}));
 const career=C.createCareer(0,teams);
 let guard=0;
 while(!career.leagueFinished&&guard++<30){
  const fixture=C.currentCareerFixture(career);
  assert.ok(fixture,'fixture loop remains playable until the season is complete');
  C.advanceCareer(career,teams,[2,0]);
 }
 assert.equal(career.leagueFinished,true,'fixture loop completed');
 assert.equal(career.cup.stage,3,'the in-Career Cup completed during the season');
 const before=structuredClone(career),review=C.careerSeasonReview(career,teams);
 assert.equal(review.available,true);assert.equal(review.season,1);
 assert.equal(review.clubId,0);assert.equal(review.clubName,'Club 0');
 assert.equal(review.league.championId,0);assert.equal(review.league.championName,'Club 0');
 assert.equal(review.league.championIsUserClub,true);assert.equal(review.league.clubPosition,1);
 assert.equal(review.league.teamCount,8);assert.equal(review.league.clubRecord.played,14);
 assert.equal(review.league.clubRecord.wins,14);assert.equal(review.league.clubRecord.points,42);
 assert.equal(review.cup.status,'champion');assert.equal(review.cup.wins,3);
 assert.deepEqual(career,before,'review is deeply read-only');
 review.league.standings.reverse();
 assert.deepEqual(career,before,'returned ranking does not alias the Career save');
});

test('ranking uses Career standings tie breaks and stable member order',async()=>{
 const C=(await careerImport).CAREER;
 const career=makeCompletedCareer({club:2,members:[2,1,0,3],table:{
  2:{p:14,w:8,d:3,l:3,gf:18,ga:10,pts:27},
  1:{p:14,w:9,d:2,l:3,gf:28,ga:10,pts:29},
  0:{p:14,w:9,d:2,l:3,gf:27,ga:9,pts:29},
  3:{p:14,w:9,d:2,l:3,gf:26,ga:9,pts:29},
 },cup:{stage:0,eliminated:false,pending:false,wins:0}});
 const teams=[0,1,2,3].map(id=>({name:'Club '+id}));
 const review=C.careerSeasonReview(career,teams);
 assert.equal(review.available,true);
 assert.deepEqual(review.league.standings.map(row=>row.id),[1,0,3,2],
  'points, goal difference, goals for, then existing stable member order decide rank');
 assert.equal(review.league.championId,1);assert.equal(review.league.clubPosition,4);
 assert.equal(review.league.championIsUserClub,false);
});

test('season review supports legacy completion evidence and unknown cup fields without migration',async()=>{
 const C=(await careerImport).CAREER;
 const legacy=makeCompletedCareer({club:0,members:[0,1],season:undefined,week:14,
  fixtures:Array.from({length:14},()=>[]),cup:undefined,
  table:{0:{p:'14',w:'8',d:'2',l:'4',gf:'20',ga:'12',pts:'26'},1:{p:14,w:7,d:2,l:5,gf:19,ga:14,pts:23}}});
 delete legacy.leagueFinished;delete legacy.season;delete legacy.cup;
 const before=structuredClone(legacy),review=C.careerSeasonReview(legacy,[{name:'Legacy Club'},{name:'Opponent'}]);
 assert.equal(review.available,true);assert.equal(review.season,null);
 assert.equal(review.league.clubPosition,1);assert.equal(review.league.clubRecord.played,14);
 assert.deepEqual(review.cup,{status:'unknown',stage:null,wins:null,pending:null});
 assert.deepEqual(legacy,before,'legacy review does not add completion or migration fields');
});

test('incomplete or malformed legacy season data fails closed without throwing or changing fields',async()=>{
 const C=(await careerImport).CAREER;
 const incomplete=makeCompletedCareer();incomplete.leagueFinished=false;
 const incompleteBefore=structuredClone(incomplete);
 assert.deepEqual(C.careerSeasonReview(incomplete),{
  available:false,reason:'season_not_confirmed_complete',season:3,clubId:0,clubName:null,league:null,
  cup:{status:'champion',stage:3,wins:3,pending:false},
 });
 assert.deepEqual(incomplete,incompleteBefore);
 const malformed=makeCompletedCareer({members:[0,1],table:{0:{pts:10,gf:5,ga:2},1:{pts:'?',gf:4,ga:2}}});
 const malformedBefore=structuredClone(malformed),result=C.careerSeasonReview(malformed);
 assert.equal(result.available,false);assert.equal(result.reason,'league_data_unavailable');
 assert.equal(result.league,null);assert.equal(result.cup.status,'champion');
 assert.deepEqual(malformed,malformedBefore);
 assert.equal(C.careerSeasonReview(null).reason,'career_unavailable');
 assert.equal(C.careerSeasonReview({leagueFinished:true,club:0,members:[],table:{0:{pts:0,gf:0,ga:0}}}).reason,'league_data_unavailable');
});

test('Career cup summary distinguishes champion, eliminated, pending and malformed states',async()=>{
 const C=(await careerImport).CAREER;
 const base=makeCompletedCareer({});
 const summary=cup=>C.careerSeasonReview({...base,cup}).cup;
 assert.equal(summary({stage:2,wins:2,eliminated:true,pending:false}).status,'eliminated');
 assert.equal(summary({stage:1,wins:1,eliminated:false,pending:true}).status,'pending');
 assert.equal(summary({stage:1,wins:1,eliminated:false,pending:false}).status,'in_progress');
 assert.equal(summary({stage:3,wins:'bad',eliminated:false,pending:false}).status,'champion');
 assert.equal(summary({stage:3,wins:3,eliminated:true,pending:false}).status,'unknown','conflicting terminal markers fail closed');
 assert.equal(summary({stage:99,wins:-1,eliminated:false,pending:'no'}).status,'unknown');
});
