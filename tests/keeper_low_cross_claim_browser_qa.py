#!/usr/bin/env python3
"""Desktop and simulated-touch acceptance for CPU low-ground-cross claims."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current modular browser fixture first'
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
   const g=SupermagicFootball.game,field={x:150,y:155,w:2260.8,h:1220};
   const bounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
   const rows=[];
   for(const team of [0,1]){
    const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax,goalY=765;
    const target={x:ownGoalX+dir*56,y:goalY+42};
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const keeper=g.player(team,0),receiver=g.player(1-team,3);
    for(const q of g.players)if(q!==keeper&&q!==receiver&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(keeper,{x:ownGoalX+dir*30,y:goalY,z:0,stun:0,down:false,action:'idle',
     actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0,
     aiKeeperClaimTargetActive:false,aiParryReboundTarget:false,keeperHold:0});
    Object.assign(receiver,{x:target.x+dir*150,y:target.y+8,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
     passTarget:receiver.src.id,x:ownGoalX+dir*200,y:target.y-45*.45,z:0,
     vx:-dir*320,vy:45,vz:0,age:.18,canCollect:0,shot:null,strike:null,ordinaryShot:false});
    g.clock=.2;g.driveAI(keeper,.016);
    const claim=keeper.aiTarget?{x:keeper.aiTarget.x,y:keeper.aiTarget.y}:null;
    const claimMoveVX=keeper.moveVX||0,claimActive=keeper.aiKeeperClaimTargetActive===true;
    if(claim){keeper.x=claim.x;keeper.y=claim.y;}
    Object.assign(keeper,{moveVX:0,moveVY:0,aiTimer:.5,cd:10,keeperHold:0});
    Object.assign(g.ball,{owner:keeper,pass:false,passTarget:null,attacker:team,lastTouchTeam:team,
     z:0,vx:0,vy:0,vz:0,shot:null,strike:null,ordinaryShot:false});
    g.driveAI(keeper,.016);
    const homeX=team===0?field.x+34:field.x+field.w-34;
    rows.push({team,dir,target,claim,claimMoveVX,claimActive,
     returnActive:keeper.aiKeeperClaimTargetActive===true,
     returnTarget:keeper.aiTarget?{x:keeper.aiTarget.x,y:keeper.aiTarget.y}:null,
     returnMoveVX:keeper.moveVX||0,homeX});
   }
   return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
    teams:SupermagicFootball.teams.length};
  }''')
  assert result['buttons']==4,(label,result)
  assert result['teams']>=223,(label,result)
  for row in result['rows']:
   assert row['claim'] is not None,(label,row)
   assert abs(row['claim']['x']-row['target']['x'])<1 and abs(row['claim']['y']-row['target']['y'])<1,(label,row)
   assert row['dir']*row['claimMoveVX']>0 and row['claimActive'] is True,(label,row)
   assert row['returnActive'] is False,(label,row)
   assert row['returnTarget'] and abs(row['returnTarget']['x']-row['homeX'])<1,(label,row)
   assert row['dir']*row['returnMoveVX']<0,(label,row)
  assert not errors,(label,errors)
  print('KEEPER_LOW_CROSS_CLAIM_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
