"""Standalone HTML Chrome desktop + simulated Android keeper sweep/angle smoke."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or '/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,mobile in [('desktop',False),('simulated-android',True)]:
  context=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':720 if not mobile else 390},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.22.1-alpha'")
  page.locator('[data-action="quick"]').first.click()
  page.locator('[data-action="kickoff"]').first.click()
  result=page.evaluate('''()=>{
   const g=SupermagicFootball.game, outcomes=[];
   g.matchState='paused';g.cooldown=0;
   for(const team of [0,1])for(const mode of ['center','wide','high']){
    g.init({home:0,away:9,humans:2,options:{weather:'Clear'}});
    g.matchState='paused';g.cooldown=0;
    const k=g.player(team,0),dir=team===0?-1:1;
    k.diveCooldown=0;k.stun=0;k.fatigue=0;k.y=765;
    for(const p of g.players.filter(p=>!p.keeper)){p.x=1800;p.y=240;}
    const b=g.ball;b.owner=null;b.attacker=1-team;
    b.x=k.x-dir*290;b.y=765+(mode==='wide'?125:0);b.z=mode==='high'?250:12;
    b.vx=dir*25000;b.vy=0;b.vz=0;b.power=90;b.shot=null;
    b.canCollect=.7;b.age=0;b.trail=[];
    g.updateBall(.029);
    outcomes.push({team,mode,dive:g.events.some(e=>e.type==='keeperDive'),score:g.score[1-team]});
   }
   return {outcomes,buttons:[...document.querySelectorAll('#touchButtons [data-act]')].map(el=>el.dataset.act),formations:[...document.querySelectorAll('#formation option')].map(el=>el.value)};
  }''')
  for item in result['outcomes']:
   if item['mode']=='center':assert item['dive'] and item['score']==0,(label,item)
   if item['mode']=='wide':assert not item['dive'] and item['score']==1,(label,item)
   if item['mode']=='high':assert not item['dive'],(label,item)
  assert set(result['buttons'])=={'pass','shoot','dribble','jump'},(label,result)
  assert not errors,(label,errors)
  print(f'{label.upper()} PASS: fast sweep, unguarded corner, overbar, mirrored GK, four actions',flush=True)
  context.close()
 browser.close()
