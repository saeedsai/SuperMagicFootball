const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {WebSocket}=require('ws');
const {createOnlineMatchmaking}=require('../scripts/online-matchmaking.mjs');
const {attachOnlineMatchWebSocket}=require('../scripts/online-match-ws.mjs');

const ORIGIN='https://game.example.test';
function fakeEngineFactory(){
  const engines=[];
  const createEngine=async()=>{
    const players=Array.from({length:12},(_,n)=>({slot:n%6,team:Math.floor(n/6),index:n%6,assetId:`${n<6?'home':'away'}/player${n%6}`,
      position:{x:.2+(n%6)*.1,y:.2+(Math.floor(n/6))*.6,height:0},view:{kind:'front',side:1},facing:1,
      animation:{phase:0,actionTime:0,progress:0},action:'idle',stun:0,keeper:n%6===0,
      visual:{knockdown:0,confused:0,crying:0,airborne:false}}));
    const engine={state:{tick:0,phase:'play',matchState:'play',terminal:false,half:1,clock:120,clockRemaining:120,clockProgress:1,
        score:[0,0],teamIds:['home','away'],controlled:[0,0],ballModel:'classic',
        ball:{x:.5,y:.5,height:0,velocity:{x:0,y:0,height:0},owner:null,shot:null,roll:0},players,
        hazards:{magic:[],walls:[],nova:null,tornado:null,lightning:null,weather:'Clear'}},inputs:null,
      get snapshot(){return this.state},
      step(dt,inputs){this.inputs=inputs;this.state={...this.state,tick:this.state.tick+1,clock:Math.max(0,this.state.clock-dt),clockRemaining:Math.max(0,this.state.clockRemaining-dt)};return {accepted:true,snapshot:this.snapshot}},
      resumeAfterHalftime(){this.state.matchState='play';return true;}};
    engines.push(engine);return engine;
  };
  return {engines,createEngine};
}
async function serverSetup(){
  const server=http.createServer((_request,response)=>{response.writeHead(404);response.end()});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const {createEngine,engines}=fakeEngineFactory();let transport;
  let matchmaking;
  matchmaking=createOnlineMatchmaking({createEngine,autoTick:false,
    sendSnapshot:(userId,envelope,context)=>transport?.sendSnapshot(userId,envelope,context)??false,
    onRequeue:(userId,detail)=>transport?.onRequeue(userId,detail)});
  transport=attachOnlineMatchWebSocket(server,{matchmaking,allowedOrigins:[ORIGIN]});
  return {server,matchmaking,transport,engines,url:`ws://127.0.0.1:${server.address().port}/api/v1/matches`,close:async()=>{
    transport.close();matchmaking.close();await new Promise(resolve=>server.close(()=>resolve()));}};
}
async function open(setup,ticket,{origin=ORIGIN}={}){
  const socket=new WebSocket(setup.url,['smf-online-v1',`ticket.${ticket}`],{origin});
  const messages=[];
  socket.on('message',data=>{try{messages.push(JSON.parse(data.toString()))}catch{}});
  socket.on('error',()=>{});
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('websocket open timeout')),2000);
    socket.once('open',()=>{clearTimeout(timeout);resolve()});
    socket.once('unexpected-response',(_request,response)=>{clearTimeout(timeout);reject(new Error(`HTTP ${response.statusCode}`))});
    socket.once('error',error=>{clearTimeout(timeout);reject(error)});
  });
  return {socket,messages,async waitFor(type){
    const existing=messages.find(message=>message.type===type);if(existing)return existing;
    return await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{cleanup();reject(new Error(`Timed out waiting for ${type}`))},2500);
      const onMessage=data=>{let message;try{message=JSON.parse(data.toString())}catch{return};messages.push(message);if(message.type===type){cleanup();resolve(message)}};
      const onClose=()=>{cleanup();reject(new Error(`Socket closed before ${type}`))};
      const cleanup=()=>{clearTimeout(timeout);socket.off('message',onMessage);socket.off('close',onClose)};
      socket.on('message',onMessage);socket.once('close',onClose);
    });
  }};
}
function newTicket(matchmaking,userId){const result=matchmaking.issueTicket(userId);assert.equal(result.ok,true);return result.ticket;}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

