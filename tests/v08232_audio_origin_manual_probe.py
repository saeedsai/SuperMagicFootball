from menu_test_routes import open_quick,open_settings
"""OPTIONAL MANUAL NORMAL-ORIGIN PROBE — not included in the default master suite.

Normal-origin persistence and Web Audio smoke on Chromium desktop and emulated touch.
An actual physical speaker, Safari, iOS and Bluetooth latency are NOT certified by this test.
"""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import shutil
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=user-gesture-required'])
  for touch in (False,True):
   ctx=browser.new_context(viewport={'width':844,'height':390} if touch else {'width':1280,'height':800},is_mobile=touch,has_touch=touch,service_workers='block')
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   try:
    page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='load')
   except Exception as exc:
    if 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(exc):
     raise SystemExit('BLOCKED (not PASS): sandbox administrator disallows browser HTTP navigation; run this optional origin probe on a normal desktop environment.') from None
    raise
   page.wait_for_function("!!window.SupermagicFootball?.game",timeout=30000)
   assert not page.evaluate('SupermagicFootball.audio.unlocked'),'No music before click'
   open_settings(page,'sound')
   page.locator('#audioMute').select_option('false')
   for key,value in {'master':'80','music':'55','sfx':'60','ui':'35','ambience':'85'}.items():
    page.locator('#audio_'+key).fill(value)
   page.locator('[data-action="saveSettings"]').first.click()
   assert page.evaluate("JSON.parse(localStorage.getItem('legend_audioOptions')).ambience")==85
   page.reload(wait_until='load');page.wait_for_function('window.SupermagicFootball?.audio',timeout=30000)
   assert page.evaluate('SupermagicFootball.audio.settings.ambience')==85
   assert page.evaluate('SupermagicFootball.audio.settings.music')==55
   open_settings(page,'sound')
   assert page.locator('#audio_ambience').input_value()=='85'
   assert page.locator('#audio_music').input_value()=='55'
   page.locator('#audioMute').select_option('true')
   page.locator('[data-action="saveSettings"]').first.click()
   assert page.evaluate("JSON.parse(localStorage.getItem('legend_audioOptions')).mute") is True
   page.reload(wait_until='load');page.wait_for_function('window.SupermagicFootball?.audio')
   assert page.evaluate('SupermagicFootball.audio.settings.mute') is True
   open_settings(page,'sound')
   page.locator('#audioMute').select_option('false')
   page.locator('[data-action="saveSettings"]').first.click()
   assert page.evaluate("JSON.parse(localStorage.getItem('legend_options')).sfx") is True,'legacy sound toggle must track unmute'
   page.evaluate("SupermagicFootball.audio.sceneChange('match')")
   open_settings(page,'sound') # gesture unlock on desktop/touch
   page.evaluate('SupermagicFootball.audio.unlock()')
   page.evaluate("SupermagicFootball.audio.sceneChange('match')")
   assert page.evaluate('SupermagicFootball.audio.ctx!==null && SupermagicFootball.audio.unlocked')
   # Explicitly enter a match-audio scene without disturbing gameplay state.
   page.evaluate("SupermagicFootball.audio.sceneChange('menu'); SupermagicFootball.audio.sceneChange('match')")
   assert page.evaluate('!!SupermagicFootball.audio.ambienceNode'),'Original crowd ambience buffer source starts'
   page.evaluate('SupermagicFootball.audio.suspend()')
   assert page.evaluate('SupermagicFootball.audio.ambienceNode===null')
   page.evaluate('SupermagicFootball.audio.resume()')
   assert page.evaluate('!!SupermagicFootball.audio.ambienceNode')
   page.evaluate('SupermagicFootball.audio.sceneChange("halftime")')
   assert page.evaluate('!!SupermagicFootball.audio.voice')
   assert page.locator('[data-act]').count()==4
   assert not errors,errors
   print('PASS origin-backed audio,','touch' if touch else 'desktop','saved/reloaded volume and mute, unmute legacy migration, crowd, lifecycle, four actions',flush=True)
   ctx.close()
  browser.close()
finally:
 server.shutdown()
