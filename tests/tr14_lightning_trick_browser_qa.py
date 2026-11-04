"""TR14 Lightning: real runtime tier gate, windup, counter window and Canvas QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
SCRIPT=r"""() => {
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;if(!g||!r||typeof r.drawLightningTrick!=='function')throw Error('Lightning Canvas cue unavailable');
 const canvas=document.createElement('canvas');canvas.id='tr14-lightning-gallery';canvas.width=960;canvas.height=1920;
 canvas.style.cssText='display:block;position:fixed;z-index:999999;left:10px;top:10px;width:960px;height:1920px;border:2px solid white';document.body.appendChild(canvas);
 const ctx=canvas.getContext('2d'),rates=[30,60,120],results=[];
 function panel(x,y,label){ctx.fillStyle='#173d34';ctx.fillRect(x,y,320,320);ctx.fillStyle='#f7f0d7';ctx.font='900 16px Arial';ctx.fillText(label,x+14,y+24);}
 function pixels(c){const d=c.getImageData(0,0,c.canvas.width,c.canvas.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>170&&d[i+1]>120&&d[i+2]<210)n++;return n;}
 for(const [side,sign] of [[0,1],[1,-1]])for(const [index,fps] of rates.entries()){
  g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,reducedFlash:false}});
  const p=g.players.find(v=>v.t===side&&!v.keeper),q=g.players.find(v=>v.t!==side&&!v.keeper);if(!p||!q)throw Error('Missing Lightning participants');
  p.src={...p.src,role:'FW',magicTrick:'lightning',statsVerified:true};for(const key of ['shootAccuracy','shootPower','dribbling','speedRating','agility','heading'])p.src[key]=85;
  Object.assign(p,{x:640,y:360,dx:sign,dy:0,face:sign,z:0,keeper:false,stun:0,fatigue:.2,magicReadyAt:0,lightningPending:null});
  Object.assign(q,{x:p.x+sign*50,y:p.y,face:-sign,dx:0,dy:0,z:0,stun:0,keeper:false,action:'idle',actionTimer:0,lightningMark:0,lightningFx:0,src:{...q.src,defence:20}});
  g.players=[p,q];g.ball.owner=p;
  if(!g.tryMagicTrick(p))throw Error('Verified Gold+ Lightning activation rejected');
  if(g.ball.owner!==p||p.magicReadyAt!==g.clock+6||Math.abs(p.fatigue-.245)>1e-9||q.stun!==0||q.lightningMark!==.32)throw Error('Lightning windup, possession or cost/cooldown contract changed');
  const x=index*320,y=side*960;panel(x,y,`SIDE ${side+1} · ${fps} HZ · TARGET WARNING`);
  ctx.save();ctx.translate(x+160,y+165);if(!r.drawLightningTrick(ctx,q.lightningMark,'warning',false))throw Error('Warning cue was not drawn');ctx.restore();if(pixels(ctx)<100)throw Error('Lightning target warning is not readable');
  panel(x,y+320,`SIDE ${side+1} · ${fps} HZ · REDUCED FLASH`);ctx.save();ctx.translate(x+160,y+485);r.drawLightningTrick(ctx,q.lightningMark,'warning',true);ctx.restore();
  const stable=document.createElement('canvas');stable.width=180;stable.height=180;const sc=stable.getContext('2d');sc.translate(90,90);r.time=0;r.drawLightningTrick(sc,q.lightningMark,'warning',true);const first=stable.toDataURL();sc.setTransform(1,0,0,1,0,0);sc.clearRect(0,0,180,180);sc.translate(90,90);r.time=5;r.drawLightningTrick(sc,q.lightningMark,'warning',true);if(first!==stable.toDataURL())throw Error('Reduced-flash Lightning warning animated');
  let frames=0;while(p.lightningPending&&p.lightningPending.remaining>1e-9&&frames<fps){g.updateLightningTrick(p,1/fps,true);g.updateLightningTrick(q,1/fps,true);frames++;}
  if(!p.lightningPending||frames!==Math.ceil(.32*fps-1e-9))throw Error('Lightning windup timing drift at '+fps+' Hz');
  g.resolveLightningTrick(p);if(p.lightningPending!==null||q.stun!==.32||q.lightningFx!==.32||g.ball.owner!==p)throw Error('Lightning did not resolve into bounded target effect');
  panel(x,y+640,`SIDE ${side+1} · ${fps} HZ · RESOLVE`);ctx.save();ctx.translate(x+160,y+805);if(!r.drawLightningTrick(ctx,q.lightningFx,'strike',true))throw Error('Lightning strike cue missing');ctx.restore();if(pixels(ctx)<80)throw Error('Lightning impact is not visible');
  for(let i=0;i<fps;i++)g.updateLightningTrick(q,1/fps,false);if(q.lightningFx!==0)throw Error('Lightning impact cue did not recover');
  const recovery=document.createElement('canvas');recovery.width=180;recovery.height=180;const rc=recovery.getContext('2d');if(r.drawLightningTrick(rc,q.lightningFx,'strike',true)!==false||pixels(rc)!==0)throw Error('Lightning impact cue remained after expiry');
  results.push({side,fps,frames,expectedFrames:Math.ceil(.32*fps-1e-9),retainedPossession:true,stun:q.stun,cooldown:6,cost:.045,targetRecovered:true,steadyReduced:true});
 }
 const controls=document.querySelectorAll('#touchButtons button[data-act]').length;if(controls!==4)throw Error('Expected four existing actions; got '+controls);
 return{results,controls,canvas:'960x1920'};
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind,mobile in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':850 if not mobile else 700},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.renderer',timeout=30000)
  result=page.evaluate(SCRIPT);assert len(result['results'])==6 and result['controls']==4,result
  assert not errors,errors
  if not mobile:page.locator('#tr14-lightning-gallery').screenshot(path=str(ROOT/'tests/.generated/tr14_lightning_gallery.png'))
  print('TR14_LIGHTNING_BROWSER_PASS',kind,result,flush=True);context.close()
 browser.close()
