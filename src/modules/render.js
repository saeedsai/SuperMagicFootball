// Supermagic Football v0.8.25.30 | RENDER | independently editable module
import {DRIBBLES} from "./dribbles.js";
import {DATA} from "./data.js";
import {EXPANDED} from "./expanded.js";
import {VISUALFEEL} from "./visualfeel.js";
import {ENGINE} from "./engine.js";
import {STATS} from "./stats.js";
import {BPWPERSONALITY} from "./bpwpersonality.js";
import {ARTPOSE} from "./artpose.js";
import {CHARACTER_ART} from "./characterart.js";
import {CONCEPT_HERO} from "./concepthero.js";
import {CROWN_ROYALS} from "./crownroyals.js";
import {CONCEPT_MODULAR} from "./conceptmodular.js";
const RENDER=(()=>{const {WORLD}=ENGINE;const {TEAMS,SHOTS,STADIUMS}=DATA;const {dribbleStyle}=DRIBBLES;const {avatarFor}=EXPANDED;const {profileFor,sampleMotion}=BPWPERSONALITY;



const F=WORLD.field;const PI=Math.PI;
// Short visual contact puff centered on the alternating run-foot touchdown
// phases. This consumes the same player phase as the articulated foot poses;
// it is presentation-only and never feeds back into locomotion.
function runFootContactPulse(phase){
 const raw=Number(phase),cycle=((Number.isFinite(raw)?raw:0)%PI+PI)%PI;
 const distance=Math.min(cycle,PI-cycle);
 return clamp(1-distance/.48,0,1);
}
// Water kicked up by a slide is a quiet, fixed contact accent: it is attached
// to the committed tackle direction, not simulated as particles or fed back
// into the wet-pitch physics. Reduced-flash mode keeps the cue dimmer.
function drawWetSlideSpray(ctx,dx,dy,reducedFlash=false){
 const x=Number(dx),y=Number(dy),speed=Math.hypot(x,y);
 if(!Number.isFinite(speed)||speed<.2)return false;
 const ux=x/speed,uy=y/speed;
 ctx.save();ctx.globalAlpha=reducedFlash?.13:.24;ctx.fillStyle='#c3eff5';
 for(let i=0;i<5;i++){
  const distance=19+i*9,side=(i%3-1)*5;
  ctx.beginPath();ctx.ellipse(-ux*distance-uy*side,4-uy*distance+ux*side,3.4+(i%2)*.7,1.6,Math.atan2(uy,ux),0,PI*2);ctx.fill();
 }
 ctx.globalAlpha=reducedFlash?.12:.20;ctx.strokeStyle='#e2f7fa';ctx.lineWidth=2.2;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(-ux*14-uy*6,4-uy*14+ux*6);
 ctx.quadraticCurveTo(-ux*30+uy*8,3-uy*30-ux*8,-ux*49,3-uy*49);ctx.stroke();ctx.lineCap='butt';
 ctx.restore();return true;
}
// Rendering is synchronous; reusable per-leg outputs avoid allocating in the
// high-frequency match draw loop. Each result is consumed before its next use.
const runFootPoseScratch=[{},{}];
// Use the current selection, not p.controlled (which is a physics-frame snapshot).
// A switch can occur after that snapshot but before the next painted frame.
// In a network match both teams are human in the shared simulation, but only
// the local side owns this HUD. Null means ordinary couch Versus: show one
// selected ring per local human; never draw remote or CPU selection rings.
function shouldShowBreathRing(p,game,inMatchDraw){
 return !!(inMatchDraw&&!p.preview&&
  (game.localBreathSide==null||game.localBreathSide===p.t)&&
  game.inControl(p.t)&&game.controlledPlayer(p.t)===p);
}
const rgb=(hex,a)=>hex+a;
const c=(ctx,v)=>{ctx.fillStyle=v};
function rr(ctx,x,y,w,h,r,col,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=col;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,PI*2);ctx.fillStyle=fill;ctx.fill()}
// Telegraph the short trap arming window. The ring shrinks as the trap becomes live;
// it uses the existing hazard timer, with no gameplay or save-format changes.
function drawHazardArmingCue(ctx,hazard,radius,armDuration,color,reducedFlash=false){
 if(!hazard||!Number.isFinite(hazard.arm)||hazard.arm<=0||!Number.isFinite(hazard.life)||hazard.life<=0)return;
 const progress=Math.max(0,Math.min(1,hazard.arm/armDuration));
 ctx.save();
 if(reducedFlash){
  // Keep the gameplay warning visible without a timer-driven sweep.
  ctx.globalAlpha=.46;ctx.beginPath();ctx.arc(hazard.x,hazard.y,radius,0,PI*2);
  ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();ctx.restore();return;
 }
 ctx.globalAlpha=.38+.42*progress;
 ctx.beginPath();ctx.arc(hazard.x,hazard.y,radius,-PI/2,-PI/2+PI*2*progress);
 ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();
 ctx.restore();
}
// Original lightweight canvas peel artwork: no sprite fetch or save-data dependency.
function drawBananaPeels(ctx,hazards,reducedFlash=false){
 for(const peel of hazards||[]){
  if(peel.kind!=='banana'||peel.life<=0)continue;
  ctx.save();ctx.globalAlpha=Math.min(1,peel.life/.5);
  ellipse(ctx,peel.x,peel.y+4,16,5,'rgba(22,30,13,.27)');
  ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(peel.x-13,peel.y-6);
  ctx.quadraticCurveTo(peel.x,peel.y+10,peel.x+13,peel.y-6);
  ctx.strokeStyle='#b87918';ctx.lineWidth=9;ctx.stroke();
  ctx.strokeStyle='#ffe35a';ctx.lineWidth=6;ctx.stroke();
  drawHazardArmingCue(ctx,peel,21,.25,'#fff1a3',reducedFlash);
  ctx.restore();
 }
}
// Bounded crystalline ground patch; distinct from the yellow banana artwork.
function drawIcePatches(ctx,hazards,reducedFlash=false){
 for(const patch of hazards||[]){
  if(patch.kind!=='ice'||patch.life<=0)continue;
  ctx.save();
  ctx.globalAlpha=Math.min(.9,patch.life/.5);
  ellipse(ctx,patch.x,patch.y+3,30,12,'rgba(10,43,72,.28)');
  ellipse(ctx,patch.x,patch.y,29,11,'#87e1f3');
  ellipse(ctx,patch.x,patch.y-2,22,6,'#d9f9ff');
  ctx.beginPath();
  ctx.moveTo(patch.x-18,patch.y+1);ctx.lineTo(patch.x-5,patch.y-7);
  ctx.moveTo(patch.x+2,patch.y+5);ctx.lineTo(patch.x+19,patch.y-3);
  ctx.strokeStyle='#4aa9dc';ctx.lineWidth=2;ctx.stroke();
  drawHazardArmingCue(ctx,patch,37,.3,'#e9fbff',reducedFlash);
  ctx.restore();
 }
}
function drawMagicWalls(ctx,walls,reducedFlash=false){
 for(const wall of walls||[]){
  if(!wall||wall.duration<=0)continue;
  const arming=wall.arm>0,id=wall.id||'magicWall',color=wall.color||'#72e8ff';ctx.save();ctx.globalAlpha=arming ? (reducedFlash ? .6 : .46) : .82;
  ctx.lineCap='round';ctx.setLineDash(arming&&!reducedFlash?[8,7]:[]);
  ctx.beginPath();ctx.moveTo(wall.x,wall.y-wall.halfLength);ctx.lineTo(wall.x,wall.y+wall.halfLength);
  ctx.strokeStyle=color;ctx.lineWidth=arming?wall.thickness:wall.thickness+8;ctx.shadowColor=color;ctx.shadowBlur=reducedFlash?4:arming?8:18;ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle=id==='demonWall'?'#f2dcff':'#fff';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);
  if(id==='fireWall'){
   ctx.strokeStyle='#ffd47a';ctx.lineWidth=3;
   for(let y=wall.y-wall.halfLength+12;y<wall.y+wall.halfLength;y+=24){const side=Math.round((y+wall.halfLength)/24)%2?1:-1;ctx.beginPath();ctx.moveTo(wall.x,y+8);ctx.quadraticCurveTo(wall.x+side*11,y+2,wall.x+side*8,y-6);ctx.quadraticCurveTo(wall.x+side*5,y-14,wall.x,y-18);ctx.stroke();}
  }else if(id==='iceWall'){
   ctx.fillStyle='#e6fbff';ctx.strokeStyle='#d4f6ff';ctx.lineWidth=2;
   for(let y=wall.y-wall.halfLength+16;y<wall.y+wall.halfLength;y+=28){const side=Math.round((y+wall.halfLength)/28)%2?1:-1;ctx.beginPath();ctx.moveTo(wall.x,y-10);ctx.lineTo(wall.x+side*11,y);ctx.lineTo(wall.x,y+10);ctx.lineTo(wall.x-side*5,y);ctx.closePath();ctx.fill();ctx.stroke();}
  }else if(id==='demonWall'){
   ctx.strokeStyle='#5a2475';ctx.fillStyle='#f5ddff';ctx.lineWidth=3;
   for(let y=wall.y-wall.halfLength+14;y<wall.y+wall.halfLength;y+=28){const side=Math.round((y+wall.halfLength)/28)%2?1:-1;ctx.beginPath();ctx.moveTo(wall.x,y+10);ctx.lineTo(wall.x+side*12,y+1);ctx.lineTo(wall.x+side*5,y-3);ctx.lineTo(wall.x+side*9,y-13);ctx.stroke();ctx.beginPath();ctx.arc(wall.x+side*2,y,2.3,0,Math.PI*2);ctx.fill();}
  }else{
   ctx.strokeStyle='#e7fdff';ctx.lineWidth=2;
   for(let y=wall.y-wall.halfLength+18;y<wall.y+wall.halfLength;y+=36){ctx.beginPath();ctx.moveTo(wall.x-6,y);ctx.lineTo(wall.x+6,y);ctx.stroke();}
  }
  ctx.restore();
 }
}
function drawSupernova(ctx,nova,reducedFlash=false){
 if(!nova||nova.remaining<=0)return;
 const progress=Math.max(0,Math.min(1,1-nova.remaining/nova.telegraph));
 ctx.save();ctx.globalAlpha=reducedFlash?.72:.62;ctx.setLineDash(reducedFlash?[]:[7,6]);
 ctx.beginPath();ctx.arc(nova.x,nova.y,nova.radius,0,PI*2);ctx.strokeStyle='#edcaff';ctx.lineWidth=reducedFlash?4:3;ctx.stroke();
 ctx.setLineDash([]);ctx.globalAlpha=reducedFlash?.6:.42;
 ctx.beginPath();ctx.arc(nova.x,nova.y,Math.max(4,nova.radius*progress),0,PI*2);ctx.strokeStyle='#d8a1ff';ctx.lineWidth=reducedFlash?5:4;ctx.stroke();
 for(let i=0;i<8;i++){const a=i*PI/4,inner=nova.radius-12,outer=nova.radius+4;
  ctx.beginPath();ctx.moveTo(nova.x+Math.cos(a)*inner,nova.y+Math.sin(a)*inner);ctx.lineTo(nova.x+Math.cos(a)*outer,nova.y+Math.sin(a)*outer);ctx.strokeStyle='#f2ddff';ctx.lineWidth=2;ctx.stroke();}
 ctx.restore();
}
// Trace a stable two-strand helix along Tornado Shot's real ball trail. The
// ribbon is derived from recorded path points, so it does not animate or flash
// independently of the shot and remains readable with reduced motion enabled.
function drawSpiralRibbon(ctx,trail,color,reducedFlash=false){
 const points=(trail||[]).slice(-22);
 if(points.length<4)return;
 ctx.save();ctx.globalAlpha=reducedFlash?.46:.78;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.shadowColor=color;ctx.shadowBlur=reducedFlash?0:7;
 for(let strand=0;strand<2;strand++){
  ctx.beginPath();
  for(let i=0;i<points.length;i++){
   const p=points[i],before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
   const dx=after.x-before.x,dy=after.y-before.y,len=Math.hypot(dx,dy)||1;
   const progress=i/(points.length-1),angle=progress*PI*4+strand*PI,radius=5+progress*9;
   const wave=Math.cos(angle)*radius,depth=Math.sin(angle)*radius*.38;
   const x=p.x-dy/len*wave+dx/len*depth,y=p.y-(p.z||0)+dx/len*wave+dy/len*depth;
   if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.strokeStyle=strand?'#efffff':color;ctx.lineWidth=strand?1.8:2.8;ctx.stroke();
 }
 ctx.restore();
}
// A restrained orbital glint gives every transformed Super Shot a shared
// motion cue without washing out its individual silhouette. The arc and glint
// follow the shot in world space; reduced-flash uses a stable low-alpha mark.
function drawSuperShotOrbitCue(ctx,time,color,reducedFlash=false){
 const t=Number.isFinite(Number(time))?Number(time):0,phase=reducedFlash?-.45:t*1.8-.45;
 ctx.save();ctx.globalAlpha*=reducedFlash?.18:.32;ctx.strokeStyle=color||'#d7f6ff';ctx.lineWidth=1.5;ctx.lineCap='round';
 ctx.beginPath();ctx.ellipse(0,0,32,25,-.24,phase,phase+1.75);ctx.stroke();
 const x=Math.cos(phase+1.75)*32,y=Math.sin(phase+1.75)*25,r=reducedFlash?2:2.8;
 poly(ctx,[[x,y-r*1.8],[x+r*.55,y-r*.55],[x+r*1.8,y],[x+r*.55,y+r*.55],[x,y+r*1.8],[x-r*.55,y+r*.55],[x-r*1.8,y],[x-r*.55,y-r*.55]],'#fff7cf');
 ctx.restore();
}

// A compact, steady wake helps track a fast ordinary strike without adding
// an animated flash. Prefer the renderer's existing motion samples so the
// cue follows the ball's visible path; synthesize a short straight fallback
// only for previews or freshly launched balls that have no history yet.
function drawOrdinaryBallWake(ctx,b,reducedFlash=false){
 const vx=Number(b?.vx)||0,vy=Number(b?.vy)||0,speed=Math.hypot(vx,vy);
 if(!Number.isFinite(speed)||speed<=285)return false;
 const ux=vx/speed,uy=vy/speed,current={x:Number(b.x)||0,y:(Number(b.y)||0)-(Number(b.z)||0)};
 let points=(Array.isArray(b.trail)?b.trail.slice(-9):[]).filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z))
  .map(p=>({x:p.x,y:p.y-p.z}));
 if(points.length<2){const length=reducedFlash?22:34;points=[1,.76,.52,.28,0].map(t=>({x:current.x-ux*length*t,y:current.y-uy*length*t}));}
 else {const last=points[points.length-1];if(Math.hypot(current.x-last.x,current.y-last.y)>1)points.push(current);}
 if(points.length<2)return false;
 const path=()=>{ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length-1;i++){const midX=(points[i].x+points[i+1].x)/2,midY=(points[i].y+points[i+1].y)/2;ctx.quadraticCurveTo(points[i].x,points[i].y,midX,midY);}ctx.lineTo(points[points.length-1].x,points[points.length-1].y);};
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 // The soft outer stroke separates the wake from grass and stadium shadow;
 // the narrower pale center keeps direction readable at match scale.
 ctx.globalAlpha=reducedFlash?.12:.22;ctx.strokeStyle='#47c9e8';ctx.lineWidth=reducedFlash?5:8;path();ctx.stroke();
 ctx.globalAlpha=reducedFlash?.20:.42;ctx.strokeStyle=reducedFlash?'#e0ece8':'#fff8df';ctx.lineWidth=reducedFlash?1.5:2.5;path();ctx.stroke();ctx.restore();return true;
}
// Read-only shootout instructions: both local players use their existing four actions.
function penaltyHudHints(pk,humans){
 const turn=Number.isFinite(pk?.turn)?Math.abs(Math.trunc(pk.turn))%2:0;
 const flight=Number(pk?.shotTimer)>0;
 // Read the same bounded dive/recovery phases as penaltyKeeperVisual; never mutate pk.
 const diving=Number.isFinite(pk?.diveBoost)&&pk.diveBoost>0;
 const recovering=!diving&&Number.isFinite(pk?.diveCooldown)&&pk.diveCooldown>.08&&pk.diveCooldown<=.420001;
 const keeperHint=diving?'DIVING':recovering?'RECOVERING':'MOVE UP/DOWN + JUMP';
 if(Number(humans)>=2)return [
  `P${turn+1} TAKER: ${flight?'SHOT IN FLIGHT':'MOVE / AIM + SHOOT'}`,
  `P${2-turn} KEEPER: ${keeperHint}`
 ];
 return turn===0
  ? [flight?'P1 TAKER: SHOT IN FLIGHT':'P1 TAKER: MOVE / AIM + SHOOT','CPU KEEPER: AUTOMATIC']
  : [`CPU TAKER: ${flight?'SHOT IN FLIGHT':'PREPARING SHOT'}`,'P1 KEEPER: AUTOMATIC'];
}
function line(ctx,pts,color,width=2){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke()}
function poly(ctx,pts,col,stroke){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.closePath();ctx.fillStyle=col;ctx.fill();if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke()}}

// Shot-hit reactions stay renderer-only: these timers never change contact,
// movement or hitboxes. Confusion remains legible with reduced flashing on.
function drawShotImpactCue(ctx,p,time,reducedFlash=false){
 const confused=Math.max(0,Number(p?.shotImpactConfusedTimer)||0);
 if(confused<=0)return;
 const pose=ARTPOSE.confusionPose(confused,time,reducedFlash);
 const fade=Math.min(1,confused/.14);
 ctx.save();ctx.globalAlpha=fade;
 ctx.translate(0,-75+pose.headBob);
 ellipse(ctx,-8,0,5,6,'#fff');ellipse(ctx,8,0,5,6,'#fff');
 // Spiral pupils sell the comic daze at player scale; each eye curls in the
 // opposite direction. Reduced-flash freezes the curls through ARTPOSE.
 for(const side of [-1,1]){ctx.save();ctx.translate(side*4,1);ctx.rotate(side*pose.eyeSpin);ctx.strokeStyle='#51368b';ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(0,0,2.7,0,Math.PI*1.65);ctx.stroke();ctx.restore();}
 ctx.translate(0,-42);
 const turn=reducedFlash?0:(Number(time)||0)*1.35;
 for(let i=0;i<3;i++){
   const a=turn+i*Math.PI*2/3,x=Math.cos(a)*17,y=Math.sin(a)*9;
   const flap=reducedFlash?0:Math.sin((Number(time)||0)*8+i*2.1)*1.8;
   ctx.save();ctx.translate(x,y);ctx.rotate(a+.5);
   // Read as tiny birds instead of vague orbiting leaves: body, head, beak,
   // tail and a wing that gently flaps. Reduced-flash freezes each silhouette.
   ctx.fillStyle='#fff1a3';ctx.strokeStyle='#765b22';ctx.lineWidth=.7;
   ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(-2,-3,2,-1);ctx.quadraticCurveTo(4,0,2,2);ctx.quadraticCurveTo(-1,4,-5,0);ctx.closePath();ctx.fill();ctx.stroke();
   ellipse(ctx,3,-2,2,2,'#fff7cf');
   ctx.fillStyle='#e7bd58';ctx.beginPath();ctx.moveTo(4,-2);ctx.lineTo(8,-1);ctx.lineTo(4,0);ctx.closePath();ctx.fill();
   ctx.fillStyle='#fff7cf';ctx.beginPath();ctx.moveTo(-3,0);ctx.quadraticCurveTo(-1,-3-flap,3,-4-flap);ctx.quadraticCurveTo(1,-1,0,1);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#d4a641';ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(-8,-2);ctx.lineTo(-6,2);ctx.closePath();ctx.fill();
   ellipse(ctx,3,-2,0.45,0.45,'#1f3542');ctx.restore();
 }
 ctx.restore();
}
// A steady, renderer-only marker makes normal non-stunning shot weakness
// readable without adding flashes or changing the weakness window/physics.
function drawShotWeaknessCue(ctx,p,reducedFlash=false){
 const weakness=Math.max(0,Number(p?.shotImpactWeakness)||0);
 const remaining=Math.max(0,Number(p?.shotImpactWeaknessTimer)||0);
 if(weakness<=0||remaining<=0||p?.preview||p?.stun>0||p?.down||p?.z>0||
   p?.shotImpactKnockdownPending>0||p?.shotImpactKnockdownTimer>0||p?.shotImpactRiseTimer>0||
   p?.action==='shotDown'||p?.action==='shotGetUp'||p?.action==='launched')return;
 const strength=clamp(weakness/.4,0,1);
 ctx.save();ctx.globalAlpha=(reducedFlash?.58:.76)*(.72+.28*strength);
 ctx.strokeStyle='#ffd66b';ctx.lineWidth=reducedFlash?2.4:2.8;ctx.lineCap='round';ctx.lineJoin='round';
 // An amber ground ring and two downward chevrons signal temporarily reduced
 // speed/strength. The same static geometry is used in reduced-flash mode.
 ctx.beginPath();ctx.ellipse(0,15,22,6,0,0,Math.PI*2);ctx.stroke();
 ctx.beginPath();ctx.moveTo(-4,4);ctx.lineTo(0,8);ctx.lineTo(4,4);
 ctx.moveTo(-4,9);ctx.lineTo(0,13);ctx.lineTo(4,9);ctx.stroke();
 ctx.restore();
}
function drawUndergroundShotTell(ctx,b,reducedFlash=false,time=0){
 const speed=Math.hypot(Number(b?.vx)||0,Number(b?.vy)||0)||1,ux=(Number(b?.vx)||0)/speed,uy=(Number(b?.vy)||0)/speed;
 const phase=reducedFlash?0:(Number(time)||0)*2.1;
 ctx.save();ctx.globalAlpha=reducedFlash?.38:.48;ctx.strokeStyle='#68dbe0';ctx.lineWidth=2;ctx.lineCap='round';
 for(let i=0;i<3;i++){
  const radius=9+i*8+(reducedFlash?0:Math.sin(phase-i*.7)*1.8);
  ctx.beginPath();ctx.ellipse(b.x,b.y+3,radius,radius*.32,0,0,Math.PI*2);ctx.stroke();
 }
 ctx.globalAlpha=reducedFlash?.24:.31;
 for(let i=1;i<=3;i++){
  const x=b.x-ux*i*15,y=b.y+3-uy*i*15;
  ctx.beginPath();ctx.ellipse(x,y,3+i,2+i*.35,Math.atan2(uy,ux),0,Math.PI*2);ctx.stroke();
 }
 ctx.restore();
}

// Character-art primitives are deliberately independent from gameplay state.
// Every one of the 5 outlines and 13 hairstyles is deterministic and testable.
function faceShapeOutline(ctx,face,width){
 const kind=((face%5)+5)%5, w=Math.max(26,width);
 ctx.beginPath();ctx.moveTo(0,-25);
 if(kind===0){ // broad, baby-round
  ctx.bezierCurveTo(w+3,-27,w+8,-1,w,14);ctx.quadraticCurveTo(w-3,32,0,35);ctx.quadraticCurveTo(-w+3,32,-w,14);ctx.bezierCurveTo(-w-8,-1,-w-3,-27,0,-25);
 }else if(kind===1){ // prominent square chin and cheekbones
  ctx.lineTo(w-8,-24);ctx.quadraticCurveTo(w+5,-17,w+1,4);ctx.lineTo(w-4,25);ctx.quadraticCurveTo(w-6,33,w-13,33);ctx.lineTo(-w+13,33);ctx.quadraticCurveTo(-w+6,33,-w+4,25);ctx.lineTo(-w-1,4);ctx.quadraticCurveTo(-w-5,-17,-w+8,-24);
 }else if(kind===2){ // small triangular chin
  ctx.bezierCurveTo(w+6,-25,w+9,1,w-2,13);ctx.quadraticCurveTo(14,29,0,36);ctx.quadraticCurveTo(-14,29,-w+2,13);ctx.bezierCurveTo(-w-9,1,-w-6,-25,0,-25);
 }else if(kind===3){ // strong wide cheek and softer jaw
  ctx.bezierCurveTo(w+8,-24,w+14,10,w,18);ctx.quadraticCurveTo(w-10,37,0,31);ctx.quadraticCurveTo(-w+10,37,-w,18);ctx.bezierCurveTo(-w-14,10,-w-8,-24,0,-25);
 }else{ // narrower, taller oval
  ctx.bezierCurveTo(w-5,-35,w+7,-5,w-2,19);ctx.quadraticCurveTo(15,43,0,39);ctx.quadraticCurveTo(-15,43,-w+2,19);ctx.bezierCurveTo(-w-7,-5,-w+5,-35,0,-25);
 }
 ctx.closePath();
}
function drawHairSilhouette(ctx,style,hair,dark){
 const v=((style%13)+13)%13;
 ctx.lineJoin='round';
 const P=(pts)=>poly(ctx,pts,hair,dark);
 switch(v){
 case 0: P([[-33,-5],[-32,-25],[-21,-31],[-22,-42],[-12,-32],[-2,-46],[7,-32],[20,-40],[25,-29],[34,-26],[32,-5],[19,-14],[5,-11],[-5,-17],[-17,-10]]);break;
 case 1: P([[-33,-10],[-32,-25],[-22,-37],[-4,-40],[19,-33],[33,-22],[33,-8],[26,-15],[18,-20],[3,-18],[-14,-10]]);P([[-30,-21],[7,-39],[28,-32],[22,-20],[-12,-10]]);break;
 case 2: P([[-33,-6],[-32,-23],[-20,-28],[-4,-30],[20,-25],[32,-18],[32,-7],[26,-13],[12,-12],[-4,-15],[-20,-10]]);line(ctx,[[-23,-24],[-8,-28],[8,-27],[25,-21]],'#ffffff25',2);break;
 case 3: P([[-33,-9],[-28,-29],[-12,-36],[0,-30],[12,-36],[27,-29],[34,-8],[17,-17],[6,-16],[0,-28],[-6,-16],[-18,-17]]);line(ctx,[[0,-28],[0,-14]],dark,2);break;
 case 4: P([[-34,-8],[-31,-29],[-18,-33],[-15,-48],[2,-47],[15,-43],[21,-31],[32,-26],[34,-7],[25,-16],[9,-20],[-7,-22],[-20,-13]]);ellipse(ctx,-4,-37,15,7,'#ffffff28');break;
 case 5: P([[-30,-9],[-25,-23],[-13,-25],[-11,-43],[-2,-50],[7,-42],[11,-27],[28,-25],[33,-9],[16,-14],[0,-20],[-16,-14]]);line(ctx,[[0,-41],[1,-25]],'#ffffff2b',3);break;
 case 6: P([[-32,-10],[-29,-27],[-17,-32],[1,-35],[25,-27],[33,-11],[20,-18],[3,-20],[-18,-14]]);ellipse(ctx,29,-21,10,8,hair);ellipse(ctx,39,-17,9,11,hair);line(ctx,[[30,-24],[35,-13]],dark,2);break;
 case 7: P([[-34,-7],[-33,-27],[-16,-36],[0,-37],[19,-35],[32,-25],[34,-8],[26,13],[20,12],[20,-16],[7,-14],[0,-30],[-7,-15],[-20,-16],[-21,11],[-29,10]]);break;
 case 8: for(let j=-3;j<=3;j++)ellipse(ctx,j*10,-25+(j%2)*4,9,10,hair);P([[-35,-12],[-31,-30],[-14,-38],[8,-37],[29,-29],[34,-12],[21,-18],[0,-19],[-22,-17]]);rr(ctx,-31,-14,62,7,3,'#ecf0e6',dark);break;
 case 9: P([[-32,-8],[-33,-28],[-28,-43],[27,-43],[33,-28],[32,-7],[19,-14],[-2,-14],[-20,-13]]);line(ctx,[[-28,-39],[28,-39]],'#ffffff3a',3);break;
 case 10: P([[-30,-7],[-32,-28],[-18,-34],[5,-35],[28,-30],[33,-8],[23,-15],[6,-16],[-10,-13]]);ellipse(ctx,32,-29,12,8,hair);P([[31,-28],[44,-22],[47,-4],[36,4],[38,-18]]);break;
 case 11: for(let j=-3;j<=3;j++){for(let row=0;row<2;row++)ellipse(ctx,j*9+(row%2)*5,-24-row*10+(j%2)*3,10,11,hair)}ellipse(ctx,-30,-14,10,15,hair);ellipse(ctx,30,-14,10,15,hair);break;
 case 12: P([[-31,-8],[-30,-24],[-18,-30],[1,-31],[19,-29],[31,-20],[31,-9],[18,-14],[1,-15],[-19,-12]]);for(let x=-24;x<=23;x+=9)line(ctx,[[x,-19],[x+4,-21]],'#ffffff3a',1.4);break;
 }
}

