#!/usr/bin/env python3
"""Real Manager Career fixture bench advice, desktop and simulated-touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Run python3 scripts/build.py to make current game fixture'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in (
   ('desktop',{'width':1280,'height':720},False),
   ('simulated-touch',{'width':844,'height':390},True)):
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {const data=new Map();
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
    getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
    removeItem:k=>data.delete(k),clear:()=>data.clear()}})}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
  open_feature(page,'manager')
  assert page.locator('#careerBenchReadiness').count()==0,(device,'before career')
  page.locator('[data-action="startManager"]').first.click()
  advice=page.locator('#careerBenchReadiness')
  assert advice.count()==1,(device,'real Manager fixture lacks bench advice')
  assert 'No replacements advised' in advice.inner_text(),(device,advice.inner_text())
  assert page.locator('[data-action="careerPlay"]').count()==1,(device,'kickoff missing')
  assert page.locator('#touchButtons button[data-act]').count()==4,(device,'four action contract')

  seeded=page.evaluate("""() => {
    const c=NekketsuHD.getCareer(),keepers=c.roster.map((p,i)=>({p,i})).filter(x=>x.p.role==='GK');
    if(keepers.length!==2)throw Error('Expected 2 actual career goalkeepers');
    for(const p of c.roster){p.condition=100;p.injuryWeeks=0;}
    // The ordinary default lineup uses the first goalkeeper.
    keepers[0].p.injuryWeeks=2;
    keepers[1].p.condition=93;
    return {starter:keepers[0].p.name,reserve:keepers[1].p.name,ids:c.roster.map(p=>p.id)};
  }""")
  # UI rerender via existing career squad navigation, never call private internals.
  page.locator('[data-action="careerSquad"]').first.click()
  assert page.locator('.squadEntry').count()==12,(device,'roster count changed')
  page.locator('[data-action="manager"]').first.click()
  advice=page.locator('#careerBenchReadiness')
  text=advice.inner_text()
  assert 'BENCH READINESS' in text,(device,text)
  assert seeded['starter'] in text and seeded['reserve'] in text,(device,seeded,text)
  assert 'injured' in text and 'same-position reserve' in text,(device,text)
  assert advice.locator('button').count()==0,(device,'advice must be read-only')
  assert page.locator('#careerOpponentScout').count()==1,(device,'scouting was displaced')

  def snapshot():
   return page.evaluate("""() => {
     const c=NekketsuHD.getCareer(),g=NekketsuHD.game;
     return {career:JSON.stringify(c),rosterIds:c.roster.map(p=>p.id),
      stored:localStorage.getItem('legend_managerCareer'),
      plans:JSON.stringify(g.teamPlans),score:[...g.score],
      buttons:document.querySelectorAll('#touchButtons [data-act]').length};
   }""")
  before=snapshot()
  for i in range(2):
   page.locator('[data-action="careerSquad"]').first.click()
   page.locator('[data-action="manager"]').first.click()
   assert page.locator('#careerBenchReadiness').count()==1
   assert snapshot()==before,(device,'reading advice mutated save, team plans, score or IDs')

  page.locator('[data-action="careerPlay"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play',(device,'career match cannot begin')
  assert page.evaluate('NekketsuHD.game.mode')=='career',(device,'wrong game mode')
  assert page.evaluate('NekketsuHD.game.rosters[0].map(p=>p.id)')==seeded['ids'],device
  assert not errors,(device,errors)
  print('CAREER_BENCH_READINESS_BROWSER_PASS',device,
        'actual injured starter, healthy same-role reserve, repeated no-write advice and real kickoff',
        flush=True)
  context.close()
 browser.close()
