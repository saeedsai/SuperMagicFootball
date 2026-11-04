"""UX-102 Home category icons, desktop/touch, focus and forced-color browser QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import home

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
assert HTML.exists(),'Build the current modular fixture first'
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,config in [('desktop',{'viewport':{'width':1280,'height':800}}),('touch',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
  page=browser.new_page(**config);errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(HTML.read_text(encoding='utf-8'),wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
  cards=page.locator('.navMainList>.navChoice')
  assert cards.count()==5
  assert page.locator('.navCopy strong').all_text_contents()==['Quick Match','Online','Career','Leagues & Cups','Training']
  assert page.locator('.modeIconSvg').count()==5
  assert len(set(page.locator('.modeIconSvg').evaluate_all('(els)=>els.map(e=>e.innerHTML)')))==5,'each game mode should have a distinct emblem'
  assert page.locator('.homeActionTile').count()==5
  assert page.locator('.homeActionTile').all_text_contents()==['SQUAD','CUSTOMIZE','SHOP','PLAYERSTUDIO','SETTINGS']
  for card in [cards.nth(i) for i in range(5)]:
   state=card.evaluate("e=>{const r=e.querySelector('.navIcon').getBoundingClientRect();return {hidden:e.querySelector('.navIcon').getAttribute('aria-hidden'),w:r.width,h:r.height,svg:e.querySelector('svg').getBoundingClientRect().width}}")
   assert state['hidden']=='true' and state['w']>=29 and state['h']>=29 and state['svg']>0,(label,state)
  cards.nth(1).click()
  assert page.locator('.navScreen').count()==1,'Online still follows its existing route'
  home(page)
  page.locator('[data-action=navStore]').first.click()
  assert page.locator('.heading').inner_text()=='STORE & TOKENS','Store route remains reachable'
  home(page)
  cards=page.locator('.navMainList>.navChoice')
  cards.first.evaluate("e=>e.focus({focusVisible:true})")
  focused=page.locator(':focus').evaluate("e=>({action:e.dataset.action,outline:getComputedStyle(e).outlineWidth,style:getComputedStyle(e).outlineStyle})")
  assert focused['action']=='navQuick' and focused['outline']=='3px' and focused['style']=='solid',focused
  page.screenshot(path=str(ROOT/'tests/.generated'/f'ux102_home_icons_{label}.png'))
  assert not errors,(label,errors)
  print(f'{label}: PASS five distinct mode icons, five dock actions, visible focus, bounds, no errors')
  page.close()
 context=browser.new_context(viewport={'width':1280,'height':800},forced_colors='active')
 page=context.new_page();page.set_content(HTML.read_text(encoding='utf-8'),wait_until='load')
 page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
 assert page.evaluate("matchMedia('(forced-colors: active)').matches")
 icon=page.locator('.navIcon').first.evaluate("e=>{const s=getComputedStyle(e);return {color:s.color,bg:s.backgroundColor,border:s.borderTopColor,shadow:s.boxShadow}}")
 assert icon['color'] and icon['bg'] and icon['border'] and icon['shadow']=='none',icon
 print('forced-colors: PASS decorative icon system colors and no shadow',icon)
 context.close()
 context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
 page=context.new_page();page.set_content(HTML.read_text(encoding='utf-8'),wait_until='load')
 page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
 assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
 motion=page.locator('.modeIconSvg').first.evaluate("e=>({animation:getComputedStyle(e).animationDuration,transition:getComputedStyle(e.closest('.navChoice')).transitionDuration})")
 assert float(motion['animation'][:-1])<=0.001 and float(motion['transition'][:-1])==0,motion
 print('reduced-motion touch: PASS static icons and zero-duration card animation/transition',motion)
 context.close();browser.close()
