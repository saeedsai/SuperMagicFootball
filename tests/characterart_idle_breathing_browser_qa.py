"""Verify the procedural in-match player painter gives idle players a subtle breath."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'tests/.generated/play.html'
PREVIEW = ROOT / 'tests/.generated/characterart_idle_breathing.png'

JS = r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer is unavailable');
 const source=game.player(0,3);if(!source)throw Error('fixture player is unavailable');
 const priorTime=renderer.time,priorMatch=renderer.inMatchDraw;
 const before=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 const times=[0,.4,1.2,2.4,3.1,4,4.9,5.8],canvas=document.createElement('canvas');
 canvas.width=times.length*104;canvas.height=144;const ctx=canvas.getContext('2d'),hashes=[],visible=[],changes=[];let rest=null;
 renderer.inMatchDraw=false;
 for(let i=0;i<times.length;i++){
  const x=i*104;ctx.fillStyle='#102235';ctx.fillRect(x,0,104,144);renderer.time=times[i];
  const idle={...source,x:0,y:0,z:0,preview:true,controlled:false,action:'idle',actionTimer:0,
   moveVX:0,moveVY:0,dx:0,dy:0,stun:0,cryTimer:0,visualFacing:null,face:1};
  ctx.save();ctx.translate(x+52,126);renderer.drawPlayer(ctx,idle,game);ctx.restore();
  const pixels=ctx.getImageData(x,0,104,144).data;let hash=2166136261,count=0;
  for(let p=0;p<pixels.length;p+=4){hash=Math.imul(hash^pixels[p],16777619);hash=Math.imul(hash^pixels[p+1],16777619);hash=Math.imul(hash^pixels[p+2],16777619);if(pixels[p]!==16||pixels[p+1]!==34||pixels[p+2]!==53)count++;}
  hashes.push(hash>>>0);visible.push(count);
  if(!rest)rest=pixels;
  else{let changed=0;for(let p=0;p<pixels.length;p+=4)if(pixels[p]!==rest[p]||pixels[p+1]!==rest[p+1]||pixels[p+2]!==rest[p+2])changed++;changes.push(changed);}
 }
 const distinct=new Set(hashes).size;
 if(distinct<6)throw Error('idle breathing should produce at least six distinct settled poses, observed '+distinct);
 if(Math.max(...changes)<90)throw Error('idle breathing amplitude is too subtle to read at gameplay scale: '+Math.max(...changes)+' changed pixels');
 if(Math.min(...visible)<400)throw Error('idle breathing frame is blank or clipped: '+Math.min(...visible));
 renderer.time=priorTime;renderer.inMatchDraw=priorMatch;
 const after=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 if(before!==after)throw Error('idle breathing mutated live player or ball state');
 canvas.id='characterart-idle-breathing-preview';canvas.style.cssText='position:fixed;left:8px;top:8px;width:832px;height:144px;z-index:99999';document.body.append(canvas);
 return {frames:times.length,distinctFrames:distinct,maxChangedPixels:Math.max(...changes),minPaintedPixels:Math.min(...visible),liveStateUnchanged:true};
}"""

def main():
    assert HTML.exists(), 'Run scripts/build.py first to generate the browser fixture'
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':900,'height':400})
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(HTML.as_uri());page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        result=page.evaluate(JS)
        page.locator('#characterart-idle-breathing-preview').screenshot(path=str(PREVIEW))
        if errors:raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result,'preview':str(PREVIEW),'pageErrors':errors})

if __name__=='__main__':
    main()
