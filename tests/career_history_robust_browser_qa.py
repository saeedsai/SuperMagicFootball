#!/usr/bin/env python3
"""CAREER-HISTORY-ROBUST-01: Manager hub survives malformed career.history, desktop and simulated-touch Chromium."""
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
  page.locator('[data-action="startManager"]').first.click()
  assert page.locator('#careerForm').count()==1,(device,'hub')
  page.evaluate("""() => {
    const c=NekketsuHD.getCareer();
    const opp=c.members.find(m=>m!==c.club);
    c.history=[null,{},{a:1,b:0,against:opp},{kind:'league',against:opp},{kind:'league',against:9999,a:2,b:1},
               {kind:'league',week:2,against:opp,a:1,b:1,win:false},7,
               {kind:'cup',week:1,against:opp,a:2,b:0,win:true}];
  }""")
  def snapshot():
   return page.evaluate("""() => {const c=NekketsuHD.getCareer();
     return {career:JSON.stringify(c),stored:localStorage.getItem('legend_managerCareer'),
      buttons:document.querySelectorAll('#touchButtons [data-act]').length}}""")
  before=snapshot()
  page.locator('[data-action="careerSquad"]').first.click()
  assert page.locator('.squadEntry').count()==12,device
  page.locator('[data-action="manager"]').first.click()
  assert page.locator('#careerForm').count()==1,(device,'Manager hub did not render with malformed history',errors)
  rows=page.locator('.stat',has_text=' vs ')
  texts=rows.all_inner_texts()
  joined=' | '.join(t.replace('\n',' ') for t in texts)
  assert 'MATCH vs' in joined and 'unknown club' in joined and 'LEAGUE vs' in joined and 'CUP vs' in joined,(device,joined)
  assert 'undefined' not in joined and 'NaN' not in joined,(device,joined)
  assert page.locator('[data-action="careerPlay"]').count()==1,device
  assert page.locator('#touchButtons button[data-act]').count()==4,(device,'four action contract')
  assert snapshot()==before,(device,'viewing malformed history mutated career or storage')
  box=page.locator('#careerForm').bounding_box()
  assert box and box['width']<=viewport['width'],(device,box)
  assert not errors,(device,errors)
  print('CAREER_HISTORY_ROBUST_BROWSER_PASS',device,'malformed history skipped/placeholdered, valid rows shown, no writes',flush=True)
  context.close()
 browser.close()
