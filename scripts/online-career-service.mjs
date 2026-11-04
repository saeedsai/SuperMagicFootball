import {createHash, randomBytes} from 'node:crypto';

const ACCOUNT_ID=/^[A-Za-z0-9_-]{8,128}$/;
const PARTICIPANT_ID=/^[A-Za-z0-9_-]{8,64}$/;
const TEAM_ID=/^[A-Za-z0-9_-]{1,64}$/;
const OPAQUE_ID=/^[a-f0-9]{32}$/;
const FIXTURE_LIMIT=64;
const MAX_SEASON_ARCHIVE=20;
const AI_PARTICIPANT='smf_server_career_ai';

export class OnlineCareerError extends Error {
  constructor(code,message){super(message);this.name='OnlineCareerError';this.code=code;}
}
function fail(code,message){throw new OnlineCareerError(code,message)}
function exactKeys(value,keys){return !!value&&typeof value==='object'&&!Array.isArray(value)&&
  (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)&&
  Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}
function safeAccount(value){if(typeof value!=='string'||!ACCOUNT_ID.test(value))fail('invalid-account','Invalid account identifier')}
function safeSeason(value){if(typeof value!=='string'||!OPAQUE_ID.test(value))fail('invalid-season','Invalid season identifier')}
function dateIso(value){const date=value instanceof Date?value:new Date(value);if(!Number.isFinite(date.getTime()))fail('service-clock','Online Career clock is invalid');return date.toISOString()}
function parseFixtures(accountId,fixtures,teamId){
  if(!Array.isArray(fixtures)||fixtures.length<1||fixtures.length>FIXTURE_LIMIT)fail('invalid-schedule','A season must contain 1 to 64 fixtures');
  const seenMatches=new Set(),seenFixtureIds=new Set(),seenOpponents=new Set();
  return fixtures.map((fixture,index)=>{
    if(!exactKeys(fixture,['fixtureNo','fixtureId','matchId','participants','teamIds','mode'])||fixture.fixtureNo!==index+1||
      !OPAQUE_ID.test(fixture.fixtureId||'')||seenFixtureIds.has(fixture.fixtureId)||!OPAQUE_ID.test(fixture.matchId||'')||seenMatches.has(fixture.matchId)||fixture.mode!=='career-ai')
      fail('invalid-schedule','Fixture order and unique match identifiers must be valid');
    seenMatches.add(fixture.matchId);seenFixtureIds.add(fixture.fixtureId);
    if(!Array.isArray(fixture.participants)||fixture.participants.length!==2||
      !fixture.participants.every((row,side)=>exactKeys(row,['userId','side'])&&typeof row.userId==='string'&&PARTICIPANT_ID.test(row.userId)&&row.side===side)||
      fixture.participants[0].userId!==accountId||fixture.participants[1].userId!==AI_PARTICIPANT)
      fail('invalid-schedule','Every fixture must bind the Career account to the reserved server AI in fixed side order');
    if(!Array.isArray(fixture.teamIds)||fixture.teamIds.length!==2||!fixture.teamIds.every(value=>typeof value==='string'&&TEAM_ID.test(value))||fixture.teamIds[0]===fixture.teamIds[1])
      fail('invalid-schedule','Every fixture must contain two distinct valid team identifiers');
    if(fixture.teamIds[0]!==teamId)fail('invalid-schedule','Every fixture must retain the account-selected Career team on side zero');
    if(seenOpponents.has(fixture.teamIds[1]))fail('invalid-schedule','Career opponents must be distinct canonical teams');
    seenOpponents.add(fixture.teamIds[1]);
    return Object.freeze({fixtureNo:fixture.fixtureNo,fixtureId:fixture.fixtureId,matchId:fixture.matchId,
      participants:fixture.participants.map(row=>Object.freeze({...row})),teamIds:fixture.teamIds.slice(),mode:fixture.mode});
  });
}
function resultProjection(result,fixture){
  if(!result||result.schemaVersion!==1||result.status!=='finished'||result.terminal!==true||result.half!==2||result.matchId!==fixture.match_id||
    !Number.isSafeInteger(result.tick)||result.tick<1||!Number.isFinite(result.clock)||result.clock<0||result.clock>1800||
    !Array.isArray(result.participants)||result.participants.length!==2||
    !result.participants.every((row,side)=>exactKeys(row,['userId','side'])&&row.userId===fixture[`participant_${side}`]&&row.side===side)||
    !Array.isArray(result.teamIds)||result.teamIds.length!==2||result.teamIds[0]!==fixture.team_0||result.teamIds[1]!==fixture.team_1||
    !Array.isArray(result.score)||result.score.length!==2||!result.score.every(score=>Number.isSafeInteger(score)&&score>=0&&score<=999))
    fail('fixture-result-mismatch','Durable match result does not match the pre-bound Career fixture');
  const recordedAt=dateIso(result.recordedAt);
  const value={schemaVersion:1,matchId:result.matchId,status:'finished',terminal:true,half:2,clock:result.clock,tick:result.tick,
    participants:result.participants.map(row=>({userId:row.userId,side:row.side})),teamIds:result.teamIds.slice(),score:result.score.slice()};
  return {score:value.score,recordedAt,resultHash:createHash('sha256').update(JSON.stringify(value)).digest('hex')};
}
function summarize(season,fixtures){
  const table=new Map();
  const rowFor=id=>{let row=table.get(id);if(!row){row={teamId:id,played:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,points:0};table.set(id,row)}return row};
  for(const fixture of fixtures){
    if(fixture.status!=='completed')continue;
    const [home,away]=[fixture.team_0,fixture.team_1],[homeScore,awayScore]=[Number(fixture.score_0),Number(fixture.score_1)];
    const h=rowFor(home),a=rowFor(away);h.played++;a.played++;h.goalsFor+=homeScore;h.goalsAgainst+=awayScore;a.goalsFor+=awayScore;a.goalsAgainst+=homeScore;
    if(homeScore>awayScore){h.wins++;a.losses++;h.points+=3}else if(homeScore<awayScore){a.wins++;h.losses++;a.points+=3}else{h.draws++;a.draws++;h.points++;a.points++}
  }
  const standings=[...table.values()].map(row=>({...row,goalDifference:row.goalsFor-row.goalsAgainst}))
    .sort((a,b)=>b.points-a.points||b.goalDifference-a.goalDifference||b.goalsFor-a.goalsFor||a.teamId.localeCompare(b.teamId));
  return Object.freeze({seasonId:season.season_id.trim(),version:Number(season.version),status:season.status,teamId:season.team_id,
    fixtureCount:Number(season.fixture_count),playedCount:Number(season.played_count),
    fixtures:Object.freeze(fixtures.map(row=>Object.freeze({fixtureNo:Number(row.fixture_no),fixtureId:row.fixture_id.trim(),status:row.status,
      teamIds:[row.team_0,row.team_1],score:row.status==='completed'?[Number(row.score_0),Number(row.score_1)]:null,
      recordedAt:row.recorded_at?dateIso(row.recorded_at):null}))),standings:Object.freeze(standings.map(row=>Object.freeze(row)))});
}

