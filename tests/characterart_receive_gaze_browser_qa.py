#!/usr/bin/env python3
"""Desktop and simulated-touch actual-renderer receive gaze and eight-view procedural bracing acceptance."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
OUT=ROOT/'docs/qa_runs_full_regression'
OUT.mkdir(parents=True,exist_ok=True)
JS=r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer unavailable');
 const source=game.player(0,3);if(!source?.src)throw Error('existing player fixture unavailable');
 const width=innerWidth,height=innerHeight,screenH=720,screenW=Math.max(1280,720*width/height);
 const scale=Math.min(width/screenW,height/screenH),ballRef=game.ball;
 if(!ballRef)throw Error('live ball unavailable');
 const ballSnapshot={...ballRef},playersBefore=JSON.stringify(game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.fatigue,p.breath,p.stun]));
 const prior={scale:renderer.scale,dpr:renderer.dpr,cameraZoom:renderer.cameraZoom,screenW:renderer.screenW,screenH:renderer.screenH,inMatchDraw:renderer.inMatchDraw,time:renderer.time,frameDelta:renderer.frameDelta,flash:game.options?.reducedFlash};
 renderer.scale=scale;renderer.dpr=1;renderer.cameraZoom=1;renderer.screenW=screenW;renderer.screenH=screenH;renderer.inMatchDraw=false;renderer.time=0;renderer.frameDelta=0;game.options.reducedFlash=false;
 function render(side,kind,target,velocity={},pressure=.72){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#142b3d';ctx.fillRect(0,0,width,height);
  ctx.setTransform(scale,0,0,scale,width/2,height*.72);
  const p={...source,x:0,y:0,z:0,preview:false,controlled:false,action:'receive',actionTimer:.2,stun:0,down:false,firstTouchPressure:pressure,moveVX:0,moveVY:0,dx:0,dy:0,face:side,visualFacing:{kind,side},anim:0,magicReadCueTimer:0,firstTouchFx:0,fireballBurnFx:0,spinBumpFx:0,sandTrapFx:0,lightningMark:0,lightningFx:0};
  game.ball={...ballSnapshot,owner:null,x:target.x,y:target.y,z:target.z,vx:Number(velocity.vx)||0,vy:Number(velocity.vy)||0,vz:Number(velocity.vz)||0,shot:null,strike:null,ordinaryShot:false,pass:false};
  renderer.drawPlayer(ctx,p,game);
  const cx=Math.round(width/2),cy=Math.round(height*.72-58*scale),x=Math.max(0,cx-18),y=Math.max(0,cy-12),w=Math.min(36,width-x),h=Math.min(24,height-y);
  const bodyX=Math.max(0,Math.round(width/2-40*scale)),bodyY=Math.max(0,Math.round(height*.72-140*scale)),
   bodyW=Math.max(1,Math.min(width-bodyX,Math.round(80*scale))),bodyH=Math.max(1,Math.min(height-bodyY,Math.round(145*scale)));
  return {canvas,pixels:Array.from(ctx.getImageData(x,y,w,h).data),
   bodyPixels:Array.from(ctx.getImageData(bodyX,bodyY,bodyW,bodyH).data)};
 }
 const diff=(a,b)=>{let n=0;for(let i=0;i<Math.min(a.length,b.length);i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;return n;};
 let right,left,mirrored,high,stationary,lead;
 const viewBrace=[];
 try{
  right=render(1,'front',{x:140,y:0,z:0});left=render(1,'front',{x:-140,y:0,z:0});mirrored=render(-1,'front',{x:-140,y:0,z:0});high=render(1,'front',{x:0,y:0,z:90});stationary=render(1,'front',{x:200,y:0,z:0});lead=render(1,'front',{x:200,y:0,z:0},{vx:-240});
  const views=[['front',1],['quarterFront',1],['side',1],['quarterBack',1],['back',1],['quarterBack',-1],['side',-1],['quarterFront',-1]];
  for(const [kind,side] of views){
   const pressured=render(side,kind,{x:140,y:0,z:0},{},.72);
   const relaxed=render(side,kind,{x:140,y:0,z:0},{},0);
   viewBrace.push({kind,side,pixels:diff(pressured.bodyPixels,relaxed.bodyPixels),canvas:pressured.canvas});
  }
 }
 finally{
  game.ball=ballRef;Object.assign(ballRef,ballSnapshot);
  renderer.scale=prior.scale;renderer.dpr=prior.dpr;renderer.cameraZoom=prior.cameraZoom;renderer.screenW=prior.screenW;renderer.screenH=prior.screenH;
  renderer.inMatchDraw=prior.inMatchDraw;renderer.time=prior.time;renderer.frameDelta=prior.frameDelta;
  if(prior.flash===undefined)delete game.options.reducedFlash;else game.options.reducedFlash=prior.flash;
 }
 const lr=diff(right.pixels,left.pixels),vertical=diff(right.pixels,high.pixels),velocityLead=diff(stationary.pixels,lead.pixels);
 const after=JSON.stringify(game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.fatigue,p.breath,p.stun]));
 const sheet=document.createElement('canvas');sheet.id='receive-gaze-gallery';sheet.width=1000;sheet.height=230;
 const sc=sheet.getContext('2d');sc.fillStyle='#10283a';sc.fillRect(0,0,1000,230);
 for(const [i,item] of [[0,right],[1,left],[2,mirrored],[3,high],[4,lead]]){
  sc.fillStyle='#f2f6ff';sc.font='bold 12px Arial';sc.fillText(['BALL RIGHT','BALL LEFT','LEFT-FACING FRONT','HIGH BALL','VELOCITY LEAD'][i],i*200+7,18);
  const cw=150*scale,ch=170*scale,cx=width/2,cy=height*.72;
  sc.drawImage(item.canvas,cx-cw/2,cy-ch+12,cw,ch,i*200+10,28,180,195);
 }
 document.body.append(sheet);
 const braceSheet=document.createElement('canvas');braceSheet.id='receive-brace-gallery';braceSheet.width=1280;braceSheet.height=250;
 const bc=braceSheet.getContext('2d');bc.fillStyle='#10283a';bc.fillRect(0,0,1280,250);
 for(const [i,item] of viewBrace.entries()){
  bc.fillStyle='#f2f6ff';bc.font='bold 11px Arial';bc.fillText(item.kind+' '+(item.side<0?'LEFT':'RIGHT'),i*160+4,18);
  const cw=140*scale,ch=170*scale,cx=width/2,cy=height*.72;
  bc.drawImage(item.canvas,cx-cw/2,cy-ch+12,cw,ch,i*160+5,28,150,215);
 }
 document.body.append(braceSheet);
 return {width,height,scale,leftRightPixels:lr,verticalPixels:vertical,velocityLeadPixels:velocityLead,
  viewBrace:viewBrace.map(({kind,side,pixels})=>({kind,side,pixels})),
  liveStateUnchanged:playersBefore===after&&game.ball===ballRef};
}"""
def main():
    if not HTML.exists(): raise SystemExit('Run scripts/build.py first to generate the browser fixture')
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        for kind,viewport in [('desktop',{'width':1280,'height':720}),('simulated-touch',{'width':844,'height':390})]:
            context=browser.new_context(viewport=viewport,is_mobile=kind!='desktop',has_touch=kind!='desktop')
            page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto(HTML.as_uri());page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
            result=page.evaluate(JS)
            if errors: raise AssertionError(f'{kind} browser errors: {errors}')
            assert result['leftRightPixels']>=1,(kind,result)
            assert result['verticalPixels']>=1,(kind,result)
            assert result['velocityLeadPixels']>=1,(kind,result)
            assert len(result['viewBrace'])==8,(kind,result)
            assert all(item['pixels']>=8 for item in result['viewBrace']),(kind,result)
            assert result['liveStateUnchanged'],(kind,result)
            preview=OUT/f'characterart-receive-gaze-{kind}.png'
            page.locator('#receive-gaze-gallery').screenshot(path=str(preview),timeout=15000)
            brace_preview=OUT/f'characterart-receive-brace-{kind}.png'
            page.locator('#receive-brace-gallery').screenshot(path=str(brace_preview),timeout=15000)
            print('PASS',kind,'actual renderer gaze plus pressure-scaled receiving brace across eight existing-player headings',result,flush=True)
            context.close()
        browser.close()
if __name__=='__main__':main()
