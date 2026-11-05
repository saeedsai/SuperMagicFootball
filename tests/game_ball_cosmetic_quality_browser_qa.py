from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/evidence/browser/ball_rolling_projection_012850.png'
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
    page = browser.new_page(viewport={'width': 1280, 'height': 640}, device_scale_factor=1)
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
      const renderer=SupermagicFootball.renderer, rotations=[.45,1.15,2.25];
      const headings=[['RIGHT',1,0],['LEFT',-1,0],['UP',0,-1],['DOWN',0,1]];
      const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=640;
      canvas.style.cssText='position:fixed;left:0;top:0;width:1280px;height:640px;z-index:99999';
      const ctx=canvas.getContext('2d');
      const sky=ctx.createLinearGradient(0,0,0,640);sky.addColorStop(0,'#08152d');sky.addColorStop(.40,'#183c60');sky.addColorStop(.405,'#287d47');sky.addColorStop(1,'#0c472b');ctx.fillStyle=sky;ctx.fillRect(0,0,1280,640);
      ctx.strokeStyle='rgba(230,248,216,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,258);ctx.lineTo(1280,258);ctx.stroke();
      ctx.fillStyle='#f5f8ff';ctx.textAlign='center';ctx.font='800 18px system-ui';ctx.fillText('MATCH BALL · 3D ROLL PROJECTION · 17 UNIT RADIUS',640,27);
      ctx.font='600 14px system-ui';
      for(let i=0;i<models.length;i++){
        const x=i*256+128;ctx.fillStyle='#d9eaff';ctx.fillText(models[i].toUpperCase(),x,53);
        for(let row=0;row<rotations.length;row++){
          const y=112+row*172;
          if(i===0){ctx.textAlign='center';ctx.fillStyle='#d3e6f3';ctx.font='600 12px system-ui';ctx.fillText('ROLL ANGLE '+rotations[row].toFixed(2),640,y-34);ctx.font='500 11px system-ui';}
          for(let h=0;h<headings.length;h++){
            const [label,dx,dy]=headings[h],ballX=x+(h-1.5)*54;
            renderer.drawSoccerBall(ctx,ballX,y,17,models[i],rotations[row],{dx,dy});
            ctx.fillStyle='#d6e7ff';ctx.fillText(label[0],ballX,y+42);
          }
        }
      }
      document.body.append(canvas);

      const bounds=[],projectionChecks=[],directionalChecks=[];
      const pixelDifference=(a,b)=>{let count=0;for(let p=0;p<a.length;p+=4)if(a[p]!==b[p]||a[p+1]!==b[p+1]||a[p+2]!==b[p+2]||a[p+3]!==b[p+3])count++;return count;};
      for(let i=0;i<models.length;i++)for(const rotation of rotations){
        const directionImages=[];
        for(const [heading,dx,dy] of headings){
          const c=document.createElement('canvas');c.width=64;c.height=64;
          const g=c.getContext('2d'),cx=32,cy=32,r=17;
          renderer.drawSoccerBall(g,cx,cy,r,models[i],rotation,{dx,dy});
          const pixels=g.getImageData(0,0,c.width,c.height).data;let count=0,maxDistance=0;
          for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
            if(pixels[(y*c.width+x)*4+3]===0)continue;
            count++;maxDistance=Math.max(maxDistance,Math.hypot(x+.5-cx,y+.5-cy));
          }
          const flat=document.createElement('canvas');flat.width=flat.height=64;const fg=flat.getContext('2d');renderer.drawSoccerBall(fg,cx,cy,r,models[i],rotation);
          const flatPixels=fg.getImageData(0,0,64,64).data;
          bounds.push({model:models[i],rotation,heading,radius:r,paintedPixels:count,maxDistance:+maxDistance.toFixed(2)});
          projectionChecks.push({model:models[i],rotation,heading,changedPixels:pixelDifference(pixels,flatPixels)});
          directionImages.push(pixels);
        }
        directionalChecks.push({model:models[i],rotation,distinctHeadings:directionImages.filter((sample,index)=>index===0||pixelDifference(sample,directionImages[0])>16).length});
      }

      const calls=[],original=renderer.drawSoccerBall;
      renderer.drawSoccerBall=function(g,x,y,r,model,rotation,tumble){calls.push({r,model,rotation,tumble});return original.call(this,g,x,y,r,model,rotation,tumble)};
      const stateChecks=[];
      for(let i=0;i<models.length;i++)for(const [heading,vx,vy] of headings){
        const ball={x:40,y:48,z:12,vx:vx*31,vy:vy*17,vz:2,owner:null,shot:null,trail:[],rollAngle:rotations[i%rotations.length]};
        const options={ballModel:models[i],reducedFlash:false},game={ball,options};
        const before=JSON.stringify({ball,options}),c=document.createElement('canvas');c.width=96;c.height=96;
        renderer.drawBall(c.getContext('2d'),game);
        stateChecks.push({model:models[i],heading,unchanged:JSON.stringify({ball,options})===before});
      }
      const maxRadius=Math.max(...bounds.map(sample=>sample.maxDistance)),minChanged=Math.min(...projectionChecks.map(sample=>sample.changedPixels)),minDistinctHeadings=Math.min(...directionalChecks.map(sample=>sample.distinctHeadings));
      return {models,rotations,headings:headings.map(([name])=>name),gameplayRadius:17,samples:bounds.length,maxRadius,minChanged,minDistinctHeadings,stateUnchanged:stateChecks.every(sample=>sample.unchanged),callsUseInputs:calls.length===models.length*headings.length&&calls.every((call,i)=>call.r===17&&call.model===models[Math.floor(i/headings.length)]&&call.tumble?.dx===headings[i%headings.length][1]*31&&call.tumble?.dy===headings[i%headings.length][2]*17),canvas:{width:canvas.width,height:canvas.height}};
    }""", MODELS)
    page.screenshot(path=str(OUT), full_page=False)
    assert result['models'] == MODELS
    assert result['callsUseInputs'], result['calls']
    assert result['stateUnchanged'], result
    assert result['samples'] == len(MODELS) * 3 * 4, result
    assert result['maxRadius'] <= 18.25, result
    assert result['minChanged'] > 16, result
    assert result['minDistinctHeadings'] >= 3, result
    assert not errors, errors
    assert not failed_requests, failed_requests
    assert not bad_responses, bad_responses
    print('GAME_BALL_ROLLING_PROJECTION_BROWSER_PASS', result, 'pageErrors', errors,
          'failedRequests', failed_requests, 'badResponses', bad_responses, 'screenshot', OUT, flush=True)
    browser.close()
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)
