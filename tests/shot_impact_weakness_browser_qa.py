"""Actual production-renderer checks for the temporary shot-weakness marker."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
PREVIEW=ROOT/'tests/.generated/shot_impact_weakness.png'
JS=r"""() => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer unavailable');
 const source=game.player(0,3);if(!source?.src)throw Error('existing player fixture unavailable');
 const prior={time:renderer.time,inMatchDraw:renderer.inMatchDraw,frameDelta:renderer.frameDelta,
  options:game.options,source:{x:source.x,y:source.y,z:source.z,stun:source.stun,weak:source.shotImpactWeakness,
   weakTimer:source.shotImpactWeaknessTimer,action:source.action},ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]};
 const headings=[
  ['FRONT','front',1,0,0],['FRONT-RIGHT','quarterFront',1,.7,.7],
  ['RIGHT','side',1,1,0],['BACK-RIGHT','quarterBack',1,.7,-.7],
  ['BACK','back',1,0,-1],['BACK-LEFT','quarterBack',-1,-.7,-.7],
  ['LEFT','side',-1,-1,0],['FRONT-LEFT','quarterFront',-1,-.7,.7]
 ];
 const cellW=120,cellH=188,columns=8,canvas=document.createElement('canvas');
 canvas.width=cellW*columns;canvas.height=cellH*3;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#10283c';ctx.fillRect(0,0,canvas.width,canvas.height);
 const liveBefore=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.stun,p.shotImpactWeakness,p.shotImpactWeaknessTimer,p.action,p.actionTimer]),ball:prior.ball});
 const originalOptions=game.options,originalTime=renderer.time,originalDraw=renderer.inMatchDraw,originalDelta=renderer.frameDelta;
 renderer.inMatchDraw=false;renderer.frameDelta=1/60;
 function draw(view,weakness,options={}){
  const label=view[0],kind=view[1],side=view[2],ox=weakness.row*cellW+view.i*cellW,oy=weakness.line*cellH;
  const opt={weakness:0,timer:0,stun:0,down:false,z:0,action:'idle',preview:false,reduced:false,time:1.1,...weakness};
  game.options={...originalOptions,reducedFlash:opt.reduced};renderer.time=opt.time;
  ctx.fillStyle='#10283c';ctx.fillRect(ox,oy,cellW,cellH);
  const p={...source,src:{...source.src,appearance:{...(source.src.appearance||{})}},
   x:0,y:0,z:opt.z,preview:opt.preview,controlled:false,dx:0,dy:0,face:side,
   visualFacing:{kind,side},action:opt.action,actionTimer:opt.actionTimer||0,
   stun:opt.stun,down:opt.down,shotImpactKnockdownPending:opt.pending||0,
   shotImpactKnockdownTimer:opt.knockdown||0,shotImpactRiseTimer:opt.rise||0,
   shotImpactKnockdownTotal:opt.total||0,
   shotImpactConfusedTimer:opt.confused||0,shotImpactWeakness:opt.weakness,
   shotImpactWeaknessTimer:opt.timer};
  ctx.save();ctx.translate(ox+cellW/2,oy+132);renderer.drawPlayer(ctx,p,game);ctx.restore();
  if(kind!==p.visualFacing.kind||side!==p.visualFacing.side)throw Error(label+' resolved an unexpected view');
  ctx.fillStyle='#f5edcf';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
  if(weakness.line<2)ctx.fillText((opt.reduced?'LOW FLASH ':'')+label,ox+cellW/2,oy+174);
  return ctx.getImageData(ox,oy,cellW,cellH).data;
 }
 function diff(a,b){let count=0;for(let y=136;y<166;y++)for(let x=32;x<88;x++){const i=(y*cellW+x)*4;if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])count++;}return count;}
 function frameDiff(a,b){let count=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])count++;return count;}
 const result=[],hidden=[];let reducedPixels=0,downChanges=[],downElapsed=[];
 try{
  for(let i=0;i<headings.length;i++){
   const view={...headings[i],i};
   const off=draw(view,{row:0,line:0,weakness:0,timer:0});
   const active=draw(view,{row:1,line:0,weakness:.24,timer:3.2});
   const changed=diff(off,active);if(changed<15)throw Error(view[0]+' weakness marker is not readable: '+changed);
   result.push({view:view[0],activeChangedPixels:changed});
  }
  const front={...headings[0],i:0};
  const reducedOff=draw(front,{row:0,line:1,weakness:0,timer:0,reduced:true});
  const reducedOn=draw(front,{row:1,line:1,weakness:.24,timer:3.2,reduced:true});
  reducedPixels=diff(reducedOff,reducedOn);if(reducedPixels<15)throw Error('reduced-flash mode hid the weakness cue '+reducedPixels);
  const normalOn=draw(front,{row:1,line:0,weakness:.24,timer:3.2});
  if(diff(normalOn,reducedOn)===0)throw Error('reduced-flash styling should be steadier/subtler than normal styling');
  const hiddenCases=[
   ['preview',{preview:true}],
   ['stun',{stun:.8,confused:.8,action:'hurt'}],
   ['down flag',{down:true,action:'shotDown',knockdown:1.4}],
   ['knockdown',{action:'shotDown',knockdown:1.4}],
   ['get-up',{action:'shotGetUp',rise:.2}],
   ['launch',{action:'launched',pending:1.2,z:30}],
   ['expired timer',{timer:0}]
  ];
  for(const [label,extra] of hiddenCases){
   const off=draw(front,{row:0,line:0,weakness:0,timer:0,...extra});
   const on=draw(front,{row:1,line:0,weakness:.24,timer:3.2,...extra});
   const changed=diff(off,on);if(changed!==0)throw Error(label+' pose displayed the weakness marker ('+changed+' changed pixels), opts='+JSON.stringify(extra));
   hidden.push({state:label,changedPixels:changed});
  }
  const downDuration=1.4;downElapsed=[0,.05,.10,.20,.40];const downFrames=[];
  for(let i=0;i<downElapsed.length;i++){
   const remaining=downDuration-downElapsed[i],pixels=draw(front,{row:i,line:2,weakness:0,timer:0,
    action:'shotDown',actionTimer:remaining,knockdown:remaining,total:downDuration});
   downFrames.push(pixels);ctx.fillStyle='#ffd76a';ctx.font='bold 9px sans-serif';ctx.textAlign='center';
   ctx.fillText('FALL '+downElapsed[i].toFixed(2)+'s',i*cellW+cellW/2,2*cellH+174);
  }
  downChanges=downFrames.slice(1).map((frame,index)=>frameDiff(downFrames[index],frame));
  if(downChanges.slice(0,3).some(count=>count<20))throw Error('grounded fall should ease through visible entry phases '+JSON.stringify(downChanges));
 }finally{
  game.options=originalOptions;renderer.time=originalTime;renderer.inMatchDraw=originalDraw;renderer.frameDelta=originalDelta;
 }
 const liveAfter=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.stun,p.shotImpactWeakness,p.shotImpactWeaknessTimer,p.action,p.actionTimer]),ball:prior.ball});
 if(liveBefore!==liveAfter)throw Error('renderer cue mutated live player or ball state');
 canvas.id='shot-impact-weakness-preview';canvas.style.cssText='position:fixed;left:8px;top:8px;width:960px;height:564px;z-index:99999';document.body.append(canvas);
 return {views:result,reducedFlashChangedPixels:reducedPixels,hidden,downSettle:{elapsed:downElapsed,changedPixels:downChanges},liveStateUnchanged:true};
}"""

def main():
    assert HTML.exists(),'Run scripts/build.py first to generate the browser fixture'
    PREVIEW.parent.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':1280,'height':720})
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(HTML.as_uri());page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        result=page.evaluate(JS)
        page.locator('#shot-impact-weakness-preview').screenshot(path=str(PREVIEW))
        if errors:raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result,'preview':str(PREVIEW),'pageErrors':errors})

if __name__=='__main__':
    main()
