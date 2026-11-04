"""WEATHER-02 deterministic gameplay and actual-renderer Chromium review."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf8')
PREVIEW = ROOT / 'tests/.generated/weather_02_render_preview.png'
JS = r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawWeatherLightning||!renderer?.drawTornado)throw Error('weather renderer is unavailable');
 const seed=20261101,records=[];
 function setup(weather,reducedFlash=false){game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather,weatherSeed:seed,reducedFlash,terrain:'Grass',condition:'Good'}});game.events=[];return game;}
 function stormAt(fps){setup('Storm',true);game.players=[];game.stormTimer=0;game.clock=0;game.updateWeather(1/fps);const c=game.weatherLightning;
  if(!c||c.phase!=='warning'||c.duration!==.55)throw Error('Storm did not create a bounded telegraph '+JSON.stringify(c));
  return {x:c.x,y:c.y,event:game.events.find(e=>e.type==='lightningWarning')};}
 const stormPositions=[30,60,120].map(stormAt);
 if(stormPositions.some(x=>x.x!==stormPositions[0].x||x.y!==stormPositions[0].y))throw Error('Lightning event changed across refresh rates '+JSON.stringify(stormPositions));
 setup('Storm',true);game.stormTimer=0;game.clock=0;game.updateWeather(1/60);let cue=game.weatherLightning;
 const victim=game.player(0,3),keeper=game.player(0,0),outside=game.player(0,4);
 Object.assign(victim,{x:cue.x+25,y:cue.y,stun:0,actionTimer:0});Object.assign(keeper,{x:cue.x,y:cue.y,stun:0});Object.assign(outside,{x:cue.x+130,y:cue.y,stun:0});
 Object.assign(game.ball,{x:cue.x+25,y:cue.y,vx:750,vy:0,vz:250,owner:null});
 game.updateWeather(.54);
 if(victim.stun||game.events.some(e=>e.type==='lightning'))throw Error('Lightning applied before its warning finished');
 game.updateWeather(.02);
 const lightning=game.events.find(e=>e.type==='lightning');
 if(!lightning||victim.stun<=0||victim.stun>.65||keeper.stun||outside.stun||game.ball.vx>750||game.ball.vz>300||game.shake||game.flash)
  throw Error('Bounded lightning outcome failed '+JSON.stringify({lightning,stun:victim.stun,keeper:keeper.stun,outside:outside.stun,ball:game.ball,shake:game.shake,flash:game.flash}));
 const firstHit={x:lightning.x,y:lightning.y,stun:victim.stun,vx:game.ball.vx,vz:game.ball.vz};
 game.updateWeather(.19);if(game.weatherLightning)throw Error('Lightning strike cue did not expire');
 records.push({kind:'lightning-warning-and-capped-strike',result:firstHit});
 function tornadoTrial(fps){setup('Tornado',true);game.stormTimer=0;game.clock=0;game.updateWeather(1/fps);const t={...game.tornado};
  const target=game.player(0,3),keeper=game.player(0,0),highJump=game.player(1,4);Object.assign(target,{x:t.x+30,y:t.y,z:0});Object.assign(keeper,{x:t.x,y:t.y,z:0});Object.assign(highJump,{x:t.x+60,y:t.y,z:130});
  Object.assign(game.ball,{x:t.x+20,y:t.y,vx:700,vy:650,vz:250,owner:null});
  for(let i=0;i<fps;i++){game.clock+=1/fps;game.updateWeather(1/fps);}
  const result={spawn:{x:t.x,y:t.y,life:t.life},player:{x:target.x,y:target.y,z:target.z},keeper:{x:keeper.x,y:keeper.y,z:keeper.z},highJumpZ:highJump.z,ball:{vx:game.ball.vx,vy:game.ball.vy,vz:game.ball.vz},life:game.tornado.life};
  if(!game.tornado||t.life!==4.5||target.x<150||target.y<179||target.z>85||keeper.x!==t.x||keeper.y!==t.y||highJump.z!==130||Math.abs(game.ball.vx)>700||Math.abs(game.ball.vy)>700||game.ball.vz>300)
   throw Error('Tornado bounds/counterplay failed '+JSON.stringify(result));
  return result;}
 const tornado=[30,60,120].map(tornadoTrial),reference=tornado[0];
 for(const r of tornado.slice(1))if(Math.abs(r.spawn.x-reference.spawn.x)>1||Math.abs(r.spawn.y-reference.spawn.y)>1||Math.abs(r.ball.vx-reference.ball.vx)>5||Math.abs(r.ball.vy-reference.ball.vy)>5)
  throw Error('Tornado event changed across refresh rates '+JSON.stringify(tornado));
 records.push({kind:'tornado-bounds-fps',results:tornado});
 setup('Tornado',true);game.stormTimer=0;game.updateWeather(1/60);game.updateWeather(4.51);
 if(game.tornado||!game.events.some(e=>e.type==='tornadoExpired'))throw Error('Tornado did not expire cleanly');
 records.push({kind:'tornado-expiry'});
 // Review actual renderer output for warning/strike and both tornado access modes.
 function weatherStrokeCount(weather,reducedFlash=false){
  const raw=document.createElement('canvas').getContext('2d');let count=0;
  const ctx=new Proxy(raw,{get(target,key){const value=Reflect.get(target,key,target);if(key==='stroke')return (...args)=>{count++;return value.apply(target,args)};return typeof value==='function'?value.bind(target):value;},set(target,key,value){return Reflect.set(target,key,value,target);}});
  renderer.drawWeather(ctx,{weather,options:{reducedFlash},weatherLightning:null});return count;
 }
 const weatherStrokeBudget={rain:weatherStrokeCount('Rain'),quietRain:weatherStrokeCount('Rain',true),wind:weatherStrokeCount('Wind')};
 if(weatherStrokeBudget.rain!==25||weatherStrokeBudget.quietRain!==14||weatherStrokeBudget.wind!==5)
  throw Error('Weather stroke budget regressed '+JSON.stringify(weatherStrokeBudget));
 function pixelSignature(paint){
  const target=document.createElement('canvas');target.width=700;target.height=400;const sample=target.getContext('2d');sample.scale(.25,.25);paint(sample);
  const data=sample.getImageData(0,0,target.width,target.height).data;let hash=2166136261;
  for(let i=0;i<data.length;i+=4)if(data[i+3]){hash=Math.imul(hash^data[i],16777619);hash=Math.imul(hash^data[i+1],16777619);hash=Math.imul(hash^data[i+2],16777619);hash=Math.imul(hash^data[i+3],16777619);}
  return hash>>>0;
 }
 const weatherMotionChecks={};
 for(const weather of ['Rain','Wind']){
  const paint=(time,reduced)=>{renderer.time=time;return pixelSignature(sample=>renderer.drawWeather(sample,{weather,options:{reducedFlash:reduced},weatherLightning:null}));};
  const normalA=paint(.1,false),normalB=paint(1.4,false),quietA=paint(.1,true),quietB=paint(1.4,true);
  if(normalA===normalB||quietA!==quietB)throw Error(weather+' motion preference failed to distinguish animated and static pixels '+JSON.stringify({normalA,normalB,quietA,quietB}));
  weatherMotionChecks[weather]={normalMoves:true,reducedMotionStatic:true,visible:quietA!==0};
  if(!weatherMotionChecks[weather].visible)throw Error(weather+' reduced-motion precipitation was not visible');
 }
 const cuePixels=(cue,reduced)=>pixelSignature(sample=>renderer.drawWeatherLightning(sample,cue,reduced));
 const warningA={phase:'warning',remaining:.5,duration:.55,x:310,y:175,radius:110},warningB={...warningA,remaining:.08};
 const strikeA={phase:'strike',remaining:.18,duration:.18,x:310,y:175},strikeB={...strikeA,remaining:.025};
 const lightningMotionChecks={
  warning:{normalA:cuePixels(warningA,false),normalB:cuePixels(warningB,false),reducedA:cuePixels(warningA,true),reducedB:cuePixels(warningB,true)},
  strike:{normalA:cuePixels(strikeA,false),normalB:cuePixels(strikeB,false),reducedA:cuePixels(strikeA,true),reducedB:cuePixels(strikeB,true)}
 };
 for(const [kind,check] of Object.entries(lightningMotionChecks)){
  if(check.normalA===check.normalB||check.reducedA!==check.reducedB||check.reducedA===0)throw Error('Lightning reduced-motion rendering failed '+kind+' '+JSON.stringify(check));
 }
 const c=document.createElement('canvas');c.width=800;c.height=690;const ctx=c.getContext('2d');ctx.fillStyle='#091b26';ctx.fillRect(0,0,c.width,c.height);
 const examples=[
  {label:'RAIN DEPTH + SPLASH',weather:'Rain',reducedFlash:false},
  {label:'RAIN · REDUCED FLASH',weather:'Rain',reducedFlash:true},
  {label:'LIGHTNING WARNING',weather:'Storm',reducedFlash:false,weatherLightning:{x:1060,y:760,phase:'warning',remaining:.24,duration:.55,radius:110}},
  {label:'QUIET WARNING',weather:'Storm',reducedFlash:true,weatherLightning:{x:1060,y:760,phase:'warning',remaining:.24,duration:.55,radius:110}},
  {label:'LIGHTNING STRIKE',weather:'Storm',reducedFlash:false,weatherLightning:{x:1060,y:760,phase:'strike',remaining:.10,duration:.18,radius:110}},
  {label:'QUIET STRIKE',weather:'Storm',reducedFlash:true,weatherLightning:{x:1060,y:760,phase:'strike',remaining:.10,duration:.18,radius:110}},
  {label:'TORNADO EVENT',weather:'Tornado',reducedFlash:false,tornado:{x:1060,y:760,life:3.2,totalLife:4.5,radius:150}},
  {label:'TORNADO LOW MOTION',weather:'Tornado',reducedFlash:true,tornado:{x:1060,y:760,life:3.2,totalLife:4.5,radius:150}}
 ];
 for(let i=0;i<examples.length;i++){const e=examples[i],x=(i%2)*400,y=Math.floor(i/2)*172;ctx.fillStyle='#102b37';ctx.fillRect(x,y,398,170);ctx.save();ctx.translate(x+200,y+80);ctx.scale(.3,.3);ctx.translate(-1060,-760);renderer.drawField(ctx,game);
  const view={weather:e.weather,options:{reducedFlash:e.reducedFlash},weatherLightning:e.weatherLightning||null};renderer.drawWeather(ctx,view);if(e.tornado)renderer.drawTornado(ctx,e.tornado,e.reducedFlash);ctx.restore();
  ctx.fillStyle='#f2f6e7';ctx.font='bold 13px sans-serif';ctx.fillText(e.label,x+10,y+158);}
 const clipCanvas=document.createElement('canvas');clipCanvas.width=2700;clipCanvas.height=1600;const clipCtx=clipCanvas.getContext('2d');renderer.time=3.14;renderer.drawWeather(clipCtx,{weather:'Rain',options:{reducedFlash:false},weatherLightning:null});
 const outsideMax=(x,y,w,h)=>{const data=clipCtx.getImageData(x,y,w,h).data;let max=0;for(let i=3;i<data.length;i+=4)max=Math.max(max,data[i]);return max;};
 const field={x:150,y:155,w:2260.8,h:1220},right=Math.ceil(field.x+field.w),clipBands={left:outsideMax(0,0,field.x,clipCanvas.height),right:outsideMax(right,0,clipCanvas.width-right,clipCanvas.height),top:outsideMax(field.x,0,field.w,field.y),bottom:outsideMax(field.x,field.y+field.h,field.w,clipCanvas.height-field.y-field.h)},fieldClippedPixels=Object.values(clipBands).every(alpha=>alpha<=8);
 if(!fieldClippedPixels)throw Error('Visible rain particles escaped the playable field clip '+JSON.stringify(clipBands));
 c.id='weather-02-preview';c.style.cssText='position:fixed;left:10px;top:10px;width:800px;height:520px;z-index:99999';document.body.append(c);
 return {scenarios:records.length+7,lightningHz:[30,60,120],tornadoHz:[30,60,120],lightningWarningAndStrike:true,tornadoBounded:true,reducedFlash:true,reducedMotionWeatherStatic:true,weatherMotionChecks,lightningMotionChecks,rainDepthAndSplash:true,weatherStrokeBudget,fieldClippedPixels,renderPreview:true,records};
}"""

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto('file://' + str(ROOT / 'tests/.generated/play.html'), wait_until='commit')
        page.wait_for_function("!!window.SupermagicFootball?.renderer?.drawWeatherLightning")
        result = page.evaluate(JS)
        page.locator('#weather-02-preview').screenshot(path=str(PREVIEW))
        if errors:
            raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result, 'preview': str(PREVIEW), 'pageErrors': errors})

if __name__ == '__main__':
    main()
