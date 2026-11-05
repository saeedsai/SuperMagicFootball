// Transport-neutral queue/ticket coordinator. A network adapter must pass an
// authenticated user ID; this module owns no socket, database, account, or rewards.
import {createHash,randomBytes} from 'node:crypto';
import {createOnlineMatchSession} from './online-match-session.mjs';
import {ONLINE_CAREER_AI_PARTICIPANT} from './online-career-schedule.mjs';

const USER_ID=/^[A-Za-z0-9_-]{8,64}$/;
const MATCH_ID=/^[a-f0-9]{32}$/;
const STATES=new Set(['play','paused','penalty','finished']);
const VIEWS=new Set(['front','back','side','quarterFront','quarterBack']);
const BALL_MODELS=new Set(['classic','retro','gold','ice','meteor']);
const WEATHER=new Set(['Clear','Rain','Wind','Storm','Tornado']);
const ACTION=/^[A-Za-z][A-Za-z0-9_-]{0,31}$/;
const PLAYER_ASSET_ID=/^[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9_-]{1,64}$/;
const COLOR=/^(#[a-f0-9]{3,8}|rgba?\([0-9.,% ]+\))$/i;
const STEP_MS=1000/30;
const RESULT_RETRY_BASE_MS=250;
const RESULT_RETRY_MAX_MS=5000;
const sha=value=>createHash('sha256').update(value).digest('hex');
const freeze=value=>{
  if(Array.isArray(value))return Object.freeze(value.map(freeze));
  if(value&&typeof value==='object')return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,freeze(item)])));
  return value;
};
function makeRandomId(){return randomBytes(16).toString('hex');}
function validUserId(userId){return typeof userId==='string'&&USER_ID.test(userId);}
function plainRecord(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&
  (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);}
