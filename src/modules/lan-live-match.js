// LAN-044: real GameEngine bridge for host-authoritative Quick Match.
// The host alone runs physics; the guest only renders validated position snapshots.
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
function captureLanGameState(game,field,tick){
  requireField(field);
  if(!Number.isSafeInteger(tick)||tick<0)throw new TypeError('Invalid LAN match tick');
  const players=game.players.map(p=>({
    slot:p.t*11+p.i,x:lanLiveAxis(p.x,field.x,field.w),y:lanLiveAxis(p.y,field.y,field.h)
  }));
  return {
    tick,clockMs:lanLiveClamp(Math.round(game.clock*1000),0,36000000),
    scores:{home:lanLiveClamp(game.score[0],0,999),away:lanLiveClamp(game.score[1],0,999)},
    ball:{x:lanLiveAxis(game.ball.x,field.x,field.w),y:lanLiveAxis(game.ball.y,field.y,field.h),
      z:lanLiveClamp(game.ball.z/200,0,1)},players,
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
    if(Math.abs(dx)>0.15)p.face=dx>0?1:-1;
    p.action=Math.hypot(dx,dy)>0.2?'run':'idle';
    p.anim=(p.anim||0)+1/60;
    p.x=x;p.y=y;
  }
  const ownerSlot=state.meta?.ballOwnerSlot??-1;
  game.ball.owner=ownerSlot<0?null:current.get(ownerSlot)||null;
  game.ball.x=lanLivePosition(state.ball.x,field.x,field.w);
  game.ball.y=lanLivePosition(state.ball.y,field.y,field.h);
  game.ball.z=state.ball.z*200;
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
      if(disposed)return;
      applyLanGameState(game,field,state);
      latestTick=state.tick;
      lastSnapshotAt=Date.now();
    });
  }
  function step(dt){
    if(disposed || !peer.ready || game.matchState!=='play')return false;
    if(role==='host'){
      tick++;
      try{
        peer.stepHostMatchFrame(tick,frameInput=>{
          // Only a consumed, validated packet may affect this frame.
          // Missing or late packets produce neutral controls, not stale holds.
          remote=frameInput??{buttons:[],dx:0,dy:0};
          try{
            game.update(dt);
            return captureLanGameState(game,field,tick);
          }finally{
            remote={buttons:[],dx:0,dy:0};
          }
        });
        return true;
      }catch(error){
        // Do not let a disconnected channel keep simulating an unshared match.
        if(!peer.ready)return false;
        throw error;
      }
    }
    originalPoll.call(input,false);
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
    peer.sendGuestInput(frame,held,x,y);
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
