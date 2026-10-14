from menu_test_routes import open_quick,open_settings
"""Chromium simulated browser-storage rehydration and audio smoke on desktop and touch.
IMPORTANT: The sandbox blocks Chromium URL navigation (ERR_BLOCKED_BY_ADMINISTRATOR).
Storage is simulated in memory and re-injected across freshly created pages; this is NOT
normal-origin localStorage certification or physical audio/speaker/Safari verification.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil,json
root=Path(__file__).resolve().parents[1]
html=(root/'play.html').read_text()
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for touch in (False,True):
  ctx=browser.new_context(viewport={'width':844,'height':390} if touch else {'width':1280,'height':800},is_mobile=touch,has_touch=touch)
  saved={}
  def load_page():
   p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   # A deliberately explicit storage shim, NOT browser-origin storage.
   shim="""<script>window.__audioTestStorage=STORAGE_VALUE;
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>Object.prototype.hasOwnProperty.call(window.__audioTestStorage,k)?window.__audioTestStorage[k]:null,
      setItem:(k,v)=>{window.__audioTestStorage[k]=String(v)},removeItem:k=>{delete window.__audioTestStorage[k]}
    }});</script>""".replace('STORAGE_VALUE',json.dumps(saved))
   p.set_content(html.replace('<script type="module">',shim+'<script type="module">',1),wait_until='load')
   p.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=30000)
   return p,errors
  page,errors=load_page()
  assert not page.evaluate('SupermagicFootball.audio.unlocked'),'No audio until user gesture'
  open_settings(page,'sound')
  page.locator('#audioMute').select_option('false')
  for key,value in {'master':'80','music':'55','sfx':'60','ui':'35','ambience':'85'}.items():page.locator('#audio_'+key).fill(value)
  page.locator('[data-action="saveSettings"]').first.click()
  saved=page.evaluate('window.__audioTestStorage')
  assert json.loads(saved['legend_audioOptions'])['ambience']==85
  page.close();page,errors=load_page()
  assert page.evaluate('SupermagicFootball.audio.settings.music')==55
  assert page.evaluate('SupermagicFootball.audio.settings.ambience')==85
  open_settings(page,'sound')
  assert page.locator('#audio_ambience').input_value()=='85'
  page.locator('#audioMute').select_option('true')
  page.locator('[data-action="saveSettings"]').first.click()
  saved=page.evaluate('window.__audioTestStorage');assert json.loads(saved['legend_audioOptions'])['mute']
  page.close();page,errors=load_page()
  assert page.evaluate('SupermagicFootball.audio.settings.mute')
  open_settings(page,'sound')
  page.locator('#audioMute').select_option('false')
  page.locator('[data-action="saveSettings"]').first.click()
  saved=page.evaluate('window.__audioTestStorage')
  assert json.loads(saved['legend_options'])['sfx'] is True,'legacy sound toggle must track master unmute'
  page.evaluate('SupermagicFootball.audio.unlock()')
  page.evaluate("SupermagicFootball.audio.sceneChange('match')")
  assert page.evaluate('SupermagicFootball.audio.unlocked && !!SupermagicFootball.audio.ctx')
  assert page.evaluate('!!SupermagicFootball.audio.ambienceNode'),'Crowd sound must be started'
  page.evaluate('SupermagicFootball.audio.suspend()')
  assert page.evaluate('SupermagicFootball.audio.ambienceNode===null')
  page.evaluate('SupermagicFootball.audio.resume()')
  assert page.evaluate('!!SupermagicFootball.audio.ambienceNode')
  page.evaluate('SupermagicFootball.audio.sceneChange("halftime")')
  assert page.evaluate('!!SupermagicFootball.audio.voice')
  assert page.locator('[data-act]').count()==4
  assert not errors,errors
  print('PASS simulated browser storage', 'touch' if touch else 'desktop','rehydration, mute and legacy sound migration, crowd audio nodes, lifecycle, four actions',flush=True)
  page.close();ctx.close()
 browser.close()
