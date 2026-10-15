from menu_test_routes import open_quick,open_settings
"""Standalone desktop/touch browser signoff for the seventh BPW squad."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
markup=(Path(__file__).resolve().parents[1]/'play.html').read_text()
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,mobile in [('desktop',False),('simulated touch',True)]:
  ctx=browser.new_context(viewport={'width':1340,'height':820} if not mobile else {'width':850,'height':420},is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(markup,wait_until='load');page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=20000)
  data=page.evaluate('''() => { const api=SupermagicFootball,t=api.teams.find(t=>t.id==='bpw_alltime_legendary_12');const r=api.rosterFor(t.index);return {teams:api.teams.length,index:t.index,role:r.map(p=>p.role),names:r.map(p=>p.name),ratings:r.map(p=>p.legendaryRating),wc:api.teams.filter(t=>t.group==='bpw_worldcup').length,buttons:[...document.querySelectorAll('[data-act]')].map(e=>e.dataset.act).sort()};}''')
  assert data['teams']==223 and data['index']==222 and data['wc']==6,data
  assert data['role']==['GK']*2+['DF']*3+['MF']*4+['FW']*3,data
  assert data['ratings']==[99,98,99,99,98,99,99,99,99,99,99,99],data
  assert data['buttons']==['dribble','jump','pass','shoot'],data
  open_quick(page)
  page.locator('#homeGroup').select_option('bpw_alltime')
  assert len(page.locator('#homeTeam option').all_text_contents())==1
  assert 'All-Time' in page.locator('#homeTeam option').first.inner_text()
  # One unique all-time team cannot be both home and away at once.
  # Verify the away filter after returning home to a different team.
  page.locator('#homeGroup').select_option('all')
  page.locator('#homeTeam').select_option('0')
  page.locator('#awayGroup').select_option('bpw_alltime')
  assert len(page.locator('#awayTeam option').all_text_contents())==1
  page.locator('#awayGroup').select_option('all')
  page.locator('#homeGroup').select_option('bpw_alltime')
  page.locator('#homeTeam').select_option('222')
  page.locator('[data-action="setupTactics"]').click()
  page.locator('[data-action="prepHome"]').first.click()
  assert page.locator('.formationSlot canvas').count()==6
  assert page.locator('.playerFaceCanvas').count()==12
  assert 'Lev Yashin' in page.locator('body').inner_text()
  assert 'LEG 99' in page.locator('body').inner_text()
  assert not errors,(label,errors)
  print('PASS all-time browser',label,'selection, twelve portraits, six formation faces, seventh BPW, four controls')
  ctx.close()
 browser.close()
