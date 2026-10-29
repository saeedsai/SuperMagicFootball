// SuperMagicFootball — Character Art III. Hand-crafted directional cartoon painter.
// All appearance values are backwards compatible with Player Studio / saved rosters.
// Strict graphics-only contract: no gameplay state mutations, hitbox or physics edits.
const CHARACTER_ART=(()=>{
 const TAU=Math.PI*2, norm=(v,n)=>((Math.trunc(+v||0)%n)+n)%n;
 const safe=v=>/^#[a-f\d]{6}$/i.test(v||'')?v:'#7d6554';
 const RGB=h=>[1,3,5].map(i=>parseInt(safe(h).slice(i,i+2),16));
 const blend=(h,n)=>'#'+RGB(h).map(v=>Math.max(0,Math.min(255,Math.round(n>=0?v+(255-v)*n:v*(1+n)))).toString(16).padStart(2,'0')).join('');
 const ink=(h,a)=>`rgba(${RGB(h).join(',')},${a})`;
 const grad=(c,x,y,u,v,stops)=>{let g=c.createLinearGradient(x,y,u,v);for(const [s,col] of stops)g.addColorStop(s,col);return g};
 const fill=(c,fn,col,border=null,w=1.5)=>{c.beginPath();fn(c);c.closePath();c.fillStyle=col;c.fill();if(border){c.lineWidth=w;c.lineJoin='round';c.strokeStyle=border;c.stroke()}};
 const oval=(c,x,y,w,h,col,border=null,lw=1.4)=>fill(c,p=>p.ellipse(x,y,Math.max(.15,w),Math.max(.15,h),0,0,TAU),col,border,lw);
 const stroke=(c,points,col,width=1.5,outline=null)=>{c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.lineJoin='round';c.lineCap='round';if(outline){c.lineWidth=width+2.2;c.strokeStyle=outline;c.stroke()}c.lineWidth=width;c.strokeStyle=col;c.stroke()};
 const dark='#263149';
 const faces=[{w:28,j:21,chin:34},{w:30,j:26,chin:35},{w:26,j:16,chin:38},{w:30,j:26,chin:33},{w:27,j:20,chin:40}];
 const irisColors=['#493325','#65462f','#57799d','#4a866d','#887297','#b99149'];
 const views={front:{depth:1},quarterFront:{depth:.83},side:{depth:.64},quarterBack:{depth:.85},back:{depth:1}};
 function facePath(c,k,f){
  const w=f.w,j=f.j,chin=f.chin;
  c.moveTo(0,-34);
  if(k==='front'){
   c.bezierCurveTo(16,-37,w+3,-27,w+5,-8);c.bezierCurveTo(w+9,9,w+2,23,j,chin-6);
   c.quadraticCurveTo(j-8,chin+2,0,chin+1);c.quadraticCurveTo(-j+8,chin+2,-j,chin-6);
   c.bezierCurveTo(-w-2,23,-w-9,9,-w-5,-8);c.bezierCurveTo(-w-3,-27,-16,-37,0,-34);
  } else if(k==='quarterFront'){
   c.bezierCurveTo(18,-40,w+6,-27,w+7,-6);c.quadraticCurveTo(w+11,8,w+2,16);
   c.bezierCurveTo(w,24,j+2,chin-1,7,chin+1);c.quadraticCurveTo(-14,chin-1,-24,17);
   c.bezierCurveTo(-32,3,-29,-25,-16,-33);c.quadraticCurveTo(-7,-38,0,-34);
  }else if(k==='side'){
   c.bezierCurveTo(14,-39,w+4,-25,w+6,-11);c.quadraticCurveTo(w+3,-5,w-1,0);
   c.quadraticCurveTo(w+10,8,w+10,11);c.quadraticCurveTo(w+9,16,w+2,17);
   c.quadraticCurveTo(j+10,24,j+3,chin-4);c.quadraticCurveTo(10,chin+5,-11,chin-2);
   c.bezierCurveTo(-33,20,-32,-21,-16,-32);c.quadraticCurveTo(-9,-37,0,-34);
  }else if(k==='quarterBack'){
   c.bezierCurveTo(19,-38,w+7,-29,w+7,-7);c.quadraticCurveTo(w+9,20,j+3,chin-6);
   c.quadraticCurveTo(3,chin+6,-18,chin-7);c.quadraticCurveTo(-30,22,-29,1);
   c.quadraticCurveTo(-32,-25,-15,-32);c.quadraticCurveTo(-7,-37,0,-34);
  }else{
   c.bezierCurveTo(18,-38,w+9,-27,w+9,-3);c.quadraticCurveTo(w+8,21,j+6,chin-5);
   c.quadraticCurveTo(0,chin+7,-j-6,chin-5);c.quadraticCurveTo(-w-8,21,-w-9,-3);
   c.bezierCurveTo(-w-9,-27,-18,-38,0,-34);
  }
 }
 function faceSilhouette(c,k,f,col,border=dark,w=2.3){fill(c,p=>facePath(p,k,f),col,border,w)}
 function ear(c,x,y,skin,scale=1){
  c.save();c.translate(x,y);c.scale(scale,scale);
  oval(c,0,0,6.9,10.2,grad(c,-6,-8,5,8,[[0,blend(skin,.26)],[.45,skin],[1,blend(skin,-.28)]]),dark,1.75);
  fill(c,p=>{p.moveTo(2,-6);p.bezierCurveTo(-4,-6,-4,0,0,3);p.quadraticCurveTo(3,4,2,7);p.quadraticCurveTo(-3,6,-4,1);p.quadraticCurveTo(-5,-8,2,-6)},ink(blend(skin,-.35),.75));
  oval(c,.8,3.8,1.7,2.4,blend(skin,.12));
  c.restore();
 }
 function skinHead(c,k,f,skin){
  if(k==='front'){ear(c,-f.w-2,7,blend(skin,-.15),.95);ear(c,f.w+2,7,skin,1.0)}
  if(k==='quarterFront')ear(c,-23,8,blend(skin,-.1),.82);
  if(k==='side')ear(c,-19,7,skin,.99);
  const gradient=grad(c,-35,-23,38,23,[[0,blend(skin,.36)],[.19,blend(skin,.13)],[.54,skin],[.81,blend(skin,-.12)],[1,blend(skin,-.29)]]);
  faceSilhouette(c,k,f,gradient,dark,2.5);
  c.save();c.beginPath();facePath(c,k,f);c.closePath();c.clip();
  // Warm translucency, secondary shadow and a curved cheek highlight.
  const front=k==='front',back=k==='back'||k==='quarterBack';
  if(!back){
   oval(c,front?-18:0,-4,16,20,ink('#ffffff',.12));
   oval(c,front?-19:17,17,8.5,4.6,ink('#d87970',.115));
   if(front)oval(c,18,17,8.5,4.6,ink('#c76865',.085));
   fill(c,p=>{p.moveTo(16,-24);p.bezierCurveTo(34,-19,34,5,23,17);p.quadraticCurveTo(25,0,16,-24)},ink(blend(skin,-.45),.09));
  }else{
   oval(c,-5,-16,18,22,ink('#ffffff',.06));
   oval(c,21,7,7,21,ink(blend(skin,-.44),.11));
  }
  c.restore();
  if(k==='quarterBack')ear(c,24,8,blend(skin,-.08),.7);
 }
 function eye(c,x,y,eye,eyeColor,scale=1,near=true,closed=false){
  const s=norm(eye,20),iris=irisColors[norm(eyeColor,6)];
  const widen=[.95,1.10,.91,1.05,1.15][s%5],open=[1.05,.90,1.12,.80,1.02][Math.floor(s/4)%5];
  const w=6.7*widen*scale,h=6.1*open*scale;
  c.save();c.translate(x,y);
  if(closed){stroke(c,[[-w,0],[-w*.3,2],[w*.3,1],[w,0]],'#3f3640',1.9);c.restore();return}
  // Volume of the upper eyelid: almond shape with white sclera, iris, reflected highlights.
  oval(c,0,-1,w+1,h+1.3,ink(blend('#65473a',-.17),.26));
  fill(c,p=>{p.moveTo(-w,0);p.bezierCurveTo(-w*.67,-h*1.8,w*.50,-h*1.75,w,.25);
   p.bezierCurveTo(w*.78,h*.95,-w*.45,h*1.2,-w,0)},grad(c,-w,-h,w,h,[[0,'#ffffff'],[.7,'#fdf9ee'],[1,'#e8ecf0']]),dark,1.35);
  oval(c,.55,1.0,w*.47,h*.78,grad(c,-2,-h*.5,3,h*.7,[[0,blend(iris,.30)],[.45,iris],[1,blend(iris,-.46)]]),iris,.75);
  oval(c,.78,1.1,w*.26,h*.58,'#172332');
  oval(c,-1,-1.2,1.65*scale,2.1*scale,'#ffffff');oval(c,2.5,3, .65*scale,.8*scale,ink('#ffffff',.76));
  fill(c,p=>{p.moveTo(-w-1,-.3);p.bezierCurveTo(-w*.70,-h*1.95,w*.58,-h*1.95,w+1,-.3);p.quadraticCurveTo(0,-h*1.32,-w-1,-.3)},dark);
  stroke(c,[[-w*.80,h*.67],[-w*.1,h*.97],[w*.75,h*.45]],ink('#865c4c',.42),.7);
  c.restore();
 }
 function brows(c,x,y,style,hair,scale=1){
  const s=norm(style,20), arch=(s%5-2)*.73, tail=(Math.floor(s/5)-1.5)*.64;
  const col=blend(hair,-.55),thick=(2.3+(s%4)*.30)*scale;
  stroke(c,[[x-7*scale,y+1.1+arch],[x-2*scale,y-1.9*scale-arch],[x+3*scale,y-3.5*scale+tail],[x+7.3*scale,y+tail*.6]],col,thick);
  stroke(c,[[x-4*scale,y-2],[x+1.4*scale,y-4]],ink(blend(hair,.35),.31),.70);
 }
 function nose(c,x,y,style,skin,angle){
  const s=norm(style,6),width=[2.9,3.5,4.6,3.1,5.6,3.8][s];
  const sh=blend(skin,-.36),hi=blend(skin,.25);
  c.save();c.translate(x,y);
  if(angle==='front'){
   if(s===1||s===5)stroke(c,[[0,-5-(s===5?2:0)],[1,-1],[.7,1.9]],ink(sh,.65),1.25);
   oval(c,0,2,width,2.2+s*.09,grad(c,-width,-3,width,4,[[0,hi],[.52,skin],[1,blend(skin,-.23)]]));
   oval(c,-width*.67,3.25,.77,.6,sh);oval(c,width*.67,3.25,.77,.6,sh);
   if(s===3)stroke(c,[[-3,1],[1,3],[4,1]],ink(sh,.67),1.05);
   if(s===4)stroke(c,[[-5,4],[0,4.6],[5,4]],ink(sh,.63),.9);
   oval(c,-width*.35,.9,1.5,.8,ink('#ffffff',.36));
  }else{
   const projection=[3.3,4.1,5.2,4.6,6.4,4.0][s],rise=[4,5,3,5,4,7][s];
   fill(c,p=>{p.moveTo(-3,-rise);p.quadraticCurveTo(.5,-rise*.6,2,-1.5);p.quadraticCurveTo(2+projection*.55,1,projection+2,3);
    p.quadraticCurveTo(projection+3.2,5,1.8,5);p.quadraticCurveTo(-1,3,-3,1.2)},grad(c,-3,-3,projection+3,5,[[0,hi],[.6,skin],[1,blend(skin,-.17)]]),null);
   stroke(c,[[1.9,4.4],[projection+1.8,4]],ink(sh,.9),1.15);
   oval(c,projection+1.1,3.2,1,.67,sh);
  }
  c.restore();
 }
 function lips(c,x,y,style,skin,angle,expression='idle'){
  const s=norm(style,8),shadow=blend(skin,-.50),lip=blend(skin,-.22),smile=[0,1.2,2.3,2.8,-.2,-1,.9,-.4][s];
  c.save();c.translate(x,y);if(angle==='side')c.scale(.70,1);else if(angle==='quarter')c.scale(.87,1);
  if(expression==='hurt'||expression==='cry'||s===4||s===5){
   oval(c,0,0,expression==='idle'?s===4?7.5:7:7.4,expression==='idle'?s===5?4.6:3:5.1,'#5a2f40',shadow,1.1);
   if(s===4&&expression==='idle')fill(c,p=>{p.moveTo(-5,-.4);p.quadraticCurveTo(0,1.3,5,-.4);p.lineTo(4.5,1.1);p.lineTo(-4,1.1)},'#fcf5df');
   oval(c,0,2,3.6,1.2,'#dd818b');
  }else{
   fill(c,p=>{p.moveTo(-7,-smile*.38);p.quadraticCurveTo(0,-2.5,6,-smile*.46);p.quadraticCurveTo(0,2.8,-7,-smile*.38)},ink(lip,.53));
   stroke(c,[[-7,-smile*.3],[-2,.9+smile*.2],[3,.6+smile*.2],[7,-smile*.5]],shadow,1.55);
   stroke(c,[[-3,3.1],[0,3.6],[3,3]],ink(lip,.7),.9);
   if(s===2||s===3)oval(c,6.8,-smile*.5,.9,.8,shadow);
  }
  c.restore();
 }
 function frecklesScars(c,k,av,skin){
  if(k==='back'||k==='quarterBack')return;
  const f=norm(av.freckles,4),sh=ink(blend(skin,-.48),.55);
  for(let i=0;i<(f===0?0:f===1?4:f===2?9:14);i++){
   const side=i%2?-1:1,x=k==='front'?side*(12+(i%4)*2):12+i%5*2,y=14+(i*7)%7;
   oval(c,x,y,.5+(i%3)*.12,.52,sh);
  }
  const s=norm(av.scar,6),red=ink('#8f4743',.65);
  if(s===1)stroke(c,[[16,-7],[20,3]],red,1.35);
  if(s===2)stroke(c,[[-17,12],[-14,20]],red,1.35);
  if(s===3)stroke(c,[[13,14],[20,12]],red,1.40);
  if(s===4)stroke(c,[[-16,5],[-12,15],[-9,24]],red,1.6);
  if(s===5){stroke(c,[[13,12],[20,22]],red,1.35);stroke(c,[[19,13],[11,24]],red,1.4)}
 }
 function hairbase(c,k,style,f,skin,hair){
  const s=norm(style,13),w=f.w+5,back=k==='back'||k==='quarterBack',side=k==='side';
  if([7,10].includes(s)){
   const left=back?-w-4:-w-1,right=back?w+5:side?-16:w+1;
   fill(c,p=>{p.moveTo(left,-21);p.bezierCurveTo(left-7,-6,left-2,17,left+7,30);
    p.quadraticCurveTo(0,35,right,30);p.quadraticCurveTo(right+7,15,right+5,-17);p.closePath()},grad(c,-w,-20,w,35,[[0,blend(hair,.07)],[.55,hair],[1,blend(hair,-.47)]]),dark,2.1);
   if(s===10){ // Low rear ponytail, tied behind the skull: never two side "earmuffs".
    if(back){oval(c,0,26,10,17,blend(hair,-.18),dark,1.6);oval(c,-3,28,4,11,blend(hair,.17));
     stroke(c,[[-10,17],[0,20],[10,17]],ink('#dfc6a5',.50),2.1);
    }else if(side){oval(c,-w+7,21,6,14,blend(hair,-.22),dark,1.4);}
    else if(k==='quarterFront'){oval(c,-w+9,23,5,12,blend(hair,-.20),dark,1.1);}
   }
  }
 }
 function paintHair(c,k,av,f,skin,hair){
  const s=norm(av.style,13),back=k==='back'||k==='quarterBack',side=k==='side',w=f.w+6;
  const shade=blend(hair,-.34),deep=blend(hair,-.50),glow=blend(hair,.35),midt=blend(hair,.15);
  // Hair grows out of the cranium. Back views show natural crown and nape, never face details.
  if(s===2){
   fill(c,p=>{p.moveTo(-w+4,-16);p.bezierCurveTo(-w-2,-34,-11,-37,0,-35);p.bezierCurveTo(11,-37,w+2,-35,w-3,-12);
    p.quadraticCurveTo(0,back?2:-20,-w+4,-16)},grad(c,-w,-37,w,-13,[[0,glow],[.5,hair],[1,deep]]),dark,1.9);
   stroke(c,[[-w+9,-23],[0,-30],[w-9,-23]],ink(glow,.42),.9);return;
  }
  if(s===11){ // Big, sculpted curly volume / afro.
   // Irregular clustered coils, so curly hair reads as soft sculpted volume,
   // not mechanically repeated rows or raised braided tubes.
   for(let row=0;row<4;row++)for(let i=-5;i<=5;i++){
    const jitter=Math.sin(i*9.78+row*5.83),x=i*7.2+(row%2)*3.4+jitter*1.2;
    const y=-21-row*8.4+Math.abs(i)*1.15+Math.cos(i*4.7+row*3.5)*1.3;
    const sc=.89+Math.abs(Math.sin(i*4.31+row*7.19))*.23;
    oval(c,x,y,7.5*sc,7.3*sc,grad(c,x-5,y-6,x+7,y+7,
     [[0,i%3===0?midt:glow],[.45,hair],[1,shade]]),ink(deep,.84),1.0);
    oval(c,x-2.2,y-2.9,2.0,1.5,ink(glow,.22));
   }
   if(back)for(let i=-4;i<=4;i++)oval(c,i*7.1,6+Math.abs(i)*.5,7.3,6.6,shade,dark,.75);
   return;
  }
  if(s===9){ // Flat-top with a hand-cut box crown.
   fill(c,p=>{p.moveTo(-w,-10);p.lineTo(-w-2,-41);p.quadraticCurveTo(0,-46,w+2,-42);
    p.lineTo(w,-10);p.quadraticCurveTo(0,back?5:-17,-w,-10)},grad(c,-w,-37,w,-8,[[0,glow],[.40,hair],[1,deep]]),dark,2.3);
   stroke(c,[[-w+6,-39],[0,-42],[w-5,-38]],ink('#ffffff',.26),1.6);return;
  }
  // Crown understructure (continuous front/back to stop floating/fractured hair and bald backs).
  const tops=[-41,-40,-35,-41,-45,-44,-43,-43,-40,-45,-42,-51,-37];
  const top=tops[s];
  fill(c,p=>{p.moveTo(-w-1,-14);p.bezierCurveTo(-w-8,top+14,-16,top-10,0,top-6);
   p.bezierCurveTo(19,top-10,w+8,top+8,w+1,-14);
   if(back){p.bezierCurveTo(w-2,12,8,12,0,12);p.bezierCurveTo(-22,12,-w+1,10,-w-1,-14)}
   else if(side){p.quadraticCurveTo(0,-10,-w-1,-14)}
   else{p.quadraticCurveTo(16,-24,0,-16);p.quadraticCurveTo(-18,-20,-w-1,-14)}
  },grad(c,-w,top-6,w,-11,[[0,glow],[.24,midt],[.6,hair],[1,deep]]),dark,2.45);
  // Rear scalp and tapered nape follow the skull, not a cropped black helmet.
  // Styled back hair has dimensional volume all the way down to the neck.
  if(back){
   fill(c,p=>{p.moveTo(-w+2,-8);p.bezierCurveTo(-w+1,13,-w+10,22,0,23);
    p.bezierCurveTo(w-11,22,w-2,13,w-2,-8);
    p.quadraticCurveTo(0,7,-w+2,-8)},
    grad(c,-w,-6,w,25,[[0,blend(hair,.04)],[.35,hair],[.8,shade],[1,deep]]),dark,1.8);
   for(let n=-2;n<=2;n++)stroke(c,[[n*10,-1],[n*9+2,9],[n*7,18]],ink(glow,.20),1.25);
  }
  // Stylised sculpted locks vary by hairstyle; they are all tinted from selected natural hair.
  c.save();c.beginPath();c.moveTo(-w-7,-16);c.lineTo(-w-7,top-25);c.lineTo(w+7,top-25);c.lineTo(w+7,14);c.closePath();c.clip();
  const count=s===0?7:s===3?6:s===4?6:s===5?7:s===6?5:s===7?7:s===12?11:7;
  if(s===8){ // Layered fringe. Headbands are ACCESSORIES ONLY, never hair-style artifacts.
   for(let i=-4;i<=4;i++){
    let x=i*8.6,y=-25+(i%3)*2;
    fill(c,p=>{p.moveTo(x-6,-34);p.quadraticCurveTo(x+2,-44,x+10,-31);p.quadraticCurveTo(x+3,-22,x-6,-27)},i%2?midt:hair,deep,1.2);
   }
  }else if(s===12){ // Fine textured short crop (deliberately distinct from 8).
   for(let x=-w+7;x<=w-6;x+=6.5){
    stroke(c,[[x,-21],[x+2.4,-27.5],[x+5.8,-22.5]],ink(glow,.54),1.25);
    stroke(c,[[x-1,-17],[x+2,-20]],ink(deep,.56),1.0);
   }
  }else if(s===6){ // Directional long side sweep.
   for(let i=0;i<6;i++){
    const x=-w+2+i*9.2;
    fill(c,p=>{p.moveTo(x-10,-27);p.bezierCurveTo(x-6,top+2,x+9,top+1,x+19,-34);
     p.bezierCurveTo(x+20,-24,x+7,-19,x-10,-27)},i%2?midt:hair,ink(deep,.72),1.0);
   }
  }else{
   for(let i=0;i<count;i++){
    const t=i/(count-1),x=-w+4+t*(w*2-8),g=top+12+(i%3)*3;
    let dir=s===3?(i<count/2?-1:1):s===1?1:s===4?(i<count/2?-1:1):s===5?0:i%2===0?-1:1;
    let h=s===4?10:s===5?12:s===0?10:s===7?10:8;
    let tip=x+dir*(s===1?13:s===3?10:8),yt=top-(s===4?3:s===5?3:1)-(i%3)*3;
    if(back){tip=x+dir*5;yt=top+2-(i%3)*2;}
    fill(c,p=>{p.moveTo(x-8,g);p.bezierCurveTo(x-11,g-h*.7,x-7,yt+4,tip,yt);
     p.bezierCurveTo(tip+7,yt+3,x+12,g-9,x+10,g);p.quadraticCurveTo(x,g+3,x-8,g)},
     grad(c,x-9,yt,tip+8,g,[[0,i%2?midt:glow],[.4,i%3?hair:midt],[1,shade]]),ink(deep,.88),1.15);
    stroke(c,[[x-3,g-4],[tip-1,yt+5]],ink(glow,.34),1.25);
   }
  }
  if(s===3||s===7){ // Long centre part: the part stays centred, follows curved crown.
   stroke(c,[[0,top+4],[1,-22]],ink(deep,.8),2.0);
   stroke(c,[[-2,top+7],[-4,-26]],ink(glow,.65),1.1);
  }
  c.restore();
  if(s===7){ // Curtain tips along cheeks (visible also in profiles and back).
   const ends=back?[[-w+4,8],[w-3,7]]:side?[[-w+3,12],[w-10,6]]:[[-w+2,13],[w-3,14]];
   for(const [x,y] of ends){fill(c,p=>{p.moveTo(x-5,-16);p.quadraticCurveTo(x+6,-18,x+6,y);p.quadraticCurveTo(x+1,y+8,x-4,y+3);p.quadraticCurveTo(x-1,-6,x-5,-16)},grad(c,x-5,-15,x+5,y,[[0,glow],[.28,hair],[1,deep]]),dark,1.45)}
  }
  if(s===6){ // A raised wave over the temple, not an ear-shaped ball.
   fill(c,p=>{p.moveTo(w-14,-29);p.quadraticCurveTo(w-2,-39,w+6,-31);
    p.quadraticCurveTo(w+7,-24,w-3,-24);p.quadraticCurveTo(w-9,-24,w-14,-29)},
    grad(c,w-15,-36,w+6,-24,[[0,glow],[.5,hair],[1,shade]]),dark,1.3);
  }
 }
 function beard(c,k,av,f,hair){
  const type=norm(av.beard,5);if(!type)return;
  const black=blend(hair,-.60),base=blend(hair,-.23),stubble=ink(black,.36);
  if(type===4){if(k==='front'){
    stroke(c,[[-11,20],[-6,18.5],[-1,21],[1,21],[5,19],[11,20]],black,3.15);
    stroke(c,[[-8,18],[-2,19]],ink(blend(hair,.16),.56),.7);
   }else if(k==='quarterFront'||k==='side')stroke(c,[[13,20],[22,19]],black,2.5);return;}
  if(k==='back'){
   // The rear only shows sideburn and low jaw edges, physically behind the ears.
   for(const sign of [-1,1]){
    const x=sign*(f.w-1),far=x+sign*(type===3?6:type===2?4:2);
    if(type===1){stroke(c,[[far,9],[far,15],[x,24]],stubble,1.4);continue}
    fill(c,p=>{p.moveTo(x-sign*2,9);p.quadraticCurveTo(far+sign*2,16,far,25);
     p.quadraticCurveTo(x,32,x-sign*4,24);p.quadraticCurveTo(x-sign*5,16,x-sign*2,9)},type===3?black:base,dark,1.05);
   }return;
  }
  if(k==='quarterBack'){
   if(type===1||type===2||type===3){const x=f.w-3;
    fill(c,p=>{p.moveTo(x-3,9);p.quadraticCurveTo(x+7,17,x+2,29);
     p.quadraticCurveTo(x-5,34,x-7,20)},type===1?stubble:type===2?base:black,null);
   }return;
  }
  // Beard clips to face silhouette, following exactly the jaw chosen in the editor.
  c.save();c.beginPath();facePath(c,k,f);c.closePath();c.clip();
  if(k==='front'){
   fill(c,p=>{p.moveTo(-f.w+4,15);p.bezierCurveTo(-f.j-4,29,-f.j+7,f.chin+3,0,f.chin+5);
    p.bezierCurveTo(f.j-7,f.chin+3,f.j+4,29,f.w-4,15);p.bezierCurveTo(f.j-1,21,11,23,0,23);
    p.bezierCurveTo(-11,23,-f.j+1,21,-f.w+4,15)},type===1?stubble:grad(c,-f.w,13,f.w,39,[[0,blend(base,.06)],[.5,type===3?black:base],[1,black]]),type===1?null:ink(black,.72),1.25);
  }else{
   fill(c,p=>{p.moveTo(8,12);p.bezierCurveTo(f.w+4,16,f.w+7,28,13,f.chin+3);
    p.quadraticCurveTo(0,f.chin+5,3,26);p.quadraticCurveTo(6,21,8,12)},type===1?stubble:type===2?base:black,null);
  }
  if(type>=2){
   if(k==='front'){
    stroke(c,[[-10,19],[-4,18],[0,21],[5,18],[10,19]],black,2.7);
    for(let i=-2;i<=2;i++)stroke(c,[[i*5,f.chin-7],[i*4,f.chin+2]],ink(blend(hair,.30),.32),.75);
    if(type===3)stroke(c,[[-9,f.chin-3],[0,f.chin+4],[9,f.chin-3]],ink(blend(hair,.37),.54),1.35);
   }else stroke(c,[[13,20],[23,19.5]],black,2.3);
  }
  c.restore();
 }
 function accessories(c,k,av,f,skin,hair){
  const a=norm(av.accessory,6),back=k==='back'||k==='quarterBack';
  // Only an explicit appearance.accessory == 1 is allowed to render headbands.
  if(a===1||a===5){
   const w=k==='side'?f.w-1:f.w+3,y=a===5?-17:-16;
   fill(c,p=>{p.moveTo(-w,y-5);p.quadraticCurveTo(0,y-9,w,y-5);
    p.lineTo(w-2,y+1);p.quadraticCurveTo(0,y-3,-w+2,y+1)},
    grad(c,-w,y-6,w,y+3,[[0,'#e4e9f1'],[.34,'#ffffff'],[1,'#a9c4d5']]),dark,1.4);
   stroke(c,[[-w+5,y-3],[0,y-5],[w-5,y-3]],ink('#ffffff',.80),.85);
  }else if(a===2&&!back){const x=k==='front'?f.w+1:k==='quarterFront'?-23:-19;
   oval(c,x,16,2.4,3.7,'#edbb57','#6e4d37',1);oval(c,x-.6,14.5,.72,1,'#ffffff');
  }else if(a===3&&!back){const x=k==='front'?19:20;
   fill(c,p=>{p.moveTo(x-5,15);p.lineTo(x+5,12);p.lineTo(x+6,16);p.lineTo(x-4,19)},'#e6eae6','#84999b',.75);
  }else if(a===4&&!back){const x=k==='front'?12:13;
   fill(c,p=>{p.roundRect(x-8,1.5,17,12,4)},ink('#a0d0e2',.20),dark,2.3);
   if(k!=='side')fill(c,p=>{p.roundRect(k==='front'?-20:-14,2,16,11,4)},ink('#a0d0e2',.20),dark,2.3);
   stroke(c,[[x-8,5],[x-12,4]],dark,2.1);
  }
 }
 function face(c,k,av,skin,hair,opt){
  const f=faces[norm(av.face,5)],front=k==='front',quarter=k==='quarterFront',side=k==='side',seen=front||quarter||side;
  c.save();c.translate(0,-81);c.scale(opt.headScale||1,opt.headScale||1);
  if(opt.signatureMotion?.headTilt)c.rotate(opt.signatureMotion.headTilt);
  hairbase(c,k,av.style,f,skin,hair);
  skinHead(c,k,f,skin);
  // Head shading is composited behind the eyes. Beards must be behind lips.
  beard(c,k,av,f,hair);
  if(seen){
   const shut=!!opt.hurt||!!opt.cry;
   if(front){
    brows(c,-13,-4,av.brows,hair);brows(c,13,-4,av.brows,hair);
    eye(c,-13,7,av.eyes,av.eyeColor,1,false,shut);eye(c,13,7,av.eyes,av.eyeColor,1,false,shut);
    nose(c,0,14,av.nose,skin,'front');lips(c,0,25,av.lips??av.mouth,skin,'front',shut?opt.cry?'cry':'hurt':'idle');
   }else if(quarter){
    brows(c,-7,-3,av.brows,hair,.75);brows(c,14,-4,av.brows,hair,1.03);
    eye(c,-7,7,av.eyes,av.eyeColor,.70,false,shut);eye(c,14,7,av.eyes,av.eyeColor,1.04,true,shut);
    nose(c,14,15,av.nose,skin,'quarter');lips(c,12,25,av.lips??av.mouth,skin,'quarter',shut?opt.cry?'cry':'hurt':'idle');
   }else{
    brows(c,13,-4,av.brows,hair,.97);eye(c,13,7,av.eyes,av.eyeColor,.88,true,shut);
    nose(c,23,15,av.nose,skin,'side');lips(c,23,26,av.lips??av.mouth,skin,'side',shut?opt.cry?'cry':'hurt':'idle');
   }
  }
  frecklesScars(c,k,av,skin);
  paintHair(c,k,av,f,skin,hair);
  accessories(c,k,av,f,skin,hair);
  if(opt.cry&&seen)oval(c,front?13:17,25,1.8,4.4,ink('#7ee2fb',.85));
  c.restore();
 }
 function boots(c,x,y,dir,col,near){
  const left=x-8,toe=x+(dir>0?13:-2);
  fill(c,p=>{p.moveTo(left,y-5);p.quadraticCurveTo(x-3,y-9,x+4,y-5);
   p.quadraticCurveTo(toe+5,y-4,toe+10,y+2);p.quadraticCurveTo(toe+12,y+7,toe+6,y+8);
   p.lineTo(x-9,y+8);p.quadraticCurveTo(x-12,y+2,left,y-5)},
   grad(c,x-10,y-8,toe+10,y+8,[[0,'#f9f8f4'],[.32,'#f4f5fa'],[.7,'#c3d1e6'],[1,'#647d9f']]),dark,2.0);
  fill(c,p=>{p.moveTo(x-9,y+5);p.quadraticCurveTo(x+2,y+7,toe+8,y+5);p.lineTo(toe+8,y+9);
   p.quadraticCurveTo(x-2,y+13,x-9,y+9)},near?'#334b7c':'#283b60',dark,1.35);
  stroke(c,[[x-2,y-3],[x+2,y-1],[x+6,y],[x+10,y+1]],'#e3ab42',1.35);
  stroke(c,[[x-5,y-1],[x+4,y+2]],ink('#ffffff',.8),1.6);
  oval(c,toe+5,y+7,1.6,1,'#f6c65b');
 }
 function drawLeg(c,sign,k,p,colors,opt,near){
  const side=k==='side',quarter=k.startsWith('quarter');
  const spread=side?5:quarter?9:13,run=Number(opt.run)||0;
  const gait=run*(sign===1?1:-1),strike=opt.kick&&sign===1;
  const travel=(side?20:quarter?15:13)*gait+(strike?14:0),raise=Math.max(0,gait)*9+(strike?11:0);
  const thighX=sign*spread,knee=[thighX+travel*.48,-11-raise*.43],ankle=[thighX+travel,-2-raise];
  const bright=near?colors.skin:blend(colors.skin,-.15);
  stroke(c,[[thighX,-19],[knee[0],knee[1]]],bright,10.6,dark);
  oval(c,knee[0],knee[1],5.1,5,bright,dark,1.15);
  stroke(c,[[knee[0],knee[1]+1],[ankle[0],ankle[1]-3]],near?'#e7ebf3':'#c9d5e1',10,dark);
  stroke(c,[[knee[0]+1,knee[1]+4],[ankle[0],ankle[1]-4]],colors.main,8.0);
  stroke(c,[[knee[0],knee[1]+5],[ankle[0],ankle[1]-5]],ink('#ffffff',.19),1.8);
  stroke(c,[[ankle[0]-5,ankle[1]-6],[ankle[0]+4,ankle[1]-6]],colors.gold,2.4);
  stroke(c,[[ankle[0]-5,ankle[1]-11],[ankle[0]+3,ankle[1]-11]],ink(colors.gold,.6),1.25);
  boots(c,ankle[0],ankle[1],side?1:sign,colors.gold,near);
 }
 function shorts(c,k,colors){
  const side=k==='side',w=side?16:k.startsWith('quarter')?19:22;
  fill(c,p=>{p.moveTo(-w,-27);p.quadraticCurveTo(0,-24,w,-27);p.lineTo(w+1,-10);
   p.quadraticCurveTo(w-4,-6,4,-9);p.lineTo(0,-13);p.lineTo(-4,-9);
   p.quadraticCurveTo(-w+4,-6,-w-1,-10)},
   grad(c,-w,-27,w,-8,[[0,'#ffffff'],[.4,colors.shorts],[1,blend(colors.shorts,-.24)]]),dark,2.25);
  fill(c,p=>{p.moveTo(-w,-26);p.lineTo(-4,-23);p.lineTo(-3,-11);p.quadraticCurveTo(-w+5,-7,-w,-10)},ink(blend(colors.shorts,-.34),.25));
  stroke(c,[[-w+3,-11],[-5,-10]],colors.gold,1.35);stroke(c,[[5,-10],[w-3,-11]],colors.gold,1.35);
  stroke(c,[[0,-21],[0,-12]],ink(colors.main,.34),1.0);
 }
 function arm(c,sign,k,p,col,opt,near){
  const side=k==='side',quarter=k.startsWith('quarter'),sh=sign*(side?14:quarter?18:23);
  const run=Number(opt.run)||0,sw=run*sign*12+(opt.signatureMotion?.armSwing||0)*sign*.40;
  const dive=p.keeper&&['keeperDive','keeperDiveCatch','keeperSuper'].includes(p.action);
  const elbow=[sh+sign*(dive?21:near?13:10),dive?-60:-41+sw*.40];
  const hand=[elbow[0]+sign*(dive?18:5),dive?-74:-24+sw];
  const kit=near?grad(c,sh-20,-57,sh+18,-38,[[0,blend(col.main,.34)],[.44,col.main],[1,blend(col.main,-.32)]]):blend(col.main,-.33);
  stroke(c,[[sh,-51],[elbow[0],elbow[1]]],kit,15,dark);
  stroke(c,[[elbow[0]-sign*5,elbow[1]],[elbow[0]+sign*5,elbow[1]+.5]],col.gold,2.5);
  stroke(c,[[elbow[0],elbow[1]+2],[hand[0],hand[1]]],near?col.skin:blend(col.skin,-.17),10.2,dark);
  stroke(c,[[elbow[0]+sign*1,elbow[1]+4],[hand[0]+sign*.7,hand[1]-4]],ink('#ffffff',.19),1.25);
  const tattoo=norm(opt.tattoo,6),mx=(elbow[0]+hand[0])*.5,my=(elbow[1]+hand[1])*.5,inkColor=ink('#27354a',.68);
  if(tattoo&&near){
   if(tattoo===1)stroke(c,[[hand[0]-4,hand[1]-6],[hand[0]+4,hand[1]-5]],inkColor,2.5);
   if(tattoo===2){stroke(c,[[mx-4,my-2],[mx+4,my-1]],inkColor,1.8);stroke(c,[[mx-4,my+3],[mx+4,my+3]],inkColor,1.3)}
   if(tattoo===3)stroke(c,[[mx-4,my-4],[mx,my-6],[mx+2,my-1],[mx-2,my+3]],inkColor,1.45);
   if(tattoo===4)stroke(c,[[mx,my-6],[mx+4,my],[mx,my+5],[mx-4,my],[mx,my-6]],inkColor,1.9);
   if(tattoo===5){oval(c,mx,my,5,6,inkColor);stroke(c,[[mx-4,my+2],[mx+4,my-3]],ink('#ffffff',.25),.95)}
  }
  oval(c,hand[0],hand[1],6.4,7.3,p.keeper?'#e6edf2':near?blend(col.skin,.17):col.skin,dark,1.6);
  oval(c,hand[0]-2,hand[1]-2,2.5,3.2,ink('#ffffff',.16));
  if(p.keeper){
    stroke(c,[[hand[0]-5,hand[1]-1],[hand[0]+5,hand[1]+1]],'#2486ae',2.4);
    oval(c,hand[0]+sign*3,hand[1]-2,2.5,3.1,'#ffffff');
    // GK-GLOVE-ART-01: a padded catch palm appears only during the existing keeper actions.
    // The eight-view painter and all game collision/catch timing remain unchanged.
    const catchingGlove=['keeperDive','keeperDiveCatch','keeperCatch','keeperSuper'].includes(p.action);
    if(catchingGlove){
     oval(c,hand[0],hand[1],5.1,5.6,near?'#f4fbff':'#b8dfe9',dark,1.1);
     stroke(c,[[hand[0]-4,hand[1]],[hand[0]+4,hand[1]]],'#287eaa',1.5);
     stroke(c,[[hand[0]-3,hand[1]+3],[hand[0]+3,hand[1]+3]],'#7dd5e8',1.1);
    }
   }
 }
 function jersey(c,k,p,colors){
  const side=k==='side',quarter=k.startsWith('quarter'),back=k==='back'||k==='quarterBack',w=side?18:quarter?21:24;
  fill(c,p=>{p.moveTo(-w,-51);p.quadraticCurveTo(-w+1,-59,-9,-60);p.lineTo(10,-60);
   p.quadraticCurveTo(w+4,-56,w,-49);p.lineTo(w-5,-25);p.quadraticCurveTo(w-6,-20,w-12,-20);
   p.lineTo(-w+11,-20);p.quadraticCurveTo(-w+2,-23,-w,-32)},
   grad(c,-w,-58,w,-22,[[0,blend(colors.main,.44)],[.23,blend(colors.main,.17)],[.59,colors.main],[1,blend(colors.main,-.42)]]),dark,2.65);
  // Shoulder panels follow torso curvature; underarm fabric stays dark.
  fill(c,p=>{p.moveTo(-w,-51);p.quadraticCurveTo(-w+4,-55,-w+9,-57);p.lineTo(-w+11,-23);p.lineTo(-w+5,-28)},ink('#ffffff',.11));
  fill(c,p=>{p.moveTo(w-10,-57);p.lineTo(w,-50);p.lineTo(w-5,-26);p.lineTo(w-11,-22)},ink('#08172c',.17));
  fill(c,p=>{p.moveTo(-9,-56);p.quadraticCurveTo(0,-48,9,-56);p.lineTo(7,-60);p.quadraticCurveTo(0,-54,-7,-60)},colors.gold,dark,1.25);
  stroke(c,[[-w+5,-47],[-w+8,-43]],colors.gold,2.2);stroke(c,[[w-7,-49],[w-7,-44]],colors.gold,2.1);
  stroke(c,[[-w+7,-24],[w-8,-24]],ink('#08172b',.28),1.4);
  stroke(c,[[-w+5,-34],[-w+8,-27]],ink(colors.gold,.78),1.5);
  stroke(c,[[w-8,-33],[w-9,-27]],ink(colors.gold,.78),1.2);
  if(!back&&!side){ // crest and center chest panel
   oval(c,-10,-45,3.7,4.6,colors.gold,dark,1.0);
   fill(c,p=>{p.moveTo(-12,-46);p.lineTo(-8,-46);p.lineTo(-10,-42)},blend(colors.main,-.38));
  }
  const n=String(p.src?.num??0);
  if(back||k==='front'||(quarter&&!back)){
   c.save();c.textBaseline='middle';c.textAlign='center';c.font=back?'900 21px Arial, sans-serif':'900 11px Arial, sans-serif';
   const x=back?0:-.5,y=back?-39:-34;
   c.lineWidth=back?2.8:1.3;c.strokeStyle=blend(colors.main,-.48);c.strokeText(n,x,y);
   c.fillStyle=colors.gold;c.fillText(n,x,y);c.restore();
  }
  stroke(c,[[-14,-52],[-9,-54]],ink('#ffffff',.23),1.3);
 }
 function draw(c,p,av,team,view,opt={}){
  if(!c||!p||!team||!av)return;
  const k=views[view?.kind]?view.kind:'front';
  const colors={skin:safe(opt.skin||av.skin||'#d6ac86'),hair:safe(opt.hair||av.hair||'#493c31'),
   main:safe(team.primary||'#266ac7'),shorts:safe(team.secondary||'#f0f0e9'),gold:safe(team.trim||team.secondary||'#f5c45e')};
  // Render is deliberately stateless and stable across all eight directions.
  c.save();
  drawLeg(c,-1,k,p,colors,opt,false);drawLeg(c,1,k,p,colors,opt,true);
  shorts(c,k,colors);
  stroke(c,[[0,-59],[0,-49]],blend(colors.skin,-.25),17,dark);
  stroke(c,[[-3,-59],[-3,-53]],ink('#ffffff',.26),3.3);
  arm(c,-1,k,p,colors,opt,false);
  jersey(c,k,p,colors);
  // Direction-aware gold seam highlight reinforces the cartoon jersey silhouette.
  c.save();c.globalAlpha=.25;c.strokeStyle=colors.gold;c.lineWidth=2.3;c.lineCap='round';c.beginPath();
  const seamWidth=k==='side'?11:k.startsWith('quarter')?16:19;
  c.moveTo(-seamWidth,-55);c.quadraticCurveTo(-seamWidth+2,-43,-seamWidth+5,-34);c.stroke();c.restore();
  arm(c,1,k,p,colors,{...opt,tattoo:av.tattoo},true);
  face(c,k,av,colors.skin,colors.hair,opt);
  c.restore();
 }
 return {draw,headSpecs:av=>faces[norm(av.face,5)],geometry:views,version:3};
})();
export {CHARACTER_ART};