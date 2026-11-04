"""Actual renderer QA for continuous run/turn/stop/recovery transitions."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'tests/.generated/play.html'
PREVIEW = ROOT / 'docs/PLAYER_MOTION_TRANSITIONS_20261104.png'
assert HTML.exists(), 'Build the current game fixture first'

JS = r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer is unavailable');
 const base=game.player(0,3);if(!base?.src)throw Error('fixture player unavailable');
 const cellW=112,cellH=148,frames=16;
 const canvas=document.createElement('canvas');canvas.width=cellW*frames;canvas.height=cellH*4;
 const ctx=canvas.getContext('2d');
 const directions=['run','cut','stop','relaunch'];
 const previous={match:renderer.inMatchDraw,delta:renderer.frameDelta,time:renderer.time};
 const before=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY,p.fatigue,p.breath]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 const player={...base,x:0,y:0,z:0,preview:false,controlled:false,action:'idle',actionTimer:0,
  stun:0,cryTimer:0,visualFacing:null,face:1,dx:1,dy:0,moveVX:260,moveVY:0,anim:0};
 const rows=[];
 renderer.inMatchDraw=true;renderer.frameDelta=1/30;
 for(let phase=0;phase<directions.length;phase++){
  const name=directions[phase],hashes=[],painted=[],changed=[];let old=null,first=null;
  for(let frame=0;frame<frames;frame++){
   const progress=frame/(frames-1),angle=name==='cut'?progress*Math.PI/2:name==='relaunch'?Math.PI/2*(1-progress):Math.PI/2;
   const magnitude=name==='stop'?0:1;
   player.action='idle';player.actionTimer=0;
   player.dx=Math.cos(angle)*magnitude;player.dy=Math.sin(angle)*magnitude;
   player.moveVX=player.dx*260;player.moveVY=player.dy*260;
   player.anim=(phase*frames+frame)/16;renderer.time=(phase*frames+frame)/30;
   const x=frame*cellW,y=phase*cellH;ctx.fillStyle='#101b28';ctx.fillRect(x,y,cellW,cellH);
   ctx.save();ctx.translate(x+cellW/2,y+cellH-13);renderer.drawPlayer(ctx,player,game);ctx.restore();
   const pixels=ctx.getImageData(x,y,cellW,cellH).data;let hash=2166136261,count=0;
   for(let i=0;i<pixels.length;i+=4){hash=Math.imul(hash^pixels[i],16777619);hash=Math.imul(hash^pixels[i+1],16777619);hash=Math.imul(hash^pixels[i+2],16777619);if(pixels[i]!==16||pixels[i+1]!==27||pixels[i+2]!==40)count++;}
   hashes.push(hash>>>0);painted.push(count);if(!first)first=pixels;
   if(old){let delta=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==old[i]||pixels[i+1]!==old[i+1]||pixels[i+2]!==old[i+2])delta++;changed.push(delta);}
   old=pixels;
  }
  if(name!=='stop'&&new Set(hashes).size<10)throw Error(name+' transition produced fewer than 10 distinct rendered frames');
  if(Math.min(...painted)<300)throw Error(name+' transition has a blank or clipped frame');
  if(name!=='stop'&&Math.min(...changed)<180)throw Error(name+' transition contains a visually static adjacent frame');
  if(name==='stop'){
   const settled=changed.slice(-3);
   let transitionChange=0;for(let i=0;i<first.length;i+=4)if(first[i]!==old[i]||first[i+1]!==old[i+1]||first[i+2]!==old[i+2])transitionChange++;
   if(transitionChange<100)throw Error('stop transition did not visibly settle from its preceding run pose');
   rows.push({transition:name,distinctFrames:new Set(hashes).size,minPaintedPixels:Math.min(...painted),brakingChangedPixels:transitionChange,lastThreeAdjacentChanges:settled});
  }else rows.push({transition:name,distinctFrames:new Set(hashes).size,minPaintedPixels:Math.min(...painted),minAdjacentChangedPixels:Math.min(...changed)});
 }
 renderer.inMatchDraw=previous.match;renderer.frameDelta=previous.delta;renderer.time=previous.time;
 const after=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY,p.fatigue,p.breath]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 if(before!==after)throw Error('transition rendering mutated live match state');
 canvas.id='player-motion-transition-gallery';canvas.style.cssText='position:fixed;left:0;top:0;width:1792px;height:592px;z-index:99999;background:#101b28';document.body.append(canvas);
 return {transitions:rows,framesPerTransition:frames,totalFrames:rows.length*frames,liveStateUnchanged:true};
}"""


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        page = browser.new_page(viewport={'width': 1280, 'height': 720})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(HTML.as_uri())
        page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        result = page.evaluate(JS)
        page.locator('#player-motion-transition-gallery').screenshot(path=str(PREVIEW), timeout=30000)
        browser.close()
        if errors:
            raise AssertionError(f'Browser errors: {errors}')
        print({**result, 'preview': str(PREVIEW), 'pageErrors': errors})


if __name__ == '__main__':
    main()
