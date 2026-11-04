"""Actual-renderer canvas pixel QA for shot-down breathing, normal/reduced flash."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'tests/.generated/play.html'
PREVIEW = ROOT / 'tests/.generated/shot_impact_recovery_breath.png'
JS = r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual game player renderer is unavailable');
 const player=game.player(0,3),canvas=document.createElement('canvas');canvas.width=640;canvas.height=230;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#10283c';ctx.fillRect(0,0,canvas.width,canvas.height);
 const options=game.options,time=renderer.time;
 const state=JSON.stringify({p:[player.x,player.y,player.z,player.vx,player.vy,player.vz,player.action,player.shotImpactKnockdownTimer],ball:[game.ball.x,game.ball.y,game.ball.z]});
 const cases=[
  {label:'NORMAL · REST',time:.3,timer:1.4,reducedFlash:false},
  {label:'NORMAL · BREATH',time:.3,timer:1.0,reducedFlash:false},
  {label:'REDUCED · REST',time:.3,timer:1.4,reducedFlash:true},
  {label:'REDUCED · BREATH',time:.3,timer:1.0,reducedFlash:true}
 ];
 const hashes=[];
 for(let i=0;i<cases.length;i++){
  const c=cases[i],x=i*160+80;game.options={...options,reducedFlash:c.reducedFlash};renderer.time=c.time;
  ctx.save();ctx.translate(x,180);
  renderer.drawPlayer(ctx,{...player,x:0,y:0,z:0,preview:false,controlled:false,dx:0,dy:0,face:1,action:'shotDown',stun:0,shotImpactKnockdownTimer:c.timer,shotImpactConfusedTimer:0},game);
  ctx.restore();ctx.fillStyle='#f5edcf';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(c.label,x,215);
  const data=ctx.getImageData(i*160,0,160,200).data;let hash=2166136261;for(const value of data)hash=Math.imul(hash^value,16777619);hashes.push(hash>>>0);
 }
 function changed(a,b){const A=ctx.getImageData(a*160,0,160,200).data,B=ctx.getImageData(b*160,0,160,200).data;let count=0;for(let i=3;i<A.length;i+=4)if(A[i]!==B[i]||A[i-1]!==B[i-1]||A[i-2]!==B[i-2])count++;return count;}
 // Sample player-only crop without its caption, comparing two breathing phases.
 const normalPixels=changed(0,1),reducedPixels=changed(2,3);
 game.options=options;renderer.time=time;
 const after=JSON.stringify({p:[player.x,player.y,player.z,player.vx,player.vy,player.vz,player.action,player.shotImpactKnockdownTimer],ball:[game.ball.x,game.ball.y,game.ball.z]});
 if(normalPixels<3)throw Error('normal-flash downed pose has no measurable canvas breathing motion: '+normalPixels);
 if(reducedPixels<1)throw Error('reduced-flash downed pose has no measurable canvas breathing motion: '+reducedPixels);
 if(normalPixels<reducedPixels)throw Error('reduced-flash breathing should be no stronger than normal');
 if(state!==after)throw Error('pose rendering mutated player or ball gameplay state');
 canvas.id='shot-impact-recovery-breath-preview';canvas.style.cssText='position:fixed;left:10px;top:10px;width:640px;height:230px;z-index:99999';document.body.append(canvas);
 return {normalChangedPixels:normalPixels,reducedFlashChangedPixels:reducedPixels,hashes,physicsUnchanged:true};
}"""

def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 800, 'height': 400})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(HTML.as_uri())
        page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        result = page.evaluate(JS)
        page.locator('#shot-impact-recovery-breath-preview').screenshot(path=str(PREVIEW))
        if errors:
            raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result, 'preview': str(PREVIEW), 'pageErrors': errors})

if __name__ == '__main__':
    main()
