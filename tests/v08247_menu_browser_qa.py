from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'play.html').read_text()
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
 for label,ctx_args in [('desktop',{'viewport':{'width':1440,'height':900}}),('portrait',{'viewport':{'width':390,'height':844},'has_touch':True,'is_mobile':True}),('landscape',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  page=browser.new_page(**ctx_args)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=15000)
  assert page.locator('.navMainList > .navChoice').count()==5,label
  assert page.locator('.navMainList > .navChoice .navCopy strong').all_text_contents()==['Quick Match','Online','Career','Leagues & Cups','Settings']
  assert page.locator('.menubox').evaluate('(x)=>x.scrollWidth<=x.clientWidth+3'), (label,'overflow main')
  page.locator('[data-action=navQuick]').first.click()
  assert page.locator('[data-action=navOnDevice]').count()==1
  page.locator('[data-action=laterLAN]').click()
  assert 'COMING LATER' in page.locator('.navInfo').inner_text()
  page.locator('[data-action=navQuick]').first.click()
  page.locator('[data-action=navOnDevice]').click()
  for a in ['quick','versus','pk','training']:
   assert page.locator(f'[data-action={a}]').count()==1,(label,a)
  page.locator('[data-action=quick]').click()
  assert page.locator('#homeTeam').count()==1,(label,'match setup')
  for _ in range(3):page.keyboard.press('Escape')
  assert page.locator('.navMainList').count()==1,(label,'back to home from match setup')
  page.locator('[data-action=navOnline]').first.click()
  for a in ['laterOnlineMatch','laterUltimate','laterOnlineCareer','laterOnlineCup']:
   assert page.locator(f'[data-action={a}]').count()==1
  page.locator('[data-action=laterOnlineMatch]').click()
  assert 'COMING LATER' in page.locator('.navInfo').inner_text()
  page.locator('[data-action=navOnline]').first.click()
  page.keyboard.press('Escape')
  assert page.locator('.navMainList').count()==1
  page.locator('[data-action=navCups]').first.click()
  assert page.locator('[data-action=league]').count()==1
  page.locator('[data-action=navInternational]').first.click()
  for a in ['laterWorldCup','laterAsian','laterEuro','laterCopa','laterAfrica','laterConcacaf']:
   assert page.locator(f'[data-action={a}]').count()==1
  page.locator('[data-action=laterWorldCup]').click()
  assert 'COMING LATER' in page.locator('.navInfo').inner_text()
  page.locator('[data-action=navInternational]').first.click()
  page.locator('[data-action=navCups]').first.click()
  page.locator('[data-action=navClubs]').click()
  assert page.locator('[data-action=continents]').count()==1
  page.locator('[data-action=continents]').click()
  assert page.locator('[data-action=continentPick_UEFA]').count()==1
  for _ in range(3):page.keyboard.press('Escape')
  assert page.locator('.navMainList').count()==1
  page.locator('[data-action=navSettings]').first.click()
  page.locator('[data-action=navSound]').click()
  assert page.locator('#audio_master').count()==1
  page.locator('#audio_music').fill('35')
  page.locator('[data-action=saveSettings]').click()
  assert page.locator('[data-action=navSound]').count()==1
  page.locator('[data-action=navGameSettings]').click()
  assert page.locator('#difficulty').count()==1
  page.locator('[data-action=navSettings]').first.click()
  page.locator('[data-action=navCustomization]').click()
  for a in ['playerStudio','clubs','editor','squad','gallery']:assert page.locator(f'[data-action={a}]').count()==1
  page.locator('[data-action=navSettings]').first.click()
  page.locator('[data-action=navInput]').click()
  assert page.locator('[data-action=controls]').count()==1
  page.locator('[data-action=navSettings]').first.click()
  page.locator('[data-action=navSaveManagement]').click()
  assert page.locator('[data-action=exportSave]').count()==1
  assert not errors, (label,errors)
  assert page.locator('.menubox').evaluate('(x)=>x.scrollWidth<=x.clientWidth+3'),(label,'overflow submenu')
  print(label,'PASS menu hierarchy, routes, existing capabilities, placeholders, settings, no errors')
  page.close()
 browser.close()
