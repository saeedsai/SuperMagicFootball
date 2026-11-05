const {test,before}=require('node:test');
const assert=require('node:assert/strict');

let createOnlineMatchmaking;
before(async()=>{
  ({createOnlineMatchmaking}=await import('../scripts/online-matchmaking.mjs'));
});

const a='player_alpha',b='player_bravo',c='player_charlie';
const AI='smf_server_career_ai';
const input=(x=0)=>({x,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}});
function renderState(){return {tick:0,phase:'play',matchState:'play',terminal:false,half:1,clock:30,clockRemaining:30,clockProgress:.5,
  score:[0,0],teamIds:['team_home','team_away'],controlled:[0,0],ballModel:'classic',ball:{x:.5,y:.5,height:0,velocity:{x:0,y:0,height:0},owner:null,shot:null,roll:0},
  players:Array.from({length:12},(_,ordinal)=>({slot:ordinal%6,team:ordinal<6?0:1,index:ordinal%6,assetId:`${ordinal<6?'team_home':'team_away'}/test_${ordinal}`,
    position:{x:ordinal<6 ? .25 : .75,y:.5,height:0},view:{kind:'side',side:ordinal<6 ? 1 : -1},facing:ordinal<6 ? 1 : -1,
    animation:{phase:0,actionTime:0,progress:0},action:'idle',stun:0,keeper:ordinal%6===0,
    visual:{knockdown:0,confused:0,crying:0,airborne:false}})),
  hazards:{magic:[],walls:[],nova:null,tornado:null,lightning:null,weather:'Clear'}};}
function makeEngine({onStep=()=>{},onResume=()=>{}}={}){
  const state=renderState();
  return {state,lastInputs:null,resumes:0,
    get snapshot(){return this.state;},
    step(dt,streams){onStep(this,dt,streams);this.lastInputs=streams;const clock=Math.max(0,this.state.clock-dt);this.state={...this.state,tick:this.state.tick+1,clock,
      clockRemaining:60-clock,clockProgress:clock/60,phase:this.state.matchState,terminal:this.state.matchState==='finished'};return {accepted:true,snapshot:this.state};},
    resumeAfterHalftime(){this.resumes++;onResume(this);this.state={...this.state,matchState:'play',phase:'play'};return true;}
  };
}
function service(overrides={}){
  let time=10_000;const engines=[];const engineOptions=[];const sent=[];const requeued=[];
  const api=createOnlineMatchmaking({createEngine:async options=>{engineOptions.push(options);const engine=makeEngine(overrides);if(options.teamIds)engine.state={...engine.state,teamIds:options.teamIds.slice()};engines.push(engine);return engine;},
    sendSnapshot:(userId,envelope,metadata)=>{sent.push({userId,envelope,metadata});return overrides.sendSnapshot?.(userId,envelope,metadata)??true;},
    onMatchError:overrides.onMatchError,
    onMatchFault:overrides.onMatchFault,
    onMatchAssigned:overrides.onMatchAssigned,
    onRequeue:(userId,details)=>requeued.push({userId,details}),onMatchFinished:overrides.onMatchFinished||(async result=>({matchId:result.matchId})),now:()=>time,autoTick:false,
    ...(overrides.config||{})});
  return {api,engines,engineOptions,sent,requeued,setTime:value=>{time=value;}};
}

test('tickets bind canonical selected teams; queue-time tampering cannot change assigned sides',async()=>{
 const ctx=service({config:{validTeamIds:['japan','brazil','argentina']}});
 const first=ctx.api.issueTicket(a,'brazil'),second=ctx.api.issueTicket(b,'japan');
 assert.equal(first.ok,true);assert.equal(second.ok,true);
 assert.deepEqual(ctx.api.issueTicket(c,'fictional-team'),{ok:false,reason:'invalid-team'});
 await ctx.api.queueTicket({userId:a,ticket:first.ticket,teamId:'argentina'});
 const paired=await ctx.api.queueTicket({userId:b,ticket:second.ticket,teamId:'fictional-team'});
 assert.equal(paired.status,'matched');
 assert.deepEqual(ctx.engineOptions[0].teamIds,['brazil','japan']);
 assert.deepEqual(ctx.engineOptions[0].participants,[a,b]);
 ctx.api.close();
});

test('PVP assignment is durably acknowledged before a matched response and persistence failure releases both slots',async()=>{
 const assigned=[],ctx=service({onMatchAssigned:async value=>{assigned.push(value);if(assigned.length===1)throw new Error('lifecycle database unavailable');},config:{validTeamIds:['team_home','team_away']}});
 const first=ctx.api.issueTicket(a,'team_home'),second=ctx.api.issueTicket(b,'team_away');
 await ctx.api.queueTicket({userId:a,ticket:first.ticket});
 const rejected=await ctx.api.queueTicket({userId:b,ticket:second.ticket});
 assert.equal(rejected.status,'queued','no assigned response is published when durable lifecycle persistence fails');
 assert.deepEqual(ctx.api.getState().active,[],'the just-created match is closed and both active slots are released');
 assert.equal(ctx.api.getState().queued.length,2,'both authenticated participants can safely retry');
 ctx.api.cancelQueue(a);ctx.api.cancelQueue(b);
 const third=ctx.api.issueTicket(a,'team_home'),fourth=ctx.api.issueTicket(b,'team_away');
 await ctx.api.queueTicket({userId:a,ticket:third.ticket});
 const matched=await ctx.api.queueTicket({userId:b,ticket:fourth.ticket});
 assert.equal(matched.status,'matched');assert.equal(assigned.length,2);
 assert.deepEqual(assigned[1],{matchId:matched.matchId,participants:[a,b],teamIds:['team_home','team_away']});
 ctx.api.close();
});

