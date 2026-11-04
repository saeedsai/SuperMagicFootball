#!/usr/bin/env python3
"""UX28 transfer-market quote acceptance on desktop and simulated-touch Chromium."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
gallery=ROOT/'tests/.generated'
assert fixture.exists(),'Build current game fixture first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {const db=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k),clear:()=>db.clear()}})}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
  open_feature(page,'manager')
  page.locator('[data-action="startManager"]').first.click()
  page.evaluate("""() => {const c=NekketsuHD.getCareer();c.cash=1000;c.roster[11].value=20000000;}""")
  page.locator('[data-action="careerMarket"]').click()
  quote=page.locator('#careerTransferQuote')
  assert quote.count()==1,(device,'quote status missing')
  assert quote.get_attribute('aria-live')=='polite',(device,'quote is not announced')
  initial=quote.inner_text()
  assert 'full player fee' in initial and 'add ' in initial,(device,initial)
  page.locator('input[name="target"]').nth(1).check()
  incoming_name=page.locator('input[name="target"]:checked').get_attribute('aria-label').removeprefix('Buy ')
  changed=quote.inner_text()
  assert changed and 'Player fee' in changed and 'outgoing credit' in changed,(device,changed)
  page.locator('#releasePlayer').select_option('0')
  outgoing_name=page.locator('#releasePlayer option:checked').inner_text().split(' · ')[0]
  after=quote.inner_text()
  assert after and 'projected budget after swap' in after,(device,after)
  page.evaluate("NekketsuHD.getCareer().cash=100000000")
  page.locator('#releasePlayer').dispatch_event('change')
  assert 'full player fee is affordable' in quote.inner_text(),(device,quote.inner_text())
  before=page.evaluate("() => {const c=NekketsuHD.getCareer();return {ids:c.roster.map(p=>p.id),cash:c.cash}}")
  page.locator('[data-action="careerBuy"]').click()
  page.get_by_role('heading',name='CONFIRM TRANSFER').wait_for()
  review=page.locator('#careerTransferConfirmStatus')
  assert review.count()==1 and review.get_attribute('aria-live')=='polite',(device,'transfer review status missing')
  assert 'Projected budget after swap' in review.inner_text(),(device,review.inner_text())
  assert incoming_name in page.locator('.panel[aria-label="Incoming player"]').inner_text(),(device,incoming_name,'incoming player not named')
  assert outgoing_name in page.locator('.panel[aria-label="Outgoing player"]').inner_text(),(device,outgoing_name,'outgoing player not named')
  page.screenshot(path=str(gallery/f'career_transfer_review_{device}.png'),full_page=True)
  page.locator('[data-action="careerBuyCancel"]').click()
  page.get_by_role('heading',name='TRANSFER MARKET').wait_for()
  assert page.evaluate("() => {const c=NekketsuHD.getCareer();return {ids:c.roster.map(p=>p.id),cash:c.cash}}")==before,(device,'cancel changed Career save')
  page.locator('[data-action="careerBuy"]').click()
  page.locator('[data-action="careerBuyConfirm"]').click()
  page.wait_for_function("document.body.innerText.includes('Twelve players')",timeout=10000)
  after_buy=page.evaluate("() => {const c=NekketsuHD.getCareer();return {ids:c.roster.map(p=>p.id),cash:c.cash}}")
  assert len(after_buy['ids'])==12 and after_buy['ids']!=before['ids'] and after_buy['cash']!=before['cash'],(device,after_buy,before)
  assert not errors,(device,errors)
  print('CAREER_TRANSFER_QUOTE_BROWSER_PASS',device,initial)
  context.close()
 browser.close()
