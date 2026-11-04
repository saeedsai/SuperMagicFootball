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
    Object.assign(cpu,{t:side,x:500+radius+5,y:500,z:0,stun:0,action:'run',actionTimer:0,jumpHold:0,
     aiHazardKey:null,aiHazardReaction:0,aiHazardEvading:false});
    g.magicHazards=[{kind,team:1-side,x:500,y:500,life:2.5,arm:0}];let frames=0;
    while(Math.hypot(cpu.x-500,cpu.y-500)<radius+12&&g.magicHazards[0].life>0&&frames<hz*2.5){
     g.magicHazards[0].life-=1/hz;g.reactToMagicHazard(cpu,1/hz,.18);frames++;
    }
    cases.push({kind,side,hz,frames,distance:Math.hypot(cpu.x-500,cpu.y-500),life:g.magicHazards[0].life});
   }
   return {cases,actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(result['cases'])==12,(label,result)
  for case in result['cases']:
   radius=35 if case['kind']=='ice' else 27
   assert case['distance']>=radius+12 and case['life']>0,(label,'CPU failed to clear an active trap',case)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('MAGIC_HAZARD_AI_AVOIDANCE_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
