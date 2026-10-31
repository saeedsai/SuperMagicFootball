#!/usr/bin/env python3
"""CAREER-RECENT-FORM-01: real Manager Career hub, desktop and simulated-touch Chromium."""
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
  assert page.locator('#careerForm').count()==0,(device,'before career')
  page.locator('[data-action="startManager"]').first.click()
  form=page.locator('#careerForm')
  assert form.count()==1,(device,'form panel missing in real hub')
  assert 'Form appears after your first match' in form.inner_text(),(device,form.inner_text())
  assert page.locator('[data-action="careerPlay"]').count()==1,device
  assert page.locator('#touchButtons button[data-act]').count()==4,(device,'four action contract')

  # Legacy-shaped history (older saves lack some fields) must render without errors.
  seeded=page.evaluate("""() => {
    const c=NekketsuHD.getCareer();
    const opp=c.members.find(m=>m!==c.club);
    c.history=[{kind:'league',week:3,against:opp,a:2,b:0},{kind:'league',week:2,against:opp,a:1,b:1},
               {kind:'cup',week:1,against:opp,a:0,b:0,win:false},{kind:'league',week:1,against:opp,a:3,b:1,win:true}];
    return {ids:c.roster.map(p=>p.id),club:c.club};
  }""")
  page.locator('[data-action="careerSquad"]').first.click()
  assert page.locator('.squadEntry').count()==12,device
  page.locator('[data-action="manager"]').first.click()
  form=page.locator('#careerForm')
  text=form.inner_text()
  assert 'RECENT FORM' in text,(device,text)
  assert '2W 1D 1L' in text and 'goals 6:2' in text,(device,text)
  assert form.locator('.formBadge').count()==4,(device,'4 valid results')
  letters=form.locator('.formBadge').all_inner_texts()
  assert letters==['W','L','D','W'],(device,letters)
  label=form.locator('[role="img"]').get_attribute('aria-label')
  assert label=='Last 4 results, oldest to newest: win, loss, draw, win',(device,label)
  assert form.locator('button,a,input').count()==0,(device,'read-only')
  box=form.bounding_box()
  assert box and box['width']<=viewport['width'],(device,box)

  def snapshot():
   return page.evaluate("""() => {const c=NekketsuHD.getCareer();
     return {career:JSON.stringify(c),stored:localStorage.getItem('legend_managerCareer'),
      plans:JSON.stringify(NekketsuHD.game.teamPlans),
      buttons:document.querySelectorAll('#touchButtons [data-act]').length}}""")
  before=snapshot()
  for _ in range(2):
   page.locator('[data-action="careerSquad"]').first.click()
   page.locator('[data-action="manager"]').first.click()
   assert page.locator('#careerForm').count()==1
  assert snapshot()==before,(device,'viewing form mutated career, plans or storage')

  page.locator('[data-action="careerPlay"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play',device
  assert page.evaluate('NekketsuHD.game.mode')=='career',device
  assert not page.locator('#careerForm').is_visible(),(device,'form must not appear on match HUD')
  assert page.locator('#touchButtons button[data-act]').count()==4,device
  assert not errors,(device,errors)
  print('CAREER_RECENT_FORM_BROWSER_PASS',device,'empty state, legacy-shaped history, accessible strip, no-write rerender, kickoff',flush=True)
  context.close()
 browser.close()
