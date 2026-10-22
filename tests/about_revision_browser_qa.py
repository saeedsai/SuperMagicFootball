#!/usr/bin/env python3
"""0.9.1.0: About shows installed offline version and release notes, never a remote SHA."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the modular test fixture with python3 scripts/build.py'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,mobile in [('desktop',{'width':1280,'height':720},False),
                               ('simulated-touch',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[];outbound=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  def reject_github(route):
   outbound.append(route.request.url)
   route.abort()
  page.route('https://api.github.com/**',reject_github)
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  assert page.evaluate('SupermagicFootball.version')=='0.9.1.0'
  assert page.locator('.homeMasthead').count()==1
  assert '0.9.1.0' not in page.locator('.menubox').inner_text(),(label,'version leaked onto Home')
  for visit in range(2):
   page.locator('[data-action="navAbout"]').first.click()
   assert page.locator('.heading').inner_text()=='ABOUT SUPERMAGIC FOOTBALL'
   assert page.locator('#aboutBundleVersion').inner_text().strip()=='0.9.1.0'
   assert '2026-10-21' in page.locator('.menubox').inner_text()
   assert 'Career save slots' in page.locator('#aboutReleaseNotes').inner_text()
   assert 'Spinning Bumper' in page.locator('#aboutReleaseNotes').inner_text()
   assert page.locator('a[href="mailto:saeedmsalehi1990@gmail.com"]').count()==1
   assert page.locator('#aboutDevRevision').count()==0
   assert page.locator('#aboutLatestChange').count()==0
   assert page.locator('#aboutRecentChanges').count()==0
   assert '0.8.25.32' not in page.locator('.menubox').inner_text()
   assert '+dev.' not in page.locator('.menubox').inner_text()
   page.locator('[data-action="home"]').first.click()
  assert len(outbound)==0,(label,'About must not query remote dev branch',outbound)
  page.locator('[data-action="navQuick"]').first.click()
  assert page.locator('[data-action="navOnDevice"]').count()==1,(label,'game menu regression')
  assert page.locator('#touchButtons [data-act]').count()==4,(label,'four gameplay buttons')
  assert not errors,(label,errors)
  print('ABOUT_0901_BROWSER_PASS',label,'installed version, offline notes, no SHA, safe menus',flush=True)
  ctx.close()
 browser.close()
