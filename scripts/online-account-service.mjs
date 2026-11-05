import {pathToFileURL} from 'node:url';
import {randomInt} from 'node:crypto';
import {createOnlineAccountRuntime} from './online-account-runtime.mjs';
import {createOnlineAccountHttpServer} from './online-account-http.mjs';
import {createOnlineMatchmaking} from './online-matchmaking.mjs';
import {createOnlineGameEngine} from './online-game-engine.mjs';
import {attachOnlineMatchWebSocket} from './online-match-ws.mjs';
import {loadAssetsFromNode} from '../src/assets.js';

const SERVICE_LOCK_KEY=Object.freeze([1397574995,1297043026]);

function portFrom(env) {
  const raw=env.PORT;
  const port=typeof raw==='string'&&/^\d{1,5}$/.test(raw)?Number(raw):NaN;
  if (!Number.isInteger(port)||port<1||port>65535) throw new TypeError('PORT must be supplied as an integer from 1 to 65535');
  return port;
}

export function postgresPoolConfig(env) {
  const raw=env.DATABASE_URL;
  let url;
  try { url=new URL(raw); } catch { throw new TypeError('DATABASE_URL must be a PostgreSQL connection string'); }
  if (!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname||!url.username||!url.password) throw new TypeError('DATABASE_URL must include a PostgreSQL host and credentials');
  if (['sslcert','sslkey','sslrootcert'].some(key=>url.searchParams.has(key))) throw new TypeError('Certificate file parameters are not supported in DATABASE_URL');
  const implied=url.searchParams.get('sslmode');
  const sslMode=env.SMF_DATABASE_SSL|| (implied==='require'?'require':implied==='verify-full'?'verify-full':'disable');
  if (!['disable','require','verify-full'].includes(sslMode)||implied&&implied!==sslMode) throw new TypeError('SMF_DATABASE_SSL must match disable, require, or verify-full in DATABASE_URL');
  if (env.NODE_ENV==='production'&&sslMode==='disable') throw new TypeError('Production PostgreSQL connections require TLS');
  // node-postgres parses sslmode itself and replaces the supplied ssl object;
  // strip it after translating to the explicit TLS setting below.
  url.searchParams.delete('sslmode');
  return {
    connectionString:url.toString(),max:5,idleTimeoutMillis:30000,connectionTimeoutMillis:5000,
    statement_timeout:10000,query_timeout:12000,
    ssl:sslMode==='disable'?false:{rejectUnauthorized:sslMode==='verify-full'},
    application_name:'supermagicfootball-online'
  };
}

