#!/usr/bin/env python3
"""Player Studio RANDOMIZE FACE real-option, no-save desktop and touch regression."""
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
  page.locator('[data-action="studioGalleryToggle"]').click()
  assert page.locator('canvas[data-studio-view]').count()==8,(label,'eight-view gallery missing')
  before=page.evaluate("""() => Object.fromEntries(Array.from(document.querySelectorAll('select[id^="face_"]'),el=>[el.id,el.value]))""")
  page.locator('[data-action="randomizeFace"]').click()
  after=page.evaluate("""() => Object.fromEntries(Array.from(document.querySelectorAll('select[id^="face_"]'),el=>[el.id,el.value]))""")
  assert set(before)==set(after) and len(after)>=15,(label,'appearance options missing')
  for key,value in after.items():
   assert value!=before[key],(label,'unchanged option',key)
   assert page.locator('#'+key+' option:checked').count()==1,(label,'invalid option',key,value)
   assert page.locator('#'+key+' option:checked').get_attribute('disabled') is None,(label,'disabled option',key)
  assert page.locator('[data-action="saveAppearance"]').is_enabled(),(label,'preview not savable')
  assert page.locator('[data-action="studioResetAppearance"]').is_enabled(),(label,'preview cannot be reset')
  assert 'Nothing saved yet' in page.locator('#studioAppearanceSaveState').inner_text()
  assert page.locator('canvas[data-studio-view]').count()==8,(label,'gallery lost after preview')
  assert page.locator('#touchButtons [data-act]').count()==4,(label,'four-button contract changed')
  assert page.evaluate("localStorage.getItem('legend_edits')") is None,(label,'randomization wrote saved edits')
  page.locator('[data-action="studioResetAppearance"]').click()
  restored=page.evaluate("""() => Object.fromEntries(Array.from(document.querySelectorAll('select[id^="face_"]'),el=>[el.id,el.value]))""")
  assert restored==before,(label,'reset did not restore persisted appearance')
  assert page.evaluate("localStorage.getItem('legend_edits')") is None,(label,'reset wrote saved edits')
  assert not errors,(label,errors)
  print('STUDIO_RANDOM_OPTIONS_BROWSER_PASS',label,flush=True)
  context.close()
 browser.close()
