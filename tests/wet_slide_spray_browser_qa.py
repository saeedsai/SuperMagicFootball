"""Check the live player renderer's turf-aware wet-slide accent and state isolation."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
PREVIEW=ROOT/'tests/.generated/wet_slide_surface_gallery.png'
assert HTML.exists(),'Build the current game fixture first'

JS=r"""()=>{
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer is unavailable');
 const original={condition:game.condition,terrain:game.terrain,reducedFlash:game.options?.reducedFlash,
  inMatchDraw:renderer.inMatchDraw,frameDelta:renderer.frameDelta,time:renderer.time};
 const before=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY,p.fatigue,p.breath]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 const source=game.player(0,3);if(!source?.src)throw Error('fixture player unavailable');
 const canvas=document.createElement('canvas'),cellW=152,cellH=164;
 canvas.width=cellW*3;canvas.height=cellH;const ctx=canvas.getContext('2d');
 const cases=[
  {name:'DRY GRASS',condition:'Good',reduced:false},
  {name:'WET PITCH',condition:'Wet',reduced:false},
  {name:'WET · REDUCED FLASH',condition:'Wet',reduced:true}
 ];
 const samples=[];renderer.inMatchDraw=true;renderer.frameDelta=1/60;renderer.time=0;game.terrain='Grass';
 for(let i=0;i<cases.length;i++){
  const c=cases[i];game.condition=c.condition;game.options.reducedFlash=c.reduced;
  const x=i*cellW;ctx.fillStyle='#14252e';ctx.fillRect(x,0,cellW,cellH);
  // Simple dark-turf sample field to keep the slide cue visible at character scale.
  ctx.fillStyle='#347c48';ctx.fillRect(x,44,cellW,cellH-44);
  ctx.fillStyle='#eef4de';ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillText(c.name,x+cellW/2,24);
  const p={...source,x:0,y:0,z:0,preview:false,controlled:false,action:'slide',actionTimer:.36,
   slideTimer:.36,slideRemaining:31,slideBudget:104,slideDX:.8,slideDY:.6,dx:0,dy:0,
   face:1,visualFacing:null,stun:0,cryTimer:0,anim:.2};
  ctx.save();ctx.translate(x+cellW/2,cellH-24);renderer.drawPlayer(ctx,p,game);ctx.restore();
  samples.push(ctx.getImageData(x,0,cellW,cellH).data);
 }
 const difference=(a,b)=>{let changed=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])changed++;return changed;};
 const wetPixels=difference(samples[0],samples[1]),reducedPixels=difference(samples[1],samples[2]);
 if(wetPixels<25)throw Error('wet surface should add visible spray pixels at match scale: '+wetPixels);
 if(reducedPixels<10)throw Error('reduced-flash should soften the wet spray: '+reducedPixels);
 game.condition=original.condition;game.terrain=original.terrain;game.options.reducedFlash=original.reducedFlash;
 renderer.inMatchDraw=original.inMatchDraw;renderer.frameDelta=original.frameDelta;renderer.time=original.time;
 const after=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY,p.fatigue,p.breath]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 if(before!==after)throw Error('wet-slide rendering mutated player or ball simulation state');
 canvas.id='wet-slide-gallery';canvas.style.cssText='position:fixed;left:0;top:0;width:456px;height:164px;z-index:99999';document.body.append(canvas);
 return {samples:cases.map(c=>c.name),wetSurfaceChangedPixels:wetPixels,reducedFlashChangedPixels:reducedPixels,liveStateUnchanged:true};
}"""

def main():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1280,'height':720})
  errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.goto(HTML.as_uri());page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
  result=page.evaluate(JS);page.locator('#wet-slide-gallery').screenshot(path=str(PREVIEW),timeout=30000);browser.close()
  if errors:raise AssertionError(f'Browser errors: {errors}')
  print({**result,'preview':str(PREVIEW),'pageErrors':errors})

if __name__=='__main__':main()
