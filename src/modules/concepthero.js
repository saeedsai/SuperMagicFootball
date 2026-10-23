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
 // Keep the illustrated eyes, nose, mouth and hair outline intact.
 // Recolour only pixels belonging to the existing painted head; no opaque face masks.
 const variants=new Map();
 function rgb(hex){
  if(!/^#[0-9a-f]{6}$/i.test(hex))return null;
  return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 }
 function tintedLayer(source,person){
  const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
  const x=canvas.getContext('2d',{willReadFrequently:true});
  x.drawImage(source,0,0);
  const frame=x.getImageData(0,0,canvas.width,canvas.height),data=frame.data;
  const skin=rgb(person.skin),hair=rgb(person.hair);
  if(!skin||!hair)return canvas;
  const clampColor=n=>Math.max(0,Math.min(255,Math.round(n)));
  for(let y=0;y<Math.min(124,canvas.height);y++)for(let col=0;col<canvas.width;col++){
   const i=(y*canvas.width+col)*4;
   if(data[i+3]<25)continue;
   const r=data[i],g=data[i+1],b=data[i+2];
   // Original atlas uses warm brown hair and peach skin. Restrict hair to
   // the upper head so eyebrows, iris, shirt emblems and outlines survive.
   const isSkin=y>=37&&r>165&&g>89&&b>48&&r>g*1.14&&g>b*1.07;
   const isHair=y<91&&r>52&&g>23&&b>10&&r>g*1.15&&g>b*1.05&&!isSkin;
   if(!isSkin&&!isHair)continue;
   const base=isSkin?[232,166,120]:[128,75,46],target=isSkin?skin:hair;
   const light=(r+g+b)/(base[0]+base[1]+base[2]);
   for(let channel=0;channel<3;channel++){
    const tinted=target[channel]*Math.max(.45,Math.min(1.55,light));
    data[i+channel]=clampColor(tinted*.88+data[i+channel]*.12);
   }
  }
  x.putImageData(frame,0,0);
  return canvas;
 }
 function variant(kind,person){
  if(!person)return null;
  const key=kind+':'+person.index+':'+person.skin+':'+person.hair;
  if(variants.has(key))return variants.get(key);
  const [sx,sw]=regions[kind];
  const full=document.createElement('canvas');full.width=sw;full.height=HEIGHT;
  full.getContext('2d').drawImage(atlas.image,sx,0,sw,HEIGHT,0,0,sw,HEIGHT);
  const result={full:tintedLayer(full,person),body:tintedLayer(atlas.parts[kind].body,person)};
  variants.set(key,result);
  return result;
 }
 function paintIdentity(ctx,person,kind,sw){
  if(!person)return;
  // Small painted accessories only: never cover the original face or eyes.
  const cx=sw*.5,back=kind==='back'||kind==='quarterBack',profile=kind==='side';
  ctx.save();
  if(person.index===1||person.index===11){
   ctx.strokeStyle='#e5ddc6';ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(cx-20,39);ctx.quadraticCurveTo(cx,33,cx+20,39);ctx.stroke();
  }
  if(person.index===7){
   ctx.fillStyle='#e8c16d';ctx.beginPath();ctx.arc(cx+(profile?17:23),83,2.5,0,Math.PI*2);ctx.fill();
  }
  if(person.index===9||person.index===11){
   ctx.strokeStyle=person.hair;ctx.lineWidth=5;ctx.lineCap='round';
   ctx.beginPath();ctx.moveTo(cx+22,36);ctx.quadraticCurveTo(cx+31,50,cx+24,70);ctx.stroke();
  }
  if(!back){
   if(person.index===5){
    ctx.fillStyle='#a7654e';
    for(let j=0;j<4;j++)ctx.fillRect(cx-18+j*5,88+(j%2)*3,1.7,1.7);
   }
   if(person.index===6){
    ctx.strokeStyle='#543d38';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(cx+13,84);ctx.lineTo(cx+17,90);ctx.stroke();
   }
   if(person.index===10){
    ctx.fillStyle='#e8d8ba';ctx.fillRect(cx+15,86,8,3);
   }
  }
  ctx.restore();
 }
 function draw(ctx,p,view,{run=0}={}){
  if(!isConceptPlayer(p))return false;
  if(!atlas.ready){preload();return false;}
  const kind=regions[view?.kind]?view.kind:'front';
  const [sx,sw]=regions[kind];
  const h=141,w=sw*h/HEIGHT,gait=clamp(run),active=Math.abs(gait)>.07,person=identity(p);
  const painted=person&&atlas.parts[kind]?variant(kind,person):null;
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
   ctx.drawImage(painted?.body||parts.body,0,0);
   paintIdentity(ctx,person,kind,sw);
  }else{
   ctx.translate(-w/2,-h+6);ctx.scale(w/sw,h/HEIGHT);
   if(painted)ctx.drawImage(painted.full,0,0);
   else ctx.drawImage(atlas.image,sx,0,sw,HEIGHT,0,0,sw,HEIGHT);
   paintIdentity(ctx,person,kind,sw);
  }
  ctx.restore();return true;
 }
 preload();
 return Object.freeze({id:ID,directions,isConceptPlayer,preload,draw,status:()=>({loaded:atlas.ready,error:atlas.error,animatedViews:Object.keys(atlas.parts).length})});
})();
export {CONCEPT_HERO};
