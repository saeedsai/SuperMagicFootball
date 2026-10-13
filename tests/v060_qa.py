from pathlib import Path
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h,ismobile in [(1440,900,False),(844,390,True)]:
  ctx=b.new_context(viewport={'width':w,'height':h},is_mobile=ismobile,has_touch=ismobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((p/'play.html').read_text(),wait_until='load');page.wait_for_timeout(450)
  assert page.evaluate('NekketsuHD.teams.length')==216,errors
  assert page.evaluate('NekketsuHD.confederations.length')==6
  page.locator('[data-action="continents"]').first.click()
  assert page.locator('.confedCard').count()==6, page.locator('#menu').inner_text()[:500]
  page.screenshot(path=str(p/'tests'/('continents_mobile.png' if ismobile else 'continents.png')))
  page.locator('[data-action="continentPick_UEFA"]').first.click()
  assert page.locator('#continentClub').count()==1
  assert page.locator('#continentClub option').count()==36
  page.locator('#continentClub').select_option(label='Real Madrid • ESP • 92 OVR') if False else None
  page.screenshot(path=str(p/'tests'/('continent_setup_mobile.png' if ismobile else 'continent_setup.png')))
  page.locator('[data-action="continentStart"]').click()
  assert page.evaluate('NekketsuHD.getContinental().compId')=='UEFA',errors
  assert page.locator('[data-action="continentKickoff"]').count()==1, page.locator('#menu').inner_text()[:500]
  page.screenshot(path=str(p/'tests'/('continent_career_mobile.png' if ismobile else 'continent_career.png')))
  page.locator('[data-action="continentKickoff"]').click()
  assert page.locator('#hud').is_visible()
  page.evaluate('''()=>{let g=NekketsuHD.game;g.score=[2,1];g.clock=g.matchSeconds-0.05;g.half=2;g.matchState='play';g.update(.08)}''')
  page.wait_for_function('NekketsuHD.getContinental().history.length===1',timeout=5000)
  assert page.locator('[data-action="continentContinue"]').count()==1
  page.locator('[data-action="continentContinue"]').click()
  assert page.locator('[data-action="continentKickoff"]').count()==1
  assert errors==[],errors
  print('v0.6 Chromium QA', 'mobile' if ismobile else 'desktop','PASS')
  ctx.close()
 b.close()
