// Crown Royals: literal transparent pixels extracted from the owner's three-view
// reference. This is a separate team/model; the existing Concept Hero is unchanged.
// Player 1 only: other Crown Royals members use the ordinary character renderer.
const CROWN_ROYALS=(()=>{
 const ID='crown_royals_reference',PLAYER='crown_royals_reference_alex';
 const directions=Object.freeze(['front','quarterFront','side','quarterBack','back']);
 const frames=Object.freeze({front:[0,48],quarterFront:[0,48],side:[96,36],quarterBack:[48,48],back:[48,48]});
 const atlas={image:null,loaded:false,error:false};
 function preload(){
  if(atlas.image||typeof Image==='undefined')return;
  const image=new Image();atlas.image=image;
  image.onload=()=>{atlas.loaded=true;};
  image.onerror=()=>{atlas.error=true;};
  const inline=typeof CROWN_ROYALS_INLINE==='string'?CROWN_ROYALS_INLINE:null;
  image.src=inline?'data:image/png;base64,'+inline:new URL('../../assets/crown_royals/alex_three_views.png',import.meta.url).href;
  if(image.complete&&image.naturalWidth)atlas.loaded=true;
 }
 function isCrownPlayer(p){
  return p?.src?.id===PLAYER&&
   (p?.src?.renderModel===ID||p?.src?.appearance?.renderModel===ID);
 }
 function draw(ctx,p,view,{run=0,action='idle',phase=0}={}){
  if(!isCrownPlayer(p))return false;
  if(!atlas.loaded){preload();return false;}
  const kind=frames[view?.kind]?view.kind:'front';
  const [sx,sw]=frames[kind],h=141,w=sw*h/90;
  const stride=Math.max(-1,Math.min(1,Number.isFinite(run)?run:0));
  const step=Math.max(-1,Math.min(1,Number.isFinite(phase)?phase:0));
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(kind==='quarterFront'||kind==='quarterBack')ctx.scale(.86,1);
  if(action==='jump')ctx.translate(0,-Math.max(0,step)*15);
  if(action==='shoot')ctx.rotate(-step*.16);
  if(action==='tackle')ctx.rotate(step*.20);
  ctx.translate(-w/2,-h+6);ctx.scale(w/sw,h/90);
  // The reference contains three genuine projections. Quarter projections are
  // interim nearest-view previews, not falsely advertised as painted directions.
  if(Math.abs(stride)>.08){
   const split=Math.floor(sw/2),upper=65;
   for(const [left,partX,partW,sign] of [[true,0,split,-1],[false,split,sw-split,1]]){
    ctx.save();const pivot=left?sw*.30:sw*.70;
    ctx.translate(pivot,upper);ctx.rotate(stride*sign*.16);
    ctx.translate(-pivot,-upper);
    ctx.drawImage(atlas.image,sx+partX,upper,partW,90-upper,partX,upper,partW,90-upper);
    ctx.restore();
   }
   ctx.drawImage(atlas.image,sx,0,sw,upper,0,0,sw,upper);
  }else ctx.drawImage(atlas.image,sx,0,sw,90,0,0,sw,90);
  ctx.restore();return true;
 }
 preload();
 return Object.freeze({id:ID,playerId:PLAYER,directions,isCrownPlayer,preload,draw,status:()=>({loaded:atlas.loaded,error:atlas.error,paintedViews:3,quarterViews:'nearest-view placeholders',playerCount:1})});
})();
export {CROWN_ROYALS};
