from menu_test_routes import open_feature
from pathlib import Path
import os
import shutil
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
fixture=root/'tests'/'.generated'/'play.html'
if not fixture.exists(): fixture=root/'play.html'
class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as pw:
 executable=shutil.which('chromium') or shutil.which('chromium-browser')
 if not executable and os.name=='nt':
  executable=next(iter((Path(os.environ.get('LOCALAPPDATA',''))/'ms-playwright').glob('chromium-*/chrome-win*/chrome.exe')),None)
 browser=pw.chromium.launch(headless=True, executable_path=str(executable) if executable else None,args=['--no-sandbox','--disable-dev-shm-usage'])
 for ismobile in (False, True):
  ctx=browser.new_context(viewport={'width':845 if ismobile else 1440,'height':390 if ismobile else 900},is_mobile=ismobile,has_touch=ismobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}/tests/.generated/play.html' if fixture.parent.name=='.generated' else f'http://127.0.0.1:{server.server_port}/play.html')
  page.wait_for_timeout(400)
  open_feature(page,'manager')
  assert page.locator('#managerContinent option').count() >= 6
  assert page.locator('#managerCountry option').count() >= 1
  page.locator('#managerContinent').select_option('CAF')
  page.locator('#managerCountry').select_option('RSA')
  assert 1 <= page.locator('#managerClub option').count() < 100
  # Test African team chosen from newly added participant list.
  index=page.evaluate('NekketsuHD.teams.find(t=>t.name==="Mamelodi Sundowns").index')
  page.locator('#managerClub').select_option(str(index))
  page.locator('[data-action=startManager]').click()
  assert page.evaluate('NekketsuHD.getCareer().club')==index,errors
  assert page.locator('[data-action=careerScout]').count()>=1
  page.locator('[data-action=careerScout]').first.click()
  page.locator('[data-action=careerScoutNew]').click()
  assert page.evaluate('NekketsuHD.getCareer().scouted.length')==1
  page.locator('[data-action=careerSign0]').click()
  assert page.locator('#academyOutgoing').get_attribute('aria-label') is None
  assert page.locator('label[for="academyOutgoing"]').inner_text()=='PLAYER TO REPLACE'
  assert page.locator('#academySigningSummary').get_attribute('aria-live')=='polite'
  before=page.evaluate("""()=>({career:JSON.stringify(NekketsuHD.getCareer()),careerData:NekketsuHD.getCareer(),slots:localStorage.getItem('legend_careerSlots'),mirror:localStorage.getItem('legend_managerCareer')})""")
  # Confirming with the empty placeholder is invalid and must not write anything.
  page.locator('[data-action=careerSignConfirm]').click()
  assert 'Choose one of your twelve squad members' in page.locator('#academySigningSummary').inner_text()
  invalid=page.evaluate("""()=>({career:JSON.stringify(NekketsuHD.getCareer()),careerData:NekketsuHD.getCareer(),slots:localStorage.getItem('legend_careerSlots'),mirror:localStorage.getItem('legend_managerCareer')})""")
  assert invalid==before,(ismobile,before,invalid)
  page.locator('#academyOutgoing').select_option('11')
  assert 'take shirt number' in page.locator('#academySigningSummary').inner_text()
  page.locator('[data-action=careerSignCancel]').click()
  cancelled=page.evaluate("""()=>({career:JSON.stringify(NekketsuHD.getCareer()),careerData:NekketsuHD.getCareer(),slots:localStorage.getItem('legend_careerSlots'),mirror:localStorage.getItem('legend_managerCareer')})""")
  assert cancelled==before,(ismobile,before,cancelled)
  page.locator('[data-action=careerSign0]').click()
  page.locator('#academyOutgoing').select_option('11')
  page.locator('[data-action=careerSignConfirm]').click()
  after=page.evaluate("""()=>({career:NekketsuHD.getCareer(),slots:JSON.parse(localStorage.getItem('legend_careerSlots')),mirror:JSON.parse(localStorage.getItem('legend_managerCareer'))})""")
  assert len(after['career']['roster'])==12
  assert len({p['id'] for p in after['career']['roster']})==12
  assert after['career']['roster'][11]['id'].startswith('youth_')
  assert after['career']['roster'][11]['num']==before['careerData']['roster'][11]['num']
  assert len(after['career']['scouted'])==0
  assert after['career']['cash']==before['careerData']['cash']-__import__('math').ceil(after['career']['roster'][11]['value']*.55)
  assert [p['id'] for p in after['career']['roster'][:11]]==[p['id'] for p in before['careerData']['roster'][:11]]
  assert after['mirror']['roster'][11]['id']==after['career']['roster'][11]['id']
  assert after['slots']['slots'][0]['career']['roster'][11]['id']==after['career']['roster'][11]['id']
  open_feature(page,'manager') if page.locator('[data-action=manager]').count() else None
  page.locator('[data-action=careerSquad]').first.click()
  page.locator('[data-careerrenew="0"]').click()
  assert page.evaluate('NekketsuHD.getCareer().roster[0].contractYears')>=2
  page.locator('[data-careerrecover="0"]').click()
  assert not errors, errors
  print('Manager recruiting and contracts', 'mobile' if ismobile else 'desktop','PASS')
  ctx.close()
 browser.close()
server.shutdown()