/** Start the separately hosted authenticated account API. */
export async function startOnlineAccountService({env=process.env,pool=null,PoolClass=null,fetchImpl=globalThis.fetch,matchmakingFactory=createOnlineMatchmaking,engineFactory=createOnlineGameEngine,transportFactory=attachOnlineMatchWebSocket,runtimeFactory=createOnlineAccountRuntime,operatorLogger=console}={}) {
  const port=portFrom(env);
  if (!pool) {
    const Pool=PoolClass||(await import('pg')).Pool;
    // Keep the pool below the typical small hosted Postgres connection budget.
    pool=new Pool(postgresPoolConfig(env));
  }
  if (typeof pool.query!=='function'||typeof pool.connect!=='function') throw new TypeError('A PostgreSQL Pool-like instance is required');
  pool.on?.('error',()=>console.error('Online account database connection failed'));
  let matchmaking=null,transport=null,recordFinalResult=null,matchLifecycleStore=null,matchCheckpointStore=null,onlineCareerService=null,server=null,serverStartPromise=null;
  let lockClient=null,lockClientReleased=false,lockHealthy=false,lockAcquired=false,stopping=false;
  let lockErrorHandler=null;
  const removeLockErrorHandler=()=>{if(lockClient&&lockErrorHandler){lockClient.removeListener?.('error',lockErrorHandler);lockClient.off?.('error',lockErrorHandler)}lockErrorHandler=null;};
  async function releaseServiceLock({unlock=true,error=null}={}){
    const client=lockClient;
    if(!client||lockClientReleased)return;
    const shouldUnlock=unlock&&lockAcquired&&!error;
    lockHealthy=false;removeLockErrorHandler();
    let releaseCause=error;
    try{
      if(shouldUnlock){
        const result=await client.query('SELECT pg_advisory_unlock($1,$2) AS unlocked',SERVICE_LOCK_KEY);
        if(result.rows?.[0]?.unlocked!==true)throw new Error('Online API singleton lock was not held during release');
      }
    }catch(caught){releaseCause??=caught;}
    lockClientReleased=true;lockClient=null;lockAcquired=false;
    try{releaseCause?client.release?.(releaseCause):client.release?.();}catch{}
    if(releaseCause&&!error)throw releaseCause;
  }
  const closeListener=()=>new Promise(resolve=>{
    if(!server?.listening){resolve();return;}
    try{server.close(()=>resolve())}catch{resolve()}
  });
  async function stopAfterLockLoss(error){
    if(stopping)return;
    stopping=true;lockHealthy=false;
    try{transport?.close?.()}catch{}
    try{matchmaking?.close?.()}catch{}
    await closeListener();
    await releaseServiceLock({unlock:false,error});
    try{await pool.end?.()}catch{}
  }
  try {
    // A session lock keeps the process-local ticket queue, WebSocket ownership,
    // and authoritative match engines single-instance for their whole lifetime.
    lockClient=await pool.connect();
    if(!lockClient||typeof lockClient.query!=='function'||typeof lockClient.release!=='function'||typeof lockClient.on!=='function')throw new TypeError('Online API requires a dedicated event-capable PostgreSQL lock connection');
    const lockResult=await lockClient.query('SELECT pg_try_advisory_lock($1,$2) AS acquired',SERVICE_LOCK_KEY);
    if(lockResult.rows?.[0]?.acquired!==true)throw new Error('Another Online API instance already owns the matchmaking service lock');
    lockHealthy=true;lockAcquired=true;
    lockErrorHandler=error=>{void stopAfterLockLoss(error instanceof Error?error:new Error('Online API singleton lock connection was lost'));};
    lockClient.on?.('error',lockErrorHandler);
    await pool.query('SELECT 1');
    // The game engine currently exposes the first thirteen canonical game teams
    // as playable choices; use that exact catalog for ticket validation.
    const assets=await loadAssetsFromNode();
    const {DATA}=await import('../src/modules/data.js');
    const validTeamIds=DATA.TEAMS.map(team=>team.id);
    if(!validTeamIds.length||validTeamIds.some(id=>!assets.teams.some(team=>team.id===id)))throw new Error('Canonical online team catalog is unavailable');
    matchmaking=matchmakingFactory({
      validTeamIds,
      createEngine:({teamIds,rosterPlayerIds,mode='quick',home=0,away=9,halfSeconds=120,seed,humans=mode==='career-ai'?1:2}={})=>engineFactory({home,away,...(teamIds?{teamIds}:{}),...(rosterPlayerIds?{rosterPlayerIds}:{}),mode,humans,halfSeconds,seed:Number.isSafeInteger(seed)?seed:randomInt(0,0x100000000)}),
      sendSnapshot:(userId,envelope,context)=>transport?.sendSnapshot(userId,envelope,context)??false,
      onRequeue:(userId,detail)=>transport?.onRequeue(userId,detail),
      onMatchError:(matchId,code)=>transport?.onMatchError(matchId,code)??false,
      onMatchAssigned:async assignment=>{
        if(!matchLifecycleStore)throw new Error('PVP lifecycle store is not ready');
        await matchLifecycleStore.recordAssigned(assignment);
      },
      onMatchCheckpoint:async value=>{
        if(!matchCheckpointStore)throw new Error('PVP checkpoint store is not ready');
        await matchCheckpointStore.store({matchId:value.matchId,participants:value.participants,teamIds:value.teamIds,
          schemaVersion:value.checkpoint.schemaVersion,payload:{recoveryEligible:value.recoveryEligible===true,state:value.checkpoint.state,checkpoint:value.checkpoint}});
      },
      onMatchCheckpointDeleted:async value=>{
        if(matchCheckpointStore)await matchCheckpointStore.delete(value);
      },
      onMatchFault:(matchId)=>{
        // Match IDs are random opaque identifiers; log no user, engine, or request data.
        if(typeof matchId!=='string'||!/^[a-f0-9]{32}$/.test(matchId))return;
        try{operatorLogger?.error?.(JSON.stringify({event:'online-match-fault',matchId,code:'engine-error'}));}catch{}
      },
      onMatchPersisted:result=>transport?.onMatchFinished(result.matchId)??false,
      onMatchFinished:async result=>{
        if(!recordFinalResult)throw new Error('Durable result store is not ready');
        const durable=await recordFinalResult(result);
        // Career progression is applied only after the immutable result is durable.
        // If progression fails, matchmaking retries this callback and the result write
        // plus fixture advancement are both idempotent.
        await onlineCareerService?.advanceMatchResult(result.matchId);
        return durable;
      }
    });
    const canonicalTeamIds=validTeamIds;
    const runtime=await runtimeFactory({env,pool,fetchImpl,matchmaking,canonicalTeamIds});
    onlineCareerService=runtime.onlineCareerService;
    matchLifecycleStore=runtime.matchLifecycleStore;
    matchCheckpointStore=runtime.matchCheckpointStore||null;
    recordFinalResult=runtime.resultStore.recordFinalResult;
    if(!matchLifecycleStore||typeof matchLifecycleStore.reconcileAfterRestart!=='function')throw new Error('PVP lifecycle startup recovery is unavailable');
    // Restore only checksum/schema/config-valid engine checkpoints before opening
    // the listener. Only a checkpoint captured at graceful handoff is eligible;
    // a crash-time snapshot could roll back competitive inputs/results.
    const resumableMatchIds=[],restoredCheckpointRows=[];
    if(matchCheckpointStore&&typeof matchCheckpointStore.listActive==='function'&&typeof matchmaking?.restoreCheckpoint==='function'){
      const checkpoints=await matchCheckpointStore.listActive({limit:64});
      for(const row of checkpoints){
        if(row.payload?.recoveryEligible!==true||!row.payload.checkpoint)continue;
        if(await runtime.resultStore.getFinalResult(row.matchId))continue;
        const restored=await matchmaking.restoreCheckpoint({matchId:row.matchId,participants:row.participants,teamIds:row.teamIds,checkpoint:row.payload.checkpoint});
        if(restored?.ok===true){resumableMatchIds.push(row.matchId);restoredCheckpointRows.push(row);}
      }
    }
    await matchLifecycleStore.reconcileAfterRestart(runtime.resultStore,{resumableMatchIds});
    if(onlineCareerService){
      if(typeof onlineCareerService.reconcileReservedFixtures!=='function')throw new Error('Online Career startup recovery is unavailable');
      // The PostgreSQL singleton lock is held before runtime creation. Recover durable
      // results or release interrupted reservations before accepting any new tickets.
      await onlineCareerService.reconcileReservedFixtures();
    }
    // Active restored sessions wait for authenticated participants before any
    // simulation tick. Remove the one-use resume image once recovery is active;
    // a later crash then interrupts safely instead of replaying old input state.
    for(const row of restoredCheckpointRows)await matchCheckpointStore.delete(row);
    server=createOnlineAccountHttpServer({handler:request=>lockHealthy?runtime.handle(request):new Response(JSON.stringify({error:'service-unavailable'}),{status:503,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}}),
      healthCheck:async()=>{if(!lockHealthy)return false;await pool.query('SELECT 1');return lockHealthy;},host:'0.0.0.0',port,maxConnections:128});
    serverStartPromise=new Promise((resolve,reject)=>{
      const onError=error=>{server.off('listening',onListen);reject(error)};
      const onListen=()=>{server.off('error',onError);resolve()};
      server.once('error',onError);server.once('listening',onListen);
    });
    // A synchronous transport setup failure can happen before the listen event.
    // Attach a rejection handler now; the original promise is still awaited below.
    void serverStartPromise.catch(()=>{});
    transport=transportFactory(server,{matchmaking,allowedOrigins:runtime.allowedOrigins,maxConnections:128});
    await serverStartPromise;
    if(!lockHealthy)throw new Error('Online API singleton lock connection was lost during startup');
    let closed=false;
    return Object.freeze({server,runtime,matchmaking,transport,async close(){
      if(closed)return;closed=true;
      stopping=true;lockHealthy=false;
      let closeError=null;
      try{transport.close()}catch(error){closeError=error;}
      try{await matchmaking.prepareShutdown?.()}catch(error){closeError??=error;}
      try{matchmaking.close()}catch(error){closeError??=error;}
      await closeListener();
      let unlockError=null;
      try{await releaseServiceLock()}catch(error){unlockError=error;}
      try{await pool.end?.()}catch(error){closeError??=error;}
      if(closeError)throw closeError;
      if(unlockError)throw unlockError;
    }});
  } catch(error) {
    try{transport?.close?.()}catch{}
    try{await matchmaking?.prepareShutdown?.()}catch{}
    try{matchmaking?.close?.()}catch{}
    await serverStartPromise?.catch(()=>{});
    await closeListener();
    try{await releaseServiceLock()}catch{}
    await pool.end?.().catch?.(()=>{});
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let service;
  try {
    service=await startOnlineAccountService();
    console.log(`SuperMagicFootball online account API listening on port ${service.server.address().port}`);
  } catch(error) {
    console.error(`Online account API startup failed: ${error?.message||'configuration or service error'}`);
    process.exitCode=1;
  }
  if(service){
    let closing=false;
    const shutdown=async()=>{if(closing)return;closing=true;try{await service.close();process.exitCode=0}catch{process.exitCode=1}};
    process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown);
  }
}

export {portFrom as parseOnlineAccountPort};
