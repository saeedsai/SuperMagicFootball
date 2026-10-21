from menu_test_routes import open_quick,open_settings
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,w,h,mobile in [('desktop',1280,720,False),('android',844,390,True)]:
  ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""()=>{let db={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>db[k]||null,setItem:(k,v)=>db[k]=String(v),removeItem:k=>delete db[k]}})}""")
  page.set_content((root/'play.html').read_text(),wait_until='load');page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'")
  open_quick(page);page.locator('[data-action="kickoff"]').first.click()
  assert page.locator('#touchButtons [data-act]').count()==4
  page.evaluate('''()=>{let g=SupermagicFootball.game,p=g.player(0,3);g.cooldown=0;g.driveAI=()=>{};g.events=[];g.input.keys.clear();g.input.touchButtons.clear();g.input.reset();g.clock=6;p.x=900;p.y=680;p.cd=0;p.stun=0;p.fatigue=0;p.z=0;p.vz=0;for(let q of g.players)if(q!==p){q.x=2300+q.i*70;q.y=850;}g.take(p);g.controlled[0]=p.i;}''')
  if mobile:
   box=lambda k:page.locator(f'[data-act="{k}"]').bounding_box()
   coords=lambda k:{'x':box(k)['x']+box(k)['width']/2,'y':box(k)['y']+box(k)['height']/2}
   cdp=ctx.new_cdp_session(page)
   j=coords('jump');d=coords('dribble')
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':1,**j}]})
   page.wait_for_timeout(40)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':1,**j},{'id':2,**d}]})
   page.wait_for_timeout(100)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  else:
   page.keyboard.down('Space');page.wait_for_timeout(60);page.keyboard.down('i');page.wait_for_timeout(90);page.keyboard.up('i');page.keyboard.up('Space')
  page.wait_for_timeout(65)
  assert page.evaluate("SupermagicFootball.game.events.some(e=>e.type==='bicycleShot')"), (name,'bicycle action not seen',errors)
  page.evaluate('''()=>{const g=SupermagicFootball.game,p=g.player(0,3),e=g.player(1,3);g.cooldown=0;g.input.keys.clear();g.input.touchButtons.clear();g.input.reset();p.stun=0;p.cd=0;p.z=0;p.vz=0;p.jumpCount=0;p.fatigue=0;p.abilityCd=30;g.player(0,0).abilityCd=30;e.x=p.x+88;e.y=p.y;e.stun=0;e.invuln=0;g.ball.owner=e;g.ball.shot=null;g.ball.z=0;g.ball.attacker=1;g.ball.canCollect=1;}''')
  if mobile:
   j=coords('jump');s=coords('shoot')
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':3,**j}]});page.wait_for_timeout(40)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':3,**j},{'id':4,**s}]})
   page.wait_for_function("SupermagicFootball.game.events.some(e=>e.type==='flyingKick')",timeout=5000)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  else:
   page.keyboard.down('Space');page.wait_for_timeout(40);page.keyboard.down('j');page.wait_for_function("SupermagicFootball.game.events.some(e=>e.type==='flyingKick')",timeout=5000);page.keyboard.up('j');page.keyboard.up('Space')
  assert page.evaluate("SupermagicFootball.game.events.some(e=>e.type==='flyingKick')"), (name,'defensive flying kick missing',errors)
  # Validate keeper distribution in the browser engine and no runtime exception.
  result=page.evaluate('''()=>{const g=SupermagicFootball.game,gk=g.player(0,0);gk.stun=0;g.take(gk);return {ok:g.distributeKeeper(gk),event:g.events.some(e=>e.type==='keeperDistribution'),buttons:document.querySelectorAll('#touchButtons [data-act]').length}}''')
  assert result['ok'] and result['event'] and result['buttons']==4,(name,result)
  assert not errors,(name,errors)
  page.screenshot(path=str(root/'tests'/f'v086_four_button_{name}.png'))
  print(name,'PASS: four-button HUD, bicycle shot, flying kick, keeper distribution, no page errors')
  ctx.close()
 browser.close()
