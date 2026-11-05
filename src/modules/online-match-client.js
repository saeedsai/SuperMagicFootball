const WS_PROTOCOL='smf-online-v1';
const ONLINE_MATCH_ID=/^[a-f0-9]{32}$/;
const TICKET=/^[a-f0-9]{64}$/;
const MAX_BUFFERED_INPUT_BYTES=1024;
const MAX_SEQUENCE_GAP=240;
const MATCH_ERROR_CODES=new Set(['engine-error']);
const BUTTONS=Object.freeze(['pass','shoot','dribble','jump']);
const AXIS=value=>Number.isFinite(value)&&value>=-1&&value<=1;
const onlineMatchPlain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;

export class OnlineMatchClientError extends Error{
 constructor(code){const messages={'not-configured':'Online matches are not configured.','ticket-invalid':'The online service returned an invalid match ticket.','connection-failed':'Could not connect to the online match server.','match-ended':'The online match connection has ended.','invalid-input':'The online action input is invalid.','invalid-snapshot':'The online server sent invalid match state.','already-connected':'An online match connection is already open.'};super(messages[code]||messages['connection-failed']);this.name='OnlineMatchClientError';this.code=Object.hasOwn(messages,code)?code:'connection-failed';}
}

function cleanInput(input){
 if(!onlineMatchPlain(input)||Object.keys(input).length!==3||!AXIS(input.x)||!AXIS(input.y)||!onlineMatchPlain(input.buttons)||
    Object.keys(input.buttons).length!==BUTTONS.length||BUTTONS.some(action=>typeof input.buttons[action]!=='boolean'))throw new OnlineMatchClientError('invalid-input');
 return {x:input.x,y:input.y,buttons:Object.fromEntries(BUTTONS.map(action=>[action,input.buttons[action]]))};
}
/** Poll existing keyboard/touch/gamepad bindings and produce one server input sample. */
export function sampleOnlineActionInput(input){
 if(!input||typeof input.poll!=='function'||!Array.isArray(input.state))throw new OnlineMatchClientError('invalid-input');
 input.poll(false);
 const state=input.state[0];
 if(!state)throw new OnlineMatchClientError('invalid-input');
 return cleanInput({x:state.x,y:state.y,buttons:Object.fromEntries(BUTTONS.map(action=>[action,!!state[action]]))});
}
function ticketExpiryMs(value){
 if(Number.isSafeInteger(value))return value;
 if(typeof value==='string'&&value.length<=64){const parsed=Date.parse(value);if(Number.isFinite(parsed))return parsed;}
 return NaN;
}
function exact(value,keys){return onlineMatchPlain(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));}
function range(value,min,max){return Number.isFinite(value)&&value>=min&&value<=max;}
function validateSnapshot(message){
 if(!onlineMatchPlain(message)||message.type!=='snapshot'||!ONLINE_MATCH_ID.test(message.matchId||'')||!Number.isSafeInteger(message.tick)||message.tick<0||!onlineMatchPlain(message.snapshot))throw new OnlineMatchClientError('invalid-snapshot');
 const state=message.snapshot;
 if(!exact(state,['tick','phase','matchState','terminal','half','clock','clockRemaining','clockProgress','score','teamIds','controlled','ballModel','ball','players','hazards'])||
    state.tick!==message.tick||!['play','paused','penalty','finished'].includes(state.phase)||state.matchState!==state.phase||state.terminal!==(state.phase==='finished')||
    !Number.isSafeInteger(state.half)||state.half<1||state.half>2||!range(state.clock,0,1800)||!range(state.clockRemaining,0,1800)||!range(state.clockProgress,0,1)||
    !Array.isArray(state.score)||state.score.length!==2||!state.score.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=999)||
    !Array.isArray(state.teamIds)||state.teamIds.length!==2||!state.teamIds.every(value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(value))||
    !Array.isArray(state.controlled)||state.controlled.length!==2||!state.controlled.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=5)||
    !['classic','retro','gold','ice','meteor'].includes(state.ballModel)||!Array.isArray(state.players)||state.players.length!==12)throw new OnlineMatchClientError('invalid-snapshot');
 const ball=state.ball;
 if(!exact(ball,['x','y','height','velocity','owner','shot','roll'])||!range(ball.x,0,1)||!range(ball.y,0,1)||!range(ball.height,0,1)||!range(ball.roll,0,1)||
    !exact(ball.velocity,['x','y','height'])||!range(ball.velocity.x,-1,1)||!range(ball.velocity.y,-1,1)||!range(ball.velocity.height,-1,1))throw new OnlineMatchClientError('invalid-snapshot');
 if(ball.owner!==null&&(!exact(ball.owner,['team','slot','index'])||![0,1].includes(ball.owner.team)||!Number.isSafeInteger(ball.owner.slot)||ball.owner.slot<0||ball.owner.slot>5||!Number.isSafeInteger(ball.owner.index)||ball.owner.index<0||ball.owner.index>11))throw new OnlineMatchClientError('invalid-snapshot');
 const shot=ball.shot;
 if(shot!==null&&(!exact(shot,['id','behavior','color','trail','underground','level','phase','transformSeconds','age'])||typeof shot.id!=='string'||shot.id.length<1||shot.id.length>64||
    typeof shot.behavior!=='string'||!/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(shot.behavior)||typeof shot.color!=='string'||! /^(#[a-f0-9]{3,8}|rgba?\([0-9.,% ]+\))$/i.test(shot.color)||typeof shot.trail!=='string'||! /^(#[a-f0-9]{3,8}|rgba?\([0-9.,% ]+\))$/i.test(shot.trail)||
    typeof shot.underground!=='boolean'||!range(shot.level,0,5)||!range(shot.phase,-1000,1000)||!range(shot.transformSeconds,.05,20)||!range(shot.age,0,60)))throw new OnlineMatchClientError('invalid-snapshot');
 const slots=new Set();
 for(const player of state.players){
  if(!exact(player,['slot','team','index','assetId','position','view','facing','animation','action','stun','keeper','visual'])||![0,1].includes(player.team)||
     !Number.isSafeInteger(player.slot)||player.slot<0||player.slot>5||!Number.isSafeInteger(player.index)||player.index<0||player.index>11||!exact(player.position,['x','y','height'])||
     typeof player.assetId!=='string'||!/^[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9_-]{1,64}$/.test(player.assetId)||
     !range(player.position.x,0,1)||!range(player.position.y,0,1)||!range(player.position.height,0,1)||!exact(player.view,['kind','side'])||
     !['front','back','side','quarterFront','quarterBack'].includes(player.view.kind)||![-1,1].includes(player.view.side)||![-1,1].includes(player.facing)||
     !exact(player.animation,['phase','actionTime','progress'])||!range(player.animation.phase,0,1)||!range(player.animation.actionTime,0,10)||!range(player.animation.progress,0,1)||
     typeof player.action!=='string'||!/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(player.action)||!range(player.stun,0,5)||typeof player.keeper!=='boolean'||
     !exact(player.visual,['knockdown','confused','crying','airborne'])||!range(player.visual.knockdown,0,1)||!range(player.visual.confused,0,1)||
     !range(player.visual.crying,0,1)||typeof player.visual.airborne!=='boolean')throw new OnlineMatchClientError('invalid-snapshot');
  const key=`${player.team}:${player.slot}`;if(slots.has(key))throw new OnlineMatchClientError('invalid-snapshot');slots.add(key);
 }
 const hazards=state.hazards;
 if(!exact(hazards,['magic','walls','nova','tornado','lightning','weather'])||!Array.isArray(hazards.magic)||hazards.magic.length>24||
    !Array.isArray(hazards.walls)||hazards.walls.length>8||!['Clear','Rain','Wind','Storm','Tornado'].includes(hazards.weather))throw new OnlineMatchClientError('invalid-snapshot');
 for(const row of hazards.magic)if(!exact(row,['kind','team','x','y','life','arm'])||!['banana','ice'].includes(row.kind)||![0,1].includes(row.team)||!range(row.x,0,1)||!range(row.y,0,1)||!range(row.life,0,10)||!range(row.arm,0,5))throw new OnlineMatchClientError('invalid-snapshot');
 for(const row of hazards.walls)if(!exact(row,['id','team','x','y','halfLength','thickness','height','duration','arm','color'])||!['magicWall','fireWall','iceWall','demonWall'].includes(row.id)||![0,1].includes(row.team)||
    !range(row.x,0,1)||!range(row.y,0,1)||!range(row.halfLength,0,1)||!range(row.thickness,0,1)||!range(row.height,0,1)||!range(row.duration,0,30)||!range(row.arm,0,5)||typeof row.color!=='string'||! /^(#[a-f0-9]{3,8}|rgba?\([0-9.,% ]+\))$/i.test(row.color))throw new OnlineMatchClientError('invalid-snapshot');
 const hazard=(value,keys,ranges)=>{
  if(value===null)return true;
  return exact(value,keys)&&range(value.x,0,1)&&range(value.y,0,1)&&ranges.every(([key,min,max])=>range(value[key],min,max))&&
   (!Object.hasOwn(value,'team')||[0,1].includes(value.team));
 };
 if(!hazard(hazards.nova,['team','x','y','radius','remaining','telegraph'],[['radius',0,1],['remaining',0,10],['telegraph',0,10]])||
    !hazard(hazards.tornado,['x','y','life','totalLife','radius'],[['life',0,10],['totalLife',0,10],['radius',0,1]])||
    !(hazards.lightning===null||(exact(hazards.lightning,['phase','x','y','radius','remaining','duration'])&&['warning','strike'].includes(hazards.lightning.phase)&&
      range(hazards.lightning.x,0,1)&&range(hazards.lightning.y,0,1)&&range(hazards.lightning.radius,0,1)&&range(hazards.lightning.remaining,0,10)&&range(hazards.lightning.duration,0,10))))
   throw new OnlineMatchClientError('invalid-snapshot');
 const bytes=typeof TextEncoder==='function'?new TextEncoder().encode(JSON.stringify(message)).length:JSON.stringify(message).length*2;
 if(bytes>8192)throw new OnlineMatchClientError('invalid-snapshot');
 return Object.freeze({matchId:message.matchId,tick:message.tick,snapshot:state});
}
function socketUrl(apiBase){
 let value;try{value=new URL(apiBase)}catch{throw new OnlineMatchClientError('not-configured')}
 if(!['https:','http:'].includes(value.protocol)||value.username||value.password||value.search||value.hash||value.pathname!=='/')throw new OnlineMatchClientError('not-configured');
 value.protocol=value.protocol==='https:'?'wss:':'ws:';value.pathname='/api/v1/matches';
 return value.href;
}

/** Browser WebSocket client; identity is conveyed only through a one-use server ticket. */
export function createOnlineMatchClient({requestTicket,requestResumeTicket=null,apiBase,WebSocketImpl=globalThis.WebSocket,onStatus=()=>{},onSnapshot=()=>{},onError=()=>{}}={}){
 if(typeof requestTicket!=='function'||typeof WebSocketImpl!=='function'||typeof onStatus!=='function'||typeof onSnapshot!=='function'||typeof onError!=='function')throw new TypeError('Invalid online match client configuration');
 const url=socketUrl(apiBase);let socket=null,matchId=null,side=null,lastSequence=0,lastRequestedSequence=0,sequenceOffset=0,disposed=false;
 const safeStatus=value=>{try{onStatus(Object.freeze(value))}catch{}};
 const safeError=value=>{try{onError(value instanceof OnlineMatchClientError?value:new OnlineMatchClientError('connection-failed'))}catch{}};
 function handleMessage(raw){
  let message;try{message=JSON.parse(typeof raw==='string'?raw:String(raw))}catch{safeError(new OnlineMatchClientError('invalid-snapshot'));return}
  if(!onlineMatchPlain(message)||typeof message.type!=='string'||Object.hasOwn(message,'userId')){safeError(new OnlineMatchClientError('invalid-snapshot'));return;}
  if(message.type==='queued'){
   if(message.reason==='opponent-disconnected'){matchId=null;side=null;lastSequence=0;lastRequestedSequence=0;sequenceOffset=0;}
   safeStatus({state:'queued',reason:typeof message.reason==='string'&&message.reason.length<=64?message.reason:null});return;
  }
  if(message.type==='matched'){
   if(!ONLINE_MATCH_ID.test(message.matchId||'')||![0,1].includes(message.side)||message.mode!==undefined&&!['quick','career-ai'].includes(message.mode)||message.resumed!==undefined&&message.resumed!==true){safeError(new OnlineMatchClientError('invalid-snapshot'));return;}
   const resumed=message.resumed===true;
   if(resumed&&(!matchId||message.matchId!==matchId||side!==message.side||message.mode==='career-ai')){safeError(new OnlineMatchClientError('invalid-snapshot'));return;}
   matchId=message.matchId;side=message.side;lastSequence=0;lastRequestedSequence=0;sequenceOffset=0;safeStatus({state:resumed?'resumed':'matched',matchId,side,...(message.mode==='career-ai'?{mode:'career-ai'}:{})});return;
  }
  if(message.type==='snapshot'){
   try{const result=validateSnapshot(message);if(!matchId||side===null||result.matchId!==matchId)throw new OnlineMatchClientError('invalid-snapshot');
    try{onSnapshot(result)}catch{};
   }catch(error){safeError(error);return;}
   return;
  }
  if(message.type==='input-rejected'){safeStatus({state:'input-rejected',reason:typeof message.reason==='string'?message.reason:'invalid-input'});return;}
  if(message.type==='queue-rejected'){safeStatus({state:'rejected',reason:typeof message.reason==='string'?message.reason:'ticket-invalid'});return;}
  if(message.type==='match-finished'){
   if(!matchId||message.matchId!==matchId){safeError(new OnlineMatchClientError('invalid-snapshot'));return;}
   safeStatus({state:'finished',matchId,side});matchId=null;side=null;return;
  }
  if(message.type==='match-error'){
   if(!exact(message,['type','matchId','code'])||!matchId||message.matchId!==matchId||!MATCH_ERROR_CODES.has(message.code)){
    safeError(new OnlineMatchClientError('invalid-snapshot'));return;
   }
   const failedMatchId=matchId,failedSide=side;matchId=null;side=null;lastSequence=0;lastRequestedSequence=0;sequenceOffset=0;
   safeStatus({state:'aborted',reason:message.code,matchId:failedMatchId,side:failedSide});return;
  }
  safeError(new OnlineMatchClientError('invalid-snapshot'));
 }
 async function connectWith(requestTicketFn){
  if(disposed)throw new OnlineMatchClientError('match-ended');
  if(socket&&[0,1].includes(socket.readyState))throw new OnlineMatchClientError('already-connected');
  let ticket;
  try{ticket=await requestTicketFn()}catch{throw new OnlineMatchClientError('connection-failed')}
  const expiresAt=ticketExpiryMs(ticket?.expiresAt);
  if(!ticket||typeof ticket.ticket!=='string'||!TICKET.test(ticket.ticket)||!Number.isSafeInteger(expiresAt)||expiresAt<=Date.now())throw new OnlineMatchClientError('ticket-invalid');
  return await new Promise((resolve,reject)=>{
   let settled=false,timer;
   let current;try{current=new WebSocketImpl(url,[WS_PROTOCOL,`ticket.${ticket.ticket}`]);socket=current}catch{socket=null;reject(new OnlineMatchClientError('connection-failed'));return;}
   const opened=()=>{if(settled)return;settled=true;clearTimeout(timer);safeStatus({state:'connecting'});resolve(true)};
   const failed=()=>{if(!settled){settled=true;clearTimeout(timer);if(socket===current)socket=null;reject(new OnlineMatchClientError('connection-failed'))}else safeError(new OnlineMatchClientError('connection-failed'));};
   const message=event=>handleMessage(event?.data);
   if(typeof current.addEventListener==='function'){current.addEventListener('open',opened,{once:true});current.addEventListener('error',failed,{once:true});current.addEventListener('message',message);current.addEventListener('close',()=>{if(!disposed)safeStatus({state:'disconnected'});if(socket===current)socket=null;});}
   else{current.onopen=opened;current.onerror=failed;current.onmessage=message;current.onclose=()=>{if(!disposed)safeStatus({state:'disconnected'});if(socket===current)socket=null;};}
   timer=setTimeout(()=>{if(!settled){settled=true;try{socket?.close()}catch{};socket=null;reject(new OnlineMatchClientError('connection-failed'));}},10000);
  });
 }
 async function connect(){return connectWith(requestTicket)}
 async function resume(){
  if(disposed||!matchId||side===null||typeof requestResumeTicket!=='function')throw new OnlineMatchClientError('match-ended');
  return connectWith(requestResumeTicket);
 }
 function sendInput(sequence,input){
  if(!socket||socket.readyState!==1||!matchId)throw new OnlineMatchClientError('match-ended');
  if(!Number.isSafeInteger(sequence)||sequence<=lastRequestedSequence||sequence-lastRequestedSequence>MAX_SEQUENCE_GAP)throw new OnlineMatchClientError('invalid-input');
  const clean=cleanInput(input);lastRequestedSequence=sequence;
  // Browser WebSocket queues are otherwise unbounded. Skip obsolete samples while
  // congested so the player controls the current game state after the link drains.
  if(Number.isFinite(socket.bufferedAmount)&&socket.bufferedAmount>MAX_BUFFERED_INPUT_BYTES){sequenceOffset++;return false;}
  const acceptedSequence=sequence-sequenceOffset;
  if(!Number.isSafeInteger(acceptedSequence)||acceptedSequence<=lastSequence||acceptedSequence-lastSequence>MAX_SEQUENCE_GAP)throw new OnlineMatchClientError('invalid-input');
  const wire=JSON.stringify({type:'input',matchId,sequence:acceptedSequence,input:clean});
  if(wire.length>4096)throw new OnlineMatchClientError('invalid-input');
  try{socket.send(wire)}catch{throw new OnlineMatchClientError('connection-failed')}
  lastSequence=acceptedSequence;return true;
 }
 function disconnect(){disposed=true;matchId=null;side=null;try{socket?.close(1000,'Leave match')}catch{};socket=null;safeStatus({state:'disconnected'});}
 return Object.freeze({connect,resume,sendInput,disconnect,get matchId(){return matchId;},get side(){return side;},get connected(){return !!socket&&socket.readyState===1;}});
}
