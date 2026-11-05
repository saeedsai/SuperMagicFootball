from menu_test_routes import open_quick,open_settings,open_feature
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,viewport,mobile in [('desktop',{'width':1440,'height':900},False),('mobile',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();issues=[]
  page.on('pageerror',lambda e:issues.append(str(e)))
  page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
  page.set_content((root/'tests/.generated/play.html').read_text(encoding='utf-8'),wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game')
  open_settings(page,'customize')
  page.locator('[data-action="squad"]').first.click()
  assert 'STA' in page.locator('.rosterCard').first.inner_text(), 'Squad must display stamina'
  assert 'GK DIVING' in page.locator('.roster').inner_text(),'Goalkeeper jump must be on roster'
  page.screenshot(path=str(root/'tests'/f'stats_roster_{name}.png'))
  # The Squad screen's Back now goes through its real parents, not directly Home.
  page.locator('[data-action="navCustomization"]').first.click()
  assert page.locator('.navScreen .heading').inner_text()=='PLAYER & TEAM CUSTOMIZATION', (name,'customization parent')
  page.locator('[data-action="navSettings"]').first.click()
  assert page.locator('.navScreen .heading').inner_text()=='SETTINGS', (name,'settings parent')
  page.locator('[data-action="home"]').first.click()
  open_quick(page)
  page.locator('[data-action="kickoff"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert page.locator('#staminaHud').is_visible()
  assert page.locator('#staminaText').inner_text().startswith('ENERGY')
  meter=page.locator('#staminaHud')
  assert meter.get_attribute('role')=='meter','Energy needs a semantic meter role'
  assert meter.get_attribute('aria-label').startswith('Energy for '),'Accessible name should track selected player'
  initial=int(meter.get_attribute('aria-valuenow'))
  assert 0<=initial<=100 and meter.get_attribute('aria-valuetext')==f'Energy {initial} percent'
  selection=page.evaluate("""async () => {const g=NekketsuHD.game,previous=g.controlled[0],next=g.players.find(p=>p.t===0&&!p.keeper&&p.i!==previous);if(!next)throw Error('no alternate field player');g.controlled[0]=next.i;await new Promise(requestAnimationFrame);return {previous,name:next.src.name};}""")
  page.wait_for_function("name => document.querySelector('#staminaHud')?.getAttribute('aria-label') === 'Energy for '+name",arg=selection['name'],timeout=2500)
  assert meter.get_attribute('aria-label')==f'Energy for {selection["name"]}','Accessible name must follow the active player'
  page.evaluate("""async index => {NekketsuHD.game.controlled[0]=index;await new Promise(requestAnimationFrame);}""",selection['previous'])
  # Advance a focused synthetic activity simulation without waiting for real time.
  page.evaluate("""() => {const g=NekketsuHD.game,p=g.controlledPlayer(0);g.staminaTick(p,65,1);return p.fatigue;}""")
  page.wait_for_function("Number(document.querySelector('#staminaHud')?.getAttribute('aria-valuenow')) < 100",timeout=2500)
  pct=page.locator('#staminaText').inner_text()
  current=int(meter.get_attribute('aria-valuenow'))
  assert pct!='ENERGY 100%',f'Energy HUD did not change: {pct}'
  assert 0<=current<initial and meter.get_attribute('aria-valuetext')==f'Energy {current} percent','Accessible value must match visible meter'
  page.screenshot(path=str(root/'tests'/f'stats_match_{name}.png'))
  page.locator('#pauseBtn').click(force=True)
  assert page.evaluate('NekketsuHD.game.matchState')=='paused'
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert not issues,issues
  print(f'Player stats browser {name}: PASS • squad ratings • GK attributes • live Energy HUD • pause/resume')
  ctx.close()
 browser.close()
