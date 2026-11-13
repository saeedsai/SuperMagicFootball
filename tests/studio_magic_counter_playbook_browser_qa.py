#!/usr/bin/env python3
"""Live Player Studio counter-playbook checks in desktop and touch Chromium.

This is a read-only guide: opening it must never equip a Trick or write a save.
The separate Node guide contract covers each engine-specific counter description.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build current modular browser fixture first'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':800},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page()
  # set_content uses an opaque document origin in CI: native localStorage throws
  # SecurityError. Install a per-page in-memory storage spy before game bootstrap,
  # then assert the guide never writes to it. This also isolates device cases.
  page.evaluate("""() => {
    const data = {}, writes = [];
    Object.defineProperty(window, 'localStorage', {configurable: true, value: {
      getItem: key => Object.prototype.hasOwnProperty.call(data,key) ? data[key] : null,
      setItem: (key,value) => { writes.push(String(key)); data[key] = String(value); },
      removeItem: key => { writes.push(String(key)); delete data[key]; }
    }});
    window.__studioGuideStorageWrites = writes;
  }""")
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  open_feature(page,'playerStudio')
  player=page.locator('#customPlayer')
  assert player.count()==1,(label,'Player Studio selection missing')
  # Japan's canonical roster has DF Horibata at slot 3 and GK Genei at 5;
  # slot 0 is MF Kunio, not a keeper. Exercise both Studio branches.
  assert 'Horibata' in player.locator('option[value="3"]').inner_text(),(label,'outfield fixture drift')
  assert 'Genei' in player.locator('option[value="5"]').inner_text(),(label,'goalkeeper fixture drift')
  for index,goalkeeper in [(3,False),(5,True)]:
   player.select_option(str(index))
   playbook=page.locator('#studioMagicCounterPlaybook')
   assert playbook.count()==1,(label,index,'playbook missing or duplicated')
   assert playbook.locator('summary').inner_text().strip()=='DEFENDER COUNTER PLAYBOOK · 14 TRICKS'
   assert not playbook.evaluate('(el)=>el.open'),(label,index,'playbook should start collapsed')
   summary=playbook.locator('summary')
   if touch:summary.tap()
   else:summary.click()
   assert playbook.evaluate('(el)=>el.open'),(label,index,'playbook failed to expand')
   assert playbook.locator('li').count()==14,(label,index,'missing trick counters')
   body=playbook.inner_text()
   for instruction in ('hold DRIBBLE for 1 second','PASS for a timed close-range poke',
                       'SHOOT for a grounded slide','JUMP to avoid airborne-clearable attacks',
                       'not every counter works against every Trick'):
    assert instruction in body,(label,index,instruction)
   assert playbook.locator('button,input,select,[data-action]').count()==0,(label,index,'guide is not read-only')
   assert page.locator('#studioGKMagicPreview').count()==int(goalkeeper),(label,index,'wrong goalkeeper preview')
   assert page.locator('#touchButtons button[data-act]').count()==4,(label,index,'four actions changed')
   assert page.evaluate("localStorage.getItem('legend_edits')") is None,(label,index,'opening guide saved edits')
   assert not page.evaluate("window.__studioGuideStorageWrites"),(label,index,'opening guide wrote local storage')
   # Native details/summary must remain keyboard-operable even on touch layouts.
   # Verify Enter toggles without writing saves or changing the selected player.
   summary.focus()
   page.keyboard.press('Enter')
   assert not playbook.evaluate('(el)=>el.open'),(label,index,'keyboard Enter failed to collapse')
   page.keyboard.press('Enter')
   assert playbook.evaluate('(el)=>el.open'),(label,index,'keyboard Enter failed to reopen')
   assert player.input_value()==str(index),(label,index,'keyboard toggle changed player')
   assert not page.evaluate("window.__studioGuideStorageWrites"),(label,index,'keyboard toggle wrote storage')
   # Space is the other native summary activation key; keep touch and keyboard parity.
   page.keyboard.press('Space')
   assert not playbook.evaluate('(el)=>el.open'),(label,index,'keyboard Space failed to collapse')
   page.keyboard.press('Space')
   assert playbook.evaluate('(el)=>el.open'),(label,index,'keyboard Space failed to reopen')
   assert player.input_value()==str(index),(label,index,'keyboard Space changed player')
   assert not page.evaluate("window.__studioGuideStorageWrites"),(label,index,'keyboard Space wrote storage')
   # Native summary must retain keyboard focus through both activation keys;
   # losing focus would make the read-only guide unusable without a pointer.
   assert summary.evaluate('(el) => document.activeElement === el'),(label,index,'keyboard activation lost summary focus')
   assert summary.get_attribute('tabindex') is None,(label,index,'native summary tab order was overridden')
   if touch:summary.tap()
   else:summary.click()
   assert not playbook.evaluate('(el)=>el.open'),(label,index,'playbook failed to collapse')
  # Re-entering an earlier outfield player after a goalkeeper must not duplicate
  # the read-only playbook or leave goalkeeper-only preview controls behind.
  player.select_option('3')
  assert page.locator('#studioMagicCounterPlaybook').count()==1,(label,'duplicate guide after return')
  assert page.locator('#studioMagicCounterPlaybook li').count()==14,(label,'guide lost entries after return')
  assert page.locator('#studioGKMagicPreview').count()==0,(label,'stale goalkeeper preview after return')
  assert player.input_value()=='3',(label,'return selection changed')
  assert not page.evaluate("window.__studioGuideStorageWrites"),(label,'return selection wrote storage')
  assert not errors,(label,errors)
  print('STUDIO_MAGIC_COUNTER_PLAYBOOK_BROWSER_PASS',label,flush=True)
  context.close()
 browser.close()
