#!/usr/bin/env python3
"""Exercise the live Scream CPU reaction in desktop and touch Chromium."""
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
   const app=SupermagicFootball,g=app.game,out=[];
   for(const team of [0,1])for(const fps of [30,60,120]){
    g.init({home:0,away:9,humans:1,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3);g.ball.owner=carrier;
    carrier.src={...carrier.src,magicTrick:'scream'};carrier.dribbleHold=.35;g.options.difficulty=3;
    cpu.x=carrier.x+(team===0?120:-120);cpu.y=carrier.y;cpu.z=0;cpu.stun=0;cpu.action='idle';cpu.actionTimer=0;
    for(const p of g.players)if(p.t===1-team&&p!==cpu&&!p.keeper){p.stun=1;}
    let steps=0,elapsed=.35;const dt=1/fps;
    while(!cpu.jumpCount&&elapsed<1){carrier.dribbleHold=elapsed;g.driveAI(cpu,dt);elapsed+=dt;steps++;}
    out.push({team,fps,jumpCount:cpu.jumpCount,action:cpu.action,z:cpu.z,holdAtJump:elapsed,lead:1-elapsed,steps});
   }
   const handoffOut=[];
   for(const team of [0,1]){
    g.init({home:0,away:9,humans:1,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),nearest=g.player(1-team,4),dir=team===0?1:-1;
    carrier.src={...carrier.src,magicTrick:'scream'};carrier.dribbleHold=.35;g.options.difficulty=3;
    carrier.down=false;carrier.stun=0;carrier.z=0;g.ball.owner=carrier;
    Object.assign(nearest,{x:carrier.x+dir*55,y:carrier.y,z:0,down:true,stun:0,invuln:0,
     action:'shotDown',actionTimer:.4,moveVX:0,moveVY:0});
    Object.assign(cpu,{x:carrier.x+dir*95,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:'idle',actionTimer:0,moveVX:0,moveVY:0,jumpCount:0,aiScreamThreat:null,aiScreamReaction:0});
    for(const q of g.players)if(q.t===1-team&&q!==cpu&&q!==nearest)q.stun=1;
    g.matchState='play';g.clock=10;
    let elapsed=.35,steps=0;const dt=1/60;
    while(!cpu.jumpCount&&elapsed<1&&steps<60){carrier.dribbleHold=elapsed;g.driveAI(cpu,dt);elapsed+=dt;steps++;}
    carrier.dribbleHold=1;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    handoffOut.push({team,jumpCount:cpu.jumpCount,action:cpu.action,z:cpu.z,activated,
     countered:event.countered,nearestDown:nearest.down,nearestAction:nearest.action,steps});
   }
   return {out,handoffOut,actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['actions']==4,(label,'action count changed',result)
  for case in result['out']:
   assert case['jumpCount']==1 and case['action']=='jump' and case['lead']>=.25,(label,'CPU did not start the existing JUMP counter with time to rise before Scream',case)
  for case in result['handoffOut']:
   assert case['jumpCount']==1 and case['action']=='jump' and case['z']>=20,(label,'next ready defender did not rise into Scream counter',case)
   assert case['activated'] and case['countered'] is True,(label,'actual Scream resolver did not recognize the handed-off JUMP',case)
   assert case['nearestDown'] and case['nearestAction']=='shotDown',(label,'fixture lost unavailable nearest defender',case)
  assert not errors,(label,errors)
  print('MAGIC_SCREAM_AI_COUNTER_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
