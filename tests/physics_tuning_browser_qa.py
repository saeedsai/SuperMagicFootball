#!/usr/bin/env python3
"""True modular engine browser test of configurable pass speed and keeper recovery."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text()
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]
def sample(browser,kind,overrides):
 ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
   is_mobile=kind!='desktop',has_touch=kind!='desktop')
 page=ctx.new_page()
 errors=[]
 page.on('pageerror',lambda exc:errors.append(str(exc)))
 page.set_content(html)
 page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
 injected=''.join("GAME_ASSETS.mechanics.physicsTuning."+k+"="+str(float(v))+";" for k,v in overrides.items())
 start='const GAME_ASSETS='
 assert start in js, 'Generated modular game must embed authoritative GAME_ASSETS'
 split=js.index(';\n',js.index(start))+2
 code=js[:split]+'\n'+injected+'\n'+js[split:]
 page.add_script_tag(content=code,type='module')
 page.wait_for_function('!!window.SupermagicFootball')
 outcome=page.evaluate("""() => {
   const g=SupermagicFootball.game;
   g.init({home:0,away:9,humans:1,mode:'quick',options:g.options});
   g.matchState='paused';g.cooldown=0;
   const p=g.player(0,3);
   p.cd=0;p.stun=0;p.fatigue=0;p.z=0;
   g.take(p);
   const passOK=g.pass(p,false,false,{human:true});
   const ev=g.events.filter(e=>e.type==='passIntent').at(-1);
   const speed=ev?.speed;
   const keeper=g.player(0,0);
   keeper.stun=0;keeper.diveCooldown=0;keeper.fatigue=.75;
   const b=g.ball;b.owner=null;b.shot=null;b.attacker=1;b.x=keeper.x+4;b.y=keeper.y;b.z=0;b.vx=-500;b.vy=0;b.vz=0;b.power=25;b.age=0;
   const diveOK=g.tryKeeperDive(keeper,true);
   return {passOK,passSpeed:speed,diveOK,cooldown:keeper.diveCooldown,
    teams:SupermagicFootball.teams.length};
 }""")
 assert not errors,(kind,errors)
 assert outcome['passOK'] and outcome['diveOK'],(kind,outcome)
 assert outcome['teams']>=223,(kind,outcome)
 ctx.close()
 return outcome
with sync_playwright() as playwright:
 browser=playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ['desktop','simulated-touch']:
  original=sample(browser,kind,{})
  tuned=sample(browser,kind,{'passSpeed.qualityMultiplier':0,'keeperDiveRecovery.fatigueCoefficient':1.2})
  assert tuned['passSpeed']<original['passSpeed']-50,(kind,original,tuned)
  assert tuned['cooldown']>original['cooldown']+.2,(kind,original,tuned)
  print('PASS',kind,'playable engine pass + keeper coefficients respond to independent JSON edits',original,tuned,flush=True)
 browser.close()
