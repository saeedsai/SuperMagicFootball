// First server-authoritative simulation seam. This module is Node-only and is
// intentionally not imported by the browser game or the signaling broker.
import {loadAssetsFromNode} from '../src/assets.js';

const ACTIONS=Object.freeze(['pass','shoot','dribble','jump']);
const SNAPSHOT_MAX_BYTES=8192;
const clone=value=>JSON.parse(JSON.stringify(value));
function plainRecord(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&
  (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);}
function exactKeys(value,expected){return plainRecord(value)&&Object.keys(value).length===expected.length&&expected.every(key=>Object.hasOwn(value,key));}
function sanitizeInput(value){
  if(!exactKeys(value,['x','y','buttons'])||!Number.isFinite(value.x)||!Number.isFinite(value.y)||
     value.x< -1||value.x>1||value.y< -1||value.y>1||!exactKeys(value.buttons,ACTIONS)||
     !ACTIONS.every(action=>typeof value.buttons[action]==='boolean'))return null;
  return Object.freeze({x:value.x,y:value.y,buttons:Object.freeze(Object.fromEntries(ACTIONS.map(action=>[action,value.buttons[action]])))});
}
function seededRandom(seed){
  let state=seed>>>0||0x6d2b79f5;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
}
function bounded(value,min,max,label){
  if(!Number.isFinite(value))throw new TypeError(`Invalid authoritative ${label}`);
  return Math.round(Math.max(min,Math.min(max,value))*10_000)/10_000;
}
function normalized(value,start,size,label){
  if(!Number.isFinite(value)||!Number.isFinite(start)||!Number.isFinite(size)||size<=0)throw new TypeError(`Invalid authoritative ${label}`);
  return bounded((value-start)/size,0,1,label);
}
function safeText(value,max,label){
  if(typeof value!=='string'||value.length<1||value.length>max)throw new TypeError(`Invalid authoritative ${label}`);
  return value;
}
function colorValue(value,fallback,label){
  const color=value??fallback;
  if(typeof color!=='string'||color.length>32||!/^(#[0-9a-f]{3,8}|rgba?\([0-9.,% ]+\))$/i.test(color))throw new TypeError(`Invalid authoritative ${label}`);
  return color;
}
function optionalHazard(value,field){
  if(!value)return null;
  return {x:normalized(value.x,field.x,field.w,'hazard.x'),y:normalized(value.y,field.y,field.h,'hazard.y')};
}
function snapshot(game,tick,field,visualFeel,teamAssetIds,rosterAssetIds){
  const clock=bounded(game.clock,0,1800,'clock'),halfSeconds=bounded(game.matchSeconds,0.001,1800,'match length');
  const score=game.score.slice(0,2).map(value=>bounded(value,0,999,'score'));
  if(!Number.isSafeInteger(tick)||tick<0||score.length!==2||game.score.length!==2||
     !Number.isSafeInteger(game.half)||![1,2].includes(game.half)||
     !['play','paused','penalty','finished'].includes(game.matchState))throw new TypeError('Invalid authoritative match state');
  const players=game.players.map(player=>{
    const team=player.t,slot=player.i,index=game.lineups?.[team]?.[slot];
    if(![0,1].includes(team)||!Number.isSafeInteger(slot)||slot<0||slot>5)throw new TypeError('Invalid authoritative player slot');
    const dx=player.action==='slide'?(player.slideDX||0):(player.dx||0),dy=player.action==='slide'?(player.slideDY||0):(player.dy||0);
    const view=visualFeel.facingView(dx,dy,player.face||1);
    const actionTimer=bounded(player.actionTimer||0,0,10,'player action timer');
    const knockdown=bounded(player.shotImpactKnockdownTimer||0,0,3,'player knockdown timer');
    const confused=bounded(player.shotImpactConfusedTimer||0,0,3,'player confused timer');
    if(!Number.isSafeInteger(index)||index<0||index>11)throw new TypeError('Invalid authoritative roster index');
    return {slot,team,index,assetId:safeText(rosterAssetIds?.[team]?.[index],129,'player asset ID'),position:{x:normalized(player.x,field.x,field.w,'player.x'),
      y:normalized(player.y,field.y,field.h,'player.y'),height:bounded((player.z||0)/250,0,1,'player height')},
      view:{kind:view.kind,side:view.side},facing:player.face<0?-1:1,
      animation:{phase:bounded(((player.anim||0)%6.28318530718+6.28318530718)%6.28318530718/6.28318530718,0,1,'player animation'),
        actionTime:actionTimer,progress:bounded(actionTimer/3.3,0,1,'player animation progress')},
      action:safeText(player.action||'idle',32,'player action'),stun:bounded(player.stun||0,0,5,'player stun'),keeper:!!player.keeper,
      visual:{knockdown:bounded(knockdown/3,0,1,'knockdown visual'),confused:bounded(confused/3,0,1,'confusion visual'),
        crying:bounded((player.cryTimer||0)/3.3,0,1,'cry visual'),airborne:(player.z||0)>12}};
  });
  if(players.length>12)throw new RangeError('Authoritative player snapshot exceeds roster bound');
  const ball=game.ball||{},owner=ball.owner?{team:ball.owner.t,slot:ball.owner.i,
    index:game.lineups?.[ball.owner.t]?.[ball.owner.i]}:null;
  if(owner&&(![0,1].includes(owner.team)||!Number.isSafeInteger(owner.slot)||owner.slot<0||owner.slot>5))throw new TypeError('Invalid authoritative ball owner');
  const shot=ball.shot?{id:safeText(ball.shot.id||'special',64,'shot id'),
    behavior:safeText(ball.shot.behavior||'normal',32,'shot behavior'),
    color:colorValue(ball.shot.color,'#f4f1dd','shot color'),trail:colorValue(ball.shot.trail,'#ffffff','shot trail'),
    underground:!!ball.shot.underground,level:bounded(ball.shot.level||1,0,5,'shot level'),
    phase:bounded(ball.shot.phase||0,-1000,1000,'shot phase'),
    transformSeconds:bounded(ball.shot.transformSeconds||1.65,.05,20,'shot transform time'),age:bounded(ball.age||0,0,60,'shot visual age')}:null;
  const magic=(game.magicHazards||[]).map(hazard=>({kind:safeText(hazard.kind,12,'hazard kind'),team:bounded(hazard.team,0,1,'hazard team'),
    x:normalized(hazard.x,field.x,field.w,'hazard.x'),y:normalized(hazard.y,field.y,field.h,'hazard.y'),
    life:bounded(hazard.life,0,10,'hazard life'),arm:bounded(hazard.arm||0,0,5,'hazard arm')}));
  if(magic.length>24)throw new RangeError('Authoritative hazard snapshot exceeds bound');
  const walls=(game.magicWalls||[]).map(wall=>({id:safeText(wall.id||'magicWall',24,'wall id'),team:bounded(wall.team,0,1,'wall team'),
    x:normalized(wall.x,field.x,field.w,'wall.x'),y:normalized(wall.y,field.y,field.h,'wall.y'),
    halfLength:bounded(wall.halfLength/field.h,0,1,'wall half length'),thickness:bounded(wall.thickness/field.w,0,1,'wall thickness'),
    height:bounded(wall.height/250,0,1,'wall height'),duration:bounded(wall.duration,0,30,'wall duration'),
    arm:bounded(wall.arm||0,0,5,'wall arm'),color:colorValue(wall.color,'#72e8ff','wall color')}));
  if(walls.length>8)throw new RangeError('Authoritative wall snapshot exceeds bound');
  const nova=game.supernova?{team:bounded(game.supernova.team,0,1,'nova team'),...optionalHazard(game.supernova,field),
    radius:bounded(game.supernova.radius/Math.max(field.w,field.h),0,1,'nova radius'),
    remaining:bounded(game.supernova.remaining,0,10,'nova remaining'),telegraph:bounded(game.supernova.telegraph,0,10,'nova telegraph')}:null;
  const tornado=game.tornado?{...optionalHazard(game.tornado,field),life:bounded(game.tornado.life,0,10,'tornado life'),
    totalLife:bounded(game.tornado.totalLife,0,10,'tornado lifetime'),radius:bounded(game.tornado.radius/Math.max(field.w,field.h),0,1,'tornado radius')}:null;
  const lightning=game.weatherLightning?{phase:safeText(game.weatherLightning.phase,12,'lightning phase'),
    ...optionalHazard(game.weatherLightning,field),radius:bounded((game.weatherLightning.radius||110)/Math.max(field.w,field.h),0,1,'lightning radius'),
    remaining:bounded(game.weatherLightning.remaining,0,10,'lightning remaining'),duration:bounded(game.weatherLightning.duration,0,10,'lightning duration')}:null;
  const output={tick,phase:game.matchState,matchState:game.matchState,terminal:game.matchState==='finished',half:game.half,
    clock,clockRemaining:bounded(Math.max(0,halfSeconds-clock),0,1800,'clock remaining'),
    clockProgress:bounded(clock/halfSeconds,0,1,'clock progress'),score,teamIds:teamAssetIds,
    controlled:game.controlled.slice(0,2),ballModel:visualFeel.validBallModel(game.options?.ballModel),
    ball:{x:normalized(ball.x,field.x,field.w,'ball.x'),y:normalized(ball.y,field.y,field.h,'ball.y'),
      height:bounded((ball.z||0)/250,0,1,'ball height'),velocity:{x:bounded((ball.vx||0)/1600,-1,1,'ball velocity x'),
        y:bounded((ball.vy||0)/1600,-1,1,'ball velocity y'),height:bounded((ball.vz||0)/800,-1,1,'ball vertical velocity')},
      owner,shot,roll:bounded(((ball.rollAngle||0)%6.28318530718+6.28318530718)%6.28318530718/6.28318530718,0,1,'ball rotation')},
    players,hazards:{magic,walls,nova,tornado,lightning,weather:safeText(game.weather||'Clear',16,'weather')}};
  if(Buffer.byteLength(JSON.stringify(output),'utf8')>SNAPSHOT_MAX_BYTES)throw new RangeError('Authoritative snapshot exceeds 8 KiB wire budget');
  return Object.freeze(output);
}

/**
 * Create a server-process-owned GameEngine for a two-side online match.
 * Inputs are held action states and normalized axes; edges are derived server-side.
 * No auth, persistence, settlement or network endpoint is provided in this increment.
 */
export async function createOnlineGameEngine({home=0,away=9,teamIds,rosterPlayerIds,halfSeconds=120,seed=1,mode='quick',humans=2}={}){
  if(!Number.isInteger(home)||!Number.isInteger(away)||home<0||away<0||home===away||
     !Number.isFinite(halfSeconds)||halfSeconds<.001||halfSeconds>1800||
      !Number.isSafeInteger(seed)||seed<0||seed>0xffffffff||!['quick','training','career-ai'].includes(mode)||
      !Number.isSafeInteger(humans)||humans<1||humans>2||(mode==='career-ai'&&humans!==1)||(mode!=='career-ai'&&humans!==2)||
      teamIds!==undefined&&(!Array.isArray(teamIds)||teamIds.length!==2||teamIds.some(id=>id!==null&&(typeof id!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(id)))))throw new TypeError('Invalid online simulation configuration');
  const assets=await loadAssetsFromNode();
  const [{ENGINE},{DATA},{VISUALFEEL}]=await Promise.all([import('../src/modules/engine.js'),import('../src/modules/data.js'),import('../src/modules/visualfeel.js')]);
  const requested=[home,away];
  if(teamIds)for(let side=0;side<2;side++)if(teamIds[side]!==null){
    const index=DATA.TEAMS.findIndex(team=>team.id===teamIds[side]);
    if(index<0)throw new RangeError('Selected online team is not in the canonical playable team catalog');
    requested[side]=index;
  }
  [home,away]=requested;
  if(home===away)throw new TypeError('Online match teams must be different');
  const field=assets.mechanics?.world?.field;
  if(!field||![field.x,field.y,field.w,field.h].every(Number.isFinite)||field.w<=0||field.h<=0)throw new Error('Online match field geometry is unavailable');
  if(home>=DATA.TEAMS.length||away>=DATA.TEAMS.length)throw new RangeError('Online simulation team index is unavailable');

  // The engine may add derived stats and mutable match state. Give it deep copies
  // so GAME_ASSETS remains a shared, immutable source of roster identities/data.
  const source=assets.teams;
  const homeId=source[home].id,awayId=source[away].id;
  if(teamIds&&(teamIds[0]!==null&&homeId!==teamIds[0]||teamIds[1]!==null&&awayId!==teamIds[1]))throw new Error('Selected online team does not match the canonical game roster');
  const canonicalPlayers=new Map();
  for(const [assetTeamId,players] of Object.entries(assets.rosters))for(const player of players||[])canonicalPlayers.set(`${assetTeamId}/${player.id}`,player);
  if(rosterPlayerIds!==undefined&&(!Array.isArray(rosterPlayerIds)||rosterPlayerIds.length!==2||rosterPlayerIds.some(lineup=>lineup!==null&&(!Array.isArray(lineup)||lineup.length!==12))))throw new TypeError('Invalid online roster selection');
  const rosterAssetIds=[homeId,awayId].map((assetTeamId,side)=>{
    const selected=rosterPlayerIds?.[side];
    return selected===null||selected===undefined?assets.rosters[assetTeamId].map(player=>`${assetTeamId}/${player.id}`):selected.slice();
  });
  const rosters=[homeId,awayId].map((assetTeamId,side)=>{
    const selectedIds=rosterAssetIds[side],base=assets.rosters[assetTeamId];
    if(!Array.isArray(base)||base.length!==12||selectedIds.length!==12||new Set(selectedIds).size!==12)throw new Error('Online simulation roster data is invalid');
    return selectedIds.map((id,index)=>{
      if(typeof id!=='string'||!/^[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9_-]{1,64}$/.test(id))throw new TypeError('Invalid online player identity');
      const player=canonicalPlayers.get(id);
      if(!player)throw new RangeError('Selected online player is not in the canonical game catalog');
      if(player.role!==base[index].role)throw new RangeError('Selected online player does not match the roster slot role');
      return clone(player);
    });
  });
  if(rosters.some(team=>!Array.isArray(team)||team.length!==12))throw new Error('Online simulation roster data is invalid');
  const options={...DATA.DEFAULT_OPTIONS,difficulty:2,halfSeconds,weather:'Clear',terrain:'Classic',condition:'Good',gameSpeed:1};
  const previous=[{},{}];
  const input={state:[{},{}],pressed:[{},{}],releases:[{},{}],tapDurations:[{},{}],
    poll(){},just(side,action){return this.pressed[side]?.[action]===true;},
    released(side,action){return this.releases[side]?.[action]===true;},
    tapDuration(side,action){return this.tapDurations[side]?.[action]||0;},
    canceled(){return false;}};
  let tick=0,random=seededRandom(seed),stepping=false,game;
  const nativeRandom=Math.random;Math.random=random;
  const lineups=[home===0?DATA.DEFAULT_LINEUP.slice():[0,1,2,3,5,9],away===0?DATA.DEFAULT_LINEUP.slice():[0,1,2,3,5,9]];
  try{game=new ENGINE.GameEngine(options,input);game.init({home,away,mode,humans,rosters,lineups,options});}
  finally{Math.random=nativeRandom;}

  function setInputs(streams){
    for(let side=0;side<2;side++){
      const next=sanitizeInput(streams[side]);
      if(!next)return false;
      const state={x:next.x,y:next.y};
      const pressed={},released={};
      for(const action of ACTIONS){
        state[action]=next.buttons[action];
        pressed[action]=state[action]&&!previous[side][action];
        released[action]=!state[action]&&!!previous[side][action];
      }
      input.state[side]=state;input.pressed[side]=pressed;input.releases[side]=released;
      previous[side]=Object.fromEntries(ACTIONS.map(action=>[action,state[action]]));
    }
    return true;
  }
  function runWithDeterministicRandom(fn){
    const nativeRandom=Math.random;
    Math.random=random;
    try{return fn();}finally{Math.random=nativeRandom;}
  }
  function step(dt,streams){
    if(game.matchState==='finished')return Object.freeze({accepted:false,reason:'terminal',snapshot:snapshot(game,tick,field,VISUALFEEL,teamAssetIds,rosterAssetIds)});
    if(game.matchState==='paused')return Object.freeze({accepted:false,reason:'paused',snapshot:snapshot(game,tick,field,VISUALFEEL,teamAssetIds,rosterAssetIds)});
    if(!Number.isFinite(dt)||dt<=0||dt>.034||!Array.isArray(streams)||streams.length!==2||
      !streams.every(sanitizeInput))return Object.freeze({accepted:false,reason:'invalid-input',snapshot:snapshot(game,tick,field,VISUALFEEL,teamAssetIds,rosterAssetIds)});
    if(stepping)throw new Error('Online simulation step is not reentrant');
    stepping=true;
    try{
      if(!setInputs(streams))return Object.freeze({accepted:false,reason:'invalid-input',snapshot:snapshot(game,tick,field,VISUALFEEL,teamAssetIds)});
      runWithDeterministicRandom(()=>{
        if(game.matchState==='play')game.update(dt);
        else if(game.matchState==='penalty')game.updatePK(dt);
      });
      tick++;
      return Object.freeze({accepted:true,reason:null,snapshot:snapshot(game,tick,field,VISUALFEEL,teamAssetIds,rosterAssetIds)});
    }finally{stepping=false;}
  }
  function resumeAfterHalftime(){
    if(game.matchState!=='paused'||game.half!==2||game.clock!==0)return false;
    game.matchState='play';return true;
  }
  const teamAssetIds=Object.freeze([homeId,awayId]);
  return Object.freeze({step,resumeAfterHalftime,get snapshot(){return snapshot(game,tick,field,VISUALFEEL,teamAssetIds,rosterAssetIds);},get sourceRosters(){return Object.freeze([homeId,awayId]);},get rosterAssetIds(){return Object.freeze(rosterAssetIds.map(ids=>Object.freeze(ids.slice())));}});
}
