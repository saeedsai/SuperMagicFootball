from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,viewport,mobile in [('desktop',{'width':1366,'height':768},False),('mobile',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();issues=[]
  page.on('pageerror',lambda e:issues.append(str(e)))
  page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.NekketsuHD?.version==='0.8.22.1-alpha'")
  assert page.evaluate('NekketsuHD.teams.length')==222
  page.locator('[data-action="squad"]').first.click()
  assert 'AGI' in page.locator('.rosterCard').first.inner_text(), 'Agility must be visible in squad'
  page.locator('[data-action="home"]').first.click()
  page.locator('[data-action="quick"]').first.click()
  assert page.locator('#homeKit').count()==1
  assert page.locator('#awayKit').count()==1
  assert page.locator('#homeKit').input_value()=='home'
  assert page.locator('#awayKit').input_value()=='away'
  before=page.evaluate("document.getElementById('homeKitDot').style.background")
  page.locator('#homeKit').select_option('away')
  assert page.locator('#homeKitCaption').inner_text().endswith('AWAY KIT')
  after=page.evaluate("document.getElementById('homeKitDot').style.background")
  assert before!=after,('Kit preview did not change',before,after)
  page.locator('#awayKit').select_option('home')
  assert page.evaluate("NekketsuHD.getKitChoices().join(',')")=='away,home'
  page.screenshot(path=str(root/'tests'/f'kits_setup_{name}.png'))
  page.locator('[data-action="kickoff"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert page.evaluate('NekketsuHD.game.getTeam(0).kit')=='away'
  assert page.evaluate('NekketsuHD.game.getTeam(1).kit')=='home'
  page.screenshot(path=str(root/'tests'/f'kits_match_{name}.png'))
  page.locator('#pauseBtn').click(force=True)
  assert page.evaluate('NekketsuHD.game.matchState')=='paused'
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert not issues,issues
  print('Kit browser '+name+': PASS • 2 kits • live preview • selected game colors • pause/resume')
  ctx.close()
 browser.close()
