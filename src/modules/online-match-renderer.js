// Converts validated server-owned match snapshots into the existing game's
// guest-render path. The local GameEngine never advances online physics.
import {applyLanGameState} from './lan-live-match.js';

const onlineRenderClamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const onlineRenderPosition=(value,start,size)=>start+onlineRenderClamp(value,0,1)*size;
const onlineRenderRecord=value=>value&&typeof value==='object'&&!Array.isArray(value);

function onlineVisualPlayer(player){
 const p=player.position,v=player.visual,a=player.animation;
 return {slot:player.team*11+player.slot,x:p.x*2-1,y:p.y*2-1,
  visual:{z:p.height*.625,face:player.facing,action:player.action,timer:a.actionTime,anim:a.phase*6.28318530718,
   stun:Math.max(player.stun,v.confused*3),slide:player.action==='slide'?a.actionTime:0,dive:player.action==='dive'?a.actionTime:0,diveY:0}};
}
function mapOnlineServerSnapshot(snapshot){
 const ball=snapshot.ball,shot=ball.shot;
 return {tick:snapshot.tick,clockMs:Math.round(snapshot.clock*1000),scores:{home:snapshot.score[0],away:snapshot.score[1]},
  ball:{x:ball.x*2-1,y:ball.y*2-1,z:ball.height,fx:shot?{id:shot.id,behavior:shot.behavior,color:shot.color,trail:shot.trail,
    underground:shot.underground,level:shot.level,phase:shot.phase,transformSeconds:shot.transformSeconds,age:shot.age,
    vx:ball.velocity.x*1600,vy:ball.velocity.y*1600}:null},
  players:snapshot.players.map(onlineVisualPlayer),
  hazards:snapshot.hazards.magic.map(h=>({kind:h.kind,team:h.team,x:h.x*2-1,y:h.y*2-1,life:h.life,arm:h.arm})),
  meta:{half:snapshot.half,phase:snapshot.phase,controlled:{home:snapshot.controlled[0],away:snapshot.controlled[1]},
    ballOwnerSlot:ball.owner?ball.owner.team*11+ball.owner.slot:-1}};
}

/** Apply one validated 30 Hz server snapshot for the authenticated local side. */
export function applyOnlineMatchSnapshot(game,field,snapshot,localSide,{teamIndexForId,playerForId}={}){
 if(!game||!field||!onlineRenderRecord(snapshot)||![0,1].includes(localSide)||!Array.isArray(snapshot.players)||!onlineRenderRecord(snapshot.hazards))
  throw new TypeError('Invalid online match render state');
 if(typeof teamIndexForId!=='function'||!Array.isArray(snapshot.teamIds)||snapshot.teamIds.length!==2)
  throw new TypeError('Online team resolver is required');
 const teamIndices=snapshot.teamIds.map(id=>teamIndexForId(id));
 if(teamIndices.some(index=>!Number.isSafeInteger(index)||index<0))throw new TypeError('Online match references an unavailable team');
 if(typeof playerForId!=='function')throw new TypeError('Online player resolver is required');
 const adapted=mapOnlineServerSnapshot(snapshot);
 applyLanGameState(game,field,adapted);
 // The LAN pose adapter intentionally consumes only the basic shot fields. Online
 // presentation also needs the server's visual cues (underground state and shot
 // behavior) so transformed-ball wakes and burrow/phase/warp tells stay visible.
 if(snapshot.ball.shot&&game.ball.shot){
  const shot=snapshot.ball.shot;
  Object.assign(game.ball.shot,{behavior:shot.behavior,underground:shot.underground,level:shot.level,
   phase:shot.phase,transformSeconds:shot.transformSeconds});
 }
 game.teamIds=teamIndices;game.options.ballModel=snapshot.ballModel;game.weather=snapshot.hazards.weather;
 for(const player of snapshot.players){
  const current=game.players.find(row=>row.t===player.team&&row.i===player.slot);
  if(!current)continue;
  const source=playerForId(player.assetId);
  if(!source||typeof source!=='object'||source.id!==player.assetId.split('/')[1]||!Array.isArray(game.rosters?.[player.team]))throw new TypeError('Online match references an incompatible player asset');
  game.rosters[player.team][player.index]={...source};
  Object.assign(current,source,{t:player.team,i:player.slot});
  current.controlled=player.team===localSide&&player.slot===snapshot.controlled[localSide];
  current.shotImpactKnockdownTimer=player.visual.knockdown*3;
  current.shotImpactConfusedTimer=Math.max(player.visual.confused*3,player.stun);
  current.cryTimer=player.visual.crying*3.3;
 }
 const hz=snapshot.hazards;
 game.magicWalls=hz.walls.map(w=>({id:w.id,team:w.team,x:onlineRenderPosition(w.x,field.x,field.w),y:onlineRenderPosition(w.y,field.y,field.h),
  halfLength:w.halfLength*field.h,thickness:w.thickness*field.w,height:w.height*250,duration:w.duration,arm:w.arm,color:w.color}));
 game.supernova=hz.nova?{team:hz.nova.team,x:onlineRenderPosition(hz.nova.x,field.x,field.w),y:onlineRenderPosition(hz.nova.y,field.y,field.h),
  radius:hz.nova.radius*Math.max(field.w,field.h),remaining:hz.nova.remaining,telegraph:hz.nova.telegraph}:null;
 game.tornado=hz.tornado?{x:onlineRenderPosition(hz.tornado.x,field.x,field.w),y:onlineRenderPosition(hz.tornado.y,field.y,field.h),
  life:hz.tornado.life,totalLife:hz.tornado.totalLife,radius:hz.tornado.radius*Math.max(field.w,field.h)}:null;
 game.weatherLightning=hz.lightning?{phase:hz.lightning.phase,x:onlineRenderPosition(hz.lightning.x,field.x,field.w),y:onlineRenderPosition(hz.lightning.y,field.y,field.h),
  radius:hz.lightning.radius*Math.max(field.w,field.h),remaining:hz.lightning.remaining,duration:hz.lightning.duration}:null;
 return true;
}

export {mapOnlineServerSnapshot as mapOnlineMatchSnapshot};
