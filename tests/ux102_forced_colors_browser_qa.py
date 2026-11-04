#!/usr/bin/env python3
"""UX-102 forced-colors menu and control acceptance using Chromium emulation."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_quick
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Build the current game fixture first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 context=browser.new_context(viewport={'width':1280,'height':720},forced_colors='active')
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='load')
 page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
 assert page.evaluate("matchMedia('(forced-colors: active)').matches"),'Chromium did not enable forced-colors emulation'
 button=page.locator('#menu .btn').first
 assert button.count()==1,'initial home menu has a keyboard action'
 page.keyboard.press('Tab')
 button=page.locator('#menu .btn:focus-visible').first
 assert button.count()==1,'Tab must place a visible keyboard focus on a Home action'
 details=button.evaluate("e=>{const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor,border:s.borderTopColor,outline:s.outlineColor,outlineWidth:s.outlineWidth,outlineStyle:s.outlineStyle,focusVisible:e.matches(':focus-visible')}}")
 assert details['outlineWidth']=='3px' and details['outlineStyle']=='solid' and details['focusVisible'],details
 assert details['color'] and details['background'] and details['border'],details
 print('UX102_FORCED_COLORS_BROWSER_PASS',details)
 # Sound settings use native range controls with custom accent colors in the
 # normal theme. Forced-colors mode must use the system Highlight color while
 # retaining visible keyboard focus.
 page.locator('[data-action="navSettings"]').first.click()
 page.locator('[data-action="navSound"]').click()
 sliders=page.locator('.navSettingsFields input[type="range"]')
 assert sliders.count()==5,('sound settings should expose five volume sliders',sliders.count())
 expected_accent=page.evaluate("""()=>{
  const probe=document.createElement('input');probe.type='range';probe.style.accentColor='Highlight';
  document.body.append(probe);const color=getComputedStyle(probe).accentColor;probe.remove();return color;
 }""")
 for index in range(sliders.count()):
  slider=sliders.nth(index)
  state=slider.evaluate("""e=>{const s=getComputedStyle(e);return {
   accent:s.accentColor,outline:s.outlineColor,width:s.outlineWidth,
   style:s.outlineStyle,focusVisible:e.matches(':focus-visible')}}""")
  assert state['accent']==expected_accent,(index,state,expected_accent)
  if index==0:
   slider.evaluate("e=>e.focus({focusVisible:true})")
   focused=slider.evaluate("""e=>{const s=getComputedStyle(e);return {
    outline:s.outlineColor,width:s.outlineWidth,style:s.outlineStyle,
    focusVisible:e.matches(':focus-visible')}}""")
   assert focused['focusVisible'] and focused['width']=='3px' and focused['style']=='solid',focused
   assert focused['outline']==expected_accent,(focused,expected_accent)
 print('UX102_FORCED_COLORS_SOUND_SLIDERS_PASS',{'count':sliders.count(),'accent':expected_accent,'focus':focused})
 assert not errors,errors
 context.close()

 # Check the actual live match, where the pause/fullscreen HUD and all four
 # touch actions must remain legible and keyboard focus must remain visible.
 context=browser.new_context(viewport={'width':844,'height':900},is_mobile=True,has_touch=True,forced_colors='active')
 page=context.new_page();match_errors=[];page.on('pageerror',lambda e:match_errors.append(str(e)))
 page.set_content(html,wait_until='load')
 page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
 assert page.evaluate("matchMedia('(forced-colors: active)').matches")
 open_quick(page)
 page.locator('[data-action="kickoff"]').first.click()
 page.wait_for_function("SupermagicFootball.game.matchState==='play'",timeout=15000)

 expected=page.evaluate("""()=>{
  const probe=document.createElement('button');
  probe.style.cssText='color:ButtonText;background:ButtonFace;border:1px solid ButtonText;outline:3px solid Highlight';
  document.body.append(probe);const s=getComputedStyle(probe);
  const result={color:s.color,background:s.backgroundColor,border:s.borderTopColor,highlight:s.outlineColor};
  probe.remove();return result;
 }""")
 for selector in ('#pauseBtn','#fullscreenMatch'):
  control=page.locator(selector);assert control.count()==1,(selector,'HUD control missing')
  control.evaluate("e=>e.focus({focusVisible:true})")
  state=control.evaluate("e=>{const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor,border:s.borderTopColor,outline:s.outlineColor,outlineWidth:s.outlineWidth,outlineStyle:s.outlineStyle,focusVisible:e.matches(':focus-visible')}}")
  assert state['color']==expected['color'] and state['background']==expected['background'] and state['border']==expected['border'],(selector,state,expected)
  assert state['outline']==expected['highlight'] and state['outlineWidth']=='3px' and state['outlineStyle']=='solid' and state['focusVisible'],(selector,state,expected)
 touch=page.locator('#touchButtons button[data-act]')
 assert touch.count()==4,'live match must retain exactly four touch actions'
 for index in range(4):
  control=touch.nth(index)
  assert control.is_visible(),(index,'touch action is hidden')
  state=control.evaluate("e=>{const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor,border:s.borderTopColor,outline:s.outlineColor,outlineWidth:s.outlineWidth,outlineStyle:s.outlineStyle,focusVisible:e.matches(':focus-visible')}}")
  assert state['color']==expected['color'] and state['background']==expected['background'] and state['border']==expected['border'],(index,state,expected)
  control.evaluate("e=>e.focus({focusVisible:true})")
  focused=control.evaluate("e=>{const s=getComputedStyle(e);return {outline:s.outlineColor,width:s.outlineWidth,style:s.outlineStyle,focusVisible:e.matches(':focus-visible')}}")
  assert focused['outline']==expected['highlight'] and focused['width']=='3px' and focused['style']=='solid' and focused['focusVisible'],(index,focused,expected)
  if index==0:
   rest=state['border']
   control.evaluate("e=>e.classList.add('active')")
   active=control.evaluate("e=>{const s=getComputedStyle(e);return {border:s.borderTopColor,width:s.borderTopWidth}}")
   assert active['border']==expected['highlight'] and active['width']=='3px' and active['border']!=rest,(active,rest,expected)
   control.evaluate("e=>e.classList.remove('active')")
 print('UX102_FORCED_COLORS_LIVE_MATCH_PASS',{'hud':2,'touchActions':touch.count(),'focusedControls':6,'highlight':expected['highlight']})
 assert not match_errors,match_errors
 context.close();browser.close()
