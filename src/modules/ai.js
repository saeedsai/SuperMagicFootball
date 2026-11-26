// Supermagic Football v0.8.25.30 | AI | independently editable module
import {GAME_ASSETS} from "../assets.js";
import {SHOTFEEL} from "./shotfeel.js";
import {JUMPMETRICS} from "./jumpmetrics.js";
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


function carrierTurnAwareVelocity(carrier,vx,vy,horizonSeconds=.12){
 const speed=Math.hypot(vx,vy);
 const horizon=Math.max(.05,Math.min(.18,Number.isFinite(horizonSeconds)?horizonSeconds:.12));
 const inputX=Number.isFinite(carrier?.dx)?carrier.dx:0;
 const inputY=Number.isFinite(carrier?.dy)?carrier.dy:0;
 const inputLength=Math.hypot(inputX,inputY);
 if(!Number.isFinite(speed)||speed<75||!Number.isFinite(inputLength)||inputLength<.15)
  return {x:vx,y:vy};
 const currentX=vx/speed,currentY=vy/speed;
 const desiredX=inputX/inputLength,desiredY=inputY/inputLength;
 const dot=Math.max(-1,Math.min(1,currentX*desiredX+currentY*desiredY));
 if(dot>.995)return {x:vx,y:vy};
 const cross=currentX*desiredY-currentY*desiredX;
 const angle=Math.atan2(cross,dot);
 const rawAgility=carrier?.src?.agility;
 const parsedAgility=typeof rawAgility==='number'?rawAgility:
  typeof rawAgility==='string'&&rawAgility.trim()!==''?Number(rawAgility):NaN;
 const agility=Math.max(1,Math.min(100,Number.isFinite(parsedAgility)?parsedAgility:50));
 const maxTurn=(3+agility*.13)*horizon;
 const turn=Math.abs(angle)<=maxTurn?angle:
  (Math.sign(angle)||(carrier?.t===0?1:-1))*maxTurn;
 const cosine=Math.cos(turn),sine=Math.sin(turn);
 return {
  x:(currentX*cosine-currentY*sine)*speed,
  y:(currentX*sine+currentY*cosine)*speed
 };
}

// Assign the closest available AI player as primary presser. A player already
// committed to a slide, knockdown or recovery cannot press this frame; skip them
// before choosing both the primary and cover defender.
 // Select a second defender for cover, not another chase run down the same side.
// The support search is strictly local (<= 110 field units beyond the nearest
// eligible support) so it never pulls a distant defender out of formation.
// Stable input order breaks ties; no randomness, time state or save mutation.
function defensiveCarrierSupportCoverTarget(support,carrier,bounds,horizonSeconds=.12){
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const active=p=>p&&!p.keeper&&!p.down&&Number(p.stun||0)<=0&&
  (p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)>=0&&Number(p.z)<=18))&&
  !['shotDown','shotGetUp'].includes(p.action)&&
  !((p.action==='slide'||p.action==='hurt')&&(Number(p.actionTimer)||0)>0)&&
  Number.isFinite(p.x)&&Number.isFinite(p.y);
 if(!support||!carrier||support===carrier||support.t===carrier.t||
  (support.t!==0&&support.t!==1)||!active(support)||!active(carrier))return null;
 const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax);
 const yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const horizon=clampTo(Number.isFinite(horizonSeconds)?horizonSeconds:.12,.08,.18);
 const vx=Number.isFinite(carrier.moveVX)?carrier.moveVX:
  Number.isFinite(carrier.vx)?carrier.vx:0;
 const vy=Number.isFinite(carrier.moveVY)?carrier.moveVY:
  Number.isFinite(carrier.vy)?carrier.vy:0;
 const forwardLead=clampTo(vx*horizon,-36,36);
 const lateralLead=clampTo(vy*horizon,-36,36);
 const projectedX=clampTo(carrier.x+forwardLead,xMin+23,xMax-23);
 const projectedY=clampTo(carrier.y+lateralLead,yMin+23,yMax-23);
 // Keep the screen on the support's side of the carrier's projected lane; a lateral cut must not make the cover run through the carrier.
 const side=support.y>projectedY?1:-1;
 const goalDirection=support.t===0?1:-1;
 return {
  x:clampTo(projectedX-goalDirection*110,xMin+22,xMax-22),
  y:clampTo(projectedY+side*95,yMin+23,yMax-23)
 };
}

function defensivePassLaneCoveredByPrimary(primary,target,horizonSeconds=.12,radius=44){
 if(!primary||primary.keeper||primary.down||Number(primary.stun)>0||
  !target||![primary.x,primary.y,target.x,target.y].every(Number.isFinite))return false;
 const vx=Number.isFinite(primary.moveVX)?primary.moveVX:Number.isFinite(primary.vx)?primary.vx:0;
 const vy=Number.isFinite(primary.moveVY)?primary.moveVY:Number.isFinite(primary.vy)?primary.vy:0;
 const speed=Math.hypot(vx,vy),scale=speed>220?220/speed:1;
 const horizon=Number.isFinite(horizonSeconds)?Math.max(.08,Math.min(.18,horizonSeconds)):.12;
 const limit=Number.isFinite(radius)?Math.max(24,Math.min(60,radius)):44;
 const projected={x:primary.x+vx*scale*horizon,y:primary.y+vy*scale*horizon};
 return Math.hypot(projected.x-target.x,projected.y-target.y)<=limit;
}

function defensivePressers(players,team,target,humanControlled=null,supportTarget=null){
 if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y)||!Array.isArray(players))
  return {primary:null,support:null};
 const velocity=(p,axis)=>{
  const current=axis==='x'?p?.moveVX:p?.moveVY;
  if(Number.isFinite(current))return current;
  const legacy=axis==='x'?p?.vx:p?.vy;
  return Number.isFinite(legacy)?legacy:0;
 };
 const carrierSpeed=Math.hypot(velocity(target,'x'),velocity(target,'y'));
 const movingCarrier=Number.isInteger(target.t)&&target.t!==team&&!target.keeper&&
  Number.isFinite(carrierSpeed)&&carrierSpeed>=75;
 const project=p=>{
  const vx=velocity(p,'x'),vy=velocity(p,'y'),speed=Math.hypot(vx,vy);
  if(!Number.isFinite(speed))return {x:p.x,y:p.y};
  const scale=speed>220?220/speed:1;
  return {x:p.x+vx*scale*.12,y:p.y+vy*scale*.12};
 };
 // Cross-track momentum needs a short reorientation allowance before a defender
 // can win a projected arrival tie. This mirrors moveAgile's Agility turn rate.
 const crossTrackTurnCost=(p,point)=>{
  const dx=point.x-p.x,dy=point.y-p.y,range=Math.hypot(dx,dy);
  if(range<1)return 0;
  const vx=velocity(p,'x'),vy=velocity(p,'y');
  const crossTrackSpeed=Math.abs(vx*dy-vy*dx)/range;
  if(crossTrackSpeed<1)return 0;
  const rawAgility=p.src?.agility;
  const parsedAgility=typeof rawAgility==='number'?rawAgility:
   typeof rawAgility==='string'&&rawAgility.trim()!==''?Number(rawAgility):NaN;
  const agility=Math.max(1,Math.min(100,Number.isFinite(parsedAgility)?parsedAgility:50));
  const turnRate=3+agility*.13;
  const turnWindow=(1-Math.exp(-turnRate*.12))/turnRate;
  return Math.max(0,Math.min(12,crossTrackSpeed*turnWindow*.45));
 };
 const landingRead=target.landingRead===true;
 const opponentCarrier=Number.isInteger(target.t)&&target.t!==team&&!target.keeper;
 const carrierMotion=carrierTurnAwareVelocity(target,velocity(target,'x'),velocity(target,'y'),.12);
 const carrierScale=carrierSpeed>220?220/carrierSpeed:1;
 const carrierProjection={
  x:target.x+carrierMotion.x*carrierScale*.12,
  y:target.y+carrierMotion.y*carrierScale*.12
 };
 const projectedTarget=opponentCarrier?
  (movingCarrier?carrierProjection:{x:target.x,y:target.y}):
  landingRead?{x:target.x,y:target.y}:null;
 // The second defender may be assigned to a trusted loose-ball landing or
 // to the projected interception lane of a targeted pass.
 const supportPoint=supportTarget&&
  Number.isFinite(supportTarget.x)&&Number.isFinite(supportTarget.y)?
  {x:supportTarget.x,y:supportTarget.y}:null;
 const candidates=players.filter(p=>p&&p.t===team&&!p.keeper&&p!==humanControlled&&
   p.stun<=0&&!p.down&&!(Number(p.slideTimer)>0)&&
   !(Number(p.shotImpactKnockdownPending)>0)&&
   !(Number(p.shotImpactKnockdownTimer)>0)&&
   !(Number(p.shotImpactRiseTimer)>0)&&
   (p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)>=0&&Number(p.z)<=18))&&
   p.action!=='shotDown'&&p.action!=='shotGetUp'&&
   !((p.action==='slide'||p.action==='hurt')&&(Number(p.actionTimer)||0)>0)&&
   Number.isFinite(p.x)&&Number.isFinite(p.y))
  .map((p,index)=>{
   const d=Math.hypot(p.x-target.x,p.y-target.y);
   const future=(projectedTarget||supportPoint)?project(p):{x:p.x,y:p.y};
   let pressScore=d;
   if(projectedTarget){
    const arrival=Math.hypot(future.x-projectedTarget.x,future.y-projectedTarget.y);
    const delta=Math.max(-24,Math.min(24,arrival-d));
    pressScore=d+delta*.55+crossTrackTurnCost(p,projectedTarget);
   }
   const supportDistance=supportPoint?
    Math.hypot(p.x-supportPoint.x,p.y-supportPoint.y):d;
   let supportScore=d;
   if(supportPoint){
    const supportArrival=Math.hypot(future.x-supportPoint.x,future.y-supportPoint.y);
    const delta=Math.max(-24,Math.min(24,supportArrival-supportDistance));
    supportScore=supportDistance+delta*.55+crossTrackTurnCost(p,supportPoint);
   }
   return {p,index,d,pressScore,supportDistance,supportScore};
  })
  .sort((a,b)=>a.pressScore-b.pressScore||a.d-b.d||a.index-b.index);
 const primary=candidates[0]?.p||null;
 if(candidates.length<2)return {primary,support:null};
 const remaining=candidates.slice(1);
 const nearest=remaining.reduce((value,candidate)=>
  Math.min(value,supportPoint?candidate.supportDistance:candidate.d),Infinity);
 let chosen=remaining[0],best=Infinity;
 const coverReferenceY=projectedTarget?.y??target.y;
 for(const candidate of remaining){
  const localDistance=supportPoint?candidate.supportDistance:candidate.d;
  if(localDistance>nearest+110)continue;
  const q=candidate.p;
  const primarySide=primary.y-coverReferenceY,coverSide=q.y-coverReferenceY;
  const sameSide=Math.abs(primarySide)>25&&Math.abs(coverSide)>25&&primarySide*coverSide>0;
  const lateralGap=Math.abs(q.y-primary.y);
  const goalSide=team===0?q.x<=target.x:q.x>=target.x;
  const score=(supportPoint?candidate.supportScore:candidate.d)+
   (sameSide?75:0)+Math.max(0,65-lateralGap)*.4-(goalSide?12:0);
  if(score<best-1e-9){best=score;chosen=candidate;}
 }
 return {primary,support:chosen.p};
}

function defensiveCounterpressTrapTarget(team,carrier,players,bounds,primary,support,turnoverAge=0,humanControlled=null){
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 if((team!==0&&team!==1)||!carrier||carrier.t!==1-team||carrier.keeper||
  !Array.isArray(players)||!players.includes(carrier)||!primary||!support||
  primary===support||!players.includes(primary)||!players.includes(support)||
  primary.t!==team||support.t!==team||primary===humanControlled||support===humanControlled||
  !Number.isFinite(turnoverAge)||turnoverAge<0||turnoverAge>.72||
  ![carrier.x,carrier.y,primary.x,primary.y,support.x,support.y].every(Number.isFinite))return null;
 const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax);
 const yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
 const active=p=>p&&!p.keeper&&!p.down&&timerClear(p.stun)&&timerClear(p.slideTimer)&&
  timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
  timerClear(p.shotImpactRiseTimer)&&
  (p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)>=0&&Number(p.z)<=18))&&
  !['shotDown','shotGetUp'].includes(p.action)&&
  !((p.action==='slide'||p.action==='hurt')&&(Number(p.actionTimer)||0)>0);
 if(!active(carrier)||!active(primary)||!active(support))return null;
 const attackDir=carrier.t===0?1:-1;
 const primaryGap=Math.hypot(primary.x-carrier.x,primary.y-carrier.y);
 const supportGap=Math.hypot(support.x-carrier.x,support.y-carrier.y);
 if(primaryGap>205||supportGap<52||supportGap>320)return null;
 const vx=Number.isFinite(carrier.moveVX)?carrier.moveVX:
  Number.isFinite(carrier.vx)?carrier.vx:0;
 const vy=Number.isFinite(carrier.moveVY)?carrier.moveVY:
  Number.isFinite(carrier.vy)?carrier.vy:0;
 const projectedX=carrier.x+clampTo(vx*.12,-22,22);
 const projectedY=carrier.y+clampTo(vy*.12,-22,22);
 const sideDelta=support.y-projectedY;
 const side=Math.abs(sideDelta)>16?Math.sign(sideDelta):(((support.i||0)+team)%2?1:-1);
 const target={
  x:clampTo(projectedX+attackDir*84,xMin+24,xMax-24),
  y:clampTo(projectedY+side*34+clampTo(vy*.05,-10,10),yMin+24,yMax-24)
 };
 const forward=attackDir*(target.x-projectedX);
 const targetGap=Math.hypot(target.x-projectedX,target.y-projectedY);
 if(forward<52||forward>110||targetGap<58||targetGap>132||
  Math.hypot(support.x-target.x,support.y-target.y)>300||
  Math.hypot(primary.x-target.x,primary.y-target.y)<48)return null;
 return target;
}

// Assign a third ready CPU defender to an unmarked central runner when an opponent
// carries into the defending final third. Primary press and second-defender cover
// retain ownership; this short goal-side mark uses ordinary movement only.
function defensiveThirdManRunnerTarget(team,carrier,players,bounds,primary,support,humanControlled=null){
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 if((team!==0&&team!==1)||!carrier||carrier.t!==1-team||carrier.keeper||
  !Array.isArray(players)||!players.includes(carrier)||!primary||!support||
  primary===support||!players.includes(primary)||!players.includes(support)||
  ![carrier.x,carrier.y].every(Number.isFinite))return null;
 const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax);
 const yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const active=p=>p&&!p.keeper&&!p.down&&Number(p.stun||0)<=0&&
  Number(p.slideTimer||0)<=0&&Number(p.shotImpactKnockdownPending||0)<=0&&
  Number(p.shotImpactKnockdownTimer||0)<=0&&Number(p.shotImpactRiseTimer||0)<=0&&
  (p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)>=0&&Number(p.z)<=18))&&
  !['shotDown','shotGetUp'].includes(p.action)&&
  !((p.action==='slide'||p.action==='hurt')&&(Number(p.actionTimer)||0)>0)&&
  Number.isFinite(p.x)&&Number.isFinite(p.y);
 if(!active(carrier)||!active(primary)||!active(support))return null;
 const ownGoalX=team===0?xMin:xMax;
 const carrierDepth=Math.abs(carrier.x-ownGoalX);
 if(carrierDepth<45||carrierDepth>500)return null;
 const centerY=(yMin+yMax)/2,centralLimit=(yMax-yMin)*.28;
 const velocity=(p,axis)=>{
  const current=axis==='x'?p?.moveVX:p?.moveVY;
  if(Number.isFinite(current))return current;
  const legacy=axis==='x'?p?.vx:p?.vy;
  return Number.isFinite(legacy)?legacy:0;
 };
 const candidates=[];
 for(const runner of players){
  if(runner===carrier||runner.t!==carrier.t||!active(runner))continue;
  const vx=velocity(runner,'x'),vy=velocity(runner,'y');
  const projectedX=runner.x+clampTo(vx*.12,-24,24);
  const projectedY=runner.y+clampTo(vy*.12,-24,24);
  const runnerDepth=Math.abs(projectedX-ownGoalX);
  const advance=carrierDepth-runnerDepth;
  const lateral=Math.abs(projectedY-centerY);
  if(runnerDepth<35||runnerDepth>360||advance<40||advance>260||lateral>centralLimit)continue;
  const towardGoal=Math.sign(ownGoalX-runner.x);
  if(!towardGoal||vx*towardGoal< -85)continue;
  // Existing press/cover counts as a mark only if its short movement projection
  // still closes on the runner's projected lane. A nearby defender moving away
  // must not suppress an available third-man cover assignment.
  const projectedCoverageGap=marker=>Math.hypot(
   marker.x+clampTo(velocity(marker,'x')*.12,-24,24)-projectedX,
   marker.y+clampTo(velocity(marker,'y')*.12,-24,24)-projectedY
  );
  const alreadyMarked=Math.min(
   projectedCoverageGap(primary),
   projectedCoverageGap(support)
  );
  if(alreadyMarked<92)continue;
  const target={
   x:clampTo(projectedX+towardGoal*34,xMin+22,xMax-22),
   y:clampTo(projectedY+clampTo((centerY-projectedY)*.12,-18,18),yMin+23,yMax-23)
  };
  if(Math.hypot(target.x-carrier.x,target.y-carrier.y)>360)continue;
  for(const defender of players){
   if(defender.t!==team||defender===primary||defender===support||
    defender===humanControlled||!active(defender)||defender.aiAssistTarget||
    defender.aiGiveAndGoRun||defender.aiFirstTouchTarget)continue;
   const gap=Math.hypot(defender.x-target.x,defender.y-target.y);
   const carrierGap=Math.hypot(defender.x-carrier.x,defender.y-carrier.y);
   if(gap>205||carrierGap<105||carrierGap>440)continue;
   // Prefer the defender already arriving at the mark, but keep this a small
   // 120 ms tie-breaker so lane quality and carrier safety remain dominant.
   const projectedGap=Math.hypot(
    defender.x+clampTo(velocity(defender,'x')*.12,-24,24)-target.x,
    defender.y+clampTo(velocity(defender,'y')*.12,-24,24)-target.y
   );
   const arrivalTieBreak=clampTo(projectedGap-gap,-12,12);
   const score=gap+lateral*.12+runnerDepth*.04-
    Math.min(180,advance)*.06+Math.max(0,carrierGap-260)*.12+arrivalTieBreak;
   candidates.push({defender,runner,target,score});
  }
 }
 if(!candidates.length)return null;
 candidates.sort((a,b)=>a.score-b.score);
 const best=candidates[0];
 // A second mark is useful only for a genuinely separate central lane and a
 // comparably reachable defender; never duplicate a runner or steal the first mark.
 const secondary=candidates.find(candidate=>
  candidate.defender!==best.defender&&candidate.runner!==best.runner&&
  candidate.score<=best.score+34&&
  Math.hypot(candidate.target.x-best.target.x,candidate.target.y-best.target.y)>=88
 );
 return {
  defender:best.defender,runner:best.runner,target:best.target,score:best.score,
  ...(secondary?{secondary:{
   defender:secondary.defender,runner:secondary.runner,target:secondary.target,score:secondary.score
  }}:{})
 };
}

