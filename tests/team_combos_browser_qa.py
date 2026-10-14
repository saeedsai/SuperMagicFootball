from menu_test_routes import open_quick,open_settings
"""Four-button cross ordering and removed human teammate-launch browser tests.
Old simultaneous Pass+Jump teammate launch assertions were superseded by user request.
AI-only historical team combo behavior remains separately tested by ai_combos_browser_qa.py.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind,mobile in [('desktop',False),('simulated-mobile',True)]:
  c=b.new_context(viewport={'width':1280 if not mobile else 844,'height':720 if not mobile else 390},is_mobile=mobile,has_touch=mobile)
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'")
  open_quick(page);page.locator('[data-action="kickoff"]').first.click()
  result=page.evaluate('''()=>{
   const g=SupermagicFootball.game,p=g.player(0,3),b=g.ball;
   g.matchState='paused';g.cooldown=0;g.driveAI=()=>{};g.controlled[0]=3;
   p.cd=0;p.stun=0;p.fatigue=0;p.z=0;p.vz=0;g.take(p);
   g.input.state[0]={x:0,y:0,pass:1,jump:1};g.input.pressed[0]={pass:true,jump:true};g.input.releases[0]={};g.updatePlayers(.016);
   const noLaunch=!g.events.some(e=>e.type==='teamLaunch')&&b.owner===p;
   // Use an already airborne player and a fresh Pass-down edge (the real cross contract).
   g.take(p);p.z=90;p.vz=25;p.cd=0;g.cooldown=0;
   g.input.state[0]={x:0,y:0,pass:1};g.input.pressed[0]={pass:true};g.input.releases[0]={};
   g.updatePlayers(.016);
   return {noLaunch,cross:b.owner===null&&b.vz>=240,kicks:g.events.filter(e=>e.type==='kick').length};
  }''')
  assert result['noLaunch'] and result['cross'] and result['kicks']>=1,(kind,result)
  assert not errors,(kind,errors)
  print(kind,'PASS: simultaneous Pass+Jump never launches, airborne Jump-then-Pass crosses, four-button contract')
  c.close()
 b.close()
