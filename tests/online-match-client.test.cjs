const test=require('node:test');
const assert=require('node:assert/strict');

class FakeSocket{
 static OPEN=1;
 static instances=[];
 constructor(url,protocols){this.url=url;this.protocols=protocols;this.readyState=0;this.bufferedAmount=0;this.listeners=new Map();this.sent=[];FakeSocket.instances.push(this);queueMicrotask(()=>{this.readyState=1;this.emit('open',{})})}
 addEventListener(type,handler){const rows=this.listeners.get(type)||[];rows.push(handler);this.listeners.set(type,rows)}
 emit(type,event){for(const handler of this.listeners.get(type)||[])handler(event)}
 send(value){if(this.readyState!==1)throw Error('closed');this.sent.push(value)}
 close(){this.readyState=3;this.emit('close',{})}
}
const id='a'.repeat(32),ticket='b'.repeat(64),exp=()=>new Date(Date.now()+60000).toISOString();
async function setup(overrides={}){
 const {createOnlineMatchClient}=await import('../src/modules/online-match-client.js');
 FakeSocket.instances=[];const events={status:[],snapshot:[],errors:[]};
 const client=createOnlineMatchClient({apiBase:'https://api.example.test',requestTicket:async()=>({ticket,expiresAt:exp()}),WebSocketImpl:FakeSocket,
  onStatus:value=>events.status.push(value),onSnapshot:value=>events.snapshot.push(value),onError:error=>events.errors.push(error),...overrides});
 return {client,events};
}
function state(tick=0){return {tick,phase:'play',matchState:'play',terminal:false,half:1,clock:0,clockRemaining:120,clockProgress:0,score:[0,0],teamIds:['japan','brazil'],controlled:[3,3],ballModel:'classic',
 ball:{x:.5,y:.5,height:0,velocity:{x:0,y:0,height:0},owner:null,shot:null,roll:0},
 players:Array.from({length:12},(_,index)=>{const team=index<6?0:1,slot=index%6;return {slot,team,index:slot,assetId:`${team===0?'japan':'brazil'}/test_${team}_${slot}`,position:{x:.5,y:.5,height:0},view:{kind:'side',side:1},facing:1,animation:{phase:0,actionTime:0,progress:0},action:'idle',stun:0,keeper:slot===0,visual:{knockdown:0,confused:0,crying:0,airborne:false}}}),
 hazards:{magic:[],walls:[],nova:null,tornado:null,lightning:null,weather:'Clear'}}}
function message(socket,value){socket.emit('message',{data:JSON.stringify(value)})}

test('online match client requests an ephemeral ticket, connects over WSS and accepts server snapshots',async()=>{
 const {client,events}=await setup();await client.connect();
 const socket=FakeSocket.instances[0];assert.equal(socket.url,'wss://api.example.test/api/v1/matches');
 assert.deepEqual(socket.protocols,['smf-online-v1',`ticket.${ticket}`]);
 message(socket,{type:'queued'});message(socket,{type:'matched',matchId:id,side:0});
 message(socket,{type:'snapshot',matchId:id,tick:0,snapshot:state()});
 assert.equal(client.matchId,id);assert.equal(client.side,0);assert.equal(events.status[0].state,'connecting');
 assert.equal(events.status[1].state,'queued');assert.equal(events.status[2].state,'matched');
 assert.deepEqual(events.snapshot[0].snapshot.score,[0,0]);assert.equal(events.errors.length,0);
});

test('online match client carries the server-authoritative Career AI mode without exposing the AI account ID',async()=>{
 const {client,events}=await setup();await client.connect();const socket=FakeSocket.instances[0];
 message(socket,{type:'matched',matchId:id,side:0,mode:'career-ai'});
 assert.equal(events.status.at(-1).mode,'career-ai');
 assert.equal(JSON.stringify(events.status).includes('smf_server_career_ai'),false);
 message(socket,{type:'matched',matchId:'c'.repeat(32),side:0,mode:'untrusted-mode'});
 assert.equal(events.errors.length,1);
});

test('online match input is strict, sequenced and contains no client identity or result fields',async()=>{
 const {client}=await setup();await client.connect();const socket=FakeSocket.instances[0];message(socket,{type:'matched',matchId:id,side:1});
 assert.equal(client.sendInput(1,{x:.5,y:-.5,buttons:{pass:true,shoot:false,dribble:false,jump:false}}),true);
 const frame=JSON.parse(socket.sent[0]);assert.deepEqual(Object.keys(frame).sort(),['input','matchId','sequence','type']);assert.equal(frame.matchId,id);assert.equal(frame.sequence,1);
 assert.throws(()=>client.sendInput(1,{x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}}),error=>error.code==='invalid-input');
 assert.throws(()=>client.sendInput(2,{x:5,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}}),error=>error.code==='invalid-input');
});

