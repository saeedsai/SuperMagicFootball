// LAN-044: real GameEngine bridge for host-authoritative Quick Match.
// The host alone runs physics; the guest renders validated poses and ball effects.
// This module never modifies the offline match, team, or save formats.
const LAN_LIVE_ACTIONS = Object.freeze(['pass','shoot','dribble','jump']);
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
      // Keeper pose and directional save streaks both read diveDy.
      // Older visual snapshots omit diveY and safely render neutral dives.
      p.diveDy=Number.isFinite(v.diveY)?v.diveY:0;
    }else{
      if(Math.abs(dx)>0.15)p.face=dx>0?1:-1;
      // Legacy position-only packets must clear special effects from earlier poses.
      p.z=0;p.actionTimer=0;p.stun=0;p.slideTimer=0;p.diveElapsed=0;p.diveDy=0;
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
function createLanLiveMatch({peer,role,game,input,field}){
  if(!peer || !['host','guest'].includes(role) || !game || !input) {
    throw new TypeError('Invalid LAN live match participants');
  }
  requireField(field);
  let disposed=false, tick=-1, latestTick=-1,lastSent=-1;
  let lastHostPhase=null;
  let lastSnapshotAt=-Infinity;
  // Apply only the guest input validated for the host's current frame.
  let remote={buttons:[],dx:0,dy:0};
  let previousButtons=new Set();
  const originalPoll=input.poll;
  let receiver=null;
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
      applyLanGameState(game,field,state);
      latestTick=state.tick;
      lastSnapshotAt=Date.now();
    });
  }
  function step(dt){
    if(disposed)return false;
    if(!peer.ready){
      // A reconnected guest must produce fresh button-press edges rather than
      // inheriting the old RTC session's held buttons.
      if(role==='host')previousButtons.clear();
      else {
        // A restarted host can begin its authoritative tick at zero.
        // Do not send against the disconnected session's stale snapshot.
        latestTick=-1;lastSent=-1;lastSnapshotAt=-Infinity;
      }
      return false;
    }
    if(role==='host'){
      const phase=game.matchState;
      if(!['play','paused','finished'].includes(phase))return false;
      // A pause/finish can originate in the host UI between physics frames.
      // Publish that transition once without advancing the frozen match.
      if(phase!=='play' && lastHostPhase===phase)return false;
      tick++;
      try{
        const result=peer.stepHostMatchFrame(tick,frameInput=>{
          // Only a consumed, validated packet may affect a playing frame.
          // Paused/finished frames must never apply queued guest actions.
          remote=phase==='play'?(frameInput??{buttons:[],dx:0,dy:0}):{buttons:[],dx:0,dy:0};
          try{
            if(phase==='play')game.update(dt);
            return captureLanGameState(game,field,tick);
          }finally{
            remote={buttons:[],dx:0,dy:0};
          }
        });
        // A failed send must be retried on the next step, not certified.
        if(result?.snapshotSent!==false)lastHostPhase=game.matchState;
        return true;
      }catch(error){
        // Do not let a disconnected channel keep simulating an unshared match.
        if(!peer.ready)return false;
        throw error;
      }
    }
    originalPoll.call(input,false);
    // Only the host can resume or finish a LAN match. Never queue new guest
    // actions while the latest authoritative snapshot says play is frozen.
    if(game.matchState!=='play')return false;
    if(latestTick<0 || Date.now()-lastSnapshotAt>700)return false;
    // A few lead frames absorb LAN transport latency without accepting
    // unbounded future commands or replaying a previously sent frame.
    const frame=Math.max(lastSent+1,latestTick+4);
    if(frame>latestTick+8)return false;
    const held=LAN_LIVE_ACTIONS.filter(action=>input.held(0,action)||input.just(0,action));
    const rawX=input.state[0]?.x,rawY=input.state[0]?.y;
    // Preserve proportional gamepad tilt; keyboard directions remain full strength.
    // Reject non-finite device values before they reach the validated LAN codec.
    const x=Number.isFinite(rawX)?lanLiveClamp(rawX,-1,1):0;
    const y=Number.isFinite(rawY)?lanLiveClamp(rawY,-1,1):0;
    // The RTC channel can close after ready was checked but before send.
    // Do not advance the guest frame cursor on a failed transmission: retry
    // the same frame if the connection becomes usable again.
    try { if(peer.sendGuestInput(frame,held,x,y)===false)return false; }
    catch { return false; }
    lastSent=frame;
    return true;
  }
  function dispose(){
    if(disposed)return;
    disposed=true;
    receiver?.dispose();
    if(role==='host')input.poll=originalPoll;
  }
  return Object.freeze({step,dispose,
    get role(){return role;},
    get latestTick(){return role==='host'?tick:latestTick;},
    get disposed(){return disposed;}
  });
}
export {captureLanGameState,applyLanGameState,createLanLiveMatch};
