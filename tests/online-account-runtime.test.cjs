const test = require('node:test');
const assert = require('node:assert/strict');

function poolStub(){
  const calls=[];
  const pool={calls,async query(text){calls.push(text);return {rows:[]};},async connect(){return {query:async()=>({rows:[]}),release(){}};}};
  return pool;
}
const good={DATABASE_URL:'postgresql://service:secret@db.example.test:5432/game',SMF_OIDC_ISSUER:'https://identity.example.test/',SMF_OIDC_AUDIENCE:'smf-api',SMF_OIDC_JWKS_URL:'https://identity.example.test/keys',SMF_ALLOWED_ORIGINS:'https://saeedsai.github.io, https://play.example.test'};
const careerTeams=['japan','brazil','france','germany','spain','italy','england','canada','mexico','argentina'];

test('online account runtime applies the SQL schema before exposing API adapters',async()=>{
  const {createOnlineAccountRuntime}=await import('../scripts/online-account-runtime.mjs');
  const pool=poolStub();
  const runtime=await createOnlineAccountRuntime({env:good,pool,fetchImpl:async()=>({ok:true,text:async()=>'{"keys":[]}'}),now:()=>1800000000000,
    matchmaking:{isValidTeamId:id=>careerTeams.includes(id)},canonicalTeamIds:careerTeams});
  assert.equal(pool.calls.length,7);
  assert.match(pool.calls[0],/CREATE TABLE IF NOT EXISTS smf_online_profiles/);
  assert.match(pool.calls[1],/CREATE TABLE IF NOT EXISTS smf_online_match_results/);
  assert.match(pool.calls[2],/CREATE TABLE IF NOT EXISTS smf_online_match_lifecycle/);
  assert.match(pool.calls[3],/CREATE TABLE IF NOT EXISTS smf_online_match_checkpoint/);
  assert.match(pool.calls[4],/CREATE TABLE IF NOT EXISTS smf_online_token_balances/);
  assert.match(pool.calls[5],/CREATE TABLE IF NOT EXISTS smf_online_ut_owned_items/);
  assert.match(pool.calls[6],/CREATE TABLE IF NOT EXISTS smf_online_career_seasons/);
  assert.equal(typeof runtime.matchLifecycleStore.recordAssigned,'function');
  assert.equal(typeof runtime.matchLifecycleStore.listStatuses,'function');
  assert.equal(typeof runtime.matchCheckpointStore.store,'function');
  assert.equal(typeof runtime.matchCheckpointStore.load,'function');
  assert.equal(typeof runtime.matchCheckpointStore.listActive,'function');
  assert.deepEqual(runtime.allowedOrigins,['https://saeedsai.github.io','https://play.example.test']);
  assert.equal(typeof runtime.handle,'function');
  assert.equal(typeof runtime.store.putSnapshot,'function');
  assert.equal(typeof runtime.resultStore.recordFinalResult,'function');
  assert.equal(typeof runtime.resultStore.getFinalResult,'function');
  assert.equal(typeof runtime.resultStore.listMatchResults,'function');
  assert.equal(typeof runtime.rewardStore.claimMatchReward,'function');
  assert.equal(typeof runtime.rewardStore.getBalance,'function');
  assert.equal(typeof runtime.ultimateTeamStore.getCatalog,'function');
  assert.equal(typeof runtime.ultimateTeamStore.isItemOwned,'function');
  assert.equal(typeof runtime.ultimateTeamStore.purchase,'function');
  assert.equal(typeof runtime.onlineCareerSchedule.buildSchedule,'function');
  assert.equal(typeof runtime.onlineCareerService.createSeason,'function');
  assert.equal(typeof runtime.onlineCareerService.advanceMatchResult,'function');
});

