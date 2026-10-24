// LAN-044: real GameEngine bridge for host-authoritative Quick Match.
// The host alone runs physics; the guest only renders validated position snapshots.
// This module never modifies the offline match, team, or save formats.
const ACTIONS = Object.freeze(['pass','shoot','dribble','jump']);
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
function requireField(field) {
  if(!field || !['x','y','w','h'].every(k=>Number.isFinite(field[k])) ||
     field.w<=0 || field.h<=0) throw new TypeError('Invalid LAN playing field');
  return field;
}
function axis(value,min,span){return clamp((value-min)/span*2-1,-1,1)}
function position(value,min,span){return min+(value+1)*span/2}
function captureLanGameState(game,field,tick){
  requireField(field);
  if(!Number.isSafeInteger(tick)||tick<0)throw new TypeError('Invalid LAN match tick');
  const players=game.players.map(p=>({
    slot:p.t*11+p.i,x:axis(p.x,field.x,field.w),y:axis(p.y,field.y,field.h)
  }));
  return {
    tick,clockMs:clamp(Math.round(game.clock*1000),0,36000000),
    scores:{home:clamp(game.score[0],0,999),away:clamp(game.score[1],0,999)},
    ball:{x:axis(game.ball.x,field.x,field.w),y:axis(game.ball.y,field.y,field.h),
      z:clamp(game.ball.z/200,0,1)},players,
    meta:{half:game.half===2?2:1,
      phase:game.matchState==='finished'?'finished':game.matchState==='paused'?'paused':'play',
      controlled:{home:clamp(game.controlled?.[0]??3,0,5),away:clamp(game.controlled?.[1]??3,0,5)},
      ballOwnerSlot:game.ball.owner?game.ball.owner.t*11+game.ball.owner.i:-1}
  };
}
function applyLanGameState(game,field,state){
  requireField(field);
  const current=new Map(game.players.map(p=>[p.t*11+p.i,p]));
  for(const item of state.players){
    const p=current.get(item.slot);
    if(!p)continue;
    const x=position(item.x,field.x,field.w),y=position(item.y,field.y,field.h);
    const dx=x-p.x,dy=y-p.y;
    p.dx=dx;p.dy=dy;
    if(Math.abs(dx)>0.15)p.face=dx>0?1:-1;
    p.action=Math.hypot(dx,dy)>0.2?'run':'idle';
    p.anim=(p.anim||0)+1/60;
    p.x=x;p.y=y;
  }
  const ownerSlot=state.meta?.ballOwnerSlot??-1;
  game.ball.owner=ownerSlot<0?null:current.get(ownerSlot)||null;
  game.ball.x=position(state.ball.x,field.x,field.w);
  game.ball.y=position(state.ball.y,field.y,field.h);
  game.ball.z=state.ball.z*200;
  game.score=[state.scores.home,state.scores.away];
  if(state.meta){
    game.half=state.meta.half;
    game.controlled[0]=state.meta.controlled.home;
    game.controlled[1]=state.meta.controlled.away;
    if(state.meta.phase==='finished')game.matchState='finished';
  }else if(game.clock*1000>state.clockMs+1500 && game.half===1)game.half=2;
  game.clock=state.clockMs/1000;
}
function createLanLiveMatch({peer,role,game,input,field}){
  if(!peer || !['host','guest'].includes(role) || !game || !input) {
    throw new TypeError('Invalid LAN live match participants');
  }
  requireField(field);
  let disposed=false, tick=-1, latestTick=-1,lastSent=-1;
  let lastSnapshotAt=-Infinity,lastRemoteAt=-Infinity;
  let remote={buttons:[],dx:0,dy:0};
  let previousButtons=new Set();
  const originalPoll=input.poll;
  let stopInputs=()=>{},receiver=null;
  if(role==='host'){
    stopInputs=peer.subscribeHostInput(packet=>{
      if(disposed)return;
      remote={buttons:packet.buttons,dx:packet.dx,dy:packet.dy};
      lastRemoteAt=Date.now();
    });
    input.poll=function(){
      originalPoll.call(input,false);
      const fresh=Date.now()-lastRemoteAt<350&&peer.ready;
      const buttons=new Set(fresh?remote.buttons:[]);
      const x=fresh?remote.dx:0,y=fresh?remote.dy:0;
      const state={x,y,left:x<0?1:0,right:x>0?1:0,
        up:y<0?1:0,down:y>0?1:0,pause:0,confirm:0};
      const pressed={},releases={};
      for(const action of ACTIONS){
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
        peer.stepHostMatchFrame(tick,()=>{
          game.update(dt);
          return captureLanGameState(game,field,tick);
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
    const held=ACTIONS.filter(action=>input.held(0,action)||input.just(0,action));
    const x=Math.sign(input.state[0].x||0),y=Math.sign(input.state[0].y||0);
    peer.sendGuestInput(frame,held,x,y);
    lastSent=frame;
    return true;
  }
  function dispose(){
    if(disposed)return;
    disposed=true;
    stopInputs();
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
