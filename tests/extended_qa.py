from pathlib import Path
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height,mobile in [(1440,900,False),(844,390,True)]:
  context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,is_mobile=mobile,has_touch=mobile)
  p=context.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content((base/'play.html').read_text(),wait_until='load');p.wait_for_timeout(400)
  assert p.locator('[data-action="clubs"]').count()==1
  p.locator('[data-action="clubs"]').click()
  p.locator('#clubName').fill('Thunder Cats FC')
  p.locator('#clubCode').fill('TCF')
  p.locator('#clubShot').select_option('piranha')
  p.locator('[data-action="saveClub"]').click()
  assert p.locator('#homeTeam').input_value()=='13'
  assert p.evaluate('NekketsuHD.teams.length')==14
  p.locator('[data-action="kickoff"]').click();p.wait_for_timeout(320)
  assert p.locator('#hud').is_visible()
  assert p.evaluate('NekketsuHD.game.players.length')==12
  assert p.evaluate('NekketsuHD.game.getTeam(0).name')=='Thunder Cats FC'
  # Issue super shot through gameplay actions on the actually selected player.
  p.evaluate('''() => {let g=NekketsuHD.game;g.cooldown=0;let k=g.player(0,3);k.specialCd=0;g.take(k);g.command(k,'special');}''')
  assert p.evaluate('NekketsuHD.game.ball.shot.id')=='piranha'
  p.wait_for_timeout(170)
  p.screenshot(path=str(base/'tests'/('gameplay_mobile_qa.png' if mobile else 'gameplay_desktop_qa.png')))
  # Normal shot charge via actual input API (render frames drive it)
  p.evaluate('''() => {let g=NekketsuHD.game;g.cooldown=0;let k=g.player(0,3);g.take(k);k.charge=0;k.specialCd=0;k.stun=0;for(const q of g.players.filter(p=>p.t===1)){q.x=3000;q.y=1050;q.cd=1;}}''')
  if not mobile:
   p.keyboard.down('j');p.wait_for_timeout(400)
   charge=p.evaluate('NekketsuHD.game.player(0,3).charge')
   assert charge>0.05,charge
   p.keyboard.up('j');p.wait_for_timeout(180)
   # The charged kick may be intercepted, but it must be launched.
   assert p.evaluate('NekketsuHD.game.ball.owner===null || NekketsuHD.game.ball.age>0')
  p.locator('#pauseBtn').click()
  assert p.evaluate('NekketsuHD.game.matchState')=='paused'
  p.locator('[data-action="resume"]').click()
  # Match state is really paused at halftime, not running underneath menus.
  p.evaluate('''() => {let g=NekketsuHD.game;g.clock=g.matchSeconds-0.005;g.update(.02);}''')
  assert p.locator('[data-action="resume"]').count()==1
  assert p.evaluate('NekketsuHD.game.matchState')=='paused', 'Halftime match should pause'
  p.locator('[data-action="resume"]').click()
  assert p.evaluate('NekketsuHD.game.half')==2
  p.locator('#pauseBtn').click();p.locator('[data-action="quit"]').click()
  p.locator('[data-action="clubs"]').click()
  assert p.locator('[data-action="selectClub13"]').count()==1
  p.locator('[data-action="home"]').click();p.locator('[data-action="gallery"]').click()
  assert p.locator('.shotCard').count()==23
  assert p.locator('.shotArt').count()==23
  assert not errors,errors
  print(('MOBILE' if mobile else 'DESKTOP')+': club CRUD/teams/super shots/halftime/gallery PASS')
  context.close()
 browser.close()