test('a thrown match-engine step closes only that match and releases its participants',async()=>{
 const errors=[],faults=[],settlements=[],ctx=service({onStep(){throw new Error('sensitive simulation fault details');},onMatchError:(matchId,code)=>errors.push([matchId,code]),
  onMatchFault:(matchId,code)=>{faults.push([matchId,code]);throw new Error('broken operator observer');},onMatchFinished:async result=>{settlements.push(result);return result;}});
 const first=ctx.api.issueTicket(a),second=ctx.api.issueTicket(b);
 await ctx.api.queueTicket({userId:a,ticket:first.ticket});
 const paired=await ctx.api.queueTicket({userId:b,ticket:second.ticket});
 assert.equal(paired.status,'matched');
 const result=ctx.api.tick(paired.matchId);
 assert.equal(result.advanced,false);
 assert.equal(result.closed,true);
 assert.equal(result.reason,'engine-error');
 assert.deepEqual(errors,[[paired.matchId,'engine-error']]);
 assert.deepEqual(faults,[[paired.matchId,'engine-error']],'one bounded operator signal is emitted for the failed match');
 assert.deepEqual(settlements,[],'an engine failure never enters result settlement');
 assert.deepEqual(ctx.api.getState().active,[]);
 assert.equal(ctx.api.issueTicket(a).ok,true,'a failed match cannot strand either account as active');
 assert.equal(ctx.api.tick(paired.matchId).reason,'engine-error','the disposed match is not stepped or reported a second time');
 assert.deepEqual(faults,[[paired.matchId,'engine-error']]);
 ctx.api.close();
});

test('quick-match interval safely accepts synchronous tick results and contains unexpected tick failures',async()=>{
 const callbacks=[],cleared=[],faults=[],settlements=[];
 const ctx=service({onResume(){throw new Error('unexpected halftime callback failure');},
  onMatchFault:(matchId,code)=>faults.push([matchId,code]),onMatchFinished:async result=>{settlements.push(result);return result;},
  config:{autoTick:true,setIntervalFn(callback){callbacks.push(callback);return callbacks.length;},clearIntervalFn(id){cleared.push(id);}}});
 const {matched}=await pair(ctx);assert.equal(callbacks.length,1);
 assert.doesNotThrow(()=>callbacks[0](),'ordinary synchronous tick results do not cause .catch TypeErrors');
 assert.equal(ctx.engines[0].snapshot.tick,1);
 ctx.engines[0].state={...ctx.engines[0].state,matchState:'paused',phase:'paused'};
 assert.doesNotThrow(()=>callbacks[0](),'unexpected synchronous tick failures are contained');
 assert.deepEqual(ctx.api.getState().active,[]);
 assert.equal(ctx.api.issueTicket(a).ok,true,'failed timer cleanup releases both participant slots');
 assert.deepEqual(settlements,[],'unexpected timer failures do not settle or reward a result');
 assert.deepEqual(faults,[[matched.matchId,'engine-error']]);
 assert.doesNotThrow(()=>callbacks[0](),'a disposed interval callback remains harmless');
 assert.deepEqual(faults,[[matched.matchId,'engine-error']]);
 ctx.api.close();assert.deepEqual(cleared,[1]);
});

test('Career match interval safely handles synchronous ticks and rejected persistence promises',async()=>{
 const callbacks=[],cleared=[],settlementAttempts=[],faults=[];let rejectTickClock=false;
 const matchId='d'.repeat(32),ctx=service({config:{autoTick:true,now:()=>{if(rejectTickClock){rejectTickClock=false;throw new Error('persistence retry clock failed');}return 10_000;},
   setIntervalFn(callback){callbacks.push(callback);return callbacks.length;},clearIntervalFn(id){cleared.push(id);}},
   onMatchFault:(id,code)=>faults.push([id,code]),onMatchFinished:async result=>{settlementAttempts.push(result);rejectTickClock=true;throw new Error('result store unavailable');},
   onStep(engine){engine.state={...engine.state,phase:'finished',matchState:'finished',terminal:true,half:2};}});
 ctx.api.reserveCareerFixture({fixtureNo:1,fixtureId:'c'.repeat(32),matchId,participants:[{userId:a,side:0},{userId:AI,side:1}],
   teamIds:['japan','brazil'],mode:'career-ai'});
 const ticket=ctx.api.issueCareerTicket(matchId,a);await ctx.api.queueTicket({userId:a,ticket:ticket.ticket});
 assert.equal(callbacks.length,1);assert.doesNotThrow(()=>callbacks[0](),'Career timer also accepts synchronous results');
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(settlementAttempts.length,1);assert.deepEqual(ctx.api.getState().active,[]);
 assert.deepEqual(faults,[[matchId,'engine-error']]);
 assert.deepEqual(cleared,[1]);
 assert.equal(ctx.api.issueCareerTicket(matchId,a).ok,true,'failed Career timer resets the reserved fixture for retry');
 ctx.api.close();
});

test('server-owned Ultimate Team lineups remain bound to one-use tickets and match sides',async()=>{
 const ctx=service({config:{validTeamIds:['japan','brazil','argentina']}}),firstIds=Array.from({length:12},(_,i)=>`japan/jp${i}`),secondIds=Array.from({length:12},(_,i)=>`brazil/br${i}`);
 const first=ctx.api.issueTicket(a,'japan',firstIds),second=ctx.api.issueTicket(b,'brazil',secondIds);
 assert.equal(first.ok,true);assert.deepEqual(ctx.api.issueTicket(c,'japan',[...firstIds.slice(1)]),{ok:false,reason:'invalid-lineup'});
 await ctx.api.queueTicket({userId:a,ticket:first.ticket});
 const paired=await ctx.api.queueTicket({userId:b,ticket:second.ticket});assert.equal(paired.status,'matched');
 assert.deepEqual(ctx.engineOptions[0].rosterPlayerIds,[firstIds,secondIds]);ctx.api.close();
});

