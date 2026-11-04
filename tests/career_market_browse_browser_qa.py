#!/usr/bin/env python3
"""UX28 Career Transfer Market search, filters, sorting and read-only browsing."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build current game fixture with scripts/build.py first'
HTML=fixture.read_text(encoding='utf-8')
STORAGE=r"""
(() => {
 const data=new Map(),writes=[];window.__marketStorage={data,writes};
 Object.defineProperty(window,'localStorage',{configurable:true,value:{
  getItem:key=>data.has(key)?data.get(key):null,
  setItem:(key,value)=>{writes.push([key,String(value)]);data.set(key,String(value));},
  removeItem:key=>{writes.push([key,null]);data.delete(key);},clear:()=>data.clear()
 }});
})()
"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  context.add_init_script(STORAGE)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
  open_feature(page,'manager')
  page.locator('[data-action="startManager"]').first.click()
  page.evaluate('NekketsuHD.getCareer().cash=100000000')
  page.locator('[data-action="careerMarket"]').click()
  rows=page.locator('#careerMarketListing .marketRow')
  assert rows.count()>=2,(device,'market fixture requires at least two sellers')
  original_count=rows.count()
  result=page.locator('#careerMarketResultCount')
  assert result.get_attribute('aria-live')=='polite' and result.get_attribute('role')=='status'
  assert result.inner_text()==f'{rows.count()} players found.',(device,result.inner_text())
  search=page.get_by_role('searchbox',name='Search market players')
  role=page.get_by_label('Filter market players by role')
  sorting=page.get_by_label('Sort market players')
  initial=page.evaluate("""() => ({career:JSON.stringify(NekketsuHD.getCareer()),storage:[...__marketStorage.data],writes:__marketStorage.writes.length})""")

  # Select a row, then filter it out; selection and quote must fail closed.
  second=rows.nth(1).locator('input[name="target"]')
  second.check()
  hidden_name=second.get_attribute('aria-label').removeprefix('Buy ')
  first=rows.nth(0).locator('input[name="target"]')
  visible_name=first.get_attribute('aria-label').removeprefix('Buy ')
  assert hidden_name!=visible_name,(device,'market sample unexpectedly repeats a player name')
  first_role=rows.nth(0).locator('small').inner_text().split(' · OVR ')[0]
  search.fill(visible_name)
  assert rows.count()==1 and rows.first.locator('input').get_attribute('aria-label')==f'Buy {visible_name}'
  assert page.locator('#careerTransferQuote').inner_text().startswith('Select a market player'),(device,'hidden selection remained purchasable')
  assert result.inner_text()==f'1 of {original_count} players found.'

  # Role and name search compose, including an empty result announcement.
  role.select_option(first_role)
  assert all(rows.nth(i).locator('small').inner_text().startswith(first_role+' ·') for i in range(rows.count()))
  assert 'players found' in result.inner_text()
  search.fill('no-such-market-player-xyz')
  assert rows.count()==0 and result.inner_text().startswith('0 of '),(device,result.inner_text())
  search.fill('')
  role.select_option('ALL')

  # Stable OVR/price ordering, and a visible selected player survives sorting.
  rows=page.locator('#careerMarketListing .marketRow')
  selected=rows.nth(1).locator('input[name="target"]');selected.check()
  selected_index=selected.get_attribute('value')
  sorting.select_option('ovr-desc')
  ovr=[int(rows.nth(i).get_attribute('data-market-ovr')) for i in range(rows.count())]
  assert ovr==sorted(ovr,reverse=True),(device,'OVR sort is not descending',ovr)
  assert page.locator('input[name="target"]:checked').get_attribute('value')==selected_index,(device,'sort lost the visible selection')
  sorting.select_option('price-asc')
  prices=[int(rows.nth(i).get_attribute('data-market-price')) for i in range(rows.count())]
  assert prices==sorted(prices),(device,'price sort is not ascending',prices)
  sorting.select_option('price-desc')
  prices=[int(rows.nth(i).get_attribute('data-market-price')) for i in range(rows.count())]
  assert prices==sorted(prices,reverse=True),(device,'price sort is not descending',prices)

  after=page.evaluate("""() => ({career:JSON.stringify(NekketsuHD.getCareer()),storage:[...__marketStorage.data],writes:__marketStorage.writes.length})""")
  assert after==initial,(device,'market browsing mutated Career or local save data',initial,after)
  assert not errors,(device,errors)
  print('CAREER_MARKET_BROWSE_PASS',device,'rows',rows.count(),'role',first_role)
  context.close()
 browser.close()
