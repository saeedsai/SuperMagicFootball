"""SH07 actual-renderer gallery and transformation-return check in Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf8')
PREVIEW = ROOT / 'tests/.generated/sh07_transformed_ball_preview.png'
JS = r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawTransformation)throw Error('actual game renderer is unavailable');
 const ids=Object.keys(api.shots||{});if(ids.length!==32)throw Error('expected all 32 shot transformations '+ids.length);
 const before={x:game.ball.x,y:game.ball.y,z:game.ball.z};
 const c=document.createElement('canvas'),cols=8,cellW=117,cellH=105;c.width=940;c.height=Math.ceil(ids.length/cols)*3*cellH;const ctx=c.getContext('2d');
 ctx.fillStyle='#0b2031';ctx.fillRect(0,0,c.width,c.height);ctx.font='12px sans-serif';ctx.textAlign='center';
 for(let row=0;row<3;row++)for(let i=0;i<ids.length;i++){
  const x=(i%cols)*cellW,y=(Math.floor(i/cols)*3+row)*cellH,age=row===2?1.56:.72,reduced=row===1;
  ctx.fillStyle=row%2?'#102a3d':'#0d2537';ctx.fillRect(x,y,cellW-2,cellH-2);
  ctx.save();ctx.translate(x+cellW/2,y+45);renderer.drawTransformation(ctx,{id:ids[i],transformSeconds:1.65},age,reduced,'classic');ctx.restore();
  ctx.fillStyle='#f1f5e8';ctx.fillText(`${ids[i]}${reduced?' · low motion':row===2?' · return':''}`,x+cellW/2,y+88);
 }
 const sample=document.createElement('canvas');sample.width=96;sample.height=96;const sampleCtx=sample.getContext('2d'),hashes=[];
 for(const id of ids){sampleCtx.clearRect(0,0,96,96);renderer.drawTransformation(sampleCtx,{id,transformSeconds:1.65},.72,false,'classic');
  let hash=2166136261;for(const value of sampleCtx.getImageData(0,0,96,96).data)hash=Math.imul(hash^value,16777619);hashes.push(hash>>>0);}
 if(new Set(hashes).size!==ids.length)throw Error('shot transformations are not visually distinct '+JSON.stringify({ids,hashes}));
 c.id='sh07-preview';c.style.cssText=`position:fixed;left:12px;top:12px;width:940px;height:${c.height}px;z-index:99999`;document.body.append(c);
 const renderSideEffectFree=before.x===game.ball.x&&before.y===game.ball.y&&before.z===game.ball.z;
 if(!renderSideEffectFree)throw Error('drawing shot variants mutated ball physics');
 game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,reducedFlash:true,weather:'Clear',terrain:'Grass',condition:'Good'}});
 const shooter=game.player(0,3);game.freeBall(shooter,300,0,450,{shot:{id:'omega',behavior:'warp',color:'#de9eff',trail:'#6d6cfc'},power:90,aimY:765});
 if(game.ball.shot.transformSeconds!==1.65||game.flash!==0||game.shake!==0)throw Error('reduced-flash release or transform timing contract failed '+JSON.stringify({shot:game.ball.shot,flash:game.flash,shake:game.shake}));
 game.ball.age=1.64;game.ball.vx=0;game.ball.vy=0;game.ball.vz=0;game.ball.x=1280;game.ball.y=765;game.ball.z=0;
 game.updateBall(.02);
 if(game.ball.shot||!game.events.some(e=>e.type==='shotTransformEnd'))throw Error('ball did not return to ordinary state at the transform end');
 return {variants:ids.length,distinctVariants:new Set(hashes).size,normalAndReducedRows:true,returnTransitionRows:true,returnEvent:true,reducedFlashRelease:true,renderSideEffectFree};
}"""

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto('file://' + str(ROOT / 'tests/.generated/play.html'))
        page.wait_for_function("!!window.SupermagicFootball?.renderer?.drawTransformation")
        result = page.evaluate(JS)
        page.locator('#sh07-preview').screenshot(path=str(PREVIEW))
        if errors:
            raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result, 'preview': str(PREVIEW), 'pageErrors': errors})

if __name__ == '__main__':
    main()
