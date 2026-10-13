import {WORLD} from './engine.js';
import {TEAMS,SHOTS} from './data.js';
import {dribbleStyle} from './dribbles.js';
import {avatarFor} from './expanded.js';
const F=WORLD.field;const PI=Math.PI;
const rgb=(hex,a)=>hex+a;
const c=(ctx,v)=>{ctx.fillStyle=v};
function rr(ctx,x,y,w,h,r,col,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=col;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,PI*2);ctx.fillStyle=fill;ctx.fill()}
function line(ctx,pts,color,width=2){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke()}
function poly(ctx,pts,col,stroke){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.closePath();ctx.fillStyle=col;ctx.fill();if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke()}}

// Character-art primitives are deliberately independent from gameplay state.
// Every one of the 5 outlines and 13 hairstyles is deterministic and testable.
export function faceShapeOutline(ctx,face,width){
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
export function drawHairSilhouette(ctx,style,hair,dark){
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
export function drawBrows(ctx,style,dark,baseY=-2){
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
export function drawEyes(ctx,style,colorIndex,dark){
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
export function drawNose(ctx,style,color='#9a624d88'){
 switch(((style%6)+6)%6){
  case 0: ellipse(ctx,1,16,4,2,color);break;
  case 1: line(ctx,[[0,11],[5,15],[1,17]],color,2);break;
  case 2: ellipse(ctx,1,15,5,3,color);line(ctx,[[-1,17],[4,17]],color,1.5);break;
  case 3: line(ctx,[[-2,16],[3,17],[5,14]],color,2.5);break;
  case 4: ellipse(ctx,3,17,3,2,color);line(ctx,[[0,11],[3,15]],color,1.8);break;
  default: line(ctx,[[0,10],[0,17]],color,1.6);ellipse(ctx,1,18,5,2,color);break;
 }
}
export function drawLips(ctx,style,color='#7b3639'){
 switch(((style%8)+8)%8){
  case 0: line(ctx,[[-5,22],[0,24],[6,22]],color,3);break;
  case 1: ellipse(ctx,1,22,7,4,color);line(ctx,[[-4,23],[5,23]],'#fdf6dc',2);break;
  case 2: line(ctx,[[-7,21],[0,24],[9,19]],color,3);break;
  case 3: line(ctx,[[-6,20],[1,23],[8,22]],color,3);break;
  case 4: rr(ctx,-8,19,17,8,4,color);ellipse(ctx,0,22,4,2,'#f0b3b1');break;
  case 5: ellipse(ctx,0,23,8,6,color);ellipse(ctx,0,25,3,2,'#ffe0d1');break;
  case 6: line(ctx,[[-8,22],[-1,20],[8,22]],color,3);line(ctx,[[-5,25],[0,27],[5,25]],color,2.2);break;
  default: line(ctx,[[-6,24],[0,20],[6,24]],color,3);line(ctx,[[-3,23],[3,23]],'#fce1da',1.4);break;
 }
}
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.dpr=1;this.screenW=1280;this.screenH=720;this.scale=1;this.offsetX=0;this.offsetY=0;this.cameraX=0;this.cameraY=0;this.time=0;this.resize();addEventListener('resize',()=>this.resize());}
 resize(){let w=Math.max(1,innerWidth),h=Math.max(1,innerHeight);this.screenH=720;this.screenW=Math.max(1280,720*w/h);this.dpr=Math.min(2.5,window.devicePixelRatio||1);this.canvas.width=Math.max(1,Math.round(w*this.dpr));this.canvas.height=Math.max(1,Math.round(h*this.dpr));let ratio=Math.min(w/this.screenW,h/this.screenH);this.scale=ratio*this.dpr;this.offsetX=(this.canvas.width-this.screenW*this.scale)/2;this.offsetY=(this.canvas.height-this.screenH*this.scale)/2;}
 frame(game,dt,attract=false){this.time+=Math.min(dt,.05);const ctx=this.ctx,s=this.scale;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#081621';ctx.fillRect(0,0,this.canvas.width,this.canvas.height);ctx.setTransform(s,0,0,s,this.offsetX,this.offsetY);ctx.save();ctx.beginPath();ctx.rect(0,0,this.screenW,this.screenH);ctx.clip();
 const zoomWide=game.options.camera==='Wide';
 const follow=game.ball||{x:WORLD.w/2,y:WORLD.h/2};
 const targetX=game.matchState==='penalty' ? F.x+F.w-this.screenW : clamp(follow.x-this.screenW/2+(follow.vx||0)*.12,0,WORLD.w-this.screenW);
 const targetY=game.matchState==='penalty' ? clamp((WORLD.goalTop+WORLD.goalBottom)/2-350,0,WORLD.h-720) : clamp(follow.y-350+(follow.vy||0)*.055,0,WORLD.h-720);
 this.cameraX+=(targetX-this.cameraX)*Math.min(1,dt*(zoomWide?2:5.2));
 this.cameraY+=(targetY-this.cameraY)*Math.min(1,dt*(zoomWide?2:5.2));
 const shake=game.shake?(Math.random()-.5)*game.shake*22:0;
 ctx.translate(-this.cameraX+shake,-this.cameraY+shake*.5);
 this.drawStands(ctx);this.drawField(ctx,game);this.drawGoal(ctx,0,false);this.drawGoal(ctx,1,false);
 if(game.matchState==='penalty')this.drawPenaltyPlayers(ctx,game);else{const list=game.players.slice().sort((a,b)=>a.y-b.y);for(let p of list)this.drawPlayer(ctx,p,game);this.drawBall(ctx,game)}this.drawGoal(ctx,0,true);this.drawGoal(ctx,1,true);this.drawWeather(ctx,game);if(game.tornado)this.drawTornado(ctx,game.tornado);
 for(let p of game.particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ellipse(ctx,p.x,p.y-p.z,p.r,p.r,p.color)}ctx.globalAlpha=1;
 ctx.restore();if(game.flash){ctx.fillStyle=`rgba(255,249,204,${Math.min(.5,game.flash*.5)})`;ctx.fillRect(0,0,this.screenW,this.screenH)}this.drawBorder(ctx,game);this.drawMiniMap(ctx,game);if(game.celebration>0)this.drawGoalCelebration(ctx,game);ctx.restore();}
 drawGoalCelebration(ctx,game){
   const t=game.pendingKickoff?.scorer??0,team=game.getTeam(t),hero=game.goalHero||team.name;
   const elapsed=3.3-game.celebration;const styles=['CHAMPION DANCE!','THE HUMAN PYRAMID!','SILLY VICTORY LAP!','SUPER STAR POSE!','GOAL PARTY!'];const style=game.celebrationStyle||0;
   ctx.save();ctx.textAlign='center';ctx.translate(this.screenW/2,130);
   ctx.rotate(Math.sin(elapsed*7)*.019);ctx.shadowColor='#081621';ctx.shadowBlur=19;
   ctx.fillStyle='#0b263cdc';ctx.beginPath();ctx.roundRect(-285,-73,570,152,27);ctx.fill();ctx.strokeStyle='#ffdb6d';ctx.lineWidth=5;ctx.stroke();
   ctx.font='1000 60px system-ui';ctx.lineWidth=9;ctx.strokeStyle='#0d2032';ctx.strokeText('GOOOOAL!!',0,-8);ctx.fillStyle='#ffe273';ctx.fillText('GOOOOAL!!',0,-8);
   ctx.shadowBlur=0;ctx.font='900 23px system-ui';ctx.fillStyle='#f2fafc';ctx.fillText(hero.toUpperCase().slice(0,25)+'   ✦   '+team.name.toUpperCase(),0,40);ctx.font='900 21px system-ui';ctx.fillStyle='#ffe273';ctx.fillText(styles[style],0,70);ctx.fillStyle='#c8ecfc';ctx.fillText('THE OTHER TEAM IS IN TEARS!',0,124);
   for(let i=0;i<18;i++){const x=(i*79+elapsed*60)%1100-550,y=Math.sin(i*4+elapsed*7)*65+83;ctx.fillStyle=i%3?'#b5f6e4':'#ffad5d';ctx.fillRect(x,y,8,20)}
   ctx.restore();
 }
 drawStands(ctx){let g=ctx.createLinearGradient(0,0,0,WORLD.h);g.addColorStop(0,'#0b2537');g.addColorStop(.10,'#17414b');g.addColorStop(.14,'#2b513b');g.addColorStop(.87,'#1b452e');g.addColorStop(1,'#0e2830');ctx.fillStyle=g;ctx.fillRect(0,0,WORLD.w,WORLD.h);
 for(let side=0;side<2;side++){let y=side?WORLD.h-72:0;ctx.fillStyle='#102937';ctx.fillRect(0,y,WORLD.w,65);for(let row=0;row<4;row++)for(let i=0;i<240;i++){const hash=(i*71+row*113)%17,x=8+i*15+(row%2)*5,yy=y+10+row*13,colors=['#7ab9bc','#f9c55c','#ea8e69','#9bc994','#c0c4d9','#738daf','#f2d2a8'];ctx.fillStyle=colors[(hash+row)%colors.length];ctx.beginPath();ctx.arc(x,yy,3+(hash%3),0,PI*2);ctx.fill()}
 ctx.fillStyle='#172328';ctx.fillRect(0,side?WORLD.h-20:50,WORLD.w,8);ctx.fillStyle='#f6db6c';for(let k=0;k<31;k++)ctx.fillRect(k*111,side?WORLD.h-18:52,70,3)}
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
 drawFieldArtwork(ctx,game){const {terrain,condition}=game;let ground=terrain==='Classic'?['#6f8c3b','#738c3e']:terrain==='Grass'?['#357e40','#448e49']:terrain==='Dirt'?['#9e6b42','#ac7650']:['#c7ab68','#d8bc75'];ctx.fillStyle=ground[0];ctx.fillRect(F.x,F.y,F.w,F.h);
 if(terrain!=='Classic'){for(let i=0;i<22;i++){ctx.fillStyle=ground[i%2];ctx.fillRect(F.x+i*F.w/22,F.y,F.w/22+2,F.h)}}
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
     ctx.closePath();ctx.fillStyle=i%4===0?'#cd8d31a0':i%4===1?'#dba04caa':'#c98936b0';ctx.fill();
     ctx.strokeStyle='#dcac60a0';ctx.lineWidth=6;ctx.stroke();
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
  const run=moving?Math.sin(p.anim*17+p.i*.35):0;
  const av={...avatarFor(p.src),...(p.src.appearance||{})};
  const variant=av.style%13;
  const kick=['kick','super','celebrate','defenceSuper','keeperSuper','header','hyperdash','keeperDive','comboJump','assistBoost','flipKick','comboSuper','comboLand','bicycle','flyingKick','defensiveBicycle','dribbleTrick'].includes(p.action);
  const isHurt=p.action==='hurt'||p.stun>.2;const isCrying=p.action==='cry'||(p.cryTimer||0)>.05;
  const sliding=p.action==='slide';
  const skin=av.skin, dark='#222033', hair=av.hair;
  const stature=[.9,.96,1,1.07,1.14][(av.stature??2)%5];
  const build=[.88,.96,1.03,1.11,1.18][(av.body??2)%5];
  const headScale=[1,.96,1.12][(av.exaggeration??1)%3];
  const lips=av.lips??av.mouth??0;
  ctx.save();ctx.translate(p.x,p.y);if(p.action==='celebrate'){const style=game.celebrationStyle||0;ctx.translate(Math.sin(this.time*(8+style)+p.i*1.5)*(10+style*2),-Math.abs(Math.sin(this.time*(6+style)+p.i))*(10+style*2));ctx.rotate(Math.sin(this.time*(5+style)+p.i*2)*(.11+style*.025))}if(p.action==='cry'){ctx.rotate(Math.sin(this.time*11+p.i)*.08);ctx.translate(0,Math.abs(Math.sin(this.time*8+p.i))*5)}
  ellipse(ctx,0,3,26,8,'#09271a59');
  if(p.controlled){ctx.strokeStyle=p.t===0?'#ffe675':'#74f2ff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,5,28,12,0,0,PI*2);ctx.stroke();ellipse(ctx,0,5,21,6,'#061d2855')}
  ctx.translate(0,-(p.z||0)-Math.abs(run)*2+(1-stature)*12);
  ctx.scale((.77+((av.face%5)*.011))*build,(.78+((av.style%3)*.018))*stature);ctx.scale(p.face||1,1);
  if(sliding){ctx.translate(3,12);ctx.rotate(-.44)}if(p.action==='keeperDive'){ctx.translate((p.face||1)*20,4);ctx.rotate((p.face||1)*.54)}if(p.action==='bicycle')ctx.rotate(-p.face*.64);if(p.action==='flyingKick')ctx.rotate(-p.face*.28);if(p.action==='defensiveBicycle')ctx.rotate(-p.face*.76);
  if(kick)ctx.rotate(-.045);
  const stride=(p.action==='celebrate'?Math.sin(this.time*11+p.i):run)*12;
  // Legs and footwear with clearly separated stepping animation.
  ctx.lineCap='round';ctx.lineJoin='round';
  line(ctx,[[-12,-14],[-15+stride,-1]],dark,10);line(ctx,[[12,-14],[14-stride,-1]],dark,10);
  line(ctx,[[-12,-14],[-14+stride,-1]],skin,6);line(ctx,[[12,-14],[14-stride,-1]],skin,6);
  rr(ctx,-23+stride,0,25,12,5,'#172536','#0b121c');rr(ctx,1-stride,0,25,12,5,'#172536','#0b121c');
  rr(ctx,-22+stride,0,21,6,3,'#f8f1de');rr(ctx,2-stride,0,21,6,3,'#f8f1de');
  line(ctx,[[-18+stride,3],[-6+stride,3]],'#26394d',1.8);line(ctx,[[6-stride,3],[19-stride,3]],'#26394d',1.8);
  // Rounded square lower body, striped socks and chunkier cartoon shorts.
  rr(ctx,-20,-20,40,23,7,team.secondary,dark);rr(ctx,-18,-19,36,7,5,team.primary);line(ctx,[[-19,-10],[-3,-10]],team.primary,3);line(ctx,[[3,-10],[19,-10]],team.primary,3);rr(ctx,-16,-7,12,7,3,team.trim||'#f6f0d8');rr(ctx,4,-7,12,7,3,team.trim||'#f6f0d8');
  // Huge jersey body with stronger graphic trim, collar and shine.
  rr(ctx,-26,-57,52,44,13,dark);
  rr(ctx,-22,-54,44,37,10,team.primary);
  rr(ctx,-24,-52,46,7,5,team.secondary);
  poly(ctx,[[-10,-54],[0,-46],[10,-54],[5,-54],[0,-50],[-5,-54]],team.secondary);
  rr(ctx,-21,-52,8,30,4,team.secondary);
  rr(ctx,13,-52,7,30,4,team.trim||team.secondary);
  rr(ctx,-2,-54,4,37,2,'#ffffff14');
  ellipse(ctx,-4,-48,17,5,'#ffffff28');
  line(ctx,[[-16,-20],[13,-20]],'#ffffff20',2);rr(ctx,17,-48,5,10,2,team.trim||team.secondary);
  rr(ctx,-5,-43,11,5,2,team.secondary);rr(ctx,-18,-51,6,10,2,team.secondary);rr(ctx,12,-51,6,10,2,team.trim||team.secondary);
  ellipse(ctx,-13,-36,4,4,team.secondary);ellipse(ctx,13,-36,4,4,team.trim||team.secondary);
  ctx.font='1000 20px Arial,sans-serif';ctx.textAlign='center';ctx.fillStyle='#1b203eaa';ctx.fillText(String(p.src.num),1,-20);ctx.fillStyle='#fff8dc';ctx.fillText(String(p.src.num),0,-22);
  // Expressive exaggerated arms that move independently.
  const swing=p.action==='celebrate'?45: kick?20:sliding?-13:run*13;
  line(ctx,[[-22,-48],[-32,-30-swing]],dark,14);line(ctx,[[22,-48],[32,-30+swing]],dark,14);
  line(ctx,[[-23,-48],[-32,-29-swing]],team.primary,10);line(ctx,[[23,-48],[32,-29+swing]],team.primary,10);
  ellipse(ctx,-33,-27-swing,8.5,8.5,dark);ellipse(ctx,33,-27+swing,8.5,8.5,dark);
  ellipse(ctx,-33,-27-swing,6,6,p.keeper?'#fff0cb':skin);ellipse(ctx,33,-27+swing,6,6,p.keeper?'#fff0cb':skin);
  // The head is over half the character's width: classic slapstick chibi silhouette.
  ctx.save();ctx.translate(0,-81);ctx.scale(headScale,headScale);
  if(kick)ctx.rotate(.07);if(isHurt)ctx.rotate(Math.sin(p.anim*27)*.09);
  const width=[30,33,29,34,29][av.face%5];
  // Five actual face geometries; shadow, contour, chin and ears share a stable coordinate system.
  faceShapeOutline(ctx,av.face,width+3);ctx.fillStyle=dark;ctx.fill();
  faceShapeOutline(ctx,av.face,width);ctx.fillStyle=skin;ctx.fill();
  ellipse(ctx,-width+2,4,5,9,dark);ellipse(ctx,width-2,4,5,9,dark);
  ellipse(ctx,-width+2,4,3,6,skin);ellipse(ctx,width-2,4,3,6,skin);
  ellipse(ctx,-width+3,4,1.1,3,'#9b5e4d80');ellipse(ctx,width-3,4,1.1,3,'#9b5e4d80');
  ellipse(ctx,9,13,16,10,'#fff7ed22');ellipse(ctx,-12,-7,14,5,'#ffffff21');
  drawHairSilhouette(ctx,av.style,hair,dark);
  if(variant===2||variant===5||variant===8||av.accessory===1){rr(ctx,-30,-16,60,10,3,variant===2?'#f7f4e7':'#edeeeb',dark);rr(ctx,19,-16,11,9,2,team.primary)}
  // Signature facial hair, individual nose shapes and face marks.
  if(av.beard===2||av.beard===3||/Salah|Messi|Benzema|Giroud|Modrić|De Bruyne|Ronaldo Nazário/i.test(p.src.name)){
    ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-19,16);ctx.quadraticCurveTo(-20,35,0,35);ctx.quadraticCurveTo(21,33,20,16);ctx.lineTo(13,18);ctx.quadraticCurveTo(0,29,-13,18);ctx.fill();
  }
  if(av.beard===1||av.beard===4)rr(ctx,-10,20,19,3,2,hair);
  if(av.freckles===2)for(const fx of [-22,-17,16,21])ellipse(ctx,fx,15,1.4,1.4,'#aa6351');
  if(av.scar===2)line(ctx,[[19,-1],[24,11]],'#bb6b5b',2);
  if(av.accessory===4){line(ctx,[[-26,9],[-4,9]],'#37343d',3);line(ctx,[[5,9],[26,9]],'#37343d',3)}
  if(av.accessory===5){rr(ctx,-28,-15,55,8,2,'#eee4b7',dark)}
  // Expanded facial feature set: 20 eye styles, 20 brows, 6 nose shapes, 8 lip shapes and six iris colors.
  drawNose(ctx,av.nose,'#9a624d88');
  const blink=!isHurt&&!isCrying&&p.action!=='super'&&Math.sin(this.time*1.12+(p.i||0)*2.19)>0.987;
  const browY=isCrying?1:isHurt?2:(p.action==='super'?-4:-1)+((av.brows||0)%5-2)*.55;
  drawBrows(ctx,av.brows,dark,browY);
  if(blink){line(ctx,[[-23,9],[-9,10]],dark,3.5);line(ctx,[[8,10],[22,9]],dark,3.5)}
  else if(isHurt){line(ctx,[[-21,6],[-12,15]],dark,4);line(ctx,[[-12,6],[-21,15]],dark,4);line(ctx,[[10,6],[20,15]],dark,4);line(ctx,[[20,6],[10,15]],dark,4)}
  else if(p.action==='super'){ellipse(ctx,-14,8,7,9,'#fff4e5');ellipse(ctx,13,8,7,9,'#fff4e5');ellipse(ctx,-12,7,3,6,dark);ellipse(ctx,11,7,3,6,dark)}
  else drawEyes(ctx,av.eyes,av.eyeColor??0,dark);
  // Sweaty cheeks and comedic face shape.
  ellipse(ctx,-22,18,6,3,'#e8767b66');ellipse(ctx,22,18,6,3,'#e8767b66');
  if(isCrying){ellipse(ctx,0,23,11,12,'#793446');ellipse(ctx,0,26,5,7,'#1e1d36');for(const side of [-1,1]){ellipse(ctx,side*15,21+Math.sin(this.time*15+side)*2,4,11,'#8de2ffdd');ellipse(ctx,side*17,38+Math.sin(this.time*20+side)*4,3,5,'#b5f0ff');}}else if(isHurt){ellipse(ctx,0,22,7,9,'#8e343f');ellipse(ctx,0,26,4,3,'#e66d7c')}
  else if(kick||Math.abs(run)>.75){ellipse(ctx,1,22,6,6,'#682e39');ellipse(ctx,0,25,4,2,'#ffe0d1')}
  else{drawLips(ctx,lips,'#7b3639')}
  if(p.action==='celebrate'){ellipse(ctx,0,23,10,9,'#662b40');rr(ctx,-8,23,16,4,1,'#fff9e4');for(let j=0;j<5;j++)ellipse(ctx,-34+j*14,-40+Math.sin(this.time*12+j)*5,2.4,2.4,j%2?'#ffeb70':'#fff')}

  if(isHurt){ctx.save();ctx.rotate(this.time*4);ctx.font='22px sans-serif';ctx.fillText('✦',-33,-38);ctx.fillText('★',30,-42);ctx.restore();}if((p.fatigue||0)>.50){
   const breath=Math.sin(this.time*(5+((p.fatigue||0)*5))+p.i);
   ellipse(ctx,-27,18,4+Math.max(0,breath)*1.5,6+Math.max(0,breath)*2,'#b3f2ffaa');
   if((p.fatigue||0)>.75){ctx.fillStyle='#e9ffff';ctx.font='bold 18px sans-serif';ctx.fillText('💦',20,-51);}
  }
  if(variant===2||variant===8||variant===11){ellipse(ctx,-31,21,3,6,'#a4efff');line(ctx,[[-31,15],[-33,12]],'#e2f9ff',1.4)}
  ctx.restore();
  if(p.action==='hyperdash'){ctx.save();ctx.globalAlpha=.72;ctx.lineWidth=7;ctx.strokeStyle='#a0f0ff';for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(-p.face*(38+k*22),-22-k*16);ctx.lineTo(-p.face*(72+k*21),-20-k*17);ctx.stroke()}ctx.restore()}
 if(p.action==='header'){ctx.save();ctx.textAlign='center';ctx.fillStyle='#fff4a1';ctx.font='900 24px sans-serif';ctx.fillText('HEAD!',0,-139);ctx.restore()}
 if(p.action==='comboJump'||p.action==='assistBoost'){ctx.save();ctx.textAlign='center';ctx.font='900 22px Arial';ctx.fillStyle='#fff2a6';ctx.fillText(p.action==='assistBoost'?'BOOST!':'TEAM JUMP!',0,-146);ctx.lineWidth=4;ctx.strokeStyle='#ffdf84';ctx.beginPath();ctx.arc(0,-68,48,0,PI*2);ctx.stroke();ctx.restore();}
 if(p.comboActive&&p.comboWindow>0&&p.z>=145&&Math.abs(p.vz)<=260){ctx.save();ctx.textAlign='center';ctx.font='900 20px Arial';ctx.fillStyle='#e8ff83';ctx.strokeStyle='#163527';ctx.lineWidth=5;ctx.strokeText('✦ APEX — SUPER!',0,-170);ctx.fillText('✦ APEX — SUPER!',0,-170);ctx.restore();}
 if(p.action==='flipKick'||p.action==='comboSuper'){ctx.save();ctx.textAlign='center';ctx.font='900 25px Arial';ctx.fillStyle=p.action==='comboSuper'?'#fef47a':'#e3c8ff';ctx.fillText(p.action==='comboSuper'?'COMBO SUPER!':'FLIP KICK!',0,-145);ctx.restore();}
 if(p.action==='dribbleTrick'&&p.trickFx>0){const s=dribbleStyle(p.trickStyleId);ctx.save();ctx.strokeStyle=s.color;ctx.globalAlpha=Math.min(1,p.trickFx*1.6);ctx.lineWidth=5;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(-p.face*(12+k*13),-26,14+k*8,0,Math.PI*1.35);ctx.stroke()}ctx.fillStyle=s.color;ctx.textAlign='center';ctx.font='900 16px Arial';ctx.fillText(s.name.toUpperCase(),0,-158);ctx.restore();}
 if(['bicycle','flyingKick','defensiveBicycle','dribbleTrick'].includes(p.action)){ctx.save();ctx.font='900 20px Arial';ctx.textAlign='center';ctx.fillStyle=p.action==='bicycle'?'#e8b8ff':['flyingKick','defensiveBicycle'].includes(p.action)?'#ffe3a8':'#9ff4dc';ctx.fillText(p.action==='bicycle'?'BICYCLE!':p.action==='flyingKick'?'FLYING KICK!':p.action==='defensiveBicycle'?'AIR SPIN!':'✦',0,-144);ctx.restore();}
 if(p.action==='comboLand'){ctx.save();ctx.strokeStyle='#f5ce5f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,3,62,0,PI*2);ctx.stroke();ctx.restore();}
 if(p.action==='keeperDive'){ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle='#b8f6ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-42,63,0,PI*2);ctx.stroke();ctx.restore()}
 if((p.abilityFx||0)>0){const glow=p.action==='keeperSuper'?'#91ecff':'#ffde82';ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle=glow;ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,-45,45+i*22+(1-p.abilityFx)*55,0,PI*2);ctx.stroke()}ctx.font='900 20px sans-serif';ctx.fillStyle=glow;ctx.textAlign='center';ctx.fillText(p.action==='keeperSuper'?'★ SAVE!':'★ POWER!',0,-143);ctx.restore()}
  if(p.action==='super'){ctx.globalAlpha=.7;ctx.strokeStyle=team.secondary;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-74,47+Math.sin(this.time*20)*5,0,PI*2);ctx.stroke();ctx.globalAlpha=1}
  if(game.options.showNames&&p.controlled){ctx.save();ctx.scale(p.face||1,1);rr(ctx,-41,-127,82,17,8,'#0a233deb','#b4eff5a8');ctx.fillStyle='#fff6bb';ctx.textAlign='center';ctx.font='900 11px Arial';ctx.fillText(p.src.name.toUpperCase().slice(0,12),0,-114);ctx.restore()}
  ctx.restore();
 }
 drawPenaltyPlayers(ctx,g){let pk=g.pk;if(!pk)return;
  const cy=(WORLD.goalTop+WORLD.goalBottom)/2,at=pk.turn%2,keeper=1-at;
  let kicker=g.player(at,4),guard=g.player(keeper,0);if(!kicker||!guard)return;
  this.drawPlayer(ctx,{...kicker,x:(pk.shotTimer>0?pk.startX:pk.ballX)-72,y:(pk.shotTimer>0?pk.startY:pk.ballY)+23,face:1,controlled:false,anim:this.time},g);
  this.drawPlayer(ctx,{...guard,x:F.x+F.w-30,y:pk.saveY+22,face:-1,controlled:false,anim:this.time},g);
  if(pk.shotTimer<=0){ellipse(ctx,F.x+F.w-12,pk.aim,9,9,'#fff49a');ctx.strokeStyle='#ffd962';ctx.lineWidth=2;ctx.beginPath();ctx.arc(F.x+F.w-12,pk.aim,17,0,PI*2);ctx.stroke()}
  const z=pk.shotTimer>0?Math.sin((1-pk.shotTimer/pk.shotMax)*PI)*55:0;
  this.drawSoccerBall(ctx,pk.ballX,pk.ballY-z,17);
 }
 drawBall(ctx,game){let b=game.ball;if(!b)return;ctx.save();ellipse(ctx,b.x,b.y+4,Math.max(5,15-b.z*.07),7,'#14301e66');const shot=b.shot;
 if(b.trail){for(let i=0;i<b.trail.length;i++){let p=b.trail[i],alpha=(i+1)/b.trail.length*.5;ctx.globalAlpha=alpha;if(shot){ellipse(ctx,p.x,p.y-p.z,4+i*.55,3+i*.43,shot.trail)}else{ellipse(ctx,p.x,p.y-p.z,2+i*.25,2+i*.25,'#fdf5da')}}}ctx.globalAlpha=1;
 ctx.translate(b.x,b.y-b.z);if(shot){ctx.shadowColor=shot.trail;ctx.shadowBlur=38;ellipse(ctx,0,0,25,25,shot.color+'55');ctx.shadowBlur=0;this.drawTransformation(ctx,shot,b.age);}
 else {this.drawSoccerBall(ctx,0,0,15);}
 ctx.restore();}
 drawSoccerBall(ctx,x,y,r){ctx.save();ctx.translate(x,y);ellipse(ctx,0,0,r,r,'#f4f1dd');ellipse(ctx,-r*.2,-r*.35,r*.6,r*.35,'#ffffff66');let polys=[[[0,-r*.48],[r*.5,-r*.10],[r*.30,r*.55],[-r*.30,r*.55],[-r*.5,-r*.1]]];poly(ctx,polys[0],'#182735');for(let a=0;a<5;a++){let ang=a*PI*2/5-PI/2;ellipse(ctx,Math.cos(ang)*r*.82,Math.sin(ang)*r*.82,r*.17,r*.16,'#23272b')}ctx.strokeStyle='#243038';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,PI*2);ctx.stroke();ctx.restore()}
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
  drawPK(ctx,g){let pk=g.pk;if(!pk)return;ctx.save();ctx.translate(this.screenW/2-640,0);rr(ctx,400,90,480,66,13,'#092635ea','#eedc75');ctx.textAlign='center';ctx.fillStyle='#fff9c5';ctx.font='900 25px system-ui';ctx.fillText('PENALTY SHOWDOWN',640,118);ctx.font='800 16px system-ui';ctx.fillText(`${pk.kicks[0].map(x=>x?'●':'×').join(' ')}   •   ${pk.kicks[1].map(x=>x?'●':'×').join(' ')}`,640,140);rr(ctx,480,606,320,55,12,'#092635df','#fff8');ctx.fillStyle='#fff';ctx.font='900 15px system-ui';ctx.fillText(`${pk.turn%2===0||g.humans>=2?"AIM ↑ ↓  •  SHOOT J  •  ":"DEFEND ↑ ↓  •  "}${Math.ceil(pk.timer)}s`,640,637);ctx.restore()}
}
function random(seed,a,b){return a+((Math.sin(seed*122.4)*49833)%1+1)%1*(b-a)}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
