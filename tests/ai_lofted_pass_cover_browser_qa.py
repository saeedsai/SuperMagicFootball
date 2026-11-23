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
   const g=SupermagicFootball.game,rows=[];
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
    const supportZ=support.z,supportAction=support.action;
    g.driveAI(primary,.016);const primaryTarget=primary.aiTarget?{x:primary.aiTarget.x,y:primary.aiTarget.y}:null;
    rows.push({attackingTeam,dir,x,y,targetX,supportTarget,supportZ,supportAction,primaryTarget,ball:{x:g.ball.x,y:g.ball.y}});
   }
   return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  for row in result['rows']:
   cover=row['supportTarget'];primary=row['primaryTarget'];ball=row['ball']
   assert cover is not None and primary is not None,(kind,row)
   assert abs(cover['x']-row['targetX'])<2 and abs(cover['y']-row['y'])<2,(kind,row)
   assert row['supportAction']=='jump' and row['supportZ']>10,(kind,row)
   assert abs(primary['x']-ball['x'])<80 and abs(primary['y']-ball['y'])<80,(kind,row)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored lofted-pass cover, primary pursuit, four actions and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