/**
 * Internal Online Career primitive. buildSchedule is a trusted server-side scheduler and is
 * the only source accepted for season fixtures; request payloads must never be passed to it.
 * Each fixture binds a one-use server match ID, both authenticated participants, and teams.
 * Advancement reads the immutable durable result store; no caller-supplied score is accepted.
 */
export function createOnlineCareerService({db,resultStore,buildSchedule,now=()=>new Date()}={}){
  if(!db||typeof db.connect!=='function'||typeof db.query!=='function')throw new TypeError('Online Career requires a PostgreSQL pool');
  if(!resultStore||typeof resultStore.getFinalResult!=='function')throw new TypeError('Online Career requires the durable authoritative result store');
  if(typeof buildSchedule!=='function')throw new TypeError('Online Career requires a trusted server-side schedule builder');
  if(typeof now!=='function')throw new TypeError('Online Career requires a clock');

  async function transaction(work){
    const client=await db.connect();
    try{await client.query('BEGIN');const value=await work(client);await client.query('COMMIT');return value}
    catch(error){try{await client.query('ROLLBACK')}catch{};throw error}
    finally{client.release?.()}
  }
  async function consistentRead(work){
    const client=await db.connect();
    try{
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const value=await work(client);await client.query('COMMIT');return value;
    }catch(error){try{await client.query('ROLLBACK')}catch{};throw error}
    finally{client.release?.()}
  }
  async function getSeason(accountId,seasonId){
    safeAccount(accountId);safeSeason(seasonId);
    const projection=await consistentRead(async client=>{
      const found=await client.query('SELECT account_id,season_id,team_id,fixture_count,played_count,version,status FROM smf_online_career_seasons WHERE account_id=$1 AND season_id=$2',[accountId,seasonId]);
      const season=found.rows?.[0];if(!season)return null;
      const rows=await client.query('SELECT fixture_no,fixture_id,match_id,participant_0,participant_1,team_0,team_1,status,score_0,score_1,recorded_at,result_hash FROM smf_online_career_fixtures WHERE account_id=$1 AND season_id=$2 ORDER BY fixture_no',[accountId,seasonId]);
      return {season,fixtures:rows.rows||[]};
    });
    if(!projection)return null;
    if(projection.fixtures.length!==Number(projection.season.fixture_count))fail('corrupt-season','Stored Online Career fixture count is inconsistent');
    return summarize(projection.season,projection.fixtures);
  }
  async function getFixtureBinding(accountId,seasonId,fixtureNo){
    safeAccount(accountId);safeSeason(seasonId);
    if(!Number.isSafeInteger(fixtureNo)||fixtureNo<1||fixtureNo>FIXTURE_LIMIT)fail('invalid-fixture','Invalid fixture number');
    const response=await db.query('SELECT fixture_no,fixture_id,match_id,participant_0,participant_1,team_0,team_1,status,mode FROM smf_online_career_fixtures WHERE account_id=$1 AND season_id=$2 AND fixture_no=$3',[accountId,seasonId,fixtureNo]);
    const row=response.rows?.[0];if(!row)return null;
    if(row.status!=='scheduled')fail('fixture-not-schedulable','Only scheduled Career fixtures can be reserved for matchmaking');
    if(!OPAQUE_ID.test(row.fixture_id.trim())||!OPAQUE_ID.test(row.match_id.trim())||![row.participant_0,row.participant_1].every(value=>typeof value==='string'&&PARTICIPANT_ID.test(value))||
      row.participant_0!==accountId||row.participant_1!==AI_PARTICIPANT||![row.team_0,row.team_1].every(value=>typeof value==='string'&&TEAM_ID.test(value))||row.team_0===row.team_1||
      row.mode!=='career-ai')fail('corrupt-fixture','Stored Career fixture binding is invalid');
    return Object.freeze({fixtureNo:Number(row.fixture_no),fixtureId:row.fixture_id.trim(),matchId:row.match_id.trim(),participants:Object.freeze([
      Object.freeze({userId:row.participant_0,side:0}),Object.freeze({userId:row.participant_1,side:1})]),teamIds:Object.freeze([row.team_0,row.team_1]),mode:row.mode});
  }
  async function getNextFixtureBinding(accountId,seasonId){
    safeAccount(accountId);safeSeason(seasonId);
    const response=await db.query("SELECT fixture_no FROM smf_online_career_fixtures WHERE account_id=$1 AND season_id=$2 AND status='scheduled' ORDER BY fixture_no LIMIT 1",[accountId,seasonId]);
    const row=response.rows?.[0];if(!row)return null;
    return getFixtureBinding(accountId,seasonId,Number(row.fixture_no));
  }
  async function getCurrentSeason(accountId){
    safeAccount(accountId);
    const response=await db.query("SELECT season_id FROM smf_online_career_seasons WHERE account_id=$1 ORDER BY CASE WHEN status='active' THEN 0 ELSE 1 END,created_at DESC,season_id DESC LIMIT 1",[accountId]);
    const seasonId=response.rows?.[0]?.season_id?.trim();return seasonId?getSeason(accountId,seasonId):null;
  }
  async function listSeasons(accountId,limit=MAX_SEASON_ARCHIVE){
    safeAccount(accountId);
    if(!Number.isSafeInteger(limit)||limit<1)fail('invalid-limit','Career archive limit must be a positive whole number');
    const boundedLimit=Math.min(limit,MAX_SEASON_ARCHIVE);
    const response=await db.query('SELECT season_id FROM smf_online_career_seasons WHERE account_id=$1 ORDER BY created_at DESC,season_id DESC LIMIT $2',[accountId,boundedLimit]);
    const seasons=[];
    for(const row of response.rows||[]){
      const seasonId=typeof row.season_id==='string'?row.season_id.trim():'';
      if(!OPAQUE_ID.test(seasonId))fail('corrupt-archive','Stored Online Career archive contains an invalid season ID');
      const season=await getSeason(accountId,seasonId);
      if(!season)fail('corrupt-archive','Stored Online Career archive contains a missing season');
      seasons.push(season);
    }
    return Object.freeze(seasons);
  }
  async function createSeason(accountId,teamId=null){
    safeAccount(accountId);
    if(teamId!==null&&(typeof teamId!=='string'||!TEAM_ID.test(teamId)))fail('invalid-team','Invalid Career team identifier');
    const fixtures=await buildSchedule(accountId,{teamId});
    const selectedTeam=fixtures?.[0]?.teamIds?.[0];
    if(typeof selectedTeam!=='string'||!TEAM_ID.test(selectedTeam))fail('invalid-schedule','Career schedule has no selected team');
    const normalized=parseFixtures(accountId,fixtures,selectedTeam),seasonId=randomBytes(16).toString('hex'),timestamp=dateIso(now());
    await transaction(async client=>{
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`${accountId}|online-career-active-season`]);
      const active=(await client.query("SELECT account_id,season_id,team_id,fixture_count,played_count,version,status FROM smf_online_career_seasons WHERE account_id=$1 AND status='active' ORDER BY created_at DESC LIMIT 1 FOR UPDATE",[accountId])).rows?.[0];
      if(active){if(active.team_id!==selectedTeam)fail('active-season-exists','An active Online Career season already uses another team');return active.season_id.trim();}
      await client.query('INSERT INTO smf_online_career_seasons (account_id,season_id,team_id,fixture_count,played_count,version,status,created_at,updated_at) VALUES ($1,$2,$3,$4,0,1,$5,$6,$6)',[accountId,seasonId,selectedTeam,normalized.length,'active',timestamp]);
      for(const fixture of normalized)await client.query(
        'INSERT INTO smf_online_career_fixtures (account_id,season_id,fixture_no,fixture_id,match_id,participant_0,participant_1,team_0,team_1,mode,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
        [accountId,seasonId,fixture.fixtureNo,fixture.fixtureId,fixture.matchId,fixture.participants[0].userId,fixture.participants[1].userId,fixture.teamIds[0],fixture.teamIds[1],fixture.mode,'scheduled']);
    });
    const current=await getCurrentSeason(accountId);if(!current)fail('season-not-found','Online Career season was not found');return current;
  }
  async function advanceFixture(accountId,seasonId,fixtureNo){
    safeAccount(accountId);safeSeason(seasonId);
    if(!Number.isSafeInteger(fixtureNo)||fixtureNo<1||fixtureNo>FIXTURE_LIMIT)fail('invalid-fixture','Invalid fixture number');
    const scheduled=await db.query('SELECT account_id,season_id,fixture_no,match_id,participant_0,participant_1,team_0,team_1,status,score_0,score_1,recorded_at,result_hash FROM smf_online_career_fixtures WHERE account_id=$1 AND season_id=$2 AND fixture_no=$3',[accountId,seasonId,fixtureNo]);
    const initialFixture=scheduled.rows?.[0];if(!initialFixture)fail('fixture-not-found','Career fixture was not found');
    const durable=await resultStore.getFinalResult(initialFixture.match_id.trim());
    if(!durable)fail('result-not-ready','Career fixture has no durable completed match result');
    const projected=resultProjection(durable,initialFixture);
    let duplicate=false;
    await transaction(async client=>{
      // Lock the season row first so two different fixtures cannot lose playedCount/version updates.
      await client.query('SELECT account_id,season_id,fixture_count,played_count,version,status FROM smf_online_career_seasons WHERE account_id=$1 AND season_id=$2 FOR UPDATE',[accountId,seasonId]);
      const currentSeason=(await client.query('SELECT account_id,season_id,fixture_count,played_count,version,status FROM smf_online_career_seasons WHERE account_id=$1 AND season_id=$2',[accountId,seasonId])).rows?.[0];
      if(!currentSeason)fail('season-not-found','Online Career season was not found');
      const current=(await client.query('SELECT account_id,season_id,fixture_no,match_id,participant_0,participant_1,team_0,team_1,status,score_0,score_1,recorded_at,result_hash FROM smf_online_career_fixtures WHERE account_id=$1 AND season_id=$2 AND fixture_no=$3 FOR UPDATE',[accountId,seasonId,fixtureNo])).rows?.[0];
      if(!current)fail('fixture-not-found','Career fixture was not found');
      if(current.match_id.trim()!==initialFixture.match_id.trim()||current.participant_0!==initialFixture.participant_0||current.participant_1!==initialFixture.participant_1||current.team_0!==initialFixture.team_0||current.team_1!==initialFixture.team_1)
        fail('fixture-changed','Career fixture changed during result validation');
      if(current.status==='completed'){
        if(current.result_hash!==projected.resultHash)fail('fixture-result-conflict','A different durable result was already applied to this fixture');
        duplicate=true;return;
      }
      if(current.status!=='scheduled'||currentSeason.status!=='active')fail('season-not-active','Online Career season is not active');
      await client.query("UPDATE smf_online_career_fixtures SET status='completed',score_0=$4,score_1=$5,recorded_at=$6,result_hash=$7 WHERE account_id=$1 AND season_id=$2 AND fixture_no=$3 AND status='scheduled'",
        [accountId,seasonId,fixtureNo,projected.score[0],projected.score[1],projected.recordedAt,projected.resultHash]);
      const played=Number(currentSeason.played_count)+1,total=Number(currentSeason.fixture_count),status=played===total?'complete':'active';
      await client.query('UPDATE smf_online_career_seasons SET played_count=$3,version=version+1,status=$4,updated_at=$5 WHERE account_id=$1 AND season_id=$2',
        [accountId,seasonId,played,status,dateIso(now())]);
    });
    const season=await getSeason(accountId,seasonId);if(!season)fail('season-not-found','Online Career season was not found');
    return Object.freeze({...season,duplicate});
  }
  async function advanceMatchResult(matchId){
    if(typeof matchId!=='string'||!OPAQUE_ID.test(matchId))fail('invalid-match-id','Invalid authoritative match identifier');
    const response=await db.query('SELECT account_id,season_id,fixture_no,status FROM smf_online_career_fixtures WHERE match_id=$1',[matchId]);
    const fixture=response.rows?.[0];if(!fixture)return null;
    if(!['scheduled','completed'].includes(fixture.status))fail('corrupt-fixture','Stored Career fixture status is invalid');
    // advanceFixture reads and verifies the immutable result itself. For a completed row,
    // its result hash makes retries idempotent after a lost acknowledgement.
    return advanceFixture(fixture.account_id,fixture.season_id.trim(),Number(fixture.fixture_no));
  }
  return Object.freeze({createSeason,getSeason,getCurrentSeason,listSeasons,getFixtureBinding,getNextFixtureBinding,advanceFixture,advanceMatchResult});
}
