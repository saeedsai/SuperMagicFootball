// Independently authored eight-way animation timing utilities.
// Pure functions: no new controls, saves, physics or renderer side effects.
const HEADINGS=Object.freeze(['N','NE','E','SE','S','SW','W','NW']);
const ACTIONS=Object.freeze(['idle','run','kick','slide','header','keeper','celebrate']);
function normalizeHeading(value){
 return HEADINGS.includes(value)?value:'S';
}
function animationFrame({heading='S',action='idle',elapsed=0,fps=8,frames=4}={}){
 const direction=normalizeHeading(heading);
 const motion=ACTIONS.includes(action)?action:'idle';
 const count=Number.isInteger(frames)&&frames>0&&frames<=64?frames:4;
 const rate=Number.isFinite(fps)&&fps>0&&fps<=60?fps:8;
 const time=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 const frame=motion==='idle'?0:Math.floor(time*rate)%count;
 return Object.freeze({heading:direction,action:motion,frame,key:`${motion}/${direction}/${frame}`});
}
// One-shot action playback with a held final frame for kick, slide and dive.
// The legacy animationFrame API remains unchanged for looping motion.
function actionFrame({heading='S',action='kick',elapsed=0,fps=8,frames=4}={}){
 const direction=normalizeHeading(heading);
 const motion=ACTIONS.includes(action)?action:'idle';
 const count=Number.isInteger(frames)&&frames>0&&frames<=64?frames:4;
 const rate=Number.isFinite(fps)&&fps>0&&fps<=60?fps:8;
 const time=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
 const step=Math.floor(time*rate);
 const frame=motion==='idle'?0:Math.min(step,count-1);
 return Object.freeze({heading:direction,action:motion,frame,finished:motion==='idle'||step>=count,key:`${motion}/${direction}/${frame}`});
}
// Blend-free state transition for authored action strips. A completed one-shot
// returns to idle; locomotion keeps looping. No changes to game input mapping.
function resolveActionPose({heading='S',action='idle',elapsed=0,fps=8,frames=4}={}){
 const motion=ACTIONS.includes(action)?action:'idle';
 const pose=(motion==='run'||motion==='idle')
  ?animationFrame({heading,action:motion,elapsed,fps,frames})
  :actionFrame({heading,action:motion,elapsed,fps,frames});
 if(motion!=='run'&&motion!=='idle'&&pose.finished){
  return Object.freeze({...animationFrame({heading,action:'idle'}),previousAction:motion,transitioned:true});
 }
 return Object.freeze({...pose,transitioned:false});
}
// Asset lookup order: exact authored pose, directional idle, then generic idle.
// A missing bespoke frame never breaks rendering or changes player state.
function animationAssetCandidates(pose){
 const heading=normalizeHeading(pose?.heading);
 const action=ACTIONS.includes(pose?.action)?pose.action:'idle';
 const frame=Number.isInteger(pose?.frame)&&pose.frame>=0&&pose.frame<=63?pose.frame:0;
 return Object.freeze([...new Set([
  `${action}/${heading}/${frame}`,
  `${action}/${heading}/0`,
  `idle/${heading}/0`,
  'idle/S/0'
 ])]);
}
// Resolve a sparse authored frame catalog without assuming every pose exists.
// The catalog may be a Set or an object of exact keys; no URL is constructed.
function resolveAuthoredFrame(pose,catalog){
 const has=key=>catalog instanceof Set?catalog.has(key):Boolean(catalog&&Object.prototype.hasOwnProperty.call(catalog,key)&&catalog[key]);
 for(const key of animationAssetCandidates(pose))if(has(key))return key;
 return null;
}
export {HEADINGS,ACTIONS,normalizeHeading,animationFrame,actionFrame,resolveActionPose,animationAssetCandidates,resolveAuthoredFrame};
