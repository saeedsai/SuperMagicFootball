#!/usr/bin/env python3
"""Player Studio reset QA on a real origin so IndexedDB migration is exercised."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'tests/.generated/play.html').read_bytes()
families=['skin','hair','style','face','eyes','brows','eyeColor','nose','lips','body','stature','exaggeration','beard','accessory','freckles','scar','tattoo']
wallet={'schema':1,'tokens':0,'unlocks':[f'{category}:{family}:{index}' for category in ['appearance','accessory'] for family in families for index in range(64)],'receipts':[]}

class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path in ('/','/index.html'):
   self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8')
   self.send_header('Content-Length',str(len(html)));self.end_headers();self.wfile.write(html);return
  super().do_GET()
 def log_message(self,*_args): pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':844,'height':390},True)]:
   context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
   context.add_init_script('localStorage.setItem("legend_tokenWallet",'+json.dumps(json.dumps(wallet))+');')
   page=context.new_page();errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   page.goto(origin,wait_until='load')
   page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
   for action in ('navSettings','navCustomization','playerStudio'):
    page.locator('[data-action="'+action+'"]').first.click()
   reset=page.locator('[data-action="studioResetAppearance"]')
   original=page.locator('#face_style').input_value()
   assert page.locator('#face_style option').count()>1,(label,'migrated unlocked styles were not available')
   page.locator('[data-action="studioGalleryToggle"]').click()
   assert page.locator('canvas[data-studio-view]').count()==8
   page.evaluate("""() => {const field=document.querySelector('#face_style');
    field.selectedIndex=(field.selectedIndex+1)%field.options.length;
    field.dispatchEvent(new Event('input',{bubbles:true}));}""")
   assert page.locator('#face_style').input_value()!=original,(label,'edit failed')
   assert reset.is_enabled(),(label,'reset disabled with pending changes')
   reset.click()
   assert page.locator('#face_style').input_value()==original,(label,'reset did not restore selection')
   assert 'nothing was saved' in page.locator('#studioAppearanceSaveState').inner_text()
   assert page.locator('canvas[data-studio-view]').count()==8,(label,'gallery lost')
   assert page.locator('#touchButtons [data-act]').count()==4
   assert page.evaluate("localStorage.getItem('legend_edits')") is None,(label,'reset persisted data')
   assert not errors,(label,errors)
   print('STUDIO_APPEARANCE_RESET_BROWSER_PASS',label,flush=True)
   context.close()
  browser.close()
finally:
 server.shutdown();server.server_close()
