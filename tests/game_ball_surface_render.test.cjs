'use strict';
const {test,before}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {fileURLToPath}=require('node:url');

let RENDER;
before(async()=>{
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
 await (await import('../src/assets.js')).loadAssets();
 ({RENDER}=await import('../src/modules/render.js'));
});

function context(withGradient=true){
 const fills=[],arcs=[],strokes=[],rotations=[],polygonFills=[];
 const ctx={
  fills,arcs,strokes,rotations,polygonFills,fillStyle:null,strokeStyle:null,lineWidth:1,pathVertices:0,
  save(){},restore(){},translate(){},rotate(v){rotations.push(v)},
  beginPath(){this.pathVertices=0},arc(x,y,r){arcs.push({x,y,r})},ellipse(){},quadraticCurveTo(){},clip(){},
  moveTo(){this.pathVertices=1},lineTo(){this.pathVertices++},closePath(){},fill(){fills.push(this.fillStyle);polygonFills.push({color:this.fillStyle,vertices:this.pathVertices})},
  stroke(){strokes.push({color:this.strokeStyle,width:this.lineWidth,vertices:this.pathVertices})},
 };
 if(withGradient)ctx.createRadialGradient=(...args)=>{
  const gradient={args,stops:[],addColorStop(offset,color){this.stops.push([offset,color])}};
  ctx.fills.push(gradient);return gradient;
 };
 return ctx;
}

test('game ball gets layered sphere lighting while preserving its exact radius and rotation API',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype),ctx=context();
 renderer.drawSoccerBall(ctx,40,50,18,'classic',.75);
 const gradient=ctx.fills.find(item=>item&&item.stops);
 assert.ok(gradient,'sphere lighting uses a radial highlight and shaded rim');
 const firstClassicPanel=ctx.fills.findIndex(item=>item==='#1b2a35');
 const sphereRamp=ctx.fills.findIndex(item=>item&&item.stops);
 assert.ok(firstClassicPanel>=0&&sphereRamp>firstClassicPanel,'sphere shading is applied over completed panel artwork');
 assert.deepEqual(gradient.stops.map(stop=>stop[0]),[0,.26,.68,1]);
 assert.equal(ctx.arcs[0].r,18,'clip radius stays equal to the gameplay ball radius');
 assert.equal(ctx.rotations[0],.75,'painted panels keep the existing rotation argument');
 assert.ok(ctx.strokes.some(stroke=>stroke.color==='#52616b'),'classic panels expose fine seams');
 assert.ok(ctx.fills.some(fill=>fill==='rgba(255,255,255,.74)'),'surface keeps a crisp specular highlight');
});

test('all ball designs keep a shaded surface and circular outline without mutating geometry',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype);
 for(const model of ['classic','meteor','ice','gold','retro','hinomaru','tricolore','auriverde']){
  const ctx=context();renderer.drawSoccerBall(ctx,0,0,15,model,0);
  assert.equal(ctx.arcs[0].r,15,model+' clip radius');
  assert.ok(ctx.fills.some(item=>item&&item.stops),model+' sphere lighting');
  assert.ok(ctx.strokes.length>=1,model+' circular outline');
 }
});

test('non-classic skins gain match-scale spherical seams and distinct material glints while classic stays unchanged',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype),skins=['meteor','ice','gold','retro'];
 const glint={meteor:'rgba(255,211,157,.28)',ice:'rgba(220,252,255,.42)',gold:'rgba(255,251,211,.44)',retro:'rgba(255,227,194,.30)'};
 const classic=context();renderer.drawSoccerBall(classic,0,0,17,'classic',.4);
 assert.equal(classic.strokes.filter(stroke=>stroke.color==='#52616b'&&stroke.vertices>=30).length,6,
  'classic retains its original six panel outlines');
 for(const model of skins){
  const ctx=context();renderer.drawSoccerBall(ctx,2,-3,17,model,Math.PI/3);
  const seams=ctx.strokes.filter(stroke=>stroke.vertices>=30&&stroke.width>=.45);
  assert.equal(seams.length,6,model+' gets a curved center-and-five-panel seam layout');
  assert.ok(seams.every(stroke=>stroke.color!=='#52616b'),model+' uses its own seam material');
  assert.ok(ctx.fills.some(fill=>fill?.stops?.some(stop=>stop[1]===glint[model])),model+' gets its model-specific specular color');
  assert.equal(ctx.arcs[0].r,17,model+' remains clipped to the match ball radius');
  assert.equal(ctx.rotations[0],Math.PI/3,model+' preserves painted rotation');
 }
});