// Lead the primary presser along a moving carrier's live path. When the carrier
// is advancing toward goal, bias the same bounded point a few units farther down
// the attack axis so the defender cuts off the next touch instead of trailing.
// This changes only the target: movement, reach and tackle probability stay intact.
function defensiveCarrierLeadTarget(defender,carrier,bounds,anticipation=.5,ball=null){
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const active=q=>{
  if(!q||q.down||Number(q.stun)>0||!Number.isFinite(q.x)||!Number.isFinite(q.y))return false;
  const z=q.z==null?0:Number(q.z);
  if(!Number.isFinite(z)||z<0||z>18)return false;
  if(q.action==='shotDown'||q.action==='shotGetUp')return false;
  if((q.action==='slide'||q.action==='hurt')&&(Number(q.actionTimer)||0)>0)return false;
  return true;
 };
 if(defender===carrier||defender?.t===carrier?.t||defender?.keeper||carrier?.keeper||
  !active(defender)||!active(carrier))return null;
 const range=Math.hypot(carrier.x-defender.x,carrier.y-defender.y);
 if(!Number.isFinite(range)||range<58||range>460)return null;
 const vx=Number.isFinite(carrier.moveVX)?carrier.moveVX:
  Number.isFinite(carrier.vx)?carrier.vx:0;
 const vy=Number.isFinite(carrier.moveVY)?carrier.moveVY:
  Number.isFinite(carrier.vy)?carrier.vy:0;
 const speed=Math.hypot(vx,vy);
 if(!Number.isFinite(speed)||speed<90)return null;
 const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax);
 const yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||
  xMin+22>=xMax-22||yMin+23>=yMax-23)return null;
 const read=Number.isFinite(anticipation)?clampTo(anticipation,0,1):.5;
 const horizon=.08+read*.10;
 const projectedVelocity=carrierTurnAwareVelocity(carrier,vx,vy,horizon);
 let leadX=projectedVelocity.x*horizon,leadY=projectedVelocity.y*horizon;
 const attackDirection=carrier.t===0?1:carrier.t===1?-1:0;
 const goalwardSpeed=projectedVelocity.x*attackDirection;
 const goalwardCutoff=attackDirection!==0&&goalwardSpeed>80?
  Math.min(8,(goalwardSpeed-80)*.05)*read:0;
 leadX+=attackDirection*goalwardCutoff;
 // Shade toward a live ground ball only when it is exposed on this presser's side.
 // Far-side shielding and stale, airborne or unowned positions keep the old lead.
 if(ball?.owner===carrier&&Number.isFinite(ball.x)&&Number.isFinite(ball.y)&&
  Number.isFinite(ball.z)&&ball.z>=0&&ball.z<=20){
  const ballX=ball.x-carrier.x,ballY=ball.y-carrier.y;
  const ballOffset=Math.hypot(ballX,ballY);
  if(ballOffset>=4&&ballOffset<=36){
   const exposure=(ballX*(defender.x-carrier.x)+ballY*(defender.y-carrier.y))/range;
   if(Number.isFinite(exposure)&&exposure>=-2){
    const ballSideBias=Math.min(8,ballOffset*.25)*(.4+read*.6);
    leadX+=ballX/ballOffset*ballSideBias;
    leadY+=ballY/ballOffset*ballSideBias;
   }
  }
 }
 const leadLength=Math.hypot(leadX,leadY);
 if(leadLength>34){const scale=34/leadLength;leadX*=scale;leadY*=scale;}
 return {
  x:clampTo(carrier.x+leadX,xMin+22,xMax-22),
  y:clampTo(carrier.y+leadY,yMin+23,yMax-23)
 };
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
 // Match the exact forward arc used by GameEngine.tackle: a run-up from
 // behind or side-on cannot select a SHOOT slide that cannot see its target.
 // Keep the same input/facing forward arc used by GameEngine.tackle, and
 // also require actual momentum to agree. A stale forward input while
 // retreating, or a side-on turn while carrying forward speed, is not a slide.
 const movementSpeed=Math.hypot(defenderVX,defenderVY);
 const inputX=Number.isFinite(defender.dx)?defender.dx:0;
 const inputY=Number.isFinite(defender.dy)?defender.dy:0;
 const inputLength=Math.hypot(inputX,inputY);
 const headingX=inputLength>.15?inputX/inputLength:(defender.face===-1?-1:1);
 const headingY=inputLength>.15?inputY/inputLength:0;
 if(headingX*ux+headingY*uy<.25)return false;
 if(movementSpeed>24&&(defenderVX*ux+defenderVY*uy)/movementSpeed<.25)return false;
 const relativeX=carrierVX-defenderVX,relativeY=carrierVY-defenderVY;
 const escaping=relativeX*ux+relativeY*uy;
 const crossing=Math.abs(relativeX*(-uy)+relativeY*ux);
 const rawAgility=defender.src?.agility;
 const parsedAgility=typeof rawAgility==='number'?rawAgility:
  typeof rawAgility==='string'&&rawAgility.trim()!==''?Number(rawAgility):NaN;
 const agility=Math.max(1,Math.min(100,Number.isFinite(parsedAgility)?parsedAgility:50));
 // Agility changes only the lateral-cut read: average players keep the old
 // 105-unit gate, while elite readers need less crossing and low-rated players
 // require a clearer cut. The straight escape and contact/probability gates stay intact.
 const crossingThreshold=Math.max(95,Math.min(115,105+(50-agility)*.2));
 return escaping>45||(crossing>crossingThreshold&&escaping>-100);
}

 
// Read a pressured first touch early only when the primary presser has a genuine
// run-up. The extended window is reserved for a grounded, vulnerable receiver;
// a stationary defender or a carrier moving away must keep the ordinary press.
function defensiveFirstTouchSlide(defender,carrier,baseSpeed=0){
 if(!defender||!carrier||defender===carrier||defender.t===carrier.t||
  defender.keeper||carrier.keeper||defender.down||carrier.down||
  !Number.isFinite(defender.x)||!Number.isFinite(defender.y)||
  !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||
  Number(defender.stun)>0||Number(defender.invuln)>0||Number(defender.cd)>0||
  Number(carrier.stun)>0||Number(carrier.invuln)>0||
  carrier.action==='shotDown'||carrier.action==='shotGetUp'||
  ((carrier.action==='slide'||carrier.action==='hurt')&&(Number(carrier.actionTimer)||0)>0)||
  (defender.action==='slide'&&(Number(defender.actionTimer)||0)>0)||
  (defender.action==='hurt'&&(Number(defender.actionTimer)||0)>0))return false;
 const touchTimer=Number(carrier.firstTouchControlTimer),pressure=Number(carrier.firstTouchPressure);
 if(!Number.isFinite(touchTimer)||touchTimer<.08||touchTimer>.24||
  !Number.isFinite(pressure)||pressure<.45||pressure>1.05)return false;
 const carrierZ=carrier.z==null?0:Number(carrier.z),defenderZ=defender.z==null?0:Number(defender.z);
 if(!Number.isFinite(carrierZ)||carrierZ>18||!Number.isFinite(defenderZ)||defenderZ>18)return false;
 const dx=carrier.x-defender.x,dy=carrier.y-defender.y,range=Math.hypot(dx,dy);
 if(!Number.isFinite(range)||range<=74||range>98)return false;
 const velocity=(player,axis)=>{
  const actual=axis==='x'?player.moveVX:player.moveVY;
  if(Number.isFinite(actual))return actual;
  const legacy=axis==='x'?player.vx:player.vy;
  return Number.isFinite(legacy)?legacy:0;
 };
 const defenderVX=velocity(defender,'x'),defenderVY=velocity(defender,'y');
 const carrierVX=velocity(carrier,'x'),carrierVY=velocity(carrier,'y');
 const defenderSpeed=Math.hypot(defenderVX,defenderVY);
 const speedFloor=Number.isFinite(baseSpeed)&&baseSpeed>0?baseSpeed*.68:150;
 if(defenderSpeed<speedFloor)return false;
 const ux=dx/range,uy=dy/range;
 const heading=(defenderVX*ux+defenderVY*uy)/defenderSpeed;
 if(heading<.72)return false;
 const relativeClosing=(defenderVX-carrierVX)*ux+(defenderVY-carrierVY)*uy;
 const rawAgility=defender.src?.agility;
 const parsedAgility=typeof rawAgility==='number'?rawAgility:
  typeof rawAgility==='string'&&rawAgility.trim()!==''?Number(rawAgility):NaN;
 const agility=Math.max(1,Math.min(100,Number.isFinite(parsedAgility)?parsedAgility:50));
 // Average Agility preserves the 85-unit read; elite readers need less relative
 // closure, while low-Agility defenders require a clearer first-touch opening.
 const closingThreshold=Math.max(70,Math.min(100,85+(50-agility)*.3));
 return Number.isFinite(relativeClosing)&&relativeClosing>=closingThreshold;
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
   const projectedVelocity=carrierTurnAwareVelocity(runner,vx,vy,.12);
   const projectedX=runner.x+clampTo(projectedVelocity.x*.12,-18,18);
   const projectedY=runner.y+clampTo(projectedVelocity.y*.12,-18,18);
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
   // A receiver already facing goal can take the support pass forward sooner.
   // Genuine forward momentum overrides a stale facing value; this remains a
   // small tie-breaker and never rejects the only safe support runner.
   const face=Number(p.face),forwardMomentum=dir*movementVelocity(p,'x');
   const orientationPenalty=Number.isFinite(face)&&Math.abs(face)>.1&&Math.sign(face)!==dir&&forwardMomentum<110?22:0;
   const score=pathLength+corridorPressure*105+arrivalPressure*65+teammateCrowding*52+homeLanePenalty+orientationPenalty;
   if(!best||score<best.score-1e-9)best={runner:p,target,score};
  }
 }
 return best?{runner:best.runner,target:best.target}:null;
}


 
// Give a third CPU teammate a complementary lane when the primary support runner
// already occupies the first forward outlet. Candidate pockets stay opposite the
// primary run; a marked nominal pocket can yield to a clear adjacent lane without
// commandeering a human-controlled player or an existing assist/give-and-go assignment.
function attackingThirdManRun(players,team,carrier,primaryRun,humanControlled=null,bounds=null){
 const primary=primaryRun?.runner,primaryPoint=primaryRun?.target;
 if(!Array.isArray(players)||!carrier||(team!==0&&team!==1)||carrier.t!==team||
  !players.includes(carrier)||!primary||primary===carrier||primary.t!==team||!players.includes(primary)||
  !primaryPoint||!Number.isFinite(primaryPoint.x)||!Number.isFinite(primaryPoint.y)||
  !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||!bounds||typeof bounds!=='object')return null;
 const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax||
  primaryPoint.x<xMin||primaryPoint.x>xMax||primaryPoint.y<yMin||primaryPoint.y>yMax)return null;
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
 const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
 const active=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&!p.down&&
  timerClear(p.stun)&&timerClear(p.slideTimer)&&timerClear(p.shotImpactKnockdownPending)&&
  timerClear(p.shotImpactKnockdownTimer)&&timerClear(p.shotImpactRiseTimer)&&grounded(p)&&
  !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
  !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&
  p.action!=='shotDown'&&p.action!=='shotGetUp';
 if(!active(carrier)||!active(primary))return null;
 const allies=players.filter(p=>active(p)&&p.t===team&&!p.keeper);
 const candidates=allies.filter(p=>p!==carrier&&p!==primary&&p!==humanControlled&&
  !p.aiAssistTarget&&!p.aiGiveAndGoRun);
 if(!candidates.length)return null;
 const defenders=players.filter(p=>active(p)&&p.t!==team);
 const dir=team===0?1:-1,primarySide=Math.sign(primaryPoint.y-carrier.y);
 if(!primarySide)return null;
 const targetX=clampTo(carrier.x+dir*245,xMin+24,xMax-24);
 if(dir*(targetX-carrier.x)<140)return null;
 // Keep the nominal 176-unit lane, but consider one nearer and one wider
 // pocket on the same side when a defender occupies the preferred target.
 const laneTargets=[],seenTargets=new Set();
 for(const offset of [176,96,256]){
  const target={x:targetX,y:clampTo(carrier.y-primarySide*offset,yMin+32,yMax-32)};
  const key=`${target.x}:${target.y}`;
  if(seenTargets.has(key))continue;
  seenTargets.add(key);
  const lateral=(-primarySide)*(target.y-carrier.y);
  if(lateral<60||Math.hypot(target.x-primaryPoint.x,target.y-primaryPoint.y)<130)continue;
  laneTargets.push({target,offset:Math.abs(target.y-carrier.y)});
 }
 if(!laneTargets.length)return null;
 const movementVelocity=(player,axis)=>{
  const actual=axis==='x'?player?.moveVX:player?.moveVY;
  if(Number.isFinite(actual))return actual;
  const legacy=axis==='x'?player?.vx:player?.vy;
  return Number.isFinite(legacy)?legacy:0;
 };
 const pointSegmentDistance=(point,start,end)=>{
  const dx=end.x-start.x,dy=end.y-start.y,length=dx*dx+dy*dy;
  const along=length>1e-9?clampTo(((point.x-start.x)*dx+(point.y-start.y)*dy)/length,0,1):0;
  return Math.hypot(point.x-(start.x+dx*along),point.y-(start.y+dy*along));
 };
 let best=null;
 for(const runner of candidates){
  const vx=movementVelocity(runner,'x'),vy=movementVelocity(runner,'y');
  if(vx*dir< -100)continue;
  for(const lane of laneTargets){
   const {target,offset}=lane;
   const pathLength=Math.hypot(target.x-runner.x,target.y-runner.y);
   if(pathLength<90||pathLength>600||dir*(target.x-runner.x)<35)continue;
   const arrival=clampTo(pathLength/420,.14,.48);
   let pressure=0,blocked=false;
   for(const defender of defenders){
    const future={
     x:defender.x+clampTo(movementVelocity(defender,'x')*arrival,-95,95),
     y:defender.y+clampTo(movementVelocity(defender,'y')*arrival,-95,95)
    };
    const gap=Math.hypot(future.x-target.x,future.y-target.y);
    const corridor=pointSegmentDistance(future,{x:runner.x,y:runner.y},target);
    if(gap<72||corridor<42){blocked=true;break;}
    if(gap<175)pressure+=(175-gap)/175;
    if(corridor<112)pressure+=(112-corridor)/112*.55;
   }
   if(blocked)continue;
   let teammateCrowding=0;
   for(const teammate of allies){
    if(teammate===runner||teammate===carrier||teammate===primary)continue;
    const gap=Math.hypot(teammate.x-target.x,teammate.y-target.y);
    if(gap<70){blocked=true;break;}
    if(gap<150)teammateCrowding+=(150-gap)/150;
   }
   if(blocked)continue;
   const homeLanePenalty=Number.isFinite(runner.homeY)?Math.abs(target.y-runner.homeY)*.05:0;
   const lanePreferencePenalty=Math.abs(offset-176)*.65;
   // A runner already moving into this complementary pocket reaches it sooner.
   // Keep the influence bounded so route quality and defensive pressure dominate.
   const laneSpeed=(vx*(target.x-runner.x)+vy*(target.y-runner.y))/pathLength;
   const momentumTieBreak=clampTo(laneSpeed,-180,180)*.05;
   const score=pathLength+pressure*120+teammateCrowding*85+homeLanePenalty+lanePreferencePenalty-momentumTieBreak;
   if(!best||score<best.score-1e-9)best={runner,target,score};
  }
 }
 return best?{runner:best.runner,target:best.target}:null;
}

