'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const ACCOUNT='player_alpha',AI='smf_server_career_ai';
const oneMatch='a'.repeat(32),twoMatch='b'.repeat(32);
function finalResult(matchId=oneMatch,overrides={}){
  return {schemaVersion:1,matchId,status:'finished',terminal:true,half:2,clock:120,tick:3600,
    participants:[{userId:ACCOUNT,side:0},{userId:AI,side:1}],teamIds:['team_alpha','team_bravo'],score:[2,1],
    recordedAt:'2026-11-04T12:00:00.000Z',duplicate:false,...overrides};
}
function schedule(matchId=oneMatch){return [{fixtureNo:1,fixtureId:'c'.repeat(32),matchId,participants:[{userId:ACCOUNT,side:0},{userId:AI,side:1}],teamIds:['team_alpha','team_bravo'],mode:'career-ai'}];}
function snapshot(state){return structuredClone({seasons:[...state.seasons],fixtures:[...state.fixtures]});}
class FakePool{
  constructor(){this.seasons=new Map();this.fixtures=new Map();this.tail=Promise.resolve();this.rollbacks=0;this.commits=0;this.lockReads=0;this.seasonLockReads=0;this.failOn=null;this.archiveQueries=[];this.transactionCommands=[];}
  async query(sql,params){return this.exec(sql,params)}
  async connect(){
    const pool=this;let releaseTurn=null,before=null;
    return {async query(sql,params){
      const normalized=sql.replace(/\s+/g,' ').trim().toLowerCase();
      if(normalized.startsWith('begin')){
        pool.transactionCommands.push(normalized);
        const prior=pool.tail;let release;pool.tail=new Promise(resolve=>release=resolve);releaseTurn=release;await prior;before=snapshot(pool);return {rows:[]};
      }
      if(normalized==='commit'){pool.transactionCommands.push(normalized);pool.commits++;releaseTurn?.();releaseTurn=null;return {rows:[]};}
      if(normalized==='rollback'){pool.transactionCommands.push(normalized);pool.rollbacks++;if(before){pool.seasons=new Map(before.seasons);pool.fixtures=new Map(before.fixtures)}releaseTurn?.();releaseTurn=null;return {rows:[]};}
      if(normalized.includes('for update')){pool.lockReads++;if(normalized.includes('smf_online_career_seasons'))pool.seasonLockReads++;}
      return pool.exec(sql,params);
    },release(){releaseTurn?.();releaseTurn=null;}};
  }
  exec(sql,p){
    const q=sql.replace(/\s+/g,' ').trim().toLowerCase();
    if(q.startsWith('select pg_advisory_xact_lock'))return {rows:[{}]};
    if(q.startsWith('insert into smf_online_career_seasons')){
      const [account_id,season_id,team_id,fixture_count,status,created_at]=p;const played_count=0,version=1,updated_at=created_at;
      const row={account_id,season_id,team_id,fixture_count,played_count,version,status,created_at,updated_at};this.seasons.set(`${account_id}:${season_id}`,row);return {rows:[]};
    }
    if(q.startsWith('insert into smf_online_career_fixtures')){
      const [account_id,season_id,fixture_no,fixture_id,match_id,participant_0,participant_1,team_0,team_1,mode,status]=p;
      this.fixtures.set(`${account_id}:${season_id}:${fixture_no}`,{account_id,season_id,fixture_no,fixture_id,match_id,participant_0,participant_1,team_0,team_1,mode,status,score_0:null,score_1:null,recorded_at:null,result_hash:null});return {rows:[]};
    }
    if(q.startsWith('select account_id,season_id,team_id,fixture_count,played_count,version,status from smf_online_career_seasons')){
      if(q.includes("status='active'")){const row=[...this.seasons.values()].find(item=>item.account_id===p[0]&&item.status==='active');return {rows:row?[structuredClone(row)]:[]};}
      const row=this.seasons.get(`${p[0]}:${String(p[1]).trim()}`);return {rows:row?[structuredClone(row)]:[]};
    }
    if(q.startsWith('select season_id from smf_online_career_seasons where account_id=$1 order by created_at desc,season_id desc limit $2')){
      this.archiveQueries.push({accountId:p[0],limit:p[1]});
      const rows=[...this.seasons.values()].filter(item=>item.account_id===p[0]).sort((a,b)=>b.created_at.localeCompare(a.created_at)||String(b.season_id).localeCompare(String(a.season_id))).slice(0,p[1]).map(row=>({season_id:row.season_id}));
      return {rows:structuredClone(rows)};
    }
    if(q.startsWith('select season_id from smf_online_career_seasons')){
      const row=[...this.seasons.values()].filter(item=>item.account_id===p[0]).sort((a,b)=>(a.status==='active'?0:1)-(b.status==='active'?0:1)||b.created_at.localeCompare(a.created_at))[0];return {rows:row?[{season_id:row.season_id}]:[]};
    }
    if(q.startsWith('select account_id,season_id,fixture_count,played_count,version,status from smf_online_career_seasons')){
      const row=this.seasons.get(`${p[0]}:${String(p[1]).trim()}`);return {rows:row?[structuredClone(row)]:[]};
    }
    if(q.startsWith('select fixture_no,fixture_id,match_id,participant_0,participant_1,team_0,team_1,status,score_0,score_1,recorded_at,result_hash from smf_online_career_fixtures')){
      const rows=[...this.fixtures.values()].filter(row=>row.account_id===p[0]&&row.season_id===p[1]).sort((a,b)=>a.fixture_no-b.fixture_no);return {rows:structuredClone(rows)};
    }
    if(q.startsWith('select fixture_no,fixture_id,match_id,participant_0,participant_1,team_0,team_1,status,mode from smf_online_career_fixtures')){
      const row=this.fixtures.get(`${p[0]}:${String(p[1]).trim()}:${p[2]}`);return {rows:row?[{fixture_id:row.fixture_id,match_id:row.match_id,participant_0:row.participant_0,participant_1:row.participant_1,
        fixture_no:row.fixture_no,team_0:row.team_0,team_1:row.team_1,status:row.status,mode:row.mode}]:[]};
    }
    if(q.startsWith('select fixture_no from smf_online_career_fixtures')&&q.includes("status='scheduled'")){
      const row=[...this.fixtures.values()].filter(item=>item.account_id===p[0]&&item.season_id===p[1]&&item.status==='scheduled').sort((a,b)=>a.fixture_no-b.fixture_no)[0];return {rows:row?[{fixture_no:row.fixture_no}]:[]};
    }
    if(q.startsWith('select fixture_no from smf_online_career_fixtures')){
      const row=[...this.fixtures.values()].find(item=>item.account_id===p[0]&&item.season_id===p[1]&&item.fixture_id===p[2]);return {rows:row?[{fixture_no:row.fixture_no}]:[]};
    }
    if(q.startsWith('select account_id,season_id,fixture_no,match_id,participant_0,participant_1,team_0,team_1,status,score_0,score_1,recorded_at,result_hash from smf_online_career_fixtures')){
      const row=this.fixtures.get(`${p[0]}:${String(p[1]).trim()}:${p[2]}`);return {rows:row?[structuredClone(row)]:[]};
    }
    if(q.startsWith('select account_id,season_id,fixture_no,status from smf_online_career_fixtures where match_id=$1')){
      const row=[...this.fixtures.values()].find(item=>item.match_id===p[0]);return {rows:row?[{account_id:row.account_id,season_id:row.season_id,fixture_no:row.fixture_no,status:row.status}]:[]};
    }
    if(q.startsWith('update smf_online_career_fixtures')){
      if(this.failOn==='fixture-update'){this.failOn=null;throw Error('fixture write failed')}
      const [account_id,season_id,fixture_no,score_0,score_1,recorded_at,result_hash]=p,row=this.fixtures.get(`${account_id}:${String(season_id).trim()}:${fixture_no}`);
      if(row&&row.status==='scheduled')Object.assign(row,{status:'completed',score_0,score_1,recorded_at,result_hash});return {rows:[]};
    }
    if(q.startsWith('update smf_online_career_seasons')){
      if(this.failOn==='season-update'){this.failOn=null;throw Error('season write failed')}
      const [account_id,season_id,played_count,status,updated_at]=p,row=this.seasons.get(`${account_id}:${String(season_id).trim()}`);
      if(row)Object.assign(row,{played_count,version:row.version+1,status,updated_at});return {rows:[]};
    }
    throw Error(`Unexpected test SQL: ${sql}`);
  }
}
async function setup({results=new Map(),buildSchedule=()=>schedule(),now=()=>new Date('2026-11-04T12:00:00.000Z')}={}){
  const {createOnlineCareerService}=await import('../scripts/online-career-service.mjs');
  const db=new FakePool(),resultStore={getFinalResult:async id=>results.get(id)||null};
  const service=createOnlineCareerService({db,resultStore,buildSchedule,now});return {service,db,results};
}

