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
  const endpoint=Math.sin(Math.PI*.72);
  const terminal={x:heading*28,y:sign*(8+30*endpoint)+4,angle:sign*(.22+.52*endpoint)+heading*.16*endpoint};
  if(action==='keeperDive'||action==='keeperDiveCatch'){
   const phase=clamp((Number(diveElapsed)||0)/.60,0,1),sweep=Math.sin(phase*Math.PI*.72);
   return {x:heading*(7+21*phase),y:sign*(8+30*sweep)+4,angle:sign*(.22+.52*sweep)+heading*.16*sweep};
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
 // Visual follow-through on ordinary passes. Zero at release and at completion;
 // only the kicking boot lifts, and the supporting boot stays planted.
 function passFollowThrough(action,actionTimer){
  if(action!=='pass')return {stride:0,lift:0,lean:0};
  const remaining=clamp(Number(actionTimer)||0,0,.30)/.30;
  const swing=Math.sin(Math.PI*(1-remaining));
  return {stride:13*swing,lift:9*swing,lean:.095*swing};
 }
 function keeperRelease(action,actionTimer){
  if(action!=='keeperThrow'&&action!=='keeperPunt')return {throwing:false,punting:false,windup:0,follow:0};
  const duration=action==='keeperPunt'?.64:.48;
  const progress=1-clamp((Number(actionTimer)||0)/duration,0,1);
  return {throwing:action==='keeperThrow',punting:action==='keeperPunt',windup:Math.sin(Math.PI*progress),follow:progress};
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
 return Object.freeze({easeHeading,gait,keeperPose,settleStride,receivePose,passFollowThrough,keeperRelease,penaltyKeeperVisual});
})();

export {ARTPOSE};