// Prefer a completed, genuinely open support run when the carrier chooses an AI
// pass. The runner must already have entered its lane; a blocked corridor or a
// defender waiting at the receiving point keeps the existing pass selection.
// Ground-pass options share the same goalkeeper availability rule as through balls.
// A keeper still catching, holding or recovering cannot contest a new ground-pass lane;
// an active keeperDive remains a real physical threat.
const keeperUnavailableForGroundPass = player => !!player?.keeper &&
 ['keeperDiveCatch','keeperRecover','keeperHold','keeperCatch'].includes(player.action);

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
 const clampValue=(value,min,max)=>Math.max(min,Math.min(max,value));
 const arrivalSeconds=Math.min(.35,Math.max(.12,range/1400));
 const receiverLeadX=Number.isFinite(runner.moveVX)?clampValue(runner.moveVX*arrivalSeconds,-65,65):
  (Number.isFinite(runner.dx)?runner.dx:0)*90;
 const receiverLeadY=Number.isFinite(runner.moveVY)?clampValue(runner.moveVY*arrivalSeconds,-65,65):
  (Number.isFinite(runner.dy)?runner.dy:0)*90;
 const receiverPoint={x:runner.x+receiverLeadX,y:runner.y+receiverLeadY};
 const passDx=receiverPoint.x-carrier.x,passDy=receiverPoint.y-carrier.y;
 const segment=passDx*passDx+passDy*passDy;
 if(!Number.isFinite(segment)||segment<=0)return null;
 const eligibleDefenders=[];
 for(const defender of players){
  if(!defender||defender.t===team||!Number.isFinite(defender.x)||!Number.isFinite(defender.y)||
   keeperUnavailableForGroundPass(defender)||
   (defender.action==='hurt'&&(Number(defender.actionTimer)||0)>0))continue;
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
 // The PASS action leads this same receiver by receiverLeadX/Y. Judge the
 // interception corridor and collection pocket at that projected arrival point.
 if(SHOTFEEL.passingLanePressure(carrier,receiverPoint,eligibleDefenders)>=.10)return null;
 for(const defender of eligibleDefenders){
  const along=((defender.x-carrier.x)*passDx+(defender.y-carrier.y)*passDy)/segment;
  if(along>.08&&along<.94){
   const gap=Math.hypot(defender.x-(carrier.x+passDx*along),defender.y-(carrier.y+passDy*along));
   if(gap<56)return null;
  }
  if(Math.hypot(defender.x-receiverPoint.x,defender.y-receiverPoint.y)<84)return null;
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
  const estimatedFlightSeconds=clampValue(Math.hypot(point.x-carrier.x,point.y-carrier.y)/1400,.12,.35);
  const leadDirectionX=dx/gap,leadDirectionY=dy/gap;
  const runnerProjection=(runner.x-carrier.x)*leadDirectionX+(runner.y-carrier.y)*leadDirectionY;
  const perpendicularSquared=Math.max(0,range*range-runnerProjection*runnerProjection);
  const minimumLead=perpendicularSquared>=110*110?48:
   Math.max(48,-runnerProjection+Math.sqrt(110*110-perpendicularSquared));
  if(minimumLead>100)return null;
  // Project the receiver's current intent through the same bounded turn-rate
  // model used by CPU movement. Segment integration preserves residual momentum
  // for lower-Agility cuts while a more agile runner can reach the new lane sooner.
  let remaining=estimatedFlightSeconds,projectedVX=vx,projectedVY=vy,travelX=0,travelY=0;
  while(remaining>1e-6){
   const step=Math.min(.18,remaining);
   const turned=carrierTurnAwareVelocity(runner,projectedVX,projectedVY,step);
   travelX+=(projectedVX+turned.x)*.5*step;
   travelY+=(projectedVY+turned.y)*.5*step;
   projectedVX=turned.x;projectedVY=turned.y;
   remaining-=step;
  }
  const leadDistance=clampValue(Math.min(gap-16,
   travelX*leadDirectionX+travelY*leadDirectionY),minimumLead,100);
  // Keep the receiver's perpendicular cut separate from the forward lead.
  const lateralLead=clampValue(
   travelX*(-leadDirectionY)+travelY*leadDirectionX,-32,32);
  const target={
   x:runner.x+leadDirectionX*leadDistance-leadDirectionY*lateralLead,
   y:runner.y+leadDirectionY*leadDistance+leadDirectionX*lateralLead
  };
  const field=GAME_ASSETS.mechanics.world?.field;
  if(field&&[field.x,field.y,field.w,field.h].every(Number.isFinite)){
   target.x=clampValue(target.x,field.x+24,field.x+field.w-24);
   target.y=clampValue(target.y,field.y+24,field.y+field.h-24);
  }
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
   if(keeperUnavailableForGroundPass(defender))continue;
   const stun=defender.stun==null?0:Number(defender.stun);
   if(!Number.isFinite(stun)||stun>arrivalSeconds)continue;
   defenders.push(defender);
  }
  if(SHOTFEEL.passingLanePressure(carrier,target,defenders)>=.10)return null;
  const keeperCollectionReach=keeper=>{
   const rawSkill=Number(keeper.src?.gkSkill),rawDiving=Number(keeper.src?.gkDiving);
   const skill=clampValue(Number.isFinite(rawSkill)?rawSkill:50,0,100);
   const diving=clampValue(Number.isFinite(rawDiving)?rawDiving:50,0,100);
   const rawFatigue=Number(keeper.fatigue);
   const fatigue=clampValue(Number.isFinite(rawFatigue)?rawFatigue:0,0,1);
   return clampValue(92+(skill+diving)*.09-fatigue*12,90,110);
  };
  // A live defender can cut toward the collection pocket during flight.
  // Integrate the same Agility-limited turn response used by the receiver lead;
  // retain the existing per-axis displacement cap and collection radii.
  const projectDefenderPosition=(defender,seconds)=>{
   let remaining=clampValue(seconds,0,.35);
   let vx=movementVelocity(defender,'x'),vy=movementVelocity(defender,'y');
   let travelX=0,travelY=0;
   while(remaining>1e-6){
    const step=Math.min(.18,remaining);
    const turned=carrierTurnAwareVelocity(defender,vx,vy,step);
    travelX+=(vx+turned.x)*.5*step;
    travelY+=(vy+turned.y)*.5*step;
    vx=turned.x;vy=turned.y;
    remaining-=step;
   }
   return {x:defender.x+clampValue(travelX,-65,65),
    y:defender.y+clampValue(travelY,-65,65)};
  };
  for(const defender of defenders){
   const future=projectDefenderPosition(defender,arrivalSeconds);
   const reach=defender.keeper?keeperCollectionReach(defender):84;
   if(Math.hypot(future.x-target.x,future.y-target.y)<reach)return null;
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
   if(!p||p.t===team||keeperUnavailableForGroundPass(p)||p.down||!Number.isFinite(p.x)||!Number.isFinite(p.y)||
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
   const turnedVelocity=carrierTurnAwareVelocity(runner,vx,vy,.10);
   const target={x:runner.x+clampValue((vx+turnedVelocity.x)*.05,-24,24),
    y:runner.y+clampValue((vy+turnedVelocity.y)*.05,-24,24)};
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
    const keeperReach=defender.keeper?clampValue(74+
    (clampValue(Number.isFinite(Number(defender.src?.gkSkill))?Number(defender.src.gkSkill):50,0,100)+
     clampValue(Number.isFinite(Number(defender.src?.gkDiving))?Number(defender.src.gkDiving):50,0,100))*.09-
    clampValue(Number.isFinite(Number(defender.fatigue))?Number(defender.fatigue):0,0,1)*10,72,92):74;
   if(gap<keeperReach){pocketBlocked=true;break;}
   }
   if(pocketBlocked)continue;
   // Among safe cutback options, prefer the runner with more separation at
   // collection time. Keep this a bounded tiebreaker: distance and centrality
   // still matter, and an unmarked defence adds no penalty.
   const markingPenalty=Math.min(42,Math.max(0,190-nearestMarkGap)*.36);
   // A cutback receiver who already faces goal can play the next touch sooner.
   // Genuine forward momentum overrides a stale horizontal-facing value.
   const facing=Number.isFinite(runner.face)&&Math.abs(runner.face)>.1?Math.sign(runner.face):
    Number.isFinite(runner.dx)&&Math.abs(runner.dx)>.1?Math.sign(runner.dx):0;
   const forwardMomentum=vx*dir;
   const orientationPenalty=facing===-dir&&forwardMomentum<=110?22:0;
   const score=range+centerOffset*.35+Math.max(0,65-vx*dir)*.08+markingPenalty+orientationPenalty;
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
 const defenders=players.filter(p=>p&&p.t!==team&&!keeperUnavailableForGroundPass(p)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&
  !p.down&&!((p.action==='hurt')&&(Number(p.actionTimer)||0)>0)&&timerClear(p.shotImpactKnockdownPending)&&
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
  // A receiver already open toward goal can play the next touch sooner.
  // Strong forward momentum overrides a stale sprite-facing value; this is
  // only a bounded tie-breaker, never a reason to discard the sole safe outlet.
  const facing=Number.isFinite(runner.face)&&Math.abs(runner.face)>.1?Math.sign(runner.face):
   Number.isFinite(runner.dx)&&Math.abs(runner.dx)>.1?Math.sign(runner.dx):0;
  const forwardMomentum=movementVelocity(runner,'x')*dir;
  const orientationPenalty=facing===-dir&&forwardMomentum<=110?28:0;
  const score=goalGap*.58+range*.26+centerOffset*.16+markingPenalty+orientationPenalty;
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
 const defenders=players.filter(p=>p&&p.t!==team&&!keeperUnavailableForGroundPass(p)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&
  !p.down&&!((p.action==='hurt')&&(Number(p.actionTimer)||0)>0)&&timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
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
  const defenders=players.filter(p=>p&&p.t!==team&&!keeperUnavailableForGroundPass(p)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&
   !p.down&&!((p.action==='hurt')&&(Number(p.actionTimer)||0)>0)&&timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
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

// Screen the return lane of an active CPU give-and-go. The primary defender
// keeps pressing the receiver; the second defender takes a bounded point on the
// return corridor so the one-two is readable but not an automatic free pass.
function defensiveGiveAndGoCoverTarget(team,carrier,players,bounds,now=0){
 if((team!==0&&team!==1)||!carrier||carrier.t!==1-team||carrier.keeper||
  !carrier.src?.id||!Array.isArray(players)||!players.includes(carrier)||
  !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||!bounds||typeof bounds!=='object')return null;
 const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const nowValue=Number.isFinite(now)?now:0;
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
 const start={
  x:carrier.x+clampTo(velocity(carrier,'x')*.08,-18,18),
  y:carrier.y+clampTo(velocity(carrier,'y')*.08,-18,18)
 };
 const attackDir=carrier.t===0?1:-1;
 let best=null;
 for(const runner of players){
  const intent=runner?.aiGiveAndGoRun,target=intent?.target;
  if(!runner||runner===carrier||runner.t!==carrier.t||runner.keeper||runner.aiAssistTarget||
   !runner.src?.id||!ready(runner)||!intent||intent.receiverId!==carrier.src.id||
   !target||!Number.isFinite(target.x)||!Number.isFinite(target.y)||
   !Number.isFinite(intent.expires)||nowValue>intent.expires||
   target.x<xMin+18||target.x>xMax-18||target.y<yMin+18||target.y>yMax-18)continue;
  const forward=(target.x-start.x)*attackDir;
  const range=Math.hypot(target.x-start.x,target.y-start.y);
  if(forward<70||forward>360||range<96||range>420)continue;
  const runnerX=runner.x+clampTo(velocity(runner,'x')*.10,-22,22);
  const runnerY=runner.y+clampTo(velocity(runner,'y')*.10,-22,22);
  const laneGap=Math.hypot(runnerX-target.x,runnerY-target.y);
  if(laneGap>220)continue;
  const runDX=target.x-runner.x,runDY=target.y-runner.y;
  if(laneGap>145&&velocity(runner,'x')*runDX+velocity(runner,'y')*runDY< -20)continue;
  // Stand just beyond the middle of the receiver-to-runner corridor. This
  // screens the return without sending the second defender into the passer.
  const point={
   x:clampTo(start.x+(target.x-start.x)*.56,xMin+24,xMax-24),
   y:clampTo(start.y+(target.y-start.y)*.56,yMin+24,yMax-24)
  };
  const score=range+laneGap*.45;
  if(!best||score<best.score-1e-9)best={x:point.x,y:point.y,score};
 }
 return best?{x:best.x,y:best.y}:null;
}



 // Select the earliest grounded point on a targeted pass that this support defender
 // can physically reach before the receiver. The normal support assignment is still
 // the fallback when the defender cannot arrive; this is not a speed or tackle bonus.
 function defensivePassInterceptionReachTarget(team,ball,receiverX,receiverY,arrival,ballAt,bounds,defender,defenderSpeed,reactionSeconds){
  if((team!==0&&team!==1)||!ball||!defender||defender.t!==team||defender.keeper||
   defender.down||!Number.isFinite(defender.x)||!Number.isFinite(defender.y)||
   !Number.isFinite(defenderSpeed)||defenderSpeed<120||!Number.isFinite(reactionSeconds)||
   !Number.isFinite(receiverX)||!Number.isFinite(receiverY)||!Number.isFinite(arrival)||
   !Number.isFinite(ballAt?.x)||!Number.isFinite(ballAt?.y))return null;
  const clear=v=>v==null||(Number.isFinite(Number(v))&&Number(v)<=0);
  if(!clear(defender.stun)||!clear(defender.slideTimer)||
   !clear(defender.shotImpactKnockdownPending)||!clear(defender.shotImpactKnockdownTimer)||
   !clear(defender.shotImpactRiseTimer)||
   (defender.z!=null&&(!Number.isFinite(Number(defender.z))||Number(defender.z)>18))||
   defender.action==='shotDown'||defender.action==='shotGetUp'||
   ((defender.action==='slide'||defender.action==='hurt')&&(Number(defender.actionTimer)||0)>0))return null;
  const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax),
   yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
  const attackDir=(1-team)===0?1:-1;
  // This role is refreshed every frame, so only a bounded fraction of the normal
  // think delay is charged before the support can move toward the interception.
  const baseResponseDelay=clampTo(reactionSeconds*.4,.04,.12);
  const rawDefence=Number(defender.src?.defence);
  const defence=clampTo(Number.isFinite(rawDefence)?rawDefence:50,1,100);
  // Average Defence preserves the exact difficulty baseline; skill only shifts
  // this refreshed support role's bounded reaction delay by at most 24 ms.
  const responseDelay=clampTo(baseResponseDelay+(50-defence)/49*.024,.035,.145);
  const firstTime=responseDelay+.06,lastTime=Math.min(arrival*.88,.62);
  if(!Number.isFinite(lastTime)||lastTime<firstTime)return null;
  const speed=Math.min(440,defenderSpeed);
  const rawAgility=defender.src?.agility;
  const parsedAgility=typeof rawAgility==='number'?rawAgility:
   typeof rawAgility==='string'&&rawAgility.trim()!==''?Number(rawAgility):NaN;
  const agility=clampTo(Number.isFinite(parsedAgility)?parsedAgility:50,1,100);
  // moveAgile turns toward its requested velocity at (3 + agility * .13) per
  // second. Integrate that ramp instead of pretending the support instantly
  // reaches full top speed; current momentum toward/away from the lane matters.
  const turnRate=3+agility*.13;
  const currentVX=Number.isFinite(defender.moveVX)?defender.moveVX:
   Number.isFinite(defender.vx)?defender.vx:0;
  const currentVY=Number.isFinite(defender.moveVY)?defender.moveVY:
   Number.isFinite(defender.vy)?defender.vy:0;
  for(let step=0;step<=12;step++){
   const time=firstTime+(lastTime-firstTime)*step/12;
   const height=ball.z+ball.vz*time-250*time*time;
   if(!Number.isFinite(height)||height< -4||height>54)continue;
   const point={
    x:clampTo(ball.x+ball.vx*time+attackDir*18,xMin+22,xMax-22),
    y:clampTo(ball.y+ball.vy*time+clampTo((receiverY-ballAt.y)*.35,-18,18),yMin+23,yMax-23)
   };
   const fromBall=Math.hypot(point.x-ball.x,point.y-ball.y);
   const toReceiver=Math.hypot(point.x-receiverX,point.y-receiverY);
   if(fromBall<38||toReceiver<34||toReceiver>220)continue;
   const dx=point.x-defender.x,dy=point.y-defender.y;
   const travel=Math.hypot(dx,dy),moveTime=Math.max(0,time-responseDelay);
   const towardSpeed=travel>1e-6?clampTo((currentVX*dx+currentVY*dy)/travel,-speed,speed):0;
   const rampArea=(1-Math.exp(-turnRate*moveTime))/turnRate;
   const reachableDistance=speed*moveTime+(towardSpeed-speed)*rampArea;
   // Cross-track momentum still has to be turned into the pass lane. Reserve a
   // small, bounded part of the arrival budget for that lateral drift instead
   // of treating all non-forward velocity as free acceleration.
   const crossTrackSpeed=travel>1e-6?Math.abs(currentVX*dy-currentVY*dx)/travel:0;
   const turnReserve=clampTo(crossTrackSpeed*rampArea*.45,0,16);
   const reachable=Math.max(0,reachableDistance-turnReserve)*.82+12;
   if(travel<=reachable)return point;
  }
  return null;
 }

 // During a targeted low pass, reserve the second defender in the final lane to
 // the intended receiver. The primary presser still attacks the ball; this is a
 // short, bounded interception read, not a teleport or a guaranteed tackle.
 function defensivePassReceiverCoverTarget(team,ball,players,bounds,defender=null,defenderSpeed=0,reactionSeconds=.2){
  if((team!==0&&team!==1)||!ball||ball.owner||ball.pass!==true||
   ball.attacker!==1-team||ball.passTeam!==1-team||
   typeof ball.passTarget!=='string'||!ball.passTarget||!Array.isArray(players)||
   !Number.isFinite(ball.x)||!Number.isFinite(ball.y)||!Number.isFinite(ball.vx)||
   !Number.isFinite(ball.vy)||!Number.isFinite(ball.vz)||!Number.isFinite(ball.z)||
   !Number.isFinite(ball.age)||ball.age<0||ball.age>2.4||ball.z>=24||
   ball.vz>112||ball.vz< -130||ball.shot||ball.strike||ball.ordinaryShot)return null;
  const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax),yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  const clampTo=(v,min,max)=>Math.max(min,Math.min(max,v));
  const clear=v=>v==null||(Number.isFinite(Number(v))&&Number(v)<=0);
  const receiver=players.find(p=>p?.src?.id===ball.passTarget);
  if(!receiver||receiver.t!==1-team||receiver.keeper||receiver.down||!clear(receiver.stun)||
   !clear(receiver.slideTimer)||!clear(receiver.shotImpactKnockdownPending)||
   !clear(receiver.shotImpactKnockdownTimer)||!clear(receiver.shotImpactRiseTimer)||
   (receiver.z!=null&&(!Number.isFinite(Number(receiver.z))||Number(receiver.z)>18))||
   receiver.action==='shotDown'||receiver.action==='shotGetUp'||
   ((receiver.action==='slide'||receiver.action==='hurt')&&(Number(receiver.actionTimer)||0)>0)||
   !Number.isFinite(receiver.x)||!Number.isFinite(receiver.y))return null;
  const movement=(p,axis)=>{
   const actual=axis==='x'?p?.moveVX:p?.moveVY;if(Number.isFinite(actual))return actual;
   const legacy=axis==='x'?p?.vx:p?.vy;return Number.isFinite(legacy)?legacy:0;
  };
  const speedSquared=ball.vx*ball.vx+ball.vy*ball.vy;
  if(speedSquared<210*210)return null;
  const initialTime=((receiver.x-ball.x)*ball.vx+(receiver.y-ball.y)*ball.vy)/speedSquared;
  if(!Number.isFinite(initialTime)||initialTime<.04||initialTime>.62)return null;
  const lead=clampTo(initialTime,.04,.48);
  const receiverX=receiver.x+clampTo(movement(receiver,'x')*lead,-70,70);
  const receiverY=receiver.y+clampTo(movement(receiver,'y')*lead,-70,70);
  const arrival=((receiverX-ball.x)*ball.vx+(receiverY-ball.y)*ball.vy)/speedSquared;
  if(!Number.isFinite(arrival)||arrival<.04||arrival>.68)return null;
  const ballAt={x:ball.x+ball.vx*arrival,y:ball.y+ball.vy*arrival};
  if(Math.hypot(receiverX-ballAt.x,receiverY-ballAt.y)>118)return null;
  const attackDir=(1-team)===0?1:-1,interceptTime=arrival*.68;
  const target={
   x:clampTo(ball.x+ball.vx*interceptTime+attackDir*18,xMin+22,xMax-22),
   y:clampTo(ball.y+ball.vy*interceptTime+clampTo((receiverY-ballAt.y)*.35,-18,18),yMin+23,yMax-23)
  };
  const fromBall=Math.hypot(target.x-ball.x,target.y-ball.y);
  const toReceiver=Math.hypot(target.x-receiverX,target.y-receiverY);
  if(fromBall<38||toReceiver<34||toReceiver>220)return null;
  const reachable=defensivePassInterceptionReachTarget(team,ball,receiverX,receiverY,arrival,ballAt,bounds,
   defender,defenderSpeed,reactionSeconds);
  return reachable||target;
 }


  // The primary presser attacks a high loose ball; the second defender protects
  // its predicted landing pocket. This is limited to descending, unowned non-shot
  // balls so ordinary passes, shots and grounded scrambles keep their assignments.
  // The 500 gravity matches the live ball integrator.
  // A targeted lofted pass needs a different read from a low driven ball:
  // the second defender protects the receiver's projected aerial collection lane
  // while the primary keeps pressing the live ball. This never changes pass physics.
  function defensiveLoftedPassCoverTarget(team,ball,players,bounds){
   if((team!==0&&team!==1)||!ball||ball.owner||ball.pass!==true||
    ball.attacker!==1-team||ball.passTeam!==1-team||
    typeof ball.passTarget!=='string'||!ball.passTarget||!Array.isArray(players)||
    ![ball.x,ball.y,ball.z,ball.vx,ball.vy,ball.vz,ball.age].every(Number.isFinite)||
    ball.age<0||ball.age>2.4||ball.z<0||(ball.z<24&&ball.vz<112)||ball.z>190||
    ball.vz>330||ball.vz< -420||ball.shot||ball.strike||ball.ordinaryShot||
    (ball.canCollect!=null&&!Number.isFinite(ball.canCollect)))return null;
   const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax),
    yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
   if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
   const clampTo=(v,min,max)=>Math.max(min,Math.min(max,v));
   const clear=v=>v==null||(Number.isFinite(Number(v))&&Number(v)<=0);
   const receiver=players.find(p=>p?.src?.id===ball.passTarget);
   if(!receiver||receiver.t!==1-team||receiver.keeper||receiver.down||!clear(receiver.stun)||
    !clear(receiver.slideTimer)||!clear(receiver.shotImpactKnockdownPending)||
    !clear(receiver.shotImpactKnockdownTimer)||!clear(receiver.shotImpactRiseTimer)||
    (receiver.z!=null&&(!Number.isFinite(Number(receiver.z))||Number(receiver.z)>18))||
    receiver.action==='shotDown'||receiver.action==='shotGetUp'||
    ((receiver.action==='slide'||receiver.action==='hurt')&&(Number(receiver.actionTimer)||0)>0)||
    !Number.isFinite(receiver.x)||!Number.isFinite(receiver.y))return null;
   const movement=(p,axis)=>{
    const actual=axis==='x'?p?.moveVX:p?.moveVY;if(Number.isFinite(actual))return actual;
    const legacy=axis==='x'?p?.vx:p?.vy;return Number.isFinite(legacy)?legacy:0;
   };
   const speedSquared=ball.vx*ball.vx+ball.vy*ball.vy;
   if(!Number.isFinite(speedSquared)||speedSquared<240*240||speedSquared>1500*1500)return null;
   const initialTime=((receiver.x-ball.x)*ball.vx+(receiver.y-ball.y)*ball.vy)/speedSquared;
   if(!Number.isFinite(initialTime)||initialTime<.12||initialTime>1.12)return null;
   const lead=clampTo(initialTime,.12,.78);
   const receiverX=receiver.x+clampTo(movement(receiver,'x')*lead,-90,90);
   const receiverY=receiver.y+clampTo(movement(receiver,'y')*lead,-90,90);
   const arrival=((receiverX-ball.x)*ball.vx+(receiverY-ball.y)*ball.vy)/speedSquared;
   if(!Number.isFinite(arrival)||arrival<.12||arrival>1.12)return null;
   const ballAt={x:ball.x+ball.vx*arrival,y:ball.y+ball.vy*arrival};
   if(Math.hypot(receiverX-ballAt.x,receiverY-ballAt.y)>150)return null;
   const height=ball.z+ball.vz*arrival-250*arrival*arrival;
   const verticalVelocity=ball.vz-500*arrival;
   if(!Number.isFinite(height)||height< -4||height>150||
    !Number.isFinite(verticalVelocity)||verticalVelocity>260||verticalVelocity< -520)return null;
   if(Number.isFinite(ball.canCollect)&&ball.canCollect>arrival+.16)return null;
   const attackDir=(1-team)===0?1:-1,interceptTime=arrival*.68;
   const target={
    x:clampTo(ball.x+ball.vx*interceptTime+attackDir*22,xMin+22,xMax-22),
    y:clampTo(ball.y+ball.vy*interceptTime+clampTo((receiverY-ballAt.y)*.3,-24,24),yMin+23,yMax-23)
   };
   const fromBall=Math.hypot(target.x-ball.x,target.y-ball.y);
   const toReceiver=Math.hypot(target.x-receiverX,target.y-receiverY);
   if(fromBall<42||toReceiver<32||toReceiver>250)return null;
   return target;
  }


  // Let the second defender use the existing JUMP action to contest a targeted
  // lofted pass only when the ball will cross their reachable space after the
  // difficulty-specific reaction delay. Ordinary/low passes never trigger it.
  function defensiveLoftedPassJumpWindow(team,ball,defender,players,bounds,reactionSeconds=.32){
   if((team!==0&&team!==1)||!Array.isArray(players)||!defender||
    !players.includes(defender)||defender.t!==team||defender.keeper||defender.down||
    defender.aiAssistTarget||!Number.isFinite(defender.x)||!Number.isFinite(defender.y))return false;
   const defenderZ=defender.z==null?0:Number(defender.z);
   if(!Number.isFinite(defenderZ)||defenderZ>10)return false;
   const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
   if(!timerClear(defender.stun)||!timerClear(defender.slideTimer)||
    !timerClear(defender.shotImpactKnockdownPending)||!timerClear(defender.shotImpactKnockdownTimer)||
    !timerClear(defender.shotImpactRiseTimer)||defender.action==='shotDown'||defender.action==='shotGetUp'||
    ((defender.action==='slide'||defender.action==='hurt')&&(Number(defender.actionTimer)||0)>0)||
    (defender.action==='jump'&&(Number(defender.actionTimer)||0)>0))return false;
   if(!defensiveLoftedPassCoverTarget(team,ball,players,bounds))return false;
   const speedSquared=ball.vx*ball.vx+ball.vy*ball.vy;
   if(!Number.isFinite(speedSquared)||speedSquared<240*240)return false;
   const velocity=(player,axis)=>{
    const actual=axis==='x'?player?.moveVX:player?.moveVY;
    if(Number.isFinite(actual))return actual;
    const legacy=axis==='x'?player?.vx:player?.vy;
    return Number.isFinite(legacy)?legacy:0;
   };
   const vx=velocity(defender,'x'),vy=velocity(defender,'y');
   let time=((defender.x-ball.x)*ball.vx+(defender.y-ball.y)*ball.vy)/speedSquared;
   if(!Number.isFinite(time))return false;
   for(let step=0;step<2;step++){
    const futureX=defender.x+Math.max(-70,Math.min(70,vx*time));
    const futureY=defender.y+Math.max(-70,Math.min(70,vy*time));
    time=((futureX-ball.x)*ball.vx+(futureY-ball.y)*ball.vy)/speedSquared;
    if(!Number.isFinite(time))return false;
   }
   const reaction=Math.max(0,Math.min(.85,Number.isFinite(reactionSeconds)?reactionSeconds:.32));
   if(time<reaction+.06||time>.56)return false;
   const futureX=defender.x+Math.max(-70,Math.min(70,vx*time));
   const futureY=defender.y+Math.max(-70,Math.min(70,vy*time));
   const ballX=ball.x+ball.vx*time,ballY=ball.y+ball.vy*time;
   const height=ball.z+ball.vz*time-250*time*time;
   const verticalVelocity=ball.vz-500*time;
   // Match the actual first-jump ballistic envelope; weak Jumping ratings must
   // not trigger a contest they cannot reach. The extra 45 units are the same
   // body-height allowance used by updateBall's airborne collection resolver.
   const jump=JUMPMETRICS.jumpMetrics(defender.src?.jumping);
   const predictedJumpHeight=jump.initialLift+jump.firstImpulse*time-540*time*time;
   const reachableHeight=Math.max(0,predictedJumpHeight)+45;
   if(Math.hypot(futureX-ballX,futureY-ballY)>58||height<24||height>reachableHeight||
    verticalVelocity>190||verticalVelocity< -420||
    (Number.isFinite(ball.canCollect)&&ball.canCollect>time+.16))return false;
   return true;
  }

  function defensiveLooseBallLandingTarget(team,ball,bounds,goalSideOffset=0){
   if((team!==0&&team!==1)||!ball||ball.owner||ball.pass||ball.shot||ball.strike||
    ball.ordinaryShot||![ball.x,ball.y,ball.z,ball.vx,ball.vy,ball.vz].every(Number.isFinite)||
    ball.z<32||ball.z>175||ball.vz>35||ball.vz< -320)return null;
   const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax),
    yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
   if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
   const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
   const flightSeconds=(ball.vz+Math.sqrt(ball.vz*ball.vz+1000*ball.z))/500;
   if(!Number.isFinite(flightSeconds)||flightSeconds<.12||flightSeconds>.62)return null;
   if(Number.isFinite(ball.canCollect)&&ball.canCollect>flightSeconds+.12)return null;
   const dir=team===0?1:-1;
   const offset=clampTo(Number.isFinite(goalSideOffset)?goalSideOffset:0,0,26);
   const landingX=ball.x+clampTo(ball.vx*flightSeconds,-260,260);
   const landingY=ball.y+clampTo(ball.vy*flightSeconds,-260,260);
   const target={
    x:clampTo(landingX-dir*offset,xMin+22,xMax-22),
    y:clampTo(landingY,yMin+23,yMax-23)
   };
   if(!Number.isFinite(target.x)||!Number.isFinite(target.y))return null;
   return target;
  }

  // The primary presser meets the descending ball at its landing point while
  // the support defender holds the existing 26-unit goal-side cover pocket.
  // Both assignments share one flight estimate so they do not chase stale,
  // divergent projections or collapse onto the same side of the landing point.
  function defensiveLooseBallPrimaryTarget(team,ball,bounds){
   return defensiveLooseBallLandingTarget(team,ball,bounds,0);
  }

  function defensiveLooseBallCoverTarget(team,ball,bounds){
   return defensiveLooseBallLandingTarget(team,ball,bounds,26);
  }


  // A fresh tackle/deflection spill can stay low instead of reaching the aerial
  // landing window above. Primary and support share one bounded bounce/roll
  // projection; support stays 26 units goal-side while the primary meets the ball.
  // Age and last-touch guards keep this out of stale loose balls and restarts.
  function defensiveGroundSpillLandingTarget(team,ball,bounds,goalSideOffset=26){
   if((team!==0&&team!==1)||!ball||ball.owner||ball.pass||ball.shot||ball.strike||
    ball.ordinaryShot||![ball.x,ball.y,ball.z,ball.vx,ball.vy,ball.vz,ball.age].every(Number.isFinite)||
    ![0,1].includes(ball.lastTouchTeam)||ball.z<0||ball.z>32||
    ball.vz>140||ball.vz< -140||ball.age<0||ball.age>1.15||
    (ball.canCollect!=null&&!Number.isFinite(ball.canCollect)))return null;
   const speed=Math.hypot(ball.vx,ball.vy);
   if(!Number.isFinite(speed)||speed<70||speed>620)return null;
   const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax),
    yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
   if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
   const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
   const rolling=ball.z<=2&&Math.abs(ball.vz)<1;
   const flightSeconds=rolling ? .18 :
    (ball.vz+Math.sqrt(ball.vz*ball.vz+1000*ball.z))/500;
   if(!Number.isFinite(flightSeconds)||flightSeconds<.08||flightSeconds>.68)return null;
   if(Number.isFinite(ball.canCollect)&&ball.canCollect>flightSeconds+.12)return null;
   const dir=team===0?1:-1;
   const offset=clampTo(Number.isFinite(goalSideOffset)?goalSideOffset:26,0,26);
   const landingX=ball.x+clampTo(ball.vx*flightSeconds,-150,150);
   const landingY=ball.y+clampTo(ball.vy*flightSeconds,-150,150);
   const target={
    x:clampTo(landingX-dir*offset,xMin+22,xMax-22),
    y:clampTo(landingY,yMin+23,yMax-23)
   };
   if(!Number.isFinite(target.x)||!Number.isFinite(target.y))return null;
   return target;
  }

  function defensiveGroundSpillPrimaryTarget(team,ball,bounds){
   return defensiveGroundSpillLandingTarget(team,ball,bounds,0);
  }

  function defensiveGroundSpillCoverTarget(team,ball,bounds){
   return defensiveGroundSpillLandingTarget(team,ball,bounds,26);
  }

 // During a pressured receiver's short first-touch window, the second CPU
 // defender shades into the next-touch path. The primary presser stays on the
 // carrier; this is a contesting position, not a guaranteed tackle.
 function defensiveFirstTouchContestTarget(team,carrier,players,bounds,now=0,horizonSeconds=.12){
  if((team!==0&&team!==1)||!carrier||carrier.t!==1-team||carrier.keeper||
   !carrier.src?.id||!Array.isArray(players)||!players.includes(carrier)||
   !Number.isFinite(Number(carrier.firstTouchControlTimer))||Number(carrier.firstTouchControlTimer)<=0||
   !Number.isFinite(Number(carrier.firstTouchPressure))||Number(carrier.firstTouchPressure)<=.12||
   carrier.down||Number(carrier.stun)>0||
   (carrier.z!=null&&(!Number.isFinite(Number(carrier.z))||Number(carrier.z)>18))||
   carrier.action==='shotDown'||carrier.action==='shotGetUp'||
   (carrier.slideTimer!=null&&(!Number.isFinite(Number(carrier.slideTimer))||Number(carrier.slideTimer)>0))||
   (carrier.shotImpactKnockdownPending!=null&&(!Number.isFinite(Number(carrier.shotImpactKnockdownPending))||Number(carrier.shotImpactKnockdownPending)>0))||
   (carrier.shotImpactKnockdownTimer!=null&&(!Number.isFinite(Number(carrier.shotImpactKnockdownTimer))||Number(carrier.shotImpactKnockdownTimer)>0))||
   (carrier.shotImpactRiseTimer!=null&&(!Number.isFinite(Number(carrier.shotImpactRiseTimer))||Number(carrier.shotImpactRiseTimer)>0))||
   ((carrier.action==='slide'||carrier.action==='hurt')&&(Number(carrier.actionTimer)||0)>0)||
   !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y))return null;
  const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax),yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
  const nowValue=Number.isFinite(now)?now:0;
  const velocity=(axis)=>{
   const actual=axis==='x'?carrier.moveVX:carrier.moveVY;
   if(Number.isFinite(actual))return actual;
   const legacy=axis==='x'?carrier.vx:carrier.vy;
   return Number.isFinite(legacy)?legacy:0;
  };
  const vx=velocity('x'),vy=velocity('y');
  const intent=carrier.aiFirstTouchTarget;
  const intentLive=!!intent&&Number.isFinite(intent.x)&&Number.isFinite(intent.y)&&
   Number.isFinite(intent.expires)&&nowValue<=intent.expires;
  let dx=intentLive?intent.x-carrier.x:vx;
  let dy=intentLive?intent.y-carrier.y:vy;
  let directionLength=Math.hypot(dx,dy);
  if(directionLength<26){
   const face=Number(carrier.face);
   dx=Number.isFinite(face)&&Math.abs(face)>.5?Math.sign(face):(carrier.t===0?1:-1);
   dy=0;directionLength=1;
  }
  if(!Number.isFinite(directionLength)||directionLength<1)return null;
  const horizon=clampTo(Number.isFinite(horizonSeconds)?horizonSeconds:.12,.08,.16);
  const predictedX=carrier.x+clampTo(vx*horizon,-28,28);
  const predictedY=carrier.y+clampTo(vy*horizon,-28,28);
  const remaining=intentLive?Math.hypot(intent.x-predictedX,intent.y-predictedY):Infinity;
  const ahead=intentLive?clampTo(remaining*.66,42,62):54;
  const target={
   x:clampTo(predictedX+dx/directionLength*ahead,xMin+22,xMax-22),
   y:clampTo(predictedY+dy/directionLength*ahead,yMin+23,yMax-23)
  };
  if(Math.hypot(target.x-carrier.x,target.y-carrier.y)<40||
   Math.hypot(target.x-predictedX,target.y-predictedY)<38)return null;
  return target;
 }

  // After a CPU interception's settling touch, the second defender shades a
  // plausible forward outlet using only visible positions and movement. It does
  // not inspect the carrier's private AI outlet target or preferred receiver.
  function defensiveFirstTouchOutletCoverTarget(team,carrier,players,bounds,defender,primary,human=null,horizonSeconds=.14){
   const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
   const grounded=p=>p&&(p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18));
   const active=p=>p&&!p.keeper&&!p.down&&timerClear(p.stun)&&timerClear(p.slideTimer)&&
    timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
    timerClear(p.shotImpactRiseTimer)&&grounded(p)&&p.action!=='shotDown'&&p.action!=='shotGetUp'&&
    !((p.action==='slide'||p.action==='hurt')&&(Number(p.actionTimer)||0)>0)&&
    Number.isFinite(p.x)&&Number.isFinite(p.y);
   if((team!==0&&team!==1)||!carrier||carrier.t!==1-team||carrier.keeper||
    !Array.isArray(players)||!players.includes(carrier)||!players.includes(defender)||
    !primary||!players.includes(primary)||primary.t!==team||primary===defender||
    defender.t!==team||!active(defender)||defender===human||
    defender.aiAssistTarget||defender.aiGiveAndGoRun||defender.aiFirstTouchTarget||
    !active(carrier)||!Number.isFinite(Number(carrier.firstTouchOutletReadTimer))||
    Number(carrier.firstTouchOutletReadTimer)<=0||
    !Number.isFinite(Number(carrier.firstTouchControlTimer))||Number(carrier.firstTouchControlTimer)>0||
    !Number.isFinite(Number(carrier.firstTouchPressure))||Number(carrier.firstTouchPressure)<=.12||
    Number(carrier.hideBallTimer)>0)return null;
   const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax),yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
   if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax||!active(primary))return null;
   const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value)),dir=carrier.t===0?1:-1;
   const horizon=clampTo(Number.isFinite(horizonSeconds)?horizonSeconds:.14,.08,.18);
   const velocity=(p,axis)=>{
    const current=axis==='x'?p?.moveVX:p?.moveVY;
    if(Number.isFinite(current))return current;
    const legacy=axis==='x'?p?.vx:p?.vy;
    return Number.isFinite(legacy)?legacy:0;
   };
   const defenders=players.filter(q=>q&&q.t===team&&q!==defender&&active(q));
   let best=null;
   for(const runner of players){
    if(!runner||runner.t!==carrier.t||runner===carrier||!active(runner))continue;
    const vx=velocity(runner,'x'),vy=velocity(runner,'y');
    const future={x:clampTo(runner.x+clampTo(vx*horizon,-28,28),xMin+24,xMax-24),
     y:clampTo(runner.y+clampTo(vy*horizon,-28,28),yMin+24,yMax-24)};
    const dx=future.x-carrier.x,dy=future.y-carrier.y,range=Math.hypot(dx,dy),
     forward=dir*dx,lateral=Math.abs(dy);
    if(range<135||range>740||forward<110||forward>650||lateral>285)continue;
    let nearest=Infinity;
    for(const marker of defenders){
     const mx=marker.x+clampTo(velocity(marker,'x')*horizon,-30,30);
     const my=marker.y+clampTo(velocity(marker,'y')*horizon,-30,30);
     nearest=Math.min(nearest,Math.hypot(mx-future.x,my-future.y));
    }
    if(nearest<92)continue;
    const forwardRun=clampTo(dir*vx,-80,140);
    const score=forward*.34+Math.min(nearest,260)*.42-range*.22-lateral*.10+forwardRun*.08;
    if(!best||score>best.score+1e-9)best={runner,future,score};
   }
   if(!best)return null;
   const dx=best.future.x-carrier.x,dy=best.future.y-carrier.y;
   const target={x:clampTo(carrier.x+dx*.56-dir*18,xMin+22,xMax-22),
    y:clampTo(carrier.y+dy*.56,yMin+23,yMax-23)};
   if(Math.hypot(target.x-carrier.x,target.y-carrier.y)<70||
    Math.hypot(target.x-primary.x,target.y-primary.y)<44)return null;
   return {runner:best.runner,target};
  }

 
 // When a pressured CPU first touch has no safe forward outlet, the second
 // defender shades the carrier's visible carry lane. It reads only public
 // movement/face direction; private AI targets and receiver intent stay hidden.
 function defensiveFirstTouchCarryContainTarget(team,carrier,players,bounds,defender,primary,human=null,horizonSeconds=.14){
  const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
  const grounded=p=>p&&(p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)>=0&&Number(p.z)<=18));
  const active=p=>p&&!p.keeper&&!p.down&&timerClear(p.stun)&&timerClear(p.slideTimer)&&
   timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
   timerClear(p.shotImpactRiseTimer)&&grounded(p)&&p.action!=='shotDown'&&p.action!=='shotGetUp'&&
   !((p.action==='slide'||p.action==='hurt')&&(Number(p.actionTimer)||0)>0)&&
   Number.isFinite(p.x)&&Number.isFinite(p.y);
  if((team!==0&&team!==1)||!carrier||carrier.t!==1-team||carrier.keeper||
   !Array.isArray(players)||!players.includes(carrier)||!players.includes(defender)||
   !primary||!players.includes(primary)||primary.t!==team||primary===defender||
   defender.t!==team||defender===human||!active(defender)||!active(primary)||!active(carrier)||
   defender.aiAssistTarget||defender.aiGiveAndGoRun||defender.aiFirstTouchTarget||
   !Number.isFinite(Number(carrier.firstTouchOutletReadTimer))||Number(carrier.firstTouchOutletReadTimer)<=0||
   !Number.isFinite(Number(carrier.firstTouchControlTimer))||Number(carrier.firstTouchControlTimer)>0||
   !Number.isFinite(Number(carrier.firstTouchPressure))||Number(carrier.firstTouchPressure)<=.12||
   Number(carrier.hideBallTimer)>0)return null;
  const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax),yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
  const dir=carrier.t===0?1:-1;
  const velocity=(axis)=>{
   const current=axis==='x'?carrier.moveVX:carrier.moveVY;
   if(Number.isFinite(current))return current;
   const legacy=axis==='x'?carrier.vx:carrier.vy;
   return Number.isFinite(legacy)?legacy:0;
  };
  // Direction follows live input, while the bounded position projection keeps actual movement velocity.
  const motionVX=velocity('x'),motionVY=velocity('y');
  let vx=Number.isFinite(carrier.dx)?carrier.dx:0;
  let vy=Number.isFinite(carrier.dy)?carrier.dy:0;
  let speed=Math.hypot(vx,vy);
  if(speed<.05){
   const motionSpeed=Math.hypot(motionVX,motionVY);
   if(motionSpeed>=38){vx=motionVX;vy=motionVY;speed=motionSpeed;}
   else{
    const face=Number(carrier.face);
    vx=Number.isFinite(face)&&Math.abs(face)>.5?Math.sign(face):dir;
    vy=0;speed=1;
   }
  }
  const ux=vx/speed,uy=vy/speed;
  if(!Number.isFinite(ux)||!Number.isFinite(uy)||dir*ux<.28)return null;
  const supportGap=Math.hypot(defender.x-carrier.x,defender.y-carrier.y);
  const primaryGap=Math.hypot(primary.x-carrier.x,primary.y-carrier.y);
  if(supportGap<52||supportGap>360||primaryGap>210)return null;
  const horizon=clampTo(Number.isFinite(horizonSeconds)?horizonSeconds:.14,.08,.18);
  const predictedX=clampTo(carrier.x+clampTo(motionVX*horizon,-28,28),xMin+24,xMax-24);
  const predictedY=clampTo(carrier.y+clampTo(motionVY*horizon,-28,28),yMin+24,yMax-24);
  // Stand on the visible carry line, offset to the side opposite the primary
  // so the two defenders do not collapse onto the same point.
  const primarySide=(primary.x-predictedX)*(-uy)+(primary.y-predictedY)*ux;
  const side=primarySide>=0?-1:1;
  const target={
   x:clampTo(predictedX+ux*78-uy*side*22,xMin+22,xMax-22),
   y:clampTo(predictedY+uy*78+ux*side*22,yMin+23,yMax-23)
  };
  const targetGap=Math.hypot(target.x-carrier.x,target.y-carrier.y);
  const forwardGap=dir*(target.x-carrier.x);
  if(!Number.isFinite(targetGap)||forwardGap<34||targetGap<56||targetGap>132||
   Math.hypot(defender.x-target.x,defender.y-target.y)>420||
   Math.hypot(primary.x-target.x,primary.y-target.y)<42)return null;
  for(const teammate of players){
   if(teammate===defender||teammate===primary||teammate.t!==team||!active(teammate))continue;
   if(Math.hypot(teammate.x-target.x,teammate.y-target.y)<48)return null;
  }
  return target;
 }


 // A visible second-defender screen can read a Magic Trick during the short
 // pressured first-touch window, even when the nearest marker is turned away.
 // Only public positions, movement and facing are used; attacker AI targets are
 // deliberately not consulted.
 function defensiveMagicTrickReadTarget(carrier,defenders,allowCarryScreen=false,ball=null){
  if(!carrier||!Array.isArray(defenders)||!Number.isFinite(carrier.x)||!Number.isFinite(carrier.y))return null;
  const clear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
  const firstTouchRead=allowCarryScreen&&Number(carrier.firstTouchOutletReadTimer)>0&&
   (Number(carrier.firstTouchControlTimer)||0)<=0&&Number(carrier.firstTouchPressure)>.12&&!(Number(carrier.hideBallTimer)>0);
  let moveX=Number.isFinite(carrier.dx)?carrier.dx:Number.isFinite(carrier.moveVX)?carrier.moveVX:0;
  let moveY=Number.isFinite(carrier.dy)?carrier.dy:Number.isFinite(carrier.moveVY)?carrier.moveVY:0;
  let moveLength=Math.hypot(moveX,moveY);
  if(moveLength<.05){moveX=Number(carrier.face)||1;moveY=0;moveLength=1;}
  const ux=moveX/moveLength,uy=moveY/moveLength,attackDir=carrier.t===0?1:carrier.t===1?-1:Math.sign(ux||1);
  const carryForward=attackDir*ux>=.28;let best=null;
  for(const q of defenders){
   if(!q||q===carrier||q.keeper||q.down||!clear(q.stun)||!clear(q.invuln)||!clear(q.slideTimer)||
    !clear(q.shotImpactKnockdownPending)||!clear(q.shotImpactKnockdownTimer)||!clear(q.shotImpactRiseTimer)||
    (q.z!=null&&(!Number.isFinite(Number(q.z))||Number(q.z)<0||Number(q.z)>18))||
    q.action==='shotDown'||q.action==='shotGetUp'||
    ((q.action==='slide'||q.action==='hurt')&&(Number(q.actionTimer)||0)>0)||
    !Number.isFinite(q.x)||!Number.isFinite(q.y))continue;
   const dx=carrier.x-q.x,dy=carrier.y-q.y,gap=Math.hypot(dx,dy);
   if(gap<1||(gap>105&&!(firstTouchRead&&carryForward&&gap<=132)))continue;
   const towardX=dx/gap,towardY=dy/gap;
   let headingX=Number.isFinite(q.dx)?q.dx:0,headingY=Number.isFinite(q.dy)?q.dy:0;
   let headingLength=Math.hypot(headingX,headingY);
   if(headingLength<=.1){
    headingX=Number.isFinite(q.moveVX)?q.moveVX:0;
    headingY=Number.isFinite(q.moveVY)?q.moveVY:0;
    headingLength=Math.hypot(headingX,headingY);
   }
   if(headingLength<=.1){
    const face=Number(q.face);
    headingX=Number.isFinite(face)&&Math.abs(face)>.1?Math.sign(face):1;
    headingY=0;headingLength=1;
   }
   headingX/=headingLength;headingY/=headingLength;
   const facing=headingX*towardX+headingY*towardY>0;
   if(!facing)continue;
   const qdx=Number.isFinite(q.dx)?q.dx:0,qdy=Number.isFinite(q.dy)?q.dy:0;
   const closing=qdx*dx+qdy*dy>.22*gap,relX=q.x-carrier.x,relY=q.y-carrier.y;
   const ahead=relX*ux+relY*uy,lateral=Math.abs(relX*uy-relY*ux);
   const ballOffsetX=ball!==null&&Number.isFinite(ball?.x)?ball.x-carrier.x:NaN;
   const ballOffsetY=ball!==null&&Number.isFinite(ball?.y)?ball.y-carrier.y:NaN;
   const ballOffsetLength=Math.hypot(ballOffsetX,ballOffsetY);
   const ballExposure=ballOffsetX*(-dx/gap)+ballOffsetY*(-dy/gap);
   const ballOnDefenderSide=ball===null||(ball.owner===carrier&&Number.isFinite(ball.x)&&Number.isFinite(ball.y)&&
    Number.isFinite(ballOffsetLength)&&ballOffsetLength<=36&&Number.isFinite(ballExposure)&&ballExposure>=-2);
   const screened=firstTouchRead&&carryForward&&gap<=132&&ahead>=18&&ahead<=150&&lateral<=64&&ballOnDefenderSide;
   if(!closing&&!screened)continue;
   const candidate={defender:q,screened,gap,priority:(screened?1000:0)-gap};
   if(!best||candidate.priority>best.priority)best=candidate;
  }
  return best?{defender:best.defender,screened:best.screened,gap:best.gap}:null;
 }

 // After a successful visible screen read, the second defender briefly narrows
 // the carrier's forward lane. This is movement-only: the primary still presses
 // and ordinary tackle/contact resolution remains the only way to win the ball.
 function defensiveMagicReadCounterpressTarget(team,carrier,players,bounds,defender,primary,humanControlled=null){
  const clear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
  const grounded=p=>p&&(p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)>=0&&Number(p.z)<=18));
  const active=p=>p&&!p.keeper&&!p.down&&clear(p.stun)&&clear(p.slideTimer)&&
   clear(p.shotImpactKnockdownPending)&&clear(p.shotImpactKnockdownTimer)&&clear(p.shotImpactRiseTimer)&&
   grounded(p)&&!['shotDown','shotGetUp'].includes(p.action)&&
   !((p.action==='slide'||p.action==='hurt')&&(Number(p.actionTimer)||0)>0)&&
   Number.isFinite(p.x)&&Number.isFinite(p.y);
  if((team!==0&&team!==1)||!carrier||carrier.t!==1-team||!Array.isArray(players)||
   !players.includes(carrier)||!defender||!players.includes(defender)||!primary||!players.includes(primary)||
   defender===primary||defender===humanControlled||defender.t!==team||primary.t!==team||
   !active(carrier)||!active(primary)||!active(defender)||!clear(carrier.hideBallTimer)||
   !Number.isFinite(Number(defender.magicReadCounterpressTimer))||Number(defender.magicReadCounterpressTimer)<=0)return null;
  const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax),yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  // Current directional input is the live carry intent. Residual movement is
  // only the fallback after input releases, so the screen follows a real cut
  // instead of counterpressing the carrier's previous momentum lane.
  const inputX=Number.isFinite(carrier.dx)?carrier.dx:0;
  const inputY=Number.isFinite(carrier.dy)?carrier.dy:0;
  let vx=inputX,vy=inputY,speed=Math.hypot(vx,vy);
  if(speed<.05){
   vx=Number.isFinite(carrier.moveVX)?carrier.moveVX:0;
   vy=Number.isFinite(carrier.moveVY)?carrier.moveVY:0;
   speed=Math.hypot(vx,vy);
  }
  if(speed<.05){
   vx=Number.isFinite(carrier.vx)?carrier.vx:0;
   vy=Number.isFinite(carrier.vy)?carrier.vy:0;
   speed=Math.hypot(vx,vy);
  }
  const attackDir=carrier.t===0?1:-1;
  if(speed<.05){vx=attackDir;vy=0;speed=1;}
  const ux=vx/speed,uy=vy/speed;
  if(attackDir*ux<.28)return null;
  const primaryGap=Math.hypot(primary.x-carrier.x,primary.y-carrier.y);
  const defenderGap=Math.hypot(defender.x-carrier.x,defender.y-carrier.y);
  if(primaryGap>205||defenderGap<38||defenderGap>160)return null;
  const relX=defender.x-carrier.x,relY=defender.y-carrier.y;
  const ahead=relX*ux+relY*uy,lateral=Math.abs(relX*uy-relY*ux);
  if(ahead<18||ahead>150||lateral>64)return null;
  // The .42s timer is granted only after the visible facing/screen read succeeds.
  // A defender may turn toward the counterpress lane before the next AI tick;
  // do not invalidate an already-earned read by checking facing a second time.
  const side=Math.abs(relY)>8?Math.sign(relY):(((Number(defender.i)||0)+team)%2?1:-1);
  const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
  const target={x:clampTo(carrier.x+ux*54+attackDir*6,xMin+24,xMax-24),
   y:clampTo(carrier.y+uy*54+side*9,yMin+24,yMax-24)};
  const forward=(target.x-carrier.x)*ux+(target.y-carrier.y)*uy;
  const targetGap=Math.hypot(target.x-carrier.x,target.y-carrier.y);
  if(forward<42||forward>72||targetGap<45||targetGap>82||
   Math.hypot(primary.x-target.x,primary.y-target.y)<38)return null;
  return target;
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
 const activeSlide=p=>p&&p.action==='slide'&&Number.isFinite(p.actionTimer)&&p.actionTimer>0&&
  Number.isFinite(p.slideTimer)&&p.slideTimer>0&&Number.isFinite(p.slideRemaining)&&p.slideRemaining>0&&
  Number.isFinite(p.slideSpeed)&&p.slideSpeed>=200&&Number.isFinite(p.slideDX)&&Number.isFinite(p.slideDY);
 const ready=p=>p&&p.t!==team&&!p.keeper&&!p.down&&timerClear(p.stun)&&grounded(p)&&
  timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
  timerClear(p.shotImpactRiseTimer)&&p.action!=='shotDown'&&p.action!=='shotGetUp'&&
  !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
  !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 const horizon=clampTo(Number.isFinite(horizonSeconds)?horizonSeconds:.16,.08,.20);
 // A live slide has its own swept direction/speed; do not freeze it at moveVX/moveVY.
 const defenders=players.filter(p=>ready(p)&&!activeSlide(p)).map(q=>({
  q,x:q.x+clampTo((Number.isFinite(q.moveVX)?q.moveVX:0)*horizon,-36,36),
  y:q.y+clampTo((Number.isFinite(q.moveVY)?q.moveVY:0)*horizon,-36,36)
 }));
 const nearby=defenders.filter(q=>Math.hypot(q.x-carrier.x,q.y-carrier.y)<=155);
 const slideThreats=players.filter(q=>q&&q.t!==team&&!q.keeper&&!q.down&&timerClear(q.stun)&&
  grounded(q)&&activeSlide(q)&&Number.isFinite(q.x)&&Number.isFinite(q.y)).map(q=>{
   const directionLength=Math.hypot(q.slideDX,q.slideDY);
   if(directionLength<.5)return null;
   const ux=q.slideDX/directionLength,uy=q.slideDY/directionLength;
   const rx=carrier.x-q.x,ry=carrier.y-q.y;
   const along=rx*ux+ry*uy,across=Math.abs(rx*uy-ry*ux);
   const speed=clampTo(q.slideSpeed,200,720);
   const remaining=Math.min(q.slideRemaining,q.slideTimer*speed);
   const travel=Math.min(remaining,speed*horizon);
   if(along<24||along>travel+1||across>88)return null;
   return {start:{x:q.x,y:q.y},end:{x:q.x+ux*travel,y:q.y+uy*travel}};
  }).filter(Boolean);
 if((!nearby.some(q=>dir*(q.x-carrier.x)>=-28))&&!slideThreats.length)return null;
 const allies=players.filter(q=>q&&q.t===team&&q!==carrier&&!q.keeper&&!q.down&&
  timerClear(q.stun)&&grounded(q)&&Number.isFinite(q.x)&&Number.isFinite(q.y));
 // Dribbling skill shapes the settling touch, not its control duration or physics.
 // Neutral 50 keeps the established geometry; low skill stays more forward,
 // while elite control can cushion farther laterally into a clear pocket.
 const rawDribbling=carrier.src?.dribbling;
 const dribbling=rawDribbling!==null&&rawDribbling!==undefined&&String(rawDribbling).trim()!==''&&
  Number.isFinite(Number(rawDribbling))?clampTo(Number(rawDribbling),1,100):50;
 const dribbleBlend=(dribbling-50)/50;
 const diagonalForward=clampTo(72-dribbleBlend*6,66,78);
 const diagonalLateral=clampTo(78+dribbleBlend*12,66,90);
 const candidates=[
  {side:0,x:carrier.x+dir*88,y:carrier.y},
  {side:-1,x:carrier.x+dir*diagonalForward,y:carrier.y-diagonalLateral},
  {side:1,x:carrier.x+dir*diagonalForward,y:carrier.y+diagonalLateral}
 ];
 const segmentGap=(point,start,end)=>{
  const dx=end.x-start.x,dy=end.y-start.y,length=dx*dx+dy*dy;
  const along=length>1e-9?clampTo(((point.x-start.x)*dx+(point.y-start.y)*dy)/length,0,1):0;
  return Math.hypot(point.x-(start.x+dx*along),point.y-(start.y+dy*along));
 };
 const slidePathGap=(threat,start,end)=>{
  let gap=Infinity;
  for(let sample=0;sample<=6;sample++){
   const ratio=sample/6;
   gap=Math.min(gap,segmentGap({
    x:threat.start.x+(threat.end.x-threat.start.x)*ratio,
    y:threat.start.y+(threat.end.y-threat.start.y)*ratio
   },start,end));
  }
  return gap;
 };
 const scored=candidates.map(candidate=>{
  const target={x:clampTo(candidate.x,xMin+24,xMax-24),y:clampTo(candidate.y,yMin+24,yMax-24)};
  if(Math.hypot(target.x-carrier.x,target.y-carrier.y)<42)return {side:candidate.side,target,score:-Infinity};
  let nearest=nearby.length?Infinity:155,corridor=nearby.length?Infinity:120,pressurePenalty=0;
  for(const defender of nearby){
   const endGap=Math.hypot(defender.x-target.x,defender.y-target.y);
   const pathGap=segmentGap(defender,carrier,target);
   nearest=Math.min(nearest,endGap);corridor=Math.min(corridor,pathGap);
   pressurePenalty+=Math.max(0,84-endGap)*.34+Math.max(0,42-pathGap)*.92;
  }
  let slidePenalty=0;
  for(const threat of slideThreats){
   const gap=slidePathGap(threat,carrier,target);
   slidePenalty=Math.min(180,slidePenalty+Math.max(0,72-gap)*1.9);
  }
  let teammateCrowding=0;
  for(const teammate of allies){
   const gap=Math.hypot(teammate.x-target.x,teammate.y-target.y);
   if(gap<82)teammateCrowding+=(82-gap)*.55;
  }
  const forward=dir*(target.x-carrier.x),lateral=Math.abs(target.y-carrier.y);
  const score=nearest+corridor*.55+forward*.18-lateral*.10-pressurePenalty-slidePenalty-teammateCrowding;
  return {side:candidate.side,target,score};
 });
 const direct=scored.find(option=>option.side===0);
 const best=scored.filter(option=>option.side!==0).sort((a,b)=>b.score-a.score)[0];
 if(!direct||!best||!Number.isFinite(best.score)||best.score<direct.score+14||
  dir*(best.target.x-carrier.x)<35||Math.abs(best.target.y-carrier.y)<36)return null;
 return {x:best.target.x,y:best.target.y};
}

 function attackingFirstTouchOutlet(players,team,carrier,bounds,horizonSeconds=.16){
  if(!Array.isArray(players)||!carrier||(team!==0&&team!==1)||carrier.t!==team||
   carrier.keeper||carrier.down||Number(carrier.stun)>0||Number(carrier.z)>18||
   Number(carrier.firstTouchControlTimer)>0||!(Number(carrier.firstTouchPressure)>.12)||
   !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||!bounds||typeof bounds!=='object')return null;
  const xMin=Number(bounds.xMin),xMax=Number(bounds.xMax),yMin=Number(bounds.yMin),yMax=Number(bounds.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
  const dir=team===0?1:-1;
  const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
  const grounded=p=>p.z==null||(Number.isFinite(Number(p.z))&&Number(p.z)<=18);
  const ready=p=>p&&!p.down&&timerClear(p.stun)&&timerClear(p.firstTouchControlTimer)&&timerClear(p.slideTimer)&&
   timerClear(p.shotImpactKnockdownPending)&&timerClear(p.shotImpactKnockdownTimer)&&
   timerClear(p.shotImpactRiseTimer)&&grounded(p)&&
   !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
   !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&
   p.action!=='shotDown'&&p.action!=='shotGetUp'&&
   Number.isFinite(p.x)&&Number.isFinite(p.y);
  if(!ready(carrier))return null;
  const goalGap=(team===0?xMax-carrier.x:carrier.x-xMin);
  if(goalGap<260)return null;
  const velocity=(p,axis)=>{
   const current=axis==='x'?p?.moveVX:p?.moveVY;
   if(Number.isFinite(current))return current;
   const legacy=axis==='x'?p?.vx:p?.vy;
   return Number.isFinite(legacy)?legacy:0;
  };
  const horizon=clampTo(Number.isFinite(horizonSeconds)?horizonSeconds:.16,.08,.20);
  const defenders=players.filter(q=>q&&q.t!==team&&!keeperUnavailableForGroundPass(q)&&Number.isFinite(q.x)&&Number.isFinite(q.y)&&
   !q.down&&timerClear(q.slideTimer)&&timerClear(q.shotImpactKnockdownPending)&&
   timerClear(q.shotImpactKnockdownTimer)&&timerClear(q.shotImpactRiseTimer)&&grounded(q)&&
   q.action!=='shotDown'&&q.action!=='shotGetUp'&&
   !(q.action==='slide'&&(Number(q.actionTimer)||0)>0)&&
   !(q.action==='hurt'&&(Number(q.actionTimer)||0)>0));
  // Live slides need their real trajectory, not ordinary moveVX/moveVY projection.
  const slideThreats=players.filter(q=>q&&q.t!==team&&!q.keeper&&!q.down&&timerClear(q.stun)&&
   timerClear(q.shotImpactKnockdownPending)&&timerClear(q.shotImpactKnockdownTimer)&&
   timerClear(q.shotImpactRiseTimer)&&grounded(q)&&q.action==='slide'&&
   Number.isFinite(q.actionTimer)&&q.actionTimer>0&&Number.isFinite(q.slideTimer)&&q.slideTimer>0&&
   Number.isFinite(q.slideRemaining)&&q.slideRemaining>0&&Number.isFinite(q.slideSpeed)&&q.slideSpeed>=200&&
   Number.isFinite(q.slideDX)&&Number.isFinite(q.slideDY)).map(q=>{
    const length=Math.hypot(q.slideDX,q.slideDY);
    if(length<.5)return null;
    const speed=clampTo(q.slideSpeed,200,720);
    const duration=Math.min(q.actionTimer,q.slideTimer,q.slideRemaining/speed);
    if(!(duration>0))return null;
    return {q,ux:q.slideDX/length,uy:q.slideDY/length,speed,duration};
   }).filter(Boolean);
  const nearby=defenders.filter(q=>{
   const stun=q.stun==null?0:Number(q.stun);
   return Number.isFinite(stun)&&stun<=.24&&Math.hypot(q.x-carrier.x,q.y-carrier.y)<=190;
  });
  const slidePressure=slideThreats.some(slide=>{
   const rx=carrier.x-slide.q.x,ry=carrier.y-slide.q.y;
   const along=rx*slide.ux+ry*slide.uy,across=Math.abs(rx*slide.uy-ry*slide.ux);
   return Math.hypot(rx,ry)<=190&&along>=-28&&along<=slide.speed*slide.duration+1&&across<=88;
  });
  if((!nearby.length||!nearby.some(q=>dir*(q.x-carrier.x)>=-28))&&!slidePressure)return null;
  const slideThreatensPass=(slide,target,arrival)=>{
   const dx=target.x-carrier.x,dy=target.y-carrier.y,endTime=Math.min(arrival,slide.duration);
   if(!(endTime>0))return false;
   for(let sample=0;sample<=12;sample++){
    const time=endTime*sample/12,progress=clampTo(time/arrival,0,1);
    const ballX=carrier.x+dx*progress,ballY=carrier.y+dy*progress;
    const slideX=slide.q.x+slide.ux*slide.speed*time,slideY=slide.q.y+slide.uy*slide.speed*time;
    if(Math.hypot(slideX-ballX,slideY-ballY)<46)return true;
   }
   if(slide.duration+1e-9>=arrival){
    const slideX=slide.q.x+slide.ux*slide.speed*arrival;
    const slideY=slide.q.y+slide.uy*slide.speed*arrival;
    if(Math.hypot(slideX-target.x,slideY-target.y)<82)return true;
   }
   return false;
  };
  const allies=players.filter(q=>q&&q.t===team&&q!==carrier&&!q.keeper&&!q.aiAssistTarget&&ready(q));
  let best=null;
  for(const runner of allies){
   const vx=velocity(runner,'x'),vy=velocity(runner,'y');
   const target={
    x:clampTo(runner.x+clampTo(vx*horizon,-32,32),xMin+24,xMax-24),
    y:clampTo(runner.y+clampTo(vy*horizon,-32,32),yMin+24,yMax-24)
   };
   const dx=target.x-carrier.x,dy=target.y-carrier.y,range=Math.hypot(dx,dy);
   const forward=dir*dx;
   if(range<125||range>760||forward< -80||forward>680)continue;
   const arrival=clampTo(range/1400,.10,.42);
   const laneDefenders=defenders.filter(q=>{
    const stun=q.stun==null?0:Number(q.stun);
    return Number.isFinite(stun)&&stun<=arrival;
   });
   const lanePressure=SHOTFEEL.passingLanePressure(carrier,target,laneDefenders);
   if(!Number.isFinite(lanePressure)||lanePressure>=.10)continue;
   const segment=dx*dx+dy*dy;
   let nearest=Infinity,blocked=false;
   for(const defender of laneDefenders){
    const futureX=defender.x+clampTo(velocity(defender,'x')*arrival,-72,72);
    const futureY=defender.y+clampTo(velocity(defender,'y')*arrival,-72,72);
    const gap=Math.hypot(futureX-target.x,futureY-target.y);
    nearest=Math.min(nearest,gap);
    if(gap<82){blocked=true;break;}
    const along=((futureX-carrier.x)*dx+(futureY-carrier.y)*dy)/segment;
    if(along>.06&&along<.94){
     const lateral=Math.hypot(futureX-(carrier.x+dx*along),futureY-(carrier.y+dy*along));
     if(lateral<44){blocked=true;break;}
    }
   }
   if(!blocked&&slideThreats.some(slide=>slideThreatensPass(slide,target,arrival)))blocked=true;
   if(blocked)continue;
   const forwardRun=clampTo(dir*vx,-100,160);
   const score=forward*.32+Math.min(nearest,300)*.50+forwardRun*.08-range*.24;
   if(!best||score>best.score+1e-9)best={runner,target,score};
  }
  return best?{runner:best.runner,target:best.target}:null;
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
  const horizon=clampTo(Number.isFinite(horizonSeconds)?horizonSeconds:.14,.08,.18);
  const active=p=>p&&p.t!==team&&!p.keeper&&!p.down&&timerClear(p.stun)&&
   timerClear(p.slideTimer)&&timerClear(p.shotImpactKnockdownPending)&&
   timerClear(p.shotImpactKnockdownTimer)&&timerClear(p.shotImpactRiseTimer)&&grounded(p)&&
   p.action!=='shotDown'&&p.action!=='shotGetUp'&&
   !(p.action==='slide'&&(Number(p.actionTimer)||0)>0)&&
   !(p.action==='hurt'&&(Number(p.actionTimer)||0)>0)&&
   Number.isFinite(p.x)&&Number.isFinite(p.y);
  const nearby=players.filter(active).map(q=>({
   q,x:q.x+clampTo((Number.isFinite(q.moveVX)?q.moveVX:0)*horizon,-28,28),
   y:q.y+clampTo((Number.isFinite(q.moveVY)?q.moveVY:0)*horizon,-28,28)
  })).filter(q=>Math.hypot(q.x-carrier.x,q.y-carrier.y)<=230);
  // An active slide is not a stationary marker: project its real swept lane,
  // but only when it is still moving toward the carrier and can reach nearby.
  const slideThreats=players.filter(q=>q&&q.t!==team&&!q.keeper&&!q.down&&
   timerClear(q.stun)&&grounded(q)&&q.action==='slide'&&
   Number.isFinite(q.actionTimer)&&q.actionTimer>0&&
   Number.isFinite(q.slideTimer)&&q.slideTimer>0&&
   Number.isFinite(q.slideRemaining)&&q.slideRemaining>0&&
   Number.isFinite(q.slideSpeed)&&q.slideSpeed>=200&&
   Number.isFinite(q.slideDX)&&Number.isFinite(q.slideDY)&&
   Number.isFinite(q.x)&&Number.isFinite(q.y))
   .map(q=>{
    const directionLength=Math.hypot(q.slideDX,q.slideDY);
    if(directionLength<.5)return null;
    const ux=q.slideDX/directionLength,uy=q.slideDY/directionLength;
    const rx=carrier.x-q.x,ry=carrier.y-q.y;
    const along=rx*ux+ry*uy,across=Math.abs(rx*uy-ry*ux);
    const speed=clampTo(q.slideSpeed,200,720);
    const remaining=Math.min(q.slideRemaining,q.slideTimer*speed);
    const travelWindow=Math.min(remaining,speed*.24);
    if(along<24||along>travelWindow||across>88)return null;
    const travel=Math.min(remaining,speed*.24);
    return {start:{x:q.x,y:q.y},end:{x:q.x+ux*travel,y:q.y+uy*travel}};
   }).filter(Boolean);
  const pressure=nearby.some(q=>dir*(q.x-carrier.x)>=-24&&
   dir*(q.x-carrier.x)<=170&&Math.abs(q.y-carrier.y)<=150)||slideThreats.length>0;
  if(!pressure)return null;
  const allies=players.filter(q=>q&&q.t===team&&q!==carrier&&!q.keeper&&!q.down&&
   timerClear(q.stun)&&grounded(q)&&Number.isFinite(q.x)&&Number.isFinite(q.y));
  // Better dribblers can make a sharper lateral escape cut; low-rated carriers
  // keep a more forward, shallower route. Missing/invalid stats use neutral 50,
  // which preserves the original target geometry exactly.
  const rawDribbling=carrier.src?.dribbling;
  const dribbling=rawDribbling!==null&&rawDribbling!==undefined&&String(rawDribbling).trim()!==''&&
   Number.isFinite(Number(rawDribbling))?clampTo(Number(rawDribbling),1,100):50;
  const dribbleBlend=(dribbling-50)/50;
  const diagonalForward=clampTo(78-dribbleBlend*8,70,86);
  const diagonalLateral=clampTo(86+dribbleBlend*14,72,100);
  const candidates=[
   {side:0,x:carrier.x+dir*104,y:carrier.y},
   {side:-1,x:carrier.x+dir*diagonalForward,y:carrier.y-diagonalLateral},
   {side:1,x:carrier.x+dir*diagonalForward,y:carrier.y+diagonalLateral}
  ];
  // If multiple lanes are similarly safe, preserve the carrier's live heading.
  // This is deliberately a small tie-breaker; defender/corridor safety remains dominant.
  const carrierVX=Number.isFinite(carrier.moveVX)?carrier.moveVX:
   Number.isFinite(carrier.vx)?carrier.vx:0;
  const carrierVY=Number.isFinite(carrier.moveVY)?carrier.moveVY:
   Number.isFinite(carrier.vy)?carrier.vy:0;
  const carrierSpeed=Math.hypot(carrierVX,carrierVY);
  const momentumWeight=carrierSpeed>=85&&carrierVX*dir>=-35?
   clampTo((carrierSpeed-85)/260,0,1)*14:0;
  const segmentGap=(point,start,end)=>{
   const dx=end.x-start.x,dy=end.y-start.y,length=dx*dx+dy*dy;
   const along=length>1e-9?clampTo(((point.x-start.x)*dx+(point.y-start.y)*dy)/length,0,1):0;
   return Math.hypot(point.x-(start.x+dx*along),point.y-(start.y+dy*along));
  };
  const scored=candidates.map(candidate=>{
   const target={x:clampTo(candidate.x,xMin+24,xMax-24),y:clampTo(candidate.y,yMin+24,yMax-24)};
   const forward=dir*(target.x-carrier.x),lateral=Math.abs(target.y-carrier.y);
   if(forward<44||(candidate.side!==0&&lateral<34))return {side:candidate.side,target,score:-Infinity,slideGap:0};
   let nearest=nearby.length?Infinity:230,corridor=nearby.length?Infinity:230,pressurePenalty=0;
   for(const defender of nearby){
    const endGap=Math.hypot(defender.x-target.x,defender.y-target.y);
    const pathGap=segmentGap(defender,{x:carrier.x,y:carrier.y},target);
    nearest=Math.min(nearest,endGap);corridor=Math.min(corridor,pathGap);
    pressurePenalty+=Math.max(0,78-endGap)*.42+Math.max(0,38-pathGap)*1.1;
   }
   const routeLength=Math.hypot(target.x-carrier.x,target.y-carrier.y);
   let slideGap=Infinity;
   if(slideThreats.length&&routeLength>0){
    const escapeDistance=clampTo(220*horizon,18,40);
    const projectedCarrier={
     x:carrier.x+clampTo(carrierVX*horizon*.2,-10,10)+(target.x-carrier.x)/routeLength*escapeDistance,
     y:carrier.y+clampTo(carrierVY*horizon*.2,-10,10)+(target.y-carrier.y)/routeLength*escapeDistance
    };
    // Compare the projected early escape point with the slide's swept lane.
    // The carrier's shared starting point is not itself a collision prediction.
    for(const threat of slideThreats)slideGap=Math.min(slideGap,
     segmentGap(projectedCarrier,threat.start,threat.end));
   }
   const slideSafetyBonus=Number.isFinite(slideGap)?clampTo(slideGap,0,72)*1.6:0;
   let teammateCrowding=0;
   for(const teammate of allies){
    const gap=Math.hypot(teammate.x-target.x,teammate.y-target.y);
    if(gap<95)teammateCrowding+=(95-gap)*.58;
   }
   const headingAlignment=momentumWeight>0&&routeLength>0?
    (carrierVX*(target.x-carrier.x)+carrierVY*(target.y-carrier.y))/(carrierSpeed*routeLength):0;
   const momentumBonus=momentumWeight*clampTo(headingAlignment,-1,1);
   const score=nearest+corridor*.65+forward*.14-lateral*.09-pressurePenalty-teammateCrowding+momentumBonus+slideSafetyBonus;
   return {side:candidate.side,target,score,slideGap};
  });
  const direct=scored.find(option=>option.side===0);
  const best=scored.filter(option=>option.side!==0).sort((a,b)=>b.score-a.score)[0];
  const directSafe=!!direct&&Number.isFinite(direct.score)&&direct.score>=150&&
   (!slideThreats.length||(Number.isFinite(direct.slideGap)&&direct.slideGap>=32));
  const bestSafe=!!best&&Number.isFinite(best.score)&&best.score>=38&&
   (!slideThreats.length||(Number.isFinite(best.slideGap)&&best.slideGap>=18));
  // A straight lane needs a wider 32-unit projected clearance; diagonals
  // retain the 18-unit minimum and must buy a meaningful score advantage.
  if(directSafe&&(!bestSafe||best.score<direct.score+18))
   return {x:direct.target.x,y:direct.target.y};
  if(!bestSafe)return null;
  return {x:best.target.x,y:best.target.y};
 }

// Score a goalkeeper outlet against where active opponents can reach during flight.
// The receiver's existing short lead is retained; only lane/arrival safety is predicted.
function keeperOutletLane(keeper,target,opponents,flightSpeed=480,receiverLeadSeconds=null){
 if(!keeper||!target||!Array.isArray(opponents)||
  ![keeper.x,keeper.y,target.x,target.y].every(Number.isFinite))
  return {endpoint:0,interception:0,pressure:Infinity,flightSeconds:0,clear:false};
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const velocity=(player,axis)=>{
  const actual=axis==='x'?player?.moveVX:player?.moveVY;
  if(Number.isFinite(actual))return actual;
  const legacy=axis==='x'?player?.vx:player?.vy;
  return Number.isFinite(legacy)?legacy:0;
 };
 const turnVelocity=(opponent,vx,vy,horizon)=>{
  if(typeof carrierTurnAwareVelocity==='function')
   return carrierTurnAwareVelocity(opponent,vx,vy,horizon);
  // Keep legacy VM-extracted helper tests self-contained; live AI uses the
  // shared carrierTurnAwareVelocity function above.
  const magnitude=Math.hypot(vx,vy),turnHorizon=Math.max(.05,Math.min(.18,Number.isFinite(horizon)?horizon:.12));
  const inputX=Number.isFinite(opponent?.dx)?opponent.dx:0;
  const inputY=Number.isFinite(opponent?.dy)?opponent.dy:0;
  const inputLength=Math.hypot(inputX,inputY);
  if(!Number.isFinite(magnitude)||magnitude<75||!Number.isFinite(inputLength)||inputLength<.15)
   return {x:vx,y:vy};
  const currentX=vx/magnitude,currentY=vy/magnitude,desiredX=inputX/inputLength,desiredY=inputY/inputLength;
  const dot=Math.max(-1,Math.min(1,currentX*desiredX+currentY*desiredY));
  if(dot>.995)return {x:vx,y:vy};
  const angle=Math.atan2(currentX*desiredY-currentY*desiredX,dot);
  const raw=opponent?.src?.agility;
  const parsed=typeof raw==='number'?raw:typeof raw==='string'&&raw.trim()!==''?Number(raw):NaN;
  const agility=Math.max(1,Math.min(100,Number.isFinite(parsed)?parsed:50));
  const maxTurn=(3+agility*.13)*turnHorizon;
  const turn=Math.abs(angle)<=maxTurn?angle:(Math.sign(angle)||1)*maxTurn;
  const cosine=Math.cos(turn),sine=Math.sin(turn);
  return {x:(currentX*cosine-currentY*sine)*magnitude,y:(currentX*sine+currentY*cosine)*magnitude};
 };
 const speed=clampTo(Number.isFinite(flightSpeed)&&flightSpeed>0?flightSpeed:480,300,1100);
 const explicitLead=Number.isFinite(receiverLeadSeconds)?clampTo(receiverLeadSeconds,0,.5):null;
 const leadXSeconds=explicitLead??(speed>=800?.34:.17);
 const leadYSeconds=explicitLead??.17;
 const end={
  x:target.x+clampTo((Number.isFinite(target.moveVX)?target.moveVX:0)*leadXSeconds,-90,90),
  y:target.y+clampTo((Number.isFinite(target.moveVY)?target.moveVY:0)*leadYSeconds,-90,90)
 };
 const dx=end.x-keeper.x,dy=end.y-keeper.y,lengthSquared=dx*dx+dy*dy;
 const flightSeconds=clampTo(Math.sqrt(lengthSquared)/speed,.12,.72);
 // Integrate the same bounded Agility turn response used by CPU press reads.
 // Average start/end velocity approximates the curved path without changing
 // player movement or the pass trajectory.
 const project=(opponent,seconds,cap=120)=>{
  let remaining=clampTo(Number.isFinite(seconds)?seconds:0,0,.72);
  let vx=velocity(opponent,'x'),vy=velocity(opponent,'y'),travelX=0,travelY=0;
  while(remaining>1e-6){
   const step=Math.min(.18,remaining);
   if(step>=.05){
    const turned=turnVelocity(opponent,vx,vy,step);
    travelX+=(vx+turned.x)*.5*step;
    travelY+=(vy+turned.y)*.5*step;
    vx=turned.x;vy=turned.y;
   }else{
    travelX+=vx*step;travelY+=vy*step;
   }
   remaining-=step;
  }
  return {x:opponent.x+clampTo(travelX,-cap,cap),y:opponent.y+clampTo(travelY,-cap,cap)};
 };
 let endpoint=Infinity,interception=Infinity,pressure=0;
 for(const opponent of opponents){
  if(!opponent||opponent.keeper||!Number.isFinite(opponent.x)||!Number.isFinite(opponent.y)||
   Number(opponent.stun)>0||opponent.down||Number(opponent.shotImpactKnockdownTimer)>0||
   (Number.isFinite(opponent.z)&&opponent.z>20))continue;
  let along=lengthSquared>1e-9?
   clampTo(((opponent.x-keeper.x)*dx+(opponent.y-keeper.y)*dy)/lengthSquared,0,1):0;
  for(let step=0;step<3;step++){
   const future=project(opponent,flightSeconds*along);
   const next=lengthSquared>1e-9?
    clampTo(((future.x-keeper.x)*dx+(future.y-keeper.y)*dy)/lengthSquared,0,1):0;
   if(Math.abs(next-along)<.002){along=next;break;}
   along=next;
  }
  const future=project(opponent,flightSeconds*along);
  const laneX=keeper.x+dx*along,laneY=keeper.y+dy*along;
  interception=Math.min(interception,Math.hypot(future.x-laneX,future.y-laneY));
  const arrival=project(opponent,flightSeconds,150);
  const endpointGap=Math.hypot(arrival.x-end.x,arrival.y-end.y);
  endpoint=Math.min(endpoint,endpointGap);
  if(endpointGap<175)pressure+=(175-endpointGap)*2.4;
 }
 return {endpoint,interception,pressure,flightSeconds,clear:endpoint>145&&interception>95};
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
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const rating=value=>{
  const parsed=typeof value==='number'?value:
   typeof value==='string'&&value.trim()!==''?Number(value):NaN;
  return clampTo(Number.isFinite(parsed)?parsed:50,0,100);
 };
 const agility=rating(keeper.src?.agility);
 const skill=rating(keeper.src?.gkSkill);
 const fatigue=clampTo(Number.isFinite(keeper.fatigue)?keeper.fatigue:0,0,1);
 // A more agile/skilled keeper can brake cross-lane momentum sooner. Fatigue
 // reduces that braking, leaving a tired keeper committed to the current run.
 const quality=(agility*.55+skill*.45)/100;
 const brakingRate=(250+quality*500)*(1-fatigue*.4);
 const travel=Math.abs(velocity)*horizon;
 const brakingDistance=Math.min(travel,.5*brakingRate*horizon*horizon);
 const lead=Math.sign(velocity)*Math.min(65,Math.max(0,travel-brakingDistance));
 const world=GAME_ASSETS.mechanics.world;
 const min=Number.isFinite(world.goalTop)?world.goalTop+8:-Infinity;
 const max=Number.isFinite(world.goalBottom)?world.goalBottom-8:Infinity;
 return Math.max(min,Math.min(max,keeper.y+lead));
}

 // After a parry, a CPU keeper may step off the line for its own descending
 // rebound. It stays inside a short goal-side corridor and yields to closer
 // outfield players or an opponent who can reach the landing pocket first.
 function keeperParryReboundTarget(keeper,ball,players,bounds,now=0,rebound=null,maxSpeed=null){
  const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
  if(!keeper?.keeper||keeper.down||Number(keeper.stun)>0||Number(keeper.z)>18||
   (keeper.action==='keeperDive'&&(keeper.diveIntentPending||!Number.isFinite(keeper.diveElapsed)||keeper.diveElapsed<.22))||
   ['keeperDiveCatch','keeperRecover','keeperHold','shotDown','shotGetUp','hurt'].includes(keeper.action)||
   !ball||ball.owner||ball.attacker!==keeper.t||ball.lastTouchTeam!==keeper.t||
   ball.shot||ball.strike||ball.ordinaryShot||ball.pass||
   !Array.isArray(players)||!players.includes(keeper)||
   !rebound||rebound.team!==keeper.t||!Number.isFinite(rebound.expires)||
   !Number.isFinite(now)||now>rebound.expires||
   ![ball.x,ball.y,ball.z,ball.vx,ball.vy,ball.vz].every(Number.isFinite))return null;
  const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax);
  const yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
  if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
  const dir=keeper.t===0?1:-1,ownGoalX=dir===1?xMin:xMax;
  const depth=(ball.x-ownGoalX)*dir;
  if(depth<18||depth>390||ball.vx*dir<70||ball.z>145||ball.vz>85)return null;
  const landingSeconds=(ball.vz+Math.sqrt(ball.vz*ball.vz+1000*Math.max(0,ball.z)))/500;
  if(!Number.isFinite(landingSeconds)||landingSeconds>.72)return null;
  const horizon=Math.max(.12,Math.min(.60,landingSeconds));
  const xLead=clampTo(ball.vx*horizon*.58,-110,110);
  const yLead=clampTo(ball.vy*horizon*.58,-100,100);
  const target={
   x:clampTo(ball.x+xLead,dir===1?xMin+30:xMax-210,dir===1?xMin+210:xMax-30),
   y:clampTo(ball.y+yLead,yMin+24,yMax-24)
  };
  const targetDepth=(target.x-ownGoalX)*dir,keeperGap=Math.hypot(target.x-keeper.x,target.y-keeper.y);
  if(targetDepth<26||targetDepth>210||keeperGap<22||keeperGap>235)return null;
  // Do not send a keeper on a second-ball chase it cannot physically reach.
  // Grounded and airborne rebounds share a short collection window bounded
  // by the parry metadata expiry. The projected target still follows the ball's
  // remaining descent; movement feasibility cannot outlive that expiry.
  const pursuitSeconds=Math.min(.48,Math.max(0,rebound.expires-now));
  const rawSpeed=Number(maxSpeed);
  const moveSpeed=maxSpeed==null?300:(Number.isFinite(rawSpeed)&&rawSpeed>=0?clampTo(rawSpeed,0,500):0);
  const rawAgility=Number(keeper.src?.agility);
  const agility=clampTo(Number.isFinite(rawAgility)?rawAgility:50,0,100);
  const rawKeeperSkill=keeper.src?.gkSkill;
  const parsedKeeperSkill=typeof rawKeeperSkill==='number'?rawKeeperSkill:
   typeof rawKeeperSkill==='string'&&rawKeeperSkill.trim()!==''?Number(rawKeeperSkill):NaN;
  const keeperSkill=clampTo(Number.isFinite(parsedKeeperSkill)?parsedKeeperSkill:50,0,100);
  const fatigue=clampTo(Number.isFinite(keeper.fatigue)?keeper.fatigue:0,0,1);
  const turnRate=clampTo(3+agility*.13+(keeperSkill-50)*.025-fatigue*1.1,4.5,16.5);
  const velocityX=Number.isFinite(keeper.moveVX)?keeper.moveVX:Number.isFinite(keeper.vx)?keeper.vx:0;
  const velocityY=Number.isFinite(keeper.moveVY)?keeper.moveVY:Number.isFinite(keeper.vy)?keeper.vy:0;
  const targetDx=target.x-keeper.x,targetDy=target.y-keeper.y;
  const initialTowardSpeed=clampTo((velocityX*targetDx+velocityY*targetDy)/Math.max(1,keeperGap),-moveSpeed,moveSpeed);
  const lateralSpeed=Math.abs((velocityX*targetDy-velocityY*targetDx)/Math.max(1,keeperGap));
  const accelerationWindow=(1-Math.exp(-turnRate*pursuitSeconds))/turnRate;
  const reachableTravel=Math.max(0,moveSpeed*pursuitSeconds+(initialTowardSpeed-moveSpeed)*accelerationWindow);
  // Cross-track momentum must be cancelled before the keeper can settle on the rebound.
  // Reserve part of the existing collection margin for that turn, without changing
  // the stationary/aligned baseline or making the 44-unit buffer disappear.
  const lateralTurnCost=Math.min(18,lateralSpeed/turnRate*.45);
  const arrivalBuffer=Math.max(26,44-lateralTurnCost);
  if(keeperGap>reachableTravel+arrivalBuffer)return null;
  const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
  const activeOutfielder=q=>q&&q!==keeper&&!q.keeper&&!q.down&&
   (q.stun==null||Number(q.stun)<=0)&&
   timerClear(q.shotImpactKnockdownPending)&&
   timerClear(q.shotImpactKnockdownTimer)&&
   timerClear(q.shotImpactRiseTimer)&&
   (q.z==null||Number(q.z)<=18)&&
   Number.isFinite(q.x)&&Number.isFinite(q.y)&&
   !['shotDown','shotGetUp'].includes(q.action)&&
   !(q.action==='hurt'&&(Number(q.actionTimer)||0)>0)&&
   !(q.action==='slide'&&(Number(q.actionTimer)||0)>0);
  // Read the outfield contest over the ball's remaining descent, rather than
  // a fixed 100 ms snapshot. The lead is capped so sprinting players are not
  // extrapolated indefinitely, while a genuine runner can still win the race.
  const contestHorizon=Math.max(0,Math.min(.34,landingSeconds));
  // Project a live defender's committed 2D turn through the same Agility
  // response used by the pass/press reads. Integrate the curved path in short
  // slices, then retain the existing 110-unit total lead cap for this race.
  const projected=q=>{
   let vx=Number.isFinite(q.moveVX)?q.moveVX:Number.isFinite(q.vx)?q.vx:0;
   let vy=Number.isFinite(q.moveVY)?q.moveVY:Number.isFinite(q.vy)?q.vy:0;
   let remaining=contestHorizon,dx=0,dy=0;
   while(remaining>1e-6){
    const step=Math.min(.18,remaining);
    const turned=step>=.05?carrierTurnAwareVelocity(q,vx,vy,step):{x:vx,y:vy};
    dx+=(vx+turned.x)*.5*step;
    dy+=(vy+turned.y)*.5*step;
    vx=turned.x;vy=turned.y;remaining-=step;
   }
   const lead=Math.hypot(dx,dy);
   if(lead>110){const scale=110/lead;dx*=scale;dy*=scale;}
   return {x:q.x+dx,y:q.y+dy};
  };
  for(const opponent of players){
   if(opponent?.t===keeper.t||!activeOutfielder(opponent))continue;
   const future=projected(opponent),gap=Math.hypot(future.x-target.x,future.y-target.y);
   if(gap<Math.min(118,keeperGap-18))return null;
  }
  for(const teammate of players){
   if(teammate?.t!==keeper.t||!activeOutfielder(teammate))continue;
   const future=projected(teammate),gap=Math.hypot(future.x-target.x,future.y-target.y);
   if(gap<185&&gap+32<keeperGap)return null;
  }
  return target;
 }

