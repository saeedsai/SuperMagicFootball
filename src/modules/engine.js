// Supermagic Football v0.8.25.30 | ENGINE | independently editable module
import {DRIBBLES} from "./dribbles.js";
import {KITS} from "./kits.js";
import {SPECIALS} from "./specials.js";
import {STATS} from "./stats.js";
import {JUMPMETRICS} from "./jumpmetrics.js";
import {MORALE} from "./morale.js";
import {ABILITIES} from "./abilities.js";
import {FITNESS} from "./fitness.js";
import {DATA} from "./data.js";
import {TACTICS} from "./tactics.js";
import {AI} from "./ai.js";
import {BPW} from "./bpw.js";
import {VISUALFEEL} from "./visualfeel.js";
import {SHOTFEEL} from "./shotfeel.js";
import {SHOTPATHS} from "./shotpaths.js";
import {PHYSICSBALANCE} from "./physicsbalance.js";
import {GAME_ASSETS} from "../assets.js";
import {placeBananaPeel,advanceBananaPeels,placeIcePatch,advanceIcePatches,disarmMagicHazards} from "./magic-hazards.js";
const ENGINE=(()=>{const {TEAMS,JAPAN_ROSTER,rosterFor,FORMATIONS,DEFAULT_LINEUP,SHOTS}=DATA;const {dribbleStyle,dribbleOdds}=DRIBBLES;const {aiTuning,defensivePressers}=AI;const {withStats,stat:baseStat,endurance,contest,shotError}=STATS;const {jumpMetrics}=JUMPMETRICS;const {abilityLevel,levelModifiers,shotVelocityModifier}=SPECIALS;const {clampMorale,moraleFactor,reactToTalk,goalMorale,personalityOf,TEAM_TALKS,moodLabel}=MORALE;const {kitFor}=KITS;const {fieldAbility,keeperAbility,abilityReady,keeperInReach}=ABILITIES;const {safePlan,validatePlan,tacticModifiers}=TACTICS;const {impactStun,rollDelta}=VISUALFEEL;const {MAX_SUBSTITUTIONS,initialFatigue,fatigueTick,actionFatigue,substitutionChanges,recommendSubstitute,matchCondition,breathCapacity,breathPenalty,spendBreath,breathTick,breathMovementIntensity,dribbleHoldBreathRate}=FITNESS;
// Shot impacts briefly weaken strength-based contests without ever rewriting source stats.
const stat=(p,key)=>{const value=baseStat(p,key);return key==='strength'&&p?.src&&(p.shotImpactWeaknessTimer||0)>0?value*(1-clamp(p.shotImpactWeakness||0,0,.4)*.45):value;};









const WORLD=GAME_ASSETS.mechanics.world;
const DEFENCE_WALL_MIN_LEVEL=Object.freeze({magicWall:1,fireWall:2,iceWall:3,demonWall:4});
// v0.8.25.31: conservative JSON-backed gameplay tuning; defaults reproduce 0.8.25.30 exactly.
const ENGINE_BALANCE=GAME_ASSETS.mechanics.engineBalance;
const {validatePhysicsTuning,passLaunchSpeed,keeperDiveCooldown,superShotSpeedMultiplier,superShotFatigueMultiplier}=PHYSICSBALANCE;
const PHYSICS_TUNING=validatePhysicsTuning(GAME_ASSETS.mechanics.physicsTuning);
// 105:68 real-football proportions
const SUPER_SHOT_TRANSFORM_SECONDS=GAME_ASSETS.mechanics.engineTiming.superShotTransformSeconds;
const BALL_LIFT_HOLD_SECONDS=GAME_ASSETS.mechanics.engineTiming.ballLiftHoldSeconds;
const BALL_LIFT_WINDOW_SECONDS=GAME_ASSETS.mechanics.engineTiming.ballLiftWindowSeconds;
const SUPER_BICYCLE_SPEED_CAP=GAME_ASSETS.mechanics.engineTiming.superBicycleSpeedCap; // Retained for legacy imports; unified specials use normal Super Shot power.
const AERIAL_DOUBLE_TAP_SECONDS=GAME_ASSETS.mechanics.engineTiming.aerialDoubleTapSeconds;
const F=WORLD.field, MID=F.x+F.w/2, CX=(t)=>t===0?F.x:F.x+F.w;
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));const norm=(x,y)=>{let d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}};
function randomBetween(a,b){return a+Math.random()*(b-a)}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
// A receiving outfielder briefly settles a pressured *friendly ground pass*.
// Only maximum ground movement speed is affected; ball velocity, input, kick
// timing, tackling and keeper contact are unchanged.
function firstTouchControlScale(timer,pressure,skill){
 const remain=clamp(Number.isFinite(timer)?timer:0,0,.24)/.24;
 const danger=clamp(Number.isFinite(pressure)?pressure:0,0,1);
 const control=clamp(Number.isFinite(skill)?skill:50,1,100)/100;
 return 1-remain*danger*(.10+.22*(1-control));
}
// Tackle force is measured at contact. Only victim strength changes their resilience.
function tackleStunDuration(strength,slide=false,impact=.4){
 return impactStun(slide?'slide':'tackle',Math.max(0,impact)*85,strength);
}

// Added time is capped, and only an imminent attack in the final third may prolong play.
function attackingStoppage(ball, field=WORLD.field){
 const carrier=ball?.owner;
 if(!carrier||![0,1].includes(carrier.t))return false;
 const progress=carrier.t===0?(carrier.x-field.x)/field.w:(field.x+field.w-carrier.x)/field.w;
 return progress>=ENGINE_BALANCE.attackingStoppageProgress && carrier.stun<=0;
}
// Higher super-shot level and velocity increase knockback; victim Strength resists it.
function superShotKnockback(power,level,strength){
 const pressure=Math.max(0,(power-ENGINE_BALANCE.superKnockbackReferencePower)/ENGINE_BALANCE.superKnockbackPowerSpan)
  +clamp(level,0,5)*ENGINE_BALANCE.superKnockbackLevelFactor
  -clamp(strength,1,100)*ENGINE_BALANCE.superKnockbackStrengthFactor;
 return clamp(pressure,0,ENGINE_BALANCE.superKnockbackMax);
}
function shotImpactStunSeconds(force,strength,special=false){
 const resistance=clamp(Number(strength)||50,1,100),energy=clamp(Number(force)||0,0,300);
 return clamp((special?.78:.62)+energy*(special?.0044:.0038)-resistance*(special?.0032:.0024),.5,2);
}
function shotImpactKnockdownSeconds(knock,strength){
 return clamp(1.1+clamp(Number(knock)||0,0,3.2)*.62-clamp(Number(strength)||50,1,100)*.012,.5,3);
}
function applyShotImpactWeakness(player,special){
 if(!player)return 0;
 player.shotImpactWeakness=clamp((player.shotImpactWeakness||0)+(special?.12:.08),0,.4);
 player.shotImpactWeaknessTimer=Math.max(player.shotImpactWeaknessTimer||0,3.2);
 return player.shotImpactWeakness;
}
function specialShotHeight(behavior,age,goalDistance=Infinity){
 if(!Number.isFinite(age))return null;
 if(behavior==='silverCarp'){
  const phase=((age%0.9)+0.9)%0.9/0.9;
  if(phase>.68&&phase<.84)return -8;
  return 14+54*Math.max(0,Math.sin(phase*Math.PI*2));
 }
 if(behavior==='wave'){
  const sine=Math.sin(age*Math.PI*2/1.05);
  return sine<-.48?-9:7+15*Math.max(0,sine);
 }
 if(behavior==='dolphin'){
  if(goalDistance<640)return 24+58*Math.sin(clamp((640-goalDistance)/640,0,1)*Math.PI/2);
  return age%1.1<.5?-7:8;
 }
 return null;
}

// v0.8.25.1: release-only observation for quality/rebound audits. This function
// reads the already-computed launch and surrounding actors; it NEVER influences
// the shot, keeper state, RNG, input timing, or save model.
function shotReleaseSnapshot(shooter,ball,actors,kind){
 const origin=Object.freeze({x:ball.x,y:ball.y,z:ball.z});
 const defender=actors.filter(q=>q.t!==shooter.t&&!q.keeper&&q.stun<=0)
  .map(q=>({q,d:distance(q,origin)})).sort((a,b)=>a.d-b.d)[0];
 const goalkeeper=actors.find(q=>q.t!==shooter.t&&q.keeper);
 const keeper=goalkeeper?Object.freeze({x:goalkeeper.x,y:goalkeeper.y,
  fatigue:goalkeeper.fatigue,diveCooldown:goalkeeper.diveCooldown||0,
  distance:distance(goalkeeper,origin)}):null;
 const nearestDefender=defender?Object.freeze({x:defender.q.x,y:defender.q.y,
  distance:defender.d,stun:defender.q.stun||0}):null;
 const goalX=shooter.t===0?WORLD.field.x+WORLD.field.w:WORLD.field.x;
 // Proximity is not shooting-lane pressure: report the closest defender to
 // the actual straight release-to-target segment as a separate observation.
 // No RNG, state writes or physics changes; project in the attacking direction.
 const laneY=Number.isFinite(ball.targetY)?ball.targetY:
  (Math.abs(ball.vx)>1?origin.y+(goalX-origin.x)*ball.vy/ball.vx:origin.y);
 const dx=goalX-origin.x,dy=laneY-origin.y,len2=dx*dx+dy*dy;
 const lane=actors.filter(q=>q.t!==shooter.t&&!q.keeper&&q.stun<=0)
  .map(q=>{const progress=len2>1?((q.x-origin.x)*dx+(q.y-origin.y)*dy)/len2:0;
   return {q,progress,offset:Math.abs((q.x-origin.x)*dy-(q.y-origin.y)*dx)/Math.sqrt(Math.max(1,len2))};})
  .filter(r=>r.progress>.025&&r.progress<.975).sort((a,b)=>a.offset-b.offset)[0];
 const laneBlocker=lane?Object.freeze({x:lane.q.x,y:lane.q.y,
  offset:lane.offset,progress:lane.progress}):null;
 return Object.freeze({kind,team:shooter.t,shooterId:shooter.src.id,
  player:shooter.src.name,origin,velocity:Object.freeze({x:ball.vx,y:ball.vy,z:ball.vz}),
  speed:Math.hypot(ball.vx,ball.vy),power:ball.power,
  targetY:Number.isFinite(ball.targetY)?ball.targetY:null,
  goalDistance:Math.abs(goalX-origin.x),shotId:ball.shot?.id||null,
  nearestDefender,goalkeeper:keeper,laneBlocker});
}
// Position toward where an incoming shot will cross the keeper's depth,
// rather than blindly following its current y. Both goal directions are mirrored.
// Prediction is capped to avoid unfair 'teleporting' response to distant shots.
// Deterministic short-horizon replay of the same curved / zigzagging / homing shot
// acceleration used in updateBall. Never mutates live ball or the shot's phase.
// We intentionally predict only up to the keeper plane (max 0.95 s): no clairvoyance
// about rebounds, collision outcomes, or supernatural random teleports.
function predictKeeperShot(keeper,ball,horizon=ENGINE_BALANCE.keeperPredictionMaxSeconds){
 if(!keeper||!ball||ball.owner||ball.shot?.underground)return null;
 const toward=keeper.t===0?-1:1;
 if((ball.vx||0)*toward<=100)return null;
 const frame=1/90,maxTime=clamp(horizon,0,ENGINE_BALANCE.keeperPredictionMaxSeconds);
 const v={x:ball.x,y:ball.y,z:ball.z||0,vx:ball.vx,vy:ball.vy||0,vz:ball.vz||0,age:ball.age||0};
 const shot=ball.shot?{...ball.shot}:null;
 if(!Number.isFinite(v.x)||!Number.isFinite(v.y)||!Number.isFinite(v.vx)||!Number.isFinite(v.vy))return null;
 for(let time=0;time<maxTime;time+=frame){
  const dt=Math.min(frame,maxTime-time),old={...v};v.age+=dt;
  // Predict the same bounded zigzag displacement as the live ball; no separate
  // invented goalkeeper trajectory or knowledge beyond the keeper plane.
  if(shot?.behavior==='zigzag'){const turn=SHOTPATHS.zigzagStep(shot,v.age-dt,v.age);v.vy+=turn.deltaVy;v.y+=turn.correctionY;}
  if(shot?.behavior==='curve'){const turn=SHOTPATHS.curveStep(shot,v.age-dt,v.age);v.vy+=turn.deltaVy;v.y+=turn.correctionY;}
  if(shot?.behavior==='spiral'){const turn=SHOTPATHS.spiralStep(shot,v.age-dt,v.age);v.vy+=turn.deltaVy;v.y+=turn.correctionY;v.vz+=turn.deltaVz;v.z+=turn.correctionZ;}
  if(shot?.behavior==='homing'||shot?.behavior==='dolphin'){const turn=SHOTPATHS.homingStep(shot,v.age-dt,v.age);v.vy+=turn.deltaVy;v.y+=turn.correctionY;}
  if(shot?.behavior==='wave'){const turn=SHOTPATHS.waveStep(shot,v.age-dt,v.age);v.vy+=turn.deltaVy;v.y+=turn.correctionY;}
  if(shot?.behavior==='birdDodge'){const target=Math.sign(v.vx||1)*690;v.vx+=clamp(target-v.vx,-320*dt,320*dt);}
  if(shot?.behavior==='warp'){const turn=SHOTPATHS.warpStep(shot,v.age-dt,v.age);v.vy+=turn.deltaVy;v.y+=turn.correctionY;}
  if(shot&&v.age<SUPER_SHOT_TRANSFORM_SECONDS){
   const s=shot;
   if(s.behavior==='swim')v.vy+=Math.sin(v.age*18)*840*dt;
   if(s.behavior==='clone')v.vy+=Math.sin(v.age*20)*250*dt;
   if(s.behavior==='burrow'){if(v.age>.12)v.z=Math.max(3,Math.min(v.z,9));v.vz=0;}
   if(s.behavior==='lightning')v.vy+=Math.sin(v.age*30)*380*dt;
  }
  v.x+=v.vx*dt;v.y+=v.vy*dt;v.z+=v.vz*dt;v.vz-=500*dt;
  if(v.z<0){v.z=0;v.vz=Math.abs(v.vz)*.45;if(Math.abs(v.vz)<47)v.vz=0;}
  if(shot){const height=specialShotHeight(shot.behavior,v.age,Math.abs(keeper.x-v.x));if(height!==null){shot.underground=height<0;v.z=Math.max(0,height);v.vz=0;}else shot.underground=false;}
  if(v.y<WORLD.field.y+3){v.y=WORLD.field.y+3;if(shot?.behavior==='ricochet'){const bank=SHOTPATHS.ricochetBounce(shot.ricochetBounces,v.vy,.65,-1);v.vy=bank.velocity;shot.ricochetBounces=bank.bounces;if(!bank.active)shot.behavior='normal';}else v.vy=Math.abs(v.vy)*.65;}
  if(v.y>WORLD.field.y+WORLD.field.h-3){v.y=WORLD.field.y+WORLD.field.h-3;if(shot?.behavior==='ricochet'){const bank=SHOTPATHS.ricochetBounce(shot.ricochetBounces,v.vy,.65,1);v.vy=bank.velocity;shot.ricochetBounces=bank.bounces;if(!bank.active)shot.behavior='normal';}else v.vy=-Math.abs(v.vy)*.65;}
  if(!shot?.underground&&(keeper.x-old.x)*(keeper.x-v.x)<=0){
   const fraction=clamp((keeper.x-old.x)/(v.x-old.x||1),0,1);
   return {y:old.y+(v.y-old.y)*fraction,z:old.z+(v.z-old.z)*fraction,time:time+dt*fraction,behavior:shot?.behavior||'normal'};
  }
 }
 return null;
}
// Predicted near-future destination is blended with observed lane. Keeper Skill
// and GK Diving improve anticipation, whereas nonlinear/high-level special shots
// reduce confidence. The goalkeeper must still physically move into the lane.
function predictedKeeperLane(keeper,ball,read=0){
 const low=WORLD.goalTop+15,high=WORLD.goalBottom-15;
 const observed=clamp((ball?.y??(low+high)/2)+(ball?.vy||0)*clamp(read,0,.3),low,high);
 if(!keeper||!ball||ball.owner||ball.attacker===keeper.t)return observed;
 const projected=predictKeeperShot(keeper,ball);
 if(!projected)return observed;
 const skill=stat(keeper,'gkSkill'),diving=stat(keeper,'gkDiving');
 const level=ball.shot?clamp(Number(ball.shot.level)||1,1,5):0;
 const erratic=['zigzag','swim','warp','lightning','spiral','ricochet','clone'].includes(projected.behavior);
 const reliability=clamp(.30+skill*.004+diving*.0015-level*.032-(erratic?.14:0)-(keeper.fatigue||0)*.10,.17,.79);
 return clamp(observed*(1-reliability)+clamp(projected.y,low,high)*reliability,low,high);
}
// A keeper has less time to reach wide angles against very fast/super shots.
// GK Skill and GK Diving extend reach; fatigue and shot velocity reduce it.
// The calculation is deterministic so save-rate tests can compare equivalent shots.
function keeperReactionReach(keeper, ball){
 const skill=stat(keeper,'gkSkill'),diving=stat(keeper,'gkDiving');
 const speed=Math.hypot(ball?.vx||0,ball?.vy||0);
 const level=ball?.shot?clamp(Number(ball.shot.level)||1,1,5):0;
 const fatigue=clamp(keeper?.fatigue||0,0,1);
 // Erratic nonlinear super shots cannot be defended with the same anticipation
 // as a predictable straight shot, even at equivalent nominal power/level.
 const behavior=ball?.shot?.behavior;
 const nonlinearPenalty=['zigzag','swim','warp','lightning','spiral','ricochet','clone'].includes(behavior)?.075:(behavior==='curve'||behavior==='homing'||behavior==='dolphin'?.025:0);
 const response=clamp(.98+(skill-55)*.0025+(diving-55)*.002-Math.max(0,speed-450)*.00011-level*.035-nonlinearPenalty-fatigue*.13,.54,1.08);
 // A bounded lateral save radius leaves a real corner target even against elite
 // keepers. Fatigue also reduces the cap, so an exhausted star is not immune
 // to normal shots just because the uncapped reach was above the goal width.
 // At very short flight times, even an elite keeper cannot cover an entire
 // corner lane from a standing position. This affects only reactive lateral
 // reach; keeper skill, positioning, and existing dive cooldown are unchanged.
 const toward=keeper.t===0?-1:1;
 const approaching=(ball?.vx||0)*toward>80;
 const timeToContact=approaching?Math.abs((keeper.x-(ball?.x||keeper.x))/(ball.vx||1)):1;
 const closeReaction=clamp((.24-timeToContact)/.24,0,1);
 const lateralCap=(116-22*fatigue)*(1-.19*closeReaction);
 const reactiveReach=(36+diving*.92+skill*.16)*response*(1-.19*closeReaction);
 return {x:(105+diving*1.35)*(.85+response*.15),y:Math.min(lateralCap,reactiveReach),z:(45+diving*1.7),response,timeToContact};
}
// Keepers cannot instantly dive again after a save. Better GK Skill and GK
// Diving shorten recovery, while accumulated fatigue lengthens it. This affects
// actual match play and is separate from the shorter rendered landing motion.
// v0.8.24: A rare automatic keeper ability is considered ONCE per incoming
// transformed shot, only when a live threat is already inside ability range.
// Do not repeatedly roll its probability at 30/60/120 FPS: that made the same
// shot much more likely to trigger a supernatural save on faster devices.
function keeperAutoSuperEligible(keeper,ball){
 if(!keeper?.keeper||!ball?.shot||ball.owner||ball.shot.keeperAutoConsidered)return false;
 if(ball.attacker!==1-keeper.t)return false;
 const toward=keeper.t===0?-1:1;
 if(!Number.isFinite(ball.vx)||ball.vx*toward<=100)return false;
 if(!Number.isFinite(ball.y)||ball.y<WORLD.goalTop-80||ball.y>WORLD.goalBottom+80)return false;
 const move=keeperAbility(keeper.src);
 if(!abilityReady(keeper,move))return false;
 const modifiers=levelModifiers(abilityLevel(keeper,'keeper'));
 return keeperInReach(keeper,ball,{...move,reachX:move.reachX*modifiers.reach,reachY:move.reachY*modifiers.reach});
}
function keeperDiveRecoverySeconds(keeper){
 const skill=stat(keeper,'gkSkill'),diving=stat(keeper,'gkDiving');
 const fatigue=clamp(keeper?.fatigue||0,0,1);
 return keeperDiveCooldown(skill,diving,fatigue,PHYSICS_TUNING);
}
class GameEngine{
 constructor(options={},input){this.options=options;this.input=input;this.events=[];this.mode='quick';this.matchState='none';this.teamIds=[0,9];this.rosters=[[],[]];this.lineups=[DEFAULT_LINEUP.slice(),[0,1,2,3,5,9]];this.formation=['2-1-2','2-1-2'];this.teamPlans=[];this.controlled=[3,3,0,0];this.humans=1;this.score=[0,0];this.half=1;this.clock=0;this.matchSeconds=120;this.players=[];this.ball={};this.particles=[];this.magicHazards=[];this.shake=0;this.flash=0;this.weather='Clear';this.terrain='Grass';this.condition='Good';this.wind={x:0,y:0};this.stormTimer=0;this.tornado=null;this.celebration=0;this.pendingKickoff=null;this.goalHero=null;this.cooldown=0;this.pk=null;this.matchSerial=0;this.fatigueLedger=[{},{}];this.playerSeconds=[{},{}];this.substitutionsUsed=[0,0];this.subbedOut=[new Set(),new Set()];this.maxSubstitutions=MAX_SUBSTITUTIONS;this.moraleLedger=[{},{}];this.talksUsed=[{},{ }];this.celebrationStyle=0;this.onEvent=()=>{};this.aiComboNext=[0,0];this.aiComboThink=[0,0];this.autoSwitchAccum=[0,0];this.manualSwitchGrace=[0,0];this.stoppageWindow=0;this.stoppageAnnounced=false;this._shotAudit=null;this._reboundAudit=null;this._shotAuditNext=0;}
 // Additive telemetry. Never queries RNG or changes ball/actors/keeper logic.
 _auditOutcome(outcome,extra={}){
  if(!this._shotAudit)return;
  const trace=this._shotAudit;this._shotAudit=null;
  this.emit('shotOutcome',{auditId:trace.id,team:trace.release.team,
   shooterId:trace.release.shooterId,kind:trace.release.kind,outcome,...extra});
  if(outcome==='keeperDeflection')this._reboundAudit={id:trace.id,team:trace.release.team};
 }
 // A restart or match transition must not silently drop an unfinished trace.
 // These are read-only audit events; no RNG, keeper, ball or actor state changes.
 _closeShotAudits(reason){
  if(this._shotAudit)this._auditOutcome('unresolved',{reason});
  if(this._reboundAudit){const r=this._reboundAudit;this._reboundAudit=null;
   this.emit('reboundUnresolved',{auditId:r.id,reason});}
 }
 _auditTake(p){
  if(this._reboundAudit){const r=this._reboundAudit;this._reboundAudit=null;
   this.emit('reboundRecovery',{auditId:r.id,recoveredByTeam:p.t,
    recoveredByPlayer:p.src.id,attackingRecovery:p.t===r.team});}
  if(this._shotAudit)this._auditOutcome(p.keeper?'keeperCatch':'playerInterception',
   {byTeam:p.t,byPlayer:p.src.id});
 }
 emit(type,data={}){
  if(type==='finished')this._closeShotAudits('matchFinished');
  const ev={type,...data};
  if(type==='shotRelease'){
   if(this._shotAudit)this._auditOutcome('superseded');
   if(this._reboundAudit){this.emit('reboundUnresolved',{auditId:this._reboundAudit.id,reason:'nextShot'});this._reboundAudit=null;}
   this._shotAudit={id:++this._shotAuditNext,release:data.release};ev.auditId=this._shotAudit.id;
  }
  this.events.push(ev);this.onEvent(ev);
  if(type==='save'&&this._shotAudit){this._auditOutcome(ev.deflected?'keeperDeflection':'keeperCatch',
   {saveType:ev.saveType||'unspecified',byTeam:ev.player?.t??null});}
  else if(type==='keeperSuper'&&this._shotAudit)this._auditOutcome('keeperDeflection',{saveType:'keeperSuper',byTeam:ev.team});
  else if(type==='goal'){
   if(this._shotAudit)this._auditOutcome('goal',{scoringTeam:ev.team});
   if(this._reboundAudit){this.emit('reboundUnresolved',{auditId:this._reboundAudit.id,reason:'goal'});this._reboundAudit=null;}
  }
 }
 init({home=0,away=9,mode='quick',humans=1,rosters,formations,lineups,plans,options=this.options}={}){
 this._closeShotAudits('newMatch');
 this.options=options;this.mode=mode;this.humans=humans;this.teamIds=[home,away];this.rosters=(rosters||[rosterFor(home),rosterFor(away)]).map(team=>team.map(withStats));this.lineups=lineups||[home===0?DEFAULT_LINEUP.slice():[0,1,2,3,5,9],away===0?DEFAULT_LINEUP.slice():[0,1,2,3,5,9]];this.formation=formations||[options.formation||'2-1-2','2-1-2'];this.teamPlans=[0,1].map(t=>safePlan(plans?.[t]||{formation:this.formation[t],lineup:this.lineups[t]},this.rosters[t],t===0?home:away));this.formation=this.teamPlans.map(p=>p.formation);this.lineups=this.teamPlans.map(p=>p.lineup.slice());this.score=[0,0];this.half=1;this.clock=0;this.matchSeconds=options.halfSeconds||120;this.weather=options.weather==='Random'?['Clear','Rain','Wind','Storm','Tornado'][Math.floor(Math.random()*5)]:options.weather||'Clear';this.terrain=options.terrain||'Grass';this.condition=options.condition||'Good';this.wind={x:0,y:0};this.ball={x:MID,y:F.y+F.h*.5,z:0,vx:0,vy:0,vz:0,owner:null,shot:null,trail:[],age:0,power:0,canCollect:0,targetY:0,attacker:-1,lastTouchTeam:-1};this.players=[];this.particles=[];this.magicHazards=[];this.magicWalls=[];this.supernova=null;this.events=[];this.controlled=[3,3,0,0];this.shake=0;this.flash=0;this.celebration=0;this.pendingKickoff=null;this.goalHero=null;this.cooldown=0;this.stormTimer=2;this.tornado=null;this.weatherLightning=null;this.pk=null;this.matchSerial++;const weatherSeed=Number.isInteger(options.weatherSeed)?options.weatherSeed:(0x6d2b79f5^Math.imul(this.matchSerial,0x85ebca6b)^Math.imul(home+1,0xc2b2ae35)^Math.imul(away+1,0x27d4eb2f));this.weatherSeed=(weatherSeed>>>0)||1;this.aiComboNext=[0,0];this.aiComboThink=[0,0];this.autoSwitchAccum=[0,0];this.manualSwitchGrace=[0,0];this.stoppageWindow=0;this.stoppageAnnounced=false;this._shotAudit=null;this._reboundAudit=null;this._shotAuditNext=0;this.fatigueLedger=this.rosters.map(roster=>Object.fromEntries(roster.map(p=>[p.id,initialFatigue(p)])));this.moraleLedger=this.rosters.map(roster=>Object.fromEntries(roster.map(p=>[p.id,clampMorale(p.morale??55)])));this.talksUsed=[{},{}];this.celebrationStyle=0;this.playerSeconds=[{},{}];this.substitutionsUsed=[0,0];this.subbedOut=[new Set(),new Set()];this.spawnPlayers();this.resetKickoff(0);this.matchState='play';this.emit('start',{mode});}
 spawnPlayers(){if(this.rideBall)this.cancelRideBall('reset');const trialShotId=this.options?.arcadeShotId,trialShot=Object.hasOwn(SHOTS,trialShotId)?SHOTS[trialShotId]:null,trialPlayerId=this.options?.arcadeShotPlayerId;if(['quick','versus','training'].includes(this.mode)&&trialShot){const trialIndex=this.rosters[0]?.findIndex(p=>p.id===trialPlayerId)??-1,trialPlayer=this.rosters[0]?.[trialIndex];if(trialPlayer&&this.lineups[0]?.includes(trialIndex)&&['MF','FW'].includes(trialPlayer.role)&&(!trialPlayer.superAbility||trialPlayer.superAbility.type==='shoot')){trialPlayer.shot=trialShotId;trialPlayer.shotName=trialShot.name||trialShotId;trialPlayer.superShotLevel=1;trialPlayer.superAbility={type:'shoot',name:trialPlayer.shotName,level:1};}}if(this.rideBall)this.cancelRideBall('reset');const old=new Map(this.players.map(p=>[`${p.t}:${p.src.id}`,{fatigue:p.fatigue,stun:p.stun,morale:p.morale,cryTimer:p.cryTimer,abilityCd:p.abilityCd,dashCooldown:p.dashCooldown,diveCooldown:p.diveCooldown,comboCooldown:p.comboCooldown,contactCooldown:p.contactCooldown, trickCd:p.trickCd,breath:p.breath,dribbleCooldown:p.dribbleCooldown, trickGuard:p.trickGuard}]));this.players=[];for(let t=0;t<2;t++)for(let i=0;i<6;i++){
 const src=this.rosters[t][this.lineups[t][i]],home=FORMATIONS[this.formation[t]][i];let x=F.x+(t===0?home.x:1-home.x)*F.w,y=F.y+home.y*F.h;
 this.players.push({t,i,src,x,y,homeX:x,homeY:y,face:t===0?1:-1,dx:0,dy:0,z:0,vz:0,jumpCount:0,jumpHold:0,jumpTapPending:false,dribbleHold:0,ballLiftWindow:0,ballLiftLock:false,aerialComboAction:null,aerialComboTimer:0,aerialComboTaps:0,stun:0,shotImpactWeakness:0,shotImpactWeaknessTimer:0,shotImpactConfusedTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactKnockdownTotal:0,shotImpactRiseTimer:0,anim:0,action:'idle',actionTimer:0,invuln:0,breath:old.get(`${t}:${src.id}`)?.breath??breathCapacity(stat(src,'stamina')),fatigue:old.get(`${t}:${src.id}`)?.fatigue??this.fatigueLedger[t][src.id]??initialFatigue(src),moveVX:0,moveVY:0,morale:old.get(`${t}:${src.id}`)?.morale??this.moraleLedger[t][src.id]??55,cryTimer:old.get(`${t}:${src.id}`)?.cryTimer??0,abilityCd:old.get(`${t}:${src.id}`)?.abilityCd??0,abilityFx:0,dashTimer:0,sprintCharge:0,dashCooldown:old.get(`${t}:${src.id}`)?.dashCooldown??0,keeperHold:0,diveDy:0,diveDx:0,diveElapsed:0,diveIntentCooldown:0,diveIntentPending:false,diveAdvanceTravel:0,diveCooldown:old.get(`${t}:${src.id}`)?.diveCooldown??0,comboCooldown:old.get(`${t}:${src.id}`)?.comboCooldown??0,contactCooldown:old.get(`${t}:${src.id}`)?.contactCooldown??0,trickCd:old.get(`${t}:${src.id}`)?.trickCd??0,dribbleCooldown:old.get(`${t}:${src.id}`)?.dribbleCooldown??0,trickGuard:old.get(`${t}:${src.id}`)?.trickGuard??0,hideBallTimer:0,hideBallReveal:0,fireballBurnFx:0,sandTrapFx:0,mudSlowTimer:0,mudTrickFx:0,windTrickFx:0,lightningMark:0,lightningFx:0,lightningPending:null,teleportTrail:null,trickFx:0,trickStyleId:null,firstTouchFx:0,firstTouchControlTimer:0,comboWindow:0,comboActive:false,assistBy:null,assistFx:0,cd:0,specialCd:0,controlled:false,keeper:i===0,down:false,charge:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,aiComboGoal:null});}
 }
 applyPlan(t,raw){
  if(t!==0&&t!==1)throw Error('Invalid team');
  const next=validatePlan(raw,this.rosters[t],this.teamIds[t]);
  // Substitutions are only allowed during a stoppage, and are irreversible.
  if(this.matchState!=='paused')throw Error('Tactical changes and substitutions require a paused match');
  const changes=substitutionChanges(this.lineups[t],next.lineup);
  if(changes.out.length!==changes.in.length)throw Error('Invalid substitution');
  if(this.substitutionsUsed[t]+changes.out.length>this.maxSubstitutions)throw Error('Only '+this.maxSubstitutions+' substitutions permitted per team');
  if(changes.in.some(i=>this.subbedOut[t].has(this.rosters[t][i].id)))throw Error('A substituted-off player cannot return');
  if(changes.in.some(i=>(this.rosters[t][i].injuryWeeks||0)>0))throw Error('An injured player cannot enter');
  const prev=this.players.filter(p=>p.t===t);const existing=new Map(prev.map(p=>[p.src.id,{fatigue:p.fatigue,breath:p.breath,stun:p.stun,morale:p.morale,cryTimer:p.cryTimer,abilityCd:p.abilityCd,dashCooldown:p.dashCooldown,diveCooldown:p.diveCooldown,comboCooldown:p.comboCooldown,contactCooldown:p.contactCooldown,trickCd:p.trickCd,dribbleCooldown:p.dribbleCooldown,trickGuard:p.trickGuard}]));
  for(const player of prev)this.fatigueLedger[t][player.src.id]=player.fatigue;
  this.substitutionsUsed[t]+=changes.out.length;
  for(const id of changes.out)this.subbedOut[t].add(this.rosters[t][id].id);
  this.teamPlans[t]=next;this.lineups[t]=next.lineup.slice();this.formation[t]=next.formation;
  for(let i=0;i<6;i++){
   const p=this.player(t,i),src=this.rosters[t][next.lineup[i]],kept=existing.get(src.id);
   const pos=FORMATIONS[next.formation][i],targetX=F.x+(t===0?pos.x:1-pos.x)*F.w,targetY=F.y+pos.y*F.h;
   if(p.src.id!==src.id){
    if(this.ball.owner===p){this.ball.owner=null;this.ball.vx=0;this.ball.vy=0;this.ball.canCollect=.3;}
    p.src=src;p.keeperHold=0;p.diveDy=0;p.diveDx=0;p.diveElapsed=0;
     // The entering goalkeeper must not inherit the outgoing keeper's pending dive.
     p.diveIntentCooldown=0;p.diveIntentPending=false;p.diveAdvanceTravel=0;
     if(['keeperDive','keeperDiveCatch','keeperRecover'].includes(p.action)){
      p.action='idle';p.actionTimer=0;p.z=0;p.vz=0;
     }
     p.fatigue=kept?.fatigue??this.fatigueLedger[t][src.id]??initialFatigue(src);p.breath=kept?.breath??breathCapacity(stat(src,'stamina'));p.morale=kept?.morale??this.moraleLedger[t][src.id]??55;p.cryTimer=kept?.cryTimer??0;p.abilityCd=kept?.abilityCd??0;p.abilityFx=0;p.dashTimer=0;p.sprintCharge=0;p.dashCooldown=kept?.dashCooldown??0;p.diveCooldown=kept?.diveCooldown??0;p.comboCooldown=kept?.comboCooldown??0;p.contactCooldown=kept?.contactCooldown??0;p.trickCd=kept?.trickCd??0;p.dribbleCooldown=kept?.dribbleCooldown??0;p.trickGuard=kept?.trickGuard??0;p.fireballBurnFx=0;p.sandTrapFx=0;p.mudSlowTimer=0;p.mudTrickFx=0;p.windTrickFx=0;p.lightningMark=0;p.lightningFx=0;p.lightningPending=null;p.teleportTrail=null;p.trickFx=0;p.trickStyleId=null;p.firstTouchFx=0;p.firstTouchControlTimer=0;p.firstTouchPressure=0;p.comboWindow=0;p.comboActive=false;p.assistBy=null;p.assistFx=0;p.stun=0;p.cd=0;p.charge=0;
   }
   p.homeX=targetX;p.homeY=targetY;p.keeper=i===0;
   // New players join near their assigned position; old ones keep moving to new positions.
   if(!kept){p.x=targetX;p.y=targetY;p.moveVX=p.moveVY=0;}
  }
  if(this.controlled[t]>=6||this.controlled[t]<0)this.controlled[t]=3;
  // Tactical-style and formation-only changes are not player substitutions.
  if(changes.out.length>0)this.emit('substitution',{team:t,count:changes.out.length,used:this.substitutionsUsed[t],max:this.maxSubstitutions});
  this.toast(TEAMS[this.teamIds[t]].name+' tactics updated'+(changes.out.length?' · '+this.substitutionsUsed[t]+'/'+this.maxSubstitutions+' subs':''));return next;
 }
 getTeam(t){return kitFor(TEAMS[this.teamIds[t]],this.options.kitChoices?.[t]|| (t===0?'home':'away'))}
 player(t,i){return this.players.find(p=>p.t===t&&p.i===i)}
 controlledPlayer(t){return this.player(t,this.controlled[t])}
 // Talk choices are allowed once before kick-off and once at halftime, per team.
 applyTeamTalk(team,choice='none',phase='pregame'){
  if(![0,1].includes(team))throw Error('Invalid team talk side');
  if(!['pregame','halftime'].includes(phase)||!TEAM_TALKS[choice])throw Error('Invalid team talk');
  if(phase==='pregame'&&(this.half!==1||this.clock>0.001))throw Error('Pregame talk window closed');
  if(phase==='halftime'&&(this.half!==2||this.matchState!=='paused'||this.clock>0.001))throw Error('Halftime talk window closed');
  if(this.talksUsed[team][phase])throw Error('This team already had a '+phase+' talk');
  this.talksUsed[team][phase]=true;
  const results=[];
  for(const src of this.rosters[team]){
   const response=reactToTalk(this.moraleLedger[team][src.id]??55,src,choice,phase==='halftime'?2:1);
   this.moraleLedger[team][src.id]=response.after;results.push(response);
  }
  for(const p of this.players.filter(p=>p.t===team))p.morale=this.moraleLedger[team][p.src.id];
  const backfires=results.filter(r=>r.backfire).length;
  const positive=results.filter(r=>r.delta>0).length;
  this.emit('teamTalk',{team,choice,phase,backfires,positive,morale:Math.round(this.teamMorale(team))});
  return {team,choice,phase,backfires,positive,morale:Math.round(this.teamMorale(team))};
 }
 teamMorale(team){const values=Object.values(this.moraleLedger[team]);return values.reduce((a,b)=>a+b,0)/Math.max(1,values.length)}
 onGoalMorale(scored){
  this.celebrationStyle=(this.matchSerial*3+this.score[0]*5+this.score[1]*7+scored)%25;
  for(const p of this.players){const value=goalMorale(this.moraleLedger[p.t][p.src.id]??55,p.t===scored);p.morale=value;this.moraleLedger[p.t][p.src.id]=value;p.cryTimer=p.t===scored?0:3.3;p.action=p.t===scored?'celebrate':'cry';p.actionTimer=3.3;}
  for(let t=0;t<2;t++)for(const src of this.rosters[t]){
   if(this.players.some(p=>p.t===t&&p.src.id===src.id))continue;
   this.moraleLedger[t][src.id]=goalMorale(this.moraleLedger[t][src.id]??55,t===scored);
  }
 }
 cpuLevel(p){return p.t===1&&this.humans===1?this.options.difficulty??2:2}
 playerSpeed(p){const breathRatio=(p.breath??breathCapacity(stat(p,'stamina')))/breathCapacity(stat(p,'stamina'));return (191+stat(p,'speedRating')*1.24)*(this.options.gameSpeed||1)*endurance(p)*moraleFactor(p.morale)*(p.mudSlowTimer>0?.62:1)*(1-(p.shotImpactWeaknessTimer>0?clamp(p.shotImpactWeakness||0,0,.4)*.28:0))*(.72+.28*Math.max(0,Math.min(1,breathRatio)))}
 // Speed rating controls top speed, agility controls acceleration, stopping and turns.
 moveAgile(p,dx,dy,maxSpeed,dt){
  // Releasing/switching owners stops the trap immediately; no input lock.
  if(this.ball.owner===p&&!p.keeper&&(p.firstTouchControlTimer||0)>0)
   maxSpeed*=firstTouchControlScale(p.firstTouchControlTimer,p.firstTouchPressure,stat(p,'dribbling'));
  const mag=Math.hypot(dx,dy),n=mag>1?1/mag:1;
  const targetVX=dx*n*maxSpeed,targetVY=dy*n*maxSpeed;
  const turn=Math.max(0,Math.min(1,(3.0+stat(p,'agility')*.13)*dt));
  p.moveVX=(p.moveVX||0)+(targetVX-(p.moveVX||0))*turn;
  p.moveVY=(p.moveVY||0)+(targetVY-(p.moveVY||0))*turn;
  const move=Math.hypot(p.moveVX,p.moveVY);
  if(move>maxSpeed&&move>0){p.moveVX=p.moveVX/move*maxSpeed;p.moveVY=p.moveVY/move*maxSpeed;}
  p.x+=p.moveVX*dt;p.y+=p.moveVY*dt;
  p.dx=maxSpeed?p.moveVX/maxSpeed:0;p.dy=maxSpeed?p.moveVY/maxSpeed:0;
 }

