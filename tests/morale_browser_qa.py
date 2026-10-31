from menu_test_routes import open_quick,open_settings
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,mobile in [('desktop',{'width':1440,'height':900},False),('mobile',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("!!window.SupermagicFootball?.game")
  assert page.locator('h1').first.inner_text().upper().find('SUPERMAGIC')>=0,errors
  open_quick(page)
  page.locator('[data-action="setupAppearance"]').click()
  assert page.locator('#preTalkHome option').count()==5
  page.locator('#preTalkHome').select_option('joke')
  page.locator('#preTalkAway').select_option('focus')
  page.screenshot(path=str(root/'tests'/f'morale_setup_{device}.png'))
  page.locator('[data-action="returnSetup"]').last.click()
  page.locator('[data-action="kickoff"]').click()
  assert page.evaluate('SupermagicFootball.game.talksUsed[0].pregame')
  assert page.evaluate('SupermagicFootball.game.talksUsed[1].pregame')
  assert page.evaluate('SupermagicFootball.game.teamMorale(0)')!=55
  assert page.locator('#playerTag').inner_text().find('%')!=-1
  page.evaluate("""()=>{let g=SupermagicFootball.game;g.clock=g.matchSeconds+0.1;g.matchState='play';g.update(.016)}""")
  assert page.locator('#halfTalkHome option').count()==5,errors
  assert page.locator('[data-action="talkHalfHome"]').count()==1
  page.screenshot(path=str(root/'tests'/f'morale_halftime_{device}.png'))
  page.locator('#halfTalkHome').select_option('challenge')
  page.locator('[data-action="talkHalfHome"]').click()
  assert page.evaluate('SupermagicFootball.game.talksUsed[0].halftime')
  assert page.locator('[data-action="talkHalfHome"]').count()==0
  page.locator('[data-action="resume"]').click()
  assert page.evaluate('SupermagicFootball.game.matchState')=='play'
  # Force an actual physics goal and keep game on screen while crying players are rendered.
  page.evaluate("""()=>{let g=SupermagicFootball.game;g.ball.owner=null;g.ball.x=3498;g.ball.y=765;g.ball.z=0;g.ball.canCollect=0;g.updateBall(.016)}""")
  assert page.evaluate('SupermagicFootball.game.celebration>0')
  assert page.evaluate('SupermagicFootball.game.player(1,1).action')=='cry'
  page.screenshot(path=str(root/'tests'/f'morale_goal_{device}.png'))
  assert errors==[],errors
  print(device,'PASS setup talk; halftime talk; no duplicate; match resume; goal and crying; no page errors')
  ctx.close()
 browser.close()
