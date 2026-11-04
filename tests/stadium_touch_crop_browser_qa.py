"""VIZ-04 touch crop QA for every existing stadium using the live renderer."""
from pathlib import Path
import json
import shutil
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/.generated/play.html'
GAMEPLAY = json.loads((ROOT / 'data/mechanics/gameplay.json').read_text(encoding='utf-8'))
VENUES = GAMEPLAY['stadiums']
WORLD = GAMEPLAY['world']
assert FIXTURE.exists(), 'Build tests/.generated/play.html first'
HTML = FIXTURE.read_text(encoding='utf-8')
OUTPUTS = {
    'narrow-portrait': ROOT / 'docs/VIZ04_MOBILE_STADIUM_CROP_320X568_20261103.png',
    'portrait': ROOT / 'docs/VIZ04_MOBILE_STADIUM_CROP_390X844_20261103.png',
    'landscape': ROOT / 'docs/VIZ04_MOBILE_STADIUM_CROP_844X390_20261103.png',
}

JS = r'''({venues,world,label}) => {
 const app=window.SupermagicFootball,g=app?.game,r=app?.renderer,source=document.querySelector('#field');
 if(!g||!r||!source)throw Error('live modular field renderer unavailable');
 g.init({home:0,away:9,mode:'quick',humans:1,options:{...g.options,camera:'Wide',weather:'Clear'}});
 g.matchState='none';g.options.camera='Wide';g.ball.owner=null;
 const f=world.field,cx=f.x+f.w/2,cy=(world.goalTop+world.goalBottom)/2;
 const scenarios=[
  {id:'center-circle',x:cx,y:cy,point:{x:cx,y:cy}},
  {id:'left-goal',x:f.x+60,y:cy,points:[
   {x:f.x-world.goalDepth,y:world.goalTop},{x:f.x-world.goalDepth,y:world.goalBottom},
   {x:f.x,y:world.goalTop},{x:f.x,y:world.goalBottom}]},
  {id:'right-goal',x:f.x+f.w-60,y:cy,points:[
   {x:f.x+f.w+world.goalDepth,y:world.goalTop},{x:f.x+f.w+world.goalDepth,y:world.goalBottom},
   {x:f.x+f.w,y:world.goalTop},{x:f.x+f.w,y:world.goalBottom}]},
  {id:'top-stand-and-line',x:cx,y:f.y+40,points:[{x:cx,y:f.y-35},{x:cx,y:f.y}]},
  {id:'bottom-stand-and-line',x:cx,y:f.y+f.h-40,points:[{x:cx,y:f.y+f.h+30},{x:cx,y:f.y+f.h}]}
 ];
 const snapshot=()=>JSON.stringify({clock:g.clock,score:g.score,matchState:g.matchState,
  ball:{x:g.ball.x,y:g.ball.y,z:g.ball.z,vx:g.ball.vx,vy:g.ball.vy,vz:g.ball.vz,owner:g.ball.owner?.src?.id||null},
  players:g.players.map(p=>[p.t,p.src?.id,p.x,p.y,p.vx,p.vy,p.z,p.fatigue,p.stun,p.action,p.actionTimer]),
  events:g.events});
 const samples=[],hashFor=new Map(),canvas=source;
 const cols=4,rows=5,cellW=innerWidth,cellH=innerHeight,labelH=26;
 const sheet=document.createElement('canvas');sheet.id='venue-touch-crop-sheet';sheet.width=cols*cellW;sheet.height=rows*(cellH+labelH);
 const sc=sheet.getContext('2d');sc.fillStyle='#101d2a';sc.fillRect(0,0,sheet.width,sheet.height);sc.imageSmoothingEnabled=true;
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 let goalTransform=null;
 const drawGoal=r.drawGoal;
 r.drawGoal=function(ctx,side,foreground){
  if(!foreground){const m=ctx.getTransform();goalTransform={a:m.a,b:m.b,c:m.c,d:m.d,e:m.e,f:m.f};}
  return drawGoal.apply(this,arguments);
 };
 function project(x,y){
  const box=canvas.getBoundingClientRect(),sx=box.width/canvas.width,sy=box.height/canvas.height,m=goalTransform;
  const backX=m.a*x+m.c*y+m.e,backY=m.b*x+m.d*y+m.f;
  return {x:box.left+backX*sx,y:box.top+backY*sy};
 }
 function contentBox(){
  const box=canvas.getBoundingClientRect(),sx=box.width/canvas.width,sy=box.height/canvas.height;
  return {left:box.left+r.offsetX*sx,top:box.top+r.offsetY*sy,
   right:box.left+(r.offsetX+r.screenW*r.scale)*sx,
   bottom:box.top+(r.offsetY+r.screenH*r.scale)*sy};
 }
 function inside(point,box,margin=1){return point.x>=box.left+margin&&point.x<=box.right-margin&&point.y>=box.top+margin&&point.y<=box.bottom-margin;}
 function hashCanvas(){const c=canvas.getContext('2d',{willReadFrequently:true}),data=c.getImageData(0,0,canvas.width,canvas.height).data;let h=2166136261;for(let i=0;i<data.length;i+=37)h=Math.imul(h^data[i],16777619)>>>0;return h;}
 const originalOptions=g.options.stadium;
 try {
  for(let i=0;i<venues.length;i++){
   const venue=venues[i];g.options.stadium=venue.id;r.activeVenueId=venue.id;
   r.stadiumCache=null;r.stadiumCacheKey='';r.fieldCache=null;r.fieldCacheKey='';
   for(const scenario of scenarios){
    g.ball.x=scenario.x;g.ball.y=scenario.y;g.ball.vx=0;g.ball.vy=0;
    const zoom=.86,viewW=r.screenW/zoom,viewH=r.screenH/zoom;
    const extraX=r.screenW*(1-zoom)/(2*zoom),extraY=r.screenH*(1-zoom)/(2*zoom);
    r.cameraZoom=zoom;
    r.cameraX=clamp(scenario.x-r.screenW/2,extraX,world.w-viewW+extraX);
    r.cameraY=clamp(scenario.y-r.screenH/2,extraY,world.h-viewH+extraY);
    goalTransform=null;
    const stateBefore=snapshot();
    r.frame(g,.05,false);
    if(!goalTransform)throw Error(`${label} ${venue.id} ${scenario.id}: renderer did not expose a goal transform`);
    if(r.activeVenueId!==venue.id)throw Error(`${venue.id}: renderer active venue mismatch`);
    const box=contentBox(),points=scenario.points||[scenario.point];
    const projected=points.map(point=>({world:point,screen:project(point.x,point.y)}));
    for(const item of projected)if(!inside(item.screen,box,1))throw Error(`${label} ${venue.id} ${scenario.id}: crop landmark outside intended render box ${JSON.stringify({item,box})}`);
    const pageOverflow=document.documentElement.scrollWidth>innerWidth+1||document.body.scrollWidth>innerWidth+1||document.querySelector('#app')?.scrollWidth>innerWidth+1;
    if(pageOverflow)throw Error(`${label} ${venue.id}: horizontal page overflow`);
    // One draw is enough after setting the camera at its settled target; it must remain visual-only.
    r.frame(g,.05,false);
    if(snapshot()!==stateBefore)throw Error(`${label} ${venue.id} ${scenario.id}: renderer changed gameplay state`);
    const hash=hashCanvas();
    if(scenario.id==='center-circle'){
     if(hashFor.has(venue.id))throw Error('duplicate venue contact-sheet key');
     hashFor.set(venue.id,hash);
     const col=i%cols,row=Math.floor(i/cols),x=col*cellW,y=row*(cellH+labelH);
     sc.drawImage(canvas,x,y,cellW,cellH);
     sc.fillStyle='#09131e';sc.fillRect(x,y+cellH,cellW,labelH);
     sc.fillStyle='#f2f7fb';sc.font='bold 14px system-ui';sc.textAlign='left';sc.fillText(`${venue.name} · ${venue.id}`,x+8,y+cellH+18);
    }
    samples.push({venue:venue.id,scenario:scenario.id,visible:projected.length,hash});
   }
  }
 } finally {g.options.stadium=originalOptions;}
 if(samples.length!==venues.length*scenarios.length)throw Error('incomplete venue/crop sample matrix');
 if(hashFor.size!==venues.length)throw Error('contact sheet does not contain all venues');
 if(new Set(hashFor.values()).size!==venues.length)throw Error('some venue center renders are visually identical');
 document.body.append(sheet);
 sheet.style.cssText='position:fixed;left:0;top:0;width:'+sheet.width+'px;height:'+sheet.height+'px;z-index:999999;background:#101d2a';
 return {label,viewport:{width:innerWidth,height:innerHeight},venueCount:venues.length,scenarioCount:scenarios.length,
  renderSamples:samples.length,allCenterVenueRendersDistinct:new Set(hashFor.values()).size===venues.length,
  contentLandmarksInsideCrop:samples.every(sample=>sample.visible>0),simulationUnchanged:true,horizontalOverflow:false,
  contactSheet:{width:sheet.width,height:sheet.height,id:sheet.id}};
}'''

