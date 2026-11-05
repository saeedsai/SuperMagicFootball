const test=require('node:test');
const assert=require('node:assert/strict');
const net=require('node:net');
const {EventEmitter}=require('node:events');

function mockPool({events=[],lockState={held:false,owner:null}}={}){
 const clients=[];
 return {clients,lockState,async query(sql){events.push(['pool-query',sql]);return {rows:[]};},async connect(){
  const client=new EventEmitter();client.released=false;client.releaseError=null;
  client.query=async(sql,params)=>{
   events.push(['lock-query',sql]);
   if(sql.includes('pg_try_advisory_lock')){
    if(lockState.held)return {rows:[{acquired:false}]};lockState.held=true;lockState.owner=client;return {rows:[{acquired:true}]};
   }
   if(sql.includes('pg_advisory_unlock')){
    const unlocked=lockState.owner===client;if(unlocked){lockState.owner=null;lockState.held=false}return {rows:[{unlocked}]};
   }
   return {rows:[]};
  };
  client.release=error=>{client.released=true;client.releaseError=error||null;if(lockState.owner===client){lockState.owner=null;lockState.held=false;}events.push(['lock-release',!!error]);};
  clients.push(client);return client;
 },on(){},async end(){events.push(['pool-end']);}};
}

async function freePort(){
 const server=net.createServer();
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const port=server.address().port;await new Promise(resolve=>server.close(resolve));return port;
}
function onceEvent(emitter,name){return new Promise(resolve=>emitter.once(name,resolve));}

test('online service configures Career AI as one human plus server CPU and advances only after durable result storage',async()=>{
 const {startOnlineAccountService}=await import('../scripts/online-account-service.mjs');
 const port=await freePort(),events=[],engineCalls=[];
 const pool=mockPool({events});
 let matcherOptions;
 const transport={
  sendSnapshot(){return true;},onRequeue(){},onMatchError(matchId,code){events.push(['match-error',matchId,code]);return true;},onMatchFinished(matchId){events.push(['ack',matchId]);return true;},close(){events.push(['transport-close']);}
 };
 let advanceAttempts=0;
 const runtimeFactory=async({canonicalTeamIds})=>{
  assert.ok(canonicalTeamIds.includes('japan'));
  return {handle:async()=>new Response('{}',{headers:{'content-type':'application/json'}}),allowedOrigins:['https://game.example.test'],
   resultStore:{async recordFinalResult(result){events.push(['persist',result.matchId]);return {matchId:result.matchId};}},
   matchLifecycleStore:{async recordAssigned(value){events.push(['assigned',value.matchId]);},async reconcileAfterRestart(){events.push(['pvp-reconcile',pool.lockState.held]);return {completed:0,interrupted:0};}},
   onlineCareerService:{async reconcileReservedFixtures(){events.push(['reconcile',pool.lockState.held]);return 0;},async advanceMatchResult(matchId){events.push(['advance',matchId]);advanceAttempts++;if(advanceAttempts===1)throw new Error('transient progression database failure');return {playedCount:1};}}
  };
 };
 const service=await startOnlineAccountService({env:{PORT:String(port)},pool,runtimeFactory,
  matchmakingFactory:options=>{matcherOptions=options;return {close(){events.push(['matchmaking-close']);}}},
  engineFactory:async options=>{engineCalls.push(options);return {};},
  transportFactory:()=>transport});
 assert.equal(pool.lockState.held,true,'the process lock remains held for the full service lifetime');
 assert.deepEqual(events.slice(0,2).map(row=>row[0]),['lock-query','pool-query'],'the singleton lock is acquired before runtime setup');
 assert.deepEqual(events.find(row=>row[0]==='reconcile'),['reconcile',true],'Career recovery completes while the process lock is held');
 assert.deepEqual(events.find(row=>row[0]==='pvp-reconcile'),['pvp-reconcile',true],'PVP recovery completes while the process lock is held');
 await matcherOptions.onMatchAssigned({matchId:'b'.repeat(32),participants:['player_alpha','player_bravo'],teamIds:['japan','brazil']});
 try{
  const engine=await matcherOptions.createEngine({teamIds:['japan','brazil'],mode:'career-ai'});
  assert.deepEqual(engine,{});
  assert.equal(engineCalls[0].mode,'career-ai');
  assert.equal(engineCalls[0].humans,1);
  assert.deepEqual(engineCalls[0].teamIds,['japan','brazil']);
  const result={matchId:'a'.repeat(32),status:'finished'};
  await assert.rejects(()=>matcherOptions.onMatchFinished(result),/transient progression database failure/);
  assert.deepEqual(events.filter(row=>['persist','advance'].includes(row[0])).map(row=>row[0]),['persist','advance']);
  assert.deepEqual(await matcherOptions.onMatchFinished(result),{matchId:result.matchId});
  assert.deepEqual(events.filter(row=>['persist','advance'].includes(row[0])).map(row=>row[0]),['persist','advance','persist','advance']);
  assert.equal(matcherOptions.onMatchPersisted(result),true);
  assert.deepEqual(events.at(-1),['ack',result.matchId]);
  assert.equal(matcherOptions.onMatchError(result.matchId,'engine-error'),true);
  assert.deepEqual(events.at(-1),['match-error',result.matchId,'engine-error']);
 }finally{await service.close();}
 assert.ok(events.some(row=>row[0]==='pool-end'));
 assert.equal(pool.lockState.held,false,'graceful shutdown releases the PostgreSQL session lock');
 assert.equal(pool.clients[0].released,true,'the dedicated lock connection returns to the pool after unlock');
});