test('service requires durable results and validates fixed ordered schedule before database writes',async()=>{
  const {createOnlineCareerService}=await import('../scripts/online-career-service.mjs');
  assert.throws(()=>createOnlineCareerService({db:new FakePool(),resultStore:{getFinalResult:async()=>null}}),/trusted server-side schedule builder/);
  for(const fixtures of [[],[{...schedule()[0],fixtureNo:2}],[{...schedule()[0],score:[99,0]}],
    [{...schedule()[0],participants:[{userId:'player_bravo',side:0},{userId:'player_charlie',side:1}]}],
    [{...schedule()[0],participants:[{userId:ACCOUNT,side:0},{userId:ACCOUNT,side:1}]}],
    [{...schedule()[0],teamIds:['same','same']}],
    [schedule()[0],{...schedule()[0],fixtureNo:2}]]){
    const {service,db}=await setup({buildSchedule:()=>fixtures});
    await assert.rejects(service.createSeason(ACCOUNT));
    assert.equal(db.seasons.size,0);assert.equal(db.fixtures.size,0);
  }
});

test('season schedule and access are account-scoped, standings begin empty, and opponent identities are omitted',async()=>{
  const {service,db}=await setup();const season=await service.createSeason(ACCOUNT);
  assert.match(season.seasonId,/^[a-f0-9]{32}$/);assert.equal(season.status,'active');assert.equal(season.playedCount,0);
  assert.deepEqual(season.standings,[]);assert.equal(season.fixtures[0].fixtureId,'c'.repeat(32));
  assert.equal(Object.hasOwn(season.fixtures[0],'matchId'),false);
  assert.equal(await service.getSeason('player_bravo',season.seasonId),null);
  assert.equal(db.seasons.size,1);assert.equal(db.fixtures.size,1);
});

