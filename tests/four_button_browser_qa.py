from menu_test_routes import open_quick,open_settings
from pathlib import Path
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,width,height,mobile in [('desktop',1280,720,False),('android',844,390,True)]:
  ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""()=>{const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
  page.set_content((p/'play.html').read_text(),wait_until='load')
  page.wait_for_function("!!window.SupermagicFootball?.game")
  open_quick(page)
  page.locator('[data-action="kickoff"]').first.click()
  assert page.evaluate('SupermagicFootball.game.matchState')=='play'
  buttons=page.locator('#touchButtons button[data-act]')
  assert buttons.count()==4,(label,buttons.count())
  assert sorted(buttons.evaluate_all('(ns)=>ns.map(n=>n.dataset.act)'))==['dribble','jump','pass','shoot']
  positions={a:page.locator('[data-act="'+a+'"]').bounding_box() for a in ['jump','pass','shoot','dribble']}
  cx=lambda a:positions[a]['x']+positions[a]['width']/2
  cy=lambda a:positions[a]['y']+positions[a]['height']/2
  if mobile:
   assert cy('jump')<cy('pass')<cy('dribble') and cx('pass')<cx('jump')<cx('shoot'),positions
  page.evaluate("""()=>{const g=SupermagicFootball.game;g.cooldown=0;g.input.keys.clear();g.input.touchButtons.clear();g.input.reset();const p=g.player(0,3);p.x=1500;p.y=680;p.fatigue=0;p.stun=0;p.cd=0;p.dashCooldown=0;p.specialCd=0;p.z=0;p.vz=0;for(const q of g.players){if(q.t===1){q.x=2700;q.y=1100}}g.take(p);g.controlled[0]=3;}""")
  if mobile:
   cdp=ctx.new_cdp_session(page)
   # A single genuine touch on DRIBBLE is detected.
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':11,'x':cx('dribble'),'y':cy('dribble')}]})
   page.wait_for_timeout(70)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  else:
   page.keyboard.down('i');page.wait_for_timeout(90);page.keyboard.up('i')
  page.wait_for_timeout(100)
  assert page.evaluate("SupermagicFootball.game.events.some(e=>e.type==='dribble')"),(label,'dribble event missing',errors)
  # Prepare midair second-jump shot; check both touchscreen and keyboard.
  page.evaluate("""()=>{let g=SupermagicFootball.game,p=g.player(0,3);g.take(p);g.cooldown=0;p.x=1500;p.y=680;p.z=90;p.vz=140;p.jumpCount=1;p.cd=0;p.stun=0;p.fatigue=0;p.specialCd=0;g.input.reset();} """)
  if mobile:
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':12,'x':cx('jump'),'y':cy('jump')}]})
   page.wait_for_timeout(45)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
   page.wait_for_timeout(45)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':13,'x':cx('shoot'),'y':cy('shoot')}]})
   page.wait_for_timeout(75)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  else:
   page.keyboard.down('Space');page.wait_for_timeout(75);page.keyboard.up('Space')
   page.wait_for_timeout(55)
   page.keyboard.down('j');page.wait_for_timeout(75);page.keyboard.up('j')
   page.wait_for_timeout(70)
  state=page.evaluate("""()=>{const g=SupermagicFootball.game,p=g.player(0,3);return {shot:g.ball.shot?.id,jumps:p.jumpCount,events:g.events.filter(e=>e.type==='toast').map(e=>e.message),action:p.action,owner:g.ball.owner?.src?.name}}""")
  assert state['shot'],(label,'double-jump super failed',state,errors)
  assert not state['events'],(label,'super triggered popup',state)
  page.screenshot(path=str(p/'tests'/f'four_button_{label}.png'))
  assert not errors,(label,errors)
  print(label,'PASS actual keyboard/touch controls, four-button cross layout, double jump super, no super popup')
  ctx.close()
 browser.close()
