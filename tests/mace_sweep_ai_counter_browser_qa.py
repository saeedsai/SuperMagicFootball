#!/usr/bin/env python3
"""Verify the live CPU jump response to a Mace Sweep tell in desktop/touch contexts."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build current modular browser fixture first'
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
   const api=SupermagicFootball,g=api.game;
   g.init({home:0,away:9,humans:1,mode:'quick'});g.matchState='paused';
   const defender=g.player(0,2),cpu=g.player(1,2);g.players=[defender,cpu];
   defender.src={...defender.src,role:'DF',superDefenceLevel:2,
    superAbility:{type:'defence',id:'maceSweep',level:2}};
   defender.x=400;defender.y=300;defender.maceSweepPending={remaining:.24,target:cpu};
   Object.assign(cpu,{z:0,vz:0,stun:0,fatigue:0,dashTimer:0,action:'run',actionTimer:0});
   const before=cpu.z;let frames=0;
   while(defender.maceSweepPending.remaining>1e-9&&frames<60&&cpu.action!=='jump'){
    g.reactToMaceSweep(cpu,1/60,.18);
    defender.maceSweepPending.remaining=Math.max(0,defender.maceSweepPending.remaining-1/60);
    frames++;
   }
   return {before,frames,z:cpu.z,vz:cpu.vz,action:cpu.action,
    reaction:cpu.aiMaceSweepReaction,warning:defender.maceSweepPending.remaining,
    actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['vz']>0 and result['action']=='jump',(label,'CPU failed to issue its jump counter',result)
  assert result['frames']<=15 and result['warning']>0,(label,'CPU response exceeded .24s tell',result)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('MACE_SWEEP_AI_COUNTER_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
