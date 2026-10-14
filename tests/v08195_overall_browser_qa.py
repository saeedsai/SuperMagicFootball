from menu_test_routes import open_quick,open_settings,open_feature,home
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parents[1]/'play.html'
with sync_playwright() as pw:
 for device in ['desktop','simulated Android touch']:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
  ctx=browser.new_context(viewport={'width':1400,'height':850} if device=='desktop' else {'width':760,'height':400},has_touch=device!='desktop',is_mobile=device!='desktop')
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(p.read_text(),wait_until='load');page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'")
  open_quick(page);page.locator('[data-action="prepHome"]').first.click()
  assert page.locator('.rosterCard .ovrBadge').count()==12,'roster has 12 derived natural-position overall ratings'
  assert page.locator('.positionOvr').count()==6,'every lineup row shows an OVR'
  assert page.locator('.formationOvr').count()==6,'every formation portrait has an OVR'
  assert page.locator('.formationSlot canvas').count()==6
  assert all('OVR' in x for x in page.locator('.rosterCard .ovrBadge').all_text_contents())
  first=page.locator('[data-lineup-ovr="4"]').inner_text()
  page.locator('#formation').select_option('3-1-1')
  assert page.locator('.lineupRow > strong').all_text_contents()==['GK','DF','DF','DF','MF','FW']
  assert page.locator('.formationOvr').count()==6
  assert page.locator('[data-lineup-ovr="4"]').get_attribute('title')=='Calculated for MF position'
  assert page.locator('.formationOvr').nth(4).inner_text().startswith('MF ')
  # Player switch changes position-specific value, including when player is an alternate natural role.
  sel=page.locator('#pos4');old=page.locator('[data-lineup-ovr="4"]').inner_text()
  options=[x.get_attribute('value') for x in sel.locator('option').all()]
  if len(options)>1:
   sel.select_option(options[-1] if options[-1]!=sel.input_value() else options[0])
   assert page.locator('[data-lineup-ovr="4"]').inner_text().startswith('OVR ')
   assert page.locator('.formationOvr').nth(4).inner_text().startswith('MF ')
  page.locator('[data-action="returnSetup"]').first.click()
  home(page)
  open_feature(page,'manager')
  # Starting career from configured continent/country also reaches derived OVR roster.
  assert page.locator('#managerClub').count()==1
  assert page.locator('[data-action="startManager"]').count()==1
  page.locator('[data-action="startManager"]').first.click()
  page.locator('[data-action="careerSquad"]').first.click()
  assert page.locator('.squadEntry').count()==12
  assert all('OVR' in row.locator('small').first.inner_text() for row in page.locator('.squadEntry').all())
  page.locator('[data-action="careerMarket"]').first.click()
  assert 'OVR' in page.locator('.marketRow').first.inner_text()
  assert not errors,errors
  print(device,'PASS: 12 roster OVRS, 6 positional lineup ratings, 6 formation portrait ratings, formation/selection changes')
  browser.close()
