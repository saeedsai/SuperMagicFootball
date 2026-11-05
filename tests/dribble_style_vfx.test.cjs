'use strict';
const {test,before}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {fileURLToPath}=require('node:url');
let RENDER,STYLES;
before(async()=>{
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
 await (await import('../src/assets.js')).loadAssets();
 ({RENDER}=await import('../src/modules/render.js'));
 STYLES=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/mechanics/gameplay.json'),'utf8')).dribbleStyles;
});

function recorder(){
 const calls=[];
 const ctx={calls,save(){calls.push('save')},restore(){calls.push('restore')},scale(...v){calls.push(['scale',...v])},beginPath(){calls.push('path')},
  moveTo(x,y){calls.push(['move',x,y])},lineTo(x,y){calls.push(['line',x,y])},bezierCurveTo(...v){calls.push(['bezier',...v])},
  quadraticCurveTo(...v){calls.push(['quad',...v])},arc(...v){calls.push(['arc',...v])},ellipse(...v){calls.push(['ellipse',...v])},
  stroke(){calls.push('stroke')},fill(){calls.push('fill')},fillText(text,x,y){calls.push(['text',text,x,y])},
 };
 return ctx;
}

test('all ten equipped dribble styles draw distinct static visual cues without mutating gameplay state',()=>{
 assert.equal(STYLES.length,10,'the current player catalog has ten authored dribble styles');
 const renderer=Object.create(RENDER.Renderer.prototype),signatures=new Set();
 for(const style of STYLES){
  const ctx=recorder(),player={face:1,trickStyleId:style.id,trickFx:.4};
  const before=JSON.stringify(player);renderer.drawDribbleTrickEffect(ctx,player);
  const label=ctx.calls.find(call=>Array.isArray(call)&&call[0]==='text');
  assert.equal(label?.[1],style.name.toUpperCase(),`${style.id} retains its accessible move label`);
  assert.ok(ctx.calls.includes('stroke')||ctx.calls.includes('fill'),`${style.id} draws a cue`);
  assert.equal(JSON.stringify(player),before,`${style.id} does not mutate player state`);
  signatures.add(JSON.stringify(ctx.calls));
  const mirrored=recorder(),opponent={face:-1,trickStyleId:style.id,trickFx:.4};
  renderer.drawDribbleTrickEffect(mirrored,opponent,-1);
  assert.ok(mirrored.calls.includes('stroke')||mirrored.calls.includes('fill'),`${style.id} also draws for the mirrored team`);
  assert.ok(mirrored.calls.some(call=>Array.isArray(call)&&call[0]==='scale'&&call[1]===-1),`${style.id} counter-mirrors its readable label for the opposite view`);
 }
 assert.equal(signatures.size,STYLES.length,'each style has its own geometry rather than a recolored common ring');
});

test('renderer guards dribble effects to a live trick action with a positive effect timer',()=>{
 const source=RENDER.Renderer.prototype.drawPlayer.toString();
 assert.match(source,/p\.action==='dribbleTrick'&&p\.trickFx>0/,'idle/action poses do not draw a stale trick effect');
 assert.match(source,/this\.drawDribbleTrickEffect\(ctx,p,view\.side\)/,'live trick presentation uses style-specific artwork and keeps labels readable when mirrored');
});
