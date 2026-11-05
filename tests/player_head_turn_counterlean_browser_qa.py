from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
OUT=ROOT/'docs/evidence/browser/player_head_turn_counterlean_012855.png'
assert HTML.exists(),'Build the local game fixture first'

class FixtureHandler(SimpleHTTPRequestHandler):
 def translate_path(self,path):
  if urlsplit(path).path=='/play.html':return str(HTML)
  return super().translate_path(path)
 def log_message(self,_format,*args):pass

JS=r"""()=>{
 const {game,renderer}=window.SupermagicFootball||{};
 if(!game||!renderer?.drawPlayer||!renderer.poseHeadings?.set)throw Error('production renderer turn-heading map unavailable');
 const base=game.player(0,3);if(!base?.src)throw Error('sample player unavailable');
 const before=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY,p.fatigue,p.breath]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 const directions=[['FRONT',0],['FRONT-LEFT',-Math.PI/4],['LEFT',-Math.PI/2]],lagCases=[['REST',0],['TURN +',.58],['TURN -',-.58]];
 const cellW=150,cellH=155,canvas=document.createElement('canvas');canvas.width=cellW*3;canvas.height=cellH*3;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#101b28';ctx.fillRect(0,0,canvas.width,canvas.height);
 const old={inMatchDraw:renderer.inMatchDraw,frameDelta:renderer.frameDelta,time:renderer.time};
 renderer.inMatchDraw=true;renderer.frameDelta=1e-6;const rows=[];
 for(let column=0;column<directions.length;column++){
  const [label,target]=directions[column];ctx.fillStyle='#d8eaff';ctx.textAlign='center';ctx.font='700 13px system-ui';ctx.fillText(label,cellW*(column+.5),17);
  for(let row=0;row<lagCases.length;row++){
   const [turnLabel,lag]=lagCases[row],p={...base,preview:false,controlled:false,x:0,y:0,z:0,action:'idle',actionTimer:0,anim:.12,moveVX:190,moveVY:0,dx:Math.cos(target),dy:Math.sin(target),face:1,visualFacing:null};
   renderer.poseHeadings.set(p,target-lag);renderer.time=row*.12+column*.23;
   const x=column*cellW,y=row*cellH;ctx.fillStyle='#101b28';ctx.fillRect(x,y,cellW,cellH);ctx.save();ctx.translate(x+cellW/2,y+cellH-8);renderer.drawPlayer(ctx,p,game);ctx.restore();
   const pixels=ctx.getImageData(x,y,cellW,cellH).data;let painted=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==16||pixels[i+1]!==27||pixels[i+2]!==40)painted++;
   if(painted<450)throw Error(label+' '+turnLabel+' sample is blank or clipped');rows.push({view:label,turn:turnLabel,paintedPixels:painted});
   ctx.fillStyle='#d0def2';ctx.font='500 11px system-ui';ctx.fillText(turnLabel,cellW*(column+.5),y+cellH-5);
  }
 }
 renderer.inMatchDraw=old.inMatchDraw;renderer.frameDelta=old.frameDelta;renderer.time=old.time;
 const after=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY,p.fatigue,p.breath]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 if(before!==after)throw Error('head-turn rendering mutated match state');
 canvas.id='head-turn-counterlean-gallery';canvas.style.cssText='position:fixed;left:0;top:0;width:450px;height:465px;z-index:99999';document.body.append(canvas);
 return {samples:rows.length,rows,stateUnchanged:true};
}"""

def main():
 OUT.parent.mkdir(parents=True,exist_ok=True)
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(FixtureHandler,directory=str(ROOT)))
 thread=Thread(target=server.serve_forever,daemon=True);thread.start()
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1280,'height':720})
  errors=[];failed=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  page.on('requestfailed',lambda r:failed.append(r.url))
  page.goto(f'http://127.0.0.1:{server.server_port}/play.html',wait_until='load',timeout=60000)
  page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer',timeout=30000)
  result=page.evaluate(JS);page.locator('#head-turn-counterlean-gallery').screenshot(path=str(OUT),timeout=30000);browser.close()
  server.shutdown()
  if errors or failed:raise AssertionError(f'Browser errors={errors}; failed requests={failed}')
  print({**result,'pageErrors':errors,'failedRequests':failed,'preview':str(OUT)})

if __name__=='__main__':main()
