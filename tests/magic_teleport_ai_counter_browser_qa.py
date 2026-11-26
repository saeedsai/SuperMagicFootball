#!/usr/bin/env python3
"""Exercise the live Teleport counter response in desktop and touch Chromium."""
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
   const g=SupermagicFootball.game,out=[],humanBackupOut=[],humanNoDuplicateOut=[];
   for(const team of [0,1])for(const fps of [30,60,120]){
    g.init({home:0,away:9,humans:0,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),forward=team===0?1:-1;
    g.ball.owner=carrier;carrier.src={...carrier.src,magicTrick:'teleport'};carrier.dx=forward;carrier.dy=0;carrier.face=forward;
    carrier.dribbleHold=.35;g.options.difficulty=3;carrier.x=1000;carrier.y=520;
    cpu.x=carrier.x+forward*80;cpu.y=carrier.y;cpu.z=0;cpu.stun=0;cpu.cd=0;cpu.action='idle';cpu.actionTimer=0;
    for(const p of g.players)if(p.t===1-team&&p!==cpu&&!p.keeper){p.stun=1;}
    let steps=0,elapsed=.35;const dt=1/fps;
    while(cpu.action!=='slide'&&elapsed<1){carrier.dribbleHold=elapsed;g.driveAI(cpu,dt);elapsed=Math.min(1,elapsed+dt);steps++;}
    out.push({team,fps,action:cpu.action,slideTimer:cpu.slideTimer,holdAtSlide:elapsed,steps,slideEvents:g.events.filter(e=>e.type==='slideStart'&&e.player===cpu.src.name).length});
   }
   for(const team of [0,1]){
    g.init({home:0,away:9,humans:2,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),human=g.player(1-team,4),forward=team===0?1:-1;
    carrier.src={...carrier.src,magicTrick:'teleport',dribbling:60};carrier.dribbleHold=.35;
    carrier.fatigue=0;carrier.breath=1;carrier.down=false;carrier.stun=0;carrier.z=0;carrier.magicReadyAt=0;
    carrier.x=1000;carrier.y=520;g.ball.owner=carrier;
    Object.assign(human,{x:carrier.x+forward*55,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:'idle',actionTimer:0,dx:0,dy:0,moveVX:0,moveVY:0,src:{...human.src,defence:20}});
    Object.assign(cpu,{x:carrier.x+forward*70,y:carrier.y,z:0,down:false,stun:0,invuln:0,cd:0,
     action:'idle',actionTimer:0,moveVX:0,moveVY:0,jumpCount:0,aiTeleportThreat:null,aiTeleportReaction:0,aiTeleportReady:false});
    for(const q of g.players)if(q.t===1-team&&q!==cpu&&q!==human&&!q.keeper)q.stun=1;
    g.matchState='play';g.clock=10;g.controlled[carrier.t]=carrier.i;g.controlled[human.t]=human.i;
    g.manualSwitchGrace[human.t]=10;g.input.state[carrier.t]={dribble:true,x:0,y:0};g.input.state[human.t]={};
    let elapsed=.35,steps=0;const dt=1/60;
    while(cpu.action!=='slide'&&elapsed<1&&steps<60){carrier.dribbleHold=elapsed;g.driveAI(cpu,dt);elapsed=Math.min(1,elapsed+dt);steps++;}
    const holdAtSlide=elapsed;carrier.dribbleHold=1;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    humanBackupOut.push({team,cpuAction:cpu.action,slideTimer:cpu.slideTimer,holdAtSlide,
     humanSelected:g.controlled[human.t]===human.i,humanAction:human.action,humanZ:human.z,
     cpuDistance:Math.hypot(cpu.x-carrier.x,cpu.y-carrier.y),activated,countered:event.countered,steps});
   }
   for(const team of [0,1])for(const state of ['jump','slide','read']){
    g.init({home:0,away:9,humans:2,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),human=g.player(1-team,4),forward=team===0?1:-1;
    carrier.src={...carrier.src,magicTrick:'teleport',dribbling:60};carrier.dribbleHold=.7;
    carrier.fatigue=0;carrier.breath=1;carrier.down=false;carrier.stun=0;carrier.z=0;carrier.magicReadyAt=0;
    carrier.x=1000;carrier.y=520;g.ball.owner=carrier;
    Object.assign(human,{x:carrier.x+forward*55,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:'idle',actionTimer:0,dx:0,dy:0,moveVX:0,moveVY:0,src:{...human.src,defence:20}});
    if(state==='jump')Object.assign(human,{action:'jump',actionTimer:.3,z:22});
    if(state==='slide')Object.assign(human,{action:'slide',actionTimer:.3,slideTimer:.3,z:0});
    if(state==='read')Object.assign(human,{dx:-forward,dy:0,face:-forward,src:{...human.src,defence:95}});
    Object.assign(cpu,{x:carrier.x+forward*70,y:carrier.y,z:0,down:false,stun:0,invuln:0,cd:0,
     action:'idle',actionTimer:0,moveVX:0,moveVY:0,jumpCount:0,aiTeleportThreat:null,aiTeleportReaction:0,aiTeleportReady:false});
    for(const q of g.players)if(q.t===1-team&&q!==cpu&&q!==human&&!q.keeper)q.stun=1;
    g.matchState='play';g.clock=10;g.controlled[carrier.t]=carrier.i;g.controlled[human.t]=human.i;
    g.manualSwitchGrace[human.t]=10;g.input.state[carrier.t]={dribble:true,x:0,y:0};g.input.state[human.t]={};
    const response=g.reactToTeleportTrick(cpu,.2,.02);
    carrier.dribbleHold=1;const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    humanNoDuplicateOut.push({team,state,response,cpuAction:cpu.action,
     humanSelected:g.controlled[human.t]===human.i,humanAction:human.action,humanZ:human.z,activated,countered:event.countered});
   }
   return {out,humanBackupOut,humanNoDuplicateOut,actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['actions']==4,(label,'action count changed',result)
  for case in result['out']:
   assert case['action']=='slide' and case['slideTimer']>0 and case['slideEvents']==1,(label,'CPU did not start its existing slide counter',case)
   assert .88<=case['holdAtSlide']<1,(label,'slide was not timed near Teleport cast',case)
   assert case['slideTimer']>1-case['holdAtSlide'],(label,'grounded slide expired before the held Teleport cast',case)
  assert not errors,(label,errors)
  for case in result['humanBackupOut']:
   assert case['cpuAction']=='slide',(label,'CPU teammate did not back up selected human lane marker',case)
   assert case['slideTimer']>0 and .88<=case['holdAtSlide']<1,(label,'backup slide timing',case)
   assert case['cpuDistance']<95,(label,'backup left existing counter radius',case)
   assert case['humanSelected'] and case['humanAction']=='idle' and case['humanZ']<20,(label,'selected human marker control',case)
   assert case['activated'] and case['countered'] is True,(label,'actual Teleport resolver did not recognize backup',case)
  for case in result['humanNoDuplicateOut']:
   assert case['response'] is False,(label,'CPU backup duplicated existing human counter',case)
   assert case['cpuAction']=='idle',(label,'CPU should not duplicate existing counter',case)
   assert case['humanSelected'] and case['activated'] and case['countered'] is True,(label,'existing human counter was not preserved',case)
  print('MAGIC_TELEPORT_AI_COUNTER_BROWSER_PASS',label,[{key:case[key] for key in ('team','fps','holdAtSlide','slideTimer')} for case in result['out']],'humanBackup=',result['humanBackupOut'],'actions=',result['actions'],flush=True)
  context.close()
 browser.close()
