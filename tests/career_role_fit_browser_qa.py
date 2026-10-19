#!/usr/bin/env python3
"""Real Manager Career natural-position role-fit preview: desktop and touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Run python3 scripts/build.py first'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [
  ('desktop',{'width':1280,'height':720},False),
  ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.evaluate("""() => {const data=new Map();
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
    getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
    removeItem:k=>data.delete(k),clear:()=>data.clear()}})}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
  open_feature(page,'manager')
  assert page.locator('#careerLineupRoleFit').count()==0,(device,'no career before creation')
  page.locator('[data-action="startManager"]').first.click()
  rolefit=page.locator('#careerLineupRoleFit')
  assert rolefit.count()==1,(device,'pre-match role-fit report missing')
  assert 'ROLE FIT: 6/6' in rolefit.inner_text(),(device,rolefit.inner_text())
  assert page.locator('#careerOpponentScout').count()==1
  assert page.locator('#careerBenchReadiness').count()==1
  assert page.locator('#touchButtons [data-act]').count()==4

  seeded=page.evaluate("""() => {
   const c=NekketsuHD.getCareer(),plan=NekketsuHD.getTeamPlan(c.club);
   if(plan.lineup.length!==6)throw Error('Starting six missing');
   const starters=new Set(plan.lineup),defender=plan.lineup[1];
   const reserve=c.roster.map((p,i)=>({p,i}))
     .find(x=>!starters.has(x.i)&&x.p.role==='DF');
   if(!reserve)throw Error('No true DF reserve found');
   for(const p of c.roster){p.condition=100;p.injuryWeeks=0;}
   c.roster[defender].role='MF';
   reserve.p.condition=91;
   return {starter:c.roster[defender].name,reserve:reserve.p.name,
    ids:c.roster.map(p=>p.id),plan:JSON.stringify(plan)};
  }""")

  # Navigate through the normal Manager Squad menus, not private rendering calls.
  page.locator('[data-action="careerSquad"]').first.click()
  assert page.locator('.squadEntry').count()==12
  page.locator('[data-action="manager"]').first.click()
  fit=page.locator('#careerLineupRoleFit')
  report=fit.inner_text()
  assert 'ROLE FIT 5/6' in report,(device,report)
  assert 'Slot 2 DF' in report,(device,report)
  assert seeded['starter'] in report and seeded['reserve'] in report,(device,report)
  assert '91% fit' in report,(device,report)
  assert fit.locator('button').count()==0,(device,'advisory introduced new game button')

  def snapshot():
   return page.evaluate("""() => {
    const c=NekketsuHD.getCareer();
    return {career:JSON.stringify(c),teamPlan:JSON.stringify(NekketsuHD.getTeamPlan(c.club)),
     stored:localStorage.getItem('legend_managerCareer'),
     ids:c.roster.map(p=>p.id),score:[...NekketsuHD.game.score],
     buttons:document.querySelectorAll('#touchButtons [data-act]').length};
   }""")
  before=snapshot()
  assert before['teamPlan']==seeded['plan']
  for _ in range(2):
   page.locator('[data-action="careerSquad"]').first.click()
   page.locator('[data-action="manager"]').first.click()
   assert page.locator('#careerLineupRoleFit').count()==1
   assert snapshot()==before,(device,'advice mutated the live plan, save, score or IDs')

  page.locator('[data-action="careerPlay"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play',(device,'career kickoff failed')
  assert page.evaluate('NekketsuHD.game.mode')=='career'
  assert page.evaluate('NekketsuHD.game.rosters[0].map(p=>p.id)')==seeded['ids']
  assert not errors,(device,errors)
  print('CAREER_ROLE_FIT_BROWSER_PASS',device,
   'live misassigned DF, match-ready bench advice, no mutations, four buttons, career kickoff',flush=True)
  context.close()
 browser.close()
