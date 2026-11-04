#!/usr/bin/env python3
"""TR16: verify CPU last-known-position pursuit during Hide Ball in desktop/touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build current modular browser fixture first'
html=fixture.read_text(encoding='utf8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate('''() => {
   const g=SupermagicFootball.game;
   g.init({home:0,away:9,humans:0,mode:'quick'});g.matchState='play';
   const carrier=g.player(0,2),opponent=g.player(1,2),ally=g.player(0,3);
   g.players=[carrier,opponent,ally];
   Object.assign(carrier,{x:680,y:560,hideBallTimer:.65,hideBallLastKnown:{x:500,y:410}});
   Object.assign(opponent,{x:900,y:800,homeX:900,homeY:800,aiTarget:null,aiTimer:0,aiAssistTarget:null,aiStuckTime:0,aiDetour:null});
   Object.assign(ally,{x:760,y:700,homeX:760,homeY:700,aiTarget:null,aiTimer:0,aiAssistTarget:null,aiStuckTime:0,aiDetour:null});
   g.ball.owner=carrier;g.ball.x=carrier.x;g.ball.y=carrier.y;g.clock=5;
   g.reactToSpinBumper=()=>{};g.driveAiCombo=()=>false;g.moveAgile=()=>{};g.staminaTick=()=>{};
   g.driveAI(opponent,1/60);const during={...opponent.aiTarget};
   const retainedOwner=g.ball.owner===carrier,retainedCarrier=[carrier.x,carrier.y];
   // Teammate awareness is unaffected by the opposing CPU mask.
   g.driveAI(ally,1/60);const teammateTarget={...ally.aiTarget};
   // Revealing through possession loss immediately restores the real loose ball.
   g.ball.owner=null;g.updateHideBall(carrier,1/60);opponent.aiTarget=null;opponent.aiTimer=0;
   g.driveAI(opponent,1/60);const afterLoss={...opponent.aiTarget};
   return {during,teammateTarget,afterLoss,retainedOwner,retainedCarrier,
    timer:carrier.hideBallTimer,lastKnown:carrier.hideBallLastKnown,
    actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['during']=={'x':500,'y':410},(label,'CPU must use the saved last-known position',result)
  assert result['teammateTarget']['x']>result['retainedCarrier'][0]-100,(label,'same-team AI should retain normal sight',result)
  assert result['retainedOwner'] and result['retainedCarrier']==[680,560],(label,'mask must not mutate authoritative match state',result)
  assert result['afterLoss']['x']>result['retainedCarrier'][0]-100,(label,'CPU vision should restore at reveal',result)
  assert result['timer']==0 and result['lastKnown'] is None,(label,'possession loss should clear the temporary observation',result)
  assert result['actionButtons']==4,(label,'four-button controls changed',result)
  assert not errors,(label,errors)
  print('HIDE_BALL_AI_VISION_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
