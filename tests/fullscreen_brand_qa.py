"""Integration QA for Supermagic Football branding, standalone, device fullscreen, and legacy saves."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from contextlib import contextmanager
import subprocess, time, urllib.request, os, signal

root=Path(__file__).resolve().parents[1]
@contextmanager
def server():
 p=subprocess.Popen(['python','-m','http.server','18762','--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,preexec_fn=os.setsid)
 try:
  for i in range(50):
   try:
    urllib.request.urlopen('http://127.0.0.1:18762/',timeout=.4);break
   except Exception:time.sleep(.1)
  else: raise RuntimeError('Local server did not start')
  yield 'http://127.0.0.1:18762/'
 finally:os.killpg(p.pid,signal.SIGTERM);p.wait(timeout=10)

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,mobile in [('desktop',{'width':1440,'height':900},False),('android-landscape',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""");page.set_content((root/'play.html').read_text(),wait_until='load');page.wait_for_function("window.NekketsuHD?.version==='0.8.17.1-alpha'")
  assert page.title().startswith('SUPERMAGIC FOOTBALL'),page.title()
  assert 'SUPERMAGIC' in page.locator('.logoHeading').inner_text()
  assert page.locator('.fullscreenTool').is_visible()
  assert page.locator('#fullscreenMatch').count()==1
  import json
  assert json.loads((root/'manifest.webmanifest').read_text())['name']=='Supermagic Football'
  page.locator('.fullscreenTool').click()
  page.wait_for_timeout(700)
  active=page.evaluate('!!document.fullscreenElement')
  # Real headless Chromium permits fullscreen on some builds. When blocked, instructions must appear.
  if active:
   assert page.locator('.fullscreenTool').inner_text().strip()=='⇲ EXIT FULLSCREEN'
   assert page.evaluate("document.fullscreenElement.id")=='app'
   page.screenshot(path=str(root/'tests'/f'fullscreen_{label}.png'))
   page.locator('.fullscreenTool').click()
   page.wait_for_function('!document.fullscreenElement')
  else:
   assert page.locator('#fullscreenHelp').is_visible()
   page.locator('#fullscreenHelpClose').click()
  page.locator('[data-action="quick"]').click()
  page.locator('[data-action="kickoff"]').click()
  assert page.locator('#fullscreenMatch').is_visible()
  page.locator('#fullscreenMatch').click()
  page.wait_for_timeout(300)
  if page.evaluate('!!document.fullscreenElement'):
   assert page.evaluate('document.fullscreenElement.id')=='app'
   page.screenshot(path=str(root/'tests'/f'match_fullscreen_{label}.png'))
   page.locator('#fullscreenMatch').click()
  else:
   assert page.locator('#fullscreenHelp').is_visible()
   page.locator('#fullscreenHelpClose').click()
  assert not errors,errors
  print('BRANDING & FULLSCREEN '+label+': PASS | game/menu control | fullscreen/fallback | PWA metadata | no JS exceptions')
  ctx.close()
 # Browser fallback test: deliberately remove fullscreen API as on unsupported iOS environments.
 ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 page=ctx.new_page()
 page.evaluate("Object.defineProperty(Element.prototype,'requestFullscreen',{value:undefined,configurable:true});Object.defineProperty(Element.prototype,'webkitRequestFullscreen',{value:undefined,configurable:true})")
 page.set_content((root/'play.html').read_text());page.wait_for_function("window.NekketsuHD?.version==='0.8.17.1-alpha'")
 page.locator('.fullscreenTool').click()
 assert page.locator('#fullscreenHelp').is_visible()
 assert 'iPhone' in page.locator('#fullscreenHelpText').inner_text()
 page.screenshot(path=str(root/'tests/fullscreen_unsupported_phone.png'))
 page.locator('#fullscreenHelpClose').click()
 assert not page.locator('#fullscreenHelp').is_visible()
 print('UNSUPPORTED FULLSCREEN FALLBACK: PASS | truthful install instructions | dismissible')
 ctx.close()
 # Legacy import/export and fresh saved game remains portable.
 ctx=browser.new_context(viewport={'width':1140,'height':800},accept_downloads=True)
 page=ctx.new_page();page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""");page.set_content((root/'play.html').read_text());page.wait_for_function('window.NekketsuHD')
 page.locator('[data-action="settings"]').click()
 with page.expect_download() as download_info:page.locator('[data-action="exportSave"]').click()
 download=download_info.value
 assert download.suggested_filename.startswith('Supermagic_Football_Save_'),download.suggested_filename
 import json
 artifact=root/'tests'/'old_name_save.json'
 artifact.write_text(json.dumps({'product':'Nekketsu Legends HD','version':'0.7','data':{'options':{'difficulty':3}}}))
 saved_log=[]
 page.on('console', lambda msg: saved_log.append(msg.text))
 page.evaluate("localStorage.setItem=(k,v)=>console.log('IMPORT_WRITE',k,v)")
 page.on('dialog',lambda dialog:dialog.accept())
 page.locator('#saveImportFile').set_input_files(str(artifact))
 page.wait_for_timeout(450)
 assert any('IMPORT_WRITE legend_options' in m and '\"difficulty\":3' in m for m in saved_log),saved_log
 print('SAVE EXPORT & LEGACY IMPORT: PASS | new filename | old product accepted | existing storage prefix retained')
 ctx.close();browser.close()
print('All v0.7.2 browser QA completed')