// A keeper punches a targeted high cross only when an active attacker is close
// enough to make a clean claim risky. Skill reduces the punch window; fatigue and
// a second arriving attacker increase it. This is a decision read, not ball physics.
function keeperHighCrossPunchDecision(keeper,ball,players){
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
 if(!keeper?.keeper||keeper.down||Number(keeper.stun)>0||Number(keeper.z)>18||
  Number(keeper.diveCooldown)>0||Number(keeper.diveIntentCooldown)>0||keeper.diveIntentPending||
  ['keeperDive','keeperDiveCatch','keeperRecover','keeperHold','keeperCatch','shotDown','shotGetUp','hurt'].includes(keeper.action)||
  !Array.isArray(players)||!players.includes(keeper)||
  !ball||ball.owner||ball.pass!==true||ball.passTeam!==1-keeper.t||
  ball.attacker!==1-keeper.t||ball.lastTouchTeam!==1-keeper.t||
  ball.shot||ball.strike||ball.ordinaryShot||ball.passTarget==null||
  ![ball.x,ball.y,ball.z,ball.vx,ball.vy,ball.vz,ball.age].every(Number.isFinite)||
  ball.age<0||ball.age>2.4||ball.z<38||ball.z>150||ball.vz>35||ball.vz< -340||
  (ball.canCollect!=null&&(!Number.isFinite(Number(ball.canCollect))||Number(ball.canCollect)>.03)))return null;
 const rawSkill=Number(keeper.src?.gkSkill),rawDiving=Number(keeper.src?.gkDiving);
 const skill=clampTo(Number.isFinite(rawSkill)?rawSkill:50,0,100);
 const diving=clampTo(Number.isFinite(rawDiving)?rawDiving:50,0,100);
 const fatigue=clampTo(Number.isFinite(Number(keeper.fatigue))?Number(keeper.fatigue):0,0,1);
 const contactRadius=(26+skill*.18)*(1-.18*fatigue);
 const contactHeight=(63+diving*1.12)*(1-.15*fatigue);
 if(Math.hypot(ball.x-keeper.x,ball.y-keeper.y)>contactRadius||ball.z>contactHeight)return null;
 const activeOutfielder=q=>{
  if(!q||q.keeper||q.t===keeper.t||q.down||!timerClear(q.stun)||!timerClear(q.slideTimer)||
   !timerClear(q.shotImpactKnockdownPending)||!timerClear(q.shotImpactKnockdownTimer)||
   !timerClear(q.shotImpactRiseTimer)||q.action==='shotDown'||q.action==='shotGetUp'||
   ((q.action==='slide'||q.action==='hurt')&&(Number(q.actionTimer)||0)>0))return false;
  const z=q.z==null?0:Number(q.z);
  if(!Number.isFinite(z)||z<0||!Number.isFinite(q.x)||!Number.isFinite(q.y))return false;
  // A live jump can still be below the 18-unit airborne threshold during
  // take-off or landing. In that band use its actual vertical momentum, not
  // a fresh first-jump estimate that ignores the jump already in progress.
  const ballHeight=Math.max(0,ball.z+ball.vz*.12-250*.12*.12);
  const jumpCount=Number.isFinite(Number(q.jumpCount))?Math.max(0,Number(q.jumpCount)):0;
  const liveJump=jumpCount>0&&['jump','doubleJump','idle'].includes(q.action);
  if(liveJump){
   const playerVz=Number.isFinite(q.vz)?q.vz:0;
   const playerHeight=Math.max(0,z+playerVz*.12-540*.12*.12);
   const bodyReach=z<=18?45:126;
   if(ballHeight<playerHeight-10||ballHeight>playerHeight+bodyReach)return false;
  }else if(z<=18&&jumpCount===0){
   // A grounded attacker counts only if a fresh first JUMP can reach the
   // descending ball at the same 120 ms horizon used for XY arrival.
   const rawJumping=q.src?.jumping;
   const parsedJumping=typeof rawJumping==='number'?rawJumping:
    typeof rawJumping==='string'&&rawJumping.trim()!==''?Number(rawJumping):NaN;
   const jump=JUMPMETRICS.jumpMetrics(Number.isFinite(parsedJumping)?parsedJumping:50);
   const jumpHeight=Math.max(0,jump.initialLift+jump.firstImpulse*.12-540*.12*.12)+45;
   if(ballHeight>jumpHeight)return false;
  }else return false;
  return true;
 };
 const arrivals=[];
 for(const opponent of players){
  if(!activeOutfielder(opponent))continue;
  const vx=Number.isFinite(opponent.moveVX)?opponent.moveVX:
   Number.isFinite(opponent.vx)?opponent.vx:0;
  const vy=Number.isFinite(opponent.moveVY)?opponent.moveVY:
   Number.isFinite(opponent.vy)?opponent.vy:0;
  const x=opponent.x+clampTo(vx*.12,-36,36);
  const y=opponent.y+clampTo(vy*.12,-36,36);
  arrivals.push(Math.hypot(x-ball.x,y-ball.y));
 }
 arrivals.sort((a,b)=>a-b);
 if(!arrivals.length)return null;
 const nearestGap=arrivals[0],secondGap=arrivals[1]??Infinity;
 const threshold=clampTo(78-skill*.18+fatigue*18,54,96);
 const closePressure=nearestGap<=threshold;
 const crowdedArrival=nearestGap<=threshold+18&&secondGap<=threshold+32;
 if(!closePressure&&!crowdedArrival)return null;
 const pressure=Math.max(0,threshold-nearestGap)+
  (Number.isFinite(secondGap)?Math.max(0,threshold+32-secondGap)*.45:0);
 return {nearestGap,secondGap,pressure,reason:closePressure?'close-pressure':'crowded-arrival'};
}

