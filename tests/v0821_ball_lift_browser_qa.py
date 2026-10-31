from menu_test_routes import open_feature
"""Desktop and simulated-Android integration: two-stage four-button ball lift.
This uses the real final standalone game engine and renderer but synthetic button
states for determinism; physical multitouch hardware remains unverified.
"""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parents[1]/'play.html').read_text()
with sync_playwright() as pw:
 for name,touch in [('Desktop Chromium',False),('Simulated Android touch',True)]:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  ctx=browser.new_context(viewport={'width':1400,'height':850} if not touch else {'width':760,'height':412},has_touch=touch,is_mobile=touch)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html,wait_until='load')
  page.wait_for_function("!!window.SupermagicFootball?.game",timeout=20000)
  assert sorted(page.locator('[data-act]').evaluate_all('els=>els.map(x=>x.dataset.act)'))==['dribble','jump','pass','shoot']
  open_feature(page,'help')
  help_text=page.locator('body').inner_text()
  assert 'Hold DRIBBLE 0.26s' in help_text and 'SUPER BICYCLE' in help_text.upper(),help_text[-500:]
  result=page.evaluate('''() => {
    const {game:g,input:i}=SupermagicFootball;
    g.init({home:0,away:9,options:{...g.options,weather:'Clear'}});
    g.autoSwitch=()=>false;g.driveAI=()=>{};g.cooldown=0;
    const p=g.player(0,3);g.take(p);p.x=1670;p.y=760;p.face=1;p.cd=0;
    for(const q of g.players)if(q!==p){q.x=q.t?3290:320;q.y=1100;}
    g.events.length=0;
    i.tapDuration=()=>0;
    const step=(state={},just={},releases={},repeat=1,dt=.016)=>{
      i.state[0]=state;i.pressed[0]=just;i.releases[0]=releases;
      for(let n=0;n<repeat;n++){
        g.updatePlayers(dt);i.pressed[0]={};i.releases[0]={};
      }
    };
    step({dribble:1},{dribble:true});step({dribble:1},{},{},19);
    step({dribble:1,jump:1},{jump:true});
    const loft={height:g.ball.z,playerHeight:p.z,owner:g.ball.owner,action:p.action};
    step({}, {},{jump:true,dribble:true});step({jump:1},{jump:true});
    const jumped=p.z>0;
    step({dribble:1},{dribble:true});step({}, {},{dribble:true});step({dribble:1},{dribble:true});
    const events=g.events.filter(e=>['ballLift','superBicycleShot','bicycleShot'].includes(e.type)).map(e=>e.type);
    const result={loft,jumped,events,shotSpeed:Math.hypot(g.ball.vx,g.ball.vy),shape:g.ball.shot,action:p.action,score:g.score.slice(),formations:Object.keys(g.constructor===null?{}:g.teamPlans||{}).length};
    return result;
  }''')
  assert result['loft']['height']>45 and result['loft']['playerHeight']==0,result
  assert result['jumped'],result
  assert result['events']==['ballLift','superBicycleShot'],result
  assert result['shotSpeed']>700 and result['shape'] is not None and result['action']=='superBicycle',result
  assert not errors,errors
  print(f'PASS {name}: 4 actions, How to Play, held lift, airborne follow-up, unified transforming special shot',flush=True)
  ctx.close();browser.close()
