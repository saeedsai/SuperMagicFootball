"""TR18: real Chromium Canvas, effect lifecycle, reduced-flash and trick-isolation QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
SCRIPT=r"""() => {
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;
 if(!g||!r)throw Error('Modular game renderer did not initialize');
 const results=[],canvas=document.createElement('canvas');canvas.id='tr18-canvas';canvas.width=960;canvas.height=400;
 canvas.style.cssText='display:block;position:fixed;z-index:999999;left:10px;top:10px;width:960px;height:400px;border:2px solid white';document.body.appendChild(canvas);
 const ctx=canvas.getContext('2d');ctx.fillStyle='#173a34';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(const [row,fps] of [30,60,120].entries()){
  g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,weather:'Clear',reducedFlash:false}});
  const p=g.players.find(q=>q.t===0&&!q.keeper),d=g.players.find(q=>q.t===1&&!q.keeper);
  if(!p||!d)throw Error('Missing outfield players');g.players=[p,d];
  p.src={...p.src,magicTrick:'teleport'};Object.assign(p,{x:500,y:350,dx:1,dy:0,face:1,stun:0,keeper:false,magicReadyAt:0,fatigue:.1,teleportTrail:null});
  Object.assign(d,{x:1000,y:600,dx:0,dy:0,z:0,stun:0,action:'idle',actionTimer:0,keeper:false});g.ball.owner=p;
  if(!g.tryMagicTrick(p))throw Error('Teleport activation failed');
  const e=p.teleportTrail;if(!e||e.fromX!==500||e.toX!==585||e.fromY!==350||e.toY!==350)throw Error('Missing bounded origin/destination cue '+JSON.stringify(e));
  const preview={...e,fromX:0,fromY:0,toX:115,toY:0};
  if(g.ball.owner!==p||p.magicReadyAt!==g.clock+6||Math.abs(p.fatigue-.135)>1e-9)throw Error('Teleport gameplay/cost changed');
  const color='#c5a3ff';ctx.fillStyle='#1d4b3c';ctx.fillRect(row*320,0,320,200);ctx.fillStyle='#f4e9ff';ctx.font='bold 17px Arial';ctx.fillText(fps+' HZ · TELEPORT',row*320+18,25);
  ctx.save();ctx.translate(row*320+90,110);ctx.scale(.72,.72);if(!r.drawTeleportTrail(ctx,preview,false))throw Error('Canvas rejected active Teleport trail');ctx.restore();
  const pixels=ctx.getImageData(row*320+70,85,120,60).data;let visible=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]>100&&pixels[i+2]>100)visible++;if(visible<20)throw Error('Canvas Teleport cue is not visibly rendered');
  g.options.reducedFlash=true;ctx.fillStyle='#1d4b3c';ctx.fillRect(row*320,205,320,195);ctx.fillStyle='#f4e9ff';ctx.fillText(fps+' HZ · REDUCED FLASH',row*320+18,230);
  const stable=document.createElement('canvas'),s=stable.getContext('2d');stable.width=320;stable.height=190;
  s.translate(110,100);s.scale(.72,.72);r.time=0;r.drawTeleportTrail(s,preview,true);const first=stable.toDataURL();s.clearRect(-200,-140,800,500);r.time=5;r.drawTeleportTrail(s,preview,true);if(first!==stable.toDataURL())throw Error('Reduced-flash trail changed with renderer time');
  ctx.save();ctx.translate(row*320+90,310);ctx.scale(.72,.72);r.drawTeleportTrail(ctx,preview,true);ctx.restore();g.options.reducedFlash=false;
  let elapsed=0,frames=0;while(p.teleportTrail&&elapsed<.6){g.updateTeleportTrail(p,1/fps);elapsed+=1/fps;frames++;}
  if(p.teleportTrail!==null||r.drawTeleportTrail(ctx,p.teleportTrail,false)!==false)throw Error('Teleport cue did not disappear after recovery');
  const expected=Math.ceil(.42*fps-1e-9)/fps;if(Math.abs(elapsed-expected)>1e-9)throw Error('Refresh-rate lifecycle drift '+fps+' '+elapsed);
  p.teleportTrail={fromX:500,fromY:350,toX:585,toY:350,remaining:.42,duration:.42};p.magicReadyAt=0;p.src.magicTrick='ice';
  g.tryMagicTrick(p);if(p.teleportTrail!==null||r.drawTeleportTrail(ctx,p.teleportTrail,false)!==false)throw Error('Teleport VFX leaked into another Trick');
  results.push({fps,frames,elapsed:+elapsed.toFixed(4),distance:Math.hypot(e.toX-e.fromX,e.toY-e.fromY),recovered:true,noCrossTrickLeak:true,reducedFlashSteady:true});
 }
 return {results,canvas:canvas.width+'x'+canvas.height};
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind,mobile in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':720 if not mobile else 390},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
  result=page.evaluate(SCRIPT);assert len(result['results'])==3,result
  assert not errors,errors
  if not mobile:page.locator('#tr18-canvas').screenshot(path=str(ROOT/'tests/.generated/tr18_teleport_trail_canvas.png'))
  print('TR18_TELEPORT_TRAIL_BROWSER_PASS',kind,result,flush=True);context.close()
 browser.close()