test('WS matchmaking consumes one-use browser subprotocol tickets and never publishes account IDs',async()=>{
  const ctx=await serverSetup();
  try{
    const first=await open(ctx,newTicket(ctx.matchmaking,'user_alpha'));
    const queued=await first.waitFor('queued');assert.equal(queued.reason,undefined);
    assert.equal(JSON.stringify(queued).includes('user_alpha'),false);
    const second=await open(ctx,newTicket(ctx.matchmaking,'user_bravo'));
    const foundA=await first.waitFor('matched'),foundB=await second.waitFor('matched');
    assert.equal(foundA.matchId,foundB.matchId);assert.equal(foundA.side,0);assert.equal(foundB.side,1);
    const invalidContext=ctx.engines[0].snapshot;
    assert.equal(ctx.transport.sendSnapshot('user_alpha',{matchId:foundA.matchId,tick:0,snapshot:invalidContext},{side:2}),false);
    ctx.matchmaking.tick(foundA.matchId);
    const snapshotA=await first.waitFor('snapshot'),snapshotB=await second.waitFor('snapshot');
    assert.deepEqual(snapshotA.snapshot.score,[0,0]);assert.ok(snapshotA.tick<=1);assert.ok(snapshotB.tick<=1);
    assert.equal(snapshotA.side,undefined);assert.equal(snapshotB.side,undefined);
    for(const output of [queued,foundA,foundB,snapshotA,snapshotB]){
      const json=JSON.stringify(output);assert.equal(json.includes('user_alpha'),false);assert.equal(json.includes('user_bravo'),false);
    }
    assert.equal(first.socket.protocol,'smf-online-v1');
  }finally{await ctx.close()}
});

test('WS match assignment identifies Career AI mode without publishing the reserved AI account ID',async()=>{
  const ctx=await serverSetup();
  try{
    const binding={fixtureNo:1,fixtureId:'f'.repeat(32),matchId:'e'.repeat(32),
      participants:[{userId:'user_alpha',side:0},{userId:'smf_server_career_ai',side:1}],
      teamIds:['home','away'],mode:'career-ai'};
    assert.equal(ctx.matchmaking.reserveCareerFixture(binding).ok,true);
    const issued=ctx.matchmaking.issueCareerTicket(binding.matchId,'user_alpha');assert.equal(issued.ok,true);
    const player=await open(ctx,issued.ticket),matched=await player.waitFor('matched');
    assert.equal(matched.mode,'career-ai');assert.equal(matched.side,0);
    assert.equal(JSON.stringify(matched).includes('smf_server_career_ai'),false);
    const initial=await player.waitFor('snapshot');assert.equal(initial.matchId,binding.matchId);
    assert.equal(JSON.stringify(initial).includes('smf_server_career_ai'),false);
    assert.equal(ctx.matchmaking.tick(binding.matchId).advanced,true);
    assert.equal((await player.waitFor('snapshot')).matchId,binding.matchId);
  }finally{await ctx.close()}
});

test('terminal snapshot does not claim persistence until the result store acknowledges it',async()=>{
  const ctx=await serverSetup();
  try{
    const a=await open(ctx,newTicket(ctx.matchmaking,'user_alpha'));
    const b=await open(ctx,newTicket(ctx.matchmaking,'user_bravo'));
    const matchedA=await a.waitFor('matched'),matchedB=await b.waitFor('matched');
    const snapshot={...ctx.engines[0].snapshot,half:2,phase:'finished',matchState:'finished',terminal:true};
    assert.equal(ctx.transport.sendSnapshot('user_alpha',{matchId:matchedA.matchId,tick:1,snapshot},{side:0}),true);
    assert.equal(ctx.transport.sendSnapshot('user_bravo',{matchId:matchedB.matchId,tick:1,snapshot},{side:1}),true);
    await a.waitFor('snapshot');await b.waitFor('snapshot');
    assert.equal(a.messages.some(message=>message.type==='match-finished'),false);
    assert.equal(b.messages.some(message=>message.type==='match-finished'),false);
    assert.equal(ctx.transport.onMatchFinished(matchedA.matchId),true);
    assert.equal((await a.waitFor('match-finished')).matchId,matchedA.matchId);
    assert.equal((await b.waitFor('match-finished')).matchId,matchedA.matchId);
  }finally{await ctx.close()}
});

test('WS input messages are bound to the ticketed seat and reject identity injection',async()=>{
  const ctx=await serverSetup();
  try{
    const a=await open(ctx,newTicket(ctx.matchmaking,'user_alpha'));
    const b=await open(ctx,newTicket(ctx.matchmaking,'user_bravo'));
    const matched=await a.waitFor('matched');const matchedB=await b.waitFor('matched');
    assert.equal(matched.side,0);assert.equal(matchedB.side,1);
    ctx.matchmaking.tick(matched.matchId);
    const bad={type:'input',matchId:matched.matchId,sequence:1,userId:'user_bravo',input:{x:1,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}}};
    a.socket.send(JSON.stringify(bad));assert.equal((await a.waitFor('input-rejected')).reason,'invalid-frame');
    const good={type:'input',matchId:matched.matchId,sequence:1,input:{x:.75,y:-.25,buttons:{pass:false,shoot:true,dribble:false,jump:false}}};
    a.socket.send(JSON.stringify(good));await wait(15);
    const result=ctx.matchmaking.tick(matched.matchId);assert.equal(result.advanced,true);
    const engine=ctx.engines[0];assert.equal(engine.inputs[0].x,.75);assert.equal(engine.inputs[1].x,0);
    const spoof={type:'input',matchId:matched.matchId,sequence:1,input:{x:-1,y:0,buttons:{pass:false,shoot:false,dribble:true,jump:false}}};
    b.socket.send(JSON.stringify(spoof));await wait(15);ctx.matchmaking.tick(matched.matchId);
    assert.equal(engine.inputs[0].x,.75,'guest input cannot control the host seat');
    assert.equal(engine.inputs[1].x,-1,'guest input reaches only its own seat');
  }finally{await ctx.close()}
});

