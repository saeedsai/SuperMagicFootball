#!/usr/bin/env python3
"""SHOT-VFX-02: optional ball cosmetics render and persist without physics changes."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_settings
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build current game fixture first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.renderer?.drawSoccerBall',timeout=60000)
  open_settings(page,'graphics')
  picker=page.locator('#ballModel')
  assert picker.count()==1,(device,'Ball Design picker missing')
  picker.select_option('tricolore')
  assert page.evaluate('NekketsuHD.game.options.ballModel')=='tricolore',(device,'selected ball not applied to game visuals')
  picker.select_option('auriverde')
  assert page.evaluate('NekketsuHD.game.options.ballModel')=='auriverde',(device,'Auriverde selection not applied to game visuals')
  differences=page.evaluate("""() => {
   const sample=id=>{const c=document.createElement('canvas');c.width=64;c.height=64;
    const x=c.getContext('2d');NekketsuHD.renderer.drawSoccerBall(x,32,32,24,id,0);return x.getImageData(0,0,64,64).data};
   const classic=sample('classic'),france=sample('tricolore'),japan=sample('hinomaru'),brazil=sample('auriverde');
   let cf=0,jf=0,bf=0;for(let i=0;i<classic.length;i+=4){if(classic[i]!==france[i]||classic[i+1]!==france[i+1]||classic[i+2]!==france[i+2])cf++;if(japan[i]!==brazil[i]||japan[i+1]!==brazil[i+1]||japan[i+2]!==brazil[i+2])jf++;if(classic[i]!==brazil[i]||classic[i+1]!==brazil[i+1]||classic[i+2]!==brazil[i+2])bf++;}
   return {classicFrance:cf,japanBrazil:jf,classicBrazil:bf};
  }""")
  assert differences['classicFrance']>100,(device,differences)
  assert differences['japanBrazil']>100,(device,differences)
  assert differences['classicBrazil']>100,(device,differences)
  assert not errors,(device,errors)
  print('SHOT_VFX_02_COUNTRY_BALL_BROWSER_PASS',device,differences)
  context.close()
 browser.close()


