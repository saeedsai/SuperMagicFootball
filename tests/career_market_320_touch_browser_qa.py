#!/usr/bin/env python3
"""Career transfer-market fit and save-integrity check at 320x568 touch."""
from pathlib import Path
import re
import shutil
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'tests/.generated/play.html'
MARKET_SHOT=ROOT/'tests/.generated/career_market_320_touch.png'
CONFIRM_SHOT=ROOT/'tests/.generated/career_market_320_touch_confirm.png'
assert FIXTURE.exists(),'Build the modular fixture before running this QA.'
HTML=FIXTURE.read_text(encoding='utf-8')
STORAGE=r"""
(() => {
 const data=new Map(),writes=[];window.__careerMarketStorage={data,writes};
 Object.defineProperty(window,'localStorage',{configurable:true,value:{
  getItem:key=>data.has(key)?data.get(key):null,
  setItem:(key,value)=>{writes.push([key,String(value)]);data.set(key,String(value));},
  removeItem:key=>{writes.push([key,null]);data.delete(key);},clear:()=>{writes.push(['*',null]);data.clear();}
 }});
})()
"""

def bounds(locator):
 box=locator.bounding_box()
 assert box is not None,'Expected visible layout box'
 return box

def inside_viewport(locator,width=320):
 box=bounds(locator)
 assert box['x']>=-0.5 and box['x']+box['width']<=width+0.5,('element exceeds horizontal viewport',locator.get_attribute('id'),box)
 return box

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 context=browser.new_context(viewport={'width':320,'height':568},is_mobile=True,has_touch=True)
 context.add_init_script(STORAGE)
 page=context.new_page();errors=[]
 TOP_SHOT=ROOT/'tests/.generated/career_market_320_touch_top.png'
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content(HTML,wait_until='load')
 page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
 open_feature(page,'manager')
 page.locator('[data-action="startManager"]').first.click()
 page.evaluate("""() => {const c=NekketsuHD.getCareer();c.cash=100000000;}""")
 page.locator('[data-action="careerMarket"]').click()
 page.get_by_role('heading',name='TRANSFER MARKET').wait_for()

 search=page.get_by_role('searchbox',name='Search market players')
 role=page.get_by_label('Filter market players by role')
 sorting=page.get_by_label('Sort market players')
 outgoing=page.locator('#releasePlayer')
 quote=page.locator('#careerTransferQuote')
 listing=page.locator('#careerMarketListing')
 rows=listing.locator('.marketRow')
 assert search.count()==role.count()==sorting.count()==outgoing.count()==1
 for control in [search,role,sorting,outgoing,quote,listing]:inside_viewport(control)
 assert rows.count()>=2,'A market route must expose multiple candidates.'
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth && document.body.scrollWidth<=innerWidth'), 'Page/body horizontal overflow at 320px.'
 page.screenshot(path=str(TOP_SHOT),full_page=True)
 initial=page.evaluate("""() => ({career:JSON.stringify(NekketsuHD.getCareer()),saved:[...__careerMarketStorage.data],writes:__careerMarketStorage.writes.length})""")

 # The chosen row and its price quote survive role filtering and sorting.
 row=rows.nth(0);target=row.locator('input[name="target"]')
 name=target.get_attribute('aria-label').removeprefix('Buy ')
 role_name=row.locator('small').inner_text().split(' · OVR ')[0]
 target.check()
 selected_id=page.locator('input[name="target"]:checked').get_attribute('value')
 quote_before=quote.inner_text()
 search.fill(name)
 role.select_option(role_name)
 assert rows.count()==1 and page.locator('input[name="target"]:checked').get_attribute('value')==selected_id
 sorting.select_option('price-asc')
 assert page.locator('input[name="target"]:checked').get_attribute('value')==selected_id
 assert quote.inner_text()==quote_before,'Selected quote should not change during filtering/sorting.'
 page.locator('input[name="target"]:checked').scroll_into_view_if_needed()
 page.screenshot(path=str(MARKET_SHOT),full_page=True)

 # Every visible listing row remains within the viewport and its panel.
 for i in range(rows.count()):
  row_box=inside_viewport(rows.nth(i))
  list_box=bounds(listing)
  assert row_box['x']>=list_box['x']-0.5 and row_box['x']+row_box['width']<=list_box['x']+list_box['width']+0.5,('row escapes listing panel',i,row_box,list_box)
  assert rows.nth(i).locator('input[name="target"]').get_attribute('aria-label'),('unlabeled candidate',i)

 page.locator('[data-action="careerBuy"]').click()
 page.get_by_role('heading',name='CONFIRM TRANSFER').wait_for()
 confirm=page.get_by_role('button',name=re.compile('CONFIRM BUY & SWAP',re.I))
 cancel=page.get_by_role('button',name=re.compile('CANCEL',re.I))
 assert confirm.count()==cancel.count()==1,'Confirm and Cancel need unique accessible button names.'
 confirm.scroll_into_view_if_needed()
 for button in [confirm,cancel]:
  box=inside_viewport(button)
  assert box['height']>=44,('transfer confirmation target below 44px',button.inner_text(),box)
  assert box['y']>=0 and box['y']+box['height']<=568,('confirmation action must be vertically reachable in the touch viewport',button.inner_text(),box)
 confirm_height=bounds(confirm)['height'];cancel_height=bounds(cancel)['height']
 review=page.locator('#careerTransferConfirmStatus')
 assert review.get_attribute('aria-live')=='polite' and review.inner_text()
 page.screenshot(path=str(CONFIRM_SHOT),full_page=True)
 before_cancel=page.evaluate("""() => ({career:JSON.stringify(NekketsuHD.getCareer()),saved:[...__careerMarketStorage.data],writes:__careerMarketStorage.writes.length})""")
 cancel.click()
 page.get_by_role('heading',name='TRANSFER MARKET').wait_for()
 after_cancel=page.evaluate("""() => ({career:JSON.stringify(NekketsuHD.getCareer()),saved:[...__careerMarketStorage.data],writes:__careerMarketStorage.writes.length})""")
 assert after_cancel==before_cancel==initial,'Cancel must preserve career state and exact local save bytes.'

 # Confirming still performs a valid 12-player swap.
 page.locator('[data-action="careerBuy"]').click()
 page.get_by_role('heading',name='CONFIRM TRANSFER').wait_for()
 before_confirm=page.evaluate("""() => ({ids:NekketsuHD.getCareer().roster.map(player=>player.id),cash:NekketsuHD.getCareer().cash})""")
 page.locator('[data-action="careerBuyConfirm"]').click()
 page.wait_for_function("before => JSON.stringify(NekketsuHD.getCareer().roster.map(player=>player.id))!==JSON.stringify(before.ids)",arg=before_confirm,timeout=10000)
 after_buy=page.evaluate("""() => ({ids:NekketsuHD.getCareer().roster.map(player=>player.id),cash:NekketsuHD.getCareer().cash,saved:[...__careerMarketStorage.data],writes:__careerMarketStorage.writes.length})""")
 assert len(after_buy['ids'])==12 and len(set(after_buy['ids']))==12,after_buy
 assert after_buy['cash']!=before_confirm['cash'],('Confirmed purchase must apply the transfer fee and sale credit.',before_confirm,after_buy)
 assert after_buy['saved']!=initial['saved'] and after_buy['writes']>initial['writes'],'Confirmed transfer must persist after the no-write cancel path.'
 assert not errors,errors
 print('CAREER_MARKET_320_TOUCH_PASS',{'marketRows':1,'selected':name,'confirmHeight':confirm_height,'cancelHeight':cancel_height,'uniqueRosterIds':len(set(after_buy['ids'])),'noPageErrors':True,'screenshots':[str(TOP_SHOT),str(MARKET_SHOT),str(CONFIRM_SHOT)]})
 context.close();browser.close()
