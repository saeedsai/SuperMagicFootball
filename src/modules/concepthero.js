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
 // Identity artwork is anchored in the original 5-view painted atlas coordinates.
 // All overlays are painted in sprite space, so idle and running use identical faces.
 const identityStyles=Object.freeze(['messy','swept','coils','fade','fringe','crop','curly','locs','buzz','ponytail','shortCurls','long']);
 function identity(p){
  const a=p?.src?.appearance||p?.appearance||{};
  const index=Number.isInteger(a.conceptHeroVariant)?a.conceptHeroVariant:-1;
  return index>=0&&index<12?{index,skin:a.skin||'#e8b48e',hair:a.hair||'#493020',style:identityStyles[index]}:null;
 }
 function paintIdentity(ctx,person,kind,sw){
  if(!person)return;
  const profile=kind==='side'||kind==='quarterBack'||kind==='quarterFront';
  const back=kind==='back'||kind==='quarterBack';
  const cx=sw*.5,headY=45,headW=profile?27:35;
  ctx.save();
  ctx.lineWidth=2.1;ctx.strokeStyle='#281d26';
  // The head silhouette changes with face width and hair, not just hue.
  const widths=[1,.94,1.06,.98,.92,1.02,1.07,1.01,.95,.99,1.04,.97];
  const w=headW*widths[person.index];
  ctx.fillStyle=person.skin;
  ctx.beginPath();ctx.ellipse(cx,headY+12,w*.68,29,profile?-.1:0,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle=person.hair;
  const volume=[18,15,21,10,16,9,22,21,5,17,13,21][person.index];
  ctx.beginPath();ctx.ellipse(cx,headY-9,w*.78,volume,0,Math.PI,Math.PI*2);ctx.lineTo(cx+w*.75,headY-5);ctx.lineTo(cx-w*.75,headY-5);ctx.closePath();ctx.fill();ctx.stroke();
  if(['coils','curly','locs','shortCurls'].includes(person.style)){
   const n=person.style==='locs'?7:10;
   for(let i=0;i<n;i++){
    const x=cx-w*.72+(i+.5)*w*1.44/n;
    const y=headY-13-Math.sin(i*1.7)*5;
    ctx.beginPath();ctx.arc(x,y,person.style==='locs'?4:5,0,Math.PI*2);ctx.fill();
    if(person.style==='locs'&&i%2===0)ctx.fillRect(x-2,y,4,21);
   }
  }
  if(person.style==='ponytail'||person.style==='long'){
   ctx.fillRect(cx-w*.75,headY-9,8,person.style==='long'?47:32);
   ctx.fillRect(cx+w*.65,headY-9,8,person.style==='long'?47:32);
  }
  if(person.style==='fringe'||person.style==='messy'||person.style==='swept'){
   ctx.beginPath();ctx.moveTo(cx-w*.7,headY-13);ctx.lineTo(cx+w*.4,headY+2);ctx.lineTo(cx+w*.72,headY-15);ctx.fill();
  }
  if(!back){
   ctx.fillStyle='#251c23';
   const eyeY=headY+12;
   for(const sign of (profile?[1]:[-1,1])){
    const x=cx+sign*w*.31;
    ctx.fillRect(x-3,eyeY,6,2.5);
    ctx.fillRect(x-2,eyeY+1,2,2);
   }
   ctx.strokeStyle='#704b42';ctx.lineWidth=1.6;
   ctx.beginPath();ctx.moveTo(cx-5,headY+30);ctx.quadraticCurveTo(cx,headY+33,cx+6,headY+29);ctx.stroke();
   if(person.index===6){ctx.strokeStyle='#25212a';ctx.beginPath();ctx.moveTo(cx-13,headY+18);ctx.lineTo(cx-8,headY+24);ctx.stroke();}
   if(person.index===5){ctx.fillStyle='#a7674c';for(let j=0;j<5;j++)ctx.fillRect(cx-15+j*6,headY+17+(j%2)*4,2,2);}
   if(person.index===10){ctx.fillStyle='#eed3a2';ctx.fillRect(cx+9,headY+20,11,6);}
   if(person.index===8){ctx.strokeStyle='#39323b';ctx.beginPath();ctx.moveTo(cx-19,headY-2);ctx.lineTo(cx-13,headY+12);ctx.stroke();}
  }
  if(person.index===1||person.index===11){ctx.strokeStyle='#ece5d9';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx-w*.77,headY-12);ctx.lineTo(cx+w*.77,headY-12);ctx.stroke();}
  if(person.index===7){ctx.fillStyle='#e1c27b';ctx.beginPath();ctx.arc(cx+w*.7,headY+18,3,0,Math.PI*2);ctx.fill();}
  if(person.index===3){ctx.strokeStyle='#413341';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+w*.6,headY+39);ctx.lineTo(cx+w*.7,headY+52);ctx.stroke();}
  ctx.restore();
 }
 function draw(ctx,p,view,{run=0}={}){
  if(!isConceptPlayer(p))return false;
  if(!atlas.ready){preload();return false;}
  const kind=regions[view?.kind]?view.kind:'front';
  const [sx,sw]=regions[kind];
  const h=141,w=sw*h/HEIGHT,gait=clamp(run),active=Math.abs(gait)>.07,person=identity(p);
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
   paintIdentity(ctx,person,kind,sw);
  }else{
   ctx.translate(-w/2,-h+6);ctx.scale(w/sw,h/HEIGHT);
   ctx.drawImage(atlas.image,sx,0,sw,HEIGHT,0,0,sw,HEIGHT);
   paintIdentity(ctx,person,kind,sw);
  }
  ctx.restore();return true;
 }
 preload();
 return Object.freeze({id:ID,directions,isConceptPlayer,preload,draw,status:()=>({loaded:atlas.ready,error:atlas.error,animatedViews:Object.keys(atlas.parts).length})});
})();
export {CONCEPT_HERO};