function exactKeys(value,keys){return plainRecord(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}
function finiteRange(value,min,max){return Number.isFinite(value)&&value>=min&&value<=max;}
function validColor(value){return typeof value==='string'&&value.length<=32&&COLOR.test(value);}
function validatedSnapshot(envelope,matchId){
  if(!exactKeys(envelope,['matchId','tick','snapshot'])||envelope.matchId!==matchId||!Number.isSafeInteger(envelope.tick)||envelope.tick<0)return null;
  const state=envelope.snapshot;
  if(!exactKeys(state,['tick','phase','matchState','terminal','half','clock','clockRemaining','clockProgress','score','teamIds','controlled',
      'ballModel','ball','players','hazards'])||!Number.isSafeInteger(state.tick)||state.tick!==envelope.tick||
     !STATES.has(state.phase)||state.phase!==state.matchState||typeof state.terminal!=='boolean'||state.terminal!==(state.phase==='finished')||
     !Number.isSafeInteger(state.half)||state.half<1||state.half>2||
     !finiteRange(state.clock,0,1800)||!finiteRange(state.clockRemaining,0,1800)||!finiteRange(state.clockProgress,0,1)||
     !Array.isArray(state.score)||state.score.length!==2||!state.score.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=999)||
     !Array.isArray(state.teamIds)||state.teamIds.length!==2||!state.teamIds.every(value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(value))||
     !Array.isArray(state.controlled)||state.controlled.length!==2||!state.controlled.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=5)||
     !BALL_MODELS.has(state.ballModel)||!Array.isArray(state.players)||state.players.length!==12)return null;
  const ball=state.ball;
  if(!exactKeys(ball,['x','y','height','velocity','owner','shot','roll'])||
     !finiteRange(ball.x,0,1)||!finiteRange(ball.y,0,1)||!finiteRange(ball.height,0,1)||!finiteRange(ball.roll,0,1)||
     !exactKeys(ball.velocity,['x','y','height'])||!finiteRange(ball.velocity.x,-1,1)||!finiteRange(ball.velocity.y,-1,1)||
     !finiteRange(ball.velocity.height,-1,1))return null;
  let owner=null;
  if(ball.owner!==null){
    if(!exactKeys(ball.owner,['team','slot','index'])||![0,1].includes(ball.owner.team)||
       !Number.isSafeInteger(ball.owner.slot)||ball.owner.slot<0||ball.owner.slot>5||
       !Number.isSafeInteger(ball.owner.index)||ball.owner.index<0||ball.owner.index>11)return null;
    owner=Object.freeze({...ball.owner});
  }
  let shot=null;
  if(ball.shot!==null){
    if(!exactKeys(ball.shot,['id','behavior','color','trail','underground','level','phase','transformSeconds','age'])||
       typeof ball.shot.id!=='string'||ball.shot.id.length<1||ball.shot.id.length>64||!ACTION.test(ball.shot.behavior)||
       !validColor(ball.shot.color)||!validColor(ball.shot.trail)||typeof ball.shot.underground!=='boolean'||
       !finiteRange(ball.shot.level,0,5)||!finiteRange(ball.shot.phase,-1000,1000)||
       !finiteRange(ball.shot.transformSeconds,.05,20)||!finiteRange(ball.shot.age,0,60))return null;
    shot=Object.freeze({...ball.shot});
  }
  const cleanBall=Object.freeze({x:ball.x,y:ball.y,height:ball.height,velocity:Object.freeze({...ball.velocity}),owner,shot,roll:ball.roll});
  const players=[],playerSlots=new Set();
  for(const player of state.players){
    if(!exactKeys(player,['slot','team','index','assetId','position','view','facing','animation','action','stun','keeper','visual'])||
       ![0,1].includes(player.team)||!Number.isSafeInteger(player.slot)||player.slot<0||player.slot>5||
       !Number.isSafeInteger(player.index)||player.index<0||player.index>11||typeof player.assetId!=='string'||!PLAYER_ASSET_ID.test(player.assetId)||
       !exactKeys(player.position,['x','y','height'])||!['x','y','height'].every(key=>finiteRange(player.position[key],0,1))||
       !exactKeys(player.view,['kind','side'])||!VIEWS.has(player.view.kind)||![-1,1].includes(player.view.side)||
       ![-1,1].includes(player.facing)||!exactKeys(player.animation,['phase','actionTime','progress'])||
       !finiteRange(player.animation.phase,0,1)||!finiteRange(player.animation.actionTime,0,10)||!finiteRange(player.animation.progress,0,1)||
       typeof player.action!=='string'||!ACTION.test(player.action)||!finiteRange(player.stun,0,5)||typeof player.keeper!=='boolean'||
       !exactKeys(player.visual,['knockdown','confused','crying','airborne'])||
       !finiteRange(player.visual.knockdown,0,1)||!finiteRange(player.visual.confused,0,1)||
       !finiteRange(player.visual.crying,0,1)||typeof player.visual.airborne!=='boolean')return null;
    const playerKey=`${player.team}:${player.slot}`;
    if(playerSlots.has(playerKey))return null;
    playerSlots.add(playerKey);
    players.push(Object.freeze({...player,position:Object.freeze({...player.position}),view:Object.freeze({...player.view}),
      animation:Object.freeze({...player.animation}),visual:Object.freeze({...player.visual})}));
  }
  const hazards=state.hazards;
  if(!exactKeys(hazards,['magic','walls','nova','tornado','lightning','weather'])||!Array.isArray(hazards.magic)||hazards.magic.length>24||
     !Array.isArray(hazards.walls)||hazards.walls.length>8||!WEATHER.has(hazards.weather))return null;
  const magic=[];
  for(const hazard of hazards.magic){
    if(!exactKeys(hazard,['kind','team','x','y','life','arm'])||!['banana','ice'].includes(hazard.kind)||![0,1].includes(hazard.team)||
       !finiteRange(hazard.x,0,1)||!finiteRange(hazard.y,0,1)||!finiteRange(hazard.life,0,10)||!finiteRange(hazard.arm,0,5))return null;
    magic.push(Object.freeze({...hazard}));
  }
  const walls=[];
  for(const wall of hazards.walls){
    if(!exactKeys(wall,['id','team','x','y','halfLength','thickness','height','duration','arm','color'])||
       !['magicWall','fireWall','iceWall','demonWall'].includes(wall.id)||![0,1].includes(wall.team)||
       !finiteRange(wall.x,0,1)||!finiteRange(wall.y,0,1)||!finiteRange(wall.halfLength,0,1)||
       !finiteRange(wall.thickness,0,1)||!finiteRange(wall.height,0,1)||!finiteRange(wall.duration,0,30)||
       !finiteRange(wall.arm,0,5)||!validColor(wall.color))return null;
    walls.push(Object.freeze({...wall}));
  }
  const validateHazard=(value,keys,ranges)=>{
    if(value===null)return null;
    if(!exactKeys(value,keys)||!finiteRange(value.x,0,1)||!finiteRange(value.y,0,1)||
       !ranges.every(([key,min,max])=>finiteRange(value[key],min,max)))return undefined;
    if(Object.hasOwn(value,'team')&&![0,1].includes(value.team))return undefined;
    return Object.freeze({...value});
  };
  const nova=validateHazard(hazards.nova,['team','x','y','radius','remaining','telegraph'],[['radius',0,1],['remaining',0,10],['telegraph',0,10]]);
  const tornado=validateHazard(hazards.tornado,['x','y','life','totalLife','radius'],[['life',0,10],['totalLife',0,10],['radius',0,1]]);
  const lightning=hazards.lightning===null?null:validateHazard(hazards.lightning,
    ['phase','x','y','radius','remaining','duration'],[['radius',0,1],['remaining',0,10],['duration',0,10]]);
  if(nova===undefined||tornado===undefined||lightning===undefined||
     lightning&& !['warning','strike'].includes(lightning.phase))return null;
  const cleanState=Object.freeze({tick:state.tick,phase:state.phase,matchState:state.matchState,terminal:state.terminal,half:state.half,
    clock:state.clock,clockRemaining:state.clockRemaining,clockProgress:state.clockProgress,
    score:Object.freeze(state.score.slice()),teamIds:Object.freeze(state.teamIds.slice()),controlled:Object.freeze(state.controlled.slice()),
    ballModel:state.ballModel,ball:cleanBall,
    players:Object.freeze(players),hazards:Object.freeze({magic:Object.freeze(magic),walls:Object.freeze(walls),nova,tornado,lightning,weather:hazards.weather})});
  if(Buffer.byteLength(JSON.stringify({matchId,tick:envelope.tick,snapshot:cleanState}),'utf8')>8192)return null;
  return Object.freeze({matchId,tick:envelope.tick,snapshot:cleanState});
}

/**
 * Create a short-lived single-use-ticket queue and server-owned match sessions.
 * `queueTicket({userId,ticket})` must receive the user ID from trusted auth middleware.
 */
