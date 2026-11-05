"""Verify the actual in-match player renderer paints a staggered natural idle blink."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
PREVIEW=ROOT/'tests/.generated/characterart_idle_blink.png'

JS=r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer is unavailable');
 const source=game.player(0,3);if(!source)throw Error('fixture player is unavailable');
 const priorTime=renderer.time,priorMatch=renderer.inMatchDraw;
 const before=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 const times=[0,.10,.20,.32],canvas=document.createElement('canvas');
 canvas.width=times.length*104;canvas.height=144;const ctx=canvas.getContext('2d');let images=[];
 renderer.inMatchDraw=false;
 for(let i=0;i<times.length;i++){
  const x=i*104;ctx.fillStyle='#102235';ctx.fillRect(x,0,104,144);renderer.time=times[i];
  const idle={...source,x:0,y:0,z:0,i:0,preview:true,controlled:false,action:'idle',actionTimer:0,
   moveVX:0,moveVY:0,dx:0,dy:0,stun:0,cryTimer:0,visualFacing:null,face:1};
  ctx.save();ctx.translate(x+52,126);renderer.drawPlayer(ctx,idle,game);ctx.restore();
  images.push(ctx.getImageData(x+26,34,52,40).data);
 }
 renderer.time=priorTime;renderer.inMatchDraw=priorMatch;
 let blinkDifference=0,reopenDifference=0;
 for(let i=0;i<images[0].length;i+=4){
  if(images[0][i]!==images[1][i]||images[0][i+1]!==images[1][i+1]||images[0][i+2]!==images[1][i+2])blinkDifference++;
  if(images[0][i]!==images[2][i]||images[0][i+1]!==images[2][i+1]||images[0][i+2]!==images[2][i+2])reopenDifference++;
 }
 if(blinkDifference<24)throw Error('blink should visibly change the eye region at match scale: '+blinkDifference);
 if(reopenDifference<4||reopenDifference>1600)throw Error('player should reopen eyes and retain natural time-based variation: '+reopenDifference);
 const after=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY]),ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 if(before!==after)throw Error('idle blink mutated live player or ball state');
 canvas.id='characterart-idle-blink-preview';canvas.style.cssText='position:fixed;left:8px;top:8px;width:416px;height:144px;z-index:99999';document.body.append(canvas);
 return {samples:times.length,blinkPixels:blinkDifference,reopenedVariationPixels:reopenDifference,liveStateUnchanged:true};
}"""

def main():
    assert HTML.exists(),'Run scripts/build.py first to generate the browser fixture'
    PREVIEW.parent.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':520,'height':220})
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(HTML.as_uri());page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        result=page.evaluate(JS);page.locator('#characterart-idle-blink-preview').screenshot(path=str(PREVIEW))
        if errors:raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result,'preview':str(PREVIEW),'pageErrors':errors})

if __name__=='__main__':main()
