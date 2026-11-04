#!/usr/bin/env python3
"""CT19: exercise shipped modular Input's cancel/disconnect neutral gates."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the modular browser fixture first'
html=fixture.read_text(encoding='utf8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.input',timeout=60000)
  result=page.evaluate('''() => {
   const input=NekketsuHD.input,buttons=Array.from({length:16},()=>({pressed:false}));
   const pad={index:0,buttons,axes:[0,0]};
   Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
   buttons[1].pressed=true;input.poll();const initial=input.just(0,'pass');
   input.cancelAll();input.poll();const afterCancel={held:input.held(0,'pass'),just:input.just(0,'pass')};
   buttons[1].pressed=false;input.poll();buttons[1].pressed=true;input.poll();
   const freshPress=input.just(0,'pass');
   const disconnect=new Event('gamepaddisconnected');disconnect.gamepad={index:0};
   dispatchEvent(disconnect);input.poll();
   const reconnectHeld={held:input.held(0,'pass'),just:input.just(0,'pass')};
   buttons[1].pressed=false;input.poll();buttons[1].pressed=true;input.poll();
   return {initial,afterCancel,freshPress,reconnectHeld,reconnectedFresh:input.just(0,'pass'),
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['initial'] is True,(label,'initial gamepad press failed',result)
  assert result['afterCancel']=={'held':False,'just':False},(label,'background/cancel held input replayed',result)
  assert result['freshPress'] is True,(label,'neutral did not rearm gamepad after cancel',result)
  assert result['reconnectHeld']=={'held':False,'just':False},(label,'reconnected held input replayed',result)
  assert result['reconnectedFresh'] is True,(label,'neutral did not rearm reconnect',result)
  assert result['buttons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('CT19_MODULAR_GAMEPAD_NEUTRAL_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
