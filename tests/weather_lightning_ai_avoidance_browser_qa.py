#!/usr/bin/env python3
"""Verify the modular CPU steers out of a nearby Storm marker in desktop/touch fixtures."""
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
    Object.assign(cpu,{t:side,x:x+105,y,z:0,stun:0,keeper:false,jumpHold:0,
     aiWeatherKey:null,aiWeatherReaction:0,aiWeatherEvading:false});
    let remaining=.55,frames=0;g.weatherLightning={phase:'warning',x,y,radius:110,remaining};
    while(remaining>1e-9&&frames<hz&&Math.hypot(cpu.x-x,cpu.y-y)<118){
     remaining=Math.max(0,remaining-1/hz);g.weatherLightning={...g.weatherLightning,remaining};
     g.reactToWeatherLightning(cpu,1/hz,.32);frames++;
    }
    cases.push({side,hz,frames,distance:Math.hypot(cpu.x-x,cpu.y-y),remaining});
   }
   return {cases,actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(result['cases'])==6,(label,result)
  for case in result['cases']:
   assert case['distance']>=118 and case['remaining']>.12,(label,'CPU did not exit the strike radius with warning left',case)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('WEATHER_LIGHTNING_AI_AVOIDANCE_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
