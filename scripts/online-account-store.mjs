import {createHash} from 'node:crypto';

const SNAPSHOT_KINDS=new Set(['career','ultimate-team']);
const PROFILE_RESOURCE='profile';
const MAX_PROFILE_BYTES=32*1024;
const MAX_SNAPSHOT_BYTES=512*1024;
const ACCOUNT_ID=/^[A-Za-z0-9_-]{1,128}$/;
const IDEMPOTENCY_KEY=/^[A-Za-z0-9:_-]{8,128}$/;

export class OnlineAccountStoreError extends Error {
  constructor(code,message){super(message);this.name='OnlineAccountStoreError';this.code=code;}
}

function fail(code,message){throw new OnlineAccountStoreError(code,message)}
function account(value){if(typeof value!=='string'||!ACCOUNT_ID.test(value))fail('invalid-account','Invalid account identifier')}
function resource(value){if(value!==PROFILE_RESOURCE&&!SNAPSHOT_KINDS.has(value))fail('invalid-resource','Unsupported account resource')}
function version(value){if(!Number.isSafeInteger(value)||value<0)fail('invalid-version','Expected version must be a non-negative integer')}
function idempotency(value){if(typeof value!=='string'||!IDEMPOTENCY_KEY.test(value))fail('invalid-idempotency-key','Invalid idempotency key')}

// Accept JSON-compatible records only. Sorting keys gives equivalent objects a
// stable hash, and the byte cap is applied before reaching PostgreSQL.
function normalizeRecord(value,maxBytes,label){
  if(!value||typeof value!=='object'||Array.isArray(value))fail('invalid-payload',`${label} must be an object`);
  const sanitized=copyJson(value,new WeakSet());
  let text;
  try{text=JSON.stringify(sanitized)}catch{fail('invalid-payload',`${label} must be JSON serializable`)}
  if(typeof text!=='string'||Buffer.byteLength(text,'utf8')>maxBytes)fail('payload-too-large',`${label} exceeds ${maxBytes} bytes`);
  let parsed;
  try{parsed=JSON.parse(text)}catch{fail('invalid-payload',`${label} must be valid JSON`)}
  const ordered=sortJson(parsed);
  text=JSON.stringify(ordered);
  if(Buffer.byteLength(text,'utf8')>maxBytes)fail('payload-too-large',`${label} exceeds ${maxBytes} bytes`);
  return {value:ordered,json:text,hash:createHash('sha256').update(text).digest('hex')};
}

function copyJson(value,seen){
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number'){if(!Number.isFinite(value))fail('invalid-payload','Payload numbers must be finite');return value}
  if(typeof value!=='object')fail('invalid-payload','Payload must contain only JSON values');
  if(seen.has(value))fail('invalid-payload','Payload must not contain circular references');
  seen.add(value);
  if(Array.isArray(value)){const out=value.map(row=>copyJson(row,seen));seen.delete(value);return out}
  const proto=Object.getPrototypeOf(value);
  if(proto!==Object.prototype&&proto!==null)fail('invalid-payload','Payload objects must be plain JSON records');
  const out=Object.create(null);
  for(const [key,row] of Object.entries(value)){if(key==='__proto__'||key==='constructor'||key==='prototype')fail('invalid-payload','Payload contains a reserved key');out[key]=copyJson(row,seen)}
  seen.delete(value);return out;
}