test('online input drops obsolete buffered samples without closing or advancing the wire sequence, then sends the latest four actions after drain',async()=>{
 const {client,events}=await setup();await client.connect();const socket=FakeSocket.instances[0];message(socket,{type:'matched',matchId:id,side:0});
 const input=(buttons)=>({x:.25,y:-.5,buttons:{pass:!!buttons.pass,shoot:!!buttons.shoot,dribble:!!buttons.dribble,jump:!!buttons.jump}});
 assert.equal(client.sendInput(1,input({pass:true})),true);
 socket.bufferedAmount=1025;
 assert.equal(client.sendInput(2,input({shoot:true})),false);
 assert.equal(client.sendInput(3,input({dribble:true,jump:true})),false);
 assert.equal(socket.sent.length,1);assert.equal(client.connected,true);assert.equal(client.matchId,id);assert.equal(events.errors.length,0);
 socket.bufferedAmount=0;
 assert.equal(client.sendInput(4,input({jump:true})),true);
 const resumed=JSON.parse(socket.sent.at(-1));assert.equal(resumed.sequence,2);assert.deepEqual(resumed.input,{x:.25,y:-.5,buttons:{pass:false,shoot:false,dribble:false,jump:true}});
 assert.equal(client.sendInput(5,input({})),true);assert.equal(JSON.parse(socket.sent.at(-1)).sequence,3);
});

test('online match client rejects malformed or cross-match state and never accepts user IDs',async()=>{
 const {client,events}=await setup();await client.connect();const socket=FakeSocket.instances[0];message(socket,{type:'matched',matchId:id,side:0});
 message(socket,{type:'snapshot',matchId:'c'.repeat(32),tick:1,snapshot:state(1)});
 message(socket,{type:'snapshot',matchId:id,tick:1,snapshot:{...state(1),score:[-1,0]}});
 message(socket,{type:'matched',matchId:id,side:2,userId:'private'});
 assert.equal(events.errors.length,3);assert.equal(events.snapshot.length,0);
});

test('online match client rejects invalid tickets, unsupported URLs and failed connections',async()=>{
 const invalid=await setup({requestTicket:async()=>({ticket:'short',expiresAt:exp()})});
 await assert.rejects(()=>invalid.client.connect(),error=>error.code==='ticket-invalid');
 const {createOnlineMatchClient}=await import('../src/modules/online-match-client.js');
 assert.throws(()=>createOnlineMatchClient({apiBase:'https://api.example.test/api/v1',requestTicket:async()=>({}),WebSocketImpl:FakeSocket}),error=>error.code==='not-configured');
 class FailSocket{constructor(){this.readyState=0;this.listeners=new Map();queueMicrotask(()=>this.emit('error',{}))}addEventListener(type,handler){this.listeners.set(type,[...(this.listeners.get(type)||[]),handler])}emit(type,event){for(const handler of this.listeners.get(type)||[])handler(event)}close(){this.readyState=3}}
 const failing=await setup({WebSocketImpl:FailSocket});await assert.rejects(()=>failing.client.connect(),error=>error.code==='connection-failed');
});

test('online match client accepts the server epoch-millisecond ticket expiry contract',async()=>{
 const future=Date.now()+60000;
 const {client}=await setup({requestTicket:async()=>({ticket,expiresAt:future})});
 await client.connect();assert.equal(FakeSocket.instances.length,1);
 const expired=await setup({requestTicket:async()=>({ticket,expiresAt:Date.now()-1})});
 await assert.rejects(()=>expired.client.connect(),error=>error.code==='ticket-invalid');
});

test('online action sampler preserves four-action keyboard, touch, and gamepad state for a server tick',async()=>{
 const {sampleOnlineActionInput}=await import('../src/modules/online-match-client.js');let polls=0;
 const input={state:[{x:.6,y:-.8,pass:1,shoot:0,dribble:1,jump:0}],poll:multiplayer=>{assert.equal(multiplayer,false);polls++;}};
 assert.deepEqual(sampleOnlineActionInput(input),{x:.6,y:-.8,buttons:{pass:true,shoot:false,dribble:true,jump:false}});
 assert.equal(polls,1);assert.throws(()=>sampleOnlineActionInput({}),error=>error.code==='invalid-input');
});

