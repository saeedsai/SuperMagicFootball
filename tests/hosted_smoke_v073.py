from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import os,threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
t=threading.Thread(target=server.serve_forever,daemon=True);t.start()
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for mobile in [False,True]:
   c=b.new_context(viewport={'width':844 if mobile else 1440,'height':390 if mobile else 900},is_mobile=mobile,has_touch=mobile,service_workers='block')
   p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   p.goto(f'http://127.0.0.1:{server.server_address[1]}/index.html',wait_until='load')
   p.wait_for_function("window.SupermagicFootball?.version==='0.7.3-alpha'")
   assert p.evaluate('SupermagicFootball.teams.length')==216
   p.locator('[data-action="quick"]').click()
   assert p.locator('#preTalkHome').count()==1
   assert p.evaluate('fetch("./src/morale.js").then(r=>r.ok)')
   p.reload(wait_until='load');p.wait_for_function("window.SupermagicFootball?.version==='0.7.3-alpha'")
   assert not errors,errors
   print('HOSTED', 'MOBILE' if mobile else 'DESKTOP','PASS — app modules, service-worker manifest paths, reload, no JS exceptions')
   c.close()
  b.close()
finally:server.shutdown()