test('season header and fixture projection use one repeatable-read snapshot',async()=>{
  const {service,db}=await setup();const season=await service.createSeason(ACCOUNT);db.transactionCommands.length=0;
  const result=await service.getSeason(ACCOUNT,season.seasonId);
  assert.equal(result.playedCount,0);assert.equal(result.fixtures[0].status,'scheduled');
  assert.deepEqual(db.transactionCommands,['begin isolation level repeatable read read only','commit']);
});

test('internal fixture binding getter is account-scoped, immutable, and preserves participant/team side order',async()=>{
  const {service}=await setup();const season=await service.createSeason(ACCOUNT);
  const binding=await service.getFixtureBinding(ACCOUNT,season.seasonId,1);
  assert.deepEqual(binding,{fixtureNo:1,fixtureId:'c'.repeat(32),matchId:oneMatch,participants:[{userId:ACCOUNT,side:0},{userId:AI,side:1}],teamIds:['team_alpha','team_bravo'],mode:'career-ai'});
  assert.equal(Object.isFrozen(binding),true);assert.equal(Object.isFrozen(binding.participants),true);
  assert.equal(Object.isFrozen(binding.participants[0]),true);assert.equal(Object.isFrozen(binding.teamIds),true);
  assert.equal(await service.getFixtureBinding('player_bravo',season.seasonId,1),null);
  assert.equal(await service.getFixtureBinding(ACCOUNT,season.seasonId,2),null);
});

