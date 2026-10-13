from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
markup=(root/'play.html').read_text()
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox'])
 for label,config in [('desktop',{'viewport':{'width':1420,'height':900}}),('android',{'viewport':{'width':884,'height':408},'is_mobile':True,'has_touch':True,'device_scale_factor':2})]:
  page=browser.new_page(**config)
  errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
  page.set_content(markup,wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'",timeout=10000)
  page.locator('[data-action="quick"]').click()
  assert page.locator('.previewCombat .cartoonFlagSvg').count()==2
  assert page.locator('.previewCombat .teamIdentity').count()==2
  assert page.locator('.previewCombat .flagGlyph').count()==0
  page.screenshot(path=str(root/'tests'/f'cartoon_match_setup_{label}.png'),full_page=False)
  # choose continental sides; verify both original crests and regional flags, including after selection.
  page.select_option('#homeGroup','UEFA')
  assert page.locator('.previewCombat .cartoonCrestSvg').count()>=1
  page.locator('#homeTeam').select_option(index=3)
  assert page.locator('.previewCombat .cartoonCrestSvg').count()>=1
  assert page.locator('.previewCombat .cartoonFlagSvg').count()==2
  assert page.evaluate("document.querySelector('#menu .menubox').scrollWidth <= document.querySelector('#menu .menubox').clientWidth+4")
  page.screenshot(path=str(root/'tests'/f'cartoon_club_setup_{label}.png'),full_page=False)
  page.locator('[data-action="home"]').click()
  page.locator('[data-action="continents"]').click()
  page.locator('[data-action="continentPick_UEFA"]').click()
  assert page.locator('.continentClubList .cartoonCrestSvg').count()>=6
  assert page.locator('.continentClubList .cartoonFlagSvg').count()>=6
  page.screenshot(path=str(root/'tests'/f'cartoon_clubs_{label}.png'),full_page=False)
  assert not errors, errors[:3]
  print(f'{label} PASS: offline vector nations and clubs in setup and continental selector, selection refresh, no browser errors')
  page.close()
 browser.close()
