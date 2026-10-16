from menu_test_routes import open_quick,open_settings
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parents[1]/'play.html').read_text()
with sync_playwright() as pw:
 for device in ['desktop','simulated Android']:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
  ctx=browser.new_context(viewport={'width':1400,'height':800} if device=='desktop' else {'width':720,'height':390},has_touch=device!='desktop',is_mobile=device!='desktop')
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load');page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=30000)
  for club,star in [('Real Madrid','Kylian Mbappé'),('Arsenal','Bukayo Saka')]:
   squad=page.evaluate('''name => {let t=window.SupermagicFootball.teams.find(t=>t.name===name&&t.id.startsWith('club26_'));return {index:t.index,players:window.SupermagicFootball.rosterFor(t.index)};}''',club)
   assert len(squad['players'])==12,club
   assert len(set(p['num'] for p in squad['players']))==12,club
   assert all(not p.get('fictional') and p.get('ratingSource','').startswith('FC27') for p in squad['players']),club
   assert not any(p['statsVerified'] or p['appearanceVerified'] for p in squad['players']),club
   open_quick(page)
   page.locator('select#homeTeam').select_option(str(squad['index']))
   page.locator('[data-action="setupTactics"]').click()
   page.locator('[data-action="prepHome"]').first.click()
   assert page.get_by_text(star).count()>0,(device,club,star)
   assert page.locator('.formationSlot canvas').count()==6,(device,club)
   assert page.locator('.playerFaceCanvas').count()==12,(device,club)
   assert page.locator('.playerOverall').count()>0 or 'OVR' in page.locator('body').inner_text(),(device,club,'OVR missing')
   page.set_content(html,wait_until='load')
   page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=30000)
  assert not errors,errors
  print(device,'PASS Real Madrid and Arsenal 2026/27 names, shirts, ages, formation faces & OVR',flush=True)
  browser.close()
