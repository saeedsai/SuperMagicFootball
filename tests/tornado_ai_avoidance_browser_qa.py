#!/usr/bin/env python3
"""Verify CPU escape from the existing Tornado pull zone in desktop/touch fixtures."""
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
   for(const side of [0,1])for(const hz of [30,60,120]){
    const cpu=roster.find(p=>p.t===side&&!p.keeper);
    const x=500,y=500;
    Object.assign(cpu,{t:side,x:x+100,y,z:0,vz:0,stun:0,keeper:false,jumpHold:0,
     aiTornadoKey:null,aiTornadoReaction:0,aiTornadoEvading:false});
    g.weather='Tornado';g.stormTimer=20;g.tornado={x,y,life:4.5,totalLife:4.5,radius:150};
    let frames=0;
    while(Math.hypot(cpu.x-x,cpu.y-y)<158&&frames<hz*4.5){
     g.updateWeather(1/hz);g.reactToTornado(cpu,1/hz,.32);frames++;
    }
    cases.push({side,hz,frames,distance:Math.hypot(cpu.x-x,cpu.y-y),life:g.tornado?.life});
   }
   return {cases,actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(result['cases'])==6,(label,result)
  for case in result['cases']:
   assert case['distance']>=158 and case['frames']<case['hz']*4.5,(label,'CPU remained inside the Tornado pull zone',case)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('TORNADO_AI_AVOIDANCE_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
