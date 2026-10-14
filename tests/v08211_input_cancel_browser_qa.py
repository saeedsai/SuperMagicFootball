"""Desktop and simulated-touch regression against the packaged v0.8.22 game.
Tests real browser input event handlers; physical devices are outside this coverage.
"""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parents[1]/'play.html').read_text()
with sync_playwright() as pw:
 for mode,touch in [('Desktop Chromium',False),('Simulated Android',True)]:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  context=browser.new_context(viewport={'width':1360,'height':800} if not touch else {'width':720,'height':400},is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load');page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=20000)
  result=page.evaluate('''() => {
   const {game:g,input:i}=SupermagicFootball;
   g.init({home:0,away:9,options:{...g.options,weather:'Clear'}});
   g.cooldown=0;g.autoSwitch=()=>false;g.driveAI=()=>{};
   const p=g.player(0,3);g.take(p);p.x=1500;p.y=765;p.cd=0;
   for(const q of g.players)if(q!==p){q.x=q.t?3300:330;q.y=1100;}
   const dispatch=(el,type,pointerId)=>el.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId,isPrimary:true}));
   const shoot=document.querySelector('[data-act="shoot"]');
   dispatch(shoot,'pointerdown',88);i.poll();g.updatePlayers(.08);
   const charging=p.charge>0;
   dispatch(shoot,'pointercancel',88);i.poll();
   const canceled=i.canceled(0,'shoot');g.updatePlayers(.016);
   const noGhost=p.charge===0&&g.ball.owner===p&&!g.events.some(e=>e.type==='kick');
   const pass=document.querySelector('[data-act="pass"]');
   dispatch(pass,'pointerdown',89);i.poll();g.updatePlayers(.08);
   const heldPass=p.passHold>0;
   dispatch(pass,'lostpointercapture',89);i.poll();g.updatePlayers(.016);
   const noGhostPass=p.passHold===0&&g.ball.owner===p;
   const key=(type,code)=>window.dispatchEvent(new KeyboardEvent(type,{bubbles:true,code,key:code}));
   key('keydown','KeyK');i.poll();
   dispatch(pass,'pointerdown',90);i.poll();
   dispatch(pass,'pointerup',90);i.poll();
   const stillHeld=i.held(0,'pass')&&!i.released(0,'pass');
   key('keyup','KeyK');i.poll();const released=i.released(0,'pass');
   return {charging,canceled,noGhost,heldPass,noGhostPass,stillHeld,released,actions:[...document.querySelectorAll('[data-act]')].map(b=>b.dataset.act).sort()};
  }''')
  assert all(result[k] for k in ['charging','canceled','noGhost','heldPass','noGhostPass','stillHeld','released']),result
  assert result['actions']==['dribble','jump','pass','shoot'],result
  assert not errors,errors
  print('PASS',mode,': canceled held Shoot/Pass, mixed source release, four action buttons',flush=True)
  context.close();browser.close()
