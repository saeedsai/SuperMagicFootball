#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for first-touch outlet defensive cover."""
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
  page.set_content(html);page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module');page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {const g=SupermagicFootball.game,rows=[],field={x:0,y:0,w:2260.8,h:1530};for(const defendingTeam of [0,1]){const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;g.init({home:0,away:1,mode:'quick',humans:0});const carrier=g.player(attackingTeam,3),runner=g.player(attackingTeam,4),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4),passer=g.player(defendingTeam,2),intended=g.player(defendingTeam,5),x=field.x+field.w*.52,y=field.y+field.h*.5,keep=new Set([carrier,runner,primary,support,passer,intended]);for(const q of g.players)if(!keep.has(q)&&!q.keeper){q.down=true;q.stun=0;q.z=0;}Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null});Object.assign(runner,{x:x+dir*300,y:y+160,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:dir*220,moveVY:-140,aiTimer:0,aiTarget:null});Object.assign(primary,{x:x+dir*55,y:y-78,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});Object.assign(support,{x:x-dir*150,y:y+20,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});Object.assign(passer,{x:x-dir*300,y:y-300,down:true,stun:0,z:0});Object.assign(intended,{x:x-dir*200,y:y+300,down:true,stun:0,z:0});Object.assign(g.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:defendingTeam,passTarget:intended.src.id,attacker:defendingTeam,lastTouchTeam:defendingTeam,x,y,z:8,vx:-dir*600,vy:0,vz:0,age:.18,canCollect:0,shot:null,strike:null,ordinaryShot:false});g.clock=10;g.take(carrier);const readTimer=carrier.firstTouchOutletReadTimer,pressure=carrier.firstTouchPressure;carrier.firstTouchControlTimer=0;g.driveAI(support,.016);g.driveAI(primary,.016);const dx=runner.x-carrier.x,dy=runner.y-carrier.y,range2=dx*dx+dy*dy,target=support.aiTarget||null,progress=target?((target.x-carrier.x)*dx+(target.y-carrier.y)*dy)/range2:-1,lead=Math.max(.12,Math.min(.35,Math.hypot(dx,dy)/1400)),passX=runner.x+Math.max(-65,Math.min(65,runner.moveVX*lead)),passY=runner.y+Math.max(-65,Math.min(65,runner.moveVY*lead)),expected={x:carrier.x+(passX-carrier.x)*.56-dir*18,y:carrier.y+(passY-carrier.y)*.56};rows.push({defendingTeam,readTimer,pressure,target,expected,progress,primary:primary.aiTarget,carrier:{x:carrier.x,y:carrier.y},owner:g.ball.owner===carrier});}return {rows,teams:SupermagicFootball.teams.length};}""")
  assert result['teams']>=223,(kind,result)
  for row in result['rows']:
   assert row['readTimer']>0 and row['pressure']>.12,(kind,row)
   assert row['target'] is not None and .35<row['progress']<.8,(kind,row)
   assert abs(row['target']['x']-row['expected']['x'])<1 and abs(row['target']['y']-row['expected']['y'])<1,(kind,row)
   assert row['primary'] is not None,(kind,row)
   assert ((row['primary']['x']-row['carrier']['x'])**2+(row['primary']['y']-row['carrier']['y'])**2)**.5<80,(kind,row)
   assert row['owner'],(kind,row)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored visible-outlet cover, primary carrier pressure and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