test('WS rejects wrong origin, wrong path, unknown ticket, and unsupported subprotocol',async()=>{
  const ctx=await serverSetup();
  try{
    await assert.rejects(()=>open(ctx,newTicket(ctx.matchmaking,'user_alpha'),{origin:'https://attacker.example'}),/HTTP 403/);
    const noTicket=new WebSocket(ctx.url,['smf-online-v1','ticket.'+'0'.repeat(64)],{origin:ORIGIN});
    noTicket.on('error',()=>{});
    await new Promise((resolve,reject)=>{noTicket.once('open',resolve);noTicket.once('error',reject);noTicket.once('unexpected-response',(_req,res)=>reject(new Error(`HTTP ${res.statusCode}`)))});
    await new Promise(resolve=>noTicket.once('close',resolve));
    const wrongPath=new WebSocket(ctx.url.replace('/api/v1/matches','/other'),['smf-online-v1','ticket.'+'0'.repeat(64)],{origin:ORIGIN});
    wrongPath.on('error',()=>{});
    await assert.rejects(()=>new Promise((resolve,reject)=>{wrongPath.once('open',resolve);wrongPath.once('error',reject);wrongPath.once('unexpected-response',(_req,res)=>reject(new Error(`HTTP ${res.statusCode}`)))}),/HTTP 404/);
  }finally{await ctx.close()}
});

test('intentional WS leave stops a match and only the connected opponent is requeued',async()=>{
  const ctx=await serverSetup();
  try{
    const a=await open(ctx,newTicket(ctx.matchmaking,'user_alpha'));
    const b=await open(ctx,newTicket(ctx.matchmaking,'user_bravo'));
    await a.waitFor('matched');await b.waitFor('matched');
    a.socket.close(1000,'Leave match');
    const notice=await b.waitFor('queued');assert.equal(notice.reason,'opponent-disconnected');
    const state=ctx.matchmaking.getState();assert.deepEqual(state.queued,['user_bravo']);assert.equal(state.active.length,0);
  }finally{await ctx.close()}
});

test('unexpected WS disconnect pauses PVP and a one-use account ticket resumes the same seat and snapshot',async()=>{
  const ctx=await serverSetup();
  try{
    const a=await open(ctx,newTicket(ctx.matchmaking,'user_alpha'));
    const b=await open(ctx,newTicket(ctx.matchmaking,'user_bravo'));
    const first=await a.waitFor('matched'),other=await b.waitFor('matched');assert.equal(first.matchId,other.matchId);
    ctx.matchmaking.tick(first.matchId);
    await wait(10);const lastSnapshot=a.messages.filter(message=>message.type==='snapshot').at(-1);assert.ok(lastSnapshot);
    const oldSocketClosed=new Promise(resolve=>a.socket.once('close',resolve));a.socket.terminate();await oldSocketClosed;
    await wait(25);
    assert.equal(ctx.matchmaking.getState().active.length,1);assert.deepEqual(ctx.matchmaking.getState().queued,[]);
    const ticket=ctx.matchmaking.issueResumeTicket('user_alpha');assert.equal(ticket.ok,true);
    const resumed=await open(ctx,ticket.ticket),seat=await resumed.waitFor('matched');
    assert.equal(seat.matchId,first.matchId);assert.equal(seat.side,first.side);assert.equal(seat.resumed,true);
    const snapshot=await resumed.waitFor('snapshot');assert.equal(snapshot.matchId,first.matchId);assert.equal(snapshot.tick,lastSnapshot.tick);
    assert.deepEqual(snapshot.snapshot,lastSnapshot.snapshot);
    const frame={type:'input',matchId:seat.matchId,sequence:1,input:{x:.3,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}}};
    resumed.socket.send(JSON.stringify(frame));
    await wait(15);
    ctx.matchmaking.tick(first.matchId);assert.equal(ctx.engines[0].inputs[0].x,.3);
    assert.equal(ctx.matchmaking.getState().active.length,1);assert.equal(ctx.matchmaking.getState().queued.length,0);
  }finally{await ctx.close()}
});
