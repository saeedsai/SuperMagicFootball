#!/usr/bin/env python3
"""Kickoff and second-half 3-second display, paused clock, four controls, desktop/touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Build modular browser fixture first'
html=fixture.read_text(encoding='utf8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,touch in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':844,'height':390} if touch else {'width':1280,'height':720},has_touch=touch,is_mobile=touch)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','quick','kickoff'):page.locator(f'[data-action="{action}"]').first.click()
  page.wait_for_timeout(110)
  first=page.evaluate("""() => ({state:SupermagicFootball.game.matchState,remaining:SupermagicFootball.game.kickoffCountdown,
   clock:SupermagicFootball.game.clock,label:document.querySelector('#matchCountdownLabel').textContent,
   digit:document.querySelector('#matchCountdownNumber').textContent,hidden:document.querySelector('#matchCountdown').classList.contains('hidden'),
   buttons:document.querySelectorAll('#touchButtons button[data-act]').length})""")
  assert first['state']=='play' and 2<first['remaining']<=3 and first['clock']==0,(label,first)
  assert not first['hidden'] and first['digit']=='3' and first['label']=='MATCH STARTS IN' and first['buttons']==4,(label,first)
  # Real keyboard input during the freeze must not advance the clock, ball or
  # controlled player's physics. The browser still accepts key events.
  before=page.evaluate("""() => {const g=SupermagicFootball.game,p=g.player(0,3);
    return {clock:g.clock,ball:[g.ball.x,g.ball.y,g.ball.z],player:[p.x,p.y,p.z],half:g.half};}""")
  page.keyboard.down('Space')
  page.wait_for_timeout(100)
  frozen=page.evaluate("""() => {const g=SupermagicFootball.game,p=g.player(0,3);
    return {clock:g.clock,ball:[g.ball.x,g.ball.y,g.ball.z],player:[p.x,p.y,p.z],half:g.half,
      remaining:g.kickoffCountdown};}""")
  page.keyboard.up('Space')
  assert frozen['remaining']>0 and {k:frozen[k] for k in before}==before,(label,'kickoff input moved physics',before,frozen)
  page.evaluate('SupermagicFootball.game.kickoffCountdown=.05')
  page.wait_for_function('SupermagicFootball.game.kickoffCountdown===0',timeout=4000)
  page.wait_for_timeout(75)
  assert page.evaluate('SupermagicFootball.game.clock')>0,(label,'clock did not begin after countdown')
  half=page.evaluate("""() => {
    const g=SupermagicFootball.game;
    g.kickoffCountdown=0;g.clock=g.matchSeconds-.005;g.cooldown=0;g.stoppageAnnounced=false;
    g.ball.owner=null;g.ball.pass=null;g.ball.passTeam=null;g.ball.x=1400;g.ball.y=700;g.ball.vx=0;g.ball.vy=0;
    g.update(.02);
    return {half:g.half,state:g.matchState,remaining:g.kickoffCountdown,clock:g.clock};
  }""")
  assert half=={'half':2,'state':'paused','remaining':3,'clock':0},(label,half)
  page.locator('[data-action="resume"]').first.click()
  page.wait_for_timeout(90)
  second=page.evaluate("""() => ({state:SupermagicFootball.game.matchState,
    remaining:SupermagicFootball.game.kickoffCountdown,clock:SupermagicFootball.game.clock,
    label:document.querySelector('#matchCountdownLabel').textContent,hidden:document.querySelector('#matchCountdown').classList.contains('hidden')})""")
  assert second['state']=='play' and 2<second['remaining']<3 and second['clock']==0,(label,second)
  assert second['label']=='SECOND HALF STARTS IN' and not second['hidden'],(label,second)
  second_before=page.evaluate("""() => {const g=SupermagicFootball.game,p=g.player(0,3);
    return {clock:g.clock,ball:[g.ball.x,g.ball.y,g.ball.z],player:[p.x,p.y,p.z],half:g.half};}""")
  page.keyboard.down('Space')
  page.wait_for_timeout(100)
  second_frozen=page.evaluate("""() => {const g=SupermagicFootball.game,p=g.player(0,3);
    return {clock:g.clock,ball:[g.ball.x,g.ball.y,g.ball.z],player:[p.x,p.y,p.z],half:g.half,
      remaining:g.kickoffCountdown};}""")
  page.keyboard.up('Space')
  assert second_frozen['remaining']>0 and {k:second_frozen[k] for k in second_before}==second_before,(label,'second-half input moved physics',second_before,second_frozen)
  assert not errors,(label,errors)
  print('ARCADE_COUNTDOWN_PASS',label,flush=True)
  context.close()
 browser.close()
