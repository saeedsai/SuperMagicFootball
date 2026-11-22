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
    keeper.x=claim.x;keeper.y=claim.y;keeper.moveVX=0;keeper.moveVY=0;
    keeper.aiTimer=.5;keeper.cd=10;keeper.keeperHold=0;
    Object.assign(g.ball,{owner:keeper,pass:false,passTarget:null,attacker:team,lastTouchTeam:team,
     z:82,vx:0,vy:0,vz:0,shot:null,strike:null,ordinaryShot:false});
    g.driveAI(keeper,.016);
    const homeX=team===0?field.x+34:field.x+field.w-34;
    rows.push({team,dir,target,aiTarget:claim,moveVX:keeper.moveVX||0,
     claimActive,returnActive:keeper.aiKeeperClaimTargetActive===true,
     returnTarget:keeper.aiTarget?{x:keeper.aiTarget.x,y:keeper.aiTarget.y}:null,
     returnMoveVX:keeper.moveVX||0,homeX,
     buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
   }
   return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
    teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  for row in result['rows']:
   target=row['aiTarget']
   assert target is not None,(kind,row)
   assert abs(target['x']-row['target']['x'])<2 and abs(target['y']-row['target']['y'])<2,(kind,row)
   assert row['dir']*row['moveVX']>0,(kind,row)
   assert row['claimActive'] is True,(kind,row)
   assert row['returnActive'] is False,(kind,row)
   assert row['returnTarget'] and abs(row['returnTarget']['x']-row['homeX'])<2,(kind,row)
   assert row['dir']*row['returnMoveVX']<0,(kind,row)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored goalkeeper high-cross claim and immediate post-catch return, four actions and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
