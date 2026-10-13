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
  page.wait_for_function('window.NekketsuHD?.version==="0.8.17.1-alpha"')
  page.locator('[data-action="squad"]').first.click()
  assert 'STA' in page.locator('.rosterCard').first.inner_text(), 'Squad must display stamina'
  assert 'GK JUMP' in page.locator('.roster').inner_text(),'Goalkeeper jump must be on roster'
  page.screenshot(path=str(root/'tests'/f'stats_roster_{name}.png'))
  page.locator('[data-action="home"]').first.click()
  page.locator('[data-action="quick"]').first.click()
  page.locator('[data-action="kickoff"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert page.locator('#staminaHud').is_visible()
  assert page.locator('#staminaText').inner_text().startswith('STAMINA')
  # Advance a focused synthetic activity simulation without waiting for real time.
  page.evaluate("""() => {const g=NekketsuHD.game,p=g.controlledPlayer(0);g.staminaTick(p,65,1);return p.fatigue;}""")
  page.wait_for_timeout(120)
  pct=page.locator('#staminaText').inner_text()
  assert pct!='STAMINA 100%',f'Stamina HUD did not change: {pct}'
  page.screenshot(path=str(root/'tests'/f'stats_match_{name}.png'))
  page.locator('#pauseBtn').click(force=True)
  assert page.evaluate('NekketsuHD.game.matchState')=='paused'
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert not issues,issues
  print(f'Player stats browser {name}: PASS • squad ratings • GK attributes • live stamina HUD • pause/resume')
  ctx.close()
 browser.close()
