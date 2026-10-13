import assert from 'node:assert/strict';
import {faceShapeOutline, drawHairSilhouette, drawBrows, drawEyes, drawNose, drawLips, Renderer} from '../src/render.js';
import {avatarFor} from '../src/expanded.js';
function context(){
 const ops=[]; const c={ops,fillStyle:'',strokeStyle:'',lineWidth:0,font:'',textAlign:'',globalAlpha:1};
 for(const name of ['beginPath','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','closePath','arc','ellipse','roundRect','fill','stroke','save','restore','translate','scale','rotate','fillText','strokeText','fillRect'])
  c[name]=(...args)=>{ops.push([name,...args]);};
 return c;
}
const faces=new Set(),hair=new Set(),brows=new Set(),eyes=new Set(),noses=new Set(),lips=new Set();
for(let i=0;i<5;i++){
 const c=context();faceShapeOutline(c,i,31);
 assert.equal(c.ops[0][0],'beginPath');assert.equal(c.ops.at(-1)[0],'closePath');
 assert(c.ops.length>=5);faces.add(JSON.stringify(c.ops));
}
for(let i=0;i<13;i++){
 const c=context();drawHairSilhouette(c,i,'#221f1a','#12131b');
 assert(c.ops.length>5);assert(c.ops.some(a=>a[0]==='fill'));hair.add(JSON.stringify(c.ops));
}
for(let i=0;i<20;i++){
 const c1=context();drawBrows(c1,i,'#111');brows.add(JSON.stringify(c1.ops));
 const c2=context();drawEyes(c2,i,0,'#111');eyes.add(JSON.stringify(c2.ops));
}
for(let i=0;i<6;i++){
 const c=context();drawNose(c,i);noses.add(JSON.stringify(c.ops));
}
for(let i=0;i<8;i++){
 const c=context();drawLips(c,i);lips.add(JSON.stringify(c.ops));
}
assert.equal(faces.size,5,'Five face shapes must be visibly different vector paths');
assert.equal(hair.size,13,'All 13 hairstyles must have distinct vector instructions');
assert.equal(brows.size,20,'Need 20 unique eyebrow shapes');
assert.equal(eyes.size,20,'Need 20 unique eye shapes');
assert.equal(noses.size,6,'Need 6 unique nose shapes');
assert.equal(lips.size,8,'Need 8 unique lip shapes');
for(let i=0;i<400;i++){
 const a=avatarFor({name:'Generated Tester '+i,id:'test-'+i});
 assert(Number.isInteger(a.style)&&a.style>=0&&a.style<13);
 assert(Number.isInteger(a.face)&&a.face>=0&&a.face<5);
 assert(Number.isInteger(a.eyes)&&a.eyes>=0&&a.eyes<20);
 assert(Number.isInteger(a.brows)&&a.brows>=0&&a.brows<20);
 assert(Number.isInteger(a.eyeColor)&&a.eyeColor>=0&&a.eyeColor<6);
 assert(Number.isInteger(a.nose)&&a.nose>=0&&a.nose<6);
 assert(Number.isInteger(a.lips)&&a.lips>=0&&a.lips<8);
}
const r=Object.create(Renderer.prototype);r.time=0.2;
const team={primary:'#b43c5b',secondary:'#f2e2a1',trim:'#ffffff'};
let tested=0;
for(let i=0;i<20;i++){
 const a={style:i%13,face:i%5,eyes:i,brows:i,eyeColor:i%6,nose:i%6,lips:i%8,body:i%5,stature:i%5,exaggeration:i%3,skin:'#c89063',hair:'#29212a',beard:2,accessory:0};
 const p={t:0,i,src:{name:'Art Test '+i, num:i+1,appearance:a},x:0,y:0,z:0,dx:0,dy:0,face:1,anim:1,action:i%5===0?'celebrate':i%5===1?'cry':i%5===2?'hurt':i%5===3?'super':'idle',stun:0,fatigue:0};
 const c=context();r.drawPlayer(c,p,{getTeam:()=>team,options:{showNames:false}});tested++;
 assert(c.ops.some(op=>op[0]==='bezierCurveTo'||op[0]==='quadraticCurveTo'),'Face has custom silhouette');
 assert(c.ops.some(op=>op[0]==='fill'),'Character has visible artwork');
}
console.log('v0.8.14 CHARACTER ART PASS: 5 faces, 13 hairstyles, 20 eyes, 20 brows, 6 noses, 8 lips, 20 render combinations, 400 deterministic identity records');
