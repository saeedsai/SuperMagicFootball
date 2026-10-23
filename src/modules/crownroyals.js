// Crown Royals: literal transparent pixels extracted from the owner's three-view
// reference. This is a separate team/model; the existing Concept Hero is unchanged.
// Three separate reference-derived atlases: Alex, Leo and Kwame; others use ordinary art.
const CROWN_ROYALS=(()=>{
 const ID='crown_royals_reference';
 const PLAYERS=Object.freeze({crown_royals_reference_alex:'alex',crown_royals_reference_leo:'leo',crown_royals_reference_kwame:'kwame',crown_royals_reference_diego:'diego'});
 const directions=Object.freeze(['front','quarterFront','side','quarterBack','back']);
 const frames=Object.freeze({front:[0,48],quarterFront:[0,48],side:[96,36],quarterBack:[48,48],back:[48,48]});
 const atlases={alex:{image:null,painted:null,loaded:false,error:false},leo:{image:null,painted:null,loaded:false,error:false},kwame:{image:null,painted:null,loaded:false,error:false},diego:{image:null,painted:null,loaded:false,error:false}};
 // Per-view pixel corrections preserve original facial pixels and transparent outlines.
 // They are made on a cached atlas and shared by idle, run and action rendering.
 function correctedAtlas(image,name){
  // Hair-only repair on the three-view 132x90 reference atlas. Never alter alpha or body.
  const canvas=document.createElement('canvas');canvas.width=132;canvas.height=90;
  const cx=canvas.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);
  const frame=cx.getImageData(0,0,132,90),a=frame.data;
  // Indexed reference sprites can contain translucent matte fringe pixels.
  // Clear only near-invisible pixels; keep actual anti-aliased silhouette pixels.
  // Never paint a backdrop into the transparent atlas.
  for(let i=0;i<a.length;i+=4){
   if(a[i+3]<24){a[i]=0;a[i+1]=0;a[i+2]=0;a[i+3]=0;}
  }
  for(let y=2;y<28;y++)for(let x=0;x<132;x++){
   const p=(y*132+x)*4,r=a[p],g=a[p+1],b=a[p+2];if(a[p+3]<180)continue;
   let color=null;
   if(name==='alex'){
    const sx=x-96;if(sx<0)continue;
    const front=(sx>=4&&sx<=21&&y>=7&&y<=23&&(sx<=17||y<=14)&&y>=Math.max(7,13-Math.floor(sx/3)))||(sx>=13&&sx<=25&&y>=4&&y<=7);
    const back=sx>=18&&sx<=30&&y>=4&&y<=19&&r<120&&g<115&&b<145;
    if(!(front||back)||(r<37&&g<34&&b<55))continue;
    const l=(r+g+b)/3;
    color=l>208?[202,120,57]:l>160?[164,84,41]:l>112?[127,61,34]:l>65?[91,43,28]:[63,32,28];
   }else if(name==='leo'){
    const sx=x-48;
    const crown=sx>=10&&sx<=40&&y>=2&&y<=13&&sx>=Math.max(10,16-y)&&sx<=Math.min(40,32+Math.floor(y/2));
    const nape=sx>=17&&sx<=35&&y>=13&&y<=20&&sx>=18+Math.floor((y-13)/3)&&sx<=35-Math.floor((y-13)/3);
    if(!(crown||nape))continue;
    if(r<35&&g<35&&b<52&&(sx<=12||sx>=39||y<=3))continue;
    if(y>=10&&y<=12&&sx>=13&&sx<=37)color=[29,24,43];
    else{
     const blond=[[245,197,101],[229,166,65],[207,132,49],[171,95,40],[252,214,123],[194,116,45],[223,154,59]];
     color=blond[(Math.floor(sx/4)*3+Math.floor(y/3)*2)%blond.length];
    }
   }
   if(color){a[p]=color[0];a[p+1]=color[1];a[p+2]=color[2];}
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
  load('kwame',typeof CROWN_ROYALS_KWAME_INLINE==='string'?CROWN_ROYALS_KWAME_INLINE:null);
  load('diego',typeof CROWN_ROYALS_DIEGO_INLINE==='string'?CROWN_ROYALS_DIEGO_INLINE:null);
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
  // Keep identical player width across camera directions. The old 0.86 X-scale
  // made quarter-facing Crown players visibly paper-thin and shifted their feet.
  // Quarter art is still provisional; never distort the whole silhouette.
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
 return Object.freeze({id:ID,playerId:'crown_royals_reference_alex',playerIds:Object.keys(PLAYERS),directions,isCrownPlayer,preload,draw,status:()=>({loaded:atlases.alex.loaded,leoLoaded:atlases.leo.loaded,kwameLoaded:atlases.kwame.loaded,diegoLoaded:atlases.diego.loaded,error:atlases.alex.error||atlases.leo.error||atlases.kwame.error||atlases.diego.error,paintedViews:3,quarterViews:'nearest-view placeholders',playerCount:4,hairCorrected:!!atlases.alex.painted&&!!atlases.leo.painted})});
})();
export {CROWN_ROYALS};
