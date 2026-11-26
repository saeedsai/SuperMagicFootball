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
    g.init({home:0,away:9,humans:0,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),forward=team===0?1:-1;
    g.ball.owner=carrier;carrier.src={...carrier.src,magicTrick:'fireball'};carrier.dribbleHold=.35;carrier.x=1000;carrier.y=520;
    cpu.x=carrier.x+forward*90;cpu.y=carrier.y;cpu.z=0;cpu.stun=0;cpu.action='idle';cpu.actionTimer=0;
    g.options.difficulty=3;
    for(const p of g.players)if(p.t===1-team&&p!==cpu&&!p.keeper){p.stun=1;}
    let steps=0,elapsed=.35;const dt=1/fps;
    while(!cpu.jumpCount&&elapsed<1){carrier.dribbleHold=elapsed;g.driveAI(cpu,dt);elapsed=Math.min(1,elapsed+dt);steps++;}
    out.push({team,fps,jumpCount:cpu.jumpCount,action:cpu.action,holdAtJump:elapsed,lead:1-elapsed,steps});
   }
   const handoffOut=[];
   for(const team of [0,1])for(const trick of ['fireball','freeze','bat']){
    g.init({home:0,away:9,humans:1,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),nearest=g.player(1-team,4),dir=team===0?1:-1;
    carrier.src={...carrier.src,magicTrick:trick};carrier.dribbleHold=.35;carrier.fatigue=0;carrier.down=false;carrier.stun=0;carrier.z=0;g.ball.owner=carrier;
    Object.assign(nearest,{x:carrier.x+dir*55,y:carrier.y,z:0,down:false,stun:0,invuln:2,action:'idle',actionTimer:0});
    Object.assign(cpu,{x:carrier.x+dir*90,y:carrier.y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,jumpCount:0,aiFireballThreat:null,aiFireballReaction:0});
    for(const q of g.players)if(q.t===1-team&&q!==cpu&&q!==nearest)q.stun=1;
    g.matchState='play';g.clock=10;g.controlled[carrier.t]=carrier.i;g.inControl=side=>side===carrier.t;
    g.input.state[carrier.t]={dribble:true,x:0,y:0};
    let steps=0;const dt=1/60;
    while(cpu.z<20&&carrier.dribbleHold<.95&&steps<60){g.updatePlayers(dt);steps++;}
    const holdAtCounter=carrier.dribbleHold;carrier.dribbleHold=1;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    handoffOut.push({team,trick,jumpCount:cpu.jumpCount,action:cpu.action,z:cpu.z,holdAtCounter,activated,
     countered:event.countered,nearestInvulnerable:nearest.invuln>0,steps});
   }
   const humanBackupOut=[];
   for(const team of [0,1])for(const trick of ['fireball','freeze','bat']){
    g.init({home:0,away:9,humans:2,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),human=g.player(1-team,4),dir=team===0?1:-1;
    carrier.src={...carrier.src,magicTrick:trick};carrier.dribbleHold=.35;carrier.fatigue=0;carrier.breath=1;carrier.down=false;carrier.stun=0;carrier.z=0;carrier.x=1000;carrier.y=520;g.ball.owner=carrier;
    Object.assign(human,{x:carrier.x+dir*55,y:carrier.y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0});
    Object.assign(cpu,{x:carrier.x+dir*90,y:carrier.y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,jumpCount:0,aiFireballThreat:null,aiFireballReaction:0});
    for(const q of g.players)if(q.t===1-team&&q!==cpu&&q!==human&&!q.keeper)q.stun=1;
    g.matchState='play';g.clock=10;g.options.difficulty=3;g.controlled[carrier.t]=carrier.i;g.controlled[human.t]=human.i;g.manualSwitchGrace[human.t]=10;
    g.input.state[carrier.t]={dribble:true,x:0,y:0};g.input.state[human.t]={};
    let steps=0;const dt=1/60;
    while(cpu.z<20&&carrier.dribbleHold<.95&&steps<60){g.updatePlayers(dt);steps++;}
    const holdAtCounter=carrier.dribbleHold;carrier.dribbleHold=1;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    humanBackupOut.push({team,trick,cpuJumpCount:cpu.jumpCount,cpuZ:cpu.z,humanSelected:g.controlled[human.t]===human.i,
     humanAction:human.action,humanZ:human.z,humanStun:human.stun,holdAtCounter,activated,countered:event.countered,steps});
   }
   return {out,handoffOut,humanBackupOut,actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['actions']==4,(label,'action count changed',result)
  for case in result['out']:
   assert case['jumpCount']==1 and case['action']=='jump' and case['lead']>=.25,(label,'CPU did not jump with time before Fireball',case)
  for case in result['handoffOut']:
   assert case['jumpCount']==1 and case['action']=='jump' and case['z']>=20 and case['holdAtCounter']<1,(label,'ready second defender did not rise before the Magic Trick cast',case)
   assert case['activated'] and case['countered'] is True,(label,'resolver did not recognize the handed-off JUMP',case)
   assert case['nearestInvulnerable'],(label,'fixture lost unavailable nearest defender',case)
  for case in result['humanBackupOut']:
   assert case['cpuJumpCount']>=1 and case['cpuZ']>=20 and case['holdAtCounter']<1,(label,'CPU teammate did not back up selected human defender',case)
   assert case['humanSelected'] and case['humanZ']<20 and case['humanStun']==0,(label,'selected human marker was not preserved',case)
   assert case['activated'] and case['countered'] is True,(label,'backup JUMP was not recognized by the actual resolver',case)
  assert not errors,(label,errors)
  print('MAGIC_FIREBALL_AI_COUNTER_BROWSER_PASS',label,[{key:case[key] for key in ('team','fps','holdAtJump','lead')} for case in result['out']],'actions=',result['actions'],flush=True)
  context.close()
 browser.close()
