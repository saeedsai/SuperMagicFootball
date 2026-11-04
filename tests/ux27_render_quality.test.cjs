'use strict';
const {test,before}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {fileURLToPath}=require('node:url');

let DATA,RENDER;
before(async()=>{
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
 const assets=await import('../src/assets.js');
 await assets.loadAssets();
 [{DATA},{RENDER}]=await Promise.all([
  import('../src/modules/data.js').then(x=>({DATA:x.DATA})),
  import('../src/modules/render.js').then(x=>({RENDER:x.RENDER})),
 ]);
});

test('UX27 graphics quality preset lowers backing resolution without changing logical game dimensions',()=>{
 const saved={innerWidth:globalThis.innerWidth,innerHeight:globalThis.innerHeight,window:globalThis.window};
 globalThis.innerWidth=1280;
 globalThis.innerHeight=720;
 globalThis.window={devicePixelRatio:2};
 try{
  const renderer=Object.create(RENDER.Renderer.prototype);
  renderer.canvas={width:0,height:0};
  renderer.renderQuality='high';
  renderer.resize();
  assert.equal(renderer.dpr,2);
  assert.equal(renderer.canvas.width,2560);
  assert.equal(renderer.canvas.height,1440);
  const logical=[renderer.screenW,renderer.screenH];

  assert.equal(renderer.setRenderQuality('performance'),'performance');
  assert.equal(renderer.dpr,1.5);
  assert.equal(renderer.canvas.width,1920);
  assert.equal(renderer.canvas.height,1080);
  assert.deepEqual([renderer.screenW,renderer.screenH],logical);
  assert.equal(renderer.setRenderQuality('unknown'),'high','invalid values safely use the high preset');
  assert.equal(renderer.dpr,2);
 }finally{
  if(saved.innerWidth===undefined)delete globalThis.innerWidth;else globalThis.innerWidth=saved.innerWidth;
  if(saved.innerHeight===undefined)delete globalThis.innerHeight;else globalThis.innerHeight=saved.innerHeight;
  if(saved.window===undefined)delete globalThis.window;else globalThis.window=saved.window;
 }
});

test('UX27 graphics preset defaults safely and persists through the existing options save path',()=>{
 assert.equal(DATA.DEFAULT_OPTIONS.renderQuality,'high');
 const ui=fs.readFileSync(path.resolve(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(ui,/field\('RENDER QUALITY','renderQuality',\[\['high','High detail'\],\['performance','Performance'\]\],opt\.renderQuality\)/);
 assert.match(ui,/\['renderQuality','renderQuality',v=>v==='performance'\?'performance':'high'\]/);
 assert.match(ui,/Object\.assign\(opt,changes\);\s*renderer\.setRenderQuality\(opt\.renderQuality\);/);
 assert.match(ui,/store\.put\('options',opt\)/);
});
