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
     action:'shotDown',actionTimer:2,shotImpactKnockdownTimer:2,shotImpactKnockdownTotal:2,moveVX:0,moveVY:0});
    Object.assign(cpu,{x:carrier.x+dir*95,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:'idle',actionTimer:0,moveVX:0,moveVY:0,jumpCount:0,aiScreamThreat:null,aiScreamReaction:0});
    for(const q of g.players)if(q.t===1-team&&q!==cpu&&q!==nearest)q.stun=1;
    g.matchState='play';g.clock=10;
    g.controlled[carrier.t]=carrier.i;g.inControl=team=>team===carrier.t;
    g.input.state[carrier.t]={dribble:true,x:0,y:0};
    let steps=0;const dt=1/60;
    while(cpu.z<20&&carrier.dribbleHold<.95&&steps<60){g.updatePlayers(dt);steps++;}
    const holdAtCounter=carrier.dribbleHold;carrier.dribbleHold=1;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    handoffOut.push({team,jumpCount:cpu.jumpCount,action:cpu.action,z:cpu.z,holdAtCounter,activated,
     countered:event.countered,nearestDown:nearest.down,nearestAction:nearest.action,steps});
   }

   const humanBackupOut=[];
   for(const team of [0,1]){
    g.init({home:0,away:9,humans:2,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),human=g.player(1-team,4),dir=team===0?1:-1;
    carrier.src={...carrier.src,magicTrick:'scream',dribbling:60};carrier.dribbleHold=.35;carrier.fatigue=0;carrier.breath=1;
    carrier.down=false;carrier.stun=0;carrier.z=0;carrier.magicReadyAt=0;g.ball.owner=carrier;
    Object.assign(human,{x:carrier.x+dir*55,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:'idle',actionTimer:0,dx:0,dy:0,moveVX:0,moveVY:0,src:{...human.src,defence:20}});
    Object.assign(cpu,{x:carrier.x+dir*95,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:'idle',actionTimer:0,moveVX:0,moveVY:0,jumpCount:0,aiScreamThreat:null,aiScreamReaction:0});
    for(const q of g.players)if(q.t===1-team&&q!==cpu&&q!==human&&!q.keeper)q.stun=1;
    g.matchState='play';g.clock=10;g.controlled[carrier.t]=carrier.i;g.controlled[human.t]=human.i;
    g.manualSwitchGrace[human.t]=10;g.input.state[carrier.t]={dribble:true,x:0,y:0};g.input.state[human.t]={};
    let steps=0;const dt=1/60;
    while(cpu.z<20&&carrier.dribbleHold<.95&&steps<60){g.updatePlayers(dt);steps++;}
    const holdAtCounter=carrier.dribbleHold;
    // The timing loop advances the live CPU JUMP, but its human-input simulation can
    // also clear the caster's owner/hold state. Restore only the trick resolver's
    // preconditions so this assertion isolates whether the backup JUMP is accepted.
    carrier.src={...carrier.src,magicTrick:'scream'};
    Object.assign(carrier,{dribbleHold:1,magicReadyAt:0,magicHoldLatched:false,down:false,stun:0,keeper:false,z:0});
    g.ball.owner=carrier;g.clock=10;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    humanBackupOut.push({team,cpuJumpCount:cpu.jumpCount,cpuZ:cpu.z,humanSelected:g.controlled[human.t]===human.i,
     humanAction:human.action,humanZ:human.z,humanStun:human.stun,holdAtCounter,activated,countered:event.countered,
     ownerRestored:g.ball.owner===carrier,carrierStun:carrier.stun,magicReadyAt:carrier.magicReadyAt,steps});
   }
   const humanNoDuplicateOut=[];
   for(const team of [0,1])for(const state of ['jump','slide','read']){
    g.init({home:0,away:9,humans:2,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),cpu=g.player(1-team,3),human=g.player(1-team,4),dir=team===0?1:-1;
    carrier.src={...carrier.src,magicTrick:'scream',dribbling:60};carrier.dribbleHold=.7;carrier.fatigue=0;carrier.breath=1;
    carrier.down=false;carrier.stun=0;carrier.z=0;carrier.magicReadyAt=0;g.ball.owner=carrier;
    Object.assign(human,{x:carrier.x+dir*55,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:'idle',actionTimer:0,dx:0,dy:0,moveVX:0,moveVY:0,src:{...human.src,defence:90}});
    if(state==='jump')Object.assign(human,{action:'jump',actionTimer:.3,z:22});
    if(state==='slide')Object.assign(human,{action:'slide',actionTimer:.3,z:0});
    if(state==='read')Object.assign(human,{dx:-dir,dy:0,face:-dir});
    Object.assign(cpu,{x:carrier.x+dir*95,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:'idle',actionTimer:0,moveVX:0,moveVY:0,jumpCount:0,aiScreamThreat:null,aiScreamReaction:0});
    for(const q of g.players)if(q.t===1-team&&q!==cpu&&q!==human&&!q.keeper)q.stun=1;
    g.matchState='play';g.clock=10;g.controlled[carrier.t]=carrier.i;g.controlled[human.t]=human.i;
    g.manualSwitchGrace[human.t]=10;g.input.state[carrier.t]={dribble:true,x:0,y:0};g.input.state[human.t]={};
    g.driveAI(cpu,.2);
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    humanNoDuplicateOut.push({team,state,cpuJumpCount:cpu.jumpCount,humanSelected:g.controlled[human.t]===human.i,
     humanAction:human.action,humanZ:human.z,activated,countered:event.countered});
   }
   return {out,handoffOut,humanBackupOut,humanNoDuplicateOut,actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['actions']==4,(label,'action count changed',result)
  for case in result['out']:
   assert case['jumpCount']==1 and case['action']=='jump' and case['lead']>=.25,(label,'CPU did not start the existing JUMP counter with time to rise before Scream',case)
  for case in result['handoffOut']:
   assert case['jumpCount']==1 and case['action']=='jump' and case['z']>=20 and case['holdAtCounter']<1,(label,'next ready defender did not rise into Scream counter before the cast',case)
   assert case['activated'] and case['countered'] is True,(label,'actual Scream resolver did not recognize the handed-off JUMP',case)
   assert case['nearestDown'] and case['nearestAction']=='shotDown',(label,'fixture lost unavailable nearest defender',case)
  for case in result['humanBackupOut']:
   humanCounter=case['humanAction']=='jump' and case['humanZ']>=20
   if humanCounter:
    assert case['cpuJumpCount']==0,(label,'CPU duplicated the selected human JUMP counter',case)
   else:
    assert case['cpuJumpCount']>=1 and case['cpuZ']>=20 and case['holdAtCounter']<1,(label,'CPU teammate did not back up an idle selected human Scream marker',case)
    assert case['humanAction']=='idle' and case['humanZ']<20,(label,'selected human unexpectedly changed action without a valid counter',case)
   assert case['humanSelected'] and case['humanStun']==0,(label,'selected human lost control or was hit despite a valid counter',case)
   assert case['activated'] and case['countered'] is True,(label,'actual Scream resolver did not recognize the available human/CPU JUMP counter',case)
  for case in result['humanNoDuplicateOut']:
   assert case['cpuJumpCount']==0,(label,'CPU duplicated an effective selected-human counter',case)
   assert case['humanSelected'] and case['activated'] and case['countered'] is True,(label,'selected human counter was not preserved',case)
  assert not errors,(label,errors)
  print('MAGIC_SCREAM_AI_COUNTER_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