test('random queue deterministically resolves duplicate selected teams to a distinct supported opponent',async()=>{
 const ctx=service({config:{validTeamIds:['japan','brazil','argentina']}}),first=ctx.api.issueTicket(a,'japan'),second=ctx.api.issueTicket(b,'japan');
 await ctx.api.queueTicket({userId:a,ticket:first.ticket});const paired=await ctx.api.queueTicket({userId:b,ticket:second.ticket});
 const alternatives=['argentina','brazil'];
 const bytes=Buffer.from(paired.matchId,'hex'),keepSide=bytes[0]&1,index=bytes.readUInt32BE(1)%alternatives.length;
 const expected=['japan','japan'];expected[1-keepSide]=alternatives[index];
 assert.deepEqual(ctx.engineOptions[0].teamIds,expected);
 assert.notEqual(ctx.engineOptions[0].teamIds[0],ctx.engineOptions[0].teamIds[1]);
 assert.ok(ctx.engineOptions[0].teamIds.every(id=>['japan','brazil','argentina'].includes(id)));
 ctx.api.close();
});

test('trusted Career reservations bind exact match ID, participant sides, and selected teams without joining random queue',async()=>{
 const assigned=[],ctx=service({onMatchAssigned:async value=>assigned.push(value.matchId),config:{validTeamIds:['japan','brazil','argentina']}}),matchId='f'.repeat(32);
 const fixture={fixtureNo:1,fixtureId:'c'.repeat(32),matchId,participants:[{userId:a,side:0},{userId:AI,side:1}],teamIds:['japan','brazil'],mode:'career-ai'};
 assert.deepEqual(ctx.api.reserveCareerFixture(fixture),{ok:true,duplicate:false,matchId});
 assert.deepEqual(ctx.api.reserveCareerFixture(fixture),{ok:true,duplicate:true,matchId});
 assert.equal(ctx.api.reserveCareerFixture({...fixture,teamIds:['brazil','japan']}).reason,'fixture-conflict');
 assert.equal(ctx.api.issueTicket(a,'japan').reason,'duplicate-active-user','a reserved Career seat cannot enter random matchmaking');
 assert.equal(ctx.api.issueCareerTicket(matchId,b).reason,'career-fixture-unavailable');
 const random=ctx.api.issueTicket(c,'argentina');assert.equal((await ctx.api.queueTicket({userId:c,ticket:random.ticket})).status,'queued');
 const first=ctx.api.issueCareerTicket(matchId,a);
 assert.equal(first.side,0);assert.equal(first.matchId,matchId);
 const paired=await ctx.api.queuePresentedTicket(first.ticket);
 assert.equal(paired.status,'matched');assert.equal(paired.career,true);assert.equal(paired.mode,'career-ai');assert.equal(paired.matchId,matchId);
 assert.deepEqual(paired.seats,[{userId:a,side:0},{userId:AI,side:1}]);
 assert.deepEqual(ctx.engineOptions[0],{matchId,participants:[a,AI],teamIds:['japan','brazil'],mode:'career-ai'});
 assert.deepEqual(ctx.api.getState().queued,[c]);
 assert.deepEqual(assigned,[],'Career fixture assignments use their separate durable recovery lifecycle');
 assert.equal((await ctx.api.queuePresentedTicket(first.ticket)).reason,'ticket-used-or-unknown');
 ctx.api.close();
});

test('Career reservation rollback removes only the matching unconsumed fixture',async()=>{
 const ctx=service({config:{validTeamIds:['japan','brazil']}}),matchId='b'.repeat(32);
 const fixture={fixtureNo:1,fixtureId:'a'.repeat(32),matchId,participants:[{userId:a,side:0},{userId:AI,side:1}],teamIds:['japan','brazil'],mode:'career-ai'};
 assert.equal(ctx.api.reserveCareerFixture(fixture).ok,true);
 assert.deepEqual(ctx.api.releaseCareerFixture(matchId,b),{ok:false,reason:'career-fixture-unavailable'},'only the reserved account owner can release it');
 assert.equal(ctx.api.issueTicket(a,'japan').reason,'duplicate-active-user','a mismatched release must preserve the reverse owner lock');
 assert.deepEqual(ctx.api.releaseCareerFixture(matchId,a),{ok:true,released:true,matchId});
 assert.deepEqual(ctx.api.releaseCareerFixture(matchId,a),{ok:false,reason:'career-fixture-unavailable'});
 assert.equal(ctx.api.issueTicket(a,'japan').ok,true,'a successful rollback releases the matching account lock');
 ctx.api.close();
});

test('Career reservation rollback refuses a consumed active match and preserves it',async()=>{
 const ctx=service({config:{validTeamIds:['japan','brazil']}}),matchId='c'.repeat(32);
 ctx.api.reserveCareerFixture({fixtureNo:1,fixtureId:'d'.repeat(32),matchId,participants:[{userId:a,side:0},{userId:AI,side:1}],teamIds:['japan','brazil'],mode:'career-ai'});
 const ticket=ctx.api.issueCareerTicket(matchId,a);
 const paired=await ctx.api.queueTicket({userId:a,ticket:ticket.ticket});assert.equal(paired.status,'matched');
 assert.deepEqual(ctx.api.releaseCareerFixture(matchId,a),{ok:false,reason:'career-fixture-active'});
 assert.equal(ctx.api.getState().active[0].matchId,matchId);
 assert.equal(ctx.api.issueCareerTicket(matchId,a).reason,'career-fixture-unavailable','a failed rollback cannot revive or duplicate an active seat');
 ctx.api.close();
});

