#!/usr/bin/env python3
"""Real modular match halftime, score-aware CPU tactics, desktop and simulated touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Build modular fixture before Chromium acceptance'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                             args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                               ('simulated-touch',{'width':844,'height':390},True)]:
  for mode,score,expected in (
   ('quick',[2,0],('Direct','High Press','trailing')),
   ('quick',[0,2],('Possession','Deep Block','leading')),
   ('quick',[1,1],None),
   ('versus',[2,0],None)):
   ctx=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
   page=ctx.new_page()
   errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   page.evaluate("""() => {const db=new Map();
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,String(v)),
      removeItem:k=>db.delete(k),clear:()=>db.clear()}})}""")
   page.set_content(html,wait_until='load')
   page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
   for action in ('navQuick','navOnDevice',mode,'kickoff'):
    page.locator(f'[data-action="{action}"]').first.click()
   assert page.evaluate('SupermagicFootball.game.matchState')=='play',(device,mode)
   before=page.evaluate("""() => {
    const g=SupermagicFootball.game;
    return {teamIds:[...g.teamIds],
      home:JSON.stringify(g.teamPlans[0]),
      awayLineup:JSON.stringify(g.lineups[1]),
      awayFormation:g.formation[1],
      awayCaptain:g.teamPlans[1].captain,
      rosters:g.rosters.map(s=>s.map(p=>p.id)),
      stored:localStorage.getItem('legend_teamPlans'),
      buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
   }""")
   assert before['buttons']==4,(device,mode,'exactly four normal action buttons')
   # Trigger the REAL update() half transition, not a mock call to the new function.
   result=page.evaluate("""score => {
    const g=SupermagicFootball.game;
    g.score=score.slice();
    g.half=1;
    g.matchSeconds=.25;
    g.clock=.26;
    g.ball.owner=null;g.ball.shot=null;
    g.stoppageWindow=0;g.stoppageAnnounced=false;
    g.update(.025);
    return {half:g.half,state:g.matchState,score:[...g.score],
     attack:g.teamPlans[1].attack,defence:g.teamPlans[1].defence,
     subs:[...g.substitutionsUsed],
     shifts:g.events.filter(e=>e.type==='cpuTacticalShift').map(e=>({
       team:e.team,attack:e.attack,defence:e.defence,reason:e.reason,score:e.score})),
     rosters:g.rosters.map(s=>s.map(p=>p.id)),
     teamIds:[...g.teamIds],home:JSON.stringify(g.teamPlans[0]),
     awayLineup:JSON.stringify(g.lineups[1]),
     awayFormation:g.formation[1],
     awayCaptain:g.teamPlans[1].captain,
     stored:localStorage.getItem('legend_teamPlans'),
     buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
   }""",score)
   assert result['half']==2 and result['state']=='paused',(device,mode,score,result)
   assert result['score']==score,(device,mode,'halftime score changed')
   for key in ('rosters','teamIds','home','awayLineup','awayFormation','awayCaptain','stored','buttons'):
    assert result[key]==before[key],(device,mode,key,'halftime CPU changed preserved data',before,result)
   if expected:
    assert (result['attack'],result['defence'])==expected[:2],(device,mode,result)
    assert result['shifts']==[dict(team=1,attack=expected[0],defence=expected[1],
                                 reason=expected[2],score=score)],(device,mode,result)
   else:
    assert not result['shifts'],(device,mode,'tie/Versus emitted CPU strategy',result)
   assert page.locator('#halfTalkHome').count()==1,(device,mode,'halftime talk broken')
   assert page.locator('[data-action="resume"]').count()>=1,(device,mode,'second half lost')
   page.locator('[data-action="resume"]').first.click()
   assert page.evaluate('SupermagicFootball.game.matchState')=='play',(device,mode,'resume failed')
   assert not errors,(device,mode,errors)
   print('CPU_HALFTIME_TACTICS_BROWSER_PASS',device,mode,score,expected,
         'real halftime update, unchanged squads/saves, second-half resume',flush=True)
   ctx.close()
 browser.close()
