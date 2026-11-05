'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadStore(){return import('../scripts/online-result-store.mjs');}
const initial=()=>({schemaVersion:1,matchId:'0123456789abcdef0123456789abcdef',status:'finished',terminal:true,half:2,
  clock:120,tick:7200,participants:[{userId:'player_alpha',side:0},{userId:'player_bravo',side:1}],
  teamIds:['team_japan','team_brazil'],score:[3,2]});
function cloneState(state){return new Map(structuredClone([...state]));}

class FakePool{
  constructor(){this.results=new Map();this.rollbacks=0;this.releases=0;this.inserts=0;this.failAt=null;}
  async query(sql,params){return this.exec(sql,params,this.results,false);}
  async connect(){
    const pool=this;let state=cloneState(this.results),released=false;
    return {async query(sql,params){if(released)throw Error('client already released');return pool.exec(sql,params,state,true);},
      release(){released=true;pool.releases++;}};
  }
  exec(sql,params,state,inTransaction){
    const normalized=sql.replace(/\s+/g,' ').trim().toLowerCase();
    if(normalized==='begin')return {rows:[]};
    if(normalized==='commit'){
      if(this.failAt==='commit'){const error=Error('commit failed');error.code='XXCOMMIT';throw error;}
      this.results=state;return {rows:[]};
    }
    if(normalized==='rollback'){this.rollbacks++;return {rows:[]};}
    if(normalized.startsWith('select pg_advisory_xact_lock'))return {rows:[{}]};
    if(normalized.startsWith('insert into smf_online_match_results')){
      this.inserts++;
      if(this.failAt==='insert'){const error=Error('insert failed');error.code='XXINSERT';throw error;}
      if(this.failAt==='unique'){const error=Error('unique match ID race');error.code='23505';throw error;}
      const [match_id,schema_version,participant_0,participant_1,team_0,team_1,score_0,score_1,half,clock_seconds,simulation_tick,payload_hash,json,recorded_at]=params;
      if(state.has(match_id)){const error=Error('unique match ID');error.code='23505';throw error;}
      const final_result=JSON.parse(json);
      const row={match_id,schema_version,participant_0,participant_1,team_0,team_1,score_0,score_1,half,clock_seconds,
        simulation_tick,payload_hash,final_result,recorded_at:new Date(recorded_at)};
      state.set(match_id,row);return {rows:[row]};
    }
    if(normalized.startsWith('select payload_hash, final_result, recorded_at from smf_online_match_results where match_id=$1')){
      const row=this.results.get(params[0]);return {rows:row?[structuredClone(row)]:[]};
    }
    if(normalized.startsWith('select payload_hash, final_result, recorded_at from smf_online_match_results')&&normalized.includes('participant_0=$1 or participant_1=$1')){
      const [accountId,...tail]=params;const limit=tail.at(-1),cursor=tail.length===3?{recordedAt:tail[0],matchId:tail[1]}:null;
      const rows=[...this.results.values()].filter(row=>row.participant_0===accountId||row.participant_1===accountId)
        .filter(row=>!cursor||row.recorded_at.toISOString()<cursor.recordedAt||
          (row.recorded_at.toISOString()===cursor.recordedAt&&row.match_id<cursor.matchId))
        .sort((a,b)=>b.recorded_at-a.recorded_at||b.match_id.localeCompare(a.match_id)).slice(0,limit).map(row=>structuredClone(row));
      return {rows};
    }
    if(normalized.startsWith('select payload_hash, final_result, recorded_at from smf_online_match_results')){
      const row=state.get(params[0]);return {rows:row?[structuredClone(row)]:[]};
    }
    throw Error(`Unexpected SQL in test adapter: ${sql}${inTransaction?' (transaction)':''}`);
  }
}

async function setup(lifecycleStore=null){
  const {createOnlineResultStore}=await loadStore();const db=new FakePool();
  const store=createOnlineResultStore({db,now:()=>new Date('2026-11-04T14:00:00.000Z'),lifecycleStore});
  return {store,db};
}

test('records a strictly validated terminal final result durably and reads it back',async()=>{
  const {store,db}=await setup();const result=await store.recordFinalResult(initial());
  assert.equal(result.duplicate,false);assert.equal(result.recordedAt,'2026-11-04T14:00:00.000Z');
  assert.deepEqual(result.score,[3,2]);assert.deepEqual(result.teamIds,['team_japan','team_brazil']);
  assert.deepEqual(result.participants,[{userId:'player_alpha',side:0},{userId:'player_bravo',side:1}]);
  assert.equal((await store.getFinalResult(result.matchId)).duplicate,false);
  assert.equal(db.results.size,1);assert.equal(db.inserts,1);assert.equal(db.releases,1);
});

test('PVP lifecycle completion is written in the immutable result transaction and rolls back on failure',async()=>{
 const calls=[];let shouldFail=false;
 const lifecycleStore={async markCompletedInTransaction(client,result){calls.push([result.matchId,!!client]);if(shouldFail)throw Error('lifecycle commit unavailable');}};
 const {store,db}=await setup(lifecycleStore);shouldFail=true;
 await assert.rejects(store.recordFinalResult(initial()),/lifecycle commit unavailable/);
 assert.equal(db.results.size,0,'a lifecycle failure rolls back the immutable result too');
 shouldFail=false;await store.recordFinalResult(initial());assert.equal(db.results.size,1);
 await store.recordFinalResult(initial());assert.equal(calls.length,3,'same-result retries recheck lifecycle completion in the same transaction');
});

