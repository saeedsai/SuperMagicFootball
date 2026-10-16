import {CONCEPT_HERO} from "./concepthero.js";
// C00/C01: independently editable front and rear illustrated hair layers.
// Root position, physics, view flip, jump and body animation remain owned by Renderer.
const CONCEPT_MODULAR=(()=>{
 const ID='concept_modular_v1',HEIGHT=265,LOGICAL_HEIGHT=141;
 const viewArt={
  front:{width:112,path:'hair_front_front.svg',inline:typeof CONCEPT_MODULAR_FRONT_INLINE==='string'?CONCEPT_MODULAR_FRONT_INLINE:null},
  back:{width:115,path:'hair_back_back.svg',inline:typeof CONCEPT_MODULAR_BACK_INLINE==='string'?CONCEPT_MODULAR_BACK_INLINE:null}
 };
 const states=Object.create(null);
 function preload(){
  if(typeof Image==='undefined')return;
  for(const [kind,art] of Object.entries(viewArt)){
   if(states[kind])continue;
   const state={image:new Image(),ready:false,error:false};states[kind]=state;
   state.image.onload=()=>{
    state.ready=state.image.naturalWidth===art.width&&state.image.naturalHeight===HEIGHT;
    state.error=!state.ready;
   };
   state.image.onerror=()=>{state.error=true;};
   state.image.src=art.inline?'data:image/svg+xml;base64,'+art.inline
    :new URL('../../assets/characters/concept_modular_v1/source/'+art.path,import.meta.url).href;
  }
 }
 function supports(p){return p?.src?.renderModel===ID||p?.src?.appearance?.renderModel===ID;}
 function draw(ctx,p,view,{run=0}={}){
  if(!supports(p))return false;
  const kind=view?.kind,art=viewArt[kind];
  if(!art)return false; // Six unpainted quarter/side headings keep the old artwork.
  const state=states[kind];
  if(!state?.ready){preload();return false;}
  if(!CONCEPT_HERO.draw(ctx,p,view,{run}))return false;
  const ratio=LOGICAL_HEIGHT/HEIGHT,w=art.width*ratio;
  const pivot=kind==='front'?[56,56]:[57,60];
  const phase=Math.max(-1,Math.min(1,Number.isFinite(run)?run:0));
  // A gentle secondary hair pivot follows the existing painted body's stride;
  // no mechanical motion, hitboxes, or animation clocks are changed.
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
  return {loaded:ready('front')&&ready('back'),error:Object.values(states).some(s=>s.error),
   authoredViews:Object.keys(viewArt).filter(ready),fallback:'concept_hero',hairSwayEnabled:true};
 }
 return Object.freeze({id:ID,supports,preload,draw,status});
})();
export {CONCEPT_MODULAR};
