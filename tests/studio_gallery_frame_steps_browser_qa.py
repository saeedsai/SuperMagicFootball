#!/usr/bin/env python3
"""Player Studio eight-view frame stepping, desktop and simulated touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
fixture=root/'tests/.generated/play.html'
assert fixture.exists(),'Build modular browser fixture before Studio QA'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navSettings','navCustomization','playerStudio'):
   page.locator('[data-action="'+action+'"]').first.click()
  assert page.locator('#studioEightViewGallery').count()==0
  face=page.locator('#face_style')
  before=face.input_value()
  page.evaluate("""() => {const e=document.querySelector('#face_style');
    e.selectedIndex=(e.selectedIndex+1)%e.options.length;
    e.dispatchEvent(new Event('input',{bubbles:true}));}""")
  edited=face.input_value()
  assert edited!=before,(label,'unsaved appearance edit was not applied')
  page.locator('[data-action="studioGalleryToggle"]').click()
  assert page.locator('canvas[data-studio-view]').count()==8
  slider=page.locator('#studioGalleryPhase')
  assert slider.input_value()=='1',(label,'initial frame')
  page.locator('[data-action="studioGalleryNext"]').click()
  assert slider.input_value()=='2'
  assert 'FRAME 3 / 4' in page.locator('#studioGalleryPhaseLabel').inner_text()
  assert all('frame 3 of 4' in name for name in page.locator('[data-studio-pick]').evaluate_all(
   '(buttons)=>buttons.map(button=>button.getAttribute("aria-label"))'))
  for _ in range(2):page.locator('[data-action="studioGalleryNext"]').click()
  assert slider.input_value()=='0',(label,'next frame must wrap')
  page.locator('[data-action="studioGalleryPrev"]').click()
  assert slider.input_value()=='3',(label,'previous frame must wrap')
  assert face.input_value()==edited,(label,'unsaved face edit was discarded')
  assert page.evaluate("localStorage.getItem('legend_edits')") is None,(label,'preview must not persist')
  page.locator('[data-action="studioGalleryToggle"]').click()
  assert page.locator('#studioEightViewGallery').count()==0
  assert face.input_value()==edited,(label,'closing gallery lost unsaved edit')
  assert page.locator('#touchButtons [data-act]').count()==4
  assert not errors,(label,errors)
  print('STUDIO_GALLERY_FRAME_STEP_BROWSER_PASS',label,flush=True)
  context.close()
 browser.close()