test('browser client accepts the exact snapshot produced by the authoritative match engine',async()=>{
 const {createOnlineGameEngine}=await import('../scripts/online-game-engine.mjs');
 const engine=await createOnlineGameEngine({home:0,away:9,halfSeconds:60,seed:47});
 const {client,events}=await setup();await client.connect();const socket=FakeSocket.instances[0];
 message(socket,{type:'matched',matchId:id,side:1});
 message(socket,{type:'snapshot',matchId:id,tick:engine.snapshot.tick,snapshot:engine.snapshot});
 assert.equal(events.errors.length,0);assert.equal(events.snapshot.length,1);
 assert.equal(events.snapshot[0].snapshot.players.length,12);assert.deepEqual(events.snapshot[0].snapshot.teamIds,['japan','brazil']);
});

test('online match disconnect closes transport and clears local match state',async()=>{
 const {client,events}=await setup();await client.connect();const socket=FakeSocket.instances[0];message(socket,{type:'matched',matchId:id,side:1});
 client.disconnect();assert.equal(socket.readyState,3);assert.equal(client.matchId,null);assert.equal(client.connected,false);
 assert.equal(events.status.at(-1).state,'disconnected');
});

test('unexpected PVP transport loss preserves the exact seat and resumes only from a matching server ticket',async()=>{
 const resumeTicket='d'.repeat(64);let resumeRequests=0;
 const {client,events}=await setup({requestResumeTicket:async()=>{resumeRequests++;return {ticket:resumeTicket,expiresAt:exp()}}});
 await client.connect();const first=FakeSocket.instances[0];message(first,{type:'matched',matchId:id,side:1});
 first.readyState=3;first.emit('close',{});
 assert.equal(client.matchId,id);assert.equal(client.side,1);assert.equal(client.connected,false);assert.equal(events.status.at(-1).state,'disconnected');
 await client.resume();const second=FakeSocket.instances[1];assert.equal(resumeRequests,1);assert.deepEqual(second.protocols,['smf-online-v1',`ticket.${resumeTicket}`]);
 message(second,{type:'matched',matchId:id,side:1,resumed:true});
 assert.equal(events.status.at(-1).state,'resumed');assert.equal(client.matchId,id);assert.equal(client.side,1);
 message(second,{type:'snapshot',matchId:id,tick:7,snapshot:state(7)});assert.equal(events.snapshot.at(-1).tick,7);
 client.sendInput(1,{x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}});assert.equal(JSON.parse(second.sent.at(-1)).sequence,1);
});

test('resume confirmation cannot switch to another match or side',async()=>{
 const {client,events}=await setup({requestResumeTicket:async()=>({ticket:'d'.repeat(64),expiresAt:exp()})});
 await client.connect();const first=FakeSocket.instances[0];message(first,{type:'matched',matchId:id,side:0});
 first.readyState=3;first.emit('close',{});await client.resume();
 message(FakeSocket.instances[1],{type:'matched',matchId:'c'.repeat(32),side:0,resumed:true});
 assert.equal(events.errors.at(-1).code,'invalid-snapshot');assert.equal(client.matchId,id);assert.equal(client.side,0);
});

test('opponent disconnect clears the ended match seat before the surviving client is requeued',async()=>{
 const {client,events}=await setup();await client.connect();const socket=FakeSocket.instances[0];
 message(socket,{type:'matched',matchId:id,side:1});assert.equal(client.matchId,id);assert.equal(client.side,1);
 message(socket,{type:'queued',reason:'opponent-disconnected'});assert.equal(client.matchId,null);assert.equal(client.side,null);
 assert.throws(()=>client.sendInput(1,{x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}}),error=>error.code==='match-ended');
 const next='c'.repeat(32);message(socket,{type:'matched',matchId:next,side:0});assert.equal(client.matchId,next);assert.equal(client.side,0);
 assert.equal(events.status.filter(row=>row.state==='queued').length,1);
});

test('only the active match can deliver durable-finish status to a client',async()=>{
 const {client,events}=await setup();await client.connect();const socket=FakeSocket.instances[0];message(socket,{type:'matched',matchId:id,side:1});
 message(socket,{type:'match-finished',matchId:'c'.repeat(32)});
 assert.equal(events.errors.length,1);assert.equal(client.matchId,id);assert.equal(events.status.some(row=>row.state==='finished'),false);
 message(socket,{type:'match-finished',matchId:id});
 assert.equal(events.status.at(-1).state,'finished');assert.equal(client.matchId,null);assert.equal(client.side,null);
});
