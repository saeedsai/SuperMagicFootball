#!/usr/bin/env python3
"""Verify selected-human Hide Ball marker handoff in the live engine."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current modular browser fixture first'
html=fixture.read_text(encoding='utf8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate('''() => {
   const g=SupermagicFootball.game;
   function setup(team,{humanPoking=false,backupFacing=true}={}){
    g.init({home:0,away:9,humans:2,mode:'quick',difficulty:3});
    const carrier=g.player(team,4),human=g.player(1-team,3),cpu=g.player(1-team,4);
    const dir=team===0?1:-1,heading=-dir;
    carrier.src={...carrier.src,magicTrick:'hideBall',dribbling:90};
    Object.assign(carrier,{dribbleHold:.35,magicReadyAt:0,fatigue:0,down:false,stun:0,z:0,keeper:false});
    g.ball.owner=carrier;
    Object.assign(human,{x:carrier.x+dir*45,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:humanPoking?'punch':'idle',actionTimer:humanPoking?.3:0,cd:0,dx:heading,dy:0,face:heading,
     moveVX:0,moveVY:0,src:{...human.src,defence:20}});
    const cpuHeading=backupFacing?heading:-heading;
    Object.assign(cpu,{x:carrier.x+dir*64,y:carrier.y,z:0,down:false,stun:0,invuln:0,
     action:'idle',actionTimer:0,cd:0,dx:cpuHeading,dy:0,face:cpuHeading,moveVX:0,moveVY:0,
     aiHideBallThreat:null,aiHideBallReaction:0,src:{...cpu.src,defence:80}});
    for(const q of g.players)if(q.t===1-team&&q!==human&&q!==cpu&&!q.keeper)q.stun=1;
    g.options.difficulty=3;g.matchState='play';g.clock=10;
    g.controlled[carrier.t]=carrier.i;g.controlled[human.t]=human.i;
    g.manualSwitchGrace[carrier.t]=10;g.manualSwitchGrace[human.t]=10;
    g.input.state[carrier.t]={dribble:true,x:0,y:0};g.input.state[human.t]={};
    return {carrier,human,cpu};
   }
   const backupOut=[];
   for(const team of [0,1]){
    const {carrier,human,cpu}=setup(team);
    let elapsed=.35,steps=0;const dt=1/60,originalRandom=Math.random;
    try{
     // Isolate the wind-up/resolver contract from the separate random contact-knockback outcome.
     Math.random=()=>.999;
     while(cpu.action!=='punch'&&elapsed<.99&&steps<80){
      carrier.dribbleHold=elapsed;
      g.reactToHideBallTrick(cpu,dt,.32);
      elapsed=Math.min(.99,elapsed+dt);steps++;
     }
    }finally{Math.random=originalRandom;}
    const holdAtPoke=elapsed;
    const cpuDistance=Math.hypot(carrier.x-cpu.x,carrier.y-cpu.y);
    if(cpuDistance>70)throw Error('AI backup left the existing 70-unit PASS-poke cone '+JSON.stringify({team,cpuDistance,steps,holdAtPoke}));
    carrier.dribbleHold=1;carrier.magicReadyAt=0;carrier.fatigue=0;
    carrier.down=false;carrier.stun=0;carrier.z=0;g.ball.owner=carrier;g.clock=10;
    const facingLength=Math.hypot(cpu.dx||0,cpu.dy||0);
    const facingDot=facingLength>.1?((carrier.x-cpu.x)*(cpu.dx||0)+(carrier.y-cpu.y)*(cpu.dy||0))/(Math.hypot(carrier.x-cpu.x,carrier.y-cpu.y)*facingLength):0;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    backupOut.push({team,steps,holdAtPoke,cpuAction:cpu.action,cpuTimer:cpu.actionTimer,cpuFacingDot:facingDot,
     humanAction:human.action,humanStillSelected:g.controlled[human.t]===human.i,
     activated,countered:event.countered,ownerRetained:g.ball.owner===carrier,cpuDistance,hideBallTimer:carrier.hideBallTimer||0});
   }
   const noDuplicate=[];
   for(const team of [0,1]){
    const {carrier,human,cpu}=setup(team,{humanPoking:true});
    g.reactToHideBallTrick(cpu,.2,0);
    carrier.dribbleHold=1;carrier.magicReadyAt=0;g.ball.owner=carrier;g.clock=10;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    noDuplicate.push({team,cpuAction:cpu.action,humanAction:human.action,
     humanStillSelected:g.controlled[human.t]===human.i,activated,countered:event.countered});
   }
   const misaligned=[];
   for(const team of [0,1]){
    const {carrier,human,cpu}=setup(team,{backupFacing:false});
    g.driveAI(cpu,.2);
    carrier.dribbleHold=1;carrier.magicReadyAt=0;g.ball.owner=carrier;g.clock=10;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    misaligned.push({team,cpuAction:cpu.action,humanAction:human.action,activated,
     countered:event.countered,hideBallTimer:carrier.hideBallTimer||0});
   }
   const momentumRead=[],momentumAway=[];
   for(const team of [0,1]){
    const {carrier,human,cpu}=setup(team),dir=team===0?1:-1;
    Object.assign(cpu,{dx:0,dy:0,moveVX:-dir*180,moveVY:0,face:dir});
    carrier.dribbleHold=.9;g.clock=10;
    g.reactToHideBallTrick(cpu,.02,0);
    const poked=cpu.action==='punch';
    carrier.dribbleHold=1;carrier.magicReadyAt=0;g.ball.owner=carrier;g.clock=10;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    momentumRead.push({team,cpuAction:cpu.action,poked,humanAction:human.action,
     humanStillSelected:g.controlled[human.t]===human.i,activated,countered:event.countered,
     ownerRetained:g.ball.owner===carrier,hideBallTimer:carrier.hideBallTimer||0});
   }
   for(const team of [0,1]){
    const {carrier,human,cpu}=setup(team),dir=team===0?1:-1;
    Object.assign(cpu,{dx:0,dy:0,moveVX:dir*180,moveVY:0,face:-dir});
    carrier.dribbleHold=.9;g.clock=10;
    g.reactToHideBallTrick(cpu,.02,0);
    const poked=cpu.action==='punch';
    carrier.dribbleHold=1;carrier.magicReadyAt=0;g.ball.owner=carrier;g.clock=10;
    const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
    momentumAway.push({team,cpuAction:cpu.action,poked,humanAction:human.action,activated,
     countered:event.countered,hideBallTimer:carrier.hideBallTimer||0});
   }
   return {backupOut,noDuplicate,misaligned,momentumRead,momentumAway,
    actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['actions']==4,(label,'gameplay action count changed',result)
  for case in result['backupOut']:
   assert case['cpuAction']=='punch' and case['cpuTimer']>0,(label,'CPU backup did not start PASS poke',case)
   assert case['cpuFacingDot']>=.65,(label,'PASS poke strike direction no longer faces the carrier',case)
   assert case['humanAction']=='idle' and case['humanStillSelected'],(label,'selected human lost control',case)
   assert .35<case['holdAtPoke']<1,(label,'backup poke missed the visible wind-up',case)
   assert case['activated'] and case['countered'] is True,(label,'real resolver rejected backup poke',case)
   assert case['ownerRetained'] and case['hideBallTimer']==0,(label,'counter changed possession or concealed the carrier',case)
  for case in result['noDuplicate']:
   assert case['cpuAction']!='punch',(label,'CPU duplicated an active human PASS poke',case)
   assert case['humanAction']=='punch' and case['humanStillSelected'],(label,'human counter/control was not preserved',case)
   assert case['activated'] and case['countered'] is True,(label,'resolver did not accept human counter',case)
  for case in result['misaligned']:
   assert case['cpuAction']!='punch',(label,'misaligned backup countered',case)
   assert case['activated'] and case['countered'] is False,(label,'misaligned backup falsely cancelled Hide Ball',case)
   assert case['hideBallTimer']>0,(label,'uncountered Hide Ball did not conceal',case)
  for case in result['momentumRead']:
   assert case['poked'] and case['cpuAction']=='punch',(label,'closing momentum did not select the CPU PASS poke',case)
   assert case['humanAction']=='idle' and case['humanStillSelected'],(label,'momentum backup stole human control',case)
   assert case['activated'] and case['countered'] is True and case['ownerRetained'] and case['hideBallTimer']==0,(label,'momentum PASS poke was not accepted',case)
  for case in result['momentumAway']:
   assert not case['poked'] and case['cpuAction']!='punch',(label,'retreating velocity was overridden by stale facing',case)
   assert case['activated'] and case['countered'] is False and case['hideBallTimer']>0,(label,'retreating marker falsely countered Hide Ball',case)
  assert not errors,(label,errors)
  print('MAGIC_HIDE_BALL_HUMAN_BACKUP_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
