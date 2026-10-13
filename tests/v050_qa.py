from pathlib import Path
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h,ismobile in [(1440,900,False),(844,390,True)]:
  c=browser.new_context(viewport={'width':w,'height':h},is_mobile=ismobile,has_touch=ismobile)
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((p/'play.html').read_text(),wait_until='load');page.wait_for_timeout(450)
  assert page.evaluate('NekketsuHD.teams.length')==83,errors
  assert page.evaluate('NekketsuHD.teams.filter(t=>t.group==="national26").length')==32
  assert page.evaluate('NekketsuHD.teams.filter(t=>t.group==="club26").length')==32
  assert page.evaluate('NekketsuHD.teams.filter(t=>t.group==="legends").length')==6
  assert page.evaluate('NekketsuHD.teams.every(t=>NekketsuHD.rosterFor(t.index).length===12)')
  # manager hub, transfer market, 12 player team, training, league match
  page.locator('[data-action="manager"]').first.click()
  assert page.locator('#managerClub').count()==1
  page.locator('[data-action="startManager"]').click()
  assert page.locator('[data-action="careerPlay"]').count()==1
  page.screenshot(path=str(p/'tests'/('manager_mobile.png' if ismobile else 'manager.png')))
  page.on('dialog',lambda d:d.accept())
  page.locator('[data-action="careerMarket"]').click()
  page.locator('[data-action="careerBuy"]').click()
  page.locator('[data-action="manager"]').first.click()
  page.locator('[data-action="careerSquad"]').click()
  assert page.locator('.squadEntry').count()==12
  page.locator('[data-train="0"]').click()
  page.locator('[data-action="editPlayer0"]').click()
  page.locator('#face_style').select_option('12')
  page.screenshot(path=str(p/'tests'/('customizer_mobile.png' if ismobile else 'customizer.png')))
  page.locator('[data-action="saveAppearance"]').click()
  assert page.locator('.squadEntry').count()==12
  page.locator('[data-action="manager"]').first.click()
  page.locator('[data-action="careerPlay"]').click()
  assert page.locator('#hud').is_visible()
  ctx=page.evaluate('''()=>{let g=NekketsuHD.game;g.ball.owner=null;g.ball.x=3137;g.ball.y=680;g.ball.z=0;g.ball.vx=200;g.ball.vy=0;g.ball.canCollect=0;g.updateBall(.016);return {goal:g.score[0],celebration:g.celebration}}''')
  assert ctx['goal']>=1 and ctx['celebration']>0,ctx
  # Keep scrolling sim
  page.screenshot(path=str(p/'tests'/('goal_mobile.png' if ismobile else 'goal.png')))
  page.evaluate('''()=>{let g=NekketsuHD.game;g.celebration=0.0001;g.update(.04)}''')
  assert page.evaluate('NekketsuHD.game.pendingKickoff===null')
  page.evaluate('''()=>{let g=NekketsuHD.game;g.score=[2,1];g.clock=g.matchSeconds-0.05;g.half=2;g.matchState='play';g.update(.08)}''')
  print('end-game',ismobile,page.evaluate('NekketsuHD.game.matchState'),page.evaluate('NekketsuHD.getCareer().week'),page.locator('#menu').inner_text()[:180],errors);page.wait_for_function('NekketsuHD.getCareer().week >= 1',timeout=5000)
  assert page.evaluate('NekketsuHD.getCareer().week')==1
  assert page.evaluate('NekketsuHD.getCareer().roster.length')==12
  assert errors==[],errors
  print('v0.5', 'mobile' if ismobile else 'desktop','QA PASS')
  c.close()
 browser.close()
