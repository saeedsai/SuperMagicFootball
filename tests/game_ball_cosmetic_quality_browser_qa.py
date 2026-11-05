from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/evidence/browser/ball_cosmetic_surface_20261105.png'
OUT.parent.mkdir(parents=True, exist_ok=True)

MODELS = ['classic', 'meteor', 'ice', 'gold', 'retro']

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
try:
  with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    page = browser.new_page(viewport={'width': 1280, 'height': 490}, device_scale_factor=1)
    errors = []
    failed_requests = []
    bad_responses = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.on('requestfailed', lambda request: failed_requests.append(request.url))
    page.on('response', lambda response: bad_responses.append((response.status, response.url)) if response.status >= 400 else None)
    page.goto(f'http://127.0.0.1:{server.server_port}/', wait_until='load', timeout=60000)
    page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawSoccerBall', timeout=30000)
    result = page.evaluate("""models => {
      const renderer=SupermagicFootball.renderer, rotations=[0,.52,1.04,1.56,2.08];
      const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=490;
      canvas.style.cssText='position:fixed;inset:0;width:1280px;height:490px;z-index:99999';
      const ctx=canvas.getContext('2d');
      const sky=ctx.createLinearGradient(0,0,0,490);sky.addColorStop(0,'#08152d');sky.addColorStop(.48,'#183c60');sky.addColorStop(.49,'#287d47');sky.addColorStop(1,'#0c472b');ctx.fillStyle=sky;ctx.fillRect(0,0,1280,490);
      ctx.strokeStyle='rgba(230,248,216,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,247);ctx.lineTo(1280,247);ctx.stroke();
      const xs=[128,384,640,896,1152];
      ctx.fillStyle='#f5f8ff';ctx.textAlign='center';ctx.font='700 17px system-ui';ctx.fillText('MATCH BALL COSMETICS · SURFACE DETAIL',640,32);
      ctx.font='600 15px system-ui';
      for(let i=0;i<models.length;i++){
        const model=models[i],x=xs[i];
        renderer.drawSoccerBall(ctx,x,130,46,model,rotations[i]);
        ctx.fillStyle='#f5f8ff';ctx.fillText(model.toUpperCase(),x,194);
        renderer.drawBallShadow(ctx,x,302,[0,48,96,144,192][i],1);
        renderer.drawSoccerBall(ctx,x,285,17,model,rotations[(i+2)%rotations.length]);
        ctx.fillStyle='#d6e7ff';ctx.font='500 13px system-ui';ctx.fillText('IN-MATCH SCALE',x,335);
        ctx.font='600 15px system-ui';
      }
      document.body.append(canvas);

      const bounds=[];
      for(let i=0;i<models.length;i++)for(const rotation of rotations){
        const c=document.createElement('canvas');c.width=64;c.height=64;
        const g=c.getContext('2d'),cx=32,cy=32,r=17;
        renderer.drawSoccerBall(g,cx,cy,r,models[i],rotation);
        const pixels=g.getImageData(0,0,c.width,c.height).data;let count=0,maxDistance=0;
        for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
          if(pixels[(y*c.width+x)*4+3]===0)continue;
          count++;maxDistance=Math.max(maxDistance,Math.hypot(x+.5-cx,y+.5-cy));
        }
        bounds.push({model:models[i],rotation,radius:r,paintedPixels:count,maxDistance:+maxDistance.toFixed(2)});
      }

      const calls=[],original=renderer.drawSoccerBall;
      renderer.drawSoccerBall=function(g,x,y,r,model,rotation){calls.push({r,model,rotation});return original.call(this,g,x,y,r,model,rotation)};
      const stateChecks=[];
      for(let i=0;i<models.length;i++){
        const ball={x:40,y:48,z:12,vx:31,vy:-17,vz:2,owner:null,shot:null,trail:[],rollAngle:rotations[i]};
        const options={ballModel:models[i],reducedFlash:false},game={ball,options};
        const before=JSON.stringify({ball,options});
        const c=document.createElement('canvas');c.width=96;c.height=96;
        renderer.drawBall(c.getContext('2d'),game);
        stateChecks.push({model:models[i],unchanged:JSON.stringify({ball,options})===before});
      }
      return {models,rotations,gameplayRadius:17,bounds,stateChecks,calls,callsUseModels:calls.every((call,i)=>call.r===17&&call.model===models[i]&&call.rotation===rotations[i]),canvas:{width:canvas.width,height:canvas.height}};
    }""", MODELS)
    page.screenshot(path=str(OUT), full_page=False)
    assert result['models'] == MODELS
    assert result['callsUseModels'], result['calls']
    assert all(sample['unchanged'] for sample in result['stateChecks']), result['stateChecks']
    assert all(sample['paintedPixels'] > 600 for sample in result['bounds']), result['bounds']
    assert all(sample['maxDistance'] <= sample['radius'] + 1.25 for sample in result['bounds']), result['bounds']
    assert not errors, errors
    assert not failed_requests, failed_requests
    assert not bad_responses, bad_responses
    print('GAME_BALL_COSMETIC_QUALITY_BROWSER_PASS', result, 'pageErrors', errors,
          'failedRequests', failed_requests, 'badResponses', bad_responses, 'screenshot', OUT, flush=True)
    browser.close()
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)