test('in-match ball sends its travel vector and roll angle to renderer-only surface projection',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype),painted=[];
 renderer.drawBallShadow=()=>{};
 renderer.drawSoccerBall=(_ctx,_x,_y,r,model,rotation,tumble)=>painted.push({r,model,rotation,tumble});
 const ctx={globalAlpha:1,save(){},restore(){},translate(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},stroke(){}};
 const options={ballModel:'classic',reducedFlash:false};
 for(const [vx,vy] of [[400,0],[-400,0],[0,400],[0,-400]]){
  const ball={x:100,y:200,z:0,vx,vy,vz:0,owner:null,shot:null,trail:[],rollAngle:.4};
  const game={ball,options},before=JSON.stringify({ball,options});renderer.drawBall(ctx,game);
  assert.deepEqual(painted.at(-1),{r:17,model:'classic',rotation:.4,tumble:{dx:vx,dy:vy}},'match surface receives exact travel direction and existing roll angle');
  assert.equal(JSON.stringify({ball,options}),before,'drawing keeps physics state and saved cosmetic selection unchanged');
 }
});

test('possessed field-player balls tumble with carrier movement while stationary and keeper-held balls keep their fallback',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype),painted=[];
 renderer.drawBallShadow=()=>{};renderer.drawSoccerBall=(_ctx,_x,_y,r,model,rotation,tumble)=>painted.push({r,model,rotation,tumble});
 const ctx={globalAlpha:1,save(){},restore(){},translate(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},stroke(){}};
 const options={ballModel:'meteor',reducedFlash:false};
 const vectors=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
 for(const [moveVX,moveVY] of vectors){
  const ball={x:100,y:200,z:0,vx:0,vy:0,vz:0,owner:{x:100,y:200,moveVX,moveVY,keeper:false},shot:null,trail:[],rollAngle:Math.PI/3};
  const before=JSON.stringify({ball,options});renderer.drawBall(ctx,{ball,options});
  assert.deepEqual(painted.at(-1),{r:17,model:'meteor',rotation:Math.PI/3,tumble:{dx:moveVX,dy:moveVY}},'carried-ball surface follows all eight carrier headings');
  assert.equal(JSON.stringify({ball,options}),before,'rendering does not change the match or cosmetic selection');
 }
 for(const owner of [{x:100,y:200,moveVX:0,moveVY:0,keeper:false},{x:100,y:200,moveVX:1,moveVY:1,keeper:true,action:'keeperHold',face:1}]){
  const ball={x:100,y:200,z:0,vx:0,vy:0,vz:0,owner,shot:null,trail:[],rollAngle:.2};renderer.drawBall(ctx,{ball,options});
  assert.deepEqual(painted.at(-1).tumble,{dx:0,dy:0},owner.keeper?'keeper-held ball preserves stationary projection fallback':'stationary carrier preserves stationary projection fallback');
 }
});

test('rolling projection is renderer-only and maps a front-facing sphere mesh without changing outline radius',()=>{
 const start=RENDER.Renderer.prototype.drawRollingBallSurface.toString();
 assert.match(start,/Math\.hypot\(Number\(dx\)/,'travel direction is used only to select tumble axis');
 assert.match(start,/Math\.cos\(rotation\)|Math\.sin\(rotation\)/,'existing roll angle rotates the surface');
 assert.match(start,/ctx\.transform\(m11,m21,m12,m22,tx,ty\);ctx\.drawImage\(surface,0,0\)/,'panel artwork is projected through a tessellated 3D sphere mesh');
 assert.doesNotMatch(start,/game\.|ball\.|physics|collision|\.[a-zA-Z]+\s*=/,'mesh does not write gameplay state');
 const outline=RENDER.Renderer.prototype.drawBallOutline.toString();assert.match(outline,/ctx\.arc\(0,0,r/,'original circular outline keeps the requested radius');
});

test('classic ball uses a connected center and five surrounding pentagon panels',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype),ctx=context();
 renderer.drawSoccerBall(ctx,0,0,30,'classic',0);
 const pentagons=ctx.polygonFills.filter(shape=>shape.color==='#1b2a35'&&shape.vertices>=30);
 assert.equal(pentagons.length,6,'center and five inward-facing surround panels use five sides');
 assert.ok(ctx.strokes.filter(stroke=>stroke.color==='#52616b'&&stroke.vertices>=30&&stroke.width<=1.1).length>=6,
  'all five-sided panel edges are smoothly projected onto the spherical surface');
});

