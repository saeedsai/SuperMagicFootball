#!/usr/bin/env python3
"""Render abrupt turns through the live player renderer in all eight views."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
PREVIEW=ROOT/'tests/.generated/player_turn_counterlean.png'

JS=r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer unavailable');
 const source=game.player(0,3);if(!source?.src)throw Error('fixture player unavailable');
 const headings=[
  ['front',0,1],['frontRight',.6,.8],['right',1,0],['backRight',.6,-.8],
  ['back',0,-1],['backLeft',-.6,-.8],['left',-1,0],['frontLeft',-.6,.8]
 ];
 const cellW=112,cellH=146,columns=5,canvas=document.createElement('canvas');
 canvas.width=columns*cellW;canvas.height=headings.length*cellH;
 const ctx=canvas.getContext('2d'),prior={time:renderer.time,match:renderer.inMatchDraw,delta:renderer.frameDelta,
  poseHeadings:renderer.poseHeadings,poseCycles:renderer.poseCycles};
 const before=JSON.stringify({players:game.players,ball:game.ball});
 const rows=[];let drawHits=0;
 renderer.inMatchDraw=true;renderer.frameDelta=.05;
 try{
  for(let row=0;row<headings.length;row++){
   const [name,tx,ty]=headings[row],turnSign=row%2===0?1:-1;
   const length=Math.hypot(tx,ty),targetX=tx/length,targetY=ty/length;
   const startAngle=Math.atan2(targetY,targetX)-turnSign*Math.PI/2;
   const p={...source,src:{...source.src,appearance:{...(source.src.appearance||{})}},
    x:0,y:0,z:0,preview:false,controlled:false,action:'idle',actionTimer:0,stun:0,cryTimer:0,
    visualFacing:null,face:targetX<-.05?-1:1,dx:Math.cos(startAngle),dy:Math.sin(startAngle),
    moveVX:Math.cos(startAngle)*210,moveVY:Math.sin(startAngle)*210,anim:1};
   renderer.poseHeadings=new WeakMap();renderer.poseCycles=new WeakMap();
   const samples=[];
   for(let col=0;col<columns;col++){
    if(col>0){p.dx=targetX;p.dy=targetY;p.moveVX=targetX*210;p.moveVY=targetY*210;}
    ctx.fillStyle='#101b28';ctx.fillRect(col*cellW,row*cellH,cellW,cellH);
    ctx.fillStyle='#eff8ff';ctx.font='bold 10px sans-serif';ctx.fillText(name+' '+['start','1','2','3','settle'][col],col*cellW+4,row*cellH+12);
    ctx.save();ctx.translate(col*cellW+cellW/2,row*cellH+cellH-10);
    renderer.time+=.05;renderer.drawPlayer(ctx,p,game);ctx.restore();drawHits++;
    const x=col*cellW+24,y=row*cellH+23,w=64,h=90,pixels=ctx.getImageData(x,y,w,h).data;
    let painted=0;
    for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==16||pixels[i+1]!==27||pixels[i+2]!==40)painted++;
    samples.push({pixels,painted});
   }
   const changedPixels=samples.slice(1).map((sample,index)=>{let changed=0,previous=samples[index].pixels;for(let i=0;i<sample.pixels.length;i+=4)if(sample.pixels[i]!==previous[i]||sample.pixels[i+1]!==previous[i+1]||sample.pixels[i+2]!==previous[i+2])changed++;return changed;});
   rows.push({heading:name,turnSign,painted:samples.map(s=>s.painted),changedPixels});
   if(samples.some(s=>s.painted<180))throw Error(name+' rendered too few player pixels: '+JSON.stringify(samples));
   if(changedPixels.some(count=>count<8))throw Error(name+' turn sequence has a static rendered step: '+JSON.stringify(changedPixels));
  }
 }finally{
  renderer.time=prior.time;renderer.inMatchDraw=prior.match;renderer.frameDelta=prior.delta;
  renderer.poseHeadings=prior.poseHeadings;renderer.poseCycles=prior.poseCycles;
 }
 const after=JSON.stringify({players:game.players,ball:game.ball});
 if(before!==after)throw Error('turn rendering mutated live player or ball state');
 canvas.id='player-turn-counterlean-preview';canvas.style.cssText='position:fixed;left:8px;top:8px;width:560px;height:1168px;z-index:99999';
 document.body.append(canvas);
 return {headings:rows,drawCalls:drawHits,liveStateUnchanged:true};
}"""

def main():
    assert HTML.exists(),'Run scripts/build.py first to generate the browser fixture'
    PREVIEW.parent.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':900,'height':1300})
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(HTML.as_uri());page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        result=page.evaluate(JS)
        page.locator('#player-turn-counterlean-preview').screenshot(path=str(PREVIEW),timeout=15000)
        if errors:raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result,'preview':str(PREVIEW),'pageErrors':errors})

if __name__=='__main__':main()