test('online account runtime rejects missing database and unsafe or wildcard origins',async()=>{
  const {createOnlineAccountRuntime}=await import('../scripts/online-account-runtime.mjs');
  const pool=poolStub();
  for(const env of [
    {...good,DATABASE_URL:'sqlite://local.db'},
    {...good,SMF_ALLOWED_ORIGINS:'*'},
    {...good,SMF_ALLOWED_ORIGINS:'http://localhost:8000'},
    {...good,SMF_ALLOWED_ORIGINS:'https://example.test/path'}
  ]) await assert.rejects(()=>createOnlineAccountRuntime({env,pool}),/DATABASE_URL|SMF_ALLOWED_ORIGINS/);
  assert.equal(pool.calls.length,0,'unsafe deployment configuration cannot migrate or start');
});

test('online account runtime does not start when migration fails',async()=>{
  const {createOnlineAccountRuntime}=await import('../scripts/online-account-runtime.mjs');
  const pool=poolStub();pool.query=async()=>{throw new Error('database unavailable')};
  await assert.rejects(()=>createOnlineAccountRuntime({env:good,pool}),/database unavailable/);
});

test('online account runtime fails closed when durable-result schema migration fails',async()=>{
  const {createOnlineAccountRuntime}=await import('../scripts/online-account-runtime.mjs');
  const pool=poolStub();let calls=0;
  pool.query=async text=>{calls++;if(calls===2)throw new Error('result schema unavailable');pool.calls.push(text);return {rows:[]};};
  await assert.rejects(()=>createOnlineAccountRuntime({env:good,pool}),/result schema unavailable/);
  assert.equal(calls,2,'runtime must not expose the account API without durable results schema');
});

test('online account runtime fails closed when authoritative checkpoint schema migration fails',async()=>{
  const {createOnlineAccountRuntime}=await import('../scripts/online-account-runtime.mjs');
  const pool=poolStub();let calls=0;
  pool.query=async text=>{calls++;if(calls===4)throw new Error('checkpoint schema unavailable');pool.calls.push(text);return {rows:[]};};
  await assert.rejects(()=>createOnlineAccountRuntime({env:good,pool}),/checkpoint schema unavailable/);
  assert.equal(calls,4,'runtime must not expose PVP without the checkpoint schema');
});

test('online account runtime fails closed when reward-ledger schema migration fails',async()=>{
  const {createOnlineAccountRuntime}=await import('../scripts/online-account-runtime.mjs');
  const pool=poolStub();let calls=0;
  pool.query=async text=>{calls++;if(calls===5)throw new Error('reward schema unavailable');pool.calls.push(text);return {rows:[]};};
  await assert.rejects(()=>createOnlineAccountRuntime({env:good,pool,fetchImpl:async()=>({ok:true,text:async()=>'{}'})}),/reward schema unavailable/);
  assert.equal(calls,5,'runtime must not expose reward APIs without the idempotent ledger schema');
});

test('online account runtime fails closed when Ultimate Team ownership migration fails',async()=>{
  const {createOnlineAccountRuntime}=await import('../scripts/online-account-runtime.mjs');
  const pool=poolStub();let calls=0;
  pool.query=async text=>{calls++;if(calls===6)throw new Error('UT schema unavailable');pool.calls.push(text);return {rows:[]};};
  await assert.rejects(()=>createOnlineAccountRuntime({env:good,pool,fetchImpl:async()=>({ok:true,text:async()=>'{}'})}),/UT schema unavailable/);
  assert.equal(calls,6,'runtime must not expose Online UT before its ownership and purchase ledger schema exists');
});

test('online account runtime fails closed when Online Career schema migration fails',async()=>{
  const {createOnlineAccountRuntime}=await import('../scripts/online-account-runtime.mjs');
  const pool=poolStub();let calls=0;
  pool.query=async text=>{calls++;if(calls===7)throw new Error('career schema unavailable');pool.calls.push(text);return {rows:[]};};
  await assert.rejects(()=>createOnlineAccountRuntime({env:good,pool,fetchImpl:async()=>({ok:true,text:async()=>'{}'})}),/career schema unavailable/);
  assert.equal(calls,7,'runtime must not expose API without durable Online Career progression schema');
});
