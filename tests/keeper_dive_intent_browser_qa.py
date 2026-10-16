#!/usr/bin/env python3
"""Real modular keeper anticipation acceptance: 30/60/120Hz, both sides, desktop/touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text()
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
    is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball')
  outcome=page.evaluate("""() => {
   const samples=[];
   for(const fps of [30,60,120])for(const side of [0,1]){
    const g=SupermagicFootball.game;
    g.init({home:0,away:9,humans:1,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='paused';g.cooldown=0;
    const k=g.player(side,0),b=g.ball,dir=side===0?-1:1,goalY=765;
    k.x=side===0?255:2305;k.y=goalY;k.stun=0;k.diveCooldown=0;
    for(const p of g.players.filter(p=>!p.keeper)){p.x=1200;p.y=205;p.stun=0;}
    Object.assign(b,{owner:null,attacker:1-side,x:k.x-dir*225,y:goalY+85,z:15,
      vx:dir*950,vy:0,vz:0,shot:null,strike:null,ordinaryShot:true,power:30,
      age:.10,canCollect:1,trail:[],pass:false});
    const bx=b.x,kx=k.x,ky=k.y;
    g.updateBall(1/fps);
    const initialAttempts=g.events.filter(e=>e.type==='keeperDiveAttempt').length;
    const earlyContacts=g.events.filter(e=>e.type==='keeperContact'||e.type==='save').length;
    const active=k.action==='keeperDive'&&k.diveIntentPending;
    for(let n=0;n<3;n++)g.updateBall(1/fps);
    const attemptCount=g.events.filter(e=>e.type==='keeperDiveAttempt').length;
    const noEarlySave=earlyContacts===0&&b.owner===null&&g.score[1-side]===0&&k.x===kx&&k.y===ky;
    g.updatePlayers(.66);
    const recovery=k.action==='keeperRecover'&&!k.diveIntentPending;
    samples.push({fps,side,initialAttempts,active,attemptCount,noEarlySave,recovery,
      depthAtAttempt:Math.abs(bx-kx),ballMoved:b.x!==bx});
    k.diveIntentCooldown=0;k.diveCooldown=0;k.stun=0;
    Object.assign(b,{owner:null,attacker:1-side,x:k.x-dir*225,y:goalY+85,z:15,vx:-dir*950,vy:0,vz:0,
      ordinaryShot:true,shot:null,strike:null,age:.1});
    if(g.tryKeeperDiveIntent(k))throw Error('away-going ball started dive');
    b.vx=dir*950;b.y=1070;
    if(g.tryKeeperDiveIntent(k))throw Error('very wide miss started dive');
    b.y=goalY+85;b.z=430;
    if(g.tryKeeperDiveIntent(k))throw Error('overhead ball started dive');
   }
   return {samples,teams:SupermagicFootball.teams.length};
  }""")
  assert not errors,(kind,errors)
  assert len(outcome['samples'])==6,(kind,outcome)
  for row in outcome['samples']:
   assert row['initialAttempts']==1 and row['active'] and row['attemptCount']==1,(kind,row)
   assert row['noEarlySave'] and row['ballMoved'] and row['recovery'],(kind,row)
   assert row['depthAtAttempt']==225,(kind,row)
  assert outcome['teams']>=223,(kind,outcome)
  print('PASS',kind,'6 mirrored shot/fps fixtures, a single visible attempt, no off-plane saves',flush=True)
  ctx.close()
 browser.close()