function sortJson(value){
  if(value===null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(sortJson);
  const out=Object.create(null);
  for(const key of Object.keys(value).sort())out[key]=sortJson(value[key]);
  return out;
}

function safeDate(value){return value instanceof Date?value.toISOString():value??null}
function pgError(error){
  if(error?.code==='23505')return new OnlineAccountStoreError('idempotency-race','The request was committed concurrently; retry with the same key');
  throw error;
}

export function createOnlineAccountStore({db,now=()=>new Date()}={}){
  if(!db||typeof db.connect!=='function')throw new TypeError('Online account store requires a PostgreSQL Pool-like connect() client');
  if(typeof now!=='function')throw new TypeError('now must be a function');

  async function transaction(work){
    const client=await db.connect();
    try{await client.query('BEGIN');const value=await work(client);await client.query('COMMIT');return value}
    catch(error){try{await client.query('ROLLBACK')}catch{};throw pgError(error)}
    finally{client.release?.()}
  }

  async function getCommit(client,accountId,key,expectedHash){
    const result=await client.query(
      'SELECT request_hash, committed_version, result FROM smf_online_commit_keys WHERE account_id=$1 AND resource=$2 AND idempotency_key=$3',
      [accountId,key.resource,key.idempotencyKey]);
    const row=result.rows?.[0];if(!row)return null;
    if(row.request_hash!==key.hash||row.result?.requestHash!==expectedHash)fail('idempotency-conflict','Idempotency key was already used with a different payload');
    return {...row.result,version:Number(row.committed_version),duplicate:true};
  }

  async function put({accountId,resourceName,payload,expectedVersion,idempotencyKey,maxBytes,table}){
    account(accountId);resource(resourceName);version(expectedVersion);idempotency(idempotencyKey);
    const normalized=normalizeRecord(payload,maxBytes,resourceName);
    return transaction(async client=>{
      // Serialize first writes too; a row lock cannot lock a not-yet-existing row.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`${accountId}|${resourceName}`]);
      const key={resource:resourceName,idempotencyKey,hash:normalized.hash};
      const duplicate=await getCommit(client,accountId,key,normalized.hash);if(duplicate)return duplicate;
      const current=await client.query(`SELECT version FROM ${table} WHERE account_id=$1${resourceName===PROFILE_RESOURCE?'':' AND kind=$2'} FOR UPDATE`,resourceName===PROFILE_RESOURCE?[accountId]:[accountId,resourceName]);
      const actual=Number(current.rows?.[0]?.version??0);
      if(actual!==expectedVersion)fail('version-conflict','Stored version changed; fetch the latest snapshot before retrying');
      const next=actual+1;
      const timestamp=now();
      let saved;
      if(resourceName===PROFILE_RESOURCE){
        saved=await client.query(`INSERT INTO ${table} (account_id,profile,version,created_at,updated_at) VALUES ($1,$2::jsonb,$3,$4,$4) ON CONFLICT (account_id) DO UPDATE SET profile=EXCLUDED.profile,version=EXCLUDED.version,updated_at=EXCLUDED.updated_at WHERE ${table}.version=$5 RETURNING account_id,profile,version,updated_at`,[accountId,normalized.json,next,timestamp,expectedVersion]);
      }else{
        saved=await client.query(`INSERT INTO ${table} (account_id,kind,payload,version,created_at,updated_at) VALUES ($1,$2,$3::jsonb,$4,$5,$5) ON CONFLICT (account_id,kind) DO UPDATE SET payload=EXCLUDED.payload,version=EXCLUDED.version,updated_at=EXCLUDED.updated_at WHERE ${table}.version=$6 RETURNING account_id,kind,payload,version,updated_at`,[accountId,resourceName,normalized.json,next,timestamp,expectedVersion]);
      }
      if(!saved.rows?.[0])fail('version-conflict','Stored version changed; fetch the latest snapshot before retrying');
      const result={accountId,kind:resourceName===PROFILE_RESOURCE?undefined:resourceName,profile:resourceName===PROFILE_RESOURCE?normalized.value:undefined,payload:resourceName===PROFILE_RESOURCE?undefined:normalized.value,version:next,updatedAt:safeDate(saved.rows[0].updated_at),duplicate:false,requestHash:normalized.hash};
      const publicResult=Object.fromEntries(Object.entries(result).filter(([,v])=>v!==undefined));
      await client.query('INSERT INTO smf_online_commit_keys (account_id,resource,idempotency_key,request_hash,committed_version,result,created_at) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)',[accountId,resourceName,idempotencyKey,normalized.hash,next,JSON.stringify(publicResult),timestamp]);
      return publicResult;
    });
  }

  async function getProfile(accountId){
    account(accountId);const result=await db.query('SELECT account_id,profile,version,updated_at FROM smf_online_profiles WHERE account_id=$1',[accountId]);const row=result.rows?.[0];
    return row?{accountId:row.account_id,profile:row.profile,version:Number(row.version),updatedAt:safeDate(row.updated_at)}:null;
  }
  async function putProfile(accountId,profile,{expectedVersion,idempotencyKey}={}){
    return put({accountId,resourceName:PROFILE_RESOURCE,payload:profile,expectedVersion,idempotencyKey,maxBytes:MAX_PROFILE_BYTES,table:'smf_online_profiles'});
  }
  async function getSnapshot(accountId,kind){
    account(accountId);if(!SNAPSHOT_KINDS.has(kind))fail('invalid-resource','Unsupported snapshot kind');
    const result=await db.query('SELECT account_id,kind,payload,version,updated_at FROM smf_online_snapshots WHERE account_id=$1 AND kind=$2',[accountId,kind]);const row=result.rows?.[0];
    return row?{accountId:row.account_id,kind:row.kind,payload:row.payload,version:Number(row.version),updatedAt:safeDate(row.updated_at)}:null;
  }
  async function putSnapshot(accountId,kind,payload,{expectedVersion,idempotencyKey}={}){
    if(!SNAPSHOT_KINDS.has(kind))fail('invalid-resource','Unsupported snapshot kind');
    return put({accountId,resourceName:kind,payload,expectedVersion,idempotencyKey,maxBytes:MAX_SNAPSHOT_BYTES,table:'smf_online_snapshots'});
  }
  return Object.freeze({getProfile,putProfile,getSnapshot,putSnapshot});
}
