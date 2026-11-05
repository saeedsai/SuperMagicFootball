const {test,before}=require('node:test');
const assert=require('node:assert/strict');

let createOnlineMatchmaking;
before(async()=>({createOnlineMatchmaking}=await import('../scripts/online-matchmaking.mjs')));
const participants=['player_alpha','player_bravo'],teamIds=['team_home','team_away'];
const input={x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}};
const config={home:0,away:9,teamIds,rosterAssetIds:[Array.from({length:12},(_,i)=>`team_home/player_${i}`),Array.from({length:12},(_,i)=>`team_away/player_${i}`)],halfSeconds:120,seed:17,mode:'quick',humans:2};
function checkpoint(tick=4){return {format:'smf-online-game-engine-checkpoint',schemaVersion:1,engineBuild:'0.12.81.55',config,configSha256:'test',state:{tick}};}
function engine(){
 let state={tick:0,phase:'play',matchState:'play',terminal:false,half:1,clock:30,clockRemaining:30,clockProgress:.5,score:[0,0],teamIds:teamIds.slice(),controlled:[0,0],ballModel:'classic',ball:{x:.5,y:.5,height:0,velocity:{x:0,y:0,height:0},owner:null,shot:null,roll:0},players:Array.from({length:12},(_,ordinal)=>({slot:ordinal%6,team:ordinal<6?0:1,index:ordinal%6,assetId:`${teamIds[ordinal<6?0:1]}/test_${ordinal}`,position:{x:ordinal<6?.25:.75,y:.5,height:0},view:{kind:'side',side:ordinal<6?1:-1},facing:ordinal<6?1:-1,animation:{phase:0,actionTime:0,progress:0},action:'idle',stun:0,keeper:ordinal%6===0,visual:{knockdown:0,confused:0,crying:0,airborne:false}})),hazards:{magic:[],walls:[],nova:null,tornado:null,lightning:null,weather:'Clear'}};
 return {get snapshot(){return state;},step(){state={...state,tick:state.tick+1};return {accepted:true,snapshot:state};},exportCheckpoint(){return {...checkpoint(state.tick),state:{tick:state.tick}};},restoreCheckpoint(value){state={...state,tick:value.state.tick};}};
}
function api(overrides={}){
 let at=10000;const created=[];
 const matchmaking=createOnlineMatchmaking({createEngine:async options=>{created.push(options);return engine();},validTeamIds:teamIds,autoTick:false,now:()=>at,
  ...(overrides||{})});
 return {matchmaking,created,setTime(value){at=value;}};
}

test('restored authoritative PVP match resumes at checkpoint tick only for matching assignment',async()=>{
 const ctx=api();
 assert.deepEqual(await ctx.matchmaking.restoreCheckpoint({matchId:'a'.repeat(32),participants,teamIds:['team_other','team_away'],checkpoint:checkpoint()}),{ok:false,reason:'checkpoint-invalid'});
 assert.equal(ctx.created.length,0,'assignment mismatch fails before creating an engine');
 const restored=await ctx.matchmaking.restoreCheckpoint({matchId:'a'.repeat(32),participants,teamIds,checkpoint:checkpoint()});
 assert.deepEqual(restored,{ok:true,matchId:'a'.repeat(32),tick:4,status:'restored'});
 assert.equal(ctx.matchmaking.getState().active[0].tick,4);
 const resume=ctx.matchmaking.issueResumeTicket(participants[0]);assert.equal(resume.ok,true);
 const resumed=await ctx.matchmaking.queuePresentedTicket(resume.ticket);
 assert.equal(resumed.resumed,true);assert.equal(resumed.resumeSnapshot.tick,4);
 assert.deepEqual(ctx.created[0],{matchId:'a'.repeat(32),participants,home:0,away:9,teamIds,rosterPlayerIds:config.rosterAssetIds,halfSeconds:120,seed:17,mode:'quick',humans:2});
 ctx.matchmaking.close();
});

test('invalid restore handle and expired recovery seat fail closed without occupying a slot',async()=>{
 const ctx=api({disconnectGraceMs:1000});
 const bad=await ctx.matchmaking.restoreCheckpoint({matchId:'b'.repeat(32),participants,teamIds,checkpoint:{...checkpoint(),schemaVersion:99}});
 assert.equal(bad.reason,'checkpoint-invalid');
 const restored=await ctx.matchmaking.restoreCheckpoint({matchId:'b'.repeat(32),participants,teamIds,checkpoint:checkpoint()});assert.equal(restored.ok,true);
 ctx.setTime(11001);
 assert.equal(ctx.matchmaking.issueResumeTicket(participants[0]).reason,'resume-unavailable');
 ctx.matchmaking.tick('b'.repeat(32));
 assert.deepEqual(ctx.matchmaking.getState().active,[],'expired restore grace closes during normal fixed-tick reconciliation');
 ctx.matchmaking.close();
});

test('PVP restart checkpoints write only on graceful handoff and capture the final authoritative tick',async()=>{
 const writes=[],ctx=api({onMatchCheckpoint:async value=>writes.push([value.checkpoint.state.tick,value.recoveryEligible])});
 const first=ctx.matchmaking.issueTicket(participants[0],teamIds[0]),second=ctx.matchmaking.issueTicket(participants[1],teamIds[1]);
 await ctx.matchmaking.queuePresentedTicket(first.ticket);
 const paired=await ctx.matchmaking.queuePresentedTicket(second.ticket);
 ctx.matchmaking.tick(paired.matchId);assert.deepEqual(writes,[],'live 30 Hz ticks do not create a PostgreSQL write per frame');
 await ctx.matchmaking.prepareShutdown();
 assert.deepEqual(writes,[[1,true]],'graceful handoff writes one restorable state after stopping the simulation timer');
 ctx.matchmaking.close();await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(writes,[[1,true]],'graceful shutdown retains the restart checkpoint');
});