test('same match ID and same result is idempotent; conflicting result cannot overwrite stored final score',async()=>{
  const {store,db}=await setup();const result=initial();
  const first=await store.recordFinalResult(result),retry=await store.recordFinalResult({...result,score:[3,2]});
  assert.equal(retry.duplicate,true);assert.equal(retry.recordedAt,first.recordedAt);assert.equal(db.inserts,1);
  await assert.rejects(store.recordFinalResult({...result,score:[4,2]}),error=>error.code==='immutable-conflict');
  assert.deepEqual((await store.getFinalResult(result.matchId)).score,[3,2]);assert.equal(db.inserts,1);
});

test('rejects incomplete, nonterminal, malformed, client-extended, or out-of-range final results before a write',async()=>{
  const {store,db}=await setup(),base=initial();
  const invalid=[
    {...base,status:'play'},
    {...base,terminal:false},
    {...base,half:1},
    {...base,tick:0},
    {...base,clock:Infinity},
    {...base,score:[1.5,0]},
    {...base,score:[1000,0]},
    {...base,participants:[{userId:'player_alpha',side:1},{userId:'player_bravo',side:0}]},
    {...base,participants:[{userId:'player_alpha',side:0},{userId:'player_alpha',side:1}]},
    {...base,teamIds:['same_team','same_team']},
    {...base,unexpected:'client-data'},
    {...base,matchId:'not-an-opaque-match-id'}
  ];
  for(const payload of invalid)await assert.rejects(store.recordFinalResult(payload));
  assert.equal(db.results.size,0);assert.equal(db.inserts,0);
});

test('transaction failures rollback and release without persisting a partial result',async()=>{
  const {store,db}=await setup();db.failAt='insert';
  await assert.rejects(store.recordFinalResult(initial()),error=>error.code==='XXINSERT');
  assert.equal(db.results.size,0);assert.equal(db.rollbacks,1);assert.equal(db.releases,1);
  db.failAt='commit';
  await assert.rejects(store.recordFinalResult(initial()),error=>error.code==='XXCOMMIT');
  assert.equal(db.results.size,0);assert.equal(db.rollbacks,2);assert.equal(db.releases,2);
});

test('database unique race is retryable and malformed stored digest is detected',async()=>{
  const {store,db}=await setup();db.failAt='unique';
  await assert.rejects(store.recordFinalResult(initial()),error=>error.code==='idempotency-race');
  assert.equal(db.rollbacks,1);assert.equal(db.results.size,0);db.failAt=null;
  const saved=await store.recordFinalResult(initial());
  const row=db.results.get(saved.matchId);row.final_result.score=[99,99];
  await assert.rejects(store.getFinalResult(saved.matchId),error=>error.code==='corrupt-result');
});

test('result IDs are scoped to unique match IDs and invalid lookup identifiers are rejected',async()=>{
  const {store,db}=await setup();assert.equal(await store.getFinalResult(initial().matchId),null);
  await assert.rejects(store.getFinalResult('bad'),error=>error.code==='invalid-match-id');
  await store.recordFinalResult(initial());
  const second={...initial(),matchId:'ffffffffffffffffffffffffffffffff',score:[1,0],
    participants:[{userId:'player_charlie',side:0},{userId:'player_delta',side:1}]};
  await store.recordFinalResult(second);
  assert.equal(db.results.size,2);
});

test('match history is paginated by deterministic timestamp and ID cursor and filters either participant side',async()=>{
  const {store,db}=await setup();
  const rows=[initial(),{...initial(),matchId:'b'.repeat(32),participants:[{userId:'player_charlie',side:0},{userId:'player_alpha',side:1}],score:[0,2]},
    {...initial(),matchId:'c'.repeat(32),participants:[{userId:'player_delta',side:0},{userId:'player_echo',side:1}]}];
  for(const row of rows)await store.recordFinalResult(row);
  const first=await store.listMatchResults('player_alpha',{limit:1});
  assert.equal(first.items.length,1);assert.equal(first.items[0].matchId,'b'.repeat(32));assert.ok(first.nextCursor);
  const second=await store.listMatchResults('player_alpha',{limit:1,cursor:first.nextCursor});
  assert.equal(second.items.length,1);assert.equal(second.items[0].matchId,initial().matchId);assert.equal(second.nextCursor,null);
  assert.equal(db.results.size,3);
  await assert.rejects(store.listMatchResults('player_alpha',{limit:51}),error=>error.code==='invalid-limit');
  await assert.rejects(store.listMatchResults('player_alpha',{limit:1,cursor:first.nextCursor.replace(/.$/,'!')}),error=>error.code==='invalid-cursor');
  const otherAccountPage=await store.listMatchResults('player_bravo',{limit:1,cursor:first.nextCursor});
  assert.ok(otherAccountPage.items.every(item=>item.participants.some(row=>row.userId==='player_bravo')),'a cursor never grants access to another participant’s results');
  await assert.rejects(store.listMatchResults('player_alpha',{limit:1,cursor:Buffer.from(JSON.stringify({v:1,t:'not-a-date',m:'d'.repeat(32)})).toString('base64url')}),error=>error.code==='invalid-cursor');
});