with sync_playwright() as pw:
    executable = shutil.which('chromium') or shutil.which('chrome') or shutil.which('chromium-browser') or os.environ.get('CHROME_PATH')
    if not executable:
        for candidate in [
            Path(os.environ.get('PROGRAMFILES', 'C:/Program Files')) / 'Google/Chrome/Application/chrome.exe',
            Path(os.environ.get('PROGRAMFILES(X86)', 'C:/Program Files (x86)')) / 'Microsoft/Edge/Application/msedge.exe',
        ]:
            if candidate.is_file():
                executable = str(candidate)
                break
    browser = pw.chromium.launch(headless=True, executable_path=executable, args=['--no-sandbox', '--disable-dev-shm-usage'])
    try:
        profiles = [
            ('narrow-portrait', {'width': 320, 'height': 568}, True),
            ('portrait', {'width': 390, 'height': 844}, True),
            ('landscape', {'width': 844, 'height': 390}, True),
        ]
        for label, viewport, mobile in profiles:
            context = browser.new_context(viewport=viewport, is_mobile=mobile, has_touch=mobile)
            try:
                page = context.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.goto(FIXTURE.as_uri(), wait_until='load')
                page.wait_for_function('!!window.SupermagicFootball?.renderer?.frame', timeout=60000)
                result = page.evaluate(JS, {'venues': VENUES, 'world': WORLD, 'label': label})
                assert result['venueCount'] == 20 and result['renderSamples'] == 100, result
                assert result['allCenterVenueRendersDistinct'] and result['simulationUnchanged'] and not result['horizontalOverflow'], result
                assert not errors, (label, errors)
                screenshot = OUTPUTS[label]
                page.locator('#venue-touch-crop-sheet').screenshot(path=str(screenshot), timeout=30000)
                print(json.dumps({'result': result, 'pageErrors': errors, 'contactSheet': str(screenshot)}), flush=True)
            finally:
                context.close()
    finally:
        browser.close()
