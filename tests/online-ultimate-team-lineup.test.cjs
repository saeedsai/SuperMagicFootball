'use strict';
const {test,before,beforeEach}=require('node:test');
const assert=require('node:assert/strict');

let createOnlineUltimateTeamStore,loadAssetsFromNode,assets;
const ACCOUNT='lineup_account',KEY='lineup_save_0001';
const BASE='japan',FOREIGN='brazil';

function makeDb(){
 const state={owned:new Map(),lineups:new Map(),ledger:new Map()},locks=new Map();let failLedger=false;
 const lock=async(key)=>{let release;const previous=locks.get(key)||Promise.resolve();const tail=new Promise(resolve=>release=resolve);locks.set(key,tail);await previous;return ()=>{release();if(locks.get(key)===tail)locks.delete(key);};};
 const ownKey=(account,category,item)=>`${account}:${category}:${item}`;
 const lineupKey=(account,team)=>`${account}:${team}`;
 const ledgerKey=(account,key)=>`${account}:${key}`;
 function lookupOwned(source,account,category,item){return source.owned.has(ownKey(account,category,item));}
 const poolQuery=async(sql,params)=>{
  const q=sql.replace(/\s+/g,' ').trim().toLowerCase();
  if(q.startsWith('select 1 from smf_online_ut_owned_items'))return {rows:lookupOwned(state,params[0],params[1],params[2])?[{ok:1}]:[]};
  if(q.startsWith('select team_id,player_ids,version from smf_online_ut_lineups')){
   const row=state.lineups.get(lineupKey(params[0],params[1]));return {rows:row?[structuredClone(row)]:[]};
  }
  throw Error(`Unexpected pool query: ${sql}`);
 };
 return {state,get failLedger(){return failLedger;},set failLedger(value){failLedger=!!value;},
  async query(sql,params){return poolQuery(sql,params);},
  async connect(){
   const releases=[];let working=null;
   const client={async query(sql,params){
    const q=sql.replace(/\s+/g,' ').trim().toLowerCase();
    if(q==='begin')return {rows:[]};
    if(q==='commit'){if(working)Object.assign(state,working);working=null;while(releases.length)releases.pop()();return {rows:[]};}
    if(q==='rollback'){working=null;while(releases.length)releases.pop()();return {rows:[]};}
    if(q.startsWith('select pg_advisory_xact_lock')){releases.push(await lock(`advisory:${params[0]}`));working=structuredClone(state);return {rows:[{locked:true}]};}
    if(!working)throw Error('Transaction must acquire lineup lock before data queries');
    if(q.startsWith('select request_hash,team_id,player_ids,version from smf_online_ut_lineup_ledger')){
     const row=working.ledger.get(ledgerKey(params[0],params[1]));return {rows:row?[structuredClone(row)]:[]};
    }
    if(q.startsWith('select 1 from smf_online_ut_owned_items'))return {rows:lookupOwned(working,params[0],params[1],params[2])?[{ok:1}]:[]};
    if(q.startsWith('select team_id,player_ids,version from smf_online_ut_lineups')){
     const row=working.lineups.get(lineupKey(params[0],params[1]));return {rows:row?[structuredClone(row)]:[]};
    }
    if(q.startsWith('insert into smf_online_ut_lineups')){
     const [account,team,playerIds,updatedAt]=params,key=lineupKey(account,team),version=1;
     if(working.lineups.has(key))throw Object.assign(Error('duplicate lineup'),{code:'23505'});
     working.lineups.set(key,{team_id:team,player_ids:JSON.parse(playerIds),version,updated_at:updatedAt});return {rows:[]};
    }
    if(q.startsWith('update smf_online_ut_lineups')){
     const [account,team,playerIds,version,updatedAt]=params,key=lineupKey(account,team);
     if(!working.lineups.has(key))throw Error('missing lineup on update');
     working.lineups.set(key,{team_id:team,player_ids:JSON.parse(playerIds),version,updated_at:updatedAt});return {rows:[]};
    }
    if(q.startsWith('insert into smf_online_ut_lineup_ledger')){
     if(failLedger)throw Error('injected lineup ledger failure');
     const [account,key,requestHash,team,playerIds,version,recordedAt]=params,lookup=ledgerKey(account,key);
     // Model PostgreSQL's unique-index arbitration: a competing transaction
     // inserting the same account/key waits for the first commit, then receives
     // 23505 if it still tries to write rather than reading the committed receipt.
     releases.push(await lock(`unique-ledger:${lookup}`));
     if(state.ledger.has(lookup))throw Object.assign(Error('duplicate ledger'),{code:'23505'});
     if(working.ledger.has(lookup))throw Object.assign(Error('duplicate ledger'),{code:'23505'});
     working.ledger.set(lookup,{request_hash:requestHash,team_id:team,player_ids:JSON.parse(playerIds),version,recorded_at:recordedAt});return {rows:[]};
    }
    throw Error(`Unexpected client query: ${sql}`);
   },release(){working=null;while(releases.length)releases.pop()();}};
   return client;
  }
 };
}

