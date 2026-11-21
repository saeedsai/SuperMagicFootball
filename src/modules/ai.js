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

// When the opponent attacks from a wide final-third byline, reserve the second
// defender for the central cutback lane instead of mirroring the primary press.
// The point stays behind the carrier in the opponent's attack direction and
// moves a bounded portion of the way toward the pitch centre.
function defensiveCutbackCoverTarget(team,carrier,bounds,players=null){
 if((team!==0&&team!==1)||!carrier||carrier.t!==1-team||carrier.keeper||
  !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||!bounds||typeof bounds!=='object')return null;
 const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const height=yMax-yMin,centerY=(yMin+yMax)/2;
 const attackDir=carrier.t===0?1:-1;
 const goalGap=attackDir===1?xMax-carrier.x:carrier.x-xMin;
 if(goalGap<30||goalGap>320||Math.abs(carrier.y-centerY)<height*.24||
  carrier.down||Number(carrier.stun)>0||
  (Number.isFinite(carrier.z)&&carrier.z>18)||
  carrier.action==='shotDown'||carrier.action==='shotGetUp')return null;
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
 let receiver=null,receiverScore=Infinity;
 if(Array.isArray(players)){
  for(const runner of players){
   if(!runner||runner===carrier||runner.t!==carrier.t||runner.keeper||
    !Number.isFinite(runner.x)||!Number.isFinite(runner.y)||runner.down||
    !timerClear(runner.stun)||!timerClear(runner.slideTimer)||
    !timerClear(runner.shotImpactKnockdownPending)||
    !timerClear(runner.shotImpactKnockdownTimer)||!timerClear(runner.shotImpactRiseTimer)||
    runner.action==='shotDown'||runner.action==='shotGetUp'||
    ((runner.action==='slide'||runner.action==='hurt')&&(Number(runner.actionTimer)||0)>0))continue;
   const z=runner.z==null?0:Number(runner.z);
   if(!Number.isFinite(z)||z>18)continue;
   const behind=(runner.x-carrier.x)*attackDir;
   const depth=attackDir===1?xMax-runner.x:runner.x-xMin;
   if(behind>-45||behind< -320||depth<80||depth>430||
    Math.abs(runner.y-centerY)>height*.24)continue;
   const vx=Number.isFinite(runner.moveVX)?runner.moveVX:
    Number.isFinite(runner.vx)?runner.vx:0;
   const vy=Number.isFinite(runner.moveVY)?runner.moveVY:
    Number.isFinite(runner.vy)?runner.vy:0;
   const projectedX=runner.x+clampTo(vx*.12,-18,18);
   const projectedY=runner.y+clampTo(vy*.12,-18,18);
   const projectedBehind=(projectedX-carrier.x)*attackDir;
   const projectedDepth=attackDir===1?xMax-projectedX:projectedX-xMin;
   if(projectedBehind>-20||projectedDepth<80||projectedDepth>430)continue;
   const score=Math.abs(projectedY-centerY)*.7+
    Math.abs(projectedBehind+150)*.22+Math.abs(projectedDepth-260)*.08;
   if(score<receiverScore-1e-9){
    receiverScore=score;receiver={behind:projectedBehind,y:projectedY};
   }
  }
 }
 if(receiver){
  // Screen the actual receiver's predicted lane, not an abstract centre point.
  // The retreat remains between 48 and 110 units behind the carrier.
  const retreat=clampTo(-receiver.behind*.62,48,110);
  return {
   x:clampTo(carrier.x-attackDir*retreat,xMin+22,xMax-22),
   y:clampTo(carrier.y+(receiver.y-carrier.y)*.62,yMin+23,yMax-23)
  };
 }
 // Preserve the original central fallback when no eligible cutback runner exists.
 return {
  x:clampTo(carrier.x-attackDir*110,xMin+22,xMax-22),
  y:clampTo(carrier.y+(centerY-carrier.y)*.62,yMin+23,yMax-23)
 };
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
  const clampValue=(value,min,max)=>Math.max(min,Math.min(max,value));
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
  const movementVelocity=(player,axis)=>{
   const actual=axis==='x'?player?.moveVX:player?.moveVY;
   if(Number.isFinite(actual))return actual;
   const legacy=axis==='x'?player?.vx:player?.vy;
   return Number.isFinite(legacy)?legacy:0;
  };
  const vx=movementVelocity(runner,'x'),vy=movementVelocity(runner,'y');
  const runSpeed=(vx*dx+vy*dy)/gap;
  if(!Number.isFinite(runSpeed)||runSpeed<110||vx*dir<65)return null;
  const leadDistance=clampValue(Math.min(gap-16,runSpeed*.28),48,100);
  const target={x:runner.x+dx/gap*leadDistance,y:runner.y+dy/gap*leadDistance};
  const passDistance=Math.hypot(target.x-carrier.x,target.y-carrier.y);
  if(passDistance<110||passDistance>920)return null;
  const arrivalSeconds=clampValue(passDistance/1400,.12,.35);
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
   const futureX=defender.x+clampValue(movementVelocity(defender,'x')*arrivalSeconds,-65,65);
   const futureY=defender.y+clampValue(movementVelocity(defender,'y')*arrivalSeconds,-65,65);
   if(Math.hypot(futureX-target.x,futureY-target.y)<84)return null;
  }
  return {runner,target};
 }


 // Prefer a low, driven cutback when an AI carrier reaches a wide channel near
 // the byline. The receiver must be central and slightly behind the carrier;
 // grounded defenders projected into the pass corridor or collection pocket
 // cancel the preference so ordinary receiver ranking remains the fallback.
 function attackingCutbackPass(players,team,carrier,humanControlled=null,bounds=null){
  if(!Array.isArray(players)||!carrier||!players.includes(carrier)||
   (team!==0&&team!==1)||carrier.t!==team||!bounds||typeof bounds!=='object'||
   !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y))return null;
  const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  const height=yMax-yMin,centerY=(yMin+yMax)/2,dir=team===0?1:-1;
  const goalGap=dir===1?xMax-carrier.x:carrier.x-xMin;
  if(goalGap<30||goalGap>300||Math.abs(carrier.y-centerY)<height*.24)return null;
  const clampValue=(value,min,max)=>Math.max(min,Math.min(max,value));
  const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
  const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
  const ready=p=>p&&!p.down&&timerClear(p.stun)&&timerClear(p.slideTimer)&&
   timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
   timerClear(p.shotImpactRiseTimer)&&grounded(p)&&
   !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
   !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&
   p.action!=='shotDown'&&p.action!=='shotGetUp';
  if(!ready(carrier))return null;
  const movementVelocity=(player,axis)=>{
   const actual=axis==='x'?player?.moveVX:player?.moveVY;
   if(Number.isFinite(actual))return actual;
   const legacy=axis==='x'?player?.vx:player?.vy;
   return Number.isFinite(legacy)?legacy:0;
  };
  const activeDefender=p=>{
   // A goalkeeper can step into the driven cutback lane or claim its collection pocket.
   if(!p||p.t===team||p.down||!Number.isFinite(p.x)||!Number.isFinite(p.y)||
    !timerClear(p.slideTimer)||!timerClear(p.shotImpactKnockdownPending)||
    !timerClear(p.shotImpactKnockdownTimer)||!timerClear(p.shotImpactRiseTimer)||
    !grounded(p)||p.action==='shotDown'||p.action==='shotGetUp'||
    (p.action==='slide'&&(Number(p.actionTimer)||0)>0)||
    (p.action==='hurt'&&(Number(p.actionTimer)||0)>0))return false;
   const stun=p.stun==null?0:Number(p.stun);
   return Number.isFinite(stun)&&stun<=.24;
  };
  const defenders=players.filter(activeDefender);
  let best=null;
  for(const runner of players){
   if(!runner||runner.t!==team||runner===carrier||runner===humanControlled||runner.keeper||
    runner.aiAssistTarget||!ready(runner))continue;
   const vx=movementVelocity(runner,'x'),vy=movementVelocity(runner,'y');
   if(vx*dir< -120)continue;
   const target={x:runner.x+clampValue(vx*.10,-24,24),
    y:runner.y+clampValue(vy*.10,-24,24)};
   if(target.x<xMin+18||target.x>xMax-18||target.y<yMin+18||target.y>yMax-18)continue;
   const behind=(carrier.x-target.x)*dir,centerOffset=Math.abs(target.y-centerY);
   const range=Math.hypot(target.x-carrier.x,target.y-carrier.y);
   if(behind<25||behind>270||centerOffset>height*.22||range<90||range>360)continue;
   const arrivalSeconds=clampValue(range/1500,.10,.24);
   const available=defenders.filter(p=>p.stun==null||Number(p.stun)<=arrivalSeconds);
   if(SHOTFEEL.passingLanePressure(carrier,target,available)>=.12)continue;
   let pocketBlocked=false,nearestMarkGap=Infinity;
   for(const defender of available){
    const futureX=defender.x+clampValue(movementVelocity(defender,'x')*arrivalSeconds,-55,55);
    const futureY=defender.y+clampValue(movementVelocity(defender,'y')*arrivalSeconds,-55,55);
    const gap=Math.hypot(futureX-target.x,futureY-target.y);
    nearestMarkGap=Math.min(nearestMarkGap,gap);
    if(gap<74){pocketBlocked=true;break;}
   }
   if(pocketBlocked)continue;
   // Among safe cutback options, prefer the runner with more separation at
   // collection time. Keep this a bounded tiebreaker: distance and centrality
   // still matter, and an unmarked defence adds no penalty.
   const markingPenalty=Math.min(42,Math.max(0,190-nearestMarkGap)*.36);
   const score=range+centerOffset*.35+Math.max(0,65-vx*dir)*.08+markingPenalty;
   if(!best||score<best.score-1e-9)best={runner,target,score};
  }
  return best?{runner:best.runner,target:best.target}:null;
 }

return {AI_LEVELS,aiTuning,defensivePressers,defensiveCutbackCoverTarget,attackingSupportRun,attackingSupportPass,attackingThroughBall,attackingCutbackPass};})();

export {AI};
