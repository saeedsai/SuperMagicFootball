#!/usr/bin/env python3
"""Chromium desktop/touch regression: live eight-direction atlas hysteresis."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
source=(root/'src/modules/visualfeel.js').read_text(encoding='utf-8')
source=source.replace('import {GAME_ASSETS} from "../assets.js";','')
source=source.replace('export {VISUALFEEL};','window.__visualfeel=VISUALFEEL;')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.goto('about:blank')
  page.add_script_tag(content='const GAME_ASSETS={mechanics:{ballModels:[]}};\n'+source)
  state=page.evaluate("""() => {
   const v=window.__visualfeel,side={kind:'side',side:1},quarter={kind:'quarterFront',side:1};
   const samples={
    east:v.stableFacingView(1,0,1,side),
    west:v.stableFacingView(-1,0,1,side),
    sideHold:v.stableFacingView(1,.34,1,side),
    sideExit:v.stableFacingView(1,.40,1,side),
    quarterHold:v.stableFacingView(1,.32,1,quarter),
    quarterExit:v.stableFacingView(1,.20,1,quarter),
    verticalNoise:v.stableFacingView(-.05,1,1,{kind:'front',side:1}),
    verticalTurn:v.stableFacingView(-.2,1,1,{kind:'front',side:1}),
    north:v.stableFacingView(0,-1,1),
    south:v.stableFacingView(0,1,1)
   };
   return samples;
  }""")
  assert state['east']=={'kind':'side','side':1},(label,state)
  assert state['west']=={'kind':'side','side':-1},(label,state)
  assert state['sideHold']['kind']=='side' and state['sideExit']['kind']=='quarterFront',(label,state)
  assert state['quarterHold']['kind']=='quarterFront' and state['quarterExit']['kind']=='side',(label,state)
  assert state['verticalNoise']['side']==1 and state['verticalTurn']['side']==-1,(label,state)
  assert state['north']['kind']=='back' and state['south']['kind']=='front',(label,state)
  assert not errors,(label,errors)
  print('VIZ-03-HEADING-STABILITY-PASS',label,flush=True)
  context.close()
 browser.close()
