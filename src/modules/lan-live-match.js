// LAN-044: real GameEngine bridge for host-authoritative Quick Match.
// The host alone runs physics; the guest renders validated poses and ball effects.
// This module never modifies the offline match, team, or save formats.
import {ECONOMY} from './economy.js';
const LAN_LIVE_ACTIONS = Object.freeze(['pass','shoot','dribble','jump']);
// A rejected one-step action can survive a brief transport backpressure event,
// but it must not become a delayed command after the live host state is stale.
const MAX_PENDING_GUEST_INPUT_ATTEMPTS=3;
const MAX_PENDING_GUEST_INPUT_AGE_MS=250;
const LAN_RESULT_ACK_TIMEOUT_MS=3000;
const lanLiveClamp = (n,a,b) => Math.max(a,Math.min(b,n));
function requireField(field) {
  if(!field || !['x','y','w','h'].every(k=>Number.isFinite(field[k])) ||
     field.w<=0 || field.h<=0) throw new TypeError('Invalid LAN playing field');
  return field;
}
function lanLiveAxis(value,min,span){return lanLiveClamp((value-min)/span*2-1,-1,1)}
function lanLivePosition(value,min,span){return min+(value+1)*span/2}
const visNum=(n,max)=>lanLiveClamp(Number.isFinite(n)?n:0,0,max);
const visDirection=n=>lanLiveClamp(Number.isFinite(n)?n:0,-1,1);
// Trap rendering needs sub-pixel precision, not noisy 16-digit physics floats.
const trapWire=n=>Math.round(n*1000)/1000;
const MATCH_ID=/^[a-f0-9]{32}$/;
function secureMatchId(){
  try{
    const bytes=new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return [...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');
  }catch{return null;}
}
function validScore(score){return Array.isArray(score)&&score.length===2&&score.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=999);}
function validResult(result){
  if(!result||typeof result!=='object'||!validScore(result.score))return false;
  if(result.penalties===undefined)return Object.keys(result).length===1;
  const penalties=result.penalties;
  return Object.keys(result).length===2&&penalties&&typeof penalties==='object'&&
    Object.keys(penalties).length===2&&validScore(penalties.score)&&
    penalties.score[0]!==penalties.score[1]&&
    penalties.winner===(penalties.score[0]>penalties.score[1]?0:1);
}
function localResultAward({peer,role,matchId,result,awardResult}){
  const identity=peer?.snapshotIdentity;
  const validIdentity=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{6,32}$/.test(value);
  if(!MATCH_ID.test(matchId||'')||!identity||!validIdentity(identity.roomId)||
     !validIdentity(identity.hostId)||!validResult(result))return false;
  const hostWin=result.penalties?result.penalties.winner===0:
    result.score[0]>result.score[1];
  const guestWin=result.penalties?result.penalties.winner===1:
    result.score[1]>result.score[0];
  const outcome=hostWin?(role==='host'?'win':'loss'):
    guestWin?(role==='guest'?'win':'loss'):'draw';
  const receiptId=`lan:${identity.roomId}:${identity.hostId}:${matchId}`;
  try{
    const receipt=awardResult({receiptId,mode:'online',status:'completed',result:outcome});
    return receipt!==false&&(receipt?.ok!==false||receipt?.duplicate===true)?receiptId:false;
  }catch{return false;}
}
function captureLanGameState(game,field,tick){
  requireField(field);
  if(!Number.isSafeInteger(tick)||tick<0)throw new TypeError('Invalid LAN match tick');
  const players=game.players.map(p=>({
    slot:p.t*11+p.i,x:lanLiveAxis(p.x,field.x,field.w),y:lanLiveAxis(p.y,field.y,field.h),
    visual:{z:visNum(p.z/400,1),face:p.face<0?-1:1,
      action:typeof p.action==='string'&&/^[A-Za-z][A-Za-z0-9]{0,23}$/.test(p.action)?p.action:'idle',
      timer:visNum(p.actionTimer,10),anim:visNum(p.anim,36000),
      stun:visNum(p.stun,10),slide:visNum(p.slideTimer,10),dive:visNum(p.diveElapsed,10),
      diveY:visDirection(p.diveDy)}
  }));
  // Magic Trick ground traps are rendered from host physics; guests never
  // simulate collision/disarm. A full empty list removes expired traps.
  const hazards=(Array.isArray(game.magicHazards)?game.magicHazards:[])
    .filter(h=>(h.kind==='banana'||h.kind==='ice')&&(h.team===0||h.team===1))
    .slice(0,24).map(h=>({kind:h.kind,team:h.team,
      x:trapWire(lanLiveAxis(h.x,field.x,field.w)),
      y:trapWire(lanLiveAxis(h.y,field.y,field.h)),
      life:trapWire(visNum(h.life,3)),arm:trapWire(visNum(h.arm,.3))}));
  return {
    hazards,tick,clockMs:lanLiveClamp(Math.round(game.clock*1000),0,36000000),
    scores:{home:lanLiveClamp(game.score[0],0,999),away:lanLiveClamp(game.score[1],0,999)},
    ball:{x:lanLiveAxis(game.ball.x,field.x,field.w),y:lanLiveAxis(game.ball.y,field.y,field.h),
      z:lanLiveClamp(game.ball.z/200,0,1),
      fx:game.ball.shot?{id:game.ball.shot.id,color:game.ball.shot.color,trail:game.ball.shot.trail,
        age:visNum(game.ball.age,600),vx:lanLiveClamp(game.ball.vx||0,-20000,20000),
        vy:lanLiveClamp(game.ball.vy||0,-20000,20000)}:null},players,
    meta:{half:game.half===2?2:1,
      phase:game.matchState==='finished'?'finished':game.matchState==='paused'?'paused':'play',
      controlled:{home:lanLiveClamp(game.controlled?.[0]??3,0,5),away:lanLiveClamp(game.controlled?.[1]??3,0,5)},
      ballOwnerSlot:game.ball.owner?game.ball.owner.t*11+game.ball.owner.i:-1}
  };
}
function applyLanGameState(game,field,state){
  requireField(field);
  const current=new Map(game.players.map(p=>[p.t*11+p.i,p]));
  for(const item of state.players){
    const p=current.get(item.slot);
    if(!p)continue;
    const x=lanLivePosition(item.x,field.x,field.w),y=lanLivePosition(item.y,field.y,field.h);
    const dx=x-p.x,dy=y-p.y;
    p.dx=dx;p.dy=dy;
    if(item.visual){
      // Never replace a host jump, kick or tackle with inferred run/idle.
      const v=item.visual;
      p.face=v.face;p.z=v.z*400;p.action=v.action;p.actionTimer=v.timer;
      p.anim=v.anim;p.stun=v.stun;p.slideTimer=v.slide;p.diveElapsed=v.dive;
      // The guest draws the same confused reaction cue from the authoritative
      // stun timer; no new wire field or protocol revision is needed.
      p.shotImpactConfusedTimer=v.stun;
      // Keeper pose and directional save streaks both read diveDy.
      // Older visual snapshots omit diveY and safely render neutral dives.
      p.diveDy=Number.isFinite(v.diveY)?v.diveY:0;
    }else{
      if(Math.abs(dx)>0.15)p.face=dx>0?1:-1;
      // Legacy position-only packets must clear special effects from earlier poses.
      p.z=0;p.actionTimer=0;p.stun=0;p.shotImpactConfusedTimer=0;p.slideTimer=0;p.diveElapsed=0;p.diveDy=0;
      p.action=Math.hypot(dx,dy)>0.2?'run':'idle';
      p.anim=(p.anim||0)+1/60;
    }
    p.x=x;p.y=y;
  }
  const ownerSlot=state.meta?.ballOwnerSlot??-1;
  game.ball.owner=ownerSlot<0?null:current.get(ownerSlot)||null;
  const oldBall={x:game.ball.x,y:game.ball.y,z:game.ball.z};
  const oldShot=game.ball.shot?.id;
  game.ball.x=lanLivePosition(state.ball.x,field.x,field.w);
  game.ball.y=lanLivePosition(state.ball.y,field.y,field.h);
  game.ball.z=state.ball.z*200;
  const scoreChanged=state.scores.home!==game.score[0] || state.scores.away!==game.score[1];
  const halfChanged=state.meta?.half!==undefined && state.meta.half!==game.half;
  const fx=state.ball.fx;
  if(fx){
    // Reconstruct a bounded guest-only trail; gameplay physics stays on host.
    // Reset a reused Super Shot effect on scoring, halftime or a ball teleport.
    const displacement=Math.hypot(oldBall.x-game.ball.x,oldBall.y-game.ball.y);
    const same=oldShot===fx.id&&fx.age>=(game.ball.age||0)&&
      !scoreChanged&&!halfChanged&&displacement<=240;
    if(!same||!Array.isArray(game.ball.trail))game.ball.trail=[];
    if(same&&Math.hypot(oldBall.x-game.ball.x,oldBall.y-game.ball.y)>1)
      game.ball.trail.push(oldBall);
    game.ball.trail.push({x:game.ball.x,y:game.ball.y,z:game.ball.z});
    if(game.ball.trail.length>22)game.ball.trail.splice(0,game.ball.trail.length-22);
    game.ball.shot={id:fx.id,color:fx.color,trail:fx.trail};
    game.ball.age=fx.age;game.ball.vx=fx.vx;game.ball.vy=fx.vy;
  }else{
    // Normal passes need host-derived motion for streaks and camera tracking.
    // Never reuse a finished Super Shot's velocity on an ordinary ball.
    const elapsed=state.clockMs/1000-game.clock;
    // Restart/kickoff/goal teleports must not become a phantom pass streak.
    const displacement=Math.hypot(game.ball.x-oldBall.x,game.ball.y-oldBall.y);
    // A scored goal or halftime resets play even when the ball moves <160 px.
    if(!game.ball.owner && !scoreChanged && !halfChanged && elapsed>0 && elapsed<=.75 && displacement<=160){
      game.ball.vx=lanLiveClamp((game.ball.x-oldBall.x)/elapsed,-1600,1600);
      game.ball.vy=lanLiveClamp((game.ball.y-oldBall.y)/elapsed,-1600,1600);
    }else{
      game.ball.vx=0;game.ball.vy=0;
    }
    game.ball.age=0;game.ball.shot=null;game.ball.trail=[];
  }
  // Replace, never merge, to prevent cleared/expired traps persisting on guests.
  // Old position-only snapshots have no hazards and render none.
  game.magicHazards=(state.hazards||[]).map(h=>({kind:h.kind,team:h.team,
    x:lanLivePosition(h.x,field.x,field.w),
    y:lanLivePosition(h.y,field.y,field.h),life:h.life,arm:h.arm}));
  game.score=[state.scores.home,state.scores.away];
  if(state.meta){
    game.half=state.meta.half;
    game.controlled[0]=state.meta.controlled.home;
    game.controlled[1]=state.meta.controlled.away;
    for(const p of game.players)p.controlled=p.t===1&&p.i===game.controlled[1];
    // The guest never invents a local phase: only validated host snapshots
    // may pause, resume, or finish the remote match.
    game.matchState=state.meta.phase;
  }else if(game.clock*1000>state.clockMs+1500 && game.half===1)game.half=2;
  game.clock=state.clockMs/1000;
}
function createLanLiveMatch({peer,role,game,input,field,now=Date.now,awardResult,
  setTimer=globalThis.setTimeout,clearTimer=globalThis.clearTimeout}){
  if(!peer || !['host','guest'].includes(role) || !game || !input) {
    throw new TypeError('Invalid LAN live match participants');
  }
  requireField(field);
  if(typeof now!=='function')throw new TypeError('Invalid LAN match clock');
  if(typeof setTimer!=='function')throw new TypeError('Invalid LAN result acknowledgement timer');
  if(typeof clearTimer!=='function')throw new TypeError('Invalid LAN result acknowledgement timer cleanup');
  let disposed=false, tick=-1, latestTick=-1,lastSent=-1,pendingGuestInput=null;
  const matchId=role==='host'?secureMatchId():null;
  const award=typeof awardResult==='function'?awardResult:payload=>{
    if(!globalThis.localStorage)return false;
    return ECONOMY.create(globalThis.localStorage).awardCompletedMatch(payload);
  };
  let terminalResult=null,hostAwarded=false,hostResultDelivered=false,guestMatchId=null;
  let hostResultAckReceived=false,hostResultAwardAttempts=0;
  let hostResultAckStatus='not-started',hostResultAckTimer=null,hostResultAckObserver=null;
  const originalOnEvent=game.onEvent;
  let wrappedOnEvent=null;
  const awardHostResult=({manual=false}={})=>{
    const eligibleStatus=manual?hostResultAckStatus==='failed':['pending','fallback'].includes(hostResultAckStatus);
    if(role!=='host'||hostAwarded||!hostResultDelivered||!terminalResult||!eligibleStatus||
       (!manual&&hostResultAwardAttempts>=2))return false;
    hostResultAwardAttempts++;
    if(!localResultAward({peer,role,matchId,result:terminalResult,awardResult:award}))return false;
    hostAwarded=true;
    hostResultAckStatus=hostResultAckReceived?'confirmed':'unconfirmed';
    if(hostResultAckTimer!==null){clearTimer(hostResultAckTimer);hostResultAckTimer=null;}
    return true;
  };
  const expectedReceiptId=()=>{
    const identity=peer?.snapshotIdentity;
    const validIdentity=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{6,32}$/.test(value);
    if(!MATCH_ID.test(matchId||'')||!identity||!validIdentity(identity.roomId)||!validIdentity(identity.hostId))return null;
    return `lan:${identity.roomId}:${identity.hostId}:${matchId}`;
  };
  const onHostResultAck=packet=>{
    if(role!=='host'||hostResultAckStatus!=='pending'||hostResultAckReceived||!terminalResult||
       packet?.type!=='result-ack'||packet.receiptId!==expectedReceiptId())return;
    hostResultAckReceived=true;
    // ACK confirms that the guest saved its receipt. Keep our bounded fallback
    // alive until our own wallet receipt is also durably recorded.
    awardHostResult();
  };
  const startHostResultAckFallback=()=>{
    if(role!=='host'||hostResultAckStatus!=='not-started')return;
    hostResultAckStatus='pending';
    // Older peers ignore this optional packet. Bound the wait, then pay once
    // with an explicitly unconfirmed delivery status.
    hostResultAckTimer=setTimer(()=>{
      hostResultAckTimer=null;
      if(hostResultAckStatus!=='pending')return;
      // One retry is reserved for the existing timeout boundary. If a terminal
      // snapshot has not yet been accepted, step() gets the single attempt later.
      hostResultAckStatus='fallback';
      if(!awardHostResult())hostResultAckStatus='failed';
    },LAN_RESULT_ACK_TIMEOUT_MS);
  };
  if(role==='host'&&typeof peer.subscribeHostResultAck==='function'){
    try{hostResultAckObserver=peer.subscribeHostResultAck(onHostResultAck);}catch{/* legacy peer uses timeout fallback */}
  }
  if(role==='host'&&typeof originalOnEvent==='function'){
    wrappedOnEvent=function(event){
      if(event?.type==='finished'&&matchId){
        const result={score:Array.isArray(event.score)?event.score.slice():null};
        if(event.penalties===true&&validScore(event.pkScore)&&
           [0,1].includes(event.winner))result.penalties={score:event.pkScore.slice(),winner:event.winner};
        if(validResult(result)&&validScore(game.score)&&
           result.score[0]===game.score[0]&&result.score[1]===game.score[1])terminalResult=Object.freeze({score:Object.freeze(result.score),
          ...(result.penalties?{penalties:Object.freeze({score:Object.freeze(result.penalties.score),winner:result.penalties.winner})}:{})});
        if(terminalResult)startHostResultAckFallback();
      }
      return originalOnEvent.apply(this,arguments);
    };
    game.onEvent=wrappedOnEvent;
  }
  function retryResultAward(){
    if(disposed||role!=='host'||hostResultAckStatus!=='failed'||!hostResultDelivered)return false;
    // One explicit user activation performs one storage write. A failed retry
    // stays visible as failed; there is no timer loop or auto-retry storm.
    return awardHostResult({manual:true});
  }
  let lastHostPhase=null;
  let lastFrozenSnapshotAt=-Infinity;
  const FROZEN_HEARTBEAT_MS=1500;
  let lastSnapshotAt=-Infinity;
  // Apply only the guest input validated for the host's current frame.
  let remote={buttons:[],dx:0,dy:0};
  let previousButtons=new Set();
  // A transient missing network frame is not a physical button release.
  // Retain the last validated input for at most two simulation frames, then
  // fail closed; an explicit empty packet releases immediately.
  let lastGuestInput=null,guestInputGap=0;
  const MAX_GUEST_INPUT_GAP=2;
  const originalPoll=input.poll;
  let receiver=null;
  let statusUnsubscribe=null;
  function resetGuestCursor(){
    latestTick=-1;lastSent=-1;lastSnapshotAt=-Infinity;pendingGuestInput=null;
    // A host restart can begin a new match on the same guest page. Do not keep
    // the previous match ID as a gate for the new terminal receipt/ACK.
    guestMatchId=null;
  }
  function resetHostSession(){
    // A new transport epoch must replay its current phase even if paused or
    // finished; never inherit the previous guest's held controls or packet gap.
    previousButtons.clear();lastGuestInput=null;guestInputGap=0;lastHostPhase=null;
    lastFrozenSnapshotAt=-Infinity;
    remote={buttons:[],dx:0,dy:0};
  }
  if(role==='host'){
    input.poll=function(){
      originalPoll.call(input,false);
      const buttons=new Set(peer.ready?remote.buttons:[]);
      const rawX=peer.ready?remote.dx:0,rawY=peer.ready?remote.dy:0;
      // Match local Input.poll diagonal normalization: network guests should
      // never run 41% faster by holding two directions at once.
      const magnitude=Math.max(1,Math.hypot(rawX,rawY));
      const x=rawX/magnitude,y=rawY/magnitude;
      const state={x,y,left:x<0?1:0,right:x>0?1:0,
        up:y<0?1:0,down:y>0?1:0,pause:0,confirm:0};
      const pressed={},releases={};
      for(const action of LAN_LIVE_ACTIONS){
        state[action]=buttons.has(action)?1:0;
        pressed[action]=buttons.has(action)&&!previousButtons.has(action);
        releases[action]=!buttons.has(action)&&previousButtons.has(action);
      }
      input.state[1]=state;
      input.pressed[1]=pressed;input.releases[1]=releases;
      input.prev[1]={...state};input.tapDurations[1]={};
      previousButtons=buttons;
      // Network match pause is handled by leaving the match rather than a
      // single client's local pause key stopping both simulation loops.
      input.state[0].pause=0;input.pressed[0].pause=false;
    };
  }else{
    receiver=peer.subscribeGuestMatchState(state=>{
      // Ignore delayed, duplicate or malformed snapshots even if transport rebinds.
      // An older host state must not rewind the match or guest input cursor.
      if(disposed || !peer.ready || !Number.isSafeInteger(state?.tick) || state.tick<=latestTick)return;
      const snapshotMatchId=state.meta?.matchId;
      if(snapshotMatchId&&MATCH_ID.test(snapshotMatchId)){
        if(guestMatchId===null)guestMatchId=snapshotMatchId;
        if(snapshotMatchId===guestMatchId&&state.meta?.phase==='finished'&&
           state.meta.result&&validResult(state.meta.result)){
          const result=state.meta.result;
          if(!result.penalties&&
             (result.score[0]!==state.scores?.home||result.score[1]!==state.scores?.away)){
            // A normal-time terminal receipt must agree with the score carried
            // by the same host snapshot. Penalty shoot-outs have separate totals.
          }else{
            const receiptId=localResultAward({peer,role,matchId:snapshotMatchId,result,awardResult:award});
            if(receiptId&&typeof peer.sendGuestResultAck==='function'){
              // ACK only after the local wallet durably recorded (or recognized)
              // this exact room/host/match receipt. Repeated snapshots retry it.
              try{peer.sendGuestResultAck(receiptId);}catch{/* retry on the next terminal snapshot */}
            }
          }
        }
      }
      applyLanGameState(game,field,state);
      latestTick=state.tick;
      lastSnapshotAt=now();
    });
  }
  // Readiness can fall and recover entirely between animation frames.
  // Reset both host and guest epochs on the event, not only in step().
  if(typeof peer.subscribeStatus==='function'){
    statusUnsubscribe=peer.subscribeStatus(status=>{
      if(disposed||status?.ready!==false)return;
      if(role==='host')resetHostSession();
      else resetGuestCursor();
    });
  }
  function step(dt){
    if(disposed)return false;
    if(!peer.ready){
      // A reconnected guest must produce fresh button-press edges rather than
      // inheriting the old RTC session's held buttons.
      if(role==='host')resetHostSession();
      else {
        // A restarted host can begin its authoritative tick at zero.
        // Do not send against the disconnected session's stale snapshot.
        resetGuestCursor();
      }
      return false;
    }
    if(role==='host'){
      const phase=game.matchState;
      if(!['play','paused','finished'].includes(phase))return false;
      // A pause/finish can originate in the host UI between physics frames.
      // Publish that transition once without advancing the frozen match.
      // LAN-079: refresh a frozen phase at low rate so a lost pause/finish
      // packet cannot strand the guest in play. No frozen physics or input.
      if(phase!=='play' && lastHostPhase===phase){
        const currentTime=now();
        const age=currentTime-lastFrozenSnapshotAt;
        // Invalid clocks cannot certify a heartbeat; a clock rollback
        // refreshes once, then the stored time suppresses frame-by-frame spam.
        if(!Number.isFinite(currentTime))return false;
        if(age>=0 && age<FROZEN_HEARTBEAT_MS)return false;
      }
      tick++;
      try{
        const result=peer.stepHostMatchFrame(tick,(frameInput,guestFrame)=>{
          // Only a consumed, validated packet may affect a playing frame.
          // Paused/finished frames must never apply queued guest actions.
          if(phase==='play'&&frameInput&&guestFrame?.received!==false){lastGuestInput=frameInput;guestInputGap=0;}
          else if(phase==='play')guestInputGap++;
          else {
            // Paused/finished frames do not poll guest input. Drop the old
            // button-edge history so a new press after resume is not lost.
            lastGuestInput=null;guestInputGap=0;previousButtons.clear();
          }
          remote=phase==='play'?((guestFrame?.received===false?null:frameInput)??(guestInputGap<=MAX_GUEST_INPUT_GAP?lastGuestInput:null)??{buttons:[],dx:0,dy:0}):{buttons:[],dx:0,dy:0};
          try{
            if(phase==='play')game.update(dt);
            const state=captureLanGameState(game,field,tick);
            if(matchId){
              state.meta.matchId=matchId;
              if(game.matchState==='finished'&&terminalResult)state.meta.result=terminalResult;
            }
            return state;
          }finally{
            // LAN-075: the engine may pause/finish *inside* update(). The
            // already-published frozen snapshot makes the next step a no-op,
            // so clear button edges now rather than waiting for a frozen step.
            if(phase==='play'&&game.matchState!=='play'){
              lastGuestInput=null;guestInputGap=0;previousButtons.clear();
            }
            remote={buttons:[],dx:0,dy:0};
          }
        });
        // A failed send must be retried on the next step, not certified.
        // LAN-077: require an explicit successful transport receipt. Missing,
        // null or malformed results must not certify a frozen phase as sent;
        // preserve the retry and report failure to the caller.
        const snapshotDelivered=result?.snapshotSent===true;
        if(snapshotDelivered){
          lastHostPhase=game.matchState;
          if(lastHostPhase!=='play')lastFrozenSnapshotAt=now();
          if(lastHostPhase==='finished'){
            hostResultDelivered=true;
            if(hostResultAckStatus==='not-started')startHostResultAckFallback();
            // A fast peer can ACK synchronously while snapshot delivery is
            // still unwinding. Persist only after the host accepted delivery.
            if(hostResultAckStatus==='pending'&&hostResultAckReceived&&hostResultAwardAttempts===0){
              awardHostResult();
            }
            // A timeout may have elapsed before this terminal snapshot was
            // accepted; spend the reserved attempt once it is actually sent.
            if(hostResultAckStatus==='failed'&&hostResultAwardAttempts===0){
              hostResultAckStatus='fallback';
              if(!awardHostResult())hostResultAckStatus='failed';
            }
          }
        }
        return snapshotDelivered;
      }catch(error){
        // Do not let a disconnected channel keep simulating an unshared match.
        if(!peer.ready)return false;
        throw error;
      }
    }
    originalPoll.call(input,false);
    // Only the host can resume or finish a LAN match. Never queue new guest
    // actions while the latest authoritative snapshot says play is frozen.
    const currentTime=now();
    if(game.matchState!=='play'){
      pendingGuestInput=null;
      return false;
    }
    const snapshotAge=currentTime-lastSnapshotAt;
    // A backwards wall-clock adjustment must not keep stale guest input live.
    if(latestTick<0 || !Number.isFinite(currentTime) || !Number.isFinite(snapshotAge) || snapshotAge<0 || snapshotAge>700){
      pendingGuestInput=null;
      return false;
    }
    if(pendingGuestInput){
      const pendingAge=currentTime-pendingGuestInput.createdAt;
      if(!Number.isFinite(pendingAge) || pendingAge<0 || pendingAge>MAX_PENDING_GUEST_INPUT_AGE_MS ||
         pendingGuestInput.attempts>=MAX_PENDING_GUEST_INPUT_ATTEMPTS){
        pendingGuestInput=null;
      }
    }
    // A few lead frames absorb LAN transport latency without accepting
    // unbounded future commands or replaying a previously sent frame.
    const frame=Math.max(lastSent+1,latestTick+4);
    if(frame>latestTick+8){pendingGuestInput=null;return false;}
    const held=LAN_LIVE_ACTIONS.filter(action=>input.held(0,action)||input.just(0,action));
    const pressedEdges=LAN_LIVE_ACTIONS.filter(action=>input.just(0,action));
    const rawX=input.state[0]?.x,rawY=input.state[0]?.y;
    // Preserve proportional gamepad tilt; keyboard directions remain full strength.
    // Reject non-finite device values before they reach the validated LAN codec.
    const x=Number.isFinite(rawX)?lanLiveClamp(rawX,-1,1):0;
    const y=Number.isFinite(rawY)?lanLiveClamp(rawY,-1,1):0;
    // Keep at most one short-lived one-shot edge across a refused/ambiguous
    // send. Rebase it to this fresh host lead frame; continuous button state
    // and analog axes always come from the latest local poll. New action edges
    // merge into the bounded edge set while a retry is pending.
    const pending=pendingGuestInput;
    const retryEdges=new Set(pending?.edges||[]);
    for(const action of pressedEdges)retryEdges.add(action);
    const buttons=[...new Set([...held,...retryEdges])];
    const rememberRefusedSend=()=>{
      if(pending){
        pending.edges=[...retryEdges];
        pending.attempts++;
      }else if(pressedEdges.length){
        pendingGuestInput={edges:[...retryEdges],createdAt:currentTime,attempts:1};
      }
      return false;
    };
    // The RTC channel can close after ready was checked but before send.
    // Only the validated input packet for this current lead frame advances
    // the guest cursor. Refusal leaves it unchanged; the edge is bounded.
    try {
      const receipt=peer.sendGuestInput(frame,buttons,x,y);
      if(receipt?.type!=='input' || receipt.frame!==frame)return rememberRefusedSend();
    }
    catch { return rememberRefusedSend(); }
    lastSent=frame;
    pendingGuestInput=null;
    return true;
  }
  function dispose(){
    if(disposed)return;
    disposed=true;
    if(role==='host'&&hostResultAckTimer!==null){clearTimer(hostResultAckTimer);hostResultAckTimer=null;}
    receiver?.dispose();
    if(typeof statusUnsubscribe==='function')statusUnsubscribe();
    else statusUnsubscribe?.dispose?.();
    if(role==='host')input.poll=originalPoll;
    if(role==='host'&&wrappedOnEvent&&game.onEvent===wrappedOnEvent)game.onEvent=originalOnEvent;
    if(typeof hostResultAckObserver==='function')hostResultAckObserver();
  }
  return Object.freeze({step,dispose,retryResultAward,
    get role(){return role;},
    get resultDelivered(){return role!=='host'||hostResultDelivered;},
    get resultAckStatus(){return role==='host'?hostResultAckStatus:'not-applicable';},
    get latestTick(){return role==='host'?tick:latestTick;},
    get disposed(){return disposed;}
  });
}
export {captureLanGameState,applyLanGameState,createLanLiveMatch};
