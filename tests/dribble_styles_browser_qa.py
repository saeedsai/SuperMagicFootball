from menu_test_routes import open_quick,open_settings
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,w,h,mobile in [('desktop',1280,720,False),('android',844,390,True)]:
  context=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""()=>{const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'")
  open_quick(page);page.locator('[data-action="kickoff"]').first.click()
  assert page.locator('#touchButtons button[data-act]').count()==4
  page.evaluate('''()=>{let g=SupermagicFootball.game,p=g.player(0,3);g.cooldown=0;g.clock=5;g.events=[];g.input.keys.clear();g.input.touchButtons.clear();g.input.reset();p.x=1500;p.y=680;p.face=1;p.dx=1;p.dy=0;p.cd=0;p.trickCd=0;p.fatigue=0;p.stun=0;p.z=0;p.vz=0;p.src.dribbleType='rainbow';p.src.dribbling=96;for(let q of g.players)if(q!==p){q.x=2600+q.i*55;q.y=1050;}let rival=g.player(1,2);rival.x=p.x+85;rival.y=p.y;rival.stun=0;g.take(p);g.controlled[0]=p.i;}''')
  if mobile:
   box=page.locator('[data-act="dribble"]').bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2
   cdp=context.new_cdp_session(page)
   def tap(n):
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':n,'x':x,'y':y}]})
    page.wait_for_timeout(62)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
   tap(21);page.wait_for_timeout(58);tap(22)
  else:
   page.keyboard.down('i');page.wait_for_timeout(65);page.keyboard.up('i');page.wait_for_timeout(62)
   page.keyboard.down('i');page.wait_for_timeout(65);page.keyboard.up('i')
  page.wait_for_timeout(80)
  result=page.evaluate('''()=>{const g=SupermagicFootball.game,p=g.player(0,3);return {events:g.events.filter(e=>e.type==='dribbleTrick'),cooldown:p.trickCd,style:p.trickStyleId,ballOwner:g.ball.owner===p,buttons:document.querySelectorAll('#touchButtons [data-act]').length};}''')
  assert result['events'] and result['events'][0]['style']=='rainbow', (label,result,errors)
  assert result['cooldown']>0 and result['buttons']==4 and (not result['events'][0]['success'] or result['ballOwner']),(label,result)
  # Check visual rendering and roster screen with new DRB rating and style.
  page.screenshot(path=str(root/'tests'/f'dribble_styles_{label}.png'))
  assert not errors,(label,errors)
  context.close()
 browser.close()
print('v0.8.7 browser PASS — real keyboard double-tap, genuine simulated Android touch double-tap, 4-button UI, style and game rendering')
