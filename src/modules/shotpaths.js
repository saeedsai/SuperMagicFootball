/**
 * SH01 prototype: mirrored, centered, smoothly fading zigzag kinematics.
 * This pure helper is NOT wired into the playable engine until its shared
 * updateBall / goalkeeper prediction integration can be safely committed.
 */
const TRANSFORM_SECONDS=1.65;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function zigzagStep(shot,fromAge,toAge){
 const amplitude=clamp(Number(shot?.zigzagAmplitude)||36,10,65);
 const frequency=clamp(Number(shot?.zigzagFrequency)||11,6,18);
 const direction=shot?.direction===-1?-1:1;
 const motion=t=>{
  const age=clamp(t,0,TRANSFORM_SECONDS),phase=age*frequency;
  const s=Math.sin(phase),c=Math.cos(phase),fadeTime=.35;
  let fade=1,fadeDerivative=0;
  if(age>TRANSFORM_SECONDS-fadeTime){
   const q=clamp((TRANSFORM_SECONDS-age)/fadeTime,0,1);
   fade=q*q*(3-2*q);fadeDerivative=-6*q*(1-q)/fadeTime;
  }
  return {offset:s*s*s*fade,velocity:3*frequency*s*s*c*fade+s*s*s*fadeDerivative};
 };
 const start=motion(fromAge),end=motion(toAge),dt=Math.max(0,toAge-fromAge);
 const deltaVy=direction*amplitude*(end.velocity-start.velocity);
 return {deltaVy,correctionY:direction*amplitude*(end.offset-start.offset)-direction*amplitude*end.velocity*dt};
}
export const SHOTPATHS=Object.freeze({zigzagStep,TRANSFORM_SECONDS});
