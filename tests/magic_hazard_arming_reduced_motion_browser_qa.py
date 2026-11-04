"""Actual game-renderer check for steady reduced-motion ground-trap warnings."""
from pathlib import Path
import base64
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/.generated/play.html').read_text(encoding='utf8')
PREVIEW=ROOT/'tests/.generated/magic_hazard_arming_reduced_motion.png'
JS=r"""() => {
 const api=window.SupermagicFootball||window.NekketsuHD,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.frame)throw Error('game renderer unavailable');
 game.init({home:0,away:9,humans:1,mode:'quick',options:{...game.options,reducedFlash:true,weather:'Clear',terrain:'Grass',condition:'Good'}});
 game.matchState='paused';game.players=[];game.particles=[];game.magicWalls=[];game.supernova=null;game.tornado=null;
 game.ball={x:250,y:250,z:0,vx:0,vy:0,vz:0,owner:null,trail:[]};
 // Keep the diagnostic hazard inside the initial desktop camera viewport;
 // off-screen world coordinates produce a vacuous zero-pixel comparison.
 const hazard={kind:'banana',team:0,x:640,y:360,life:2.5,arm:.08};game.magicHazards=[hazard];
 function pixels(){renderer.frame(game,0);const c=renderer.canvas,ctx=c.getContext('2d');return ctx.getImageData(0,0,c.width,c.height).data;}
 function diff(a,b){let count=0;for(let i=3;i<a.length;i+=4)if(a[i]!==b[i]||a[i-1]!==b[i-1]||a[i-2]!==b[i-2])count++;return count;}
 const samples={},images={};
 for(const kind of ['banana','ice']){
  hazard.kind=kind;game.magicHazards=[hazard];
  const quietA=pixels();hazard.arm=.21;const quietB=pixels();
  if(diff(quietA,quietB)!==0)throw Error(kind+' reduced-motion arming ring changed as its timer advanced');
  game.options.reducedFlash=false;hazard.arm=.08;const normalA=pixels();hazard.arm=.21;const normalB=pixels();
  const changed=diff(normalA,normalB);if(changed<8)throw Error(kind+' normal arming progress no longer changes visibly '+changed);
  samples[kind]={reducedMotionPixelsChanged:0,normalProgressPixelsChanged:changed};
  game.options.reducedFlash=true;
  renderer.frame(game,0);images[kind]=renderer.canvas.toDataURL('image/png');
 }
 return {samples,images};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':844,'height':390},True)]:
   context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
   page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
   page.set_content(HTML,wait_until='load')
   page.wait_for_function('!!(window.SupermagicFootball?.renderer||window.NekketsuHD?.renderer)',timeout=60000)
   result=page.evaluate(JS)
   images=result.pop('images')
   if label=='desktop':
    for kind,image in images.items():
     (PREVIEW.parent/f'magic_hazard_arming_reduced_motion_{kind}.png').write_bytes(base64.b64decode(image.split(',',1)[1]))
   assert not errors,(label,errors)
   print('MAGIC_HAZARD_REDUCED_MOTION_BROWSER_PASS',label,result,flush=True)
   context.close()
 finally:browser.close()
