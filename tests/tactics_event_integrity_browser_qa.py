#!/usr/bin/env python3
"""Issue #7: playable paused quick tactics never masquerade as substitutions."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Run python3 scripts/build.py first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,mobile in (
  ('desktop',{'width':1280,'height':720},False),
  ('simulated-touch',{'width':844,'height':390},True)):
  ctx=browser.new_context(viewport=viewport,has_touch=mobile,is_mobile=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {
    const data=new Map();
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),
      removeItem:k=>data.delete(k),clear:()=>data.clear()
    }});
  }""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator(f'[data-action="{action}"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play',(device,'game failed to start')
  page.locator('#pauseBtn').click(force=True)
  assert page.locator('.heading').inner_text()=='PAUSED',(device,'pause screen')
  before=page.evaluate("""() => {const g=SupermagicFootball.game;
   return {n:g.events.length,used:g.substitutionsUsed[0],lineup:[...g.lineups[0]],
    roles:['captain','penalty','freeKick','corner'].map(k=>g.teamPlans[0][k]),
    stored:localStorage.getItem('legend_teamPlans'),
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length}}""")
  assert before['buttons']==4,(device,'four controls')
  page.locator('[data-action="quickTacticHomeAttack"]').first.click()
  page.locator('[data-action="quickTacticHomeDefend"]').first.click()
  after=page.evaluate("""(n) => {const g=SupermagicFootball.game;
   return {newEvents:g.events.slice(n),used:g.substitutionsUsed[0],
    lineup:[...g.lineups[0]],roles:['captain','penalty','freeKick','corner'].map(k=>g.teamPlans[0][k]),
    stored:localStorage.getItem('legend_teamPlans'),attack:g.teamPlans[0].attack,
    defence:g.teamPlans[0].defence}}""",before['n'])
  assert (after['attack'],after['defence'])==('Possession','Deep Block'),(device,after)
  assert not [e for e in after['newEvents'] if e['type']=='substitution'],(device,'phantom substitution',after)
  for key in ('used','lineup','roles','stored'):
   assert after[key]==before[key],(device,key,before,after)
  # Same live in-match method: actual eligible outfield player is replaced.
  switched=page.evaluate("""() => {const g=SupermagicFootball.game,plan=g.teamPlans[0];
   const assigned=[plan.captain,plan.penalty,plan.freeKick,plan.corner];
   const slot=plan.lineup.findIndex((id,i)=>i>0&&!assigned.includes(id));
   const reserve=g.rosters[0].findIndex((p,i)=>!plan.lineup.includes(i)&&
     p.role!=='GK'&&!(p.injuryWeeks>0)&&!g.subbedOut[0].has(p.id));
   if(slot<0||reserve<0)throw Error('missing eligible bench swap');
   const n=g.events.length,beforeUsed=g.substitutionsUsed[0];
   const out=plan.lineup[slot],newLineup=[...plan.lineup];newLineup[slot]=reserve;
   g.applyPlan(0,{...plan,lineup:newLineup});
   return {events:g.events.slice(n).filter(e=>e.type==='substitution'),
    used:g.substitutionsUsed[0],beforeUsed,changed:g.lineups[0][slot]===reserve,
    removed:g.subbedOut[0].has(g.rosters[0][out].id)};}""")
  assert len(switched['events'])==1 and switched['events'][0]['count']==1,(device,switched)
  assert switched['used']==switched['beforeUsed']+1,(device,switched)
  assert switched['changed'] and switched['removed'],(device,switched)
  # Real match resumes and four-button control surface is unchanged.
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play',(device,'failed resume')
  assert page.evaluate("document.querySelectorAll('#touchButtons button[data-act]').length")==4
  assert not errors,(device,errors)
  print('TACTICS_EVENT_INTEGRITY_PASS',device,'style-only: zero substitutions, bench swap: exactly one; resume and controls',flush=True)
  ctx.close()
 browser.close()
