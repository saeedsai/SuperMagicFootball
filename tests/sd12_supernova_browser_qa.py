"""SD12: exercise Supernova's real renderer and timed lifecycle in Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
SCRIPT=r"""() => {
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;
 if(!g||!r||typeof r.drawSupernova!=='function')throw Error('Supernova Canvas renderer unavailable');
 const canvas=document.createElement('canvas');canvas.id='sd12-supernova-gallery';canvas.width=960;canvas.height=1280;
 canvas.style.cssText='display:block;position:fixed;z-index:999999;left:10px;top:10px;width:960px;height:1280px;border:2px solid white';document.body.appendChild(canvas);
 const ctx=canvas.getContext('2d'),results=[],fpsList=[30,60,120],sides=[0,1];
 function panel(x,y,label){ctx.fillStyle='#183e34';ctx.fillRect(x,y,320,320);ctx.fillStyle='#f4f1db';ctx.font='900 16px Arial';ctx.fillText(label,x+14,y+24);}
 function renderNova(x,y,nova,reduced){ctx.save();ctx.translate(x+160,y+174);r.drawSupernova(ctx,{...nova,x:0,y:0},reduced);ctx.restore();}
 function coloredPixels(x,y,w,h){const d=ctx.getImageData(x,y,w,h).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>150&&d[i+2]>150)n++;return n;}
 for(const [sideIndex,side] of sides.entries())for(const [rateIndex,fps] of fpsList.entries()){
  g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,reducedFlash:false}});
  const p=g.players.find(v=>v.t===side&&!v.keeper&&v.src.role==='DF');if(!p)throw Error('Missing defending outfielder for side '+side);
  g.players=[p];p.src={...p.src,role:'DF',superDefenceLevel:2,superAbility:{type:'defence',id:'supernova',level:2,name:'Supernova'}};
  Object.assign(p,{keeper:false,stun:0,abilityCd:0,fatigue:0,x:640,y:360,face:side===0?1:-1});g.ball.owner=null;g.supernova=null;
  if(!g.activateDefence(p))throw Error('Supernova activation failed for side '+side);
  const nova=g.supernova;if(nova.radius!==142||nova.remaining!==.85||nova.telegraph!==.85)throw Error('Supernova gameplay envelope changed');
  const col=rateIndex*320,row=sideIndex*640;
  panel(col,row,`SIDE ${side+1} · ${fps} HZ · TELEGRAPH`);
  const steps=Math.max(1,Math.round(fps*.32));for(let i=0;i<steps;i++)g.updateSupernova(1/fps);
  const live=g.supernova;if(!live||live.remaining<=0)throw Error('Telegraph vanished before resolve');
  renderNova(col,row,live,false);
  if(coloredPixels(col+15,row+30,290,285)<120)throw Error('Full-radius Supernova warning is not readable');
  const edge=coloredPixels(col+14,row+166,8,16)+coloredPixels(col+298,row+166,8,16);
  if(edge<8)throw Error('Canvas is missing full-radius edge marks');
  panel(col,row+320,`SIDE ${side+1} · ${fps} HZ · REDUCED FLASH`);
  g.options.reducedFlash=true;renderNova(col,row+320,live,true);
  const stable=document.createElement('canvas');stable.width=320;stable.height=320;const sc=stable.getContext('2d');
  sc.fillStyle='#183e34';sc.fillRect(0,0,320,320);sc.translate(160,174);r.time=0;r.drawSupernova(sc,{...live,x:0,y:0},true);const first=stable.toDataURL();
  sc.setTransform(1,0,0,1,0,0);sc.fillStyle='#183e34';sc.fillRect(0,0,320,320);sc.translate(160,174);r.time=5;r.drawSupernova(sc,{...live,x:0,y:0},true);if(first!==stable.toDataURL())throw Error('Reduced-flash Supernova tell is animated');
  const target={...p,t:1-side,x:p.x+(side===0?90:-90),y:p.y,z:0,keeper:false,stun:0,action:'idle',actionTimer:0,src:{name:'Nova target'}};g.players=[p,target];
  g.flash=0;g.shake=0;let elapsed=steps/fps,frames=steps;while(g.supernova&&frames<fps*2){g.updateSupernova(1/fps);elapsed+=1/fps;frames++;}
  if(g.supernova!==null||target.stun<=0)throw Error('Telegraph did not resolve into gameplay at '+fps+' Hz, side '+side);
  if(g.options.reducedFlash&&(g.flash!==0||g.shake!==0))throw Error('Reduced-flash resolution produced screen flash/shake');
  const recovery=document.createElement('canvas');recovery.width=320;recovery.height=320;const rc=recovery.getContext('2d');rc.fillStyle='#183e34';rc.fillRect(0,0,320,320);r.drawSupernova(rc,g.supernova,true);if(coloredPixelsCtx(rc,0,0,320,320)!==0)throw Error('Expired Supernova left a stale visual');
  g.options.reducedFlash=false;results.push({side,fps,frames,elapsed:+elapsed.toFixed(4),radius:nova.radius,resolved:true,recovered:true,reducedFlashSteady:true});
 }
 const controls=document.querySelectorAll('#touchButtons button[data-act]').length;if(controls!==4)throw Error('Expected four existing actions; found '+controls);
 return {results,controls,canvas:'960x1280',radiusChecks:6};
 function coloredPixelsCtx(c,x,y,w,h){const d=c.getImageData(x,y,w,h).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>150&&d[i+2]>150)n++;return n;}
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind,mobile in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':900 if not mobile else 720},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.renderer',timeout=30000)
  result=page.evaluate(SCRIPT);assert len(result['results'])==6 and result['controls']==4,result
  assert not errors,errors
  if not mobile:page.locator('#sd12-supernova-gallery').screenshot(path=str(ROOT/'tests/.generated/sd12_supernova_gallery.png'))
  print('SD12_SUPERNOVA_BROWSER_PASS',kind,result,flush=True);context.close()
 browser.close()
