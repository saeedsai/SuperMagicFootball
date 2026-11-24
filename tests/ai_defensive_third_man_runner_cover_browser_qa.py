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
   const game=SupermagicFootball.game,rows=[],arrivalRows=[],field={x:150,y:155,w:2260.8,h:1220};
   const bounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
   const active=(p,patch)=>Object.assign(p,{x:0,y:0,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,aiFirstTouchTarget:null},patch);
   for(const team of [0,1]){
    game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
    const ownGoalX=team===0?bounds.xMin:bounds.xMax,attackTeam=1-team,attackDir=attackTeam===0?1:-1,centerY=(bounds.yMin+bounds.yMax)/2;
    const carrier=game.player(attackTeam,3),runner=game.player(attackTeam,4),primary=game.player(team,3),support=game.player(team,4),third=game.player(team,5),alternate=game.player(team,2);
    for(const q of game.players)if(![carrier,runner,primary,support,third,alternate].includes(q)&&!q.keeper)Object.assign(q,{down:true,stun:1});
    const carrierX=ownGoalX-attackDir*390,runnerX=ownGoalX-attackDir*175,runnerY=centerY+24;
    active(carrier,{x:carrierX,y:centerY});active(runner,{x:runnerX,y:runnerY,moveVX:attackDir*80});
    active(primary,{x:carrierX+attackDir*70,y:centerY+65});active(support,{x:carrierX+attackDir*40,y:centerY-130});
    const targetX=runnerX+attackDir*(80*.12+34),targetY=runnerY+(centerY-runnerY)*.12;
    active(third,{x:targetX-attackDir*70,y:targetY+10});active(alternate,{down:true,x:targetX-attackDir*82,y:targetY+10});
    Object.assign(game.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,attacker:attackTeam,lastTouchTeam:attackTeam,age:0,shot:null,strike:null,ordinaryShot:false,hideBallTimer:0});
    game.clock=2;game.driveAI(third,.016);const target=third.aiTarget;
    if(!target||Math.abs(target.x-targetX)>1||Math.abs(target.y-targetY)>1)throw new Error('third defender missed runner mark on side '+team+': '+JSON.stringify({target,targetX,targetY}));
    if(game.ball.owner!==carrier)throw new Error('mark changed ball possession');
    rows.push({team,target,buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
    // A slightly farther teammate moving into the goal-side mark should beat
    // the nearer marker who is still moving away from it.
    active(third,{x:targetX-attackDir*70,y:targetY+10,moveVX:-attackDir*200,moveVY:0});
    active(alternate,{x:targetX-attackDir*82,y:targetY+10,moveVX:attackDir*200,moveVY:0});
    game.driveAI(alternate,.016);const arrivalTarget=alternate.aiTarget;
    if(!arrivalTarget||Math.abs(arrivalTarget.x-targetX)>1||Math.abs(arrivalTarget.y-targetY)>1)
     throw new Error('arrival-aware third defender missed mark on side '+team+': '+JSON.stringify({arrivalTarget,targetX,targetY}));
    arrivalRows.push({team,target:arrivalTarget,selected:alternate.i,buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
   }
   return {rows,arrivalRows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  assert len(result['rows'])==2,(kind,result)
  assert len(result['arrivalRows'])==2,(kind,result)
  assert all(row['selected']==2 for row in result['arrivalRows']),(kind,result)
  assert all(row['buttons']==4 for row in result['rows']),(kind,result)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored third-defender runner mark and arrival-aware support, possession, four actions and no JS errors',flush=True)
  ctx.close()
 browser.close()
