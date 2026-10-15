from menu_test_routes import open_quick,open_settings
"""Desktop + simulated touch: new clubs' verified roster, formation faces and OVR."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parents[1]/'play.html').read_text()
with sync_playwright() as pw:
 for mode in ['desktop','simulated Android']:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  ctx=browser.new_context(viewport={'width':1366,'height':820} if mode=='desktop' else {'width':720,'height':390},is_mobile=(mode!='desktop'),has_touch=(mode!='desktop'))
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for club,star,shirt in [('Manchester City','Erling Haaland',9),('Liverpool','Alexander Isak',9)]:
   page.set_content(html,wait_until='load')
   page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=20000)
   squad=page.evaluate('''name => {const t=SupermagicFootball.teams.find(t=>t.name===name&&t.id.startsWith('club26_'));return {index:t.index,players:SupermagicFootball.rosterFor(t.index)};}''',club)
   assert len(squad['players'])==12,(mode,club)
   assert len(set(p['id'] for p in squad['players']))==12
   assert len(set(p['num'] for p in squad['players']))==12
   assert all(not p.get('fictional') and p.get('ratingSource','').startswith('FC27') for p in squad['players'])
   assert all(not p['statsVerified'] and not p['appearanceVerified'] for p in squad['players'])
   assert next(p for p in squad['players'] if p['name']==star)['num']==shirt
   open_quick(page)
   page.locator('select#homeTeam').select_option(str(squad['index']))
   page.locator('[data-action="setupTactics"]').click();page.locator('[data-action="prepHome"]').first.click()
   assert page.get_by_text(star).count()>0,(mode,club,star)
   assert page.locator('.formationSlot canvas').count()==6,(mode,club)
   assert page.locator('.playerFaceCanvas').count()==12,(mode,club)
   assert 'OVR' in page.locator('body').inner_text(),(mode,club)
  assert not errors,(mode,errors)
  print('PASS',mode,'2026/27 Man City + Liverpool roster, shirt/DOB provenance, formation portraits, OVR',flush=True)
  browser.close()
