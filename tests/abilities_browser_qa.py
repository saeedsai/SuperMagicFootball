from menu_test_routes import open_quick,open_settings
"""Current four-button defensive aerial ability and autonomous goalkeeper tests.
Supersedes the old 'L/Special button' browser expectations, removed in v0.8.18.1.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind,mobile in [('desktop',False),('simulated-mobile',True)]:
  c=b.new_context(viewport={'width':1280 if not mobile else 844,'height':720 if not mobile else 390},is_mobile=mobile,has_touch=mobile)
  p=c.new_page();errors=[];p.on('pageerror',lambda error:errors.append(str(error)))
  p.set_content((root/'play.html').read_text(),wait_until='load')
  p.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'")
  open_quick(p);p.locator('[data-action="kickoff"]').first.click()
  p.evaluate('''()=>{const sf=SupermagicFootball,g=sf.game,p=g.player(0,2),q=g.player(1,2);
   g.matchState='paused';g.cooldown=0;g.controlled[0]=2;g.driveAI=()=>{};
   g.ball.owner=q;q.x=1450;q.y=710;p.x=1380;p.y=710;p.cd=0;p.stun=0;p.fatigue=0;p.z=0;p.vz=0;p.abilityCd=0;
   g.input.reset();}''')
  if mobile:
   cdp=c.new_cdp_session(p)
   j=p.locator('[data-act="jump"]').bounding_box();s=p.locator('[data-act="shoot"]').bounding_box()
   pts=[{'id':51,'x':j['x']+j['width']/2,'y':j['y']+j['height']/2},{'id':52,'x':s['x']+s['width']/2,'y':s['y']+s['height']/2}]
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':pts})
   p.evaluate('''()=>{const a=SupermagicFootball;a.input.poll();a.game.updatePlayers(.016);}''')
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  else:
   p.keyboard.down('Space');p.keyboard.down('j')
   p.evaluate('''()=>{const a=SupermagicFootball;a.input.poll();a.game.updatePlayers(.016);}''')
   p.keyboard.up('j');p.keyboard.up('Space')
  result=p.evaluate('''()=>{const g=SupermagicFootball.game,p=g.player(0,2);
   return {action:p.action,events:g.events.map(e=>e.type),cooldown:p.abilityCd};}''')
  assert result['action'] in ['defenceSuper','flyingKick','defensiveBicycle','header','keeperSuper','jump'],(kind,result)
  # No independent fifth/Special action; keeper defense is autonomous.
  assert p.locator('#touchButtons [data-act]').count()==4
  res=p.evaluate('''()=>{const g=SupermagicFootball.game,k=g.player(0,0),b=g.ball;
   b.owner=null;b.attacker=1;b.x=k.x+45;b.y=k.y;b.z=18;b.vx=-350;b.vy=0;b.power=12;
   k.stun=0;k.diveCooldown=0;const acted=g.tryKeeperDive(k,false);
   return {acted,autonomous:g.events.some(e=>e.type==='keeperDive'&&!e.manual)};}''')
  assert res['acted'] and res['autonomous'],(kind,res)
  assert not errors,(kind,errors)
  print(kind,'PASS: four-button defensive aerial action and autonomous GK; removed Special binding not required')
  c.close()
 b.close()