test('Online Career recovery failure prevents listener startup and releases the singleton lock',async()=>{
 const {startOnlineAccountService}=await import('../scripts/online-account-service.mjs');
 const port=await freePort(),pool=mockPool();let transportStarted=false,matchmakingClosed=false;
 await assert.rejects(()=>startOnlineAccountService({env:{PORT:String(port)},pool,
  runtimeFactory:async()=>({handle:async()=>new Response('{}'),allowedOrigins:['https://game.example.test'],resultStore:{recordFinalResult:async result=>result},matchLifecycleStore:{recordAssigned:async()=>{},async reconcileAfterRestart(){return {completed:0,interrupted:0};}},
   onlineCareerService:{async reconcileReservedFixtures(){throw new Error('fixture recovery transaction failed');}}}),
  matchmakingFactory:()=>({close(){matchmakingClosed=true;}}),transportFactory:()=>{transportStarted=true;return {close(){}};}
 }),/fixture recovery transaction failed/);
 assert.equal(transportStarted,false,'no transport or listener is started with unreconciled Career state');
 assert.equal(matchmakingClosed,true,'failed reconciliation closes the process-local queue');
 assert.equal(pool.lockState.held,false,'failed startup releases the PostgreSQL session lock');
 assert.equal(pool.clients[0].released,true);
 const probe=net.createServer();await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(port,'127.0.0.1',resolve);});await new Promise(resolve=>probe.close(resolve));
});

test('PVP lifecycle recovery failure is fail-closed before listener or transport startup',async()=>{
 const {startOnlineAccountService}=await import('../scripts/online-account-service.mjs');
 const port=await freePort(),pool=mockPool();let transportStarted=false,matchmakingClosed=false;
 await assert.rejects(()=>startOnlineAccountService({env:{PORT:String(port)},pool,
  runtimeFactory:async()=>({handle:async()=>new Response('{}'),allowedOrigins:['https://game.example.test'],resultStore:{recordFinalResult:async result=>result},
   matchLifecycleStore:{recordAssigned:async()=>{},async reconcileAfterRestart(){throw Error('PVP recovery query failed');}}}),
  matchmakingFactory:()=>({close(){matchmakingClosed=true;}}),transportFactory:()=>{transportStarted=true;return {close(){}};}
 }),/PVP recovery query failed/);
 assert.equal(transportStarted,false);assert.equal(matchmakingClosed,true);assert.equal(pool.lockState.held,false);
 const probe=net.createServer();await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(port,'127.0.0.1',resolve);});await new Promise(resolve=>probe.close(resolve));
});

test('a second Online API process is refused while the first process holds the session lock',async()=>{
 const {startOnlineAccountService}=await import('../scripts/online-account-service.mjs');
 const sharedLock={held:false,owner:null},firstPool=mockPool({lockState:sharedLock}),secondPool=mockPool({lockState:sharedLock});
 const firstPort=await freePort(),secondPort=await freePort();let firstMatcherClosed=false,secondMatcherCreated=false,secondPoolEnded=false;
 const runtimeFactory=async()=>({handle:async()=>new Response('{}'),allowedOrigins:['https://game.example.test'],resultStore:{recordFinalResult:async result=>result},matchLifecycleStore:{recordAssigned:async()=>{},async reconcileAfterRestart(){return {completed:0,interrupted:0};}}});
 const first=await startOnlineAccountService({env:{PORT:String(firstPort)},pool:firstPool,runtimeFactory,
  matchmakingFactory:()=>({close(){firstMatcherClosed=true}}),transportFactory:()=>({close(){}})});
 try{
  assert.equal(sharedLock.held,true);
  const originalEnd=secondPool.end;secondPool.end=async()=>{secondPoolEnded=true;await originalEnd();};
  await assert.rejects(()=>startOnlineAccountService({env:{PORT:String(secondPort)},pool:secondPool,runtimeFactory,
   matchmakingFactory:()=>{secondMatcherCreated=true;return {close(){}}},transportFactory:()=>({close(){}})}),/Another Online API instance already owns the matchmaking service lock/);
  assert.equal(secondMatcherCreated,false,'a contending process must fail before creating matchmaking');
  assert.equal(secondPoolEnded,true,'the failed process releases its pool');
  assert.equal(secondPool.clients[0].released,true,'the unowned lock connection is discarded');
  assert.equal(sharedLock.held,true,'the failed contender cannot release the first process lock');
  assert.equal(firstMatcherClosed,false);
  const probe=net.createServer();await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(secondPort,'127.0.0.1',resolve);});await new Promise(resolve=>probe.close(resolve));
  const health=await fetch(`http://127.0.0.1:${firstPort}/healthz`);assert.equal(health.status,200);
 }finally{await first.close();}
 assert.equal(sharedLock.held,false);
});

