const test=require('node:test');
const assert=require('node:assert/strict');

const teams=['japan','brazil','france','germany','spain','italy','england','canada','mexico','argentina'];

test('Online Career schedule binds one verified account to unique canonical AI opponents',async()=>{
  const {createOnlineCareerScheduleBuilder}=await import('../scripts/online-career-schedule.mjs');
  const calls=[];
  const schedule=createOnlineCareerScheduleBuilder({canonicalTeamIds:teams,isTeamOwned:async(accountId,teamId)=>{calls.push([accountId,teamId]);return true;}});
  const fixtures=await schedule.buildSchedule('account_alpha',{teamId:'brazil'});
  assert.equal(fixtures.length,8);
  assert.equal(calls.length,1);
  assert.deepEqual(calls[0],['account_alpha','brazil']);
  assert.equal(new Set(fixtures.map(row=>row.fixtureId)).size,8);
  assert.equal(new Set(fixtures.map(row=>row.matchId)).size,8);
  assert.equal(new Set(fixtures.map(row=>row.teamIds[1])).size,8);
  for(const [index,fixture] of fixtures.entries()){
    assert.equal(fixture.fixtureNo,index+1);
    assert.deepEqual(fixture.participants,[{userId:'account_alpha',side:0},{userId:'smf_server_career_ai',side:1}]);
    assert.equal(fixture.teamIds[0],'brazil');
    assert.ok(teams.includes(fixture.teamIds[1]));
    assert.equal(fixture.mode,'career-ai');
  }
});

test('free starter schedule does not depend on ownership lookups; locked teams fail closed',async()=>{
  const {createOnlineCareerScheduleBuilder}=await import('../scripts/online-career-schedule.mjs');
  let calls=0;
  const schedule=createOnlineCareerScheduleBuilder({canonicalTeamIds:teams,isTeamOwned:async()=>{calls++;return false;}});
  const starter=await schedule.buildSchedule('account_alpha');
  assert.equal(starter[0].teamIds[0],'japan');
  assert.equal(calls,0);
  await assert.rejects(()=>schedule.buildSchedule('account_alpha',{teamId:'brazil'}),error=>error.code==='team-not-owned');
  const broken=createOnlineCareerScheduleBuilder({canonicalTeamIds:teams,isTeamOwned:async()=>{throw new Error('database unavailable');}});
  await assert.rejects(()=>broken.buildSchedule('account_alpha',{teamId:'brazil'}),error=>error.code==='team-not-owned');
});

test('schedule builder rejects malformed catalogs, identities, teams, and account-supplied AI identity',async()=>{
  const {createOnlineCareerScheduleBuilder}=await import('../scripts/online-career-schedule.mjs');
  assert.throws(()=>createOnlineCareerScheduleBuilder({canonicalTeamIds:['japan','japan'],isTeamOwned:async()=>true}),/canonical team catalog/);
  const schedule=createOnlineCareerScheduleBuilder({canonicalTeamIds:teams,isTeamOwned:async()=>true});
  await assert.rejects(()=>schedule.buildSchedule('bad id'),error=>error.code==='invalid-account');
  await assert.rejects(()=>schedule.buildSchedule('smf_server_career_ai'),error=>error.code==='invalid-account');
  await assert.rejects(()=>schedule.buildSchedule('account_alpha',{teamId:'unknown'}),error=>error.code==='invalid-team');
});
