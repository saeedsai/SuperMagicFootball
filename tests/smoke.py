from pathlib import Path
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h,mobile in [(1440,900,False),(844,390,True)]:
  context=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if mobile else 1,is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((base/'play.html').read_text(),wait_until='load');page.wait_for_timeout(600)
  assert page.locator('[data-action="quick"]').count()==1,('menu missing',errors)
  page.screenshot(path=str(base/'tests'/('menu_mobile.png' if mobile else 'menu.png')))
  page.locator('[data-action="quick"]').click()
  assert page.locator('[data-action="kickoff"]').count()==1,('setup missing',errors)
  page.locator('#homeTeam').select_option('0')
  page.locator('#awayTeam').select_option('9')
  page.locator('[data-action="kickoff"]').click()
  page.wait_for_timeout(900)
  assert page.locator('#hud').is_visible(),('hud missing',errors)
  page.screenshot(path=str(base/'tests'/('match_mobile.png' if mobile else 'match.png')))
  if mobile:
   assert page.locator('#mobile').is_visible(),'touch controls missing'
  else:
   page.keyboard.down('d');page.wait_for_timeout(250);page.keyboard.up('d');page.keyboard.press('l');page.wait_for_timeout(400)
   page.screenshot(path=str(base/'tests'/'shot.png'))
  page.locator('#pauseBtn').click();assert page.locator('[data-action="resume"]').is_visible(),'pause fails'
  page.locator('[data-action="resume"]').click();assert page.locator('#hud').is_visible(),'resume fails'
  page.locator('#pauseBtn').click();page.locator('[data-action="quit"]').click()
  page.locator('[data-action="squad"]').click();assert page.locator('.rosterCard').count()==12,'Japan roster incomplete'
  page.locator('[data-action="home"]').first.click();page.locator('[data-action="settings"]').click();assert page.locator('#difficulty').count()==1
  assert errors==[],errors
  print(('MOBILE' if mobile else 'DESKTOP')+' smoke: PASS')
  context.close()
 browser.close()
