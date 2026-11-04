import {createHash} from 'node:crypto';

const MATCH_ID=/^[a-f0-9]{32}$/;
const USER_ID=/^[A-Za-z0-9_-]{8,64}$/;
const ACCOUNT_ID=/^[A-Za-z0-9_-]{8,128}$/;
const TEAM_ID=/^[A-Za-z0-9_-]{1,64}$/;
const SCORE_MAX=999;
const HISTORY_LIMIT_MAX=50;
const HISTORY_CURSOR_MAX=512;

export class OnlineResultStoreError extends Error {
  constructor(code,message){super(message);this.name='OnlineResultStoreError';this.code=code;}
}

function fail(code,message){throw new OnlineResultStoreError(code,message)}
function exactKeys(value,keys){return !!value&&typeof value==='object'&&!Array.isArray(value)&&
  (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)&&
  Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}

function normalizeFinalResult(value){
  const keys=['schemaVersion','matchId','status','terminal','half','clock','tick','participants','teamIds','score'];
  if(!exactKeys(value,keys))fail('invalid-result-schema','Final result does not match the authoritative schema');
  if(value.schemaVersion!==1)fail('invalid-result-schema','Unsupported final result schema version');
  if(typeof value.matchId!=='string'||!MATCH_ID.test(value.matchId))fail('invalid-match-id','Invalid match identifier');
  if(value.status!=='finished'||value.terminal!==true||value.half!==2)
    fail('not-terminal','Only completed two-half authoritative matches can be recorded');
  if(!Number.isSafeInteger(value.tick)||value.tick<1)fail('invalid-tick','Final simulation tick must be a positive integer');
  if(!Number.isFinite(value.clock)||value.clock<0||value.clock>1800)
    fail('invalid-clock','Final match clock must be finite and within the supported range');
  if(!Array.isArray(value.score)||value.score.length!==2||
     !value.score.every(score=>Number.isSafeInteger(score)&&score>=0&&score<=SCORE_MAX))
    fail('invalid-score','Final score must contain two bounded non-negative integers');
  if(!Array.isArray(value.teamIds)||value.teamIds.length!==2||!value.teamIds.every(team=>typeof team==='string'&&TEAM_ID.test(team)))
    fail('invalid-teams','Final result requires two valid authoritative team IDs');
  if(value.teamIds[0]===value.teamIds[1])fail('invalid-teams','A match must have two distinct teams');
  if(!Array.isArray(value.participants)||value.participants.length!==2||
     !value.participants.every((row,side)=>exactKeys(row,['userId','side'])&&typeof row.userId==='string'&&USER_ID.test(row.userId)&&row.side===side))
    fail('invalid-participants','Final result requires one authenticated participant per side');
  if(value.participants[0].userId===value.participants[1].userId)
    fail('invalid-participants','A match must have two distinct participants');
  return Object.freeze({schemaVersion:1,matchId:value.matchId,status:'finished',terminal:true,half:2,
    clock:Math.round(value.clock*10_000)/10_000,tick:value.tick,
    participants:Object.freeze(value.participants.map(row=>Object.freeze({userId:row.userId,side:row.side}))),
    teamIds:Object.freeze(value.teamIds.slice()),score:Object.freeze(value.score.slice())});
}

function stableJson(value){
  // normalizeFinalResult builds a new object in fixed key order and fixed arrays,
  // so its JSON representation is canonical for an idempotency comparison.
  return JSON.stringify(value);
}
function digest(text){return createHash('sha256').update(text).digest('hex');}
function parseResult(value){
  if(typeof value==='string'){
    try{return JSON.parse(value)}catch{fail('corrupt-result','Stored final result is not valid JSON')}
  }
  return value;
}
function dateValue(value){
  const date=value instanceof Date?value:new Date(value);
  if(!Number.isFinite(date.getTime()))fail('invalid-clock','Result store clock returned an invalid timestamp');
  return date.toISOString();
}
function publicResult(value,recordedAt,duplicate){
  return Object.freeze({...value,participants:Object.freeze(value.participants.map(row=>Object.freeze({...row}))),
    teamIds:Object.freeze(value.teamIds.slice()),score:Object.freeze(value.score.slice()),recordedAt,duplicate});
}

function historyCursor(recordedAt,matchId){
  const text=JSON.stringify({v:1,t:recordedAt,m:matchId});
  return Buffer.from(text,'utf8').toString('base64url');
}
function parseHistoryCursor(cursor,accountId){
  if(cursor===undefined||cursor===null||cursor==='')return null;
  if(typeof cursor!=='string'||cursor.length>HISTORY_CURSOR_MAX||!/^[A-Za-z0-9_-]+$/.test(cursor))fail('invalid-cursor','Invalid match history cursor');
  let value;
  try{value=JSON.parse(Buffer.from(cursor,'base64url').toString('utf8'))}catch{fail('invalid-cursor','Invalid match history cursor')}
  if(!exactKeys(value,['v','t','m'])||value.v!==1||typeof value.t!=='string'||
    !Number.isFinite(Date.parse(value.t))||new Date(value.t).toISOString()!==value.t||typeof value.m!=='string'||!MATCH_ID.test(value.m))
    fail('invalid-cursor','Invalid match history cursor');
  return {recordedAt:value.t,matchId:value.m};
}

