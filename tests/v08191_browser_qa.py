"""Desktop + simulated Android browser smoke for release 0.8.19.1 input queue."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or '/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,mobile in [('desktop',False),('simulated-android',True)]:
  ctx=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':720 if not mobile else 390},is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page()
  failures=[]
  page.on('pageerror',lambda e:failures.append(str(e)))
  page.set_content((root/'play.html').read_text(),wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.22.1-alpha'")
  assert set(page.locator('#touchButtons [data-act]').evaluate_all('a=>a.map(x=>x.dataset.act)'))=={'pass','shoot','dribble','jump'}
  outcome=page.evaluate('''()=>{
   const i=SupermagicFootball.input, g=SupermagicFootball.game;
   // Pause real game polling; feed browser keyboard input (not private mock sets).
   g.matchState='paused';i.reset();
   const key=(type,code)=>window.dispatchEvent(new KeyboardEvent(type,{code,bubbles:true}));
   for(let n=0;n<3;n++){key('keydown','KeyK');key('keyup','KeyK');}
   const first=[];for(let n=0;n<4;n++){i.poll();first.push([i.just(0,'pass'),i.released(0,'pass')]);}
   // Simulate true pointer event dispatch, including multiple pointer IDs.
   const b=document.querySelector('[data-act="dribble"]');b.setPointerCapture=()=>{};
   const send=(type,id)=>b.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',bubbles:true}));
   for(let n=0;n<3;n++){send('pointerdown',60+n);send('pointerup',60+n);}
   const second=[];for(let n=0;n<4;n++){i.poll();second.push([i.just(0,'dribble'),i.released(0,'dribble')]);}
   // Separate sequential airborne cross from the wrong order.
   const source=SupermagicFootball.game;
   const keeper=source.players.some(p=>p.keeper);
   return {first,second,keeper,actions:[...document.querySelectorAll('#touchButtons [data-act]')].map(x=>x.dataset.act)};
  }''')
  assert outcome['first']==[[True,True]]*3+[[False,False]],(name,outcome)
  assert outcome['second']==[[True,True]]*3+[[False,False]],(name,outcome)
  assert outcome['keeper'] and set(outcome['actions'])=={'pass','shoot','jump','dribble'}
  assert not failures,(name,failures)
  print(f'{name.upper()} PASS: 3 subframe keyboard taps and 3 pointer taps replayed exactly once; no extra actions; clean console',flush=True)
  ctx.close()
 browser.close()
