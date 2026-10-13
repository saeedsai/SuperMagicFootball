from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
markup=(root/'play.html').read_text()
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox'])
 for mode,vp in [('desktop',(1440,850)),('android',(940,438))]:
  page=browser.new_page(viewport={'width':vp[0],'height':vp[1]},is_mobile=mode=='android',has_touch=mode=='android',device_scale_factor=1)
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(markup,wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'",timeout=25000)
  page.locator('[data-action="quick"]').first.click()
  page.locator('[data-action="kickoff"]').first.click()
  page.wait_for_timeout(200)
  result=page.evaluate('''() => {
   let g=window.SupermagicFootball.game, p=g.player(0,3),enemy=g.player(1,3),keeper=g.player(0,0);
   g.cooldown=0;g.take(p);
   const bot=g.players.filter(q=>q.t===1&&!q.keeper&&!q.stun).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
   bot.x=p.x+200;bot.y=p.y;bot.aiTimer=100;
   const before=Math.hypot(bot.x-p.x,bot.y-p.y);g.driveAI(bot,.09);
   const press=Math.hypot(bot.x-p.x,bot.y-p.y)<before;
   p.z=230;p.specialCd=0;g.take(p);g.shoot(p,true,true);
   const shot=!!g.ball.shot&&g.ball.z<100&&g.ball.vz<0;
   g.take(keeper);g.distributeKeeper(keeper,'short');
   const kd=g.events.filter(e=>e.type==='keeperDistribution').at(-1);
   return {press,shot,gkMode:kd?.mode,scoreboard:document.querySelector('#hud')!==null};
  }''')
  assert result['press'],f'AI did not close distance: {result}'
  assert result['shot'],f'Super shot did not descend: {result}'
  assert result['gkMode']=='short',f'Keeper did not pass: {result}'
  assert not errors,errors[:3]
  page.screenshot(path=str(root/'tests'/f'active_pursuit_{mode}.png'))
  print(mode.upper(),'PASS:',result)
  page.close()
 browser.close()
