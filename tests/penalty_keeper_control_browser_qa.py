#!/usr/bin/env python3
"""Real gameplay penalty keeper controls across desktop and simulated-touch Versus."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(), 'Generate the modular fixture with python3 scripts/build.py'
html=fixture.read_text(encoding='utf8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in (
    ('desktop',{'width':1280,'height':720},False),
    ('simulated-touch',{'width':844,'height':390},True)):
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda error: errors.append(str(error)))
  page.evaluate("""() => {const data=new Map();
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
    getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
    removeItem:k=>data.delete(k),clear:()=>data.clear()}})}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','versus','kickoff'):
   page.locator('[data-action="'+action+'"]').first.click()
  assert page.evaluate("SupermagicFootball.game.humans")==2,(label,'not local two-human')
  start=page.evaluate("""() => {
    const g=SupermagicFootball.game;
    const before=JSON.stringify({ids:g.teamIds,rosters:g.rosters.map(s=>s.map(p=>p.id)),
     plans:g.teamPlans,subs:g.substitutionsUsed,score:g.score,
     stored:localStorage.getItem('legend_teamPlans')});
    g.startPK(true);g.pk.ready=0;g.pk.timer=8;
    return {cy:g.pk.saveY,before,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert start['buttons']==4,(label,'four original gameplay actions changed')

  # First kick is shot by home/P1. Only away/P2 movement must move the goalkeeper.
  page.keyboard.down('s')
  page.wait_for_timeout(120)
  page.keyboard.up('s')
  same=page.evaluate("SupermagicFootball.game.pk.saveY")
  assert abs(same-start['cy'])<.001,(label,'shooter moved the defending keeper',same,start)

  page.keyboard.down('ArrowDown')
  page.wait_for_timeout(240)
  page.keyboard.up('ArrowDown')
  away=page.evaluate("SupermagicFootball.game.pk.saveY")
  assert away>start['cy']+5,(label,'P2 keeper movement did not apply',away,start)

  # The existing player-two remappable JUMP activates a keeper dive.
  page.keyboard.down('ControlRight')
  page.wait_for_timeout(100)
  page.keyboard.up('ControlRight')
  cooldown=page.evaluate("SupermagicFootball.game.pk.diveCooldown")
  dives=page.evaluate("SupermagicFootball.game.events.filter(e=>e.type==='penaltyDive').map(e=>e.team)")
  assert cooldown>0 and dives==[1],(label,'P2 keeper JUMP missing',cooldown,dives)

  # The shooter's SHOT cannot summon the old CPU clairvoyant keeper.
  position=page.evaluate("""() => {
    const g=SupermagicFootball.game;g.pk.saveY=750;g.pk.aim=640;g.pk.ready=0;
    g.input.touch.x=0;g.input.touch.y=0;
    return {keeper:g.pk.saveY,score:[...g.score]};
  }""")
  page.keyboard.down('j')
  page.wait_for_timeout(85)
  page.keyboard.up('j')
  shot=page.evaluate("({stage:SupermagicFootball.game.pk.stage,saveY:SupermagicFootball.game.pk.saveY,turn:SupermagicFootball.game.pk.turn})")
  assert shot['stage']=='shooting' and abs(shot['saveY']-position['keeper'])<.001,(label,'human keeper jumped to CPU guess',shot)

  # Settle the actual flight to rotate shooters; now home/P1 must be the keeper.
  page.evaluate("""() => {
    const g=SupermagicFootball.game;g.pk.shotTimer=.001;g.updatePK(.02);
    g.pk.ready=0;g.pk.timer=8;
  }""")
  assert page.evaluate("SupermagicFootball.game.pk.turn")==1,(label,'not switched to P1 defending')

  cy=page.evaluate("SupermagicFootball.game.pk.saveY")
  if touch:
   # Genuine joystick pointer event handlers feed the normal Input.poll pipeline.
   page.evaluate("""() => {
     const zone=document.querySelector('#joyZone'),b=zone.getBoundingClientRect();
     zone.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:44,pointerType:'touch',
       clientX:b.left+b.width/2,clientY:b.top+b.height*.8}));
   }""")
   page.wait_for_timeout(260)
   page.evaluate("""() => {
     const zone=document.querySelector('#joyZone'),b=zone.getBoundingClientRect();
     zone.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:44,pointerType:'touch',
       clientX:b.left+b.width/2,clientY:b.top+b.height*.8}));
   }""")
  else:
   page.keyboard.down('s');page.wait_for_timeout(250);page.keyboard.up('s')
  home=page.evaluate("SupermagicFootball.game.pk.saveY")
  assert home>cy+5,(label,'P1 goalkeeper joystick/keyboard not working',home,cy)

  # P2 is now the shooter and must not move the P1 keeper.
  page.keyboard.down('ArrowUp')
  page.wait_for_timeout(120)
  page.keyboard.up('ArrowUp')
  moved=page.evaluate("SupermagicFootball.game.pk.saveY")
  assert abs(moved-home)<.001,(label,'away shooter stole P1 keeper controls',home,moved)
  after=page.evaluate("""() => {
    const g=SupermagicFootball.game;
    return {identity:JSON.stringify({ids:g.teamIds,rosters:g.rosters.map(s=>s.map(p=>p.id)),
     plans:g.teamPlans,subs:g.substitutionsUsed,score:g.score,
     stored:localStorage.getItem('legend_teamPlans')}),
     buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert after['identity']==start['before'] and after['buttons']==4,(label,'saved game, score or controls mutated')
  assert not errors,(label,errors)
  print('PENALTY_KEEPER_VERSUS_BROWSER_PASS',label,
        'P2 arrow/JUMP; P1 joystick/key; no CPU overwrite; unchanged saves/rosters/actions',flush=True)
  context.close()
 browser.close()