 staminaTick(p,dt,intensity=0,breathIntensity=intensity){p.breath=breathTick(p.breath,stat(p,'stamina'),dt,breathIntensity);p.fatigue=fatigueTick(p.fatigue,stat(p,'stamina'),dt,intensity);this.fatigueLedger[p.t][p.src.id]=p.fatigue;}
 spendStamina(p,kind){const breathMultiplier=breathPenalty(p.breath??breathCapacity(stat(p,'stamina')),stat(p,'stamina'));p.breath=spendBreath(p.breath,stat(p,'stamina'),kind);const jumpCost=kind==='jump'?jumpMetrics(stat(p,'jumping')).energyCostMultiplier:1;const levelKind=kind==='super'||kind==='comboSuper'?'shot':(kind==='defenceSuper'||kind==='spinBumper')?'defence':kind==='keeperSuper'?'keeper':null;const multiplier=(levelKind?levelModifiers(abilityLevel(p,levelKind)).fatigue:1)*(['super','comboSuper'].includes(kind)?superShotFatigueMultiplier(PHYSICS_TUNING):1);p.fatigue=actionFatigue(p.fatigue,stat(p,'stamina'),kind,multiplier*jumpCost*breathMultiplier);this.fatigueLedger[p.t][p.src.id]=p.fatigue;}
 halftimeRecovery(){
  for(const p of this.players)this.fatigueLedger[p.t][p.src.id]=p.fatigue;
  // v0.8.25.12: halftime restores 40% of accumulated fatigue instead of a flat amount.
  for(let t=0;t<2;t++)for(const src of this.rosters[t]){
   const current=this.fatigueLedger[t][src.id]??initialFatigue(src);
   this.fatigueLedger[t][src.id]=Math.max(0,current*.60);
  }
  for(const p of this.players){p.fatigue=this.fatigueLedger[p.t][p.src.id];p.breath=breathCapacity(stat(p,'stamina'));p.stun=0;}
 }
 autoSubstituteCpu(){if(this.humans!==1||this.substitutionsUsed[1]>=this.maxSubstitutions)return false;const t=1,next=recommendSubstitute(this.teamPlans[t],this.rosters[t],this.fatigueLedger[t],this.subbedOut[t]);if(!next)return false;const lineup=this.lineups[t].slice(),slot=lineup.indexOf(next.out);if(slot<1)return false;lineup[slot]=next.in;const roles=['captain','penalty','freeKick','corner'];const plan={...this.teamPlans[t],lineup};for(const role of roles)if(plan[role]===next.out)plan[role]=next.in;this.applyPlan(t,plan);this.emit('cpuSubstitution',{team:t,out:this.rosters[t][next.out].name,in:this.rosters[t][next.in].name});return true;}
 // CPU manager reacts once at half-time to the actual score. Never alter a human team,
 // stored tactical presets, lineups, or substitution quotas. A drawn game stays neutral.
 autoAdaptCpuHalftime(){
  if(this.humans!==1||this.mode==='training'||this.half!==2||this.matchState!=='paused'||this.clock>.001)return false;
  const plan=this.teamPlans?.[1],score=this.score;
  if(!plan||!Array.isArray(score)||score.length<2||!score.every(Number.isFinite)||score[0]===score[1])return false;
  const trailing=score[1]<score[0];
  const attack=trailing?'Direct':'Possession',defence=trailing?'High Press':'Deep Block';
  if(plan.attack===attack&&plan.defence===defence)return false;
  this.applyPlan(1,{...plan,attack,defence});
  this.emit('cpuTacticalShift',{team:1,attack,defence,reason:trailing?'trailing':'leading',score:score.slice()});
  return true;
 }
 getFitnessReport(team=0){return this.rosters[team].map(src=>{const fatigue=this.fatigueLedger[team][src.id]??initialFatigue(src),seconds=this.playerSeconds[team][src.id]||0;return {id:src.id,fatigue,seconds,condition:matchCondition(src.condition??100,fatigue,seconds),stamina:stat(src,'stamina'),subbedOut:this.subbedOut[team].has(src.id)};});}
 inControl(t){return (t===0&&this.humans>=1)||(t===1&&this.humans>=2)}
 hostOfBall(){return this.ball.owner}
 toast(msg){this.emit('toast',{message:msg})}
 cancelPendingAbilityActions(){
  let cancelled=0;
  for(const p of this.players||[]){
   const hadPending=!!(p.spinBumperPending||p.maceSweepPending||p.lightningPending);
   if(!hadPending)continue;
   if(p.lightningPending?.target)p.lightningPending.target.lightningMark=0;
   p.spinBumperPending=null;p.maceSweepPending=null;p.lightningPending=null;p.abilityFx=0;
   if(p.action==='defenceSuper'){p.action='idle';p.actionTimer=0;}
   p.aiSpinBumperThreat=null;p.aiSpinBumperReaction=0;cancelled++;
  }
  return cancelled;
 }
 resetKickoff(which=0){this._closeShotAudits('kickoffReset');this.magicHazards=[];this.magicWalls=[];this.supernova=null;this.spawnPlayers();this.ball={x:MID,y:F.y+F.h*.5,z:0,vx:0,vy:0,vz:0,owner:null,shot:null,trail:[],age:0,power:0,canCollect:0,targetY:0,attacker:-1,lastTouchTeam:-1};const starter=this.player(which,3);starter.x=MID+(which===0?-26:26);starter.y=F.y+F.h*.5;this.take(starter);this.controlled[0]=3;this.controlled[1]=3;this.cooldown=.9;}
 startCornerRestart(team,top){
  if(![0,1].includes(team)||typeof top!=='boolean')return false;
  const roleIndex=this.teamPlans[team]?.corner,source=this.rosters[team]?.[roleIndex];
  const eligible=this.players.filter(p=>p.t===team&&!p.keeper);
  const taker=(source?eligible.find(p=>p.src?.id===source.id&&!p.stun):null)||
   eligible.find(p=>!p.stun)||eligible[0];
  if(!taker)return false;
  this.cancelPendingAbilityActions();
  const attackingRight=team===0;taker.face=attackingRight?-1:1;
  taker.x=attackingRight?F.x+F.w-35:F.x+35;
  taker.y=top?F.y+15:F.y+F.h-25;
  taker.dx=0;taker.dy=0;taker.moveVX=0;taker.moveVY=0;taker.action='idle';taker.actionTimer=0;
  this.take(taker);this.ball.lastTouchTeam=team;
  this.ball.vx=0;this.ball.vy=0;this.ball.vz=0;this.ball.z=0;this.ball.age=0;
  this.ball.shot=null;this.ball.strike=null;this.ball.ordinaryShot=false;this.ball.trail=[];
  this.magicHazards=[];this.magicWalls=[];this.supernova=null;
  this.emit('cornerRestart',{team,player:taker.src?.name||null,side:top?'top':'bottom'});
  this.emit('toast',{message:'CORNER KICK'});
  return true;
 }
 startGoalKick(team,y){
  if(![0,1].includes(team)||!Number.isFinite(y))return false;
  const keeper=this.player(team,0);if(!keeper)return false;
  this.cancelPendingAbilityActions();
  keeper.x=team===0?F.x+55:F.x+F.w-55;keeper.y=clamp(y,F.y+28,F.y+F.h-28);
  keeper.face=team===0?1:-1;keeper.dx=0;keeper.dy=0;keeper.moveVX=0;keeper.moveVY=0;
  this.take(keeper);keeper.keeperHold=0;this.ball.lastTouchTeam=team;
  this.ball.vx=0;this.ball.vy=0;this.ball.vz=0;this.ball.z=0;this.ball.age=0;
  this.ball.shot=null;this.ball.strike=null;this.ball.ordinaryShot=false;this.ball.trail=[];
  this.magicHazards=[];this.magicWalls=[];this.supernova=null;
  this.emit('goalKickRestart',{team,player:keeper.src?.name||null});
  this.emit('toast',{message:'GOAL KICK'});
  return true;
 }
 startFreeKick(team,x,y){
  if(![0,1].includes(team)||!Number.isFinite(x)||!Number.isFinite(y))return false;
  const roleIndex=this.teamPlans[team]?.freeKick,source=this.rosters[team]?.[roleIndex];
  const eligible=this.players.filter(p=>p.t===team&&!p.keeper);
  const taker=(source?eligible.find(p=>p.src?.id===source.id&&!p.stun):null)||
   eligible.find(p=>!p.stun)||eligible[0];
  if(!taker)return false;
  this.cancelPendingAbilityActions();
  taker.face=team===0?1:-1;taker.x=clamp(x,F.x+34,F.x+F.w-34);taker.y=clamp(y,F.y+28,F.y+F.h-28);
  taker.dx=0;taker.dy=0;taker.moveVX=0;taker.moveVY=0;taker.action='idle';taker.actionTimer=0;
  this.take(taker);this.ball.lastTouchTeam=team;
  this.ball.vx=0;this.ball.vy=0;this.ball.vz=0;this.ball.z=0;this.ball.age=0;
  this.ball.shot=null;this.ball.strike=null;this.ball.ordinaryShot=false;this.ball.trail=[];
  this.magicHazards=[];this.magicWalls=[];this.supernova=null;this.cooldown=Math.max(this.cooldown||0,.45);
  this.emit('freeKickRestart',{team,player:taker.src?.name||null,x:taker.x,y:taker.y});
  this.emit('toast',{message:'FREE KICK'});
  return true;
 }
 isInPenaltyArea(team,x,y){
  if(![0,1].includes(team)||!Number.isFinite(x)||!Number.isFinite(y))return false;
  const depth=F.w*(16.5/105),halfWidth=F.h*(40.32/68),center=(WORLD.goalTop+WORLD.goalBottom)/2;
  const insideY=y>=center-halfWidth/2&&y<=center+halfWidth/2;
  return insideY&&(team===0?x>=F.x+F.w-depth:x<=F.x+depth);
 }
 handleEndlineRestart(){
  const b=this.ball;if(!b)return false;
  const endRight=b.x>F.x+F.w/2,defendingTeam=endRight?1:0,attackingTeam=1-defendingTeam;
  if(Number.isInteger(b.lastTouchTeam)&&b.lastTouchTeam===defendingTeam)
   return this.startCornerRestart(attackingTeam,b.y<F.y+F.h/2);
  return this.startGoalKick(defendingTeam,b.y);
 }
 take(p){if(this.rideBall&&this.rideBall.carrier!==p)this.cancelRideBall('possession');this.ball.strike=null;p.firstTouchControlTimer=0;const incoming=this.ball.pass===true&&this.ball.owner===null?{
  from:this.ball.passFrom,team:this.ball.passTeam,target:this.ball.passTarget,
  x:this.ball.x,y:this.ball.y,height:this.ball.z,speed:Math.hypot(this.ball.vx||0,this.ball.vy||0)}:null;
  this._auditTake(p);for(const q of this.players){q.aerialComboAction=null;q.aerialComboTimer=0;q.aerialComboTaps=0;}if(this.ball.liftOwner){this.ball.liftOwner.ballLiftWindow=0;this.ball.liftOwner.ballLiftLock=false;this.ball.liftOwner=null;}if(this.inControl(p.t)&&!p.keeper)this.controlled[p.t]=p.i;if(p.keeper)p.keeperHold=0;let b=this.ball;b.owner=p;b.lastTouchTeam=p.t;b.x=p.x+p.face*17;b.y=p.y+10;b.z=0;b.vx=b.vy=b.vz=0;b.shot=null;b.strike=null;b.ordinaryShot=false;b.age=0;b.canCollect=0;b.pass=false;b.passFrom=null;b.passTeam=null;b.passTarget=null;
  if(incoming){const friendly=incoming.team===p.t;
   // Existing reception animation is visual; a short movement-only trap below
   // now applies exclusively to friendly, low passes under nearby pressure.
   if(!p.keeper&&p.stun<=0){
    p.action='receive';p.actionTimer=.29;p.firstTouchFx=.35;
    // Visual-only brace: a nearby opponent makes the receiving stance more guarded.
    const nearest=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0).reduce((d,q)=>Math.min(d,distance(p,q)),Infinity);
    p.firstTouchPressure=clamp((135-nearest)/115,0,1);
    if(friendly&&incoming.from!==p.src.id&&incoming.height<=24&&p.firstTouchPressure>0)
     p.firstTouchControlTimer=.24;
   }
   this.emit('passReceived',{team:p.t,player:p.src.id,from:incoming.from,
    intendedTarget:incoming.target,accurate:incoming.target===p.src.id,friendly,
    speed:Math.round(incoming.speed)});
  }
 }
 // Goalkeepers hold a clean catch briefly and then autonomously distribute.
 // This transition is distinct from a rebound and never requires another button.
 keeperCollect(p,source='loose'){
  if(!p?.keeper||p.stun>0)return false;
  this.take(p);this.ball.strike=null;
  p.action=source==='dive'?'keeperDiveCatch':'keeperCatch';p.actionTimer=source==='dive'?.60:.46;p.keeperHold=0;p.diveIntentPending=false;
  this.emit('keeperCatch',{team:p.t,player:p.src.name,source});
  return true;
 }
 freeBall(p,dx,dy,speed=500,opts={}){
 const b=this.ball,v=norm(dx,dy);speed*=this.options.gameSpeed||1;b.owner=null;b.x=p.x+p.face*21;b.y=p.y-5;b.vx=v.x*speed;b.vy=v.y*speed;// Airborne transformed shots must descend into the goal mouth rather than
 // retaining the jump's original height. Ordinary aerial kicks remain lofted.
 const superFromJump=!!opts.shot&&p.z>60;
 b.z=superFromJump?Math.min(62,opts.z||34):Math.max(p.z,opts.z||13);
 b.vz=superFromJump?-Math.max(28,Math.min(125,p.z*.48)):opts.vz||0;
 b.shot=opts.shot?{...opts.shot,transformSeconds:SUPER_SHOT_TRANSFORM_SECONDS}:null;if(b.shot?.behavior==='homing'||b.shot?.behavior==='dolphin'){
  const goalX=p.t===0?F.x+F.w:F.x,straightY=b.vx?b.y+(goalX-b.x)*b.vy/b.vx:b.y;
  const targetY=Number.isFinite(opts.aimY)?opts.aimY:Number.isFinite(b.shot.aimY)?b.shot.aimY:straightY;
  b.shot.homingOffset=clamp(targetY-straightY,-SHOTPATHS.MAX_HOMING_OFFSET,SHOTPATHS.MAX_HOMING_OFFSET);
 }b.pass=!!opts.pass;b.passFrom=opts.pass?p.src.id:null;b.passTeam=opts.pass?p.t:null;b.passTarget=null;b.ordinaryShot=!!opts.ordinaryShot;b.power=opts.power||p.src.shoot;b.strike=(opts.shot||opts.ordinaryShot)?{kind:opts.shot?'super':'normal',energy:Math.max(1,opts.power||p.src.shoot),hits:0,originX:p.x,originY:p.y}:null;b.attacker=p.t;b.lastTouchTeam=p.t;b.canCollect=b.strike?.045:.17;b.trail=[];b.age=0;b.shooter=p.src.name;b.targetY=opts.aimY??null;p.action=opts.shot?'super':opts.pass?'pass':'kick';p.actionTimer=opts.shot?.6:.30;p.cd=.28;this.spendStamina(p,opts.shot?'super':opts.pass?'pass':'shoot');const kind=opts.pass?'pass':opts.shot?'superShot':opts.ordinaryShot?'shot':'clearance';const release=kind==='shot'||kind==='superShot'?shotReleaseSnapshot(p,b,this.players,kind):null;this.emit('kick',{player:p,super:!!opts.shot,kind,origin:{x:b.x,y:b.y,z:b.z},targetY:b.targetY,...(release?{release}:{} )});if(release)this.emit('shotRelease',{release});if(opts.shot){const reducedSH06=!!this.options?.reducedFlash;this.shake=reducedSH06?0:.19;this.flash=reducedSH06?0:.23;this.burst(b.x,b.y,opts.shot.color,reducedSH06?4:22)}else this.burst(b.x,b.y,'#fff',6);
 }
 shoot(p,special=false,alternate=false,charged=0){if(this.ball.owner!==p)return false;const equipped=!!(p.src.superAbility?.type==='shoot'&&p.src.shot);const enhanced=!!special&&!equipped;special=!!special&&equipped&&p.specialCd<=0;const t=p.t,dir=t===0?1:-1,goalY=(WORLD.goalTop+WORLD.goalBottom)/2;const spread=shotError(p,!this.inControl(p.t)?aiTuning(this.cpuLevel(p)).aimError:18)/moraleFactor(p.morale);
 const accuracy=stat(p,'shootAccuracy'),skill=clamp((accuracy-1)/99,0,1);
 const keeper=this.players.find(q=>q.t!==t&&q.keeper);
 // Compare goalmouth lanes, including their likely crossing points past a blocker.
 // An elite finisher strongly prefers a free lane; an inaccurate one may guess.
 const margin=12,goalSpan=WORLD.goalBottom-WORLD.goalTop; // aim nearer genuinely uncovered post lanes
 const candidates=Array.from({length:7},(_,i)=>WORLD.goalTop+margin+i*(goalSpan-2*margin)/6);
 const goalX=t===0?F.x+F.w:F.x;
 const blockers=this.players.filter(q=>q.t!==t&&!q.keeper&&q.stun<=0);
 const laneScore=y=>{
  const keeperGap=keeper?Math.abs(y-keeper.y):goalSpan*.5;
  let score=SHOTFEEL.lanePreference(p.x,p.y,goalX,y,keeper,accuracy)-(Math.abs(y-goalY)*.06);
  for(const q of blockers){const progress=(q.x-p.x)/(goalX-p.x||1);
   if(progress<=.04||progress>=.99)continue;
   const projectedY=p.y+(y-p.y)*progress;
   const clearance=Math.abs(q.y-projectedY);
   if(clearance<85)score-=(85-clearance)*(1.1+progress*.5);
  }
  return score;
 };
 const ranked=candidates.slice().sort((a,b)=>laneScore(b)-laneScore(a));
 const readsOpenLane=Math.random()<(.24+skill*.72);
 const chosen=readsOpenLane?ranked[0]:candidates[Math.floor(Math.random()*candidates.length)];
 const error=(100-accuracy)*.78+spread*(1.05-skill*.52); // more accurate finishers retain tighter targeting
 // Direction still permits some manual steering without always forcing shots center.
 let aim=chosen+(Math.random()-.5)*error*2+(p.dy||0)*(1-skill)*24;
 // Poor aim genuinely misses the mouth sometimes instead of being clamped on target.
 if(Math.random()<Math.pow(1-skill,2)*.18){
  aim=(Math.random()<.5?WORLD.goalTop:WORLD.goalBottom)+(Math.random()<.5?-1:1)*(35+Math.random()*95);
 }
 aim=clamp(aim,WORLD.goalTop-155,WORLD.goalBottom+155);
 const dx=(t===0?F.x+F.w:F.x)-p.x,dy=aim-p.y;const magnitude=Math.hypot(dx,dy);if(special){let spec=SHOTS[p.src.shot]||SHOTS.nuts;this.freeBall(p,dx,(spec.behavior==='homing'||spec.behavior==='dolphin')?dy*.82:dy,850*spec.speed*superShotSpeedMultiplier(PHYSICS_TUNING)*shotVelocityModifier(p.src.shot,abilityLevel(p,'shot'))*SHOTFEEL.launchPower(stat(p,'shootPower'),p.fatigue,true)*moraleFactor(p.morale),{shot:{...spec,level:abilityLevel(p,'shot'),id:p.src.shot,phase:0,startY:p.y,direction:dir,aimY:aim,alternate},power:((stat(p,'shootPower')*.75+13)*spec.impact*(.98-.27*p.fatigue)+18)*levelModifiers(abilityLevel(p,'shot')).power,z:29,vz:alternate?190:45,aimY:aim});p.specialCd=3.4;}else{let speed=(450+stat(p,'shootPower')*4.0)*(1+Math.min(1.2,charged)*.32)*(enhanced?1.32:1)*SHOTFEEL.launchPower(stat(p,'shootPower'),p.fatigue,false)*moraleFactor(p.morale)*(alternate?(.82+stat(p,'heading')*.003):1);this.freeBall(p,dx,dy,speed,{power:stat(p,'shootPower')*.81*(1-.30*p.fatigue)*(enhanced?1.45:1),z:p.z+14,vz:alternate?160:Math.random()*90,aimY:aim,ordinaryShot:true})}return true;}
 // v0.8.25.12: a direction is an explicit kick vector, not a target preference.
 // With no direction, quick PASS always selects the nearest available teammate.
 // AI retains the historic advancing-player selection (opts.human is false).
 pass(p,long=false,cross=false,opts={}){
  if(this.ball.owner!==p)return false;
  const mates=this.players.filter(q=>q.t===p.t&&q!==p&&!q.stun&&(!q.keeper||p.keeper));
  const directed=opts.direction&&Math.hypot(opts.direction.x||0,opts.direction.y||0)>.16;
  if(!mates.length&&!directed)return false;
  const dir=p.t===0?1:-1;
  const wide=Math.abs(p.y-(F.y+F.h/2))>F.h*.31;
  const captain=this.rosters[p.t][this.teamPlans[p.t]?.captain];
  const captainOnField=this.players.some(q=>q.t===p.t&&q.src.id===captain?.id);
  const quality=Math.min(100,stat(p,cross||(!opts.human&&wide)?'crossing':'passing')+(captainOnField?4:0));
  const hold=clamp(Number(opts.hold)||0,0,1.2);
  const longScale=long?(opts.human?1.30+Math.max(0,hold-.24)*.33:1.38):1;
  const ex=(Math.random()-.5)*(100-quality)*1.45*(1+.85*p.fatigue);
  const ey=(Math.random()-.5)*(100-quality)*1.45*(1+.85*p.fatigue);
  let target=null,aimX,aimY,kind;
  if(directed){
   const heading=norm(opts.direction.x,opts.direction.y);
   // Direction is independent of team attacking side: left is always left.
   target=SHOTFEEL.teammateInDirection(p,mates,heading,long?1650:1150);
   if(target){aimX=target.x-p.x+(target.dx||0)*(long?125:55)+ex;aimY=target.y-p.y+(target.dy||0)*(long?125:55)+ey;kind=cross?'crossTarget':'directionTarget';}
   else {aimX=heading.x*800+ex;aimY=heading.y*800+ey;kind=cross?'crossDirection':'direction';}
  }else{
   if(opts.human&&!long&&!cross){
    target=mates.slice().sort((a,b)=>distance(p,a)-distance(p,b))[0];kind='nearest';
   }else{
    const lookX=Math.abs(p.dx)>.22?p.dx:dir,lookY=p.dy||0;
    const ranked=mates.map(q=>{const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1;
     return {q,score:(dx/d*lookX+dy/d*lookY)*420+dx*dir*.18-d*.43+(d<100?-600:0)+(d>1200?-1100:0)};
    }).sort((a,b)=>b.score-a.score);
    target=ranked[0]?.q;kind=cross?'cross':long?'long':'ai';
   }
   if(!target)return false;
   aimX=target.x-p.x+(target.dx||0)*(long?150:opts.human?65:90)+ex;
   aimY=target.y-p.y+(target.dy||0)*(long?150:opts.human?65:90)+ey;
  }
  const speed=passLaunchSpeed(quality,longScale,PHYSICS_TUNING);
  this.freeBall(p,aimX,aimY,speed,{power:5,z:p.z+8,vz:cross?245:long?160:!opts.human&&wide?105:65,pass:true});
  this.ball.passTarget=target?.src.id||null;
  this.emit('passIntent',{team:p.t,player:p.src.id,mode:kind,holdSeconds:hold,
   direction:directed?{x:opts.direction.x,y:opts.direction.y}:null,
   target:target?.src.id||null,speed,loft:cross?'cross':long?'long':'short'});
  // Do not steal control before a receiver actually controls the ball.
  // Pause defensive auto-switch briefly while the pass is in flight.
  if(opts.human&&this.inControl(p.t))this.manualSwitchGrace[p.t]=Math.max(this.manualSwitchGrace[p.t]||0,1.25);
  return true;
 }
 // Friendly ball ownership is authoritative even when player-switch is delayed.
 performTeamPass(p,long=false,cross=false,direction=null,hold=0){
  const carrier=this.ball.owner;
  if(!p||!carrier||carrier.t!==p.t)return false;
  // Goalkeeper uses legacy safe-distribution targeting unless manual direction
  // is explicitly held; directed goalkeeper kicks must obey the same controls.
  if(carrier.keeper){
   if(!direction||Math.hypot(direction.x||0,direction.y||0)<=.16){const kicked=this.distributeKeeper(carrier,long?'long':'short');if(kicked&&this.inControl(carrier.t))this.manualSwitchGrace[carrier.t]=Math.max(this.manualSwitchGrace[carrier.t]||0,1.25);return kicked;}
   const heading=norm(direction.x,direction.y),quality=stat(carrier,'passing');
   const teammate=SHOTFEEL.teammateInDirection(carrier,this.players.filter(q=>q.t===carrier.t&&q!==carrier&&q.stun<=0),heading,long?1650:1150);
   const toward=teammate?{x:teammate.x-carrier.x+(teammate.dx||0)*60,y:teammate.y-carrier.y+(teammate.dy||0)*60}:heading;
   const speed=Math.min(1150,(395+quality*1.5)*(long?1.45+Math.max(0,hold-.24)*.22:1));
   this.freeBall(carrier,toward.x,toward.y,speed,{power:long?15:6,z:35,vz:cross?245:long?220:45,pass:true});this.ball.passTarget=teammate?.src.id||null;
   this.manualSwitchGrace[carrier.t]=Math.max(this.manualSwitchGrace[carrier.t]||0,1.25);
   carrier.keeperHold=0;carrier.action='keeperPunt';carrier.actionTimer=.48;carrier.keeperReleasePoseDuration=carrier.actionTimer;
   this.emit('keeperDistribution',{team:carrier.t,player:carrier.src.name,target:teammate?.src.id||null,mode:'directed',direction,pressured:false,emptySpace:!teammate});
   this.emit('passIntent',{team:carrier.t,player:carrier.src.id,mode:'direction',holdSeconds:hold,direction,target:teammate?.src.id||null,speed,loft:long?'long':'short'});
   return true;
  }
  return this.pass(carrier,long,cross,{direction,hold,human:true});
 }
 // Holding Sprint while moving builds toward a short, stamina-limited hyperdash.
 triggerHyperdash(p){
  if(p.keeper||p.stun>0||p.z>45||p.dashCooldown>0||p.dashTimer>0||p.fatigue>.78)return false;
  p.dashTimer=.62;p.dashCooldown=4.3;p.sprintCharge=0;
  p.action='hyperdash';p.actionTimer=.35;
  this.spendStamina(p,'hyperdash');this.burst(p.x,p.y,'#87e7ff',12);
  this.emit('hyperdash',{team:p.t,player:p.src.name});return true;
 }
 // Intentional cooperative jump: hold PASS while pressing JUMP next to a grounded teammate.
 // No teammate stacking is triggered by a normal jump or while carrying the ball.
 tryTeammateLaunch(p){
  if(!p||p.keeper||p.stun>0||p.z>0||p.vz>0||p.comboCooldown>0||p.fatigue>.78||this.ball.owner===p)return false;
  const ally=this.players.filter(q=>q.t===p.t&&q!==p&&!q.keeper&&q.z===0&&q.stun<=0&&q.fatigue<.78&&q.cd<=0&&distance(p,q)<115)
      .sort((a,b)=>distance(p,a)-distance(p,b))[0];
  if(!ally)return false;
  p.comboCooldown=4.8;p.comboWindow=1.55;p.comboActive=true;p.assistBy=ally.src.name;p.chase=0;
  p.z=48;p.vz=650;p.action='comboJump';p.actionTimer=.78;p.cd=.14;
  ally.action='assistBoost';ally.actionTimer=.72;ally.cd=.9;ally.assistFx=.72;
  this.spendStamina(p,'comboJump');this.spendStamina(ally,'assistBoost');
  this.burst((p.x+ally.x)*.5,p.y,'#ffe180',20);
  this.emit('teamLaunch',{team:p.t,player:p.src.name,assistant:ally.src.name});return true;
 }
 // An aerial flip kick works on any sufficiently high jump, while a stacked jump
 // additionally enables a transformed special at the apex (abs(vz) <= 260).
 tryFlipKick(p,wantsSpecial=false){
  const b=this.ball;
  if(!p||p.keeper||p.stun>0||p.cd>0||p.z<95||b.owner||b.z<55)return false;
  if(distance(p,b)>110||Math.abs(b.z-(p.z+38))>125)return false;
  const assisted=!!p.comboActive&&p.comboWindow>0;
  const apex=assisted&&Math.abs(p.vz)<=260&&p.z>=145;
  const special=wantsSpecial&&apex&&p.specialCd<=0;
  const heading=stat(p,'heading'),accuracy=stat(p,'shootAccuracy'),power=stat(p,'shootPower');
  const goalX=p.t===0?F.x+F.w:F.x,goalY=(WORLD.goalTop+WORLD.goalBottom)*.5;
  const v=norm(goalX-p.x,goalY-p.y+(Math.random()-.5)*(100-accuracy)*1.8);
  const shot=special?(SHOTS[p.src.shot]||SHOTS.nuts):null;
  const velocity=(special?845*(shot?.speed||1)*shotVelocityModifier(p.src.shot,abilityLevel(p,'shot')):495+power*3.8)*(assisted?1.19:1)*endurance(p)*moraleFactor(p.morale);
  b.owner=null;b.vx=v.x*velocity;b.vy=v.y*velocity;b.vz=special?-85:185;
  b.z=special?Math.min(63,p.z+38):Math.max(b.z,p.z+38);b.attacker=p.t;b.lastTouchTeam=p.t;b.shooter=p.src.name;b.power=(power*.66+heading*.18)*(assisted?1.2:1)*(special?(shot?.impact||1)*levelModifiers(abilityLevel(p,'shot')).power:1);
  b.shot=special?{...shot,id:p.src.shot,phase:0,startY:p.y,direction:p.t===0?1:-1,aimY:goalY,alternate:true}:null;
  b.age=0;b.canCollect=.24;b.trail=[];p.action=special?'comboSuper':'flipKick';p.actionTimer=.62;p.cd=.52;
  this.spendStamina(p,special?'comboSuper':'flipKick');if(special)p.specialCd=3.8;
  // Shot ends the assist window and prevents the same airborne ball being kicked twice.
  p.comboWindow=0;this.shake=special?.24:.10;this.burst(b.x,b.y,special?(shot?.color||'#fff39a'):'#f9d8ff',special?29:16);
  this.emit('flipKick',{team:p.t,player:p.src.name,assistant:assisted?p.assistBy:null,special,apex});return true;
 }
 // Ground contact after a launched aerial move can knock over one nearby opponent.
 landCombo(p){
  if(!p.comboActive)return;
  p.comboActive=false;p.comboWindow=0;
  const target=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&q.invuln<=0&&distance(p,q)<60)
    .sort((a,b)=>distance(p,a)-distance(p,b))[0];
  if(!target)return;
  const resistance=stat(target,'strength')*.004;
  target.stun=Math.max(target.stun,impactStun('aerial',stat(p,'strength')*.95,stat(target,'strength')));target.invuln=.85;
  target.action='hurt';target.actionTimer=Math.max(.5,target.stun);
  if(this.ball.owner===target){this.ball.owner=null;this.ball.x=target.x;this.ball.y=target.y;this.ball.vx=p.face*180;this.ball.vy=75;this.ball.vz=140;this.ball.z=26;this.ball.canCollect=.22;}
  p.action='comboLand';p.actionTimer=.35;
  this.burst(target.x,target.y,'#f5cb70',18);
  this.emit('comboLanding',{team:p.t,player:p.src.name,target:target.src.name});
 }
 // Loose aerial ball can be headed toward goal if jump timing and height line up.
 tryHeader(p){
  const b=this.ball;
  if(!p||p.keeper||p.stun>0||p.cd>0||p.z<30||b.owner||b.z<30)return false;
  if(Math.hypot(p.x-b.x,p.y-b.y)>92||Math.abs(b.z-(p.z+42))>90)return false;
  const toGoal=p.t===0?F.x+F.w:F.x,goalY=(WORLD.goalTop+WORLD.goalBottom)*.5;
  const heading=stat(p,'heading'),accuracy=stat(p,'shootAccuracy');
  const aimY=goalY+(Math.random()-.5)*(100-accuracy)*2.3;
  const vec=norm(toGoal-p.x,aimY-p.y),speed=(390+heading*4.8)*endurance(p)*moraleFactor(p.morale);
  b.owner=null;b.shot=null;b.strike=null;b.ordinaryShot=false;b.vx=vec.x*speed;b.vy=vec.y*speed;b.vz=130+heading*.65;
  b.z=Math.max(b.z,p.z+55);b.power=heading*.57;b.attacker=p.t;b.lastTouchTeam=p.t;b.shooter=p.src.name;b.age=0;b.canCollect=.22;b.trail=[];
  p.action='header';p.actionTimer=.5;p.cd=.42;this.spendStamina(p,'header');
  this.burst(b.x,b.y,'#fff1a0',14);const release=shotReleaseSnapshot(p,{...b,targetY:aimY},this.players,'header');this.emit('header',{team:p.t,player:p.src.name,heading,release});this.emit('shotRelease',{release});return true;
 }
 // Ordinary goalkeeper dives, separate from rare supernatural goalkeeper saves.
 // Direction and reach depend on GK Diving and GK Skill attributes.
 // A predicted incoming shot creates a visible diving attempt before contact.
 // This does not move the goalkeeper, alter the ball, or extend the save zone.
 tryKeeperDiveIntent(p){
  const b=this.ball;
  if(!p?.keeper||p.stun>0||p.diveCooldown>0||(p.diveIntentCooldown||0)>0||b.owner||
     b.attacker!==1-p.t||!(b.ordinaryShot||b.shot||b.strike)||this.superBreakerApproaching(p,b))return false;
  const toward=p.t===0?-1:1,remaining=(p.x-b.x)*toward;
  if(b.vx*toward<=160||remaining<70||remaining>320)return false;
  const predicted=predictKeeperShot(p,b),reach=keeperReactionReach(p,b);
  if(!predicted||predicted.time<.065||predicted.time>.46||predicted.z>reach.z+15||
     predicted.y<WORLD.goalTop-25||predicted.y>WORLD.goalBottom+25)return false;
  const lateral=predicted.y-p.y;
  if(Math.abs(lateral)<22||Math.abs(lateral)>Math.max(165,reach.y+72))return false;
  p.diveIntentCooldown=1.25;p.diveIntentPending=true;p.diveAdvanceTravel=0;
  p.action='keeperDive';p.actionTimer=.64;p.diveElapsed=0;
  p.diveDy=clamp(lateral/Math.max(1,reach.y),-1,1);
  p.diveDx=clamp((b.x-p.x)/Math.max(1,reach.x),-1,1);
  this.emit('keeperDiveAttempt',{team:p.t,keeperId:p.src.id,
    predictedSeconds:predicted.time,lateral:Math.abs(lateral),shotKind:b.strike?.kind||'normal'});
  return true;
 }
 // Physical but tightly bounded late lunge after a genuine early dive intent.
 // It is NOT a save: keeper/ball contact remains in tryKeeperDive (or swept).
 advanceKeeperDive(p,dt){
  const b=this.ball;
  if(!p?.keeper||!p.diveIntentPending||p.action!=='keeperDive'||
     p.actionTimer<=.25||p.stun>0||p.diveCooldown>0||b.owner||b.attacker!==1-p.t||
     !Number.isFinite(dt)||dt<=0||dt>.1)return 0;
  const toward=p.t===0?-1:1,remaining=(p.x-b.x)*toward;
  if(b.vx*toward<=160||remaining<=30||remaining>320||this.superBreakerApproaching(p,b))return 0;
  const projected=predictKeeperShot(p,b);
  if(!projected||projected.time<=.025||projected.time>.46||
     projected.y<WORLD.goalTop-25||projected.y>WORLD.goalBottom+25)return 0;
  const diving=stat(p,'gkDiving'),fatigue=clamp(p.fatigue||0,0,1);
  const limit=Math.min(28,(9+diving*.22)*(1-fatigue*.55));
  const available=Math.max(0,limit-(p.diveAdvanceTravel||0));
  const lateral=projected.y-p.y;
  if(available<.01||Math.abs(lateral)<3)return 0;
  const step=Math.min(available,Math.abs(lateral),(105+diving*.75)*(1-fatigue*.55)*dt);
  const next=clamp(p.y+Math.sign(lateral)*step,F.y+23,F.y+F.h-23);
  const moved=Math.abs(next-p.y);
  p.y=next;p.diveAdvanceTravel=(p.diveAdvanceTravel||0)+moved;
  return moved;
 }
 tryKeeperDive(p,manual=false){
  const b=this.ball;
  if(!p?.keeper||p.stun>0||p.diveCooldown>0||b.owner||b.attacker!==1-p.t)return false;
  const diving=stat(p,'gkDiving'),skill=stat(p,'gkSkill');
  const reach=keeperReactionReach(p,b);
  const dx=b.x-p.x,dy=b.y-p.y;
  // v0.8.25.14: keeper dive range is NOT a contact zone in depth. Previously
  // the keeper instantly deflected shots as soon as they entered a 200+ unit
  // rectangle, often long before the ball could reach an open corner.
  // Contact is allowed only near the keeper's actual X plane. Swept contact
  // below handles shots which travel past this narrow band between frames.
  const contactDepth=Math.min(reach.x,42+diving*.33);
  if(Math.abs(dx)>contactDepth||Math.abs(dy)>reach.y||b.z>reach.z)return false;
  // Reject shots already travelling away from the goalkeeper.
  if(b.vx*(p.t===0?1:-1)>0)return false;
  // Read-only evidence of the *actual* interception (not early dive intent).
  this.emit('keeperContact',{keeperId:p.src.id,team:p.t,age:b.age,
   depth:Math.abs(dx),lateral:Math.abs(dy),contactDepth,
   lateralReach:reach.y,ballHeight:b.z,shotKind:b.strike?.kind||'loose'});
  p.diveIntentPending=false;p.diveCooldown=keeperDiveRecoverySeconds(p);p.action='keeperDive';p.actionTimer=.64;p.z=Math.max(12,p.z);
  // The actual contact direction and animation motion come from the shot lane.
  p.diveDy=clamp(dy/Math.max(1,reach.y),-1,1);p.diveDx=clamp(dx/Math.max(1,reach.x),-1,1);
  p.diveElapsed=0;
  p.x=clamp(p.x+clamp(dx,-58,58),F.x+12,F.x+F.w-12);
  p.y=clamp(p.y+clamp(dy,-64,64),F.y+12,F.y+F.h-12);
  const sign=p.t===0?1:-1;
  const force=Math.hypot(b.vx,b.vy)/50+(b.power||0),saveQuality=24+skill*.55+diving*.28;
  // Even a strong shot can be deflected; high-quality keepers catch slower shots.
  if(force<saveQuality*.62){this.keeperCollect(p,'dive');this.emit('save',{player:p,saveType:'dive'});}
  else {b.owner=null;b.shot=null;b.strike=null;b.ordinaryShot=false;b.vx=sign*(290+skill*4.1);b.vy=dy*4+Math.sign(dy||1)*115;b.vz=150+diving*.6;b.power=0;b.attacker=p.t;b.lastTouchTeam=p.t;b.age=0;b.trail=[];b.canCollect=.32;this.emit('save',{player:p,saveType:'dive',deflected:true});}
  this.spendStamina(p,'keeperDive');this.burst(p.x,p.y,'#ccf9ff',16);
  this.emit('keeperDive',{team:p.t,player:p.src.name,manual});return true;
 }
 // Detect high-speed shots that cross the keeper's plane in a single frame.
 // Without a swept check, a fast ball may pass from outside dive range to behind
 // the goal line between polls, bypassing both the dive and contact checks.
 // Delay an automatic dive only for a very close, forceful Super Shot aligned
 // with the keeper. Other shots still use the ordinary automatic save logic.
 superBreakerApproaching(keeper,b){
 if(!keeper||b.shot?.underground||!b.strike||b.strike.kind!=='super'||b.age>.75)return false;
  if(Math.abs(keeper.x-b.strike.originX)>620||Math.abs(keeper.y-b.y)>40)return false;
  const towards=keeper.t===0?-1:1,remaining=(keeper.x-b.x)*towards;
  if(remaining<-8||remaining>175||b.vx*towards<=0)return false;
  const force=SHOTFEEL.contactEnergy(b.strike.energy,Math.hypot(b.vx,b.vy),Math.hypot(b.x-b.strike.originX,b.y-b.strike.originY),true);
  return force>stat(keeper,'strength')*.35+stat(keeper,'gkSkill')*.48+34;
 }
 // At point-blank range a powerful Super Shot may overwhelm the keeper.
 // This resolves before automatic saves, and consumes energy each contact.
 tryBreakthroughKeeper(previous){
  const b=this.ball;
  if(!b.strike||b.strike.kind!=='super'||b.owner||![0,1].includes(b.attacker))return false;
  const keeper=this.player(1-b.attacker,0);
  if(!keeper||keeper.stun>0||b.age>.75)return false;
  const travel=Math.hypot(b.x-b.strike.originX,b.y-b.strike.originY);
  if(travel>620)return false;
  const dx=b.x-previous.x,dy=b.y-previous.y,len=dx*dx+dy*dy;
  const u=len>1?clamp(((keeper.x-previous.x)*dx+(keeper.y-previous.y)*dy)/len,0,1):0;
  const contactX=previous.x+u*dx,contactY=previous.y+u*dy;
  const height=previous.z+(b.z-previous.z)*u;
  if(Math.hypot(keeper.x-contactX,keeper.y-contactY)>32||height>90)return false;
  const force=SHOTFEEL.contactEnergy(b.strike.energy,Math.hypot(b.vx,b.vy),travel,true);
  const resistance=stat(keeper,'strength')*.35+stat(keeper,'gkSkill')*.48+22;
  if(force<resistance+12)return false;
  const direction=norm(b.vx,b.vy),impact=clamp((force-resistance)/55,.3,2.6);
  applyShotImpactWeakness(keeper,true);
  keeper.shotImpactKnockdownPending=Math.max(keeper.shotImpactKnockdownPending||0,shotImpactKnockdownSeconds(impact,stat(keeper,'strength')));
  keeper.action='launched';keeper.actionTimer=1.1;keeper.z=Math.max(keeper.z,12);
  keeper.vz=clamp(100+impact*150,100,470);
  keeper.x=clamp(keeper.x+direction.x*impact*40,F.x+22,F.x+F.w-22);
  keeper.y=clamp(keeper.y+direction.y*impact*24,F.y+23,F.y+F.h-23);
  b.strike.energy*=.56;b.strike.hits++;b.power=b.strike.energy;b.vx*=.8;b.vy*=.8;
  if(b.strike.energy<26||b.strike.hits>=3){b.shot=null;b.strike.kind='normal';}
  this.burst(keeper.x,keeper.y,'#fff1a9',25);this.shake=.21;
  this.emit('shotImpact',{player:keeper.src.name,team:keeper.t,special:true,keeper:true,force,knock:impact});
  this.emit('shotImpactLaunch',{player:keeper.src.name,team:keeper.t,force,special:true,keeper:true});
  return true;
 }
 trySweptKeeperDive(previous){
  const b=this.ball;
  if(b.owner||b.shot?.underground||![0,1].includes(b.attacker))return false;
  const keeper=this.player(1-b.attacker,0);
  if(!keeper||keeper.diveCooldown>0||keeper.stun>0)return false;
  const toward=keeper.t===0?-1:1;
  if(b.vx*toward<=0)return false;
  const dx=b.x-previous.x;
  if(!dx||dx*toward<=0)return false;
  const fraction=(keeper.x-previous.x)/dx;
  if(fraction<0||fraction>1)return false;
  const atY=previous.y+(b.y-previous.y)*fraction;
  const atZ=previous.z+(b.z-previous.z)*fraction;
  // Do not dive at shots that will clearly miss well outside the goal mouth.
  if(atY<WORLD.goalTop-80||atY>WORLD.goalBottom+80)return false;
  const end={x:b.x,y:b.y,z:b.z};
  b.x=keeper.x;b.y=atY;b.z=Math.max(0,atZ);
  if(this.tryKeeperDive(keeper,false))return true;
  b.x=end.x;b.y=end.y;b.z=end.z;
  return false;
 }
 requestKeeperDive(team){return this.tryKeeperDive(this.player(team,0),true);}
 jump(p){
  if(p.stun>0)return false;
  // 100 retains the original 420/535 impulses and 14-unit double-jump lift.
  // Scaling velocity by sqrt(height ratio) makes peak height proportional to rating.
  const {firstImpulse,doubleImpulse,initialLift,doubleLift}=jumpMetrics(stat(p,'jumping'));
  if(p.z>10){
   if(p.jumpCount>=2||p.vz>275||p.fatigue>.86)return false;
   this.spendStamina(p,'jump');
   p.vz=Math.max(p.vz,doubleImpulse);
   p.z+=doubleLift;
   p.jumpCount=2;p.action='doubleJump';p.actionTimer=.5;
   this.emit('doubleJump',{team:p.t,player:p.src.name});return true;
  }
  this.spendStamina(p,'jump');
  p.z=initialLift;p.vz=firstImpulse;
  p.jumpCount=1;p.action='jump';p.actionTimer=.5;return true;
 }

 // Resolve impact only at the actual player's location, including while a slide travels.
 slideContact(p){
  const targets=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&q.invuln<=0&&distance(p,q)<64)
   .sort((a,b)=>(this.ball.owner===b?1:0)-(this.ball.owner===a?1:0)||distance(p,a)-distance(p,b));
  const q=targets[0];if(!q)return false;
  const c=contest(p,q,true),odds=Math.min(.96,c.knockChance*moraleFactor(p.morale)/moraleFactor(q.morale)*(1-Math.min(.57,(q.trickGuard||0)*(1+stat(q,'dribbling')/200))));
  if(Math.random()>=odds)return false;
  if(this.ball.owner===q&&q.z<=8&&Math.hypot(q.moveVX||0,q.moveVY||0)>=50){
   const speed=Math.hypot(q.moveVX,q.moveVY),trailing=((p.x-q.x)*q.moveVX+(p.y-q.y)*q.moveVY)/speed;
   if(trailing< -12){
    this.emit('foul',{team:q.t,player:q.src.name,offenderTeam:p.t,offender:p.src.name,kind:'slideFromBehind'});
    if(this.isInPenaltyArea(q.t,q.x,q.y))this.startPK(false,q.t);
    else this.startFreeKick(q.t,q.x,q.y);
    p.slideTimer=0;p.slideRemaining=0;return true;
   }
  }
  const dir=norm(q.x-p.x,q.y-p.y);
  q.stun=Math.max(q.stun,tackleStunDuration(stat(q,'strength'),true,c.duration));q.action='hurt';q.actionTimer=Math.max(q.actionTimer||0,q.stun);q.invuln=1.1;
  q.x+=dir.x*36;q.y+=dir.y*21;this.burst(q.x,q.y,'#ffdf81',11);this.shake=.12;
  this.emit('tackleHit',{team:p.t,victim:q.src.name,stun:q.stun,slide:true});
  if(this.ball.owner===q){this.ball.owner=null;this.ball.x=q.x;this.ball.y=q.y;this.ball.z=23;this.ball.vx=dir.x*150;this.ball.vy=dir.y*150;this.ball.vz=115;this.ball.canCollect=.15;}
  p.slideTimer=0;p.slideRemaining=0;return true;
 }
 tackle(p,slide=false){
  if(p.cd>0||p.stun>0)return false;
  this.spendStamina(p,slide?'slide':'tackle');p.cd=slide?.68:.57;p.action=slide?'slide':'punch';p.actionTimer=slide?.48:.4;
  const near=this.players.filter(q=>q.t!==p.t&&!q.keeper&&!q.stun);
  const owner=this.ball.owner?.t!==p.t?this.ball.owner:null;
  const target=owner&&distance(p,owner)<280?owner:near.sort((a,b)=>distance(p,a)-distance(p,b))[0];
  const dir=target?norm(target.x-p.x,target.y-p.y):norm(p.dx||p.face,p.dy||0);
  if(slide){
   // A slide is a timed physical dash rather than a 26-unit teleport. Run-up speed matters.
   const running=Math.hypot(p.moveVX||0,p.moveVY||0)>this.playerSpeed(p)*.65 || p.dashTimer>0 || p.sprintCharge>.1;
   p.slideTimer=running?.46:.34;p.slideSpeed=(running?585:395)*(0.85+stat(p,'speedRating')/600);
   // A fixed travel budget stops a low-FPS or sprinting slide crossing the pitch.
   const defenceReach=.5+.5*(stat(p,'defence')-1)/99;
   p.slideRemaining=(running?148:104)*defenceReach;p.slideBudget=p.slideRemaining;p.slideTravelled=0;
   p.slideDX=dir.x;p.slideDY=dir.y;p.moveVX=0;p.moveVY=0;
   this.emit('slideStart',{team:p.t,player:p.src.name,running,reach:Math.round(Math.min(p.slideRemaining,p.slideTimer*p.slideSpeed))});
   this.slideContact(p);return true;
  }
  p.x+=dir.x*16;p.y+=dir.y*16;
  if(target&&distance(p,target)<62&&target.invuln<=0&&Math.random()<Math.min(.96,contest(p,target,false).knockChance*moraleFactor(p.morale)/moraleFactor(target.morale))){
   target.stun=Math.max(target.stun,tackleStunDuration(stat(target,'strength'),false,contest(p,target,false).duration));target.action='hurt';target.actionTimer=target.stun;target.invuln=1.1;
   target.x+=dir.x*36;target.y+=dir.y*21;this.burst(target.x,target.y,'#ffdf81',11);this.shake=.12;
   this.emit('tackleHit',{team:p.t,victim:target.src.name,stun:target.stun,slide:false});
   if(this.ball.owner===target){this.ball.owner=null;this.ball.x=target.x;this.ball.y=target.y;this.ball.z=23;this.ball.vx=dir.x*150;this.ball.vy=dir.y*150;this.ball.vz=115;this.ball.canCollect=.15;}
  }
  return true;
 }
  resolveSpinBumper(p){
   if(!p||!p.spinBumperPending)return false;
   p.spinBumperPending=null;
   const move=fieldAbility(p.src);
   if(!move||move.id!=='spinBumper'||p.src.role!=='DF'||abilityLevel(p,'defence')<3||p.stun>0)return false;
   const hits=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&q.invuln<=0&&q.z<=20&&(q.dashTimer||0)<=0&&distance(p,q)<=move.radius);
   for(const q of hits){
    const away=norm(q.x-p.x,q.y-p.y);
    q.stun=Math.max(q.stun,Math.min(move.stun,impactStun('defence',(stat(p,'aggression')*.42+stat(p,'defence')*.31+36)*levelModifiers(abilityLevel(p,'defence')).stun,stat(q,'strength'))));
    q.invuln=1.1;q.action='hurt';q.actionTimer=q.stun;
    q.x=clamp(q.x+away.x*move.push,F.x+22,F.x+F.w-22);q.y=clamp(q.y+away.y*move.push,F.y+22,F.y+F.h-22);
    if(this.ball.owner===q){this.ball.owner=null;this.ball.x=q.x;this.ball.y=q.y;this.ball.z=24;this.ball.vx=away.x*280;this.ball.vy=away.y*280;this.ball.vz=155;this.ball.canCollect=.23;}
   }
   p.spinBumperImpactFx=.28;
   this.burst(p.x,p.y,move.color,this.options?.reducedFlash?5:18);
   this.emit('defenceSuper',{team:p.t,player:p.src.name,id:move.id,level:abilityLevel(p,'defence'),hits:hits.length,cooldown:move.cooldown});
   return hits.length>0;
  }
  updateSpinBumper(p,dt,deferResolve=false){
   if(!p?.spinBumperPending)return false;
   if(p.stun>0){p.spinBumperPending=null;p.abilityFx=0;this.emit('spinBumperInterrupted',{team:p.t,player:p.src.name});return false;}
   p.spinBumperPending.remaining=Math.max(0,p.spinBumperPending.remaining-Math.max(0,dt||0));
   if(p.spinBumperPending.remaining<=1e-9)return deferResolve?false:this.resolveSpinBumper(p);
   return false;
  }
 reactToSpinBumper(p,dt,reactionSeconds){
  // Spin Bumper's resolve hit-set excludes keepers; do not make a CPU keeper
  // spend a jump reaction on a telegraph that cannot affect them.
  if(p.keeper){p.aiSpinBumperThreat=null;p.aiSpinBumperReaction=0;return false;}
   const threat=this.players.find(q=>{const move=fieldAbility(q?.src);return q&&q.t!==p.t&&!q.keeper&&q.spinBumperPending&&move?.id==='spinBumper'&&distance(p,q)<=move.radius;});
   if(!threat){p.aiSpinBumperThreat=null;p.aiSpinBumperReaction=0;return false;}
  if(p.z>20||(p.dashTimer||0)>0||(p.action==='jump'&&(p.actionTimer||0)>0)){
   p.aiSpinBumperThreat=threat;p.aiSpinBumperReaction=0;return false;
  }
   if(p.aiSpinBumperThreat!==threat){p.aiSpinBumperThreat=threat;p.aiSpinBumperReaction=Math.max(0,Number(reactionSeconds)||0);}
   p.aiSpinBumperReaction=Math.max(0,(p.aiSpinBumperReaction||0)-Math.max(0,dt||0));
   if(p.aiSpinBumperReaction<=1e-9){p.aiSpinBumperReaction=Infinity;return this.jump(p);}
   return false;
  }
 // Defensive abilities are only available to explicitly assigned characters.
 activateDefence(p){
  const move=fieldAbility(p.src);if(!abilityReady(p,move)||this.ball.owner===p||p.keeper)return false;
  if(move.id==='supernova'){
   if(p.src.role!=='DF'||this.supernova||(this.magicWalls||[]).length>0)return false;
   this.supernova={team:p.t,x:p.x,y:p.y,radius:move.radius,remaining:move.telegraph,telegraph:move.telegraph,stun:move.stun,push:move.push};
   p.abilityCd=move.cooldown;p.cd=Math.max(p.cd,.55);p.abilityFx=.95;p.action='defenceSuper';p.actionTimer=move.telegraph;
   this.spendStamina(p,'defenceSuper');this.burst(p.x,p.y,move.color,this.options?.reducedFlash?4:10);
   if(!this.options?.reducedFlash){this.shake=.08;this.flash=Math.max(this.flash,.035);}
   this.emit('supernovaTelegraph',{team:p.t,player:p.src.name,radius:move.radius,seconds:move.telegraph});return true;
  }
   if(['magicWall','fireWall','iceWall','demonWall'].includes(move.id)){
   if(p.src.role!=='DF'||abilityLevel(p,'defence')<({magicWall:1,fireWall:2,iceWall:3,demonWall:4}[move.id]||1)||this.supernova||(this.magicWalls||[]).length>0)return false;
   const x=clamp(p.x+(p.face||1)*move.range,F.x+move.thickness,F.x+F.w-move.thickness);
   const y=clamp(p.y,F.y+move.halfLength,F.y+F.h-move.halfLength);
    this.magicWalls=[...(this.magicWalls||[]),{id:move.id,level:abilityLevel(p,'defence'),team:p.t,x,y,face:p.face||1,halfLength:move.halfLength,thickness:move.thickness,height:move.height,duration:move.duration,arm:.35,color:move.color,particleColor:move.particleColor||move.color,particleCount:move.particleCount||null}];
   p.abilityCd=move.cooldown;p.cd=Math.max(p.cd,.55);p.abilityFx=.9;p.action='defenceSuper';p.actionTimer=.65;
    this.spendStamina(p,'defenceSuper');this.burst(x,y,move.color,move.particleCount||24);this.shake=.14;
   this.emit('defenceSuper',{team:p.t,player:p.src.name,id:move.id,level:abilityLevel(p,'defence'),hits:0,cooldown:move.cooldown});return true;
  }
  // Explicitly equipped level-3+ defenders only: no changes to existing squad loadouts.
  if(move.id==='spinBumper'&&(p.src.role!=='DF'||abilityLevel(p,'defence')<3))return false;
  if(move.id==='maceSweep'&&p.src.role!=='DF')return false;
  const opponents=this.players.filter(q=>q.t!==p.t&&q.stun<=0&&q.invuln<=0&&!q.keeper);
  const targets=opponents.filter(q=>{
   const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);
   const inRange=d<(move.id==='drill'||move.id==='maceSweep'?move.range:move.radius);
   const forward=dx*(p.face||1);
   const inMaceArc=move.id!=='maceSweep'||(forward>0&&Math.abs(dy)<=forward*move.arcSlope&&q.z<=20&&(q.dashTimer||0)<=0);
   // Drill and Shock Burst resolve immediately, but an already airborne or
   // dashing opponent has committed to an existing four-button escape and is
   // not a valid hit. Missing legacy fixture fields still mean grounded.
   const immediateEscape=move.id==='drill'||move.id==='burst';
   const grounded=q.z==null||(Number.isFinite(q.z)&&q.z<=20);
   const notDashing=q.dashTimer==null||(Number.isFinite(q.dashTimer)&&q.dashTimer<=1e-9);
   return inRange&&inMaceArc&&(move.id!=='spinBumper'||(q.z<=20&&(q.dashTimer||0)<=0))&&
    (!immediateEscape||(grounded&&notDashing));
  }); // jump and dash escape bounded sweeps/pulses
  if(!targets.length)return false; // no wasted cooldown if no target is close
   if(move.id==='spinBumper'){
    p.spinBumperPending={remaining:.42};p.abilityCd=move.cooldown;p.cd=Math.max(p.cd,.55);p.abilityFx=.42;p.action='defenceSuper';p.actionTimer=.42;
    this.spendStamina(p,'spinBumper');this.burst(p.x,p.y,move.color,this.options?.reducedFlash?3:6);
    this.emit('spinBumperTelegraph',{team:p.t,player:p.src.name,radius:move.radius,seconds:.42});return true;
   }
  const target=targets.sort((a,b)=>distance(p,a)-distance(p,b))[0];
  if(move.id==='maceSweep'){
   p.maceSweepPending={remaining:.24,target};p.abilityCd=move.cooldown;p.cd=Math.max(p.cd,.55);
   p.abilityFx=.24;p.action='defenceSuper';p.actionTimer=.24;
   this.spendStamina(p,'defenceSuper');this.burst(p.x,p.y,move.color,this.options?.reducedFlash?4:8);
   this.emit('maceSweepTelegraph',{team:p.t,player:p.src.name,target:target.src.name,seconds:.24,
    range:move.range,arcSlope:move.arcSlope});return true;
  }
  if(move.id==='drill'){
    const v=norm(target.x-p.x,target.y-p.y);p.face=v.x>=0?1:-1;
    p.x=clamp(target.x-v.x*35,F.x+22,F.x+F.w-22);p.y=clamp(target.y-v.y*35,F.y+22,F.y+F.h-22);
  }
  const hits=move.id==='drill'||move.id==='maceSweep'?[target]:targets;
  for(const q of hits){if(distance(p,q)>(move.radius??move.range)+(move.id==='drill'?7:0))continue;
    const resistance=stat(q,'strength')*.40+stat(q,'defence')*.15;
    const force=stat(p,'aggression')*.42+stat(p,'defence')*.31+36;
    // Guaranteed stagger; strength/defence reduce stun duration.
    const stagger=impactStun('defence',force*levelModifiers(abilityLevel(p,'defence')).stun,stat(q,'strength'));
    q.stun=Math.max(q.stun,move.id==='spinBumper'?Math.min(.72,stagger):move.id==='maceSweep'?Math.min(move.stun,stagger):stagger);q.invuln=1.1;
    q.action='hurt';q.actionTimer=q.stun;
    if(move.id==='spinBumper'){const away=norm(q.x-p.x,q.y-p.y);q.x=clamp(q.x+away.x*move.push,F.x+22,F.x+F.w-22);q.y=clamp(q.y+away.y*move.push,F.y+22,F.y+F.h-22);}
    if(this.ball.owner===q){this.ball.owner=null;this.ball.x=q.x;this.ball.y=q.y;this.ball.z=24;this.ball.vx=p.face*280;this.ball.vy=(q.y-p.y)*1.3;this.ball.vz=155;this.ball.canCollect=.23;}
  }
  p.abilityCd=move.cooldown;p.cd=Math.max(p.cd,.55);p.abilityFx=move.id==='spinBumper'?.95:.75;p.action='defenceSuper';p.actionTimer=move.id==='spinBumper'?.8:.6;
  this.spendStamina(p,move.id==='spinBumper'?'spinBumper':'defenceSuper');this.burst(p.x,p.y,move.color,move.id==='maceSweep'?20:32);this.shake=.23;
  this.emit('defenceSuper',{team:p.t,player:p.src.name,id:move.id,level:abilityLevel(p,'defence'),hits:hits.length,cooldown:move.cooldown});return true;
 }

 activateKeeperSuper(p,manual=false){
   const move=keeperAbility(p?.src);const b=this.ball;
   if(!p?.keeper||!abilityReady(p,move)||!keeperInReach(p,b,{...move,reachX:move.reachX*levelModifiers(abilityLevel(p,'keeper')).reach,reachY:move.reachY*levelModifiers(abilityLevel(p,'keeper')).reach}))return false;
   if(b.attacker!==1-p.t)return false;
   const sign=p.t===0?1:-1;
   b.owner=null;b.shot=null;b.strike=null;b.vx=sign*move.power*levelModifiers(abilityLevel(p,'keeper')).power;b.vy=(b.y-p.y)*3+(move.id==='tornadoPunch'?sign*115:0);b.vz=move.id==='tornadoPunch'?265:145;
   b.power=0;b.canCollect=.35;b.attacker=p.t;b.lastTouchTeam=p.t;b.age=0;b.trail=[];
   p.abilityCd=move.cooldown;p.abilityFx=.85;p.action='keeperSuper';p.actionTimer=.75;
   p.z=Math.max(p.z,11);this.spendStamina(p,'keeperSuper');this.burst(p.x,p.y,move.color,48);this.shake=.36;
   this.emit('keeperSuper',{team:p.t,player:p.src.name,id:move.id,level:abilityLevel(p,'keeper'),manual,cooldown:move.cooldown});return true;
 }
 requestKeeperSuper(t){const keeper=this.player(t,0);return this.activateKeeperSuper(keeper,true);}
 reactToWindMudTrick(p,dt,reactionSeconds){
  const carrier=this.ball?.owner,trick=carrier?.src?.magicTrick;
  const radius=trick==='wind'?120:100;
  const rivals=carrier&&carrier.t!==p.t&&!carrier.keeper&&(trick==='wind'||trick==='mud')&&
   Number(carrier.dribbleHold)>=.35&&Number(carrier.dribbleHold)<1
   ?this.players.filter(q=>q&&q.t!==carrier.t&&!q.keeper&&q.stun<=0&&q.z<20&&
    (trick!=='mud'||(q.mudSlowTimer||0)<=0)).sort((a,b)=>distance(carrier,a)-distance(carrier,b)):[];
  const threat=rivals[0]===p&&distance(carrier,p)<radius?carrier:null;
  if(!threat){p.aiWindMudThreat=null;p.aiWindMudReaction=0;return false;}
  // Wind and Mud are resolved immediately at the end of the existing one
  // second DRIBBLE hold. Jump or grounded slide already counters either one.
  if(p.z>=20||(p.action==='jump'&&(p.actionTimer||0)>0)||
    (p.action==='slide'&&(p.actionTimer||0)>0))return false;
  if(p.aiWindMudThreat!==threat){p.aiWindMudThreat=threat;p.aiWindMudReaction=Math.max(0,Number(reactionSeconds)||0);}
  p.aiWindMudReaction=Math.max(0,(p.aiWindMudReaction||0)-Math.max(0,dt||0));
  if(p.aiWindMudReaction<=1e-9){p.aiWindMudReaction=Infinity;return this.jump(p);}
  return false;
 }

 resolveMaceSweep(p){
  const pending=p?.maceSweepPending;if(!pending)return false;p.maceSweepPending=null;
  const move=fieldAbility(p.src),q=pending.target;
  if(!move||move.id!=='maceSweep'||p.src.role!=='DF'||p.stun>0){
   p.abilityFx=0;this.emit('maceSweepInterrupted',{team:p.t,player:p.src.name});return false;
  }
  const valid=q&&this.players.includes(q)&&q.t!==p.t&&!q.keeper&&q.stun<=0&&q.invuln<=0&&
   q.z<=20&&(q.dashTimer||0)<=0&&distance(p,q)<move.range&&
   (q.x-p.x)*(p.face||1)>0&&Math.abs(q.y-p.y)<=Math.abs((q.x-p.x)*(p.face||1));
  if(!valid){this.emit('maceSweepResolved',{team:p.t,player:p.src.name,target:q?.src?.name,hit:false,countered:false});return false;}
  const slide=q.action==='slide'&&q.actionTimer>0&&q.z<20;
  const facing=(q.face||1)*(p.x-q.x)>0;
  const closing=((q.dx||0)*(p.x-q.x)+(q.dy||0)*(p.y-q.y))>0;
  const read=facing&&closing&&stat(q,'defence')>=stat(p,'dribbling');
  if(slide||read){
   this.emit('maceSweepResolved',{team:p.t,player:p.src.name,target:q.src.name,hit:false,countered:true,
    counter:slide?'slide':'read'});return false;
  }
  const away=norm(q.x-p.x,q.y-p.y);
  q.stun=Math.max(q.stun,Math.min(move.stun,impactStun('defence',
   (stat(p,'aggression')*.42+stat(p,'defence')*.31+36)*levelModifiers(abilityLevel(p,'defence')).stun,
   stat(q,'strength'))));
  q.invuln=1.1;q.action='hurt';q.actionTimer=q.stun;
  q.x=clamp(q.x+away.x*move.push,F.x+22,F.x+F.w-22);
  q.y=clamp(q.y+away.y*move.push,F.y+22,F.y+F.h-22);
  if(this.ball.owner===q){this.ball.owner=null;this.ball.x=q.x;this.ball.y=q.y;this.ball.z=24;
   this.ball.vx=p.face*280;this.ball.vy=(q.y-p.y)*1.3;this.ball.vz=155;this.ball.canCollect=.23;}
  p.maceSweepImpactFx=.24;
  this.burst(p.x,p.y,move.color,this.options?.reducedFlash?5:18);
  this.emit('defenceSuper',{team:p.t,player:p.src.name,id:move.id,level:abilityLevel(p,'defence'),hits:1,cooldown:move.cooldown});
  this.emit('maceSweepResolved',{team:p.t,player:p.src.name,target:q.src.name,hit:true,countered:false});return true;
 }
 updateMaceSweep(p,dt,deferResolve=false){
  if(!p?.maceSweepPending)return false;
  if(p.stun>0){p.maceSweepPending=null;p.abilityFx=0;
   this.emit('maceSweepInterrupted',{team:p.t,player:p.src.name});return false;}
  p.maceSweepPending.remaining=Math.max(0,p.maceSweepPending.remaining-Math.max(0,dt||0));
  if(p.maceSweepPending.remaining<=1e-9)return deferResolve?false:this.resolveMaceSweep(p);
  return false;
 }
 dribble(p){
  if(this.ball.owner===p){if(p.cd>0||p.stun>0||p.breath<.55)return false;
   const dx=p.dx||p.face,dy=p.dy||0,n=norm(dx,dy);
   p.x=clamp(p.x+n.x*19,F.x+25,F.x+F.w-25);p.y=clamp(p.y+n.y*19,F.y+25,F.y+F.h-25);
   p.dribbleCooldown=0;p.cd=.43;p.action='dribble';p.actionTimer=.44;this.spendStamina(p,'dribble');this.emit('dribble',{team:p.t,player:p.src.name});return true;
  }
  this.swap(p.t);return true;
 }
 reactToMaceSweep(p,dt,reactionSeconds){
  const threat=this.players.find(q=>q&&q.t!==p.t&&!q.keeper&&q.maceSweepPending?.target===p&&
   fieldAbility(q.src)?.id==='maceSweep');
  if(!threat){p.aiMaceSweepThreat=null;p.aiMaceSweepReaction=0;return false;}
  if(p.z>20||(p.dashTimer||0)>0||(p.action==='jump'&&(p.actionTimer||0)>0)||
    (p.action==='slide'&&(p.actionTimer||0)>0)){
   p.aiMaceSweepThreat=threat;p.aiMaceSweepReaction=0;return false;
  }
  if(p.aiMaceSweepThreat!==threat){p.aiMaceSweepThreat=threat;p.aiMaceSweepReaction=Math.max(0,Number(reactionSeconds)||0);}
  p.aiMaceSweepReaction=Math.max(0,(p.aiMaceSweepReaction||0)-Math.max(0,dt||0));
  if(p.aiMaceSweepReaction<=1e-9){p.aiMaceSweepReaction=Infinity;return this.jump(p);}
  return false;
 }
 reactToLightningTrick(p,dt,reactionSeconds){
  const threat=this.players.find(q=>q&&q.t!==p.t&&!q.keeper&&q.lightningPending?.target===p);
  if(!threat){p.aiLightningThreat=null;p.aiLightningReaction=0;return false;}
  if((threat.lightningPending.remaining||0)<=1e-9){p.aiLightningThreat=null;p.aiLightningReaction=0;return false;}
  if(p.keeper||p.z>10||p.stun>0||(p.action==='jump'&&(p.actionTimer||0)>0)||
    (p.action==='slide'&&(p.actionTimer||0)>0)){
   p.aiLightningThreat=threat;p.aiLightningReaction=0;return false;
  }
  if(p.aiLightningThreat!==threat){p.aiLightningThreat=threat;p.aiLightningReaction=Math.max(0,Number(reactionSeconds)||0);}
  p.aiLightningReaction=Math.max(0,(p.aiLightningReaction||0)-Math.max(0,dt||0));
  if(p.aiLightningReaction<=1e-9){p.aiLightningReaction=Infinity;return this.jump(p);}
  return false;
 }
 reactToFireballTrick(p,dt,reactionSeconds){
  const carrier=this.ball?.owner;
  const trick=carrier?.src?.magicTrick;
  const radius=trick==='fireball'?120:95;
  const rivals=carrier&&carrier.t!==p.t&&!carrier.keeper&&(trick==='fireball'||trick==='freeze'||trick==='bat')&&
   Number(carrier.dribbleHold)>=.35&&Number(carrier.dribbleHold)<1
   ?this.players.filter(q=>q&&q.t!==carrier.t&&!q.keeper&&q.stun<=0).sort((a,b)=>distance(carrier,a)-distance(carrier,b)):[];
  const threat=rivals[0]===p&&distance(carrier,p)<radius?carrier:null;
  if(!threat){p.aiFireballThreat=null;p.aiFireballReaction=0;return false;}
  if(p.z>=20||(p.action==='jump'&&(p.actionTimer||0)>0))return false;
  if(p.action==='slide'&&(p.actionTimer||0)>0){p.aiFireballThreat=threat;return false;}
  if(p.aiFireballThreat!==threat){p.aiFireballThreat=threat;p.aiFireballReaction=Math.max(0,Number(reactionSeconds)||0);}
  p.aiFireballReaction=Math.max(0,(p.aiFireballReaction||0)-Math.max(0,dt||0));
  if(p.aiFireballReaction<=1e-9){p.aiFireballReaction=Infinity;return this.jump(p);}
  return false;
 }
 reactToSpinSandTrick(p,dt,reactionSeconds){
  const carrier=this.ball?.owner,trick=carrier?.src?.magicTrick;
  const rivals=carrier&&carrier.t!==p.t&&!carrier.keeper&&(trick==='spinBump'||trick==='sandTrap')&&
   Number(carrier.dribbleHold)>=.35&&Number(carrier.dribbleHold)<1
   ?this.players.filter(q=>q&&q.t!==carrier.t&&!q.keeper&&q.stun<=0).sort((a,b)=>distance(carrier,a)-distance(carrier,b)):[];
  const threat=rivals[0]===p&&distance(carrier,p)<82?carrier:null;
  if(!threat){p.aiSpinSandThreat=null;p.aiSpinSandReaction=0;return false;}
  if(p.z>=20||(p.action==='jump'&&(p.actionTimer||0)>0)||
    (p.action==='slide'&&(p.actionTimer||0)>0))return false;
  if(p.aiSpinSandThreat!==threat){p.aiSpinSandThreat=threat;p.aiSpinSandReaction=Math.max(0,Number(reactionSeconds)||0);}
  p.aiSpinSandReaction=Math.max(0,(p.aiSpinSandReaction||0)-Math.max(0,dt||0));
  if(p.aiSpinSandReaction<=1e-9){p.aiSpinSandReaction=Infinity;return this.jump(p);}
  return false;
 }
 reactToScreamTrick(p,dt,reactionSeconds){
  // The existing one-second hold is the only warning; start reacting early enough to rise into its JUMP counter.
  const carrier=this.ball?.owner;
  const target=carrier&&carrier.t!==p.t&&!carrier.keeper&&carrier.src?.magicTrick==='scream'&&
   Number(carrier.dribbleHold)>=.35&&Number(carrier.dribbleHold)<1&&
   Number.isFinite(carrier.x)&&Number.isFinite(carrier.y)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&distance(carrier,p)<=135
   ?this.players.filter(q=>q&&q.t!==carrier.t&&!q.keeper&&q.stun<=0&&Number.isFinite(q.x)&&Number.isFinite(q.y)).sort((a,b)=>distance(carrier,a)-distance(carrier,b))[0]:null;
  const threat=target===p?carrier:null;
  if(!threat){p.aiScreamThreat=null;p.aiScreamReaction=0;return false;}
  if(p.z>=20||(p.action==='jump'&&(p.actionTimer||0)>0)||(p.action==='slide'&&(p.actionTimer||0)>0))return false;
  if(p.aiScreamThreat!==threat){p.aiScreamThreat=threat;p.aiScreamReaction=Number.isFinite(reactionSeconds)&&reactionSeconds>=0?reactionSeconds:.78;}
  p.aiScreamReaction=Math.max(0,(p.aiScreamReaction||0)-(Number.isFinite(dt)?Math.max(0,dt):0));
  if(p.aiScreamReaction<=1e-9){p.aiScreamReaction=Infinity;return this.jump(p);}
  return false;
 }
 reactToTeleportTrick(p,dt,reactionSeconds){
  const carrier=this.ball?.owner;
  const rivals=carrier&&carrier.t!==p.t&&!carrier.keeper&&carrier.src?.magicTrick==='teleport'&&
   Number(carrier.dribbleHold)>=.35&&Number(carrier.dribbleHold)<1
   ?this.players.filter(q=>q&&q.t!==carrier.t&&!q.keeper&&q.stun<=0).sort((a,b)=>distance(carrier,a)-distance(carrier,b)):[];
  const forward=carrier?norm(carrier.dx||carrier.face,carrier.dy||0):{x:1,y:0};
  const offsetX=p.x-(carrier?.x||0),offsetY=p.y-(carrier?.y||0);
  const ahead=offsetX*forward.x+offsetY*forward.y,across=Math.abs(offsetX*forward.y-offsetY*forward.x);
  const laneThreat=carrier&&rivals[0]===p&&ahead>0&&ahead<=85&&across<=35?carrier:null;
  const threat=laneThreat&&(p.aiTeleportThreat===laneThreat||p.cd<=0&&p.stun<=0&&p.z<20)?laneThreat:null;
  if(!threat){p.aiTeleportThreat=null;p.aiTeleportReaction=0;p.aiTeleportReady=false;return false;}
  if(p.action==='slide'&&(p.actionTimer||0)>0){p.aiTeleportThreat=threat;return false;}
  if(p.aiTeleportThreat!==threat){p.aiTeleportThreat=threat;p.aiTeleportReaction=Math.max(0,Number(reactionSeconds)||0);p.aiTeleportReady=false;}
  if(!p.aiTeleportReady){p.aiTeleportReaction=Math.max(0,(p.aiTeleportReaction||0)-Math.max(0,dt||0));if(p.aiTeleportReaction<=1e-9)p.aiTeleportReady=true;}
  if(p.aiTeleportReady&&Number(threat.dribbleHold)>=.88){p.aiTeleportReaction=Infinity;return this.tackle(p,true);}
  return false;
 }
 reactToSupernova(p,dt,reactionSeconds){
  const nova=this.supernova;
  const threat=nova&&nova.team!==p.t&&distance(p,nova)<=nova.radius?nova:null;
  if(!threat){p.aiSupernovaKey=null;p.aiSupernovaReaction=0;return false;}
  const key=`${threat.team}:${threat.x}:${threat.y}`;
  if(key!==p.aiSupernovaKey){p.aiSupernovaKey=key;p.aiSupernovaReaction=Math.max(0,Number(reactionSeconds)||0);}
  if(p.keeper||p.z>=20){
   p.aiSupernovaReaction=Infinity;return false;
  }
  if(p.stun>0)return false;
  p.aiSupernovaReaction=Math.max(0,(p.aiSupernovaReaction||0)-Math.max(0,dt||0));
  // Leave enough of the warning for the standard jump to rise into Supernova's
  // existing z>=20 counter; never issue an ineffective jump on the impact tick.
  if(threat.remaining<=.12){p.aiSupernovaReaction=Infinity;return false;}
  if(p.action==='slide'&&(p.actionTimer||0)>0&&p.z<20){
   // A slide only counters if it remains active through the Supernova impact.
   // Otherwise retain the elapsed difficulty timer and jump once the slide ends;
   // an early slide must not suppress the rest of the warning response.
   if(p.actionTimer>=threat.remaining){p.aiSupernovaReaction=Infinity;return false;}
   return false;
  }
  if(p.aiSupernovaReaction<=1e-9){p.aiSupernovaReaction=Infinity;return this.jump(p);}
  return false;
 }
 reactToWeatherLightning(p,dt,reactionSeconds){
  const cue=this.weatherLightning;
  const key=cue&&cue.phase==='warning'?`${cue.x}:${cue.y}`:null;
  if(!key||p.keeper){p.aiWeatherKey=null;p.aiWeatherReaction=0;p.aiWeatherEvading=false;return false;}
  const radius=cue.radius||110,distanceToStrike=Math.hypot(p.x-cue.x,p.y-cue.y);
  if(distanceToStrike>=radius+8){p.aiWeatherKey=null;p.aiWeatherReaction=0;p.aiWeatherEvading=false;return false;}
  if(p.aiWeatherKey!==key){p.aiWeatherKey=key;p.aiWeatherReaction=Math.max(0,Number(reactionSeconds)||0);p.aiWeatherEvading=false;}
  if(!p.aiWeatherEvading){
   p.aiWeatherReaction=Math.max(0,(p.aiWeatherReaction||0)-Math.max(0,dt||0));
   if(p.aiWeatherReaction>1e-9)return false;
   if(cue.remaining<=.12){p.aiWeatherEvading=false;return false;}
   p.aiWeatherEvading=true;
  }
  const away=norm(p.x-cue.x||(p.t===0?-1:1),p.y-cue.y);
  const speed=this.playerSpeed(p)*aiTuning(this.cpuLevel(p)).speed*(p.jumpHold>.12?1.37:1);
  this.moveAgile(p,away.x,away.y,speed,Math.max(0,dt||0));
  this.staminaTick(p,Math.max(0,dt||0),p.jumpHold>.12?.7:.46);
  return true;
 }
 reactToTornado(p,dt,reactionSeconds){
  const tornado=this.tornado;
  const key=tornado?`${tornado.x}:${tornado.y}`:null;
  if(!key||p.keeper){p.aiTornadoKey=null;p.aiTornadoReaction=0;p.aiTornadoEvading=false;return false;}
  const radius=tornado.radius||150,distanceToTornado=Math.hypot(p.x-tornado.x,p.y-tornado.y);
  if(distanceToTornado>=radius+8){p.aiTornadoKey=null;p.aiTornadoReaction=0;p.aiTornadoEvading=false;return false;}
  if(p.aiTornadoKey!==key){p.aiTornadoKey=key;p.aiTornadoReaction=Math.max(0,Number(reactionSeconds)||0);p.aiTornadoEvading=false;}
  if(!p.aiTornadoEvading){
   p.aiTornadoReaction=Math.max(0,(p.aiTornadoReaction||0)-Math.max(0,dt||0));
   if(p.aiTornadoReaction>1e-9)return false;
   p.aiTornadoEvading=true;
  }
  const away=norm(p.x-tornado.x||(p.t===0?-1:1),p.y-tornado.y);
  const speed=this.playerSpeed(p)*aiTuning(this.cpuLevel(p)).speed*(p.jumpHold>.12?1.37:1);
  this.moveAgile(p,away.x,away.y,speed,Math.max(0,dt||0));
  this.staminaTick(p,Math.max(0,dt||0),p.jumpHold>.12?.7:.46);
  return true;
 }
 reactToMagicHazard(p,dt,reactionSeconds){
  if(p.keeper){p.aiHazardKey=null;p.aiHazardReaction=0;p.aiHazardEvading=false;return false;}
  const hazard=(this.magicHazards||[]).filter(h=>h&&h.team!==p.t&&
   (h.kind==='banana'||h.kind==='ice')&&h.life>0&&(h.arm||0)<=.15&&
   Number.isFinite(h.x)&&Number.isFinite(h.y))
   .map(h=>({h,radius:h.kind==='ice'?35:27,d:Math.hypot(p.x-h.x,p.y-h.y)}))
   .sort((a,b)=>a.d-b.d)[0];
  if(!hazard||hazard.d>=hazard.radius+60){p.aiHazardKey=null;p.aiHazardReaction=0;p.aiHazardEvading=false;return false;}
  const key=`${hazard.h.kind}:${hazard.h.team}:${hazard.h.x}:${hazard.h.y}`;
  if(p.aiHazardKey!==key){p.aiHazardKey=key;p.aiHazardReaction=hazard.d<=hazard.radius+20?0:Math.max(0,Number(reactionSeconds)||0);p.aiHazardEvading=false;}
  if(p.z>=20||(p.action==='slide'&&(p.actionTimer||0)>0))return false;
  if(!p.aiHazardEvading){
   p.aiHazardReaction=Math.max(0,(p.aiHazardReaction||0)-Math.max(0,dt||0));
   if(p.aiHazardReaction>1e-9)return false;
   p.aiHazardEvading=true;
  }
  const away=norm(p.x-hazard.h.x||(p.t===0?-1:1),p.y-hazard.h.y);
  const speed=this.playerSpeed(p)*aiTuning(this.cpuLevel(p)).speed*(p.jumpHold>.12?1.37:1);
  this.moveAgile(p,away.x,away.y,speed,Math.max(0,dt||0));
  this.staminaTick(p,Math.max(0,dt||0),p.jumpHold>.12?.7:.46);
  return true;
 }
 // v0.8.6: two deliberate contextual tricks without additional touch buttons.
 // Jump + Dribble while carrying the ball triggers an arcing bicycle shot.
 tryBicycleShot(p){
  if(!p||p.keeper||p.stun>0||p.cd>0||this.ball.owner!==p||p.fatigue>.94)return false;
  const goalX=p.t===0?F.x+F.w:F.x,goalY=(WORLD.goalTop+WORLD.goalBottom)/2;
  const accuracy=stat(p,'shootAccuracy'),power=stat(p,'shootPower');
  const err=(Math.random()-.5)*(105-accuracy)*3.2;
  const dir=norm(goalX-p.x,goalY-p.y+err);
  const ballSpeed=(500+power*3.35)*endurance(p)*moraleFactor(p.morale)*(this.options.gameSpeed||1);
  this.ball.owner=null;this.ball.shot=null;this.ball.x=p.x+p.face*25;this.ball.y=p.y;
  this.ball.z=Math.max(45,p.z+48);this.ball.vx=dir.x*ballSpeed;this.ball.vy=dir.y*ballSpeed;
  this.ball.vz=255;this.ball.attacker=p.t;this.ball.lastTouchTeam=p.t;this.ball.shooter=p.src.name;
  this.ball.power=power*.72;this.ball.age=0;this.ball.canCollect=.24;this.ball.trail=[];
  p.z=Math.max(p.z,18);p.vz=Math.max(p.vz,210);p.action='bicycle';p.actionTimer=.65;p.cd=.64;
  this.spendStamina(p,'bicycle');this.burst(p.x,p.y,'#d9a7ff',15);
  const release=shotReleaseSnapshot(p,{...this.ball,targetY:goalY+err},this.players,'bicycle');this.emit('bicycleShot',{team:p.t,player:p.src.name,speed:ballSpeed,release});this.emit('shotRelease',{release});return true;
 }
 // Deliberately held Dribble, THEN Jump: lift the standard football over the
 // carrier's head without jumping. A quick Jump+Dribble still uses tryBicycleShot.
 // The prior Dribble tap can have started a dash; only this precise follow-up
 // is permitted to interrupt its cooldown. No fifth action button is needed.
 tryBallLift(p){
  if(!p||p.keeper||p.stun>0||p.fatigue>.94||p.z>0||this.ball.owner!==p||p.ballLiftLock)return false;
  if((p.dribbleHold||0)<BALL_LIFT_HOLD_SECONDS)return false;
  const b=this.ball;
  b.owner=null;b.liftOwner=p;b.shot=null;b.x=p.x+p.face*14;b.y=p.y;
  b.z=112;b.vx=0;b.vy=0;b.vz=215;b.power=0;b.attacker=-1;b.lastTouchTeam=p.t;b.shooter=null;
  b.age=0;b.canCollect=.24;b.trail=[];b.targetY=null;
  p.ballLiftWindow=BALL_LIFT_WINDOW_SECONDS;p.ballLiftLock=true;
  p.cd=.16;p.jumpTapPending=false;p.jumpHold=0;p.charge=0;
  p.action='ballLift';p.actionTimer=.44;
  this.spendStamina(p,'dribble');this.burst(p.x,p.y,'#b8eeff',14);
  this.emit('ballLift',{team:p.t,player:p.src.name,seconds:BALL_LIFT_WINDOW_SECONDS});
  return true;
 }
 // Revised v0.8.22.1 action grammar. Any nearby loose *aerial* ball works:
 // after Jump, one Dribble => regular bicycle; two Dribble => Super Bicycle;
 // one Shoot => regular header; two Shoot => Super Header.
 // First tap is deferred for a bounded interval so the second tap can upgrade it.
 aerialBallInReach(p){
  const b=this.ball;
  return !!p&&!p.keeper&&p.stun<=0&&p.z>0&&p.jumpCount>0&&!b.owner&&
    b.z>=30&&b.z<=330&&distance(p,b)<=125&&Math.abs(b.z-(p.z+42))<=160;
 }
 // Grounded, loose-ball and aerial special strikes share shoot()'s exact
 // transformed shot parameters, speed, power and original ball animation.
 // Missing shoot specialization means stronger ordinary contact with NO shape.
 tryAerialStrike(p,kind,superAttempt=false){
  if(!this.aerialBallInReach(p))return false;
  const b=this.ball;
  if(p.cd>0&&!(b.liftOwner===p&&p.ballLiftWindow>0))return false;
  b.liftOwner=null;p.ballLiftWindow=0;p.ballLiftLock=false;
  if(superAttempt){
   const hasSuper=!!(p.src.superAbility?.type==='shoot'&&p.src.shot)&&p.specialCd<=0;
   b.owner=p;
   this.shoot(p,true,false);
   p.action=kind==='header'?'superHead':'superBicycle';p.actionTimer=.70;
   p.cd=Math.max(p.cd,.64);
   // Both moves use exactly the same shot transformation data as Super Shot.
   if(kind==='header')this.emit('superHeadShot',{team:p.t,player:p.src.name,transformed:hasSuper});
   else this.emit('superBicycleShot',{team:p.t,player:p.src.name,transformed:hasSuper});
   return true;
  }
  if(kind==='header'){
   // Earlier Jump primes the airborne contact. The initial tap is only
   // committed when the double-tap window expires.
   return this.tryHeader(p);
  }
  b.owner=p;const worked=this.tryBicycleShot(p);
  if(!worked)b.owner=null;
  return worked;
 }
 // Direct API retained for compatibility; no longer requires a proprietary
 // lift window or produces a different super-shot power/shape.
 trySuperBicycle(p){return this.tryAerialStrike(p,'bicycle',true);}
 queueAerialTap(p,kind){
  if(!this.aerialBallInReach(p))return false;
  if(p.aerialComboAction===kind&&p.aerialComboTimer>0){
   p.aerialComboAction=null;p.aerialComboTimer=0;p.aerialComboTaps=0;
   this.tryAerialStrike(p,kind,true);
  }else{
   p.aerialComboAction=kind;p.aerialComboTimer=AERIAL_DOUBLE_TAP_SECONDS;p.aerialComboTaps=1;
  }
  return true;
 }
 resolveAerialTap(p,dt){
  if(!p.aerialComboAction)return;
  if(!this.aerialBallInReach(p)){
   p.aerialComboAction=null;p.aerialComboTimer=0;p.aerialComboTaps=0;return;
  }
  p.aerialComboTimer=Math.max(0,p.aerialComboTimer-dt);
  if(!p.aerialComboTimer){
   const kind=p.aerialComboAction;p.aerialComboAction=null;p.aerialComboTaps=0;
   this.tryAerialStrike(p,kind,false);
  }
 }
 // Without possession, Jump+Shoot uses a flying kick, unless a rare super defence
 // or ordinary aerial ball interception is available. The attacker and defender
 // are both affected by strength/aggression and collision immunity.
 tryFlyingKick(p,spinning=false){
  if(!p||p.keeper||p.stun>0||p.cd>0||p.fatigue>.94)return false;
  if(spinning&&p.jumpCount<2)return false;
  if(p.z<12)this.jump(p);
  p.action=spinning?'defensiveBicycle':'flyingKick';p.actionTimer=spinning?.78:.60;p.cd=spinning?.88:.62;
  this.spendStamina(p,spinning?'bicycle':'flyingKick');
  const opponent=this.players.filter(q=>q.t!==p.t&&!q.keeper&&!q.stun&&q.invuln<=0&&distance(p,q)<(spinning?123:100))
   .sort((a,b)=>distance(p,a)-distance(p,b))[0];
  if(opponent){const direction=norm(opponent.x-p.x,opponent.y-p.y);
   const strengthGap=stat(p,'aggression')*.55+stat(p,'strength')*.45-stat(opponent,'strength')*.65;
   opponent.stun=Math.max(opponent.stun,impactStun('aerial',(spinning?68:35)+Math.max(0,strengthGap),stat(opponent,'strength')));opponent.invuln=.70;
   opponent.action='hurt';opponent.actionTimer=Math.max(.50,opponent.stun);
   opponent.x=clamp(opponent.x+direction.x*(spinning?51:35),F.x+22,F.x+F.w-22);
   opponent.y=clamp(opponent.y+direction.y*(spinning?43:30),F.y+23,F.y+F.h-23);
   if(this.ball.owner===opponent){this.ball.owner=null;this.ball.x=opponent.x;this.ball.y=opponent.y;
    this.ball.z=20;this.ball.vx=direction.x*180;this.ball.vy=direction.y*180;this.ball.vz=120;this.ball.canCollect=.24;}
   this.burst(opponent.x,opponent.y,'#ffce81',13);
  }
  this.emit(spinning?'defensiveBicycle':'flyingKick',{team:p.t,player:p.src.name,hit:!!opponent});return true;
 }
 // Magic Tricks are distinct from dribble styles: hold DRIBBLE for one second
 // while carrying the ball. The ordinary tap and airborne Jump combinations
 // remain unchanged. Only the equipped named ability can fire.
 tryMagicTrick(p){
  const id=p?.src?.magicTrick;
  const allowed=['banana','ice','bat','fireball','freeze','scream','hideBall','teleport','shoulderRide','spinBump','sandTrap','lightning','wind','mud'];
  const tierGated=['spinBump','sandTrap','lightning','wind','mud'].includes(id);
  const tierEligible=!tierGated||!!STATS?.verifiedRatingTierForPlayer&&['Gold','Star','Superstar'].includes(STATS.verifiedRatingTierForPlayer(p?.src));
  if(!allowed.includes(id)||!tierEligible||p.keeper||p.stun>0||this.ball.owner!==p||this.clock<(p.magicReadyAt||0)||id==='shoulderRide'&&(this.rideBall||(p.z||0)>20)||id==='lightning'&&p.lightningPending)return false;
  const rideMate=id==='shoulderRide'?this.players.filter(q=>q!==p&&q.t===p.t&&!q.keeper&&q.stun<=0&&
   (q.z||0)<=20&&!q.rideBallState).sort((a,b)=>distance(p,a)-distance(p,b))[0]:null;
  if(id==='shoulderRide'&&(!rideMate||distance(p,rideMate)>84))return false;
  const rivals=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&((id!=='wind'&&id!=='mud')||q.z<20)&&(id!=='mud'||(q.mudSlowTimer||0)<=0))
   .sort((a,b)=>distance(p,a)-distance(p,b));
  const rival=rivals[0],radius=(id==='spinBump'||id==='sandTrap')?82:id==='wind'?120:id==='mud'?100:id==='lightning'?95:id==='scream'?135:id==='fireball'?120:id==='shoulderRide'?130:95;
  const inRange=!!rival&&distance(p,rival)<radius;
  if(id==='lightning'&&!inRange)return false;
  // A defender who moves toward and faces the carrier can counter the spell.
  const facing=inRange&&((rival.face||1)*(p.x-rival.x))>0;
  const closing=inRange&&((rival.dx||0)*(p.x-rival.x)+(rival.dy||0)*(p.y-rival.y))>0;
  // Airborne JUMP counters Fireball, Scream, Freeze and Bat; a grounded SHOOT-slide
  // parries Bat and Freeze, ducks Fireball and slides under Scream. All counters use the existing four buttons and still cost
  // the caster the original cooldown and fatigue.
  const jumpDodged=id==='fireball'&&inRange&&Number.isFinite(rival.z)&&rival.z>=20;
  const screamDodged=id==='scream'&&inRange&&Number.isFinite(rival.z)&&rival.z>=20;
  const freezeDodged=id==='freeze'&&inRange&&Number.isFinite(rival.z)&&rival.z>=20;
  const batDodged=id==='bat'&&inRange&&Number.isFinite(rival.z)&&rival.z>=20;
  // MAGIC-FREEZE-SLIDE-01: an active grounded defensive SHOOT-slide at close
  // range cuts through the freezing pulse, like the Bat parry. Expired or
  // airborne slides do not count; the caster still pays cost.
  const freezeParried=id==='freeze'&&inRange&&rival.action==='slide'&&Number.isFinite(rival.actionTimer)&&rival.actionTimer>0&&Number.isFinite(rival.z)&&rival.z<20;
  // MAGIC-FIREBALL-SLIDE-01: an active grounded defensive SHOOT-slide ducks
  // under the medium-range fireball. Expired or airborne slides do not count.
  const fireballParried=id==='fireball'&&inRange&&rival.action==='slide'&&Number.isFinite(rival.actionTimer)&&rival.actionTimer>0&&Number.isFinite(rival.z)&&rival.z<20;
  // MAGIC-SCREAM-SLIDE-01: an active grounded defensive SHOOT-slide slips under
  // the wide shockwave. Expired or airborne slides do not count.
  const screamParried=id==='scream'&&inRange&&rival.action==='slide'&&Number.isFinite(rival.actionTimer)&&rival.actionTimer>0&&Number.isFinite(rival.z)&&rival.z<20;
  const batParried=id==='bat'&&inRange&&rival.action==='slide'&&Number.isFinite(rival.actionTimer)&&rival.actionTimer>0&&Number.isFinite(rival.z)&&rival.z<20;
  // TELEPORT-SLIDE-01: a grounded SHOOT-slide intercepts only the carrier's
  // forward travel lane; a slide behind or wide of that lane misses.
  const teleportParried=id==='teleport'&&inRange&&rival.action==='slide'&&
   Number.isFinite(rival.actionTimer)&&rival.actionTimer>0&&
   Number.isFinite(rival.z)&&rival.z<20&&(()=>{
    const forward=norm(p.dx||p.face,p.dy||0);
    const offsetX=rival.x-p.x,offsetY=rival.y-p.y;
    const ahead=offsetX*forward.x+offsetY*forward.y;
    const across=Math.abs(offsetX*forward.y-offsetY*forward.x);
    return ahead>0&&ahead<=85&&across<=35;
   })();
  // HIDE-BALL-PASS-01: a timely defensive PASS poke (ordinary grounded tackle)
  // reads the fake ball only when the defender faces the carrier at close range.
  // A stale, airborne or backwards poke cannot cancel the trick.
  const hideBallPoked=id==='hideBall'&&inRange&&distance(p,rival)<=70&&
   rival.action==='punch'&&Number.isFinite(rival.actionTimer)&&rival.actionTimer>0&&
   Number.isFinite(rival.z)&&rival.z<20&&
   ((rival.face||1)*(p.x-rival.x))>0;
  const bumpOrSand=id==='spinBump'||id==='sandTrap';
  const spinBumpSlid=bumpOrSand&&inRange&&rival.action==='slide'&&rival.actionTimer>0&&rival.z<20;
  const spinBumpJumped=bumpOrSand&&inRange&&rival.action==='jump'&&rival.z>=20;
  const fieldTrick=id==='wind'||id==='mud';
  const fieldTrickSlid=fieldTrick&&inRange&&rival.action==='slide'&&rival.actionTimer>0&&rival.z<20;
  const fieldTrickJumped=fieldTrick&&inRange&&rival.action==='jump'&&rival.z>=20;
  const countered=id==='lightning'?false:!!(jumpDodged||fireballParried||screamDodged||screamParried||freezeDodged||freezeParried||batDodged||batParried||teleportParried||hideBallPoked||spinBumpSlid||spinBumpJumped||fieldTrickSlid||fieldTrickJumped||(facing&&closing&&stat(rival,'defence')>=stat(p,'dribbling')));
   // A new Trick supersedes any short-lived Teleport afterimage.
   p.teleportTrail=null;
  p.magicReadyAt=this.clock+6;
  p.fatigue=Math.min(1,p.fatigue+((id==='spinBump'||id==='sandTrap'||id==='lightning'||id==='wind'||id==='mud')?.045:.035));
  this.fatigueLedger[p.t][p.src.id]=p.fatigue;
  if(id==='spinBump')p.spinBumpFx=.38;
  if(!countered){
   if(id==='lightning'){
    p.lightningPending={remaining:.32,target:rival};rival.lightningMark=.32;
    this.emit('lightningTrickWindup',{team:p.t,player:p.src.name,target:rival.src.name,seconds:.32,radius:95});
   }else if(id==='banana'){
    this.magicHazards=placeBananaPeel(this.magicHazards,p,F);
   }else if(id==='ice'){
    this.magicHazards=placeIcePatch(this.magicHazards,p,F);
   }else if(id==='teleport'){
    const forward=norm(p.dx||p.face,p.dy||0);
     const fromX=p.x,fromY=p.y;
     p.x=clamp(p.x+forward.x*85,F.x+23,F.x+F.w-23);
     p.y=clamp(p.y+forward.y*85,F.y+24,F.y+F.h-24);
     if(Math.hypot(p.x-fromX,p.y-fromY)>1)p.teleportTrail={fromX,fromY,toX:p.x,toY:p.y,remaining:.42,duration:.42};
   }else if(id==='hideBall'){
    p.trickGuard=Math.max(p.trickGuard||0,.65);p.hideBallTimer=.65;p.hideBallReveal=0;p.hideBallLastKnown={x:p.x,y:p.y};
    this.emit('hideBallConceal',{team:p.t,player:p.src.name,seconds:.65});
   }else if(id==='spinBump'){
    if(inRange){rival.stun=Math.max(rival.stun,.38);rival.action='hurt';rival.actionTimer=.38;const away=norm(rival.x-p.x|| (p.t===0?1:-1),rival.y-p.y);const push=Math.min(30,30);rival.x=clamp(rival.x+away.x*push,F.x+22,F.x+F.w-22);rival.y=clamp(rival.y+away.y*push,F.y+22,F.y+F.h-22);}
   }else if(id==='sandTrap'){
    if(inRange){rival.stun=Math.max(rival.stun,.38);rival.action='hurt';rival.actionTimer=.38;rival.sandTrapFx=.38;}
   }else if(id==='wind'){
    if(inRange){const away=norm(rival.x-p.x||(p.t===0?1:-1),rival.y-p.y);const push=28;rival.x=clamp(rival.x+away.x*push,F.x+22,F.x+F.w-22);rival.y=clamp(rival.y+away.y*push,F.y+23,F.y+F.h-23);rival.windTrickFx=.35;}
   }else if(id==='mud'){
    if(inRange&&(rival.mudSlowTimer||0)<=0){rival.mudSlowTimer=.52;rival.mudTrickFx=.52;}
   }else if(id==='fireball'){
    if(inRange){rival.fireballBurnFx=Math.max(rival.fireballBurnFx||0,.48);rival.stun=Math.max(rival.stun,.32);rival.action='hurt';rival.actionTimer=.3;}
   }else if(id==='shoulderRide'){
    this.beginRideBall(p,rideMate);
   }else if(inRange){
    rival.stun=Math.max(rival.stun,(id==='freeze'||id==='ice')?.65:.32);
    rival.action='hurt';rival.actionTimer=.3;
   }
  }
  if(id!=='shoulderRide'||countered||!this.rideBall){p.action='dribbleTrick';p.actionTimer=.45;}
  this.burst(p.x,p.y,countered?'#94a3b8':'#b87bff',countered?5:12);
  this.emit('magicTrick',{team:p.t,player:p.src.name,trick:id,countered});
  return true;
 }
 updateSpinBumpFx(p,dt){if(!p)return;p.spinBumpFx=Math.max(0,(p.spinBumpFx||0)-Math.max(0,Number(dt)||0));if(p.spinBumpFx<=1e-9)p.spinBumpFx=0;}
 updateSandTrapFx(p,dt){if(!p)return;p.sandTrapFx=Math.max(0,(p.sandTrapFx||0)-Math.max(0,Number(dt)||0));if(p.sandTrapFx<=1e-9)p.sandTrapFx=0;}
 updateFieldTrickFx(p,dt){if(!p)return;const step=Math.max(0,Number(dt)||0);for(const key of ['windTrickFx','mudTrickFx','mudSlowTimer']){p[key]=Math.max(0,(p[key]||0)-step);if(p[key]<=1e-9)p[key]=0;}}
 updateFireballBurn(p,dt){if(!p)return;p.fireballBurnFx=Math.max(0,(p.fireballBurnFx||0)-Math.max(0,Number(dt)||0));if(p.fireballBurnFx<=1e-9)p.fireballBurnFx=0;}
 updateLightningTrick(p,dt,deferResolve=false){
  if(!p)return false;const step=Math.max(0,Number(dt)||0),pending=p.lightningPending;
  if(pending){
   if(p.stun>0){pending.target.lightningMark=0;p.lightningPending=null;this.emit('lightningTrickInterrupted',{team:p.t,player:p.src.name});return false;}
   pending.remaining=Math.max(0,pending.remaining-step);
   if(pending.remaining<=1e-9)return deferResolve?false:this.resolveLightningTrick(p);
  }
  p.lightningMark=Math.max(0,(p.lightningMark||0)-step);p.lightningFx=Math.max(0,(p.lightningFx||0)-step);
  if(p.lightningMark<=1e-9)p.lightningMark=0;if(p.lightningFx<=1e-9)p.lightningFx=0;
  return !!pending;
 }
 resolveLightningTrick(p){
  const pending=p?.lightningPending;if(!pending)return false;p.lightningPending=null;
  const q=pending.target;if(q)q.lightningMark=0;
  if(!q||!this.players.includes(q)||q.t===p.t||q.keeper||q.stun>0||distance(p,q)>=95){this.emit('lightningTrickResolved',{team:p.t,player:p.src.name,hit:false,countered:false});return false;}
  const inJump=q.action==='jump'&&q.z>=20,inSlide=q.action==='slide'&&q.actionTimer>0&&q.z<20;
  const facing=(q.face||1)*(p.x-q.x)>0,closing=((q.dx||0)*(p.x-q.x)+(q.dy||0)*(p.y-q.y))>0;
  const read=facing&&closing&&stat(q,'defence')>=stat(p,'dribbling');
  if(inJump||inSlide||read){this.emit('lightningTrickResolved',{team:p.t,player:p.src.name,target:q.src.name,hit:false,countered:true});return false;}
  q.stun=Math.max(q.stun,.32);q.action='hurt';q.actionTimer=Math.max(q.actionTimer||0,.32);q.lightningFx=.32;
  this.emit('lightningTrickResolved',{team:p.t,player:p.src.name,target:q.src.name,hit:true,countered:false,stun:.32});return true;
 }
 beginRideBall(carrier,passenger){
  if(!carrier||!passenger||carrier.t!==passenger.t||carrier.keeper||passenger.keeper)return false;
  const direction=norm(carrier.dx||carrier.face||1,carrier.dy||0),distanceAhead=42,side=8;
  const lateral={x:-direction.y,y:direction.x};
  this.rideBall={carrier,passenger,startX:carrier.x,startY:carrier.y,dx:direction.x,dy:direction.y,
   lateralX:lateral.x,lateralY:lateral.y,side,distanceAhead,duration:.72,elapsed:0};
  carrier.rideBallState='carrier';passenger.rideBallState='passenger';passenger.rideVisualZ=48;
  carrier.rideBallMate=passenger.src.id;passenger.rideBallCarrier=carrier.src.id;
  carrier.action='rideBallCarrier';passenger.action='rideBallPassenger';
  carrier.actionTimer=passenger.actionTimer=.72;return true;
 }
 cancelRideBall(reason='cancelled'){
  const state=this.rideBall;if(!state)return false;
  this.rideBall=null;
  for(const p of [state.carrier,state.passenger]){
   if(!p)continue;
   delete p.rideBallState;delete p.rideBallMate;delete p.rideBallCarrier;p.rideVisualZ=0;
   if(p.action==='rideBallCarrier'||p.action==='rideBallPassenger'){p.action='idle';p.actionTimer=0;}
  }
  this.emit('rideBallEnd',{team:state.carrier?.t,player:state.carrier?.src?.name,
   teammate:state.passenger?.src?.name,reason});return true;
 }
 advanceRideBall(dt){
  const s=this.rideBall;if(!s)return false;
  const {carrier,passenger}=s;
  if(!this.players.includes(carrier)||!this.players.includes(passenger))return this.cancelRideBall('reset');
  if(this.ball.owner!==carrier)return this.cancelRideBall('possession');
  if(carrier.stun>0||passenger.stun>0)return this.cancelRideBall('contact');
  const touching=(x,y,px,py)=>this.players.some(q=>q.t!==carrier.t&&q.stun<=0&&
   (Math.hypot(q.x-x,q.y-y)<52||Math.hypot(q.x-px,q.y-py)<52));
  if(touching(carrier.x,carrier.y,passenger.x,passenger.y))return this.cancelRideBall('contact');
  const nextElapsed=Math.min(s.duration,s.elapsed+dt),progress=nextElapsed/s.duration;
  const x=s.startX+s.dx*s.distanceAhead*progress,y=s.startY+s.dy*s.distanceAhead*progress;
  const px=x+s.lateralX*s.side,py=y+s.lateralY*s.side;
  const marginX=F.x+22,marginY=F.y+23;
  if(x<marginX||x>F.x+F.w-22||y<marginY||y>F.y+F.h-23||
     px<marginX||px>F.x+F.w-22||py<marginY||py>F.y+F.h-23)
   return this.cancelRideBall('boundary');
  if(touching(x,y,px,py))return this.cancelRideBall('contact');
  s.elapsed=nextElapsed;carrier.x=x;carrier.y=y;passenger.x=px;passenger.y=py;
  carrier.dx=passenger.dx=0;carrier.dy=passenger.dy=0;
  carrier.moveVX=passenger.moveVX=0;carrier.moveVY=passenger.moveVY=0;
  carrier.action='rideBallCarrier';passenger.action='rideBallPassenger';
  carrier.actionTimer=passenger.actionTimer=s.duration-s.elapsed;
  if(s.elapsed>=s.duration)this.cancelRideBall('complete');
  return true;
 }
 // Consume a Banana Peel only when a grounded opposing outfielder steps on it.
 // This is called after movement/contact resolution and before ball physics.
 updateMagicHazards(dt){
  // Existing SHOOT slide clears enemy traps before their collision tick.
  // No fifth button, stamina bypass, or saved-game schema change.
  const cleared=disarmMagicHazards(this.magicHazards,this.players);
  this.magicHazards=cleared.hazards;
  for(const {hazard,player} of cleared.disarmed){
   this.burst(hazard.x,hazard.y,hazard.kind==='ice'?'#8deaff':'#ffe46b',7);
   this.emit('magicHazardDisarmed',{trick:hazard.kind,team:player.t,player:player.src.name});
  }
  const next=advanceBananaPeels(this.magicHazards,this.players,dt);
  const ice=advanceIcePatches(this.magicHazards,this.players,dt,next.slips);
  this.magicHazards=[...next.hazards,...ice.hazards];
  for(const victim of next.slips){
   victim.stun=Math.max(victim.stun,.65);
   victim.action='hurt';victim.actionTimer=Math.max(victim.actionTimer||0,.65);
   if(this.ball.owner===victim){
    this.ball.owner=null;this.ball.shot=null;
    this.ball.x=victim.x;this.ball.y=victim.y;this.ball.z=15;
    this.ball.vx=(victim.dx||victim.face||1)*90;
    this.ball.vy=(victim.dy||0)*90;this.ball.vz=90;this.ball.canCollect=.28;
   }
   this.burst(victim.x,victim.y,'#ffe46b',9);
   this.emit('magicHazard',{trick:'banana',team:victim.t,player:victim.src.name});
  }
  for(const victim of ice.slips){
   if(next.slips.includes(victim))continue;
   victim.stun=Math.max(victim.stun,.85);
   victim.action='hurt';victim.actionTimer=Math.max(victim.actionTimer||0,.85);
   if(this.ball.owner===victim){
    this.ball.owner=null;this.ball.shot=null;
    this.ball.x=victim.x;this.ball.y=victim.y;this.ball.z=15;
    this.ball.vx=(victim.dx||victim.face||1)*55;
    this.ball.vy=(victim.dy||0)*55;this.ball.vz=70;this.ball.canCollect=.28;
   }
   this.burst(victim.x,victim.y,'#8deaff',10);
   this.emit('magicHazard',{trick:'ice',team:victim.t,player:victim.src.name});
  }
 }
 resolveMagicWalls(){
  const walls=this.magicWalls||[],kept=[];
  for(const wall of walls){
   const breaker=this.players.find(p=>p.t!==wall.team&&!p.keeper&&p.stun<=0&&p.z<20&&p.action==='slide'&&p.actionTimer>0&&
    Math.abs(p.x-wall.x)<=wall.thickness+20&&Math.abs(p.y-wall.y)<=wall.halfLength+22);
    if(breaker){this.burst(wall.x,wall.y,wall.particleColor||'#b9f7ff',wall.particleCount?Math.round(wall.particleCount*.66):12);this.emit('magicWallCounter',{team:breaker.t,player:breaker.src.name,counter:'slide',id:wall.id||'magicWall'});continue;}
   kept.push(wall);
   if(wall.arm>0)continue;
   for(const p of this.players){
    if(p.t===wall.team||p.keeper||p.z>=wall.height||Math.abs(p.y-wall.y)>wall.halfLength+18||Math.abs(p.x-wall.x)>wall.thickness+18)continue;
    const side=(p.x-wall.x)||((p.face||1)*-1);p.x=clamp(wall.x+Math.sign(side)*(wall.thickness+19),F.x+22,F.x+F.w-22);
    p.moveVX=0;p.dx=0;
   }
  }
  this.magicWalls=kept;
 }
 updateMagicWalls(dt){
  this.magicWalls=(this.magicWalls||[]).flatMap(w=>{const duration=w.duration-dt;if(duration<=0){this.burst(w.x,w.y,w.particleColor||'#72e8ff',w.particleCount?Math.max(6,Math.round(w.particleCount*.45)):8);this.emit('magicWallExpired',{team:w.team,id:w.id||'magicWall'});return [];}return [{...w,duration,arm:Math.max(0,w.arm-dt)}];});
 }
 updateSupernova(dt){
  const nova=this.supernova;if(!nova)return;
  const remaining=nova.remaining-dt;
  if(remaining>0){this.supernova={...nova,remaining};return;}
  this.supernova=null;let hits=0,evaded=0,ballHit=false,carrierSpill=false;
  for(const p of this.players){
   if(p.t===nova.team||p.keeper||Math.hypot(p.x-nova.x,p.y-nova.y)>nova.radius)continue;
   const countered=p.z>=20||(p.action==='slide'&&p.actionTimer>0&&p.z<20);
   if(countered){evaded++;continue;}
   hits++;p.stun=Math.max(p.stun,nova.stun);p.action='hurt';p.actionTimer=Math.max(p.actionTimer||0,nova.stun);
   const away=norm(p.x-nova.x||(p.t===0?-1:1),p.y-nova.y);p.x=clamp(p.x+away.x*nova.push,F.x+22,F.x+F.w-22);p.y=clamp(p.y+away.y*nova.push,F.y+23,F.y+F.h-23);
   if(this.ball.owner===p){this.ball.owner=null;this.ball.shot=null;this.ball.x=p.x;this.ball.y=p.y;this.ball.z=20;this.ball.vx=away.x*205;this.ball.vy=away.y*205;this.ball.vz=110;this.ball.canCollect=.24;carrierSpill=true;}
  }
  const b=this.ball;
  if(!carrierSpill&&!b.owner&&b.attacker!==nova.team&&b.z<90&&Math.hypot(b.x-nova.x,b.y-nova.y)<=nova.radius){
   const away=norm(b.x-nova.x||(nova.team===0?1:-1),b.y-nova.y);b.vx=away.x*245;b.vy=away.y*245;b.vz=Math.max(b.vz,120);b.canCollect=Math.max(b.canCollect,.2);b.shot=null;b.strike=null;b.trail=[];ballHit=true;
  }
  this.burst(nova.x,nova.y,'#d8a1ff',this.options?.reducedFlash?5:22);
  if(!this.options?.reducedFlash){this.shake=.16;this.flash=Math.max(this.flash,.055);}
  this.emit('supernova',{team:nova.team,hits,evaded,ballHit,radius:nova.radius});
 }
 // v0.8.7: ten individual dribble types. Only the second DRIBBLE tap triggers
 // a special trick; the first tap keeps the standard feint. Against an alert
 // defender a trick may fail. DEF, AGG, AGI, DRB, stamina and style all matter.
 tryDribbleTrick(p,byAI=false){
  if(!p||this.ball.owner!==p||p.keeper||p.stun>0||p.trickCd>0||(p.dribbleCooldown||0)>0||p.fatigue>.92||p.breath<.65)return false;
  const style=dribbleStyle(p.src.dribbleType), opponents=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&q.z<25)
    .sort((a,b)=>distance(p,a)-distance(p,b));
  const rival=opponents[0],close=!!rival&&distance(p,rival)<105;
  const skill={dribbling:stat(p,'dribbling'),agility:stat(p,'agility'),fatigue:p.fatigue,x:p.x,y:p.y};
  const threat=close?{defence:stat(rival,'defence'),aggression:stat(rival,'aggression'),fatigue:rival.fatigue,x:rival.x,y:rival.y,vx:rival.dx||0,vy:rival.dy||0}:null;
  // Forward live facing direction to the Rainbow Flick aerial counter.
  if(threat)threat.face=rival.face;
  // Counterplay: a defender actively closing toward the ball carrier can read
  // the trick. Standing still or moving away does not receive this bonus.
  const closing=close&&((rival.dx||0)*(p.x-rival.x)+(rival.dy||0)*(p.y-rival.y))>0.22*Math.max(1,distance(p,rival));
  // A moving defender must actually face the carrier to read their feet.
  // Side-on runs remain a weaker read; a turned-away sprint does not counter.
  const towardCarrier=rival?norm(p.x-rival.x,p.y-rival.y):{x:0,y:0};
  const facing=close&&((rival.face||1)*towardCarrier.x)>=.15;
  const readBonus=closing&&facing?Math.min(.24,.07+stat(rival,'defence')*.0017):0;
  const success=!threat||Math.random()<Math.max(.08,dribbleOdds(skill,threat,style)-readBonus);
  // Face/movement determines forward axis. Escape toward the side *away* from
  // the closest defender, so style-specific movement is purposeful, not random.
  const forward=norm(p.dx||p.face,p.dy||0),lateral={x:-forward.y,y:forward.x};
  const relativeY=rival?(rival.x-p.x)*lateral.x+(rival.y-p.y)*lateral.y:0;
  const side=close?(relativeY>=0?-1:1):(p.dy<-0.05?-1:1);
  const quality=(.69+stat(p,'dribbling')*.006)*endurance(p);
  const factor=success?1:.22;
  p.x=clamp(p.x+(forward.x*style.forward+lateral.x*style.lateral*side)*quality*factor,F.x+23,F.x+F.w-23);
  p.y=clamp(p.y+(forward.y*style.forward+lateral.y*style.lateral*side)*quality*factor,F.y+24,F.y+F.h-24);
  if(style.turn)p.face*=-1;
  if(style.nutmeg&&success&&close&&distance(p,rival)<75){rival.stun=Math.max(rival.stun,.16);rival.action='hurt';rival.actionTimer=.22;}
  p.dribbleCooldown=2;p.trickCd=style.cooldown*(1.15-stat(p,'agility')*.003)* (1+p.fatigue*.2);
  p.cd=success?.27:.43;p.trickGuard=success?style.guard*(.7+stat(p,'agility')/170):0;
  p.trickFx=success?.52:.25;p.trickStyleId=style.id;
  p.action='dribbleTrick';p.actionTimer=.53;
  p.fatigue=Math.min(1,p.fatigue+(.014*style.stamina)*(1.3-stat(p,'stamina')*.003));this.fatigueLedger[p.t][p.src.id]=p.fatigue;
  // Failed challenges can spill the ball, but do not magically award ownership.
  if(!success&&close&&distance(p,rival)<60){this.ball.owner=null;this.ball.shot=null;this.ball.x=p.x+forward.x*16;this.ball.y=p.y+forward.y*16;this.ball.vx=forward.x*85;this.ball.vy=forward.y*85;this.ball.canCollect=.2;}
  else if(style.loft&&success){this.ball.z=Math.max(this.ball.z,style.loft);}
  this.burst(p.x,p.y,success?style.color:'#ff9a93',success?13:6);
  this.emit('dribbleTrick',{team:p.t,player:p.src.name,style:style.id,name:style.name,success,ai:byAI});
  return true;
 }
 // Safety is evaluated at release time; a marked teammate or a defender on
 // the passing line must never be treated as a safe short-throw receiver.
 keeperPassingLane(p,q){
  const opponents=this.players.filter(o=>o.t!==p.t&&!o.keeper&&o.stun<=0);
  const dx=q.x-p.x,dy=q.y-p.y,length=Math.hypot(dx,dy)||1;
  const endpoint=Math.min(...opponents.map(o=>distance(q,o)),9999);
  const interception=Math.min(...opponents.map(o=>{
   const u=clamp(((o.x-p.x)*dx+(o.y-p.y)*dy)/(length*length),0,1);
   return Math.hypot(o.x-(p.x+u*dx),o.y-(p.y+u*dy));
  }),9999);
  return {endpoint,interception,clear:endpoint>145&&interception>95};
 }
 // Find an open, advancing clearance corridor instead of punting directly
 // toward a marked teammate/opponent. Aimed empty turf is always an option.
 keeperClearanceTarget(p,scored,opponents){
  const dir=p.t===0?1:-1;
  const candidates=[];
  const emergency=[];
  const midfield=F.x+F.w*.5;
  for(const v of scored){
   // A marked teammate or an intercepted route is never a clearance target.
   // Unsafe teammates must not outscore an open patch of turf.
   if(!v.safe.clear||v.q.x*dir<=p.x*dir+175)continue;
   const d=distance(p,v.q);
   const safe=Math.min(v.safe.endpoint,v.safe.interception*1.5);
   candidates.push({x:v.q.x,y:v.q.y,receiver:v.q,score:safe*1.5+d*.05+(v.q.x-p.x)*dir*.14});
  }
  // Prefer a corridor that makes forward progress while staying away from defenders.
  for(const factor of [.50,.67,.82])for(const lane of [.22,.50,.78]){
   const x=p.t===0?F.x+F.w*factor:F.x+F.w*(1-factor);
   const y=F.y+F.h*lane;
   const safety=Math.min(...opponents.map(o=>Math.hypot(o.x-x,o.y-y)),9999);
   const path=this.keeperPassingLane(p,{x,y});
   // A seemingly empty landing point is unsafe when its flight corridor is intercepted.
   if(!path.clear){
    // When absolutely every lane is blocked, minimize interception danger
    // instead of always punting down the same predictable central corridor.
    // Cap outlier distances so no one metric can conceal an interception risk.
    const riskScore=Math.min(path.interception,1000)*1.8+
     Math.min(path.endpoint,1000)*.30+Math.min(safety,1000)*.15+
     (x-p.x)*dir*.025;
    emergency.push({x,y,receiver:null,score:riskScore});
    continue;
   }
   candidates.push({x,y,receiver:null,score:safety*.85+path.interception*.30+(x-p.x)*dir*.12});
  }
  candidates.sort((a,b)=>b.score-a.score);
  const best=candidates[0];
  if(best&&best.score>0)return best;
  emergency.sort((a,b)=>b.score-a.score);
  return emergency[0]||{x:midfield+dir*F.w*.15,y:F.y+F.h*.5,receiver:null};
 }
 distributeKeeper(p,mode='auto'){
  if(!p?.keeper||this.ball.owner!==p||p.stun>0)return false;
  const dir=p.t===0?1:-1;
  const mates=this.players.filter(q=>q.t===p.t&&!q.keeper&&q.stun<=0);
  const opponents=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0);
  const pressured=opponents.some(q=>distance(p,q)<330);
  const scored=mates.map(q=>({q,safe:this.keeperPassingLane(p,q)}));
  const shortOptions=scored.filter(v=>v.safe.clear&&distance(p,v.q)<900)
    .sort((a,b)=>distance(p,a.q)-distance(p,b.q));
  const shortAllowed=mode!=='long'&&!pressured&&shortOptions.length>0;
  const long=!shortAllowed;
  const option=long?this.keeperClearanceTarget(p,scored,opponents):{
   x:shortOptions[0].q.x,y:shortOptions[0].q.y,receiver:shortOptions[0].q};
  const target=option.receiver;
  const quality=stat(p,'passing');
  const error=(100-quality)*(long?1.2:.55);
  const ex=(Math.random()-.5)*error,ey=(Math.random()-.5)*error;
  this.freeBall(p,option.x-p.x+ex+(target?.moveVX||0)*(long?.34:.17),
   option.y-p.y+ey+(target?.moveVY||0)*.17,
   long?855+quality*1.3:390+quality*1.2,
   {power:long?17:6,z:long?36:46,vz:long?315:45,pass:true});
  p.keeperHold=0;
  p.action=long?'keeperPunt':'keeperThrow';p.actionTimer=long?.64:.48;p.keeperReleasePoseDuration=p.actionTimer;
  this.emit('keeperDistribution',{team:p.t,player:p.src.name,target:target?.src?.name||null,
   mode:long?'long':'short',pressured,emptySpace:long&&!target});
  return true;
 }


 // DRIBBLE while a human side's keeper holds a catch: a deliberate short,
 // low roll to an open back-line outlet. PASS remains the ordinary throw and
 // SHOOT the punt. No safe lane means retain possession for a later choice.
 rollKeeper(p){
  if(!p?.keeper||this.matchState!=='play'||this.ball.owner!==p||p.stun>0||!this.inControl(p.t))return false;
  const forward=p.t===0?1:-1;
  const candidates=this.players.filter(q=>q.t===p.t&&!q.keeper&&q.stun<=0&&q.z<=20&&
   q!==p&&Number.isFinite(q.x)&&Number.isFinite(q.y)&&
   (q.x-p.x)*forward>70&&distance(p,q)>=120&&distance(p,q)<920)
   .map(q=>({q,safe:this.keeperPassingLane(p,q)}))
   .filter(v=>v.safe.clear)
   .sort((a,b)=>distance(p,a.q)-distance(p,b.q));
  const receiver=candidates[0]?.q;
  // Deliberately keep the catch if every lane is covered: do not fall back
  // to a blind rollout, and do not consume an outfield dribble input.
  if(!receiver)return false;
  const quality=stat(p,'passing');
  const speed=300+quality*1.4;
  this.freeBall(p,receiver.x-p.x,receiver.y-p.y,speed,{power:4,z:10,vz:0,pass:true});
  this.ball.passTarget=receiver.src.id;
  this.manualSwitchGrace[p.t]=Math.max(this.manualSwitchGrace[p.t]||0,1.25);
  p.keeperHold=0;p.action='keeperThrow';p.actionTimer=.42;p.keeperReleasePoseDuration=p.actionTimer;
  this.emit('keeperDistribution',{team:p.t,player:p.src.name,target:receiver.src.name,
   mode:'roll',pressured:false,emptySpace:false});
  this.emit('passIntent',{team:p.t,player:p.src.id,mode:'roll',target:receiver.src.id,
   speed,loft:'ground'});
  return true;
 }

 command(p,a){if(a==='dribble'){const holder=this.hostOfBall();if(holder?.keeper&&holder.t===p.t&&this.inControl(p.t)){this.rollKeeper(holder);return;}this.dribble(p);return}if(a==='shoot'){if(this.tryFlipKick(p,false)||this.tryHeader(p))return;const mate=this.hostOfBall();if(mate&&mate.t===p.t&&mate!==p){if(mate.keeper)this.distributeKeeper(mate,'long');else this.shoot(mate,false)}else if(this.ball.owner===p){if(p.keeper)this.distributeKeeper(p,'long');else this.shoot(p,false,p.z>65)}else this.tackle(p,true)}
 if(a==='pass'){const mate=this.hostOfBall();if(mate&&mate.t===p.t){this.performTeamPass(p,false);}else {if(distance(p,this.ball)<140)this.tackle(p,true);else{p.chase=1.8;p.action='sprint';p.actionTimer=.3}}}
 if(a==='special'){if(this.tryFlipKick(p,true))return;const mate=this.hostOfBall();if(mate&&mate.t===p.t&&mate!==p)this.shoot(mate,true);else if(this.ball.owner===p)this.shoot(p,true,p.z>60);else if(!this.requestKeeperSuper(p.t)&&!this.activateDefence(p))this.tackle(p,true)}
 if(a==='jump')this.jump(p);
 }
 autoSwitch(t,dt=.016){
  if(!this.inControl(t)||this.ball.owner?.t===t||this.matchState!=='play'){this.autoSwitchAccum[t]=0;return false;}
  // Keep the user's deliberate pass in flight under their control. An opponent
  // taking possession or an expired/loose ball immediately ends this protection.
  if(this.ball.pass&&this.ball.passTeam===t&&(this.ball.age||0)<2.4){this.autoSwitchAccum[t]=0;return false;}
  if((this.manualSwitchGrace[t]||0)>0){this.autoSwitchAccum[t]=0;return false;}
  const selected=this.controlledPlayer(t),ball=this.ball.owner||this.ball;
  const input=this.input.state[t]||{};
  // Preserve intentional chases and aerial moves, but DO NOT disable automatic
  // selection merely because a player steers the joystick while defending.
  if(!selected||selected.z>15||selected.comboActive||selected.ballLiftWindow>0||selected.dashTimer>0||input.jump||input.pass||selected.chase>0){this.autoSwitchAccum[t]=0;return false;}
  const d=distance(selected,ball);
  const candidates=this.players.filter(q=>q.t===t&&!q.keeper&&q.stun<=0&&q.z<=15);
  candidates.sort((a,b)=>distance(a,ball)-distance(b,ball));
  const best=candidates[0];
  if(!best||best===selected||d<310||distance(best,ball)+130>=d){this.autoSwitchAccum[t]=0;return false;}
  this.autoSwitchAccum[t]=(this.autoSwitchAccum[t]||0)+dt;
  if(this.autoSwitchAccum[t]<.32)return false;
  this.controlled[t]=best.i;this.autoSwitchAccum[t]=0;
  this.emit('autoSwitch',{team:t,player:best.src.name});return true;
 }
 swap(t){const b=this.ball,goal=b.owner?.t===t?b.owner:b;
  const arr=this.players.filter(p=>p.t===t&&!p.keeper&&p.stun<=0).sort((a,b)=>distance(a,goal)-distance(b,goal));
  const next=arr.find(p=>p.i!==this.controlled[t]);
  if(next){this.controlled[t]=next.i;this.manualSwitchGrace[t]=.85;this.autoSwitchAccum[t]=0;this.emit('switch',{team:t,player:next.src.name});return true}return false;
 }
 update(dt){if(this.matchState!=='play')return;dt=Math.min(.034,Math.max(0,dt));this.input.poll(this.humans>=2);if(this.celebration>0){this.celebration=Math.max(0,this.celebration-dt);this.updateEffects(dt);
   for(const p of this.players){p.anim+=dt;if(p.t===this.pendingKickoff?.scorer){p.action='celebrate';p.actionTimer=.25}else{p.action='cry';p.actionTimer=.25;p.cryTimer=this.celebration;}}
   if(this.celebration===0&&this.pendingKickoff){const k=this.pendingKickoff;this.pendingKickoff=null;this.resetKickoff(1-k.scorer);}return}
 this.clock+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.shake=Math.max(0,this.shake-dt*2.5);this.flash=Math.max(0,this.flash-dt*2);this.stormTimer-=dt;this.updateWeather(dt);if(this.input.just(0,'pause')||this.input.just(1,'pause')){this.matchState='paused';this.emit('pause');return}
 if(this.clock>=this.matchSeconds){
  const maxExtra=clamp(this.matchSeconds*.065,2.5,10);
  if(!this.stoppageAnnounced){this.stoppageWindow=attackingStoppage(this.ball)?maxExtra:0;this.stoppageAnnounced=true;
   if(this.stoppageWindow>0)this.emit('stoppageTime',{half:this.half,maxSeconds:maxExtra});}
  if(this.clock<this.matchSeconds+this.stoppageWindow && attackingStoppage(this.ball)){
   // The attacking chance is still alive, but must finish at the hard cap.
  }else{this.stoppageWindow=0;
  if(this.half===1){this.half=2;this.clock=0;this.stoppageAnnounced=false;this.stoppageWindow=0;this.halftimeRecovery();this.resetKickoff(1);this.matchState='paused';this.autoSubstituteCpu();this.autoAdaptCpuHalftime();this.emit('halftime')}else if(this.score[0]===this.score[1]&&this.mode!=='training'){this.startPK(true)}else{this.matchState='finished';this.emit('finished',{score:this.score.slice()})}return}}
  this.coordinateAiCombos(dt);this.manualSwitchGrace=this.manualSwitchGrace.map(v=>Math.max(0,v-dt));this.updatePlayers(dt);this.advanceRideBall(dt);this.resolvePlayerContacts(dt);this.resolveMagicWalls();this.updateMagicWalls(dt);this.updateSupernova(dt);this.updateMagicHazards(dt);this.updateBall(dt);this.updateEffects(dt);
 }
 // v0.8.5 grounded player collision: unlike tackle/special attacks this is an
 // always-on physical constraint. Resolve every pair after movement, before ball
 // handling, so teammates/opponents cannot pass through or remain overlapping.
 resolvePlayerContacts(dt){
  const radius=25,diameter=radius*2,players=this.players;
  // Multiple relaxation sweeps handle crowded goalmouths. Stop immediately once
  // separated to avoid the extra work for normal open-field movement.
  for(let sweep=0;sweep<72;sweep++){
   let overlaps=0;
   for(let i=0;i<players.length;i++){
   const a=players[i];if(a.z>22)continue;
   for(let j=i+1;j<players.length;j++){
    const b=players[j];if(b.z>22)continue;
    if(this.rideBall&&((a===this.rideBall.carrier&&b===this.rideBall.passenger)||(a===this.rideBall.passenger&&b===this.rideBall.carrier)))continue;
    let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
    if(d>=diameter)continue;
    if(this.rideBall&&((a===this.rideBall.carrier||a===this.rideBall.passenger)&&b.t!==a.t||
      (b===this.rideBall.carrier||b===this.rideBall.passenger)&&a.t!==b.t))this.cancelRideBall('contact');
    overlaps++;
    // Deterministic direction when coordinates coincide; avoids NaN / randomness
    // across repeated simulation runs and ensures equal/opposite displacement.
    if(d<.0001){dx=a.t===b.t?(i%2?1:-1):a.t===0?1:-1;dy=(i+j)%2?.5:-.5;d=Math.hypot(dx,dy);}
    const nx=dx/d,ny=dy/d;
    const closing=Math.max(0,((a.moveVX||0)-(b.moveVX||0))*nx+((a.moveVY||0)-(b.moveVY||0))*ny);
    const same=a.t===b.t;
    // Always separate, including slow crowd movement; actual knockback occurs
    // only for sufficiently forceful impacts, with pair-level cooldown.
    const impact=closing>=75 && a.contactCooldown<=0 && b.contactCooldown<=0;
    const overshoot=impact?Math.min(10,(closing-75)*.027):0;
    const push=(diameter-d+0.03+overshoot)/2;
    a.x=clamp(a.x-nx*push,F.x+22,F.x+F.w-22);
    a.y=clamp(a.y-ny*push,F.y+23,F.y+F.h-23);
    b.x=clamp(b.x+nx*push,F.x+22,F.x+F.w-22);
    b.y=clamp(b.y+ny*push,F.y+23,F.y+F.h-23);
    // Kill the approach velocity, never reverse a sprint into perpetual impact.
    const av=(a.moveVX||0)*nx+(a.moveVY||0)*ny;
    const bv=(b.moveVX||0)*nx+(b.moveVY||0)*ny;
    if(av>0){a.moveVX-=av*nx*.85;a.moveVY-=av*ny*.85;}
    if(bv<0){b.moveVX-=bv*nx*.85;b.moveVY-=bv*ny*.85;}
    if(!impact)continue;
    a.contactCooldown=b.contactCooldown=.55;
    const severity=Math.min(1,(closing-75)/360);
    for(const p of [a,b]){
     const strength=stat(p,'strength');
     const stun=(same?.09:.16)+(same?.10:.24)*severity*(1-(strength-50)/140);
     p.stun=Math.max(p.stun,stun);
     p.action='hurt';p.actionTimer=Math.max(p.actionTimer,stun+.08);
    }
    if(!same&&closing>260&&this.ball.owner&&(this.ball.owner===a||this.ball.owner===b)){
     const owner=this.ball.owner;
     // A heavy collision can spill the ball, allowing another player to recover.
     this.ball.owner=null;this.ball.shot=null;this.ball.x=owner.x+owner.face*24;
     this.ball.y=owner.y;this.ball.z=19;this.ball.vz=85;
     this.ball.vx=nx*115*(owner===a?1:-1);this.ball.vy=ny*115*(owner===a?1:-1);
     this.ball.canCollect=.24;
    }
    this.emit('playerCollision',{teams:[a.t,b.t],players:[a.src.id,b.src.id],closingSpeed:Math.round(closing)});
    if(closing>170)this.burst((a.x+b.x)/2,(a.y+b.y)/2,'#fff0ad',5);
   }
   }
   if(overlaps===0)break;
  }
 }
 nextWeatherRandom(){
  let x=(this.weatherSeed>>>0)||0x6d2b79f5;
  x^=x<<13;x^=x>>>17;x^=x<<5;this.weatherSeed=x>>>0||1;
  return this.weatherSeed/4294967296;
 }
 strikeWeatherLightning(cue){
  const x=cue.x,y=cue.y,players=this.players||[],radius=110;
  for(const p of players){const d=Math.hypot(p.x-x,p.y-y);if(d>=radius||p.keeper)continue;
   const stun=Math.min(.65,impactStun('lightning',120*clamp(1-d/280,0,1),stat(p,'strength')));
   p.stun=Math.max(p.stun||0,stun);p.action='hurt';p.actionTimer=Math.max(p.actionTimer||0,p.stun);
  }
  const ballDistance=Math.hypot(this.ball.x-x,this.ball.y-y);
  if(ballDistance<75){this.ball.vx=clamp((this.ball.vx||0)*1.5,-750,750);this.ball.vz=clamp((this.ball.vz||0)+180,0,300);}
  this.burst(x,y,'#faff9a',this.options?.reducedFlash?5:18);
  this.weatherLightning={...cue,phase:'strike',remaining:.18,duration:.18};
  this.emit('lightning',{x,y,radius,playerHits:players.filter(p=>!p.keeper&&Math.hypot(p.x-x,p.y-y)<radius).length});
 }
 updateWeather(dt){
  const active=this.weather==='Wind'||this.weather==='Storm'||this.weather==='Tornado';
  if(active){const time=this.clock*1.4;this.wind.x=Math.sin(time/7)*220;this.wind.y=Math.cos(time/4)*85;}
  else{this.wind.x=0;this.wind.y=0;this.weatherLightning=null;this.tornado=null;return;}
  if(this.weather!=='Storm')this.weatherLightning=null;
  if(this.weatherLightning){
   this.weatherLightning.remaining-=dt;
   if(this.weatherLightning.phase==='warning'&&this.weatherLightning.remaining<=0)this.strikeWeatherLightning(this.weatherLightning);
   else if(this.weatherLightning.phase==='strike'&&this.weatherLightning.remaining<=0)this.weatherLightning=null;
  }
  let tornadoSpawned=false;
  if(this.stormTimer<=0){
   this.stormTimer=5.5+this.nextWeatherRandom()*2.5;
   if(this.weather==='Storm'&&!this.weatherLightning){
    const cue={x:F.x+160+this.nextWeatherRandom()*(F.w-320),y:F.y+130+this.nextWeatherRandom()*(F.h-260),phase:'warning',remaining:.55,duration:.55};
    this.weatherLightning=cue;this.emit('lightningWarning',{x:cue.x,y:cue.y,radius:110,warningSeconds:cue.duration});
   }
   if(this.weather==='Tornado'&&!this.tornado){
    const x=F.x+160+this.nextWeatherRandom()*(F.w-320),y=F.y+150+this.nextWeatherRandom()*(F.h-300);
    this.tornado={x,y,life:4.5,totalLife:4.5,radius:150};tornadoSpawned=true;this.emit('tornadoSpawn',{x,y,life:4.5,radius:150});
   }
  }
  if(this.tornado&&!tornadoSpawned){
   const t=this.tornado;t.life=Math.max(0,t.life-dt);
   t.x=clamp(t.x+this.wind.x*dt*.32,F.x+120,F.x+F.w-120);
   t.y=clamp(t.y+Math.sin(this.clock*2)*35*dt,F.y+120,F.y+F.h-120);
   if(t.life<=0){this.tornado=null;this.emit('tornadoExpired',{x:t.x,y:t.y});return;}
   for(const p of this.players){const d=distance(p,t);if(d>=150||p.keeper)continue;
    p.x=clamp(p.x+(t.x-p.x)/(d||1)*110*dt,F.x+22,F.x+F.w-22);
    p.y=clamp(p.y+(t.y-p.y)/(d||1)*110*dt,F.y+24,F.y+F.h-24);
    p.z=Math.max(p.z,clamp(Math.sin(this.clock*3)*32+38,38,70));
   }
   const d=distance(this.ball,t);if(d<140&&this.ball.owner===null){
    this.ball.vx=clamp((this.ball.vx||0)+(t.x-this.ball.x)/(d||1)*290*dt,-700,700);
    this.ball.vy=clamp((this.ball.vy||0)+(t.y-this.ball.y)/(d||1)*290*dt,-700,700);
    this.ball.vz=clamp((this.ball.vz||0)+90*dt,0,300);
   }
  }
 }
 // Coordinated NPC aerial play: one team-level decision at a time, using the same
 // stamina, cooldown, collision and apex rules as the human teammate launch.
 // The side's manually controlled player is never auto-launched.
 coordinateAiCombos(dt){
  const b=this.ball;
  if(b.owner||b.z<80||b.z>380||b.canCollect>.6)return;
  for(let t=0;t<2;t++){
   if(this.clock<(this.aiComboThink[t]||0)||this.clock<(this.aiComboNext[t]||0))continue;
   const ai=aiTuning(this.cpuLevel({t}));
   this.aiComboThink[t]=this.clock+Math.max(.15,ai.reaction+.12);
   if(!ai.comboAwareness)continue;
   const preview=.16+ai.anticipation*.38;
   const future={x:clamp(b.x+(b.vx||0)*preview,F.x+25,F.x+F.w-25),
     y:clamp(b.y+(b.vy||0)*preview,F.y+25,F.y+F.h-25),
     z:Math.max(0,b.z+(b.vz||0)*preview-540*preview*preview)};
   if(future.z<70||future.z>385)continue;
   const available=this.players.filter(q=>q.t===t&&!q.keeper&&!q.stun&&q.z===0&&q.comboCooldown<=0&&q.fatigue<.72&&(!this.inControl(t)||q!==this.controlledPlayer(t)));
   // Being the human team's assistant is fine; controlling the HUMAN player isn't.
   const candidates=[];
   for(const jumper of available){
    const d=distance(jumper,future);
    if(d>145+ai.comboAwareness*115)continue;
    for(const assistant of this.players){
     if(assistant===jumper||assistant.t!==t||assistant.keeper||assistant.stun>0||assistant.z!==0||assistant.fatigue>.72||assistant.cd>0||(this.inControl(t)&&assistant===this.controlledPlayer(t)))continue;
     const pair=distance(jumper,assistant);
     if(pair>210||pair<1)continue;
     candidates.push({jumper,assistant,pair,score:d+pair*.40-stat(jumper,'heading')*.40});
    }
   }
   candidates.sort((a,b)=>a.score-b.score);
   if(!candidates.length)continue;
   const best=candidates[0];
   if(best.pair>108){
    best.assistant.aiAssistTarget={x:best.jumper.x+Math.sign(best.assistant.x-best.jumper.x||1)*64,
      y:best.jumper.y,expires:this.clock+1.4};
    // Retry shortly after the helper has had time to move into position.
    this.aiComboThink[t]=this.clock+.20;
   }else if(this.tryTeammateLaunch(best.jumper)){
    best.jumper.aiComboGoal={x:future.x,y:future.y};best.assistant.aiAssistTarget=null;
    this.aiComboNext[t]=this.clock+5.3;
    this.emit('aiComboSetup',{team:t,player:best.jumper.src.name,assistant:best.assistant.src.name,difficulty:ai.name});
   }
  }
 }
 // While airborne, NPC players track the loose ball and attempt the transformed
 // special only in the real apex window. Too-late balls get a normal flip kick.
 driveAiCombo(p,dt,ai){
  if(!p.comboActive||p.z<=0)return false;
  const b=this.ball;
  const speed=this.playerSpeed(p)*(.37+ai.comboAwareness*.28);
  const preview=.065;
  const target=b.owner?null:{x:b.x+(b.vx||0)*preview,y:b.y+(b.vy||0)*preview};
  const dx=target?target.x-p.x:0,dy=target?target.y-p.y:0,d=Math.hypot(dx,dy);
  if(d>10){this.moveAgile(p,dx/d,dy/d,speed,dt);if(Math.abs(p.dx)>.04)p.face=p.dx>0?1:-1;}
  else this.moveAgile(p,0,0,speed,dt);
  this.staminaTick(p,dt,d>10?.16:0);
  // No AI shortcut to bypass the original v0.8.2 special eligibility.
  if(!b.owner&&p.cd<=0&&p.z>=95&&distance(p,b)<=110&&Math.abs(b.z-(p.z+38))<=125){
   const timing=ai.comboTiming||0;
   if(p.comboWindow>0&&p.specialCd<=0&&p.z>=145&&Math.abs(p.vz)<=260*timing){
    this.tryFlipKick(p,true);
   }else if((p.vz<-230||p.comboWindow<.2)&&p.z>=95){this.tryFlipKick(p,false);}
  }
  return true;
 }
 updateHideBall(p,dt){
  if(!p)return false;
  dt=Math.min(.05,Math.max(0,Number.isFinite(dt)?dt:0));
  const hidden=Math.max(0,Number(p.hideBallTimer)||0);let startedReveal=false;
  if(hidden>0){
   const remaining=hidden-dt,lost=this.ball?.owner!==p,next=lost||remaining<=1e-9?0:Math.max(0,remaining);
   p.hideBallTimer=next;
   if(lost||next===0){p.hideBallLastKnown=null;p.hideBallReveal=.18;startedReveal=true;this.emit('hideBallReveal',{team:p.t,player:p.src?.name,reason:lost?'possession-lost':'timeout'});}
  }else p.hideBallTimer=0;
  if(!startedReveal)p.hideBallReveal=Math.max(0,(Number(p.hideBallReveal)||0)-dt);
  return p.hideBallTimer>0;
 }
  updateTeleportTrail(p,dt){
   const trail=p?.teleportTrail;if(!trail)return false;
   const step=Math.min(.05,Math.max(0,Number.isFinite(dt)?dt:0));
   trail.remaining=Math.max(0,(Number(trail.remaining)||0)-step);
   if(trail.remaining<=1e-9){p.teleportTrail=null;return false;}
   return true;
  }
 updatePlayers(dt){const b=this.ball;
 for(let t=0;t<Math.min(2,this.humans);t++)this.autoSwitch(t,dt);
 // Snapshot controllers: an in-frame swap must not make the next player consume the same tap.
 const selectedAtStart=this.controlled.slice();
   for(let p of this.players){this.playerSeconds[p.t][p.src.id]=(this.playerSeconds[p.t][p.src.id]||0)+dt;p.anim+=dt;p.cd=Math.max(0,p.cd-dt);p.invuln=Math.max(0,p.invuln-dt);p.specialCd=Math.max(0,p.specialCd-dt);p.abilityCd=Math.max(0,(p.abilityCd||0)-dt);p.abilityFx=Math.max(0,(p.abilityFx||0)-dt);p.spinBumperImpactFx=Math.max(0,(p.spinBumperImpactFx||0)-dt);p.maceSweepImpactFx=Math.max(0,(p.maceSweepImpactFx||0)-dt);this.updateSpinBumper(p,dt,true);this.updateMaceSweep(p,dt,true);this.updateSpinBumpFx(p,dt);this.updateSandTrapFx(p,dt);this.updateLightningTrick(p,dt,true);this.updateFieldTrickFx(p,dt);this.updateFireballBurn(p,dt);this.updateTeleportTrail(p,dt);p.dashCooldown=Math.max(0,(p.dashCooldown||0)-dt);p.diveCooldown=Math.max(0,(p.diveCooldown||0)-dt);p.diveIntentCooldown=Math.max(0,(p.diveIntentCooldown||0)-dt);p.comboCooldown=Math.max(0,(p.comboCooldown||0)-dt);p.contactCooldown=Math.max(0,(p.contactCooldown||0)-dt);p.trickCd=Math.max(0,(p.trickCd||0)-dt);p.dribbleCooldown=Math.max(0,(p.dribbleCooldown||0)-dt);p.trickGuard=Math.max(0,(p.trickGuard||0)-dt);this.updateHideBall(p,dt);p.trickFx=Math.max(0,(p.trickFx||0)-dt);p.firstTouchFx=Math.max(0,(p.firstTouchFx||0)-dt);p.firstTouchControlTimer=Math.max(0,(p.firstTouchControlTimer||0)-dt);p.comboWindow=Math.max(0,(p.comboWindow||0)-dt);
  p.shotImpactWeaknessTimer=Math.max(0,(p.shotImpactWeaknessTimer||0)-dt);
  if(p.shotImpactWeaknessTimer<=0)p.shotImpactWeakness=0;
  p.shotImpactConfusedTimer=Math.max(0,(p.shotImpactConfusedTimer||0)-dt);
  p.ballLiftWindow=Math.max(0,(p.ballLiftWindow||0)-dt);
  this.resolveAerialTap(p,dt);
  if(!p.ballLiftWindow&&this.ball.liftOwner===p)this.ball.liftOwner=null;p.assistFx=Math.max(0,(p.assistFx||0)-dt);p.dashTimer=Math.max(0,(p.dashTimer||0)-dt);p.actionTimer=Math.max(0,p.actionTimer-dt);if(p.keeper&&['keeperDive','keeperDiveCatch'].includes(p.action))p.diveElapsed=Math.min(.7,(p.diveElapsed||0)+dt);p.cryTimer=Math.max(0,(p.cryTimer||0)-dt);if(p.actionTimer===0&&p.action!=='idle'&&p.action!=='keeperHold'){
   if(p.keeper&&((p.action==='keeperDive'&&(p.diveCooldown>0||p.diveIntentPending))||
        (p.action==='keeperDiveCatch'&&this.ball.owner===p))){
    // Also finish a caught dive with a visible landing instead of snapping upright.
    p.action='keeperRecover';p.actionTimer=.34;p.z=0;p.diveIntentPending=false;
    this.emit('keeperRecovery',{team:p.t,player:p.src.name,secondsRemaining:p.diveCooldown});
   }else if(p.keeper&&this.ball.owner===p){p.action='keeperHold';p.actionTimer=0;}
   else p.action='idle';
  }if(p.z>0||p.vz>0){p.z+=p.vz*dt;p.vz-=1080*dt;if(p.z<=0){const wasCombo=p.comboActive;p.z=0;p.vz=0;p.jumpCount=0;if(wasCombo)this.landCombo(p)}}
  if((p.shotImpactKnockdownPending||0)>0&&p.z<=0){p.shotImpactKnockdownTimer=Math.max(p.shotImpactKnockdownTimer||0,p.shotImpactKnockdownPending);p.shotImpactKnockdownTotal=p.shotImpactKnockdownTimer;p.shotImpactKnockdownPending=0;p.dx=0;p.dy=0;p.moveVX=0;p.moveVY=0;p.action='shotDown';p.actionTimer=p.shotImpactKnockdownTimer;continue;}
  if((p.shotImpactKnockdownPending||0)>0&&p.z>0){p.dx=0;p.dy=0;p.moveVX=0;p.moveVY=0;continue;}
  if((p.shotImpactKnockdownTimer||0)>0){p.shotImpactKnockdownTimer=Math.max(0,p.shotImpactKnockdownTimer-dt);p.dx=0;p.dy=0;p.moveVX=0;p.moveVY=0;if(p.shotImpactKnockdownTimer>0){p.action='shotDown';p.actionTimer=p.shotImpactKnockdownTimer;continue;}p.shotImpactRiseTimer=.24;p.action='shotGetUp';p.actionTimer=.24;continue;}
  if((p.shotImpactRiseTimer||0)>0){p.shotImpactRiseTimer=Math.max(0,p.shotImpactRiseTimer-dt);p.action='shotGetUp';p.actionTimer=p.shotImpactRiseTimer;continue;}
 if(p.stun>0){p.stun=Math.max(0,p.stun-dt);p.slideTimer=0;p.slideRemaining=0;p.moveVX=0;p.moveVY=0;this.staminaTick(p,dt,0);continue}
 if(this.rideBall&&(p===this.rideBall.carrier||p===this.rideBall.passenger)){p.dx=0;p.dy=0;p.moveVX=0;p.moveVY=0;continue}
 if((p.slideTimer||0)>0){
  const step=Math.min(dt,p.slideTimer);p.slideTimer=Math.max(0,p.slideTimer-step);
  // Small swept increments prevent tunnelling through nearby ball carriers at low FPS.
  for(let distanceLeft=Math.min(p.slideSpeed*step,p.slideRemaining||0);distanceLeft>0;distanceLeft-=Math.min(18,distanceLeft)){
   const stride=Math.min(18,distanceLeft);p.slideRemaining=Math.max(0,p.slideRemaining-stride);p.slideTravelled=(p.slideTravelled||0)+stride;p.x=clamp(p.x+p.slideDX*stride,F.x+22,F.x+F.w-22);
   p.y=clamp(p.y+p.slideDY*stride,F.y+23,F.y+F.h-23);
   if(this.slideContact(p))break;
  }
  if(p.slideRemaining<=.001)p.slideTimer=0;
  p.moveVX=p.slideTimer>0?p.slideDX*p.slideSpeed:0;p.moveVY=p.slideTimer>0?p.slideDY*p.slideSpeed:0;
  p.action='slide';p.actionTimer=Math.max(p.actionTimer,p.slideTimer+.08);
  this.staminaTick(p,dt,.7);continue;
 }
 const controlled=this.inControl(p.t)&&p.i===selectedAtStart[p.t];p.controlled=controlled;
 if(controlled){let s=this.input.state[p.t]||{},dx=s.x||0,dy=s.y||0;
  // A lost touch pointer, app switch or focus change ABORTS a gesture; it is
  // not a deliberate release. Clear buffered charge/hold state before the
  // ordinary release paths can fire a phantom shot, pass or delayed Jump.
  if(this.input.canceled?.(p.t,'shoot')){p.charge=0;p.comboShotHeld=false;}
  if(this.input.canceled?.(p.t,'pass')){p.passHold=0;p.passUsed=false;p.passDirection=null;p.chase=0;p.queuedPass=null;}
  // A completed quick tap during the kickoff/restart lock must not disappear.
  // Buffer only a teammate's possession and expire the tap if play never resumes.
  if(this.cooldown>0&&this.input.released?.(p.t,'pass')&&this.ball.owner?.t===p.t){
   p.queuedPass={hold:this.input.tapDuration?.(p.t,'pass')||0,direction:Math.hypot(s.x||0,s.y||0)>.16?{x:s.x,y:s.y}:p.passDirection,until:this.clock+1.25};
  }
  if(this.input.canceled?.(p.t,'jump')){p.jumpHold=0;p.jumpTapPending=false;}
  if(this.input.canceled?.(p.t,'dribble')){p.dribbleHold=0;p.ballLiftLock=false;}
  p.dx=dx;p.dy=dy;const elapsedJump=Math.max(p.jumpHold||0,this.input.tapDuration?.(p.t,'jump')||0);
  // Breath replaces any fixed continuous-dribble duration cap.
  // Only moving ball-control holds spend their small extra Breath budget. Standing still may recover.
  // Analog dribble movement scales the cost; sustained JUMP sprint remains far more expensive.
  if(s.dribble&&this.ball.owner===p)p.breath=Math.max(0,(p.breath??breathCapacity(stat(p,'stamina')))-dt*dribbleHoldBreathRate(stat(p,'stamina'))*Math.min(1,Math.hypot(dx,dy)));
  p.dribbleHold=s.dribble&&this.ball.owner===p?(p.dribbleHold||0)+dt:0;
  if(!s.dribble||this.ball.owner!==p)p.magicHoldLatched=false;
  if(!s.dribble)p.ballLiftLock=false;
  p.jumpHold=s.jump?elapsedJump+dt:0;const defensiveSprint=this.ball.owner!==p&&!!s.jump;const running=defensiveSprint||(this.ball.owner===p&&p.jumpHold>.16);let spd=this.playerSpeed(p)*(running?1.37:1)*(p.dashTimer>0?1.7:1)*(.88+p.src.power*.0015)*(this.terrain==='Sand'?.69:1)*(this.condition==='Wet'?.86:1);
 if((p.chase||0)>0&&this.ball.owner!==p&&p.z<=0){p.chase=Math.max(0,p.chase-dt);const target=this.ball.owner||this.ball,dist=Math.hypot(target.x-p.x,target.y-p.y);if(dist>57){dx=(target.x-p.x)/dist;dy=(target.y-p.y)/dist;}else if(p.cd<=0&&(!this.ball.owner||this.ball.owner.t!==p.t)){this.tackle(p,false);p.chase=0}}else p.chase=0;
 // Sustained movement + sprint is deliberate to prevent accidental hyperdash.
 if(running&&Math.hypot(dx,dy)>.52&&this.ball.owner!==p){p.sprintCharge=(p.sprintCharge||0)+dt;if(p.sprintCharge>.56)this.triggerHyperdash(p);}else p.sprintCharge=0;
 this.moveAgile(p,dx,dy,spd,dt);if(p.dashTimer>0){p.action='hyperdash';p.actionTimer=.17;}
 if(Math.abs(p.dx)>.04)p.face=p.dx>0?1:-1;this.staminaTick(p,dt,Math.hypot(dx,dy)>.14?(p.dashTimer>0?1.7:running?1.5:.6):0,breathMovementIntensity(Math.hypot(dx,dy),running,p.dashTimer>0));if(this.cooldown===0){
  if(p.queuedPass){
   const pending=p.queuedPass;p.queuedPass=null;
   if(this.clock<=pending.until&&this.ball.owner?.t===p.t){this.performTeamPass(p,pending.hold>.24,false,pending.direction,pending.hold);p.passUsed=true;p.passHold=0;p.passDirection=null;}
  }
  // Cross is SEQUENTIAL: jump first, become airborne, THEN press Pass.
  // Pass first + Jump is never a cross, and can still finish as a long pass.
  if(!s.dribble||!s.jump)p.bicycleChordLatched=false;
  const aerialCross=this.ball.owner===p&&p.z>0&&this.input.just(p.t,'pass');
  if(aerialCross){this.performTeamPass(p,true,true,Math.hypot(s.x||0,s.y||0)>.16?{x:s.x,y:s.y}:null,.3);p.passUsed=true;p.passHold=0;p.passDirection=null;p.jumpTapPending=false;}
  const liftChord=this.ball.owner===p&&s.jump&&s.dribble&&this.input.just(p.t,'jump')&&
    p.dribbleHold>=BALL_LIFT_HOLD_SECONDS;
  const liftFired=liftChord&&this.tryBallLift(p);
  const bicycleChord=!liftFired&&this.ball.owner===p&&s.jump&&s.dribble&&!p.bicycleChordLatched&&
    (this.input.just(p.t,'dribble')||this.input.just(p.t,'jump'));
  const bicycleFired=bicycleChord&&this.tryBicycleShot(p);
  if(bicycleFired){p.bicycleChordLatched=true;p.jumpTapPending=false;p.dribbleTapAt=-10;}
  // Once the lifted ball is loose, a new Jump begins the aerial sequence.
  if(p.ballLiftWindow>0&&this.ball.liftOwner===p&&this.input.just(p.t,'jump')&&!s.dribble){
   p.jumpTapPending=false;if(p.z<=0)this.jump(p);
  }
  const shootDown=this.input.just(p.t,'shoot');
  // Airborne loose-ball contacts take precedence over defensive kick, swap,
  // charge and any legacy assisted flip, and consume each individual tap.
  const aerialShoot=shootDown&&this.aerialBallInReach(p)&&this.queueAerialTap(p,'header');
  const aerialDribble=this.input.just(p.t,'dribble')&&this.aerialBallInReach(p)&&this.queueAerialTap(p,'bicycle');
  const shotCombo=!liftFired&&!aerialShoot&&shootDown&&(s.jump||p.z>20)&&
    (this.ball.owner===p||this.ball.owner?.t!==p.t);
  if(shotCombo){
   p.jumpTapPending=false;
   if(s.pass)p.passUsed=true;
   if(this.ball.owner===p){this.shoot(p,p.jumpCount>=2&&p.z>10,p.z>18);}
   else if(!this.tryFlipKick(p,false)&&!this.requestKeeperSuper(p.t)&&!(p.keeper&&this.tryKeeperDive(p,true))&&!this.activateDefence(p))this.tryFlyingKick(p,p.jumpCount>=2&&p.z>10);
   p.charge=0;p.comboShotHeld=true;
  }
  else if(!liftFired&&!aerialShoot&&this.ball.owner===p&&s.shoot&&!p.comboShotHeld){p.charge=Math.min(1.2,(p.charge||0)+dt);p.action='windup';p.actionTimer=.1;}
  else if(p.charge>0){if(this.ball.owner===p)this.shoot(p,false,p.z>65,p.charge);p.charge=0;}
  if(!s.shoot)p.comboShotHeld=false;
  if(shootDown&&s.pass)p.passUsed=true;
  if(shootDown&&!liftFired&&!aerialShoot&&this.ball.owner===p&&!s.shoot&&!shotCombo)this.shoot(p,p.jumpCount>=2&&p.z>10,p.z>18,Math.min(1.2,this.input.tapDuration?.(p.t,'shoot')||0));
  if(shootDown&&!aerialShoot&&!liftFired&&this.ball.owner!==p&&!shotCombo&&this.ball.liftOwner!==p)this.command(p,'shoot');
  // Four-button PASS is contextual: short tap, longer aerial pass, or defensive chase.
  if(s.pass&&!aerialCross&&!this.input.released?.(p.t,'pass')){p.passHold=(p.passHold||0)+dt;
   if(Math.hypot(s.x||0,s.y||0)>.16)p.passDirection={x:s.x,y:s.y};
   if(this.ball.owner?.t!==p.t&&p.passHold>.24){p.chase=Math.max(p.chase||0,0.36);p.passUsed=true;}}
  else if((p.passHold||0)>0||this.input.released?.(p.t,'pass')){
   if(!p.passUsed||this.ball.owner?.t===p.t){const held=Math.max(Number(p.passHold)||0,this.input.tapDuration?.(p.t,'pass')||0),longPass=held>.24;
    const direction=Math.hypot(s.x||0,s.y||0)>.16?{x:s.x,y:s.y}:p.passDirection;
    if(this.ball.owner?.t===p.t)this.performTeamPass(p,longPass,false,direction,held);else this.tackle(p,false);}
   p.passHold=0;p.passUsed=false;p.passDirection=null;
  }
  // Hold DRIBBLE for >=1s with possession to trigger an equipped Magic Trick
  // once per continuous press; Jump combinations take priority.
  if(s.dribble&&!s.jump&&!s.shoot&&!s.pass&&this.ball.owner===p&&
     p.dribbleHold>=1&&p.breath>=.8&&!p.magicHoldLatched){
   p.magicHoldLatched=true;
   this.tryMagicTrick(p);
  }
  const dribbleDown=this.input.just(p.t,'dribble');
  if(dribbleDown&&!aerialDribble&&!bicycleFired&&!liftFired&&!s.shoot&&!s.pass){
   if(s.jump&&this.ball.owner===p){this.tryBicycleShot(p);p.dribbleTapAt=-10;}
   else if(this.ball.owner===p&&(p.dribbleCooldown||0)<=0){
    // One input = one move. Against nearby defenders, offer the existing
    // personality trick immediately; a double-tap cannot bypass cooldown.
    const pressured=this.players.some(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&distance(p,q)<115);
    const performed=(pressured&&this.tryDribbleTrick(p))||this.dribble(p);
    if(performed)p.dribbleTapAt=this.clock;
   }else if(this.ball.owner!==p)this.dribble(p);
  }
  // Jump held and Dribble tapped is accepted in either input order.
  const bicycleFromJump=bicycleFired;
  // A moving ball carrier holds Jump to sprint; a short tap still jumps.
  // Defer the ordinary jump until release to distinguish the two gestures.
  if(this.input.just(p.t,'jump')&&!p.keeper&&!s.pass&&!s.shoot&&!s.dribble&&p.z<=0&&p.ballLiftWindow<=0){
   p.jumpTapPending=true;
  }
  let tapJumpResolved=false;
  if(this.input.released?.(p.t,'jump')&&p.jumpTapPending){if(elapsedJump<.18&&!s.pass&&!s.shoot&&!s.dribble){tapJumpResolved=this.jump(p);}p.jumpTapPending=false;}
  if(!s.jump&&p.jumpTapPending&&!this.input.just(p.t,'jump')){if(elapsedJump>0&&elapsedJump<.18&&!s.pass&&!s.shoot&&!s.dribble){tapJumpResolved=this.jump(p);}p.jumpTapPending=false;}

  // A second JUMP while airborne must still work without a fifth action key.
  // It is distinct from a grounded tap/hold and from the Jump+Dribble bicycle.
  if(this.input.just(p.t,'jump')&&p.z>10&&!s.shoot&&!s.dribble&&!bicycleFromJump&&p.ballLiftWindow<=0){
   p.jumpTapPending=false;
   this.jump(p);
  }
  // Pass held before Jump never transforms into a cross or teammate launch.
  if(this.input.just(p.t,'jump')&&s.pass&&p.z<=10&&!bicycleFromJump&&!tapJumpResolved){
   p.jumpTapPending=false;
   // Off-ball Jump+Pass is the four-button fast-chase chord. Letting the
   // grounded jump fire here made the next frame clear chase while airborne,
   // so the advertised pursuit/auto-tackle never happened. Possession keeps
   // its intentional grounded jump behavior; aerial crosses remain sequential.
   if(p.z<=0&&this.ball.owner?.t===p.t)this.jump(p);
  }
  // No independent Special / Sprint / Switch gameplay buttons exist.
 }
 }else this.driveAI(p,dt);
 if(p.keeper&&!controlled)this.advanceKeeperDive(p,dt);
 p.x=clamp(p.x,F.x+22,F.x+F.w-22);p.y=clamp(p.y,F.y+23,F.y+F.h-23);
  }
   // Resolve all bumper pulses after both teams received this frame's AI reaction.
   for(const p of this.players)if(p.spinBumperPending&&p.spinBumperPending.remaining<=1e-9)this.resolveSpinBumper(p);
   for(const p of this.players)if(p.maceSweepPending&&p.maceSweepPending.remaining<=1e-9)this.resolveMaceSweep(p);
   for(const p of this.players)if(p.lightningPending&&p.lightningPending.remaining<=1e-9)this.resolveLightningTrick(p);
  }

 driveAI(p,dt){
  // Game difficulty is a behaviour preset, not an arcade game-speed multiplier.
  const liveBall=this.ball,liveOwner=liveBall.owner,t=p.t,dir=t===0?1:-1;
  const concealed=!!(liveOwner&&liveOwner.t!==t&&(liveOwner.hideBallTimer||0)>0);
  const known=concealed&&liveOwner.hideBallLastKnown;
  // CPU vision uses the carrier's last known position during Hide Ball. The
  // live simulation and human controls retain the real owner and ball state.
  const b=concealed?{...liveBall,owner:null,x:known?.x??liveOwner.x,y:known?.y??liveOwner.y,z:0,vx:0,vy:0,vz:0}:liveBall;
  const owner=b.owner;
  // Only the bounded physical lunge may move a keeper during dive intent.
  // Continuing ordinary AI tracking here bypasses the per-attempt 28-unit cap.
  // Once diveIntentPending is cleared, this normal AI path is available again.
  if(p.keeper&&p.diveIntentPending&&p.action==='keeperDive'){
   p.moveVX=0;p.moveVY=0;p.dx=0;p.dy=0;
   return;
  }
  const ai=aiTuning(this.cpuLevel(p));
  const aiStyle=this.options.aiStyle||'Balanced';const tactical=tacticModifiers(this.teamPlans[t]||{attack:'Balanced',defence:'Balanced'});
   if(this.reactToMagicWall(p))return;
   this.reactToSpinBumper(p,dt,ai.reaction);
   this.reactToMaceSweep(p,dt,ai.reaction);
   this.reactToLightningTrick(p,dt,ai.reaction);
   if(this.reactToSpinSandTrick(p,dt,ai.reaction)||p.aiSpinSandThreat)return;
   if(this.reactToWindMudTrick(p,dt,ai.reaction)||p.aiWindMudThreat)return;
   if(this.reactToFireballTrick(p,dt,ai.reaction)||p.aiFireballThreat)return;
   if(this.reactToScreamTrick(p,dt,ai.reaction)||p.aiScreamThreat)return;
   if(this.reactToTeleportTrick(p,dt,ai.reaction)||p.aiTeleportThreat)return;
   this.reactToSupernova(p,dt,ai.reaction);
   if(this.reactToWeatherLightning(p,dt,ai.reaction))return;
   if(this.reactToTornado(p,dt,ai.reaction))return;
   if(this.reactToMagicHazard(p,dt,ai.reaction))return;
  // Always reserve a real AI defender; the human-controlled player must not
  // swallow the team pursuit assignment. The next closest AI supplies cover.
  const pressing=(!owner||owner.t!==t)?defensivePressers(this.players,t,owner||b,
   this.inControl(t)?this.controlledPlayer(t):null):null;
  const styleSpeed=t===1?(aiStyle==='Aggressive'?1.09:aiStyle==='Defensive'?.96:1):1;
  if(p.keeper&&owner===p){
   p.keeperHold=(p.keeperHold||0)+dt;
   if(p.cd<=0&&(p.keeperHold>=1.35||(p.keeperHold>=.28&&this.players.some(q=>q.t!==p.t&&!q.keeper&&q.stun<=0&&distance(p,q)<210)))){this.distributeKeeper(p);return;}
  }else if(p.keeper){p.keeperHold=0;}
  if(!concealed&&this.driveAiCombo(p,dt,ai))return;
  const speed=this.playerSpeed(p)*ai.speed*styleSpeed*(this.terrain==='Sand'?.75:1);
  if(p.aiAssistTarget){
   if(p.aiAssistTarget.expires<this.clock||this.ball.owner||p.stun>0||p.z>0){p.aiAssistTarget=null;}
   else{
    const target=p.aiAssistTarget,dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy);
    if(d>12)this.moveAgile(p,dx/d,dy/d,speed,dt);else this.moveAgile(p,0,0,speed,dt);
    this.staminaTick(p,dt,d>12?.36:0);
    return;
   }
  }
  p.aiTimer=(p.aiTimer??0)-dt;
  const decide=p.aiTimer<=0||!p.aiTarget;
  if(decide){
   // Reaction/awareness delay applies to positioning, keeper tracking and actions.
   p.aiTimer=ai.reaction;
   let tx=p.homeX,ty=p.homeY;
   const goalY=(WORLD.goalTop+WORLD.goalBottom)/2;
   const target=owner||b;
   const lead=owner?0:ai.anticipation;
   const bx=clamp(target.x+(b.vx||0)*lead,F.x+22,F.x+F.w-22);
   const by=clamp(target.y+(b.vy||0)*lead,F.y+23,F.y+F.h-23);
   if(p.keeper){
    const side=t===0?F.x+34:F.x+F.w-34;
    tx=side;
    ty=predictedKeeperLane(p,b,ai.keeperRead);
    if(!owner&&Math.abs(b.x-side)<175)tx=clamp(bx,side-35,side+35);
    if(owner===p&&p.cd<=0&&p.keeperHold>.95)this.distributeKeeper(p);
   }else if(owner===p){
    tx=clamp(p.x+dir*(180+ai.anticipation*210)*tactical.advance,F.x+100,F.x+F.w-100);
    ty=goalY+(p.y-goalY)*.38;
    const nearGoal=t===0?p.x>F.x+F.w*(.88-ai.anticipation*.32):p.x<F.x+F.w*(.12+ai.anticipation*.32);
    const defenders=this.players.filter(q=>q.t!==t&&!q.stun&&distance(p,q)<230);
    const pressured=defenders.length>0;
    // Attack-quality gate runs before pressure passing. On the shorter pitch,
    // the earlier pass-first ordering suppressed promising close-range shots.
    const goalDistance=Math.abs((t===0?F.x+F.w:F.x)-p.x);
    const nearestDefender=defenders.length?Math.min(...defenders.map(q=>distance(p,q))):999;
    const finishChance=SHOTFEEL.aiFinishingPriority(goalDistance,nearestDefender,stat(p,'shootAccuracy'),ai.shootRate)*tactical.shoot;
    if(p.cd<=0&&nearGoal&&Math.random()<finishChance){this.shoot(p,Math.random()<ai.superRate)}
    else if(p.cd<=0&&pressured&&p.trickCd<=0&&Math.random()<(.04+ai.anticipation*.62)&&this.tryDribbleTrick(p,true)){}
    else if(p.cd<=0&&pressured&&Math.random()<ai.passRate*tactical.pass){this.pass(p)}
    else if(p.cd<=0&&Math.random()<ai.passRate*.10){this.pass(p)}
   }else{
    const pursuers=this.players.filter(q=>q.t===t&&!q.keeper&&!q.stun).sort((a,c)=>distance(a,target)-distance(c,target));
    if(owner&&owner.t===t){
     tx=clamp(p.homeX+dir*(220+ai.anticipation*280)*tactical.advance,F.x+24,F.x+F.w-24);
     ty=p.homeY+(owner.y-p.homeY)*.25;
    }else if(pursuers[0]===p||(pursuers[1]===p&&distance(p,target)<Math.max(390,ai.pressure*tactical.press))){
     tx=bx+dir*12;ty=by;
    }else{
     tx=p.homeX+(bx-MID)*(.23+ai.anticipation*.15)*tactical.defensiveDepth;
     ty=p.homeY+(by-(F.y+F.h/2))*.33;
    }
    if(owner&&owner.t!==t&&p.cd<=0&&fieldAbility(p.src)&&Math.random()<ai.tackleRate*.17*tactical.press){
      this.activateDefence(p);
    }
    if(owner&&owner.t!==t&&distance(p,owner)<68&&p.cd<=0&&Math.random()<ai.tackleRate*tactical.press){
      this.tackle(p,Math.random()<(.24+ai.anticipation*.4));
    }
   }
   p.aiTarget={x:tx,y:ty};
  }
  if(pressing&&p===pressing.primary){
   // Update pursuit every frame instead of waiting for the full AI think timer.
   const lead=owner?0:ai.anticipation*.36;
   p.aiTarget={x:clamp((owner||b).x+(b.vx||0)*lead,F.x+22,F.x+F.w-22),
    y:clamp((owner||b).y+(b.vy||0)*lead,F.y+23,F.y+F.h-23)};
   p.aiDetour=null;
   if(owner&&owner.t!==t&&distance(p,owner)<74&&p.cd<=0&&p.stun<=0){
    this.tackle(p,Math.random()<(.17+ai.anticipation*.35));
   }
  }else if(pressing&&p===pressing.support){
   const target=owner||b,spread=p.y>target.y?95:-95;
   p.aiTarget={x:clamp(target.x-(t===0?1:-1)*110,F.x+22,F.x+F.w-22),
    y:clamp(target.y+spread,F.y+23,F.y+F.h-23)};
  }
  let {x:tx,y:ty}=p.aiTarget;
  // Detect stalled movement after collision resolution, then choose a temporary
  // lateral route around the closest grounded player blocking the pursuit line.
  const distanceMoved=Math.hypot(p.x-(p.aiLastX??p.x),p.y-(p.aiLastY??p.y));
  const targetDist=Math.hypot(tx-p.x,ty-p.y);
  if(!p.keeper&&targetDist>95&&distanceMoved<Math.max(.35,dt*43))p.aiStuckTime=(p.aiStuckTime||0)+dt;
  else p.aiStuckTime=Math.max(0,(p.aiStuckTime||0)-dt*1.1);
  if(p.aiStuckTime>.32){
   const vx=(tx-p.x)/(targetDist||1),vy=(ty-p.y)/(targetDist||1);
   const blocker=this.players.filter(q=>q!==p&&q.z<18&&distance(p,q)<105)
    .filter(q=>((q.x-p.x)*vx+(q.y-p.y)*vy)>-6)
    .sort((a,b)=>distance(p,a)-distance(p,b))[0];
   if(blocker){const side=((p.i+p.t)%2?1:-1);
    p.aiDetour={x:clamp(blocker.x-vy*100*side+vx*55,F.x+23,F.x+F.w-23),
     y:clamp(blocker.y+vx*100*side+vy*55,F.y+24,F.y+F.h-24),expires:this.clock+1.1};
    this.emit('aiDetour',{team:p.t,player:p.src.name});
   }
   p.aiStuckTime=0;
  }
  if(p.aiDetour){if(this.clock>p.aiDetour.expires||Math.hypot(p.x-p.aiDetour.x,p.y-p.aiDetour.y)<28)p.aiDetour=null;
    else {tx=p.aiDetour.x;ty=p.aiDetour.y;}}
  p.aiLastX=p.x;p.aiLastY=p.y;
  const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);
  p.dx=0;p.dy=0;
  if(d>8){const step=Math.min(speed,d/Math.max(dt,.001));this.moveAgile(p,dx/d,dy/d,step,dt);if(Math.abs(p.dx)>.04)p.face=p.dx>0?1:-1}else this.moveAgile(p,0,0,speed,dt);this.staminaTick(p,dt,d>8?(this.teamPlans[t]?.defence==='High Press'&&owner?.t!==t ? .69 : .46):0);
 }
 resolveMagicWallBall(previousBall){
  const b=this.ball;
  for(const wall of this.magicWalls||[]){
   if(wall.arm>0||b.attacker===wall.team||b.z>=wall.height)continue;
   const crossed=(previousBall.x-wall.x)*(b.x-wall.x)<=0&&previousBall.x!==b.x;
   const near=Math.abs(b.x-wall.x)<=wall.thickness+8;
   if(!crossed&&!near)continue;
   const progress=crossed?clamp((wall.x-previousBall.x)/(b.x-previousBall.x),0,1):1;
   const hitY=previousBall.y+(b.y-previousBall.y)*progress;
   if(Math.abs(hitY-wall.y)>wall.halfLength+8)continue;
   const incoming=b.vx||b.x-previousBall.x||1;
    b.x=wall.x+Math.sign(incoming)*(wall.thickness+8);b.vx=-incoming*.28;b.vz=Math.max(b.vz,48);b.canCollect=Math.max(b.canCollect,.12);
    b.shot=null;b.strike=null;b.trail=[];this.burst(wall.x,hitY,wall.particleColor||'#b9f7ff',wall.particleCount?Math.round(wall.particleCount*.5):9);this.emit('magicWallBall',{team:wall.team,id:wall.id||'magicWall'});return true;
  }
  return false;
 }
 updateBall(dt){let b=this.ball;
  if(this._shotAudit&&b.age>5)this._auditOutcome('unresolved',{reason:'flightAge'});
  if(this._reboundAudit&&b.age>6){this.emit('reboundUnresolved',{auditId:this._reboundAudit.id,reason:'looseBallAge'});this._reboundAudit=null;}
  if(b.owner){const spinX=b.x,spinY=b.y;const p=b.owner;
  // A keeper in possession visibly carries the ball at glove height.
  b.x=p.x+p.face*(p.keeper?8:17);b.y=p.y+(p.keeper?8:12);
  b.z=p.keeper?p.z+82:p.z+12+((p.trickFx||0)>0?((dribbleStyle(p.trickStyleId).loft||0)*Math.min(1,p.trickFx*2)):0);if(p.stun>0){b.owner=null;b.vx=p.face*115;b.vy=0;b.vz=130;b.canCollect=.2;}b.rollAngle=((b.rollAngle||0)+rollDelta(b.x-spinX,b.y-spinY))%(Math.PI*2);return}
 const previousBall={x:b.x,y:b.y,z:b.z};
 const previousShotAge=b.age;
 b.canCollect=Math.max(0,b.canCollect-dt);b.age+=dt;
 // Exact zigzag position/heading change, including the step that crosses the
 // transformation end; use the same helper in keeper projection.
 if(b.shot?.behavior==='zigzag'){const turn=SHOTPATHS.zigzagStep(b.shot,previousShotAge,b.age);b.vy+=turn.deltaVy;b.y+=turn.correctionY;}
 if(b.shot?.behavior==='curve'){const turn=SHOTPATHS.curveStep(b.shot,previousShotAge,b.age);b.vy+=turn.deltaVy;b.y+=turn.correctionY;}
 if(b.shot?.behavior==='spiral'){const turn=SHOTPATHS.spiralStep(b.shot,previousShotAge,b.age);b.vy+=turn.deltaVy;b.y+=turn.correctionY;b.vz+=turn.deltaVz;b.z+=turn.correctionZ;}
 if(b.shot?.behavior==='homing'||b.shot?.behavior==='dolphin'){const turn=SHOTPATHS.homingStep(b.shot,previousShotAge,b.age);b.vy+=turn.deltaVy;b.y+=turn.correctionY;}
 if(b.shot?.behavior==='wave'){const turn=SHOTPATHS.waveStep(b.shot,previousShotAge,b.age);b.vy+=turn.deltaVy;b.y+=turn.correctionY;}
 if(b.shot?.behavior==='birdDodge'){
  const direction=b.attacker===0?1:-1,target=direction*690*(this.options.gameSpeed||1);
  b.vx+=clamp(target-b.vx,-320*dt,320*dt);
  const blocker=this.players.filter(q=>q.t!==b.attacker&&q.stun<=0&&direction*(q.x-b.x)>0&&direction*(q.x-b.x)<220&&Math.abs(q.y-b.y)<130)
   .sort((a,c)=>distance(a,b)-distance(c,b))[0];
  if(blocker){const side=(b.y-blocker.y)||((blocker.i%2)?1:-1);const urgency=clamp(1-Math.abs(b.y-blocker.y)/130,0,1);b.vy=clamp(b.vy+Math.sign(side)*urgency*520*dt,-300,300);}
 }
 if(b.shot?.behavior==='warp'){const turn=SHOTPATHS.warpStep(b.shot,previousShotAge,b.age);b.vy+=turn.deltaVy;b.y+=turn.correctionY;}
 // A prolonged loose ball is no longer a direct pass reception. Keep the
 // audit bounded, without touching actual ball speed, gravity or possession.
 if(b.pass&&b.age>3){this.emit('passExpired',{from:b.passFrom,team:b.passTeam});
  b.pass=false;b.passFrom=null;b.passTeam=null;b.passTarget=null;}
 // A super-shot transformation lasts only for its active window. A loose ball
 // must never stay a fish/banana/etc. forever if nobody collects it.
 if(b.strike&&b.age>4.2)b.strike=null;
 if(b.shot&&b.age>=SUPER_SHOT_TRANSFORM_SECONDS){
  b.shot=null;if(b.strike)b.strike.kind='normal';
  b.trail=[]; // clear the previous transformation-colored trail
  this.emit('shotTransformEnd',{age:b.age});
 }
 if(b.shot){const s=b.shot,phase=b.age*11;s.phase=phase;
 if(s.behavior==='swim'){b.vy+=Math.sin(b.age*18)*840*dt}
 if(s.behavior==='clone'){b.vy+=Math.sin(b.age*20)*250*dt}
 if(s.behavior==='burrow'){if(b.age>.12)b.z=Math.max(3,Math.min(b.z,9));b.vz=0}
 if(s.behavior==='lightning'){b.vy+=Math.sin(b.age*30)*380*dt}
 }
 b.vx+=this.wind.x*dt*.24;b.vy+=this.wind.y*dt*.24;b.x+=b.vx*dt;b.y+=b.vy*dt; b.rollAngle=((b.rollAngle||0)+rollDelta(b.x-previousBall.x,b.y-previousBall.y))%(Math.PI*2);
 this.resolveMagicWallBall(previousBall);
 // A resting ball is NOT a fresh ground impact each frame. The old floor
 // branch multiplied its velocity by .96 (and .92 sideways) every update,
 // unintentionally doubling rolling drag at 120Hz versus 60Hz.
 const airborneBeforeStep=b.z>0||b.vz<0;
 b.z+=b.vz*dt;b.vz-=500*dt;
 if(b.z<=0){b.z=0;
  if(airborneBeforeStep){
   b.vz=Math.abs(b.vz)*(.3+(this.terrain==='Grass'?.15:.05));
   b.vx*=this.condition==='Wet'?.80:.96;b.vy*=.92;
   if(Math.abs(b.vz)<47)b.vz=0;
  }else b.vz=0;
 }
 if(b.shot){const goalX=b.attacker===0?F.x+F.w:F.x,height=specialShotHeight(b.shot.behavior,b.age,Math.abs(goalX-b.x));
  if(height!==null){b.shot.underground=height<0;b.z=Math.max(0,height);b.vz=0;}else b.shot.underground=false;
 }
 if(b.strike){const drag=SHOTFEEL.flightDrag(dt,b.strike.kind==='super');b.vx*=drag;b.vy*=drag;}
 if(!b.shot&&!b.strike){
  // A struck, non-super ball retains momentum long enough for a credible
  // medium-range shot. Passes/keeper clearances and late loose-ball rolling
  // retain their pre-existing drag; special shots keep their own physics.
  const inFlight=b.ordinaryShot&&b.power>5&&b.age<1.8;
  let friction=inFlight?(this.terrain==='Sand'?.992:this.condition==='Wet'?.994:.996):this.terrain==='Sand'?.94:this.condition==='Wet'?.96:.986;b.vx*=Math.pow(friction,dt*60);b.vy*=Math.pow(friction,dt*60)}
 if(b.shot||Math.hypot(b.vx,b.vy)>190){b.trail.push({x:b.x,y:b.y,z:b.z});if(b.trail.length>22)b.trail.shift()}
 if(b.y<F.y+3){b.y=F.y+3;if(b.shot?.behavior==='ricochet'){const bank=SHOTPATHS.ricochetBounce(b.shot.ricochetBounces,b.vy,.65,-1);b.vy=bank.velocity;b.shot.ricochetBounces=bank.bounces;if(!bank.active)b.shot.behavior='normal'}else b.vy=Math.abs(b.vy)*.65}
 if(b.y>F.y+F.h-3){b.y=F.y+F.h-3;if(b.shot?.behavior==='ricochet'){const bank=SHOTPATHS.ricochetBounce(b.shot.ricochetBounces,b.vy,.65,1);b.vy=bank.velocity;b.shot.ricochetBounces=bank.bounces;if(!bank.active)b.shot.behavior='normal'}else b.vy=-Math.abs(b.vy)*.65}
 // Swept saves resolve before the ball crosses the goal line, including on
 // throttled/slow frames. Ordinary proximity dives still handle slower shots.
 this.tryBreakthroughKeeper(previousBall);
 if(this.trySweptKeeperDive(previousBall))return;
 // Every keeper is autonomous, including for a human-controlled team.
 // React deterministically once an on-target shot enters a keeper's save radius;
 // quality still determines whether the catch succeeds or gets deflected.
 if(b.attacker>=0&&!b.owner){const keeper=this.player(1-b.attacker,0);
  if(keeper){
   // One 14% opportunity per threatening transformed shot, independent of FPS.
   // A failed roll falls through to the ordinary dive; success has its own cooldown.
   let superSaved=false;
  if(!b.shot?.underground&&keeperAutoSuperEligible(keeper,b)){
    b.shot.keeperAutoConsidered=true;
    if(Math.random()<.14)superSaved=this.activateKeeperSuper(keeper,false);
   }
   if(!b.shot?.underground&&!superSaved&&!this.superBreakerApproaching(keeper,b)){
    if(!this.tryKeeperDive(keeper,false))this.tryKeeperDiveIntent(keeper);
   }
  }
 }
 // A successful ordinary keeper dive can take possession above. Stop this
 // frame before the fallback loose-ball collector re-catches that same ball:
 // it would duplicate the save event and replace the dive-catch animation.
 if(b.owner)return;
 // Scoring: ball must cross the appropriate end line between goalposts, below crossbar.
 if(b.x<F.x+5||b.x>F.x+F.w-5){
  let scoring=t=>{this.score[t]++;this.shake=.45;this.flash=.2;this.burst(b.x,b.y,'#ffdf79',60);const scorers=this.players.filter(p=>p.t===t).sort((p,q)=>distance(p,b)-distance(q,b));this.goalHero=b.attacker===t&&b.shooter?b.shooter:scorers[0]?.src?.name||this.getTeam(t).name;this.pendingKickoff={scorer:t,hero:this.goalHero};this.celebration=3.3;this.onGoalMorale(t);this.ball.owner=null;this.ball.strike=null;this.ball.vx=this.ball.vy=this.ball.vz=0;this.emit('goal',{team:t,hero:this.goalHero,score:this.score.slice()});this.cooldown=3.3};
  if(b.y>WORLD.goalTop&&b.y<WORLD.goalBottom&&b.z<125){scoring(b.x>F.x+F.w-5?0:1);return}
  const bankPending=b.shot?.behavior==='ricochet';
  if(!bankPending&&this.handleEndlineRestart())return;
  b.x=clamp(b.x,F.x+6,F.x+F.w-6);
  if(bankPending){const bank=SHOTPATHS.ricochetBounce(b.shot.ricochetBounces,b.vx,.72,b.x>F.x+F.w/2?1:-1);b.vx=bank.velocity;b.shot.ricochetBounces=bank.bounces;if(!bank.active)b.shot.behavior='normal'}else b.vx*=-.72;
  b.vy*=.95;
 }
 if(b.canCollect>0)return;
 const byDistance=this.players.filter(p=>!b.shot?.underground&&p.stun<=0&&(p.shotImpactKnockdownPending||0)<=0&&(p.shotImpactKnockdownTimer||0)<=0).map(p=>{
  // A fast pass or powerful shot can cross a player between simulation ticks.
  // Swept contact is intentionally limited to pass and active strike paths.
  let d=Math.hypot(p.x-b.x,p.y-b.y),height=b.z;
  if((b.pass||b.strike)&&previousBall){const vx=b.x-previousBall.x,vy=b.y-previousBall.y;
   const len2=vx*vx+vy*vy;if(len2>1){const u=clamp(((p.x-previousBall.x)*vx+(p.y-previousBall.y)*vy)/len2,0,1);
    const sx=previousBall.x+u*vx,sy=previousBall.y+u*vy;
    const swept=Math.hypot(p.x-sx,p.y-sy);
    if(swept<d){d=swept;height=previousBall.z+(b.z-previousBall.z)*u;}
   }
  }
  return {p,d,height};
 }).sort((a,c)=>a.d-c.d);for(let {p,d,height} of byDistance){if(d> (p.keeper?(26+stat(p,'gkSkill')*.18)*(1-.18*p.fatigue):27)||height>(p.keeper?(63+stat(p,'gkDiving')*1.12)*(1-.15*p.fatigue):45))continue;if(b.strike){
  const special=b.strike.kind==='super';
  const flightDistance=Math.hypot(b.x-b.strike.originX,b.y-b.strike.originY);
  const force=SHOTFEEL.contactEnergy(b.strike.energy,Math.hypot(b.vx,b.vy),flightDistance,special);
  applyShotImpactWeakness(p,special);
  const defence=stat(p,'defence')*.31+stat(p,'strength')*.12+(p.keeper?stat(p,'gkSkill')*.40:0);
  const penetrating=(special&&force>defence+5)||(!special&&force>defence+15);
  if(penetrating){
   const level=special?clamp(Number(b.shot?.level)||1,1,5):0;
   const knock=special?superShotKnockback(force,level,stat(p,'strength')):clamp((force-defence)/110,0,1.3);
   const victimStrength=stat(p,'strength');
   if(special&&knock>.65){p.shotImpactKnockdownPending=Math.max(p.shotImpactKnockdownPending||0,shotImpactKnockdownSeconds(knock,victimStrength));p.action='launched';p.actionTimer=Math.max(1.1,p.actionTimer);}
   else {const stun=shotImpactStunSeconds(force+knock*15,victimStrength,special);p.shotImpactConfusedTimer=Math.max(p.shotImpactConfusedTimer||0,stun);p.stun=Math.max(p.stun,stun);p.action='hurt';p.actionTimer=Math.max(p.actionTimer,p.stun);}
   const direction=norm(b.vx||p.face,b.vy||0);
   if(knock>.16){p.x=clamp(p.x+direction.x*knock*40,F.x+22,F.x+F.w-22);p.y=clamp(p.y+direction.y*knock*28,F.y+23,F.y+F.h-23);}
   if(special&&knock>.65){p.z=Math.max(p.z,12);p.vz=clamp(120+knock*180,120,480);this.emit('shotImpactLaunch',{player:p.src.name,team:p.t,force,special,knock,downSeconds:p.shotImpactKnockdownPending});}
   this.emit('shotImpact',{player:p.src.name,team:p.t,special,force,knock});
   this.burst(p.x,p.y,'#ffffaa',17);
   b.strike.energy*=special?.56:.43;b.strike.hits++;
   b.power=b.strike.energy;b.vx*=special?.79:.57;b.vy*=special?.79:.57;
   if(special&&(b.strike.hits>=3||b.strike.energy<26)){b.shot=null;b.strike.kind='normal';this.emit('shotTransformEnd',{reason:'impactDecay',hits:b.strike.hits});}
   this.shake=.15;continue;
  }
 }
 if(p.keeper&&b.attacker===p.t&&Math.hypot(b.vx,b.vy)>480)continue;
 if(p.keeper){
   // A previously deflected keeper rebound is a catch, NOT a second save.
   // Capture origin before keeperCollect() clears the shot flags.
   const liveOpposingShot=b.attacker===1-p.t&&!!(b.ordinaryShot||b.shot||b.strike);
   if(this.keeperCollect(p,'loose')&&liveOpposingShot)this.emit('save',{player:p,saveType:'catch'});
  }else this.take(p);break;
 }
 }
 burst(x,y,color,count=10){for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,spd=randomBetween(35,210);this.particles.push({x,y,z:randomBetween(3,80),vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,vz:randomBetween(10,150),life:randomBetween(.25,.8),max:.8,color,r:randomBetween(2,6)})}}
 updateEffects(dt){for(let f of this.particles){f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;f.vz-=180*dt;f.life-=dt;}this.particles=this.particles.filter(f=>f.life>0).slice(-450)}
 startPK(afterDraw=false){
  const inMatchTeam=arguments.length>1?arguments[1]:null;
  this.magicHazards=[];this.magicWalls=[];this.supernova=null;
  this.cancelPendingAbilityActions();
  this._closeShotAudits('penaltyTransition');
  const cy=(WORLD.goalTop+WORLD.goalBottom)/2;
  const validInMatch=[0,1].includes(inMatchTeam);
  const attackSign=validInMatch&&inMatchTeam===1?-1:1,goalX=attackSign>0?F.x+F.w:F.x,spotX=attackSign>0?F.x+F.w*.76:F.x+F.w*.24;
  this.matchState='penalty';this.pk={afterDraw,inMatchTeam:validInMatch?inMatchTeam:null,attackSign,goalX,spotX,kicks:[[],[]],turn:validInMatch?inMatchTeam:0,aim:cy,saveY:cy,shotTargetY:cy,ready:1.25,timer:8,shotTimer:0,shotMax:.8,ballX:spotX,ballY:cy,startX:spotX,startY:cy,dribbles:0,diveBoost:0,diveCooldown:0,stage:'ready'};this.emit('penaltyStart',validInMatch?{inMatch:true,team:inMatchTeam}:{});return true}
 updatePK(dt){
  if(this.matchState!=='penalty')return;dt=Math.min(.04,dt);this.input.poll(this.humans>=2);
  const pk=this.pk,at=pk.turn%2,defender=1-at,cy=(WORLD.goalTop+WORLD.goalBottom)/2,attackSign=pk.attackSign===-1?-1:1,spot=Number.isFinite(pk.spotX)?pk.spotX:F.x+F.w*.76,goalX=Number.isFinite(pk.goalX)?pk.goalX:F.x+F.w;
  const controlledShooter=this.inControl(at),shooter=controlledShooter?this.input.state[at]||{}:null;
  // Local two-player Versus: the defending human owns their keeper. Solo keeps the
  // existing committed CPU guess; goalkeeper control never steals the shooter input.
  const keeper=this.humans>=2&&this.inControl(defender)?this.input.state[defender]||{}:null;
  pk.diveBoost=Math.max(0,(pk.diveBoost||0)-dt);pk.diveCooldown=Math.max(0,(pk.diveCooldown||0)-dt);
  if(pk.ready>0){pk.ready-=dt;return}
  if(pk.shotTimer>0){
   pk.shotTimer-=dt;let fraction=clamp(1-pk.shotTimer/pk.shotMax,0,1);
   pk.ballX=pk.startX+(goalX-pk.startX)*fraction;
   pk.ballY=pk.startY+(pk.shotTargetY-pk.startY)*fraction;
   if(keeper){if(this.input.just(defender,'jump')&&pk.diveCooldown<=0){pk.diveBoost=.38;pk.diveCooldown=.8;this.emit('penaltyDive',{team:defender});}pk.saveY=clamp(pk.saveY+clamp(Number(keeper.y)||0,-1,1)*(pk.diveBoost>0?550:240)*dt,WORLD.goalTop+10,WORLD.goalBottom-10)}
   else { /* v0.8.24.10: keep the goalkeeper's shot-time commitment; no omniscient mid-flight tracking. */ }
   if(pk.shotTimer<=0){
    const success=Math.abs(pk.shotTargetY-pk.saveY)>31;
    pk.kicks[at].push(success);this.emit('penaltyKick',{team:at,goal:success});pk.turn++;
    if([0,1].includes(pk.inMatchTeam)){
     const conceded=1-at;
     if(success){
      const taker=this.rosters[at]?.[this.teamPlans[at]?.penalty??4]||this.player(at,4)?.src;
      this.score[at]++;this.goalHero=taker?.name||this.getTeam(at).name;this.pendingKickoff={scorer:at,hero:this.goalHero};
      this.celebration=3.3;this.onGoalMorale(at);this.ball.owner=null;this.ball.shot=null;this.ball.strike=null;
      this.ball.vx=this.ball.vy=this.ball.vz=0;this.emit('goal',{team:at,hero:this.goalHero,score:this.score.slice(),penalty:true});this.cooldown=3.3;
     }else{
      const keeper=this.player(conceded,0);if(keeper)this.take(keeper);
      this.cooldown=Math.max(this.cooldown||0,.45);
     }
     this.emit('matchPenaltyResolved',{team:at,goal:success});this.pk=null;this.matchState='play';return;
    }
    const totals=pk.kicks.map(a=>a.filter(Boolean).length),remaining=pk.kicks.map(a=>Math.max(0,5-a.length));
    // First five: allow a mathematically clinched shootout. After five,
    // sudden-death must finish a COMPLETE pair of attempts before deciding.
    const n0=pk.kicks[0].length,n1=pk.kicks[1].length;
    const clinchedWithinFive=n0<=5&&n1<=5&&(totals[0]>totals[1]+remaining[1]||totals[1]>totals[0]+remaining[0]);
    const completedSuddenDeathPair=n0>=5&&n1>=5&&n0===n1&&totals[0]!==totals[1];
    const canDecide=clinchedWithinFive||completedSuddenDeathPair;
    if(canDecide){this.matchState='finished';const score=pk.afterDraw?this.score.slice():totals.slice();if(!pk.afterDraw)this.score=totals.slice();this.emit('finished',{score,penalties:true,pkScore:totals,winner:totals[0]>totals[1]?0:1});return}
    pk.shotTimer=0;pk.ready=1.25;pk.timer=8;pk.aim=cy;pk.saveY=cy;pk.ballY=cy;pk.ballX=spot;pk.startX=spot;pk.startY=cy;pk.dribbles=0;pk.diveBoost=0;pk.diveCooldown=0;pk.stage='ready';
   }return;
  }
  pk.timer-=dt;
  // The penalty taker can move with the ball before committing to the kick.
  // The position remains near the mark; the dribble button performs a short feint.
  if(controlledShooter){
   const steerX=Number(shooter.x)||0,steerY=Number(shooter.y)||0;
   const minX=spot+(attackSign>0?-86:-150),maxX=spot+(attackSign>0?150:86);
   pk.ballX=clamp(pk.ballX+steerX*140*dt,minX,maxX);
   pk.ballY=clamp(pk.ballY+steerY*140*dt,cy-135,cy+135);
   if(this.input.just(at,'dribble')&&pk.dribbles<3){pk.dribbles++;pk.ballX=clamp(pk.ballX+attackSign*28,minX,maxX);pk.ballY=clamp(pk.ballY+(steerY||((pk.dribbles%2)?1:-1))*13,cy-135,cy+135);this.emit('penaltyDribble',{team:at,count:pk.dribbles});}
  }else {const minX=spot+(attackSign>0?0:-115),maxX=spot+(attackSign>0?115:0);pk.ballX=clamp(pk.ballX+attackSign*45*dt,minX,maxX);pk.ballY=clamp(pk.ballY+Math.sin(pk.timer*3.7)*11*dt,cy-75,cy+75);}
  if(keeper&&this.input.just(defender,'jump')&&pk.diveCooldown<=0){pk.diveBoost=.38;pk.diveCooldown=.8;this.emit('penaltyDive',{team:defender});}
  if(controlledShooter)pk.aim=clamp(pk.aim+(shooter.y||0)*100*dt,WORLD.goalTop+9,WORLD.goalBottom-9);
  else pk.aim=clamp(pk.aim+(Math.sin(pk.timer*2.3)*110)*dt,WORLD.goalTop+9,WORLD.goalBottom-9);
  if(keeper)pk.saveY=clamp(pk.saveY+clamp(Number(keeper.y)||0,-1,1)*(pk.diveBoost>0?440:175)*dt,WORLD.goalTop+9,WORLD.goalBottom-9);
  if(!controlledShooter&&pk.timer<6.2||controlledShooter&&(this.input.just(at,'shoot'))||pk.timer<=0){
   const brain=aiTuning(this.options.difficulty??2);
   const aimBand=40+brain.id*14;
   const taker=this.rosters[at][this.teamPlans[at]?.penalty??4]||this.player(at,4)?.src;const error=(100-(taker?.shootAccuracy||65))*.33;pk.shotTargetY=controlledShooter?clamp(pk.aim+randomBetween(-error,error),WORLD.goalTop+10,WORLD.goalBottom-10):clamp(cy+randomBetween(-aimBand,aimBand)+randomBetween(-error,error),WORLD.goalTop+10,WORLD.goalBottom-10);
   // An expert CPU keeper reads the shooter; Rookie guesses farther away.
   // Commit the keeper BEFORE the ball travels. The observed shooter aim is a
   // hint, not the precise shot target: previously the keeper always knew the
   // actual random target and some high-rated keepers had miss<31, giving a
   // guaranteed save on *every* penalty and potentially infinite sudden death.
   // This fix affects only shootout reads, not regular goalkeeper/shot physics.
   if(!keeper){const gk=this.player(defender,0),skill=stat(gk,'gkSkill');const miss=Math.max(48,95-skill*.65-brain.keeperRead*32);pk.saveY=clamp(pk.aim+randomBetween(-miss,miss),WORLD.goalTop+10,WORLD.goalBottom-10)}
   pk.startX=pk.ballX;pk.startY=pk.ballY;pk.shotTimer=pk.shotMax;pk.stage='shooting';this.burst(pk.ballX,pk.ballY,'#ffe284',10)
  }
 }
 reactToMagicWall(p){
  if(!p||p.keeper||!['DF','MF','FW'].includes(p.src?.role)||p.stun>0||p.z>=20||
   (p.action==='slide'&&p.actionTimer>0)||(p.action==='jump'&&p.actionTimer>0)||
   this.ball.owner===p||p.cd>0||p.fatigue>=.98)return false;
  const stamina=stat(p,'stamina'),breath=p.breath??breathCapacity(stamina);
  if(breath<2)return false;
  const direction=p.t===0?1:-1;
  const running=Math.hypot(p.moveVX||0,p.moveVY||0)>this.playerSpeed(p)*.65||p.dashTimer>0||p.sprintCharge>.1;
  const slideReach=(running?148:104)*(.5+.5*(stat(p,'defence')-1)/99);
  const walls=(this.magicWalls||[]).filter(w=>w&&w.team!==p.t&&
   Object.hasOwn(DEFENCE_WALL_MIN_LEVEL,w.id)&&Number(w.level)>=DEFENCE_WALL_MIN_LEVEL[w.id]&&
   w.duration>0&&Math.abs(p.y-w.y)<=w.halfLength+20)
   .map(w=>({wall:w,gap:(w.x-p.x)*direction}))
   .filter(item=>item.gap>=-item.wall.thickness-18&&item.gap<=slideReach+item.wall.thickness+12)
   .sort((a,b)=>Math.abs(a.gap)-Math.abs(b.gap));
  for(const {wall} of walls){
   // Preserve ordinary AI tackles against an immediate player threat. The wall
   // response uses the same grounded SHOOT-slide and its normal resource cost.
   const enemyOwner=this.ball.owner?.t!==p.t?this.ball.owner:null;
   const opponents=this.players.filter(q=>q.t!==p.t&&!q.keeper&&q.stun<=0);
   if(opponents.some(q=>distance(p,q)<68))continue;
   const target=enemyOwner&&distance(p,enemyOwner)<280?enemyOwner:
    opponents.sort((a,b)=>distance(p,a)-distance(p,b))[0];
   if(target&&(target.x-p.x)*direction<=0)continue;
   if(target&&Math.abs(target.y-p.y)>Math.max(120,Math.abs(target.x-p.x)*.8))continue;
   p.face=direction;
   if(Math.abs(p.dx||0)<.05)p.dx=direction;
   return this.tackle(p,true);
  }
  return false;
 }
}
return {GameEngine,WORLD};})();
// v0.8.25: BPW character-specific animation profiles. Editorial arcade gestures, not historical motion capture.
// Opt in ONLY for BPW historicalPersonKey entries. Cosmetic rendering only: no simulation, stats or save mutations.

export {ENGINE};
