'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const careerImport=import('../src/modules/career.js');
const runtimeImport=import('../src/career.js');

function completeSeason(C,season=1){
 const members=[3,1,8,5];
 const career={club:3,season,seasonDate:'2026-06-30',week:14,leagueFinished:true,members,
  fixtures:Array.from({length:14},()=>[]),table:{
   3:{p:14,w:10,d:2,l:2,gf:27,ga:10,pts:32},
   1:{p:14,w:11,d:1,l:2,gf:30,ga:9,pts:34},
   8:{p:14,w:7,d:2,l:5,gf:21,ga:18,pts:23},
   5:{p:14,w:3,d:1,l:10,gf:12,ga:31,pts:10},
  },cup:{stage:2,eliminated:true,pending:false,wins:1},
  roster:Array.from({length:12},(_,i)=>({id:'p'+i,age:20,contractYears:2,condition:71,injuryWeeks:1})),
  facilities:{training:1},history:[],
 };
 return career;
}

test('explicit next season rollover archives a read-only completed league and cup result',async()=>{
 const C=(await careerImport).CAREER,R=await runtimeImport,career=completeSeason(C),runtime=structuredClone(career);
 assert.equal(C.completedSeasonArchive(career).length,0);
 C.nextSeason(career);
 R.nextSeason(runtime);
 assert.deepEqual(runtime.seasonArchive,career.seasonArchive,'standalone and bundled Career APIs preserve identical results');
 const archive=C.completedSeasonArchive(career);
 assert.equal(career.season,2);assert.equal(career.week,0);assert.equal(career.leagueFinished,false);
 assert.equal(archive.length,1);assert.equal(archive[0].season,1);assert.equal(archive[0].clubId,3);
 assert.equal(archive[0].championId,1);assert.equal(archive[0].clubPosition,2);assert.equal(archive[0].teamCount,4);
 assert.equal(archive[0].cup.status,'eliminated');assert.equal(archive[0].cup.wins,1);
 assert.deepEqual(archive[0].standings.map(row=>row.id),[1,3,8,5]);
 archive[0].standings.reverse();
 assert.deepEqual(C.completedSeasonArchive(career)[0].standings.map(row=>row.id),[1,3,8,5],
  'review snapshots cannot mutate the saved archive');
});

test('incomplete seasons are never archived and old Career saves remain valid',async()=>{
 const C=(await careerImport).CAREER,R=await runtimeImport,career=completeSeason(C),runtime=structuredClone(career);
 career.leagueFinished=false;career.week=4;delete career.seasonArchive;
 runtime.leagueFinished=false;runtime.week=4;delete runtime.seasonArchive;
 C.nextSeason(career);
 R.nextSeason(runtime);
 assert.deepEqual(runtime,career,'legacy incomplete rollover remains source/module compatible');
 assert.deepEqual(career.seasonArchive,undefined,'no legacy migration or false completion record is written');
 assert.deepEqual(C.completedSeasonArchive(career),[]);
});

test('season archive is idempotent per season and bounded to twelve entries',async()=>{
 const C=(await careerImport).CAREER,R=await runtimeImport,career=completeSeason(C);
 C.nextSeason(career);
 career.season=1;career.leagueFinished=true;
 C.nextSeason(career);
 assert.equal(career.seasonArchive.length,1,'replaying rollover does not duplicate the same club season');
 career.seasonArchive=Array.from({length:14},(_,index)=>({season:index+1,clubId:3}));
 career.season=15;career.week=14;career.leagueFinished=true;
 C.nextSeason(career);
 assert.equal(career.seasonArchive.length,12);
 assert.equal(career.seasonArchive.at(-1).season,15);
 assert.deepEqual(C.completedSeasonArchive(career).map(row=>row.season),career.seasonArchive.map(row=>row.season));
});

test('malformed legacy archive marker cannot suppress a complete rollover snapshot',async()=>{
 const C=(await careerImport).CAREER,R=await runtimeImport,career=completeSeason(C),runtime=structuredClone(career);
 for(const value of [career,runtime])value.seasonArchive=[{season:1,clubId:3}];
 C.nextSeason(career);R.nextSeason(runtime);
 assert.deepEqual(runtime.seasonArchive,career.seasonArchive,'module and standalone rollover remain in sync');
 assert.equal(career.seasonArchive.length,2,'preserve legacy row and append the verified current season');
 assert.deepEqual(career.seasonArchive[1].standings.map(row=>row.id),[1,3,8,5]);
 assert.equal(career.seasonArchive[1].clubPosition,2);
});
