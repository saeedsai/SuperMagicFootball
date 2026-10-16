#!/usr/bin/env python3
"""Real-engine desktop/touch check for Super Shot balance and keeper-held balls."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text()
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]
def sample(browser,kind,baseline=False):
 ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
   is_mobile=kind!='desktop',has_touch=kind!='desktop')
 page=ctx.new_page()
 errors=[]
 page.on('pageerror',lambda exc:errors.append(str(exc)))
 page.set_content(html)
 page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
 marker='const GAME_ASSETS='
 split=js.index(';\n',js.index(marker))+2
 overrides="GAME_ASSETS.mechanics.physicsTuning.superShot.speedMultiplier=1;GAME_ASSETS.mechanics.physicsTuning.superShot.fatigueMultiplier=1;" if baseline else ""
 page.add_script_tag(content=js[:split]+'\n'+overrides+'\n'+js[split:],type='module')
 page.wait_for_function('!!window.SupermagicFootball')
 result=page.evaluate("""() => {
  const g=SupermagicFootball.game;
  g.init({home:0,away:9,mode:'quick',humans:1,options:g.options});
  g.matchState='paused';g.cooldown=0;
  const p=g.players.find(x=>x.t===0&&!x.keeper&&x.src.superAbility?.type==='shoot'&&x.src.shot);
  if(!p)throw Error('missing super striker');
  p.stun=0;p.cd=0;p.specialCd=0;p.fatigue=0;
  g.take(p);
  const oldRandom=Math.random;Math.random=()=>.5;
  let fired;
  try{fired=g.shoot(p,true,false);}finally{Math.random=oldRandom;}
  const velocity=Math.hypot(g.ball.vx,g.ball.vy),fatigue=p.fatigue;
  const keeper=g.player(0,0);
  keeper.stun=0;keeper.cd=0;keeper.aiTimer=100;
  for(const q of g.players.filter(q=>q.t!==keeper.t&&!q.keeper)){q.x=(g.player(0,0).x+g.player(1,0).x)/2;q.y=200;}
  const caught=g.keeperCollect(keeper,'dive');
  g.updateBall(.016);
  const held=g.ball.owner===keeper,handHeight=g.ball.z;
  g.driveAI(keeper,.38);
  const stillHeld=g.ball.owner===keeper;
  const distributed=g.distributeKeeper(keeper,'long');
  return {fired,velocity,fatigue,caught,held,handHeight,stillHeld,distributed,
    released:g.ball.owner===null,teams:SupermagicFootball.teams.length};
 }""")
 assert not errors,(kind,errors)
 assert all(result[k] for k in ('fired','caught','held','stillHeld','distributed','released')),(kind,result)
 assert result['handHeight']>=80,(kind,result)
 ctx.close()
 return result
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('desktop','simulated-touch'):
  baseline=sample(browser,kind,True)
  tuned=sample(browser,kind,False)
  assert .957<tuned['velocity']/baseline['velocity']<.963,(kind,baseline,tuned)
  assert 1.078<tuned['fatigue']/baseline['fatigue']<1.082,(kind,baseline,tuned)
  print('PASS',kind,'Super Shot -4% velocity, +8% fatigue; goalkeeper holds and distributes',baseline,tuned,flush=True)
 browser.close()
