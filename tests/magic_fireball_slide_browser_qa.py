#!/usr/bin/env python3
"""MAGIC-FIREBALL-SLIDE-01: live engine Fireball slide parry in desktop and touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build current modular browser fixture first'
html=fixture.read_text(encoding='utf8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game;
   g.init({home:0,away:9,humans:1,mode:'quick'});
   g.matchState='paused';
   const caster=g.player(0,2),defender=g.player(1,2),players=g.players;
   if(!caster||!defender)throw Error('missing outfield players');
   g.players=[caster,defender];
   caster.src={...caster.src,magicTrick:'fireball',dribbling:90};
   defender.src={...defender.src,defence:30};
   caster.x=200;caster.y=300;caster.dx=0;caster.dy=0;caster.face=1;
   defender.x=300;defender.y=300;defender.dx=0;defender.dy=0;defender.face=1;
   const outcomes=[];
   for(const [action,timer,z] of [['slide',.25,0],['slide',.25,19.9],['slide',0,0],['slide',-1,0],['run',.25,0],['punch',.25,0],['slide',.25,NaN]]){
    caster.magicReadyAt=0;caster.stun=0;caster.fatigue=0;caster.keeper=false;
    defender.z=z;defender.stun=0;defender.keeper=false;
    defender.action=action;defender.actionTimer=timer;
    g.clock=2;g.ball.owner=caster;
    const n=g.events.length;
    const activated=g.tryMagicTrick(caster);
    const event=g.events.slice(n).find(e=>e.type==='magicTrick');
    outcomes.push({action,timer,height:Number.isNaN(z)?'NaN':z,activated,countered:event?.countered,
                   stun:defender.stun,ready:caster.magicReadyAt,fatigue:caster.fatigue});
   }
   g.players=players;
   return {outcomes,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
           playerCount:g.players.length};
  }""")
  assert result['buttons']==4 and result['playerCount']==12,(label,'four controls or roster changed',result)
  for case in result['outcomes']:
   expected=case['action']=='slide' and case['timer']>0 and isinstance(case['height'],(int,float)) and case['height']<20
   assert case['activated'] is True,(label,'cast failed',case)
   assert case['countered'] is expected,(label,'Fireball slide counter',case)
   assert case['stun']==(0 if expected else .32),(label,'stun outcome',case)
   assert case['ready']==8 and abs(case['fatigue']-.035)<1e-9,(label,'caster cost changed',case)
  assert not errors,(label,errors)
  print('MAGIC_FIREBALL_SLIDE_BROWSER_PASS',label,flush=True)
  context.close()
 browser.close()
