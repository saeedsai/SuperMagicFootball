from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import threading

from playwright.sync_api import sync_playwright

from menu_test_routes import open_quick

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'tests/.generated/play.html'
assert FIXTURE.exists(),'Build the current modular browser fixture first'
FIXTURE_HTML=FIXTURE.read_bytes()

class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path in ('/','/index.html'):
   self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8')
   self.send_header('Content-Length',str(len(FIXTURE_HTML)));self.end_headers();self.wfile.write(FIXTURE_HTML);return
  super().do_GET()
 def log_message(self,*_args):pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}/'

try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1280,'height':800});errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.goto(origin,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  open_quick(page)
  page.locator('[data-action="setupTactics"]').click()
  page.locator('[data-action="prepHome"]').click()
  expected=['Starter 1, goalkeeper','Starter 2, defender','Starter 3, defender','Starter 4, midfielder','Starter 5, forward','Starter 6, forward']
  for index,name in enumerate(expected):
   select=page.locator('#pos'+str(index))
   select.wait_for(state='visible')
   assert select.get_attribute('aria-label')==name,(index,select.get_attribute('aria-label'),name)
   assert 'ENERGY ' in select.locator('option:checked').inner_text().upper(),(index,'starter choice must include current Energy')
   rating=page.locator(f'[data-lineup-ovr="{index}"]')
   assert 'ENERGY' in rating.inner_text().upper(),(index,'starter row must show Energy')
   assert 'Energy' in (rating.get_attribute('aria-label') or ''),(index,'Energy must be announced accessibly')
  assert page.locator('.formationEnergy').count()==6,'every formation position must show Energy'
  assert page.locator('.rosterCard').count()==12,'starting and bench roster must remain visible'
  assert all('ENERGY ' in card.inner_text().upper() for card in page.locator('.rosterCard').all()),'starter and substitute Energy values must be visible'
  page.screenshot(path=str(ROOT/'docs'/'FORMATION_ENERGY_SETUP_20261104.png'),full_page=True)
  assert not errors,errors
  print('FORMATION_STARTER_ACCESSIBLE_NAMES_BROWSER_PASS six role-and-order labels',flush=True)
  browser.close()
finally:
 server.shutdown();server.server_close()