export function createOnlineMatchmaking({createEngine,sendSnapshot=()=>true,onRequeue=()=>{},onMatchFinished=async result=>({matchId:result.matchId}),onMatchPersisted=()=>{},onMatchError=()=>{},
  now=Date.now,setIntervalFn=globalThis.setInterval,clearIntervalFn=globalThis.clearInterval,
  autoTick=true,ticketTtlMs=30_000,queueTtlMs=60_000,disconnectGraceMs=15_000,maxSnapshotBuffer=4,
  maxPendingTickets=512,maxQueuedUsers=256,maxActiveMatches=64,validTeamIds=null}={}){
  if(typeof createEngine!=='function'||typeof sendSnapshot!=='function'||typeof onRequeue!=='function'||typeof onMatchFinished!=='function'||typeof onMatchPersisted!=='function'||typeof onMatchError!=='function'||
     typeof now!=='function'||typeof setIntervalFn!=='function'||typeof clearIntervalFn!=='function'||
     typeof autoTick!=='boolean'||!Number.isSafeInteger(ticketTtlMs)||ticketTtlMs<1000||ticketTtlMs>60_000||
     !Number.isSafeInteger(queueTtlMs)||queueTtlMs<1000||queueTtlMs>60_000||!Number.isSafeInteger(disconnectGraceMs)||disconnectGraceMs<1000||disconnectGraceMs>60_000||
     !Number.isSafeInteger(maxSnapshotBuffer)||maxSnapshotBuffer<1||maxSnapshotBuffer>16||
     !Number.isSafeInteger(maxPendingTickets)||maxPendingTickets<1||maxPendingTickets>10000||
     !Number.isSafeInteger(maxQueuedUsers)||maxQueuedUsers<1||maxQueuedUsers>10000||
     !Number.isSafeInteger(maxActiveMatches)||maxActiveMatches<1||maxActiveMatches>1000)
    throw new TypeError('Invalid online matchmaking configuration');

  if(validTeamIds!==null&&(!Array.isArray(validTeamIds)||validTeamIds.length<1||validTeamIds.length>512||
    validTeamIds.some(id=>typeof id!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(id))||new Set(validTeamIds).size!==validTeamIds.length))
    throw new TypeError('validTeamIds must be a unique list of canonical team IDs');
  const canonicalTeamIds=validTeamIds===null?null:new Set(validTeamIds);

  const tickets=new Map(),ticketByUser=new Map(),queue=[],queuedByUser=new Map(),reservedUsers=new Set();
  const careerFixtures=new Map(),careerFixtureByUser=new Map();
  const matches=new Map(),activeByUser=new Map(),requeuedFromMatch=new Map(),closedMatches=new Map();
  let disposed=false;
  const takeRandom=()=>{let id;do{id=randomBytes(32).toString('hex');}while(tickets.has(sha(id)));return id;};
  function rememberClosed(matchId,reason){
    closedMatches.set(matchId,reason);
    while(closedMatches.size>512)closedMatches.delete(closedMatches.keys().next().value);
  }
  function removeQueueUser(userId){
    if(!queuedByUser.has(userId))return false;
    const queued=queuedByUser.get(userId);
    queuedByUser.delete(userId);
    if(queued.careerMatchId){
      const fixture=careerFixtures.get(queued.careerMatchId);
      if(fixture&&fixture.seats[queued.careerSide]===queued)fixture.seats[queued.careerSide]=null;
      if(fixture&&fixture.status==='queued')fixture.status='reserved';
      requeuedFromMatch.delete(userId);return true;
    }
    const index=queue.findIndex(row=>row.userId===userId);
    if(index>=0)queue.splice(index,1);
    requeuedFromMatch.delete(userId);
    return true;
  }
  function expire(nowValue=now(),preserveTicketHash=null){
    for(const [hash,ticket] of tickets){
      if(hash===preserveTicketHash)continue;
      if(ticket.expiresAt<=nowValue){tickets.delete(hash);if(ticketByUser.get(ticket.userId)===hash)ticketByUser.delete(ticket.userId);}
    }
    for(const row of [...queue])if(row.expiresAt<=nowValue)removeQueueUser(row.userId);
    for(const row of [...queuedByUser.values()])if(row.careerMatchId&&row.expiresAt<=nowValue)removeQueueUser(row.userId);
  }
  function clearUserTicket(userId){
    const hash=ticketByUser.get(userId);
    if(hash){tickets.delete(hash);ticketByUser.delete(userId);}
  }
  function busy(userId){return activeByUser.has(userId)||queuedByUser.has(userId)||reservedUsers.has(userId)||ticketByUser.has(userId)||careerFixtureByUser.has(userId);}
  function cleanRosterPlayerIds(value){
    if(value===null||value===undefined)return null;
    if(!Array.isArray(value)||value.length!==12||!value.every(id=>typeof id==='string'&&PLAYER_ASSET_ID.test(id))||new Set(value).size!==12)return undefined;
    return Object.freeze(value.slice());
  }
  function issueTicket(userId,teamId=null,rosterPlayerIds=null){
    if(disposed)return Object.freeze({ok:false,reason:'service-closed'});
    expire();
    if(!validUserId(userId))return Object.freeze({ok:false,reason:'invalid-user'});
    if(teamId!==null&&(typeof teamId!=='string'||!canonicalTeamIds?.has(teamId)))return Object.freeze({ok:false,reason:'invalid-team'});
    rosterPlayerIds=cleanRosterPlayerIds(rosterPlayerIds);if(rosterPlayerIds===undefined)return Object.freeze({ok:false,reason:'invalid-lineup'});
    if(busy(userId))return Object.freeze({ok:false,reason:'duplicate-active-user'});
    const canPairWaiting=queue.length===1&&matches.size<maxActiveMatches;
    if(tickets.size>=maxPendingTickets||queue.length>=maxQueuedUsers&&!canPairWaiting)return Object.freeze({ok:false,reason:'service-capacity'});
    const ticket=takeRandom(),hash=sha(ticket),createdAt=now(),expiresAt=createdAt+ticketTtlMs;
    if(!Number.isFinite(createdAt)||!Number.isFinite(expiresAt))return Object.freeze({ok:false,reason:'invalid-clock'});
    tickets.set(hash,{userId,teamId,rosterPlayerIds,createdAt,expiresAt});ticketByUser.set(userId,hash);
    return Object.freeze({ok:true,ticket,expiresAt});
  }
  function issueResumeTicket(userId){
    if(disposed||!validUserId(userId))return Object.freeze({ok:false,reason:'resume-unavailable'});
    const matchId=activeByUser.get(userId),record=matches.get(matchId),deadline=record?.disconnectedUntil?.get(userId),at=now();
    if(!record||record.status!=='active'||record.careerMode==='career-ai'||!Number.isFinite(at)||!Number.isFinite(deadline)||deadline<=at)
      return Object.freeze({ok:false,reason:'resume-unavailable'});
    const expiresAt=Math.min(deadline,at+ticketTtlMs);
    if(tickets.size>=maxPendingTickets&&!ticketByUser.has(userId))return Object.freeze({ok:false,reason:'service-capacity'});
    // Replace a pending resume credential so a lost HTTP response can be retried;
    // only the newest opaque token remains usable.
    clearUserTicket(userId);
    const ticket=takeRandom(),hash=sha(ticket);
    tickets.set(hash,{userId,createdAt:at,expiresAt,resumeMatchId:matchId});ticketByUser.set(userId,hash);
    return Object.freeze({ok:true,ticket,expiresAt});
  }
  function reserveCareerFixture(fixture,rosterPlayerIds=null){
    if(disposed)return Object.freeze({ok:false,reason:'service-closed'});
    rosterPlayerIds=cleanRosterPlayerIds(rosterPlayerIds);if(rosterPlayerIds===undefined)return Object.freeze({ok:false,reason:'invalid-lineup'});
    if(!exactKeys(fixture,['fixtureNo','fixtureId','matchId','participants','teamIds','mode'])||!Number.isSafeInteger(fixture.fixtureNo)||fixture.fixtureNo<1||fixture.mode!=='career-ai'||
      !MATCH_ID.test(fixture.fixtureId||'')||!MATCH_ID.test(fixture.matchId||'')||
      !Array.isArray(fixture.participants)||fixture.participants.length!==2||
      !fixture.participants.every((row,side)=>exactKeys(row,['userId','side'])&&validUserId(row.userId)&&row.side===side)||
      fixture.participants[0].userId===ONLINE_CAREER_AI_PARTICIPANT||fixture.participants[1].userId!==ONLINE_CAREER_AI_PARTICIPANT||
      !Array.isArray(fixture.teamIds)||fixture.teamIds.length!==2||
      !fixture.teamIds.every(teamId=>typeof teamId==='string'&&(/^[A-Za-z0-9_-]{1,64}$/.test(teamId))&&(!canonicalTeamIds||canonicalTeamIds.has(teamId)))||
      fixture.teamIds[0]===fixture.teamIds[1])return Object.freeze({ok:false,reason:'invalid-career-fixture'});
    const existing=careerFixtures.get(fixture.matchId);
    if(existing){
      const same=existing.fixtureNo===fixture.fixtureNo&&existing.fixtureId===fixture.fixtureId&&existing.userIds.every((userId,side)=>userId===fixture.participants[side].userId)&&existing.teamIds.every((teamId,side)=>teamId===fixture.teamIds[side])&&JSON.stringify(existing.rosterPlayerIds)===JSON.stringify(rosterPlayerIds);
      return same?Object.freeze({ok:true,duplicate:true,matchId:fixture.matchId}):Object.freeze({ok:false,reason:'fixture-conflict'});
    }
    if(matches.has(fixture.matchId)||closedMatches.has(fixture.matchId)||careerFixtures.size>=maxQueuedUsers||
      fixture.participants.some(row=>busy(row.userId)))return Object.freeze({ok:false,reason:'fixture-user-busy'});
    const record={fixtureNo:fixture.fixtureNo,fixtureId:fixture.fixtureId,matchId:fixture.matchId,userIds:fixture.participants.map(row=>row.userId),teamIds:fixture.teamIds.slice(),rosterPlayerIds,
      mode:fixture.mode,seats:[null,null],status:'reserved'};
    careerFixtures.set(record.matchId,record);careerFixtureByUser.set(record.userIds[0],record.matchId);
    return Object.freeze({ok:true,duplicate:false,matchId:record.matchId});
  }
  function issueCareerTicket(matchId,userId,rosterPlayerIds=null){
    if(disposed)return Object.freeze({ok:false,reason:'service-closed'});
    expire();
    const fixture=careerFixtures.get(matchId),side=fixture?.userIds.indexOf(userId)??-1;
    if(!fixture||fixture.mode!=='career-ai'||!['reserved','queued'].includes(fixture.status)||side!==0)return Object.freeze({ok:false,reason:'career-fixture-unavailable'});
    rosterPlayerIds=cleanRosterPlayerIds(rosterPlayerIds??fixture.rosterPlayerIds);if(rosterPlayerIds===undefined||fixture.rosterPlayerIds&&JSON.stringify(fixture.rosterPlayerIds)!==JSON.stringify(rosterPlayerIds))return Object.freeze({ok:false,reason:'invalid-lineup'});
    if(ticketByUser.has(userId)||queuedByUser.has(userId)||activeByUser.has(userId)||reservedUsers.has(userId))return Object.freeze({ok:false,reason:'duplicate-active-user'});
    if(fixture.seats[side])return Object.freeze({ok:false,reason:'duplicate-active-user'});
    if(tickets.size>=maxPendingTickets)return Object.freeze({ok:false,reason:'service-capacity'});
    const createdAt=now(),expiresAt=createdAt+ticketTtlMs;
    if(!Number.isFinite(createdAt)||!Number.isFinite(expiresAt))return Object.freeze({ok:false,reason:'invalid-clock'});
    const ticket=takeRandom(),hash=sha(ticket);
    tickets.set(hash,{userId,teamId:fixture.teamIds[side],rosterPlayerIds,createdAt,expiresAt,careerMatchId:fixture.matchId,careerSide:side});ticketByUser.set(userId,hash);
    return Object.freeze({ok:true,ticket,expiresAt,matchId:fixture.matchId,side});
  }
  function consumeTicket(userId,rawTicket){
    if(typeof rawTicket!=='string'||!/^[a-f0-9]{64}$/.test(rawTicket))return {ok:false,reason:'invalid-ticket'};
    const hash=sha(rawTicket),record=tickets.get(hash);
    if(!record)return {ok:false,reason:'ticket-used-or-unknown'};
    if(record.userId!==userId)return {ok:false,reason:'ticket-user-mismatch'};
    tickets.delete(hash);if(ticketByUser.get(userId)===hash)ticketByUser.delete(userId);
    if(record.expiresAt<=now())return {ok:false,reason:'ticket-expired'};
    return {ok:true,record};
  }
  function makeMatchId(){let id;do{id=makeRandomId();}while(matches.has(id)||closedMatches.has(id)||careerFixtures.has(id));return id;}
  function resolveRandomQueueTeams(firstTeam,secondTeam,matchId){
    const ids=[firstTeam??null,secondTeam??null];
    if(ids[0]!==null&&ids[1]!==null&&ids[0]===ids[1]&&canonicalTeamIds){
      const alternatives=[...canonicalTeamIds].filter(id=>id!==ids[0]).sort();
      if(!alternatives.length)return ids;
      const bytes=Buffer.from(matchId,'hex');
      const keepSide=bytes[0]&1,fallbackIndex=bytes.readUInt32BE(1)%alternatives.length;
      ids[1-keepSide]=alternatives[fallbackIndex];
    }
    return ids;
  }
  function flush(record,userId){
    const pending=record.buffers.get(userId);
    if(!pending)return 0;
    let sent=0;
    while(pending.length){
      try{if(sendSnapshot(userId,pending[0],Object.freeze({side:record.userIds.indexOf(userId),mode:record.careerMode||'quick'}))===false)break;}
      catch{break;}
      pending.shift();sent++;
    }
    return sent;
  }
  function bufferSnapshot(record,envelope){
    const clean=validatedSnapshot(envelope,record.matchId);
    if(!clean||clean.tick<record.lastSnapshotTick)return false;
    record.lastSnapshotTick=clean.tick;
    for(const userId of record.connectedUserIds||record.userIds){
      const pending=record.buffers.get(userId);
      while(pending.length>=maxSnapshotBuffer)pending.shift();
      pending.push(clean);flush(record,userId);
    }
    return true;
  }
  function releaseActive(record){
    for(const userId of record.userIds)if(activeByUser.get(userId)===record.matchId)activeByUser.delete(userId);
  }
  function stopRecord(record,reason,{requeueUserId=null}={}){
    if(!['active','persisting'].includes(record.status))return false;
    record.status=reason==='finished'?'finished':'closed';record.reason=reason;
    if(record.timer!==null){clearIntervalFn(record.timer);record.timer=null;}
    record.session.close();releaseActive(record);
    for(const queueBuffer of record.buffers.values())queueBuffer.length=0;
    const careerFixture=record.careerMatchId?careerFixtures.get(record.careerMatchId):null;
    if(careerFixture){
      if(reason==='finished'){
        careerFixtures.delete(careerFixture.matchId);
        if(careerFixtureByUser.get(careerFixture.userIds[0])===careerFixture.matchId)careerFixtureByUser.delete(careerFixture.userIds[0]);
      }else{
        careerFixture.status='reserved';careerFixture.seats=[null,null];
        for(const userId of careerFixture.userIds){queuedByUser.delete(userId);requeuedFromMatch.delete(userId);}
      }
    }
      if(!careerFixture||reason==='finished')rememberClosed(record.matchId,reason);
    if(requeueUserId&&record.userIds.includes(requeueUserId)&&!disposed&&!busy(requeueUserId)&&queue.length<maxQueuedUsers){
      const side=record.userIds.indexOf(requeueUserId);
      queuedByUser.set(requeueUserId,{userId:requeueUserId,teamId:record.teamIds[side]??null,rosterPlayerIds:record.rosterPlayerIds?.[side]??null,queuedAt:now(),expiresAt:now()+queueTtlMs});
      queue.push(queuedByUser.get(requeueUserId));requeuedFromMatch.set(requeueUserId,record.matchId);
      try{onRequeue(requeueUserId,Object.freeze({reason,previousMatchId:record.matchId}));}catch{}
    }else if(requeueUserId&&record.userIds.includes(requeueUserId)&&!disposed&&!busy(requeueUserId))try{
      onRequeue(requeueUserId,Object.freeze({reason:'service-capacity',previousMatchId:record.matchId,queued:false}));
    }catch{}
    return true;
  }
  function finalResultFor(record,state){
    if(state?.matchState!=='finished'||state.phase!=='finished'||state.terminal!==true||state.half!==2||
       !Number.isSafeInteger(state.tick)||state.tick<1||!Number.isFinite(state.clock)||
       !Array.isArray(state.score)||state.score.length!==2||!Array.isArray(state.teamIds)||state.teamIds.length!==2)
      throw new Error('Terminal engine snapshot failed final-result validation');
    return Object.freeze({schemaVersion:1,matchId:record.matchId,status:'finished',terminal:true,half:state.half,
      clock:state.clock,tick:state.tick,participants:Object.freeze(record.userIds.map((userId,side)=>Object.freeze({userId,side}))),
      teamIds:Object.freeze(state.teamIds.slice()),score:Object.freeze(state.score.slice())});
  }
  async function persistFinal(record,stepResult=null){
    if(record.persistencePromise)return record.persistencePromise;
    const at=now();
    if(Number.isFinite(at)&&at<(record.nextPersistenceAt||0))
      return Object.freeze({...stepResult,advanced:stepResult?.advanced===true,closed:false,reason:'result-persistence-pending',snapshot:record.finalSnapshot});
    record.persistencePromise=(async()=>{
      try{
        const persisted=await onMatchFinished(record.finalResult);
        if(!persisted||persisted.matchId!==record.finalResult.matchId)
          throw new Error('Durable match result callback did not confirm the final match ID');
        if(record.status!=='persisting'||disposed)return Object.freeze({advanced:false,closed:false,reason:'service-closed',snapshot:record.finalSnapshot});
        try{onMatchPersisted(record.finalResult)}catch{}
        stopRecord(record,'finished');matches.delete(record.matchId);
        if(queue.length>=2)void pairQueue();
        return Object.freeze({...stepResult,advanced:stepResult?.advanced===true,closed:true,reason:'finished',snapshot:record.finalSnapshot});
      }catch{
        const failedAt=now(),delay=record.persistenceRetryMs||RESULT_RETRY_BASE_MS;
        record.nextPersistenceAt=(Number.isFinite(failedAt)?failedAt:0)+delay;
        record.persistenceRetryMs=Math.min(delay*2,RESULT_RETRY_MAX_MS);
        return Object.freeze({...stepResult,advanced:stepResult?.advanced===true,closed:false,reason:'result-persistence-pending',snapshot:record.finalSnapshot});
      }finally{record.persistencePromise=null;}
    })();
    return record.persistencePromise;
  }
  function tick(matchId){
    const record=matches.get(matchId);
    if(!record)return Object.freeze({advanced:false,reason:closedMatches.get(matchId)||'match-not-active'});
    if(record.status==='persisting')return persistFinal(record);
    if(record.status!=='active')return Object.freeze({advanced:false,reason:record.reason||'match-not-active'});
    expire();
    const at=now();
    if(record.disconnectedUntil?.size){
      const expiredUser=[...record.disconnectedUntil].find(([,deadline])=>deadline<=at)?.[0];
      if(expiredUser){
        clearUserTicket(expiredUser);
        const survivor=record.userIds.find(userId=>userId!==expiredUser&&!record.disconnectedUntil.has(userId));
        stopRecord(record,'reconnect-timeout',{requeueUserId:survivor});matches.delete(matchId);
        if(queue.length>=2)void pairQueue();
        return Object.freeze({advanced:false,closed:true,reason:'reconnect-timeout',snapshot:record.session.getState().snapshot});
      }
      return Object.freeze({advanced:false,closed:false,reason:'reconnect-pending',snapshot:record.session.getState().snapshot});
    }
    if(record.engine.snapshot?.matchState==='paused')record.engine.resumeAfterHalftime?.();
    const result=record.session.step();
    if(result.advanced&&result.snapshot?.matchState==='finished'){
      record.status='persisting';record.finalSnapshot=result.snapshot;
      try{record.finalResult=finalResultFor(record,result.snapshot);}
      catch{return Object.freeze({...result,closed:false,reason:'result-persistence-pending'});}
      return persistFinal(record,result);
    }
    if(!result.advanced&&['engine-rejected','engine-error'].includes(result.reason)){
      stopRecord(record,result.reason);matches.delete(matchId);
      if(result.reason==='engine-error'){
        // Emit only a fixed code; engine exception text can contain internal details.
        try{onMatchError(matchId,'engine-error');}catch{}
        return Object.freeze({...result,closed:true});
      }
    }
    return result;
  }
  async function pairQueue(){
    if(queue.length<2||disposed)return null;
    if(matches.size>=maxActiveMatches)return Object.freeze({ok:true,status:'queued',reason:'service-capacity'});
    const first=queue.shift(),second=queue.shift();
    queuedByUser.delete(first.userId);queuedByUser.delete(second.userId);
    requeuedFromMatch.delete(first.userId);requeuedFromMatch.delete(second.userId);
    if(first.userId===second.userId)return Object.freeze({ok:false,reason:'duplicate-active-user'});
    reservedUsers.add(first.userId);reservedUsers.add(second.userId);
    const matchId=makeMatchId(),userIds=[first.userId,second.userId];let record=null;
    const teamIds=Object.freeze(resolveRandomQueueTeams(first.teamId,second.teamId,matchId));
    try{
      const engineOptions={matchId,participants:Object.freeze(userIds.slice())};
      if(teamIds.some(Boolean))engineOptions.teamIds=teamIds;
      const rosterPlayerIds=[first.rosterPlayerIds??null,second.rosterPlayerIds??null];
      if(rosterPlayerIds.some(Boolean))engineOptions.rosterPlayerIds=Object.freeze(rosterPlayerIds);
      const engine=await createEngine(Object.freeze(engineOptions));
      if(disposed)throw new Error('Matchmaking service closed during engine creation');
      const buffers=new Map(userIds.map(userId=>[userId,[]]));
      record={matchId,userIds,teamIds,rosterPlayerIds,engine,session:null,buffers,lastSnapshotTick:-1,status:'active',reason:null,timer:null};
      record.session=createOnlineMatchSession({matchId,participants:userIds.map(userId=>({userId})),engine,now,
        onSnapshot:envelope=>bufferSnapshot(record,envelope)});
      matches.set(matchId,record);
      for(const userId of userIds)activeByUser.set(userId,matchId);
      const initial=record.session.getState().snapshot;
      if(!bufferSnapshot(record,{matchId,tick:0,snapshot:initial}))throw new Error('Invalid initial authoritative snapshot');
      if(autoTick)record.timer=setIntervalFn(()=>{void tick(matchId).catch(()=>{});},STEP_MS);
      const seats=Object.freeze(userIds.map((userId,side)=>Object.freeze({userId,side})));
      return Object.freeze({ok:true,status:'matched',matchId,participants:Object.freeze(userIds.slice()),seats});
    }catch(error){
      // Engine creation/setup failure returns both authenticated users to the
      // head of the waiting queue. No session or result is published.
      if(record){
        if(record.timer!==null)clearIntervalFn(record.timer);
        record.session?.close();releaseActive(record);matches.delete(matchId);
        for(const pending of record.buffers.values())pending.length=0;
      }
      if(!disposed){
        queuedByUser.set(first.userId,first);queuedByUser.set(second.userId,second);
        queue.unshift(second,first);
      }
      return Object.freeze({ok:false,status:'queued',reason:'engine-unavailable'});
    }finally{reservedUsers.delete(first.userId);reservedUsers.delete(second.userId);}
  }
  async function pairCareerFixture(fixture){
    if(disposed||!fixture||fixture.status!=='queued'||!fixture.seats[0]||fixture.mode!=='career-ai')return Object.freeze({ok:true,status:'queued'});
    if(matches.size>=maxActiveMatches)return Object.freeze({ok:true,status:'queued',reason:'service-capacity'});
    const userIds=fixture.userIds.slice(),teamIds=fixture.teamIds.slice(),matchId=fixture.matchId;
    fixture.status='starting';reservedUsers.add(userIds[0]);reservedUsers.add(userIds[1]);let record=null;
    try{
      const engine=await createEngine(Object.freeze({matchId,participants:Object.freeze(userIds.slice()),teamIds:Object.freeze(teamIds.slice()),...(fixture.rosterPlayerIds?{rosterPlayerIds:Object.freeze([fixture.rosterPlayerIds,null])}:{}),mode:'career-ai'}));
      if(disposed)throw new Error('Matchmaking service closed during Career engine creation');
      const buffers=new Map([[userIds[0],[]]]);
      record={matchId,userIds,connectedUserIds:Object.freeze([userIds[0]]),teamIds:Object.freeze(teamIds),rosterPlayerIds:Object.freeze([fixture.rosterPlayerIds??null,null]),engine,session:null,buffers,lastSnapshotTick:-1,status:'active',reason:null,timer:null,careerMatchId:matchId,careerMode:'career-ai'};
      record.session=createOnlineMatchSession({matchId,participants:userIds.map(userId=>({userId})),engine,now,
        onSnapshot:envelope=>bufferSnapshot(record,envelope)});
      matches.set(matchId,record);fixture.status='active';
      activeByUser.set(userIds[0],matchId);queuedByUser.delete(userIds[0]);
      fixture.seats=[null,null];
      const initial=record.session.getState().snapshot;
      if(!bufferSnapshot(record,{matchId,tick:0,snapshot:initial}))throw new Error('Invalid initial authoritative Career snapshot');
      if(autoTick)record.timer=setIntervalFn(()=>{void tick(matchId).catch(()=>{});},STEP_MS);
      const seats=Object.freeze(userIds.map((userId,side)=>Object.freeze({userId,side})));
      return Object.freeze({ok:true,status:'matched',matchId,participants:Object.freeze(userIds.slice()),seats,career:true,mode:'career-ai'});
    }catch{
      if(record){if(record.timer!==null)clearIntervalFn(record.timer);record.session?.close();releaseActive(record);matches.delete(matchId);for(const rows of record.buffers.values())rows.length=0;}
      fixture.status='reserved';fixture.seats=[null,null];for(const userId of userIds)queuedByUser.delete(userId);
      return Object.freeze({ok:false,status:'queued',reason:'engine-unavailable'});
    }finally{reservedUsers.delete(userIds[0]);reservedUsers.delete(userIds[1]);}
  }
  function queueCareerSeat(userId,record,onAccepted){
    const fixture=careerFixtures.get(record.careerMatchId),side=record.careerSide;
    if(!fixture||!['reserved','queued'].includes(fixture.status)||fixture.userIds[side]!==userId||fixture.teamIds[side]!==record.teamId)
      return Object.freeze({ok:false,reason:'career-fixture-unavailable'});
    if(fixture.seats[side]||queuedByUser.has(userId))return Object.freeze({ok:false,reason:'duplicate-active-user'});
    if(queuedByUser.size>=maxQueuedUsers)return Object.freeze({ok:false,reason:'service-capacity'});
    if(onAccepted){try{onAccepted(userId);}catch{return Object.freeze({ok:false,reason:'accept-callback-failed'});}}
    const queuedAt=now();if(!Number.isFinite(queuedAt))return Object.freeze({ok:false,reason:'invalid-clock'});
    const row={userId,teamId:record.teamId,rosterPlayerIds:record.rosterPlayerIds??fixture.rosterPlayerIds,careerMatchId:fixture.matchId,careerSide:side,queuedAt,expiresAt:queuedAt+queueTtlMs};
    fixture.seats[side]=row;fixture.status='queued';queuedByUser.set(userId,row);
    return pairCareerFixture(fixture);
  }
  async function queueAuthenticatedTicket(userId,ticket,onAccepted=null){
    if(disposed)return Object.freeze({ok:false,reason:'service-closed'});
    if(onAccepted!==null&&typeof onAccepted!=='function')return Object.freeze({ok:false,reason:'invalid-accept-callback'});
    if(!validUserId(userId))return Object.freeze({ok:false,reason:'invalid-user'});
    const activeMatchId=activeByUser.get(userId),offeredHash=typeof ticket==='string'&&/^[a-f0-9]{64}$/.test(ticket)?sha(ticket):null;
    const offered=offeredHash?tickets.get(offeredHash):null;
    if(queuedByUser.has(userId)||reservedUsers.has(userId))return Object.freeze({ok:false,reason:'duplicate-active-user'});
    if(activeMatchId&&(!offered||offered.userId!==userId||offered.resumeMatchId!==activeMatchId))
      return Object.freeze({ok:false,reason:'duplicate-active-user'});
    const ticketHash=typeof ticket==='string'&&/^[a-f0-9]{64}$/.test(ticket)?sha(ticket):null;
    expire(now(),ticketHash);
    const consumed=consumeTicket(userId,ticket);
    if(!consumed.ok)return Object.freeze(consumed);
    if(consumed.record.resumeMatchId)return resumeMatch({userId,matchId:consumed.record.resumeMatchId,onAccepted});
    if(activeByUser.has(userId)||queuedByUser.has(userId)||reservedUsers.has(userId))return Object.freeze({ok:false,reason:'duplicate-active-user'});
    if(consumed.record.careerMatchId)return queueCareerSeat(userId,consumed.record,onAccepted);
    const canPairWaiting=queue.length===1&&matches.size<maxActiveMatches;
    if(queue.length>=maxQueuedUsers&&!canPairWaiting)return Object.freeze({ok:false,reason:'service-capacity'});
    if(onAccepted){try{onAccepted(userId);}catch{return Object.freeze({ok:false,reason:'accept-callback-failed'});}}
    const at=now();
    if(!Number.isFinite(at))return Object.freeze({ok:false,reason:'invalid-clock'});
    const row={userId,teamId:consumed.record.teamId??null,rosterPlayerIds:consumed.record.rosterPlayerIds??null,queuedAt:at,expiresAt:at+queueTtlMs};
    queue.push(row);queuedByUser.set(userId,row);
    if(queue.length<2)return Object.freeze({ok:true,status:'queued'});
    return await pairQueue();
  }
  async function queueTicket({userId,ticket}={}){
    return await queueAuthenticatedTicket(userId,ticket);
  }
  async function queuePresentedTicket(ticket){
    if(disposed)return Object.freeze({ok:false,reason:'service-closed'});
    if(typeof ticket!=='string'||!/^[a-f0-9]{64}$/.test(ticket))return Object.freeze({ok:false,reason:'invalid-ticket'});
    const hash=sha(ticket),trustedRecord=tickets.get(hash);
    if(!trustedRecord)return Object.freeze({ok:false,reason:'ticket-used-or-unknown'});
    let onAccepted=null;
    if(arguments.length>1){
      const options=arguments[1];
      if(!options||typeof options!=='object'||Array.isArray(options)||
         Object.keys(options).some(key=>key!=='onAccepted')||
         options.onAccepted!==undefined&&typeof options.onAccepted!=='function')
        return Object.freeze({ok:false,reason:'invalid-accept-callback'});
      onAccepted=options.onAccepted||null;
    }
    // The WebSocket caller supplies only the opaque ticket. Identity comes
    // exclusively from the trusted, in-memory record, then existing queue
    // logic checks expiry and consumes the ticket in the same JS turn.
    const result=await queueAuthenticatedTicket(trustedRecord.userId,ticket,onAccepted);
    return result.ok?Object.freeze({...result,userId:trustedRecord.userId}):result;
  }
  function submitInput({userId,matchId,sequence,input}={}){
    if(!validUserId(userId)||!MATCH_ID.test(matchId||''))return Object.freeze({accepted:false,reason:'invalid-match-participant'});
    const record=matches.get(matchId);
    if(!record||record.status!=='active'||activeByUser.get(userId)!==matchId)return Object.freeze({accepted:false,reason:'match-not-active'});
    return record.session.submitInput(userId,sequence,input,now());
  }
  function disconnect({userId,matchId,leave=false}={}){
    if(!validUserId(userId)||!MATCH_ID.test(matchId||''))return Object.freeze({ok:false,reason:'invalid-match-participant'});
    if(typeof leave!=='boolean')return Object.freeze({ok:false,reason:'invalid-disconnect-mode'});
    const record=matches.get(matchId);
    if(record&&record.status==='active'&&record.userIds.includes(userId)){
      if(record.careerMode!=='career-ai'&&!leave){
        const at=now();
        if(!Number.isFinite(at))return Object.freeze({ok:false,reason:'invalid-clock'});
        if(record.disconnectedUntil?.has(userId))return Object.freeze({ok:false,reason:'already-disconnected'});
        record.disconnectedUntil??=new Map();record.disconnectedUntil.set(userId,at+disconnectGraceMs);
        record.connectedUserIds=Object.freeze(record.userIds.filter(id=>!record.disconnectedUntil.has(id)));
        record.buffers.get(userId)?.splice(0);
        record.session.resetInput(userId);
        return Object.freeze({ok:true,reason:'reconnect-pending',expiresAt:at+disconnectGraceMs});
      }
      const survivor=record.careerMode==='career-ai'?null:record.userIds.find(id=>id!==userId);
      stopRecord(record,'participant-disconnected',{requeueUserId:survivor});matches.delete(matchId);
      if(queue.length>=2)void pairQueue();
      return Object.freeze({ok:true,reason:'match-stopped',requeuedUserId:survivor});
    }
    if(requeuedFromMatch.get(userId)===matchId&&removeQueueUser(userId))return Object.freeze({ok:true,reason:'requeue-cancelled'});
    return Object.freeze({ok:false,reason:'stale-disconnect'});
  }
  function resumeMatch({userId,matchId,onAccepted=null}={}){
    if(disposed||!validUserId(userId)||!MATCH_ID.test(matchId||'')||onAccepted!==null&&typeof onAccepted!=='function')
      return Object.freeze({ok:false,reason:'resume-unavailable'});
    const record=matches.get(matchId),deadline=record?.disconnectedUntil?.get(userId),at=now();
    if(!record||record.status!=='active'||record.careerMode==='career-ai'||activeByUser.get(userId)!==matchId||
       !Number.isFinite(at)||!Number.isFinite(deadline)||deadline<=at)return Object.freeze({ok:false,reason:'resume-unavailable'});
    try{onAccepted?.(userId);}catch{return Object.freeze({ok:false,reason:'accept-callback-failed'});}
    record.disconnectedUntil.delete(userId);
    record.connectedUserIds=Object.freeze(record.userIds.filter(id=>!record.disconnectedUntil.has(id)));
    record.buffers.get(userId)?.splice(0);
    if(!record.session.resetInput(userId))return Object.freeze({ok:false,reason:'resume-unavailable'});
    const session=record.session.getState(),side=record.userIds.indexOf(userId);
    return Object.freeze({ok:true,status:'matched',matchId,participants:Object.freeze(record.userIds.slice()),
      seats:Object.freeze(record.userIds.map((id,index)=>Object.freeze({userId:id,side:index}))),side,resumed:true,
      resumeSnapshot:Object.freeze({matchId,tick:session.ticks,snapshot:session.snapshot})});
  }
  function cancelQueue(userId){
    if(!validUserId(userId))return Object.freeze({ok:false,reason:'invalid-user'});
    const wasQueued=queuedByUser.has(userId),ok=removeQueueUser(userId);
    return Object.freeze({ok,reason:wasQueued?'cancelled':'not-queued'});
  }
  function getState(){
    expire();
    const careerQueued=[...queuedByUser.values()].filter(row=>row.careerMatchId).sort((a,b)=>a.queuedAt-b.queuedAt).map(row=>row.userId);
    return Object.freeze({closed:disposed,queued:Object.freeze([...queue.map(row=>row.userId),...careerQueued]),
      active:Object.freeze([...matches.values()].filter(record=>record.status==='active'||record.status==='persisting').map(record=>Object.freeze({
        matchId:record.matchId,participants:Object.freeze(record.userIds.slice()),
        seats:Object.freeze(record.userIds.map((userId,side)=>Object.freeze({userId,side}))),status:record.status,
        tick:record.session.getState().ticks,
        buffered:Object.freeze(Object.fromEntries([...record.buffers].map(([userId,pending])=>[userId,pending.length])))
      })))});
  }
  function close(){
    if(disposed)return;disposed=true;
    for(const record of matches.values())stopRecord(record,'service-shutdown');
    matches.clear();tickets.clear();ticketByUser.clear();queue.length=0;queuedByUser.clear();reservedUsers.clear();requeuedFromMatch.clear();careerFixtures.clear();careerFixtureByUser.clear();
  }
  return Object.freeze({issueTicket,issueResumeTicket,issueCareerTicket,reserveCareerFixture,queueTicket,queuePresentedTicket,submitInput,disconnect,resumeMatch,cancelQueue,tick,getState,close,
    isValidTeamId(teamId){return typeof teamId==='string'&&!!canonicalTeamIds?.has(teamId);},
    get constants(){return Object.freeze({ticketTtlMs,queueTtlMs,tickRate:30,stepMs:STEP_MS,maxSnapshotBuffer,maxPendingTickets,maxQueuedUsers,maxActiveMatches});}});
}
