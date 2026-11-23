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
  const pressure=target.firstTouchPressure,timer=target.firstTouchControlTimer,duration=target.firstTouchControlDuration;
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
  return {pressure,timer,duration,slow:slow.x-base.x,fast:fast.x-base.x,immediate,
   passReceived:events.length,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
   scoreUnchanged:JSON.stringify(g.score)===original.score,
   identityUnchanged:JSON.stringify(g.teamIds)===original.teams&&JSON.stringify(g.formation)===original.formation,
   originalButtons:original.buttons};
 } finally{blocker.x=oldPos[0];blocker.y=oldPos[1];g.controlled[0]=oldTeam;}
}"""
INTERCEPTION_JS=r"""() => {
 const g=SupermagicFootball.game,team=1,dir=-1;
 const interceptor=g.player(team,3),passer=g.player(0,3),intended=g.player(0,4),marker=g.player(0,5),
  safeOutlet=g.player(team,4),blockedOutlet=g.player(team,5);
 if(!interceptor||!passer||!intended||!marker||!safeOutlet||!blockedOutlet)throw Error('missing interception fixture players');
 const field={x:150,y:155,w:2260.8,h:1220},x=field.x+field.w*.5,y=field.y+field.h*.5;
 g.weather='Clear';g.magicHazards=[];g.magicWalls=[];g.supernova=null;
 const before={score:JSON.stringify(g.score),teams:JSON.stringify(g.teamIds),
  formation:JSON.stringify(g.formation),buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
 const keep=new Set([interceptor,passer,intended,marker,safeOutlet,blockedOutlet]);
 for(const q of g.players)if(!keep.has(q)){q.down=true;q.stun=0;q.z=0;q.action='idle';q.actionTimer=0;}
 Object.assign(interceptor,{x,y,face:dir,z:0,down:false,stun:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,aiAssistTarget:null,aiDetour:null,aiGiveAndGoRun:null,comboActive:false,
  firstTouchControlTimer:0,firstTouchPressure:0});
 Object.assign(passer,{x:x+dir*240,y,down:false,stun:0,z:0,action:'idle',actionTimer:0});
 Object.assign(intended,{x:x+dir*145,y:y-84,down:false,stun:0,z:0,action:'idle',actionTimer:0});
 Object.assign(marker,{x:x+dir*55,y:y-78,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:-dir*35,moveVY:0});
 Object.assign(safeOutlet,{x:x+dir*280,y:y+160,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:dir*20,moveVY:0,aiAssistTarget:null});
 Object.assign(blockedOutlet,{x:x+dir*280,y:y-160,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:dir*20,moveVY:0,aiAssistTarget:null});
 Object.assign(g.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:0,passTarget:intended.src.id,
  attacker:0,lastTouchTeam:0,x,y,z:8,vx:-dir*600,vy:0,vz:0,age:.18,shot:null,strike:null,ordinaryShot:false,canCollect:0});
 g.clock=12;g.take(interceptor);
 const intent=interceptor.aiFirstTouchTarget&&{x:interceptor.aiFirstTouchTarget.x,y:interceptor.aiFirstTouchTarget.y};
 const initialTouchTimer=interceptor.firstTouchControlTimer;
 const originalRandom=Math.random;
 let prematureReleases=[],actual=null,outletIntent=null,firstTouchOwner=false;
 try{
  Math.random=()=>0;
  const decisionStart=g.events.length;
  g.driveAI(interceptor,1/60);
  prematureReleases=g.events.slice(decisionStart).filter(e=>['passIntent','shotRelease','dribbleTrick'].includes(e.type)).map(e=>e.type);
  actual=interceptor.aiTarget&&{x:interceptor.aiTarget.x,y:interceptor.aiTarget.y};
  firstTouchOwner=g.ball.owner===interceptor;
  g.clock=12.25;interceptor.firstTouchControlTimer=0;interceptor.aiTimer=0;
  const outletStart=g.events.length;
  g.driveAI(interceptor,1/60);
  outletIntent=g.events.slice(outletStart).find(e=>e.type==='passIntent')||null;
 }finally{Math.random=originalRandom;}
 return {x,y,dir,timer:initialTouchTimer,duration:interceptor.firstTouchControlDuration,pressure:interceptor.firstTouchPressure,
  owner:firstTouchOwner,target:intent,actual,prematureReleases,
  outletTarget:outletIntent?.target||null,expectedOutlet:safeOutlet.src.id,
  outletOwner:g.ball.owner===interceptor,
  buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
  scoreUnchanged:JSON.stringify(g.score)===before.score,
  identityUnchanged:JSON.stringify(g.teamIds)===before.teams&&JSON.stringify(g.formation)===before.formation};
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
  assert r['pressure']>.5 and .18<=r['duration']<=.30 and abs(r['timer']-r['duration'])<1e-9,(device,r)
  assert r['fast']>r['slow']>0,(device,r)
  assert r['passReceived']==1 and r['immediate'],(device,r)
  assert r['buttons']==r['originalButtons']==4 and r['scoreUnchanged'] and r['identityUnchanged'],(device,r)
  assert not errors,(device,errors)
  intercepted=page.evaluate(INTERCEPTION_JS)
  assert intercepted['owner'] and .18<=intercepted['duration']<=.30 and abs(intercepted['timer']-intercepted['duration'])<1e-9 and intercepted['pressure']>0,(device,intercepted)
  assert intercepted['prematureReleases']==[],(device,intercepted)
  assert intercepted['target'] and intercepted['actual'],(device,intercepted)
  assert intercepted['dir']*(intercepted['target']['x']-intercepted['x'])>=35,(device,intercepted)
  assert intercepted['target']['y']>intercepted['y'],(device,intercepted)
  assert intercepted['target']==intercepted['actual'],(device,intercepted)
  assert intercepted['outletTarget']==intercepted['expectedOutlet'] and not intercepted['outletOwner'],(device,intercepted)
  assert intercepted['buttons']==4 and intercepted['scoreUnchanged'] and intercepted['identityUnchanged'],(device,intercepted)
  print('AI_INTERCEPT_FIRST_TOUCH_PASS',device,'CPU interception takes safe counter-control without changing controls',flush=True)
  print('FIRST_TOUCH_CONTROL_PASS',device,'real match teammate pass, pressure, immediate shot, untouched controls',flush=True)
  ctx.close()
 browser.close()