// A CPU goalkeeper can claim a reachable targeted lofted pass before an outfielder
// arrives. This is a positioning read only: normal keeper contact/collection owns
// the actual catch, and contested or unsafe crosses keep the existing goal-line read.
function keeperHighCrossClaimTarget(keeper,ball,players,bounds){
 const clampTo=(value,min,max)=>Math.max(min,Math.min(max,value));
 if(!keeper?.keeper||keeper.down||Number(keeper.stun)>0||Number(keeper.z)>18||
  Number(keeper.diveCooldown)>0||
  ['keeperDive','keeperDiveCatch','keeperRecover','keeperHold','shotDown','shotGetUp','hurt'].includes(keeper.action)||
  !ball||ball.owner||ball.pass!==true||ball.passTeam!==1-keeper.t||
  ball.attacker!==1-keeper.t||ball.lastTouchTeam!==1-keeper.t||
  ball.shot||ball.strike||ball.ordinaryShot||!Array.isArray(players)||!players.includes(keeper)||
  ![ball.x,ball.y,ball.z,ball.vx,ball.vy,ball.vz,ball.age].every(Number.isFinite)||
  ball.age<0||ball.age>2.4||ball.z<28||ball.z>170||
  ball.vz< -300||ball.vz>100||ball.passTarget==null)return null;
 const xMin=Number(bounds?.xMin),xMax=Number(bounds?.xMax);
 const yMin=Number(bounds?.yMin),yMax=Number(bounds?.yMax);
 if(![xMin,xMax,yMin,yMax].every(Number.isFinite)||xMin>=xMax||yMin>=yMax)return null;
 const world=GAME_ASSETS.mechanics.world;
 const goalTop=Number(world?.goalTop),goalBottom=Number(world?.goalBottom);
 if(!Number.isFinite(goalTop)||!Number.isFinite(goalBottom)||goalTop>=goalBottom)return null;
 const receiver=players.find(q=>q?.t===1-keeper.t&&q.src?.id===ball.passTarget);
 const timerClear=value=>value==null||(Number.isFinite(Number(value))&&Number(value)<=0);
 const activeOutfielder=q=>q&&!q.keeper&&!q.down&&Number(q.stun||0)<=0&&
  timerClear(q.shotImpactKnockdownPending)&&
  timerClear(q.shotImpactKnockdownTimer)&&
  timerClear(q.shotImpactRiseTimer)&&
  (q.z==null||(Number.isFinite(Number(q.z))&&Number(q.z)<=18))&&
  Number(q.slideTimer||0)<=0&&
  !['shotDown','shotGetUp'].includes(q.action)&&
  !((q.action==='slide'||q.action==='hurt')&&(Number(q.actionTimer)||0)>0)&&
  Number.isFinite(q.x)&&Number.isFinite(q.y);
 if(!activeOutfielder(receiver))return null;
 const flight=(ball.vz+Math.sqrt(ball.vz*ball.vz+1000*ball.z))/500;
 if(!Number.isFinite(flight)||flight<.12||flight>.86||
  (ball.canCollect!=null&&(!Number.isFinite(Number(ball.canCollect))||Number(ball.canCollect)>flight+.08)))return null;
 // Do not send the keeper through an active opponent already contesting the
 // same cross in the air. Project ball and jumper at one shared short horizon.
 const horizon=Math.min(.22,flight);
 const ballAtX=ball.x+ball.vx*horizon,ballAtY=ball.y+ball.vy*horizon;
 const ballAtZ=Math.max(0,ball.z+ball.vz*horizon-250*horizon*horizon);
 for(const q of players){
  if(!q||q===keeper||q.keeper||q.t!==1-keeper.t||q.down||
   !timerClear(q.stun)||!timerClear(q.slideTimer)||
   !timerClear(q.shotImpactKnockdownPending)||!timerClear(q.shotImpactKnockdownTimer)||
   !timerClear(q.shotImpactRiseTimer)||['shotDown','shotGetUp'].includes(q.action)||
   ((q.action==='slide'||q.action==='hurt')&&(Number(q.actionTimer)||0)>0))continue;
  const z=Number(q.z),jumpCount=Number(q.jumpCount);
  if(!Number.isFinite(z)||z<=18||!Number.isFinite(jumpCount)||jumpCount<=0||
   !['jump','doubleJump','idle'].includes(q.action)||!Number.isFinite(q.x)||!Number.isFinite(q.y))continue;
  const playerVz=Number.isFinite(q.vz)?q.vz:0;
  const playerHeight=Math.max(0,z+playerVz*horizon-540*horizon*horizon);
  if(ballAtZ<playerHeight-10||ballAtZ>playerHeight+126)continue;
  const vx=Number.isFinite(q.moveVX)?q.moveVX:Number.isFinite(q.vx)?q.vx:0;
  const vy=Number.isFinite(q.moveVY)?q.moveVY:Number.isFinite(q.vy)?q.vy:0;
  const futureX=q.x+clampTo(vx*horizon,-52,52);
  const futureY=q.y+clampTo(vy*horizon,-52,52);
  if(Math.hypot(futureX-ballAtX,futureY-ballAtY)<=72)return null;
 }
 const dir=keeper.t===0?1:-1,ownGoalX=dir===1?xMin:xMax;
 const xLead=clampTo(ball.vx*flight,-190,190);
 const yLead=clampTo(ball.vy*flight,-160,160);
 const target={
  x:clampTo(ball.x+xLead,xMin+22,xMax-22),
  y:clampTo(ball.y+yLead,yMin+23,yMax-23)
 };
 const depth=(target.x-ownGoalX)*dir;
 const keeperGap=Math.hypot(target.x-keeper.x,target.y-keeper.y);
 const rating=value=>{
  const parsed=typeof value==='number'?value:
   typeof value==='string'&&value.trim()!==''?Number(value):NaN;
  return clampTo(Number.isFinite(parsed)?parsed:50,0,100);
 };
 const skill=rating(keeper.src?.gkSkill),diving=rating(keeper.src?.gkDiving);
 const fatigue=Number.isFinite(keeper.fatigue)?clampTo(keeper.fatigue,0,1):0;
 // Neutral ratings preserve the former 235-unit claim cap. Elite keepers can
 // safely leave farther; fatigue and low keeper attributes shorten the read.
 // Existing movement momentum slightly changes the safe claim envelope: a
 // keeper already moving toward the projected landing can continue the read,
 // while retreating momentum makes the same excursion less safe. Fatigue
 // halves this contribution; a stationary keeper keeps the exact old baseline.
 const keeperVX=Number.isFinite(keeper.moveVX)?keeper.moveVX:Number.isFinite(keeper.vx)?keeper.vx:0;
 const keeperVY=Number.isFinite(keeper.moveVY)?keeper.moveVY:Number.isFinite(keeper.vy)?keeper.vy:0;
 const targetDx=target.x-keeper.x,targetDy=target.y-keeper.y;
 const momentumToward=(keeperVX*targetDx+keeperVY*targetDy)/Math.max(1,keeperGap);
 const momentumBonus=clampTo(momentumToward*.05*(1-fatigue*.5),-12,12);
 // Cross-track momentum needs a bounded reorientation before the keeper can
 // reach the high-cross landing. Keep stationary/aligned baselines unchanged.
 const rawAgility=Number(keeper.src?.agility);
 const agility=clampTo(Number.isFinite(rawAgility)?rawAgility:50,0,100);
 const turnRate=clampTo(3+agility*.13+(skill-50)*.025-fatigue*1.1,4.5,16.5);
 const lateralSpeed=Math.abs((keeperVX*targetDy-keeperVY*targetDx)/Math.max(1,keeperGap));
 const lateralTurnCost=Math.min(18,lateralSpeed/turnRate*.45);
 const claimReach=clampTo(235+(skill-50)*.30+(diving-50)*.20-fatigue*28+
  momentumBonus-lateralTurnCost,185,260);
 if(depth<24||depth>360||target.y<goalTop-230||target.y>goalBottom+230||
  keeperGap<24||keeperGap>Math.min(claimReach,260*flight+32))return null;
 const receiverGap=Math.hypot(receiver.x-target.x,receiver.y-target.y);
 if(receiverGap>260)return null;
 // Grounded runners need a longer arrival read than the separate 0.22-second
 // airborne-body overlap check. Bound both time and total projected travel so
 // a closing attacker can win a genuine landing race without extrapolation
 // through the whole lofted flight.
 const contestHorizon=Math.min(.42,flight);
 const projectedOutfielder=q=>{
  let dx=(Number.isFinite(q.moveVX)?q.moveVX:Number.isFinite(q.vx)?q.vx:0)*contestHorizon;
  let dy=(Number.isFinite(q.moveVY)?q.moveVY:Number.isFinite(q.vy)?q.vy:0)*contestHorizon;
  const lead=Math.hypot(dx,dy);
  if(lead>110){const scale=110/lead;dx*=scale;dy*=scale;}
  return {x:q.x+dx,y:q.y+dy};
 };
 for(const q of players){
  if(q===keeper||!activeOutfielder(q))continue;
  const future=projectedOutfielder(q);
  const gap=Math.hypot(future.x-target.x,future.y-target.y);
  if(q.t!==keeper.t&&gap+34<keeperGap)return null;
  if(q.t===keeper.t&&gap+48<keeperGap)return null;
 }
 return target;
}

