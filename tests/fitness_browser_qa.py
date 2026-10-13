from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,mobile in [('desktop',{'width':1440,'height':900},False),('mobile',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page(); errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
  page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.NekketsuHD?.version==='0.8.17.1-alpha'")
  page.locator('[data-action="quick"]').first.click()
  page.locator('[data-action="kickoff"]').click()
  page.evaluate('''() => {let g=NekketsuHD.game;g.player(0,2).fatigue=.73;g.staminaTick(g.player(0,2),.1,.2);}''')
  page.locator('#pauseBtn').click(force=True)
  page.locator('[data-action="tacticHome"]').click()
  assert 'SUBSTITUTIONS' in page.locator('.panel').first.inner_text()
  assert '0 / 3' in page.locator('.panel').first.inner_text()
  assert 'FIT ' in page.locator('.roster').first.inner_text()
  # First non-GK bench is guaranteed for Classic Japan.
  original=page.evaluate('NekketsuHD.game.lineups[0][2]')
  bench=page.evaluate('''() => {let g=NekketsuHD.game;return g.rosters[0].findIndex((p,i)=>!g.lineups[0].includes(i)&&p.role!=="GK");}''')
  assert bench>=0
  page.locator('#pos2').select_option(str(bench))
  if page.locator('#role_captain').input_value()==str(original):page.locator('#role_captain').select_option(str(bench))
  page.locator('[data-action="saveSquad"]').click()
  assert page.evaluate('NekketsuHD.game.substitutionsUsed[0]')==1
  assert page.evaluate('NekketsuHD.game.matchState')=='paused'
  page.locator('[data-action="tacticHome"]').click()
  assert '1 / 3' in page.locator('.panel').first.inner_text()
  page.screenshot(path=str(root/'tests'/f'fitness_substitutions_{device}.png'),full_page=True)
  assert not errors,errors
  print('v0.7.1 fitness browser '+device+': PASS • paused substitution • 1/3 limit • fitness indicators • no JS errors')
  ctx.close()
 browser.close()