test('Career fixture captures the account lineup before the CPU match starts',async()=>{
 const ctx=service({config:{validTeamIds:['japan','brazil']}}),matchId='9'.repeat(32),playerIds=Array.from({length:12},(_,i)=>`japan/jp${i}`);
 const fixture={fixtureNo:1,fixtureId:'8'.repeat(32),matchId,participants:[{userId:a,side:0},{userId:AI,side:1}],teamIds:['japan','brazil'],mode:'career-ai'};
 assert.equal(ctx.api.reserveCareerFixture(fixture,playerIds).ok,true);
 const ticket=ctx.api.issueCareerTicket(matchId,a,playerIds);
 assert.equal((await ctx.api.queuePresentedTicket(ticket.ticket)).status,'matched');
 assert.deepEqual(ctx.engineOptions[0].rosterPlayerIds,[playerIds,null]);ctx.api.close();
});

test('aborted Career match can safely retry the same pre-bound match ID only before durable completion',async()=>{
 const ctx=service({config:{validTeamIds:['japan','brazil']}}),matchId='e'.repeat(32);
 ctx.api.reserveCareerFixture({fixtureNo:1,fixtureId:'d'.repeat(32),matchId,participants:[{userId:a,side:0},{userId:AI,side:1}],teamIds:['japan','brazil'],mode:'career-ai'});
 const pair=async()=>{
  const one=ctx.api.issueCareerTicket(matchId,a);return ctx.api.queueTicket({userId:a,ticket:one.ticket});
 };
 assert.equal((await pair()).matchId,matchId);
 assert.equal(ctx.api.disconnect({userId:a,matchId}).reason,'match-stopped');
 assert.equal(ctx.api.disconnect({userId:a,matchId}).reason,'stale-disconnect');
 assert.equal((await pair()).matchId,matchId);
 assert.equal(ctx.engineOptions.length,2);ctx.api.close();
});

test('Career terminal result preserves the reserved match ID, participant order, and teams for durable persistence',async()=>{
 const persisted=[],ctx=service({config:{validTeamIds:['japan','brazil']},
  onStep(engine){engine.state={...engine.state,phase:'finished',matchState:'finished',terminal:true,half:2,score:[2,1]};},
  onMatchFinished:async result=>{persisted.push(result);return {matchId:result.matchId};}}),matchId='d'.repeat(32);
 ctx.api.reserveCareerFixture({fixtureNo:1,fixtureId:'a'.repeat(32),matchId,participants:[{userId:a,side:0},{userId:AI,side:1}],teamIds:['japan','brazil'],mode:'career-ai'});
 const first=ctx.api.issueCareerTicket(matchId,a);
 await ctx.api.queueTicket({userId:a,ticket:first.ticket});
 const finished=await ctx.api.tick(matchId);
 assert.equal(finished.reason,'finished');assert.equal(persisted.length,1);
 assert.equal(persisted[0].matchId,matchId);assert.deepEqual(persisted[0].participants,[{userId:a,side:0},{userId:AI,side:1}]);
 assert.deepEqual(persisted[0].teamIds,['japan','brazil']);assert.deepEqual(persisted[0].score,[2,1]);ctx.api.close();
});

test('ticket, waiting-queue and active-match collections enforce configured global caps',async()=>{
 const ticketCtx=service({config:{maxPendingTickets:1,maxQueuedUsers:2}});
 const firstTicket=ticketCtx.api.issueTicket(a);assert.ok(firstTicket.ok);
 assert.equal(ticketCtx.api.issueTicket(b).reason,'service-capacity');
 await ticketCtx.api.queueTicket({userId:a,ticket:firstTicket.ticket});
 assert.ok(ticketCtx.api.issueTicket(b).ok);ticketCtx.api.close();

 const ctx=service({config:{maxPendingTickets:2,maxQueuedUsers:1,maxActiveMatches:1}});
 const {matched}=await pair(ctx);assert.ok(matched.ok);
 const first=ctx.api.issueTicket(c);assert.ok(first.ok);
 const preissued=ctx.api.issueTicket('player_delta');assert.ok(preissued.ok,'a racing ticket can be issued before the queue fills');
 await ctx.api.queueTicket({userId:c,ticket:first.ticket});
 assert.equal((await ctx.api.queueTicket({userId:'player_delta',ticket:preissued.ticket})).reason,'service-capacity');
 assert.deepEqual(ctx.api.getState().queued,[c]);
 assert.ok(ctx.api.cancelQueue(c).ok);
 const recovered=ctx.api.issueTicket('player_delta');assert.ok(recovered.ok,'capacity becomes available without restarting the service');
 ctx.api.close();
});

test('active-match cap keeps excess participants bounded in the waiting queue',async()=>{
 const ctx=service({config:{maxQueuedUsers:2,maxActiveMatches:1}});
 const {matched}=await pair(ctx);assert.equal(matched.status,'matched');
 const cTicket=ctx.api.issueTicket(c),dTicket=ctx.api.issueTicket('player_delta');
 await ctx.api.queueTicket({userId:c,ticket:cTicket.ticket});
 const waiting=await ctx.api.queueTicket({userId:'player_delta',ticket:dTicket.ticket});
 assert.deepEqual(waiting,{ok:true,status:'queued',reason:'service-capacity'});
 assert.deepEqual(ctx.api.getState().queued,[c,'player_delta']);ctx.api.close();
});

