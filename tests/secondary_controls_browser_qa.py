from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,w,h,mobile in [('desktop',1280,720,False),('android',844,390,True)]:
  context=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate('''()=>{const db={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>db[k]??null,setItem:(k,v)=>db[k]=String(v),removeItem:k=>delete db[k]}})}''')
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'")
  page.locator('[data-action="settings"]').first.click();page.locator('[data-action="controls"]').first.click()
  assert page.locator('#bindKey20').count()==1 and page.locator('#bindPad23').count()==1
  page.locator('#bindKey21').select_option('KeyO')
  page.locator('#bindPad21').select_option('5')
  # Player 2 cannot be assigned Player 1's current action key.
  page.locator('[data-action="saveBindings"]').first.click()
  assert page.evaluate("SupermagicFootball.input.getBindings().keyboard2[1]")=='KeyO'
  assert page.evaluate("SupermagicFootball.input.getBindings().gamepad2[1]")==5
  page.locator('[data-action="controls"]').first.click()
  assert page.locator('#bindKey21').input_value()=='KeyO'
  page.screenshot(path=str(root/'tests'/f'v0812_controls_{label}.png'))
  page.keyboard.down('o')
  assert page.evaluate('''()=>{const i=SupermagicFootball.input;i.poll(true);return i.state[1].shoot===1&&i.state[0].shoot===0}''')
  page.keyboard.up('o')
  result=page.evaluate('''()=>{let g=SupermagicFootball.game,p=g.player(0,3),q=g.player(1,3);p.x=900;p.y=600;p.z=36;p.jumpCount=2;p.stun=0;p.cd=0;p.fatigue=0;q.x=964;q.y=600;q.stun=0;q.invuln=0;g.ball.owner=q;return {move:g.tryFlyingKick(p,true),action:p.action,stun:q.stun,buttons:document.querySelectorAll('#touchButtons [data-act]').length}}''')
  assert result['move'] and result['action']=='defensiveBicycle' and result['stun']>0 and result['buttons']==4,(label,result)
  assert not errors,(label,errors)
  context.close()
 browser.close()
print('v0.8.14 BROWSER QA PASS: P2 remapping settings and input; defensive bicycle and 4 touch buttons (desktop/android)')
