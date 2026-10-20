/** Deterministic SH01 zigzag lane displacement, shared by ball and keeper prediction.
 * Every sample includes fade-out velocity so shots return to their original
 * flight heading instead of drifting sideways after the transformation ends.
 */
const TRANSFORM_SECONDS=1.65;
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
export const SHOTPATHS=Object.freeze({zigzagStep,zigzagSample,zigzagProfile,TRANSFORM_SECONDS});
