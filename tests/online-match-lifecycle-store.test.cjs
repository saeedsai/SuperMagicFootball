'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const assignment=(matchId='a'.repeat(32),participants=['player_alpha','player_bravo'],teamIds=['team_one','team_two'])=>({matchId,participants,teamIds});
class Pool{
 constructor(){this.rows=new Map();this.releases=0;this.rollbacks=0;this.queries=[];}
 async query(sql,params){this.queries.push(sql);return this.exec(sql,params,this.rows,false);}
 async connect(){let state=new Map([...this.rows].map(([k,v])=>[k,{...v}]));const pool=this;return{async query(sql,params){pool.queries.push(sql);const result=pool.exec(sql,params,state,true);if(sql.replace(/\s+/g,' ').trim().toLowerCase()==='commit')pool.rows=state;return result;},release(){pool.releases++;}};}
 exec(sql,params,state){const q=sql.replace(/\s+/g,' ').trim().toLowerCase();
  if(q==='begin'||q==='commit')return{rows:[]};if(q==='rollback'){this.rollbacks++;return{rows:[]};}
  if(q.startsWith('select pg_advisory_xact_lock'))return{rows:[]};
  if(q.startsWith('delete from smf_online_match_checkpoint'))return{rows:[]};
  if(q.startsWith('select participant_0,participant_1,team_0,team_1,status from smf_online_match_lifecycle where match_id=$1')){const r=state.get(params[0]);return{rows:r?[{...r}]:[]};}
  if(q.startsWith('insert into smf_online_match_lifecycle')){const [match_id,participant_0,participant_1,team_0,team_1,stamp]=params;if(state.has(match_id))throw Error('duplicate');state.set(match_id,{match_id,participant_0,participant_1,team_0,team_1,status:'active',assigned_at:stamp,updated_at:stamp});return{rows:[]};}
  if(q.startsWith('update smf_online_match_lifecycle set status=')){const [id,stamp]=params;const row=state.get(id);if(row){row.status=q.includes("status='interrupted'")?'interrupted':'completed';row.updated_at=stamp;}return{rows:[]};}
  if(q.startsWith('select match_id from smf_online_match_lifecycle where status=\'active\'')){return{rows:[...state.values()].filter(r=>r.status==='active').sort((a,b)=>a.assigned_at.localeCompare(b.assigned_at)).slice(0,params[0]).map(r=>({match_id:r.match_id}))};}
  if(q.startsWith('select status from smf_online_match_lifecycle where match_id=$1')){const r=state.get(params[0]);return{rows:r?[{status:r.status}]:[]};}
  if(q.includes('where match_id=any($1::char(32)[])')){const [ids,account]=params;return{rows:ids.map(id=>state.get(id)).filter(r=>r&&(r.participant_0===account||r.participant_1===account)).map(r=>({match_id:r.match_id,status:r.status}))};}
  throw Error('Unexpected SQL '+sql);
 }
}
async function setup(){const {createOnlineMatchLifecycleStore}=await import('../scripts/online-match-lifecycle-store.mjs');const db=new Pool();return{db,store:createOnlineMatchLifecycleStore({db,now:()=>new Date('2026-11-05T00:00:00.000Z')})};}
test('assignment is idempotent, immutable and a database failure rolls back',async()=>{
 const {db,store}=await setup(),value=assignment();assert.deepEqual(await store.recordAssigned(value),{matchId:value.matchId,duplicate:false});
 assert.deepEqual(await store.recordAssigned(value),{matchId:value.matchId,duplicate:true});
 await assert.rejects(store.recordAssigned(assignment(value.matchId,['player_alpha','player_charlie'])),e=>e.code==='lifecycle-conflict');
 assert.equal(db.rows.get(value.matchId).status,'active');assert.equal(db.releases,3);
});
test('restart marks only active PVP rows interrupted or completed from an immutable result, without score/reward fabrication',async()=>{
 const {db,store}=await setup(),a=assignment('a'.repeat(32)),b=assignment('b'.repeat(32));await store.recordAssigned(a);await store.recordAssigned(b);
 const result={matchId:b.matchId,participants:b.participants.map((userId,side)=>({userId,side})),teamIds:b.teamIds};
 const summary=await store.reconcileAfterRestart({async getFinalResult(id){return id===b.matchId?result:null;}});
 assert.deepEqual(summary,{completed:1,interrupted:1,resumed:0});assert.equal(db.rows.get(a.matchId).status,'interrupted');assert.equal(db.rows.get(b.matchId).status,'completed');
 assert.equal(Object.hasOwn(db.rows.get(a.matchId),'score_0'),false,'interruption stores no fabricated score or reward');
});
test('startup keeps only explicitly restored PVP checkpoints active and rejects malformed retained IDs',async()=>{
 const {db,store}=await setup(),a=assignment('a'.repeat(32)),b=assignment('b'.repeat(32));await store.recordAssigned(a);await store.recordAssigned(b);
 const summary=await store.reconcileAfterRestart({getFinalResult:async()=>null},{resumableMatchIds:[a.matchId]});
 assert.deepEqual(summary,{completed:0,interrupted:1,resumed:1});
 assert.equal(db.rows.get(a.matchId).status,'active');assert.equal(db.rows.get(b.matchId).status,'interrupted');
 await assert.rejects(store.reconcileAfterRestart({getFinalResult:async()=>null},{resumableMatchIds:['bad']}),e=>e.code==='invalid-resumable-match-ids');
});
test('reconciling an already durable result deletes its stale checkpoint transactionally even if it was listed as resumable',async()=>{
 const {db,store}=await setup(),value=assignment();await store.recordAssigned(value);
 const result={matchId:value.matchId,participants:value.participants.map((userId,side)=>({userId,side})),teamIds:value.teamIds};
 const summary=await store.reconcileAfterRestart({getFinalResult:async()=>result},{resumableMatchIds:[value.matchId]});
 assert.deepEqual(summary,{completed:1,interrupted:0,resumed:0},'a durable result takes precedence over a saved checkpoint');
 const completedAt=db.queries.findIndex(sql=>sql.startsWith("UPDATE smf_online_match_lifecycle SET status='completed'"));
 const deleteAt=db.queries.lastIndexOf('DELETE FROM smf_online_match_checkpoint WHERE match_id=$1');
 const commitAt=db.queries.lastIndexOf('COMMIT');
 assert.ok(completedAt>=0&&deleteAt>completedAt&&commitAt>deleteAt,'lifecycle repair and stale-checkpoint cleanup commit together');
 assert.equal(db.rows.get(value.matchId).status,'completed');
});
test('final result lifecycle completion deletes the recovery checkpoint on the same transaction client',async()=>{
 const {db,store}=await setup(),value=assignment();await store.recordAssigned(value);
 const client=await db.connect();await client.query('BEGIN');
 assert.equal(await store.markCompletedInTransaction(client,{matchId:value.matchId,participants:value.participants.map(userId=>({userId})),teamIds:value.teamIds}),true);
 await client.query('COMMIT');client.release();
 const deleteAt=db.queries.lastIndexOf('DELETE FROM smf_online_match_checkpoint WHERE match_id=$1');
 const commitAt=db.queries.lastIndexOf('COMMIT');
 assert.ok(deleteAt>=0&&deleteAt<commitAt,'checkpoint deletion commits atomically with the terminal result status');
 assert.equal(db.rows.get(value.matchId).status,'completed');
});
test('status lookup is bounded, idempotent and never discloses another account lifecycle',async()=>{
 const {store}=await setup(),a=assignment('a'.repeat(32)),b=assignment('b'.repeat(32),['player_charlie','player_delta']);await store.recordAssigned(a);await store.recordAssigned(b);
 await store.reconcileAfterRestart({getFinalResult:async()=>null});
 assert.deepEqual(await store.listStatuses('player_alpha',[a.matchId,b.matchId,'c'.repeat(32)]),{items:[{matchId:a.matchId,status:'interrupted'},{matchId:b.matchId,status:'unknown'},{matchId:'c'.repeat(32),status:'unknown'}]});
 await assert.rejects(store.listStatuses('player_alpha',Array(5).fill(a.matchId)),e=>e.code==='invalid-match-ids');
 await assert.rejects(store.listStatuses('player_alpha',['bad']),e=>e.code==='invalid-match-ids');
});
