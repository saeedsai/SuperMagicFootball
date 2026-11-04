"""TR15: live Wind/Mud trick runtime, Canvas output and frame-rate recovery QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
SCRIPT=r"""() => {
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;if(!g||!r||typeof r.drawFieldTrick!=='function')throw Error('Wind/Mud Canvas renderer unavailable');
 const canvas=document.createElement('canvas');canvas.id='tr15-wind-mud-gallery';canvas.width=960;canvas.height=2560;
 canvas.style.cssText='display:block;position:fixed;z-index:999999;left:10px;top:10px;width:960px;height:2560px;border:2px solid white';document.body.appendChild(canvas);
 const ctx=canvas.getContext('2d'),rates=[30,60,120],results=[];
 function panel(x,y,label){ctx.fillStyle='#183f35';ctx.fillRect(x,y,320,320);ctx.fillStyle='#f7f0d7';ctx.font='900 16px Arial';ctx.fillText(label,x+14,y+24);}
 function pixels(c){const d=c.getImageData(0,0,c.canvas.width,c.canvas.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>130&&d[i+1]>90&&d[i+2]<205)n++;return n;}
 for(const [side,sign] of [[0,1],[1,-1]])for(const trick of ['wind','mud'])for(const [index,fps] of rates.entries()){
  g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,reducedFlash:false}});
  const p=g.players.find(v=>v.t===side&&!v.keeper),q=g.players.find(v=>v.t!==side&&!v.keeper);if(!p||!q)throw Error('Missing '+trick+' participants');
  p.src={...p.src,role:'FW',magicTrick:trick,statsVerified:true};for(const key of ['shootAccuracy','shootPower','dribbling','speedRating','agility','heading'])p.src[key]=85;
  Object.assign(p,{x:640,y:360,dx:sign,dy:0,face:sign,z:0,keeper:false,stun:0,fatigue:.2,magicReadyAt:0});
  Object.assign(q,{x:p.x+sign*60,y:p.y,face:-sign,dx:0,dy:0,z:0,stun:0,keeper:false,action:'idle',actionTimer:0,windTrickFx:0,mudTrickFx:0,mudSlowTimer:0,src:{...q.src,defence:20}});
  g.players=[p,q];g.ball.owner=p;const baseSpeed=g.playerSpeed(q);
  if(!g.tryMagicTrick(p))throw Error('Verified Gold+ '+trick+' rejected');
  if(g.ball.owner!==p||p.magicReadyAt!==g.clock+6||Math.abs(p.fatigue-.245)>1e-9)throw Error(trick+' possession/cooldown/cost changed');
  const expectedDuration=trick==='wind'?.35:.52,property=trick==='wind'?'windTrickFx':'mudTrickFx';
  if(trick==='wind'){
   if(Math.abs(q.windTrickFx-.35)>1e-9||q.stun!==0||Math.abs(Math.hypot(q.x-(p.x+sign*60),q.y-p.y)-28)>1e-8)throw Error('Wind bounds/push changed');
  }else if(Math.abs(q.mudSlowTimer-.52)>1e-9||Math.abs(g.playerSpeed(q)-baseSpeed*.62)>1e-8||q.stun!==0)throw Error('Mud slow effect or eligibility changed');
  const effectIndex=trick==='wind'?0:2,modeRows=side*1280+effectIndex*320;
  panel(index*320,modeRows,`SIDE ${side+1} · ${fps} HZ · ${trick.toUpperCase()}`);ctx.save();ctx.translate(index*320+160,modeRows+164);if(!r.drawFieldTrick(ctx,trick,q[property],false))throw Error(trick+' cue not drawn');ctx.restore();if(pixels(ctx)<70)throw Error(trick+' cue is not visible');
  const reducedY=modeRows+320;panel(index*320,reducedY,`SIDE ${side+1} · ${fps} HZ · REDUCED FLASH`);ctx.save();ctx.translate(index*320+160,reducedY+164);r.drawFieldTrick(ctx,trick,q[property],true);ctx.restore();
  const stable=document.createElement('canvas');stable.width=180;stable.height=180;const sc=stable.getContext('2d');sc.translate(90,90);r.time=0;r.drawFieldTrick(sc,trick,q[property],true);const first=stable.toDataURL();sc.setTransform(1,0,0,1,0,0);sc.clearRect(0,0,180,180);sc.translate(90,90);r.time=5;r.drawFieldTrick(sc,trick,q[property],true);if(first!==stable.toDataURL())throw Error(trick+' reduced-flash cue animated');
  let frames=0;while(q[property]>0&&frames<fps){g.updateFieldTrickFx(q,1/fps);frames++;}
  const expectedFrames=Math.ceil(expectedDuration*fps-1e-9);if(q[property]!==0||frames!==expectedFrames)throw Error(trick+' cue recovery drift at '+fps+' Hz');
  if(trick==='mud'&&(q.mudSlowTimer!==0||Math.abs(g.playerSpeed(q)-baseSpeed)>1e-8))throw Error('Mud speed failed to recover');
  results.push({side,fps,trick,frames,expectedFrames,retainedPossession:true,cooldown:6,cost:.045,recovered:true,steadyReduced:true});
 }
 const controls=document.querySelectorAll('#touchButtons button[data-act]').length;if(controls!==4)throw Error('Expected four existing actions; got '+controls);
 return{results,controls,canvas:'960x2560'};
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind,mobile in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':850 if not mobile else 700},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.renderer',timeout=30000)
  result=page.evaluate(SCRIPT);assert len(result['results'])==12 and result['controls']==4,result
  assert not errors,errors
  if not mobile:page.locator('#tr15-wind-mud-gallery').screenshot(path=str(ROOT/'tests/.generated/tr15_wind_mud_gallery.png'))
  print('TR15_WIND_MUD_BROWSER_PASS',kind,result,flush=True);context.close()
 browser.close()