let db,store,baseRoster,foreignPlayers;
before(async()=>{
 ({createOnlineUltimateTeamStore}=await import('../scripts/online-ultimate-team-store.mjs'));
 ({loadAssetsFromNode}=await import('../src/assets.js'));
 assets=await loadAssetsFromNode();baseRoster=assets.rosters[BASE];
 assert.equal(baseRoster.length,12);
 const foreignRoster=assets.rosters[FOREIGN];
 foreignPlayers=foreignRoster.map(player=>({id:`${FOREIGN}/${player.id}`,role:player.role}));
});
beforeEach(async()=>{db=makeDb();store=await createOnlineUltimateTeamStore({db,now:()=>new Date('2026-11-04T15:00:00.000Z')});});
function baseline(){return baseRoster.map(player=>`${BASE}/${player.id}`);}
function findForeignForSlot(slot,skip=[]){return foreignPlayers.find(player=>player.role===baseRoster[slot].role&&!skip.includes(player.id));}
function acquire(category,itemId){db.state.owned.set(`${ACCOUNT}:${category}:${itemId}`,{account_id:ACCOUNT,category,item_id:itemId,acquired_at:new Date('2026-11-04T14:00:00.000Z')});}
function swap(playerIds,slot,foreignPlayer){const next=playerIds.slice();next[slot]=foreignPlayer.id;return next;}
function save(playerIds,overrides={}){return store.saveLineup(ACCOUNT,{teamId:BASE,playerIds,expectedVersion:0,idempotencyKey:KEY,...overrides});}

test('free Japan team returns its canonical base roster at version zero without persistence',async()=>{
 const result=await store.getLineup(ACCOUNT,BASE);
 assert.deepEqual(result,{teamId:BASE,playerIds:baseline(),version:0});
 assert.equal(db.state.lineups.size,0);
});

test('unowned teams cannot read or save an Online UT lineup',async()=>{
 await assert.rejects(()=>store.getLineup(ACCOUNT,FOREIGN),error=>error.code==='team-not-owned');
 const foreignBase=assets.rosters[FOREIGN].map(player=>`${FOREIGN}/${player.id}`);
 await assert.rejects(()=>store.saveLineup(ACCOUNT,{teamId:FOREIGN,playerIds:foreignBase,expectedVersion:0,idempotencyKey:KEY}),error=>error.code==='team-not-owned');
 assert.equal(db.state.lineups.size,0);
});

test('an owned base team may field its own canonical players without buying those player IDs individually',async()=>{
 acquire('team',FOREIGN);
 const result=await store.getLineup(ACCOUNT,FOREIGN);
 assert.deepEqual(result,{teamId:FOREIGN,playerIds:assets.rosters[FOREIGN].map(player=>`${FOREIGN}/${player.id}`),version:0});
});

test('foreign roster players require canonical purchased entitlements',async()=>{
 const original=baseline(),guest=findForeignForSlot(1),lineup=swap(original,1,guest);
 await assert.rejects(()=>save(lineup),error=>error.code==='player-not-owned');
 acquire('player',guest.id);
 const result=await save(lineup);
 assert.equal(result.duplicate,false);assert.deepEqual(result.lineup,{teamId:BASE,playerIds:lineup,version:1});
 assert.deepEqual(await store.getLineup(ACCOUNT,BASE),result.lineup);
});

test('a separately owned canonical team also grants its roster as foreign lineup entitlements',async()=>{
 acquire('team',FOREIGN);
 const original=baseline(),foreign=findForeignForSlot(1),lineup=swap(original,1,foreign);
 const result=await save(lineup);
 assert.equal(result.lineup.version,1);assert.deepEqual(result.lineup.playerIds,lineup);
});

test('lineup validation rejects duplicate, unknown and role-mismatched canonical players before writing',async()=>{
 const original=baseline(),duplicate=original.slice();duplicate[1]=duplicate[0];
 await assert.rejects(()=>save(duplicate),error=>error.code==='duplicate-player');
 const unknown=original.slice();unknown[1]='invented/player';
 await assert.rejects(()=>save(unknown),error=>error.code==='unknown-player');
 const otherRoles=foreignPlayers.filter(player=>player.role!==baseRoster[1].role);
 assert.ok(otherRoles.length,'fixture requires a canonical player with another role');
 await assert.rejects(()=>save(swap(original,1,otherRoles[0])),error=>error.code==='role-mismatch');
 assert.equal(db.state.lineups.size,0);
});

