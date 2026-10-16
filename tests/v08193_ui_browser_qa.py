from menu_test_routes import open_quick,open_settings,open_feature,home
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parents[1] / 'play.html'
with sync_playwright() as pw:
 for device in ['desktop','mobile']:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
  context=browser.new_context(viewport={'width':1400,'height':850} if device=='desktop' else {'width':720,'height':390},has_touch=device=='mobile',is_mobile=device=='mobile')
  page=context.new_page();errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(p.read_text(),wait_until='load');page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'")
  open_feature(page,'manager')
  assert page.locator('#managerContinent').count()==1
  assert page.locator('#managerCountry').count()==1
  region=page.locator('#managerContinent').input_value(); print(device,'career region',region,'countries',page.locator('#managerCountry option').count())
  page.locator('#managerContinent').select_option('CONMEBOL'); assert page.locator('#managerCountry').count()==1
  choices=page.locator('#managerCountry option').all_text_contents();assert choices
  page.locator('#managerCountry').select_option(label='Brazil')
  assert page.locator('#managerClub option').count()>=1
  assert 'Flamengo' in page.locator('#managerClub').inner_text() or 'Palmeiras' in page.locator('#managerClub').inner_text()
  page.locator('[data-team-browse="managerClub"]').click()
  assert page.locator('#managerClubBrowse:not(.hidden)').count()==1
  assert page.locator('#managerClubResults .teamIdentity').count()>0
  first=page.locator('#managerClubResults [data-pick-team]').first
  picked=first.get_attribute('data-team-id');first.click()
  assert page.locator('#managerClub').input_value()==picked
  home(page)
  open_feature(page,'continents')
  page.locator('[data-action="continentPick_UEFA"]').first.click()
  assert page.locator('[data-team-browse="continentClub"]').count()==1
  page.locator('[data-team-browse="continentClub"]').click()
  assert page.locator('#continentClubResults .teamIdentity').count()>0
  open_feature(page,'continents')
  home(page)
  open_quick(page)
  page.locator('[data-team-browse="homeTeam"]').click()
  assert page.locator('#homeTeamResults .teamIdentity').count()>0
  page.locator('#homeTeamSearch').fill('Japan')
  assert page.locator('#homeTeamResults [data-pick-team]').count()>=1
  page.locator('#homeTeamResults [data-pick-team]').first.click()
  assert page.locator('#homeTeamIdentity .flagGraphic').count()>0
  page.locator('[data-action="setupTactics"]').click()
  page.locator('[data-action="prepHome"]').first.click()
  assert page.locator('.playerFaceCanvas').count()==12
  assert page.locator('.formationSlot canvas').count()==6
  assert page.locator('#formation option[value="1-3-1"]').count()==1
  assert page.locator('#formation option[value="1-1-3"]').count()==1
  assert page.locator('#formation option[value="3-1-1"]').count()==1
  assert page.locator('#formation option[value="1-1-3-3-1-1"]').count()==0
  page.locator('#formation').select_option('1-1-3')
  assert page.locator('.formationSlot canvas').count()==6
  assert page.locator('.lineupRow > strong').all_text_contents()==['GK','DF','MF','FW','FW','FW']
  page.locator('#formation').select_option('3-1-1')
  assert page.locator('.formationSlot canvas').count()==6
  assert page.locator('.lineupRow > strong').all_text_contents()==['GK','DF','DF','DF','MF','FW']
  a=page.locator('.formationSlot canvas').first.evaluate('(c)=>Array.from(c.getContext("2d").getImageData(0,0,c.width,c.height).data).some((v,i)=>i%4===3 && v>0)')
  assert a,'formation faces drawn'
  assert page.locator('.playerFaceCanvas').first.evaluate('(e)=>e.getBoundingClientRect().left>100'),'roster face must not float at document origin'
  assert not errors,errors
  print(device,'PASS career filters, flag/crest browsing, formation portraits and two formations')
  browser.close()
