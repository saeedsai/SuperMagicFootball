'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const assignment=(matchId='a'.repeat(32),participants=['player_alpha','player_bravo'],teamIds=['team_one','team_two'])=>({matchId,participants,teamIds});
class Pool{
 constructor(){this.lifecycle=new Map();this.checkpoints=new Map();this.releases=0;this.rollbacks=0;this.failCommit=false;this.upserts=0;}
 async addLifecycle(value,status='active'){
  this.lifecycle.set(value.matchId,{match_id:value.matchId,participant_0:value.participants[0],participant_1:value.participants[1],team_0:value.teamIds[0],team_1:value.teamIds[1],status});
 }
 async query(sql,params){return this.exec(sql,params,this.lifecycle,this.checkpoints,false);}
 async connect(){const lifecycle=new Map([...this.lifecycle].map(([k,v])=>[k,{...v}])),checkpoints=new Map([...this.checkpoints].map(([k,v])=>[k,{...v}]));const pool=this;
  return{async query(sql,params){if(sql.replace(/\s+/g,' ').trim().toLowerCase()==='commit'&&pool.failCommit)throw Error('commit failure');const result=pool.exec(sql,params,lifecycle,checkpoints,true);if(sql.replace(/\s+/g,' ').trim().toLowerCase()==='commit'){pool.lifecycle=lifecycle;pool.checkpoints=checkpoints;}return result;},release(){pool.releases++;}};
 }
 exec(sql,params,lifecycle,checkpoints){const q=sql.replace(/\s+/g,' ').trim().toLowerCase();
  if(q==='begin'||q==='commit')return{rows:[]};if(q==='rollback'){this.rollbacks++;return{rows:[]};}
  if(q.startsWith('select pg_advisory_xact_lock'))return{rows:[]};
  if(q.startsWith('select participant_0,participant_1,team_0,team_1,status from smf_online_match_lifecycle')){const row=lifecycle.get(params[0]);return{rows:row?[{...row}]:[]};}
  if(q.startsWith('select participant_0,participant_1,team_0,team_1,schema_version,payload_json')){const row=checkpoints.get(params[0]);return{rows:row?[{...row}]:[]};}
  if(q.startsWith('insert into smf_online_match_checkpoint')){const [match_id,participant_0,participant_1,team_0,team_1,schema_version,payload_json,payload_bytes,payload_sha256,updated_at,expires_at]=params;checkpoints.set(match_id,{match_id,participant_0,participant_1,team_0,team_1,schema_version,payload_json,payload_bytes,payload_sha256,updated_at,expires_at});this.upserts++;return{rows:[]};}
  if(q.startsWith('select participant_0,participant_1,team_0,team_1,schema_version,payload_json')){const row=checkpoints.get(params[0]);return{rows:row?[{...row}]:[]};}
  if(q.startsWith('select c.match_id from smf_online_match_checkpoint')){return{rows:[...checkpoints.values()].filter(row=>lifecycle.get(row.match_id)?.status==='active').sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).slice(0,params[0]).map(row=>({match_id:row.match_id}))};}
  if(q.startsWith('delete from smf_online_match_checkpoint')){const [id,p0,p1,t0,t1]=params,row=checkpoints.get(id);if(row&&(params.length===1||row.participant_0===p0&&row.participant_1===p1&&row.team_0===t0&&row.team_1===t1)){checkpoints.delete(id);return{rows:[],rowCount:1};}return{rows:[],rowCount:0};}
  throw Error('Unexpected SQL '+sql);
 }
}
async function setup(options={}){const {createOnlineMatchCheckpointStore}=await import('../scripts/online-match-checkpoint-store.mjs');const db=new Pool(),value=assignment();await db.addLifecycle(value);let clock=new Date('2026-11-05T00:00:00.000Z');const store=createOnlineMatchCheckpointStore({db,now:()=>clock,...options});return{db,value,store,setNow:v=>clock=new Date(v)};}

test('stores, loads, replaces and deletes bounded versioned opaque checkpoint data bound to active assignment',async()=>{
 const {db,value,store}=await setup(),payload={opaque:{tick:400,engineState:['x',7,true]},schema:'private-v1'};
 payload.state={tick:400};const saved=await store.store({...value,schemaVersion:1,payload});assert.equal(saved.schemaVersion,1);assert.equal(saved.payloadBytes,Buffer.byteLength(JSON.stringify(payload)));assert.equal(saved.duplicate,false);
 assert.deepEqual((await store.load(value)).payload,payload);
 const next={state:{tick:500},opaque:'new'};await store.store({...value,schemaVersion:2,payload:next});const loaded=await store.load(value);assert.equal(loaded.schemaVersion,2);assert.deepEqual(loaded.payload,next);
 assert.deepEqual(await store.delete(value),{matchId:value.matchId,deleted:true});assert.equal(await store.load(value),null);assert.equal(db.releases,6);
});

test('missing lifecycle, inactive lifecycle and participant/team mismatch fail closed',async()=>{
 const {db,value,store}=await setup();await assert.rejects(store.store({...assignment('b'.repeat(32)),schemaVersion:1,payload:{state:{tick:1}}}),e=>e.code==='checkpoint-lifecycle-missing');
 await db.addLifecycle(value,'interrupted');await assert.rejects(store.store({...value,schemaVersion:1,payload:{state:{tick:1}}}),e=>e.code==='checkpoint-match-not-active');
 await db.addLifecycle(value,'active');await assert.rejects(store.store({...value,participants:['player_alpha','player_charlie'],schemaVersion:1,payload:{state:{tick:1}}}),e=>e.code==='checkpoint-assignment-mismatch');
 await assert.rejects(store.delete({...value,teamIds:['team_one','team_three']}),e=>e.code==='checkpoint-assignment-mismatch');
});

