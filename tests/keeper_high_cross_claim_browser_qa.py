#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for CPU high-cross claims."""
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
   const g=SupermagicFootball.game,rows=[],field={x:150,y:155,w:2260.8,h:1220};
   const bounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
   for(const team of [0,1]){
    const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax,goalY=765;
    const target={x:ownGoalX+dir*190,y:goalY+78};
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const keeper=g.player(team,0),receiver=g.player(1-team,3);
    for(const q of g.players)if(q!==keeper&&q!==receiver&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(keeper,{x:ownGoalX+dir*40,y:goalY,z:0,stun:0,down:false,action:'idle',
     actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0});
    Object.assign(receiver,{x:target.x+dir*155,y:target.y+10,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
     passTarget:receiver.src.id,x:target.x+dir*118,y:target.y-30,z:90,vx:-dir*190,vy:48,vz:10,
     age:.15,canCollect:0,shot:null,strike:null,ordinaryShot:false});
    g.clock=.2;g.driveAI(keeper,.016);
    const claim=keeper.aiTarget?{x:keeper.aiTarget.x,y:keeper.aiTarget.y}:null;
    const claimActive=keeper.aiKeeperClaimTargetActive===true;
    const claimMoveVX=keeper.moveVX||0;
    keeper.x=claim.x;keeper.y=claim.y;keeper.moveVX=0;keeper.moveVY=0;
    keeper.aiTimer=.5;keeper.cd=10;keeper.keeperHold=0;
    Object.assign(g.ball,{owner:keeper,pass:false,passTarget:null,attacker:team,lastTouchTeam:team,
     z:82,vx:0,vy:0,vz:0,shot:null,strike:null,ordinaryShot:false});
    g.driveAI(keeper,.016);
    const homeX=team===0?field.x+34:field.x+field.w-34;
    rows.push({team,dir,target,aiTarget:claim,claimMoveVX,
     claimActive,returnActive:keeper.aiKeeperClaimTargetActive===true,
     returnTarget:keeper.aiTarget?{x:keeper.aiTarget.x,y:keeper.aiTarget.y}:null,
     returnMoveVX:keeper.moveVX||0,homeX,
     buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
   }
   const aerialRows=[];
   for(const state of ['overlap','above','below','not-jumping','turning-overlap','low-agility-turn'])for(const team of [0,1]){
    const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax,goalY=765;
    const target={x:ownGoalX+dir*190,y:goalY+78};
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const keeper=g.player(team,0),receiver=g.player(1-team,3),challenger=g.player(1-team,2);
    for(const q of g.players)if(q!==keeper&&q!==receiver&&q!==challenger&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(keeper,{x:ownGoalX+dir*40,y:goalY,z:0,stun:0,down:false,action:'idle',
     actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,aiKeeperClaimTargetActive:false,
     aiParryReboundTarget:false,moveVX:0,moveVY:0});
    Object.assign(receiver,{x:target.x+dir*155,y:target.y+10,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    const below=state==='below';
    Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
     passTarget:receiver.src.id,x:target.x+dir*118,y:target.y-30,z:below?165:90,
     vx:-dir*190,vy:48,vz:below?-80:10,age:.15,canCollect:0,shot:null,strike:null,ordinaryShot:false});
    const flight=(g.ball.vz+Math.sqrt(g.ball.vz*g.ball.vz+1000*g.ball.z))/500;
    const horizon=Math.min(.22,flight);
    const turning=state==='turning-overlap'||state==='low-agility-turn';
    Object.assign(challenger,{x:g.ball.x+g.ball.vx*horizon+(turning?dir*90:38),
     y:g.ball.y+g.ball.vy*horizon,
     z:state==='above'?250:state==='below'?20:55,vz:0,
     jumpCount:state==='not-jumping'?0:1,stun:0,down:false,action:'jump',actionTimer:0,
     slideTimer:0,moveVX:0,moveVY:turning?200:0,dx:turning?-dir:0,dy:0});
    if(turning)challenger.src.agility=state==='turning-overlap'?100:1;
    g.clock=.2;g.driveAI(keeper,.016);
    const claim=keeper.aiTarget?{x:keeper.aiTarget.x,y:keeper.aiTarget.y}:null;
    aerialRows.push({team,state,claimActive:keeper.aiKeeperClaimTargetActive===true,claim,
     expected:{x:Math.max(bounds.xMin+22,Math.min(bounds.xMax-22,g.ball.x+g.ball.vx*flight)),
      y:Math.max(bounds.yMin+23,Math.min(bounds.yMax-23,g.ball.y+g.ball.vy*flight))}});
   }
   const arrivalRows=[];
   for(const team of [0,1])for(const profile of [
    {name:'closing',direction:-1,expected:false},
    {name:'retreating',direction:1,expected:true},
    {name:'stationary',direction:0,expected:true}
   ]){
    const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax,goalY=765;
    const target={x:ownGoalX+dir*190,y:goalY+78};
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const keeper=g.player(team,0),receiver=g.player(1-team,3);
    for(const q of g.players)if(q!==keeper&&q!==receiver&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(keeper,{x:ownGoalX+dir*40,y:goalY,z:0,stun:0,down:false,action:'idle',
     actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,aiKeeperClaimTargetActive:false,
     aiParryReboundTarget:false,moveVX:0,moveVY:0});
    Object.assign(receiver,{x:target.x+dir*155,y:target.y+10,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:dir*85*profile.direction,moveVY:0});
    Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
     passTarget:receiver.src.id,x:target.x+dir*118,y:target.y-30,z:90,
     vx:-dir*190,vy:48,vz:10,age:.15,canCollect:0,shot:null,strike:null,ordinaryShot:false});
    g.clock=.2;g.driveAI(keeper,.016);
    arrivalRows.push({team,name:profile.name,expected:profile.expected,
     claimActive:keeper.aiKeeperClaimTargetActive===true});
   }
   const turnRows=[];
   for(const team of [0,1])for(const profile of [
    {name:'turning-away-high',velocity:-1,desired:1,agility:100,expected:true},
    {name:'turning-away-low',velocity:-1,desired:1,agility:1,expected:false},
    {name:'turning-in-high',velocity:1,desired:-1,agility:100,expected:false},
    {name:'turning-in-low',velocity:1,desired:-1,agility:1,expected:true}
   ]){
    const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax,goalY=765;
    const target={x:ownGoalX+dir*190,y:goalY+78};
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const keeper=g.player(team,0),receiver=g.player(1-team,3);
    for(const q of g.players)if(q!==keeper&&q!==receiver&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(keeper,{x:ownGoalX+dir*40,y:goalY,z:0,stun:0,down:false,action:'idle',
     actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0});
    Object.assign(receiver,{x:target.x+dir*180,y:target.y+10,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,
     moveVX:dir*profile.velocity*300,moveVY:0,dx:dir*profile.desired,dy:0});
    receiver.src.agility=profile.agility;
    Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
     passTarget:receiver.src.id,x:target.x+dir*118,y:target.y-30,z:90,
     vx:-dir*190,vy:48,vz:10,age:.15,canCollect:0,shot:null,strike:null,ordinaryShot:false});
    g.clock=.2;g.driveAI(keeper,.016);
    turnRows.push({team,name:profile.name,expected:profile.expected,
     claimActive:keeper.aiKeeperClaimTargetActive===true});
   }
   const profileRows=[];
   for(const team of [0,1]){
    const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax,goalY=765;
    const target={x:ownGoalX+dir*265,y:goalY+35};
    const profiles=[
     {name:'skill-only',skill:100,diving:50,fatigue:0,expected:true},
     {name:'diving-only',skill:50,diving:100,fatigue:0,expected:true},
     {name:'average',skill:50,diving:50,fatigue:0,expected:false},
     {name:'low',skill:1,diving:1,fatigue:0,expected:false},
     {name:'tired-elite',skill:100,diving:100,fatigue:1,expected:false},
     {name:'invalid',skill:'',diving:null,fatigue:0,expected:false},
     {name:'moving-toward',skill:50,diving:50,fatigue:0,moveVX:dir*200,expected:true},
     {name:'moving-away',skill:50,diving:50,fatigue:0,moveVX:-dir*200,expected:false},
     {name:'tired-moving-toward',skill:50,diving:50,fatigue:1,moveVX:dir*200,expected:false},
     {name:'cross-track',skill:80,diving:50,fatigue:0,
      moveVX:-35/Math.hypot(240,35)*360,moveVY:dir*240/Math.hypot(240,35)*360,expected:false},
     {name:'aligned-momentum',skill:80,diving:50,fatigue:0,
      moveVX:dir*240/Math.hypot(240,35)*360,moveVY:35/Math.hypot(240,35)*360,expected:true}
    ];
    for(const profile of profiles){
     g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
     const keeper=g.player(team,0),receiver=g.player(1-team,3);
     for(const q of g.players)if(q!==keeper&&q!==receiver&&!q.keeper){q.down=true;q.stun=1;}
     Object.assign(keeper,{x:ownGoalX+dir*25,y:goalY,z:0,stun:0,down:false,action:'idle',
      actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,moveVX:profile.moveVX||0,moveVY:profile.moveVY||0,fatigue:profile.fatigue});
     keeper.src.gkSkill=profile.skill;keeper.src.gkDiving=profile.diving;
     Object.assign(receiver,{x:target.x+dir*215,y:target.y+10,z:0,stun:0,down:false,
      action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
     Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
      passTarget:receiver.src.id,x:target.x+dir*160,y:target.y-40,z:170,vx:-dir*190,vy:48,vz:10,
      age:.15,canCollect:0,shot:null,strike:null,ordinaryShot:false});
     g.clock=.2;g.driveAI(keeper,.016);
     profileRows.push({team,name:profile.name,expected:profile.expected,
      claimActive:keeper.aiKeeperClaimTargetActive===true,
      target:keeper.aiTarget?{x:keeper.aiTarget.x,y:keeper.aiTarget.y}:null});
    }
   }
   for(const team of [0,1])for(const profile of [
    {name:'teammate-closing',direction:-1,expected:false},
    {name:'teammate-retreating',direction:1,expected:true}
   ]){
    const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax,goalY=765;
    const target={x:ownGoalX+dir*190,y:goalY+78};
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const keeper=g.player(team,0),receiver=g.player(1-team,3),teammate=g.player(team,2);
    for(const q of g.players)if(q!==keeper&&q!==receiver&&q!==teammate&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(keeper,{x:ownGoalX+dir*40,y:goalY,z:0,stun:0,down:false,action:'idle',
     actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,aiKeeperClaimTargetActive:false,
     aiParryReboundTarget:false,moveVX:0,moveVY:0});
    Object.assign(receiver,{x:target.x+dir*155,y:target.y+10,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    Object.assign(teammate,{x:target.x+dir*180,y:target.y+10,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:dir*150*profile.direction,moveVY:0});
    Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
     passTarget:receiver.src.id,x:target.x+dir*118,y:target.y-30,z:90,
     vx:-dir*190,vy:48,vz:10,age:.15,canCollect:0,shot:null,strike:null,ordinaryShot:false});
    g.clock=.2;g.driveAI(keeper,.016);
    arrivalRows.push({team,name:profile.name,expected:profile.expected,
     claimActive:keeper.aiKeeperClaimTargetActive===true});
   }

   const recoveryRows=[];
   for(const team of [0,1])for(const side of ['opponent','teammate'])for(const fieldName of [
    'shotImpactKnockdownPending','shotImpactKnockdownTimer','shotImpactRiseTimer'
   ]){
    const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax,goalY=765;
    const target={x:ownGoalX+dir*190,y:goalY+78};
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const keeper=g.player(team,0),receiver=g.player(1-team,3);
    const recovering=g.player(side==='opponent'?1-team:team,2);
    for(const q of g.players)if(q!==keeper&&q!==receiver&&q!==recovering&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(keeper,{x:ownGoalX+dir*40,y:goalY,z:0,stun:0,down:false,action:'idle',
     actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,aiKeeperClaimTargetActive:false,
     aiParryReboundTarget:false,moveVX:0,moveVY:0});
    Object.assign(receiver,{x:target.x+dir*155,y:target.y+10,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    Object.assign(recovering,{x:target.x,y:target.y,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,[fieldName]:.2});
    Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
     passTarget:receiver.src.id,x:target.x+dir*118,y:target.y-30,z:90,
     vx:-dir*190,vy:48,vz:10,age:.15,canCollect:0,shot:null,strike:null,ordinaryShot:false});
    g.clock=.2;g.driveAI(keeper,.016);
    recoveryRows.push({team,side,fieldName,claimActive:keeper.aiKeeperClaimTargetActive===true});
   }
    const keeperTurnRows=[];
    for(const team of [0,1])for(const profile of [
     {name:'turn-in-high',agility:100,steering:1,expected:true},
     {name:'turn-away-high',agility:100,steering:-1,expected:false},
     {name:'turn-in-low',agility:1,steering:1,expected:false},
     {name:'neutral-high',agility:100,steering:0,expected:false},
     {name:'invalid-high',agility:100,steering:0,invalid:true,expected:false}
    ]){
     const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax,goalY=765;
     const target={x:ownGoalX+dir*265,y:goalY+35};
     g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
     const keeper=g.player(team,0),receiver=g.player(1-team,3);
     for(const q of g.players)if(q!==keeper&&q!==receiver&&!q.keeper){q.down=true;q.stun=1;}
     Object.assign(keeper,{x:ownGoalX+dir*55,y:target.y-103.4,z:0,stun:0,down:false,
      action:'idle',actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,
      aiKeeperClaimTargetActive:false,aiParryReboundTarget:false,moveVX:0,moveVY:220,
      dx:profile.invalid?NaN:dir*profile.steering,dy:profile.invalid?Infinity:0,fatigue:0});
     keeper.src.agility=profile.agility;keeper.src.gkSkill=50;keeper.src.gkDiving=50;
     Object.assign(receiver,{x:target.x+dir*215,y:target.y+10,z:0,stun:0,down:false,
      action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
     Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
      passTarget:receiver.src.id,x:target.x+dir*160,y:target.y-40,z:170,
      vx:-dir*190,vy:48,vz:10,age:.15,canCollect:0,shot:null,strike:null,ordinaryShot:false});
     g.clock=.2;g.driveAI(keeper,.016);
     keeperTurnRows.push({team,name:profile.name,expected:profile.expected,
      claimActive:keeper.aiKeeperClaimTargetActive===true,
      target:keeper.aiTarget?{x:keeper.aiTarget.x,y:keeper.aiTarget.y}:null});
    }
   return {rows,aerialRows,arrivalRows,turnRows,profileRows,recoveryRows,keeperTurnRows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
    teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  for row in result['rows']:
   target=row['aiTarget']
   assert target is not None,(kind,row)
   assert abs(target['x']-row['target']['x'])<2 and abs(target['y']-row['target']['y'])<2,(kind,row)
   assert row['dir']*row['claimMoveVX']>0,(kind,row)
   assert row['claimActive'] is True,(kind,row)
   assert row['returnActive'] is False,(kind,row)
   assert row['returnTarget'] and abs(row['returnTarget']['x']-row['homeX'])<2,(kind,row)
   assert row['dir']*row['returnMoveVX']<0,(kind,row)
  assert len(result['aerialRows'])==12,(kind,result['aerialRows'])
  for row in result['aerialRows']:
   if row['state'] in ('overlap','turning-overlap'):
    assert row['claimActive'] is False,(kind,row)
   else:
    assert row['claimActive'] is True,(kind,row)
    assert row['claim'] is not None and abs(row['claim']['x']-row['expected']['x'])<2 and abs(row['claim']['y']-row['expected']['y'])<2,(kind,row)
  assert len(result['arrivalRows'])==10,(kind,result['arrivalRows'])
  for row in result['arrivalRows']:
   assert row['claimActive'] is row['expected'],(kind,row)
  assert len(result['turnRows'])==8,(kind,result['turnRows'])
  for row in result['turnRows']:
   assert row['claimActive'] is row['expected'],(kind,row)
  assert len(result['profileRows'])==22,(kind,result['profileRows'])
  assert len(result['recoveryRows'])==12,(kind,result['recoveryRows'])
  for row in result['recoveryRows']:
   assert row['claimActive'] is True,(kind,row)
  assert len(result['keeperTurnRows'])==10,(kind,result['keeperTurnRows'])
  for row in result['keeperTurnRows']:
   assert row['claimActive'] is row['expected'],(kind,row)
   if row['expected']:
    assert row['target'] is not None and abs(row['target']['x']-(439 if row['team']==0 else 2121))<2,(kind,row)
  for row in result['profileRows']:
   assert row['claimActive'] is row['expected'],(kind,row)
   if row['expected']:
    expectedX=439 if row['team']==0 else 2121
    assert row['target'] is not None and abs(row['target']['x']-expectedX)<2,(kind,row)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored goalkeeper high-cross claim and immediate post-catch return, four actions and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