test('online engine faults write one bounded operator signal without exception or account data',async()=>{
 const {startOnlineAccountService}=await import('../scripts/online-account-service.mjs');
 const port=await freePort(),lines=[],pool=mockPool();
 let matcherOptions;
 const service=await startOnlineAccountService({env:{PORT:String(port)},pool,operatorLogger:{error(line){lines.push(line);throw new Error('logging backend unavailable');}},
  runtimeFactory:async()=>({handle:async()=>new Response('{}'),allowedOrigins:['https://game.example.test'],resultStore:{recordFinalResult:async result=>result},matchLifecycleStore:{recordAssigned:async()=>{},async reconcileAfterRestart(){return {completed:0,interrupted:0};}}}),
  matchmakingFactory:options=>(matcherOptions=options,{close(){}}),transportFactory:()=>({close(){}})});
 try{
  assert.doesNotThrow(()=>matcherOptions.onMatchFault('a'.repeat(32),'private exception text'));
  assert.deepEqual(lines,[JSON.stringify({event:'online-match-fault',matchId:'a'.repeat(32),code:'engine-error'})]);
  assert.equal(lines.join('').includes('private exception text'),false);
  assert.equal(lines.join('').includes('player_alpha'),false);
  matcherOptions.onMatchFault('an untrusted identifier','engine-error');
  assert.equal(lines.length,1,'non-opaque IDs are never emitted to operator logs');
  const health=await fetch(`http://127.0.0.1:${port}/healthz`);
  assert.equal(health.status,200,'a failing logger does not take the online service down');
 }finally{await service.close();}
});

test('online service closes its HTTP listener and database pool when WebSocket startup fails',async()=>{
 const {startOnlineAccountService}=await import('../scripts/online-account-service.mjs');
 const port=await freePort();let poolClosed=false,matchmakingClosed=false;
 const pool=mockPool();pool.end=async()=>{poolClosed=true;};
 await assert.rejects(()=>startOnlineAccountService({env:{PORT:String(port)},pool,
  runtimeFactory:async()=>({handle:async()=>new Response('{}'),allowedOrigins:['https://game.example.test'],resultStore:{recordFinalResult:async result=>result},matchLifecycleStore:{recordAssigned:async()=>{},async reconcileAfterRestart(){return {completed:0,interrupted:0};}}}),
  matchmakingFactory:()=>({close(){matchmakingClosed=true;}}),
  transportFactory:()=>{throw new Error('transport startup failed');}
 }),/transport startup failed/);
 assert.equal(poolClosed,true,'startup failure must release the database pool');
 assert.equal(matchmakingClosed,true,'startup failure must close the matchmaking runtime');
 assert.equal(pool.lockState.held,false,'startup failure unlocks before closing the database pool');
 assert.equal(pool.clients[0].released,true);
 const probe=net.createServer();
 await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(port,'127.0.0.1',resolve);});
 await new Promise(resolve=>probe.close(resolve));
});

test('loss of the dedicated advisory-lock connection closes API and matchmaking fail-closed',async()=>{
 const {startOnlineAccountService}=await import('../scripts/online-account-service.mjs');
 const port=await freePort(),events=[],pool=mockPool({events});let matcherClosed=false,transportClosed=false;
 let resolvePoolEnd;const poolEnded=new Promise(resolve=>resolvePoolEnd=resolve);pool.end=async()=>{events.push(['pool-end']);resolvePoolEnd();};
 const service=await startOnlineAccountService({env:{PORT:String(port)},pool,
  runtimeFactory:async()=>({handle:async()=>new Response('{}'),allowedOrigins:['https://game.example.test'],resultStore:{recordFinalResult:async result=>result},matchLifecycleStore:{recordAssigned:async()=>{},async reconcileAfterRestart(){return {completed:0,interrupted:0};}}}),
  matchmakingFactory:()=>({close(){matcherClosed=true;}}),transportFactory:()=>({close(){transportClosed=true;}})});
 const listenerClosed=onceEvent(service.server,'close');
 pool.clients[0].emit('error',new Error('socket terminated'));
 await Promise.all([listenerClosed,poolEnded]);
 assert.equal(service.server.listening,false,'the listener stops accepting requests when its singleton lock is lost');
 assert.equal(matcherClosed,true,'matchmaking is disabled after the lock connection fails');
 assert.equal(transportClosed,true,'active WebSocket transports are closed after the lock connection fails');
 assert.equal(pool.clients[0].released,true,'the lost connection is discarded rather than returned to the pool');
 assert.equal(pool.clients[0].releaseError instanceof Error,true);
 assert.equal(pool.lockState.held,false,'a broken session no longer owns the advisory lock');
 assert.ok(events.some(row=>row[0]==='pool-end'),'the online database pool is closed after lock loss');
 await assert.rejects(()=>fetch(`http://127.0.0.1:${port}/healthz`));
});
