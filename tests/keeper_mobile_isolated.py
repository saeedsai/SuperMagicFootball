from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage']); ctx=b.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True);p=ctx.new_page()
 p.evaluate("""()=>{const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v)}})}""")
 p.set_content((root/'play.html').read_text(),wait_until='load');p.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'");p.locator('[data-action="quick"]').first.click();p.locator('[data-action="kickoff"]').first.click()
 p.evaluate("""()=>{let g=SupermagicFootball.game,k=g.player(0,0),h=g.player(0,3),b=g.ball;g.cooldown=0;g.controlled[0]=3;g.input.touchButtons.clear();g.input.reset();h.stun=0;h.cd=0;for(let p of g.players)if(p!==h&&p!==k){p.x=2700+p.i*30;p.y=870;}k.x=190;k.y=670;k.diveCooldown=0;k.stun=0;b.owner=null;b.shot=null;b.attacker=1;b.x=240;b.y=680;b.z=25;b.vx=-15;b.vy=0;b.vz=0;b.canCollect=2;}""")
 rect=p.locator('[data-act="jump"]').bounding_box();x=rect['x']+rect['width']/2;y=rect['y']+rect['height']/2;cdp=ctx.new_cdp_session(p)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':40,'x':x,'y':y}]});p.wait_for_timeout(150)
 print('while down',p.evaluate("""()=>{let g=SupermagicFootball.game;return {state:g.input.state[0],cd:g.player(0,0).diveCooldown,events:g.events.slice(-5).map(e=>e.type)}}"""))
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});p.wait_for_timeout(30)
 print('after',p.evaluate("""()=>{let g=SupermagicFootball.game;return {state:g.input.state[0],cd:g.player(0,0).diveCooldown,events:g.events.slice(-5).map(e=>e.type)}}"""))
 b.close()