const EYE_PALETTE=['#3e2a22','#5b3a24','#4f6d8c','#588a69','#7a6e9c','#8b6a34'];
function drawBrows(ctx,style,dark,baseY=-2){
 const kind=((style%20)+20)%20;
 const draw=(l,r,w=5)=>{line(ctx,l,dark,w);line(ctx,r,dark,w)};
 switch(kind){
  case 0: draw([[-23,baseY],[-8,baseY+2]],[[8,baseY+2],[23,baseY]],5);break;
  case 1: draw([[-24,baseY+2],[-8,baseY-2]],[[8,baseY-2],[24,baseY+2]],5);break;
  case 2: draw([[-22,baseY+1],[-14,baseY-2],[-6,baseY+1]],[[6,baseY+1],[14,baseY-2],[22,baseY+1]],4.5);break;
  case 3: draw([[-24,baseY-1],[-10,baseY+4]],[[10,baseY+4],[24,baseY-1]],5);break;
  case 4: draw([[-21,baseY+2],[-8,baseY+4]],[[8,baseY+4],[21,baseY+2]],4.5);break;
  case 5: draw([[-24,baseY+1],[-15,baseY-4],[-7,baseY-2]],[[7,baseY-2],[15,baseY-4],[24,baseY+1]],5.2);break;
  case 6: draw([[-23,baseY+2],[-12,baseY+2],[-7,baseY]],[[7,baseY],[12,baseY+2],[23,baseY+2]],4.5);break;
  case 7: draw([[-23,baseY-2],[-7,baseY-2]],[[7,baseY-2],[23,baseY-2]],5.7);break;
  case 8: draw([[-24,baseY+1],[-17,baseY-3],[-8,baseY-1]],[[8,baseY-1],[17,baseY-3],[24,baseY+1]],4.8);break;
  case 9: draw([[-23,baseY+3],[-9,baseY-1]],[[9,baseY-1],[23,baseY+3]],5);break;
  case 10: draw([[-24,baseY],[-16,baseY+1],[-8,baseY+4]],[[8,baseY+4],[16,baseY+1],[24,baseY]],4.8);break;
  case 11: draw([[-23,baseY-1],[-18,baseY-4],[-7,baseY-1]],[[7,baseY-1],[18,baseY-4],[23,baseY-1]],5);break;
  case 12: draw([[-22,baseY+2],[-14,baseY+5],[-8,baseY+5]],[[8,baseY+5],[14,baseY+5],[22,baseY+2]],4.5);break;
  case 13: draw([[-24,baseY+2],[-12,baseY-4],[-8,baseY]],[[8,baseY],[12,baseY-4],[24,baseY+2]],5.5);break;
  case 14: draw([[-22,baseY],[-11,baseY-2],[-6,baseY+2]],[[6,baseY+2],[11,baseY-2],[22,baseY]],4.4);break;
  case 15: draw([[-23,baseY+4],[-16,baseY+2],[-8,baseY+2]],[[8,baseY+2],[16,baseY+2],[23,baseY+4]],4.8);break;
  case 16: draw([[-25,baseY+1],[-17,baseY-2],[-8,baseY-2]],[[8,baseY-2],[17,baseY-2],[25,baseY+1]],6);break;
  case 17: draw([[-24,baseY+3],[-17,baseY-1],[-7,baseY-3]],[[7,baseY-3],[17,baseY-1],[24,baseY+3]],5);break;
  case 18: draw([[-24,baseY],[-18,baseY+3],[-9,baseY+5]],[[9,baseY+5],[18,baseY+3],[24,baseY]],5);break;
  default: draw([[-22,baseY+1],[-14,baseY-5],[-7,baseY-1]],[[7,baseY-1],[14,baseY-5],[22,baseY+1]],5.2);break;
 }
}
function drawEyes(ctx,style,colorIndex,dark){
 const kind=((style%20)+20)%20, iris=EYE_PALETTE[((colorIndex%6)+6)%6];
 const white='#fff7ea';
 const big=(x,y,rx,ry,pupil=3)=>{ellipse(ctx,x,y,rx,ry,white);ellipse(ctx,x,y+1,rx-3,ry-3,iris);ellipse(ctx,x,y+1,pupil,pupil+1,dark);ellipse(ctx,x-2,y-2,1.8,1.8,'#ffffffd0')};
 const rounded=(x,y,rx,ry,pupil=3)=>{rr(ctx,x-rx,y-ry,rx*2,ry*2,Math.min(rx,ry),white,dark);ellipse(ctx,x,y+1,Math.max(2,rx-3),Math.max(2,ry-3),iris);ellipse(ctx,x,y+1,pupil,pupil+1,dark);ellipse(ctx,x-2,y-2,1.5,1.5,'#ffffffd0')};
 switch(kind){
  case 0: big(-13,9,7,6);big(13,9,7,6);break;
  case 1: rr(ctx,-21,4,16,10,6,white,dark);rr(ctx,5,4,16,10,6,white,dark);ellipse(ctx,-13,9,4,3,iris);ellipse(ctx,13,9,4,3,iris);ellipse(ctx,-13,9,2.5,2.5,dark);ellipse(ctx,13,9,2.5,2.5,dark);break;
  case 2: rounded(-13,9,6,6,3);rounded(13,9,6,6,3);break;
  case 3: line(ctx,[[-21,9],[-8,8]],dark,3.2);line(ctx,[[8,8],[21,9]],dark,3.2);ellipse(ctx,-13,10,4,2,iris);ellipse(ctx,13,10,4,2,iris);ellipse(ctx,-13,10,2.5,2,dark);ellipse(ctx,13,10,2.5,2,dark);break;
  case 4: big(-13,8,8,7,3);big(13,8,8,7,3);break;
  case 5: line(ctx,[[-19,6],[-10,14]],dark,2.6);line(ctx,[[7,14],[18,6]],dark,2.6);ellipse(ctx,-14,10,4,4,iris);ellipse(ctx,12,10,4,4,iris);ellipse(ctx,-14,10,2.6,2.6,dark);ellipse(ctx,12,10,2.6,2.6,dark);break;
  case 6: rounded(-14,10,7,5,3);rounded(12,10,7,5,3);break;
  case 7: rr(ctx,-21,3,12,14,5,white,dark);rr(ctx,9,3,12,14,5,white,dark);ellipse(ctx,-15,10,3,5,iris);ellipse(ctx,15,10,3,5,iris);ellipse(ctx,-15,10,2.1,3.2,dark);ellipse(ctx,15,10,2.1,3.2,dark);break;
  case 8: line(ctx,[[-20,7],[-9,10]],dark,2.5);line(ctx,[[9,10],[20,7]],dark,2.5);ellipse(ctx,-13,11,4,3,iris);ellipse(ctx,13,11,4,3,iris);ellipse(ctx,-13,11,2.5,2.3,dark);ellipse(ctx,13,11,2.5,2.3,dark);break;
  case 9: rounded(-13,10,5,7,2.6);rounded(13,10,5,7,2.6);break;
  case 10: big(-14,9,6,8,2.6);big(12,9,6,8,2.6);break;
  case 11: rr(ctx,-21,5,16,8,3,white,dark);rr(ctx,5,5,16,8,3,white,dark);ellipse(ctx,-13,9,3,2,iris);ellipse(ctx,13,9,3,2,iris);ellipse(ctx,-13,9,2.2,2.1,dark);ellipse(ctx,13,9,2.2,2.1,dark);break;
  case 12: rounded(-13,9,7,4,2.6);rounded(13,9,7,4,2.6);break;
  case 13: line(ctx,[[-19,12],[-10,6]],dark,2.5);line(ctx,[[8,6],[19,12]],dark,2.5);ellipse(ctx,-13,10,4,4,iris);ellipse(ctx,13,10,4,4,iris);ellipse(ctx,-13,10,2.3,2.3,dark);ellipse(ctx,13,10,2.3,2.3,dark);break;
  case 14: rr(ctx,-20,2,14,16,6,white,dark);rr(ctx,6,2,14,16,6,white,dark);ellipse(ctx,-13,10,4,5,iris);ellipse(ctx,13,10,4,5,iris);ellipse(ctx,-13,10,2.2,3,dark);ellipse(ctx,13,10,2.2,3,dark);break;
  case 15: big(-13,8,9,5,2.4);big(13,8,9,5,2.4);break;
  case 16: rounded(-13,9,8,6,3.2);rounded(13,9,8,6,3.2);break;
  case 17: rr(ctx,-20,4,12,12,4,white,dark);rr(ctx,8,4,12,12,4,white,dark);ellipse(ctx,-14,10,2,5,iris);ellipse(ctx,14,10,2,5,iris);ellipse(ctx,-14,10,1.4,3,dark);ellipse(ctx,14,10,1.4,3,dark);break;
  case 18: line(ctx,[[-22,11],[-8,6]],dark,3);line(ctx,[[8,6],[22,11]],dark,3);ellipse(ctx,-13,10,5,3,iris);ellipse(ctx,13,10,5,3,iris);ellipse(ctx,-13,10,2.6,2.1,dark);ellipse(ctx,13,10,2.6,2.1,dark);break;
  default: rr(ctx,-20,3,14,14,7,white,dark);rr(ctx,6,3,14,14,7,white,dark);ellipse(ctx,-13,10,4,4,iris);ellipse(ctx,13,10,4,4,iris);ellipse(ctx,-13,10,2.3,2.3,dark);ellipse(ctx,13,10,2.3,2.3,dark);break;
 }
}
function drawNose(ctx,style,color='#9a624d88'){
 switch(((style%6)+6)%6){
  case 0: ellipse(ctx,1,16,4,2,color);break;
  case 1: line(ctx,[[0,11],[5,15],[1,17]],color,2);break;
  case 2: ellipse(ctx,1,15,5,3,color);line(ctx,[[-1,17],[4,17]],color,1.5);break;
  case 3: line(ctx,[[-2,16],[3,17],[5,14]],color,2.5);break;
  case 4: ellipse(ctx,3,17,3,2,color);line(ctx,[[0,11],[3,15]],color,1.8);break;
  default: line(ctx,[[0,10],[0,17]],color,1.6);ellipse(ctx,1,18,5,2,color);break;
 }
}
// Directional face detail primitives share the avatar's real eye/lip attributes.
// Profile and three-quarter views must not replace every player's eyes with a generic dot.
function drawProfileEye(ctx,eyes,eyeColor,dark,x=11,y=8,size=.82){
 const kind=((Number(eyes)||0)%20+20)%20,iris=EYE_PALETTE[((Number(eyeColor)||0)%6+6)%6];
 const narrow=kind%5===3 || kind%5===1,wide=kind%5===4,rx=(wide?7.3:narrow?5.7:6.3)*size,ry=(narrow?3.7:5.3)*size;
 const lidLift=kind%4===0?-1.2:kind%4===1?1.1:0;
 ctx.save();ctx.translate(x,y);
 ctx.beginPath();ctx.moveTo(-rx,-.6);
 ctx.quadraticCurveTo(-rx*.25,-ry-1.6+lidLift,rx,.2);
 ctx.quadraticCurveTo(rx*.15,ry+.8,-rx,0);
 ctx.closePath();ctx.fillStyle='#fff9eb';ctx.fill();ctx.lineWidth=1.9*size;ctx.strokeStyle=dark;ctx.stroke();
 artEllipse(ctx,rx*.06,.3,Math.max(1.7,rx*.42),Math.max(1.8,ry*.45),iris,null);
 artEllipse(ctx,rx*.22,.55,Math.max(1.2,rx*.26),Math.max(1.4,ry*.28),dark,null);
 artStroke(ctx,[[-rx-1,-.7],[0,-ry-1.3+lidLift*.45],[rx+.9,-.2]],1.7*size,dark,dark,0);
 artEllipse(ctx,-rx*.12,-ry*.23,1.0*size,.9*size,'#ffffffc9',null);
 ctx.restore();
}
function drawQuarterFarEye(ctx,eyes,eyeColor,dark,x=-8,y=8.6,scale=.55){
 const iris=EYE_PALETTE[((Number(eyeColor)||0)%6+6)%6];
 const kind=((Number(eyes)||0)%20+20)%20;
 const rx=(kind%5===4?5.3:4.6)*scale,ry=(kind%5===3?2.8:4.0)*scale;
 ctx.save();ctx.translate(x,y);
 if(kind%4===1){
  artStroke(ctx,[[-rx-2,0],[-.4,-ry*.45],[rx+.5,-.1]],1.7*scale,dark,dark,0);
  artEllipse(ctx,.5,.9,rx*.62,ry*.55,iris,null);artEllipse(ctx,1,1,rx*.33,ry*.30,dark,null);
 }else{
  artPatch(ctx,c=>{c.moveTo(-rx,-.5);c.quadraticCurveTo(0,-ry-1.2,rx,0);c.quadraticCurveTo(0,ry+.35,-rx,-.5);},'#fff9eb',dark,1.5*scale+1.2);
  artEllipse(ctx,.6,.6,rx*.56,ry*.50,iris,null);artEllipse(ctx,1.1,.7,rx*.30,ry*.27,dark,null);
 }
 artEllipse(ctx,-rx*.12,-ry*.2,.8*scale,.8*scale,'#ffffffc7',null);
 ctx.restore();
}
function drawProfileLips(ctx,style,color='#7b3639',x=16,y=22,scale=.82){
 const kind=((Number(style)||0)%8+8)%8;
 ctx.save();ctx.translate(x,y);
 if(kind===4||kind===5){artEllipse(ctx,0,1,4.7*scale,(kind===5?3.7:2.6)*scale,color,null);artEllipse(ctx,.5,1.4,1.5*scale,.8*scale,'#efb4b4',null);}
 else{
  const lift=kind===2||kind===6?-2.2:kind===3?1.8:0;
  artStroke(ctx,[[-5.2*scale,.1],[0,1+lift*.2],[4.8*scale,-.1+lift*.12]],1.7*scale,color,color,0);
  if(kind===1||kind===7)artStroke(ctx,[[-1.2*scale,2.2*scale],[3.3*scale,1.8*scale]],1*scale,'#f1beb9','#f1beb9',0);
 }
 ctx.restore();
}
function drawBackHair(ctx,style,hair,dark,width){
 const v=((Number(style)||0)%13+13)%13;
 artEllipse(ctx,0,0,width*.88,24,hair,dark,2.1);
 if(v===7||v===11){artEllipse(ctx,-width*.66,17,8.8,14.5,hair,dark,2);artEllipse(ctx,width*.66,17,8.8,14.5,hair,dark,2);}
 else if(v===6||v===10){artEllipse(ctx,width*.74,6,12,9,hair,dark,2);artStroke(ctx,[[width*.36,-9],[width*.68,12]],1.9,dark,dark,0);}
 else if(v===8){for(let i=-2;i<=2;i++)artEllipse(ctx,i*8.5,-8+Math.abs(i)*1.6,7.6,8.4,hair,null);}
 else if(v===3||v===5){artStroke(ctx,[[-12,-13],[0,5],[12,-13]],2.2,'#ffffff33',hair,0);} 
 else{artStroke(ctx,[[-width*.58,-8],[0,-16],[width*.56,-8]],1.9,'#ffffff25',hair,0);}
 // Authored rear crown silhouettes: crop/flat-top, buzz, fauxhawk and swept styles
 // must differ from the rear as they already do in side and frontal views.
 if(v===0||v===4||v===5||v===9||v===12){
  const rise=v===4?8:v===5?5:v===9?2:1;
  for(let k=-2;k<=2;k++){
   const x=k*8.3,top=-25-rise+Math.abs(k)*(v===4?2:1.2);
   artPatch(ctx,c=>{c.moveTo(x-5,-15);c.quadraticCurveTo(x-4,top,x,top);c.quadraticCurveTo(x+5,top+1.2,x+5,-15);},hair,null);
  }
 }
 if(v===10){artEllipse(ctx,width*.87,15,6.4,9.2,hair,dark,1.3);artStroke(ctx,[[width*.72,9],[width*.87,21]],1.3,artTint(hair,.17),hair,0);}
 if(v===1||v===3||v===6||v===12){artStroke(ctx,[[-11,-22],[1,-25],[14,-19]],1.5,artTint(hair,.16),hair,0);}
 artStroke(ctx,[[-width*.54,14],[-10,23],[9,23],[width*.50,15]],1.4,dark,dark,0);
}
// Three short styles used to collapse to identical rear pixels: the common
// nape ellipse was painted *over* their distinguishing crown details.
// Draw identifying hair texture on the visible upper rear cap, not on the skin.
// These marks are drawn after the nape overlay, using the selected natural hair shade.
function studioRearCrownIdentity(ctx,style,hair,dark){
 const v=((Number(style)||0)%13+13)%13;
 const light=artTint(hair,.26),shadow=artTint(hair,-.27);
 if(v===0){ // textured crop: asymmetrical, upward-brushed locks
  artStroke(ctx,[[-17,-18],[-12,-29],[-7,-23],[-2,-30],[4,-23]],1.65,light,hair,0);
  artStroke(ctx,[[7,-24],[14,-28],[19,-20]],1.3,shadow,hair,0);
 }else if(v===9){ // geometric flat-top: deliberately horizontal crown seam
  artStroke(ctx,[[-17,-24],[-15,-29],[14,-29],[17,-24]],2,shadow,hair,0);
  artStroke(ctx,[[-12,-21],[12,-21]],1.55,light,hair,0);
 }else if(v===12){ // close-cut buzz: fine follicles rather than full locks
  for(let row=0;row<3;row++)for(let col=-3;col<=3;col++){
   const x=col*5.1+(row%2)*2.2,y=-27+row*5.5+Math.abs(col)*.3;
   artStroke(ctx,[[x,y],[x+1.1,y+1.4]],.8,row%2?light:shadow,hair,0);
  }
 }
}
function drawLips(ctx,style,color='#7b3639'){
 switch(((style%8)+8)%8){
  case 0: artStroke(ctx,[[-5,22],[0,24],[6,22]],2.5,color,color,0);break;
  case 1: artEllipse(ctx,1,22,7,4,color,null);artStroke(ctx,[[-4,23],[5,23]],1.7,'#fdf6dc','#fdf6dc',0);break;
  case 2: artStroke(ctx,[[-7,21],[0,24],[9,19]],2.5,color,color,0);break;
  case 3: artStroke(ctx,[[-6,20],[1,23],[8,22]],2.5,color,color,0);break;
  case 4: rr(ctx,-8,19,17,8,4,color);artEllipse(ctx,0,22,4,2,'#f0b3b1',null);break;
  case 5: artEllipse(ctx,0,23,8,6,color,null);artEllipse(ctx,0,25,3,2,'#ffe0d1',null);break;
  case 6: artStroke(ctx,[[-8,22],[-1,20],[8,22]],2.5,color,color,0);artStroke(ctx,[[-5,25],[0,27],[5,25]],1.9,color,color,0);break;
  default: artStroke(ctx,[[-6,24],[0,20],[6,24]],2.5,color,color,0);artStroke(ctx,[[-3,23],[3,23]],1.2,'#fce1da','#fce1da',0);break;
 }
}
function artTint(hex,change=0){
 const s=/^#[0-9a-f]{6}$/i.test(String(hex))?hex:'#567d9d',a=[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
 return "#"+a.map(v=>Math.max(0,Math.min(255,Math.round(change>=0?v+(255-v)*change:v*(1+change)))).toString(16).padStart(2,'0')).join('');
}
function artStroke(ctx,points,width,col,outline='#202338',edge=2){
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
 ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=outline;ctx.lineWidth=width+edge*2;ctx.stroke();
 ctx.strokeStyle=col;ctx.lineWidth=width;ctx.stroke();
}
function artPatch(ctx,path,color,outline='#232334',weight=2.3){
 ctx.beginPath();path(ctx);ctx.closePath();ctx.fillStyle=color;ctx.fill();
 if(outline){ctx.strokeStyle=outline;ctx.lineWidth=weight;ctx.stroke();}
}
function artEllipse(ctx,x,y,rx,ry,color,outline=null,weight=2){
 ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);
 ctx.fillStyle=color;ctx.fill();if(outline){ctx.lineWidth=weight;ctx.strokeStyle=outline;ctx.stroke();}
}
// SUPERMAGIC HD manual-view character studio — v0.8.25.16
// Every face projection is manually authored per view rather than a squashed reuse of the front sprite.

