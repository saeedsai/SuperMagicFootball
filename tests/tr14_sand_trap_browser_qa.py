"""TR14 Sand Trap: actual runtime tier gate, Canvas cue lifecycle and device layout QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
SCRIPT=r"""() => {
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;if(!g||!r||typeof r.drawSandTrap!=='function')throw Error('Sand Trap renderer unavailable');
 const canvas=document.createElement('canvas');canvas.id='tr14-sand-trap-gallery';canvas.width=960;canvas.height=1280;
 canvas.style.cssText='display:block;position:fixed;z-index:999999;left:10px;top:10px;width:960px;height:1280px;border:2px solid white';document.body.appendChild(canvas);
 const ctx=canvas.getContext('2d'),rates=[30,60,120],results=[];
 function panel(x,y,label){ctx.fillStyle='#174333';ctx.fillRect(x,y,320,320);ctx.fillStyle='#f7f0d7';ctx.font='900 16px Arial';ctx.fillText(label,x+14,y+24);}
 function pixels(c){const d=c.getImageData(0,0,c.canvas.width,c.canvas.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>145&&d[i+1]>85&&d[i]<230)n++;return n;}
 for(const [side,sign] of [[0,1],[1,-1]])for(const [index,fps] of rates.entries()){
  g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,reducedFlash:false}});
  const p=g.players.find(v=>v.t===side&&!v.keeper);if(!p)throw Error('Missing Sand Trap carrier');
  p.src={...p.src,role:'FW',magicTrick:'sandTrap',statsVerified:false};for(const key of ['shootAccuracy','shootPower','dribbling','speedRating','agility','heading'])p.src[key]=85;
  Object.assign(p,{x:640,y:360,dx:sign,dy:0,face:sign,z:0,keeper:false,stun:0,fatigue:.2,magicReadyAt:0});
  const q=g.players.find(v=>v.t!==side&&!v.keeper);Object.assign(q,{x:p.x+sign*40,y:p.y,face:-sign,dx:-sign,dy:0,z:0,stun:0,action:'idle',actionTimer:0});
  g.players=[p,q];g.ball.owner=p;
  if(g.tryMagicTrick(p)!==false||g.ball.owner!==p||p.magicReadyAt!==0)throw Error('Unverified player did not fail closed');
  p.src.statsVerified=true;
  if(!g.tryMagicTrick(p))throw Error('Verified Gold+ Sand Trap activation rejected');
  if(g.ball.owner!==p||p.magicReadyAt!==g.clock+6||Math.abs(p.fatigue-.245)>1e-9||q.stun!==.38||q.sandTrapFx!==.38)throw Error('Sand Trap runtime bounds or possession changed');
  const x=index*320,y=side*640;panel(x,y,`SIDE ${side+1} · ${fps} HZ · SAND TRAP`);
  ctx.save();ctx.translate(x+160,y+165);if(!r.drawSandTrap(ctx,q.sandTrapFx,false))throw Error('Missing active Sand Trap Canvas cue');ctx.restore();
  if(pixels(ctx)<100)throw Error('Sand ring and ground marking are not visible');
  panel(x,y+320,`SIDE ${side+1} · ${fps} HZ · REDUCED FLASH`);ctx.save();ctx.translate(x+160,y+485);r.drawSandTrap(ctx,q.sandTrapFx,true);ctx.restore();
  const stable=document.createElement('canvas');stable.width=180;stable.height=180;const sc=stable.getContext('2d');sc.translate(90,90);r.time=0;r.drawSandTrap(sc,q.sandTrapFx,true);const first=stable.toDataURL();sc.setTransform(1,0,0,1,0,0);sc.clearRect(0,0,180,180);sc.translate(90,90);r.time=5;r.drawSandTrap(sc,q.sandTrapFx,true);if(first!==stable.toDataURL())throw Error('Reduced-flash Sand Trap cue animated');
  let frames=0;while(q.sandTrapFx>0&&frames<fps){g.updateSandTrapFx(q,1/fps);frames++;}
  const expected=Math.ceil(.38*fps-1e-9);if(q.sandTrapFx!==0||frames!==expected)throw Error('Trap cue recovery mismatch at '+fps+' Hz');
  const recovery=document.createElement('canvas');recovery.width=160;recovery.height=120;const rc=recovery.getContext('2d');if(r.drawSandTrap(rc,q.sandTrapFx,true)!==false||pixels(rc)!==0)throw Error('Sand Trap cue persisted after expiry');
  results.push({side,fps,frames,expected,verifiedGate:true,retainedPossession:true,stun:q.stun,cooldown:6,cost:.045,recovered:true,steadyReduced:true});
 }
 const controls=document.querySelectorAll('#touchButtons button[data-act]').length;if(controls!==4)throw Error('Expected four actions; got '+controls);
 return{results,controls,canvas:'960x1280'};
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind,mobile in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':850 if not mobile else 700},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.renderer',timeout=30000)
  result=page.evaluate(SCRIPT);assert len(result['results'])==6 and result['controls']==4,result
  assert not errors,errors
  if not mobile:page.locator('#tr14-sand-trap-gallery').screenshot(path=str(ROOT/'tests/.generated/tr14_sand_trap_gallery.png'))
  print('TR14_SAND_TRAP_BROWSER_PASS',kind,result,flush=True);context.close()
 browser.close()
