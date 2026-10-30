from menu_test_routes import open_quick,open_settings,open_feature
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,viewport,mobile in [('desktop',{'width':1440,'height':900},False),('mobile',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();issues=[]
  page.on('pageerror',lambda e:issues.append(str(e)))
  page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function('window.NekketsuHD?.version==="0.8.24.12-alpha"')
  open_feature(page,'squad')
  assert 'STA' in page.locator('.rosterCard').first.inner_text(), 'Squad must display stamina'
  assert 'GK DIVING' in page.locator('.roster').inner_text(),'Goalkeeper jump must be on roster'
  page.screenshot(path=str(root/'tests'/f'stats_roster_{name}.png'))
  # The Squad screen's Back now goes through its real parents, not directly Home.
  page.locator('[data-action="navCustomization"]').first.click()
  assert page.locator('.navScreen .heading').inner_text()=='PLAYER & TEAM CUSTOMIZATION', (name,'customization parent')
  page.locator('[data-action="navSettings"]').first.click()
  assert page.locator('.navScreen .heading').inner_text()=='SETTINGS', (name,'settings parent')
  page.locator('[data-action="home"]').first.click()
  open_quick(page)
  page.locator('[data-action="kickoff"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert page.locator('#staminaHud').is_visible()
  assert page.locator('#staminaText').inner_text().startswith('ENERGY')
  # Advance a focused synthetic activity simulation without waiting for real time.
  page.evaluate("""() => {const g=NekketsuHD.game,p=g.controlledPlayer(0);g.staminaTick(p,65,1);return p.fatigue;}""")
  page.wait_for_timeout(120)
  pct=page.locator('#staminaText').inner_text()
  assert pct!='ENERGY 100%',f'Energy HUD did not change: {pct}'
  page.screenshot(path=str(root/'tests'/f'stats_match_{name}.png'))
  page.locator('#pauseBtn').click(force=True)
  assert page.evaluate('NekketsuHD.game.matchState')=='paused'
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert not issues,issues
  print(f'Player stats browser {name}: PASS • squad ratings • GK attributes • live Energy HUD • pause/resume')
  ctx.close()
 browser.close()
