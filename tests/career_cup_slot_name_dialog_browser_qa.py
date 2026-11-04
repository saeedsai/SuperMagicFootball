"""Accessible Career/Cup save naming: keyboard, cancel, validation and readback."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
campaign={
 'id':'cup_UEFA','compId':'UEFA','club':0,'participants':[0,1,2,3],
 'phase':'league','roundIdx':0,'history':[],'rounds':[[]],'groups':[],
 'table':{str(team):{'p':0,'w':0,'d':0,'l':0,'gf':0,'ga':0,'pts':0} for team in range(4)},
 'earned':0,'winner':None,'knockout':None,'label':'Seeded Cup'
}
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}'
boot="""
(() => {
 window.__slotWrites=[];
 const original=Storage.prototype.setItem;
 Storage.prototype.setItem=function(key,value){window.__slotWrites.push([String(key),String(value)]);return original.call(this,key,value)};
 localStorage.setItem('legend_continentalRun',CAMPAIGN_JSON);
})()
""".replace('CAMPAIGN_JSON',json.dumps(json.dumps(campaign,separators=(',',':'))))

try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for label,mobile,viewport in [
   ('desktop',False,{'width':1360,'height':800}),
   ('simulated-touch',True,{'width':844,'height':390}),
  ]:
   context=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile,service_workers='block')
   context.add_init_script(boot)
   page=context.new_page();errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   page.goto(origin+'/tests/.generated/play.html',wait_until='load')
   page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
   page.set_default_timeout(8000)
   page.evaluate("window.__slotWrites.length=0")

   # Career save and rename retain the slot vault contract and legacy mirror.
   page.locator('[data-action="navCareer"]').first.click()
   page.locator('[data-action="manager"]').first.click()
   page.locator('[data-action="startManager"]').first.click()
   page.locator('.row.space button').first.click()
   page.locator('[data-action="navCareerSlots"]').first.click()
   before=page.evaluate("localStorage.getItem('legend_careerSlots')")
   page.locator('[data-action="careerSlotSave_1"]').first.click()
   dialog=page.locator('#slotNameDialog')
   assert dialog.get_attribute('role')=='dialog'
   assert dialog.get_attribute('aria-modal')=='true'
   field=page.locator('#slotNameInput')
   assert field.get_attribute('aria-describedby')=='slotNameHint slotNameError'
   assert page.locator('label[for="slotNameInput"]').count()==1
   assert page.evaluate("document.activeElement.id")=='slotNameInput'
   focus=page.evaluate("(()=>{const s=getComputedStyle(document.activeElement);return [s.outlineWidth,s.outlineStyle]})()")
   assert focus==['3px','solid'],(label,'visible input focus',focus)
   page.keyboard.press('Tab')
   assert page.evaluate("document.activeElement.textContent.trim()")=='REPLACE AND SAVE',page.evaluate('document.activeElement.outerHTML')
   page.keyboard.press('Tab')
   assert page.evaluate("document.activeElement.textContent.trim()")=='CANCEL WITHOUT SAVING'
   page.keyboard.press('Tab')
   assert page.evaluate("document.activeElement.textContent.trim()")=='CANCEL'
   page.keyboard.press('Tab')
   assert page.evaluate("document.activeElement.id")=='slotNameInput','Tab wraps within the dialog'
   page.keyboard.press('Shift+Tab')
   assert page.evaluate("document.activeElement.textContent.trim()")=='CANCEL','Shift+Tab wraps within the dialog'
   field.fill('   ')
   page.locator('#slotNameForm button[type="submit"]').click()
   assert 'Enter a name' in page.locator('#slotNameError').inner_text()
   assert page.evaluate("document.activeElement.id")=='slotNameInput'
   assert page.evaluate("localStorage.getItem('legend_careerSlots')")==before,'invalid/unsaved name must not write a Career slot'
   field.fill('Career One')
   page.keyboard.press('Enter')
   page.wait_for_selector('#slotNameDialog',state='detached')
   assert page.evaluate("document.activeElement.dataset.action")=='careerSlotSave_1',(label,'save returns focus to source row action')
   vault=json.loads(page.evaluate("localStorage.getItem('legend_careerSlots')"))
   assert vault['slots'][0]['name']=='Career One'
   saved_at=vault['slots'][0]['savedAt']
   page.locator('[data-action="careerSlotSave_2"]').first.click()
   page.locator('#slotNameInput').fill('Career Two')
   page.locator('#slotNameForm button[type="submit"]').click()
   page.wait_for_selector('#slotNameDialog',state='detached')
   page.locator('[data-action="careerSlotRename_1"]').first.click()
   page.locator('#slotNameInput').fill('Career Two')
   page.locator('#slotNameForm button[type="submit"]').click()
   assert 'already uses this name' in page.locator('#slotNameError').inner_text()
   assert page.evaluate("document.activeElement.id")=='slotNameInput'
   unchanged=json.loads(page.evaluate("localStorage.getItem('legend_careerSlots')"))
   assert unchanged['slots'][0]['name']=='Career One' and unchanged['slots'][0]['savedAt']==saved_at
   page.locator('#slotNameInput').fill('League Career')
   page.keyboard.press('Enter')
   page.wait_for_selector('#slotNameDialog',state='detached')
   renamed=json.loads(page.evaluate("localStorage.getItem('legend_careerSlots')"))
   assert renamed['slots'][0]['name']=='League Career'
   assert renamed['slots'][0]['savedAt']==saved_at,'rename does not change progress timestamp'
   assert page.evaluate("document.activeElement.dataset.action")=='careerSlotRename_1'
   page.locator('[data-action="careerSlotSave_3"]').first.click()
   before=page.evaluate("localStorage.getItem('legend_careerSlots')")
   page.locator('#slotNameInput').fill('Discard this label')
   page.keyboard.press('Escape')
   page.wait_for_selector('#slotNameDialog',state='detached')
   assert page.evaluate("localStorage.getItem('legend_careerSlots')")==before
   assert page.evaluate("document.activeElement.dataset.action")=='careerSlotSave_3'

   # Cup replacement shows intent, performs no writes until accepted, and restores focus on cancel.
   page.locator('.row.space button').first.click()
   page.locator('[data-action="home"]').first.click()
   page.locator('[data-action="navCups"]').first.click()
   page.locator('[data-action="navCupSlots"]').first.click()
   page.locator('[data-action="cupSlotSave_1"]').first.click()
   assert 'replace the existing Cup in slot 1' in page.locator('#slotNameDescription').inner_text()
   assert page.locator('#slotNameForm button[type="submit"]').inner_text()=='REPLACE AND SAVE'
   before=page.evaluate("localStorage.getItem('legend_cupSlots')")
   page.locator('#slotNameInput').fill('Uncommitted Cup')
   page.locator('[data-action="slotNameCancel_cup_save_1"]').last.click()
   page.wait_for_selector('#slotNameDialog',state='detached')
   assert page.evaluate("localStorage.getItem('legend_cupSlots')")==before
   assert page.evaluate("document.activeElement.dataset.action")=='cupSlotSave_1'
   page.locator('[data-action="cupSlotSave_1"]').first.click()
   page.locator('#slotNameInput').fill('Continental Run')
   page.locator('#slotNameForm button[type="submit"]').click()
   page.wait_for_selector('#slotNameDialog',state='detached')
   cup=json.loads(page.evaluate("localStorage.getItem('legend_cupSlots')"))
   assert cup['slots'][0]['name']=='Continental Run'
   assert cup['slots'][0]['tournament']['label']=='Seeded Cup'
   assert page.evaluate("document.activeElement.dataset.action")=='cupSlotSave_1'
   assert not errors,(label,errors)
   print('CAREER_CUP_SLOT_NAME_DIALOG_PASS',label,'labels, keyboard trap, validation, cancel, readback, focus restoration',flush=True)
   context.close()
  browser.close()
finally:
 server.shutdown();server.server_close()
