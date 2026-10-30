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
const RENDER=(()=>{const {WORLD}=ENGINE;const {TEAMS,SHOTS}=DATA;const {dribbleStyle}=DRIBBLES;const {avatarFor}=EXPANDED;const {profileFor,sampleMotion}=BPWPERSONALITY;



const F=WORLD.field;const PI=Math.PI;
// Use the current selection, not p.controlled (which is a physics-frame snapshot).
// A switch can occur after that snapshot but before the next painted frame.
function shouldShowBreathRing(p,game,inMatchDraw){
 return !!(inMatchDraw&&!p.preview&&game.inControl(p.t)&&game.controlledPlayer(p.t)===p);
}
const rgb=(hex,a)=>hex+a;
const c=(ctx,v)=>{ctx.fillStyle=v};
function rr(ctx,x,y,w,h,r,col,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=col;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,PI*2);ctx.fillStyle=fill;ctx.fill()}
// Telegraph the short trap arming window. The ring shrinks as the trap becomes live;
// it uses the existing hazard timer, with no gameplay or save-format changes.
function drawHazardArmingCue(ctx,hazard,radius,armDuration,color){
 if(!hazard||!Number.isFinite(hazard.arm)||hazard.arm<=0||!Number.isFinite(hazard.life)||hazard.life<=0)return;
 const progress=Math.max(0,Math.min(1,hazard.arm/armDuration));
 ctx.save();
 ctx.globalAlpha=.38+.42*progress;
 ctx.beginPath();ctx.arc(hazard.x,hazard.y,radius,-PI/2,-PI/2+PI*2*progress);
 ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();
 ctx.restore();
}
// Original lightweight canvas peel artwork: no sprite fetch or save-data dependency.
function drawBananaPeels(ctx,hazards){
 for(const peel of hazards||[]){
  if(peel.kind!=='banana'||peel.life<=0)continue;
  ctx.save();ctx.globalAlpha=Math.min(1,peel.life/.5);
  ellipse(ctx,peel.x,peel.y+4,16,5,'rgba(22,30,13,.27)');
  ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(peel.x-13,peel.y-6);
  ctx.quadraticCurveTo(peel.x,peel.y+10,peel.x+13,peel.y-6);
  ctx.strokeStyle='#b87918';ctx.lineWidth=9;ctx.stroke();
  ctx.strokeStyle='#ffe35a';ctx.lineWidth=6;ctx.stroke();
  drawHazardArmingCue(ctx,peel,21,.25,'#fff1a3');
  ctx.restore();
 }
}
// Bounded crystalline ground patch; distinct from the yellow banana artwork.
function drawIcePatches(ctx,hazards){
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
  drawHazardArmingCue(ctx,patch,37,.3,'#e9fbff');
  ctx.restore();
 }
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
 const run=opt.run,action=p.action;
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
  const release=p.keeper?ARTPOSE.keeperRelease(action,p.actionTimer):{punting:false,windup:0};
  const gait=ARTPOSE.gait(cycle,{side,quarter:q,active:(active&&sign===1)||(release.punting&&sign===1),sliding:opt.sliding&&sign===1,jumping,recovering:Math.max(landing,brace*.65)});
  // The support leg stays grounded while the near boot follows through a pass.
  const stride=gait.stride+(sign===1?passing.stride:0);
  const lift=gait.lift+(sign===1?passing.lift:0);
  const knee=[cx+stride*.44,-8-lift*.43-gait.kneeBend*.16],ankle=[cx+stride*.84,-.2-lift+landing*3];
  artStroke(ctx,[[cx*.9,-17],knee],10.2,skinDim,dark,2);
  artStroke(ctx,[knee,ankle],8.8,p.keeper?'#fff0ba':contrast,dark,1.8);
  artStroke(ctx,[[ankle[0]-.7,ankle[1]-5],[ankle[0]+1.4,ankle[1]-5]],2.4,trim,trim,0);
  artEllipse(ctx,knee[0]-1,knee[1]+1,4.5,4.2,near?skin:skinDim);
  const toe=side?11:q?sign===1?8:4:sign===1?7:-6;
  artPatch(ctx,c=>{c.moveTo(ankle[0]-7,ankle[1]+.8);c.quadraticCurveTo(ankle[0]+toe*.2,ankle[1]-2,ankle[0]+toe+11,ankle[1]+4);c.lineTo(ankle[0]+toe+10,ankle[1]+9);c.quadraticCurveTo(ankle[0]+toe-4,ankle[1]+12,ankle[0]-8,ankle[1]+8);},near?'#1a2435':'#263247',dark,2);
  artStroke(ctx,[[ankle[0]+2,ankle[1]+4],[ankle[0]+toe+10,ankle[1]+4]],2.6,'#f3eadb','#f3eadb',0);
  artStroke(ctx,[[ankle[0]+toe-1,ankle[1]+1],[ankle[0]+toe+4,ankle[1]+2]],1.25,'#889bad','#889bad',0);
 }
 leg(-1,false);leg(1,true);
 // Separate tailored shorts panels. No floating rectangular boot/short blobs.
 artPatch(ctx,c=>{c.moveTo(-18,-24);c.quadraticCurveTo(0,-18,18,-24);c.lineTo(19,-8);c.quadraticCurveTo(10,-6,2,-9);c.lineTo(0,-12);c.lineTo(-2,-9);c.quadraticCurveTo(-10,-7,-19,-9);},contrast,dark,2.5);
 artPatch(ctx,c=>{c.moveTo(-18,-23);c.lineTo(-4,-19);c.lineTo(-3,-10);c.quadraticCurveTo(-11,-7,-19,-9);},contrastShade,null);
 artStroke(ctx,[[0,-19],[0,-10]],1.6,contrastShade,contrastShade,0);
 artStroke(ctx,[[-14,-10],[-7,-10]],1.8,artTint(contrast,.31),artTint(contrast,.31),0);
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
  const release=p.keeper?ARTPOSE.keeperRelease(action,p.actionTimer):{throwing:false,punting:false,windup:0,follow:0};
  const throwing=release.throwing&&near;
  const fold=recovering?Math.max(0,Math.min(1,(p.actionTimer||0)/.34)):0;
  const elbow=diving?[shoulder+sign*(side?16:14)+diveReach*.36,-50-diveReach*.30]
   :recovering?[shoulder+sign*(side?8:10),-42+fold*6]
   :throwing?[shoulder+sign*(13+release.windup*7),-61-release.windup*9]
   :[shoulder+sign*(side?12:9),-39+(sign===1?sw:-sw)*.48];
  const wrist=diving?(action==='keeperDiveCatch'
    ?[elbow[0]-sign*(4+Math.min(7,diveReach*.3)),-62-diveReach*.22]
    :[elbow[0]+sign*(side?7:11)+diveReach*.36,-57-diveReach*.55])
   :recovering?[elbow[0]-sign*(6+fold*3),-36+fold*7]
   :throwing?[elbow[0]+sign*(release.follow<.5?8:16),-79-release.windup*13+release.follow*19]
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
}