return {AI_LEVELS,keeperOutletLane,keeperShotReadY,keeperParryReboundTarget,keeperHighCrossClaimTarget,keeperHighCrossPunchDecision,aiTuning,defensiveCounterpressTrapTarget,defensiveCarrierTurnVelocity:carrierTurnAwareVelocity,defensivePressers,defensivePassLaneCoveredByPrimary,defensiveThirdManRunnerTarget,defensiveCarrierLeadTarget,defensiveCarrierSupportCoverTarget,defensiveTackleSlide,defensiveFirstTouchSlide,defensiveCutbackCoverTarget,defensiveGiveAndGoCoverTarget,attackingSupportRun,attackingThirdManRun,attackingSupportPass,attackingThroughBall,attackingCutbackPass,attackingGoalmouthPass,attackingGiveAndGoRun,attackingGiveAndGoReturnPass,attackingFirstTouchEscape,attackingFirstTouchOutlet,attackingCarryEscapeTarget,defensivePassReceiverCoverTarget,defensiveLoftedPassCoverTarget,defensiveLoftedPassJumpWindow,defensiveLooseBallPrimaryTarget,defensiveLooseBallCoverTarget,defensiveGroundSpillPrimaryTarget,defensiveGroundSpillCoverTarget,defensiveFirstTouchContestTarget,defensiveFirstTouchOutletCoverTarget,defensiveFirstTouchCarryContainTarget,defensiveMagicTrickReadTarget,defensiveMagicReadCounterpressTarget};})();

export {AI};
