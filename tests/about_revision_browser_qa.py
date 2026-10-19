#!/usr/bin/env python3
"""About: developer credit, live new SHA per visit, offline fallback on desktop and touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build modular test fixture with python3 scripts/build.py'
html=fixture.read_text(encoding='utf-8')
URL='https://api.github.com/repos/saeedsai/SuperMagicFootball/commits/dev'
SHA1='1'*40
SHA2='abcdef0123456789abcdef0123456789abcdef01'
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,mobile in [('desktop',{'width':1280,'height':720},False),
                                ('simulated-touch',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[];requests=[];state={'sha':SHA1,'fail':False}
  page.on('pageerror',lambda error:errors.append(str(error)))
  def route_handler(route):
   requests.append(route.request.url)
   if state['fail']:route.fulfill(status=503,body='unavailable')
   else:route.fulfill(status=200,content_type='application/json',body='{"sha":"'+state['sha']+'"}')
  page.route(URL,route_handler)
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  def visit():
   page.locator('[data-action="navAbout"]').first.click()
   assert page.locator('.heading').inner_text()=='ABOUT SUPERMAGIC FOOTBALL'
   assert page.locator('a[href="mailto:saeedmsalehi1990@gmail.com"]').count()==1
   assert 'Developer: Saeed' in page.locator('.menubox').inner_text()
   assert '0.8.25.32-integrated' in page.locator('#aboutBundleVersion').inner_text()
  visit()
  page.wait_for_function("document.querySelector('#aboutDevRevision a')?.textContent?.startsWith('v0.8.25.32-integrated+dev.')",timeout=20000)
  assert page.locator('#aboutDevRevision a').inner_text().endswith(SHA1[:12]),(label,'incorrect displayed commit version')
  assert page.locator('#aboutDevRevision a').get_attribute('href').endswith(SHA1)
  page.locator('[data-action="home"]').first.click()
  state['sha']=SHA2
  visit()
  page.wait_for_function("document.querySelector('#aboutDevRevision a')?.getAttribute('href')?.endsWith('"+SHA2+"')",timeout=20000)
  assert page.locator('#aboutDevRevision a').inner_text().endswith(SHA2[:12]),(label,'new SHA label did not change')
  assert len(requests)==2,(label,'About must fetch latest on each visit',requests)
  page.locator('[data-action="home"]').first.click()
  state['fail']=True
  visit()
  page.wait_for_function("document.querySelector('#aboutDevRevision')?.textContent?.includes('unavailable offline')",timeout=20000)
  assert page.locator('a[href="mailto:saeedmsalehi1990@gmail.com"]').count()==1
  assert page.locator('#aboutDevRevision a').count()==0
  page.locator('[data-action="home"]').first.click()
  page.locator('[data-action="navQuick"]').first.click()
  assert page.locator('[data-action="navOnDevice"]').count()==1,(label,'game menu regression')
  assert page.locator('#touchButtons [data-act]').count()==4,(label,'four gameplay buttons')
  assert not errors,(label,errors)
  print('ABOUT_LIVE_REVISION_PASS',label,'credit, dev commit refresh, secure link, offline fallback, game menus',flush=True)
  ctx.close()
 browser.close()
