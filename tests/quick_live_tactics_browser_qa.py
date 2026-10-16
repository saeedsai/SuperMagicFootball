#!/usr/bin/env python3
"""Playable four quick tactical calls: existing pressing mechanics, no saved lineup changes."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Run python3 scripts/build.py before browser QA'
html=fixture.read_text(encoding='utf-8')
snap="""() => {const g=SupermagicFootball.game;
 return {plans:g.teamPlans.map(p=>({...p,lineup:[...p.lineup]})),
   lineups:JSON.stringify(g.lineups),
   formation:JSON.stringify(g.formation),
   substitutions:g.substitutionsUsed.slice(),
   subbed:g.subbedOut.map(s=>[...s]),
   stored:localStorage.getItem('legend_teamPlans'),
   score:JSON.stringify(g.score),
   teamIds:JSON.stringify(g.teamIds),
   talks:JSON.stringify(g.talksUsed),
   buttons:document.querySelectorAll('#touchButtons button[data-act]').length
 }}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                           args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,mobile in (
   ('desktop',{'width':1280,'height':720},False),
   ('simulated-touch',{'width':844,'height':390},True)):
  for mode in ('quick','versus'):
   ctx=browser.new_context(viewport=viewport,has_touch=mobile,is_mobile=mobile)
   page=ctx.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.evaluate("""() => {const data=new Map();Object.defineProperty(window,'localStorage',
    {configurable:true,value:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
    removeItem:k=>data.delete(k),clear:()=>data.clear()}})}""")
   page.set_content(html,wait_until='load')
   page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
   for action in ('navQuick','navOnDevice',mode,'kickoff'):
    page.locator(f'[data-action="{action}"]').first.click()
   assert page.evaluate('SupermagicFootball.game.matchState')=='play',(device,mode)
   initial=page.evaluate(snap)
   assert initial['buttons']==4,(device,mode,'original action buttons')
   page.locator('#pauseBtn').click(force=True)
   assert page.locator('.heading').inner_text()=='PAUSED',(device,mode)
   assert page.locator('#quickTacticalHome').count()==1,(device,mode,'home controls missing')
   assert page.locator('#quickTacticalAway').count()==(1 if mode=='versus' else 0),(device,mode)
   checks=[('Attack','Direct','High Press'),('Control','Possession','Balanced'),
           ('Defend','Possession','Deep Block'),('Balanced','Balanced','Balanced')]
   for suffix,attack,defence in checks:
    page.locator(f'[data-action="quickTacticHome{suffix}"]').first.click()
    state=page.evaluate(snap)
    assert state['plans'][0]['attack']==attack and state['plans'][0]['defence']==defence,(device,mode,suffix,state)
    assert f'{attack} / {defence}' in page.locator('#quickTacticalStatusHome').inner_text()
    for prop in ('lineup','formation','captain','penalty','corner','freeKick'):
     assert state['plans'][0][prop]==initial['plans'][0][prop],(device,mode,suffix,prop)
    for prop in ('lineups','formation','substitutions','subbed','stored','score','teamIds','talks','buttons'):
     assert state[prop]==initial[prop],(device,mode,suffix,'unexpected mutation',prop)
    assert state['plans'][1]==initial['plans'][1],(device,mode,'CPU/opponent tactics altered')
   if mode=='versus':
    page.locator('[data-action="quickTacticAwayDefend"]').first.click()
    state=page.evaluate(snap)
    assert (state['plans'][1]['attack'],state['plans'][1]['defence'])==('Possession','Deep Block')
    for prop in ('lineups','substitutions','subbed','stored','score','teamIds','talks','buttons'):
     assert state[prop]==initial[prop],(device,mode,'away mutation',prop)
   page.locator('[data-action="resume"]').first.click()
   assert page.evaluate('SupermagicFootball.game.matchState')=='play'
   page.evaluate("SupermagicFootball.game.onEvent({type:'halftime'})")
   assert page.locator('.heading').inner_text()=='HALF TIME'
   assert page.locator('#halfTalkHome').count()==1,(device,mode)
   page.locator('[data-action="quickTacticHomeAttack"]').first.click()
   assert page.locator('.heading').inner_text()=='HALF TIME'
   assert page.locator('#halfTalkHome').count()==1,(device,mode,'team talk lost')
   state=page.evaluate(snap)
   assert (state['plans'][0]['attack'],state['plans'][0]['defence'])==('Direct','High Press')
   for prop in ('substitutions','subbed','stored','score','teamIds','talks','buttons'):
    assert state[prop]==initial[prop],(device,mode,'halftime mutation',prop)
   assert not errors,(device,mode,errors)
   print('QUICK_LIVE_TACTICS_PASS',device,mode,'4 calls, pause + halftime, ownership, no save or substitution',flush=True)
   ctx.close()
 browser.close()
