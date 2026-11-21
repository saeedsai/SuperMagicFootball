// Supermagic Football v0.8.25.30 | AI | independently editable module
import {GAME_ASSETS} from "../assets.js";
import {SHOTFEEL} from "./shotfeel.js";
const AI=(()=>{// Five behaviour profiles. These affect COMPUTER opponents only; human controls and
// teammate assistants keep the baseline Normal profile. Tunable without changing match code.
const AI_LEVELS=GAME_ASSETS.mechanics.aiLevels;
function aiTuning(value) {
  // Only numeric values and non-empty numeric strings are valid settings.
  // Number(null), Number(false), and Number('') all become zero, which would
  // silently turn missing/corrupt settings into the easiest CPU profile.
  const index = typeof value === 'number' ? value :
    typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return AI_LEVELS[Number.isFinite(index) ? Math.max(0,Math.min(4,Math.trunc(index))) : 2];
}


// Assign the closest available AI player as primary presser. A player already
// committed to a slide, knockdown or recovery cannot press this frame; skip them
// before choosing both the primary and cover defender.
 // Select a second defender for cover, not another chase run down the same side.
// The support search is strictly local (<= 110 field units beyond the nearest
// eligible support) so it never pulls a distant defender out of formation.
// Stable input order breaks ties; no randomness, time state or save mutation.
function defensivePressers(players,team,target,humanControlled=null){
 if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y)||!Array.isArray(players))
  return {primary:null,support:null};
 const candidates=players.filter(p=>p&&p.t===team&&!p.keeper&&p!==humanControlled&&
   p.stun<=0&&!p.down&&!(Number(p.slideTimer)>0)&&
   !(Number(p.shotImpactKnockdownPending)>0)&&
   !(Number(p.shotImpactKnockdownTimer)>0)&&
   !(Number(p.shotImpactRiseTimer)>0)&&
   Number.isFinite(p.x)&&Number.isFinite(p.y))
  .map((p,index)=>({p,index,d:Math.hypot(p.x-target.x,p.y-target.y)}))
  .sort((a,b)=>a.d-b.d||a.index-b.index);
 const primary=candidates[0]?.p||null;
 if(candidates.length<2)return {primary,support:null};
 const nearest=candidates[1].d;
 let chosen=candidates[1],best=Infinity;
 for(const candidate of candidates.slice(1)){
  if(candidate.d>nearest+110)break;
  const q=candidate.p;
  const primarySide=primary.y-target.y,coverSide=q.y-target.y;
  const sameSide=Math.abs(primarySide)>25&&Math.abs(coverSide)>25&&primarySide*coverSide>0;
  const lateralGap=Math.abs(q.y-primary.y);
  const goalSide=team===0?q.x<=target.x:q.x>=target.x;
  const score=candidate.d+(sameSide?75:0)+Math.max(0,65-lateralGap)*.4-(goalSide?12:0);
  if(score<best-1e-9){best=score;chosen=candidate;}
 }
 return {primary,support:chosen.p};
}


 // Choose one active AI teammate to make a forward diagonal support run when
 // this team has the ball. Score both lateral lanes by travel distance, live
 // defender pressure and teammate crowding; stable input order breaks ties.
