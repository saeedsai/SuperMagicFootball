'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const careerImport=import('../src/career.js');
const dataImport=import('../src/data.js');
const expansionImport=import('../src/expanded.js');
const slotsImport=import('../src/modules/career_slots.js');

function memoryStorage(){
 const bytes=new Map();let failNextSet=false;
 return {
  getItem:key=>bytes.has(key)?bytes.get(key):null,
  setItem(key,value){if(failNextSet){failNextSet=false;throw Error('QuotaExceededError');}bytes.set(key,String(value));},
  removeItem:key=>bytes.delete(key),
  failNextWrite(){failNextSet=true;},
 };
}

async function setup(){
 const [CAREER,data,expansion,slotModule]=await Promise.all([careerImport,dataImport,expansionImport,slotsImport]);
 const TEAMS=data.TEAMS,SHOTS=data.SHOTS;
 expansion.installExpansion(TEAMS,SHOTS);
 const club=TEAMS.find(team=>team.group==='club26'&&Array.isArray(team.customRoster));
 assert.ok(club,'existing selectable Career club fixture available');
 const storage=memoryStorage(),slots=slotModule.CAREER_SLOTS.create(storage);
 const career=CAREER.createCareer(club.index,TEAMS);
 slots.save(1,career,'Multi-season loop');
 return {CAREER,TEAMS,storage,SlotApi:slotModule.CAREER_SLOTS,slots,career};
}

function finishSeason(CAREER,TEAMS,career,slots){
 let cups=0,leagues=0;
 while(!career.leagueFinished){
  const fixture=CAREER.currentCareerFixture(career);
  assert.ok(fixture,'unfinished Career exposes a fixture');
  if(fixture.kind==='cup'){
   cups++;
   assert.equal(career.cup.pending,true,'Cup interruption takes priority over the league round');
  }else leagues++;
  CAREER.advanceCareer(career,TEAMS,[2,0]);
  slots.save(1,career,'Multi-season loop');
 }
 assert.equal(leagues,14,'each season retains the existing fourteen-round league schedule');
 assert.equal(career.week,14);
 assert.equal(career.leagueFinished,true);
 return {cups,season:career.season};
}

test('two Career seasons, Cup interruptions, archive, failed rollover retry and reload stay coherent',async()=>{
 const {CAREER,TEAMS,storage,SlotApi,slots,career}=await setup();

 const first=finishSeason(CAREER,TEAMS,career,slots);
 assert.equal(first.cups,3,'three pending Cup rounds interrupt league fixtures');
 assert.equal(career.cup.stage,3);
 assert.equal(career.cup.wins,3);
 assert.equal(career.seasonArchive,undefined,'completed table remains available until explicit rollover');

 const failedRollover=structuredClone(career);
 CAREER.nextSeason(failedRollover);
 storage.failNextWrite();
 assert.throws(()=>slots.save(1,failedRollover,'Multi-season loop'),/QuotaExceededError/);
 const afterFailure=SlotApi.create(storage).activeCareer();
 assert.equal(afterFailure.season,1,'failed save leaves the completed season active');
 assert.equal(afterFailure.leagueFinished,true);
 assert.equal(afterFailure.seasonArchive,undefined,'failed write did not publish an archive');

 const retry=structuredClone(career);
 CAREER.nextSeason(retry);
 slots.save(1,retry,'Multi-season loop');
 let reloaded=SlotApi.create(storage).activeCareer();
 assert.equal(reloaded.season,2);
 assert.equal(reloaded.week,0);
 assert.equal(reloaded.leagueFinished,false);
 assert.equal(reloaded.seasonArchive.length,1);
 assert.equal(reloaded.seasonArchive[0].season,1);
 assert.equal(reloaded.seasonArchive[0].cup.status,'champion');

 const second=finishSeason(CAREER,TEAMS,reloaded,slots);
 assert.equal(second.cups,3);
 assert.equal(reloaded.season,2);
 const stagedSecond=structuredClone(reloaded);
 CAREER.nextSeason(stagedSecond);
 slots.save(1,stagedSecond,'Multi-season loop');
 reloaded=SlotApi.create(storage).activeCareer();
 assert.equal(reloaded.season,3);
 assert.equal(reloaded.seasonArchive.length,2);
 assert.deepEqual(reloaded.seasonArchive.map(row=>row.season),[1,2]);
 assert.equal(reloaded.week,0);
 assert.equal(reloaded.cup.stage,0);
 assert.equal(reloaded.cup.pending,false);
});

