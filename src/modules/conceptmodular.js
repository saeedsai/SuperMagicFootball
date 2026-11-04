import {CONCEPT_HERO} from "./concepthero.js";
// C01: independent illustrated front face under front hair, rear hair on original
// approved painted hero. Never owns root transforms, hitboxes or gameplay actions.
const CONCEPT_MODULAR=(()=>{
 const ID='concept_modular_v1',HEIGHT=265,EXPECTED_IDS=['hair_front_001','hair_back_001','face_front_001','arm_near_front_001','arm_far_front_001','torso_collar_front_001','torso_front_001','torso_back_001'];
 function resolveManifestUrl(){
  try{return new URL('../../assets/characters/concept_modular_v1/manifests/rig.json',import.meta.url);}catch{}
  const relative='./assets/characters/concept_modular_v1/manifests/rig.json';
  for(const base of [typeof document!=='undefined'?document.baseURI:null,typeof location!=='undefined'?location.href:null]){
   if(typeof base==='string'&&base)try{return new URL(relative,base);}catch{}
  }
  if(typeof location!=='undefined'&&typeof location.origin==='string'&&location.origin!=='null')try{return new URL('/assets/characters/concept_modular_v1/manifests/rig.json',location.origin);}catch{}
  // Inline browser QA can have an about:blank import and no document base. A
  // harmless absolute fallback keeps initialization valid; bundled layers use
  // their data URLs and never request this placeholder.
  return new URL('https://supermagicfootball.invalid/assets/characters/concept_modular_v1/manifests/rig.json');
 }
 const manifestUrl=resolveManifestUrl();
 const inlineManifest=typeof CONCEPT_MODULAR_MANIFEST_INLINE==='object'&&CONCEPT_MODULAR_MANIFEST_INLINE?CONCEPT_MODULAR_MANIFEST_INLINE:null;
 const inlineAssets=typeof CONCEPT_MODULAR_INLINE_ASSETS==='object'&&CONCEPT_MODULAR_INLINE_ASSETS?CONCEPT_MODULAR_INLINE_ASSETS:Object.create(null);
 const slotIds={front:'hair_front_001',back:'hair_back_001',frontFace:'face_front_001',frontArm:'arm_near_front_001',frontFarArm:'arm_far_front_001',frontCollar:'torso_collar_front_001',frontTorso:'torso_front_001',backTorso:'torso_back_001'};
 const expectedViews={hair_front_001:'front',hair_back_001:'back',face_front_001:'front',arm_near_front_001:'front',arm_far_front_001:'front',torso_collar_front_001:'front',torso_front_001:'front',torso_back_001:'back'};
 let logicalHeight=141,viewArt=Object.create(null),faceArt=null,armArt=null,farArmArt=null,collarArt=null,torsoArt=null,backTorsoArt=null;
 let manifestReady=false,manifestError=false,manifestPromise=null;
 const states=Object.create(null);
 function configureManifest(manifest){
  if(!manifest||manifest.schema!=='smf-concept-modular/1'||manifest.fallbackModel!=='concept_hero'||manifest.authoredViews?.join(',')!=='front,back')return false;
  const layers=[manifest.runtimeLayer,...(Array.isArray(manifest.additionalLayers)?manifest.additionalLayers:[])];
  const byId=new Map(layers.map(layer=>[layer?.id,layer]));
  if(layers.length!==EXPECTED_IDS.length||new Set(layers.map(l=>l?.id)).size!==EXPECTED_IDS.length||EXPECTED_IDS.some(id=>!byId.has(id)))return false;
  if(new Set(layers.map(l=>l?.asset)).size!==EXPECTED_IDS.length)return false;
  const make=id=>{
   const layer=byId.get(id),dims=layer.sourceCanvas;
   const pivot=layer.pivot,view=expectedViews[id],viewWidth=view==='front'?112:115;
   if(layer.view!==view||!Array.isArray(dims)||dims.length!==2||dims[0]!==viewWidth||dims[1]!==HEIGHT||typeof layer.asset!=='string'||!/^\.\.\/source\/[A-Za-z0-9._-]+\.svg$/.test(layer.asset))return null;
   if(!Array.isArray(pivot)||pivot.length!==2||!pivot.every(Number.isFinite)||pivot[0]<0||pivot[0]>dims[0]||pivot[1]<0||pivot[1]>dims[1])return null;
   return {id,width:dims[0],height:dims[1],path:layer.asset,inline:typeof inlineAssets[layer.asset]==='string'?inlineAssets[layer.asset]:null,layer};
  };
  const art=Object.fromEntries(Object.entries(slotIds).map(([slot,id])=>[slot,make(id)]));
  if(Object.values(art).some(value=>!value))return false;
  logicalHeight=Number.isFinite(manifest.logicalPlayerHeight)&&manifest.logicalPlayerHeight>0?manifest.logicalPlayerHeight:141;
  viewArt={front:art.front,back:art.back};faceArt=art.frontFace;armArt=art.frontArm;farArmArt=art.frontFarArm;collarArt=art.frontCollar;torsoArt=art.frontTorso;backTorsoArt=art.backTorso;
  manifestReady=true;manifestError=false;return true;
 }
 function ensureManifest(){
  if(manifestReady)return Promise.resolve(true);
  if(inlineManifest){const ok=configureManifest(inlineManifest);manifestError=!ok;return Promise.resolve(ok);}
  if(manifestPromise)return manifestPromise;
  if(typeof fetch!=='function'){manifestError=true;return Promise.resolve(false);}
  manifestPromise=fetch(manifestUrl,{cache:'force-cache'}).then(response=>{if(!response.ok)throw Error('modular manifest HTTP '+response.status);return response.json();})
   .then(manifest=>configureManifest(manifest)).catch(()=>{manifestError=true;return false;})
   .then(ok=>{if(!ok)manifestError=true;return ok;});
  return manifestPromise;
 }
 if(inlineManifest&&!configureManifest(inlineManifest))manifestError=true;
 function preload(retryFailed=false){
  if(typeof Image==='undefined')return;
  if(!manifestReady){ensureManifest().then(ok=>{if(ok)preload(retryFailed);});return;}
  for(const [kind,art] of [['front',viewArt.front],['back',viewArt.back],['frontFace',faceArt],['frontArm',armArt],['frontFarArm',farArmArt],['frontCollar',collarArt],['frontTorso',torsoArt],['backTorso',backTorsoArt]]){
   if(states[kind]&&(!retryFailed||!states[kind].error))continue;
   const state={image:new Image(),ready:false,error:false};states[kind]=state;
   state.image.onload=()=>{state.ready=state.image.naturalWidth===art.width&&state.image.naturalHeight===art.height;state.error=!state.ready;};
   state.image.onerror=()=>{state.error=true;};
   state.image.src=art.inline?'data:image/svg+xml;base64,'+art.inline
    :new URL(art.path,manifestUrl).href;
  }
 }
 // Keep the legacy renderer visible after a failed modular request, then retry
 // only the failed layers when connectivity returns. Successful layers are
 // retained and the normal all-required-layers guard prevents partial paint.
 function retryFailedAssets(){
  if(manifestError){manifestError=false;manifestPromise=null;}
  for(const [kind,state] of Object.entries(states))if(state.error)delete states[kind];
  preload(true);
 }
 if(typeof window!=='undefined'&&typeof window.addEventListener==='function')window.addEventListener('online',retryFailedAssets);
 function supports(p){return p?.src?.renderModel===ID||p?.src?.appearance?.renderModel===ID;}
 function draw(ctx,p,view,{run=0}={}){
  if(!supports(p))return false;
  const kind=view?.kind,art=viewArt[kind];
  if(!art)return false; // All six unauthored quarter/side headings use the old renderer.
  const state=states[kind];
  // Never paint only part of the front modular head if face or hair is unavailable.
  if(!state?.ready||(kind==='front'&&(!states.frontFace?.ready||!states.frontArm?.ready||!states.frontFarArm?.ready||!states.frontCollar?.ready||!states.frontTorso?.ready)||(kind==='back'&&!states.backTorso?.ready))){preload();return false;}
  if(!CONCEPT_HERO.draw(ctx,p,view,{run}))return false;
  const ratio=logicalHeight/HEIGHT,w=art.width*ratio;
  const phase=Math.max(-1,Math.min(1,Number.isFinite(run)?run:0));
  // C01: smooth the first 18% of the run cycle so returning to idle never
  // snaps the illustrated arms. Large strides and legacy timing stay identical.
  const armBlend=Math.min(1,Math.abs(phase)/.18);
  const armPhase=phase*armBlend*armBlend*(3-2*armBlend);
  if(kind==='front'){
   // Far arm first (behind the painted face, opposite arm and front fringe).
   // Existing run timing and root transform are owned by Renderer, not this layer.
   const farPivot=farArmArt.layer.pivot,fx=(farPivot[0]-56)*ratio,fy=-logicalHeight+6+farPivot[1]*ratio;
   const farArmStride=armPhase*.035;
   ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.translate(fx,fy);ctx.rotate(farArmStride);ctx.translate(-fx,-fy);
   ctx.drawImage(states.frontFarArm.image,-farArmArt.width*ratio/2,-logicalHeight+6,farArmArt.width*ratio,logicalHeight);
   ctx.restore();
   // C01: original number 10 is reauthored as a separately editable jersey front.
   // Original base/legs remain unchanged underneath. Do not expand arm motion yet.
   ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(states.frontTorso.image,-torsoArt.width*ratio/2,-logicalHeight+6,torsoArt.width*ratio,logicalHeight);
   ctx.restore();
   // C01: separately editable transparent jersey collar bridges the arm shoulders.
   // This is deliberately a small trim layer; the original torso stays beneath.
   ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(states.frontCollar.image,-collarArt.width*ratio/2,-logicalHeight+6,collarArt.width*ratio,logicalHeight);
   ctx.restore();
   // Face sits over the unchanged original body and collar, below front hair.
   ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(states.frontFace.image,-faceArt.width*ratio/2,-logicalHeight+6,faceArt.width*ratio,logicalHeight);
   ctx.restore();
   // C01: one genuinely editable near arm; subtle counter-stride at its actual
   // shoulder pivot. The baked original arm stays beneath pending torso extraction.
   // Use only the existing run phase; collision/action logic stays in Renderer.
   const nearPivot=armArt.layer.pivot,ax=(nearPivot[0]-56)*ratio,ay=-logicalHeight+6+nearPivot[1]*ratio;
   const armStride=-armPhase*.035;
   ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.translate(ax,ay);ctx.rotate(armStride);ctx.translate(-ax,-ay);
   ctx.drawImage(states.frontArm.image,-armArt.width*ratio/2,-logicalHeight+6,armArt.width*ratio,logicalHeight);
   ctx.restore();
  }
  if(kind==='back'){
   // Rear jersey is painted over the untouched legacy body, underneath rear hair.
   // No mirrored text, new hitboxes or changes to the other six view fallbacks.
   ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(states.backTorso.image,-backTorsoArt.width*ratio/2,-logicalHeight+6,backTorsoArt.width*ratio,logicalHeight);
   ctx.restore();
  }
  const pivot=art.layer.pivot;
  const sway=Math.abs(phase)>.07?phase*.012:0;
  const px=(pivot[0]-art.width/2)*ratio,py=-logicalHeight+6+pivot[1]*ratio;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.translate(px,py);ctx.rotate(sway);ctx.translate(-px,-py);
  ctx.drawImage(state.image,-w/2,-logicalHeight+6,w,logicalHeight);
  ctx.restore();return true;
 }
 preload();
 function status(){
  const ready=kind=>!!states[kind]?.ready;
  return {loaded:manifestReady&&ready('front')&&ready('back')&&ready('frontFace')&&ready('frontArm')&&ready('frontFarArm')&&ready('frontCollar')&&ready('frontTorso')&&ready('backTorso'),
   error:manifestError||Object.values(states).some(s=>s.error),manifestLoaded:manifestReady,
   authoredViews:Object.keys(viewArt).filter(kind=>ready(kind)&&((kind==='back'?ready('backTorso'):kind!=='front'||(ready('frontFace')&&ready('frontArm')&&ready('frontFarArm')&&ready('frontCollar')&&ready('frontTorso'))))),
   authoredParts:[...(ready('front')?[viewArt.front.path.split('/').pop().replace(/\.svg$/,'')]:[]),...(ready('back')?[viewArt.back.path.split('/').pop().replace(/\.svg$/,'')]:[]),...(ready('frontFace')?[faceArt.path.split('/').pop().replace(/\.svg$/,'')]:[]),...(ready('frontArm')?[armArt.path.split('/').pop().replace(/\.svg$/,'')]:[]),...(ready('frontFarArm')?[farArmArt.path.split('/').pop().replace(/\.svg$/,'')]:[]),...(ready('frontCollar')?[collarArt.path.split('/').pop().replace(/\.svg$/,'')]:[]),...(ready('frontTorso')?[torsoArt.path.split('/').pop().replace(/\.svg$/,'')]:[]),...(ready('backTorso')?[backTorsoArt.path.split('/').pop().replace(/\.svg$/,'')]:[])],
   faceLoaded:ready('frontFace'),armLoaded:ready('frontArm'),farArmLoaded:ready('frontFarArm'),frontArmStrideEnabled:true,reciprocalArmsEnabled:true,collarLoaded:ready('frontCollar'),torsoLoaded:ready('frontTorso'),backTorsoLoaded:ready('backTorso'),fallback:'concept_hero',hairSwayEnabled:true};
 }
 return Object.freeze({id:ID,supports,preload,draw,status});
})();
export {CONCEPT_MODULAR};
