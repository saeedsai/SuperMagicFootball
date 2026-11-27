#!/usr/bin/env python3
"""Actual-engine clean exposed-ball slide contact, mirrored for desktop and touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build actual modular browser fixture using scripts/build.py'
HTML=fixture.read_text(encoding='utf-8')
JS=r"""() => {
 const g=SupermagicFootball.game,results=[];
 const run=(team,action,profile)=>{
  g.init({home:0,away:1,mode:'quick',humans:1,
   options:{...g.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
  g.matchState='paused';g.weather='Clear';g.events=[];
  const dir=team===0?1:-1,x=1000,y=700;
  const defender=g.player(team,3),carrier=g.player(1-team,3);
  for(const q of g.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
  const bodyGap=profile==='body'?60:86;
  const ballOffset=profile==='shielded'?dir*36:profile==='body'?-dir*20:-dir*36;
  Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
   moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
  Object.assign(carrier,{x:x+dir*bodyGap,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
   moveVX:0,moveVY:0});
  const ballX=carrier.x+ballOffset;
  Object.assign(g.ball,{owner:carrier,x:ballX,y,z:12,vx:0,vy:0,vz:0,
   pass:true,passTeam:carrier.t,passTarget:carrier.src.id,shot:null,strike:null,ordinaryShot:false});
  const before={x:carrier.x,y:carrier.y};
  const originalRandom=Math.random;Math.random=()=>0;
  let started=false,contact=false;
  try{
   if(profile==='missing')g.tackle(defender,true,null);
   else g.command(defender,action);
   started=defender.action==='slide';
   if(profile==='inside'){defender.x+=dir*20;contact=g.slideContact(defender);}
   else if(profile==='outside'){defender.x+=dir*15;contact=g.slideContact(defender);}
   else if(profile==='shielded'||profile==='missing'){defender.x+=dir*20;contact=g.slideContact(defender);}
   else if(profile==='body')contact=g.events.some(e=>e.type==='tackleHit');
  }finally{Math.random=originalRandom;}
  return {team,action,profile,started,contact,ownerRetained:g.ball.owner===carrier,
   carrierStun:carrier.stun,carrierAction:carrier.action,carrierX:carrier.x,carrierY:carrier.y,
   beforeX:before.x,beforeY:before.y,ballZ:g.ball.z,ballVz:g.ball.vz,canCollect:g.ball.canCollect,
   pass:g.ball.pass,passTeam:g.ball.passTeam,passTarget:g.ball.passTarget,
   slideTimer:defender.slideTimer,slideRemaining:defender.slideRemaining,
   ballTouches:g.events.filter(e=>e.type==='tackleBallTouch').length,
   bodyHits:g.events.filter(e=>e.type==='tackleHit').length};
 };
 for(const team of [0,1])for(const action of ['pass','shoot'])
  for(const profile of ['inside','outside','shielded','missing','body'])results.push(run(team,action,profile));
 return {results,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
  args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,mobile in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':844 if mobile else 1280,'height':390 if mobile else 720},
   is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  report=page.evaluate(JS)
  assert report['buttons']==4 and len(report['results'])==20,(device,report)
  for r in report['results']:
   if r['profile']=='inside':
    assert r['started'] and r['contact'] and not r['ownerRetained'],(device,r)
    assert r['carrierStun']==0 and (r['carrierX'],r['carrierY'])==(r['beforeX'],r['beforeY']),(device,r)
    assert r['ballZ']==12 and r['ballVz']==0 and r['canCollect']==.15,(device,r)
    assert not r['pass'] and r['passTeam'] is None and r['passTarget'] is None,(device,r)
    assert r['ballTouches']==1 and r['bodyHits']==0 and r['slideTimer']==0 and r['slideRemaining']==0,(device,r)
   elif r['profile']=='body':
    assert r['started'] and r['bodyHits']==1 and r['carrierStun']>0 and r['carrierAction']=='hurt',(device,r)
    assert r['ballTouches']==0,(device,r)
   else:
    assert r['started'] and not r['contact'] and r['ownerRetained'] and r['carrierStun']==0,(device,r)
    assert r['ballTouches']==0 and r['slideTimer']>0,(device,r)
  assert not errors,(device,errors)
  print('SLIDE_EXPOSED_BALL_CLEAN_TOUCH_PASS',device,'20 actual-engine scenarios; both teams; Pass/Shoot; 4 actions',flush=True)
  context.close()
 browser.close()
