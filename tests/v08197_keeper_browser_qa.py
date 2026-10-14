from menu_test_routes import open_quick,open_settings
"""v0.8.20 offline HTML QA: fatigue-aware save recovery, animation, four actions, formations."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or '/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,mobile in [('desktop',False),('simulated-android',True)]:
  context=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':720 if not mobile else 390},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'")
  open_quick(page)
  page.locator('[data-action="kickoff"]').first.click()
  result=page.evaluate('''()=>{
   const g=SupermagicFootball.game;
   g.matchState='paused';
   const saves=[];
   for(const team of [0,1]){
    function trial(skill,diving,fatigue){
     g.init({home:0,away:9,humans:2,options:{weather:'Clear'}});
     g.matchState='paused';g.cooldown=0;
     for(const p of g.players.filter(p=>!p.keeper)){p.x=1800;p.y=240;}
     const k=g.player(team,0),dir=team===0?-1:1;
     k.src={...k.src,gkSkill:skill,gkDiving:diving};
     k.x=team===0?240:3400;k.y=765;k.fatigue=fatigue;k.diveCooldown=0;k.stun=0;
     const b=g.ball;b.owner=null;b.attacker=1-team;
     b.x=k.x-dir*55;b.y=k.y+29;b.z=12;
     b.vx=dir*850;b.vy=0;b.vz=0;b.power=110;b.shot=null;b.canCollect=.6;
     const success=g.tryKeeperDive(k);
     const initial=k.action,recovery=k.diveCooldown;
     if(success)g.updatePlayers(.66);
     return {success,initial,recovery,pose:k.action,remaining:k.actionTimer,events:g.events.filter(e=>e.type==='keeperRecovery').length};
    }
    const elite=trial(95,92,0),rookie=trial(25,28,.8);
    saves.push({team,elite,rookie});
   }
   return {saves,buttons:[...document.querySelectorAll('#touchButtons [data-act]')].map(e=>e.dataset.act),formations:[...document.querySelectorAll('#formation option')].map(e=>e.value)};
  }''')
  for team in result['saves']:
   for name in ['elite','rookie']:
    r=team[name]
    assert r['success'] and r['initial']=='keeperDive',(label,team,name)
    assert r['pose']=='keeperRecover' and r['events']>=1,(label,r)
   assert team['elite']['recovery']<team['rookie']['recovery'],(label,team)
  assert set(result['buttons'])=={'pass','shoot','dribble','jump'},(label,result)
  assert not errors,(label,errors)
  print(label,'PASS: mirrored GK dives, stat/fatigue-dependent recovery and landing animation; four action buttons',flush=True)
  context.close()
 browser.close()
