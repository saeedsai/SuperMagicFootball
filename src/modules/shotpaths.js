/** Deterministic SH01 zigzag lane displacement, shared by ball and keeper prediction.
 * Every sample includes fade-out velocity so shots return to their original
 * flight heading instead of drifting sideways after the transformation ends.
 */
const TRANSFORM_SECONDS=1.65;
const CURVE_AMPLITUDE=38;
const SPIRAL_AMPLITUDE=42;
const SPIRAL_HEIGHT=28;
const WARP_AMPLITUDE=28;
const MAX_RICOCHET_BOUNCES=2;
const MAX_HOMING_OFFSET=70;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const PROFILES=Object.freeze({books:Object.freeze({amplitude:28,frequency:10}),serpent:Object.freeze({amplitude:45,frequency:15})});
function zigzagProfile(shot={}){
 const base=PROFILES[shot?.id]||{amplitude:36,frequency:11};
 const amplitude=Number.isFinite(Number(shot?.zigzagAmplitude))?clamp(Number(shot.zigzagAmplitude),10,65):base.amplitude;
 const frequency=Number.isFinite(Number(shot?.zigzagFrequency))?clamp(Number(shot.zigzagFrequency),6,18):base.frequency;
 return {amplitude,frequency,direction:shot?.direction===-1?-1:1};
}
function zigzagSample(shot,age){
 if(!Number.isFinite(age))return {offset:0,velocity:0};
 const {amplitude,frequency,direction}=zigzagProfile(shot);
 const t=clamp(age,0,TRANSFORM_SECONDS),phase=t*frequency;
 const sin=Math.sin(phase),cos=Math.cos(phase),fadeTime=.35;
 let fade=1,fadeDerivative=0;
 if(t>TRANSFORM_SECONDS-fadeTime){
  const q=clamp((TRANSFORM_SECONDS-t)/fadeTime,0,1);
  fade=q*q*(3-2*q);fadeDerivative=-6*q*(1-q)/fadeTime;
 }
 const amp=direction*amplitude;
 return {offset:amp*sin*sin*sin*fade,velocity:amp*(3*frequency*sin*sin*cos*fade+sin*sin*sin*fadeDerivative)};
}
function zigzagStep(shot,fromAge,toAge){
 if(!Number.isFinite(fromAge)||!Number.isFinite(toAge)||toAge<=fromAge)
  return {deltaVy:0,correctionY:0};
 const start=zigzagSample(shot,fromAge),end=zigzagSample(shot,toAge),dt=toAge-fromAge;
 return {deltaVy:end.velocity-start.velocity,correctionY:end.offset-start.offset-end.velocity*dt};
}
// Banana Shot's signed double bend. A smooth, bounded full sine cycle starts
// and ends at the launch lane, with zero lateral velocity at both ends.
function curveProfile(shot={}){
 const requested=Number(shot?.curveAmplitude);
 const amplitude=Number.isFinite(requested)?clamp(requested,12,60):CURVE_AMPLITUDE;
 return {amplitude,direction:shot?.direction===-1?-1:1};
}
function curveSample(shot,age){
 if(!Number.isFinite(age))return {offset:0,velocity:0};
 const {amplitude,direction}=curveProfile(shot),t=clamp(age,0,TRANSFORM_SECONDS);
 const phase=2*Math.PI*t/TRANSFORM_SECONDS,sin=Math.sin(phase),cos=Math.cos(phase);
 const frequency=2*Math.PI/TRANSFORM_SECONDS,scale=direction*amplitude;
 return {offset:scale*sin*sin*sin,velocity:scale*3*frequency*sin*sin*cos};
}
function curveStep(shot,fromAge,toAge){
 if(!Number.isFinite(fromAge)||!Number.isFinite(toAge)||toAge<=fromAge)
  return {deltaVy:0,correctionY:0};
 const start=curveSample(shot,fromAge),end=curveSample(shot,toAge),dt=toAge-fromAge;
 return {deltaVy:end.velocity-start.velocity,correctionY:end.offset-start.offset-end.velocity*dt};
}
function spiralProfile(shot={}){
 const requested=Number(shot?.spiralAmplitude),height=Number(shot?.spiralHeight);
 return {amplitude:Number.isFinite(requested)?clamp(requested,12,65):SPIRAL_AMPLITUDE,
  height:Number.isFinite(height)?clamp(height,8,42):SPIRAL_HEIGHT,direction:shot?.direction===-1?-1:1};
}
function spiralSample(shot,age){
 if(!Number.isFinite(age))return {offset:0,velocity:0,height:0,verticalVelocity:0};
 const {amplitude,height,direction}=spiralProfile(shot),t=clamp(age,0,TRANSFORM_SECONDS),u=t/TRANSFORM_SECONDS;
 const phase=2*Math.PI*u,frequency=2*Math.PI/TRANSFORM_SECONDS,sin=Math.sin(phase),cos=Math.cos(phase);
 const fade=u<=0||u>=1?0:1;
 return {offset:direction*amplitude*sin*sin*sin*fade,
  velocity:direction*amplitude*3*frequency*sin*sin*cos*fade,
  height:height*sin*sin*fade,
  verticalVelocity:height*2*frequency*sin*cos*fade};
}
function spiralStep(shot,fromAge,toAge){
 if(!Number.isFinite(fromAge)||!Number.isFinite(toAge)||toAge<=fromAge)
  return {deltaVy:0,correctionY:0,deltaVz:0,correctionZ:0};
 const start=spiralSample(shot,fromAge),end=spiralSample(shot,toAge),dt=toAge-fromAge;
 return {deltaVy:end.velocity-start.velocity,correctionY:end.offset-start.offset-end.velocity*dt,
  deltaVz:end.verticalVelocity-start.verticalVelocity,correctionZ:end.height-start.height-end.verticalVelocity*dt};
}
function ricochetBounce(bounces,velocity,restitution=.65,outwardDirection=Math.sign(velocity)){
 const count=Number.isFinite(bounces)?clamp(Math.floor(bounces),0,MAX_RICOCHET_BOUNCES):0;
 const vy=Number.isFinite(velocity)?velocity:0;
 const factor=Number.isFinite(restitution)?clamp(restitution,.4,.8):.65;
 if(count>=MAX_RICOCHET_BOUNCES||!Number.isFinite(velocity))
  return {bounces:count,velocity:0,active:false,reflected:false};
 const next=count+1;
 const outward=outwardDirection===-1?-1:1;
 return {bounces:next,velocity:vy===0?0:-outward*Math.abs(vy)*factor,active:next<MAX_RICOCHET_BOUNCES,reflected:true};
}
function homingProfile(shot={}){
 const offset=Number(shot?.homingOffset);
 return {offset:Number.isFinite(offset)?clamp(offset,-MAX_HOMING_OFFSET,MAX_HOMING_OFFSET):0};
}
function homingSample(shot,age){
 if(!Number.isFinite(age))return {offset:0,velocity:0};
 const {offset}=homingProfile(shot),u=clamp(age,0,TRANSFORM_SECONDS)/TRANSFORM_SECONDS;
 return {offset:offset*u*u*(3-2*u),velocity:offset*(6*u*(1-u)/TRANSFORM_SECONDS)};
}
function homingStep(shot,fromAge,toAge){
 if(!Number.isFinite(fromAge)||!Number.isFinite(toAge)||toAge<=fromAge)
  return {deltaVy:0,correctionY:0};
 const start=homingSample(shot,fromAge),end=homingSample(shot,toAge),dt=toAge-fromAge;
 return {deltaVy:end.velocity-start.velocity,correctionY:end.offset-start.offset-end.velocity*dt};
}
// Wave Rider makes several bounded underground/surface sweeps and exits on its
// original aim line. The same sampled path is used by live flight and keeper QA.
function waveProfile(shot={}){
 const requested=Number(shot?.waveAmplitude);
 return {amplitude:Number.isFinite(requested)?clamp(requested,20,70):44,direction:shot?.direction===-1?-1:1};
}
function waveSample(shot,age){
 if(!Number.isFinite(age))return {offset:0,velocity:0};
 const {amplitude,direction}=waveProfile(shot),t=clamp(age,0,TRANSFORM_SECONDS),u=t/TRANSFORM_SECONDS;
 const phase=u*3*Math.PI,s=Math.sin(phase),c=Math.cos(phase),fade=t>TRANSFORM_SECONDS-.35?((TRANSFORM_SECONDS-t)/.35)**2*(3-2*((TRANSFORM_SECONDS-t)/.35)):1;
 const fadeD=t>TRANSFORM_SECONDS-.35?-6*((TRANSFORM_SECONDS-t)/.35)*(1-((TRANSFORM_SECONDS-t)/.35))/.35:0;
 return {offset:direction*amplitude*s*s*s*fade,velocity:direction*amplitude*(9*Math.PI/TRANSFORM_SECONDS)*s*s*c*fade+direction*amplitude*s*s*s*fadeD};
}
function waveStep(shot,fromAge,toAge){
 if(!Number.isFinite(fromAge)||!Number.isFinite(toAge)||toAge<=fromAge)return {deltaVy:0,correctionY:0};
 const start=waveSample(shot,fromAge),end=waveSample(shot,toAge),dt=toAge-fromAge;
 return {deltaVy:end.velocity-start.velocity,correctionY:end.offset-start.offset-end.velocity*dt};
}
// Omega's warp oscillates through two bounded lateral folds, then exits at the
// original lane with zero residual sideways velocity. Live flight and keeper
// prediction consume the same correction step.
function warpProfile(shot={}){
 const requested=Number(shot?.warpAmplitude);
 return {amplitude:Number.isFinite(requested)?clamp(requested,12,40):WARP_AMPLITUDE,
  direction:shot?.direction===-1?-1:1};
}
function warpSample(shot,age){
 if(!Number.isFinite(age))return {offset:0,velocity:0};
 const {amplitude,direction}=warpProfile(shot),u=clamp(age,0,TRANSFORM_SECONDS);
 const phase=4*Math.PI*u/TRANSFORM_SECONDS,s=Math.sin(phase),c=Math.cos(phase);
 const scale=direction*amplitude,frequency=4*Math.PI/TRANSFORM_SECONDS;
 return {offset:scale*s*s*s,velocity:scale*3*frequency*s*s*c};
}
function warpStep(shot,fromAge,toAge){
 if(!Number.isFinite(fromAge)||!Number.isFinite(toAge)||toAge<=fromAge)
  return {deltaVy:0,correctionY:0};
 const start=warpSample(shot,fromAge),end=warpSample(shot,toAge),dt=toAge-fromAge;
 return {deltaVy:end.velocity-start.velocity,correctionY:end.offset-start.offset-end.velocity*dt};
}
export const SHOTPATHS=Object.freeze({zigzagStep,zigzagSample,zigzagProfile,curveStep,curveSample,curveProfile,spiralStep,spiralSample,spiralProfile,warpStep,warpSample,warpProfile,WARP_AMPLITUDE,ricochetBounce,MAX_RICOCHET_BOUNCES,homingStep,homingSample,homingProfile,MAX_HOMING_OFFSET,waveStep,waveSample,waveProfile,TRANSFORM_SECONDS});
