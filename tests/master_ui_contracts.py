from menu_test_routes import open_quick,open_settings
#!/usr/bin/env python3
"""Repeatable desktop and simulated-touch UI smoke of actual standalone HTML."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'play.html').read_text()
with sync_playwright() as pw:
 for mode in ['desktop','simulated Android']:
  b=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  c=b.new_context(viewport={'width':1366,'height':820} if mode=='desktop' else {'width':720,'height':390},is_mobile=(mode!='desktop'),has_touch=(mode!='desktop'))
  p=c.new_page();errs=[];p.on('pageerror',lambda err:errs.append(str(err)))
  p.set_content(html,wait_until='load');p.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=20000)
  assert p.locator('[data-act]').count()==4,(mode,'action count')
  assert set(p.locator('[data-act]').evaluate_all('(els)=>els.map(e=>e.dataset.act)'))=={'shoot','pass','jump','dribble'}
  assert len(p.evaluate('SupermagicFootball.teams'))==223
  open_quick(p)
  assert p.locator('select#homeTeam').count()==1
  p.locator('[data-action="setupTactics"]').click()
  p.locator('[data-action="prepHome"]').first.click()
  assert p.locator('.formationSlot canvas').count()==6
  assert p.locator('.playerFaceCanvas').count()==12
  assert 'OVR' in p.locator('body').inner_text()
  assert not errs,(mode,errs)
  print('PASS',mode,'four action buttons, home team selection, 6 formation faces, 12 roster portraits, OVR, no page errors',flush=True)
  b.close()
