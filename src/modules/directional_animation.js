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
export {HEADINGS,ACTIONS,normalizeHeading,animationFrame,actionFrame};
