#!/usr/bin/env python3
"""UX28 contract renewal: real squad action updates term, funds, and saved Career."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current game fixture first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {const db=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k),clear:()=>db.clear()}})}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
  open_feature(page,'manager')
  page.locator('[data-action="startManager"]').first.click()
  page.evaluate("""() => {const c=NekketsuHD.getCareer();c.cash=100000000;c.roster[0].value=10000000;c.roster[0].contractYears=1;}""")
  page.locator('[data-action="careerSquad"]').click()
  page.locator('[data-careerrenew="0"]').click()
  state=page.evaluate("""() => {const c=NekketsuHD.getCareer();return {cash:c.cash,years:c.roster[0].contractYears,saved:localStorage.getItem('legend_managerCareer')};}""")
  assert state['cash']==97850000 and state['years']==3,(device,state)
  assert state['saved'] and '97850000' in state['saved'],(device,'renewed Career was not autosaved')
  assert 'CONTRACT 3Y' in page.locator('.squadEntry').first.inner_text(),(device,'updated contract not shown')
  assert not errors,(device,errors)
  print('CAREER_CONTRACT_RENEWAL_BROWSER_PASS',device)
  context.close()
 browser.close()
