from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
html=(root/'tests/.generated/play.html').read_text()
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
 for label,ctx_args in [('desktop',{'viewport':{'width':1280,'height':900}}),('touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  page=browser.new_page(**ctx_args);errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.game',timeout=15000)
  page.locator('[data-action=navQuick]').first.click()
  page.locator('[data-action=navOnDevice]').click()
  page.locator('[data-action=quick]').click()
  page.locator('[data-action=setupArcadeShots]').click()
  assert page.locator('#arcadeShotPick').count()==1,label
  page.locator('#arcadeShotPick').select_option('silverCarp')
  assert 'Silver Carp' in page.locator('#arcadeShotPreview').get_attribute('aria-label'),label
  player_id=page.locator('#arcadeShotPlayerPick').input_value()
  page.get_by_role('button',name='✓ DONE — BACK TO MATCH').click()
  page.locator('[data-action=kickoff]').click()
  result=page.evaluate('''(id)=>{
   const game=window.SupermagicFootball.game;
   const selected=game.rosters[0].find(player=>player.id===id);
   return {shot:selected?.shot,ability:selected?.superAbility?.type,level:selected?.superShotLevel,mode:game.mode};
  }''',player_id)
  assert result=={'shot':'silverCarp','ability':'shoot','level':1,'mode':'quick'},(label,result)
  assert not errors,(label,errors)
  print(label,'PASS Arcade Shot Trial selector, live preview and temporary match loadout')
  page.close()
 browser.close()
