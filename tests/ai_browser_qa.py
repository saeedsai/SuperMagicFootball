from pathlib import Path
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,viewport,mobile in [('desktop',{'width':1440,'height':900},False),('mobile',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  # Sandbox blocks browser navigation; use a localStorage shim for UI persistence handler QA.
  # This does NOT verify real disk persistence after reopening the browser.
  page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
  page.set_content((p/'play.html').read_text(),wait_until='load')
  page.wait_for_function('window.NekketsuHD?.version==="0.8.22.1-alpha"')
  assert page.evaluate('NekketsuHD.aiLevels.length')==5
  page.locator('[data-action="settings"]').first.click()
  assert page.locator('#difficulty option').count()==5
  page.locator('#difficulty').select_option('0')
  assert 'Rookie CPU' in page.locator('#difficultyHint').inner_text()
  page.screenshot(path=str(p/'tests'/f'ai_settings_{name}.png'))
  page.locator('[data-action="saveSettings"]').click()
  page.locator('[data-action="quick"]').first.click()
  assert page.locator('#matchDifficulty').input_value()=='0'
  page.locator('#matchDifficulty').select_option('4')
  assert page.evaluate('NekketsuHD.game.options.difficulty')==4
  page.screenshot(path=str(p/'tests'/f'ai_setup_{name}.png'))
  page.locator('[data-action="kickoff"]').click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  page.locator('#pauseBtn').click(force=True)
  assert page.locator('#liveDifficulty').input_value()=='4'
  page.locator('#liveDifficulty').select_option('1')
  assert page.evaluate('NekketsuHD.game.options.difficulty')==1
  assert page.evaluate('JSON.parse(localStorage.getItem("legend_options")).difficulty')==1
  page.screenshot(path=str(p/'tests'/f'ai_pause_{name}.png'))
  page.locator('[data-action="resume"]').click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert not errors,errors
  print(f'AI difficulty browser QA {name}: PASS · settings, setup, paused live change, resume')
  ctx.close()
 browser.close()