class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.dpr=1;this.screenW=1280;this.screenH=720;this.scale=1;this.offsetX=0;this.offsetY=0;this.cameraX=0;this.cameraY=0;this.time=0;this.stadiumCache=null;this.poseHeadings=new WeakMap();this.poseCycles=new WeakMap();this.frameDelta=1/60;this.inMatchDraw=false;this.resize();addEventListener('resize',()=>this.resize());}
 resize(){let w=Math.max(1,innerWidth),h=Math.max(1,innerHeight);this.screenH=720;this.screenW=Math.max(1280,720*w/h);this.dpr=Math.min(2.5,window.devicePixelRatio||1);this.canvas.width=Math.max(1,Math.round(w*this.dpr));this.canvas.height=Math.max(1,Math.round(h*this.dpr));let ratio=Math.min(w/this.screenW,h/this.screenH);this.scale=ratio*this.dpr;this.offsetX=(this.canvas.width-this.screenW*this.scale)/2;this.offsetY=(this.canvas.height-this.screenH*this.scale)/2;}
 frame(game,dt,attract=false){this.time+=Math.min(dt,.05);this.frameDelta=Math.min(.05,Math.max(0,dt));const ctx=this.ctx,s=this.scale;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#081621';ctx.fillRect(0,0,this.canvas.width,this.canvas.height);ctx.setTransform(s,0,0,s,this.offsetX,this.offsetY);ctx.save();ctx.beginPath();ctx.rect(0,0,this.screenW,this.screenH);ctx.clip();
 const zoomWide=game.options.camera==='Wide';
 const follow=game.ball||{x:WORLD.w/2,y:WORLD.h/2};
 const targetX=game.matchState==='penalty' ? F.x+F.w-this.screenW : clamp(follow.x-this.screenW/2+(follow.vx||0)*.12,0,WORLD.w-this.screenW);
 const targetY=game.matchState==='penalty' ? clamp((WORLD.goalTop+WORLD.goalBottom)/2-350,0,WORLD.h-720) : clamp(follow.y-350+(follow.vy||0)*.055,0,WORLD.h-720);
 // Time-correct exponential follow, stable on 30/60/120 Hz displays and short frame stalls.
 const cameraEase=1-Math.exp(-Math.max(0,dt)*(zoomWide?2:5.2));
 this.cameraX+=(targetX-this.cameraX)*cameraEase;
 this.cameraY+=(targetY-this.cameraY)*cameraEase;
 const shake=game.shake?(Math.random()-.5)*game.shake*22:0;
 ctx.translate(-this.cameraX+shake,-this.cameraY+shake*.5);
 this.drawStands(ctx);this.drawField(ctx,game);this.drawGoal(ctx,0,false);this.drawGoal(ctx,1,false);drawBananaPeels(ctx,game.magicHazards);drawIcePatches(ctx,game.magicHazards);
 if(game.matchState==='penalty')this.drawPenaltyPlayers(ctx,game);else{const list=game.players.slice().sort((a,b)=>a.y-b.y);this.inMatchDraw=true;try{for(let p of list)this.drawPlayer(ctx,p,game);}finally{this.inMatchDraw=false;}this.drawBall(ctx,game)}this.drawGoal(ctx,0,true);this.drawGoal(ctx,1,true);this.drawWeather(ctx,game);if(game.tornado)this.drawTornado(ctx,game.tornado);
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
  // Stadium crowd is static: paint to an offscreen canvas once instead of drawing ~2,000 arcs per frame.
  if(!this.stadiumCache){const canvas=document.createElement('canvas');canvas.width=Math.ceil(WORLD.w);canvas.height=Math.ceil(WORLD.h);const cached=canvas.getContext('2d');if(cached){this.paintStands(cached);this.stadiumCache=canvas;}}
  if(this.stadiumCache){ctx.drawImage(this.stadiumCache,0,0);return;}
  this.paintStands(ctx);
 }
 paintStands(ctx){let g=ctx.createLinearGradient(0,0,0,WORLD.h);g.addColorStop(0,'#0b2537');g.addColorStop(.10,'#17414b');g.addColorStop(.14,'#2b513b');g.addColorStop(.87,'#1b452e');g.addColorStop(1,'#0e2830');ctx.fillStyle=g;ctx.fillRect(0,0,WORLD.w,WORLD.h);
 for(let side=0;side<2;side++){let y=side?WORLD.h-72:0;ctx.fillStyle='#102937';ctx.fillRect(0,y,WORLD.w,65);for(let row=0;row<4;row++)for(let i=0;i<240;i++){const hash=(i*71+row*113)%17,x=8+i*15+(row%2)*5,yy=y+10+row*13,colors=['#7ab9bc','#f9c55c','#ea8e69','#9bc994','#c0c4d9','#738daf','#f2d2a8'];ctx.fillStyle=colors[(hash+row)%colors.length];ctx.beginPath();ctx.arc(x,yy,3+(hash%3),0,PI*2);ctx.fill()}
 ctx.fillStyle='#172328';ctx.fillRect(0,side?WORLD.h-20:50,WORLD.w,8);ctx.fillStyle='#f6db6c';for(let k=0;k<31;k++)ctx.fillRect(k*111,side?WORLD.h-18:52,70,3)}

  this.paintArenaAccents(ctx);
 }
 paintArenaAccents(ctx){
  // Arena details are painted once into the cached stands, not every animation frame.
  ctx.save();
  for(const y of [F.y-26,F.y+F.h+9]){
   const rail=ctx.createLinearGradient(0,y,0,y+18);
   rail.addColorStop(0,'#0c2862');rail.addColorStop(.5,'#2882c3');rail.addColorStop(1,'#092650');
   ctx.fillStyle=rail;ctx.fillRect(F.x-30,y,F.w+60,18);
   for(let i=0;i<10;i++){const x=F.x+18+i*(F.w-36)/10;ctx.fillStyle=i%2?'#ffe18a':'#c9f6ff';ctx.fillRect(x,y+6,Math.max(35,F.w/15),5);}
  }
  for(const x of [F.x-50,F.x+F.w+16]){
   ctx.fillStyle='#0c285a';ctx.fillRect(x,F.y-10,29,F.h+20);
   for(let i=0;i<24;i++){ctx.fillStyle=i%3===0?'#ffe18a':i%3===1?'#83e2ff':'#f5ffff';ctx.fillRect(x+7,F.y+i*F.h/24+8,15,5);}
  }
  for(const x of [F.x-42,F.x+F.w+42])for(const y of [F.y-39,F.y+F.h+39]){
   const glow=ctx.createRadialGradient(x,y,1,x,y,90);glow.addColorStop(0,'#ffffffbf');glow.addColorStop(.28,'#dcf8ff4f');glow.addColorStop(1,'#ffffff00');
   ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,90,0,PI*2);ctx.fill();
  }
  ctx.restore();
 }
 drawField(ctx,game){
   // Cache expensive wear, grass grain and pitch geometry for slower mobile GPUs.
   const key=game.terrain+'|'+game.condition;
   if(!this.fieldCache||this.fieldCacheKey!==key){
     const cache=document.createElement('canvas');
     cache.width=Math.ceil(F.w);cache.height=Math.ceil(F.h);
     const c=cache.getContext('2d',{alpha:false});
     c.translate(-F.x,-F.y);this.drawFieldArtwork(c,game);
     this.fieldCache=cache;this.fieldCacheKey=key;
   }
   ctx.drawImage(this.fieldCache,F.x,F.y);
 }
 drawFieldArtwork(ctx,game){const {terrain,condition}=game;let ground=terrain==='Classic'?['#33844a','#3e9955']:terrain==='Grass'?['#357e40','#448e49']:terrain==='Dirt'?['#9e6b42','#ac7650']:['#c7ab68','#d8bc75'];ctx.fillStyle=ground[0];ctx.fillRect(F.x,F.y,F.w,F.h);
 if(terrain!=='Classic'){for(let i=0;i<22;i++){ctx.fillStyle=ground[i%2];ctx.fillRect(F.x+i*F.w/22,F.y,F.w/22+2,F.h)}}else{for(let i=0;i<20;i++){ctx.fillStyle=i%2?'#d8ffb31b':'#124d3930';ctx.fillRect(F.x+i*F.w/20,F.y,F.w/20+1,F.h)}}
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
 if(condition!=='Good'||terrain==='Dirt'){for(let i=0;i<27;i++){let x=F.x+85+((i*349)%Math.floor(F.w-170)),y=F.y+40+((i*227)%Math.floor(F.h-80));const damp=condition==='Wet'||i%3===0;ctx.fillStyle=damp?(terrain==='Grass'?'#477e4bc7':'#776443b9'):terrain==='Grass'?'#b7924877':'#89593973';ellipse(ctx,x,y,random(i+42,18,70),random(i+48,9,32),ctx.fillStyle);if(damp&&condition==='Wet'){ellipse(ctx,x-7,y-5,24,5,'#a5d8ee38')}}}
 const top=F.y,left=F.x,right=F.x+F.w,bot=F.y+F.h,center=(left+right)/2,cy=(top+bot)/2;ctx.save();ctx.strokeStyle=terrain==='Dirt'?'#f1e1c5dd':'#eef8dce9';ctx.lineWidth=4;ctx.strokeRect(left+4,top+4,F.w-8,F.h-8);
 line(ctx,[[center,top],[center,bot]],'#f7f6dcdc',4);ctx.beginPath();ctx.arc(center,cy,156,0,PI*2);ctx.stroke();ellipse(ctx,center,cy,5,5,'#f2f8e9');
 for(let side of [0,1]){const x=side?right:left,dir=side?-1:1;ctx.strokeRect(x+(side?-310:4),cy-230,306,460);ctx.strokeRect(x+(side?-110:4),cy-130,106,260);ellipse(ctx,x+dir*205,cy,5,5,'#fff7df');ctx.beginPath();ctx.arc(x+dir*205,cy,117,side?PI/2:-PI/2,side?PI*1.5:PI/2,!side);ctx.stroke();}
 ctx.restore();
 }
 drawGoal(ctx,side,foreground){let x=side?F.x+F.w:F.x,y=WORLD.goalTop,h=WORLD.goalBottom-y,d=WORLD.goalDepth*(side?1:-1);
 if(foreground){line(ctx,[[x,y],[x+d,y+5],[x+d,y+h+3],[x,y+h]],'#f5f8dd',4);line(ctx,[[x,y],[x,y+h]],'#ffffff',6);line(ctx,[[x,y],[x+d,y+5]],'#fafcff',5);line(ctx,[[x,y+h],[x+d,y+h+3]],'#fafcff',5)}else{poly(ctx,[[x,y],[x+d,y+5],[x+d,y+h+3],[x,y+h]],'#e8f2e516','#ededde88');ctx.save();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+d,y+5);ctx.lineTo(x+d,y+h+3);ctx.lineTo(x,y+h);ctx.closePath();ctx.clip();for(let k=0;k<8;k++){let yy=y+k*h/7;line(ctx,[[x-80,yy],[x+d+80,yy]],'#c0f2f28a',1)}for(let k=0;k<12;k++){let xx=x+d*Math.sin(k/10);line(ctx,[[xx,y-20],[xx,y+h+20]],'#c0f2f270',1)}ctx.restore()}
 }
 drawPlayer(ctx,p,game){
  const team=game.getTeam(p.t);if(!team||!p.src)return;
  const moving=Math.hypot(p.dx||0,p.dy||0)>.2;
  let faceDX=p.dx||0,faceDY=p.dy||0,turnLag=0;
  // Live match characters ease their visual heading; preview snapshots remain deterministic.
  if(this.inMatchDraw&&moving&&!p.preview){
   const target=Math.atan2(faceDY,faceDX),previous=this.poseHeadings.get(p);
   const pose=ARTPOSE.easeHeading(previous,target,this.frameDelta||1/60);
   this.poseHeadings.set(p,pose.heading);faceDX=Math.cos(pose.heading);faceDY=Math.sin(pose.heading);turnLag=pose.lag;
  }
  const view=moving?VISUALFEEL.facingView(faceDX,faceDY,p.face||1):(p.visualFacing||VISUALFEEL.facingView(0,0,p.face||1));if(moving)p.visualFacing=view;
  const personality=profileFor(p.src);
  const signatureMotion=personality?sampleMotion(personality,{time:this.time,anim:p.anim,action:p.action,moving}):null;
  const oscillator=Math.sin(p.anim*(17*(signatureMotion?.runRate||1))+p.i*.35);
  // Only real-time match players are smoothed; gallery/studio renders remain deterministic.
  const gaitMoving=moving&&p.action!=='receive'&&p.action!=='pass'&&!['keeperDive','keeperDiveCatch','keeperRecover'].includes(p.action);
  const run=this.inMatchDraw&&!p.preview?ARTPOSE.settleStride(this.poseCycles.get(p),oscillator,gaitMoving,this.frameDelta):gaitMoving?oscillator:0;
  if(this.inMatchDraw&&!p.preview)this.poseCycles.set(p,run);
  const av={...avatarFor(p.src),...(p.src.appearance||{})};
  const variant=av.style%13;
  const kick=['kick','super','celebrate','defenceSuper','keeperSuper','header','hyperdash','keeperDive','keeperDiveCatch','keeperCatch','keeperThrow','keeperPunt','comboJump','assistBoost','flipKick','comboSuper','comboLand','bicycle','ballLift','superBicycle','superHead','flyingKick','defensiveBicycle','dribbleTrick'].includes(p.action);
  const isHurt=p.action==='hurt'||p.stun>.2;const isCrying=p.action==='cry'||(p.cryTimer||0)>.05;
  const sliding=p.action==='slide';
  const skin=av.skin, dark='#222033', hair=av.hair;
  const stature=[.9,.96,1,1.07,1.14][(av.stature??2)%5];
  const build=[.88,.96,1.03,1.11,1.18][(av.body??2)%5];
  const headScale=[1,.96,1.12][(av.exaggeration??1)%3];
  const lips=av.lips??av.mouth??0;
  ctx.save();ctx.translate(p.x,p.y);if(p.action==='celebrate'){const style=game.celebrationStyle||0;ctx.translate(Math.sin(this.time*(8+style)+p.i*1.5)*(10+style*2),-Math.abs(Math.sin(this.time*(6+style)+p.i))*(10+style*2));ctx.rotate(Math.sin(this.time*(5+style)+p.i*2)*(.11+style*.025))}if(p.action==='cry'){ctx.rotate(Math.sin(this.time*11+p.i)*.08);ctx.translate(0,Math.abs(Math.sin(this.time*8+p.i))*5)}
  ellipse(ctx,0,3,29,10,'#071d2a78');
  // VIZ-06: subtle turf-contact animation, visual-only and bounded.
  if(this.inMatchDraw&&moving&&!p.preview&&!p.keeper){
   const step=Math.max(0,Math.sin((Number(p.anim)||0)*17+(Number(p.i)||0)*.35));
   if(step>.55){
    ctx.save();ctx.globalAlpha=(step-.55)*.55;
    ctx.fillStyle=game.terrain==='Dirt'?'#ebc892':'#c9fca3';
    const back=(p.dx||p.face||1)<0?1:-1;
    ctx.beginPath();ctx.ellipse(back*26,4,7,2.5,0,0,PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(back*34,5,3,1.5,0,0,PI*2);ctx.fill();ctx.restore();
   }
  }
   if(p.controlled){ctx.save();const bob=Math.sin(this.time*6)*3;ctx.translate(0,-115-(p.z||0)+bob);ctx.shadowColor=p.t===0?'#ffe48b':'#8be7ff';ctx.shadowBlur=14;ctx.fillStyle=p.t===0?'#ffdb66':'#78e8ff';ctx.beginPath();ctx.moveTo(0,11);ctx.lineTo(-11,-7);ctx.lineTo(11,-7);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#092855';ctx.lineWidth=3;ctx.stroke();ctx.restore();}
  // Turf spray trails behind the sliding boot; visual-only.
   if(sliding&&this.inMatchDraw&&!p.preview&&p.slideTimer>0){
    const progress=clamp(1-(p.slideRemaining||0)/Math.max(1,p.slideBudget||104),0,1);
    ctx.save();ctx.globalAlpha=.16+.36*Math.sin(Math.PI*progress);
    ctx.fillStyle=game.terrain==='Dirt'?'#dfbc83':'#b5e38b';
    const dx=p.slideDX||p.face||1,dy=p.slideDY||0;
    for(let k=0;k<4;k++){const spread=(k-1.5)*7;ctx.beginPath();ctx.ellipse(-dx*(17+k*11)-dy*spread,4-dy*(17+k*11)+dx*spread,5+k*1.4,2+k*.5,0,0,PI*2);ctx.fill();}
    ctx.restore();
   }
   // Directional speed lines, purely visual; no effect on collision, speed or stamina.
  if(moving&&['hyperdash','dribbleTrick'].includes(p.action)){ctx.save();ctx.globalAlpha=.32;ctx.strokeStyle=p.t===0?'#ffe79a':'#8df7ff';ctx.lineWidth=3;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(-p.face*35,p.z?(-p.z+k*11):k*11);ctx.lineTo(-p.face*(62+8*Math.sin(this.time*14+k)),k*11-3);ctx.stroke()}ctx.restore();}
  if((p.firstTouchFx||0)>0){ctx.save();ctx.globalAlpha=clamp(p.firstTouchFx/.35,0,1)*.75;
   ctx.strokeStyle=p.t===0?'#fff4a4':'#a8f2ff';ctx.lineWidth=3;
   ctx.beginPath();ctx.ellipse(0,5,29+(1-p.firstTouchFx/.35)*15,12+(1-p.firstTouchFx/.35)*5,0,0,PI*2);ctx.stroke();ctx.restore();}
  if(p.controlled){ctx.strokeStyle=p.t===0?'#ffe675':'#74f2ff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,5,28,12,0,0,PI*2);ctx.stroke();ellipse(ctx,0,5,21,6,'#061d2855')}
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
   if(ratio<.2){ctx.save();ctx.globalAlpha=.35+.45*(.5+.5*Math.sin(this.time*10));ctx.strokeStyle='#ff786a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,4,39,19,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
   ctx.restore();
  }
  ctx.translate(0,-(p.z||0)-Math.abs(run)*2+(1-stature)*12);
  if(signatureMotion){ctx.translate(signatureMotion.offsetX,signatureMotion.offsetY);ctx.rotate(signatureMotion.lean);}
  if(turnLag)ctx.rotate(Math.max(-.095,Math.min(.095,turnLag*.12))); // brief counter-lean during turns
  ctx.scale((.77+((av.face%5)*.011))*build,(.78+((av.style%3)*.018))*stature);ctx.scale(view.side,1);
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
  if(!CROWN_ROYALS.draw(ctx,p,view,{run,action:p.action,phase:(kick||sliding)?Math.max(.3,Math.min(1,(p.actionTimer||0)/.3)):0})&&!CONCEPT_MODULAR.draw(ctx,p,view,{run,headScale})&&!CONCEPT_HERO.draw(ctx,p,view,{run,headScale}))CHARACTER_ART.draw(ctx,p,av,team,view,{run,isHurt,isCrying,kick,sliding,skin,dark,hair,build,stature,headScale,lips,time:this.time,signatureMotion,celebrate:p.action==='celebrate',hurt:isHurt,cry:isCrying});
 if(p.action==='hyperdash'){ctx.save();ctx.globalAlpha=.72;ctx.lineWidth=7;ctx.strokeStyle='#a0f0ff';for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(-p.face*(38+k*22),-22-k*16);ctx.lineTo(-p.face*(72+k*21),-20-k*17);ctx.stroke()}ctx.restore()}
 if(p.action==='header'&&!p.preview){ctx.save();ctx.textAlign='center';ctx.fillStyle='#fff4a1';ctx.font='900 24px sans-serif';ctx.fillText('HEAD!',0,-139);ctx.restore()}
 if(!p.preview&&(p.action==='comboJump'||p.action==='assistBoost')){ctx.save();ctx.textAlign='center';ctx.font='900 22px Arial';ctx.fillStyle='#fff2a6';ctx.fillText(p.action==='assistBoost'?'BOOST!':'TEAM JUMP!',0,-146);ctx.lineWidth=4;ctx.strokeStyle='#ffdf84';ctx.beginPath();ctx.arc(0,-68,48,0,PI*2);ctx.stroke();ctx.restore();}
 if(!p.preview&&p.comboActive&&p.comboWindow>0&&p.z>=145&&Math.abs(p.vz)<=260){ctx.save();ctx.textAlign='center';ctx.font='900 20px Arial';ctx.fillStyle='#e8ff83';ctx.strokeStyle='#163527';ctx.lineWidth=5;ctx.strokeText('✦ APEX — SUPER!',0,-170);ctx.fillText('✦ APEX — SUPER!',0,-170);ctx.restore();}
 if(!p.preview&&(p.action==='flipKick'||p.action==='comboSuper')){ctx.save();ctx.textAlign='center';ctx.font='900 25px Arial';ctx.fillStyle=p.action==='comboSuper'?'#fef47a':'#e3c8ff';ctx.fillText(p.action==='comboSuper'?'COMBO SUPER!':'FLIP KICK!',0,-145);ctx.restore();}
 if(!p.preview&&p.action==='dribbleTrick'&&p.trickFx>0){const s=dribbleStyle(p.trickStyleId);ctx.save();ctx.strokeStyle=s.color;ctx.globalAlpha=Math.min(1,p.trickFx*1.6);ctx.lineWidth=5;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(-p.face*(12+k*13),-26,14+k*8,0,Math.PI*1.35);ctx.stroke()}ctx.fillStyle=s.color;ctx.textAlign='center';ctx.font='900 16px Arial';ctx.fillText(s.name.toUpperCase(),0,-158);ctx.restore();}
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
 if(!p.preview&&(p.abilityFx||0)>0){const glow=p.action==='keeperSuper'?'#91ecff':'#ffde82';ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle=glow;ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,-45,45+i*22+(1-p.abilityFx)*55,0,PI*2);ctx.stroke()}ctx.font='900 20px sans-serif';ctx.fillStyle=glow;ctx.textAlign='center';ctx.fillText(p.action==='keeperSuper'?'★ SAVE!':'★ POWER!',0,-143);ctx.restore()}
  if(p.action==='super'){ctx.globalAlpha=.7;ctx.strokeStyle=team.secondary;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-74,47+Math.sin(this.time*20)*5,0,PI*2);ctx.stroke();ctx.globalAlpha=1}
  if(game.options.showNames&&p.controlled){ctx.save();ctx.scale(p.face||1,1);rr(ctx,-41,-127,82,17,8,'#0a233deb','#b4eff5a8');ctx.fillStyle='#fff6bb';ctx.textAlign='center';ctx.font='900 11px Arial';ctx.fillText(p.src.name.toUpperCase().slice(0,12),0,-114);ctx.restore()}
  ctx.restore();
 }
 drawPenaltyPlayers(ctx,g){let pk=g.pk;if(!pk)return;
  const cy=(WORLD.goalTop+WORLD.goalBottom)/2,at=pk.turn%2,keeper=1-at;
  let kicker=g.player(at,4),guard=g.player(keeper,0);if(!kicker||!guard)return;
  this.drawPlayer(ctx,{...kicker,x:(pk.shotTimer>0?pk.startX:pk.ballX)-72,y:(pk.shotTimer>0?pk.startY:pk.ballY)+23,face:1,controlled:false,anim:this.time},g);
  this.drawPlayer(ctx,{...guard,...ARTPOSE.penaltyKeeperVisual(pk,cy),x:F.x+F.w-30,y:pk.saveY+22,face:-1,dx:0,dy:0,visualFacing:{kind:'side',side:-1},keeper:true,controlled:false,anim:this.time},g);
  if(pk.shotTimer<=0){ellipse(ctx,F.x+F.w-12,pk.aim,9,9,'#fff49a');ctx.strokeStyle='#ffd962';ctx.lineWidth=2;ctx.beginPath();ctx.arc(F.x+F.w-12,pk.aim,17,0,PI*2);ctx.stroke()}
  const z=pk.shotTimer>0?Math.sin((1-pk.shotTimer/pk.shotMax)*PI)*55:0;
  this.drawSoccerBall(ctx,pk.ballX,pk.ballY-z,17,g.options?.ballModel||'classic',pk.shotTimer>0?(1-pk.shotTimer/pk.shotMax)*9:0);
 }
 drawBall(ctx,game){let b=game.ball;if(!b)return;ctx.save();ellipse(ctx,b.x,b.y+4,Math.max(5,15-b.z*.07),7,'#14301e66');const shot=b.shot;
 // Subtle streak for ordinary fast passes as well as special-shot trails.
 if(!shot&&!b.owner&&Math.hypot(b.vx||0,b.vy||0)>285){const v=Math.hypot(b.vx||0,b.vy||0);ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle='#f4f7e2';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b.x,b.y-b.z);ctx.lineTo(b.x-(b.vx||0)/v*30,b.y-b.z-(b.vy||0)/v*30);ctx.stroke();ctx.restore();}
 if(b.trail){for(let i=0;i<b.trail.length;i++){let p=b.trail[i],alpha=(i+1)/b.trail.length*.5;ctx.globalAlpha=alpha;if(shot){ellipse(ctx,p.x,p.y-p.z,4+i*.55,3+i*.43,shot.trail)}else{ellipse(ctx,p.x,p.y-p.z,2+i*.25,2+i*.25,'#fdf5da')}}}ctx.globalAlpha=1;
 ctx.translate(b.x,b.y-b.z);if(shot){ctx.shadowColor=shot.trail;ctx.shadowBlur=38;ellipse(ctx,0,0,25,25,shot.color+'55');ctx.shadowBlur=0;this.drawTransformation(ctx,shot,b.age);}
 else {this.drawSoccerBall(ctx,0,0,15,game.options?.ballModel||'classic',b.rollAngle||0);}
 ctx.restore();}
 drawSoccerBall(ctx,x,y,r,model='classic',rotation=0){
 const id=VISUALFEEL.validBallModel(model);ctx.save();ctx.translate(x,y);
 ctx.beginPath();ctx.arc(0,0,r,0,PI*2);ctx.clip();
 ellipse(ctx,0,0,r,r,id==='meteor'?'#fd9645':id==='ice'?'#e8fdff':id==='gold'?'#ffdb60':id==='retro'?'#bf8755':'#f4f1dd');
 // Rotate the painted panels inside a fixed circular outline: no physical radius changes.
 ctx.save();ctx.rotate(rotation);
 if(id==='classic'){poly(ctx,[[0,-r*.48],[r*.5,-r*.10],[r*.30,r*.55],[-r*.30,r*.55],[-r*.5,-r*.1]],'#182735');for(let a=0;a<5;a++){let ang=a*PI*2/5-PI/2;ellipse(ctx,Math.cos(ang)*r*.82,Math.sin(ang)*r*.82,r*.18,r*.18,'#23272b')}}
 else if(id==='meteor'){for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r*.93,a,a+.40);ctx.closePath();ctx.fillStyle=i%2?'#e64833':'#ffe39a';ctx.fill()}ellipse(ctx,0,0,r*.29,r*.29,'#bd342d')}
 else if(id==='ice'){for(let i=0;i<6;i++){let a=i*Math.PI/3;line(ctx,[[Math.cos(a)*r*.12,Math.sin(a)*r*.12],[Math.cos(a)*r*.92,Math.sin(a)*r*.92]],'#3f9fd3',r*.13)}poly(ctx,[[0,-r*.48],[r*.48,0],[0,r*.48],[-r*.48,0]],'#b8e9ff','#4a9bc8')}
 else if(id==='gold'){for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.38:r*.86;line(ctx,[[0,0],[Math.cos(a)*rr,Math.sin(a)*rr]],'#fff4af',r*.16)}const pts=Array.from({length:10},(_,i)=>{let a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.36:r*.79;return [Math.cos(a)*rr,Math.sin(a)*rr]});poly(ctx,pts,'#fff9d9','#bf8d28')}
 else {for(let i=-2;i<=2;i++){line(ctx,[[-r*1.1,i*r*.43],[r*1.1,i*r*.43]],'#784727',r*.12)}for(let i=-2;i<=2;i++){line(ctx,[[i*r*.5,-r],[i*r*.5,r]],'#e1b48a',r*.075)}}
 ctx.restore();ellipse(ctx,-r*.28,-r*.38,r*.54,r*.30,'#ffffff75');
 ctx.restore();ctx.save();ctx.translate(x,y);ctx.lineWidth=1.8;ctx.strokeStyle=id==='retro'?'#68432c':'#2a4354';ctx.beginPath();ctx.arc(0,0,r,0,PI*2);ctx.stroke();ctx.restore();
}
 drawTransformation(ctx,s,t){let id=s.id;ctx.save();ctx.rotate(Math.sin(t*24)*.12);
 const spin=t*15;
 if(id==='banana'){ctx.rotate(-.25);ctx.beginPath();ctx.arc(-2,0,21,-1.5,1.8,false);ctx.arc(8,0,18,1.65,-1.55,true);ctx.closePath();ctx.fillStyle='#ffe45c';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#386e26';ctx.stroke();poly(ctx,[[9,-10],[25,-2],[10,5]],'#4ab65d');ellipse(ctx,-11,-2,3,3,'#20242a');}
 else if(['fish','piranha','bird'].includes(id)){let bird=id==='bird';ellipse(ctx,0,0,23,14,bird?'#e3efff':'#51d5e9');poly(ctx,[[-19,0],[-36,-14],[-34,14]],bird?'#effaff':'#38a1d2');poly(ctx,[[-7,-11],[0,-26],[9,-12]],bird?'#d1e4f7':'#158bb4');ellipse(ctx,13,-4,4,4,'#14263c');if(id==='piranha'){poly(ctx,[[11,9],[22,3],[9,1]],'#f8f5d5');}if(bird){poly(ctx,[[-10,-7],[11,-32],[7,-8]],'#f6fafc');poly(ctx,[[-8,4],[8,27],[6,7]],'#fff');}}
 else if(id==='ghost'){ellipse(ctx,0,-3,21,20,'#d9f8ee');poly(ctx,[[-19,1],[-25,22],[-12,16],[-5,24],[5,16],[14,23],[22,11],[18,-3]],'#d9f8ee');ellipse(ctx,-7,-5,4,6,'#112d3e');ellipse(ctx,8,-5,4,6,'#112d3e');}
 else if(id==='ninja'){ctx.rotate(-spin*.2);poly(ctx,[[-25,-6],[-9,-16],[8,-17],[24,-7],[15,20],[-15,17]],'#8567ce','#e6d9fb');rr(ctx,-20,-7,40,14,4,'#243044');ellipse(ctx,-8,0,4,3,'#fff');ellipse(ctx,8,0,4,3,'#fff');for(let i=0;i<2;i++){ctx.globalAlpha=.28;ellipse(ctx,-45+i*90,Math.sin(t*10+i)*14,11,19,'#ae98ef')}ctx.globalAlpha=1;}
 else if(id==='nuts'){ctx.rotate(spin*.55);ellipse(ctx,0,0,19,22,'#f7c87c');ellipse(ctx,0,-7,18,15,'#b97941');poly(ctx,[[-4,-16],[6,-24],[12,-15]],'#77c158');for(let j=-1;j<=1;j++)line(ctx,[[-13,j*5],[13,j*5]],'#a6612f',2)}
 else if(id==='wheel'||id==='cactus'||id==='elephant'||id==='horse'){ctx.rotate(spin);ellipse(ctx,0,0,24,24,id==='cactus'?'#76c474':id==='elephant'?'#9acadd':id==='horse'?'#ba8b69':'#c8dbef');ellipse(ctx,0,0,15,15,'#283c4b');for(let i=0;i<8;i++){let a=i*PI/4;line(ctx,[[Math.cos(a)*5,Math.sin(a)*5],[Math.cos(a)*23,Math.sin(a)*23]],'#f2f4e1',3)}}
 else if(id==='mole'){ellipse(ctx,0,6,24,17,'#ae7a4b');ellipse(ctx,0,-8,20,17,'#daa774');ellipse(ctx,-7,-9,3,4,'#1d2528');ellipse(ctx,8,-9,3,4,'#1d2528');ellipse(ctx,0,-1,6,4,'#f1a7a3');poly(ctx,[[-16,-18],[-11,-31],[-4,-21],[4,-32],[12,-20],[16,-26],[16,-14]],'#ffcc67','#a35f45')}
 else if(id==='books'){ctx.rotate(Math.sin(t*20)*.4);rr(ctx,-22,-24,44,47,3,'#e8c684','#926534');line(ctx,[[0,-23],[0,22]],'#9c692e',3);for(let j=0;j<5;j++){line(ctx,[[-19,-15+j*7],[-3,-15+j*7]],'#946337',2);line(ctx,[[5,-15+j*7],[19,-15+j*7]],'#946337',2)}}
 else if(id==='target'){for(let i=0;i<3;i++){ctx.strokeStyle=['#ffe8ad','#e6494b','#fff4e2'][i];ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,24-i*8,0,PI*2);ctx.stroke()}ellipse(ctx,0,0,4,4,'#dd4045')}
 else if(['cannon','comet','lion','tiger'].includes(id)){poly(ctx,[[-37,15],[-26,-6],[-39,-17],[-9,-13],[4,-33],[14,-17],[31,-11],[25,3],[37,16],[9,14],[-4,27]],'#ffbb42');ellipse(ctx,6,0,18,18,'#f5553f');ellipse(ctx,12,-6,9,8,'#fff28c')}
 else if(['mega','omega','eagle','tornado','serpent'].includes(id)){ctx.rotate(spin*.35);for(let i=0;i<5;i++){ctx.rotate(PI*2/5);poly(ctx,[[0,0],[14,-8],[43,-2],[14,11]],i%2?'#bbbcff':'#7ce7ff')}ellipse(ctx,0,0,16,16,id==='omega'?'#e5a9ff':'#fff1c3');ellipse(ctx,0,0,8,8,'#263f77')}
 else this.drawSoccerBall(ctx,0,0,19);
 ctx.restore()}
 drawTornado(ctx,t){ctx.save();ctx.translate(t.x,t.y);for(let i=0;i<10;i++){let y=-i*19,rx=10+i*5;ctx.beginPath();ctx.ellipse(Math.sin(this.time*8+i)*9,y,rx,8,this.time*.5,0,PI*2);ctx.lineWidth=4+(i*.4);ctx.strokeStyle=i%2?'#c3e4e49a':'#e6f2f2a5';ctx.stroke()}ctx.restore()}
 drawWeather(ctx,g){if(!['Rain','Storm','Wind','Tornado'].includes(g.weather))return;ctx.save();let n=g.weather==='Rain'||g.weather==='Storm'?220:45;ctx.strokeStyle=g.weather==='Wind'?'#d2f6f435':'#b0d5f077';ctx.lineWidth=2;for(let i=0;i<n;i++){let x=F.x+((i*813+this.time*(g.weather==='Wind'?300:210))%F.w),y=F.y+((i*367+this.time*850)%F.h),dx=g.weather==='Wind'?44:8;line(ctx,[[x,y],[x+dx,y+(g.weather==='Wind'?0:21)]],ctx.strokeStyle,1.6)}ctx.restore()}
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
    ctx.fillText('PENALTY SHOWDOWN',640,118);
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