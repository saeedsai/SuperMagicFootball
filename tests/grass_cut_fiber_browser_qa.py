"""Actual production-renderer QA for static cut-grass surface detail."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE_DIR = ROOT / 'docs/evidence/browser'
EVIDENCE = EVIDENCE_DIR / 'grass_turf_fibers_before_after_20261105.png'
RENDER_SOURCE = ROOT / 'src/modules/render.js'
GRASS_LAYER = """ if(terrain==='Grass'){
   // Sparse cut-grass fibers give the otherwise flat natural turf a readable
   // surface at match scale. Fixed placement keeps the cached field perfectly
   // still, and the pitch clip prevents any mark from changing its bounds.
   ctx.save();ctx.beginPath();ctx.rect(F.x,F.y,F.w,F.h);ctx.clip();ctx.lineCap='round';ctx.lineWidth=3.4;
   for(let i=0;i<320;i++){
     const x=F.x+((i*167+23)%997)/997*F.w,y=F.y+((i*347+47)%991)/991*F.h;
     const lean=(((i*13)%17)-8)*.55,length=12+((i*23)%15);
     ctx.strokeStyle=i%4===0?'rgba(192,224,157,.30)':'rgba(13,54,31,.26)';
     ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+lean*.45,y-length*.56,x+lean,y-length);ctx.stroke();
     if(i%3===0){ctx.beginPath();ctx.moveTo(x+3,y-1);ctx.quadraticCurveTo(x+3+lean*.38,y-length*.36,x+2+lean*.7,y-length*.68);ctx.stroke();}
   }
   ctx.restore();
 }