test('classic panel projection leaves the gameplay circle and render rotation intact',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype),ctx=context();
 renderer.drawSoccerBall(ctx,3,7,17,'classic',Math.PI/4);
 assert.equal(ctx.arcs[0].r,17,'sphere clip remains the declared gameplay radius');
 assert.equal(ctx.rotations[0],Math.PI/4,'spherical panels honor the existing rotation API');
 assert.ok(ctx.polygonFills.filter(shape=>shape.color==='#1b2a35').every(shape=>shape.vertices>5),
  'panel geodesics are tessellated rather than flat five-edge decals');
});

test('older Canvas contexts retain the non-gradient ball fallback',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype),ctx=context(false);
 renderer.drawSoccerBall(ctx,0,0,12,'classic',0);
 assert.ok(ctx.fills.includes('#f4f1dd'),'fallback still paints the existing classic base');
 assert.equal(ctx.arcs[0].r,12);
 assert.ok(ctx.strokes.length>=1,'fallback still draws the outer seam');
});

test('airborne ball shadow gets tighter and softer while ground contact remains unchanged',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype),samples=[];
 const ctx={globalAlpha:1,stack:[],save(){this.stack.push(this.globalAlpha)},restore(){this.globalAlpha=this.stack.pop()},
  beginPath(){},ellipse(x,y,rx,ry,_rotation,_start,_end){samples.push({x,y,rx,ry,opacity:this.globalAlpha})},fill(){}};
 for(const z of [0,60,120,240])renderer.drawBallShadow(ctx,100,200,z,1);
 assert.deepEqual(samples[0],{x:100,y:204,rx:15,ry:7,opacity:1},'ground contact keeps the existing footprint');
 for(let i=1;i<samples.length;i++){
  assert.ok(samples[i].rx<samples[i-1].rx,'shadow narrows with ball height');
  assert.ok(samples[i].ry<samples[i-1].ry,'shadow flattens with ball height');
  assert.ok(samples[i].opacity<samples[i-1].opacity,'shadow fades as the ball rises');
 }
 assert.ok(Math.abs(samples.at(-1).rx-5.5)<1e-9);assert.ok(Math.abs(samples.at(-1).ry-2.4)<1e-9);
 assert.equal(ctx.globalAlpha,1,'shadow helper restores canvas alpha');
});

test('ordinary fast-pass streak is visible normally and softened in reduced-flash mode',()=>{
 const renderer=Object.create(RENDER.Renderer.prototype),capture=reducedFlash=>{
  const strokes=[],stack=[],ctx={globalAlpha:1,strokeStyle:null,lineWidth:1,lineCap:'butt',path:[],
   save(){stack.push([this.globalAlpha,this.strokeStyle,this.lineWidth,this.lineCap]);},
   restore(){[this.globalAlpha,this.strokeStyle,this.lineWidth,this.lineCap]=stack.pop();},
   beginPath(){this.path=[];},moveTo(x,y){this.path.push([x,y]);},lineTo(x,y){this.path.push([x,y]);},
   quadraticCurveTo(_cx,_cy,x,y){this.path.push([x,y]);},
   stroke(){strokes.push({alpha:this.globalAlpha,color:this.strokeStyle,width:this.lineWidth,path:this.path.slice()});},
   translate(){}};
  renderer.drawBallShadow=()=>{};renderer.drawSoccerBall=()=>{};
  const ball={x:300,y:180,z:0,vx:400,vy:0,owner:null,shot:null,trail:[]};
  const game={ball,options:{reducedFlash}};
  renderer.drawBall(ctx,game);
  return {stroke:strokes[0],state:JSON.stringify(ball)};
 };
 const normal=capture(false),reduced=capture(true);
 assert.ok(normal.stroke.alpha>.2&&normal.stroke.width===8,'standard mode keeps a clear outer speed cue');
 assert.ok(reduced.stroke.alpha<normal.stroke.alpha&&reduced.stroke.width<normal.stroke.width,'reduced-flash softens the cue');
 const length=sample=>Math.hypot(sample.stroke.path[0][0]-sample.stroke.path[1][0],sample.stroke.path[0][1]-sample.stroke.path[1][1]);
 assert.ok(length(reduced)<length(normal),'reduced-flash shortens the visual streak');
 assert.equal(normal.state,reduced.state,'visual accessibility setting does not change the ball state');
});