test('disconnected opponent is not silently requeued when the global queue is at capacity',async()=>{
 const ctx=service({config:{maxQueuedUsers:1,maxActiveMatches:1,disconnectGraceMs:5000}}),{matched}=await pair(ctx);
 const waiting=ctx.api.issueTicket(c),preissued=ctx.api.issueTicket('player_delta');await ctx.api.queueTicket({userId:c,ticket:waiting.ticket});
 assert.deepEqual(ctx.api.getState().queued,[c]);
 assert.equal((await ctx.api.queueTicket({userId:'player_delta',ticket:preissued.ticket})).reason,'service-capacity');
 ctx.api.disconnect({userId:a,matchId:matched.matchId});ctx.setTime(15_000);ctx.api.tick(matched.matchId);
 assert.deepEqual(ctx.requeued.at(-1),{userId:b,details:{reason:'service-capacity',previousMatchId:matched.matchId,queued:false}});
 assert.deepEqual(ctx.api.getState().queued,[c]);ctx.api.close();
});
async function pair(ctx,users=[a,b]){
  const issued=users.map(userId=>ctx.api.issueTicket(userId));
  assert.ok(issued.every(row=>row.ok));
  const first=await ctx.api.queueTicket({userId:users[0],ticket:issued[0].ticket});
  assert.equal(first.status,'queued');
  return {issued,first,matched:await ctx.api.queueTicket({userId:users[1],ticket:issued[1].ticket})};
}

test('secure opaque tickets are user-bound, single-use, expiring and short-lived',async()=>{
  const ctx=service({config:{ticketTtlMs:60_000}});
  const first=ctx.api.issueTicket(a),second=ctx.api.issueTicket(b);
  assert.match(first.ticket,/^[a-f0-9]{64}$/);assert.notEqual(first.ticket,second.ticket);
  assert.equal(first.expiresAt,70_000);
  assert.equal(ctx.api.issueTicket(a).reason,'duplicate-active-user');
  assert.equal((await ctx.api.queueTicket({userId:b,ticket:first.ticket})).reason,'ticket-user-mismatch');
  assert.equal((await ctx.api.queueTicket({userId:a,ticket:first.ticket})).status,'queued');
  assert.equal((await ctx.api.queueTicket({userId:a,ticket:first.ticket})).reason,'duplicate-active-user');
  assert.equal(ctx.api.issueTicket('bad id').reason,'invalid-user');
  const expired=ctx.api.issueTicket(c);ctx.setTime(expired.expiresAt);
  assert.equal((await ctx.api.queueTicket({userId:c,ticket:expired.ticket})).reason,'ticket-expired');
  ctx.api.close();
});

test('presented-ticket queue derives identity from the ticket record and rejects used, unknown, or expired tickets',async()=>{
  const ctx=service();
  const presented=ctx.api.issueTicket(a);
  assert.equal((await ctx.api.queuePresentedTicket({userId:b,ticket:presented.ticket})).reason,'invalid-ticket');
  const queued=await ctx.api.queuePresentedTicket(presented.ticket);
  assert.deepEqual(queued,{ok:true,status:'queued',userId:a});
  assert.deepEqual(ctx.api.getState().queued,[a]);
  assert.equal((await ctx.api.queuePresentedTicket(presented.ticket)).reason,'ticket-used-or-unknown');
  assert.equal((await ctx.api.queuePresentedTicket('a'.repeat(64))).reason,'ticket-used-or-unknown');
  const second=ctx.api.issueTicket(b);
  const matched=await ctx.api.queuePresentedTicket(second.ticket);
  assert.equal(matched.ok,true);assert.equal(matched.userId,b);assert.match(matched.matchId,/^[a-f0-9]{32}$/);
  assert.deepEqual(matched.participants,[a,b]);
  assert.deepEqual(matched.seats,[{userId:a,side:0},{userId:b,side:1}]);

  const expired=ctx.api.issueTicket(c);ctx.setTime(expired.expiresAt);
  assert.equal((await ctx.api.queuePresentedTicket(expired.ticket)).reason,'ticket-expired');
  assert.deepEqual(ctx.api.getState().queued,[]);
  ctx.api.close();
});

test('presented-ticket onAccepted callback runs synchronously before queue insertion and pairing snapshots',async()=>{
  const events=[];let matchmaking;
  matchmaking=createOnlineMatchmaking({createEngine:async()=>{events.push('engine');return makeEngine();},
    sendSnapshot:()=>{events.push('snapshot');return true;},now:()=>10_000,autoTick:false});
  const first=matchmaking.issueTicket(a),second=matchmaking.issueTicket(b);
  await matchmaking.queuePresentedTicket(first.ticket,{onAccepted:userId=>{
    assert.equal(userId,a);assert.deepEqual(matchmaking.getState().queued,[]);events.push('accepted-a');
  }});
  assert.deepEqual(matchmaking.getState().queued,[a]);
  const matched=await matchmaking.queuePresentedTicket(second.ticket,{onAccepted:userId=>{
    assert.equal(userId,b);events.push('accepted-b');
  }});
  assert.equal(matched.userId,b);
  assert.deepEqual(events.slice(0,4),['accepted-a','accepted-b','engine','snapshot']);
  assert.equal((await matchmaking.queuePresentedTicket('b'.repeat(64),{onAccepted:'not a function'})).reason,'ticket-used-or-unknown');
  matchmaking.close();
});

