#!/usr/bin/env python3
"""Real match: pressure-aware friendly first-touch ground response on desktop + simulated touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Build modular fixture first with scripts/build.py'
HTML=fixture.read_text(encoding='utf8')
JS=r"""() => {
 const g=SupermagicFootball.game,p=g.player(0,3);
 if(!p||g.matchState!=='play')throw Error('no live Quick Match');
 const original={score:JSON.stringify(g.score),formation:JSON.stringify(g.formation),
  teams:JSON.stringify(g.teamIds),buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
 const mate=g.players.filter(q=>q.t===0&&q!==p&&!q.keeper)[0];
 const blocker=g.players.find(q=>q.t===1&&!q.keeper);
 if(!mate||!blocker)throw Error('missing players for first touch');
 // Actual grounded team pass is made with current GameEngine.pass.
 const oldPos=[blocker.x,blocker.y],oldTeam=g.controlled[0];
 try{
  g.take(p);
  if(!g.pass(p,false,false,{human:true}))throw Error('game rejected real pass');
  const target=g.players.find(q=>q.t===0&&q.src.id===g.ball.passTarget);
  if(!target||target===p)throw Error('no live human pass recipient');
  blocker.x=target.x+35;blocker.y=target.y+9;
  const liveEventCount=g.events.length;
  g.take(target);
  if(g.ball.owner!==target||!(target.firstTouchControlTimer>0))throw Error('pressure first touch did not activate');
  const pressure=target.firstTouchPressure,timer=target.firstTouchControlTimer;
  // Compare actual movement method, with only input target state cloned.
  const base={...target,x:target.x,y:target.y,moveVX:0,moveVY:0};
  const fast={...base,firstTouchControlTimer:0};
  const slow={...base,firstTouchControlTimer:timer};
  g.ball.owner=fast;g.moveAgile(fast,1,0,210,1/60);
  g.ball.owner=slow;g.moveAgile(slow,1,0,210,1/60);
  g.ball.owner=target;
  const events=g.events.slice(liveEventCount).filter(e=>e.type==='passReceived');
  // One controlled player can shoot immediately despite first-touch pressure.
  const immediate=g.shoot(target,false);
  return {pressure,timer,slow:slow.x-base.x,fast:fast.x-base.x,immediate,
   passReceived:events.length,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
   scoreUnchanged:JSON.stringify(g.score)===original.score,
   identityUnchanged:JSON.stringify(g.teamIds)===original.teams&&JSON.stringify(g.formation)===original.formation,
   originalButtons:original.buttons};
 } finally{blocker.x=oldPos[0];blocker.y=oldPos[1];g.controlled[0]=oldTeam;}
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
   args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,mobile in [('desktop',{'width':1280,'height':720},False),
                                 ('simulated-touch',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator(f'[data-action="{action}"]').first.click()
  r=page.evaluate(JS)
  assert r['pressure']>.5 and r['timer']==.24,(device,r)
  assert r['fast']>r['slow']>0,(device,r)
  assert r['passReceived']==1 and r['immediate'],(device,r)
  assert r['buttons']==r['originalButtons']==4 and r['scoreUnchanged'] and r['identityUnchanged'],(device,r)
  assert not errors,(device,errors)
  print('FIRST_TOUCH_CONTROL_PASS',device,'real match teammate pass, pressure, immediate shot, untouched controls',flush=True)
  ctx.close()
 browser.close()
