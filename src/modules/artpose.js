// Supermagic Football v0.8.25.30 | ARTPOSE | independently editable module
const ARTPOSE=(()=>{
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function easeHeading(previous,target,dt){
  const step=clamp(Number(dt)||0,0,.05), to=Number(target)||0;
  if(!Number.isFinite(previous))return {heading:to,lag:0};
  const difference=Math.atan2(Math.sin(to-previous),Math.cos(to-previous));
  const heading=previous+difference*(1-Math.exp(-14*step));
  const lag=Math.atan2(Math.sin(to-heading),Math.cos(to-heading));
  return {heading,lag:clamp(lag,-.68,.68)};
 }
 // Shared dive/landing anchor: end of dive exactly matches beginning of recovery.
 // Visual geometry only; no change to actual position, reach, speed or catch timing.
 function keeperPose(action,diveElapsed=0,actionTimer=0,diveDy=0,face=1){
  const sign=diveDy<0?-1:1,heading=face<0?-1:1;
  const diveLean=.82;
  const endpoint=Math.sin(Math.PI*.72);
  const terminal={x:heading*28,y:sign*(8+30*endpoint)+4,angle:sign*(.22+diveLean*endpoint)+heading*.16*endpoint};
  if(action==='keeperDive'||action==='keeperDiveCatch'){
   const phase=clamp((Number(diveElapsed)||0)/.60,0,1),sweep=Math.sin(phase*Math.PI*.72);
   // Lean the whole keeper silhouette farther into the save so the torso and
   // trailing legs read as a dive, not only extended gloves and streaks.
   return {x:heading*(7+21*phase),y:sign*(8+30*sweep)+4,angle:sign*(.22+diveLean*sweep)+heading*.16*sweep};
  }
  if(action==='keeperRecover'){
   const fraction=clamp((Number(actionTimer)||0)/.34,0,1),blend=fraction*fraction*(3-2*fraction);
   return {x:terminal.x*blend,y:terminal.y*blend,angle:terminal.angle*blend};
  }
  return {x:0,y:0,angle:0};
 }
 // Planted leg stays on the turf; only the forward swinging leg leaves the ground.
 function gait(cycle,{side=false,quarter=false,active=false,sliding=false,jumping=false,recovering=false}={}){
  const phase=clamp(Number(cycle)||0,-1,1);
  const stride=phase*(side?19:quarter?14:11)+(active?12:0)+(sliding?19:0);
  const swingLift=Math.pow(Math.max(0,phase),1.55)*(side?11:9);
  const lift=swingLift+(active?15:0)+(sliding?6:0)+(jumping?5:0);
  const crouch=recovering?Math.min(1,Math.max(0,recovering))*9:0;
  return {stride,lift,kneeBend:2.3+lift*.37+crouch,stance:phase<=0&&!active&&!sliding&&!jumping};
 }
 // Keep the legacy arm/body oscillator and the articulated foot phases on the
 // same player-specific cadence. This is deterministic and render-only.
 function runPhase(anim,runRate=1,playerIndex=0){
  const a=Number(anim),r=Number(runRate),i=Number(playerIndex);
  return (Number.isFinite(a)?a:0)*17*(Number.isFinite(r)&&r!==0?r:1)+(Number.isFinite(i)?i:0)*.35;
 }
 // Per-leg, render-only foot path. `phase` is the unwrapped-or-wrapped gait
 // angle in radians; the caller offsets the opposite leg by PI. During stance
 // the boot travels backward under the body, returning continuously to the
 // swing path at toe-off/touchdown. Speed ratio scales visual stride and flex;
 // this helper never reads or writes simulation state or time.
 function runFootPose(phase,speedRatio=1,out){
  const TWO_PI=Math.PI*2,raw=Number(phase),angle=((Number.isFinite(raw)?raw:0)%TWO_PI+TWO_PI)%TWO_PI;
  const speed=clamp(Number.isFinite(Number(speedRatio))?Number(speedRatio):0,0,1);
  const stance=angle>=Math.PI;
  const amplitude=9*speed;
  let contactOffset;
  if(stance){
   const progress=(angle-Math.PI)/Math.PI;
   contactOffset=amplitude*(1-2*progress);
  }else{
   const progress=angle/Math.PI,eased=(1-Math.cos(Math.PI*progress))*.5;
   contactOffset=amplitude*(-1+2*eased);
  }
  if(speed===0)contactOffset=0;
  const wave=Math.sin(angle),kneeFlex=Math.max(0,(stance?-wave*.16:wave*.65)*speed);
  const toeFlex=Math.max(0,(stance?-wave*.08:wave*.42)*speed);
  const pose=out||{};
  pose.stance=stance;pose.contactOffset=contactOffset;pose.kneeFlex=kneeFlex;pose.toeFlex=toeFlex;
  return pose;
 }
 // Smooth foot phases on abrupt stop/start; stationary targets settle to a grounded stance.
 // This is a rendering-only filter, not a player velocity or fatigue model.
 function settleStride(previous,oscillator,moving,dt){
  const delta=clamp(Number(dt)||0,0,.05),prev=Number.isFinite(previous)?clamp(previous,-1,1):0;
  const target=moving?clamp(Number(oscillator)||0,-1,1):0;
  return prev+(target-prev)*(1-Math.exp(-(moving?24:15)*delta));
 }
 function receivePose(actionTimer,pressure=0){
  const remaining=clamp((Number(actionTimer)||0)/.29,0,1),danger=clamp(Number(pressure)||0,0,1);
  const wave=Math.sin(Math.PI*remaining);
  return {crouch:(2.2+4.8*danger)*wave,lean:(.035+.085*danger)*wave,brace:danger*wave};
 }
 // Confused-eye curl follows the existing shot-stun timer. Reduced-flash
 // holds a clear still spiral instead of animating it; this is render-only.
 function confusionPose(timer,time,reducedFlash=false){
  const remaining=clamp(Number(timer)||0,0,2),intensity=clamp(remaining/.16,0,1);
  const phase=reducedFlash?0:(Number.isFinite(Number(time))?Number(time):0)*3.2;
  return {intensity,eyeSpin:phase,headBob:reducedFlash?0:Math.sin(phase)*1.4*intensity};
 }
 // Render-only stumble arc for a Super Shot launch. The pulse follows the
 // existing 1.1s launched action timer and settles back to neutral at either
 // end, leaving knockdown/landing timing and all gameplay state untouched.
 function shotImpactLaunchPose(action,actionTimer=0,face=1){
  if(action!=='launched')return {angle:0,armSpread:0};
  const raw=Number(actionTimer),remaining=clamp(Number.isFinite(raw)?raw:0,0,1.1);
  const progress=1-remaining/1.1,pulse=Math.sin(Math.PI*progress),heading=Number(face)<0?-1:1;
  const settled=pulse<1e-9?0:pulse;
  return {angle:settled===0?0:heading*.78*settled,armSpread:settled};
 }
 // Separate the grounded hold from a short, explicit recovery push-up. This
 // uses the engine's existing shotGetUp action timer and never changes timing.
 function shotImpactRecoveryPose(action,actionTimer=.24,face=1){
  if(action!=='shotGetUp')return {progress:0,support:0,angle:0,lift:0};
  const duration=.24,raw=Number(actionTimer),remaining=clamp(Number.isFinite(raw)?raw:0,0,duration);
  const linear=1-remaining/duration,progress=linear*linear*(3-2*linear),rawSupport=Math.sin(Math.PI*progress);
  const support=rawSupport<1e-9?0:rawSupport;
  const heading=Number(face)<0?-1:1;
  const rawAngle=1.32*(1-progress)-.16*support,angle=Math.abs(rawAngle)<1e-9?0:heading*rawAngle;
  return {progress,support,angle,lift:10*progress};
 }
  // Turn a shot launch into a readable grounded fall over a short settle phase.
  // Hold timing stays owned by the engine's existing strength-based timer.
  function shotImpactDownPose(action,actionTimer=0,knockdownTotal=0,face=1){
    if(action!=='shotDown')return {progress:0,angle:0};
    const rawTotal=Number(knockdownTotal),fallback=Number(actionTimer),total=Number.isFinite(rawTotal)&&rawTotal>0
      ?clamp(rawTotal,.5,3):Number.isFinite(fallback)&&fallback>0?clamp(fallback,.5,3):1.5;
    const rawRemaining=Number(actionTimer),remaining=clamp(Number.isFinite(rawRemaining)?rawRemaining:total,0,total);
    const settle=clamp((total-remaining)/.20,0,1),progress=settle*settle*(3-2*settle),heading=Number(face)<0?-1:1;
    const angle=heading*1.32*progress;
    return {progress,angle:Math.abs(angle)<1e-12?0:angle};
   }
 // Visual follow-through on ordinary passes. Zero at release and at completion;
 // only the kicking boot lifts, and the supporting boot stays planted.
 function passFollowThrough(action,actionTimer){
  if(action!=='pass')return {stride:0,lift:0,lean:0};
  const remaining=clamp(Number(actionTimer)||0,0,.30)/.30;
  const swing=Math.sin(Math.PI*(1-remaining));
  return {stride:13*swing,lift:9*swing,lean:.095*swing};
 }
 function keeperRelease(action,actionTimer,poseDuration=0){
  if(action!=='keeperThrow'&&action!=='keeperPunt')return {throwing:false,punting:false,windup:0,follow:0};
  const fallbackDuration=action==='keeperPunt'?.64:.48,requested=Number(poseDuration);
  const duration=Number.isFinite(requested)&&requested>0?clamp(requested,.12,1.2):fallbackDuration;
  const progress=1-clamp((Number(actionTimer)||0)/duration,0,1),follow=progress*progress*(3-2*progress),rawWindup=Math.sin(Math.PI*progress);
  const windup=rawWindup<1e-9?0:rawWindup;
  return {throwing:action==='keeperThrow',punting:action==='keeperPunt',windup,follow};
 }
 // A held keeper ball is painted at the gloves/chest; the simulation ball
 // remains at its ordinary physics coordinates. This is presentation only.
 function keeperGrip(action,face=1){
  if(action!=='keeperCatch'&&action!=='keeperHold')return null;
  return {x:Number(face)<0?-5:5,y:-59};
 }
 // Visual-only penalty JUMP animation; no game-state or save mutations.
 function penaltyKeeperVisual(pk,cy){
  const boost=Number.isFinite(pk?.diveBoost)?Math.max(0,Math.min(.38,pk.diveBoost)):0;
  const cooldown=Number.isFinite(pk?.diveCooldown)?Math.max(0,Math.min(.8,pk.diveCooldown)):0;
  const offset=Number(pk?.saveY)-Number(cy);
  const diveDy=Number.isFinite(offset)&&offset<-.5?-1:1;
  if(boost>0)return {action:'keeperDive',diveElapsed:(.38-boost)/.38*.6,actionTimer:boost,diveDy};
  if(cooldown>.08&&cooldown<=.420001)return {action:'keeperRecover',diveElapsed:.6,actionTimer:Math.min(.34,cooldown-.08),diveDy};
  return {action:'idle',diveElapsed:0,actionTimer:0,diveDy:0};
 }
  return Object.freeze({easeHeading,gait,runPhase,runFootPose,keeperPose,settleStride,receivePose,confusionPose,shotImpactLaunchPose,shotImpactDownPose,shotImpactRecoveryPose,passFollowThrough,keeperRelease,keeperGrip,penaltyKeeperVisual});
})();

export {ARTPOSE};
