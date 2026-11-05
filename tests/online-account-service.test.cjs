const test=require('node:test');
const assert=require('node:assert/strict');
const net=require('node:net');

async function freePort(){
 const server=net.createServer();
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const port=server.address().port;await new Promise(resolve=>server.close(resolve));return port;
}

test('online service configures Career AI as one human plus server CPU and advances only after durable result storage',async()=>{
 const {startOnlineAccountService}=await import('../scripts/online-account-service.mjs');
 const port=await freePort(),events=[],engineCalls=[];
 const pool={async query(sql){events.push(['query',sql]);return {rows:[]};},async connect(){return {query:async()=>({rows:[]}),release(){}};},on(){},async end(){events.push(['pool-end']);}};
 let matcherOptions;
 const transport={
  sendSnapshot(){return true;},onRequeue(){},onMatchError(matchId,code){events.push(['match-error',matchId,code]);return true;},onMatchFinished(matchId){events.push(['ack',matchId]);return true;},close(){events.push(['transport-close']);}
 };
 let advanceAttempts=0;
 const runtimeFactory=async({canonicalTeamIds})=>{
  assert.ok(canonicalTeamIds.includes('japan'));
  return {handle:async()=>new Response('{}',{headers:{'content-type':'application/json'}}),allowedOrigins:['https://game.example.test'],
   resultStore:{async recordFinalResult(result){events.push(['persist',result.matchId]);return {matchId:result.matchId};}},
   onlineCareerService:{async advanceMatchResult(matchId){events.push(['advance',matchId]);advanceAttempts++;if(advanceAttempts===1)throw new Error('transient progression database failure');return {playedCount:1};}}
  };
 };
 const service=await startOnlineAccountService({env:{PORT:String(port)},pool,runtimeFactory,
  matchmakingFactory:options=>{matcherOptions=options;return {close(){events.push(['matchmaking-close']);}}},
  engineFactory:async options=>{engineCalls.push(options);return {};},
  transportFactory:()=>transport});
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
});

test('online engine faults write one bounded operator signal without exception or account data',async()=>{
 const {startOnlineAccountService}=await import('../scripts/online-account-service.mjs');
 const port=await freePort(),lines=[],pool={async query(){return {rows:[]};},async connect(){return {query:async()=>({rows:[]}),release(){}};},on(){},async end(){}};
 let matcherOptions;
 const service=await startOnlineAccountService({env:{PORT:String(port)},pool,operatorLogger:{error(line){lines.push(line);throw new Error('logging backend unavailable');}},
  runtimeFactory:async()=>({handle:async()=>new Response('{}'),allowedOrigins:['https://game.example.test'],resultStore:{recordFinalResult:async result=>result}}),
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
 const pool={async query(){return {rows:[]};},async connect(){return {query:async()=>({rows:[]}),release(){}};},on(){},async end(){poolClosed=true;}};
 await assert.rejects(()=>startOnlineAccountService({env:{PORT:String(port)},pool,
  runtimeFactory:async()=>({handle:async()=>new Response('{}'),allowedOrigins:['https://game.example.test'],resultStore:{recordFinalResult:async result=>result}}),
  matchmakingFactory:()=>({close(){matchmakingClosed=true;}}),
  transportFactory:()=>{throw new Error('transport startup failed');}
 }),/transport startup failed/);
 assert.equal(poolClosed,true,'startup failure must release the database pool');
 assert.equal(matchmakingClosed,true,'startup failure must close the matchmaking runtime');
 const probe=net.createServer();
 await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(port,'127.0.0.1',resolve);});
 await new Promise(resolve=>probe.close(resolve));
});
