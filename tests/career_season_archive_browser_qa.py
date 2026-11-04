"""UX28 Career archive: read-only Past Seasons route on desktop and touch-sized Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build modular browser fixture with scripts/build.py'
HTML=fixture.read_text(encoding='utf-8')
STORAGE_FIXTURE=r"""
(() => {
 const data=new Map(),writes=[];window.__archiveStorage={data,writes};
 Object.defineProperty(window,'localStorage',{configurable:true,value:{
  getItem:key=>data.has(key)?data.get(key):null,
  setItem:(key,value)=>{writes.push([key,String(value)]);data.set(key,String(value));},
  removeItem:key=>{writes.push([key,null]);data.delete(key);},clear:()=>data.clear()
 }});
})()
"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [
  ('desktop',{'width':1360,'height':800},False),
  ('simulated-touch',{'width':844,'height':390},True),
 ]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  context.add_init_script(STORAGE_FIXTURE)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
  def click(action):page.locator('[data-action="'+action+'"]').first.click(timeout=30000)

  click('navCareer');click('manager');click('startManager')
  page.wait_for_function('!!NekketsuHD.getCareer()')
  assert page.locator('[data-action="careerPastSeasons"]').count()==1,(label,'Past Seasons entry is available')
  page.evaluate('window.__archiveStorage.writes.length=0')
  empty_before=page.evaluate('''()=>({career:JSON.stringify(NekketsuHD.getCareer()),writes:window.__archiveStorage.writes.length})''')
  click('careerPastSeasons')
  assert page.locator('.heading').inner_text()=='PAST SEASONS'
  assert 'No completed seasons have been archived yet' in page.locator('#careerSeasonArchive').inner_text()
  assert page.evaluate('JSON.stringify(NekketsuHD.getCareer())')==empty_before['career']
  assert page.evaluate('window.__archiveStorage.writes.length')==0
  click('manager')

  page.evaluate('''()=>{
   const c=NekketsuHD.getCareer(),championId=c.members[1];
   c.seasonArchive=[{season:c.season-1,clubId:c.club,championId,clubPosition:3,teamCount:c.members.length,
    clubRecord:{played:14,wins:8,draws:3,losses:3,goalDifference:9,points:27},
    cup:{status:'eliminated',wins:2},standings:[]}];
   window.__archiveStorage.writes.length=0;
  }''')
  expected=page.evaluate('''()=>({club:NekketsuHD.teams[NekketsuHD.getCareer().club].name,
   champion:NekketsuHD.teams[NekketsuHD.getCareer().members[1]].name,
   career:JSON.stringify(NekketsuHD.getCareer()),vault:localStorage.getItem('legend_careerSlots'),
   legacy:localStorage.getItem('legend_managerCareer')})''')
  click('careerPastSeasons')
  archive=page.locator('#careerSeasonArchive').inner_text()
  for text in [expected['club'],expected['champion'],'#3 / '+str(page.evaluate('NekketsuHD.getCareer().members.length')),
               '8-3-3 · 14 played · GD 9 · 27 pts','Eliminated from the Career Cup · 2 wins']:
   assert text in archive,(label,'missing archived summary field',text,archive)
  assert page.locator('[data-action="careerSeasonConfirm"]').count()==0,(label,'archive is read only')
  assert page.evaluate('''()=>({career:JSON.stringify(NekketsuHD.getCareer()),vault:localStorage.getItem('legend_careerSlots'),
   legacy:localStorage.getItem('legend_managerCareer'),writes:window.__archiveStorage.writes.length})''')=={
    'career':expected['career'],'vault':expected['vault'],'legacy':expected['legacy'],'writes':0
   },(label,'opening archive made no state or save changes')
  click('manager')
  assert page.evaluate('JSON.stringify(NekketsuHD.getCareer())')==expected['career']
  assert page.evaluate('window.__archiveStorage.writes.length')==0,(label,'Back remains read only')
  assert not errors,(label,errors)
  print('CAREER_SEASON_ARCHIVE_BROWSER_PASS',label,'empty state, named archive summary, no mutation/save, Back route',flush=True)
  context.close()
 browser.close()
