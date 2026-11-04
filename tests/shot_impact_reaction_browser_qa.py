"""Actual renderer preview of shot-launch, down/get-up and confused reactions."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'tests/.generated/play.html'
PREVIEW = ROOT / 'tests/.generated/shot_impact_reaction.png'
JS = r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual game player renderer is unavailable');
 const before={ball:{x:game.ball.x,y:game.ball.y,z:game.ball.z},player:{x:game.player(0,3).x,y:game.player(0,3).y,z:game.player(0,3).z,vz:game.player(0,3).vz,action:game.player(0,3).action}};
 const originalOptions=game.options,originalTime=renderer.time;
 const player=game.player(0,3),canvas=document.createElement('canvas');canvas.width=1440;canvas.height=510;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#10283c';ctx.fillRect(0,0,canvas.width,canvas.height);
 const labels=['LAUNCH ASCENT','LAUNCH APEX','SHOT DOWN','GET-UP START','GET-UP PUSH','GET-UP STAND','CONFUSED A','CONFUSED B','REDUCED FLASH'];
 const cases=[
  {action:'launched',stun:0,z:42,vz:360,actionTimer:.78,shotImpactKnockdownPending:1.2,shotImpactKnockdownTimer:0,shotImpactConfusedTimer:0,reducedFlash:false,time:.3},
  {action:'launched',stun:0,z:96,vz:0,actionTimer:.55,shotImpactKnockdownPending:1.2,shotImpactKnockdownTimer:0,shotImpactConfusedTimer:0,reducedFlash:false,time:.55},
  {action:'shotDown',stun:0,shotImpactKnockdownTimer:2.2,shotImpactConfusedTimer:0,reducedFlash:false,time:.3},
  {action:'shotGetUp',stun:0,z:0,vz:0,actionTimer:.24,shotImpactKnockdownTimer:0,shotImpactRiseTimer:.24,shotImpactConfusedTimer:0,reducedFlash:false,time:.72},
  {action:'shotGetUp',stun:0,z:0,vz:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:.12,shotImpactConfusedTimer:0,reducedFlash:false,time:.8},
  {action:'shotGetUp',stun:0,z:0,vz:0,actionTimer:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,shotImpactConfusedTimer:0,reducedFlash:false,time:.88},
  {action:'hurt',stun:.8,shotImpactKnockdownTimer:0,shotImpactConfusedTimer:.8,reducedFlash:false,time:.25},
  {action:'hurt',stun:.8,shotImpactKnockdownTimer:0,shotImpactConfusedTimer:.8,reducedFlash:false,time:.75},
  {action:'hurt',stun:.8,shotImpactKnockdownTimer:0,shotImpactConfusedTimer:.8,reducedFlash:true,time:.75}
 ];
 const hashes=[];
 for(let i=0;i<cases.length;i++){
  const test=cases[i],x=80+i*160;ctx.save();ctx.translate(x,220);
  game.options={...originalOptions,reducedFlash:test.reducedFlash};renderer.time=test.time;
  renderer.drawPlayer(ctx,{...player,x:0,y:0,z:0,preview:false,controlled:false,dx:0,dy:0,face:1,...test},game);
  ctx.restore();ctx.fillStyle='#f5edcf';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(labels[i],x,252);
  const data=ctx.getImageData(i*160,0,160,255).data;let hash=2166136261;for(const value of data)hash=Math.imul(hash^value,16777619);hashes.push(hash>>>0);
 }
 const headings=[
  ['FRONT',0,1,'front',1],['FRONT RIGHT',.7,.7,'quarterFront',1],['RIGHT',1,0,'side',1],['BACK RIGHT',.7,-.7,'quarterBack',1],
  ['BACK',0,-1,'back',1],['BACK LEFT',-.7,-.7,'quarterBack',-1],['LEFT',-1,0,'side',-1],['FRONT LEFT',-.7,.7,'quarterFront',-1]
 ];
 const headingViews=[];
 for(let i=0;i<headings.length;i++){
  const [label,dx,dy,kind,side]=headings[i],x=80+i*160,y=430;
  const headingPlayer={...player,x:0,y:0,z:0,preview:false,controlled:false,dx,dy,face:side,...cases[1]};
  ctx.save();ctx.translate(x,y);game.options={...originalOptions,reducedFlash:false};renderer.time=.55;renderer.drawPlayer(ctx,headingPlayer,game);ctx.restore();
  if(headingPlayer.visualFacing?.kind!==kind||headingPlayer.visualFacing?.side!==side)
   throw Error(label+' resolved the wrong player view '+JSON.stringify(headingPlayer.visualFacing));
  ctx.fillStyle='#f5edcf';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(label,x,492);
  const pixels=ctx.getImageData(i*160,278,160,230).data;let visible=0;
  for(let p=0;p<pixels.length;p+=4)if(pixels[p]!==16||pixels[p+1]!==40||pixels[p+2]!==60)visible++;
  if(visible<380)throw Error(label+' launched reaction is blank or clipped: '+visible+' pixels');
  headingViews.push({heading:label,view:headingPlayer.visualFacing.kind,side:headingPlayer.visualFacing.side,paintedPixels:visible});
 }
 game.options=originalOptions;renderer.time=originalTime;
 canvas.id='shot-impact-reaction-preview';canvas.style.cssText='position:fixed;left:10px;top:10px;width:1440px;height:510px;z-index:99999';document.body.append(canvas);
 if(new Set(hashes).size<9)throw Error('launch, stable-down, three recovery phases and confusion poses must remain visually distinct '+JSON.stringify(hashes));
 const after={ball:{x:game.ball.x,y:game.ball.y,z:game.ball.z},player:{x:player.x,y:player.y,z:player.z,vz:player.vz,action:player.action}};
 if(JSON.stringify(after)!==JSON.stringify(before))throw Error('player pose preview changed player or ball physics');
 if(new Set(headingViews.map(view=>view.view+':'+view.side)).size!==8)throw Error('launch pose must cover all eight headings '+JSON.stringify(headingViews));
 return {distinctPoseHashes:new Set(hashes).size,frames:labels,headingViews,physicsUnchanged:true};
}"""

def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1280, 'height': 720})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(HTML.as_uri())
        page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        result = page.evaluate(JS)
        page.locator('#shot-impact-reaction-preview').screenshot(path=str(PREVIEW))
        if errors:
            raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result, 'preview': str(PREVIEW), 'pageErrors': errors})

if __name__ == '__main__':
    main()
