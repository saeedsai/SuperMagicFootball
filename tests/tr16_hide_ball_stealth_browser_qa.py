"""TR16 real engine timer/counter and actual Canvas stealth cue QA."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PREVIEW=ROOT/'tests/.generated/tr16_hide_ball_gallery.png'
JS=r"""()=>{
 const api=window.SupermagicFootball,g=api?.game,r=api?.renderer;if(!g||!r?.drawHideBallCue||!r?.drawBall)throw Error('TR16 runtime unavailable');
 const records=[];
 for(const fps of [30,60,120]){
  g.init({home:0,away:9,humans:1,mode:'quick',options:{...g.options,weather:'Clear'}});g.matchState='paused';g.events=[];
  const c=g.player(0,3),d=g.player(1,3);if(!c||!d)throw Error('players unavailable');
  g.players=[c,d];Object.assign(c,{src:{...c.src,magicTrick:'hideBall',dribbling:85},x:700,y:680,face:1,dx:0,dy:0,hideBallTimer:0,hideBallReveal:0,trickGuard:0,fatigue:.1,magicReadyAt:0});
  Object.assign(d,{x:640,y:680,face:1,dx:0,dy:0,z:0,action:'idle',actionTimer:.25,stun:0});
  g.clock=4;g.ball.owner=c;const activated=g.tryMagicTrick(c);if(!activated||c.hideBallTimer!==.65||c.trickGuard!==.65)throw Error('Hide Ball did not start bounded conceal window');
  const starting={timer:c.hideBallTimer,guard:c.trickGuard,owner:g.ball.owner===c};let elapsed=0;
  while(elapsed<.65-1e-12){const dt=Math.min(1/fps,.65-elapsed);g.updateHideBall(c,dt);elapsed+=dt;}
  const end=g.events.filter(e=>e.type==='hideBallReveal');if(c.hideBallTimer!==0||end.length!==1||end[0].reason!=='timeout')throw Error('expiry/reveal failed at '+fps+'Hz');
  records.push({fps,starting,expiry:elapsed,reveal:c.hideBallReveal,events:end.length});
 }
 // Confirm the grounded PASS-poke still cancels the cast and still charges its cooldown and energy.
 g.init({home:0,away:9,humans:1,mode:'quick',options:{...g.options,weather:'Clear'}});g.matchState='paused';g.events=[];
 const caster=g.player(0,3),defender=g.player(1,3);g.players=[caster,defender];Object.assign(caster,{src:{...caster.src,magicTrick:'hideBall',dribbling:85},x:700,y:680,face:1,fatigue:.1,magicReadyAt:0});Object.assign(defender,{x:650,y:680,face:1,z:0,action:'punch',actionTimer:.25,dx:0,dy:0,stun:0});g.clock=4;g.ball.owner=caster;
 const pokeFired=g.tryMagicTrick(caster),counter=g.events.find(e=>e.type==='magicTrick');if(!pokeFired||!counter?.countered||caster.hideBallTimer||caster.trickGuard||caster.magicReadyAt!==10||Math.abs(caster.fatigue-.135)>1e-9)throw Error('PASS-poke/cost contract changed');
 // Render game-scale normal, active and reveal states with and without reduced-flash mode.
 const canvas=document.createElement('canvas');canvas.id='tr16-gallery';canvas.width=960;canvas.height=420;canvas.style='position:fixed;left:10px;top:10px;width:960px;height:420px;z-index:99999';const ctx=canvas.getContext('2d');
 const cases=[
  {name:'VISIBLE BALL',hide:0,reveal:0,reduced:false},
  {name:'STEALTH ACTIVE',hide:.43,reveal:0,reduced:false},
  {name:'STEALTH · REDUCED FLASH',hide:.43,reveal:0,reduced:true},
  {name:'REVEAL RECOVERY',hide:0,reveal:.12,reduced:false}
 ];
 for(let i=0;i<cases.length;i++){
  const q=cases[i],x=i%2*480,y=Math.floor(i/2)*210;ctx.fillStyle='#214a35';ctx.fillRect(x,y,478,208);
  const owner={t:0,x:x+240,y:y+92,hideBallTimer:q.hide,hideBallReveal:q.reveal};
  const view={ball:{x:x+240,y:y+102,z:0,owner:q.hide||q.reveal?owner:null,shot:null,trail:[],rollAngle:0},options:{ballModel:'classic',reducedFlash:q.reduced},getTeam:()=>({primary:'#65cfad',secondary:'#d9fff3'})};
  const p={...owner,x:x+240,y:y+92};r.drawHideBallCue(ctx,owner,view);r.drawBall(ctx,view);
  ctx.fillStyle='#fff';ctx.font='bold 16px system-ui';ctx.fillText(q.name,x+14,y+190);
 }
 document.body.append(canvas);
 return {refreshRates:records,passPoke:{activated:pokeFired,countered:counter.countered,cooldown:caster.magicReadyAt,fatigue:caster.fatigue},canvas:true};
}"""

def main():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  page=browser.new_page(viewport={'width':1280,'height':800})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('file://'+str(ROOT/'tests/.generated/play.html'))
  page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawHideBallCue')
  result=page.evaluate(JS)
  page.locator('#tr16-gallery').screenshot(path=str(PREVIEW))
  if errors:raise AssertionError('Browser errors: '+repr(errors))
  browser.close()
  print(json.dumps({'result':result,'preview':str(PREVIEW),'pageErrors':errors},ensure_ascii=False))
if __name__=='__main__':main()
