"""Actual game renderer checks for deterministic static Wet pitch puddle reflections."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/evidence/browser/wet_pitch_puddle_reflections_20261105.png'
TERRAINS = ['Classic', 'Grass', 'Dirt', 'Sand']
JS = r"""terrains => {
 const api=window.SupermagicFootball,renderer=api?.renderer,game=api?.game;
 if(!renderer?.drawField||!renderer?.drawStands||!game)throw Error('live renderer unavailable');
 const state=()=>JSON.stringify({score:game.score,clock:game.clock,players:game.players?.map(p=>[p.id,p.x,p.y,p.stun,p.trickFx]),ball:game.ball&&[game.ball.x,game.ball.y,game.ball.vx,game.ball.vy],options:game.options});
 const before=state(),canvas=document.createElement('canvas');canvas.id='wet-puddle-gallery';canvas.width=1280;canvas.height=1400;canvas.style.cssText='position:fixed;left:0;top:0;width:1280px;height:1400px;z-index:999999;pointer-events:none';
 const ctx=canvas.getContext('2d');ctx.fillStyle='#071521';ctx.fillRect(0,0,1280,1400);
 const tiles=[],pixelHash=(im)=>{let h=2166136261;for(let i=0;i<im.data.length;i+=7)h=Math.imul(h^im.data[i],16777619)>>>0;return h;};
 for(let row=0;row<terrains.length;row++)for(let col=0;col<2;col++){
  const terrain=terrains[row],condition=col?'Wet':'Good',x=col*640,y=row*350;
  ctx.save();ctx.beginPath();ctx.rect(x,y,638,348);ctx.clip();ctx.translate(x+4,y+2);ctx.scale(.235,.235);
  renderer.activeVenueId=game.options.stadium;renderer.drawStands(ctx);renderer.drawField(ctx,{terrain,condition,options:{stadium:game.options.stadium,reducedFlash:false}});ctx.restore();
  ctx.fillStyle='#f1f4ee';ctx.font='bold 18px system-ui';ctx.fillText(terrain.toUpperCase()+' · '+condition.toUpperCase(),x+18,y+332);
  const image=ctx.getImageData(x+24,y+24,590,280);tiles.push({terrain,condition,hash:pixelHash(image)});
 }
 const reduced=[];
 for(const reducedFlash of [false,true]){
  const c=document.createElement('canvas');c.width=640;c.height=350;const x=c.getContext('2d');
  x.translate(4,2);x.scale(.235,.235);renderer.drawField(x,{terrain:'Grass',condition:'Wet',options:{stadium:game.options.stadium,reducedFlash}});
  reduced.push(pixelHash(x.getImageData(0,0,640,350)));
 }
 document.body.append(canvas);
 return {terrains:terrains.length,tiles,reducedFlashSamePixels:reduced[0]===reduced[1],unchangedGameState:before===state(),canvas:{width:canvas.width,height:canvas.height}};
}"""

def main():
 OUT.parent.mkdir(parents=True, exist_ok=True)
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
 Thread(target=server.serve_forever,daemon=True).start()
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
   page=browser.new_page(viewport={'width':1280,'height':900},device_scale_factor=1)
   errors=[];failed=[];bad=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   page.on('console',lambda msg:errors.append(msg.text) if msg.type=='error' else None)
   page.on('requestfailed',lambda req:failed.append(req.url))
   page.on('response',lambda res:bad.append((res.status,res.url)) if res.status>=400 else None)
   page.goto(f'http://127.0.0.1:{server.server_port}/',wait_until='load',timeout=60000)
   page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawField',timeout=30000)
   result=page.evaluate(JS,TERRAINS)
   page.locator('#wet-puddle-gallery').screenshot(path=str(OUT))
   if len({t['hash'] for t in result['tiles'] if t['condition']=='Wet'})!=len(TERRAINS):raise AssertionError('terrain-specific wet field appearance did not render distinctly')
   if any(t['hash']==next(x['hash'] for x in result['tiles'] if x['terrain']==t['terrain'] and x['condition']=='Good') for t in result['tiles'] if t['condition']=='Wet'):raise AssertionError('Wet turf is indistinguishable from Good turf')
   if not result['reducedFlashSamePixels']:raise AssertionError('static puddle art changed with reduced-flash setting')
   if not result['unchangedGameState']:raise AssertionError('renderer changed live gameplay state')
   if errors or failed or bad:raise AssertionError(f'browser errors={errors}, failed={failed}, bad={bad}')
   browser.close()
   print(json.dumps({**result,'pageErrors':errors,'failedRequests':failed,'badResponses':bad,'screenshot':str(OUT)},ensure_ascii=False))
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
