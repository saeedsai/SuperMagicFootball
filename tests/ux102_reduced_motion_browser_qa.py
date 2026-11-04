#!/usr/bin/env python3
"""UX-102 broad reduced-motion behavior in desktop and simulated-touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Build the current game fixture first'
html=fixture.read_text(encoding='utf-8')

def seconds(value):
 values=[]
 for part in value.split(','):
  part=part.strip().lower()
  if part.endswith('ms'):values.append(float(part[:-2])/1000)
  elif part.endswith('s'):values.append(float(part[:-1]))
  else:values.append(0.0)
 return max(values,default=0.0)

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [
  ('desktop',{'width':1280,'height':720},False),
  ('simulated-touch',{'width':844,'height':390},True),
 ]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.NekketsuHD?.getCareer',timeout=60000)
  assert not page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"),device
  button=page.locator('#menu .btn').first
  normal=button.evaluate('e=>getComputedStyle(e).transitionDuration')
  assert seconds(normal)>0.05,(device,'normal motion should retain existing button transition',normal)

  page.emulate_media(reduced_motion='reduce')
  assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"),device
  page.evaluate("""() => {
    const touch=document.querySelector('#touchButtons .round');
    if(touch)touch.classList.add('active');
  }""")
  samples=page.evaluate("""() => {
    const selectors=['.menu .btn','.menu .choice','.hud','.toast','#touchButtons .round'];
    return Object.fromEntries(selectors.map(selector=>{
      const element=document.querySelector(selector);
      if(!element)return [selector,null];
      const style=getComputedStyle(element);
      return [selector,{animation:style.animationDuration,transition:style.transitionDuration,
        delay:style.transitionDelay,scroll:style.scrollBehavior,
        transform:style.transform,filter:style.filter}];
    }));
  }""")
  for selector,style in samples.items():
   if style is None:continue
   assert seconds(style['animation'])<=0.00001,(device,selector,style)
   assert seconds(style['transition'])<=0.00001,(device,selector,style)
   assert seconds(style['delay'])==0,(device,selector,style)
   assert style['scroll']=='auto',(device,selector,style)

  touch_button=page.locator('#touchButtons .round').first
  if touch_button.count():
   state=touch_button.evaluate("e=>{e.classList.add('active');const s=getComputedStyle(e);return {transform:s.transform,filter:s.filter}}")
   assert state['transform']=='none',(device,state)
   assert 'brightness' in state['filter'],(device,'active touch feedback remains visible',state)

  # Reduced motion leaves keyboard focus indication available.
  page.keyboard.press('Tab')
  focused=page.evaluate("""() => {
    const element=document.activeElement;
    const style=getComputedStyle(element);
    return {matches:element.matches(':focus-visible'),width:style.outlineWidth,style:style.outlineStyle};
  }""")
  assert focused['matches'] and focused['width']=='3px' and focused['style']=='solid',(device,focused)
  assert not errors,(device,errors)
  print('UX102_REDUCED_MOTION_BROWSER_PASS',device,samples)
  context.close()
 browser.close()
