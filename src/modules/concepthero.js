// SuperMagicFootball | literal transparent sprite atlas cut from the approved concept.
// This is a one-character prototype, not an invented vector approximation.
const CONCEPT_HERO=(()=>{
 const ID='concept_hero';
 const directions=Object.freeze(['front','quarterFront','side','quarterBack','back']);
 const regions=Object.freeze({front:[0,112],quarterFront:[112,109],side:[221,90],quarterBack:[311,106],back:[417,115]});
 const HEIGHT=265;
 const atlas={image:null,ready:false,error:false,parts:Object.create(null)};
 const clamp=v=>Math.max(-1,Math.min(1,Number.isFinite(v)?v:0));
 function layer(full,sx,sw,part){
  const c=document.createElement('canvas');c.width=sw;c.height=HEIGHT;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(full,sx,0,sw,HEIGHT,0,0,sw,HEIGHT);
  const frame=x.getImageData(0,0,sw,HEIGHT),pixels=frame.data;
  const split=Math.floor(sw/2);
  for(let y=0;y<HEIGHT;y++)for(let col=0;col<sw;col++){
   const visible=part==='body'?y<201:y>=190&&(part==='left'?col<split:col>=split);
   if(!visible)pixels[(y*sw+col)*4+3]=0;
  }
  x.clearRect(0,0,sw,HEIGHT);x.putImageData(frame,0,0);
  return c;
 }
 function prepare(){
  try{
   if(typeof document==='undefined'||!atlas.image)return;
   for(const kind of directions){
    const [sx,sw]=regions[kind];
    atlas.parts[kind]={body:layer(atlas.image,sx,sw,'body'),left:layer(atlas.image,sx,sw,'left'),right:layer(atlas.image,sx,sw,'right')};
   }
   atlas.ready=true;
  }catch(e){atlas.error=true;atlas.ready=true; /* Keep the original full-body sprite as fallback. */}
 }
 function preload(){
  if(typeof Image==='undefined'||atlas.image)return;
  const image=new Image();atlas.image=image;
  image.onload=prepare;
  image.onerror=()=>{atlas.error=true};
  const data=typeof CONCEPT_HERO_INLINE==='string'?CONCEPT_HERO_INLINE:null;
  image.src=data?'data:image/webp;base64,'+data:new URL('../../assets/concept_hero/hero_atlas.webp',import.meta.url).href;
  if(image.complete&&image.naturalWidth>0)prepare();
 }
 function isConceptPlayer(p){const model=p?.src?.renderModel||p?.src?.appearance?.renderModel;return model===ID||model==='concept_modular_v1';}
 function draw(ctx,p,view,{run=0}={}){
  if(!isConceptPlayer(p))return false;
  if(!atlas.ready){preload();return false;}
  const kind=regions[view?.kind]?view.kind:'front';
  const [sx,sw]=regions[kind];
  const h=141,w=sw*h/HEIGHT,gait=clamp(run),active=Math.abs(gait)>.07;
  ctx.save();
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // The Concept atlas paints its side and quarter profiles facing screen-left.
  // The parent renderer already mirrors view.side for ordinary character art;
  // reverse the native Concept profiles locally so rightward motion faces right.
  // Front/back views and the global CHARACTER_ART orientation stay unchanged.
  if(kind==='side'||kind==='quarterFront'||kind==='quarterBack')ctx.scale(-1,1);
  if(active&&atlas.parts[kind]){
   const parts=atlas.parts[kind],ratio=h/HEIGHT,split=sw/2;
   ctx.translate(-w/2,-h+6);ctx.scale(ratio,ratio);
   // Keep the painted feet attached to their hips: small eased leg arcs
   // avoid the extreme scissors/foot teleport of the original prototype.
   const strength=Math.min(1,Math.abs(gait)/.28);
   const eased=strength*strength*(3-2*strength);
   for(const [limb,sign] of [['left',-1],['right',1]]){
    const stride=sign*gait*eased;
    const hipX=limb==='left'?split*.52:split*1.48;
    ctx.save();ctx.translate(hipX,190);
    ctx.rotate(stride*.12);
    ctx.translate(-hipX,-190);
    ctx.drawImage(parts[limb],0,0);ctx.restore();
   }
   ctx.drawImage(parts.body,0,0);
  }else{
   ctx.drawImage(atlas.image,sx,0,sw,HEIGHT,-w/2,-h+6,w,h);
  }
  ctx.restore();return true;
 }
 preload();
 return Object.freeze({id:ID,directions,isConceptPlayer,preload,draw,status:()=>({loaded:atlas.ready,error:atlas.error,animatedViews:Object.keys(atlas.parts).length})});
})();
export {CONCEPT_HERO};
