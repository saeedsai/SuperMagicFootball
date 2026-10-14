"""v0.8.19.6 standalone browser QA: goalkeeper rename, nonlinear paths, save animations, four-button retention."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or '/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,mobile in [('desktop',False),('simulated-android',True)]:
  context=browser.new_context(viewport={'width':1440 if not mobile else 844,'height':900 if not mobile else 390},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.22.1-alpha'")
  page.locator('[data-action="quick"]').first.click();page.locator('[data-action="prepHome"]').first.click()
  assert page.get_by_text('GK DIVING',exact=False).count()>0,(name,'GK Diving UI missing')
  assert page.get_by_text('GK JUMP',exact=False).count()==0,(name,'deprecated GK Jump UI label')
  assert page.locator('.rosterCard .ovrBadge').count()==12
  page.locator('[data-action="returnSetup"]').first.click();page.locator('[data-action="kickoff"]').first.click()
  result=page.evaluate('''()=>{
   const g=SupermagicFootball.game,out=[];
   g.matchState='paused';g.cooldown=0;
   for(const team of [0,1]){
    g.init({home:0,away:9,humans:2,options:{weather:'Clear'}});
    g.matchState='paused';g.cooldown=0;
    const k=g.player(team,0),dir=team===0?-1:1;
    for(const q of g.players.filter(p=>!p.keeper)){q.x=1800;q.y=240;}
    k.x=team===0?240:3400;
    k.y=765;k.diveCooldown=0;k.stun=0;k.fatigue=0;
    const b=g.ball;b.owner=null;b.attacker=1-team;b.x=k.x-dir*55;b.y=k.y+35;b.z=12;
    b.vx=dir*850;b.vy=0;b.vz=0;b.power=0;b.shot=null;b.canCollect=.6;b.age=0;
    const hit=g.tryKeeperDive(k);
    out.push({team,hit,save:g.events.some(e=>e.type==='save'),action:k.action,delta:k.diveDy,diving:k.src.gkDiving,legacy:('gkJump' in k.src)});
   }
   return {out,buttons:[...document.querySelectorAll('#touchButtons [data-act]')].map(x=>x.dataset.act)};
  }''')
  for r in result['out']:
   assert r['hit'] and r['save'] and r['action']=='keeperDiveCatch' and r['delta']>0 and r['diving']>0 and not r['legacy'],(name,r)
  assert set(result['buttons'])=={'pass','shoot','dribble','jump'},(name,result['buttons'])
  assert not errors,(name,errors)
  print(name,'PASS: GK Diving UI, migrated stat, 2 goalkeeper directional diving catches, action-button contract',flush=True)
  context.close()
 browser.close()
