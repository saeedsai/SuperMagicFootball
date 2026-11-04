"""Actual game renderer check for a softer, wider player shadow while airborne."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'tests/.generated/play.html'
OUT=ROOT/'tests/.generated/player_airborne_shadow.png'
assert FIXTURE.exists(),'Run python -X utf8 scripts/build.py first'
html=FIXTURE.read_text(encoding='utf-8')
JS=r'''() => {
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;
 if(!g||!r?.drawPlayer)throw Error('live player renderer unavailable');
 const base=g.players.find(p=>p&&!p.keeper);if(!base)throw Error('field player unavailable');
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=460;canvas.id='airborne-shadow-gallery';
 canvas.style.cssText='position:fixed;left:10px;top:10px;width:600px;height:460px;z-index:99999;background:#e8eef3';
 const c=canvas.getContext('2d',{willReadFrequently:true});c.fillStyle='#e8eef3';c.fillRect(0,0,600,460);
 const heights=[0,120,240], samples=[];
 const before=JSON.stringify({x:base.x,y:base.y,z:base.z,rideVisualZ:base.rideVisualZ,action:base.action});
 try {
  for(let i=0;i<heights.length;i++){
   const x=i*200;c.save();c.translate(x+100,385);r.time=.2;
   const p={...base,x:0,y:0,z:heights[i],rideVisualZ:0,face:1,dx:0,dy:0,visualFacing:{kind:'front'},action:'idle',actionTimer:0,stun:0,cryTimer:0,controlled:false,preview:true,keeper:false};
   r.drawPlayer(c,p,{getTeam:()=>g.getTeam(base.t),options:{showNames:false,reducedFlash:false},celebrationStyle:0});c.restore();
   c.fillStyle='#203244';c.font='bold 13px system-ui';c.textAlign='center';c.fillText(`LIFT ${heights[i]}`,x+100,20);
   const pixel=c.getImageData(x+142,388,1,1).data;
   samples.push({height:heights[i],sample:[...pixel]});
  }
 } finally {r.time=.2;}
 if(JSON.stringify({x:base.x,y:base.y,z:base.z,rideVisualZ:base.rideVisualZ,action:base.action})!==before)throw Error('renderer changed source player state');
 const [ground,mid,high]=samples.map(v=>v.sample);
 const delta=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);
 if(delta(ground,[232,238,243,255])>12)throw Error('ground shadow changed its original outer bound');
 if(delta(high,[232,238,243,255])<12)throw Error('high shadow did not visibly broaden');
 if(delta(high,[232,238,243,255])<=delta(mid,[232,238,243,255]))throw Error('shadow did not strengthen monotonically at its outer edge');
 document.body.append(canvas);
 return {samples,groundBaselinePreserved:true,airborneShadowBroadens:true,playerStateUnchanged:true};
}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1100,'height':500});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer',timeout=60000)
 result=page.evaluate(JS);page.locator('#airborne-shadow-gallery').screenshot(path=str(OUT),timeout=30000)
 assert result['groundBaselinePreserved'] and result['airborneShadowBroadens'],result
 assert result['playerStateUnchanged'] and not errors,{'result':result,'errors':errors}
 browser.close();print({**result,'preview':str(OUT),'pageErrors':errors})
