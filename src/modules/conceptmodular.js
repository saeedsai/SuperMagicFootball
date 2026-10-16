import {CONCEPT_HERO} from "./concepthero.js";
// C00/C01 front-only experimental art; root/scale/actions stay in Renderer.drawPlayer.
const CONCEPT_MODULAR=(()=>{
 const ID='concept_modular_v1';let image=null,ready=false,error=false;
 function preload(){
  if(image||typeof Image==='undefined')return;
  image=new Image();
  image.onload=()=>{ready=image.naturalWidth===112&&image.naturalHeight===265;error=!ready;};
  image.onerror=()=>{error=true;};
  image.src=typeof CONCEPT_MODULAR_FRONT_INLINE==='string'
   ?'data:image/svg+xml;base64,'+CONCEPT_MODULAR_FRONT_INLINE
   :new URL('../../assets/characters/concept_modular_v1/source/hair_front_front.svg',import.meta.url).href;
 }
 function supports(p){return p?.src?.renderModel===ID||p?.src?.appearance?.renderModel===ID;}
 function draw(ctx,p,view,{run=0}={}){
  if(!supports(p))return false;
  if(!image)preload();
  if(!ready||view?.kind!=='front')return false; // Never blank unfinished directions.
  if(!CONCEPT_HERO.draw(ctx,p,view,{run}))return false;
  const h=141,w=112*h/265;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(image,-w/2,-h+6,w,h);
  ctx.restore();return true;
 }
 preload();
 return Object.freeze({id:ID,supports,preload,draw,status:()=>({loaded:ready,error,authoredViews:ready?['front']:[],fallback:'concept_hero'})});
})();
export {CONCEPT_MODULAR};
