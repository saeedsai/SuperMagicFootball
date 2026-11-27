#!/usr/bin/env python3
"""Verify shipped CPU movement clears both ground-trap families in desktop/touch fixtures."""
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
   g.init({home:0,away:9,humans:1,mode:'quick'});g.matchState='paused';
   const roster=g.players.slice(),cases=[];g.playerSpeed=()=>300;g.cpuLevel=()=>2;
   for(const kind of ['banana','ice'])for(const side of [0,1])for(const hz of [30,60,120]){
    const cpu=roster.find(p=>p.t===side&&!p.keeper),radius=kind==='ice'?35:27;
    const attackDirection=side===0?1:-1;
    // Isolate the actual sweep lane: approach from behind the trap and keep
    // unrelated players outside the 280-unit automatic slide arc.
    for(const player of roster)if(player!==cpu)Object.assign(player,{
     x:1300,y:950,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0
    });
    Object.assign(cpu,{t:side,x:500-attackDirection*(radius+5),y:500,z:0,stun:0,
     down:false,face:attackDirection,cd:0,fatigue:0,invuln:0,moveVX:0,moveVY:0,dx:0,dy:0,
     action:'run',actionTimer:0,jumpHold:0,slideTimer:0,
     aiHazardKey:null,aiHazardReaction:0,aiHazardEvading:false});
    const hazard={kind,team:1-side,x:500,y:500,life:2.5,arm:0};
    g.magicHazards=[hazard];g.events=[];let frames=0;
    while(g.magicHazards.includes(hazard)&&Math.hypot(cpu.x-500,cpu.y-500)<radius+12&&
          hazard.life>0&&frames<hz*2.5){
     g.reactToMagicHazard(cpu,1/hz,.18);
     // Exercise the real post-movement production phase that disarms a SHOOT slide.
     g.updateMagicHazards(1/hz);
     frames++;
    }
    const distance=Math.hypot(cpu.x-500,cpu.y-500);
    const disarmed=g.events.some(e=>e.type==='magicHazardDisarmed'&&e.trick===kind&&e.team===side);
    cases.push({kind,side,hz,frames,distance,life:hazard.life,disarmed,escaped:distance>=radius+12,active:g.magicHazards.includes(hazard)});
   }
   const jumpCases=[];
   for(const kind of ['banana','ice'])for(const side of [0,1])for(const hz of [30,60,120]){
    g.init({home:0,away:9,humans:1,mode:'quick'});g.matchState='paused';
    const cpu=g.players.find(p=>p.t===side&&!p.keeper);
    const opponent=g.players.find(p=>p.t===1-side&&!p.keeper);
    const radius=kind==='ice'?35:27,dir=side===0?1:-1;
    for(const player of g.players)if(player!==cpu&&player!==opponent)Object.assign(player,{x:1300,y:950,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0});
    Object.assign(cpu,{x:500-dir*(radius+5),y:500,z:0,stun:0,down:false,face:dir,cd:0,fatigue:0,invuln:0,moveVX:0,moveVY:0,dx:dir,dy:0,action:'run',actionTimer:0,jumpHold:0,slideTimer:0,jumpCount:0,aiHazardKey:null,aiHazardReaction:0,aiHazardEvading:false});
    Object.assign(opponent,{x:cpu.x+dir*90,y:500,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0});
    g.ball.owner=cpu;
    const hazard={kind,team:1-side,x:500,y:500,life:2.5,arm:0};
    g.magicHazards=[hazard];g.events=[];
    const committed=g.reactToMagicHazard(cpu,1/hz,.18);
    const action=cpu.action,jumpCount=cpu.jumpCount,ballKept=g.ball.owner===cpu;
    g.updateMagicHazards(1/hz);
    jumpCases.push({kind,side,hz,committed,action,jumpCount,ballKept,slips:g.events.filter(e=>e.type==='magicHazard'&&e.player===cpu.src.name).length,active:g.magicHazards.some(h=>h.kind===kind&&h.team===1-side)});
   }
   const multiHazardCases=[];
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:1,mode:'quick'});g.matchState='paused';
    const cpu=g.players.find(p=>p.t===side&&!p.keeper),dir=side===0?1:-1;
    for(const player of g.players)if(player!==cpu)Object.assign(player,{
     x:1300,y:950,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0
    });
    Object.assign(cpu,{x:500,y:500,z:0,stun:0,down:false,face:dir,cd:0,fatigue:0,invuln:0,
     moveVX:0,moveVY:0,dx:dir,dy:0,action:'run',actionTimer:0,jumpHold:0,slideTimer:0,
     jumpCount:0,aiHazardKey:null,aiHazardReaction:0,aiHazardEvading:false});
    const offLane={kind:'banana',team:1-side,x:500,y:545,life:2.5,arm:0};
    const inLane={kind:'ice',team:1-side,x:500+dir*60,y:500,life:2.5,arm:0};
    g.magicHazards=[offLane,inLane];g.ball.owner=cpu;
    for(let frame=0;frame<20&&cpu.action!=='jump';frame++)g.reactToMagicHazard(cpu,1/60,.18);
    multiHazardCases.push({side,action:cpu.action,key:cpu.aiHazardKey,
     expectedKey:'ice:'+(1-side)+':'+(500+dir*60)+':500'});
   }
   const sidestepCases=[];
   for(const kind of ['banana','ice'])for(const side of [0,1]){
    g.init({home:0,away:9,humans:1,mode:'quick'});g.matchState='paused';
    const players=g.players.slice(),cpu=players.find(p=>p.t===side&&!p.keeper),
     rival=players.find(p=>p.t!==side&&!p.keeper),dir=side===0?1:-1;
    for(const player of players)if(player!==cpu&&player!==rival)Object.assign(player,{
     x:1300,y:950,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0,slideTimer:0
    });
    const startX=500-dir*80,startY=500;
    Object.assign(cpu,{x:startX,y:startY,z:0,stun:0,down:false,face:dir,cd:0,fatigue:0,invuln:0,
     moveVX:dir*220,moveVY:0,dx:dir,dy:0,action:'run',actionTimer:0,jumpHold:0,slideTimer:0,
     aiHazardKey:null,aiHazardReaction:0,aiHazardEvading:false});
    Object.assign(rival,{x:startX+dir*13.44,y:startY+(side===0?46.08:-46.08),z:0,stun:0,
     down:false,invuln:0,action:'run',actionTimer:0,slideTimer:0});
    const hazard={kind,team:1-side,x:500,y:500,life:2.5,arm:0};
    g.magicHazards=[hazard];g.ball.owner=cpu;
    const committed=g.reactToMagicHazard(cpu,.016,0);
    sidestepCases.push({kind,side,committed,forward:dir*(cpu.x-startX),lateral:cpu.y-startY,
     expectedSide:side===0?-1:1,action:cpu.action});
   }
   return {cases,jumpCases,multiHazardCases,sidestepCases,actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(result['cases'])==12,(label,result)
  for case in result['cases']:
   radius=35 if case['kind']=='ice' else 27
   assert (case['escaped'] or case['disarmed']) and case['life']>0,(label,'CPU neither escaped nor disarmed the active trap',case)
   assert case['active'] != case['disarmed'],(label,'hazard removal must match the disarm event',case)
  assert len(result['jumpCases'])==12,(label,len(result['jumpCases']))
  for case in result['jumpCases']:
   assert case['committed'] and case['action']=='jump' and case['jumpCount']==1,(label,'CPU must use the existing JUMP counter',case)
   assert case['ballKept'],(label,'JUMP counter must preserve carried-ball possession',case)
   assert case['slips']==0 and case['active'],(label,'first-frame JUMP must evade without consuming the trap',case)
  assert len(result['multiHazardCases'])==2,(label,'both teams must exercise competing traps',result)
  for case in result['multiHazardCases']:
   assert case['action']=='jump' and case['key']==case['expectedKey'],(label,'in-lane trap must outrank nearer off-lane trap',case)
  assert len(result['sidestepCases'])==4,(label,'both trap types and teams must exercise forward sidesteps',result)
  for case in result['sidestepCases']:
   assert case['committed'] and case['forward']>0 and abs(case['lateral'])>1,(label,'sidestep must preserve forward progress and leave the trap lane',case)
   assert (1 if case['lateral']>0 else -1)==case['expectedSide'],(label,'CPU must choose the safer flank away from the rival',case)
   assert case['action']!='jump',(label,'this fixture must exercise the movement-only sidestep',case)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('MAGIC_HAZARD_AI_AVOIDANCE_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