/**
 * Durable repository for authoritative terminal match results only.
 * Callers must pass a final result assembled from the server-owned engine;
 * this repository has no client, reward, token, or settlement interface.
 */
export function createOnlineResultStore({db,now=()=>new Date()}={}){
  if(!db||typeof db.connect!=='function'||typeof db.query!=='function')
    throw new TypeError('Online result store requires a PostgreSQL Pool-like connect() and query() client');
  if(typeof now!=='function')throw new TypeError('now must be a function');

  async function transaction(work){
    const client=await db.connect();
    try{
      await client.query('BEGIN');
      const value=await work(client);
      await client.query('COMMIT');
      return value;
    }catch(error){
      try{await client.query('ROLLBACK')}catch{}
      if(error?.code==='23505')fail('idempotency-race','A result with this match ID committed concurrently; retry the same result');
      throw error;
    }finally{client.release?.();}
  }

  async function recordFinalResult(raw){
    const value=normalizeFinalResult(raw),json=stableJson(value),hash=digest(json);
    return transaction(async client=>{
      // Locking the key serializes a first insert as well as concurrent retries.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[value.matchId]);
      const existing=await client.query(
        'SELECT payload_hash, final_result, recorded_at FROM smf_online_match_results WHERE match_id=$1 FOR UPDATE',[value.matchId]);
      const row=existing.rows?.[0];
      if(row){
        if(row.payload_hash!==hash)fail('immutable-conflict','A different final result is already stored for this match ID');
        const stored=parseResult(row.final_result);
        return publicResult(stored,row.recorded_at instanceof Date?row.recorded_at.toISOString():String(row.recorded_at),true);
      }
      const recordedAt=dateValue(now());
      await client.query(
        `INSERT INTO smf_online_match_results
          (match_id,schema_version,participant_0,participant_1,team_0,team_1,score_0,score_1,half,clock_seconds,simulation_tick,payload_hash,final_result,recorded_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14)`,
        [value.matchId,value.schemaVersion,value.participants[0].userId,value.participants[1].userId,
          value.teamIds[0],value.teamIds[1],value.score[0],value.score[1],value.half,value.clock,value.tick,hash,JSON.stringify(value),recordedAt]);
      return publicResult(value,recordedAt,false);
    });
  }

  async function getFinalResult(matchId){
    if(typeof matchId!=='string'||!MATCH_ID.test(matchId))fail('invalid-match-id','Invalid match identifier');
    const response=await db.query(
      'SELECT payload_hash, final_result, recorded_at FROM smf_online_match_results WHERE match_id=$1',[matchId]);
    const row=response.rows?.[0];
    if(!row)return null;
    const stored=parseResult(row.final_result);
    const normalized=normalizeFinalResult(stored);
    if(normalized.matchId!==matchId||digest(stableJson(normalized))!==row.payload_hash)
      fail('corrupt-result','Stored final result does not match its immutable digest');
    return publicResult(normalized,row.recorded_at instanceof Date?row.recorded_at.toISOString():String(row.recorded_at),false);
  }

  async function listMatchResults(accountId,{limit=20,cursor}={}){
    if(typeof accountId!=='string'||!ACCOUNT_ID.test(accountId))fail('invalid-account','Invalid account identifier');
    if(!Number.isSafeInteger(limit)||limit<1||limit>HISTORY_LIMIT_MAX)fail('invalid-limit','Match history limit must be between 1 and 50');
    const after=parseHistoryCursor(cursor,accountId);
    const params=after?[accountId,after.recordedAt,after.matchId,limit+1]:[accountId,limit+1];
    const response=after?await db.query(
      `SELECT payload_hash, final_result, recorded_at FROM smf_online_match_results
       WHERE (participant_0=$1 OR participant_1=$1) AND (recorded_at,match_id)<($2::timestamptz,$3::char(32))
       ORDER BY recorded_at DESC,match_id DESC LIMIT $4`,params):await db.query(
      `SELECT payload_hash, final_result, recorded_at FROM smf_online_match_results
       WHERE participant_0=$1 OR participant_1=$1
       ORDER BY recorded_at DESC,match_id DESC LIMIT $2`,params);
    const rows=response.rows||[],hasMore=rows.length>limit;
    const page=rows.slice(0,limit).map(row=>{
      const normalized=normalizeFinalResult(parseResult(row.final_result));
      if(!(normalized.participants[0].userId===accountId||normalized.participants[1].userId===accountId)||
        digest(stableJson(normalized))!==row.payload_hash)fail('corrupt-result','Stored final result does not match its immutable digest');
      const recordedAt=row.recorded_at instanceof Date?row.recorded_at.toISOString():String(row.recorded_at);
      if(!Number.isFinite(Date.parse(recordedAt))||new Date(recordedAt).toISOString()!==recordedAt)fail('corrupt-result','Stored result timestamp is invalid');
      return publicResult(normalized,recordedAt,false);
    });
    const last=page.at(-1);
    return Object.freeze({items:Object.freeze(page),nextCursor:hasMore&&last?historyCursor(last.recordedAt,last.matchId):null});
  }

  return Object.freeze({recordFinalResult,getFinalResult,listMatchResults});
}
