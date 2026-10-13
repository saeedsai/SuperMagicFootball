from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,mobile in [('desktop',{'width':1280,'height':720},False),('android',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate('''()=>{let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}''')
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'")
  page.locator('[data-action="quick"]').first.click();page.locator('[data-action="kickoff"]').first.click()
  assert page.locator('#touchButtons button[data-act]').count()==4
  result=page.evaluate('''()=>{
   const g=SupermagicFootball.game,a=g.player(0,3),b=g.player(1,3);
   g.cooldown=0;g.ball.owner=null;g.ball.canCollect=2;
   for(const p of g.players)if(p!==a&&p!==b){p.x=1900+p.i*80;p.y=220+p.t*80;p.moveVX=p.moveVY=0;p.stun=0;}
   a.x=1460;a.y=650;b.x=1490;b.y=650;a.z=b.z=0;a.stun=b.stun=0;
   a.moveVX=280;b.moveVX=-280;a.moveVY=b.moveVY=0;a.contactCooldown=b.contactCooldown=0;
   const start=[a.x,b.x];const initial=g.events.filter(x=>x.type==='playerCollision').length;
   g.resolvePlayerContacts(.016);
   const distance=Math.hypot(a.x-b.x,a.y-b.y),eventCount=g.events.filter(x=>x.type==='playerCollision').length-initial;
   const first=[a.stun,b.stun];g.resolvePlayerContacts(.016);
   const eventCount2=g.events.filter(x=>x.type==='playerCollision').length-initial;
   return {start,pair:[a.x,b.x],distance,first,eventCount,eventCount2,matchState:g.matchState};
  }''')
  assert result['distance']>=49.99 and result['pair'][0]<result['start'][0] and result['pair'][1]>result['start'][1],result
  assert all(x>0 for x in result['first']) and result['eventCount']==result['eventCount2']==1,result
  assert not errors,errors
  page.screenshot(path=str(root/'tests'/f'collision_match_{device}.png'))
  print(device,'PASS physical symmetric pushback, stunned both, cooldown, 4 input buttons, no browser exceptions')
  ctx.close()
 browser.close()
