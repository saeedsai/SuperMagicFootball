from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import threading

from playwright.sync_api import sync_playwright

from menu_test_routes import open_feature

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
  context=browser.new_context(viewport={'width':1280,'height':800})
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.goto(origin,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  page.locator('[data-action="navCareer"]').click()
  page.locator('[data-action="manager"]').click()
  page.locator('#managerClub').wait_for(state='visible')
  page.locator('[data-action="startManager"]').click()
  page.locator('[data-action="editManagerAppearance"]').wait_for(state='visible')
  page.locator('[data-action="editManagerAppearance"]').click()
  preview=page.locator('#customPortrait')
  preview.wait_for(state='visible')
  assert preview.get_attribute('aria-label')=='Rotatable manager preview',preview.get_attribute('aria-label')

  player_page=context.new_page();player_page.goto(origin,wait_until='load')
  player_page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  open_feature(player_page,'playerStudio')
  player_preview=player_page.locator('#customPortrait')
  player_preview.wait_for(state='visible')
  assert player_preview.get_attribute('aria-label')=='Rotatable player preview',player_preview.get_attribute('aria-label')
  assert not errors,errors
  print('MANAGER_PREVIEW_ACCESSIBLE_NAME_BROWSER_PASS manager=Rotatable manager preview player=Rotatable player preview',flush=True)
  context.close();browser.close()
finally:
 server.shutdown();server.server_close()