test('stale expected versions are rejected and successful saves use optimistic version increments',async()=>{
 const original=baseline(),one=findForeignForSlot(1);acquire('player',one.id);
 const first=await save(swap(original,1,one));assert.equal(first.lineup.version,1);
 const two=findForeignForSlot(1,[one.id]);acquire('player',two.id);
 await assert.rejects(()=>store.saveLineup(ACCOUNT,{teamId:BASE,playerIds:swap(original,1,two),expectedVersion:0,idempotencyKey:'lineup_save_0002'}),error=>error.code==='stale-lineup-version');
 const second=await store.saveLineup(ACCOUNT,{teamId:BASE,playerIds:swap(original,1,two),expectedVersion:1,idempotencyKey:'lineup_save_0002'});
 assert.equal(second.lineup.version,2);assert.deepEqual((await store.getLineup(ACCOUNT,BASE)).playerIds,swap(original,1,two));
});

test('concurrent lineup writes serialize and only one stale-base revision commits',async()=>{
 const original=baseline(),one=findForeignForSlot(1),two=findForeignForSlot(1,[one.id]);acquire('player',one.id);acquire('player',two.id);
 const results=await Promise.allSettled([
  save(swap(original,1,one),{idempotencyKey:'lineup_race_0001'}),
  save(swap(original,1,two),{idempotencyKey:'lineup_race_0002'}),
 ]);
 assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
 assert.equal(results.filter(result=>result.status==='rejected'&&result.reason.code==='stale-lineup-version').length,1);
 assert.equal(db.state.lineups.get(`${ACCOUNT}:${BASE}`).version,1);assert.equal(db.state.ledger.size,1);
});

test('the same account idempotency key cannot race across different team lineups',async()=>{
 acquire('team',FOREIGN);
 const japan=baseline(),brazil=assets.rosters[FOREIGN].map(player=>`${FOREIGN}/${player.id}`);
 const results=await Promise.allSettled([
  store.saveLineup(ACCOUNT,{teamId:BASE,playerIds:japan,expectedVersion:0,idempotencyKey:'lineup_cross_0001'}),
  store.saveLineup(ACCOUNT,{teamId:FOREIGN,playerIds:brazil,expectedVersion:0,idempotencyKey:'lineup_cross_0001'}),
 ]);
 assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
 const rejected=results.find(result=>result.status==='rejected');
 assert.equal(rejected.reason.code,'idempotency-conflict');
 assert.equal(db.state.ledger.size,1);
 assert.equal(db.state.lineups.size,1);
});

test('client player data and unrecognized lineup fields are never accepted',async()=>{
 const request={teamId:BASE,playerIds:baseline(),expectedVersion:0,idempotencyKey:KEY,players:[{id:'forged',shoot:999}]};
 await assert.rejects(()=>store.saveLineup(ACCOUNT,request),error=>error.code==='invalid-request');
 assert.equal(db.state.lineups.size,0);
});

test('save retries are idempotent by request and reuse with changed lineup conflicts',async()=>{
 const original=baseline(),one=findForeignForSlot(1),two=findForeignForSlot(1,[one.id]);acquire('player',one.id);acquire('player',two.id);
 const first=await save(swap(original,1,one));
 const replay=await save(swap(original,1,one));assert.equal(replay.duplicate,true);assert.deepEqual(replay.lineup,first.lineup);
 await assert.rejects(()=>save(swap(original,1,two)),error=>error.code==='idempotency-conflict');
 assert.equal(db.state.lineups.get(`${ACCOUNT}:${BASE}`).version,1);assert.equal(db.state.ledger.size,1);
});

test('a ledger write failure rolls back the lineup row and leaves the baseline unchanged',async()=>{
 const player=findForeignForSlot(1);acquire('player',player.id);db.failLedger=true;
 await assert.rejects(()=>save(swap(baseline(),1,player)),/injected lineup ledger failure/);
 db.failLedger=false;
 assert.equal(db.state.lineups.size,0);assert.equal(db.state.ledger.size,0);
 assert.deepEqual(await store.getLineup(ACCOUNT,BASE),{teamId:BASE,playerIds:baseline(),version:0});
});

test('malformed persisted lineup fails closed as corrupt state',async()=>{
 db.state.lineups.set(`${ACCOUNT}:${BASE}`,{team_id:BASE,player_ids:['forged/not-canonical'],version:1,updated_at:new Date()});
 await assert.rejects(()=>store.getLineup(ACCOUNT,BASE),error=>error.code==='corrupt-lineup');
});

test('SQL schema stores versioned lineups and durable request fingerprints',async()=>{
 const fs=require('node:fs/promises'),path=require('node:path');
 const schema=await fs.readFile(path.resolve(__dirname,'../scripts/online-ultimate-team-schema.sql'),'utf8');
 assert.match(schema,/CREATE TABLE IF NOT EXISTS smf_online_ut_lineups/);
 assert.match(schema,/PRIMARY KEY \(account_id, team_id\)/);
 assert.match(schema,/jsonb_array_length\(player_ids\) = 12/);
 assert.match(schema,/CREATE TABLE IF NOT EXISTS smf_online_ut_lineup_ledger/);
 assert.match(schema,/PRIMARY KEY \(account_id, idempotency_key\)/);
 assert.match(schema,/request_hash char\(64\)/);
});
