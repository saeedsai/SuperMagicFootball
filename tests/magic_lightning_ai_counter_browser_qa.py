#!/usr/bin/env python3
"""Exercise the shipped CPU Lightning response in desktop and touch browser fixtures."""
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
   const roster=g.players.slice();
   const cases=[];
   for(const side of [0,1])for(const hz of [30,60,120]){
    const caster=roster.find(p=>p.t===1-side&&!p.keeper),cpu=roster.find(p=>p.t===side&&!p.keeper&&p!==caster);
    Object.assign(cpu,{t:side,keeper:false,z:0,stun:0,action:'run',actionTimer:0,
     aiLightningThreat:null,aiLightningReaction:0});
    caster.t=1-side;caster.lightningPending={remaining:.32,target:cpu};
    g.players=[caster,cpu];let warning=.32,frames=0;
    while(warning>1e-9&&frames<hz&&cpu.action!=='jump'){
     warning=Math.max(0,warning-1/hz);caster.lightningPending.remaining=warning;
     g.reactToLightningTrick(cpu,1/hz,.18);
     frames++;
    }
    let z=cpu.z,vz=cpu.vz,left=warning;
    while(left>1e-9){const dt=Math.min(1/hz,left);z+=vz*dt;vz-=1080*dt;left-=dt;}
    cases.push({side,hz,frames,z:cpu.z,zAtResolve:z,action:cpu.action,warning});
   }
   return {cases,actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(result['cases'])==6,(label,result)
  for case in result['cases']:
   assert case['action']=='jump' and case['warning']>0,(label,'CPU failed to start its timely Lightning evasion',case)
   assert case['zAtResolve']>=20,(label,'CPU jump did not reach Lightning airborne-counter height before impact',case)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('MAGIC_LIGHTNING_AI_COUNTER_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
