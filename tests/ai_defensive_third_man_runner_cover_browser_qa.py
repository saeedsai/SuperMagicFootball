#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for third-defender runner marking."""
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
  page.evaluate("""() => {const values=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key),clear:()=>values.clear()}})}""")
  page.add_script_tag(content=js,type='module');page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const game=SupermagicFootball.game,rows=[],arrivalRows=[],coverageRows=[],field={x:150,y:155,w:2260.8,h:1220};
   const bounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
   const active=(p,patch)=>Object.assign(p,{x:0,y:0,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,aiFirstTouchTarget:null},patch);
   for(const team of [0,1]){
    game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
    const ownGoalX=team===0?bounds.xMin:bounds.xMax,attackTeam=1-team,attackDir=attackTeam===0?1:-1,centerY=(bounds.yMin+bounds.yMax)/2;
    const carrier=game.player(attackTeam,3),runner=game.player(attackTeam,4),runner2=game.player(attackTeam,5),primary=game.player(team,3),support=game.player(team,4),third=game.player(team,5),alternate=game.player(team,2),secondDefender=game.player(team,1);
    for(const q of game.players)if(![carrier,runner,primary,support,third,alternate].includes(q)&&!q.keeper)Object.assign(q,{down:true,stun:1});
    const carrierX=ownGoalX-attackDir*390,runnerX=ownGoalX-attackDir*175,runnerY=centerY+24;
    active(carrier,{x:carrierX,y:centerY});active(runner,{x:runnerX,y:runnerY,moveVX:attackDir*80});
    active(primary,{x:carrierX+attackDir*70,y:centerY+65});active(support,{x:carrierX+attackDir*40,y:centerY-130});
    const targetX=runnerX+attackDir*(80*.12+34),targetY=runnerY+(centerY-runnerY)*.12;
    active(third,{x:targetX-attackDir*70,y:targetY+10});active(alternate,{down:true,x:targetX-attackDir*82,y:targetY+10});
    const runner2X=ownGoalX-attackDir*190,runner2Y=centerY-105;
    active(runner2,{x:runner2X,y:runner2Y,moveVX:attackDir*50,moveVY:0});
    const target2X=runner2X+attackDir*40,target2Y=runner2Y+12.6;
    active(secondDefender,{x:target2X-attackDir*75,y:target2Y+8,moveVX:attackDir*35,moveVY:0});
    Object.assign(game.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,attacker:attackTeam,lastTouchTeam:attackTeam,age:0,shot:null,strike:null,ordinaryShot:false,hideBallTimer:0});
    game.clock=2;game.driveAI(third,.016);const target=third.aiTarget;
    if(!target||Math.abs(target.x-targetX)>1||Math.abs(target.y-targetY)>1)throw new Error('third defender missed first runner mark on side '+team+': '+JSON.stringify({target,targetX,targetY}));
    game.driveAI(secondDefender,.016);const secondTarget=secondDefender.aiTarget;
    if(!secondTarget||Math.abs(secondTarget.x-target2X)>1||Math.abs(secondTarget.y-target2Y)>1)
     throw new Error('second defender missed distinct runner mark on side '+team+': '+JSON.stringify({secondTarget,target2X,target2Y}));
    if(game.ball.owner!==carrier)throw new Error('mark changed ball possession');
    rows.push({team,target,secondTarget,secondDefender:secondDefender.i,target2X,target2Y,buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
    // Rebuild this arrival case in a fresh match: prior driveAI calls must not
    // carry movement, tactical targets or transient match state into the tie-break.
    game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
    const arrivalCarrier=game.player(attackTeam,3),arrivalRunner=game.player(attackTeam,4);
    const arrivalPrimary=game.player(team,3),arrivalSupport=game.player(team,4);
    const arrivalAlternate=game.player(team,2);
    for(const q of game.players)
     if(![arrivalCarrier,arrivalRunner,arrivalPrimary,arrivalSupport,arrivalAlternate].includes(q)&&!q.keeper)
      Object.assign(q,{down:true,stun:1});
    const arrivalCarrierX=ownGoalX-attackDir*390,arrivalRunnerX=ownGoalX-attackDir*175,arrivalRunnerY=centerY+24;
    active(arrivalCarrier,{x:arrivalCarrierX,y:centerY});
    active(arrivalRunner,{x:arrivalRunnerX,y:arrivalRunnerY,moveVX:attackDir*80});
    const arrivalTargetX=arrivalRunnerX+attackDir*(80*.12+34);
    const arrivalTargetY=arrivalRunnerY+(centerY-arrivalRunnerY)*.12;
    active(arrivalPrimary,{x:arrivalCarrierX+attackDir*42,y:centerY+22});
    active(arrivalSupport,{x:arrivalCarrierX+attackDir*58,y:centerY-42});
    active(arrivalAlternate,{x:arrivalTargetX-attackDir*82,y:arrivalTargetY+10,moveVX:attackDir*200,moveVY:0});
    Object.assign(game.ball,{owner:arrivalCarrier,x:arrivalCarrier.x,y:arrivalCarrier.y,z:0,vx:0,vy:0,vz:0,
     pass:false,passTarget:null,attacker:attackTeam,lastTouchTeam:attackTeam,age:0,shot:null,strike:null,
     ordinaryShot:false,hideBallTimer:0});
    game.clock=2;game.driveAI(arrivalAlternate,.016);const arrivalTarget=arrivalAlternate.aiTarget;
    if(!arrivalTarget||Math.abs(arrivalTarget.x-arrivalTargetX)>1||Math.abs(arrivalTarget.y-arrivalTargetY)>1)
     throw new Error('available third defender missed actual-engine mark on side '+team+': '+JSON.stringify({arrivalTarget,arrivalTargetX,arrivalTargetY}));
    arrivalRows.push({team,target:arrivalTarget,selected:arrivalAlternate.i,buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
   }
   for(const team of [0,1]){
    for(const direction of ['away','closing']){
     game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
     const ownGoalX=team===0?bounds.xMin:bounds.xMax,attackTeam=1-team,attackDir=attackTeam===0?1:-1,centerY=(bounds.yMin+bounds.yMax)/2;
     const carrier=game.player(attackTeam,3),runner=game.player(attackTeam,4),primary=game.player(team,3),support=game.player(team,4),third=game.player(team,5),alternate=game.player(team,2);
     for(const q of game.players)if(![carrier,runner,primary,support,third,alternate].includes(q)&&!q.keeper)Object.assign(q,{down:true,stun:1});
     const carrierX=ownGoalX-attackDir*390,runnerX=ownGoalX-attackDir*175,runnerY=centerY+24;
     active(carrier,{x:carrierX,y:centerY});active(runner,{x:runnerX,y:runnerY,moveVX:attackDir*80});
     active(primary,{x:carrierX+attackDir*70,y:centerY+65});
     active(support,{x:runnerX+attackDir*40,y:runnerY+76,moveVY:direction==='away'?200:-200});
     const targetX=runnerX+attackDir*43.6,targetY=runnerY+(centerY-runnerY)*.12;
     active(third,{x:ownGoalX-attackDir*26,y:targetY+174});active(alternate,{down:true,x:targetX-attackDir*82,y:targetY+10});
     Object.assign(game.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,attacker:attackTeam,lastTouchTeam:attackTeam,age:0,shot:null,strike:null,ordinaryShot:false,hideBallTimer:0});
     game.clock=2;game.driveAI(third,.016);
     const marked=!!third.aiTarget&&Math.abs(third.aiTarget.x-targetX)<1&&Math.abs(third.aiTarget.y-targetY)<1;
     if(direction==='away'&&!marked)throw new Error('moving-away support incorrectly retained central runner mark: '+JSON.stringify({team,direction,target:third.aiTarget,targetX,targetY}));
     if(direction==='closing'&&marked)throw new Error('closing support was incorrectly treated as uncovered: '+JSON.stringify({team,direction,target:third.aiTarget,targetX,targetY}));
     coverageRows.push({team,direction,marked,target:third.aiTarget,buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
    }
   }
   return {rows,arrivalRows,coverageRows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  assert len(result['rows'])==2,(kind,result)
  assert len(result['arrivalRows'])==2,(kind,result)
  assert len(result['coverageRows'])==4,(kind,result)
  assert all(row['marked'] for row in result['coverageRows'] if row['direction']=='away'),(kind,result)
  assert not any(row['marked'] for row in result['coverageRows'] if row['direction']=='closing'),(kind,result)
  assert all(row['secondDefender']==1 for row in result['rows']),(kind,result)
  assert all(abs(row['secondTarget']['x']-row['target2X'])<=1 and abs(row['secondTarget']['y']-row['target2Y'])<=1 for row in result['rows']),(kind,result)
  assert all(row['selected']==2 for row in result['arrivalRows']),(kind,result)
  assert all(row['buttons']==4 for row in result['rows']),(kind,result)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored dual-runner marking, projected coverage handoff, possession, four actions and no JS errors',flush=True)
  ctx.close()
 browser.close()