test('two distinct ticketed users get an opaque match; third/duplicate users cannot join it',async()=>{
  const ctx=service();const result=await pair(ctx);
  assert.equal(result.matched.ok,true);assert.equal(result.matched.status,'matched');
  assert.match(result.matched.matchId,/^[a-f0-9]{32}$/);assert.deepEqual(result.matched.participants,[a,b]);
  assert.equal(ctx.api.issueTicket(a).reason,'duplicate-active-user');
  const issued=ctx.api.issueTicket(c);assert.ok(issued.ok);
  assert.equal((await ctx.api.queueTicket({userId:c,ticket:issued.ticket})).status,'queued');
  assert.deepEqual(ctx.api.getState().queued,[c]);
  ctx.api.close();
});

test('only ticket-bound participant inputs and valid monotonically increasing sequences reach their own side',async()=>{
  const ctx=service();const {matched}=await pair(ctx);const {matchId}=matched;
  const axis={x:-1,y:.5,buttons:{pass:true,shoot:false,dribble:false,jump:false}};
  assert.equal(ctx.api.submitInput({userId:c,matchId,sequence:1,input:axis}).reason,'match-not-active');
  assert.equal(ctx.api.submitInput({userId:a,matchId,sequence:1,input:axis}).accepted,true);
  assert.equal(ctx.api.submitInput({userId:a,matchId,sequence:1,input:input()}).reason,'invalid-sequence');
  assert.equal(ctx.api.submitInput({userId:b,matchId,sequence:1,input:{...input(),score:[99,0]}}).reason,'invalid-input');
  assert.equal(ctx.api.submitInput({userId:b,matchId,sequence:1,input:input(1)}).accepted,true);
  assert.equal((await ctx.api.tick(matchId)).advanced,true);
  assert.equal(ctx.engines[0].lastInputs[0].x,-1);assert.equal(ctx.engines[0].lastInputs[1].x,1);
  assert.equal(ctx.engines[0].lastInputs[0].buttons.pass,true);
  ctx.api.close();
});

test('fixed tick advances 1/30 second and fans out immutable validated snapshots with bounded retry buffer',async()=>{
  let failA=true;const ctx=service({sendSnapshot:(userId)=>userId===a&&failA?(failA=false,false):true});
  const {matched}=await pair(ctx);const {matchId}=matched;
  // Initial snapshot for A is retained after its send callback declines it.
  const aInitial=ctx.api.getState().active[0].buffered[a];assert.equal(aInitial,1);
  assert.equal((await ctx.api.tick(matchId)).advanced,true);
  assert.equal(ctx.engines[0].snapshot.clock,30-1/30);
  assert.ok(ctx.sent.some(row=>row.userId===a&&row.envelope.tick===0));
  assert.ok(ctx.sent.some(row=>row.userId===a&&row.envelope.tick===1));
  const envelope=ctx.sent.find(row=>row.envelope.tick===1).envelope;
  assert.equal(Object.isFrozen(envelope),true);assert.equal(Object.isFrozen(envelope.snapshot.score),true);
  assert.equal(ctx.sent.find(row=>row.userId===a&&row.envelope.tick===1).metadata.side,0);
  assert.equal(ctx.sent.find(row=>row.userId===b&&row.envelope.tick===1).metadata.side,1);
  ctx.api.close();
});

test('renderer-ready ball shot visuals and every hazard type survive strict snapshot validation',async()=>{
  const ctx=service({onStep(engine){
    engine.state={...engine.state,ball:{...engine.state.ball,x:.72,y:.31,height:.44,velocity:{x:.4,y:-.2,height:.3},
      shot:{id:'pineapple',behavior:'homing',color:'#ff9a36',trail:'#ffe06a',underground:false,level:3,phase:.6,transformSeconds:1.4,age:.8}},
      hazards:{magic:[{kind:'banana',team:0,x:.2,y:.3,life:2.4,arm:.1},{kind:'ice',team:1,x:.8,y:.7,life:1.7,arm:0}],
        walls:[{id:'fireWall',team:0,x:.25,y:.5,halfLength:.2,thickness:.01,height:.4,duration:4,arm:.2,color:'#ff8844'}],
        nova:{team:1,x:.6,y:.6,radius:.2,remaining:.3,telegraph:.8},
        tornado:{x:.4,y:.45,life:2,totalLife:4,radius:.15},
        lightning:{phase:'warning',x:.3,y:.4,radius:.1,remaining:.2,duration:.6},weather:'Storm'}};
  }});
  const {matched}=await pair(ctx);const {matchId}=matched;await ctx.api.tick(matchId);
  const delivered=ctx.sent.find(row=>row.envelope.tick===1)?.envelope.snapshot;
  assert.ok(delivered);assert.equal(delivered.ball.shot.id,'pineapple');assert.equal(delivered.ball.shot.behavior,'homing');
  assert.equal(delivered.ball.x,.72);assert.equal(delivered.ball.height,.44);
  assert.deepEqual(delivered.hazards.magic.map(row=>row.kind),['banana','ice']);
  assert.equal(delivered.hazards.walls[0].id,'fireWall');assert.equal(delivered.hazards.nova.team,1);
  assert.ok(delivered.hazards.tornado);assert.equal(delivered.hazards.lightning.phase,'warning');
  assert.equal(delivered.hazards.weather,'Storm');
  assert.ok(Buffer.byteLength(JSON.stringify(delivered),'utf8')<=8192);
  ctx.api.close();
});