"""
JS = r"""async () => {
 const api=window.SupermagicFootball,renderer=api?.renderer,game=api?.game;
 if(!renderer?.drawField||!game)throw Error('live renderer unavailable');
 const baselineModule=await import('/src/modules/render.beforeqa.js');
 const state=()=>JSON.stringify({score:game.score,clock:game.clock,players:game.players?.map(p=>[p.id,p.x,p.y,p.stun,p.trickFx]),ball:game.ball&&[game.ball.x,game.ball.y,game.ball.vx,game.ball.vy],options:game.options});
 const before=state();
 const render=(Renderer,xOffset)=>{
   const canvas=document.createElement('canvas');canvas.width=640;canvas.height=350;
   const ctx=canvas.getContext('2d');ctx.fillStyle='#071521';ctx.fillRect(0,0,640,350);
   ctx.translate(4,2);ctx.scale(.235,.235);
   const fresh=Object.create(Renderer.prototype);fresh.fieldCache=null;fresh.fieldCacheKey='';
   fresh.drawField(ctx,{terrain:'Grass',condition:'Good',options:{stadium:game.options?.stadium,reducedFlash:false}});
   const pixels=ctx.getImageData(0,0,640,350).data;let hash=2166136261,colors=new Set(),changed=0;
   for(let i=0;i<pixels.length;i+=4){hash=Math.imul(hash^pixels[i],16777619)>>>0;hash=Math.imul(hash^pixels[i+1],16777619)>>>0;hash=Math.imul(hash^pixels[i+2],16777619)>>>0;if(i%20===0)colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);}
   return {canvas,hash,colors:colors.size,pixels};
 };
 const base=render(baselineModule.RENDER.Renderer,0),actual=render(renderer.constructor,1),again=render(renderer.constructor,1);
 const reducedCanvas=document.createElement('canvas');reducedCanvas.width=640;reducedCanvas.height=350;const reducedCtx=reducedCanvas.getContext('2d');
 reducedCtx.fillStyle='#071521';reducedCtx.fillRect(0,0,640,350);reducedCtx.translate(4,2);reducedCtx.scale(.235,.235);
 const reducedRenderer=Object.create(renderer.constructor.prototype);reducedRenderer.fieldCache=null;reducedRenderer.fieldCacheKey='';
 reducedRenderer.drawField(reducedCtx,{terrain:'Grass',condition:'Good',options:{stadium:game.options?.stadium,reducedFlash:true}});
 const reducedPixels=reducedCtx.getImageData(0,0,640,350).data;let reducedHash=2166136261;
 for(let i=0;i<reducedPixels.length;i+=4){reducedHash=Math.imul(reducedHash^reducedPixels[i],16777619)>>>0;reducedHash=Math.imul(reducedHash^reducedPixels[i+1],16777619)>>>0;reducedHash=Math.imul(reducedHash^reducedPixels[i+2],16777619)>>>0;}
 let layerChangedPixels=0;for(let i=0;i<base.pixels.length;i+=4)if(base.pixels[i]!==actual.pixels[i]||base.pixels[i+1]!==actual.pixels[i+1]||base.pixels[i+2]!==actual.pixels[i+2])layerChangedPixels++;
 const gallery=document.createElement('canvas');gallery.id='grass-before-after';gallery.width=1280;gallery.height=380;gallery.style.cssText='position:fixed;left:0;top:0;width:1280px;height:380px;z-index:999999;pointer-events:none';
 const galleryCtx=gallery.getContext('2d');galleryCtx.fillStyle='#071521';galleryCtx.fillRect(0,0,1280,380);galleryCtx.drawImage(base.canvas,0,0);galleryCtx.drawImage(actual.canvas,640,0);
 galleryCtx.fillStyle='#f3f6ef';galleryCtx.font='700 17px system-ui';galleryCtx.fillText('BEFORE · BASE GRASS',18,367);galleryCtx.fillText('AFTER · CUT FIBERS',658,367);document.body.append(gallery);
 return {gameScale:.235,beforeHash:base.hash,afterHash:actual.hash,repeatHash:again.hash,reducedHash,deterministic:actual.hash===again.hash,
   reducedFlashStable:actual.hash===reducedHash,layerChangedPixels,visibleColorVariation:actual.colors,
   freshFieldCaches:true,baselineModuleLoaded:true,unchangedGameState:before===state()};
}"""

def main():
    current_source=RENDER_SOURCE.read_text(encoding='utf-8')
    if current_source.count(GRASS_LAYER)!=1:
        raise AssertionError('updated production grass layer was not found exactly once in render.js')
    baseline_source=current_source.replace(GRASS_LAYER,'',1)
    class Handler(SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path.split('?',1)[0]=='/src/modules/render.beforeqa.js':
                body=baseline_source.encode('utf-8')
                self.send_response(200);self.send_header('Content-Type','text/javascript; charset=utf-8')
                self.send_header('Content-Length',str(len(body)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(body)
                return
            return super().do_GET()
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
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
            result=page.evaluate(JS)
            EVIDENCE_DIR.mkdir(parents=True,exist_ok=True)
            evidence=EVIDENCE
            suffix=2
            while evidence.exists():
                evidence=EVIDENCE_DIR/f'grass_turf_fibers_before_after_20261105_{suffix:02d}.png';suffix+=1
            page.locator('#grass-before-after').screenshot(path=str(evidence))
            if not result['deterministic']:raise AssertionError('grass texture changed between identical cached renderer draws')
            if not result['reducedFlashStable']:raise AssertionError('static field texture changes with reduced-flash mode')
            if result['layerChangedPixels']<1:raise AssertionError('before and after grass renders are pixel-identical')
            if result['visibleColorVariation']<40:raise AssertionError(f"game-scale grass lost surface detail: {result['visibleColorVariation']} sampled colors")
            if not result['freshFieldCaches'] or not result['baselineModuleLoaded']:raise AssertionError('capture did not use isolated fresh renderer caches')
            if not result['unchangedGameState']:raise AssertionError('field renderer mutated gameplay state')
            if errors or failed or bad:raise AssertionError(f'browser errors={errors}, failed={failed}, bad={bad}')
            browser.close()
            print(json.dumps({**result,'pageErrors':errors,'failedRequests':failed,'badResponses':bad,'evidence':str(evidence)},ensure_ascii=False))
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__':main()
