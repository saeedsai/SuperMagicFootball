#!/usr/bin/env python3
"""UX27/SAVE-103: a failed browser save import stays on-screen and reports rollback."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright
from menu_test_routes import open_settings

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'tests/.generated/play.html'
assert FIXTURE.exists(),'Build the current game fixture first'
FIXTURE_HTML=FIXTURE.read_bytes()
SAVE_KEYS=('legend_options','legend_edits')
SEED={'options':{'ballModel':'classic'},'edits':{'japan':[{'name':'Before Import'}]}}
IMPORT={
 'product':'Supermagic Football','version':'0.12.38.0','exportedAt':'2026-11-02T00:00:00.000Z',
 'data':{'options':{'ballModel':'meteor'},'edits':{'japan':[{'name':'Fault Injection Import'}]}},
}

class FixtureHandler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path in ('/','/index.html'):
   self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8')
   self.send_header('Content-Length',str(len(FIXTURE_HTML)));self.end_headers();self.wfile.write(FIXTURE_HTML);return
  super().do_GET()
 def log_message(self,*_args):pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(FixtureHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}/'

def snapshot(page):
 return page.evaluate('(keys)=>Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)]))',SAVE_KEYS)

def run_device(browser,label,viewport,touch):
 context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch,accept_downloads=True)
 seed=json.dumps(SEED,separators=(',',':'))
 context.add_init_script(f"""(() => {{
   const loads=Number(sessionStorage.getItem('__ux27FaultPageLoads')||0)+1;
   sessionStorage.setItem('__ux27FaultPageLoads',String(loads));
   if(!sessionStorage.getItem('__ux27FaultSeeded')){{
     const seed={seed};
     for(const [key,value] of Object.entries(seed))localStorage.setItem('legend_'+key,JSON.stringify(value));
     sessionStorage.setItem('__ux27FaultSeeded','1');
   }}
 }})();""")
 page=context.new_page();errors=[];dialogs=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 def accept(dialog):
  dialogs.append((dialog.type,dialog.message));dialog.accept()
 page.on('dialog',accept)
 page.goto(origin,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
 open_settings(page,'save')
 before=snapshot(page);assert all(before.values()),(label,'save fixture not seeded',before)
 page.evaluate("""() => {
   const nativeSet=Storage.prototype.setItem;
   window.__ux27FaultInjected=false;
   Storage.prototype.setItem=function(key,value){
     if(key==='legend_edits'&&!window.__ux27FaultInjected){
       window.__ux27FaultInjected=true;
       nativeSet.call(this,key,value);
       throw new DOMException('simulated quota failure after write','QuotaExceededError');
     }
     return nativeSet.call(this,key,value);
   };
 }""")
 page.locator('#saveImportFile').set_input_files({
  'name':'faulted-save-import.json','mimeType':'application/json',
  'buffer':json.dumps(IMPORT,separators=(',',':')).encode('utf-8'),
 })
 page.wait_for_timeout(250)
 after=snapshot(page)
 assert after==before,(label,'failed import changed a stored save byte',before,after)
 assert page.evaluate("sessionStorage.getItem('__ux27FaultPageLoads')")=='1',(label,'failed import reloaded the game')
 assert [kind for kind,_ in dialogs]==['confirm','alert'],(label,'failure must report once and never report success',dialogs)
 alert=dialogs[-1][1]
 assert alert.startswith('Could not import save: Save could not be stored (changes rolled back)'),(label,alert)
 assert page.locator('[data-action="exportSave"]').count()==1,(label,'failed import should leave Save Management open')
 assert not errors,(label,errors)
 print('UX27_SAVE_IMPORT_FAULT_BROWSER_PASS',label,flush=True)
 context.close()

try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  run_device(browser,'desktop',{'width':1280,'height':800},False)
  run_device(browser,'simulated-touch',{'width':844,'height':390},True)
  browser.close()
finally:
 server.shutdown();server.server_close()
