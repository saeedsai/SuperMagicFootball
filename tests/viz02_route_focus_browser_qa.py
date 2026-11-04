#!/usr/bin/env python3
"""VIZ-02 route heading focus acceptance on desktop and simulated touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current browser fixture first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,mobile in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':390,'height':844},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  def enter(action):
   page.locator(f'[data-action="{action}"]').first.focus()
   page.keyboard.press('Enter')
  enter('navSettings');assert page.locator('.navScreen .heading').inner_text()=='SETTINGS',label
  enter('navInput');assert page.locator('.navScreen .heading').inner_text()=='INPUT SETTINGS',label
  enter('controls')
  heading=page.locator('#menu h1.heading')
  assert heading.inner_text()=='CONTROLLER MAPPING',(label,heading.inner_text())
  assert heading.get_attribute('tabindex')=='-1',(label,'heading must be programmatically focusable but out of the Tab order')
  assert page.evaluate('document.activeElement === document.querySelector("#menu h1.heading")'),(label,'route change must focus its new heading')
  page.keyboard.press('Escape')
  assert page.locator('.navScreen .heading').inner_text()=='INPUT SETTINGS',(label,'Escape returns to the input parent')
  assert page.evaluate('document.activeElement?.dataset.action')=='controls',(label,'parent restores the selected route action')
  assert not errors,(label,errors)
  print('VIZ02_ROUTE_FOCUS_PASS',label,flush=True)
  ctx.close()
 browser.close()