test('fixture advances only from exact durable result bound to its match, participants and teams',async()=>{
  const {service,db,results}=await setup();const season=await service.createSeason(ACCOUNT);
  await assert.rejects(service.advanceFixture(ACCOUNT,season.seasonId,1),error=>error.code==='result-not-ready');
  results.set(oneMatch,finalResult(oneMatch,{score:[4,0]}));
  const mismatch=await service.advanceFixture(ACCOUNT,season.seasonId,1);
  assert.equal(mismatch.playedCount,1);assert.deepEqual(mismatch.fixtures[0].score,[4,0]);
  assert.equal(mismatch.standings[0].teamId,'team_alpha');assert.equal(mismatch.standings[0].points,3);
  assert.equal(mismatch.status,'complete');assert.equal(db.seasons.get(`${ACCOUNT}:${season.seasonId}`).version,2);
  await assert.rejects(service.getFixtureBinding(ACCOUNT,season.seasonId,1),error=>error.code==='fixture-not-schedulable');
});

test('current season and next fixture binding are account-scoped and ordered',async()=>{
  const {service}=await setup();const season=await service.createSeason(ACCOUNT);
  assert.equal((await service.getCurrentSeason(ACCOUNT)).seasonId,season.seasonId);
  assert.equal(await service.getCurrentSeason('player_bravo'),null);
  assert.deepEqual(await service.getNextFixtureBinding(ACCOUNT,season.seasonId),await service.getFixtureBinding(ACCOUNT,season.seasonId,1));
  assert.equal(await service.getNextFixtureBinding('player_bravo',season.seasonId),null);
});

test('season archive lists completed and active seasons newest-first without crossing accounts',async()=>{
  const results=new Map();let scheduleNo=0,clock=Date.parse('2026-11-04T12:00:00.000Z');
  const {service,db}=await setup({results,now:()=>new Date(clock+=1000),buildSchedule:async accountId=>{
    scheduleNo++;const code=scheduleNo.toString(16).repeat(32).slice(0,32),match=scheduleNo.toString(16).repeat(32).slice(0,32);
    return [{...schedule(match)[0],fixtureId:code,participants:[{userId:accountId,side:0},{userId:AI,side:1}]}];
  }});
  const completed=await service.createSeason(ACCOUNT);
  // Public season projections deliberately omit private match IDs, so the known fixture binding is used here.
  const firstBinding=await service.getFixtureBinding(ACCOUNT,completed.seasonId,1);results.set(firstBinding.matchId,finalResult(firstBinding.matchId));
  await service.advanceFixture(ACCOUNT,completed.seasonId,1);
  const active=await service.createSeason(ACCOUNT);
  const other=await service.createSeason('player_bravo');
  const rows=await service.listSeasons(ACCOUNT);
  assert.deepEqual(rows.map(row=>row.seasonId),[active.seasonId,completed.seasonId]);
  assert.deepEqual(rows.map(row=>row.status),['active','complete']);
  assert.equal((await service.listSeasons('player_bravo'))[0].seasonId,other.seasonId);
  assert.equal(Object.isFrozen(rows),true);
  assert.equal(db.archiveQueries.at(-2).accountId,ACCOUNT);
});

test('season archive is empty for new accounts and caps valid limits at twenty',async()=>{
  const {service,db}=await setup();
  assert.deepEqual(await service.listSeasons(ACCOUNT),[]);
  assert.deepEqual(await service.listSeasons(ACCOUNT,99),[]);
  assert.deepEqual(db.archiveQueries.map(row=>row.limit),[20,20]);
  for(const invalid of [0,-1,1.5,'5',NaN])await assert.rejects(service.listSeasons(ACCOUNT,invalid),error=>error.code==='invalid-limit');
  await assert.rejects(service.listSeasons('../other'),error=>error.code==='invalid-account');
});

