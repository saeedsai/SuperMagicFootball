import {createHash} from 'node:crypto';

const MATCH_ID=/^[a-f0-9]{32}$/;
const USER_ID=/^[A-Za-z0-9_-]{8,64}$/;
const TEAM_ID=/^[A-Za-z0-9_-]{1,64}$/;
const DEFAULT_MAX_BYTES=256*1024;
const MAX_MAX_BYTES=1024*1024;
const DEFAULT_TTL_MS=5*60*1000;
const MAX_TTL_MS=30*60*1000;

function fail(code){const error=new Error(code);error.code=code;throw error;}
function plainRecord(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&
 (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);}
function validateAssignment(value){
 if(!plainRecord(value)||!MATCH_ID.test(value.matchId||'')||!Array.isArray(value.participants)||value.participants.length!==2||
   !value.participants.every(id=>typeof id==='string'&&USER_ID.test(id))||value.participants[0]===value.participants[1]||
   !Array.isArray(value.teamIds)||value.teamIds.length!==2||!value.teamIds.every(id=>typeof id==='string'&&TEAM_ID.test(id))||value.teamIds[0]===value.teamIds[1])fail('invalid-checkpoint-assignment');
 return Object.freeze({matchId:value.matchId,participants:Object.freeze(value.participants.slice()),teamIds:Object.freeze(value.teamIds.slice())});
}
function validateVersion(value){if(!Number.isSafeInteger(value)||value<1||value>65535)fail('invalid-checkpoint-version');return value;}
function validatePayload(value,maxBytes){
 if(!plainRecord(value))fail('invalid-checkpoint-payload');
 let nodes=0;const seen=new WeakSet();
 function inspect(item,depth){
  if(++nodes>100_000||depth>100)fail('invalid-checkpoint-payload');
  if(item===null||typeof item==='string'||typeof item==='boolean')return;
  if(typeof item==='number'){if(!Number.isFinite(item))fail('invalid-checkpoint-payload');return;}
  if(typeof item!=='object'||seen.has(item))fail('invalid-checkpoint-payload');
  if(!Array.isArray(item)&&!plainRecord(item))fail('invalid-checkpoint-payload');
  seen.add(item);
  for(const key of Object.keys(item))inspect(item[key],depth+1);
  seen.delete(item);
 }
 inspect(value,0);
 let text;try{text=JSON.stringify(value);}catch{fail('invalid-checkpoint-payload');}
 if(typeof text!=='string')fail('invalid-checkpoint-payload');
 const bytes=Buffer.byteLength(text,'utf8');if(bytes>maxBytes)fail('checkpoint-too-large');
 return {text,bytes,sha256:createHash('sha256').update(text,'utf8').digest('hex'),tick:value.state?.tick};
}
function assignmentMatches(row,assignment){
 return row&&row.participant_0===assignment.participants[0]&&row.participant_1===assignment.participants[1]&&
  row.team_0===assignment.teamIds[0]&&row.team_1===assignment.teamIds[1];
}
function decodeRow(row,assignment,at,maxBytes,{allowExpired=false}={}){
 if(!assignmentMatches(row,assignment))fail('checkpoint-assignment-mismatch');
 const expiresAt=new Date(row.expires_at);if(!Number.isFinite(expiresAt.getTime()))fail('corrupt-checkpoint');
 if(!allowExpired&&expiresAt.getTime()<=at.getTime())fail('checkpoint-expired');
 if(!Number.isSafeInteger(Number(row.schema_version))||Number(row.schema_version)<1||Number(row.schema_version)>65535)fail('corrupt-checkpoint');
 const text=typeof row.payload_json==='string'?row.payload_json:Buffer.isBuffer(row.payload_json)?row.payload_json.toString('utf8'):null;
 if(text===null)fail('corrupt-checkpoint');
 const bytes=Buffer.byteLength(text,'utf8');
 if(bytes<2||bytes>maxBytes||Number(row.payload_bytes)!==bytes||!/^[a-f0-9]{64}$/.test(String(row.payload_sha256||'').trim())||
    createHash('sha256').update(text,'utf8').digest('hex')!==String(row.payload_sha256).trim())fail('corrupt-checkpoint');
 let payload;try{payload=JSON.parse(text);}catch{fail('corrupt-checkpoint');}
 if(!plainRecord(payload)||!Number.isSafeInteger(payload.state?.tick)||payload.state.tick<0)fail('corrupt-checkpoint');
 const updatedAt=new Date(row.updated_at);if(!Number.isFinite(updatedAt.getTime()))fail('corrupt-checkpoint');
 return Object.freeze({matchId:assignment.matchId,schemaVersion:Number(row.schema_version),payload,
  payloadBytes:bytes,updatedAt:updatedAt.toISOString(),expiresAt:expiresAt.toISOString()});
}

