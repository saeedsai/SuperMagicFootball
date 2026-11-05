#!/usr/bin/env python3
"""Production-renderer gaze samples for existing players at front/quarter views."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
PREVIEW=ROOT/'tests/.generated/characterart_idle_gaze.png'

JS=r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer unavailable');
 const source=game.player(0,3);if(!source?.src)throw Error('existing player fixture unavailable');
 const views=[['front',{kind:'front',side:1}],['quarter-front',{kind:'quarterFront',side:1}]];
 const cellW=196,cellH=146,columns=3,sheet=document.createElement('canvas');
 sheet.width=cellW*columns;sheet.height=cellH*views.length;
 const sc=sheet.getContext('2d'),probe=document.createElement('canvas');probe.width=112;probe.height=144;
 const pc=probe.getContext('2d');
 const state=()=>JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.moveVX,p.moveVY,p.fatigue,p.breath,p.stun,p.cryTimer]),
  ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy,game.ball?.age,game.ball?.owner?.src?.id,game.ball?.shot?.id]});
 const before=state(),prior={time:renderer.time,match:renderer.inMatchDraw,delta:renderer.frameDelta,flash:game.options?.reducedFlash};
 function render(view,time,reduced){
  if(!game.options)throw Error('game options unavailable');game.options.reducedFlash=reduced;
  renderer.time=time;pc.fillStyle='#101b28';pc.fillRect(0,0,112,144);
  const p={...source,src:{...source.src,appearance:{...(source.src.appearance||{})}},x:0,y:0,z:0,
   preview:true,controlled:false,action:'idle',actionTimer:0,stun:0,cryTimer:0,
   moveVX:0,moveVY:0,dx:0,dy:0,face:1,visualFacing:view};
  pc.save();pc.translate(56,134);renderer.drawPlayer(pc,p,game);pc.restore();
  const image=pc.getImageData(30,52,52,38),pixels=image.data;let whites=0;
  for(let i=0;i<pixels.length;i+=4)if(pixels[i]>215&&pixels[i+1]>205&&pixels[i+2]>190)whites++;
  return {pixels:Array.from(pixels),whites};
 }
 function difference(a,b){let count=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])count++;return count;}
 const results=[];renderer.inMatchDraw=false;renderer.frameDelta=1/60;
 try{
  for(const [name,view] of views){let active=null,neutral=null;
   for(let step=0;step<=180;step++){
    const time=step*.08,normal=render(view,time,false),quiet=render(view,time,true),diff=difference(normal.pixels,quiet.pixels);
    if(normal.whites>=2&&diff===0&&!neutral)neutral={time,normal,quiet,diff};
    if(normal.whites>=2&&diff>(active?.diff||0))active={time,normal,quiet,diff};
   }
   if(!active||active.diff<3)throw Error(name+' gaze did not visibly move open-eye pixels: '+JSON.stringify({active:active?.diff}));
   if(!neutral)throw Error(name+' gaze did not return to a neutral open-eye sample');
   results.push({name,activeTime:active.time,activeChangedPixels:active.diff,neutralTime:neutral.time,neutralChangedPixels:neutral.diff,openEyePixels:active.normal.whites});
   for(const [col,sample,label,reduced] of [[0,active.normal,'gaze',false],[1,active.quiet,'reduced flash',true],[2,neutral.normal,'center',false]]){
    const x=col*cellW,y=results.length-1>=0?(views.findIndex(item=>item[0]===name))*cellH:0;
    sc.fillStyle='#101b28';sc.fillRect(x,y,cellW,cellH);sc.fillStyle='#edf8ff';sc.font='bold 13px sans-serif';sc.fillText(name+' · '+label,x+8,y+18);
    const image=pc.createImageData(52,38);image.data.set(sample.pixels);const scratch=document.createElement('canvas');scratch.width=52;scratch.height=38;scratch.getContext('2d').putImageData(image,0,0);
    sc.drawImage(scratch,x+72,y+46,52,38);
   }
  }
 }finally{
  renderer.time=prior.time;renderer.inMatchDraw=prior.match;renderer.frameDelta=prior.delta;
  if(prior.flash===undefined)delete game.options.reducedFlash;else game.options.reducedFlash=prior.flash;
 }
 if(before!==state())throw Error('idle gaze mutated live player or ball state');
 sheet.id='characterart-idle-gaze-preview';sheet.style.cssText='position:fixed;left:8px;top:8px;width:588px;height:438px;z-index:99999';document.body.append(sheet);
 return {samples:results,liveStateUnchanged:true};
}"""

def main():
    assert HTML.exists(),'Run scripts/build.py first to generate the browser fixture'
    PREVIEW.parent.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':820,'height':500})
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(HTML.as_uri());page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        result=page.evaluate(JS)
        page.locator('#characterart-idle-gaze-preview').screenshot(path=str(PREVIEW),timeout=15000)
        if errors:raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result,'preview':str(PREVIEW),'pageErrors':errors})

if __name__=='__main__':main()
