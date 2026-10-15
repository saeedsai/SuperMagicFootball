// SuperMagicFootball | literal transparent sprite atlas cut from the approved concept.
// This is a one-character prototype, not an invented vector approximation.
const CONCEPT_HERO=(()=>{
 const ID='concept_hero';
 const directions=Object.freeze(['front','quarterFront','side','quarterBack','back']);
 const regions=Object.freeze({front:[0,112],quarterFront:[112,109],side:[221,90],quarterBack:[311,106],back:[417,115]});
 const atlas={image:null,ready:false,error:false};
 function preload(){
  if(typeof Image==='undefined'||atlas.image)return;
  const image=new Image();atlas.image=image;
  image.onload=()=>{atlas.ready=true};
  image.onerror=()=>{atlas.error=true};
  const data=typeof CONCEPT_HERO_INLINE==='string'?CONCEPT_HERO_INLINE:null;
  image.src=data?'data:image/webp;base64,'+data:new URL('../../assets/concept_hero/hero_atlas.webp',import.meta.url).href;
  if(image.complete&&image.naturalWidth>0)atlas.ready=true;
 }
 function isConceptPlayer(p){return p?.src?.renderModel===ID||p?.src?.appearance?.renderModel===ID;}
 function draw(ctx,p,view,{run=0}={}){
  if(!isConceptPlayer(p))return false;
  if(!atlas.ready){preload();return false;}
  const kind=regions[view?.kind]?view.kind:'front';
  const [sx,sw]=regions[kind];
  const h=141,w=sw*h/265;
  ctx.save();
  if((p?.action==='run'||Math.abs(run)>.2)&&!p?.preview)ctx.translate(0,-Math.abs(run)*.8);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(atlas.image,sx,0,sw,265,-w/2,-h+6,w,h);
  ctx.restore();return true;
 }
 preload();
 return Object.freeze({id:ID,directions,isConceptPlayer,preload,draw,status:()=>({loaded:atlas.ready,error:atlas.error})});
})();
export {CONCEPT_HERO};
