#!/usr/bin/env python3
"""Actual GameEngine Wind/Mud counter selection in desktop and simulated-touch Chromium."""
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
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,out=[];
   for(const trick of ['wind','mud'])for(const team of [0,1])
    for(const mode of ['unavailable','turned-away','active-slide']){
     g.init({home:0,away:9,humans:0,mode:'quick',difficulty:3});
     g.options.difficulty=3;
     const carrier=g.player(team,4),target=g.player(1-team,3),
      backup=g.player(1-team,4),third=g.player(1-team,5),dir=team===0?1:-1;
     if(!carrier||!target||!backup||!third)throw Error('Missing Wind/Mud counter participants');
     Object.assign(carrier,{x:640,y:360,down:false,stun:0,z:0,action:'idle',actionTimer:0,
      dribbleHold:.72,face:dir,dx:dir,dy:0,moveVX:0,moveVY:0});
     carrier.src={...carrier.src,magicTrick:trick};
     for(const q of g.players)if(q.t!==team&&!q.keeper&&q!==target&&q!==backup&&q!==third)
      Object.assign(q,{x:dir===1?2200:300,y:700,down:true,stun:1,z:0,action:'idle',actionTimer:0});
     const place=(q,offset)=>Object.assign(q,{x:carrier.x+dir*offset,y:carrier.y,down:false,
      stun:0,z:0,action:'idle',actionTimer:0,face:-dir,dx:0,dy:0,moveVX:0,moveVY:0,
      fatigue:0,breath:1,jumpCount:0,aiWindMudThreat:null,aiWindMudReaction:0});
     place(target,45);place(backup,55);place(third,65);
     if(mode==='unavailable'){
      target.down=true;backup.action='hurt';backup.actionTimer=.3;
     }else if(mode==='turned-away'){
      target.face=dir;backup.face=dir;
     }else{
      target.action='slide';target.actionTimer=.3;target.face=dir;
     }
     g.ball.owner=carrier;g.ball.x=carrier.x;g.ball.y=carrier.y;g.ball.z=0;g.clock=10;g.matchState='play';
     let steps=0;const dt=1/60;
     while(steps<30&&target.action!=='jump'&&backup.action!=='jump'&&third.action!=='jump'){
      for(const defender of [target,backup,third])g.reactToWindMudTrick(defender,dt,.18);
      steps++;
     }
     const jumped=[target,backup,third].filter(q=>q.action==='jump'&&q.jumpCount===1);
     out.push({team,trick,mode,steps,jumped:jumped.map(q=>q.i),
      targetAction:target.action,backupAction:backup.action,thirdAction:third.action});
    }
   return {out,canonicalTeams:SupermagicFootball.teams.filter(t=>!['demo_concept_royals','demo_crown_royals_reference'].includes(t.id)).length,
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert len(result['out'])==12,(label,result)
  assert result['canonicalTeams']==223 and result['buttons']==4,(label,result)
  for case in result['out']:
   expected=4 if case['mode']=='active-slide' else 5
   assert case['jumped']==[expected],(label,'wrong counter selected or reaction budget expanded',case)
   if case['mode']=='active-slide':
    assert case['targetAction']=='slide' and case['backupAction']=='jump' and case['thirdAction']=='idle',(label,case)
   else:
    assert case['targetAction']!='jump' and case['backupAction']!='jump' and case['thirdAction']=='jump',(label,case)
  assert not errors,(label,errors)
  print('MAGIC_WIND_MUD_AI_COUNTER_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
