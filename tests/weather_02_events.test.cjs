'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');

test('storm events use a dedicated deterministic stream and bounded warning schedule',()=>{
 assert.match(engine,/nextWeatherRandom\(\)[\s\S]*?x\^=x<<13;x\^=x>>>17;x\^=x<<5/);
 assert.match(engine,/this\.weatherSeed=\(weatherSeed>>>0\)\|\|1/);
 assert.match(engine,/this\.stormTimer=5\.5\+this\.nextWeatherRandom\(\)\*2\.5/);
 assert.match(engine,/phase:'warning',remaining:\.55,duration:\.55/);
 assert.match(engine,/this\.emit\('lightningWarning'/);
 assert.match(engine,/this\.emit\('lightning',\{x,y,radius,playerHits:/);
});

test('lightning and tornado gameplay impulses have explicit caps and field recovery',()=>{
 assert.match(engine,/Math\.min\(\.65,impactStun\('lightning'/);
 assert.match(engine,/clamp\(\(this\.ball\.vx\|\|0\)\*1\.5,-750,750\)/);
 assert.match(engine,/clamp\(\(this\.ball\.vz\|\|0\)\+180,0,300\)/);
 assert.match(engine,/life:4\.5,totalLife:4\.5,radius:150/);
 assert.match(engine,/F\.x\+120,F\.x\+F\.w-120/);
 assert.match(engine,/F\.y\+120,F\.y\+F\.h-120/);
 assert.match(engine,/F\.x\+22,F\.x\+F\.w-22/);
 assert.match(engine,/F\.y\+24,F\.y\+F\.h-24/);
 assert.match(engine,/clamp\(\(this\.ball\.vx\|\|0\).*?-700,700\)/);
 assert.match(engine,/clamp\(\(this\.ball\.vy\|\|0\).*?-700,700\)/);
 assert.match(engine,/clamp\(\(this\.ball\.vz\|\|0\)\+90\*dt,0,300\)/);
});

test('weather VFX are reduced-motion aware and keep an explicit gameplay warning radius',()=>{
 assert.match(render,/drawWeatherLightning\(ctx,lightning,reducedFlash=false\)/);
 assert.match(render,/lightning\.radius\|\|110/);
 assert.match(render,/ctx\.shadowBlur=reducedFlash\?0:7/);
 assert.match(render,/n=heavy\?\(reducedFlash\?96:220\):\(reducedFlash\?24:45\)/);
 assert.match(render,/drawTornado\(ctx,t,reducedFlash=false\)/);
 assert.match(render,/ctx\.setLineDash\(reducedFlash\?\[\]:\[8,7\]\)/);
 assert.match(render,/turn=reducedFlash\?0:this\.time\*\.7/);
});

test('reduced-motion weather holds precipitation and lightning art steady without changing normal motion',()=>{
 const weather=render.slice(render.indexOf('drawWeather(ctx,g){'),render.indexOf('drawBorder(ctx,g)'));
 const lightning=render.slice(render.indexOf('drawWeatherLightning(ctx,lightning'),render.indexOf('drawWeather(ctx,g)'));
 assert.match(weather,/const motionTime=reducedFlash\?0:this\.time/);
 assert.match(weather,/motionTime\*\(wind\?300:210\)/);
 assert.match(weather,/motionTime\*850/);
 assert.match(weather,/motionTime\*92/);
 assert.match(weather,/motionTime\*610/);
 assert.match(lightning,/progress=reducedFlash\?1:clamp\(1-lightning\.remaining\/lightning\.duration,0,1\)/);
 assert.match(lightning,/fade=reducedFlash\?1:clamp\(lightning\.remaining\/lightning\.duration,0,1\)/);
 assert.match(weather,/reducedFlash\?96:220/,'the reduced-motion path retains the lower-particle mode');
});

test('precipitation stays inside the field and rain depth cues are deterministic and reduced-flash safe',()=>{
 const draw=render.slice(render.indexOf('drawWeather(ctx,g){'),render.indexOf('drawBorder(ctx,g)'));
 assert.match(draw,/ctx\.rect\(F\.x,F\.y,F\.w,F\.h\);ctx\.clip\(\)/);
 assert.match(draw,/for\(let band=0;band<5;band\+\+\)/);
 assert.match(draw,/const depth=band\/4/);
 assert.match(draw,/ctx\.moveTo\(x,y\);ctx\.lineTo\(x\+dx,y\+dy\)/);
 assert.match(draw,/ctx\.lineWidth=\.9\+depth\*\.8;ctx\.strokeStyle=baseColor;ctx\.lineJoin='round';ctx\.stroke\(\)/);
 assert.doesNotMatch(draw,/line\(ctx,\[\[x,y\],\[x\+dx,y\+dy\]\]/);
 assert.match(draw,/if\(heavy\)for\(let i=0;i<n;i\+=11\)/);
 assert.match(draw,/ctx\.globalAlpha=reducedFlash\?\.075:\.12/);
 assert.match(draw,/ctx\.restore\(\);\s*\}\s*this\.drawWeatherLightning/);
 assert.match(draw,/n=heavy\?\(reducedFlash\?96:220\):\(reducedFlash\?24:45\)/);
});
