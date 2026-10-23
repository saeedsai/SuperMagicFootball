// Crown Royals: literal transparent pixels extracted from the owner's three-view
// reference. This is a separate team/model; the existing Concept Hero is unchanged.
// Two independently painted reference players: Alex and Leo; others use ordinary art.
const CROWN_ROYALS=(()=>{
 const ID='crown_royals_reference';
 const PLAYERS=Object.freeze({crown_royals_reference_alex:'alex',crown_royals_reference_leo:'leo'});
 const directions=Object.freeze(['front','quarterFront','side','quarterBack','back']);
 const frames=Object.freeze({front:[0,48],quarterFront:[0,48],side:[96,36],quarterBack:[48,48],back:[48,48]});
 const atlases={alex:{image:null,painted:null,loaded:false,error:false},leo:{image:null,painted:null,loaded:false,error:false}};
 // Per-view pixel corrections preserve original facial pixels and transparent outlines.
 // They are made on a cached atlas and shared by idle, run and action rendering.
 function correctedAtlas(image,name){
  const canvas=document.createElement('canvas');canvas.width=132;canvas.height=90;
  const cx=canvas.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);
  const frame=cx.getImageData(0,0,132,90),a=frame.data;
  for(let y=0;y<35;y++)for(let x=0;x<132;x++){
   const p=(y*132+x)*4,r=a[p],g=a[p+1],b=a[p+2];if(a[p+3]<96)continue;
   // Alex's reference side cut accidentally contains silver hair, unlike front/back.
   if(name==='alex'&&x>=96&&y<30&&r>110&&g>105&&b>100&&Math.abs(r-g)<43&&Math.abs(g-b)<48){
    const l=(r+g+b)/3;a[p]=Math.min(204,Math.round(l*.91));a[p+1]=Math.min(133,Math.round(l*.49));a[p+2]=Math.min(94,Math.round(l*.31));
   }
   // Leo's headband runs continuously around the rear crown and side.
   if(name==='leo'&&y>=13&&y<=21&&((x>=55&&x<89)||(x>=99&&x<125))&&r>110&&g>70&&r>b*1.17){
    a[p]=27;a[p+1]=29;a[p+2]=43;
   }
  }
  cx.putImageData(frame,0,0);return canvas;
 }
 function load(name,inline){
  const atlas=atlases[name];if(atlas.image||typeof Image==='undefined')return;
  const image=new Image();atlas.image=image;
  image.onload=()=>{try{atlas.painted=correctedAtlas(image,name);}catch{atlas.painted=image;}atlas.loaded=true;};image.onerror=()=>{atlas.error=true;};
  if(typeof inline==='string')image.src='data:image/png;base64,'+inline;
  else try{image.src=new URL('../../assets/crown_royals/'+name+'_three_views.png',import.meta.url).href;}catch{atlas.error=true;}
  if(image.complete&&image.naturalWidth>0){try{atlas.painted=correctedAtlas(image,name);}catch{atlas.painted=image;}atlas.loaded=true;}
 }
 function preload(){
  load('alex',typeof CROWN_ROYALS_INLINE==='string'?CROWN_ROYALS_INLINE:null);
  load('leo',typeof CROWN_ROYALS_LEO_INLINE==='string'?CROWN_ROYALS_LEO_INLINE:null);
 }
 function isCrownPlayer(p){
  const id=p?.src?.id;
  return typeof id==='string'&&Object.hasOwn(PLAYERS,id)&&(p?.src?.renderModel===ID||p?.src?.appearance?.renderModel===ID);
 }
 function draw(ctx,p,view,{run=0,action='idle',phase=0}={}){
  if(!isCrownPlayer(p))return false;
  const atlas=atlases[PLAYERS[p.src.id]];
  if(!atlas.loaded){preload();return false;}
  const kind=frames[view?.kind]?view.kind:'front';
  const [sx,sw]=frames[kind],h=141,w=sw*h/90;
  const stride=Math.max(-1,Math.min(1,Number.isFinite(run)?run:0));
  const step=Math.max(-1,Math.min(1,Number.isFinite(phase)?phase:0));
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(kind==='quarterFront'||kind==='quarterBack')ctx.scale(.86,1);
  const poseAction=action==='kick'||action==='super'?'shoot':action==='slide'?'tackle':action;
  if(poseAction==='jump')ctx.translate(0,-Math.abs(step)*15);
  if(poseAction==='shoot')ctx.rotate(-step*.16);
  // Super Shot adds bounded anticipation without a new gameplay control.
  if(action==='super'){ctx.translate(0,-Math.abs(step)*8);ctx.rotate(-step*.09);}
  if(poseAction==='tackle')ctx.rotate(step*.20);
  ctx.translate(-w/2,-h+6);ctx.scale(w/sw,h/90);
  // The reference contains three genuine projections. Quarter projections are
  // interim nearest-view previews, not falsely advertised as painted directions.
  if(Math.abs(stride)>.08){
   const split=Math.floor(sw/2),upper=65;
   for(const [left,partX,partW,sign] of [[true,0,split,-1],[false,split,sw-split,1]]){
    ctx.save();const pivot=left?sw*.30:sw*.70;
    ctx.translate(pivot,upper);ctx.rotate(stride*sign*.16);
    ctx.translate(-pivot,-upper);
    ctx.drawImage(atlas.painted||atlas.image,sx+partX,upper,partW,90-upper,partX,upper,partW,90-upper);
    ctx.restore();
   }
   ctx.drawImage(atlas.painted||atlas.image,sx,0,sw,upper,0,0,sw,upper);
  }else ctx.drawImage(atlas.painted||atlas.image,sx,0,sw,90,0,0,sw,90);
  ctx.restore();return true;
 }
 preload();
 return Object.freeze({id:ID,playerId:'crown_royals_reference_alex',playerIds:Object.keys(PLAYERS),directions,isCrownPlayer,preload,draw,status:()=>({loaded:atlases.alex.loaded,leoLoaded:atlases.leo.loaded,error:atlases.alex.error||atlases.leo.error,paintedViews:3,quarterViews:'nearest-view placeholders',playerCount:2,hairCorrected:!!atlases.alex.painted&&!!atlases.leo.painted})});
})();
export {CROWN_ROYALS};
