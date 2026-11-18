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
   if(!rival||!Number.isFinite(rival.x)||!Number.isFinite(rival.y))continue;
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
   const vx=Number.isFinite(rival.vx)?rival.vx:0;
   const vy=Number.isFinite(rival.vy)?rival.vy:0;
   // Longer passes give moving defenders more time to close the lane; short
   // passes retain the snappy near-instant read. Bound prediction for fairness.
   const lookahead=passLookahead;
   const futureX=rival.x+Math.max(-65,Math.min(65,vx*lookahead));
   const futureY=rival.y+Math.max(-65,Math.min(65,vy*lookahead));
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
   const vx=Number.isFinite(q.vx)?q.vx:0,vy=Number.isFinite(q.vy)?q.vy:0;
   const momentumBonus=Math.max(0,clamp((vx*hx+vy*hy)/320,-1,1))*.028;
   // Fast lateral runners may leave the intended ground-pass lane before arrival.
   // Bound this penalty so alignment, distance and forward momentum still matter.
   const lateralSpeed=Math.abs(vx*hy-vy*hx);
   const lateralPenalty=clamp((lateralSpeed-85)/350,0,1)*.045;
   // Ground passes are harder to collect during a high jump. Prefer an equally
   // open grounded receiver, but never make the airborne player unselectable.
   const airbornePenalty=Number.isFinite(q.z)?clamp((q.z-12)/65,0,1)*.065:0;
   return {q,d,score:alignment-.18*(d/maxDistance)-passingLanePressure(from,q,opponents)+momentumBonus-lateralPenalty-airbornePenalty};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.d-b.d)[0]?.q||null;
 }
 return {launchPower,flightDrag,impactFactor,contactEnergy,lanePreference,aiFinishingPriority,teammateInDirection};
})();

export {SHOTFEEL};