test('unexpected PVP disconnect pauses during grace then requeues the survivor without settlement',async()=>{
  const ctx=service({config:{disconnectGraceMs:5000}});const {matched}=await pair(ctx);const {matchId}=matched;
  assert.equal(ctx.api.disconnect({userId:a,matchId}).reason,'reconnect-pending');
  assert.equal((await ctx.api.tick(matchId)).reason,'reconnect-pending');
  assert.deepEqual(ctx.api.getState().queued,[]);
  ctx.setTime(15_000);assert.equal((await ctx.api.tick(matchId)).reason,'reconnect-timeout');
  assert.deepEqual(ctx.api.getState().queued,[b]);
  assert.equal(ctx.requeued.length,1);assert.equal(ctx.requeued[0].userId,b);
  assert.equal(ctx.api.disconnect({userId:b,matchId}).reason,'requeue-cancelled');
  assert.deepEqual(ctx.api.getState().queued,[]);
  ctx.api.close();
});

test('PVP recovery ticket reattaches the same authenticated side at the same paused snapshot and resumes input',async()=>{
  const finished=[];const ctx=service({config:{disconnectGraceMs:5000},onMatchFinished:async result=>{finished.push(result);return {matchId:result.matchId};}});
  const {matched}=await pair(ctx);const {matchId}=matched;await ctx.api.tick(matchId);
  const before=ctx.engines[0].snapshot,sessionTick=ctx.api.getState().active[0].tick;
  assert.equal(ctx.api.disconnect({userId:a,matchId}).reason,'reconnect-pending');
  assert.equal((await ctx.api.tick(matchId)).advanced,false);
  const issued=ctx.api.issueResumeTicket(a);assert.equal(issued.ok,true);assert.ok(issued.expiresAt<=15_000);
  assert.equal(ctx.api.issueTicket(a).reason,'duplicate-active-user');
  const accepted=[];const resumed=await ctx.api.queuePresentedTicket(issued.ticket,{onAccepted:userId=>accepted.push(userId)});
  assert.equal(resumed.status,'matched');assert.equal(resumed.resumed,true);assert.equal(resumed.matchId,matchId);
  assert.equal(resumed.seats.find(row=>row.userId===a).side,0);assert.deepEqual(accepted,[a]);
  assert.equal(resumed.resumeSnapshot.tick,sessionTick);assert.deepEqual(resumed.resumeSnapshot.snapshot,before);
  assert.deepEqual(finished,[]);
  assert.equal((await ctx.api.queuePresentedTicket(issued.ticket)).reason,'ticket-used-or-unknown');
  assert.equal(ctx.api.submitInput({userId:a,matchId,sequence:1,input:input(.5)}).accepted,true);
  assert.equal((await ctx.api.tick(matchId)).advanced,true);assert.deepEqual(ctx.engines[0].lastInputs[0].x,.5);
  assert.deepEqual(finished,[]);ctx.api.close();
});

test('resume tickets are account-bound, replaceable, short-lived, and unavailable after grace',async()=>{
  const ctx=service({config:{disconnectGraceMs:5000}});const {matched}=await pair(ctx);const {matchId}=matched;
  ctx.api.disconnect({userId:a,matchId});
  assert.equal(ctx.api.issueResumeTicket(b).reason,'resume-unavailable');
  const first=ctx.api.issueResumeTicket(a),second=ctx.api.issueResumeTicket(a);
  assert.notEqual(first.ticket,second.ticket);
  assert.equal((await ctx.api.queueTicket({userId:a,ticket:first.ticket})).reason,'duplicate-active-user');
  ctx.setTime(15_000);assert.equal(ctx.api.issueResumeTicket(a).reason,'resume-unavailable');
  assert.equal((await ctx.api.tick(matchId)).reason,'reconnect-timeout');ctx.api.close();
});

test('intentional leave bypasses reconnect grace and never settles a quick match',async()=>{
  const finished=[];const ctx=service({onMatchFinished:async result=>{finished.push(result);return {matchId:result.matchId};}});
  const {matched}=await pair(ctx);assert.equal(ctx.api.disconnect({userId:a,matchId:matched.matchId,leave:true}).reason,'match-stopped');
  assert.deepEqual(ctx.api.getState().queued,[b]);assert.deepEqual(finished,[]);ctx.api.close();
});

test('halftime pause auto-resumes on the next fixed tick and terminal state closes the match',async()=>{
  const ctx=service({onStep(engine){if(engine.state.tick===0)engine.state={...engine.state,matchState:'paused',half:2,clock:0};}});
  const {matched}=await pair(ctx);const {matchId}=matched;
  assert.equal((await ctx.api.tick(matchId)).advanced,true);
  assert.equal(ctx.engines[0].snapshot.matchState,'paused');
  assert.equal((await ctx.api.tick(matchId)).advanced,true);
  assert.equal(ctx.engines[0].resumes,1);assert.equal(ctx.engines[0].snapshot.matchState,'play');
  ctx.engines[0].step=function(dt,streams){this.lastInputs=streams;this.state={...this.state,tick:this.state.tick+1,phase:'finished',matchState:'finished',terminal:true};return {accepted:true,snapshot:this.state};};
  const terminal=await ctx.api.tick(matchId);assert.equal(terminal.closed,true);
  assert.deepEqual(ctx.api.getState().active,[]);
  assert.equal((await ctx.api.tick(matchId)).reason,'finished');
  ctx.api.close();
});

