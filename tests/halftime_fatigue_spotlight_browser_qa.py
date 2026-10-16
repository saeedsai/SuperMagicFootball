#!/usr/bin/env python3
"""Live modular halftime: names of tired starters are escaped, correct and read-only."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Build current modular QA fixture first'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                               ('simulated-touch',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,has_touch=touch,is_mobile=touch)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {const data=new Map();Object.defineProperty(window,'localStorage',
    {configurable:true,value:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
     removeItem:k=>data.delete(k),clear:()=>data.clear()}})}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  page.locator('[data-action="navQuick"]').first.click()
  page.locator('[data-action="navOnDevice"]').first.click()
  page.locator('[data-action="quick"]').first.click()
  page.locator('[data-action="kickoff"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play'
  before=page.evaluate("""() => {
   const g=SupermagicFootball.game;
   g.matchState='paused';
   const squad=g.rosters[0],lineup=g.lineups[0],ids=lineup.slice(1,4).map(i=>squad[i].id);
   for(const p of squad)g.fatigueLedger[0][p.id]=.1;
   g.fatigueLedger[0][ids[0]]=.91;
   g.fatigueLedger[0][ids[1]]=.76;
   g.fatigueLedger[0][ids[2]]=.61;
   squad[lineup[1]].name='<img src=x onerror=alert(1)>';
   const before={plans:JSON.stringify(g.teamPlans),lineups:JSON.stringify(g.lineups),
     stored:localStorage.getItem('legend_teamPlans'),
     substitutions:JSON.stringify(g.substitutionsUsed),
     actions:document.querySelectorAll('#touchButtons button[data-act]').length,
     second:squad[lineup[2]].name,third:squad[lineup[3]].name};
   g.onEvent({type:'halftime'});
   return before;
  }""")
  assert before['actions']==4,(device,before)
  watch=page.locator('#halftimeFitnessHome')
  assert watch.count()==1,(device,'no fitness watch')
  assert watch.get_attribute('aria-label')=='Home fatigued starters'
  content=watch.inner_text()
  assert 'FITNESS WATCH' in content and 'FIT 9%' in content and 'FIT 24%' in content,(device,content)
  assert before['second'] in content,(device,'second tired starter hidden',content)
  assert before['third'] not in content and '+1 more' in content,(device,'max two players',content)
  assert page.locator('#halftimeFitnessHome img').count()==0,(device,'HTML injection')
  assert '&lt;img' in watch.inner_html(),(device,'editable name must be escaped')
  after=page.evaluate("""() => {
   const g=SupermagicFootball.game;
   return {plans:JSON.stringify(g.teamPlans),lineups:JSON.stringify(g.lineups),
     stored:localStorage.getItem('legend_teamPlans'),
     substitutions:JSON.stringify(g.substitutionsUsed),
     actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert {k:before[k] for k in after}==after,(device,'readonly preserved',before,after)
  # With no tired starter the separate line disappears but existing talk remains.
  page.evaluate("""() => {
    const g=SupermagicFootball.game;
    for(const p of g.rosters[0])g.fatigueLedger[0][p.id]=.1;
    g.onEvent({type:'halftime'});
  }""")
  assert page.locator('#halftimeFitnessHome').count()==0,(device,'no false warning')
  assert page.locator('#halfTalkHome').count()==1,(device,'team talk preserved')
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play'
  assert not errors,(device,errors)
  print('HALFTIME_FITNESS_PASS',device,'top two exhausted, safe names, read-only state, resume',flush=True)
  ctx.close()
 browser.close()
