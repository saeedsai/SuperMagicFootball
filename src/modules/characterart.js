// SuperMagicFootball | character art v2 | eight-direction vector character renderer.
// Coordinates follow the existing field renderer: feet at y=0, head centred at y=-80.
// This is deliberately art-only: never update gameplay state, ball physics, or hitboxes.
const CHARACTER_ART=(()=>{
 const TAU=Math.PI*2;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number.isFinite(+v)?+v:a));
 const index=(v,n)=>((Math.trunc(Number(v)||0)%n)+n)%n;
 const hex=(s)=>/^#[0-9a-f]{6}$/i.test(s||'')?s:'#8b674e';
 const tint=(s,k)=>{s=hex(s);return '#'+[1,3,5].map(i=>{const v=parseInt(s.slice(i,i+2),16);return Math.round(k>=0?v+(255-v)*k:v*(1+k)).toString(16).padStart(2,'0');}).join('')};
 const rgba=(s,a)=>{s=hex(s);return 'rgba('+[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)).join(',')+','+a+')'};
 const line=(c,pts,color,w=2,outline=null)=>{c.beginPath();c.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);c.lineJoin='round';c.lineCap='round';if(outline){c.lineWidth=w+2;c.strokeStyle=outline;c.stroke()}c.lineWidth=w;c.strokeStyle=color;c.stroke()};
 const patch=(c,fn,fill,stroke='#26303c',width=1.8)=>{c.beginPath();fn(c);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.lineJoin='round';c.lineWidth=width;c.strokeStyle=stroke;c.stroke()}};
 const oval=(c,x,y,rx,ry,fill,stroke=null,w=1)=>patch(c,p=>p.ellipse(x,y,Math.max(.2,rx),Math.max(.2,ry),0,0,TAU),fill,stroke,w);
 const grad=(c,x0,y0,x1,y1,stops)=>{const g=c.createLinearGradient(x0,y0,x1,y1);for(const [n,color] of stops)g.addColorStop(n,color);return g};
 const FACES=Object.freeze([{w:27,chin:34,jaw:21},{w:30,chin:33,jaw:27},{w:25,chin:37,jaw:17},{w:30,chin:35,jaw:28},{w:27,chin:39,jaw:21}]);
 const EYES=Object.freeze(['#3e2a22','#5b3a24','#4f6d8c','#588a69','#7a6e9c','#8b6a34']);
 const headSpecs=av=>FACES[index(av.face,5)];
 const geometry=Object.freeze({
  front:{type:'front',depth:1},quarterFront:{type:'quarterFront',depth:.82},
  side:{type:'side',depth:.64},quarterBack:{type:'quarterBack',depth:.82},back:{type:'back',depth:1}
 });
 function ear(c,x,y,skin,stroke,dim=false){
  const base=dim?tint(skin,-.19):tint(skin,-.08);
  oval(c,x,y,6.1,9.1,base,stroke,1.7);
  patch(c,p=>{p.moveTo(x+1,y-4);p.bezierCurveTo(x-3,y-7,x-3,y+3,x+1,y+3);p.quadraticCurveTo(x+3,y+1,x+1,y-1)},rgba(tint(skin,-.44),.6),null);
  oval(c,x+.9,y+3.5,1.6,2,tint(skin,.10));
 }
 function faceOutline(c,kind,g){
  const {w,chin,jaw}=g;
  c.beginPath();
  if(kind==='front'){
   c.moveTo(0,-31);c.bezierCurveTo(w*.63,-34,w+4,-23,w+4,1);
   c.quadraticCurveTo(w+4,18,jaw+2,chin-8);
   c.quadraticCurveTo(jaw-6,chin,0,chin);
   c.quadraticCurveTo(-jaw+6,chin,-jaw-2,chin-8);
   c.quadraticCurveTo(-w-4,18,-w-4,1);
   c.bezierCurveTo(-w-4,-23,-w*.63,-34,0,-31);
  }else if(kind==='quarterFront'){
   c.moveTo(-18,-29);c.bezierCurveTo(-2,-42,w+4,-30,w+6,-9);
   c.quadraticCurveTo(w+9,4,w+2,16);
   c.quadraticCurveTo(jaw+3,chin-3,9,chin);
   c.quadraticCurveTo(-16,chin+1,-26,16);
   c.quadraticCurveTo(-32,-9,-18,-29);
  }else if(kind==='side'){
   c.moveTo(-18,-29);c.bezierCurveTo(2,-41,w+2,-31,w+5,-14);
   c.quadraticCurveTo(w+6,-4,w-1,3);
   c.quadraticCurveTo(w+8,10,w+4,13);
   c.quadraticCurveTo(jaw+8,18,jaw+2,20);
   c.quadraticCurveTo(jaw+1,chin-4,4,chin);
   c.quadraticCurveTo(-22,34,-26,13);
   c.quadraticCurveTo(-31,-9,-18,-29);
  }else if(kind==='quarterBack'){
   c.moveTo(-20,-28);c.bezierCurveTo(1,-42,w+8,-25,w+8,1);
   c.quadraticCurveTo(w+9,18,jaw+2,chin-5);
   c.quadraticCurveTo(3,chin+5,-18,21);
   c.quadraticCurveTo(-33,1,-20,-28);
  }else{
   c.moveTo(0,-31);c.bezierCurveTo(w+12,-37,w+8,1,w+3,16);
   c.quadraticCurveTo(jaw+6,chin-2,0,chin);
   c.quadraticCurveTo(-jaw-6,chin-2,-w-3,16);
   c.bezierCurveTo(-w-8,1,-w-12,-37,0,-31);
  }
  c.closePath();
 }
 function renderSkin(c,kind,av,skin,dark){
  const g=headSpecs(av),base=grad(c,-31,-30,32,32,[[0,tint(skin,.26)],[.38,skin],[.87,tint(skin,-.14)],[1,tint(skin,-.26)]]);
  if(kind==='front'){ear(c,-g.w-1,5,skin,dark,true);ear(c,g.w+1,5,skin,dark);}
  else if(kind==='quarterFront')ear(c,-22,6,skin,dark,true);
  else if(kind==='side')ear(c,-19,6,skin,dark);
  faceOutline(c,kind,g);c.fillStyle=base;c.fill();c.lineWidth=2.6;c.strokeStyle=dark;c.stroke();
  c.save();faceOutline(c,kind,g);c.clip();
  if(kind==='front'){oval(c,-14,-6,13,17,rgba('#ffffff',.095));oval(c,18,19,8,4,rgba('#e66f77',.09));oval(c,-17,19,7,4,rgba('#e66f77',.09));}
  else if(kind==='quarterFront'){oval(c,-4,-10,15,18,rgba('#ffffff',.075));oval(c,17,18,9,4,rgba('#da7167',.08));}
  else if(kind==='side'){oval(c,0,-9,16,18,rgba('#ffffff',.09));oval(c,19,17,5,3,rgba('#ce7466',.10));}
  else{oval(c,-8,-12,12,17,rgba('#ffffff',.07));}
  c.restore();
  if(kind==='quarterBack')ear(c,27,5,skin,dark,true);
  return g;
 }
 function drawEye(c,x,y,style,color,scale=1,far=false,closed=false){
  const k=index(style,20),rx=(5.7+(k%5-2)*.25)*scale*(far?.77:1);
  const ry=(4.5+((k>>2)%5-2)*.2)*scale,iris=EYES[index(color,6)];
  if(closed){line(c,[[x-rx,y],[x,y+.75],[x+rx,y]],'#2b2936',1.6);return}
  c.save();c.translate(x,y);
  patch(c,p=>{p.moveTo(-rx,-.3);p.quadraticCurveTo(-rx*.15,-ry*1.44,rx,-.6);p.quadraticCurveTo(rx*.18,ry*1.14,-rx,-.3)},'#fff8ec','#2f303b',1.25*scale);
  oval(c,.5,.9,2.9*scale*(far?.86:1),3.5*scale,iris);
  oval(c,.9,1.1,1.65*scale,2.5*scale,'#22212b');
  oval(c,-.35,-.3,1.15*scale,1.24*scale,'#ffffff');
  oval(c,1.35,2, .46*scale,.53*scale,rgba('#ffffff',.6));
  c.restore();
 }
 function brow(c,x,y,style,hair,scale=1){
  const k=index(style,20),bend=(k%5-2)*.75,rise=((k>>2)%4-1.5)*.62;
  const h=tint(hair,-.40);
  line(c,[[x-5*scale,y+1+bend],[x,y-2.7*scale+rise],[x+5.5*scale,y+bend*.7]],h,(1.8+(k%4)*.2)*scale);
 }
 function nose(c,x,y,style,skin,angle){
  const kind=index(style,6),wide=(kind===2||kind===4)?1.28:.9;
  const contour=tint(skin,-.29);
  if(angle==='front'){
   oval(c,x,y+2,3.6*wide,2.25,tint(skin,-.09));
   line(c,[[x-2*wide,y+2],[x,y+3],[x+2.7*wide,y+2]],contour,.95);
   oval(c,x-2.0*wide,y+2.6,.55,.4,contour);oval(c,x+2.0*wide,y+2.6,.55,.4,contour);
  }else{
   patch(c,p=>{p.moveTo(x-3.8,y-5);p.quadraticCurveTo(x+1.3,y-1,x+3*wide,y+1);p.quadraticCurveTo(x+6*wide,y+4,x+2,y+5);p.lineTo(x-1,y+3)},tint(skin,.07),null);
   line(c,[[x+1,y+4],[x+3*wide,y+4.3]],contour,1.15);
  }
 }
 function lips(c,x,y,style,skin,angle,hurt=false){
  const k=index(style,8),lip=tint(skin,-.45),inner='#773a45';
  c.save();c.translate(x,y);if(angle!=='front')c.scale(.78,1);
  if(hurt||k===4||k===5){
   oval(c,0,1,k===5?7.5:7.1,hurt?6.5:k===5?5:3.7,inner,tint(skin,-.39),.9);
   oval(c,1,2.8,4,1.25,'#e88b96');
   if(!hurt&&k===4)patch(c,p=>{p.moveTo(-5,0);p.quadraticCurveTo(0,1,5,0);p.lineTo(4,1.7);p.lineTo(-4,1.7)},'#fff8ec',null);
  }else{
   const smile=k===2||k===3||k===6?2.8:k===7?1.8:.6;
   line(c,[[-7,0],[0,1.7+smile*.35],[8,-smile*.38]],lip,1.7);
   if(k===1||k===6)line(c,[[-3,3],[1,4],[5,2.6]],rgba(lip,.6),.8);
   if(k===2){oval(c,7,-smile*.38,1.1,1.2,lip);}
  }
  c.restore();
 }
 function hairGeometry(c,style,kind,g,hair,dark){
  const s=index(style,13),rear=kind==='back'||kind==='quarterBack',side=kind==='side';
  const top=[-41,-35,-31,-40,-51,-50,-36,-39,-35,-44,-39,-47,-35][s];
  const w=rear?g.w+6:side?g.w+2:g.w+5;
  const deep=tint(hair,-.34),middle=tint(hair,.03),shine=tint(hair,.38),warm=tint(hair,.20);
  // Hair is rooted in the same cranium on every projection, never scaled from the frontal sprite.
  if(s===7||s===10){ // Curtain / ponytail, including side and back volume.
   patch(c,p=>{p.moveTo(-w,-19);p.quadraticCurveTo(-w-5,4,-w+3,22);p.lineTo(-w+11,25);p.quadraticCurveTo(-w+5,4,-w+12,-18)},deep,dark,1.3);
   if(rear||side){patch(c,p=>{p.moveTo(w-10,-25);p.quadraticCurveTo(w+14,-4,w+12,25);p.lineTo(w+4,27);p.quadraticCurveTo(w-9,11,w-10,-20)},hair,dark,1.4);}
  }
  if(s===6||s===10)oval(c,rear?-27:-29,-11,9,10,deep,dark,1.3);
  if(s===11){ // Afro / dense curls: sculptural clumps remain visible at all headings.
   for(let row=0;row<2;row++)for(let i=-3;i<=3;i++){
    const x=i*9+(row%2)*4, y=-27-row*10+Math.abs(i)*1.5;
    oval(c,x,y,9.5,9.5,row===0?hair:tint(hair,.08),dark,1.1);
    oval(c,x-2,y-2,3.1,2.2,rgba('#ffffff',.095));
   }
   oval(c,-28,-16,11,12,hair,dark,1.2);oval(c,28,-16,11,12,hair,dark,1.2);
   return;
  }
  if(s===2){ // Buzz/close crop: no invented giant fringe in profile or back.
   patch(c,p=>{p.moveTo(-w,-16);p.quadraticCurveTo(-w-2,-34,0,-33);p.quadraticCurveTo(w+3,-35,w,-14);p.lineTo(w-6,-14);p.quadraticCurveTo(0,-23,-w+6,-13)},hair,dark,1.3);
   line(c,[[-w+7,-26],[0,-30],[w-6,-25]],warm,1.4);return;
  }
  patch(c,p=>{p.moveTo(-w-2,-7);p.bezierCurveTo(-w-9,-24,-w+2,top-3,-13,top+1);
   p.quadraticCurveTo(8,top-9,w-5,top+1);p.quadraticCurveTo(w+6,-33,w+3,-12);
   if(rear){p.quadraticCurveTo(w+5,-4,w-2,8);p.lineTo(w-9,5);p.quadraticCurveTo(0,-4,-w+7,6);p.lineTo(-w,3)}
   else if(side){p.lineTo(w-8,-14);p.quadraticCurveTo(11,-16,-w+8,-8);p.lineTo(-w-2,-2)}
   else{p.lineTo(w-4,-10);p.quadraticCurveTo(w-19,-24,11,-17);p.quadraticCurveTo(0,-23,-13,-13);p.quadraticCurveTo(-w+7,-18,-w-2,-7)}
  },grad(c,-w,top,w,-9,[[0,tint(hair,.13)],[.48,hair],[1,deep]]),dark,2.5);
  c.save();c.beginPath();c.moveTo(-w-5,-9);c.lineTo(-w-5,top-12);c.lineTo(w+10,top-12);c.lineTo(w+6,11);c.closePath();c.clip();
  if(s===8||s===12||s===9){ // Cornrows / textured crop / flat top
   for(let i=-3;i<=3;i++)line(c,[[i*7,top+9],[i*7+3,-17]],tint(hair,-.25),1.4);
  }else if(s!==1){
   const spikes=s===4||s===5?6:s===0?5:3;
   for(let i=0;i<spikes;i++){
    const x=(i-(spikes-1)/2)*11;
    patch(c,p=>{p.moveTo(x-8,-20);p.quadraticCurveTo(x-9,top+4,x+4+(s===3?5:0),top+(i%2)*5-7);p.quadraticCurveTo(x+8,top+9,x+9,-17)},i%2?middle:hair,null);
    line(c,[[x-5,top+15],[x+1,top+9],[x+7,top+16]],rgba(shine,.38),1.3);
   }
  }
  if(s===3||s===7)line(c,[[0,top+4],[0,-15]],deep,1.5);
  line(c,[[-w+9,top+18],[-12,top+11],[2,top+9],[w-9,top+16]],rgba(shine,.52),1.5);
  c.restore();
  // Hair option 8 is a real wraparound headband, not a duplicate textured crop.
  if(s===8){const bandY=rear?-16:-16.5;
   patch(c,p=>{p.moveTo(-w+2,bandY-5);p.quadraticCurveTo(0,bandY-8,w-2,bandY-5);p.lineTo(w-3,bandY+.5);p.quadraticCurveTo(0,bandY-2,-w+3,bandY+.5)},'#edece4',dark,1.1);
   line(c,[[-w+7,bandY-3],[w-7,bandY-4]],rgba('#ffffff',.7),1.1);
  }
  if(s===10||s===6){
   const x=rear?28:side?-27:31;oval(c,x,-18,10,7,deep,dark,1.3);
   oval(c,x+3,-20,6,5,hair,dark,.8);
  }
 }
 function beard(c,kind,av,skin,hair,g){
  const type=index(av.beard,5);if(!type)return;
  const h=tint(hair,-.25),dark=tint(hair,-.44),stubble=rgba(dark,.31),full=type===3;
  const edge=g.jaw,chin=g.chin;
  if(kind==='back'){
   // Profile-following sideburns are visible beside the neck from behind.
   // Mouth and moustache remain completely occluded by the cranium.
   if(type===4)return;
   const sideX=g.w-3,visible=type===3?4.1:type===2?2.9:1.5;
   for(const sign of [-1,1]){
    const outer=sign*(sideX+visible),inner=sign*(sideX-visible*.45);
    if(type===1){
     line(c,[[outer,12],[outer-sign*.3,19],[inner,chin-8]],stubble,1.5);
    }else{
     patch(c,p=>{p.moveTo(sign*(sideX-2),10);
      p.quadraticCurveTo(outer+sign*1.8,15,outer,22);
      p.quadraticCurveTo(outer-sign*2,chin-7,inner,chin-4);
      p.quadraticCurveTo(sign*(sideX-4),chin-10,sign*(sideX-5),16);
     },full?dark:h,dark,1.05);
     if(full)line(c,[[outer-sign*.6,18],[inner,chin-5]],rgba(tint(hair,.10),.45),1);
    }
   }
   return;
  }
  if(kind==='quarterBack'){
   if(type===2||type===3)patch(c,p=>{p.moveTo(23,8);p.quadraticCurveTo(33,15,21,chin-2);p.quadraticCurveTo(15,chin-8,19,14)},full?dark:h,null);
   return;
  }
  if(type===4){
   if(kind==='front')line(c,[[-10,19],[-3,20],[0,22],[4,20],[10,19]],dark,2.8);
   else line(c,[[kind==='side'?17:10,19],[kind==='side'?23:17,20]],dark,2.6);
   return;
  }
  const alpha=type===1,fill=alpha?stubble:full?dark:h,bonus=full?3:0;
  if(kind==='front'){
   patch(c,p=>{p.moveTo(-edge-4,14);p.quadraticCurveTo(-edge-9,chin-3,0,chin+bonus);p.quadraticCurveTo(edge+9,chin-3,edge+4,14);p.quadraticCurveTo(edge-5,23,0,23+bonus*.3);p.quadraticCurveTo(-edge+5,23,-edge-4,14)},fill,alpha?null:tint(hair,-.49),1);
   if(type>=2)line(c,[[-8,19],[-2,20],[0,22],[5,20],[9,19]],dark,2.1);
  }else{
   const offset=kind==='side'?5:0,shift=kind==='side'?5:0;
   patch(c,p=>{p.moveTo(8+offset,13);p.quadraticCurveTo(edge+12+shift,chin-8,8+shift,chin+bonus-2);p.quadraticCurveTo(2+shift,chin-4,5+offset,23);p.quadraticCurveTo(7+offset,18,8+offset,13)},fill,alpha?null:dark,1);
   if(type>=2)line(c,[[13+offset,19],[21+shift,20]],dark,2.1);
  }
  if(type===3){ // Individual tufts on chin are drawn inward, never below the silhouette by more than 3px.
   if(kind==='front'){line(c,[[-9,chin-2],[-4,chin+1],[0,chin]],tint(hair,.13),1);line(c,[[3,chin],[8,chin-3]],tint(hair,.12),1);}
   else line(c,[[13,chin-2],[10,chin+1]],tint(hair,.10),1);
  }
 }
 function headAccessories(c,kind,av,skin,hair,g){
  const a=index(av.accessory,6),rear=kind==='back'||kind==='quarterBack';
  if(a===1||a===5){
   const w=kind==='side'?24:g.w+4,y=a===1?-13:-15;
   patch(c,p=>{p.moveTo(-w,y-4);p.quadraticCurveTo(0,y-8,w,y-4);p.lineTo(w-2,y+1);p.quadraticCurveTo(0,y-3,-w+2,y+1)},a===1?'#eef0e8':'#3388ca','#273544',1.1);
   line(c,[[-w+5,y-2],[w-5,y-3]],rgba('#ffffff',.52),.8);
  }else if(a===2){
   if(kind==='front'||kind==='quarterFront'||kind==='side'){
    const x=kind==='front'?g.w+1:kind==='side'?-19:-22;
    oval(c,x,15,2.2,3.2,'#edc35e','#6d5444',.8);
    oval(c,x,15, .6,1.1,'#ffffff');
   }
  }else if(a===3&&!rear){
   const x=kind==='front'?19:20;
   patch(c,p=>{p.moveTo(x-4,16);p.lineTo(x+5,13);p.lineTo(x+6,16);p.lineTo(x-3,19)},'#eae7df','#887d76',.6);
  }else if(a===4&&!rear){
   const near=kind==='front'?12:kind==='side'?12:12,far=kind==='front'?-12:-8;
   const eyeWidth=kind==='side'?15:17;
   patch(c,p=>{p.roundRect(near-eyeWidth/2,2.5,eyeWidth,12,3)},rgba('#c8eafa',.18),'#253844',2);
   if(kind!=='side')patch(c,p=>{p.roundRect(far-7,3,kind==='front'?16:12,11,3)},rgba('#c8eafa',.18),'#253844',2);
   line(c,[[near-8,5],[near-11,4.5]],'#253844',1.4);
  }
 }
 function details(c,kind,av,skin,g){
  const rear=kind==='back'||kind==='quarterBack';if(rear)return;
  const freck=index(av.freckles,4);
  if(freck>0){const dots=freck===1?2:freck===2?4:6;for(let i=0;i<dots;i++){
   const x=kind==='front'?((i%2?1:-1)*(12+(i>>1)*2.4)):(12+(i%3)*3.3);
   const y=kind==='front'?16+(i%3)*1.4:16+(i%2);
   oval(c,x,y,.65,.65,rgba(tint(skin,-.43),.65));
  }}
  const scar=index(av.scar,6);
  if(scar){const x=kind==='front'?(scar%2?16:-17):17;
   line(c,[[x,scar===1?-5:14],[x+3,scar===1?4:23]],rgba('#8e4740',.58),1.2);
  }
 }
 function head(c,p,av,view,opt){
  const kind=geometry[view.kind]?view.kind:'side',skin=hex(opt.skin||av.skin),hair=hex(opt.hair||av.hair),dark=opt.dark||'#27303b',g=headSpecs(av);
  const facingFront=kind==='front'||kind==='quarterFront'||kind==='side';
  const eyeclosed=!!opt.hurt||!!opt.cry;
  c.save();c.translate(0,-80+(Math.abs(opt.run||0)>.25?Math.abs(opt.run)*.55:0));
  c.rotate(opt.signatureMotion?.headTilt||0);
  c.scale(clamp(opt.headScale,.7,1.5),clamp(opt.headScale,.7,1.5));
  // Long hair below the skull must be rendered before the face.
  if(index(av.style,13)===7||index(av.style,13)===10){
   if(kind!=='front')oval(c,-20,9,13,23,tint(hair,-.24),dark,1.7);
   else{oval(c,-g.w,8,10,22,tint(hair,-.24),dark,1.4);oval(c,g.w,8,10,22,tint(hair,-.24),dark,1.4);}
  }
  renderSkin(c,kind,av,skin,dark);
  // Layer beards behind lips so full beards no longer paint across mouths.
  beard(c,kind,av,skin,hair,g);
  if(facingFront){
   if(kind==='front'){
    brow(c,-12,-1,av.brows,hair);brow(c,12,-1,av.brows,hair);
    drawEye(c,-12,8,av.eyes,av.eyeColor,1,false,eyeclosed);
    drawEye(c,12,8,av.eyes,av.eyeColor,1,false,eyeclosed);
    nose(c,0,15,av.nose,skin,'front');
    lips(c,0,25,av.lips??av.mouth,skin,'front',opt.hurt||opt.cry);
   }else if(kind==='quarterFront'){
    brow(c,-9,-2,av.brows,hair,.72);brow(c,13,-2,av.brows,hair,.96);
    drawEye(c,-9,8,av.eyes,av.eyeColor,.70,true,eyeclosed);
    drawEye(c,13,8,av.eyes,av.eyeColor,.94,false,eyeclosed);
    nose(c,9,15,av.nose,skin,'side');
    lips(c,12,24,av.lips??av.mouth,skin,'oblique',opt.hurt||opt.cry);
   }else{
    brow(c,13,-2,av.brows,hair,.92);
    drawEye(c,13,8,av.eyes,av.eyeColor,.83,false,eyeclosed);
    nose(c,22,15,av.nose,skin,'side');
    lips(c,20,25,av.lips??av.mouth,skin,'side',opt.hurt||opt.cry);
   }
  }
  hairGeometry(c,av.style,kind,g,hair,dark);
  details(c,kind,av,skin,g);
  headAccessories(c,kind,av,skin,hair,g);
  if(opt.cry&&facingFront){const x=kind==='front'?12:16;oval(c,x,27,2.2,5,'#a9efffe0');}
  c.restore();
 }
 function boot(c,x,y,dir,color,kit,active){
  const t=dir;
  patch(c,p=>{p.moveTo(x-7,y-4);p.quadraticCurveTo(x+1,y-8,x+7,y-3);
   p.quadraticCurveTo(x+11+t*9,y-4,x+13+t*11,y+5);
   p.quadraticCurveTo(x+13+t*12,y+10,x+7,y+10);
   p.lineTo(x-9,y+8);p.quadraticCurveTo(x-12,y+2,x-7,y-4);
  },grad(c,x,y-6,x,y+10,[[0,active?'#f8f5e9':'#dbe9f0'],[.63,'#e7ebf0'],[1,'#9aaac0']]),'#202c3c',2);
  line(c,[[x-7,y+7],[x+10+t*10,y+7]],'#263645',2.7);
  line(c,[[x+2,y+1],[x+10,y+2]],color,1.8);
  line(c,[[x-1,y-2],[x+3,y+1],[x+7,y+1]],'#687b91',.95);
  oval(c,x+10+t*8,y+8,3,1.1,'#f6c25e');
 }
 function leg(c,sign,view,skin,kit,trim,shorts,dark,run,p,opt,near){
  const side=view.kind==='side',diagonal=view.kind.startsWith('quarter');
  const width=side?6:diagonal?9:12,x=sign*width;
  const gait=run*(sign>0?1:-1),kick=opt.kick&&sign>0;
  const forward=(side?22:diagonal?17:13)*gait+(kick?15:0);
  const lift=Math.max(0,gait)*(side?10:7)+(kick?12:0)+(opt.sliding?4:0);
  const knee=[x+forward*.47,-10-lift*.4],ankle=[x+forward,-1-lift];
  line(c,[[x,-19],knee],near?tint(skin,-.07):tint(skin,-.20),10.2,dark);
  oval(c,knee[0],knee[1],5.2,5.2,skin,dark,1.3);
  line(c,[knee,ankle],near?shorts:tint(shorts,-.18),9.5,dark);
  line(c,[[knee[0]+.5,knee[1]+4],[ankle[0],ankle[1]-5]],near?kit:tint(kit,-.18),9.0);
  line(c,[[ankle[0]-4,ankle[1]-6],[ankle[0]+4,ankle[1]-6]],trim,2.8);
  line(c,[[knee[0]+1,knee[1]+3],[ankle[0]+1,ankle[1]-4]],rgba('#ffffff',.21),1.9);
  boot(c,ankle[0],ankle[1],side?1:sign,trim,kit,near);
 }
 function shorts(c,view,kit,trim,dark){
  const side=view.kind==='side',w=side?15:21;
  patch(c,p=>{p.moveTo(-w,-24);p.lineTo(w,-24);p.lineTo(w+1,-9);p.quadraticCurveTo(w-3,-6,3,-9);p.lineTo(0,-12);p.lineTo(-3,-9);p.quadraticCurveTo(-w+3,-6,-w-1,-9)},kit,dark,2.25);
  patch(c,p=>{p.moveTo(-w,-23);p.lineTo(-3,-21);p.lineTo(-3,-10);p.quadraticCurveTo(-w+4,-7,-w,-9)},tint(kit,-.14),null);
  line(c,[[-w+3,-10],[-3,-10]],trim,1.4);
  line(c,[[3,-10],[w-3,-10]],trim,1.4);
 }
 function sleeve(c,sign,skin,main,contrast,trim,dark,run,p,opt,near,view){
  const side=view.kind==='side',quarter=view.kind.startsWith('quarter'),shoulder=sign*(side?13:quarter?18:23);
  const swing=run*sign*12+(opt.signatureMotion?.armSwing||0)*sign*.5+(opt.celebrate?-10:0);
  const dive=p.keeper&&['keeperDive','keeperDiveCatch','keeperSuper'].includes(p.action);
  const elbow=[shoulder+sign*(dive?22:11),dive?-60:-42+swing*.36];
  const wrist=[elbow[0]+sign*(dive?18:7),dive?-72:-25+swing];
  line(c,[[shoulder,-51],elbow],near?tint(main,.19):tint(main,-.22),15,dark);
  oval(c,elbow[0],elbow[1],6,6,near?tint(main,.11):tint(main,-.18),dark,1);
  line(c,[[elbow[0]-sign*3,elbow[1]+2],[elbow[0]+sign*3,elbow[1]+3]],trim,2);
  line(c,[elbow,wrist],near?tint(skin,.13):tint(skin,-.20),10,dark);
  line(c,[[elbow[0]+sign*2,elbow[1]+5],[wrist[0]-sign*1,wrist[1]-3]],rgba('#ffffff',.12),2);
  if(index(opt.avatarTattoo,6)&&near){
   line(c,[[elbow[0]+sign*1,elbow[1]+6],[elbow[0]+sign*5,elbow[1]+10]],tint(skin,-.39),1.3);
  }
  const glove=p.keeper?'#f1eee0':near?tint(skin,.10):skin;
  oval(c,wrist[0],wrist[1],6.3,7.3,glove,dark,1.8);
  if(p.keeper){line(c,[[wrist[0]-5,wrist[1]-1],[wrist[0]+5,wrist[1]+1]],'#369fb5',2);oval(c,wrist[0]+sign*3,wrist[1]-2,2,3,'#ffffff');}
 }
 function jersey(c,view,p,main,contrast,trim,dark){
  const kind=view.kind,side=kind==='side',quarter=kind.startsWith('quarter'),back=kind==='back'||kind==='quarterBack';
  const w=side?17:quarter?21:24;
  patch(c,q=>{q.moveTo(-w,-51);q.quadraticCurveTo(-w-1,-60,-7,-59);q.lineTo(8,-59);
   q.quadraticCurveTo(w+4,-55,w,-46);q.lineTo(w-4,-24);
   q.quadraticCurveTo(w-7,-19,w-11,-19);q.lineTo(-w+10,-19);
   q.quadraticCurveTo(-w+4,-21,-w,-30);
  },grad(c,-w,-57,w,-20,[[0,tint(main,.26)],[.32,main],[.7,main],[1,tint(main,-.40)]]),dark,2.8);
  patch(c,q=>{q.moveTo(-w,-51);q.lineTo(-w+9,-55);q.lineTo(-w+10,-23);q.lineTo(-w+5,-25)},rgba('#ffffff',.085),null);
  patch(c,q=>{q.moveTo(w-8,-54);q.lineTo(w,-50);q.lineTo(w-4,-24);q.lineTo(w-10,-23)},rgba('#081623',.19),null);
  line(c,[[-w+4,-47],[-w+7,-45]],contrast,3.5);
  line(c,[[w-6,-49],[w-6,-44]],contrast,3.5);
  line(c,[[-w+7,-24],[w-7,-24]],tint(main,-.37),1.8);
  patch(c,q=>{q.moveTo(-9,-56);q.quadraticCurveTo(0,-46,9,-56);q.lineTo(7,-59);q.quadraticCurveTo(0,-51,-7,-59)},contrast,dark,1.15);
  line(c,[[-w+7,-34],[-w+9,-25]],trim,1.4);
  if(back||kind==='front'||quarter&&!back){
   c.save();c.textBaseline='middle';c.textAlign='center';c.font=back?'900 21px Arial, sans-serif':'800 11px Arial, sans-serif';
   c.lineWidth=back?2.8:1.5;c.strokeStyle=tint(main,-.50);const str=String(p.src?.num??0);
   c.strokeText(str,back?-2:0,back?-37:-33);c.fillStyle=contrast;c.fillText(str,back?-2:0,back?-37:-33);c.restore();
  }
  if(!back&&!side){
   oval(c,-11,-45,3.5,3.8,contrast,dark,1);
   line(c,[[-13,-46],[-11,-43],[-8,-46]],tint(trim,-.1),.95);
  }
  line(c,[[-14,-53],[-5,-57]],rgba('#ffffff',.19),1.7);
 }
 function draw(c,p,av,team,view,opt={}){
  if(!c||!p||!team)return;
  const v=geometry[view?.kind]?view:{kind:'side',side:1};
  const skin=hex(opt.skin||av.skin||'#c69c7d'),main=hex(team.primary||'#3478bc'),secondary=hex(team.secondary||'#f3e8d1'),trim=hex(team.trim||secondary);
  const dark=opt.dark||'#263044',run=clamp(opt.run,-1,1);
  const nearKit=secondary;
  c.save();
  leg(c,-1,v,skin,nearKit,trim,nearKit,dark,run,p,opt,false);
  leg(c,1,v,skin,nearKit,trim,nearKit,dark,run,p,opt,true);
  shorts(c,v,nearKit,trim,dark);
  line(c,[[0,-59],[0,-50]],tint(skin,-.22),16,dark);
  line(c,[[-2,-57],[-2,-52]],tint(skin,.24),4);
  sleeve(c,-1,skin,main,secondary,trim,dark,run,p,opt,false,v);
  jersey(c,v,p,main,secondary,trim,dark);
  sleeve(c,1,skin,main,secondary,trim,dark,run,p,{...opt,avatarTattoo:av.tattoo},true,v);
  head(c,p,av,v,opt);
  c.restore();
 }
 return {draw,geometry,headSpecs};
})();
export {CHARACTER_ART};
