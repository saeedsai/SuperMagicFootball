'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
const helperSource=source.match(/function drawSpiralRibbon\(ctx,trail,color,reducedFlash=false\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(helperSource,'spiral trail helper is present');
const drawSpiralRibbon=new Function('PI',`${helperSource};return drawSpiralRibbon;`)(Math.PI);
function mockContext(){
 const strokes=[];let points=[];
 return {strokes,globalAlpha:1,shadowBlur:0,
  save(){},restore(){},beginPath(){points=[];},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},
  stroke(){strokes.push({points:points.slice(),color:this.strokeStyle,width:this.lineWidth,alpha:this.globalAlpha,blur:this.shadowBlur});}};
}
const trail=Array.from({length:30},(_,i)=>({x:i*12,y:200+Math.sin(i*.4)*20,z:i*.2}));

test('Tornado Shot draws a deterministic two-strand path helix within the recent trail',()=>{
 const ctx=mockContext();drawSpiralRibbon(ctx,trail,'#7ce7ff',false);
 assert.equal(ctx.strokes.length,2);
 for(const stroke of ctx.strokes){
  assert.equal(stroke.points.length,22,'trail geometry is bounded to recent samples');
  assert.ok(stroke.points.flat().every(Number.isFinite));
  assert.ok(stroke.points.some(([x,y],i)=>i>0&&Math.hypot(x-stroke.points[0][0],y-stroke.points[0][1])>1));
  assert.equal(stroke.blur,7);assert.equal(stroke.alpha,.78);
 }
 assert.deepEqual(ctx.strokes.map(s=>s.points),(()=>{const second=mockContext();drawSpiralRibbon(second,trail,'#7ce7ff',false);return second.strokes.map(s=>s.points)})());
});

test('reduced-flash mode keeps a quiet readable ribbon and short trails draw nothing',()=>{
 const reduced=mockContext();drawSpiralRibbon(reduced,trail,'#7ce7ff',true);
 assert.equal(reduced.strokes.length,2);
 assert.ok(reduced.strokes.every(s=>s.alpha===.46&&s.blur===0));
 const short=mockContext();drawSpiralRibbon(short,trail.slice(0,3),'#7ce7ff',false);
 assert.equal(short.strokes.length,0);
});

test('the distinct ribbon is limited to spiral shots; ordinary transformation trails stay intact',()=>{
 const drawBall=source.match(/drawBall\(ctx,game\)\{[\s\S]*?\n drawSoccerBall\(/)?.[0]||'';
 assert.match(drawBall,/shot\?\.behavior==='spiral'\)drawSpiralRibbon\(ctx,b\.trail,shot\.trail,!!game\.options\?\.reducedFlash\)/);
 assert.match(drawBall,/if\(b\.trail\)\{for\(let i=0;i<b\.trail\.length;i\+\+\)/);
 assert.match(drawBall,/ellipse\(ctx,p\.x,p\.y-p\.z,underground\?2\+i\*\.12:4\+i\*\.55,underground\?1\.5\+i\*\.1:3\+i\*\.43,underground\?'#68dbe0':shot\.trail\)/);
});
