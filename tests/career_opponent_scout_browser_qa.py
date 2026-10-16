#!/usr/bin/env python3
"""Real playable Manager Career read-only next fixture scout on desktop and touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Build current modular fixture first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                               ('simulated-touch',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.evaluate("""() => {const db=new Map();
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,String(v)),
      removeItem:k=>db.delete(k),clear:()=>db.clear()}})}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
  open_feature(page,'manager')
  assert page.locator('#careerOpponentScout').count()==0,(device,'no career before setup')
  assert page.locator('#managerClub').count()==1,(device,'career club setup lost')
  page.locator('[data-action="startManager"]').first.click()
  panel=page.locator('#careerOpponentScout')
  assert panel.count()==1,(device,'scout missing from next fixture')
  assert panel.get_attribute('aria-label')=='Next opponent scouting report'
  text=panel.inner_text()
  for phrase in ('NEXT OPPONENT SCOUT','ATTACK / DEFENCE / KEEPER',
                 'KEY OUTFIELD THREAT','LEAGUE RECORD','TACTICAL IDEA',
                 'SQUAD READINESS','Scouting advice only'):
   assert phrase in text,(device,phrase,text)
  assert panel.locator('button').count()==0,(device,'scout must be read-only')
  assert page.locator('[data-action="careerPlay"]').count()==1,(device,'play-next-match lost')
  assert page.locator('[data-action="careerSquad"]').count()==1,(device,'career squad lost')
  assert page.locator('#touchButtons [data-act]').count()==4,(device,'four game actions changed')
  def snapshot():
   return page.evaluate("""() => ({
    career:JSON.stringify(NekketsuHD.getCareer()),
    stored:localStorage.getItem('legend_managerCareer'),
    game:JSON.stringify({score:NekketsuHD.game.score,teamPlans:NekketsuHD.game.teamPlans,
      rosters:NekketsuHD.game.rosters.map(s=>s.map(p=>p.id))}),
    buttons:document.querySelectorAll('#touchButtons [data-act]').length})""")
  before=snapshot()
  page.locator('[data-action="careerSquad"]').first.click()
  assert page.locator('.squadEntry').count()==12,(device,'existing career roster altered')
  open_feature(page,'manager')
  assert page.locator('#careerOpponentScout').count()==1
  assert snapshot()==before,(device,'scouting/navigation mutated career or save')
  # Seed only game state in-browser to verify live squad-fitness advisory branch.
  page.evaluate("""() => {const c=NekketsuHD.getCareer();c.roster[0].condition=39;}""")
  page.locator('[data-action="careerSquad"]').first.click()
  open_feature(page,'manager')
  assert 'below 60% fitness or injured' in page.locator('#careerOpponentScout').inner_text(),device
  after_seed=snapshot()
  page.locator('[data-action="careerSquad"]').first.click()
  open_feature(page,'manager')
  assert snapshot()==after_seed,(device,'advice must not write after injury/fitness change')
  page.locator('[data-action="careerPlay"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play',(device,'career kickoff not playable')
  assert page.evaluate('NekketsuHD.game.mode')=='career'
  assert not errors,(device,errors)
  print('CAREER_OPPONENT_SCOUT_BROWSER_PASS',device,
        'genuine career creation, projected opponent, safe non-mutating scout, unchanged four actions and kickoff',
        flush=True)
  ctx.close()
 browser.close()
