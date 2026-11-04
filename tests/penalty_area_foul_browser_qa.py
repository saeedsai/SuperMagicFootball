#!/usr/bin/env python3
"""Exercise the live in-match penalty lifecycle in desktop and simulated-touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current modular browser fixture first'
html=fixture.read_text(encoding='utf8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate('''() => {
   const g=SupermagicFootball.game,results=[],cy=(SupermagicFootball.world?.goalTop||620)+( (SupermagicFootball.world?.goalBottom||910)-(SupermagicFootball.world?.goalTop||620))/2;
   for(const team of [0,1])for(const score of [false,true]){
    g.init({home:0,away:9,humans:1,mode:'quick'});const before=g.score.slice();
    g.startPK(false,team);g.pk.ready=0;g.pk.timer=8;g.pk.shotTimer=.001;g.pk.shotMax=.8;
    g.pk.shotTargetY=score?cy+70:cy;g.pk.saveY=cy;g.updatePK(.02);
    results.push({team,score,matchState:g.matchState,pk:g.pk,scoreline:g.score.slice(),before,
     penaltyEvent:g.events.some(e=>e.type==='matchPenaltyResolved'&&e.team===team&&e.goal===score),
     goalEvent:g.events.some(e=>e.type==='goal'&&e.penalty===true),keeperOwnsBall:g.ball.owner?.keeper===true});
   }
   return {results,actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(result['results'])==4,(label,result)
  for case in result['results']:
   assert case['matchState']=='play' and case['pk'] is None,(label,'one-kick penalty did not resume match',case)
   assert case['penaltyEvent'],(label,'penalty resolution event missing',case)
   if case['score']:
    assert case['scoreline'][case['team']]==case['before'][case['team']]+1 and case['goalEvent'],(label,'penalty goal failed',case)
   else:
    assert case['scoreline']==case['before'] and case['keeperOwnsBall'],(label,'saved/missed penalty failed to return keeper possession',case)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('PENALTY_AREA_FOUL_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
