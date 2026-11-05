import {pathToFileURL} from 'node:url';
import {randomInt} from 'node:crypto';
import {createOnlineAccountRuntime} from './online-account-runtime.mjs';
import {createOnlineAccountHttpServer} from './online-account-http.mjs';
import {createOnlineMatchmaking} from './online-matchmaking.mjs';
import {createOnlineGameEngine} from './online-game-engine.mjs';
import {attachOnlineMatchWebSocket} from './online-match-ws.mjs';
import {loadAssetsFromNode} from '../src/assets.js';

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
export async function startOnlineAccountService({env=process.env,pool=null,PoolClass=null,fetchImpl=globalThis.fetch,matchmakingFactory=createOnlineMatchmaking,engineFactory=createOnlineGameEngine,transportFactory=attachOnlineMatchWebSocket,runtimeFactory=createOnlineAccountRuntime}={}) {
  const port=portFrom(env);
  if (!pool) {
    const Pool=PoolClass||(await import('pg')).Pool;
    // Keep the pool below the typical small hosted Postgres connection budget.
    pool=new Pool(postgresPoolConfig(env));
  }
  if (typeof pool.query!=='function'||typeof pool.connect!=='function') throw new TypeError('A PostgreSQL Pool-like instance is required');
  pool.on?.('error',()=>console.error('Online account database connection failed'));
  let matchmaking=null,transport=null,recordFinalResult=null,onlineCareerService=null,server=null,serverStartPromise=null;
  try {
    await pool.query('SELECT 1');
    // The game engine currently exposes the first thirteen canonical game teams
    // as playable choices; use that exact catalog for ticket validation.
    const assets=await loadAssetsFromNode();
    const {DATA}=await import('../src/modules/data.js');
    const validTeamIds=DATA.TEAMS.map(team=>team.id);
    if(!validTeamIds.length||validTeamIds.some(id=>!assets.teams.some(team=>team.id===id)))throw new Error('Canonical online team catalog is unavailable');
    matchmaking=matchmakingFactory({
      validTeamIds,
      createEngine:({teamIds,rosterPlayerIds,mode}={})=>engineFactory({home:0,away:9,...(teamIds?{teamIds}:{}),...(rosterPlayerIds?{rosterPlayerIds}:{}),...(mode==='career-ai'?{mode:'career-ai',humans:1}:{}),halfSeconds:120,seed:randomInt(0,0x100000000)}),
      sendSnapshot:(userId,envelope,context)=>transport?.sendSnapshot(userId,envelope,context)??false,
      onRequeue:(userId,detail)=>transport?.onRequeue(userId,detail),
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
    recordFinalResult=runtime.resultStore.recordFinalResult;
    server=createOnlineAccountHttpServer({handler:runtime.handle,healthCheck:async()=>{await pool.query('SELECT 1');return true;},host:'0.0.0.0',port,maxConnections:128});
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
    let closed=false;
    return Object.freeze({server,runtime,matchmaking,transport,async close(){
      if(closed)return;closed=true;
      transport.close();matchmaking.close();
      await new Promise(resolve=>server.close(()=>resolve()));
      await pool.end?.();
    }});
  } catch(error) {
    transport?.close?.();matchmaking?.close?.();
    await serverStartPromise?.catch(()=>{});
    if(server?.listening)await new Promise(resolve=>server.close(()=>resolve()));
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
