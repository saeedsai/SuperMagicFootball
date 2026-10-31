from menu_test_routes import open_quick,open_settings
"""v0.8.24: offline HTML goalkeeper animation and per-shot super gate regression.
Chromium desktop + simulated-touch only; no claim about real mobile hardware.
"""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parents[1]/'play.html').read_text()
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox','--disable-dev-shm-usage'])
 for touch in (False,True):
  ctx=browser.new_context(viewport={'width':1340,'height':820} if not touch else {'width':844,'height':400},is_mobile=touch,has_touch=touch)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function("!!window.SupermagicFootball?.game",timeout=30000)
  open_quick(page)
  page.locator('[data-action="kickoff"]').first.click()
  report=page.evaluate('''() => {
   const g=SupermagicFootball.game,results=[];
   g.matchState='paused';
   for(const team of [0,1]){
    g.init({home:0,away:9,humans:2,options:{weather:'Clear'}});
    g.matchState='paused';
    const k=g.player(team,0),dir=team===0?-1:1;
    k.src={...k.src,gkSkill:90,gkDiving:90,gkSuperAbility:{type:'defence',id:'megaPalm'}};
    k.y=765;k.x=team===0?270:3370;k.diveCooldown=0;k.abilityCd=0;k.stun=0;k.fatigue=0;
    const b=g.ball;
    Object.assign(b,{owner:null,attacker:1-team,x:k.x-dir*170,y:765,z:20,vx:dir*600,vy:0,vz:0,shot:{behavior:'normal',level:2},age:0,canCollect:1,power:55,trail:[]});
    let calls=0;
    g.activateKeeperSuper=()=>{calls++;return false};
    g.tryKeeperDive=()=>false;g.trySweptKeeperDive=()=>false;
    const original=Math.random;Math.random=()=>0.01;
    try {for(let i=0;i<18;i++)g.updateBall(1/120)}finally{Math.random=original}
    const shots={calls,considered:b.shot?.keeperAutoConsidered};
    g.tryKeeperDive=Object.getPrototypeOf(g).tryKeeperDive;
    g.trySweptKeeperDive=Object.getPrototypeOf(g).trySweptKeeperDive;
    Object.assign(b,{x:k.x-dir*55,y:790,z:12,vx:dir*900,shot:null,power:110,canCollect:0,owner:null,attacker:1-team});
    const dive=g.tryKeeperDive(k);
    const diveAction=k.action;
    if(dive)g.updatePlayers(.66);
    results.push({team,shots,dive,diveAction,land:k.action,seconds:k.diveCooldown,buttonCount:document.querySelectorAll('#touchButtons [data-act]').length});
   }
   return results;
  }''')
  for r in report:
   assert r['shots']=={'calls':1,'considered':True},(touch,r)
   assert r['dive'] and r['diveAction']=='keeperDive' and r['land']=='keeperRecover',(touch,r)
   assert r['buttonCount']==4,(touch,r)
  assert not errors,(touch,errors)
  print('PASS v0.8.24 keeper browser', 'simulated-touch' if touch else 'desktop','one per-shot check, recovery pose, four buttons',flush=True)
  page.close();ctx.close()
 browser.close()
