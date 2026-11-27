// Supermagic Football v0.8.25.30 | SHOTFEEL | independently editable module
const SHOTFEEL=(()=>{
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const finiteNumber=value=>{
  if(typeof value!=='number'&&!(typeof value==='string'&&value.trim()!==''))return NaN;
  return Number(value);
 };
 const nonnegativeFinite=value=>{
  const n=finiteNumber(value);
  return Number.isFinite(n)?Math.max(0,n):0;
 };
 // Players store world velocity as moveVX/moveVY; vx/vy is a compatibility fallback.
 const movementVelocity=(player,axis)=>{
  const actual=axis==='x'?player?.moveVX:player?.moveVY;
  if(Number.isFinite(actual))return actual;
  const legacy=axis==='x'?player?.vx:player?.vy;
  return Number.isFinite(legacy)?legacy:0;
 };
 // Predict a defender's pass-lane arrival using their current steering intent.
 // Slow or unsteered players retain the original capped linear projection.
 const turnAwarePassProjection=(player,seconds)=>{
  let vx=movementVelocity(player,'x'),vy=movementVelocity(player,'y');
  const speed=Math.hypot(vx,vy);
  const inputX=finiteNumber(player?.dx),inputY=finiteNumber(player?.dy);
  const inputLength=Math.hypot(inputX,inputY);
  if(!Number.isFinite(speed)||speed<75||!Number.isFinite(inputLength)||inputLength<.15){
   return {x:player.x+clamp(vx*seconds,-65,65),y:player.y+clamp(vy*seconds,-65,65)};
  }
  const rawAgility=finiteNumber(player?.src?.agility);
  const agility=clamp(Number.isFinite(rawAgility)?rawAgility:50,1,100);
  const desiredX=inputX/inputLength,desiredY=inputY/inputLength;
  let remaining=clamp(seconds,0,.35),travelX=0,travelY=0;
  while(remaining>1e-6){
   const step=Math.min(.18,remaining),currentSpeed=Math.hypot(vx,vy);
   if(currentSpeed<75)break;
   const currentX=vx/currentSpeed,currentY=vy/currentSpeed;
   const dot=clamp(currentX*desiredX+currentY*desiredY,-1,1);
   if(dot>.995){
    travelX+=vx*step;travelY+=vy*step;remaining-=step;continue;
   }
   const cross=currentX*desiredY-currentY*desiredX;
   const angle=Math.atan2(cross,dot);
   const maxTurn=(3+agility*.13)*step;
   const turn=Math.abs(angle)<=maxTurn?angle:
    (Math.sign(cross)||(player?.t===0?1:-1))*maxTurn;
   const cosine=Math.cos(turn),sine=Math.sin(turn);
   const nextVX=(currentX*cosine-currentY*sine)*currentSpeed;
   const nextVY=(currentX*sine+currentY*cosine)*currentSpeed;
   travelX+=(vx+nextVX)*.5*step;
   travelY+=(vy+nextVY)*.5*step;
   vx=nextVX;vy=nextVY;remaining-=step;
  }
  return {x:player.x+clamp(travelX,-65,65),y:player.y+clamp(travelY,-65,65)};
 };
 // Contact and shot-impact recovery temporarily remove a player from ground-pass
 // interception and receiver-crowding reads. Timers clearing restores the defender.
 const inUnavailableRecovery=player=>
  (player?.action==='hurt'&&finiteNumber(player.actionTimer)>0)||
  finiteNumber(player?.shotImpactKnockdownPending)>0||
  finiteNumber(player?.shotImpactKnockdownTimer)>0||
  finiteNumber(player?.shotImpactRiseTimer)>0;
 function launchPower(power,fatigue=0,superShot=false){
  const rating=clamp(Number(power)||50,1,100),tired=clamp(Number(fatigue)||0,0,1);
  return (superShot?1.15:1.19)*(.72+rating*.005)*(.99-.32*tired);
 }
 function flightDrag(dt=1/60,superShot=false){return Math.pow(superShot?.997:.995,Math.max(0,dt)*60);}
 function impactFactor(distance=0,superShot=false){
  const travel=finiteNumber(distance),safeDistance=Number.isFinite(travel)?Math.max(0,travel):Infinity;
  return clamp(1-safeDistance/(superShot?1950:1450),superShot?.33:.21,1);
 }
 function contactEnergy(power,speed,distance,superShot=false){
  // Malformed flight data must not turn a contact into NaN/Infinity or an
  // overpowered stun. Invalid travel distance conservatively uses max falloff.
  const travel=finiteNumber(distance);
  const falloffDistance=Number.isFinite(travel)?Math.max(0,travel):Infinity;
  return (nonnegativeFinite(power)+nonnegativeFinite(speed)/45)*impactFactor(falloffDistance,superShot);
 }
 function lanePreference(shooterX,shooterY,goalX,goalY,keeper,accuracy=65){
  const gap=keeper?Math.abs(goalY-keeper.y):145;
  const path=keeper?Math.abs((shooterY+(goalY-shooterY)*clamp((keeper.x-shooterX)/(goalX-shooterX||1),0,1))-keeper.y):145;
  return gap*.42+path*(.45+clamp(accuracy/100,0,1)*.6);
 }
 // Only strong, plausible positions justify an early AI shot over a safety pass.
 // Intent is better shot creation, not more speculative shots from midfield.
 function aiFinishingPriority(distance,nearestDefender,accuracy,baseRate){
  const d=typeof distance==='number'?distance:
   typeof distance==='string'&&distance.trim()!==''?Number(distance):NaN;
  if(!Number.isFinite(d)||d<0)return 0;
  const pressure=Math.max(0,Number(nearestDefender)||0);
  if(d>710)return 0;
  const near=clamp((710-d)/540,0,1),quality=clamp((Number(accuracy)||50)/100,0,1);
  const congestion=pressure<85?.62:pressure<145?.82:1;
  return clamp((.12+near*.51+quality*.18)*congestion*(.72+clamp(Number(baseRate)||0,0,1)),.04,.90);
 }
 // Directed passes favor receivers with an open lane over tightly marked ones.
 // A single strongest blocker/marker applies a bounded penalty. Missing opponent
 // context preserves the previous selection behavior and four-button controls.
 function passingLanePressure(from,receiver,opponents){
  if(!Array.isArray(opponents)||!opponents.length)return 0;
  const dx=receiver.x-from.x,dy=receiver.y-from.y,segment=dx*dx+dy*dy;
  if(!Number.isFinite(segment)||segment<=0)return 0;
  let strongest=0,second=0;
  for(const rival of opponents){
   if(!rival||!Number.isFinite(rival.x)||!Number.isFinite(rival.y)||inUnavailableRecovery(rival))continue;
   // DOWNED-LANE-READ-01: a defender lying on the pitch or getting up
   // cannot actively mark a receiver or cut out a ground pass. Do not let
   // stale proximity pressure steer PASS away from a genuinely open lane.
   if(rival.action==='shotDown'||rival.action==='shotGetUp'||
      (rival.action==='jump'&&Number.isFinite(rival.z)&&rival.z>25))continue;
   // A defender recovering before a ground pass arrives can still intercept.
   // Longer stuns remain harmless; compare against the same bounded flight window.
   const passLookahead=Math.min(.35,Math.max(.12,Math.sqrt(segment)/1400));
   // A stunned defender matters only if awake when the ball reaches
   // that defender's position along the lane, not merely before the pass ends.
   const along=((rival.x-from.x)*dx+(rival.y-from.y)*dy)/segment;
   const arrival=clamp(along,0,1)*passLookahead;
   if(Number.isFinite(rival.stun)&&rival.stun>arrival)continue;
   // A defender already moving into the passing lane is more dangerous than
   // one moving away. Limit the lookahead to keep sudden AI changes readable.
   // A live slide is not ordinary moveVX/moveVY movement: its direction,
   // remaining distance and timers define a bounded swept path. Compare that
   // path with the ball at the same time so a late or retreating slide cannot
   // falsely close an otherwise safe ground-pass lane.
   const lookahead=passLookahead;
   const activeSlide=rival.action==='slide'&&Number.isFinite(rival.actionTimer)&&
    rival.actionTimer>0&&Number.isFinite(rival.slideTimer)&&rival.slideTimer>0;
   if(activeSlide){
    const rawSpeed=finiteNumber(rival.slideSpeed),remaining=finiteNumber(rival.slideRemaining);
    const slideX=finiteNumber(rival.slideDX),slideY=finiteNumber(rival.slideDY);
    const directionLength=Math.hypot(slideX,slideY);
    if(!Number.isFinite(rawSpeed)||rawSpeed<200||!Number.isFinite(remaining)||remaining<=0||
       !Number.isFinite(directionLength)||directionLength<.5)continue;
    const slideSpeed=clamp(rawSpeed,200,720);
    const slideDuration=Math.min(lookahead,rival.actionTimer,rival.slideTimer,remaining/slideSpeed);
    if(!(slideDuration>0))continue;
    const ux=slideX/directionLength,uy=slideY/directionLength;
    const relativeX=rival.x-from.x,relativeY=rival.y-from.y;
    const relativeVX=ux*slideSpeed-dx/lookahead;
    const relativeVY=uy*slideSpeed-dy/lookahead;
    const relativeSpeedSquared=relativeVX*relativeVX+relativeVY*relativeVY;
    const closestTime=relativeSpeedSquared>1e-6
     ?clamp(-(relativeX*relativeVX+relativeY*relativeVY)/relativeSpeedSquared,0,slideDuration)
     :0;
    const slideGap=Math.hypot(relativeX+relativeVX*closestTime,relativeY+relativeVY*closestTime);
    const slidePressure=slideGap<64?.24*clamp((64-slideGap)/12,0,1):0;
    if(slidePressure>strongest){second=strongest;strongest=slidePressure;}
    else if(slidePressure>second)second=slidePressure;
    continue;
   }
   const vx=movementVelocity(rival,'x');
   const vy=movementVelocity(rival,'y');
   // Longer passes give moving defenders more time to close the lane; short
   // passes retain the snappy near-instant read. Bound prediction for fairness.
   const future=turnAwarePassProjection(rival,lookahead);
   const futureX=future.x,futureY=future.y;
   const marker=Math.max(0,1-Math.hypot(futureX-receiver.x,futureY-receiver.y)/90)*.12;
   const t=((futureX-from.x)*dx+(futureY-from.y)*dy)/segment;
   let blocker=0;
   if(t>.045&&t<.97){
    const lateral=Math.hypot(futureX-from.x-t*dx,futureY-from.y-t*dy);
    blocker=Math.max(0,1-lateral/75)*.19;
   }
   // Near-foot interceptions count too: defenders just beyond the passer
   // or just before the receiver can still cut out a short ground pass.
   // A fast defender may cross the entire lane between now and the predicted
   // endpoint. Check the swept crossing, not only the two endpoints.
   const startSide=(rival.x-from.x)*dy-(rival.y-from.y)*dx;
   const endSide=(futureX-from.x)*dy-(futureY-from.y)*dx;
   if(startSide*endSide<0){
    const fraction=startSide/(startSide-endSide);
    const crossX=rival.x+(futureX-rival.x)*fraction;
    const crossY=rival.y+(futureY-rival.y)*fraction;
    const crossT=((crossX-from.x)*dx+(crossY-from.y)*dy)/segment;
    // A crossing only intercepts if the defender reaches that point near
    // the ball's progress. A late sweep behind an already-passed ball
    // must not turn an otherwise open receiver into a blocked lane.
    const ballArrival=crossT*lookahead;
    const defenderArrival=fraction*lookahead;
    if(crossT>.045&&crossT<.97&&defenderArrival<=ballArrival+.055)blocker=Math.max(blocker,.19);
   }
   // A defender arriving only after the ball has passed cannot intercept.
   // Keep already-close markers dangerous, including slow and stationary ones.
   const speed=Math.hypot(vx,vy);
   if(blocker>0&&speed>1){
    const startT=clamp(((rival.x-from.x)*dx+(rival.y-from.y)*dy)/segment,0,1);
    const startGap=Math.hypot(rival.x-from.x-startT*dx,rival.y-from.y-startT*dy);
    const projectedT=clamp(t,0,1);
    const travelTime=Math.max(0,startGap-40)/speed;
    if(startGap>75&&travelTime>projectedT*lookahead+.055)blocker=0;
   }
   const pressure=marker+blocker;
   if(pressure>strongest){second=strongest;strongest=pressure;}
   else if(pressure>second)second=pressure;
  }
  // Two independent defenders closing the same lane are harder to bypass;
  // cap the extra risk so alignment and distance still govern pass choice.
  return Math.min(.32,strongest+second*.35);
 }
 function teammateInDirection(from,mates,vector,maxDistance=1300,opponents=null){
  if(!Number.isFinite(from?.x)||!Number.isFinite(from?.y)||!Array.isArray(mates)||
     !Number.isFinite(vector?.x)||!Number.isFinite(vector?.y)||
     !Number.isFinite(maxDistance)||maxDistance<=28)return null;
  const m=Math.hypot(vector.x,vector.y);if(m<.16)return null;
  const hx=vector.x/m,hy=vector.y/m;
  // Alignment remains the main criterion; modest range cost avoids selecting
  // a remote player over an almost equally aligned, reachable nearby option.
  return mates.map(q=>{
   if(!q||q===from||q.stun>0||!Number.isFinite(q.x)||!Number.isFinite(q.y))return null;
   const dx=q.x-from.x,dy=q.y-from.y,d=Math.hypot(dx,dy);
   if(d<=28||d>maxDistance)return null;
   const alignment=(dx*hx+dy*hy)/d;
   if(alignment<.77)return null;
   // Bounded lead preference for receivers already moving forward; invalid velocities are neutral.
   const vx=movementVelocity(q,'x'),vy=movementVelocity(q,'y');
   const forwardSpeed=vx*hx+vy*hy;
   const momentumBonus=Math.max(0,clamp(forwardSpeed/320,-1,1))*.028;
   // A receiver sprinting back toward the passer is less ready for a forward
   // ground pass than a nearby settled teammate. Never reject the only target.
   const retreatPenalty=clamp((-forwardSpeed-85)/280,0,1)*.045;
   // Fast lateral runners may leave the intended ground-pass lane before arrival.
   // Bound this penalty so alignment, distance and forward momentum still matter.
   const lateralSpeed=Math.abs(vx*hy-vy*hx);
   // Sideways motion toward the aimed line helps a teammate settle under a pass;
   // motion away from that line is more likely to miss the reception.
   const sideOffset=dx*hy-dy*hx;
   const lateralVelocity=vx*hy-vy*hx;
   const correcting=sideOffset*lateralVelocity<0;
   const lateralPenalty=clamp((lateralSpeed-85)/350,0,1)*.045*(correcting?.35:1);
   // The target may drift away from the aimed cone before the ground pass
   // arrives. Predict only a short, bounded reception interval; never reject
   // the sole receiver or let extreme/invalid velocities dominate alignment.
   const arrivalSeconds=clamp(d/1400,.12,.35);
   const leadX=dx+clamp(vx*arrivalSeconds,-70,70);
   const leadY=dy+clamp(vy*arrivalSeconds,-70,70);
   const leadDistance=Math.hypot(leadX,leadY);
   const arrivalAlignment=leadDistance>28?(leadX*hx+leadY*hy)/leadDistance:alignment;
   const arrivalPenalty=clamp((alignment-arrivalAlignment)*.38,0,.085);
   // Evaluate markers at the predicted reception point, not the receiver's stale feet.
   // The same capped lead used for alignment prevents unrealistic long-range extrapolation.
   // A moving receiver running into a defender at the predicted collection point
   // is riskier than a settled receiver. Keep this modest and bounded so an
   // available lone teammate is still passable and bad velocity data is neutral.
   const moving=Math.hypot(vx,vy)>85;
   const receptionCrowding=moving&&Array.isArray(opponents)?opponents.reduce((risk,rival)=>{
    // DOWNED-ARRIVAL-CROWD-01: a knocked-down or recovering defender cannot crowd a runner's collection point.
    if(!rival||!Number.isFinite(rival.x)||!Number.isFinite(rival.y)||rival.stun>arrivalSeconds||
       rival.action==='shotDown'||rival.action==='shotGetUp'||inUnavailableRecovery(rival)||
       (rival.action==='jump'&&Number.isFinite(rival.z)&&rival.z>25))return risk;
    const rx=rival.x+clamp((Number.isFinite(rival.vx)?rival.vx:0)*arrivalSeconds,-65,65);
    const ry=rival.y+clamp((Number.isFinite(rival.vy)?rival.vy:0)*arrivalSeconds,-65,65);
    return Math.max(risk,clamp(1-Math.hypot(rx-from.x-leadX,ry-from.y-leadY)/80,0,1)*.085);
   },0):0;
   // Ground passes are harder to collect during a high jump. Prefer an equally
   // open grounded receiver, but never make the airborne player unselectable.
   const airbornePenalty=Number.isFinite(q.z)?clamp((q.z-12)/65,0,1)*.065:0;
   // A teammate committed to a slide cannot immediately settle a ground pass.
   // Prefer an equally open upright receiver, but keep a lone sliding target valid.
   const slidePenalty=q.action==='slide'&&(!Number.isFinite(q.actionTimer)||q.actionTimer>0)? .07:0;
   // A teammate knocked down by a shot is not immediately ready to collect a
   // ground pass. Prefer an otherwise equivalent standing receiver; still
   // allow a pass to the downed player when they are the only viable option.
   const recoveryPenalty=(q.action==='shotDown'||q.action==='shotGetUp')?.085:0;
   // HURT-RECEIVER-READY-01: a teammate still recoiling from contact is less
   // ready to collect a pass than an equally open, settled teammate.
   // Preserve the only available receiver as a valid choice.
   const hurtPenalty=q.action==='hurt'&&(!Number.isFinite(q.actionTimer)||q.actionTimer>0)?.075:0;
   return {q,d,score:alignment-.18*(d/maxDistance)-passingLanePressure(from,{x:from.x+leadX,y:from.y+leadY},opponents)+momentumBonus-retreatPenalty-lateralPenalty-arrivalPenalty-receptionCrowding-airbornePenalty-slidePenalty-recoveryPenalty-hurtPenalty};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.d-b.d)[0]?.q||null;
 }
 return {launchPower,flightDrag,impactFactor,contactEnergy,lanePreference,aiFinishingPriority,passingLanePressure,teammateInDirection};
})();

export {SHOTFEEL};