function attackingSupportRun(players,team,carrier,humanControlled=null,bounds=null){
 if(!Array.isArray(players)||!carrier||(team!==0&&team!==1)||carrier.t!==team||
  !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||!bounds||typeof bounds!=='object')return null;
 const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const movementVelocity=(player,axis)=>{
  const actual=axis==='x'?player?.moveVX:player?.moveVY;
  if(Number.isFinite(actual))return actual;
  const legacy=axis==='x'?player?.vx:player?.vy;
  return Number.isFinite(legacy)?legacy:0;
 };
 const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
 const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
 const active=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&!p.down&&
  timerClear(p.stun)&&timerClear(p.slideTimer)&&timerClear(p.shotImpactKnockdownPending)&&
  timerClear(p.shotImpactKnockdownTimer)&&timerClear(p.shotImpactRiseTimer)&&grounded(p);
 const allies=players.filter(p=>active(p)&&p.t===team&&p!==carrier&&!p.keeper);
 const candidates=allies.filter(p=>p!==humanControlled&&!p.aiAssistTarget);
 if(!candidates.length)return null;
 const defenders=players.filter(p=>active(p)&&p.t===1-team&&!p.keeper);
 const dir=team===0?1:-1;
 const targetX=clampTo(carrier.x+dir*160,xMin,xMax);
 if(dir*(targetX-carrier.x)<40)return null;
 const pointSegmentDistance=(point,start,end)=>{
  const dx=end.x-start.x,dy=end.y-start.y,length=dx*dx+dy*dy;
  const along=length>0?clampTo(((point.x-start.x)*dx+(point.y-start.y)*dy)/length,0,1):0;
  return Math.hypot(point.x-(start.x+dx*along),point.y-(start.y+dy*along));
 };
 let best=null;
 for(const p of candidates){
  for(const side of [-1,1]){
   const targetY=clampTo(carrier.y+side*112,yMin,yMax);
   if(Math.abs(targetY-carrier.y)<60)continue;
   const target={x:targetX,y:targetY};
   const pathLength=Math.hypot(target.x-p.x,target.y-p.y);
   const defenderLookahead=clampTo(pathLength/360,.12,.45);
   let corridorPressure=0,arrivalPressure=0,teammateCrowding=0;
   for(const defender of defenders){
    // Score where a moving defender is likely to be when the runner reaches this lane.
    const vx=movementVelocity(defender,'x'),vy=movementVelocity(defender,'y');
    const moving=Math.hypot(vx,vy)>35;
    const threat=moving?{
     x:defender.x+clampTo(vx*defenderLookahead,-100,100),
     y:defender.y+clampTo(vy*defenderLookahead,-100,100)
    }:defender;
    const corridor=pointSegmentDistance(threat,p,target);
    if(corridor<92)corridorPressure+=(92-corridor)/92;
    const arrival=Math.hypot(threat.x-target.x,threat.y-target.y);
    if(arrival<145)arrivalPressure+=(145-arrival)/145;
   }
   for(const teammate of allies){
    if(teammate===p)continue;
    const crowding=Math.hypot(teammate.x-target.x,teammate.y-target.y);
    if(crowding<115)teammateCrowding+=(115-crowding)/115;
   }
   const homeLanePenalty=Number.isFinite(p.homeY)?Math.abs(targetY-p.homeY)*.08:0;
   const score=pathLength+corridorPressure*105+arrivalPressure*65+teammateCrowding*52+homeLanePenalty;
   if(!best||score<best.score-1e-9)best={runner:p,target,score};
  }
 }
 return best?{runner:best.runner,target:best.target}:null;
}


 
// Prefer a completed, genuinely open support run when the carrier chooses an AI
// pass. The runner must already have entered its lane; a blocked corridor or a
// defender waiting at the receiving point keeps the existing pass selection.
function attackingSupportPass(players,team,carrier,supportRun){
 if(!Array.isArray(players)||!carrier||(team!==0&&team!==1)||carrier.t!==team||
  !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y))return null;
 const runner=supportRun?.runner,point=supportRun?.target;
 if(!runner||!point||!players.includes(runner)||runner===carrier||runner.t!==team||runner.keeper||
  !Number.isFinite(runner.x)||!Number.isFinite(runner.y)||
  !Number.isFinite(point.x)||!Number.isFinite(point.y))return null;
 const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
 const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
 const ready=p=>p&&!p.down&&timerClear(p.stun)&&timerClear(p.slideTimer)&&
  timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
  timerClear(p.shotImpactRiseTimer)&&grounded(p)&&
  !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
  !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&
  p.action!=='shotDown'&&p.action!=='shotGetUp';
 if(!ready(carrier)||!ready(runner)||runner.aiAssistTarget)return null;
 const dir=team===0?1:-1,dx=runner.x-carrier.x,dy=runner.y-carrier.y;
 const forward=dx*dir,range=Math.hypot(dx,dy);
 if(forward<80||forward>760||range<120||range>900||
  Math.hypot(point.x-runner.x,point.y-runner.y)>145)return null;
 const segment=dx*dx+dy*dy;
 if(!Number.isFinite(segment)||segment<=0)return null;
 const arrivalSeconds=Math.min(.35,Math.max(.12,range/1400));
 const eligibleDefenders=[];
 for(const defender of players){
  if(!defender||defender.t===team||!Number.isFinite(defender.x)||!Number.isFinite(defender.y))continue;
  if(defender.down||defender.action==='shotDown'||defender.action==='shotGetUp'||
   !timerClear(defender.shotImpactKnockdownPending)||
   !timerClear(defender.shotImpactKnockdownTimer)||
   !timerClear(defender.shotImpactRiseTimer)||!grounded(defender))continue;
  const stun=defender.stun==null?0:Number(defender.stun);
  if(!Number.isFinite(stun)||stun>arrivalSeconds)continue;
  eligibleDefenders.push(defender);
 }
 // A defender moving into the lane can intercept after the current snapshot.
 // Reuse directed PASS's bounded, time-aware prediction and swept-crossing read;
 // only strong projected pressure cancels the support-run preference.
 if(SHOTFEEL.passingLanePressure(carrier,runner,eligibleDefenders)>=.10)return null;
 for(const defender of eligibleDefenders){
  const along=((defender.x-carrier.x)*dx+(defender.y-carrier.y)*dy)/segment;
  if(along>.08&&along<.94){
   const gap=Math.hypot(defender.x-(carrier.x+dx*along),defender.y-(carrier.y+dy*along));
   if(gap<56)return null;
  }
  if(Math.hypot(defender.x-runner.x,defender.y-runner.y)<84)return null;
 }
 return runner;
}

 // Lead an actively advancing support runner into the space ahead of their lane.
 // This is intentionally earlier than attackingSupportPass's arrived-runner rule:
 // the receiver must be moving toward the point, and both the flight corridor and
 // the predicted collection pocket must remain clear.
 function attackingThroughBall(players,team,carrier,supportRun){
  if(!Array.isArray(players)||!carrier||(team!==0&&team!==1)||carrier.t!==team||
   !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y))return null;
  const runner=supportRun?.runner,point=supportRun?.target;
  if(!runner||!point||!players.includes(runner)||runner===carrier||runner.t!==team||runner.keeper||
   !Number.isFinite(runner.x)||!Number.isFinite(runner.y)||
   !Number.isFinite(point.x)||!Number.isFinite(point.y))return null;
  const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
  const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
  const ready=p=>p&&!p.down&&timerClear(p.stun)&&timerClear(p.slideTimer)&&
   timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
   timerClear(p.shotImpactRiseTimer)&&grounded(p)&&
   !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
   !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&
   p.action!=='shotDown'&&p.action!=='shotGetUp';
  if(!ready(carrier)||!ready(runner)||runner.aiAssistTarget)return null;
  const dir=team===0?1:-1;
  const forward=(runner.x-carrier.x)*dir;
  const range=Math.hypot(runner.x-carrier.x,runner.y-carrier.y);
  const dx=point.x-runner.x,dy=point.y-runner.y,gap=Math.hypot(dx,dy);
  if(forward<90||forward>760||range<90||range>880||gap<118||gap>280)return null;
  const vx=movementVelocity(runner,'x'),vy=movementVelocity(runner,'y');
  const runSpeed=(vx*dx+vy*dy)/gap;
  if(!Number.isFinite(runSpeed)||runSpeed<110||vx*dir<65)return null;
  const leadDistance=clamp(Math.min(gap-16,runSpeed*.28),48,100);
  const target={x:runner.x+dx/gap*leadDistance,y:runner.y+dy/gap*leadDistance};
  const passDistance=Math.hypot(target.x-carrier.x,target.y-carrier.y);
  if(passDistance<110||passDistance>920)return null;
  const arrivalSeconds=clamp(passDistance/1400,.12,.35);
  const defenders=[];
  for(const defender of players){
   if(!defender||defender.t===team||!Number.isFinite(defender.x)||!Number.isFinite(defender.y))continue;
   if(defender.down||defender.action==='shotDown'||defender.action==='shotGetUp'||
    !timerClear(defender.shotImpactKnockdownPending)||
    !timerClear(defender.shotImpactKnockdownTimer)||
    !timerClear(defender.shotImpactRiseTimer)||!grounded(defender))continue;
   const stun=defender.stun==null?0:Number(defender.stun);
   if(!Number.isFinite(stun)||stun>arrivalSeconds)continue;
   defenders.push(defender);
  }
  if(SHOTFEEL.passingLanePressure(carrier,target,defenders)>=.10)return null;
  for(const defender of defenders){
   const futureX=defender.x+clamp(movementVelocity(defender,'x')*arrivalSeconds,-65,65);
   const futureY=defender.y+clamp(movementVelocity(defender,'y')*arrivalSeconds,-65,65);
   if(Math.hypot(futureX-target.x,futureY-target.y)<84)return null;
  }
  return {runner,target};
 }

return {AI_LEVELS,aiTuning,defensivePressers,attackingSupportRun,attackingSupportPass,attackingThroughBall};})();

export {AI};
