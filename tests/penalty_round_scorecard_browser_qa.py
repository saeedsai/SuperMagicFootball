#!/usr/bin/env python3
"""Production Quick Match UI: read-only live shootout rounds and true PK winner."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(), 'Build fixture with python3 scripts/build.py'
HTML=fixture.read_text(encoding='utf8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,touch in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':844 if touch else 1280,'height':390 if touch else 720},
                              is_mobile=touch,has_touch=touch)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator('[data-action="'+action+'"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play',(name,'Quick Match not live')
  starting=page.evaluate("""() => {
    const g=SupermagicFootball.game;
    return JSON.stringify({ids:g.teamIds,rosters:g.rosters.map(r=>r.map(p=>p.id)),
      lineup:g.lineups,subs:g.substitutionsUsed});
  }""")
  # Before a shootout there must be no penalty rounds in a normal game pause.
  page.locator('#pauseBtn').click()
  assert page.locator('#penaltyRoundScorecard').count()==0,(name,'ordinary pause shows penalties')
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play'
  # Play the engine's actual shootout state with some completed goals and saves.
  page.evaluate("""() => {
    const g=SupermagicFootball.game;g.score=[2,2];g.startPK(true);
    g.pk.kicks=[[true,false,true],[true,false]];
    g.pk.turn=5;g.pk.ready=1.1;g.pk.shotTimer=0;
  }""")
  page.locator('#pauseBtn').click()
  live=page.locator('#penaltyRoundScorecard')
  assert live.count()==1,(name,'missing active PK rounds')
  live_html=live.inner_html()
  assert 'PENALTY SHOOTOUT · 2–1' in live_html,(name,live_html)
  assert 'HOME: 2 / 3' in live_html and 'AWAY: 1 / 2' in live_html,(name,live_html)
  assert 'NEXT KICK: AWAY' in live_html,(name,live_html)
  assert live_html.count('aria-label="Goal"')==3,(name,live_html)
  assert live_html.count('aria-label="Saved or missed"')==2,(name,live_html)
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='penalty'
  # Reach a genuine after-draw sudden-death result via updatePK, rather than
  # constructing a synthetic finished menu. Regulation must remain a draw.
  page.evaluate("""() => {
    const g=SupermagicFootball.game,p=g.pk;
    p.kicks=[[true,true,true,true,true,true],[true,true,true,true,true]];
    p.turn=11;p.ready=0;p.shotTimer=.001;p.shotMax=.8;p.stage='shooting';
    p.shotTargetY=720;p.saveY=720;
    g.updatePK(.02);
  }""")
  assert page.evaluate("SupermagicFootball.game.matchState")=='finished',(name,'PK did not finish')
  final=page.locator('#penaltyRoundScorecard')
  assert final.count()==1,(name,'no final PK scorecard')
  end_html=final.inner_html()
  assert 'PENALTY SHOOTOUT · 6–5' in end_html,(name,end_html)
  assert 'WINNER: HOME' in end_html,(name,end_html)
  assert 'NEXT KICK:' not in end_html,(name,end_html)
  body=page.locator('#menu').inner_text()
  assert 'VICTORY!' in body and 'ON PENALTIES' in body,(name,body[-900:])
  assert 'DRAW MATCH' not in body,(name,body[-900:])
  score=page.evaluate("""() => {
    const g=SupermagicFootball.game;
    return {regulation:g.score,identity:JSON.stringify({ids:g.teamIds,
      rosters:g.rosters.map(r=>r.map(p=>p.id)),lineup:g.lineups,subs:g.substitutionsUsed}),
      buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert score['regulation']==[2,2],(name,'regulation score replaced',score)
  assert score['identity']==starting,(name,'rosters or identity changed',score)
  assert score['buttons']==4,(name,'original four buttons changed',score)
  assert not errors,(name,errors)
  print('PENALTY_ROUND_SCORECARD_BROWSER_PASS',name,
        'active round summary, sudden-death winner, unchanged score/rosters/buttons',
        flush=True)
  context.close()
 browser.close()
