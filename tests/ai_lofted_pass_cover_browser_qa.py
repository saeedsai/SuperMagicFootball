#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for targeted lofted-pass cover."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module');page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[],untargetedRows=[],turnRows=[],turnJumpRows=[],collectionRows=[];
   for(const defendingTeam of [0,1]){
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4);
    const x=2260.8*.55+150+(attackingTeam===0?120:-120),y=765,ballX=x-dir*360;
    for(const q of g.players){if(q===receiver||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=1;}
    Object.assign(receiver,{x,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,slideTimer:0,
     shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,moveVX:0,moveVY:0,aiAssistTarget:null});
    Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
     shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
    Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,attacker:attackingTeam,
     lastTouchTeam:attackingTeam,x:ballX,y,z:35,vx:dir*600,vy:0,vz:245,age:.15,canCollect:.17,shot:null,strike:null,ordinaryShot:false});
    g.clock=.2;
    const targetX=x-dir*93.2;
    Object.assign(support,{x:targetX,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
    g.driveAI(support,.016);const supportTarget=support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null;
    const supportJumpCount=support.jumpCount,supportAction=support.action;
    g.driveAI(primary,.016);const primaryTarget=primary.aiTarget?{x:primary.aiTarget.x,y:primary.aiTarget.y}:null;
    rows.push({attackingTeam,dir,x,y,targetX,supportTarget,supportJumpCount,supportAction,primaryTarget,ball:{x:g.ball.x,y:g.ball.y}});
   }
   for(const defendingTeam of [0,1]){
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4);
    for(const q of g.players)if(q!==primary&&q!==support&&!q.keeper){q.down=true;q.stun=1;}
    const x=150+2260.8*.52,y=765;
    Object.assign(primary,{x:x-dir*12,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
     slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
    Object.assign(g.ball,{owner:null,x,y,z:9,vx:dir*620,vy:0,vz:0,pass:true,
     passTeam:attackingTeam,passTarget:null,attacker:attackingTeam,lastTouchTeam:attackingTeam,
     age:.18,canCollect:0,shot:null,strike:null,ordinaryShot:false});
    const seconds=Math.max(.10,Math.min(.22,112/620));
    const expectedX=x+dir*620*seconds+dir*12;
    Object.assign(support,{x:expectedX,y:y+40,z:0,down:false,stun:0,action:'idle',actionTimer:0,
     slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
    g.clock=.18;g.driveAI(support,.016);
    const supportTarget=support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null;
    const supportAction=support.action;
    g.driveAI(primary,.016);
    const primaryTarget=primary.aiTarget?{x:primary.aiTarget.x,y:primary.aiTarget.y}:null;
    untargetedRows.push({defendingTeam,dir,x,y,expectedX,supportTarget,supportAction,primaryTarget});
   }
   for(const defendingTeam of [0,1])for(const agility of [100,1]){
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4);
    const field=2260.8,y=765,x=150+field*.55+(attackingTeam===0?120:-120),ballX=x-dir*360;
    for(const q of g.players)if(q!==receiver&&q!==primary&&q!==support&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(receiver,{x,y,z:0,down:false,stun:0,action:'run',actionTimer:0,slideTimer:0,
     shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
     moveVX:dir*150,moveVY:0,dx:0,dy:1,aiAssistTarget:null});
    receiver.src={...receiver.src,agility};
    Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
     slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0});
    Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,
     attacker:attackingTeam,lastTouchTeam:attackingTeam,x:ballX,y,z:35,vx:dir*600,vy:0,vz:245,
     age:.15,canCollect:.17,shot:null,strike:null,ordinaryShot:false});
    Object.assign(support,{x:x-dir*70,y:y+20,z:0,down:false,stun:0,action:'idle',actionTimer:0,
     slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0});
    g.clock=.2;g.driveAI(support,.016);
    const supportTarget=support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null;
    const supportAction=support.action;
    g.driveAI(primary,.016);
    turnRows.push({defendingTeam,agility,dir,supportTarget,supportAction,
     primaryTarget:primary.aiTarget?{x:primary.aiTarget.x,y:primary.aiTarget.y}:null});
   }
   for(const defendingTeam of [0,1]){
    for(const agility of [100,1]){
     const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
     g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
     const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4);
     const field=2260.8,x=150+field*.55+(attackingTeam===0?120:-120),y=765,ballX=x-dir*360;
     for(const q of g.players){if(q===receiver||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=1;}
     Object.assign(receiver,{x,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,slideTimer:0,
      shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,moveVX:0,moveVY:0,aiAssistTarget:null});
     Object.assign(primary,{x:ballX-dir*5,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
      slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0});
     Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,
      attacker:attackingTeam,lastTouchTeam:attackingTeam,x:ballX,y,z:35,vx:dir*600,vy:0,vz:245,
      age:.15,canCollect:.17,shot:null,strike:null,ordinaryShot:false});
     Object.assign(support,{x:ballX+dir*240,y:y+40,z:0,down:false,stun:0,action:'idle',actionTimer:0,
      slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,moveVX:0,moveVY:150,dx:dir,dy:0});
     support.src={...support.src,agility};
     g.clock=.2;g.driveAI(support,.016);
     const supportTarget=support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null;
     const supportAction=support.action,jumpCount=support.jumpCount;
     g.driveAI(primary,.016);
     const primaryTarget=primary.aiTarget?{x:primary.aiTarget.x,y:primary.aiTarget.y}:null;
     turnJumpRows.push({defendingTeam,agility,dir,supportTarget,supportAction,jumpCount,primaryTarget});
    }
   }
   for(const defendingTeam of [0,1]){
    g.init({home:0,away:1,mode:'quick',humans:0});
    const jumper=g.player(defendingTeam,3);
    for(const q of g.players)if(q!==jumper){q.down=true;q.stun=1;}
    Object.assign(jumper,{x:500,y:300,z:70,vz:0,jumpCount:1,action:'jump',actionTimer:.3,
     stun:0,down:false,slideTimer:0,shotImpactKnockdownPending:0,
     shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
    const setBall=()=>Object.assign(g.ball,{owner:null,x:500,y:300,z:100,vx:0,vy:0,vz:0,
     canCollect:0,pass:true,passTeam:1-defendingTeam,attacker:1-defendingTeam,
     passTarget:jumper.src.id,age:.5,shot:null,strike:null,ordinaryShot:false});
    setBall();g.updateBall(.001);const airborneCollected=g.ball.owner===jumper;
    g.ball.owner=null;Object.assign(jumper,{z:0,vz:0,jumpCount:0,action:'idle',actionTimer:0});
    setBall();g.updateBall(.001);const groundedCollected=g.ball.owner===jumper;
    collectionRows.push({defendingTeam,airborneCollected,groundedCollected});
   }
   return {rows,untargetedRows,turnRows,turnJumpRows,collectionRows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  assert len(result['collectionRows'])==2 and all(r['airborneCollected'] and not r['groundedCollected'] for r in result['collectionRows']),(kind,result['collectionRows'])
  for team in [0,1]:
   profiles={row['agility']:row for row in result['turnRows'] if row['defendingTeam']==team}
   assert set(profiles)=={100,1},(kind,profiles)
   for row in profiles.values():
    assert row['supportTarget'] is not None and row['primaryTarget'] is not None,(kind,row)
    assert row['supportAction']=='jump',(kind,row)
   elite,low=profiles[100],profiles[1]
   assert (low['supportTarget']['x']-elite['supportTarget']['x'])*elite['dir']>15,(kind,profiles)
   assert elite['supportTarget']['y']>low['supportTarget']['y']+4,(kind,profiles)
  for team in [0,1]:
   high=next((row for row in result['turnJumpRows'] if row['defendingTeam']==team and row['agility']==100),None)
   low=next((row for row in result['turnJumpRows'] if row['defendingTeam']==team and row['agility']==1),None)
   assert high and low,(kind,team,result['turnJumpRows'])
   assert high['supportAction']=='jump' and high['jumpCount']==1,(kind,high)
   assert low['supportAction']!='jump' and low['jumpCount']!=1,(kind,low)
   assert high['supportTarget'] and low['supportTarget'] and high['primaryTarget'] and low['primaryTarget'],(kind,high,low)
  for row in result['rows']:
   cover=row['supportTarget'];primary=row['primaryTarget'];ball=row['ball']
   assert cover is not None and primary is not None,(kind,row)
   assert abs(cover['x']-row['targetX'])<2 and abs(cover['y']-row['y'])<2,(kind,row)
   assert row['supportAction']=='jump' and row['supportJumpCount']==1,(kind,row)
   assert abs(primary['x']-ball['x'])<80 and abs(primary['y']-ball['y'])<80,(kind,row)
  assert len(result['untargetedRows'])==2,(kind,result['untargetedRows'])
  for row in result['untargetedRows']:
   cover=row['supportTarget'];primary=row['primaryTarget']
   assert cover is not None and primary is not None,(kind,row)
   assert abs(cover['x']-row['expectedX'])<2 and abs(cover['y']-row['y'])<2,(kind,row)
   assert 48<=(cover['x']-row['x'])*row['dir']<=190,(kind,row)
   assert abs(primary['x']-row['x'])<180 and abs(primary['y']-row['y'])<180,(kind,row)
   assert row['supportAction']!='jump',(kind,row)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored lofted-pass cover, primary pursuit, four actions and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
