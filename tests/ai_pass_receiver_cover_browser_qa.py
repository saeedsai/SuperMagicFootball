#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for pass interception and first-touch outlet readiness."""
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
   const g=SupermagicFootball.game,rows=[],skillRows=[],reachRows=[],momentumRows=[],turnRows=[];
   for(const defendingTeam of [0,1]){
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
    g.init({home:0,away:1,mode:'quick',humans:0});
    const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4);
    const receiverX=attackingTeam===0?1500:1100,y=765,ballX=receiverX-dir*180;
    Object.assign(receiver,{x:receiverX,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0,
     moveVX:dir*180,moveVY:120,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
    for(const q of g.players){if(q===receiver||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=1;}
    Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
     shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
    Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,attacker:attackingTeam,
     lastTouchTeam:attackingTeam,x:ballX,y,z:8,vx:dir*600,vy:0,vz:40,age:.15,shot:null,strike:null,ordinaryShot:false});
    const supportStartX=ballX+dir*126,supportStartY=y+12.6,legacyX=ballX+dir*177.12;
    Object.assign(support,{x:supportStartX,y:supportStartY,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
     moveVX:0,moveVY:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
     aiAssistTarget:null,aiTimer:0,aiTarget:null});
    g.clock=.2;g.driveAI(support,.016);
    const supportTarget=support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null;
    g.driveAI(primary,.016);
    const primaryTarget=primary.aiTarget?{x:primary.aiTarget.x,y:primary.aiTarget.y}:null;
    rows.push({attackingTeam,dir,supportStartX,supportStartY,legacyX,supportTarget,primaryTarget,ball:{x:g.ball.x,y:g.ball.y}});
   }
   for(const defendingTeam of [0,1]){
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1,points=[];
    for(const defence of [100,50,1]){
     g.init({home:0,away:1,mode:'quick',humans:0});
     const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4);
     const receiverX=attackingTeam===0?1500:1100,y=765,ballX=receiverX-dir*180;
     Object.assign(receiver,{x:receiverX,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0,moveVX:dir*180,moveVY:120,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
     for(const q of g.players){if(q===receiver||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=1;}
     Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
     Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,attacker:attackingTeam,lastTouchTeam:attackingTeam,x:ballX,y,z:8,vx:dir*600,vy:0,vz:40,age:.15,shot:null,strike:null,ordinaryShot:false});
     // Place support inside the average-Defence first interception window; low
     // Defence should miss that early point and retain the later fallback.
     Object.assign(support,{x:ballX+dir*110,y:y+12.6,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
     support.src.speedRating=100;
     support.src.defence=defence;support.src.agility=100;g.clock=.2;g.driveAI(support,.016);
     points.push({defence,target:support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null});
    }
    skillRows.push({defendingTeam,dir,ballX:attackingTeam===0?1320:1280,points});
   }
   for(const defendingTeam of [0,1]){
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1,profiles=[
     {name:'elite-stationary',agility:100,move:0,early:true},
     {name:'average-approach',agility:50,move:200,early:true},
     {name:'average-retreat',agility:50,move:-200,early:false},
     {name:'low-stationary',agility:1,move:0,early:false}
    ];
    for(const profile of profiles){
     g.init({home:0,away:1,mode:'quick',humans:0});
     const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4);
     const receiverX=attackingTeam===0?1500:1100,y=765,ballX=receiverX-dir*180;
     Object.assign(receiver,{x:receiverX,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0,
      moveVX:dir*180,moveVY:120,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
     for(const q of g.players){if(q===receiver||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=1;}
     Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
      shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
     Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,attacker:attackingTeam,
      lastTouchTeam:attackingTeam,x:ballX,y,z:8,vx:dir*600,vy:0,vz:40,age:.15,shot:null,strike:null,ordinaryShot:false});
     Object.assign(support,{x:ballX+dir*111,y:y+12.6,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
      moveVX:dir*profile.move,moveVY:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
      aiAssistTarget:null,aiTimer:0,aiTarget:null,fatigue:0,breath:10,morale:55});
     support.src.speedRating=100;support.src.defence=50;support.src.agility=profile.agility;
     g.clock=.2;g.driveAI(support,.016);
     const target=support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null;
     reachRows.push({defendingTeam,name:profile.name,early:profile.early,
      progress:target?(target.x-ballX)*dir:null,target});
    }
   }
   for(const defendingTeam of [0,1]){
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
    const profiles=[
     {name:'aligned',vx:-dir*200,vy:0},
     {name:'cross-track',vx:0,vy:200},
     {name:'stationary',vx:0,vy:0}
    ];
    for(const profile of profiles){
     g.init({home:0,away:1,mode:'quick',humans:0});
     const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4);
     const receiverX=attackingTeam===0?1500:1100,y=765,ballX=receiverX-dir*180;
     Object.assign(receiver,{x:receiverX,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0,
      moveVX:dir*180,moveVY:120,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
     for(const q of g.players){if(q===receiver||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=1;}
     Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
      shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
     Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,attacker:attackingTeam,
      lastTouchTeam:attackingTeam,x:ballX,y,z:8,vx:dir*600,vy:0,vz:40,age:.15,shot:null,strike:null,ordinaryShot:false});
     support.src.speedRating=100;support.src.defence=50;support.src.agility=100;
     const levels=[{speed:.69,reaction:.78},{speed:.78,reaction:.53},{speed:.86,reaction:.32},{speed:.95,reaction:.18},{speed:1.02,reaction:.09}];
     const level=levels[Math.max(0,Math.min(4,Math.trunc(g.cpuLevel(support))))];
     const style=g.options.aiStyle||'Balanced',styleSpeed=defendingTeam===1?(style==='Aggressive'?1.09:style==='Defensive'?.96:1):1;
     const speed=Math.min(440,g.playerSpeed(support)*level.speed*styleSpeed*(g.terrain==='Sand'?.75:1));
     const turnRate=3+100*.13,rampArea=(1-Math.exp(-turnRate*.06))/turnRate;
     const alignedReach=Math.max(0,speed*.06+(200-speed)*rampArea)*.82+12;
     const crossReach=Math.max(0,speed*.06-speed*rampArea-200*rampArea*.45)*.82+12;
     const responseDelay=Math.max(.04,Math.min(.12,level.reaction*.4));
     const firstProgress=600*(responseDelay+.06)+18,gap=(alignedReach+crossReach)/2;
     Object.assign(support,{x:ballX+dir*(firstProgress+gap),y:y+12.6,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
      moveVX:profile.vx,moveVY:profile.vy,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
      aiAssistTarget:null,aiTimer:0,aiTarget:null,fatigue:0,breath:10,morale:55});
     g.clock=.2;g.driveAI(support,.016);
     const target=support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null;
     momentumRows.push({defendingTeam,name:profile.name,progress:target?(target.x-ballX)*dir:null,target});
    }
   }
   for(const defendingTeam of [0,1]){
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
    for(const profile of [{name:'high-turn',agility:100},{name:'low-turn',agility:1}]){
     g.init({home:0,away:1,mode:'quick',humans:0});
     const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4);
     const receiverX=attackingTeam===0?1500:1100,y=765,ballX=receiverX-dir*180;
     Object.assign(receiver,{x:receiverX,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0,
      moveVX:dir*180,moveVY:0,dx:0,dy:1,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
     receiver.src.agility=profile.agility;
     for(const q of g.players){if(q===receiver||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=1;}
     Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
      moveVX:0,moveVY:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,cd:1});
     Object.assign(support,{x:ballX+dir*126,y:y+12.6,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
      moveVX:0,moveVY:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,cd:1,fatigue:0,breath:10,morale:55});
     support.src.speedRating=100;support.src.defence=50;support.src.agility=100;
     Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,attacker:attackingTeam,
      lastTouchTeam:attackingTeam,x:ballX,y,z:8,vx:dir*600,vy:0,vz:100,age:.15,shot:null,strike:null,ordinaryShot:false});
     g.clock=.2;g.driveAI(support,.016);
     const target=support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null;
     turnRows.push({defendingTeam,name:profile.name,dir,target,progress:target?(target.x-ballX)*dir:null});
    }
   }
   return {rows,skillRows,reachRows,momentumRows,turnRows,teams:SupermagicFootball.teams.length,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  handoff_result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[],field={x:150,y:155,w:2260.8,h:1220};
   for(const defendingTeam of [0,1]){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1,y=field.y+field.h/2;
    const receiverX=attackingTeam===0?field.x+field.w*.60:field.x+field.w*.42;
    const ballX=receiverX-dir*180;
    const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,2),
     nearBall=g.player(defendingTeam,3),laneSupport=g.player(defendingTeam,4);
    const keep=new Set([receiver,primary,nearBall,laneSupport]);
    for(const q of g.players)if(!keep.has(q)&&!q.keeper){q.down=true;q.stun=1;q.z=0;}
    Object.assign(receiver,{x:receiverX,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
     slideTimer:0,moveVX:0,moveVY:0,shotImpactKnockdownPending:0,
     shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
    Object.assign(primary,{x:ballX-dir*18,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
     slideTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
    Object.assign(nearBall,{x:ballX+dir*42,y:y+35,down:false,stun:0,z:0,action:'idle',actionTimer:0,
     slideTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
    Object.assign(laneSupport,{x:ballX+dir*140,y:y+8,down:false,stun:0,z:0,action:'idle',actionTimer:0,
     slideTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1,
     fatigue:0,breath:10,morale:55});
    laneSupport.homeX=laneSupport.x-dir*300;laneSupport.homeY=laneSupport.y+260;
    Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,
     attacker:attackingTeam,lastTouchTeam:attackingTeam,x:ballX,y,z:8,vx:dir*600,vy:0,vz:40,age:.15,
     shot:null,strike:null,ordinaryShot:false});
    g.clock=.2;g.driveAI(laneSupport,.016);
    const supportTarget=laneSupport.aiTarget?{x:laneSupport.aiTarget.x,y:laneSupport.aiTarget.y}:null;
    g.driveAI(primary,.016);
    const primaryTarget=primary.aiTarget?{x:primary.aiTarget.x,y:primary.aiTarget.y}:null;
    const passPointX=ballX+dir*140.4;
    rows.push({defendingTeam,dir,ballX,y,passPointX,supportTarget,primaryTarget,
     supportGap:supportTarget?Math.hypot(supportTarget.x-passPointX,supportTarget.y-y):Infinity,
     primaryGap:primaryTarget?Math.hypot(primaryTarget.x-ballX,primaryTarget.y-y):Infinity,
     possession:g.ball.owner===null});
   }
   return {rows,teams:SupermagicFootball.teams.length,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  outlet_result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[],originalRandom=Math.random;
   try {
    Math.random=()=>0;
    for(const team of [0,1]){
     const dir=team===0?1:-1,x=1100,y=765;
     g.init({home:0,away:1,mode:'quick',humans:0});
     const interceptor=g.player(team,3),passer=g.player(1-team,3),intended=g.player(1-team,4),
      marker=g.player(1-team,5),preferred=g.player(team,4),blocked=g.player(team,5),alternate=g.player(team,2);
     const keep=new Set([interceptor,passer,intended,marker,preferred,blocked,alternate]);
     for(const q of g.players)if(!keep.has(q)&&!q.keeper){q.down=true;q.stun=0;q.z=0;}
     Object.assign(interceptor,{x,y,face:dir,down:false,stun:0,z:0,action:'idle',actionTimer:0,
      moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,aiAssistTarget:null,
      aiGiveAndGoRun:null,cd:0,trickCd:1});
     Object.assign(passer,{x:x+dir*240,y,down:false,stun:0,z:0,action:'idle',actionTimer:0});
     Object.assign(intended,{x:x-dir*210,y,down:false,stun:0,z:0,action:'idle',actionTimer:0});
     Object.assign(marker,{x:x+dir*55,y:y-78,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:-dir*35,moveVY:0});
     Object.assign(g.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:1-team,passTarget:intended.src.id,
      attacker:1-team,lastTouchTeam:1-team,x,y,z:8,vx:-dir*600,vy:0,vz:0,age:.18,canCollect:0,
      shot:null,strike:null,ordinaryShot:false});
     g.clock=10;g.take(interceptor);
     Object.assign(preferred,{x:x+dir*280,y:y+160,z:0,down:false,stun:0,action:'idle',actionTimer:0,
      moveVX:dir*20,moveVY:0,aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:.18});
     Object.assign(blocked,{x:x+dir*280,y:y-160,z:0,down:false,stun:0,action:'idle',actionTimer:0,
      moveVX:dir*20,moveVY:0,aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:0});
     Object.assign(alternate,{x:x+dir*260,y:y+190,z:0,down:false,stun:0,action:'idle',actionTimer:0,
      moveVX:dir*20,moveVY:0,aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:0});
     Object.assign(intended,{x:x+dir*145,y:y-84,z:0,down:false,stun:0,action:'idle',actionTimer:0});
     interceptor.firstTouchControlTimer=0;interceptor.firstTouchPressure=.8;
     interceptor.firstTouchOutletReadTimer=.68;interceptor.aiFirstTouchOutletUntil=g.clock+.92;
     interceptor.aiFirstTouchTarget=null;interceptor.aiAssistTarget=null;interceptor.aiGiveAndGoRun=null;
     interceptor.aiTimer=0;interceptor.aiTarget=null;
     const start=g.events.length;g.clock=10.25;g.driveAI(interceptor,.016);
     const intent=g.events.slice(start).find(event=>event.type==='passIntent');
     rows.push({team,target:intent?.target,expected:alternate.src.id,preferred:preferred.src.id,
      preferredTimer:preferred.firstTouchControlTimer,alternateTimer:alternate.firstTouchControlTimer,
      possession:g.ball.owner===null});
    }
   }finally{Math.random=originalRandom;}
   return {rows,teams:SupermagicFootball.teams.length,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert handoff_result['teams']>=223,(kind,handoff_result)
  assert handoff_result['buttons']==4,(kind,handoff_result)
  for row in handoff_result['rows']:
   assert row['supportTarget'] is not None and row['supportGap']<35,(kind,row)
   assert row['primaryTarget'] is not None and row['primaryGap']<80,(kind,row)
   assert row['possession'],(kind,row)
  assert outlet_result['teams']>=223,(kind,outlet_result)
  assert outlet_result['buttons']==4,(kind,outlet_result)
  for row in outlet_result['rows']:
   assert row['target']==row['expected'] and row['target']!=row['preferred'],(kind,row)
   assert row['preferredTimer']>0 and row['alternateTimer']==0 and row['possession'],(kind,row)
  assert result['teams']>=223,(kind,result)
  assert result['buttons']==4,(kind,result)
  for row in result['rows']:
   cover=row['supportTarget'];primary=row['primaryTarget'];ball=row['ball']
   assert cover is not None and primary is not None,(kind,row)
   assert abs(cover['x']-row['supportStartX'])<30 and abs(cover['y']-row['supportStartY'])<2,(kind,row)
   assert (cover['x']-ball['x'])*row['dir']<(row['legacyX']-ball['x'])*row['dir']-35,(kind,row)
   assert abs(primary['x']-ball['x'])<80 and abs(primary['y']-ball['y'])<80,(kind,row)
  for row in result['skillRows']:
   points=row['points'];assert len(points)==3,(kind,row)
   assert all(item['target'] is not None for item in points),(kind,row)
   progress=[(item['target']['x']-row['ballX'])*row['dir'] for item in points]
   assert progress[0]<progress[1]-2,(kind,row,progress)
   assert progress[2]>progress[1]+2,(kind,row,progress)
  assert len(result['reachRows'])==8,(kind,result['reachRows'])
  for row in result['reachRows']:
   assert row['target'] is not None,(kind,row)
   if row['early']:
    assert row['progress']<130,(kind,row)
   else:
    assert row['progress']>150,(kind,row)
  assert len(result['momentumRows'])==6,(kind,result['momentumRows'])
  for team in (0,1):
   rows=[row for row in result['momentumRows'] if row['defendingTeam']==team]
   assert len(rows)==3 and all(row['target'] is not None for row in rows),(kind,rows)
   aligned=next(row for row in rows if row['name']=='aligned')
   cross=next(row for row in rows if row['name']=='cross-track')
   stationary=next(row for row in rows if row['name']=='stationary')
   assert aligned['progress']<cross['progress']-5,(kind,rows)
   assert stationary['progress']<=cross['progress']+1,(kind,rows)
  assert len(result['turnRows'])==4,(kind,result['turnRows'])
  for team in (0,1):
   turns=[row for row in result['turnRows'] if row['defendingTeam']==team]
   high=next(row for row in turns if row['name']=='high-turn')
   low=next(row for row in turns if row['name']=='low-turn')
   assert high['target'] is not None and low['target'] is not None,(kind,turns)
   assert high['target']['y']>low['target']['y']+5,(kind,turns)
   # The receiver turn is lateral to this straight pass; assert the projected lane offset above, not longitudinal x progress.
  overlap_result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[],field={x:150,y:155,w:2260.8,h:1220};
   for(const defendingTeam of [0,1])for(const profile of [{name:'closing',move:100,covered:true},{name:'retreating',move:-220,covered:false}]){
    g.init({home:0,away:1,mode:'quick',humans:0});
    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1,y=field.y+field.h/2;
    const receiverX=attackingTeam===0?field.x+field.w*.60:field.x+field.w*.42,ballX=receiverX-dir*180;
    const receiver=g.player(attackingTeam,3),primary=g.player(defendingTeam,2),support=g.player(defendingTeam,3);
    const keep=new Set([receiver,primary,support]);
    for(const q of g.players)if(!keep.has(q)&&!q.keeper){q.down=true;q.stun=1;q.z=0;}
    Object.assign(receiver,{x:receiverX,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
     moveVX:0,moveVY:0,slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
    Object.assign(primary,{x:ballX+dir*120,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
     moveVX:dir*profile.move,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
    Object.assign(support,{x:ballX+dir*140,y:y+8,down:false,stun:0,z:0,action:'idle',actionTimer:0,
     moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
    Object.assign(g.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,
     attacker:attackingTeam,lastTouchTeam:attackingTeam,x:ballX,y,z:8,vx:dir*600,vy:0,vz:40,age:.15,
     shot:null,strike:null,ordinaryShot:false});
    g.clock=.2;g.driveAI(support,.016);
    const supportTarget=support.aiTarget?{x:support.aiTarget.x,y:support.aiTarget.y}:null;
    g.driveAI(primary,.016);
    const primaryTarget=primary.aiTarget?{x:primary.aiTarget.x,y:primary.aiTarget.y}:null;
    const laneX=ballX+dir*140.4;
    rows.push({defendingTeam,name:profile.name,covered:profile.covered,supportTarget,primaryTarget,
     supportGap:supportTarget?Math.hypot(supportTarget.x-laneX,supportTarget.y-y):Infinity,
     primaryGap:primaryTarget?Math.hypot(primaryTarget.x-ballX,primaryTarget.y-y):Infinity,
     possession:g.ball.owner===null});
   }
   return {rows,teams:SupermagicFootball.teams.length,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert overlap_result['teams']>=223,(kind,overlap_result)
  assert overlap_result['buttons']==4,(kind,overlap_result)
  for row in overlap_result['rows']:
   assert row['primaryTarget'] is not None and row['primaryGap']<100,(kind,row)
   assert row['supportTarget'] is not None and row['possession'],(kind,row)
   if row['covered']:
    assert row['supportGap']>80,(kind,row)
   else:
    assert row['supportGap']<35,(kind,row)
  assert not errors,(kind,errors)
  print('PASS',kind,'cross-track turn reserve, aligned momentum, Defence/Agility reaction, primary pursuit, four actions and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