// v0.8.25.20. Compact naturalistic eye library. Every style is authored, not
// a stretched side-eye nor an interpolation of a frontal eye.
function studioEye(ctx,x,y,eyeShape,irisIndex,size=1,far=false){
 const k=((Number(eyeShape)||0)%20+20)%20;
 const rx=(5.25+[0,.15,-.35,.4,-.15][k%5])*size;
 const ry=(3.25+[.0,.4,-.2,.2,.1][Math.floor(k/4)%5])*size;
 const iris=EYE_PALETTE[((Number(irisIndex)||0)%6+6)%6];
 const lid=k%4===1?.6:k%4===2?-.4:0;
 ctx.save();ctx.translate(x,y);
 ctx.beginPath();ctx.moveTo(-rx,0);
 ctx.quadraticCurveTo(-rx*.1,-ry*1.45+lid,rx,-.15);
 ctx.quadraticCurveTo(rx*.03,ry*.95,-rx,0);
 ctx.closePath();ctx.fillStyle='#f5ebdf';ctx.fill();ctx.strokeStyle='#352b32';ctx.lineWidth=1.05*size;ctx.stroke();
 if(!far){artEllipse(ctx,(k%3-1)*.32,.55,ry*.73,ry*.8,iris,null);artEllipse(ctx,(k%3-1)*.22,.55,ry*.45,ry*.5,'#242132',null);artEllipse(ctx,-1,-.6,.85,.8,'#ffffffcb',null)}
 else{artEllipse(ctx,.5,.5,ry*.71,ry*.76,iris,null);artEllipse(ctx,.6,.5,ry*.45,ry*.48,'#28212e',null)}
 if(k>=15)artStroke(ctx,[[-rx*.62,-.28],[0,-ry*.42],[rx*.68,-.34]],.72*size,'#5d4c4d','#5d4c4d',0);
 ctx.restore();
}
function studioBrow(ctx,x,y,style,size=1,far=false){
 const k=((Number(style)||0)%20+20)%20;
 const b=(k%5-2)*.32;
 const arch=((Math.floor(k/5)%4)-1.5)*.46;
 const len=(far?7.8:10)*size;
 const thick=(1.5+(k%4)*.28)*(far?.85:1)*size;
 artStroke(ctx,[[x-len*.5,y+1+b],[x,y-1.9+arch],[x+len*.5,y+b*.5]],thick,'#2d2430','#2d2430',0);
}
function studioHair(ctx,av,kind,hair,dark){
 const s=((Number(av.style)||0)%13+13)%13;
 const q=kind==='quarterFront',crow=[-33,-34,-30,-33,-39,-37,-31,-35,-33,-35,-34,-38,-30][s];
 const left=q?-24:-28,right=q?29:28;
 // A manually drawn head-fitted scalp, a coherent mass with no blade-shaped spikes.
 artPatch(ctx,c=>{
  c.moveTo(left,-12);c.bezierCurveTo(left-6,-24,-18,crow-1,0,crow);
  c.bezierCurveTo(15,crow-2,right+5,-25,right,-12);
  c.quadraticCurveTo(right-4,-17,right-9,-17);
  c.bezierCurveTo(10,-16,3,-17,-3,-15);
  c.bezierCurveTo(-13,-13,left+6,-12,left,-12);
 },hair,dark,1.9);
 if(s===0||s===4||s===5){
  // Short textured / fauxhawk / brushed-up; rounded tufts stay inside hair volume.
  for(let j=-2;j<=2;j++){
   let top=crow-(s===4?5:s===5?3:1)-Math.max(0,2-Math.abs(j))*.9;
   artPatch(ctx,c=>{c.moveTo(j*9-7,crow+7);c.quadraticCurveTo(j*9-5,top,j*9,top);c.quadraticCurveTo(j*9+7,top+3,j*9+7,crow+8);},hair,null);
  }
 }else if(s===1||s===2||s===9||s===12){
  // Side part with short, deliberately combed fringe.
  artStroke(ctx,[[-19,-22],[-5,-29],[17,-28]],s===2?1.3:1.7,artTint(hair,.18),hair,0);
  if(s===9){artStroke(ctx,[[-22,-20],[-13,-24],[-2,-26]],2.1,artTint(hair,.22),hair,0)}
 }else if(s===3){
  for(let j=-2;j<=2;j++)artStroke(ctx,[[j*9,-28],[j*8+3,-17]],2.0,artTint(hair,-.22),hair,0);
 }else if(s===6||s===10){
  // Longer side sweep / tied-back cut.
  artPatch(ctx,c=>{c.moveTo(19,-25);c.quadraticCurveTo(36,-19,31,-6);c.quadraticCurveTo(24,-9,23,-17);},hair,dark,1.25);
  if(s===10)artEllipse(ctx,30,-17,5.9,7,hair,dark,1.25);
 }else if(s===7){
  artPatch(ctx,c=>{c.moveTo(left+2,-19);c.quadraticCurveTo(left-7,4,left+3,16);c.lineTo(left+10,16);c.quadraticCurveTo(left+3,-1,left+12,-16);},hair,dark,1.4);
  artPatch(ctx,c=>{c.moveTo(right-5,-20);c.quadraticCurveTo(right+5,2,right-1,15);c.lineTo(right-9,14);c.quadraticCurveTo(right-4,-3,right-13,-16);},hair,dark,1.4);
 }else if(s===8){
  artStroke(ctx,[[left,-15],[right,-15]],4,'#f3ead7','#e7e0bd',0);
 }else if(s===11){
  // Tight curls represented by small overlapping organic locks.
  for(let j=-3;j<=3;j++)for(let r=0;r<2;r++){
   let xx=j*7+(r?3:0),yy=crow+2+r*6+(Math.abs(j)%2)*2;
   artEllipse(ctx,xx,yy,6.3,5.1,hair,dark,.65);
  }
 }
 artStroke(ctx,[[-19,crow+8],[-9,crow+3],[5,crow+5]],1.3,artTint(hair,.15),artTint(hair,.15),0);
}
function studioProfileHair(ctx,av,hair,dark){
 const style=((Number(av.style)||0)%13+13)%13;
 const yTop=[-31,-33,-29,-32,-39,-35,-31,-34,-33,-34,-32,-38,-30][style];
 artPatch(ctx,c=>{c.moveTo(-24,-5);c.quadraticCurveTo(-31,-23,-13,yTop+1);c.quadraticCurveTo(8,yTop-7,23,yTop+4);c.quadraticCurveTo(29,-22,26,-10);c.quadraticCurveTo(18,-15,8,-14);c.quadraticCurveTo(-7,-12,-17,-11);c.lineTo(-23,8);},hair,dark,1.95);
 if(style===7||style===11){artPatch(ctx,c=>{c.moveTo(-24,-7);c.quadraticCurveTo(-29,11,-20,21);c.lineTo(-13,22);c.quadraticCurveTo(-18,2,-11,-11);},hair,dark,1.25)}
 if(style===11)for(let i=0;i<4;i++)artEllipse(ctx,-14+i*9,yTop+5+(i%2)*3,5.4,4.3,hair,dark,.65);
 if(style===6||style===10)artEllipse(ctx,-21,-13,6.8,9,hair,dark,1.25);
 if(style===8)artStroke(ctx,[[-23,-12],[23,-14]],3.7,'#e6e2cb','#e6e2cb',0);
 // Side-view hair actually follows the chosen haircut; previously most short styles shared one flat cap.
 if(style===0||style===4||style===5){
  for(let j=-2;j<=2;j++){
   const xx=j*8.0+1, top=yTop-(style===4?5:style===5?4:2)+Math.abs(j)*1.8;
   artPatch(ctx,c=>{c.moveTo(xx-5,yTop+8);c.quadraticCurveTo(xx-3,top,xx+1,top);c.quadraticCurveTo(xx+7,top+3,xx+6,yTop+8);},hair,null);
  }
 }else if(style===1||style===2||style===9||style===12){
  artStroke(ctx,[[-14,-21],[-4,-28],[14,-25]],style===2?1.2:1.7,artTint(hair,.22),hair,0);
 }else if(style===3){
  for(let j=-1;j<=2;j++)artStroke(ctx,[[j*7,-25],[j*7+3,-18]],1.5,artTint(hair,-.22),hair,0);
 }
 artStroke(ctx,[[-15,yTop+6],[-1,yTop+3],[14,yTop+7]],1.15,artTint(hair,.17),artTint(hair,.17),0);
}
// All thirteen rear-three-quarter haircuts have silhouette details fitted to the head, neck and ears.
// Separate from the face so rear-facing views cannot accidentally show front facial features.
function studioRearQuarterHair(ctx,av,hair,dark){
 const style=((Number(av.style)||0)%13+13)%13;
 const shine=artTint(hair,.14),shadow=artTint(hair,-.20);
 if(style===7){ // long loose hair: behind the far ear, tapering down the back
  artPatch(ctx,c=>{c.moveTo(-24,-18);c.quadraticCurveTo(-32,0,-25,19);c.quadraticCurveTo(-19,25,-12,20);c.quadraticCurveTo(-19,6,-11,-16);},hair,dark,1.35);
  artStroke(ctx,[[-25,-8],[-25,7],[-20,18]],1.3,shine,hair,0);
 }else if(style===6||style===10){ // pulled back / ponytail
  artPatch(ctx,c=>{c.moveTo(-19,-21);c.quadraticCurveTo(-31,-24,-29,-10);c.quadraticCurveTo(-27,-1,-21,3);c.quadraticCurveTo(-22,-14,-12,-20);},hair,dark,1.25);
  if(style===10){artEllipse(ctx,-27,5,7.5,8.3,hair,dark,1.3);artStroke(ctx,[[-28,0],[-30,9]],1.4,shine,hair,0);}
  else artStroke(ctx,[[-28,-14],[-24,-4],[-21,2]],1.25,shine,hair,0);
 }else if(style===11){ // natural curls contained around the scalp and back of the head
  for(let col=-2;col<=2;col++)for(let row=0;row<2;row++){
   const xx=-16+col*8+row*2.8,yy=-31+row*7.1+Math.abs(col)%2*2;
   artEllipse(ctx,xx,yy,5.4,5.3,hair,dark,.58);
  }
  artEllipse(ctx,-24,0,5.7,8,hair,dark,.8);
 }else if(style===8){ // athletic headband
  artStroke(ctx,[[-25,-16],[-12,-20],[4,-20],[22,-13]],3.8,'#ebe6d2','#d0c5a7',0);
 }else if(style===0||style===4||style===5){ // fine short crown tufts, not spikes taller than the head
  const crown=style===4?-38:style===5?-35:-32;
  for(let j=-2;j<=2;j++){
   const x=j*9-1, y=crown+Math.abs(j)*2;
   artPatch(ctx,c=>{c.moveTo(x-5,-28);c.quadraticCurveTo(x-4,y,x,y);c.quadraticCurveTo(x+5,y+2,x+5,-28);},hair,null);
  }
 }else if(style===1||style===2||style===9||style===12){
  artStroke(ctx,[[-19,-17],[-9,-28],[6,-26],[18,-18]],style===2?1.25:1.7,shine,hair,0);
  if(style===9)artStroke(ctx,[[-18,-21],[-8,-25],[3,-26]],1.5,shadow,hair,0);
  if(style===12)artStroke(ctx,[[-22,-16],[-13,-20],[-1,-19]],1.4,shine,hair,0);
 }else if(style===3){
  for(let j=-2;j<=2;j++)artStroke(ctx,[[j*8-3,-26],[j*8,-18]],1.5,shadow,hair,0);
 }
}
function beardFaceProfile(face){
 const kind=((Number(face)||0)%5+5)%5;
 if(kind===0)return {kind,jaw:16.5,cheek:17.4,top:16.2,chin:28.8,inner:24.3,mustache:20.4,stubbleAlpha:.22,mustacheWidth:10.4,mustacheDrop:.2,quarterStart:1.5,quarterJaw:19.1,quarterChin:28.4,sideStart:9.4,sideJaw:19.3,sideChin:27.1,sideBack:10.4,backOuter:17.4,backInner:11.8};
 if(kind===1)return {kind,jaw:18.9,cheek:19.4,top:15.1,chin:31.4,inner:24.8,mustache:20.1,stubbleAlpha:.24,mustacheWidth:11.6,mustacheDrop:0,quarterStart:2.0,quarterJaw:21.6,quarterChin:30.6,sideStart:10.2,sideJaw:21.9,sideChin:29.4,sideBack:11.3,backOuter:19.3,backInner:13.6};
 if(kind===2)return {kind,jaw:14.0,cheek:17.0,top:16.0,chin:33.3,inner:25.4,mustache:20.7,stubbleAlpha:.21,mustacheWidth:9.4,mustacheDrop:.4,quarterStart:0.6,quarterJaw:17.8,quarterChin:32.2,sideStart:8.7,sideJaw:18.8,sideChin:30.8,sideBack:9.9,backOuter:16.1,backInner:10.1};
 if(kind===3)return {kind,jaw:18.5,cheek:20.5,top:14.8,chin:29.6,inner:24.2,mustache:19.6,stubbleAlpha:.23,mustacheWidth:11.8,mustacheDrop:-.2,quarterStart:2.2,quarterJaw:21.9,quarterChin:28.9,sideStart:10.4,sideJaw:22.4,sideChin:28.3,sideBack:11.2,backOuter:20.0,backInner:13.4};
 return {kind,jaw:15.0,cheek:16.3,top:15.3,chin:32.7,inner:24.9,mustache:20.0,stubbleAlpha:.20,mustacheWidth:10.2,mustacheDrop:.1,quarterStart:1.2,quarterJaw:18.7,quarterChin:31.3,sideStart:9.1,sideJaw:19.5,sideChin:30.0,sideBack:10.2,backOuter:16.5,backInner:11.2};
}
function beardTintRGBA(hairColor,opacity){
 const h=artTint(hairColor,-.44);
 const rgb=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.max(0,Math.min(1,opacity))})`;
}
function drawBeardByView(ctx,viewKind,style,hairColor,faceShape=0,name=''){
 const beard=Number(style)||0;
 // Avatar presets provide the initial beard style. Explicit Player Studio choices always win.
 const eff=Number.isFinite(beard)?Math.max(0,Math.min(4,Math.trunc(beard))):0;
 if(!eff)return;
 const g=beardFaceProfile(faceShape), darkBeard=artTint(hairColor,-.28), midBeard=artTint(hairColor,-.12), line=artTint(hairColor,-.38);
 const stubble=eff===1, shortBeard=eff===2, fullBeard=eff===3, moustache=eff===4;
 const stubbleFill=beardTintRGBA(hairColor,g.stubbleAlpha), frontInset=g.kind===1?5.2:g.kind===2?4.4:4.9, frontChinInset=g.kind===2?2.2:g.kind===4?1.8:2.7;
 if(viewKind==='front'){
  if(stubble){
   artPatch(ctx,c=>{c.moveTo(-g.jaw,g.top);c.quadraticCurveTo(-g.cheek,g.chin-3.1,0,g.chin);c.quadraticCurveTo(g.cheek,g.chin-3.1,g.jaw,g.top);c.quadraticCurveTo(frontInset+3,g.inner,0,g.inner+.9);c.quadraticCurveTo(-frontInset-3,g.inner,-g.jaw,g.top);},stubbleFill,null);
   artStroke(ctx,[[-g.jaw*.62,g.inner+.2],[0,g.inner+1.1],[g.jaw*.62,g.inner+.2]],1.6,line,line,0);
  } else if(shortBeard||fullBeard){
   const fill=fullBeard?darkBeard:midBeard, chin=fullBeard?g.chin+1.9:g.chin-.2, outer=g.cheek+(fullBeard?1.4:.4), top=g.top-(fullBeard?1.3:.2), inner=g.inner+(fullBeard?2.2:1.2);
   artPatch(ctx,c=>{c.moveTo(-g.jaw,top);c.quadraticCurveTo(-outer,chin-5.5,0,chin);c.quadraticCurveTo(outer,chin-5.5,g.jaw,top);c.quadraticCurveTo(frontInset+2.4,inner,0,inner+frontChinInset);c.quadraticCurveTo(-frontInset-2.4,inner,-g.jaw,top);},fill,null);
   if(fullBeard)artStroke(ctx,[[-g.jaw*.64,chin-5.1],[0,chin-2.1],[g.jaw*.64,chin-5.1]],1.1,artTint(darkBeard,.14),artTint(darkBeard,.14),0);
  } else if(moustache){
   artStroke(ctx,[[-g.mustacheWidth,g.mustache],[-2.2,g.mustache+.7+g.mustacheDrop],[0,g.mustache+1.7+g.mustacheDrop],[2.2,g.mustache+.7+g.mustacheDrop],[g.mustacheWidth,g.mustache]],2.05,darkBeard,darkBeard,0);
  }
 }else if(viewKind==='quarterFront'){
  if(stubble){
   artPatch(ctx,c=>{c.moveTo(g.quarterStart,g.top+.7);c.quadraticCurveTo(g.quarterJaw*.62,g.chin-2.8,g.quarterJaw,g.chin-7.2);c.quadraticCurveTo(g.quarterJaw-5,g.inner+1.6,g.quarterStart+5.1,g.inner+1.1);},stubbleFill,null);
   artStroke(ctx,[[g.quarterStart+4.6,g.inner],[g.quarterJaw*.6,g.inner+1],[g.quarterJaw-2.7,g.inner-.2]],1.45,line,line,0);
  } else if(shortBeard||fullBeard){
   const fill=fullBeard?darkBeard:midBeard, jaw=g.quarterJaw+(fullBeard?1.4:.3), chin=(fullBeard?g.quarterChin+1.2:g.quarterChin-.2), start=g.quarterStart-(fullBeard?0.2:0);
   artPatch(ctx,c=>{c.moveTo(start,g.top);c.quadraticCurveTo(jaw*.62,chin-3.8,jaw,chin-8.1);c.quadraticCurveTo(jaw-4.9,g.inner+4.0,start+5.0,g.inner+2.0);},fill,null);
   artStroke(ctx,[[g.quarterStart+5.5,g.mustache+.6],[g.quarterJaw*.64,g.mustache+1.2],[g.quarterJaw-2.8,g.mustache+.1]],1.65,darkBeard,darkBeard,0);
  } else if(moustache){
   artStroke(ctx,[[g.quarterStart+6.0,g.mustache+.5],[g.quarterJaw*.62,g.mustache+1.1],[g.quarterJaw-2.5,g.mustache+.3]],1.65,darkBeard,darkBeard,0);
  }
 }else if(viewKind==='side'){
  if(stubble){
   artPatch(ctx,c=>{c.moveTo(g.sideStart,g.top+.4);c.quadraticCurveTo(g.sideJaw-1.5,g.inner+1.3,g.sideJaw,g.mustache+1.4);c.quadraticCurveTo(g.sideJaw-1.7,g.sideChin-1.5,g.sideStart+1.5,g.inner+2.9);},beardTintRGBA(hairColor,Math.max(.18,g.stubbleAlpha-.02)),null);
  } else if(shortBeard||fullBeard){
   const fill=fullBeard?darkBeard:midBeard, jaw=g.sideJaw+(fullBeard?1.6:.1), chin=fullBeard?g.sideChin+1.4:g.sideChin-.1;
   artPatch(ctx,c=>{c.moveTo(g.sideStart-(fullBeard?0.4:0),g.top-(fullBeard?1:0));c.quadraticCurveTo(jaw-2.0,g.inner+3.8,jaw,g.mustache+.8);c.quadraticCurveTo(jaw-2.0,chin-2.4,g.sideStart+1.2,g.inner+3.7);},fill,null);
   artStroke(ctx,[[g.sideStart+4.8,g.mustache+.8],[g.sideJaw-5.0,g.mustache+1.1]],1.85,darkBeard,darkBeard,0);
  } else if(moustache){
   artStroke(ctx,[[g.sideStart+4.8,g.mustache+.8],[g.sideJaw-5.0,g.mustache+1.1]],1.85,darkBeard,darkBeard,0);
  }
 }else if(viewKind==='quarterBack'){
  if(stubble){
   artPatch(ctx,c=>{c.moveTo(g.sideBack+5.8,10.2);c.quadraticCurveTo(g.quarterJaw+2.0,16.6,g.quarterJaw-3.2,21.5);c.quadraticCurveTo(g.sideBack+1.2,20.2,g.sideBack+1.1,13.7);},beardTintRGBA(hairColor,Math.max(.16,g.stubbleAlpha-.04)),null);
  } else if(shortBeard||fullBeard){
   const fill=fullBeard?darkBeard:midBeard, jaw=g.quarterJaw+(fullBeard?3.2:0), chin=fullBeard?g.quarterChin+0.8:g.quarterChin-0.5;
   artPatch(ctx,c=>{c.moveTo(g.sideBack+5.1,fullBeard?7.1:9.1);c.quadraticCurveTo(jaw,17.8,jaw-5.2,chin);c.quadraticCurveTo(g.sideBack-1.0,chin-1.4,g.sideBack+1.0,14.0);},fill,null);
   if(fullBeard)artStroke(ctx,[[g.sideBack+1.7,13.4],[g.quarterJaw-4.5,19.7],[g.quarterJaw-5.1,24.0]],1.05,artTint(darkBeard,.12),artTint(darkBeard,.12),0);
  }
 }else if(viewKind==='back'){
  if(shortBeard||fullBeard){
   const fill=shortBeard?midBeard:darkBeard, outer=g.backOuter+(fullBeard?1.3:0), inner=g.backInner+(fullBeard?1.0:0), drop=fullBeard?25.3:23.6, top=fullBeard?8.2:9.5;
   artPatch(ctx,c=>{c.moveTo(-outer,top);c.quadraticCurveTo(-outer-2.8,18.6,-inner,drop);c.lineTo(-inner+5.5,drop-.7);c.quadraticCurveTo(-outer+1.0,15.8,-outer+1.2,top-1.1);},fill,null);
   artPatch(ctx,c=>{c.moveTo(outer,top);c.quadraticCurveTo(outer+2.8,18.6,inner,drop);c.lineTo(inner-5.5,drop-.7);c.quadraticCurveTo(outer-1.0,15.8,outer-1.2,top-1.1);},fill,null);
  } else if(stubble){
   artStroke(ctx,[[-g.backOuter+1.2,15.1],[-g.backInner,21.0]],1.0,beardTintRGBA(hairColor,.28),beardTintRGBA(hairColor,.28),0);
   artStroke(ctx,[[g.backOuter-1.2,15.1],[g.backInner,21.0]],1.0,beardTintRGBA(hairColor,.28),beardTintRGBA(hairColor,.28),0);
  }
 }
}
// v0.8.25.30: shape-specific profile silhouettes. Front view already uses
// faceShapeOutline; earlier oblique views reused the same contour for all faces.
// Geometry changes ONLY the visual mask, never gameplay collision/hitboxes.
function faceViewProfile(face){
 const i=((Number(face)||0)%5+5)%5;
 return [
  {cheek:30.5,jaw:24.5,chin:35.5,rear:29.5,forehead:-16}, // oval
  {cheek:33,jaw:29.5,chin:33.4,rear:32,forehead:-18},      // broad jaw
  {cheek:28,jaw:20.5,chin:38,rear:27.5,forehead:-14},      // narrow pointed chin
  {cheek:33.5,jaw:29.8,chin:35,rear:32.8,forehead:-19},   // angular square
  {cheek:30.8,jaw:25,chin:37,rear:30.4,forehead:-16.5}    // soft round
 ][i];
}
function artHead(ctx,p,av,team,view,opt){
 const kind=view.kind,front=kind==='front',back=kind==='back',side=kind==='side',qfront=kind==='quarterFront',qback=kind==='quarterBack';
 const skin=opt.skin,dark=opt.dark,hair=opt.hair,hs=opt.headScale,blink=!opt.hurt&&!opt.cry&&Math.sin(opt.time*1.08+(p.i||0)*2.11)>.992;
 const shade=artTint(skin,-.18),bright=artTint(skin,.20),hairDim=artTint(hair,-.25),hairLight=artTint(hair,.17);
 const width=[27,29,25,31,27][((Number(av.face)||0)%5+5)%5],earW=5.8,earH=9.6;
 const lips=av.lips??opt.lips??0,beardStyle=Number(av.beard)||0,profile=faceViewProfile(av.face);
 ctx.save();
 ctx.translate(kind==='side'?0:qfront?1:qback?-1:0,-80+(Math.abs(opt.run)>.25?Math.abs(opt.run)*.55:0));
 ctx.rotate(opt.signatureMotion?.headTilt||0);
 if(opt.kick)ctx.rotate(.03);if(opt.hurt)ctx.rotate(Math.sin(p.anim*23)*.045);
 ctx.scale(hs,hs);
 if(front){
  faceShapeOutline(ctx,av.face,width+2.3);ctx.fillStyle=dark;ctx.fill();
  faceShapeOutline(ctx,av.face,width);ctx.fillStyle=skin;ctx.fill();
  artEllipse(ctx,-width+1,5,earW,earH,shade,dark,2);artEllipse(ctx,-width+1,5,2.4,5.2,skin,null);
  artEllipse(ctx,width-1,5,earW,earH,shade,dark,2);artEllipse(ctx,width-1,5,2.4,5.2,skin,null);
  studioHair(ctx,av,'front',hair,dark);
  artStroke(ctx,[[-17,-24],[-6,-29],[7,-28]],1.5,hairLight,hair,0);
  artEllipse(ctx,-11,-9,13,5.5,'#ffffff19',null);artEllipse(ctx,-17,18,4.3,2.1,'#d9777030',null);artEllipse(ctx,18,18,4.3,2.1,'#d9777030',null);
  const browY=opt.cry?1:opt.hurt?2:-1;studioBrow(ctx,-12,browY,av.brows??0);studioBrow(ctx,12,browY,av.brows??0);
  if(blink){artStroke(ctx,[[-20,10],[-8,10]],2.1,dark,dark,0);artStroke(ctx,[[8,10],[20,10]],2.1,dark,dark,0);} 
  else if(opt.hurt){artStroke(ctx,[[-20,8],[-10,14]],2.4,dark,dark,0);artStroke(ctx,[[-10,8],[-20,14]],2.4,dark,dark,0);artStroke(ctx,[[10,8],[20,14]],2.4,dark,dark,0);artStroke(ctx,[[20,8],[10,14]],2.4,dark,dark,0);} 
  else {studioEye(ctx,-12,7.8,av.eyes??0,av.eyeColor??0);studioEye(ctx,12,7.8,av.eyes??0,av.eyeColor??0);}
  drawNose(ctx,av.nose??0,shade);
  if(opt.cry||opt.hurt||opt.kick){artEllipse(ctx,1,23,opt.cry?9.5:5.7,opt.cry?10.2:6.4,'#702a3b',dark,1.1);artEllipse(ctx,1,25.2,2.7,1.8,'#f0b5bd',null);} else drawLips(ctx,lips,'#7c3e46');
 }else if(qfront){
  artPatch(ctx,c=>{c.moveTo(profile.forehead,-29);c.bezierCurveTo(4,-37,27,-26,profile.cheek,-4);c.quadraticCurveTo(profile.cheek+2,4,profile.cheek,10);c.quadraticCurveTo(profile.jaw,profile.chin-5,8,profile.chin);c.quadraticCurveTo(-13,profile.chin+2,-25,17);c.quadraticCurveTo(-31,-10,profile.forehead,-29);},skin,dark,2.6);
  artEllipse(ctx,-22,6,5.5,9.2,shade,dark,2);artEllipse(ctx,-22,6,2.2,4.5,skin,null);
  artEllipse(ctx,-12,-8,10.5,4.4,'#ffffff15',null);artEllipse(ctx,12,17,5.3,2.2,'#d8766f2f',null);artEllipse(ctx,-10,17,3.2,1.8,'#d8766f24',null);
  studioHair(ctx,av,'quarterFront',hair,dark);
  
  artStroke(ctx,[[-18,-25],[-8,-29],[6,-28]],1.5,hairLight,hair,0);
  studioBrow(ctx,-8,-1.5,av.brows??0,.78,true);studioBrow(ctx,12,-2,av.brows??0,.94,false);
  if(blink){artStroke(ctx,[[-12,7.5],[-5,7.5]],1.7,dark,dark,0);artStroke(ctx,[[8,7.5],[17,7.5]],1.8,dark,dark,0);} else {studioEye(ctx,-8,7.6,av.eyes??0,av.eyeColor??0,.70,true);studioEye(ctx,11.5,7.8,av.eyes??0,av.eyeColor??0,.90,false);} 
  artStroke(ctx,[[6.5,11],[11,15],[9,18.5]],1.7,shade,shade,0);artStroke(ctx,[[8,19],[12,19.2]],1.05,shade,shade,0);
  if(opt.cry||opt.hurt||opt.kick){artEllipse(ctx,9,24,4.8,opt.cry?7.0:4.6,'#702a3b',dark,1.0);} else drawProfileLips(ctx,lips,'#7c3e46',8,23,.86);
 }else if(side){
  artPatch(ctx,c=>{c.moveTo(profile.forehead-2,-28);c.quadraticCurveTo(5,-39,22,-28);c.quadraticCurveTo(profile.cheek,-22,profile.cheek,-10);c.quadraticCurveTo(profile.cheek,-3,profile.cheek-4,2);c.quadraticCurveTo(profile.cheek,8,profile.cheek-2,12);c.quadraticCurveTo(profile.jaw+1,16,20,18);c.quadraticCurveTo(18,profile.chin-3,4,profile.chin);c.quadraticCurveTo(-19,36,-26,12);c.quadraticCurveTo(-29,-12,profile.forehead-2,-28);},skin,dark,2.7);
  artEllipse(ctx,-18,6,6.8,10,shade,dark,2);artEllipse(ctx,-18,6,2.5,4.9,skin,null);artEllipse(ctx,8,-10,9.5,3.8,'#ffffff16',null);artEllipse(ctx,13,17,4.5,2.1,'#d9766f27',null);
  studioProfileHair(ctx,av,hair,dark);
  
  
  studioBrow(ctx,12,-2,av.brows??0,.88);
  if(blink)artStroke(ctx,[[8,9.5],[19.5,10]],2,dark,dark,0); else studioEye(ctx,11.5,8,av.eyes??0,av.eyeColor??0,.78,false);
  artStroke(ctx,[[14.5,10],[19,14],[17.5,20]],1.45,shade,shade,0);artStroke(ctx,[[17.4,21],[22,21.4]],.95,shade,shade,0);
  if(opt.cry||opt.hurt||opt.kick){artEllipse(ctx,18.5,24,4.3,opt.cry?6.2:4.1,'#702a3b',dark,1);} else drawProfileLips(ctx,lips,'#7c3e46',18,23,.76);
 }else if(qback){
  artPatch(ctx,c=>{c.moveTo(profile.forehead,-30);c.bezierCurveTo(7,-38,profile.rear-2,-18,profile.rear,5);c.quadraticCurveTo(profile.rear+1,profile.chin-12,12,profile.chin);c.quadraticCurveTo(-8,profile.chin+3,-23,19);c.quadraticCurveTo(-31,-7,profile.forehead,-30);},skin,dark,2.6);
  artEllipse(ctx,24,6,6.2,9.8,shade,dark,2);artEllipse(ctx,24.4,6.5,2.2,4.8,skin,null);artEllipse(ctx,6,18,11,5,'#ffffff10',null);
  artPatch(ctx,c=>{c.moveTo(-24,-12);c.bezierCurveTo(-28,-31,-10,-39,8,-37);c.bezierCurveTo(25,-34,30,-22,29,-9);c.quadraticCurveTo(28,3,19,10);c.quadraticCurveTo(7,17,-7,14);c.quadraticCurveTo(-22,8,-24,-12);},hair,dark,2.3);
  artPatch(ctx,c=>{c.moveTo(-18,-15);c.quadraticCurveTo(-9,-31,11,-28);c.quadraticCurveTo(6,-22,-12,-14);},artTint(hair,.065),null);if((av.style%13)===11){for(let k=-1;k<=2;k++)artEllipse(ctx,k*8,-23+(k%2)*2,5.5,5,hair,dark,.55);}
  studioRearQuarterHair(ctx,av,hair,dark);
  artStroke(ctx,[[-14,7],[-6,14],[4,14]],1.8,hairDim,hair,0);artStroke(ctx,[[18,-11],[24,-4]],1.7,'#ffffff23',hair,0);
  artStroke(ctx,[[13,19],[18,20]],1.05,shade,shade,0);
 }else{ // back
  drawBackHair(ctx,av.style,hair,dark,width+1);artEllipse(ctx,0,-17,23,15,hair,dark,2.1);artStroke(ctx,[[-20,-13],[-11,-22],[3,-23],[18,-14]],1.9,hairLight,hair,0);studioRearCrownIdentity(ctx,av.style,hair,dark);
  if((av.style%13)===7||(av.style%13)===11){artEllipse(ctx,-25,12,8,15,hair,dark,2);artEllipse(ctx,25,12,8,15,hair,dark,2);} artStroke(ctx,[[-12,26],[0,28],[11,25]],2,shade,skin,0);
 }
 drawBeardByView(ctx,front?'front':qfront?'quarterFront':side?'side':qback?'quarterBack':'back',beardStyle,hair,av.face??0,p.src.name||'');
 if(!back&&!qback){
  if(av.freckles===2){if(front){for(let j=0;j<4;j++)artEllipse(ctx,(j-1.5)*10,16+(j%2)*2,1,1,'#9f5e4f',null);} else if(qfront){for(let j=0;j<3;j++)artEllipse(ctx,4+j*4,16+(j%2),1,1,'#9f5e4f',null);} else {for(let j=0;j<3;j++)artEllipse(ctx,12+j*3.1,16+(j%2),1,1,'#9f5e4f',null);}}
  if(av.scar===2){if(front)artStroke(ctx,[[16,-1],[23,13]],1.4,'#9a504e','#9a504e',0);else if(qfront)artStroke(ctx,[[17,0],[22,12]],1.3,'#9a504e','#9a504e',0);else artStroke(ctx,[[16,1],[21,13]],1.3,'#9a504e','#9a504e',0);} 
  if(av.accessory===4){if(front)artStroke(ctx,[[-28,8],[28,8]],2.8,'#302f41','#302f41',0);else if(qfront)artStroke(ctx,[[-17,8],[27,8]],2.6,'#302f41','#302f41',0);else artStroke(ctx,[[-8,8],[24,8]],2.4,'#302f41','#302f41',0);} 
 }
 if(av.accessory===5){if(front)artPatch(ctx,c=>{c.moveTo(-27,-14);c.lineTo(27,-14);c.lineTo(24,-7);c.lineTo(-25,-7);},'#efe6bc',dark,2);else if(qfront)artPatch(ctx,c=>{c.moveTo(-24,-13);c.lineTo(22,-13);c.lineTo(19,-6);c.lineTo(-22,-6);},'#efe6bc',dark,2);else if(side)artPatch(ctx,c=>{c.moveTo(-18,-13);c.lineTo(19,-13);c.lineTo(16,-7);c.lineTo(-17,-7);},'#efe6bc',dark,2);else if(qback||back)artPatch(ctx,c=>{c.moveTo(-24,-14);c.lineTo(24,-14);c.lineTo(20,-8);c.lineTo(-20,-8);},'#efe6bc',dark,2);} 
 if(opt.cry&&!back&&!qback){if(front){for(let j=0;j<2;j++)artEllipse(ctx,j?15:-15,29+Math.sin(opt.time*13+j)*3,2.5,8,'#9feaffc9',null);} else if(qfront){artEllipse(ctx,15,28+Math.sin(opt.time*13)*3,2.2,7.1,'#9feaffc9',null);} else {artEllipse(ctx,14,27+Math.sin(opt.time*13)*2.7,2.1,6.4,'#9feaffc9',null);} }
 ctx.restore();
}

function drawTattooMark(ctx,style,x,y,scale=1,flip=1){
 const k=((Number(style)||0)%6+6)%6;if(!k)return;
 ctx.save();ctx.translate(x,y);ctx.scale(flip,1);ctx.strokeStyle='#425766';ctx.lineWidth=1.2*scale;ctx.lineCap='round';ctx.lineJoin='round';
 if(k===1){ctx.beginPath();ctx.arc(0,0,4.4*scale,0,Math.PI*2);ctx.stroke();}
 else if(k===2){ctx.beginPath();ctx.moveTo(-5*scale,-3*scale);ctx.lineTo(5*scale,3*scale);ctx.moveTo(-5*scale,3*scale);ctx.lineTo(5*scale,-3*scale);ctx.stroke();}
 else if(k===3){ctx.beginPath();ctx.moveTo(-6*scale,1*scale);ctx.quadraticCurveTo(-1*scale,-4*scale,6*scale,-1*scale);ctx.stroke();ctx.beginPath();ctx.moveTo(-4*scale,4*scale);ctx.lineTo(4*scale,4*scale);ctx.stroke();}
 else if(k===4){ctx.beginPath();ctx.moveTo(-6*scale,-4*scale);ctx.lineTo(-1*scale,0);ctx.lineTo(-6*scale,4*scale);ctx.moveTo(0,-4*scale);ctx.lineTo(5*scale,0);ctx.lineTo(0,4*scale);ctx.stroke();}
 else if(k===5){ctx.beginPath();ctx.moveTo(-6*scale,-4*scale);ctx.lineTo(6*scale,-1*scale);ctx.lineTo(-3*scale,4*scale);ctx.stroke();}
 ctx.restore();
}
function drawPremiumCharacter(ctx,p,av,team,view,opt){
 const side=view.kind==='side',q=view.kind==='quarterFront'||view.kind==='quarterBack',back=view.kind==='back'||view.kind==='quarterBack';
 const dark=opt.dark,skin=opt.skin,skinDim=artTint(skin,-.16),skinBright=artTint(skin,.26);
 const main=team.primary||'#2c7eaa',contrast=team.secondary||'#f3e4b7',trim=team.trim||contrast;
 const light=artTint(main,.24),shade=artTint(main,-.32),contrastShade=artTint(contrast,-.24);
 const run=opt.run,action=p.action,locomotion=!!opt.locomotion;
 const runPhase=Number.isFinite(opt.runPhase)?opt.runPhase:0;
 const runSpeedRatio=clamp(Number(opt.runSpeedRatio)||0,0,1);
 const passing=ARTPOSE.passFollowThrough(action,p.actionTimer);
 const active=action==='kick'||action==='super'||action==='flipKick'||action==='flyingKick'||action==='bicycle'||action==='superBicycle';
 const jumping=(p.z||0)>15||action==='jump'||action==='header'||action==='superHead';
 const actionStep=active?8:0;
 const step=(run*19)+actionStep;
 const spacing=side?7:q?10:12;
 // Foreground / background leg anatomy are drawn with actual knee bends, sock zones, shoe toes.
 function leg(sign,near){
  const cx=sign*spacing+(side?2:0);
  const cycle=run*(sign===-1?1:-1);
  const landing=p.keeper&&action==='keeperRecover'?Math.max(0,Math.min(1,(p.actionTimer||0)/.34)):0;
  const brace=action==='receive'?ARTPOSE.receivePose(p.actionTimer,p.firstTouchPressure||0).brace:0;
  const release=p.keeper?ARTPOSE.keeperRelease(action,p.actionTimer,p.keeperReleasePoseDuration):{punting:false,windup:0};
  const gait=ARTPOSE.gait(cycle,{side,quarter:q,active:(active&&sign===1)||(release.punting&&sign===1),sliding:opt.sliding&&sign===1,jumping,recovering:Math.max(landing,brace*.65)});
  const footPose=locomotion?ARTPOSE.runFootPose(runPhase+(sign===1?PI:0),runSpeedRatio,runFootPoseScratch[sign===1?1:0]):null;
  // The support boot travels backward under the body through stance, then
  // recovers forward in swing. This only changes painted coordinates.
  const stride=footPose?footPose.contactOffset:gait.stride+(sign===1?passing.stride:0);
  const lift=footPose?(footPose.stance?0:gait.lift):gait.lift+(sign===1?passing.lift:0);
  const kneeFlex=footPose?footPose.kneeFlex*8:0,toeFlex=footPose?footPose.toeFlex:0;
  const moveX=Number(p.moveVX)||0,moveY=Number(p.moveVY)||0,moveSpeed=Math.hypot(moveX,moveY);
  const phaseTravel=footPose&&runSpeedRatio>0?footPose.contactOffset/(9*runSpeedRatio):0;
  const along=phaseTravel*moveSpeed*(PI/17)*.5;
  const scaleX=Math.max(.2,Number(opt.footScaleX)||.78),scaleY=Math.max(.2,Number(opt.footScaleY)||.78);
  const contactX=footPose&&moveSpeed>0?moveX/moveSpeed*along/scaleX*view.side:footPose?stride:stride*.84;
  const contactY=footPose&&moveSpeed>0?moveY/moveSpeed*along/scaleY:0;
  const knee=[cx+contactX*.44,-8+contactY*.44-lift*.43-gait.kneeBend*.16-kneeFlex],ankle=[cx+contactX,-.2+contactY-lift+landing*3];
  const toe=side?11:q?sign===1?8:4:sign===1?7:-6;
  const toePitch=toeFlex*Math.sign(toe||1)*4;
  if(footPose?.stance)artEllipse(ctx,ankle[0]+toe*.42,10,8.5,2.2,'#10201c4a');
  artStroke(ctx,[[cx*.9,-17],knee],10.2,skinDim,dark,2);
  artStroke(ctx,[knee,ankle],8.8,p.keeper?'#fff0ba':contrast,dark,1.8);
  artStroke(ctx,[[ankle[0]-.7,ankle[1]-5],[ankle[0]+1.4,ankle[1]-5]],2.4,trim,trim,0);
  artEllipse(ctx,knee[0]-1,knee[1]+1,4.5,4.2,near?skin:skinDim);
  artPatch(ctx,c=>{c.moveTo(ankle[0]-7,ankle[1]+.8);c.quadraticCurveTo(ankle[0]+toe*.2,ankle[1]-2-toePitch*.35,ankle[0]+toe+11,ankle[1]+4-toePitch);c.lineTo(ankle[0]+toe+10,ankle[1]+9-toePitch*.55);c.quadraticCurveTo(ankle[0]+toe-4,ankle[1]+12-toePitch*.25,ankle[0]-8,ankle[1]+8);},near?'#1a2435':'#263247',dark,2);
  artStroke(ctx,[[ankle[0]+2,ankle[1]+4-toePitch*.7],[ankle[0]+toe+10,ankle[1]+4-toePitch]],2.6,'#f3eadb','#f3eadb',0);
  artStroke(ctx,[[ankle[0]+toe-1,ankle[1]+1],[ankle[0]+toe+4,ankle[1]+2]],1.25,'#889bad','#889bad',0);
  // Small trim-colored crossed laces, a pale toe seam, and three sole studs
  // echo the Studio footwear detail while preserving the live shoe outline.
  const laceCenter=ankle[0]+Math.sign(toe||1)*1.4,laceDir=Math.sign(toe||1);
  artStroke(ctx,[[laceCenter-laceDir*3.1,ankle[1]+1],[laceCenter-laceDir*.9,ankle[1]+3],
   [laceCenter+laceDir*1.1,ankle[1]+1],[laceCenter+laceDir*3.1,ankle[1]+3]],.78,trim,dark,.28);
  const capX=ankle[0]+toe+7;
  ctx.beginPath();ctx.moveTo(capX-3.4,ankle[1]+1.2);ctx.quadraticCurveTo(capX-1.5,ankle[1]+3.5,capX+.5,ankle[1]+4.2);
  ctx.strokeStyle='#fff9e6b8';ctx.lineWidth=.72;ctx.stroke();
  for(let stud=0;stud<3;stud++)artEllipse(ctx,ankle[0]-5+stud*4.8,ankle[1]+8.1,1.05,.7,trim,dark,.45);
 }
 leg(-1,false);leg(1,true);
 // Separate tailored shorts panels. No floating rectangular boot/short blobs.
 artPatch(ctx,c=>{c.moveTo(-18,-24);c.quadraticCurveTo(0,-18,18,-24);c.lineTo(19,-8);c.quadraticCurveTo(10,-6,2,-9);c.lineTo(0,-12);c.lineTo(-2,-9);c.quadraticCurveTo(-10,-7,-19,-9);},contrast,dark,2.5);
 artPatch(ctx,c=>{c.moveTo(-18,-23);c.lineTo(-4,-19);c.lineTo(-3,-10);c.quadraticCurveTo(-11,-7,-19,-9);},contrastShade,null);
 artStroke(ctx,[[0,-19],[0,-10]],1.6,contrastShade,contrastShade,0);
 artStroke(ctx,[[-14,-10],[-7,-10]],1.8,artTint(contrast,.31),artTint(contrast,.31),0);
 // The upper body counters the leg swing from the hip pivot; keep shorts and
 // planted boots outside this transform so the silhouette stays grounded.
 ctx.save();
 if(locomotion){ctx.translate(0,-27);ctx.rotate(-run*.055);ctx.translate(0,27);}
 // Neck visible between jersey collar and the head, with depth beneath the jaw.
 artStroke(ctx,[[0,-62],[0,-50]],16,skinDim,dark,2.1);
 artStroke(ctx,[[-3,-60],[-3,-54]],5,skinBright,skinBright,0);
 // Back arm is drawn BEHIND shoulder silhouette, near arm after jersey.
 function arm(sign,near){
  const shoulder=sign*(side?13:q?18:22);
  const swing=opt.signatureMotion?.armSwing||0;
  const sw=run*sign*15+(opt.celebrate?-10:0)+swing*sign*.55+(active&&sign===1?-11:0);
  // Keeper dives require hands reaching toward the ball rather than the ordinary walking swing.
  const diving=p.keeper&&(action==='keeperDive'||action==='keeperDiveCatch'||action==='keeperSuper');
  const diveReach=diving?(action==='keeperDiveCatch'?23:17):0;
  // Recovery bends the elbows back toward the chest after an extended dive.
  const recovering=p.keeper&&action==='keeperRecover';
  const release=p.keeper?ARTPOSE.keeperRelease(action,p.actionTimer,p.keeperReleasePoseDuration):{throwing:false,punting:false,windup:0,follow:0};
  const throwing=release.throwing&&near;
  const fold=recovering?Math.max(0,Math.min(1,(p.actionTimer||0)/.34)):0;
   const shotRecovery=p.action==='shotGetUp'?impactRecovery.support:0;
  const elbow=diving?[shoulder+sign*(side?16:14)+diveReach*.36,-50-diveReach*.30]
   :recovering?[shoulder+sign*(side?8:10),-42+fold*6]
   :throwing?[shoulder+sign*(13+release.windup*7),-61-release.windup*9]
    :p.action==='shotGetUp'?[shoulder+sign*(side?10:12),-39+shotRecovery*8]
   :[shoulder+sign*(side?12:9),-39+(sign===1?sw:-sw)*.48];
  const wrist=diving?(action==='keeperDiveCatch'
    ?[elbow[0]-sign*(4+Math.min(7,diveReach*.3)),-62-diveReach*.22]
    :[elbow[0]+sign*(side?7:11)+diveReach*.36,-57-diveReach*.55])
   :recovering?[elbow[0]-sign*(6+fold*3),-36+fold*7]
   :throwing?[elbow[0]+sign*(8+8*release.follow),-79-release.windup*13+release.follow*19]
   :p.action==='shotGetUp'?[elbow[0]-sign*3,-24+shotRecovery*10]
   :[elbow[0]+sign*(side?5:3),-23+(sign===1?sw:-sw)];
  artStroke(ctx,[[shoulder,-49],elbow],14,near?light:shade,dark,2.2);
  artStroke(ctx,[elbow,wrist],9.7,near?skin:skinDim,dark,2);
  if((Number(av.tattoo)||0)>0 && near){
   const tx=elbow[0]*.44+wrist[0]*.56,ty=elbow[1]*.44+wrist[1]*.56;
   drawTattooMark(ctx,av.tattoo,tx,ty,1,sign<0?-1:1);
  }
  artEllipse(ctx,wrist[0]+sign*1,wrist[1],6.5,7.5,p.keeper?'#f2e3b2':near?skinBright:skin,dark,2);
  if(p.keeper){artStroke(ctx,[[wrist[0]-4,wrist[1]+1],[wrist[0]+3,wrist[1]+2]],2.6,'#4fa6a9','#4fa6a9',0);
   if(diving){artEllipse(ctx,wrist[0]+sign*3,wrist[1]-3,7.1,5.6,'#e5ebd0',dark,1.5);artStroke(ctx,[[wrist[0]-3,wrist[1]-4],[wrist[0]+sign*7,wrist[1]-5]],1.6,'#49a6ad','#49a6ad',0);}
  }
 }
 arm(side?1:-1,false);
 // Jersey has a contoured shoulder/sleeve structure, tapered waist and fabric depth.
 const width=side?17:q?21:24,offset=side?-1:q?2:0;
 const jersey=ctx.createLinearGradient(-26,-55,26,-18);
 jersey.addColorStop(0,light);jersey.addColorStop(.26,main);jersey.addColorStop(.79,main);jersey.addColorStop(1,shade);
 artPatch(ctx,c=>{c.moveTo(offset-width,-51);c.quadraticCurveTo(offset-width-2,-59,offset-6,-57);c.lineTo(offset+10,-57);c.quadraticCurveTo(offset+width+3,-53,offset+width,-47);c.lineTo(offset+width-3,-26);c.quadraticCurveTo(offset+width-6,-19,offset+width-8,-19);c.lineTo(offset-width+7,-19);c.quadraticCurveTo(offset-width-4,-22,offset-width+1,-29);},jersey,dark,2.8);
 // Sleeve cuffs, side seams and collar wrap according to the chosen angle.
 artStroke(ctx,[[offset-width+2,-50],[offset-width+5,-44]],3.3,contrast,contrast,0);
 artStroke(ctx,[[offset+width-4,-49],[offset+width-5,-43]],3.3,contrast,contrast,0);
 artStroke(ctx,[[offset-width+7,-24],[offset+width-7,-24]],1.5,shade,shade,0);
 artStroke(ctx,[[offset-width+5,-35],[offset-width+8,-25]],2.1,contrastShade,contrastShade,0);
 if(side){
  artPatch(ctx,c=>{c.moveTo(4,-53);c.quadraticCurveTo(15,-55,16,-45);c.lineTo(15,-26);c.lineTo(8,-21);c.lineTo(7,-47);},shade,null);
  artStroke(ctx,[[8,-48],[9,-28]],2.8,trim,trim,0);
 }else if(q){
  artPatch(ctx,c=>{c.moveTo(12,-51);c.lineTo(20,-47);c.lineTo(17,-24);c.lineTo(10,-22);},back?shade:light,null);
  artStroke(ctx,[[11,-50],[10,-25]],2.1,trim,trim,0);
 }else{
  artStroke(ctx,[[-13,-48],[-12,-29]],1.8,light,light,0);
  artStroke(ctx,[[16,-50],[15,-25]],1.8,shade,shade,0);
 }
 artPatch(ctx,c=>{c.moveTo(-9,-55);c.quadraticCurveTo(0,-44,9,-55);c.lineTo(6,-57);c.quadraticCurveTo(0,-50,-6,-57);},contrast,dark,1.35);
 if(back){
  // Only backs show the large numbered shirt panel. Forward-facing outfits do not accidentally show back numbers.
  ctx.save();ctx.translate(side?0:q?-3:0,-30);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 22px Arial,sans-serif';
  ctx.lineWidth=3;ctx.strokeStyle=artTint(main,-.42);ctx.strokeText(String(p.src.num??0),0,0);
  ctx.fillStyle=contrast;ctx.fillText(String(p.src.num??0),0,0);
  ctx.restore();
 }else if(!side){
  // Tiny chest number, optional kit motif: clean at game scale.
  ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillStyle=contrast;
  ctx.fillText(String(p.src.num??0),q?-5:0,-32);
  artEllipse(ctx,-10,-43,3.1,3.1,contrast,dark,1);
  artStroke(ctx,[[-5,-41],[1,-41]],1.4,artTint(contrast,.25),artTint(contrast,.25),0);
 }
 artEllipse(ctx,-9,-49,11,2.5,'#ffffff1b');
 arm(side?-1:1,true);
 if(p.preview&&p.keeper&&action==='keeperDiveCatch'){
  // Ball-on-gloves cue only in the editor: the live ball is drawn separately in matches.
  artEllipse(ctx,3,-69,8.5,8.5,'#f8f6de',dark,1.9);
  artPatch(ctx,c=>{c.moveTo(3,-74);c.lineTo(7,-71);c.lineTo(6,-66);c.lineTo(1,-64);c.lineTo(-1,-68);},'#36404a',null);
  artStroke(ctx,[[-4,-71],[-1,-68]],1.1,'#5c6670','#5c6670',0);
 }
 artHead(ctx,p,av,team,view,{...opt,skin,dark,headScale:opt.headScale});
 ctx.restore();
}

class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.renderQuality='high';this.dpr=1;this.screenW=1280;this.screenH=720;this.scale=1;this.offsetX=0;this.offsetY=0;this.cameraX=0;this.cameraY=0;this.time=0;this.stadiumCache=null;this.stadiumCacheKey='';this.poseHeadings=new WeakMap();this.poseCycles=new WeakMap();this.frameDelta=1/60;this.inMatchDraw=false;this.resize();addEventListener('resize',()=>this.resize());}
  drawMagicWalls(ctx,walls,reducedFlash=false){drawMagicWalls(ctx,walls,reducedFlash);}
  drawSupernova(ctx,nova,reducedFlash=false){drawSupernova(ctx,nova,reducedFlash);}
  drawSpinBump(ctx,remaining,reducedFlash=false){
   if(!Number.isFinite(remaining)||remaining<=0)return false;
   const life=clamp(remaining/.38,0,1),start=reducedFlash?-Math.PI*.72:-Math.PI*.72+this.time*1.5,end=start+Math.PI*1.42;
   ctx.save();ctx.globalAlpha=(reducedFlash?.7:.76)*life;ctx.strokeStyle='#ffd76e';ctx.fillStyle='#fff4c6';ctx.lineWidth=reducedFlash?3.5:3;ctx.setLineDash(reducedFlash?[]:[8,5]);
   ctx.beginPath();ctx.arc(0,0,82,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
   ctx.beginPath();ctx.arc(0,0,88,start,end);ctx.stroke();
   for(const a of [start,end]){ctx.beginPath();ctx.arc(Math.cos(a)*88,Math.sin(a)*88,4,0,Math.PI*2);ctx.fill();}
   ctx.font='900 12px Arial';ctx.textAlign='center';ctx.fillText('SPIN BUMP',0,-99);
   ctx.font='800 9px Arial';ctx.fillText('SLIDE · JUMP · READ',0,103);ctx.restore();return true;
  }
  drawSandTrap(ctx,remaining,reducedFlash=false){
   if(!Number.isFinite(remaining)||remaining<=0)return false;
   const life=clamp(remaining/.38,0,1);ctx.save();ctx.globalAlpha=(reducedFlash?.48:.68)*life;ctx.strokeStyle='#f0c27b';ctx.fillStyle='#a9783d';ctx.lineWidth=reducedFlash?3:3.5;
   ctx.beginPath();ctx.ellipse(0,11,35,12,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.setLineDash(reducedFlash?[]:[5,4]);ctx.beginPath();ctx.ellipse(0,11,25,8,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5-.4,rx=Math.cos(a)*27,ry=11+Math.sin(a)*8;ctx.beginPath();ctx.arc(rx,ry,2.5,0,Math.PI*2);ctx.fillStyle='#f4d294';ctx.fill();}
   ctx.globalAlpha=(reducedFlash?.65:.82)*life;ctx.font='900 10px Arial';ctx.textAlign='center';ctx.fillStyle='#fff0c9';ctx.fillText('SAND TRAP',0,-72);ctx.restore();return true;
  }
  drawLightningTrick(ctx,remaining,phase='warning',reducedFlash=false){
   if(!Number.isFinite(remaining)||remaining<=0)return false;
   const life=clamp(remaining/.32,0,1);ctx.save();ctx.globalAlpha=(reducedFlash?.58:.76)*life;ctx.strokeStyle='#ffe77a';ctx.fillStyle='#fff3b0';ctx.lineWidth=reducedFlash?3:3.5;
   if(phase==='warning'){
    ctx.setLineDash(reducedFlash?[]:[7,5]);ctx.beginPath();ctx.ellipse(0,10,42,15,0,0,PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(0,-1,13,-PI/2,-PI/2+PI*2*(1-life));ctx.stroke();
    ctx.font='900 10px Arial';ctx.textAlign='center';ctx.fillStyle='#fff4c2';ctx.fillText('LIGHTNING · EVADE',0,-63);
   }else{
    ctx.beginPath();ctx.moveTo(4,-52);ctx.lineTo(-8,-26);ctx.lineTo(3,-22);ctx.lineTo(-7,3);ctx.lineTo(17,-27);ctx.lineTo(6,-30);ctx.lineTo(14,-52);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.ellipse(0,10,30,10,0,0,PI*2);ctx.stroke();
   }
   ctx.restore();return true;
  }
  drawFieldTrick(ctx,kind,remaining,reducedFlash=false){
   const duration=kind==='mud'?.52:.35;if(!Number.isFinite(remaining)||remaining<=0||!['wind','mud'].includes(kind))return false;
   const life=clamp(remaining/duration,0,1);ctx.save();ctx.globalAlpha=(reducedFlash?.5:.74)*life;ctx.lineWidth=reducedFlash?2.5:3;ctx.strokeStyle=kind==='wind'?'#baf7ed':'#d4ad75';ctx.fillStyle=kind==='wind'?'#e3fff6':'#a97944';
   if(kind==='wind'){
    for(let i=0;i<3;i++){const y=-16+i*12,span=30-i*3;ctx.beginPath();ctx.moveTo(-span,y);ctx.quadraticCurveTo(0,y-7,span,y);ctx.stroke();ctx.beginPath();ctx.moveTo(span-7,y-5);ctx.lineTo(span,y);ctx.lineTo(span-7,y+5);ctx.stroke();}
    ctx.font='900 10px Arial';ctx.textAlign='center';ctx.fillStyle='#e8fff9';ctx.fillText('WIND PUSH',0,-49);
   }else{
    ctx.beginPath();ctx.ellipse(0,11,35,12,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash(reducedFlash?[]:[5,4]);ctx.beginPath();ctx.ellipse(0,11,24,7,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(-17+i*11,11+(i%2?3:-3),4,1.8,-.2,0,Math.PI*2);ctx.fill();}
    ctx.font='900 10px Arial';ctx.textAlign='center';ctx.fillStyle='#fff0cf';ctx.fillText('MUD · SLOWED',0,-49);
   }
   ctx.restore();return true;
  }
 setRenderQuality(value){this.renderQuality=value==='performance'?'performance':'high';this.resize();return this.renderQuality;}
 resize(){let w=Math.max(1,innerWidth),h=Math.max(1,innerHeight);this.screenH=720;this.screenW=Math.max(1280,720*w/h);const qualityScale=this.renderQuality==='performance' ? 0.75 : 1;this.dpr=Math.min(2.5,window.devicePixelRatio||1)*qualityScale;this.canvas.width=Math.max(1,Math.round(w*this.dpr));this.canvas.height=Math.max(1,Math.round(h*this.dpr));let ratio=Math.min(w/this.screenW,h/this.screenH);this.scale=ratio*this.dpr;this.offsetX=(this.canvas.width-this.screenW*this.scale)/2;this.offsetY=(this.canvas.height-this.screenH*this.scale)/2;}
 frame(game,dt,attract=false){this.time+=Math.min(dt,.05);this.frameDelta=Math.min(.05,Math.max(0,dt));const ctx=this.ctx,s=this.scale;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#081621';ctx.fillRect(0,0,this.canvas.width,this.canvas.height);ctx.setTransform(s,0,0,s,this.offsetX,this.offsetY);ctx.save();ctx.beginPath();ctx.rect(0,0,this.screenW,this.screenH);ctx.clip();
 const zoomWide=game.options.camera==='Wide';
 const cameraZoom=zoomWide ? .86 : 1;
 this.cameraZoom=cameraZoom;
 const viewW=this.screenW/cameraZoom,viewH=this.screenH/cameraZoom;
 // Wide zoom is centered inside the logical viewport. Convert the camera's
 // visible left/top edge back to this renderer's camera-origin coordinates so
 // both world bounds (including goals and the end stands) remain in frame.
 const cameraExtraX=this.screenW*(1-cameraZoom)/(2*cameraZoom),cameraExtraY=this.screenH*(1-cameraZoom)/(2*cameraZoom);
 const follow=game.ball||{x:WORLD.w/2,y:WORLD.h/2};
 const targetX=game.matchState==='penalty' ? F.x+F.w-viewW+cameraExtraX : clamp(follow.x-this.screenW/2+(follow.vx||0)*.12,cameraExtraX,WORLD.w-viewW+cameraExtraX);
 const targetY=game.matchState==='penalty' ? clamp((WORLD.goalTop+WORLD.goalBottom)/2-this.screenH/2,cameraExtraY,WORLD.h-viewH+cameraExtraY) : clamp(follow.y-this.screenH/2+(follow.vy||0)*.055,cameraExtraY,WORLD.h-viewH+cameraExtraY);
 // Time-correct exponential follow, stable on 30/60/120 Hz displays and short frame stalls.
 const cameraEase=1-Math.exp(-Math.max(0,dt)*(zoomWide?2:5.2));
 this.cameraX+=(targetX-this.cameraX)*cameraEase;
 this.cameraY+=(targetY-this.cameraY)*cameraEase;
 const shake=game.shake?(Math.random()-.5)*game.shake*22:0;
 ctx.setTransform(s*cameraZoom,0,0,s*cameraZoom,this.offsetX+s*this.screenW*(1-cameraZoom)/2,this.offsetY+s*this.screenH*(1-cameraZoom)/2);
 ctx.translate(-this.cameraX+shake,-this.cameraY+shake*.5);
  this.activeVenueId=game.options?.stadium;this.drawStands(ctx);this.drawField(ctx,game);this.drawGoal(ctx,0,false);this.drawGoal(ctx,1,false);drawBananaPeels(ctx,game.magicHazards,!!game.options?.reducedFlash);drawIcePatches(ctx,game.magicHazards,!!game.options?.reducedFlash);this.drawMagicWalls(ctx,game.magicWalls,!!game.options?.reducedFlash);this.drawSupernova(ctx,game.supernova,!!game.options?.reducedFlash);
 if(game.matchState==='penalty')this.drawPenaltyPlayers(ctx,game);else{for(const p of game.players)this.drawHideBallCue(ctx,p,game);const list=game.players.slice().sort((a,b)=>a.y-b.y);this.inMatchDraw=true;try{for(let p of list)this.drawPlayer(ctx,p,game);}finally{this.inMatchDraw=false;}for(const p of game.players)this.drawTeleportTrail(ctx,p.teleportTrail,!!game.options?.reducedFlash);this.drawBall(ctx,game)}this.drawGoal(ctx,0,true);this.drawGoal(ctx,1,true);this.drawWeather(ctx,game);if(game.tornado)this.drawTornado(ctx,game.tornado,!!game.options?.reducedFlash);
 for(let p of game.particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ellipse(ctx,p.x,p.y-p.z,p.r,p.r,p.color)}ctx.globalAlpha=1;
 ctx.restore();if(game.flash){ctx.fillStyle=`rgba(255,249,204,${Math.min(.5,game.flash*.5)})`;ctx.fillRect(0,0,this.screenW,this.screenH)}this.drawBorder(ctx,game);this.drawMiniMap(ctx,game);if(game.celebration>0)this.drawGoalCelebration(ctx,game);ctx.restore();}
 drawGoalCelebration(ctx,game){
  // BROADCAST-GOAL-01: original team-colored highlight, no gameplay mutations.
  const scorer=game.pendingKickoff?.scorer===1?1:0,team=game.getTeam(scorer);
  const primary=/^#[0-9a-f]{6}$/i.test(team?.primary||'')?team.primary:'#247dda';
  const secondary=/^#[0-9a-f]{6}$/i.test(team?.secondary||'')?team.secondary:'#ffda6d';
  const remaining=Math.max(0,Number(game.celebration)||0);
  const elapsed=Math.max(0,3.3-remaining);
  const alpha=Math.min(1,elapsed/.25,remaining/.4);
  if(alpha<=0)return;
  const name=String(team?.name||'FOOTBALL CLUB').toUpperCase().slice(0,24);
  const hero=String(game.goalHero||name).toUpperCase().slice(0,25);
  const score=Array.isArray(game.score)?game.score:[0,0];
  const a=Math.max(0,Math.trunc(Number(score[0])||0));
  const b=Math.max(0,Math.trunc(Number(score[1])||0));
  const w=Math.min(680,this.screenW-48),h=182;
  ctx.save();ctx.globalAlpha=alpha;
  ctx.translate(this.screenW/2,25-Math.max(0,1-elapsed/.5)*14);
  ctx.shadowColor='#031633c7';ctx.shadowBlur=22;ctx.shadowOffsetY=8;
  const gradient=ctx.createLinearGradient(-w/2,0,w/2,h);
  gradient.addColorStop(0,'#0b2f6df1');gradient.addColorStop(.5,'#123d83f4');gradient.addColorStop(1,'#081f4df8');
  ctx.fillStyle=gradient;ctx.beginPath();ctx.roundRect(-w/2,0,w,h,24);ctx.fill();
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.lineWidth=3;ctx.strokeStyle='#e4f9ffd8';ctx.stroke();
  const bar=ctx.createLinearGradient(-w/2,0,w/2,0);
  bar.addColorStop(0,primary);bar.addColorStop(.5,secondary);bar.addColorStop(1,primary);
  ctx.fillStyle=bar;ctx.beginPath();ctx.roundRect(-w/2+12,10,w-24,9,5);ctx.fill();
  // Self-authored badge uses geometric shapes, never a real club crest.
  ctx.fillStyle=primary;ctx.beginPath();ctx.arc(-w/2+48,84,30,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=secondary;ctx.lineWidth=3;ctx.stroke();
  ctx.textAlign='center';ctx.font='900 30px system-ui';ctx.fillStyle='#ffffff';ctx.fillText('★',-w/2+48,94);
  ctx.textAlign='left';ctx.font='900 12px system-ui';ctx.fillStyle='#bbf2ff';
  ctx.fillText('SUPERMAGIC FOOTBALL · MATCH HIGHLIGHT',-w/2+95,43);
  ctx.font='1000 56px system-ui';ctx.fillStyle='#ffeb9d';ctx.fillText('GOAL!',-w/2+95,99);
  ctx.font='900 17px system-ui';ctx.fillStyle='#ffffff';ctx.fillText(hero,-w/2+95,130);
  ctx.font='800 12px system-ui';ctx.fillStyle='#cbeaff';ctx.fillText(name,-w/2+95,151);
  ctx.textAlign='right';ctx.font='1000 35px system-ui';ctx.fillStyle='#ffe39a';
  ctx.fillText(a+'  –  '+b,w/2-18,116);
  ctx.font='900 11px system-ui';ctx.fillStyle='#b5e8ff';ctx.fillText('MATCH SCORE',w/2-19,137);
  const colors=['#fff09d','#8ce4ff','#ffffff',primary,secondary];
  // Every particle has deterministic geometry for replay/QA and runs only during a goal.
  for(let i=0;i<24;i++){
   const x=-w*.59+(((i*71+17)%97)/97)*w*1.18+Math.sin(elapsed*2+i)*13;
   const y=(i*43+elapsed*(72+i%5*22))%265-33;
   ctx.save();ctx.translate(x,y);ctx.rotate(elapsed*(1+i%3)+i*.72);
   ctx.globalAlpha=alpha*.69;ctx.fillStyle=colors[i%5];ctx.fillRect(-3,-6,6,12);ctx.restore();
  }
  ctx.restore();
 }
 drawStands(ctx){
  // Keep one offscreen venue cache; swapping options replaces it instead of retaining 20 large canvases.
  const venue=STADIUMS.find(v=>v.id===this.activeVenueId)||STADIUMS[0],key=venue.id;
  if(!this.stadiumCache||this.stadiumCacheKey!==key){const canvas=document.createElement('canvas');canvas.width=Math.ceil(WORLD.w);canvas.height=Math.ceil(WORLD.h);const cached=canvas.getContext('2d');if(cached){this.paintStands(cached,venue);this.stadiumCache=canvas;this.stadiumCacheKey=key;}}
  if(this.stadiumCache){ctx.drawImage(this.stadiumCache,0,0);return;}
  this.paintStands(ctx,venue);
 }
 paintStands(ctx,venue=STADIUMS[0]){
  const [deep,trim,seatA,seatB]=venue.palette;const styles=venue.bowl,roof=venue.roof;
  const bg=ctx.createLinearGradient(0,0,0,WORLD.h);bg.addColorStop(0,deep);bg.addColorStop(.12,'#172d3a');bg.addColorStop(.5,'#21432f');bg.addColorStop(.88,'#172d3a');bg.addColorStop(1,deep);ctx.fillStyle=bg;ctx.fillRect(0,0,WORLD.w,WORLD.h);
  // Five editable bowl silhouettes; deliberately generic geometry, not traced from a real venue.
  for(let side=0;side<2;side++){
   const y=side?WORLD.h-90:0,dir=side?-1:1,base=side?WORLD.h:0;
   ctx.save();ctx.fillStyle='#101d2a';ctx.beginPath();
   const inset=[0,25,48,12,36][styles],height=[72,84,66,94,78][styles];
   ctx.moveTo(0,base);ctx.lineTo(WORLD.w,base);ctx.lineTo(WORLD.w,base+dir*height);ctx.lineTo(WORLD.w-inset,base+dir*(height-15));ctx.lineTo(WORLD.w-inset*.5,base+dir*26);ctx.lineTo(inset*.5,base+dir*26);ctx.lineTo(inset,base+dir*(height-15));ctx.lineTo(0,base+dir*height);ctx.closePath();ctx.fill();ctx.restore();
   for(let row=0;row<5;row++){
    const yy=y+10+row*13;ctx.fillStyle=row%2?deep:'#203544';ctx.fillRect(0,yy,WORLD.w,13);
    for(let i=0;i<220;i++){const hash=(i*71+row*113+styles*37)%29,x=8+i*17+(row%2)*5,colors=[trim,seatA,seatB,'#e9dfc9','#9bbcae','#a8c2d5'];ctx.fillStyle=colors[(hash+row+styles)%colors.length];ctx.fillRect(x,yy+3+(hash%4),3+(hash%3),5+(hash%3));}
   }
   ctx.fillStyle='#172328';ctx.fillRect(0,side?WORLD.h-22:62,WORLD.w,7);
   const band=ctx.createLinearGradient(0,0,WORLD.w,0);band.addColorStop(0,trim);band.addColorStop(.5,seatA);band.addColorStop(1,trim);ctx.fillStyle=band;ctx.fillRect(0,side?WORLD.h-17:65,WORLD.w,4);
  }
  // Roof profiles differ by venue preset; all silhouettes are simple original graphic motifs.
  ctx.save();ctx.strokeStyle=trim;ctx.fillStyle=deep;ctx.lineWidth=10;
  const roofY=[20,34,14,42,26][roof],wave=[0,12,24,9,18][roof];ctx.beginPath();ctx.moveTo(0,roofY+wave);
  for(let i=0;i<=8;i++){const x=WORLD.w*i/8,y=roofY+(roof%2?Math.sin(i/8*PI)*wave:((i%2)?wave:0));ctx.lineTo(x,y)}ctx.lineTo(WORLD.w,roofY+26);ctx.lineTo(0,roofY+26);ctx.closePath();ctx.globalAlpha=.58;ctx.fill();ctx.globalAlpha=.85;ctx.stroke();ctx.restore();
  this.activeStadium=venue;this.paintArenaAccents(ctx);
 }
 paintArenaAccents(ctx){
  // Arena details are painted once into the cached stands, not every animation frame.
  ctx.save();
  const venue=this.activeStadium||STADIUMS[0];
  const [,trim,seatA,seatB]=venue.palette;
  // Layered palette-driven seat tiers fill the pitch surround and remain
  // visible at match scale without touching the field or its collision bounds.
  for(let side=0;side<2;side++){
   const base=side?F.y+F.h+14:F.y-116;
   const inset=[0,44,92,28,126][venue.bowl];
   for(let tier=0;tier<5;tier++){
    const tierInset=inset*(tier%2?.72:1),y=base+tier*21;ctx.fillStyle=tier%2?venue.palette[0]:'#213442';ctx.fillRect(F.x-4+tierInset,y,F.w+8-tierInset*2,19);
    for(let seat=0;seat<176;seat++){
     const hash=(seat*67+tier*31+venue.bowl*43+venue.ambience*13)%23;
     const crowdColor=[venue.palette[1],venue.palette[2],venue.palette[3],'#e7e3d3'][hash%4];
     const x=F.x+tierInset+seat*(F.w-12-tierInset*2)/176+(tier%2?3:0),crowdY=y+4+(hash%4),crowdW=4+(hash%2);
     // Tiny two-tone head/shoulder silhouettes read as a crowd instead of loose
     // seat pixels at game scale; deterministic palette variation keeps the
     // author-created venues distinct without adding team marks or assets.
     ctx.fillStyle='#0b1924a8';ctx.fillRect(x,crowdY+2,crowdW,5);
     ctx.fillStyle=crowdColor;ctx.beginPath();ctx.arc(x+crowdW*.5,crowdY+1.5,1.45,0,PI*2);ctx.fill();
     ctx.fillRect(x,crowdY+3,crowdW,3);
    }
   }
  }
  // Five roof/truss motifs create recognizable but non-literal venue silhouettes.
  const roofTop=F.y-146,roofBottom=F.y+F.h+146;
  for(const y of [roofTop,roofBottom]){
   const profile=venue.profile??0,family=profile%5,variant=Math.floor(profile/5);
   ctx.save();ctx.strokeStyle=venue.palette[1];ctx.lineWidth=16+variant*4;ctx.globalAlpha=.9;ctx.beginPath();
   if(venue.roof===0){ctx.moveTo(F.x,y+38+variant*3);ctx.quadraticCurveTo(F.x+F.w*.5,y-26-variant*5,F.x+F.w,y+38+variant*3);ctx.stroke()}
   else if(venue.roof===1){ctx.moveTo(F.x,y+28);for(let i=1;i<=8+variant*2;i++)ctx.lineTo(F.x+F.w*i/(8+variant*2),y+(i%2?0:42+variant*4));ctx.stroke()}
   else if(venue.roof===2){ctx.moveTo(F.x,y+24);ctx.lineTo(F.x+F.w,y+24);ctx.stroke();for(let i=0;i<=6+variant*2;i++){const x=F.x+F.w*i/(6+variant*2);ctx.beginPath();ctx.moveTo(x,y+24);ctx.lineTo(x,y+75+variant*4);ctx.stroke()}}
   else if(venue.roof===3){ctx.moveTo(F.x,y+5);ctx.lineTo(F.x+F.w*.18,y+42+variant*3);ctx.lineTo(F.x+F.w*.5,y+10);ctx.lineTo(F.x+F.w*.82,y+42+variant*3);ctx.lineTo(F.x+F.w,y+5);ctx.stroke()}
   else{for(let i=0;i<=8+variant*2;i++){const x=F.x+F.w*i/(8+variant*2);ctx.moveTo(x,y+2);ctx.quadraticCurveTo(x+F.w/(16+variant*4),y+58+variant*4,x+F.w/(8+variant*2),y+2)}ctx.stroke()}
   // Paired fascia and truss chords make the roof profile readable at match scale.
   ctx.globalAlpha=.38;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(F.x,y+48);ctx.lineTo(F.x+F.w,y+48);ctx.stroke();
   ctx.restore();
  }
  for(const y of [F.y-26,F.y+F.h+9]){
   const rail=ctx.createLinearGradient(0,y,0,y+18);
   rail.addColorStop(0,trim+'e8');rail.addColorStop(.5,seatA+'f2');rail.addColorStop(1,seatB+'e8');
   ctx.fillStyle=rail;ctx.fillRect(F.x-30,y,F.w+60,18);
   for(let i=0;i<10;i++){const x=F.x+18+i*(F.w-36)/10;ctx.fillStyle=i%2?seatA:seatB;ctx.fillRect(x,y+6,Math.max(35,F.w/15),5);}
  }
  for(const x of [F.x-50,F.x+F.w+16]){
   ctx.fillStyle=venue.palette[0];ctx.fillRect(x,F.y-10,29,F.h+20);
   for(let i=0;i<24;i++){ctx.fillStyle=i%3===0?trim:i%3===1?seatA:seatB;ctx.fillRect(x+7,F.y+i*F.h/24+8,15,5);}
  }
  for(const x of [F.x-42,F.x+F.w+42])for(const y of [F.y-39,F.y+F.h+39]){
   const glow=ctx.createRadialGradient(x,y,1,x,y,90);glow.addColorStop(0,seatB+'bf');glow.addColorStop(.28,seatA+'4f');glow.addColorStop(1,'#ffffff00');
   ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,90,0,PI*2);ctx.fill();
  }
  // Venue-specific concourse cladding changes shape as well as color.
  const profile=venue.profile??0,profileFamily=profile%5,profileVariant=Math.floor(profile/5);
  ctx.save();ctx.globalAlpha=.82;ctx.strokeStyle=venue.palette[2];ctx.fillStyle=venue.palette[0];ctx.lineWidth=5+profileVariant;
  for(const y of [F.y-108,F.y+F.h+108]){
   if(profileFamily===0){for(let i=0;i<18;i++){const x=F.x+i*F.w/18;ctx.fillRect(x,y,profileVariant?9:5,25+profileVariant*4)}}
   else if(profileFamily===1){for(let i=0;i<15;i++){const x=F.x+i*F.w/15;ctx.beginPath();ctx.moveTo(x,y+25);ctx.lineTo(x+F.w/30,y);ctx.lineTo(x+F.w/15,y+25);ctx.stroke()}}
   else if(profileFamily===2){ctx.beginPath();ctx.moveTo(F.x,y+12);for(let i=0;i<=12;i++)ctx.lineTo(F.x+i*F.w/12,y+(i%2?24:0));ctx.stroke()}
   else if(profileFamily===3){for(let i=0;i<12;i++){const x=F.x+i*F.w/12;ctx.beginPath();ctx.arc(x,y+13,11+profileVariant*3,Math.PI,0);ctx.stroke()}}
   else{ctx.beginPath();ctx.moveTo(F.x,y+profileVariant*3);ctx.lineTo(F.x+F.w*.25,y+25);ctx.lineTo(F.x+F.w*.5,y+profileVariant*3);ctx.lineTo(F.x+F.w*.75,y+25);ctx.lineTo(F.x+F.w,y+profileVariant*3);ctx.stroke()}
  }
  ctx.restore();
  // Venue-specific, static ambience: each preset has a distinct geometric crowd-ribbon motif.
  ctx.globalAlpha=.72;ctx.strokeStyle=venue.palette[1];ctx.fillStyle=venue.palette[3];ctx.lineWidth=4;
  for(let i=0;i<8;i++){const x=70+i*(WORLD.w-140)/7,y=(i%2?WORLD.h-98:98);if(venue.ambience===0){ctx.beginPath();ctx.arc(x,y,9+(i%3)*3,0,PI*2);ctx.stroke()}else if(venue.ambience===1){ctx.fillRect(x-7,y-3,14,6);ctx.fillRect(x-3,y-7,6,14)}else if(venue.ambience===2){ctx.beginPath();ctx.moveTo(x-9,y+7);ctx.lineTo(x,y-8);ctx.lineTo(x+9,y+7);ctx.stroke()}else if(venue.ambience===3){ctx.fillRect(x-8,y-6,5,12);ctx.fillRect(x+3,y-6,5,12)}else{ctx.beginPath();ctx.ellipse(x,y,13,5,0,0,PI*2);ctx.stroke()}}
  ctx.restore();
 }
 drawField(ctx,game){
   // Cache expensive wear, grass grain and pitch geometry for slower mobile GPUs.
   const venueId=game.options?.stadium||STADIUMS[0].id;
   const key=game.terrain+'|'+game.condition+'|'+venueId;
   if(!this.fieldCache||this.fieldCacheKey!==key){
     const cache=document.createElement('canvas');
     cache.width=Math.ceil(F.w);cache.height=Math.ceil(F.h);
     const c=cache.getContext('2d',{alpha:false});
     c.translate(-F.x,-F.y);this.drawFieldArtwork(c,game);
     this.fieldCache=cache;this.fieldCacheKey=key;
   }
   ctx.drawImage(this.fieldCache,F.x,F.y);
 }
 drawVenueSurface(ctx,game){
  const venue=STADIUMS.find(v=>v.id===game.options?.stadium)||STADIUMS[0];
  const pattern=venue.surfacePattern??venue.profile??0,family=pattern%5,variant=Math.floor(pattern/5),left=F.x,top=F.y,cx=F.x+F.w/2,cy=F.y+F.h/2;
  ctx.save();ctx.beginPath();ctx.rect(F.x,F.y,F.w,F.h);ctx.clip();ctx.globalAlpha=.13+variant*.018;ctx.strokeStyle=venue.palette[2];ctx.fillStyle=venue.palette[3];ctx.lineWidth=13+variant*5;
  if(family===0){
   const step=150+variant*34,band=step*.44;for(let y=top-step;y<top+F.h+step;y+=step){ctx.fillRect(left,y,F.w,band);if(variant%2)ctx.fillRect(left+F.w*.47,y+band,F.w*.16,band*.52)}
  }else if(family===1){
   const step=155+variant*35;ctx.beginPath();for(let x=left-F.h;x<left+F.w+F.h;x+=step){ctx.moveTo(x,top+F.h);ctx.lineTo(x+F.h,top)}ctx.stroke()
  }else if(family===2){
   for(let r=105+variant*22;r<Math.max(F.w,F.h);r+=130+variant*24){ctx.beginPath();ctx.ellipse(cx,cy,r,r*.62,0,0,Math.PI*2);ctx.stroke()}
  }else if(family===3){
   const step=205+variant*32;for(let x=left-step;x<left+F.w+step;x+=step)for(let y=top-step;y<top+F.h+step;y+=step){const size=62+variant*14;ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size,y);ctx.lineTo(x,y+size);ctx.lineTo(x-size,y);ctx.closePath();ctx.stroke()}
  }else{
   const step=170+variant*30,amp=44+variant*13;for(let y=top-step;y<top+F.h+step;y+=step){ctx.beginPath();ctx.moveTo(left,y);for(let x=0;x<=12;x++){const xx=left+F.w*x/12,yy=y+(x%2?amp:-amp);ctx.lineTo(xx,yy)}ctx.stroke()}
  }
  ctx.restore();
 }
 drawVenueMarkings(ctx,game){
  const venue=STADIUMS.find(v=>v.id===game.options?.stadium)||STADIUMS[0],profile=venue.profile??0,family=profile%5,variant=Math.floor(profile/5),cx=F.x+F.w/2,cy=F.y+F.h/2;
  // These low-contrast motifs are turf decoration; official line coordinates below stay fixed.
  ctx.save();ctx.globalAlpha=.15;ctx.strokeStyle=venue.palette[2];ctx.lineWidth=2+variant*.35;
  if(family===0){for(let i=0;i<8+variant*2;i++){const x=F.x+F.w*(i+1)/(9+variant*2);ctx.beginPath();ctx.moveTo(x,F.y+12);ctx.lineTo(x,F.y+32);ctx.moveTo(x,F.y+F.h-12);ctx.lineTo(x,F.y+F.h-32);ctx.stroke()}}
  else if(family===1){for(const side of [0,1]){const x=side?F.x+F.w-24:F.x+24;for(let i=0;i<5+variant;i++){ctx.beginPath();ctx.arc(x,cy,24+i*9,side?Math.PI/2:Math.PI*1.5,side?Math.PI*1.5:Math.PI/2);ctx.stroke()}}}
  else if(family===2){const r=171+variant*6;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.beginPath();ctx.arc(x,y,5+variant,0,Math.PI*2);ctx.stroke()}}
  else if(family===3){for(let side=0;side<2;side++){const x=side?F.x+F.w-18:F.x+18;for(let i=0;i<4+variant;i++){const y=cy-70+i*36;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(side?-1:1)*(10+variant*3),y+18);ctx.lineTo(x,y+36);ctx.stroke()}}}
  else{for(const side of [0,1]){const x=side?F.x+F.w-22:F.x+22;for(let i=0;i<6+variant;i++){const y=F.y+50+i*(F.h-100)/(5+variant);ctx.beginPath();ctx.arc(x,y,4+variant,0,Math.PI*2);ctx.stroke()}}}
  ctx.restore();
 }
 drawFieldArtwork(ctx,game){const {terrain,condition}=game;let ground=terrain==='Classic'?['#33844a','#3e9955']:terrain==='Grass'?['#357e40','#448e49']:terrain==='Dirt'?['#9e6b42','#ac7650']:['#c7ab68','#d8bc75'];ctx.fillStyle=ground[0];ctx.fillRect(F.x,F.y,F.w,F.h);
 // Broad, restrained mowing passes replace the old high-contrast striping. Their
 // fixed screen-space light follows one upper-left broadcast key light; this is
 // cached with the pitch and never changes field bounds or match geometry.
 ctx.save();ctx.beginPath();ctx.rect(F.x,F.y,F.w,F.h);ctx.clip();
 const passes=18,passW=F.w/passes;
 for(let i=0;i<passes;i++){
   ctx.fillStyle=i%2?'rgba(255,255,255,0.018)':'rgba(0,24,18,0.018)';
   ctx.fillRect(F.x+i*passW,F.y,passW,F.h);
   // A narrow, soft return edge gives each pass a little depth at game scale.
   ctx.fillStyle=i%2?'rgba(0,18,12,0.018)':'rgba(255,255,255,0.018)';
   ctx.fillRect(F.x+i*passW+passW*.94,F.y,Math.max(2,passW*.06),F.h);
 }
 const light=ctx.createLinearGradient(F.x,F.y,F.x+F.w,F.y+F.h);
 light.addColorStop(0,'rgba(255,246,207,0.075)');light.addColorStop(.46,'rgba(255,255,255,0.008)');light.addColorStop(1,'rgba(7,25,22,0.085)');
 ctx.fillStyle=light;ctx.fillRect(F.x,F.y,F.w,F.h);ctx.restore();
 // Four fixed, low-opacity stadium-light pools add field depth without pulsing
 // or obscuring players and markings. This is cached with the static surface.
 ctx.save();ctx.beginPath();ctx.rect(F.x,F.y,F.w,F.h);ctx.clip();
 for(const fx of [.12,.88])for(const fy of [.08,.92]){
  const x=F.x+F.w*fx,y=F.y+F.h*fy,r=360;
  const pool=ctx.createRadialGradient(x,y,12,x,y,r);
  pool.addColorStop(0,'rgba(255,239,197,0.052)');pool.addColorStop(.42,'rgba(255,239,197,0.022)');pool.addColorStop(1,'rgba(255,239,197,0)');
  ctx.fillStyle=pool;ctx.fillRect(F.x,F.y,F.w,F.h);
 }
 ctx.restore();
 this.drawVenueSurface(ctx,game);
 for(let i=0;i<1650;i++){let sx=F.x+((i*7319)%Math.floor(F.w)),sy=F.y+((i*2969)%Math.floor(F.h));ctx.fillStyle=i%3===0?'#e0d49722':'#162d1c14';ctx.fillRect(sx,sy,2+i%3,2+i%5)}
 if(terrain==='Classic'){
   // Tiled-looking irregular ochre field wear inspired by the Famicom ground palette;
   // all patches are generated and editable, not ROM imagery.
   for(let i=0;i<72;i++){
     const x=F.x+30+((i*791)%Math.floor(F.w-60)),y=F.y+30+((i*397)%Math.floor(F.h-60));
     const rx=random(i+20,32,119),ry=random(i+31,20,70),amount=10+i%5;
     ctx.save();ctx.translate(x,y);ctx.rotate(random(i+7,-.45,.45));
     ctx.beginPath();
     for(let j=0;j<=amount;j++){
       const theta=j/amount*Math.PI*2,r=(.72+random(j*23+i,0,.35));
       const xx=Math.cos(theta)*rx*r,yy=Math.sin(theta)*ry*r;
       if(j===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
     }
     ctx.closePath();ctx.fillStyle=i%4===0?'#b9ad6e37':i%4===1?'#d2d88335':'#83ac6a34';ctx.fill();
     ctx.strokeStyle='#d4fca024';ctx.lineWidth=6;ctx.stroke();
     for(let n=0;n<34;n++){
       const tx=(random(i*17+n,-.9,.9))*rx,ty=(random(i*131+n,-.85,.85))*ry;
       ctx.fillStyle=n%3?'#e6b55d55':'#6d7c2c55';ctx.fillRect(tx,ty,n%4+1,n%3+2);
     }
     ctx.restore();
   }
 }
 if(condition!=='Good'||terrain==='Dirt'){for(let i=0;i<27;i++){
   let x=F.x+85+((i*349)%Math.floor(F.w-170)),y=F.y+40+((i*227)%Math.floor(F.h-80));
   const damp=condition==='Wet'||i%3===0,rx=random(i+42,18,70),ry=random(i+48,9,32);
   ctx.fillStyle=damp?(terrain==='Grass'?'#477e4bc7':'#776443b9'):terrain==='Grass'?'#b7924877':'#89593973';ellipse(ctx,x,y,rx,ry,ctx.fillStyle);
   if(damp&&condition==='Wet'){
    ellipse(ctx,x-7,y-5,24,5,'#a5d8ee38');
    // Two broken, static reflection arcs make each puddle read as a shallow
    // water surface at match scale without a moving flash or extra particles.
    ctx.save();ctx.translate(x-7,y-5);ctx.rotate(random(i+52,-.45,.45));
    ctx.strokeStyle=terrain==='Dirt'?'rgba(255,229,189,.22)':terrain==='Sand'?'rgba(255,248,206,.22)':'rgba(218,242,247,.20)';
    ctx.lineWidth=Math.max(1,Math.min(2.2,ry*.09));ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(-rx*.62,-ry*.21);ctx.bezierCurveTo(-rx*.34,-ry*.48,rx*.08,-ry*.46,rx*.40,-ry*.29);
    ctx.moveTo(-rx*.29,ry*.10);ctx.bezierCurveTo(-rx*.04,-ry*.03,rx*.25,-ry*.01,rx*.49,ry*.12);ctx.stroke();ctx.restore();
   }
  }}
  const top=F.y,left=F.x,right=F.x+F.w,bot=F.y+F.h,center=(left+right)/2,cy=(top+bot)/2;this.drawVenueMarkings(ctx,game);ctx.save();const venue=STADIUMS.find(v=>v.id===game.options?.stadium)||STADIUMS[0],markingTone=['#fff3df','#e4f5e8','#def4ff','#eee9ff','#e8f4cf'][(venue.profile??0)%5];
  // A small dark halo keeps chalk legible over every venue's grass, wear and
  // decorative turf pattern while leaving all official line paths unchanged.
  ctx.shadowColor='rgba(8,22,18,.52)';ctx.shadowBlur=2;ctx.shadowOffsetX=0;ctx.shadowOffsetY=1;
  ctx.strokeStyle=terrain==='Dirt'?'#f1e1c5dd':markingTone+'e9';ctx.lineWidth=4;ctx.strokeRect(left+4,top+4,F.w-8,F.h-8);
 line(ctx,[[center,top],[center,bot]],'#f7f6dcdc',4);ctx.beginPath();ctx.arc(center,cy,156,0,PI*2);ctx.stroke();ellipse(ctx,center,cy,5,5,'#f2f8e9');
 for(let side of [0,1]){const x=side?right:left,dir=side?-1:1;ctx.strokeRect(x+(side?-310:4),cy-230,306,460);ctx.strokeRect(x+(side?-110:4),cy-130,106,260);ellipse(ctx,x+dir*205,cy,5,5,'#fff7df');ctx.beginPath();ctx.arc(x+dir*205,cy,117,side?PI/2:-PI/2,side?PI*1.5:PI/2,!side);ctx.stroke();}
 ctx.restore();
 }
 drawGoal(ctx,side,foreground){let x=side?F.x+F.w:F.x,y=WORLD.goalTop,h=WORLD.goalBottom-y,d=WORLD.goalDepth*(side?1:-1);
 if(foreground){line(ctx,[[x,y],[x+d,y+5],[x+d,y+h+3],[x,y+h]],'#f5f8dd',4);line(ctx,[[x,y],[x,y+h]],'#ffffff',6);line(ctx,[[x,y],[x+d,y+5]],'#fafcff',5);line(ctx,[[x,y+h],[x+d,y+h+3]],'#fafcff',5)}else{poly(ctx,[[x,y],[x+d,y+5],[x+d,y+h+3],[x,y+h]],'#e8f2e516','#ededde88');ctx.save();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+d,y+5);ctx.lineTo(x+d,y+h+3);ctx.lineTo(x,y+h);ctx.closePath();ctx.clip();for(let k=0;k<8;k++){let yy=y+k*h/7;line(ctx,[[x-80,yy],[x+d+80,yy]],'#c0f2f28a',1)}for(let k=0;k<12;k++){let xx=x+d*Math.sin(k/10);line(ctx,[[xx,y-20],[xx,y+h+20]],'#c0f2f270',1)}ctx.restore()}
 }
 drawDribbleTrickEffect(ctx,p,viewSide=1){
  const s=dribbleStyle(p.trickStyleId),face=(Number(p.face)||1)<0?-1:1,alpha=clamp((Number(p.trickFx)||0)*1.6,0,1);
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';
  const path=points=>{ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(const [x,y] of points.slice(1))ctx.lineTo(x,y);ctx.stroke();};
  switch(s.id){
   case 'sideStep':
    for(const side of [-1,1]){ctx.beginPath();ctx.arc(face*side*25,-23,17,side<0?Math.PI*.10:Math.PI*.90,side<0?Math.PI*.90:Math.PI*1.90);ctx.stroke();path([[face*side*30,-3],[face*side*43,4],[face*side*51,2]]);}break;
   case 'roulette':
    ctx.beginPath();ctx.ellipse(0,-28,43,30,-.18,0,Math.PI*2);ctx.stroke();
    for(const a of [0,Math.PI*2/3,Math.PI*4/3]){ctx.beginPath();ctx.arc(face*Math.cos(a)*43,-28+Math.sin(a)*30,3.8,0,Math.PI*2);ctx.fill();}break;
   case 'elastico':
    for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(face*side*8,-12);ctx.bezierCurveTo(face*side*46,-47,face*side*48,4,face*side*12,14);ctx.bezierCurveTo(face*side*-8,19,face*side*-15,2,face*side*-24,-3);ctx.stroke();}break;
   case 'rainbow':
    ctx.beginPath();ctx.moveTo(-43,-17);ctx.quadraticCurveTo(-18,-70,0,-64);ctx.quadraticCurveTo(25,-61,44,-17);ctx.stroke();
    ctx.beginPath();ctx.arc(face*7,-66,5,0,Math.PI*2);ctx.fill();break;
   case 'swerve':
    for(const offset of [-12,0,12]){ctx.beginPath();ctx.moveTo(-face*46,-34+offset);ctx.quadraticCurveTo(face*15,-42+offset,-face*12,-12+offset);ctx.quadraticCurveTo(face*34,15,face*52,9+offset);ctx.stroke();}break;
   case 'dragBack':
    ctx.beginPath();ctx.arc(face*18,-23,31,Math.PI*.12,Math.PI*1.60);ctx.stroke();
    path([[-face*18,-48],[-face*35,-38],[-face*16,-31]]);path([[-face*28,0],[-face*46,7],[-face*28,13]]);break;
   case 'heelFlick':
    for(let k=0;k<3;k++){const x=face*(15+k*10),y=11-k*18;path([[x,y],[x+face*9,y-12],[x+face*12,y-27]]);}break;
   case 'stepovers':
    for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(face*side*15,5,13,27,side*.42,Math.PI*.12,Math.PI*1.88);ctx.stroke();}break;
   case 'nutmeg':
    path([[-face*33,7],[-face*11,13],[0,13],[face*11,13],[face*33,7]]);
    path([[-face*8,22],[0,31],[face*8,22]]);ctx.beginPath();ctx.arc(0,13,4,0,Math.PI*2);ctx.fill();break;
   case 'lightningCut':
    path([[-face*45,-27],[-face*14,-27],[-face*27,0],[face*7,0],[face*21,22]]);
    path([[face*35,-39],[face*23,-27],[face*34,-18]]);break;
   default:
    ctx.beginPath();ctx.arc(-face*25,-26,14,.1,Math.PI*1.35);ctx.stroke();
  }
  ctx.save();ctx.scale(Number(viewSide)<0?-1:1,1);ctx.fillStyle=s.color;ctx.textAlign='center';ctx.font='900 16px Arial';ctx.fillText(s.name.toUpperCase(),0,-158);ctx.restore();ctx.restore();
 }
 drawPlayer(ctx,p,game){
  const team=game.getTeam(p.t);if(!team||!p.src)return;
  const moving=Math.hypot(p.action==='slide'?(p.slideDX||0):(p.dx||0),p.action==='slide'?(p.slideDY||0):(p.dy||0))>.2;
  // Slide pose follows its committed tackle vector, not stale movement input.
   let faceDX=p.action==='slide'?(p.slideDX||0):(p.dx||0),faceDY=p.action==='slide'?(p.slideDY||0):(p.dy||0),turnLag=0;
  // Live match characters ease their visual heading; preview snapshots remain deterministic.
  if(this.inMatchDraw&&moving&&!p.preview&&p.action!=='slide'){
   const target=Math.atan2(faceDY,faceDX),previous=this.poseHeadings.get(p);
   const pose=ARTPOSE.easeHeading(previous,target,this.frameDelta||1/60);
   this.poseHeadings.set(p,pose.heading);faceDX=Math.cos(pose.heading);faceDY=Math.sin(pose.heading);turnLag=pose.lag;
  }
  // Committed tackles snap to their heading; walking still eases through turns.
  if(this.inMatchDraw&&p.action==='slide'&&!p.preview&&moving)this.poseHeadings.set(p,Math.atan2(faceDY,faceDX));
  const view=moving?(this.inMatchDraw&&!p.preview&&p.action!=='slide'?VISUALFEEL.stableFacingView(faceDX,faceDY,p.face||1,p.visualFacing):VISUALFEEL.facingView(faceDX,faceDY,p.face||1)):(p.visualFacing||VISUALFEEL.facingView(0,0,p.face||1));if(moving)p.visualFacing=view;
  const personality=profileFor(p.src);
  const signatureMotion=personality?sampleMotion(personality,{time:this.time,anim:p.anim,action:p.action,moving}):null;
  const runPhase=ARTPOSE.runPhase(p.anim,signatureMotion?.runRate,p.i);
  const runSpeedRatio=clamp(Math.hypot(p.moveVX||0,p.moveVY||0)/315||Math.hypot(p.dx||0,p.dy||0),0,1);
  const oscillator=Math.sin(runPhase);
  // Only real-time match players are smoothed; gallery/studio renders remain deterministic.
  const shotLaunchPose=ARTPOSE.shotImpactLaunchPose(p.action,p.actionTimer,p.face);
  const maceSweepPhase=p.action==='defenceSuper'&&p.maceSweepPending
   ?clamp(1-(Number(p.maceSweepPending.remaining)||0)/.24,0,1):undefined;
  const spinBumperPhase=p.action==='defenceSuper'&&p.spinBumperPending
   ?clamp(1-(Number(p.spinBumperPending.remaining)||0)/.42,0,1):undefined;
  const spinBumperImpactPhase=!p.spinBumperPending&&(Number(p.spinBumperImpactFx)||0)>0
   ?clamp(1-(Number(p.spinBumperImpactFx)||0)/.28,0,1):undefined;
  const knockdownTimer=Math.max(0,Number(p.shotImpactKnockdownTimer)||0);
  const knockdownPose=p.action==='shotDown'&&knockdownTimer>0?1:0;
  const impactRecovery=ARTPOSE.shotImpactRecoveryPose(p.action,p.actionTimer,p.face);
  const gaitMoving=moving&&knockdownTimer<=0&&p.action!=='slide'&&p.action!=='receive'&&p.action!=='pass'&&p.action!=='hurt'&&p.action!=='cry'&&!(p.stun>.2)&&!((p.cryTimer||0)>.05)&&!['keeperDive','keeperDiveCatch','keeperRecover','keeperCatch','keeperThrow','keeperPunt','kick','super','header','superHead','flipKick','comboSuper','bicycle','superBicycle','flyingKick','defensiveBicycle'].includes(p.action);
  const run=this.inMatchDraw&&!p.preview?ARTPOSE.settleStride(this.poseCycles.get(p),oscillator,gaitMoving,this.frameDelta):gaitMoving?oscillator:0;
  const locomotion=gaitMoving&&(Number(p.z)||0)<=15&&!['jump','hyperdash','dribbleTrick','ballLift','assistBoost','comboJump','rideBallCarrier','rideBallPassenger'].includes(p.action);
  if(this.inMatchDraw&&!p.preview)this.poseCycles.set(p,run);
  const av={...avatarFor(p.src),...(p.src.appearance||{})};
  const variant=av.style%13;
  const kick=['kick','super','celebrate','defenceSuper','keeperSuper','header','hyperdash','keeperDive','keeperDiveCatch','keeperCatch','keeperThrow','keeperPunt','comboJump','assistBoost','flipKick','comboSuper','comboLand','bicycle','ballLift','superBicycle','superHead','flyingKick','defensiveBicycle','dribbleTrick'].includes(p.action);
  const isHurt=p.action==='hurt'||p.stun>.2||knockdownTimer>0;const isCrying=p.action==='cry'||(p.cryTimer||0)>.05;
  const sliding=p.action==='slide';
  const skin=av.skin, dark='#222033', hair=av.hair;
  const stature=[.9,.96,1,1.07,1.14][(av.stature??2)%5];
  const build=[.88,.96,1.03,1.11,1.18][(av.body??2)%5];
  const headScale=[1,.96,1.12][(av.exaggeration??1)%3];
  const lips=av.lips??av.mouth??0;
  ctx.save();ctx.translate(p.x,p.y);if(p.action==='celebrate'){const style=(Number.isInteger(game.celebrationStyle)?game.celebrationStyle:0)%5;ctx.translate(Math.sin(this.time*(8+style)+p.i*1.5)*(10+style*2),-Math.abs(Math.sin(this.time*(6+style)+p.i))*(10+style*2));ctx.rotate(Math.sin(this.time*(5+style)+p.i*2)*(.11+style*.025))}if(p.action==='cry'){ctx.rotate(Math.sin(this.time*11+p.i)*.08);ctx.translate(0,Math.abs(Math.sin(this.time*8+p.i))*5)}
  // A player rising off the turf leaves a softer, wider contact shadow while
  // the body is lifted. Keep the grounded footprint identical at z=0; this is
  // presentation-only and never feeds back into player position or physics.
  const lift=clamp((Math.max(0,Number(p.z)||0)+Math.max(0,Number(p.rideVisualZ)||0))/240,0,1);
  ctx.save();ctx.globalAlpha=1-lift*.46;
  ellipse(ctx,0,3,29+lift*16,10+lift*3,'#071d2a78');ctx.restore();
   if(!p.preview&&(p.spinBumpFx||0)>0)this.drawSpinBump(ctx,p.spinBumpFx,!!game.options?.reducedFlash);
   if(!p.preview&&p.spinBumperPending){
    const reduced=!!game.options?.reducedFlash,remaining=Math.max(0,Math.min(1,p.spinBumperPending.remaining/.42)),progress=1-remaining;
    ctx.save();ctx.globalAlpha=reduced ? .72 : .66;ctx.strokeStyle='#f8b8ff';ctx.fillStyle='#fff0ff';ctx.lineWidth=3;
    ctx.setLineDash(reduced?[]:[7,5]);ctx.beginPath();ctx.arc(0,3,116,0,PI*2);ctx.stroke();ctx.setLineDash([]);
    // A gold arc communicates the existing .42-second tell without adding a
    // flash; reduced-flash keeps the progress cue but freezes its orbit.
    ctx.globalAlpha=reduced?.94:.90;ctx.strokeStyle='#ffe27a';ctx.lineWidth=6;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(0,3,124,-PI/2,-PI/2+progress*PI*2);ctx.stroke();ctx.lineCap='butt';
    const spin=reduced?0:progress*PI*2;
    for(let i=0;i<4;i++){const a=spin+i*PI/2,inner=92+16*remaining;ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,3+Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*116,3+Math.sin(a)*116);ctx.stroke();}
    for(let i=0;i<2;i++){const a=spin+i*PI,px=Math.cos(a)*116,py=3+Math.sin(a)*116;ctx.beginPath();ctx.arc(px,py,3.2,0,PI*2);ctx.fill();}
    ctx.font='900 13px Arial';ctx.textAlign='center';ctx.fillText('SPIN · JUMP OR DASH',0,-136);ctx.restore();
   }
   if(!p.preview&&p.maceSweepPending){
    const reduced=!!game.options?.reducedFlash,remaining=Math.max(0,Math.min(1,p.maceSweepPending.remaining/.24));
    const side=(p.face||1)>0?1:-1,start=side>0?-.68:Math.PI-.68,end=side>0?.68:Math.PI+.68;
    ctx.save();ctx.globalAlpha=.78;ctx.strokeStyle='#ffbd52';ctx.fillStyle='#ffe3a3';ctx.lineWidth=4;
    ctx.setLineDash(reduced?[]:[8,5]);ctx.beginPath();ctx.arc(0,3,148,start,end);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(0,3);ctx.lineTo(Math.cos(start)*148,3+Math.sin(start)*148);
    ctx.moveTo(0,3);ctx.lineTo(Math.cos(end)*148,3+Math.sin(end)*148);ctx.stroke();
    const pulse=reduced?0:(1-remaining)*.12;ctx.beginPath();ctx.arc(0,3,22+pulse*100,0,PI*2);ctx.stroke();
    ctx.font='900 13px Arial';ctx.textAlign='center';ctx.fillText('MACE · JUMP / SLIDE',0,-153);ctx.restore();
   }
   if(!p.preview&&(p.maceSweepImpactFx||0)>0){const impact=Math.max(0,Math.min(1,p.maceSweepImpactFx/.24));ctx.save();ctx.globalAlpha=.62*impact;ctx.strokeStyle='#ffbd52';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,3,52+(1-impact)*78,0,PI*2);ctx.stroke();ctx.restore();}
  // VIZ-06: subtle turf-contact animation, visual-only and bounded.
  if(this.inMatchDraw&&moving&&!p.preview&&!p.keeper&&runSpeedRatio>.12){
   const contact=runFootContactPulse(runPhase);
   if(contact>.05){
    ctx.save();ctx.globalAlpha=contact*.34*runSpeedRatio;
    ctx.fillStyle=game.terrain==='Dirt'?'#ebc892':'#c9fca3';
    const back=(p.dx||p.face||1)<0?1:-1;
    ctx.beginPath();ctx.ellipse(back*26,4,7,2.5,0,0,PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(back*34,5,3,1.5,0,0,PI*2);ctx.fill();ctx.restore();
   }
  }
   if(p.controlled){ctx.save();const bob=Math.sin(this.time*6)*3;ctx.translate(0,-115-(p.z||0)-(p.rideVisualZ||0)+bob);ctx.shadowColor=p.t===0?'#ffe48b':'#8be7ff';ctx.shadowBlur=14;ctx.fillStyle=p.t===0?'#ffdb66':'#78e8ff';ctx.beginPath();ctx.moveTo(0,11);ctx.lineTo(-11,-7);ctx.lineTo(11,-7);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#092855';ctx.lineWidth=3;ctx.stroke();ctx.restore();}
  // Turf spray trails behind the sliding boot; visual-only.
   if(sliding&&this.inMatchDraw&&!p.preview&&p.slideTimer>0){
    const progress=clamp(1-(p.slideRemaining||0)/Math.max(1,p.slideBudget||104),0,1);
    ctx.save();ctx.globalAlpha=.16+.36*Math.sin(Math.PI*progress);
    ctx.fillStyle=game.terrain==='Dirt'?'#dfbc83':'#b5e38b';
    const dx=p.slideDX||p.face||1,dy=p.slideDY||0;
    for(let k=0;k<4;k++){const spread=(k-1.5)*7;ctx.beginPath();ctx.ellipse(-dx*(17+k*11)-dy*spread,4-dy*(17+k*11)+dx*spread,5+k*1.4,2+k*.5,0,0,PI*2);ctx.fill();}
    ctx.restore();
    if(game.condition==='Wet')drawWetSlideSpray(ctx,dx,dy,!!game.options?.reducedFlash);
   }
   // Directional speed lines, purely visual; no effect on collision, speed or stamina.
  if(moving&&['hyperdash','dribbleTrick'].includes(p.action)){ctx.save();ctx.globalAlpha=.32;ctx.strokeStyle=p.t===0?'#ffe79a':'#8df7ff';ctx.lineWidth=3;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(-p.face*35,p.z?(-p.z+k*11):k*11);ctx.lineTo(-p.face*(62+8*Math.sin(this.time*14+k)),k*11-3);ctx.stroke()}ctx.restore();}
  if((p.firstTouchFx||0)>0){ctx.save();ctx.globalAlpha=clamp(p.firstTouchFx/.35,0,1)*.75;
   ctx.strokeStyle=p.t===0?'#fff4a4':'#a8f2ff';ctx.lineWidth=3;
   ctx.beginPath();ctx.ellipse(0,5,29+(1-p.firstTouchFx/.35)*15,12+(1-p.firstTouchFx/.35)*5,0,0,PI*2);ctx.stroke();ctx.restore();}
  if(shouldShowBreathRing(p,game,this.inMatchDraw)){ctx.strokeStyle=p.t===0?'#ffe675':'#74f2ff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,5,28,12,0,0,PI*2);ctx.stroke();ellipse(ctx,0,5,21,6,'#061d2855')}
  // Circular Breath gauge at the feet. Draw only in live matches, not editor previews.
  if(shouldShowBreathRing(p,game,this.inMatchDraw)){
   const stamina=STATS.stat(p,'stamina');
   const cap=3+7*(stamina-1)/99;
   const ratio=clamp((Number.isFinite(p.breath)?p.breath:cap)/cap,0,1);
   ctx.save();ctx.beginPath();ctx.ellipse(0,4,34,15,0,0,Math.PI*2);
   ctx.strokeStyle='#071827c2';ctx.lineWidth=5;ctx.stroke();
   ctx.beginPath();ctx.ellipse(0,4,34,15,0,-Math.PI/2,-Math.PI/2+Math.PI*2*ratio);
   ctx.strokeStyle=ratio<.2?'#ff786a':ratio<.5?'#ffcd66':'#66efcd';ctx.lineWidth=4;ctx.stroke();
   // Selected-player-only low-Breath warning; pulse the existing ring, never add a second HUD bar.
   if(ratio<.2){ctx.save();ctx.globalAlpha=game.options?.reducedFlash?.42:.35+.45*(.5+.5*Math.sin(this.time*10));ctx.strokeStyle='#ff786a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,4,39,19,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
   ctx.restore();
  }
  ctx.translate(0,-(p.z||0)-(p.rideVisualZ||0)-Math.abs(run)*2+(1-stature)*12);
  if(signatureMotion){ctx.translate(signatureMotion.offsetX,signatureMotion.offsetY);ctx.rotate(signatureMotion.lean);}
  if(turnLag)ctx.rotate(Math.max(-.095,Math.min(.095,turnLag*.12))); // brief counter-lean during turns
  const characterScaleX=(.77+((av.face%5)*.011))*build,characterScaleY=(.78+((av.style%3)*.018))*stature;
  ctx.scale(characterScaleX,characterScaleY);ctx.scale(view.side,1);
  // Keep a quiet breathing read while the shot reaction is grounded. This is
  // strictly a local draw transform: the shot-impact timer and player physics
  // remain the sole source of knockdown/recovery timing.
  const reducedFlash=!!game.options?.reducedFlash;
  const downedBreath=knockdownPose*Math.sin(knockdownTimer*6.4)*(reducedFlash?.5:1);
  if(knockdownPose>0){ctx.translate(0,-.8*downedBreath);ctx.scale(1,1+.012*downedBreath);}
  // Keep the grounded pose stable for the full engine timer. The dedicated
  // get-up phase then plants the arms, unrolls the torso, and lifts to standing.
  if(knockdownPose>0)ctx.rotate((p.face||1)*1.32*knockdownPose);
  else if(p.action==='shotGetUp'){
   ctx.translate(0,-impactRecovery.lift);
   ctx.rotate(impactRecovery.angle);
  }
  else if(shotLaunchPose.armSpread>0)ctx.rotate(shotLaunchPose.angle);
  // The existing impact timer drives a short, mirrored Spin Bumper follow-through
  // on every character painter; this local lean is visual-only and never feeds
  // position or collision state back into the engine.
  if(spinBumperImpactPhase!==undefined){
   const phase=spinBumperImpactPhase,settled=phase*phase*(3-2*phase),drive=1-settled;
   ctx.translate(3*drive,1.5*drive);ctx.rotate(.11*drive);
  }
  if(p.action==='rideBallCarrier'){ctx.translate(0,3);ctx.rotate(-.07*(p.face||1));}
  if(p.action==='rideBallPassenger'){ctx.translate(0,-4);ctx.rotate(.045*(p.face||1));}
  if(isHurt&&(p.stun||0)>1.15){ctx.translate(0,12);ctx.rotate(-.55*view.side);}
  if(sliding){const remaining=clamp((p.slideRemaining||0)/Math.max(1,p.slideBudget||104),0,1);
    // Drop into a committed tackle, extend low, then recover upright.
    const entry=clamp((1-remaining)/.22,0,1);
    const recovery=p.slideTimer>0?1:clamp((p.actionTimer||0)/.18,0,1);
    const pose=(.42+.58*entry)*recovery;
    ctx.translate(8*pose,15*pose);ctx.rotate(-.62*pose);
   }
  if(p.action==='pass'){
   // Direction mirroring is already applied by ctx.scale(view.side,1).
   ctx.rotate(ARTPOSE.passFollowThrough(p.action,p.actionTimer).lean);
  }
  if(p.action==='receive'){
   const reception=ARTPOSE.receivePose(p.actionTimer,p.firstTouchPressure||0);
   ctx.translate(0,reception.crouch);ctx.rotate((p.face||1)*reception.lean);
  }
  if(p.keeper&&['keeperDive','keeperDiveCatch','keeperRecover'].includes(p.action)){
   const pose=ARTPOSE.keeperPose(p.action,p.diveElapsed,p.actionTimer,p.diveDy,p.face);
   ctx.translate(pose.x,pose.y);ctx.rotate(pose.angle);
  }if(p.action==='ballLift')ctx.translate(0,-8);if(p.action==='superHead')ctx.translate(0,-18);if(p.action==='superBicycle')ctx.rotate(-p.face*.90);if(p.action==='bicycle')ctx.rotate(-p.face*.64);if(p.action==='flyingKick')ctx.rotate(-p.face*.28);if(p.action==='defensiveBicycle')ctx.rotate(-p.face*.76);
  if(kick)ctx.rotate(-.045);
  // v0.8.25.15: articulated five-projection character rendering.
 if(!CROWN_ROYALS.draw(ctx,p,view,{run,action:p.action,phase:(kick||sliding)?Math.max(.3,Math.min(1,(p.actionTimer||0)/.3)):0})&&!CONCEPT_MODULAR.draw(ctx,p,view,{run,headScale})&&!CONCEPT_HERO.draw(ctx,p,view,{run,headScale}))CHARACTER_ART.draw(ctx,p,av,team,view,{run,runPhase,runSpeedRatio,footScaleX:characterScaleX,footScaleY:characterScaleY,locomotion,isHurt,isCrying,kick,sliding,skin,dark,hair,build,stature,headScale,lips,time:this.time,signatureMotion,shotLaunchPose,turnLag,reducedFlash:!!game.options?.reducedFlash,celebrate:p.action==='celebrate',celebrationStyle:(game.celebrationStyle+(Number.isInteger(p.i)?p.i:0))%25,defenceSweepPhase:maceSweepPhase,defenceSweepDirection:view.side<0?-1:1,spinBumperPhase,hurt:isHurt,cry:isCrying,spinBumperImpactPhase});
 if(!p.preview&&(p.fireballBurnFx||0)>0){const alpha=clamp(p.fireballBurnFx/.48,0,1)*.72;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#ff9b46';ctx.fillStyle='#ffd16a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-67,31,48,0,0,PI*2);ctx.stroke();for(const x of [-19,0,19]){ctx.beginPath();ctx.moveTo(x,-107);ctx.quadraticCurveTo(x-7,-121,x,-128);ctx.quadraticCurveTo(x+8,-119,x,-107);ctx.fill();}ctx.restore();}
 if(p.action==='hyperdash'){ctx.save();ctx.globalAlpha=.72;ctx.lineWidth=7;ctx.strokeStyle='#a0f0ff';for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(-p.face*(38+k*22),-22-k*16);ctx.lineTo(-p.face*(72+k*21),-20-k*17);ctx.stroke()}ctx.restore()}
 if(p.action==='header'&&!p.preview){ctx.save();ctx.textAlign='center';ctx.fillStyle='#fff4a1';ctx.font='900 24px sans-serif';ctx.fillText('HEAD!',0,-139);ctx.restore()}
 if(!p.preview&&(p.action==='comboJump'||p.action==='assistBoost')){ctx.save();ctx.textAlign='center';ctx.font='900 22px Arial';ctx.fillStyle='#fff2a6';ctx.fillText(p.action==='assistBoost'?'BOOST!':'TEAM JUMP!',0,-146);ctx.lineWidth=4;ctx.strokeStyle='#ffdf84';ctx.beginPath();ctx.arc(0,-68,48,0,PI*2);ctx.stroke();ctx.restore();}
 if(!p.preview&&p.comboActive&&p.comboWindow>0&&p.z>=145&&Math.abs(p.vz)<=260){ctx.save();ctx.textAlign='center';ctx.font='900 20px Arial';ctx.fillStyle='#e8ff83';ctx.strokeStyle='#163527';ctx.lineWidth=5;ctx.strokeText('✦ APEX — SUPER!',0,-170);ctx.fillText('✦ APEX — SUPER!',0,-170);ctx.restore();}
 if(!p.preview&&(p.action==='flipKick'||p.action==='comboSuper')){ctx.save();ctx.textAlign='center';ctx.font='900 25px Arial';ctx.fillStyle=p.action==='comboSuper'?'#fef47a':'#e3c8ff';ctx.fillText(p.action==='comboSuper'?'COMBO SUPER!':'FLIP KICK!',0,-145);ctx.restore();}
 if(!p.preview&&p.action==='rideBallCarrier'){ctx.save();ctx.textAlign='center';ctx.font='900 18px Arial';ctx.lineWidth=4;ctx.strokeStyle='#34210b';ctx.fillStyle='#ffe888';ctx.strokeText('SHOULDER RIDE!',0,-174);ctx.fillText('SHOULDER RIDE!',0,-174);ctx.restore();}
 if(!p.preview&&p.action==='dribbleTrick'&&p.trickFx>0)this.drawDribbleTrickEffect(ctx,p,view.side);
 if(!p.preview&&['bicycle','ballLift','superBicycle','superHead','flyingKick','defensiveBicycle','dribbleTrick'].includes(p.action)){ctx.save();ctx.font='900 20px Arial';ctx.textAlign='center';ctx.fillStyle=p.action==='bicycle'?'#e8b8ff':['flyingKick','defensiveBicycle'].includes(p.action)?'#ffe3a8':'#9ff4dc';ctx.fillText(p.action==='ballLift'?'BALL LIFT!':p.action==='superHead'?'SUPER HEADER!':p.action==='superBicycle'?'SUPER BICYCLE!':p.action==='bicycle'?'BICYCLE!':p.action==='flyingKick'?'FLYING KICK!':p.action==='defensiveBicycle'?'AIR SPIN!':'✦',0,-144);ctx.restore();}
 if(p.action==='comboLand'){ctx.save();ctx.strokeStyle='#f5ce5f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,3,62,0,PI*2);ctx.stroke();ctx.restore();}
 if(['keeperDive','keeperDiveCatch'].includes(p.action)){
    // Motion streaks, extended gloves, and a directional reach, rather than
    // the previous fixed blue ring for every goalkeeper save.
    const t=Math.min(1,(p.diveElapsed||0)/.60);
    ctx.save();ctx.globalAlpha=Math.max(.15,.85-t*.55);
    ctx.lineCap='round';ctx.strokeStyle='#c7f5ff';ctx.lineWidth=6;
    const sign=Math.sign(p.diveDy||1);
    for(let n=0;n<3;n++){ctx.beginPath();ctx.moveTo(-55-n*12,-28+sign*n*7);ctx.lineTo(-28-n*7,-46+sign*22);ctx.stroke();}
    ctx.fillStyle='#e6ffff';ellipse(ctx,-32,-78+sign*13,12,9,'#e6ffff');ellipse(ctx,32,-78+sign*13,12,9,'#e6ffff');
    ctx.restore();
  }
 if(!p.preview&&p.keeper&&p.action==='keeperDiveCatch'&&game.ball?.owner===p){
  // Small contact flash at the keeper gloves, only for a genuine catch.
  const phase=clamp((p.diveElapsed||0)/.60,0,1);
  ctx.save();ctx.globalAlpha=(1-phase)*.75;ctx.strokeStyle='#e9fff0';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(0,-73,9+10*phase,0,PI*2);ctx.stroke();ctx.restore();
 }
 if(p.action==='keeperRecover'){
  // Fading ground-contact ripple makes the landing legible at reduced scale.
  const remaining=Math.min(1,Math.max(0,(p.actionTimer||0)/.34));
  ctx.save();ctx.globalAlpha=.38*remaining;ctx.strokeStyle='#a7d9f1';ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(0,0,27+21*(1-remaining),9+9*(1-remaining),0,0,PI*2);ctx.stroke();
  ctx.restore();
 }
 if(!p.preview&&['keeperCatch','keeperDiveCatch','keeperHold','keeperThrow','keeperPunt'].includes(p.action)){
  ctx.save();ctx.textAlign='center';ctx.font='900 19px Arial';ctx.fillStyle=['keeperCatch','keeperDiveCatch'].includes(p.action)?'#beffec':'#ffe6a1';
  ctx.fillText(['keeperCatch','keeperDiveCatch'].includes(p.action)?'CAUGHT!':p.action==='keeperHold'?'HOLDING':p.action==='keeperThrow'?'THROW!':'PUNT!',0,-151);
  if(['keeperCatch','keeperDiveCatch','keeperHold'].includes(p.action)){ctx.strokeStyle='#adfff0';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-55,40,0,PI*2);ctx.stroke();}
  ctx.restore();
 }
  if(!p.preview&&(p.abilityFx||0)>0&&!p.spinBumperPending&&(p.spinBumperImpactFx||0)<=0){const glow=p.action==='keeperSuper'?'#91ecff':'#ffde82';ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle=glow;ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,-45,45+i*22+(1-p.abilityFx)*55,0,PI*2);ctx.stroke()}ctx.font='900 20px sans-serif';ctx.fillStyle=glow;ctx.textAlign='center';ctx.fillText(p.action==='keeperSuper'?'★ SAVE!':'★ POWER!',0,-143);ctx.restore()}
  if(!p.preview&&(p.spinBumperImpactFx||0)>0){const impact=Math.max(0,Math.min(1,p.spinBumperImpactFx/.28));ctx.save();ctx.globalAlpha=.58*impact;ctx.strokeStyle='#f8b8ff';ctx.lineWidth=4;for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(0,3,36+i*24+(1-impact)*35,0,PI*2);ctx.stroke()}ctx.restore();}
  if(p.action==='super'){ctx.globalAlpha=.7;ctx.strokeStyle=team.secondary;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-74,47+Math.sin(this.time*20)*5,0,PI*2);ctx.stroke();ctx.globalAlpha=1}
  if(game.options.showNames&&p.controlled){ctx.save();ctx.scale(p.face||1,1);rr(ctx,-41,-127,82,17,8,'#0a233deb','#b4eff5a8');ctx.fillStyle='#fff6bb';ctx.textAlign='center';ctx.font='900 11px Arial';ctx.fillText(p.src.name.toUpperCase().slice(0,12),0,-114);ctx.restore()}
  if(!p.preview&&(p.sandTrapFx||0)>0)this.drawSandTrap(ctx,p.sandTrapFx,!!game.options?.reducedFlash);
  if(!p.preview&&(p.lightningMark||0)>0)this.drawLightningTrick(ctx,p.lightningMark,'warning',!!game.options?.reducedFlash);
  if(!p.preview&&(p.lightningFx||0)>0)this.drawLightningTrick(ctx,p.lightningFx,'strike',!!game.options?.reducedFlash);
  if(!p.preview&&(p.windTrickFx||0)>0)this.drawFieldTrick(ctx,'wind',p.windTrickFx,!!game.options?.reducedFlash);
  if(!p.preview&&(p.mudTrickFx||0)>0)this.drawFieldTrick(ctx,'mud',p.mudTrickFx,!!game.options?.reducedFlash);
  if(!p.preview&&p.shotImpactConfusedTimer>0)drawShotImpactCue(ctx,p,this.time,!!game.options?.reducedFlash);
  if(!p.preview&&!(p.shotImpactConfusedTimer>0))drawShotWeaknessCue(ctx,p,!!game.options?.reducedFlash);
  ctx.restore();
 }
 drawPenaltyPlayers(ctx,g){let pk=g.pk;if(!pk)return;
  const cy=(WORLD.goalTop+WORLD.goalBottom)/2,at=Number.isInteger(pk.inMatchTeam)?pk.inMatchTeam:pk.turn%2,keeper=1-at;
  const direction=pk.attackSign===-1?-1:1,goalX=Number.isFinite(pk.goalX)?pk.goalX:F.x+F.w;
  const takerIndex=g.teamPlans?.[at]?.penalty??4;
  let kicker=g.player(at,takerIndex),guard=g.player(keeper,0);if(!kicker||!guard)return;
  this.drawPlayer(ctx,{...kicker,x:(pk.shotTimer>0?pk.startX:pk.ballX)-direction*72,y:(pk.shotTimer>0?pk.startY:pk.ballY)+23,face:direction,controlled:false,anim:this.time},g);
  this.drawPlayer(ctx,{...guard,...ARTPOSE.penaltyKeeperVisual(pk,cy),x:goalX-direction*30,y:pk.saveY+22,face:-direction,dx:0,dy:0,visualFacing:{kind:'side',side:-direction},keeper:true,controlled:false,anim:this.time},g);
  if(pk.shotTimer<=0){ellipse(ctx,goalX-direction*12,pk.aim,9,9,'#fff49a');ctx.strokeStyle='#ffd962';ctx.lineWidth=2;ctx.beginPath();ctx.arc(goalX-direction*12,pk.aim,17,0,PI*2);ctx.stroke()}
  const z=pk.shotTimer>0?Math.sin((1-pk.shotTimer/pk.shotMax)*PI)*55:0;
  this.drawSoccerBall(ctx,pk.ballX,pk.ballY-z,17,g.options?.ballModel||'classic',pk.shotTimer>0?(1-pk.shotTimer/pk.shotMax)*9:0);
 }
 drawHideBallCue(ctx,p,game){
  if(!p)return;const concealed=game.ball?.owner===p&&(p.hideBallTimer||0)>0,revealing=!concealed&&(p.hideBallReveal||0)>0;if(!concealed&&!revealing)return;
  const kit=game.getTeam?.(p.t),reduced=!!game.options?.reducedFlash,ratio=concealed?clamp(p.hideBallTimer/.65,0,1):clamp(p.hideBallReveal/.18,0,1);
  ctx.save();ctx.globalAlpha=concealed?.76:.5*ratio;ctx.strokeStyle=kit?.secondary||'#c4fff3';ctx.lineWidth=reduced?2.5:3;ctx.setLineDash(concealed?(reduced?[3,4]:[7,5]):[]);
  ctx.beginPath();ctx.ellipse(p.x,p.y+13,27,10,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  if(concealed){ctx.globalAlpha=reduced?.62:.78;ctx.beginPath();ctx.arc(p.x,p.y-12,13,-Math.PI/2,-Math.PI/2+(1-ratio)*Math.PI*2);ctx.stroke();
   for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(p.x+side*21,p.y-1);ctx.lineTo(p.x+side*27,p.y-5);ctx.lineTo(p.x+side*31,p.y+1);ctx.stroke();}
  }else{ctx.beginPath();ctx.ellipse(p.x,p.y+13,32,13,0,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
 }
  drawTeleportTrail(ctx,trail,reducedFlash=false){
   if(!trail||![trail.fromX,trail.fromY,trail.toX,trail.toY,trail.remaining,trail.duration].every(Number.isFinite)||trail.duration<=0||trail.remaining<=0)return false;
   const dx=trail.toX-trail.fromX,dy=trail.toY-trail.fromY,length=Math.hypot(dx,dy);
   if(length<1||length>120)return false;
   const progress=clamp(1-trail.remaining/trail.duration,0,1);
   ctx.save();ctx.globalAlpha=reducedFlash ? .48 : clamp(trail.remaining/trail.duration,0,1)*.76;ctx.strokeStyle='#c5a3ff';ctx.fillStyle='#f4e9ff';ctx.lineWidth=4;ctx.setLineDash(reducedFlash?[]:[9,7]);ctx.lineDashOffset=reducedFlash?0:-progress*16;
   ctx.beginPath();ctx.moveTo(trail.fromX,trail.fromY);ctx.lineTo(trail.toX,trail.toY);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0;
   for(const [x,y] of [[trail.fromX,trail.fromY],[trail.toX,trail.toY]]){ctx.beginPath();ctx.arc(x,y,reducedFlash?12:10+3*Math.sin(progress*Math.PI),0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();}
   const marker=reducedFlash ? .5 : progress,mx=trail.fromX+dx*marker,my=trail.fromY+dy*marker;ctx.beginPath();ctx.moveTo(mx,my-5);ctx.lineTo(mx+5,my);ctx.lineTo(mx,my+5);ctx.lineTo(mx-5,my);ctx.closePath();ctx.fill();ctx.restore();return true;
  }
 drawBallShadow(ctx,x,y,z,opacity=1){
  // A lofted ball leaves a tighter, softer ground footprint. Preserve the
  // existing contact shadow at z=0 and let height affect presentation only.
  const height=clamp((Number(z)||0)/240,0,1);
  ctx.save();ctx.globalAlpha=clamp(Number(opacity)||0,0,1)*(1-height*.42);
  ellipse(ctx,x,y+4,Math.max(5.5,15-height*9.5),Math.max(2.4,7-height*4.6),'#14301e66');ctx.restore();
 }
 drawBall(ctx,game){let b=game.ball;if(!b)return;const shot=b.shot,underground=!!(shot?.underground&&['silverCarp','dolphin','wave'].includes(shot.id));const grip=b.owner?.keeper?ARTPOSE.keeperGrip(b.owner.action,b.owner.face):null,ballX=grip?b.owner.x+grip.x:b.x,ballY=grip?b.owner.y+grip.y-b.z:b.y-b.z;const concealed=!!(b.owner&&!b.shot&&(b.owner.hideBallTimer||0)>0),reducedFlash=!!game.options?.reducedFlash;ctx.save();if(!grip)this.drawBallShadow(ctx,b.x,b.y,b.z,underground?.2:concealed?(reducedFlash?.13:.09):1);ctx.globalAlpha=concealed?(reducedFlash?.17:.10):1;
 // Ordinary high-speed strikes use a compact, tapered path wake. This is a
 // renderer-only cue and never feeds back into ball motion or collisions.
 if(!shot&&!b.owner)drawOrdinaryBallWake(ctx,b,reducedFlash);
 if(b.trail){for(let i=0;i<b.trail.length;i++){let p=b.trail[i],alpha=(i+1)/b.trail.length*.5;ctx.globalAlpha=underground?alpha*.25:alpha;if(shot){ellipse(ctx,p.x,p.y-p.z,underground?2+i*.12:4+i*.55,underground?1.5+i*.1:3+i*.43,underground?'#68dbe0':shot.trail)}else{ellipse(ctx,p.x,p.y-p.z,2+i*.25,2+i*.25,'#fdf5da')}}}ctx.globalAlpha=1;
 if(shot?.behavior==='spiral')drawSpiralRibbon(ctx,b.trail,shot.trail,!!game.options?.reducedFlash);
 if(shot&&['burrow','phase','warp'].includes(shot.behavior))this.drawShotTell(ctx,b,shot,reducedFlash);
 if(underground)drawUndergroundShotTell(ctx,b,reducedFlash,this.time);
 ctx.translate(ballX,ballY);if(shot&&!underground){const transformSeconds=Number.isFinite(shot.transformSeconds)&&shot.transformSeconds>0?shot.transformSeconds:1.65,returnBlend=clamp((b.age-(transformSeconds-.18))/.18,0,1);ctx.shadowColor=shot.trail;ctx.shadowBlur=reducedFlash?12:38;ctx.shadowBlur*=1-returnBlend;ctx.globalAlpha=1-returnBlend*.65;ellipse(ctx,0,0,25,25,shot.color+'55');ctx.globalAlpha=1;ctx.shadowBlur=0;this.drawTransformation(ctx,shot,b.age,reducedFlash,game.options?.ballModel);}
 else if(shot){/* underground shots are represented by their ground wake above */}
 else if(concealed){ctx.globalAlpha=reducedFlash?.17:.10;this.drawSoccerBall(ctx,0,0,15,game.options?.ballModel||'classic',0);}
 // Match ball art uses the same 17-unit drawn size as penalties so its stitched
 // surface stays readable during normal play. Physics/collision radius is independent.
 else {const carrier=b.owner&&!b.owner.keeper?b.owner:null,tumble=carrier?{dx:carrier.moveVX||0,dy:carrier.moveVY||0}:{dx:b.vx,dy:b.vy};ctx.globalAlpha=1;this.drawSoccerBall(ctx,0,0,17,game.options?.ballModel||'classic',b.rollAngle||0,tumble);}
 ctx.restore();}
 // These are visual-only cues: phase shots retain the same swept keeper and
 // player collision paths as every other shot. Reduced-flash uses steady,
 // lower-opacity marks and never relies on flicker to communicate the shot.
 drawShotTell(ctx,b,shot,reducedFlash=false){
  const trail=Array.isArray(b.trail)?b.trail:[],speed=Math.hypot(b.vx||0,b.vy||0)||1,ux=(b.vx||0)/speed,uy=(b.vy||0)/speed;
  ctx.save();
  if(shot.behavior==='burrow'){
   const points=trail.slice(-12);
   if(points.length>1){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y-points[0].z);for(const p of points.slice(1))ctx.lineTo(p.x,p.y-p.z);
    ctx.strokeStyle='#b77b49';ctx.lineWidth=reducedFlash?3:5;ctx.globalAlpha=reducedFlash?.34:.56;ctx.lineCap='round';ctx.setLineDash(reducedFlash?[7,7]:[13,6]);ctx.stroke();ctx.setLineDash([]);}
   // A calm soil ripple makes the low flight legible without obscuring the ball.
   ctx.beginPath();ctx.ellipse(b.x,b.y+3,22,6,0,0,Math.PI*2);ctx.strokeStyle='#e5b16b';ctx.lineWidth=2;ctx.globalAlpha=reducedFlash?.34:.64;ctx.stroke();
  }else if(shot.behavior==='phase'){
   // Two stable ghost echoes make the passage cue readable without a blink.
   ctx.strokeStyle='#b8f3e8';ctx.lineWidth=reducedFlash?2:3;
   for(let i=1;i<=2;i++){ctx.globalAlpha=reducedFlash?.22:.34-i*.06;ctx.beginPath();ctx.ellipse(b.x-ux*i*23,b.y-b.z-uy*i*23,14-i*2,11-i,0,0,Math.PI*2);ctx.stroke();}
  }else if(shot.behavior==='warp'){
   // Omega's offset echo rings distinguish its folded path from the ghost trail.
   ctx.strokeStyle='#c8a4ff';ctx.lineWidth=reducedFlash?2:3;
   for(let i=1;i<=3;i++){ctx.globalAlpha=reducedFlash?.17:.30-i*.045;const x=b.x-ux*i*19,y=b.y-b.z-uy*i*19;
    ctx.beginPath();ctx.ellipse(x,y,7+i*2,5+i,Math.atan2(uy,ux),0,Math.PI*2);ctx.stroke();}
  }
  ctx.restore();
 }
 drawRollingBallSurface(ctx,surface,r,rotation,dx,dy){
 const speed=Math.hypot(Number(dx)||0,Number(dy)||0);if(speed<1e-3)return false;
 const ax=-(Number(dy)||0)/speed,ay=(Number(dx)||0)/speed,cos=Math.cos(rotation),sin=Math.sin(rotation),steps=12;
 const project=(nx,ny)=>{
  const length=Math.hypot(nx,ny)||1,x=length>1?nx/length:nx,y=length>1?ny/length:ny;
  const z=Math.sqrt(Math.max(0,1-x*x-y*y)),dot=ax*x+ay*y;
  const crossX=ay*z,crossY=-ax*z,crossZ=ax*y-ay*x;
  // Inverse tumble samples the visible hemisphere from the saved procedural
  // surface. Mirroring the source across its equator supplies stable rear
  // artwork without revealing a blank back as the ball passes 90 degrees.
  const localX=x*cos-crossX*sin+ax*dot*(1-cos),localY=y*cos-crossY*sin+ay*dot*(1-cos),localZ=z*cos-crossZ*sin;
  return {x:x*r,y:y*r,z:localZ,sx:(localX+1)*r,sy:(localY+1)*r};
 };
 const vertices=Array.from({length:steps+1},(_,row)=>Array.from({length:steps+1},(_,col)=>project(col/steps*2-1,row/steps*2-1)));
 // Canvas antialiasing can leave hairline cracks where independently clipped
 // mesh triangles meet. Expand only the clip edge by a fraction of a pixel;
 // keep the original UV transform so the texture and sphere geometry do not
 // change, and let adjacent triangles overlap instead of exposing the base fill.
 const clipBleed=Math.min(.36,r/steps*.13),expandClip=(point,cx,cy)=>{
  const dx=point.x-cx,dy=point.y-cy,length=Math.hypot(dx,dy)||1;
  return {x:point.x+dx/length*clipBleed,y:point.y+dy/length*clipBleed};
 };
 for(let row=0;row<steps;row++)for(let col=0;col<steps;col++){
  const corners=[vertices[row][col],vertices[row][col+1],vertices[row+1][col+1],vertices[row+1][col]];
  for(const triangle of [[corners[0],corners[1],corners[2]],[corners[0],corners[2],corners[3]]]){
   if(triangle.some(point=>!point))continue;
   const [a,b,c]=triangle,u1x=b.sx-a.sx,u1y=b.sy-a.sy,u2x=c.sx-a.sx,u2y=c.sy-a.sy,det=u1x*u2y-u2x*u1y;
   if(Math.abs(det)<1e-5)continue;
   const v1x=b.x-a.x,v1y=b.y-a.y,v2x=c.x-a.x,v2y=c.y-a.y;
   const m11=(v1x*u2y-v2x*u1y)/det,m12=(-v1x*u2x+v2x*u1x)/det;
   const m21=(v1y*u2y-v2y*u1y)/det,m22=(-v1y*u2x+v2y*u1x)/det;
   const tx=a.x-m11*a.sx-m12*a.sy,ty=a.y-m21*a.sx-m22*a.sy;
   const cx=(a.x+b.x+c.x)/3,cy=(a.y+b.y+c.y)/3,ca=expandClip(a,cx,cy),cb=expandClip(b,cx,cy),cc=expandClip(c,cx,cy);
   ctx.save();ctx.beginPath();ctx.moveTo(ca.x,ca.y);ctx.lineTo(cb.x,cb.y);ctx.lineTo(cc.x,cc.y);ctx.closePath();ctx.clip();
   ctx.transform(m11,m21,m12,m22,tx,ty);ctx.drawImage(surface,0,0);ctx.restore();
  }
 }
 return true;
 }
 drawSoccerBall(ctx,x,y,r,model='classic',rotation=0,tumble=null,surfaceOnly=false){
 const id=VISUALFEEL.validBallModel(model);
 if(tumble&&!surfaceOnly&&r>0&&Number.isFinite(Number(rotation))&&Math.hypot(Number(tumble.dx)||0,Number(tumble.dy)||0)>.1&&typeof document!=='undefined'){
  const cache=this.rollingBallSurfaceCache||(this.rollingBallSurfaceCache=new Map()),key=`${id}:${r}`;let surface=cache.get(key);
  if(!surface){surface=document.createElement('canvas');surface.width=surface.height=Math.ceil(r*2);this.drawSoccerBall(surface.getContext('2d'),surface.width/2,surface.height/2,r,id,0,null,true);cache.set(key,surface);}
  const base=id==='meteor'?'#fd9645':id==='ice'?'#e8fdff':id==='gold'?'#ffdb60':id==='retro'?'#bf8755':'#f4f1dd';
  ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,r,0,PI*2);ctx.clip();ctx.fillStyle=base;ctx.beginPath();ctx.arc(0,0,r,0,PI*2);ctx.fill();
  this.drawRollingBallSurface(ctx,surface,r,Number(rotation),tumble.dx,tumble.dy);this.drawBallSphereLighting(ctx,r,id);ctx.restore();this.drawBallOutline(ctx,x,y,r,id);return;
 }
 ctx.save();ctx.translate(x,y);
 ctx.beginPath();ctx.arc(0,0,r,0,PI*2);ctx.clip();
 const base=id==='meteor'?'#fd9645':id==='ice'?'#e8fdff':id==='gold'?'#ffdb60':id==='retro'?'#bf8755':'#f4f1dd';
 ellipse(ctx,0,0,r,r,base);
 // Rotate the painted panels inside a fixed circular outline: no physical radius changes.
 ctx.save();ctx.rotate(rotation);
 if(id==='classic'){
  const seam='#52616b',panel='#1b2a35';
  // Classic panel boundaries follow the ball's spherical surface. Treat each
  // panel vertex as a point on the front hemisphere and draw the great-circle
  // edge in short projected segments. This creates a restrained perspective
  // curve at match scale without changing the familiar six-panel layout.
  const sphereVertex=([px,py])=>{const sx=px/r,sy=py/r;return[sx,sy,Math.sqrt(Math.max(0,1-sx*sx-sy*sy))]};
  const traceSphericalPanel=points=>{
   const verts=points.map(sphereVertex);ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
   for(let edge=0;edge<verts.length;edge++){
    const a=verts[edge],b=verts[(edge+1)%verts.length],dot=clamp(a[0]*b[0]+a[1]*b[1]+a[2]*b[2],-1,1),omega=Math.acos(dot),sinOmega=Math.sin(omega);
    for(let step=1;step<=6;step++){
     const t=step/6,wa=sinOmega>1e-6?Math.sin((1-t)*omega)/sinOmega:1-t,wb=sinOmega>1e-6?Math.sin(t*omega)/sinOmega:t;
     const length=Math.hypot(a[0]*wa+b[0]*wb,a[1]*wa+b[1]*wb,a[2]*wa+b[2]*wb)||1;
     ctx.lineTo((a[0]*wa+b[0]*wb)*r/length,(a[1]*wa+b[1]*wb)*r/length);
    }
   }
   ctx.closePath();
  };
  const center=[[0,-r*.46],[r*.44,-r*.14],[r*.28,r*.39],[-r*.28,r*.39],[-r*.44,-r*.14]];
  traceSphericalPanel(center);ctx.fillStyle=panel;ctx.fill();
  // Keep the hub panel's stitched edge visible at gameplay radius. A uniform
  // fine stroke matches the surrounding patches without changing the outline.
  traceSphericalPanel(center);
  ctx.lineWidth=Math.max(.55,r*.035);ctx.strokeStyle=seam;ctx.stroke();
  // Five connected five-sided outer panels form the traditional stitched
  // pentagon layout around the center. The inward point meets the center
  // panel so the ball reads as one panel network instead of floating spots.
  for(let a=0;a<5;a++){
   const angle=a*PI*2/5-PI/2,cx=Math.cos(angle)*r*.64,cy=Math.sin(angle)*r*.64,pr=r*.18;
   const points=Array.from({length:5},(_,i)=>{const side=angle+PI+i*PI*2/5;return[cx+Math.cos(side)*pr,cy+Math.sin(side)*pr]});
   traceSphericalPanel(points);ctx.fillStyle=panel;ctx.fill();traceSphericalPanel(points);ctx.lineWidth=Math.max(.55,r*.035);ctx.strokeStyle=seam;ctx.stroke();
   const inner=[Math.cos(angle)*r*.48,Math.sin(angle)*r*.48],outer=[Math.cos(angle)*r*.55,Math.sin(angle)*r*.55];
   line(ctx,[inner,outer],seam,Math.max(.5,r*.027));
  }
 }
 else if(id==='meteor'){for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r*.93,a,a+.40);ctx.closePath();ctx.fillStyle=i%2?'#e64833':'#ffe39a';ctx.fill()}ellipse(ctx,0,0,r*.29,r*.29,'#bd342d')}
 else if(id==='ice'){for(let i=0;i<6;i++){let a=i*Math.PI/3;line(ctx,[[Math.cos(a)*r*.12,Math.sin(a)*r*.12],[Math.cos(a)*r*.92,Math.sin(a)*r*.92]],'#3f9fd3',r*.13)}poly(ctx,[[0,-r*.48],[r*.48,0],[0,r*.48],[-r*.48,0]],'#b8e9ff','#4a9bc8')}
 else if(id==='gold'){for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.38:r*.86;line(ctx,[[0,0],[Math.cos(a)*rr,Math.sin(a)*rr]],'#fff4af',r*.16)}const pts=Array.from({length:10},(_,i)=>{let a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.36:r*.79;return [Math.cos(a)*rr,Math.sin(a)*rr]});poly(ctx,pts,'#fff9d9','#bf8d28')}
 else if(id==='hinomaru'){
  // Optional Japan-inspired motif: centered deep-red disc, with quiet football seams.
  // Keep it distinct from rising-sun rays and entirely in this renderer-only layer.
  ellipse(ctx,0,0,r*.40,r*.40,'#bc002d');
  for(const angle of [0,PI/2,PI,PI*1.5]){
   ctx.save();ctx.rotate(angle);
   poly(ctx,[[r*.67,-r*.12],[r*.82,-r*.10],[r*.91,0],[r*.82,r*.10],[r*.67,r*.12]],'#25394a');
   ctx.restore();
  }
 }
 else if(id==='tricolore'){
  // French tricolour-inspired curved panels; original ball-only artwork.
  poly(ctx,[[-r,-r],[-r*.35,-r],[-r*.25,0],[-r*.35,r],[-r,r]],'#0055a4');
  poly(ctx,[[-r*.35,-r],[r*.35,-r],[r*.25,0],[r*.35,r],[-r*.35,r],[-r*.25,0]],'#f4f1dd');
  poly(ctx,[[r*.35,-r],[r,-r],[r,r],[r*.35,r],[r*.25,0]],'#ef4135');
  for(const sign of [-1,1])line(ctx,[[sign*r*.31,-r*.78],[sign*r*.22,0],[sign*r*.31,r*.78]],'#25394a',r*.055);
 }
 else if(id==='auriverde'){
  // Brazil-inspired green field and gold lozenge; original ball-only artwork.
  ellipse(ctx,0,0,r,r,'#009b3a');
  poly(ctx,[[0,-r*.70],[r*.72,0],[0,r*.70],[-r*.72,0]],'#ffdf00','#164e2a');
  ellipse(ctx,0,0,r*.37,r*.37,'#002776');
  // A curved white band hints at the source motif without reproducing its motto.
  ctx.beginPath();ctx.moveTo(-r*.34,-r*.12);ctx.quadraticCurveTo(0,-r*.34,r*.34,-r*.12);ctx.lineTo(r*.34,-r*.02);ctx.quadraticCurveTo(0,-r*.22,-r*.34,-r*.02);ctx.closePath();ctx.fillStyle='#fff';ctx.fill();
  for(const angle of [0,PI/2,PI,PI*1.5]){ctx.save();ctx.rotate(angle);poly(ctx,[[r*.73,-r*.08],[r*.85,-r*.06],[r*.92,0],[r*.85,r*.06],[r*.73,r*.08]],'#164e2a');ctx.restore();}
 }
 else {for(let i=-2;i<=2;i++){line(ctx,[[-r*1.1,i*r*.43],[r*1.1,i*r*.43]],'#784727',r*.12)}for(let i=-2;i<=2;i++){line(ctx,[[i*r*.5,-r],[i*r*.5,r]],'#e1b48a',r*.075)}}
 // Keep the four themed non-classic balls reading as stitched footballs at
 // match scale. Their original motifs stay visible underneath these fine,
 // surface-projected seams; the classic topology and palette are untouched.
 if(['meteor','ice','gold','retro'].includes(id)&&r>0){
  const seam=id==='meteor'?'rgba(91,35,21,.34)':id==='ice'?'rgba(39,102,132,.34)':id==='gold'?'rgba(130,86,16,.28)':'rgba(88,53,35,.24)';
  const sphereVertex=([px,py])=>{const sx=px/r,sy=py/r;return[sx,sy,Math.sqrt(Math.max(0,1-sx*sx-sy*sy))]};
  const traceThemedPanel=points=>{
   const verts=points.map(sphereVertex);ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
   for(let edge=0;edge<verts.length;edge++){
    const a=verts[edge],b=verts[(edge+1)%verts.length],dot=clamp(a[0]*b[0]+a[1]*b[1]+a[2]*b[2],-1,1),omega=Math.acos(dot),sinOmega=Math.sin(omega);
    for(let step=1;step<=6;step++){
     const t=step/6,wa=sinOmega>1e-6?Math.sin((1-t)*omega)/sinOmega:1-t,wb=sinOmega>1e-6?Math.sin(t*omega)/sinOmega:t;
     const length=Math.hypot(a[0]*wa+b[0]*wb,a[1]*wa+b[1]*wb,a[2]*wa+b[2]*wb)||1;
     ctx.lineTo((a[0]*wa+b[0]*wb)*r/length,(a[1]*wa+b[1]*wb)*r/length);
    }
   }
   ctx.closePath();
  };
  const center=[[0,-r*.46],[r*.44,-r*.14],[r*.28,r*.39],[-r*.28,r*.39],[-r*.44,-r*.14]];
  ctx.strokeStyle=seam;ctx.lineWidth=Math.max(.45,r*.018);traceThemedPanel(center);ctx.stroke();
  for(let a=0;a<5;a++){
   const angle=a*PI*2/5-PI/2,cx=Math.cos(angle)*r*.64,cy=Math.sin(angle)*r*.64,pr=r*.18;
   const points=Array.from({length:5},(_,i)=>{const side=angle+PI+i*PI*2/5;return[cx+Math.cos(side)*pr,cy+Math.sin(side)*pr]});
   traceThemedPanel(points);ctx.stroke();
   line(ctx,[[Math.cos(angle)*r*.48,Math.sin(angle)*r*.48],[Math.cos(angle)*r*.55,Math.sin(angle)*r*.55]],seam,Math.max(.45,r*.016));
  }
 }
 ctx.restore();
 if(surfaceOnly){ctx.restore();return;}
 this.drawBallSphereLighting(ctx,r,id);
 ctx.restore();this.drawBallOutline(ctx,x,y,r,id);
 }
 drawBallSphereLighting(ctx,r,id){
 // Shade the completed panel artwork, not just the white base. Applying a
 // soft sphere ramp over seams and colored panels makes the small in-match
 // ball read as a rounded object instead of a flat sticker; clip/radius and
 // collision geometry remain unchanged.
 if(typeof ctx.createRadialGradient==='function'){
  const sphere=ctx.createRadialGradient(-r*.38,-r*.46,r*.04,0,0,r*1.08);
  sphere.addColorStop(0,'rgba(255,255,255,.70)');
  sphere.addColorStop(.26,'rgba(255,255,255,.27)');
  sphere.addColorStop(.68,'rgba(130,151,166,.025)');
  sphere.addColorStop(1,'rgba(13,30,43,.55)');
  ctx.fillStyle=sphere;ctx.beginPath();ctx.arc(0,0,r,0,PI*2);ctx.fill();
 }
 ellipse(ctx,-r*.30,-r*.40,r*.38,r*.20,'rgba(255,255,255,.52)');
 ellipse(ctx,-r*.39,-r*.46,r*.15,r*.075,'rgba(255,255,255,.74)');
 // Each themed surface gets a restrained tint in its specular area so ice,
 // meteor, gold and vintage leather retain distinct materials after shading.
 const material=id==='meteor'?['rgba(255,211,157,.28)','rgba(255,144,80,.08)']
  :id==='ice'?['rgba(220,252,255,.42)','rgba(113,211,255,.10)']
  :id==='gold'?['rgba(255,251,211,.44)','rgba(255,206,67,.10)']
  :id==='retro'?['rgba(255,227,194,.30)','rgba(180,115,68,.08)']:null;
 if(material&&typeof ctx.createRadialGradient==='function'){
  const glow=ctx.createRadialGradient(-r*.34,-r*.42,r*.01,-r*.34,-r*.42,r*.58);
  glow.addColorStop(0,material[0]);glow.addColorStop(.38,material[1]);glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,r,0,PI*2);ctx.fill();
 }
 }
 drawBallOutline(ctx,x,y,r,id){ctx.save();ctx.translate(x,y);ctx.lineWidth=Math.max(1,r*.065);ctx.strokeStyle=id==='retro'?'#68432c':'#2a4354';ctx.beginPath();ctx.arc(0,0,r,0,PI*2);ctx.stroke();ctx.restore();
}
 drawTransformation(ctx,s,t,reducedFlash=false,ballModel='classic'){let id=s.id;const transformSeconds=Number.isFinite(s.transformSeconds)&&s.transformSeconds>0?s.transformSeconds:1.65,returnBlend=clamp((t-(transformSeconds-.18))/.18,0,1),formAlpha=1-returnBlend;ctx.save();ctx.globalAlpha=formAlpha;ctx.rotate(reducedFlash?0:Math.sin(t*4.5)*.045);if(returnBlend>0)ctx.scale(1-returnBlend*.2,1-returnBlend*.2);drawSuperShotOrbitCue(ctx,t,s.trail||s.color||'#d7f6ff',reducedFlash);
 const spin=reducedFlash?0:t*15;
 if(id==='banana'){ctx.rotate(-.25);ctx.beginPath();ctx.arc(-2,0,21,-1.5,1.8,false);ctx.arc(8,0,18,1.65,-1.55,true);ctx.closePath();ctx.fillStyle='#ffe45c';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#386e26';ctx.stroke();poly(ctx,[[9,-10],[25,-2],[10,5]],'#4ab65d');ellipse(ctx,-11,-2,3,3,'#20242a');}
 else if(['fish','piranha'].includes(id)){ellipse(ctx,0,0,23,14,'#51d5e9');poly(ctx,[[-19,0],[-36,-14],[-34,14]],'#38a1d2');poly(ctx,[[-7,-11],[0,-26],[9,-12]],'#158bb4');ellipse(ctx,13,-4,4,4,'#14263c');if(id==='piranha')poly(ctx,[[11,9],[22,3],[9,1]],'#f8f5d5');}
 else if(id==='bird'){
  const flap=reducedFlash?0:Math.sin(t*8)*.72;
  if(!reducedFlash)ctx.translate(0,Math.sin(t*8)*2);
  ellipse(ctx,0,0,22,13,'#e3efff');poly(ctx,[[-19,0],[-36,-14],[-34,14]],'#effaff');
  poly(ctx,[[-7,-11],[0,-26],[9,-12]],'#d1e4f7');
  ctx.save();ctx.translate(-3,-5);ctx.rotate(-flap);poly(ctx,[[-5,0],[13,-8],[23,-25],[7,-17]],'#f6fafc');ctx.restore();
  ctx.save();ctx.translate(-2,1);ctx.rotate(flap*.72);poly(ctx,[[-6,0],[12,8],[21,24],[7,16]],'#fff');ctx.restore();
  ellipse(ctx,13,-4,4,4,'#14263c');poly(ctx,[[19,-2],[28,1],[19,4]],'#f0bd61');
 }
 else if(id==='ghost'){ellipse(ctx,0,-3,21,20,'#d9f8ee');poly(ctx,[[-19,1],[-25,22],[-12,16],[-5,24],[5,16],[14,23],[22,11],[18,-3]],'#d9f8ee');ellipse(ctx,-7,-5,4,6,'#112d3e');ellipse(ctx,8,-5,4,6,'#112d3e');}
 else if(id==='ninja'){ctx.rotate(-spin*.2);poly(ctx,[[-25,-6],[-9,-16],[8,-17],[24,-7],[15,20],[-15,17]],'#8567ce','#e6d9fb');rr(ctx,-20,-7,40,14,4,'#243044');ellipse(ctx,-8,0,4,3,'#fff');ellipse(ctx,8,0,4,3,'#fff');for(let i=0;i<2;i++){ctx.globalAlpha=formAlpha*.28;ellipse(ctx,-45+i*90,reducedFlash?0:Math.sin(t*10+i)*14,11,19,'#ae98ef')}ctx.globalAlpha=formAlpha;}
 else if(id==='nuts'){ctx.rotate(spin*.55);ellipse(ctx,0,0,19,22,'#f7c87c');ellipse(ctx,0,-7,18,15,'#b97941');poly(ctx,[[-4,-16],[6,-24],[12,-15]],'#77c158');for(let j=-1;j<=1;j++)line(ctx,[[-13,j*5],[13,j*5]],'#a6612f',2)}
 else if(id==='wheel'){ctx.rotate(spin);ellipse(ctx,0,0,24,24,'#c8dbef');ellipse(ctx,0,0,15,15,'#283c4b');for(let i=0;i<8;i++){let a=i*PI/4;line(ctx,[[Math.cos(a)*5,Math.sin(a)*5],[Math.cos(a)*23,Math.sin(a)*23]],'#f2f4e1',3)}}
 else if(id==='cactus'){ctx.rotate(spin*.2);ellipse(ctx,0,0,17,23,'#62bb6c');rr(ctx,-23,-3,12,24,6,'#76c474','#356e47');rr(ctx,11,-17,12,29,6,'#76c474','#356e47');for(let i=-2;i<=2;i++)line(ctx,[[i*6,-18],[i*6-3,-25]],'#eff6ae',2);line(ctx,[[-3,-7],[3,-7]],'#263b2c',2)}
 else if(id==='elephant'){ellipse(ctx,-14,-2,13,17,'#9acadd');ellipse(ctx,14,-2,13,17,'#9acadd');ellipse(ctx,0,-6,17,20,'#b7dce8');ctx.beginPath();ctx.moveTo(8,1);ctx.bezierCurveTo(22,8,17,24,7,23);ctx.strokeStyle='#86b9ce';ctx.lineWidth=9;ctx.lineCap='round';ctx.stroke();ellipse(ctx,4,-9,2,3,'#243a48');ellipse(ctx,13,-9,2,3,'#243a48')}
 else if(id==='horse'){poly(ctx,[[-20,18],[-18,-15],[-8,-23],[-2,-13],[7,-25],[13,-14],[22,-7],[19,13],[9,22],[-10,22]],'#ba8b69','#684b3b');poly(ctx,[[-15,-15],[-18,-31],[-5,-22],[1,-28],[8,-20],[17,-22],[23,-11]],'#77523f');ellipse(ctx,9,-5,3,4,'#172b35');line(ctx,[[7,10],[20,9]],'#3b2820',2)}
 else if(id==='mole'){ellipse(ctx,0,6,24,17,'#ae7a4b');ellipse(ctx,0,-8,20,17,'#daa774');ellipse(ctx,-7,-9,3,4,'#1d2528');ellipse(ctx,8,-9,3,4,'#1d2528');ellipse(ctx,0,-1,6,4,'#f1a7a3');poly(ctx,[[-16,-18],[-11,-31],[-4,-21],[4,-32],[12,-20],[16,-26],[16,-14]],'#ffcc67','#a35f45')}
 else if(id==='books'){ctx.rotate(reducedFlash?0:Math.sin(t*20)*.4);rr(ctx,-22,-24,44,47,3,'#e8c684','#926534');line(ctx,[[0,-23],[0,22]],'#9c692e',3);for(let j=0;j<5;j++){line(ctx,[[-19,-15+j*7],[-3,-15+j*7]],'#946337',2);line(ctx,[[5,-15+j*7],[19,-15+j*7]],'#946337',2)}}
 else if(id==='target'){for(let i=0;i<3;i++){ctx.strokeStyle=['#ffe8ad','#e6494b','#fff4e2'][i];ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,24-i*8,0,PI*2);ctx.stroke()}ellipse(ctx,0,0,4,4,'#dd4045')}
 else if(id==='cannon'){poly(ctx,[[-37,15],[-26,-6],[-39,-17],[-9,-13],[4,-33],[14,-17],[31,-11],[25,3],[37,16],[9,14],[-4,27]],'#ffbb42');ellipse(ctx,6,0,18,18,'#f5553f');ellipse(ctx,12,-6,9,8,'#fff28c')}
 else if(id==='comet'){poly(ctx,[[-43,-10],[-18,-7],[-30,-25],[1,-12],[-11,-31],[14,-12],[33,-7],[26,9],[9,20],[-8,15]],'#f77b5d');ellipse(ctx,7,0,15,15,'#ffd76a');ellipse(ctx,10,-3,7,7,'#fff5b8')}
 else if(id==='lion'){for(let i=0;i<10;i++){const a=i*PI/5;poly(ctx,[[Math.cos(a)*12,Math.sin(a)*12],[Math.cos(a-.18)*27,Math.sin(a-.18)*27],[Math.cos(a+.18)*27,Math.sin(a+.18)*27]],'#e87528')}ellipse(ctx,0,0,19,20,'#f4bd58');ellipse(ctx,-7,-3,3,4,'#392b27');ellipse(ctx,7,-3,3,4,'#392b27');ellipse(ctx,0,4,4,3,'#8f4931');line(ctx,[[-5,10],[0,13],[5,10]],'#6b392d',2)}
 else if(id==='tiger'){ellipse(ctx,0,0,22,22,'#f39e36');ellipse(ctx,0,0,14,16,'#ffca55');for(let i=-2;i<=2;i++){line(ctx,[[i*7-2,-17],[i*7+2,-8]],'#6b382b',3);line(ctx,[[i*6-2,8],[i*6+2,17]],'#6b382b',3)}ellipse(ctx,-6,-3,3,4,'#202b34');ellipse(ctx,6,-3,3,4,'#202b34');poly(ctx,[[-3,5],[3,5],[0,8]],'#84372c')}
 else if(id==='mega'){ctx.rotate(spin*.35);for(let i=0;i<5;i++){ctx.rotate(PI*2/5);poly(ctx,[[0,0],[14,-8],[43,-2],[14,11]],i%2?'#bbbcff':'#7ce7ff')}ellipse(ctx,0,0,16,16,'#fff1c3');ellipse(ctx,0,0,8,8,'#263f77')}
 else if(id==='omega'){for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,25-i*7,17-i*5,0,0,PI*2);ctx.strokeStyle=['#a48bff','#e5a9ff','#faf1ff'][i];ctx.lineWidth=3;ctx.stroke()}poly(ctx,[[0,-11],[4,-4],[12,0],[4,4],[0,12],[-4,4],[-12,0],[-4,-4]],'#f8dcff');ellipse(ctx,0,0,3,3,'#57428f')}
 else if(id==='eagle'){ellipse(ctx,0,0,21,17,'#eff2f7');poly(ctx,[[-8,-12],[0,-28],[5,-11],[19,-4],[5,2],[-12,4]],'#d8e2ef');poly(ctx,[[11,-2],[29,4],[11,9]],'#e5ae4c');ellipse(ctx,5,-6,3,3,'#172b3c');line(ctx,[[-14,7],[-27,14],[-11,12]],'#8b9ab1',3)}
 else if(id==='tornado'){for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,24-i*6,19-i*5,spin*.12+i*.28,.15,Math.PI*1.75);ctx.strokeStyle=['#d7f3ff','#8ec8e7','#7793db'][i];ctx.lineWidth=5-i;ctx.stroke()}poly(ctx,[[-5,-4],[5,-12],[9,-2],[4,8],[-5,13],[-10,5]],'#d8f5ff')}
 else if(id==='serpent'){ctx.beginPath();ctx.moveTo(-27,12);ctx.bezierCurveTo(-31,-13,-7,-20,0,-3);ctx.bezierCurveTo(8,14,29,8,23,-9);ctx.strokeStyle='#51ba8e';ctx.lineWidth=12;ctx.lineCap='round';ctx.stroke();ellipse(ctx,23,-9,11,9,'#a8e468');ellipse(ctx,26,-11,2,2,'#1d332a');line(ctx,[[24,-3],[30,-2]],'#f6e69b',2)}
 else if(id==='silverCarp'){
  const tail=reducedFlash?0:Math.sin(t*9)*5;ellipse(ctx,1,0,22,13,'#b8d1d6');
  poly(ctx,[[-17,0],[-34,-13-tail],[-32,13+tail]],'#839da4');poly(ctx,[[1,-10],[10,-22],[14,-8]],'#d7e7e7');
  poly(ctx,[[-1,9],[8,20],[12,8]],'#9db5ba');ellipse(ctx,12,-4,3,3,'#233941');
  for(let i=0;i<3;i++)ellipse(ctx,-4+i*7,1,2.2,2.2,'#e8f3ee');line(ctx,[[18,5],[25,5]],'#627d85',2);
 }
 else if(id==='dice'){
  ctx.rotate(reducedFlash?0:Math.sin(t*3)*.05);rr(ctx,-22,-22,44,44,7,'#fff7df','#c6a967');
  const pip=(x,y)=>ellipse(ctx,x,y,3.4,3.4,'#334559');
  for(const [x,y] of [[-12,-12],[12,-12],[0,0],[-12,12],[12,12]])pip(x,y);
  if(Math.sin(t*1.5)>0&&!reducedFlash){ctx.globalAlpha*=.5;line(ctx,[[-14,-17],[14,-17]],'#fff',2);}
 }
 else if(id==='pineapple'){
  ctx.rotate(reducedFlash?0:Math.sin(t*3.5)*.04);ellipse(ctx,0,3,17,23,'#f5c54d');
  for(let row=-2;row<=2;row++)for(let col=-1;col<=1;col++){const x=col*9+(row%2)*4,y=row*7;line(ctx,[[x-3,y-2],[x,y-5],[x+3,y-2]],'#a9782e',1.5);ellipse(ctx,x,y,1.4,1.4,'#fff0a0');}
  poly(ctx,[[-9,-17],[-18,-31],[-5,-24],[-2,-37],[4,-24],[15,-32],[10,-16]],'#48a764','#33764c');
 }
 else if(id==='apple'){
  ellipse(ctx,-8,1,14,18,'#e84c47');ellipse(ctx,8,1,14,18,'#f45c4f');
  ellipse(ctx,0,7,18,13,'#eb5148');line(ctx,[[0,-13],[2,-23]],'#714a2b',3);
  ellipse(ctx,10,-19,8,4,'#66bd67');ellipse(ctx,-8,-4,4,7,'#ffb1a0');
 }
 else if(id==='coconut'){
  ctx.rotate(reducedFlash?0:Math.sin(t*3)*.035);ellipse(ctx,0,0,22,19,'#835333');
  ellipse(ctx,-7,-6,3,3,'#382b28');ellipse(ctx,2,-8,3,3,'#382b28');ellipse(ctx,8,-3,3,3,'#382b28');
  ctx.beginPath();ctx.ellipse(0,0,15,12,-.25,-1.2,1.1);ctx.strokeStyle='#c8955c';ctx.lineWidth=2;ctx.stroke();
  for(let i=0;i<5;i++)line(ctx,[[-17+i*7,12],[ -13+i*7,18]],'#5a392f',1.5);
 }
 else if(id==='orange'){
  ellipse(ctx,0,1,21,21,'#f79232');ellipse(ctx,0,1,17,17,'#ffae3b');
  for(let i=0;i<9;i++){const a=i*PI*2/9;ellipse(ctx,Math.cos(a)*11,1+Math.sin(a)*11,1.2,1.2,'#ffe08a');}
  ellipse(ctx,0,-20,3,2,'#54893e');poly(ctx,[[1,-19],[10,-27],[13,-20],[6,-17]],'#65ae55');
 }
 else if(id==='strawberry'){
  ctx.beginPath();ctx.moveTo(-18,-7);ctx.quadraticCurveTo(-17,-22,0,-17);ctx.quadraticCurveTo(18,-22,18,-7);
  ctx.quadraticCurveTo(15,8,0,25);ctx.quadraticCurveTo(-15,8,-18,-7);ctx.closePath();ctx.fillStyle='#ec4f5d';ctx.fill();
  for(const [x,y] of [[-9,-8],[0,-10],[9,-8],[-11,0],[-3,1],[6,1],[11,5],[-7,9],[1,11]])ellipse(ctx,x,y,1.6,2.3,'#ffe48a');
  poly(ctx,[[-15,-13],[-7,-23],[-2,-15],[4,-25],[8,-15],[17,-20],[12,-10]],'#57ae62');
 }
 else if(id==='dolphin'){
  const swim=reducedFlash?0:Math.sin(t*8)*3;
  ellipse(ctx,1,0,24,11,'#6fc8df');poly(ctx,[[-17,0],[-31,-11-swim],[-27,0],[-31,11+swim]],'#398eae');
  poly(ctx,[[-1,-8],[6,-22],[12,-8]],'#4ba6c3');poly(ctx,[[0,7],[9,17],[13,7]],'#b8edf0');
  poly(ctx,[[16,-2],[31,1],[18,4]],'#56b5ce');ellipse(ctx,13,-4,2.5,2.5,'#17394b');
 }
 else if(id==='wave'){
  const crest=reducedFlash?0:Math.sin(t*5)*2.5;
  ctx.beginPath();ctx.moveTo(-26,13);ctx.quadraticCurveTo(-9,4,-12,-9);ctx.quadraticCurveTo(-13,-21,2,-25+crest);
  ctx.quadraticCurveTo(0,-8,21,-6);ctx.quadraticCurveTo(31,-3,28,11);ctx.closePath();ctx.fillStyle='#39b7d3';ctx.fill();
  ctx.beginPath();ctx.moveTo(-24,13);ctx.quadraticCurveTo(0,3,25,9);ctx.quadraticCurveTo(7,21,-18,18);ctx.closePath();ctx.fillStyle='#80e5e7';ctx.fill();
  ctx.beginPath();ctx.moveTo(-3,-20);ctx.quadraticCurveTo(9,-16,14,-8);ctx.strokeStyle='#f0ffff';ctx.lineWidth=4;ctx.lineCap='round';ctx.stroke();
 }
 else this.drawSoccerBall(ctx,0,0,19);
 ctx.restore();if(returnBlend>0){ctx.save();ctx.globalAlpha=returnBlend;this.drawSoccerBall(ctx,0,0,11+returnBlend*4,ballModel,reducedFlash?0:t*10);ctx.restore()}}
 drawTornado(ctx,t,reducedFlash=false){
  if(!t)return;const life=clamp((t.life||0)/(t.totalLife||4.5),0,1),turn=reducedFlash?0:this.time*.7;
  ctx.save();ctx.globalAlpha=reducedFlash?.42:.58;ctx.setLineDash(reducedFlash?[]:[8,7]);ctx.beginPath();ctx.arc(t.x,t.y,t.radius||150,0,PI*2);ctx.strokeStyle='#d5f6ff';ctx.lineWidth=reducedFlash?3:2;ctx.stroke();ctx.setLineDash([]);
  ctx.globalAlpha=(reducedFlash?.32:.52)*life;ctx.translate(t.x,t.y);
  for(let i=0;i<8;i++){const y=-i*18,rx=9+i*5,drift=reducedFlash?0:Math.sin(this.time*2.2+i)*8;
   ctx.beginPath();ctx.ellipse(drift,y,rx,7,turn,0,PI*2);ctx.lineWidth=3+i*.25;ctx.strokeStyle=i%2?'#c3e4e4':'#effcff';ctx.stroke();}
  ctx.restore();
 }
 drawWeatherLightning(ctx,lightning,reducedFlash=false){
  if(!lightning)return;ctx.save();
  if(lightning.phase==='warning'){
   // Keep the reduced-motion warning fully visible and steady while its
   // gameplay timer continues to advance in the engine.
   const progress=reducedFlash?1:clamp(1-lightning.remaining/lightning.duration,0,1);
   ctx.globalAlpha=reducedFlash?.48:.62;ctx.beginPath();ctx.arc(lightning.x,lightning.y,lightning.radius||110,-PI/2,-PI/2+PI*2*progress);
   ctx.strokeStyle='#fff18a';ctx.lineWidth=reducedFlash?3:4;ctx.stroke();
   ctx.globalAlpha=reducedFlash?.7:.9;ctx.beginPath();ctx.arc(lightning.x,lightning.y,7,0,PI*2);ctx.fillStyle='#fff4ad';ctx.fill();
  }else if(lightning.phase==='strike'){
   const fade=reducedFlash?1:clamp(lightning.remaining/lightning.duration,0,1);ctx.globalAlpha=(reducedFlash?.52:.82)*fade;
   ctx.strokeStyle='#fff8b0';ctx.lineWidth=reducedFlash?2.5:4;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#ffed88';ctx.shadowBlur=reducedFlash?0:7;
   line(ctx,[[lightning.x-4,lightning.y-88],[lightning.x+7,lightning.y-48],[lightning.x-11,lightning.y-20],[lightning.x+10,lightning.y+10],[lightning.x-1,lightning.y+62]],'#fff8b0',reducedFlash?2.5:4);
   ctx.beginPath();ctx.moveTo(lightning.x+4,lightning.y-31);ctx.lineTo(lightning.x+28,lightning.y-46);ctx.lineTo(lightning.x+15,lightning.y-12);ctx.stroke();ctx.shadowBlur=0;
  }
  ctx.restore();
 }
 drawWeather(ctx,g){
  const reducedFlash=!!g.options?.reducedFlash;
  const motionTime=reducedFlash?0:this.time;
  if(['Rain','Storm','Wind','Tornado'].includes(g.weather)){
   ctx.save();ctx.beginPath();ctx.rect(F.x,F.y,F.w,F.h);ctx.clip();
   const heavy=g.weather==='Rain'||g.weather==='Storm',wind=g.weather==='Wind',n=heavy?(reducedFlash?96:220):(reducedFlash?24:45);
   const baseColor=wind?'#d2f6f435':'#b0d5f077',dx=wind?44:8,dy=wind?0:21;
   // Five depth bands keep each streak's original geometry, opacity and width
   // while reducing 220 individual rain strokes to five batched strokes.
   for(let band=0;band<5;band++){
    ctx.beginPath();
    for(let i=band;i<n;i+=5){
     const x=F.x+((i*813+motionTime*(wind?300:210))%F.w);
     const y=F.y+((i*367+motionTime*850)%F.h);
     ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);
    }
    const depth=band/4;
    ctx.globalAlpha=(reducedFlash?.38:.58)+depth*(reducedFlash?.16:.26);
    ctx.lineWidth=.9+depth*.8;ctx.strokeStyle=baseColor;ctx.lineJoin='round';ctx.stroke();
   }
   // Sparse deterministic low-alpha ground ripples retain their separate
   // depth cue and stay independent of weather damage/physics.
   if(heavy)for(let i=0;i<n;i+=11){
    const sx=F.x+((i*239+motionTime*92)%F.w),sy=F.y+((i*173+motionTime*610)%F.h);
    const ripple=1.4+(i%3)*.35;
    ctx.globalAlpha=reducedFlash?.075:.12;ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(sx,sy,ripple*1.8,ripple*.42,0,0,PI*2);ctx.strokeStyle='#d7f8ff';ctx.stroke();
   }
   ctx.restore();
  }
  this.drawWeatherLightning(ctx,g.weatherLightning,reducedFlash);
 }
 drawBorder(ctx,g){let grad=ctx.createLinearGradient(0,0,0,720);grad.addColorStop(0,'#051f2877');grad.addColorStop(.12,'#0000');grad.addColorStop(.87,'#0000');grad.addColorStop(1,'#06171975');ctx.fillStyle=grad;ctx.fillRect(0,0,this.screenW,this.screenH);if(g.matchState==='penalty')this.drawPK(ctx,g)}
 drawMiniMap(ctx,g){
   if(g.matchState==='none'||g.matchState==='penalty'||g.matchState==='finished')return;
   const mx=this.screenW/2-135,my=628,mw=270,mh=78;
   rr(ctx,mx-5,my-5,mw+10,mh+10,11,'#031720c8','#ffffff70');
   rr(ctx,mx,my,mw,mh,5,'#2a6f46e8','#d8e8dc');
   ctx.strokeStyle='#c5e9c5c0';ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(mx+mw/2,my);ctx.lineTo(mx+mw/2,my+mh);ctx.stroke();
   ctx.beginPath();ctx.arc(mx+mw/2,my+mh/2,12,0,Math.PI*2);ctx.stroke();
   for(const p of g.players){const x=mx+((p.x-F.x)/F.w)*mw,y=my+((p.y-F.y)/F.h)*mh;ellipse(ctx,x,y,p.controlled?5:3.5,p.controlled?5:3.5,p.t===0?'#ff8d57':'#fff0ac');if(p.controlled){ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,6.2,0,PI*2);ctx.stroke()}}
   const b=g.ball;if(b)ellipse(ctx,mx+((b.x-F.x)/F.w)*mw,my+((b.y-F.y)/F.h)*mh,3,3,'#ffffff');
 }
   drawPK(ctx,g){
    const pk=g.pk;if(!pk)return;
    const hints=penaltyHudHints(pk,g.humans);
    const seconds=Number.isFinite(pk.timer)?Math.max(0,Math.ceil(pk.timer)):0;
    ctx.save();ctx.translate(this.screenW/2-640,0);
    rr(ctx,400,90,480,66,13,'#092635ea','#eedc75');
    ctx.textAlign='center';ctx.fillStyle='#fff9c5';ctx.font='900 25px system-ui';
    ctx.fillText(Number.isInteger(pk.inMatchTeam)?'PENALTY KICK':'PENALTY SHOWDOWN',640,118);
    ctx.font='800 16px system-ui';
    ctx.fillText(`${pk.kicks[0].map(x=>x?'●':'×').join(' ')}   •   ${pk.kicks[1].map(x=>x?'●':'×').join(' ')}`,640,140);
    rr(ctx,410,591,460,80,12,'#092635df','#fff8');
    ctx.fillStyle='#fff';ctx.font='900 15px system-ui';
    ctx.fillText(hints[0],640,616);
    ctx.font='800 14px system-ui';
    ctx.fillText(hints[1],640,638);
    ctx.fillText(`TIME ${seconds}s`,640,657);
    ctx.restore();
   }
}
function random(seed,a,b){return a+((Math.sin(seed*122.4)*49833)%1+1)%1*(b-a)}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}

return {Renderer,shouldShowBreathRing};})();

export {RENDER};
