#!/usr/bin/env python3
"""Playable role-fit guidance: reactive 6-slot tactical advice, zero save mutations."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Build modular QA fixture first'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,mobile in [('desktop',{'width':1280,'height':720},False),
                                ('simulated-touch',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda error: errors.append(str(error)))
  # No permanent fixtures, and zero access to actual user storage.
  page.evaluate("""() => {const values=new Map();Object.defineProperty(window,'localStorage',
   {configurable:true,value:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),
    removeItem:k=>values.delete(k),clear:()=>values.clear()}})}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  page.locator('[data-action="navQuick"]').first.click()
  page.locator('[data-action="navOnDevice"]').first.click()
  page.locator('[data-action="quick"]').first.click()
  page.locator('[data-action="setupTactics"]').first.click()
  page.locator('[data-action="prepHome"]').first.click()
  guidance=page.locator('#lineupRoleFit')
  assert guidance.count()==1,(device,'missing accessible advisory')
  assert guidance.get_attribute('role')=='status' and guidance.get_attribute('aria-live')=='polite'
  first=guidance.inner_text()
  assert 'LINEUP FIT' in first and 'natural roles' in first,(device,first)
  before=page.evaluate("""() => ({
   stored:localStorage.getItem('legend_teamPlans'),
   game:JSON.stringify(SupermagicFootball.game.teamPlans),
   original:Array.from({length:6},(_,i)=>+document.getElementById('pos'+i).value),
   actions:document.querySelectorAll('#touchButtons button[data-act]').length
  })""")
  assert before['actions']==4,(device,'four-button contract',before)
  # Slot 2 is always a DF in all six approved formations; pick a genuinely
  # out-of-role bench midfielder or striker by reading live dropdown options.
  wrong=page.evaluate("""() => {
    const used=Array.from({length:6},(_,i)=>+document.getElementById('pos'+i).value);
    return Array.from(document.getElementById('pos1').options)
      .find(o=>!used.includes(+o.value)&&(/· FW ·|· MF ·/).test(o.textContent))?.value||null;
  }""")
  assert wrong is not None,(device,'no bench MF/FW in outfield selector')
  page.locator('#pos1').select_option(str(wrong))
  changed=guidance.inner_text()
  assert 'slot 2 (DF)' in changed and ('naturally MF' in changed or 'naturally FW' in changed),(device,changed)
  assert 'Advice only' in changed,(device,changed)
  # Six formations reassign positions immediately without saving or substituting.
  page.locator('#formation').select_option('1-1-3')
  updated=guidance.inner_text()
  assert updated!=changed and 'slot 2 (DF)' in updated,(device,changed,updated)
  assert page.locator('.lineupRow strong').count()==6,(device,'formation rows')
  page.locator('#pos1').select_option(str(before['original'][1]))
  page.locator('#formation').select_option('2-1-2')
  after=page.evaluate("""() => ({
    stored:localStorage.getItem('legend_teamPlans'),
    game:JSON.stringify(SupermagicFootball.game.teamPlans),
    actions:document.querySelectorAll('#touchButtons button[data-act]').length
  })""")
  assert after=={'stored':before['stored'],'game':before['game'],'actions':4},(device,before,after)
  assert not errors,(device,errors)
  print('PASS',device,'role-fit updates on slot and formation, 6 selections, accessible live status, saves unchanged',flush=True)
  ctx.close()
 browser.close()