/**
 * PostgreSQL-backed bounded opaque JSON checkpoint storage. The digest detects
 * accidental storage corruption; it is not a signature, MAC, or authentication.
 */
export function createOnlineMatchCheckpointStore({db,now=()=>new Date(),maxBytes=DEFAULT_MAX_BYTES,ttlMs=DEFAULT_TTL_MS}={}){
 if(!db||typeof db.query!=='function'||typeof db.connect!=='function'||typeof now!=='function')throw new TypeError('Online match checkpoint store requires PostgreSQL and a clock');
 if(!Number.isSafeInteger(maxBytes)||maxBytes<1024||maxBytes>MAX_MAX_BYTES)throw new RangeError('Invalid online checkpoint byte limit');
 if(!Number.isSafeInteger(ttlMs)||ttlMs<1000||ttlMs>MAX_TTL_MS)throw new RangeError('Invalid online checkpoint lifetime');
 async function transaction(work){
  const client=await db.connect();
  try{await client.query('BEGIN');const value=await work(client);await client.query('COMMIT');return value;}
  catch(error){try{await client.query('ROLLBACK')}catch{}throw error;}
  finally{client.release?.();}
 }
 async function bindLifecycle(client,assignment,{activeOnly=false}={}){
  const result=await client.query(`SELECT participant_0,participant_1,team_0,team_1,status
   FROM smf_online_match_lifecycle WHERE match_id=$1 FOR UPDATE`,[assignment.matchId]);
  const row=result.rows?.[0];
  if(!row)fail('checkpoint-lifecycle-missing');
  if(!assignmentMatches(row,assignment))fail('checkpoint-assignment-mismatch');
  if(activeOnly&&row.status!=='active')fail('checkpoint-match-not-active');
  return row;
 }
 async function lock(client,matchId){await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[matchId]);}
 async function store(raw){
  if(!plainRecord(raw))fail('invalid-checkpoint');
  const assignment=validateAssignment({matchId:raw.matchId,participants:raw.participants,teamIds:raw.teamIds});
  const version=validateVersion(raw.schemaVersion),encoded=validatePayload(raw.payload,maxBytes);
  if(!Number.isSafeInteger(encoded.tick)||encoded.tick<0)fail('invalid-checkpoint-tick');
  const updatedAt=new Date(now());if(!Number.isFinite(updatedAt.getTime()))fail('invalid-checkpoint-clock');
  const expiresAt=new Date(updatedAt.getTime()+ttlMs);
  return transaction(async client=>{
   await lock(client,assignment.matchId);
   await bindLifecycle(client,assignment,{activeOnly:true});
   const existing=await client.query(`SELECT participant_0,participant_1,team_0,team_1,schema_version,payload_json,payload_bytes,payload_sha256,updated_at,expires_at
    FROM smf_online_match_checkpoint WHERE match_id=$1 FOR UPDATE`,[assignment.matchId]);
   if(existing.rows?.[0]){
    const previous=decodeRow(existing.rows[0],assignment,updatedAt,maxBytes,{allowExpired:true});
    if(encoded.tick<previous.payload.state.tick)fail('checkpoint-stale-tick');
    if(encoded.tick===previous.payload.state.tick)return Object.freeze({matchId:assignment.matchId,schemaVersion:previous.schemaVersion,
     payloadBytes:previous.payloadBytes,expiresAt:previous.expiresAt,duplicate:true});
   }
   await client.query(`INSERT INTO smf_online_match_checkpoint(match_id,participant_0,participant_1,team_0,team_1,
    schema_version,payload_json,payload_bytes,payload_sha256,updated_at,expires_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT(match_id) DO UPDATE SET schema_version=EXCLUDED.schema_version,payload_json=EXCLUDED.payload_json,
    payload_bytes=EXCLUDED.payload_bytes,payload_sha256=EXCLUDED.payload_sha256,updated_at=EXCLUDED.updated_at,expires_at=EXCLUDED.expires_at`,
    [assignment.matchId,...assignment.participants,...assignment.teamIds,version,encoded.text,encoded.bytes,encoded.sha256,updatedAt.toISOString(),expiresAt.toISOString()]);
   return Object.freeze({matchId:assignment.matchId,schemaVersion:version,payloadBytes:encoded.bytes,expiresAt:expiresAt.toISOString(),duplicate:false});
  });
 }
 async function load(raw){
  const assignment=validateAssignment(raw),at=new Date(now());if(!Number.isFinite(at.getTime()))fail('invalid-checkpoint-clock');
  return transaction(async client=>{
   await lock(client,assignment.matchId);
   await bindLifecycle(client,assignment,{activeOnly:true});
   const result=await client.query(`SELECT participant_0,participant_1,team_0,team_1,schema_version,payload_json,payload_bytes,payload_sha256,updated_at,expires_at
    FROM smf_online_match_checkpoint WHERE match_id=$1 FOR UPDATE`,[assignment.matchId]);
   const row=result.rows?.[0];if(!row)return null;
   return decodeRow(row,assignment,at,maxBytes);
  });
 }
 async function listActive({limit=64}={}){
  if(!Number.isSafeInteger(limit)||limit<1||limit>64)fail('invalid-checkpoint-limit');
  const at=new Date(now());if(!Number.isFinite(at.getTime()))fail('invalid-checkpoint-clock');
  return transaction(async client=>{
   const candidates=await client.query(`SELECT c.match_id FROM smf_online_match_checkpoint c
    JOIN smf_online_match_lifecycle l ON l.match_id=c.match_id WHERE l.status='active'
    ORDER BY c.updated_at DESC,c.match_id ASC LIMIT $1`,[limit]);
   const rows=[];
   for(const candidate of candidates.rows||[]){
    const matchId=String(candidate.match_id||'').trim();if(!MATCH_ID.test(matchId))fail('corrupt-checkpoint');
    await lock(client,matchId);
    const lifecycle=await client.query(`SELECT participant_0,participant_1,team_0,team_1,status
     FROM smf_online_match_lifecycle WHERE match_id=$1 FOR UPDATE`,[matchId]);
    const binding=lifecycle.rows?.[0];if(!binding||binding.status!=='active')continue;
    const assignment=validateAssignment({matchId,participants:[binding.participant_0,binding.participant_1],teamIds:[binding.team_0,binding.team_1]});
    const result=await client.query(`SELECT participant_0,participant_1,team_0,team_1,schema_version,payload_json,payload_bytes,payload_sha256,updated_at,expires_at
     FROM smf_online_match_checkpoint WHERE match_id=$1 FOR UPDATE`,[matchId]);
    const row=result.rows?.[0];if(!row)continue;
    try{rows.push(Object.freeze({...decodeRow(row,assignment,at,maxBytes),participants:assignment.participants,teamIds:assignment.teamIds}));}
    catch(error){if(['checkpoint-expired','corrupt-checkpoint','checkpoint-assignment-mismatch'].includes(error?.code)){await client.query('DELETE FROM smf_online_match_checkpoint WHERE match_id=$1',[matchId]);continue;}throw error;}
   }
   return Object.freeze(rows);
  });
 }
 async function remove(raw){
  const assignment=validateAssignment(raw);
  return transaction(async client=>{
   await lock(client,assignment.matchId);
   await bindLifecycle(client,assignment);
   const result=await client.query(`DELETE FROM smf_online_match_checkpoint WHERE match_id=$1
    AND participant_0=$2 AND participant_1=$3 AND team_0=$4 AND team_1=$5`,
    [assignment.matchId,...assignment.participants,...assignment.teamIds]);
   return Object.freeze({matchId:assignment.matchId,deleted:Number(result.rowCount||0)===1});
  });
 }
 return Object.freeze({store,load,listActive,delete:remove});
}
