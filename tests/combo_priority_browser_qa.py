"""Real keyboard/CDP touch control chords against the portable browser game."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
setup_js='''()=>{const api=window.SupermagicFootball,g=api.game,i=api.input;g.matchState='paused';g.cooldown=0;g.take(g.player(0,3));g.controlled[0]=3;const p=g.player(0,3);p.z=p.vz=0;p.stun=p.cd=0;p.jumpCount=0;p.jumpTapPending=false;p.jumpHold=0;p.crossChordLatched=false;p.bicycleChordLatched=false;p.passHold=0;p.passUsed=false;p.dribbleTapAt=-10;for(const q of g.players)if(q!==p){q.x=q.t?3060:680;q.y=280+65*q.i;}i.reset();i.keys.clear();i.keyPending?.clear();i.keyReleasePending?.clear();i.touchButtons.clear();i.touchPending?.clear();i.touchReleasePending?.clear();i.touchPointers?.clear();return true;}'''
advance='''()=>{const a=SupermagicFootball;a.input.poll();a.game.updatePlayers(.016);const p=a.game.player(0,3);return {owner:a.game.ball.owner?.i??null,z:p.z,jumpCount:p.jumpCount,vz:a.game.ball.vz,action:p.action,bicycleEvents:a.game.events.filter(e=>e.type==='bicycleShot').length};}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox','--disable-dev-shm-usage'])
 for mode,mobile,view in [('desktop',False,(1366,768)),('android',True,(940,430))]:
  context=browser.new_context(viewport={'width':view[0],'height':view[1]},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.22.1-alpha'")
  page.locator('[data-action="quick"]').first.click();page.locator('[data-action="kickoff"]').first.click()
  assert page.locator('#touchButtons [data-act]').count()==4
  page.evaluate(setup_js)
  if mobile:
   cdp=context.new_cdp_session(page);active={}
   def point(k,id):
    b=page.locator(f'#touchButtons [data-act="{k}"]').bounding_box()
    return {'id':id,'x':b['x']+b['width']*.5,'y':b['y']+b['height']*.5}
   def press(k,id):
    active[id]=point(k,id);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':list(active.values())})
   def release(id):
    active.pop(id,None);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd' if not active else 'touchEnd','touchPoints':list(active.values())})
  else:
   def press(k,id): page.keyboard.down({'pass':'k','jump':'Space','dribble':'i'}[k])
   def release(id): page.keyboard.up({20:'k',21:'Space',22:'i'}[id])
  # PASS pressed BEFORE Jump must NOT cross or launch a teammate.
  press('pass',20);page.evaluate(advance);press('jump',21);r=page.evaluate(advance)
  assert r['owner'] is not None and r['vz']==0,(mode,'Pass-first must not cross',r)
  release(21);release(20);r=page.evaluate(advance)
  assert r['owner'] is None and r['vz']<245,(mode,'Pass-first ordinary Pass on release',r)
  page.evaluate(setup_js)
  # Jump and become airborne before pressing Pass: a CROSS.
  press('jump',21);page.evaluate(advance);release(21);r=page.evaluate(advance)
  assert r['z']>0,(mode,'Jump tap should lift the player',r)
  press('pass',20);r=page.evaluate(advance)
  assert r['owner'] is None and r['vz']>=240 and r['z']>0,(mode,'Jump-first airborne Pass crosses',r)
  release(20);page.evaluate(advance)
  page.evaluate(setup_js)
  press('jump',21);page.evaluate(advance);press('dribble',22);r=page.evaluate(advance)
  assert r['owner'] is None and r['action']=='bicycle' and r['bicycleEvents']==1,(mode,'Jump+Dribble bicycle',r)
  release(21);release(22);page.evaluate(advance)
  assert not errors,(mode,errors)
  page.screenshot(path=str(root/'tests'/f'v08171_combo_{mode}.png'))
  print(mode.upper(),'PASS: Jump-first aerial cross only, Pass-first ordinary Pass, bicycle, no JS errors')
  context.close()
 browser.close()