test('does not advance a fixture for a mismatched authenticated participant, side, team, or result ID',async()=>{
  for(const bad of [finalResult(twoMatch),finalResult(oneMatch,{participants:[{userId:'player_other',side:0},{userId:'player_bravo',side:1}]}),
    finalResult(oneMatch,{participants:[{userId:'player_bravo',side:0},{userId:ACCOUNT,side:1}]}),
    finalResult(oneMatch,{teamIds:['team_other','team_bravo']})]){
    const {service,db,results}=await setup();const season=await service.createSeason(ACCOUNT);results.set(oneMatch,bad);
    await assert.rejects(service.advanceFixture(ACCOUNT,season.seasonId,1),error=>error.code==='fixture-result-mismatch');
    assert.equal(db.seasons.get(`${ACCOUNT}:${season.seasonId}`).played_count,0);assert.equal(db.fixtures.get(`${ACCOUNT}:${season.seasonId}:1`).status,'scheduled');
  }
});

test('duplicate result application is idempotent and concurrent callers advance exactly once',async()=>{
  const {service,db,results}=await setup();const season=await service.createSeason(ACCOUNT);results.set(oneMatch,finalResult());
  const [first,second]=await Promise.all([service.advanceFixture(ACCOUNT,season.seasonId,1),service.advanceFixture(ACCOUNT,season.seasonId,1)]);
  assert.equal([first,second].filter(row=>row.duplicate===false).length,1);
  assert.equal([first,second].filter(row=>row.duplicate===true).length,1);
  assert.equal(db.seasons.get(`${ACCOUNT}:${season.seasonId}`).played_count,1);
  assert.equal(db.seasons.get(`${ACCOUNT}:${season.seasonId}`).version,2);
  assert.equal(db.seasonLockReads,3,'season creation and each concurrent application serialize on the owning season row');
});

test('advanceMatchResult retries after durable write and is idempotent after progression',async()=>{
  const {service,db,results}=await setup();const season=await service.createSeason(ACCOUNT);results.set(oneMatch,finalResult());
  db.failOn='season-update';await assert.rejects(service.advanceMatchResult(oneMatch),/season write failed/);
  assert.equal(db.fixtures.get(`${ACCOUNT}:${season.seasonId}:1`).status,'scheduled');
  const advanced=await service.advanceMatchResult(oneMatch);assert.equal(advanced.playedCount,1);assert.equal(advanced.duplicate,false);
  const duplicate=await service.advanceMatchResult(oneMatch);assert.equal(duplicate.playedCount,1);assert.equal(duplicate.duplicate,true);
  assert.equal(await service.advanceMatchResult(twoMatch),null);
});

test('a second active season cannot use another selected team and same-team create is idempotent',async()=>{
  const {service}=await setup({buildSchedule:async(account,{teamId})=>schedule().map(row=>({...row,teamIds:[teamId||'team_alpha','team_bravo']}))});
  const first=await service.createSeason(ACCOUNT,'team_alpha');
  const same=await service.createSeason(ACCOUNT,'team_alpha');assert.equal(same.seasonId,first.seasonId);
  await assert.rejects(service.createSeason(ACCOUNT,'team_other'),error=>error.code==='active-season-exists');
});

test('transaction rollback leaves fixture and season unchanged if a progression write fails',async()=>{
  const {service,db,results}=await setup();const season=await service.createSeason(ACCOUNT);results.set(oneMatch,finalResult());db.failOn='season-update';
  await assert.rejects(service.advanceFixture(ACCOUNT,season.seasonId,1),/season write failed/);
  assert.equal(db.rollbacks,1);assert.equal(db.fixtures.get(`${ACCOUNT}:${season.seasonId}:1`).status,'scheduled');
  assert.equal(db.seasons.get(`${ACCOUNT}:${season.seasonId}`).played_count,0);
});