test('terminal result is derived from ticketed seats and authoritative snapshot, then retried before match cleanup',async()=>{
  let attempts=0,currentTime=10_000;const results=[],finished=[];
  const api=createOnlineMatchmaking({createEngine:async()=>makeEngine({onStep(engine){
      engine.state={...engine.state,half:2,phase:'finished',matchState:'finished',terminal:true};
    }}),
    onMatchFinished:async result=>{attempts++;results.push(result);if(attempts===1)throw Error('temporary database outage');return {matchId:result.matchId,duplicate:attempts>1};},
    onMatchPersisted:result=>finished.push(result.matchId),now:()=>currentTime,autoTick:false});
  const ticketA=api.issueTicket(a),ticketB=api.issueTicket(b);
  await api.queueTicket({userId:a,ticket:ticketA.ticket});
  const paired=await api.queueTicket({userId:b,ticket:ticketB.ticket});
  const first=await api.tick(paired.matchId);
  assert.equal(first.reason,'result-persistence-pending');assert.equal(first.closed,false);
  assert.equal(api.getState().active[0].status,'persisting');
  assert.deepEqual(finished,[],'clients must not receive durable-finish acknowledgement before persistence succeeds');
  assert.equal(api.issueTicket(a).reason,'duplicate-active-user');
  currentTime+=250;
  const retry=await api.tick(paired.matchId);
  assert.equal(retry.reason,'finished');assert.equal(retry.closed,true);
  assert.equal(attempts,2);assert.equal(results[0].matchId,paired.matchId);assert.deepEqual(finished,[paired.matchId]);
  assert.deepEqual(results[0].participants,[{userId:a,side:0},{userId:b,side:1}]);
  assert.deepEqual(results[0].teamIds,['team_home','team_away']);assert.deepEqual(results[0].score,[0,0]);
  assert.equal(results[0].tick,1);assert.equal(results[0].clock,30-1/30);
  assert.deepEqual(api.getState().active,[]);
  assert.equal((await api.tick(paired.matchId)).reason,'finished');
  api.close();
});

test('invalid snapshots are never sent and queue cancellation reports the actual outcome',async()=>{
  const ctx=service({onStep(engine){engine.state={...engine.state,clock:NaN};}});
  const {matched}=await pair(ctx);const {matchId}=matched;const before=ctx.sent.length;
  assert.equal((await ctx.api.tick(matchId)).advanced,true);assert.equal(ctx.sent.length,before);
  assert.equal(ctx.api.cancelQueue(c).reason,'not-queued');
  assert.equal(ctx.api.disconnect({userId:a,matchId}).ok,true);
  assert.equal(ctx.api.cancelQueue(b).reason,'not-queued');
  ctx.api.close();
});

test('strict snapshot validator rejects malformed, out-of-range, duplicate, and excessive payload data',async()=>{
  const mutations=[
    state=>({...state,ball:{...state.ball,x:1.001}}),
    state=>({...state,players:state.players.map((player,index)=>index===7?{...player,position:{...player.position,y:-.01}}:player)}),
    state=>({...state,players:[...state.players,{...state.players[0]}]}),
    state=>({...state,hazards:{...state.hazards,magic:Array.from({length:25},(_,i)=>({kind:'banana',team:i%2,x:.2,y:.2,life:2,arm:0}))}}),
    state=>({...state,ball:{...state.ball,shot:{id:'odd',behavior:'normal',color:'red',trail:'#fff',underground:false,level:1,phase:0,transformSeconds:1,age:0}}}),
    state=>({...state,unbounded:'x'.repeat(9000)})
  ];
  for(const mutate of mutations){
    const ctx=service({onStep(engine){engine.state=mutate(engine.state);}});const {matched}=await pair(ctx);const before=ctx.sent.length;
    assert.equal((await ctx.api.tick(matched.matchId)).advanced,true);
    assert.equal(ctx.sent.length,before,'invalid authoritative snapshots are not sent');
    assert.equal(Object.values(ctx.api.getState().active[0].buffered).every(count=>count===0),true);
    ctx.api.close();
  }
});

test('failed session initialization releases reservations and returns both users to the queue',async()=>{
  const failing=createOnlineMatchmaking({createEngine:async()=>({snapshot:{tick:0,matchState:'play',half:9,clock:0,score:[0,0],players:[]},step(){return {accepted:true};}}),
    now:()=>10_000,autoTick:false});
  const t1=failing.issueTicket(a),t2=failing.issueTicket(b);
  await failing.queueTicket({userId:a,ticket:t1.ticket});
  const result=await failing.queueTicket({userId:b,ticket:t2.ticket});
  assert.equal(result.reason,'engine-unavailable');assert.deepEqual(failing.getState().queued,[b,a]);
  assert.deepEqual(failing.getState().active,[]);
  assert.equal(failing.issueTicket(a).reason,'duplicate-active-user');
  assert.equal(failing.cancelQueue(a).reason,'cancelled');
  assert.equal(failing.cancelQueue(b).reason,'cancelled');
  failing.close();
});

test('service shutdown during asynchronous engine construction cannot resurrect a match',async()=>{
  let releaseEngine;
  const pending=new Promise(resolve=>{releaseEngine=resolve;});
  const matchmaking=createOnlineMatchmaking({createEngine:()=>pending,now:()=>10_000,autoTick:false});
  const t1=matchmaking.issueTicket(a),t2=matchmaking.issueTicket(b);
  await matchmaking.queueTicket({userId:a,ticket:t1.ticket});
  const pairing=matchmaking.queueTicket({userId:b,ticket:t2.ticket});
  matchmaking.close();releaseEngine(makeEngine());
  const result=await pairing;
  assert.equal(result.reason,'engine-unavailable');assert.equal(matchmaking.getState().closed,true);
  assert.deepEqual(matchmaking.getState().queued,[]);assert.deepEqual(matchmaking.getState().active,[]);
});
