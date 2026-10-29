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
// Cross-realm Set/Map detection matters for Node VM regression harnesses and
// embedded-frame consumers; instanceof fails across JavaScript realms.
function hasAuthoredFrame(catalog,key){
 const tag=Object.prototype.toString.call(catalog);
 if(tag==='[object Set]')return typeof catalog?.has==='function'&&catalog.has(key);
 if(tag==='[object Map]')return typeof catalog?.get==='function'&&Boolean(catalog.get(key));
 return Boolean(catalog&&Object.prototype.hasOwnProperty.call(catalog,key)&&catalog[key]);
}
// Resolve a sparse authored frame catalog without assuming every pose exists.
// The catalog may be a Set, Map or own-key object; no URL is constructed.
function resolveAuthoredFrame(pose,catalog){
 const has=key=>hasAuthoredFrame(catalog,key);
 for(const key of animationAssetCandidates(pose))if(has(key))return key;
 return null;
}
// Optional horizontal reflection for incomplete *independently authored* packs.
// Never reflect front/rear or replace an available exact-heading frame.
const MIRROR_HEADING=Object.freeze({N:'N',NE:'NW',E:'W',SE:'SW',S:'S',SW:'SE',W:'E',NW:'NE'});
function resolveDirectionalAsset(pose,catalog,{allowMirror=false}={}){
 const has=key=>hasAuthoredFrame(catalog,key);
 const original=animationAssetCandidates(pose);
 const generic='idle/S/0';
 // Keep exact-facing action and idle frames ahead of any mirrored alternative.
 for(const key of original){
  if(key===generic)continue;
  if(has(key))return Object.freeze({key,mirrorX:false});
 }
 if(allowMirror){
  const heading=normalizeHeading(pose?.heading),opposite=MIRROR_HEADING[heading];
  if(opposite!==heading){
   for(const key of animationAssetCandidates({...pose,heading:opposite})){
    if(key===generic)continue;
    if(has(key))return Object.freeze({key,mirrorX:true});
   }
  }
 }
 return has(generic)?Object.freeze({key:generic,mirrorX:false}):null;
}
export {HEADINGS,ACTIONS,normalizeHeading,animationFrame,actionFrame,resolveActionPose,animationAssetCandidates,resolveAuthoredFrame,resolveDirectionalAsset};
