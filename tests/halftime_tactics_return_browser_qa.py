#!/usr/bin/env python3
"""End-to-end halftime tactics return on Back, Save, Reset and keyboard Escape."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(), 'Build fixture using python3 scripts/build.py'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,mobile in (
    ('desktop',{'width':1280,'height':720},False),
    ('simulated-touch',{'width':844,'height':390},True)):
  ctx=browser.new_context(viewport=viewport,has_touch=mobile,is_mobile=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.evaluate("""() => {
   const data=new Map();
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
    getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
    removeItem:k=>data.delete(k),clear:()=>data.clear()
   }});
  }""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator(f'[data-action="{action}"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play'
  before=page.evaluate("""() => ({
   plan:JSON.stringify(SupermagicFootball.game.teamPlans[0]),
   stored:localStorage.getItem('legend_teamPlans'),
   talks:JSON.stringify(SupermagicFootball.game.talksUsed),
   buttons:document.querySelectorAll('#touchButtons button[data-act]').length
  })""")
  assert before['buttons']==4,(device,'four existing controls')
  page.evaluate("SupermagicFootball.game.onEvent({type:'halftime'})")
  assert page.locator('.heading').inner_text()=='HALF TIME',(device,'halftime heading missing')
  assert page.locator('#halfTalkHome').count()==1,(device,'home team talk missing')
  page.locator('[data-action="tacticHome"]').first.click()
  assert page.locator('.heading').inner_text()=='TEAM COMMAND CENTER'
  page.locator('[data-action="returnPause"]').first.click()
  assert page.locator('.heading').inner_text()=='HALF TIME',(device,'Back loses team talk screen')
  assert page.locator('#halfTalkHome').count()==1
  after_back=page.evaluate("""() => ({
   plan:JSON.stringify(SupermagicFootball.game.teamPlans[0]),
   stored:localStorage.getItem('legend_teamPlans'),
   talks:JSON.stringify(SupermagicFootball.game.talksUsed),
   buttons:document.querySelectorAll('#touchButtons button[data-act]').length
  })""")
  assert before==after_back,(device,'Back must not write tactics or talks',before,after_back)
  page.locator('[data-action="tacticHome"]').first.click()
  page.locator('[data-action="saveSquad"]').first.click()
  assert page.locator('.heading').inner_text()=='HALF TIME',(device,'Save loses halftime')
  assert page.locator('#halfTalkHome').count()==1
  assert page.evaluate("SupermagicFootball.game.matchState")=='paused'
  page.locator('[data-action="tacticHome"]').first.click()
  page.keyboard.press('Escape')
  assert page.locator('.heading').inner_text()=='HALF TIME',(device,'Escape loses halftime')
  page.locator('[data-action="tacticHome"]').first.click()
  page.locator('[data-action="resetSquad"]').first.click()
  assert page.locator('.heading').inner_text()=='HALF TIME',(device,'Reset loses halftime')
  assert page.locator('#halfTalkHome').count()==1
  assert page.evaluate("JSON.stringify(SupermagicFootball.game.talksUsed)")==before['talks']
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play'
  # A later ordinary pause is distinct from the halftime menu.
  page.locator('#pauseBtn').click(force=True)
  assert page.locator('.heading').inner_text()=='PAUSED',(device,'ordinary pause')
  page.locator('[data-action="tacticHome"]').first.click()
  page.locator('[data-action="returnPause"]').first.click()
  assert page.locator('.heading').inner_text()=='PAUSED',(device,'ordinary Back should not open halftime')
  page.locator('[data-action="tacticHome"]').first.click()
  page.locator('[data-action="saveSquad"]').first.click()
  assert page.locator('.heading').inner_text()=='PAUSED',(device,'ordinary Save should not open halftime')
  assert not errors,(device,errors)
  print('HALFTIME_TACTICS_RETURN_PASS',device,'Back, Save, Reset, Escape, normal Pause, save/talk/four controls',flush=True)
  ctx.close()
 browser.close()
