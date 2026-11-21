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

// Use the existing SHOOT slide only when its run-up can intercept an escaping
// or laterally crossing carrier. A close carrier moving into the defender is
// better met with the cheaper, shorter PASS poke. This is a style decision only:
// the caller still owns the difficulty-scaled tackle-attempt probability.
function defensiveTackleSlide(defender,carrier,baseSpeed=0){
 if(!defender||!carrier||defender===carrier||defender.t===carrier.t||
  defender.keeper||carrier.keeper||carrier.down||
  !Number.isFinite(defender.x)||!Number.isFinite(defender.y)||
  !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||
  Number(carrier.stun)>0||Number(carrier.invuln)>0||
  carrier.action==='shotDown'||carrier.action==='shotGetUp'||
  (carrier.z!=null&&(!Number.isFinite(Number(carrier.z))||Number(carrier.z)>=20)))return false;
 const dx=carrier.x-defender.x,dy=carrier.y-defender.y,range=Math.hypot(dx,dy);
 if(range<48||range>74)return false;
 const velocity=(player,axis)=>{
  const actual=axis==='x'?player.moveVX:player.moveVY;
  if(Number.isFinite(actual))return actual;
  const legacy=axis==='x'?player.vx:player.vy;
  return Number.isFinite(legacy)?legacy:0;
 };
 const defenderVX=velocity(defender,'x'),defenderVY=velocity(defender,'y');
 const carrierVX=velocity(carrier,'x'),carrierVY=velocity(carrier,'y');
 const speedFloor=Number.isFinite(baseSpeed)&&baseSpeed>0?baseSpeed*.65:120;
 const runUp=Math.hypot(defenderVX,defenderVY)>speedFloor||
  Number(defender.dashTimer)>0||Number(defender.sprintCharge)>.1;
 if(!runUp)return false;
 const ux=dx/range,uy=dy/range;
 const relativeX=carrierVX-defenderVX,relativeY=carrierVY-defenderVY;
 const escaping=relativeX*ux+relativeY*uy;
 const crossing=Math.abs(relativeX*(-uy)+relativeY*ux);
 return escaping>45||(crossing>105&&escaping>-100);
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
 const candidates=allies.filter(p=>p!==humanControlled&&!p.aiAssistTarget&&!p.aiGiveAndGoRun);
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

 
// In the final third, offer a low square pass when a central teammate is
// materially closer to goal and the projected ground-pass lane is safe.
function attackingGoalmouthPass(players,team,carrier,bounds){
 if(!Array.isArray(players)||!carrier||!players.includes(carrier)||
  (team!==0&&team!==1)||carrier.t!==team||!Number.isFinite(carrier.x)||
  !Number.isFinite(carrier.y)||!bounds||typeof bounds!=='object')return null;
 const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const dir=team===0?1:-1,goalX=team===0?xMax:xMin,goalY=(yMin+yMax)/2;
 const carrierGoalGap=(goalX-carrier.x)*dir;
 if(carrierGoalGap<80||carrierGoalGap>620)return null;
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
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
 const defenders=players.filter(p=>p&&p.t!==team&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&
  !p.down&&timerClear(p.shotImpactKnockdownPending)&&
  timerClear(p.shotImpactKnockdownTimer)&&timerClear(p.shotImpactRiseTimer)&&
  grounded(p)&&p.action!=='shotDown'&&p.action!=='shotGetUp');
 let best=null;
 for(const runner of players){
  if(!runner||runner===carrier||runner.t!==team||runner.keeper||runner.aiAssistTarget||
   !Number.isFinite(runner.x)||!Number.isFinite(runner.y)||!ready(runner))continue;
  // Lead only a short step toward the receiver's actual movement, never an
  // unbounded prediction that could turn a square pass into a blind through ball.
  const target={
   x:clampTo(runner.x+clampTo(movementVelocity(runner,'x')*.12,-24,24),xMin+22,xMax-22),
   y:clampTo(runner.y+clampTo(movementVelocity(runner,'y')*.12,-24,24),yMin+23,yMax-23)
  };
  const forward=(target.x-carrier.x)*dir,goalGap=(goalX-target.x)*dir;
  const centerOffset=Math.abs(target.y-goalY),range=Math.hypot(target.x-carrier.x,target.y-carrier.y);
  if(forward<65||forward>460||goalGap<45||goalGap>carrierGoalGap-65||
   range<100||range>540||centerOffset>(yMax-yMin)*.29)continue;
  const arrival=clampTo(range/1450,.10,.32);
  const activeDefenders=defenders.filter(defender=>{
   const stun=defender.stun==null?0:Number(defender.stun);
   return Number.isFinite(stun)&&stun<=arrival;
  });
  if(SHOTFEEL.passingLanePressure(carrier,target,activeDefenders)>=.10)continue;
  let nearestMarkGap=Infinity,blocked=false;
  const dx=target.x-carrier.x,dy=target.y-carrier.y,segment=dx*dx+dy*dy;
  for(const defender of activeDefenders){
   const futureX=defender.x+clampTo(movementVelocity(defender,'x')*arrival,-65,65);
   const futureY=defender.y+clampTo(movementVelocity(defender,'y')*arrival,-65,65);
   const gap=Math.hypot(futureX-target.x,futureY-target.y);
   nearestMarkGap=Math.min(nearestMarkGap,gap);
   if(gap<68){blocked=true;break;}
   const along=((futureX-carrier.x)*dx+(futureY-carrier.y)*dy)/segment;
   if(along>.05&&along<.95){
    const lateral=Math.hypot(futureX-(carrier.x+dx*along),futureY-(carrier.y+dy*along));
    if(lateral<48){blocked=true;break;}
   }
  }
  if(blocked)continue;
  // Goal proximity leads the choice; range, centrality and marking keep it
  // from forcing a risky or needlessly long pass into a crowded pocket.
  const markingPenalty=Math.min(52,Math.max(0,170-nearestMarkGap)*.46);
  const score=goalGap*.58+range*.26+centerOffset*.16+markingPenalty;
  if(!best||score<best.score-1e-9)best={runner,target,score};
 }
 return best?{runner:best.runner,target:best.target}:null;
}

// After a CPU goalmouth square pass, send the passer beyond the receiver into a
// bounded return lane. The caller stores this as a short-lived runtime intent only.
function attackingGiveAndGoRun(players,team,passer,receiver,bounds){
 if(!Array.isArray(players)||!players.includes(passer)||!players.includes(receiver)||
  (team!==0&&team!==1)||passer===receiver||passer.t!==team||receiver.t!==team||
  passer.keeper||receiver.keeper||!Number.isFinite(passer.x)||!Number.isFinite(passer.y)||
  !Number.isFinite(receiver.x)||!Number.isFinite(receiver.y)||!bounds||typeof bounds!=='object')return null;
 const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
 const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
 const ready=p=>p&&!p.down&&timerClear(p.stun)&&timerClear(p.slideTimer)&&
  timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
  timerClear(p.shotImpactRiseTimer)&&grounded(p)&&
  !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
  !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&
  p.action!=='shotDown'&&p.action!=='shotGetUp';
 if(!ready(passer)||!ready(receiver)||passer.aiAssistTarget)return null;
 const dir=team===0?1:-1;
 const forward=(receiver.x-passer.x)*dir,separation=Math.hypot(receiver.x-passer.x,receiver.y-passer.y);
 if(forward<65||forward>460||separation<100||separation>540)return null;
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const targetX=clampTo(receiver.x+dir*132,xMin+18,xMax-18);
 if(dir*(targetX-receiver.x)<70)return null;
 const velocity=(p,axis)=>{
  const actual=axis==='x'?p.moveVX:p.moveVY;
  if(Number.isFinite(actual))return actual;
  const legacy=axis==='x'?p.vx:p.vy;
  return Number.isFinite(legacy)?legacy:0;
 };
 const defenders=players.filter(p=>p&&p.t!==team&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&
  !p.down&&timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
  timerClear(p.shotImpactRiseTimer)&&grounded(p)&&p.action!=='shotDown'&&p.action!=='shotGetUp');
 const allies=players.filter(p=>p&&p.t===team&&p!==passer&&p!==receiver&&!p.keeper&&ready(p));
 const pointSegmentDistance=(point,start,end)=>{
  const dx=end.x-start.x,dy=end.y-start.y,length=dx*dx+dy*dy;
  const along=length>0?clampTo(((point.x-start.x)*dx+(point.y-start.y)*dy)/length,0,1):0;
  return Math.hypot(point.x-(start.x+dx*along),point.y-(start.y+dy*along));
 };
 let best=null;
 for(const side of [-1,1]){
  const targetY=clampTo(receiver.y+side*104,yMin+18,yMax-18);
  if(Math.abs(targetY-receiver.y)<60)continue;
  const target={x:targetX,y:targetY};
  const runDistance=Math.hypot(target.x-passer.x,target.y-passer.y);
  const returnDistance=Math.hypot(target.x-receiver.x,target.y-receiver.y);
  if(runDistance<90||runDistance>520||returnDistance<80||returnDistance>270)continue;
  const runArrival=clampTo(runDistance/360,.18,.65);
  const passArrival=clampTo(returnDistance/1450,.10,.30);
  const activeDefenders=defenders.filter(defender=>{
   const stun=defender.stun==null?0:Number(defender.stun);
   return Number.isFinite(stun)&&stun<=runArrival;
  });
  if(SHOTFEEL.passingLanePressure(receiver,target,activeDefenders)>=.10)continue;
  const dx=target.x-receiver.x,dy=target.y-receiver.y,segment=dx*dx+dy*dy;
  let blocked=false,pressure=0,teammateCrowding=0;
  for(const defender of activeDefenders){
   const lookahead=Math.max(runArrival,passArrival);
   const futureX=defender.x+clampTo(velocity(defender,'x')*lookahead,-85,85);
   const futureY=defender.y+clampTo(velocity(defender,'y')*lookahead,-85,85);
   const gap=Math.hypot(futureX-target.x,futureY-target.y);
   if(gap<58){blocked=true;break;}
   const along=((futureX-receiver.x)*dx+(futureY-receiver.y)*dy)/segment;
   if(along>.05&&along<.95){
    const lateral=Math.hypot(futureX-(receiver.x+dx*along),futureY-(receiver.y+dy*along));
    if(lateral<38){blocked=true;break;}
   }
   if(gap<155)pressure+=(155-gap)/155;
   const runGap=pointSegmentDistance({x:futureX,y:futureY},passer,target);
   if(runGap<48)pressure+=(48-runGap)/48*.45;
  }
  if(blocked)continue;
  for(const teammate of allies){
   const gap=Math.hypot(teammate.x-target.x,teammate.y-target.y);
   if(gap<58){blocked=true;break;}
   if(gap<112)teammateCrowding+=(112-gap)/112;
  }
  if(blocked)continue;
  const score=runDistance+pressure*115+teammateCrowding*60+Math.abs(targetY-passer.y)*.04;
  if(!best||score<best.score-1e-9)best={target,score};
 }
 return best?{target:best.target}:null;
}

 
 // Offer the return pass only after the original passer reaches the lane reserved
 // for this receiver. Keep the return corridor and receiving pocket defender-safe.
 function attackingGiveAndGoReturnPass(players,team,carrier,bounds,now=0){
  if(!Array.isArray(players)||!carrier||!players.includes(carrier)||
   (team!==0&&team!==1)||carrier.t!==team||!carrier.src?.id||carrier.aiAssistTarget||
   !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||!bounds||typeof bounds!=='object')return null;
  const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  const nowValue=Number.isFinite(now)?now:0,dir=team===0?1:-1;
  const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
  const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
  const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
  const ready=p=>p&&!p.down&&timerClear(p.stun)&&timerClear(p.slideTimer)&&
   timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
   timerClear(p.shotImpactRiseTimer)&&grounded(p)&&
   !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
   !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&
   p.action!=='shotDown'&&p.action!=='shotGetUp';
  if(!ready(carrier))return null;
  const velocity=(p,axis)=>{
   const actual=axis==='x'?p?.moveVX:p?.moveVY;
   if(Number.isFinite(actual))return actual;
   const legacy=axis==='x'?p?.vx:p?.vy;
   return Number.isFinite(legacy)?legacy:0;
  };
  const defenders=players.filter(p=>p&&p.t!==team&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&
   !p.down&&timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
   timerClear(p.shotImpactRiseTimer)&&grounded(p)&&p.action!=='shotDown'&&p.action!=='shotGetUp');
  const allies=players.filter(p=>p&&p.t===team&&p!==carrier&&!p.keeper&&ready(p));
  let best=null;
  for(const runner of players){
   const intent=runner?.aiGiveAndGoRun;
   if(!runner||runner===carrier||runner.t!==team||runner.keeper||runner.aiAssistTarget||
    !runner.src?.id||!ready(runner)||!intent||intent.receiverId!==carrier.src.id||
    !intent.target||!Number.isFinite(intent.target.x)||!Number.isFinite(intent.target.y)||
    !Number.isFinite(intent.expires)||nowValue>intent.expires)continue;
   const laneGap=Math.hypot(runner.x-intent.target.x,runner.y-intent.target.y);
   if(laneGap>112)continue;
   const target={
    x:clampTo(runner.x+clampTo(velocity(runner,'x')*.08,-18,18),xMin+20,xMax-20),
    y:clampTo(runner.y+clampTo(velocity(runner,'y')*.08,-18,18),yMin+20,yMax-20)
   };
   const forward=(target.x-carrier.x)*dir,range=Math.hypot(target.x-carrier.x,target.y-carrier.y);
   if(forward<48||forward>360||range<76||range>350)continue;
   const arrival=clampTo(range/1450,.08,.26);
   const activeDefenders=defenders.filter(defender=>{
    const stun=defender.stun==null?0:Number(defender.stun);
    return Number.isFinite(stun)&&stun<=arrival;
   });
   if(SHOTFEEL.passingLanePressure(carrier,target,activeDefenders)>=.10)continue;
   const dx=target.x-carrier.x,dy=target.y-carrier.y,segment=dx*dx+dy*dy;
   let blocked=false,nearestMarkGap=Infinity,teammateCrowding=0;
   for(const defender of activeDefenders){
    const futureX=defender.x+clampTo(velocity(defender,'x')*arrival,-75,75);
    const futureY=defender.y+clampTo(velocity(defender,'y')*arrival,-75,75);
    const gap=Math.hypot(futureX-target.x,futureY-target.y);
    nearestMarkGap=Math.min(nearestMarkGap,gap);
    if(gap<66){blocked=true;break;}
    const along=((futureX-carrier.x)*dx+(futureY-carrier.y)*dy)/segment;
    if(along>.05&&along<.95){
     const lateral=Math.hypot(futureX-(carrier.x+dx*along),futureY-(carrier.y+dy*along));
     if(lateral<42){blocked=true;break;}
    }
   }
   if(blocked)continue;
   for(const teammate of allies){
    if(teammate===runner)continue;
    const gap=Math.hypot(teammate.x-target.x,teammate.y-target.y);
    if(gap<56){blocked=true;break;}
    if(gap<110)teammateCrowding+=(110-gap)/110;
   }
   if(blocked)continue;
   const score=range+laneGap*.7+Math.max(0,150-nearestMarkGap)*.18+teammateCrowding*55;
   if(!best||score<best.score-1e-9)best={runner,target,score};
  }
  return best?{runner:best.runner,target:best.target}:null;
 }

function attackingFirstTouchEscape(players,team,carrier,bounds,horizonSeconds=.16){
 if(!Array.isArray(players)||!carrier||(team!==0&&team!==1)||carrier.t!==team||
  carrier.keeper||carrier.down||Number(carrier.stun)>0||Number(carrier.z)>18||
  !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||
  !(Number(carrier.firstTouchControlTimer)>0)||!(Number(carrier.firstTouchPressure)>0)||
  !bounds||typeof bounds!=='object')return null;
 const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const dir=team===0?1:-1;
 const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
 const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
 const ready=p=>p&&p.t!==team&&!p.keeper&&!p.down&&timerClear(p.stun)&&grounded(p)&&
  timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
  timerClear(p.shotImpactRiseTimer)&&p.action!=='shotDown'&&p.action!=='shotGetUp'&&
  !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 const horizon=clampTo(Number.isFinite(horizonSeconds)?horizonSeconds:.16,.08,.20);
 const defenders=players.filter(ready).map(q=>({
  q,x:q.x+clampTo((Number.isFinite(q.moveVX)?q.moveVX:0)*horizon,-36,36),
  y:q.y+clampTo((Number.isFinite(q.moveVY)?q.moveVY:0)*horizon,-36,36)
 }));
 const nearby=defenders.filter(q=>Math.hypot(q.x-carrier.x,q.y-carrier.y)<=155);
 if(!nearby.length||!nearby.some(q=>dir*(q.x-carrier.x)>=-28))return null;
 const allies=players.filter(q=>q&&q.t===team&&q!==carrier&&!q.keeper&&!q.down&&
  timerClear(q.stun)&&grounded(q)&&Number.isFinite(q.x)&&Number.isFinite(q.y));
 const candidates=[
  {side:0,x:carrier.x+dir*88,y:carrier.y},
  {side:-1,x:carrier.x+dir*72,y:carrier.y-78},
  {side:1,x:carrier.x+dir*72,y:carrier.y+78}
 ];
 const segmentGap=(point,start,end)=>{
  const dx=end.x-start.x,dy=end.y-start.y,length=dx*dx+dy*dy;
  const along=length>1e-9?clampTo(((point.x-start.x)*dx+(point.y-start.y)*dy)/length,0,1):0;
  return Math.hypot(point.x-(start.x+dx*along),point.y-(start.y+dy*along));
 };
 const scored=candidates.map(candidate=>{
  const target={x:clampTo(candidate.x,xMin+24,xMax-24),y:clampTo(candidate.y,yMin+24,yMax-24)};
  if(Math.hypot(target.x-carrier.x,target.y-carrier.y)<42)return {side:candidate.side,target,score:-Infinity};
  let nearest=Infinity,corridor=Infinity,pressurePenalty=0;
  for(const defender of nearby){
   const endGap=Math.hypot(defender.x-target.x,defender.y-target.y);
   const pathGap=segmentGap(defender,carrier,target);
   nearest=Math.min(nearest,endGap);corridor=Math.min(corridor,pathGap);
   pressurePenalty+=Math.max(0,84-endGap)*.34+Math.max(0,42-pathGap)*.92;
  }
  let teammateCrowding=0;
  for(const teammate of allies){
   const gap=Math.hypot(teammate.x-target.x,teammate.y-target.y);
   if(gap<82)teammateCrowding+=(82-gap)*.55;
  }
  const forward=dir*(target.x-carrier.x),lateral=Math.abs(target.y-carrier.y);
  const score=nearest+corridor*.55+forward*.18-lateral*.10-pressurePenalty-teammateCrowding;
  return {side:candidate.side,target,score};
 });
 const direct=scored.find(option=>option.side===0);
 const best=scored.filter(option=>option.side!==0).sort((a,b)=>b.score-a.score)[0];
 if(!direct||!best||!Number.isFinite(best.score)||best.score<direct.score+14||
  dir*(best.target.x-carrier.x)<35||Math.abs(best.target.y-carrier.y)<36)return null;
 return {x:best.target.x,y:best.target.y};
}


 // A CPU carrier under a genuine front/side press can keep possession by taking
 // one short forward-diagonal touch into the safer lane. This is a movement
 // preference only: it never changes ball physics, action selection or human input.
 function attackingCarryEscapeTarget(players,team,carrier,bounds,horizonSeconds=.14){
  if(!Array.isArray(players)||!carrier||(team!==0&&team!==1)||carrier.t!==team||
   carrier.keeper||carrier.down||Number(carrier.stun)>0||Number(carrier.z)>18||
   Number(carrier.firstTouchControlTimer)>0||
   !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||
   !bounds||typeof bounds!=='object')return null;
  const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
  const dir=team===0?1:-1;
  const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
  const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
  const active=p=>p&&p.t!==team&&!p.keeper&&!p.down&&timerClear(p.stun)&&
   timerClear(p.slideTimer)&&timerClear(p.shotImpactKnockdownPending)&&
   timerClear(p.shotImpactKnockdownTimer)&&timerClear(p.shotImpactRiseTimer)&&grounded(p)&&
   p.action!=='shotDown'&&p.action!=='shotGetUp'&&
   !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
   !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&
   Number.isFinite(p.x)&&Number.isFinite(p.y);
  const horizon=clampTo(Number.isFinite(horizonSeconds)?horizonSeconds:.14,.08,.18);
  const nearby=players.filter(active).map(q=>({
   q,x:q.x+clampTo((Number.isFinite(q.moveVX)?q.moveVX:0)*horizon,-28,28),
   y:q.y+clampTo((Number.isFinite(q.moveVY)?q.moveVY:0)*horizon,-28,28)
  })).filter(q=>Math.hypot(q.x-carrier.x,q.y-carrier.y)<=230);
  const pressure=nearby.some(q=>dir*(q.x-carrier.x)>=-24&&
   dir*(q.x-carrier.x)<=170&&Math.abs(q.y-carrier.y)<=150);
  if(!pressure)return null;
  const allies=players.filter(q=>q&&q.t===team&&q!==carrier&&!q.keeper&&!q.down&&
   timerClear(q.stun)&&grounded(q)&&Number.isFinite(q.x)&&Number.isFinite(q.y));
  const candidates=[
   {side:0,x:carrier.x+dir*104,y:carrier.y},
   {side:-1,x:carrier.x+dir*78,y:carrier.y-86},
   {side:1,x:carrier.x+dir*78,y:carrier.y+86}
  ];
  const segmentGap=(point,start,end)=>{
   const dx=end.x-start.x,dy=end.y-start.y,length=dx*dx+dy*dy;
   const along=length>1e-9?clampTo(((point.x-start.x)*dx+(point.y-start.y)*dy)/length,0,1):0;
   return Math.hypot(point.x-(start.x+dx*along),point.y-(start.y+dy*along));
  };
  const scored=candidates.map(candidate=>{
   const target={x:clampTo(candidate.x,xMin+24,xMax-24),y:clampTo(candidate.y,yMin+24,yMax-24)};
   const forward=dir*(target.x-carrier.x),lateral=Math.abs(target.y-carrier.y);
   if(forward<44||lateral<34)return {side:candidate.side,target,score:-Infinity};
   let nearest=Infinity,corridor=Infinity,pressurePenalty=0;
   for(const defender of nearby){
    const endGap=Math.hypot(defender.x-target.x,defender.y-target.y);
    const pathGap=segmentGap(defender,{x:carrier.x,y:carrier.y},target);
    nearest=Math.min(nearest,endGap);corridor=Math.min(corridor,pathGap);
    pressurePenalty+=Math.max(0,78-endGap)*.42+Math.max(0,38-pathGap)*1.1;
   }
   let teammateCrowding=0;
   for(const teammate of allies){
    const gap=Math.hypot(teammate.x-target.x,teammate.y-target.y);
    if(gap<95)teammateCrowding+=(95-gap)*.58;
   }
   const score=nearest+corridor*.65+forward*.14-lateral*.09-pressurePenalty-teammateCrowding;
   return {side:candidate.side,target,score};
  });
  const direct=scored.find(option=>option.side===0);
  const best=scored.filter(option=>option.side!==0).sort((a,b)=>b.score-a.score)[0];
  if(!direct||!best||!Number.isFinite(best.score)||best.score<38||
   best.score<direct.score+18)return null;
  return {x:best.target.x,y:best.target.y};
 }

 function keeperShotReadY(keeper,flightSeconds=.22){
 if(!keeper||!Number.isFinite(keeper.y))return null;
 const inactive=keeper.down||Number(keeper.stun)>0||Number(keeper.z)>18||
  keeper.diveIntentPending||['keeperDive','keeperDiveCatch','keeperRecover','keeperHold',
   'shotDown','shotGetUp','hurt'].includes(keeper.action);
 if(inactive)return keeper.y;
 const velocity=Number.isFinite(keeper.moveVY)?keeper.moveVY:
  Number.isFinite(keeper.vy)?keeper.vy:0;
 const horizon=Math.max(0,Math.min(.34,Number.isFinite(flightSeconds)?flightSeconds:.22));
 const lead=Math.max(-65,Math.min(65,velocity*horizon));
 const world=GAME_ASSETS.mechanics.world;
 const min=Number.isFinite(world.goalTop)?world.goalTop+8:-Infinity;
 const max=Number.isFinite(world.goalBottom)?world.goalBottom-8:Infinity;
 return Math.max(min,Math.min(max,keeper.y+lead));
}
return {AI_LEVELS,keeperShotReadY,aiTuning,defensivePressers,defensiveTackleSlide,defensiveCutbackCoverTarget,attackingSupportRun,attackingSupportPass,attackingThroughBall,attackingCutbackPass,attackingGoalmouthPass,attackingGiveAndGoRun,attackingGiveAndGoReturnPass,attackingFirstTouchEscape,attackingCarryEscapeTarget};})();

export {AI};
