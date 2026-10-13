from pathlib import Path
import socket,subprocess,time
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
server=subprocess.Popen(['python','-m','http.server',str(port),'--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  ctx=browser.new_context(viewport={'width':1366,'height':768})
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  url=f'http://127.0.0.1:{port}/play.html'
  ready=False
  for _ in range(25):
   try:page.goto(url,wait_until='load',timeout=1500);ready=True;break
   except Exception:time.sleep(.2)
  assert ready,'HTTP game did not load'
  page.wait_for_function("NekketsuHD.version==='0.7.3-alpha'")
  assert page.evaluate('NekketsuHD.teams.length')==216
  page.locator('[data-action="quick"]').first.click()
  page.locator('[data-action="prepHome"]').click()
  page.locator('#attackStyle').select_option('Possession')
  page.locator('[data-action="saveSquad"]').click()
  assert page.evaluate("JSON.parse(localStorage.getItem('legend_teamPlans')).japan.attack")=='Possession'
  page.reload(wait_until='load')
  page.wait_for_function("NekketsuHD.version==='0.7.3-alpha'")
  assert page.evaluate('NekketsuHD.getTeamPlan(0).attack')=='Possession'
  page.locator('[data-action="quick"]').first.click()
  page.locator('[data-action="kickoff"]').click()
  page.wait_for_timeout(500)
  assert page.evaluate('NekketsuHD.game.teamPlans[0].attack')=='Possession'
  assert not errors,errors
  browser.close()
  print('HOSTED Chromium: PASS · standalone HTML via HTTP · real localStorage survives reload · launch, saved plan and match · no JS errors')
finally:server.terminate();server.wait(timeout=10)
