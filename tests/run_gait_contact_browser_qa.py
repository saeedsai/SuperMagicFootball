"""Actual game-renderer run-cycle contact sheet and state-preservation QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'tests/.generated/play.html'
PREVIEW = ROOT / 'docs/PLAYER_RUN_CONTACT_GALLERY_20261104.png'
assert HTML.exists(), 'Build the current game fixture first'

JS = r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer is unavailable');
 const source=game.player(0,3);if(!source?.src)throw Error('fixture player unavailable');
 const canvas=document.createElement('canvas'),cellW=104,cellH=148,frames=12,speeds=[140,260,330];
 canvas.width=cellW*frames;canvas.height=cellH*8*speeds.length;
 const ctx=canvas.getContext('2d');
 const directions=[
  ['front',0,1],['frontRight',.6,.8],['right',1,0],['backRight',.6,-.8],
  ['back',0,-1],['backLeft',-.6,-.8],['left',-1,0],['frontLeft',-.6,.8]
 ];
 const previous={match:renderer.inMatchDraw,delta:renderer.frameDelta,time:renderer.time};
 const before=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY,p.fatigue,p.breath]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 const rows=[];
 renderer.inMatchDraw=true;renderer.frameDelta=1/60;
 for(let row=0;row<directions.length;row++)for(let pace=0;pace<speeds.length;pace++){
  const [name,dx,dy]=directions[row],speed=speeds[pace],hashes=[],coverage=[],motion=[];
  let previousPixels=null;
  for(let frame=0;frame<frames;frame++){
   const angle=frame/frames*Math.PI*2;
   const p={...source,x:0,y:0,z:0,preview:false,controlled:false,action:'idle',actionTimer:0,
    stun:0,cryTimer:0,visualFacing:null,face:dx<-.05?-1:1,dx,dy,
    moveVX:dx*speed,moveVY:dy*speed,anim:1+(angle-(source.i||0)*.35)/17};
   const x=frame*cellW,y=(row*speeds.length+pace)*cellH;
   ctx.fillStyle='#101b28';ctx.fillRect(x,y,cellW,cellH);
   ctx.save();ctx.translate(x+cellW/2,y+cellH-13);renderer.time=angle/17;
   renderer.drawPlayer(ctx,p,game);ctx.restore();
   const pixels=ctx.getImageData(x,y,cellW,cellH).data;let hash=2166136261,visible=0;
   for(let i=0;i<pixels.length;i+=4){hash=Math.imul(hash^pixels[i],16777619);hash=Math.imul(hash^pixels[i+1],16777619);hash=Math.imul(hash^pixels[i+2],16777619);if(pixels[i]!==16||pixels[i+1]!==27||pixels[i+2]!==40)visible++;}
   if(previousPixels){let changed=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==previousPixels[i]||pixels[i+1]!==previousPixels[i+1]||pixels[i+2]!==previousPixels[i+2])changed++;motion.push(changed);}
   previousPixels=pixels;
   hashes.push(hash>>>0);coverage.push(visible);
  }
  if(new Set(hashes).size<10)throw Error(name+' at '+speed+' gait has fewer than 10 distinct rendered phases: '+new Set(hashes).size);
  if(Math.min(...coverage)<380)throw Error(name+' at '+speed+' has a blank/clipped gait frame: '+Math.min(...coverage));
  if(Math.min(...motion)<280)throw Error(name+' at '+speed+' has a visually static adjacent phase: '+Math.min(...motion));
  rows.push({view:name,speed,distinctFrames:new Set(hashes).size,minPaintedPixels:Math.min(...coverage),minAdjacentChangedPixels:Math.min(...motion)});
 }
 renderer.inMatchDraw=previous.match;renderer.frameDelta=previous.delta;renderer.time=previous.time;
 const after=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY,p.fatigue,p.breath]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 if(before!==after)throw Error('run-cycle rendering mutated live match state');
 canvas.id='run-contact-gallery';canvas.style.cssText='position:fixed;left:0;top:0;width:1248px;height:'+canvas.height+'px;z-index:99999;background:#101b28';document.body.append(canvas);
 return {views:rows,framesPerSpeedAndView:frames,speeds,totalFrames:rows.length*frames,liveStateUnchanged:true};
}"""


def main():
    with sync_playwright() as pw:
        # Use Playwright's configured Chromium so this actual-renderer QA runs
        # on both Windows and Linux instead of assuming /usr/bin/chromium.
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        page = browser.new_page(viewport={'width': 1280, 'height': 720})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(HTML.as_uri())
        page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        result = page.evaluate(JS)
        page.locator('#run-contact-gallery').screenshot(path=str(PREVIEW), timeout=30000)
        browser.close()
        if errors:
            raise AssertionError(f'Browser errors: {errors}')
        print({**result, 'preview': str(PREVIEW), 'pageErrors': errors})


if __name__ == '__main__':
    main()
