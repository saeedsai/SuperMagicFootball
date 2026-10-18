#!/usr/bin/env python3
"""Real Versus GameEngine: the existing DRIBBLE action gives a human keeper a low safe roll."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(), 'Run python3 scripts/build.py before browser tests'
HTML=fixture.read_text(encoding='utf8')

JS=r"""() => {
 const g=SupermagicFootball.game;
 if(g.matchState!=='play'||g.humans!==2)throw Error('Local Versus not started');
 const identity=JSON.stringify({teamIds:g.teamIds,rosters:g.rosters.map(r=>r.map(p=>p.id)),score:g.score});
 const results=[];
 for(const t of [0,1]){
   const dir=t===0?1:-1;
   const keeper=g.players.find(p=>p.t===t&&p.keeper);
   const player=g.players.find(p=>p.t===t&&!p.keeper);
   const target=g.players.find(p=>p.t===t&&!p.keeper&&p!==player);
   if(!keeper||!player||!target)throw Error('Initial team missing players');
   // Deterministically place the real on-field players so one back-line lane
   // is safe while the others are beyond the short-roll range.
   const ox=keeper.x, oy=keeper.y;
   for(const q of g.players){
     if(q!==keeper&&q!==target){
       q.x=ox+dir*(q.t===t?1300:1050);q.y=oy+350;
     }
   }
   target.x=ox+dir*410;target.y=oy+35;target.z=0;target.stun=0;
   keeper.stun=0;keeper.z=0;
   g.keeperCollect(keeper,'loose');
   if(g.ball.owner!==keeper)throw Error('Real catch was not held');
   const eventStart=g.events.length;
   g.command(player,'dribble');
   const events=g.events.slice(eventStart).filter(e=>e.type==='keeperDistribution'||e.type==='passIntent');
   results.push({side:t,roll:events.length===2&&events[0].mode==='roll'&&
     events[1].mode==='roll'&&events[1].loft==='ground',
     target:g.ball.passTarget,expected:target.src.id,
     team:g.ball.passTeam,from:g.ball.passFrom,
     owner:g.ball.owner===null,z:g.ball.z,
     forward:g.ball.vx*dir>0,events:events.map(e=>e.type)});
   // Fail-closed case: no safe teammate. Catch again, close the passing lane.
   g.keeperCollect(keeper,'loose');
   // All active defenders close the corridor: do not rely on a random
   // opening-match defender's stun/cooldown state.
   for(const blocking of g.players.filter(q=>q.t!==t&&!q.keeper)){
     blocking.x=ox+dir*205;blocking.y=oy+17;blocking.stun=0;
   }
   const lane=g.keeperPassingLane(keeper,target);
   const heldBefore=g.ball.owner===keeper;
   const old=g.events.length;
   g.command(player,'dribble');
   results[results.length-1].blocked=heldBefore&&!lane.clear&&
     g.ball.owner===keeper&&g.events.length===old;
   results[results.length-1].blockedTrace={heldBefore,lane,
     heldAfter:g.ball.owner===keeper,additional:g.events.slice(old).map(e=>e.type)};
 }
 return {results,identityUnchanged:identity===JSON.stringify({
     teamIds:g.teamIds,rosters:g.rosters.map(r=>r.map(p=>p.id)),score:g.score}),
   buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
   state:g.matchState};
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
   args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,touch in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':844 if touch else 1280,'height':390 if touch else 720},
   is_mobile=touch,has_touch=touch)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','versus','kickoff'):
   page.locator('[data-action="'+action+'"]').first.click()
  data=page.evaluate(JS)
  assert data['state']=='play',(label,data)
  assert data['buttons']==4 and data['identityUnchanged'],(label,data)
  for r in data['results']:
   assert r['roll'] and r['target']==r['expected'],(label,r)
   assert r['owner'] and r['team']==r['side'] and r['z']<=15,(label,r)
   assert r['forward'] and r['blocked'],(label,r)
  assert [r['side'] for r in data['results']]==[0,1],(label,data)
  assert not errors,(label,errors)
  print('KEEPER_ROLL_DISTRIBUTION_BROWSER_PASS',label,
   'P1/P2 safe rolling pass, guarded lane, untouched teams and four buttons',flush=True)
  context.close()
 browser.close()
