from menu_test_routes import open_quick,open_settings
from pathlib import Path
import shutil
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import threading
from functools import partial
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'play.html').read_text()
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for mobile in (False,True):
  page=b.new_page(viewport={'width':844,'height':390} if mobile else {'width':1366,'height':820},has_touch=mobile,is_mobile=mobile)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'")
  assert page.evaluate('SupermagicFootball.audio.unlocked') is False
  open_settings(page,'sound')
  page.locator('#audioMute').select_option('true')
  page.locator('#audio_master').fill('0')
  page.locator('#audio_music').fill('30')
  page.locator('#audio_sfx').fill('60')
  page.locator('[data-action="saveSettings"]').first.click()
  assert page.evaluate('SupermagicFootball.audio.settings.mute') is True
  assert page.evaluate('SupermagicFootball.audio.settings.master')==0
  open_settings(page,'sound')
  assert page.locator('#audio_master').input_value()=='0'
  assert page.locator('#audio_music').input_value()=='30'
  assert page.locator('[data-act]').count()==4
  assert not errors,errors
  print('PASS audio', 'touch' if mobile else 'desktop','mute, sliders, in-session values, no errors (origin storage unavailable)' ,flush=True)
  page.close()
 b.close()

server.shutdown()
