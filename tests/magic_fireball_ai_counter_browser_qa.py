#!/usr/bin/env python3
"""Exercise the live Fireball CPU JUMP response in desktop/touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current modular browser fixture first'
html=fixture.read_text(encoding='utf8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate('''() => {
   const g=SupermagicFootball.game,out=[];
   for(const team of [0,1])for(const fps of [30,60,120]){
    g.init({home:0,away:9,humans:1,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),forward=team===0?1:-1;
    g.ball.owner=carrier;carrier.src={...carrier.src,magicTrick:'fireball'};carrier.dribbleHold=.35;carrier.x=1000;carrier.y=520;
    cpu.x=carrier.x+forward*90;cpu.y=carrier.y;cpu.z=0;cpu.stun=0;cpu.action='idle';cpu.actionTimer=0;
    g.options.difficulty=3;
    for(const p of g.players)if(p.t===1-team&&p!==cpu&&!p.keeper){p.stun=1;}
    let steps=0,elapsed=.35;const dt=1/fps;
    while(!cpu.jumpCount&&elapsed<1){carrier.dribbleHold=elapsed;g.driveAI(cpu,dt);elapsed=Math.min(1,elapsed+dt);steps++;}
    out.push({team,fps,jumpCount:cpu.jumpCount,action:cpu.action,holdAtJump:elapsed,lead:1-elapsed,steps});
   }
   return {out,actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['actions']==4,(label,'action count changed',result)
  for case in result['out']:
   assert case['jumpCount']==1 and case['action']=='jump' and case['lead']>=.25,(label,'CPU did not jump with time before Fireball',case)
  assert not errors,(label,errors)
  print('MAGIC_FIREBALL_AI_COUNTER_BROWSER_PASS',label,[{key:case[key] for key in ('team','fps','holdAtJump','lead')} for case in result['out']],'actions=',result['actions'],flush=True)
  context.close()
 browser.close()
