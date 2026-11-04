"""Real player-renderer acceptance for the Spin Bumper countdown cue."""
from pathlib import Path
import base64
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
PREVIEW=ROOT/'docs/SPIN_BUMPER_TELEGRAPH_QUALITY_20261104.png'
assert HTML.exists(),'Build current modular browser fixture first'

JS=r"""() => {
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;
 if(!g||!r?.drawPlayer)throw Error('actual match renderer unavailable');
 g.init({home:0,away:9,humans:1,mode:'quick'});
 const base=g.player(0,2),canvas=document.createElement('canvas'),cell=280;
 const phases=[0,.25,.5,.75,1],modes=[false,true],dirs=[
  ['front',0,1],['frontRight',.5,.866],['right',1,0],['backRight',.5,-.866],
  ['back',0,-1],['backLeft',-.5,-.866],['left',-1,0],['frontLeft',-.5,.866]
 ];
 canvas.width=cell*phases.length*modes.length;canvas.height=cell*dirs.length;
 const ctx=canvas.getContext('2d'),previous={time:r.time,match:r.inMatchDraw,delta:r.frameDelta,reduced:g.options.reducedFlash};
 const state=()=>JSON.stringify({players:g.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.fatigue,p.breath]),ball:[g.ball?.x,g.ball?.y,g.ball?.z,g.ball?.vx,g.ball?.vy]});
 const before=state(),rows=[];r.inMatchDraw=false;r.time=0;r.frameDelta=1/60;
 for(let row=0;row<dirs.length;row++){
  const [name,dx,dy]=dirs[row];
  for(let mode=0;mode<modes.length;mode++){
   const hashes=[];
   g.options.reducedFlash=modes[mode];
   for(let col=0;col<phases.length;col++){
    const progress=phases[col],x=(mode*phases.length+col)*cell,y=row*cell;
    ctx.fillStyle='#263b39';ctx.fillRect(x,y,cell,cell);
    const p={...base,x:x+cell/2,y:y+cell-18,preview:false,controlled:false,action:'defenceSuper',actionTimer:(1-progress)*.42,
     spinBumperPending:{remaining:(1-progress)*.42},spinBumpFx:0,spinBumperImpactFx:0,abilityFx:0,stun:0,cryTimer:0,z:0,rideVisualZ:0,
     visualFacing:null,face:dx<-.05?-1:1,dx,dy,vx:dx*80,vy:dy*80,anim:1};
    r.drawPlayer(ctx,p,g);
    const pixels=ctx.getImageData(x,y,cell,cell).data;let h=2166136261,painted=0;
    for(let i=0;i<pixels.length;i+=4){h=Math.imul(h^pixels[i],16777619);h=Math.imul(h^pixels[i+1],16777619);h=Math.imul(h^pixels[i+2],16777619);if(pixels[i]!==38||pixels[i+1]!==59||pixels[i+2]!==57)painted++;}
    hashes.push({hash:h>>>0,painted});
   }
   const distinct=new Set(hashes.map(h=>h.hash)).size,minPainted=Math.min(...hashes.map(h=>h.painted));
   if(distinct<5)throw Error(name+' reduced='+modes[mode]+' has only '+distinct+' distinct phases');
   if(minPainted<900)throw Error(name+' reduced='+modes[mode]+' has blank/clipped cue pixels: '+minPainted);
   rows.push({view:name,reducedFlash:modes[mode],distinctPhases:distinct,minPaintedPixels:minPainted});
  }
 }
 r.time=previous.time;r.inMatchDraw=previous.match;r.frameDelta=previous.delta;g.options.reducedFlash=previous.reduced;
 if(state()!==before)throw Error('telegraph renderer mutated live match state');
 return {samples:rows.length*phases.length,headings:dirs.length,phases:phases.length,modes:['standard','reduced-flash'],liveStateUnchanged:true,rows,png:canvas.toDataURL('image/png')};
}"""

def main():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.goto(HTML.as_uri(),wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer',timeout=60000)
  result=page.evaluate(JS)
  PREVIEW.write_bytes(base64.b64decode(result.pop('png').split(',',1)[1]))
  browser.close()
  if errors:raise AssertionError(errors)
  print({**result,'preview':str(PREVIEW),'pageErrors':errors},flush=True)

if __name__=='__main__':main()
