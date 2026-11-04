"""TR14: live Canvas Spin Bump tell lifecycle and reduced-flash browser QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
SCRIPT=r"""() => {
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;if(!g||!r||typeof r.drawSpinBump!=='function')throw Error('Spin Bump Canvas renderer unavailable');
 const canvas=document.createElement('canvas');canvas.id='tr14-spin-bump-gallery';canvas.width=960;canvas.height=1280;
 canvas.style.cssText='display:block;position:fixed;z-index:999999;left:10px;top:10px;width:960px;height:1280px;border:2px solid white';document.body.appendChild(canvas);
 const ctx=canvas.getContext('2d'),fpsList=[30,60,120],results=[];
 function panel(x,y,label){ctx.fillStyle='#174333';ctx.fillRect(x,y,320,320);ctx.fillStyle='#f7f0d7';ctx.font='900 16px Arial';ctx.fillText(label,x+14,y+24);}
 function colored(c){const d=c.getImageData(0,0,c.canvas.width,c.canvas.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>180&&d[i+1]>130&&d[i+2]<180)n++;return n;}
 for(const [side,sign] of [[0,1],[1,-1]])for(const [index,fps] of fpsList.entries()){
  g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,reducedFlash:false}});
  const p=g.players.find(v=>v.t===side&&!v.keeper);if(!p)throw Error('Missing caster on side '+side);
  // Synthetic, verified DF: the canonical six DF OVR attributes average to
  // Gold. Keep the real runtime Gold+ check intact; this fixture only meets it.
  const dfStats={defence:85,strength:85,aggression:85,speedRating:85,heading:85,stamina:85};
  p.src={...p.src,...dfStats,role:'DF',statsVerified:true,magicTrick:'spinBump',dribbling:65};
  const canonicalDf=['defence','strength','aggression','speedRating','heading','stamina'];
  const verifiedDf= p.src.role==='DF'&&p.src.statsVerified===true&&canonicalDf.every(key=>Number.isFinite(p.src[key])&&p.src[key]>=1&&p.src[key]<=100);
  const verifiedDfOvr=Math.round(canonicalDf.reduce((sum,key)=>sum+p.src[key],0)/canonicalDf.length);
  if(!verifiedDf||verifiedDfOvr<80||verifiedDfOvr>90)throw Error('Spin Bump test DF is not verified Gold-eligible '+JSON.stringify({verifiedDf,verifiedDfOvr}));
  Object.assign(p,{x:640,y:360,dx:sign,dy:0,face:sign,z:0,keeper:false,stun:0,fatigue:.2,magicReadyAt:0,spinBumpFx:0});
  const q=g.players.find(v=>v.t!==side&&!v.keeper);Object.assign(q,{x:p.x+sign*40,y:p.y,face:-sign,dx:-sign,dy:0,z:0,stun:0,action:'idle',actionTimer:0,src:{...q.src,defence:30}});
  g.players=[p,q];g.ball.owner=p;
  if(!g.tryMagicTrick(p))throw Error('Spin Bump activation failed, side '+side);
  if(g.ball.owner!==p||p.magicReadyAt!==g.clock+6||Math.abs(p.fatigue-.245)>1e-9||q.stun!==.38)throw Error('Spin Bump gameplay envelope changed');
  const col=index*320,row=side*640;
  panel(col,row,`SIDE ${side+1} · ${fps} HZ · SPIN BUMP`);
  ctx.save();ctx.translate(col+160,row+164);if(!r.drawSpinBump(ctx,p.spinBumpFx,false))throw Error('Active Canvas tell did not draw');ctx.restore();
  if(colored(ctx)<100)throw Error('Spin Bump ring/arc not visibly readable');
  panel(col,row+320,`SIDE ${side+1} · ${fps} HZ · REDUCED FLASH`);
  ctx.save();ctx.translate(col+160,row+484);r.drawSpinBump(ctx,p.spinBumpFx,true);ctx.restore();
  const steady=document.createElement('canvas');steady.width=240;steady.height=240;const sc=steady.getContext('2d');sc.translate(120,120);r.time=0;r.drawSpinBump(sc,p.spinBumpFx,true);const first=steady.toDataURL();sc.setTransform(1,0,0,1,0,0);sc.clearRect(0,0,240,240);sc.translate(120,120);r.time=5;r.drawSpinBump(sc,p.spinBumpFx,true);if(first!==steady.toDataURL())throw Error('Reduced-flash spin tell changes with renderer time');
  let frames=0;while(p.spinBumpFx>0&&frames<fps){g.updateSpinBumpFx(p,1/fps);frames++;}
  const expected=Math.ceil(.38*fps-1e-9);if(p.spinBumpFx!==0||frames!==expected)throw Error('Spin Bump cue expiry drifts at '+fps+' Hz: '+frames);
  const recovery=document.createElement('canvas');recovery.width=180;recovery.height=180;const rc=recovery.getContext('2d');if(r.drawSpinBump(rc,p.spinBumpFx,true)!==false||colored(rc)!==0)throw Error('Spin Bump cue remained after expiry');
  results.push({side,fps,frames,expected,retainedPossession:g.ball.owner===p,stun:q.stun,cooldown:p.magicReadyAt-g.clock,cost:+(p.fatigue-.2).toFixed(3),steadyReduced:true,recovered:true});
 }
 const controls=document.querySelectorAll('#touchButtons button[data-act]').length;if(controls!==4)throw Error('Expected four existing actions; got '+controls);
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
  if not mobile:page.locator('#tr14-spin-bump-gallery').screenshot(path=str(ROOT/'tests/.generated/tr14_spin_bump_gallery.png'))
  print('TR14_SPIN_BUMP_BROWSER_PASS',kind,result,flush=True);context.close()
 browser.close()
