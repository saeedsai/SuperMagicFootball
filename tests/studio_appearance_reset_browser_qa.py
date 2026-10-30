#!/usr/bin/env python3
"""Player Studio unsaved appearance reset in desktop and simulated-touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

html=(Path(__file__).resolve().parents[1]/'tests/.generated/play.html').read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.evaluate("""() => {const memory=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{
   getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v)),
   removeItem:k=>memory.delete(k),clear:()=>memory.clear()}});}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navSettings','navCustomization','playerStudio'):
   page.locator('[data-action="'+action+'"]').first.click()
  reset=page.locator('[data-action="studioResetAppearance"]')
  original=page.locator('#face_style').input_value()
  page.locator('[data-action="studioGalleryToggle"]').click()
  assert page.locator('canvas[data-studio-view]').count()==8
  page.evaluate("""() => {const field=document.querySelector('#face_style');
   field.selectedIndex=(field.selectedIndex+1)%field.options.length;
   field.dispatchEvent(new Event('input',{bubbles:true}));}""")
  assert page.locator('#face_style').input_value()!=original,(label,'edit failed')
  assert reset.is_enabled(),(label,'reset disabled with pending changes')
  reset.click()
  assert page.locator('#face_style').input_value()==original,(label,'reset did not restore selection')
  assert 'nothing was saved' in page.locator('#studioAppearanceSaveState').inner_text()
  assert page.locator('canvas[data-studio-view]').count()==8,(label,'gallery lost')
  assert page.locator('#touchButtons [data-act]').count()==4
  assert page.evaluate("localStorage.getItem('legend_edits')") is None,(label,'reset persisted data')
  assert not errors,(label,errors)
  print('STUDIO_APPEARANCE_RESET_BROWSER_PASS',label,flush=True)
  context.close()
 browser.close()
