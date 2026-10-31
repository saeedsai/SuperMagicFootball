from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
from menu_test_routes import home,open_quick,open_settings
root=Path(__file__).resolve().parents[1]
markup=(root/'play.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
 for label,config in [('desktop',{'viewport':{'width':1440,'height':900}}),('mobile',{'viewport':{'width':844,'height':390},'is_mobile':True,'has_touch':True})]:
  page=browser.new_page(**config);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(markup,wait_until='load')
  page.wait_for_function("!!window.SupermagicFootball?.game",timeout=12000)
  assert page.locator('.navMainList>.navChoice').count()==5
  assert page.locator('.navMainList .navCopy strong').all_text_contents()==['Quick Match','Online','Career','Leagues & Cups','Settings']
  for name,route in [('Quick Match','navQuick'),('Online','navOnline'),('Career','navCareer'),('Leagues & Cups','navCups'),('Settings','navSettings')]:
   page.locator(f'[data-action={route}]').first.click()
   assert page.locator('.navScreen').count()==1,(label,name)
   home(page)
  open_quick(page)
  assert page.locator('#homeTeam').count()==1
  home(page)
  open_settings(page,'sound')
  assert page.locator('#audio_master').count()==1
  assert page.locator('.menubox').evaluate('(e)=>e.scrollWidth<=e.clientWidth+3')
  assert not errors,errors
  print(label,'PASS five primary categories, navigation, Quick Match and Settings, no overflow/errors')
  page.close()
 browser.close()
