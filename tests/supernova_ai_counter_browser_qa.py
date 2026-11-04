#!/usr/bin/env python3
"""Verify shipped Supernova CPU evasion and reach in desktop/touch fixtures."""
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
   const roster=g.players.slice(),cases=[];
   for(const side of [0,1])for(const hz of [30,60,120]){
    const cpu=roster.find(p=>p.t===side&&!p.keeper);
    Object.assign(cpu,{t:side,keeper:false,x:1100,y:620,z:0,vz:0,stun:0,action:'run',actionTimer:0,
     aiSupernovaKey:null,aiSupernovaReaction:0});
    g.players=[cpu];let remaining=.85,frames=0;
    g.supernova={team:1-side,x:1100,y:620,radius:142,remaining};
    while(remaining>1e-9&&frames<hz*2&&cpu.action!=='jump'){
     remaining=Math.max(0,remaining-1/hz);g.supernova={...g.supernova,remaining};
     g.reactToSupernova(cpu,1/hz,.53);frames++;
    }
    let z=cpu.z,vz=cpu.vz,left=remaining;
    while(left>1e-9){const dt=Math.min(1/hz,left);z+=vz*dt;vz-=1080*dt;left-=dt;}
    cases.push({side,hz,frames,z:cpu.z,zAtImpact:z,action:cpu.action,remaining});
   }
   return {cases,actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(result['cases'])==6,(label,result)
  for case in result['cases']:
   assert case['action']=='jump' and case['remaining']>.12,(label,'CPU did not start a useful Supernova counter',case)
   assert case['zAtImpact']>=20,(label,'CPU jump did not reach the existing airborne counter by impact',case)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('SUPERNOVA_AI_COUNTER_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
