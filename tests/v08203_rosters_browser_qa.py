from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parents[1]/'play.html').read_text()
with sync_playwright() as pw:
 for device in ['desktop','simulated Android']:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  ctx=browser.new_context(viewport={'width':1360,'height':820} if device=='desktop' else {'width':720,'height':390},has_touch=device!='desktop',is_mobile=device!='desktop')
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.22.1-alpha'",timeout=20000)
  for club,player,expected_shirt in [('Bayern Munich','Harry Kane',9),('Paris Saint-Germain','Ousmane Dembélé',10)]:
   squad=page.evaluate('''name => {const t=SupermagicFootball.teams.find(t=>t.name===name&&t.id.startsWith('club26_'));return {index:t.index,players:SupermagicFootball.rosterFor(t.index)};}''',club)
   assert len(squad['players'])==12,club
   assert len(set(p['num'] for p in squad['players']))==12,club
   assert all(p['rosterVerification']=='verified_club_role' and p['shirtVerified'] and p['ageVerified'] for p in squad['players']),club
   assert not any(p['statsVerified'] or p['appearanceVerified'] for p in squad['players']),club
   assert next(p for p in squad['players'] if p['name']==player)['num']==expected_shirt
   page.locator('[data-action="quick"]').first.click()
   page.locator('select#homeTeam').select_option(str(squad['index']))
   page.locator('[data-action="prepHome"]').first.click()
   assert page.get_by_text(player).count()>0,(device,club,player)
   assert page.locator('.formationSlot canvas').count()==6,(device,club)
   assert page.locator('.playerFaceCanvas').count()==12,(device,club)
   assert 'OVR' in page.locator('body').inner_text(),(device,club,'missing OVR')
   page.set_content(html,wait_until='load')
   page.wait_for_function("window.SupermagicFootball?.version==='0.8.22.1-alpha'",timeout=20000)
  assert not errors,errors
  print(device,'PASS Bayern and PSG: 2026/27 roster, shirts, DOB, formation portraits, and OVR',flush=True)
  browser.close()
