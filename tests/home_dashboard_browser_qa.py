from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
markup=(root/'play.html').read_text()
actions=['quick','versus','pk','training','continents','manager','league','squad','playerStudio','clubs','editor','gallery','settings','help']
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
 for label,config in [('desktop',{'viewport':{'width':1440,'height':900}}),('mobile',{'viewport':{'width':844,'height':390},'is_mobile':True,'has_touch':True,'device_scale_factor':2})]:
  page=browser.new_page(**config)
  errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(markup,wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'",timeout=12000)
  assert page.locator('section.homeSection').count()==3
  assert page.locator('.homeMasthead').count()==1
  for action in actions:
   assert page.locator(f'[data-action="{action}"]').count()==1, (label,action)
  assert page.locator('#homePlayHeading').inner_text()=='PLAY FOOTBALL'
  assert page.locator('#homeChampHeading').inner_text()=='CHAMPIONSHIPS & CAREER'
  assert page.locator('#homeManageHeading').inner_text()=='TEAM & GAME STUDIO'
  assert page.locator('.homeActionGrid').count()==3
  assert page.evaluate("document.querySelector('#menu .menubox').scrollWidth<=document.querySelector('#menu .menubox').clientWidth+2"),(label,'horizontal overflow')
  (root/'tests'/f'home_dashboard_{label}.png').parent.mkdir(exist_ok=True)
  page.screenshot(path=str(root/'tests'/f'home_dashboard_{label}.png'),full_page=False)
  for action in ['quick','manager','continents','playerStudio','settings']:
   page.locator(f'[data-action="{action}"]').first.click(timeout=5000)
   assert page.locator('#menu').is_visible(),(label,action)
   if action!='quick': assert page.locator('.menubox').count()==1
   page.locator('[data-action="home"]').first.click(timeout=5000)
   assert page.locator('section.homeSection').count()==3
  assert not errors, errors[:5]
  print(label,'PASS — three organized sections, 14 unique actions, five roundtrips, layout, no page errors')
  page.close()
 browser.close()