test('rejects malformed assignments, versions and non-JSON or oversized payloads before writing',async()=>{
 const {value,store}=await setup({maxBytes:1024});
 await assert.rejects(store.store({...value,schemaVersion:0,payload:{x:1}}),e=>e.code==='invalid-checkpoint-version');
 await assert.rejects(store.store({...value,schemaVersion:1,payload:[]}),e=>e.code==='invalid-checkpoint-payload');
 await assert.rejects(store.store({...value,schemaVersion:1,payload:{x:undefined}}),e=>e.code==='invalid-checkpoint-payload');
 await assert.rejects(store.store({...value,schemaVersion:1,payload:{text:'x'.repeat(1200)}}),e=>e.code==='checkpoint-too-large');
 await assert.rejects(store.load({...value,participants:['player_alpha']}),e=>e.code==='invalid-checkpoint-assignment');
 await assert.rejects(store.store({...value,schemaVersion:1,payload:{state:{tick:-1}}}),e=>e.code==='invalid-checkpoint-tick');
});

test('expired checkpoints are rejected, and corrupt bytes, JSON, version, and byte counts fail closed',async()=>{
 const {db,value,store,setNow}=await setup(),payload={state:{tick:1}};await store.store({...value,schemaVersion:1,payload});
 setNow('2026-11-05T00:05:00.000Z');await assert.rejects(store.load(value),e=>e.code==='checkpoint-expired');
 setNow('2026-11-05T00:00:01.000Z');const row=db.checkpoints.get(value.matchId);row.payload_json='{"tick":2}';
 await assert.rejects(store.load(value),e=>e.code==='corrupt-checkpoint');
 row.payload_json='{broken';await assert.rejects(store.load(value),e=>e.code==='corrupt-checkpoint');
 row.payload_json=JSON.stringify(payload);row.payload_bytes+=1;await assert.rejects(store.load(value),e=>e.code==='corrupt-checkpoint');
 row.payload_bytes=Buffer.byteLength(row.payload_json);row.schema_version=0;await assert.rejects(store.load(value),e=>e.code==='corrupt-checkpoint');
});

test('tampered payloads fail closed; failed commits roll back checkpoint writes',async()=>{
 const {db,value,store}=await setup();db.failCommit=true;
 await assert.rejects(store.store({...value,schemaVersion:1,payload:{state:{tick:1}}}),/commit failure/);
 assert.equal(db.checkpoints.size,0);assert.equal(db.rollbacks,1);assert.equal(db.releases,1);
});

test('checkpoint ticks are monotonic and equal ticks are idempotent duplicates',async()=>{
 const {db,value,store}=await setup();
 const write=tick=>store.store({...value,schemaVersion:1,payload:{state:{tick},opaque:`frame-${tick}`}});
 assert.equal((await write(10)).duplicate,false);assert.equal(db.upserts,1);
 assert.equal((await write(10)).duplicate,true);assert.equal(db.upserts,1);
 await assert.rejects(write(9),e=>e.code==='checkpoint-stale-tick');assert.equal(db.upserts,1);
 assert.equal((await write(11)).duplicate,false);assert.equal(db.upserts,2);
 assert.equal((await store.load(value)).payload.state.tick,11);
});

test('lists only bounded active, unexpired checkpoints with assignment metadata and removes expired rows',async()=>{
 const {db,value,store,setNow}=await setup();
 await store.store({...value,schemaVersion:1,payload:{state:{tick:4}}});
 const inactive=assignment('b'.repeat(32),['player_charlie','player_delta'],['team_three','team_four']);
 await db.addLifecycle(inactive,'interrupted');
 await store.store({...inactive,schemaVersion:1,payload:{state:{tick:8}}}).catch(error=>assert.equal(error.code,'checkpoint-match-not-active'));
 await db.checkpoints.set(inactive.matchId,{...db.checkpoints.get(value.matchId),match_id:inactive.matchId,participant_0:inactive.participants[0],participant_1:inactive.participants[1],team_0:inactive.teamIds[0],team_1:inactive.teamIds[1]});
 const corrupt=assignment('c'.repeat(32),['player_echo','player_foxtrot'],['team_five','team_six']);await db.addLifecycle(corrupt,'active');
 db.checkpoints.set(corrupt.matchId,{...db.checkpoints.get(value.matchId),match_id:corrupt.matchId,participant_0:corrupt.participants[0],participant_1:corrupt.participants[1],team_0:corrupt.teamIds[0],team_1:corrupt.teamIds[1],payload_sha256:'0'.repeat(64)});
 const active=await store.listActive();assert.equal(active.length,1);assert.equal(active[0].matchId,value.matchId);assert.deepEqual(active[0].participants,value.participants);assert.deepEqual(active[0].teamIds,value.teamIds);assert.equal(active[0].payload.state.tick,4);
 assert.equal(db.checkpoints.has(corrupt.matchId),false,'corrupt recovery state is deleted so one bad match cannot block service startup');
 await assert.rejects(store.listActive({limit:65}),e=>e.code==='invalid-checkpoint-limit');
 setNow('2026-11-05T00:05:00.000Z');assert.deepEqual(await store.listActive(),[]);assert.equal(db.checkpoints.has(value.matchId),false);
});
