import {CONCEPT_HERO} from "./concepthero.js";
// C01: independent illustrated front face under front hair, rear hair on original
// approved painted hero. Never owns root transforms, hitboxes or gameplay actions.
const CONCEPT_MODULAR=(()=>{
 const ID='concept_modular_v1',HEIGHT=265,LOGICAL_HEIGHT=141;
 const viewArt={
  front:{width:112,path:'hair_front_front.svg',inline:typeof CONCEPT_MODULAR_FRONT_INLINE==='string'?CONCEPT_MODULAR_FRONT_INLINE:null},
  back:{width:115,path:'hair_back_back.svg',inline:typeof CONCEPT_MODULAR_BACK_INLINE==='string'?CONCEPT_MODULAR_BACK_INLINE:null}
 };
 const faceArt={width:112,path:'face_front_front.svg',inline:typeof CONCEPT_MODULAR_FACE_INLINE==='string'?CONCEPT_MODULAR_FACE_INLINE:null};
 const armArt={width:112,path:'arm_near_front.svg',inline:typeof CONCEPT_MODULAR_ARM_INLINE==='string'?CONCEPT_MODULAR_ARM_INLINE:null};
 const states=Object.create(null);
 function preload(){
  if(typeof Image==='undefined')return;
  for(const [kind,art] of [...Object.entries(viewArt),['frontFace',faceArt],['frontArm',armArt]]){
   if(states[kind])continue;
   const state={image:new Image(),ready:false,error:false};states[kind]=state;
   state.image.onload=()=>{state.ready=state.image.naturalWidth===art.width&&state.image.naturalHeight===HEIGHT;state.error=!state.ready;};
   state.image.onerror=()=>{state.error=true;};
   state.image.src=art.inline?'data:image/svg+xml;base64,'+art.inline
    :new URL('../../assets/characters/concept_modular_v1/source/'+art.path,import.meta.url).href;
  }
 }
 function supports(p){return p?.src?.renderModel===ID||p?.src?.appearance?.renderModel===ID;}
 function draw(ctx,p,view,{run=0}={}){
  if(!supports(p))return false;
  const kind=view?.kind,art=viewArt[kind];
  if(!art)return false; // All six unauthored quarter/side headings use the old renderer.
  const state=states[kind];
  // Never paint only part of the front modular head if face or hair is unavailable.
  if(!state?.ready||(kind==='front'&&(!states.frontFace?.ready||!states.frontArm?.ready))){preload();return false;}
  if(!CONCEPT_HERO.draw(ctx,p,view,{run}))return false;
  const ratio=LOGICAL_HEIGHT/HEIGHT,w=art.width*ratio;
  const phase=Math.max(-1,Math.min(1,Number.isFinite(run)?run:0));
  if(kind==='front'){
   // Face sits over the unchanged original body, but BELOW independently drawn hair.
   ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(states.frontFace.image,-112*ratio/2,-LOGICAL_HEIGHT+6,112*ratio,LOGICAL_HEIGHT);
   ctx.restore();
   // C01: one genuinely editable near arm; subtle counter-stride at its actual
   // shoulder pivot. The baked original arm stays beneath pending torso extraction.
   // Use only the existing run phase; collision/action logic stays in Renderer.
   const ax=(90-56)*ratio,ay=-LOGICAL_HEIGHT+6+126*ratio;
   const armStride=Math.abs(phase)>.07?-phase*.035:0;
   ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.translate(ax,ay);ctx.rotate(armStride);ctx.translate(-ax,-ay);
   ctx.drawImage(states.frontArm.image,-112*ratio/2,-LOGICAL_HEIGHT+6,112*ratio,LOGICAL_HEIGHT);
   ctx.restore();
  }
  const pivot=kind==='front'?[56,56]:[57,60];
  const sway=Math.abs(phase)>.07?phase*.012:0;
  const px=(pivot[0]-art.width/2)*ratio,py=-LOGICAL_HEIGHT+6+pivot[1]*ratio;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.translate(px,py);ctx.rotate(sway);ctx.translate(-px,-py);
  ctx.drawImage(state.image,-w/2,-LOGICAL_HEIGHT+6,w,LOGICAL_HEIGHT);
  ctx.restore();return true;
 }
 preload();
 function status(){
  const ready=kind=>!!states[kind]?.ready;
  return {loaded:ready('front')&&ready('back')&&ready('frontFace')&&ready('frontArm'),
   error:Object.values(states).some(s=>s.error),
   authoredViews:Object.keys(viewArt).filter(kind=>ready(kind)&&(kind!=='front'||(ready('frontFace')&&ready('frontArm')))),
   authoredParts:['hair_front_front','hair_back_back',...(ready('frontFace')?['face_front_front']:[]),...(ready('frontArm')?['arm_near_front']:[])],
   faceLoaded:ready('frontFace'),armLoaded:ready('frontArm'),frontArmStrideEnabled:true,fallback:'concept_hero',hairSwayEnabled:true};
 }
 return Object.freeze({id:ID,supports,preload,draw,status});
})();
export {CONCEPT_MODULAR};
