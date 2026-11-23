#!/usr/bin/env python3
"""Mirrored genuine first-touch pass response over 30/60/120 FPS, desktop + touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build actual modular browser fixture using scripts/build.py'
HTML=fixture.read_text(encoding='utf-8')

JS=r"""() => {
 const g=SupermagicFootball.game,results=[];
 if(g.matchState!=='play')throw Error('real quick match not started');
 const buttons=document.querySelectorAll('#touchButtons button[data-act]').length;
 for(const team of [0,1])for(const fps of [30,60,120])for(const pressured of [false,true])for(const skill of [25,95])for(const speed of [300,850]){
  g.init({home:0,away:9,humans:2,mode:'quick',
    options:{...g.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
  g.matchState='paused';g.cooldown=0;
  const passer=g.player(team,3);
  if(!passer||!g.players.length)throw Error('no live team');
  g.take(passer);
  if(!g.pass(passer,false,false,{human:true}))throw Error('real engine rejected short pass');
  const receiver=g.players.find(q=>q.t===team&&q.src.id===g.ball.passTarget);
  if(!receiver||receiver===passer)throw Error('no named recipient from live pass');
  for(const rival of g.players.filter(q=>q.t!==team&&!q.keeper)){
   rival.x=receiver.x+800;rival.y=receiver.y+700;rival.stun=0;
  }
  if(pressured){
   const rival=g.players.find(q=>q.t!==team&&!q.keeper);
   rival.x=receiver.x+19;rival.y=receiver.y;
  }
  const eventsBefore=g.events.length;
  // Vary the real incoming pace and receiver skill before the authoritative take.
  receiver.src={...receiver.src,dribbling:skill,agility:65};
  g.ball.z=12;g.ball.vx=team===0?speed:-speed;g.ball.vy=0;
  // Real GameEngine.take() creates a first touch and authoritative passReceived.
  g.take(receiver);
  const activated=(receiver.firstTouchControlTimer||0)>0,duration=receiver.firstTouchControlDuration||0;
  const x0=receiver.x,y0=receiver.y,face=team===0?1:-1;
  receiver.moveVX=receiver.moveVY=0;
  let time=0;
  while(time<.30-1e-8){
   const dt=Math.min(1/fps,.30-time);
   receiver.firstTouchControlTimer=Math.max(0,(receiver.firstTouchControlTimer||0)-dt);
   g.moveAgile(receiver,face,0,230,dt);
   time+=dt;
  }
  const events=g.events.slice(eventsBefore).filter(e=>e.type==='passReceived');
  results.push({team,fps,pressured,skill,speed,activated,duration,travel:Math.abs(receiver.x-x0),
    drift:receiver.y-y0,ballOwner:g.ball.owner===receiver,events:events.length,
    friendly:events[0]?.friendly,matched:events[0]?.accurate,
    timer:receiver.firstTouchControlTimer,buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
 }
 return {state:g.matchState,results,buttons,score:g.score,teams:g.teamIds};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
   args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,mobile in [('desktop',False),('simulated-touch',True)]:
  ctx=browser.new_context(viewport={'width':844 if mobile else 1280,'height':390 if mobile else 720},
                          is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator('[data-action="'+action+'"]').first.click()
  report=page.evaluate(JS)
  assert report['buttons']==4 and len(report['results'])==48,(device,report)
  for r in report['results']:
   assert r['ballOwner'] and r['events']==1 and r['friendly'] and r['matched'],(device,r)
   assert r['buttons']==4 and abs(r['drift'])<1e-7 and 0<=r['timer']<1e-9,(device,r)
   assert r['activated']==r['pressured'],(device,r)
   assert (0.18<=r['duration']<=0.30) if r['pressured'] else r['duration']==0,(device,r)
   assert r['travel']>0,(device,r)
  for team in [0,1]:
   for fps in [30,60,120]:
    for skill in [25,95]:
     for speed in [300,850]:
      slow=next(r for r in report['results'] if r['team']==team and r['fps']==fps and r['skill']==skill and r['speed']==speed and r['pressured'])
      free=next(r for r in report['results'] if r['team']==team and r['fps']==fps and r['skill']==skill and r['speed']==speed and not r['pressured'])
      assert slow['travel']<free['travel'],(device,slow,free)
  for fps in [30,60,120]:
   for pressured in [False,True]:
    for skill in [25,95]:
     for speed in [300,850]:
      sides=[r['travel'] for r in report['results'] if r['fps']==fps and r['pressured']==pressured and r['skill']==skill and r['speed']==speed]
      assert abs(sides[0]-sides[1])<.001,(device,fps,pressured,skill,speed,sides)
  for team in [0,1]:
   for skill in [25,95]:
    for speed in [300,850]:
     values=[next(r for r in report['results'] if r['team']==team and r['fps']==fps and r['pressured']==pressured and r['skill']==skill and r['speed']==speed)['travel'] for fps in [30,60,120] for pressured in [False,True]]
     for pressured in [False,True]:
      cohort=[next(r for r in report['results'] if r['team']==team and r['fps']==fps and r['pressured']==pressured and r['skill']==skill and r['speed']==speed)['travel'] for fps in [30,60,120]]
      assert max(cohort)-min(cohort)<7.5,(device,team,skill,speed,pressured,cohort)
  for team in [0,1]:
   for fps in [30,60,120]:
    for speed in [300,850]:
     low=next(r for r in report['results'] if r['team']==team and r['fps']==fps and r['pressured'] and r['skill']==25 and r['speed']==speed)
     high=next(r for r in report['results'] if r['team']==team and r['fps']==fps and r['pressured'] and r['skill']==95 and r['speed']==speed)
     assert high['duration']<low['duration'] and high['travel']>low['travel'],(device,low,high)
    for skill in [25,95]:
     gentle=next(r for r in report['results'] if r['team']==team and r['fps']==fps and r['pressured'] and r['skill']==skill and r['speed']==300)
     fast=next(r for r in report['results'] if r['team']==team and r['fps']==fps and r['pressured'] and r['skill']==skill and r['speed']==850)
     assert fast['duration']>gentle['duration'] and fast['travel']<gentle['travel'],(device,gentle,fast)
  assert not errors,(device,errors)
  print('FIRST_TOUCH_MIRROR_FPS_PASS',device,'48 real game reception cohorts; 30/60/120 fps; sides 0/1; four buttons',flush=True)
  ctx.close()
 browser.close()
