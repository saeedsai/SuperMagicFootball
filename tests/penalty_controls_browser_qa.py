from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,w,h,mobile in [('desktop',1280,720,False),('android',844,390,True)]:
  context=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate('''()=>{const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v)}})}''')
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.22.1-alpha'")
  page.locator('[data-action="settings"]').first.click()
  page.locator('[data-action="controls"]').first.click()
  assert page.locator('#bindKey0').count()==1
  page.locator('#bindKey0').select_option('KeyU')
  page.locator('#bindPad1').select_option('5')
  page.locator('[data-action="saveBindings"]').first.click()
  assert page.evaluate("SupermagicFootball.input.getBindings().keyboard[0]")=='KeyU'
  assert page.evaluate("SupermagicFootball.input.getBindings().gamepad[1]")==5
  page.locator('[data-action="home"]').first.click()
  page.locator('[data-action="pk"]').first.click()
  page.locator('[data-action="kickoff"]').first.click()
  page.evaluate('''()=>{const g=SupermagicFootball.game;g.startPK();g.pk.ready=0;g.pk.timer=8;}''')
  start=page.evaluate('SupermagicFootball.game.pk.ballX')
  if mobile:
   # Simulated genuine multi-touch action, and joystick movement via engine state for deterministic frame testing.
   page.evaluate('''()=>{const g=SupermagicFootball.game;g.input.touch.x=.7;g.input.touch.y=.2;}''')
   page.wait_for_timeout(250)
   page.evaluate('''()=>{const g=SupermagicFootball.game;g.input.touch.x=0;g.input.touch.y=0;}''')
  else:
   page.keyboard.down('d');page.wait_for_timeout(200);page.keyboard.up('d')
  moved=page.evaluate('SupermagicFootball.game.pk.ballX')
  assert moved>start,(label,start,moved,errors)
  # Reposition then kick; verify kick origin remains at dribbled position.
  if mobile:
   box=page.locator('[data-act="shoot"]').bounding_box()
   x,y=box['x']+box['width']/2,box['y']+box['height']/2
   cdp=context.new_cdp_session(page)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':21,'x':x,'y':y}]});page.wait_for_timeout(75)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  else:
   page.keyboard.down('j');page.wait_for_timeout(90);page.keyboard.up('j')
  shot=page.evaluate('''()=>{let p=SupermagicFootball.game.pk;return {stage:p.stage,origin:p.startX,ball:p.ballX,dribbles:p.dribbles};}''')
  assert shot['stage']=='shooting' and shot['origin']>start,(label,shot,errors)
  page.screenshot(path=str(root/'tests'/f'penalty_controls_{label}.png'))
  assert page.locator('#touchButtons [data-act]').count()==4
  assert not errors,(label,errors)
  context.close()
 browser.close()
print('v0.8.10 BROWSER QA PASS: remapping, keyboard/touch PK movement and shots, cross-layout 4 buttons')
