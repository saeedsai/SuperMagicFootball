#!/usr/bin/env python3
"""Real in-game half-time fatigue/talk/full-time lifecycle in desktop and touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
fixture=root/'tests/.generated/play.html'
if not fixture.exists():fixture=root/'play.html'
assert fixture.exists(),'Generate modular playable QA fixture first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                               ('simulated-touch',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,has_touch=touch,is_mobile=touch)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {
    const data=new Map();
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
      removeItem:k=>data.delete(k),clear:()=>data.clear()
    }});
  }""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for act in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator(f'[data-action="{act}"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play',(label,'kickoff failed')
  half=page.evaluate("""() => {
    const g=SupermagicFootball.game;
    g.matchState='paused';
    g.celebration=0;g.pendingKickoff=null;
    const h=g.rosters[0][g.lineups[0][1]],a=g.rosters[1][g.lineups[1][1]];
    const bench=g.rosters[0].find(p=>!g.lineups[0].some(ix=>g.rosters[0][ix].id===p.id));
    if(!bench)throw Error('No bench player in configured match');
    for(const p of g.players){p.fatigue=.1;g.fatigueLedger[p.t][p.src.id]=.1;}
    for(const squad of g.rosters)for(const p of squad){
      if(g.fatigueLedger[g.rosters.indexOf(squad)][p.id]===undefined)
       g.fatigueLedger[g.rosters.indexOf(squad)][p.id]=.1;
    }
    g.player(0,1).fatigue=.8;g.fatigueLedger[0][h.id]=.8;
    g.player(1,1).fatigue=.5;g.fatigueLedger[1][a.id]=.5;
    g.fatigueLedger[0][bench.id]=.7;
    const before={lineup:JSON.stringify(g.lineups),talk:JSON.stringify(g.talksUsed),
      score:JSON.stringify(g.score),stored:localStorage.getItem('legend_teamPlans'),
      home:h.id,away:a.id,bench:bench.id,
      buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
    g.clock=g.matchSeconds-.005;
    g.cooldown=0;g.stoppageAnnounced=false;
    g.ball.owner=null;g.ball.pass=null;g.ball.passTeam=null;
    g.ball.x=1400;g.ball.y=700;g.ball.vx=0;g.ball.vy=0;
    g.matchState='play';g.update(.02);
    return {...before,state:g.matchState,half:g.half,clock:g.clock,
      homeFat:g.fatigueLedger[0][h.id],awayFat:g.fatigueLedger[1][a.id],
      benchFat:g.fatigueLedger[0][bench.id]};
  }""")
  assert half['buttons']==4,(label,'four approved match action buttons')
  assert half['state']=='paused' and half['half']==2 and half['clock']==0,(label,half)
  assert abs(half['homeFat']-.48)<.00001,(label,'starter 40% recovery',half)
  assert abs(half['awayFat']-.30)<.00001,(label,'away independent recovery',half)
  assert abs(half['benchFat']-.42)<.00001,(label,'bench recovery',half)
  assert page.locator('.heading').inner_text()=='HALF TIME',(label,'actual event did not open halftime UI')
  assert page.locator('#halfTalkHome').count()==1,(label,'one-time team talk action missing')
  after=page.evaluate("""() => ({
    lineup:JSON.stringify(SupermagicFootball.game.lineups),
    talk:JSON.stringify(SupermagicFootball.game.talksUsed),
    score:JSON.stringify(SupermagicFootball.game.score),
    stored:localStorage.getItem('legend_teamPlans')
  })""")
  for key in ('lineup','talk','score','stored'):
   # The CPU can legitimately make an automatic substitute at the break.
   if key=='lineup':continue
   assert half[key]==after[key],(label,key,'unintended halftime side effect',half,after)
  page.locator('[data-action="talkHalfHome"]').first.click()
  assert page.evaluate('SupermagicFootball.game.talksUsed[0].halftime') is True,(label,'team talk not consumed')
  assert page.locator('[data-action="talkHalfHome"]').count()==0,(label,'second team talk button still available')
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate('SupermagicFootball.game.matchState')=='play',(label,'second-half resume failed')
  full=page.evaluate("""() => {
    const g=SupermagicFootball.game;
    g.matchState='paused';g.celebration=0;g.pendingKickoff=null;
    g.half=2;g.score=[1,0];g.clock=g.matchSeconds-.005;
    g.ball.owner=null;g.ball.pass=null;g.ball.passTeam=null;
    g.ball.x=1400;g.ball.y=700;g.ball.vx=g.ball.vy=0;
    g.stoppageAnnounced=false;g.matchState='play';g.update(.02);
    return {state:g.matchState,half:g.half,score:g.score,talks:g.talksUsed[0].halftime};
  }""")
  assert full['state']=='finished' and full['score']==[1,0] and full['talks'],(label,full)
  assert not errors,(label,errors)
  print('HALFTIME_LIFECYCLE_PASS',label,'game half transition, fatigue, talk limit, resume, full time',flush=True)
  ctx.close()
 browser.close()
