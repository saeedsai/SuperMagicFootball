#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for first-touch defensive contest."""
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
  result=page.evaluate("""() => {const g=SupermagicFootball.game,rows=[],field={x:0,y:0,w:2260.8,h:1530};for(const defendingTeam of [0,1]){const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;g.init({home:0,away:1,mode:'quick',humans:0});const carrier=g.player(attackingTeam,3),primary=g.player(defendingTeam,3),support=g.player(defendingTeam,4),x=field.x+field.w*.52,y=field.y+field.h*.5;for(const q of g.players){if(q===carrier||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=0;q.z=0;}Object.assign(carrier,{x,y,face:dir,down:false,stun:0,z:0,action:'receive',actionTimer:.2,moveVX:0,moveVY:0,firstTouchControlTimer:.24,firstTouchPressure:.9,aiFirstTouchTarget:{x:x+dir*88,y:y+(defendingTeam===0?64:-64),expires:1}});Object.assign(primary,{x:x-dir*40,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});Object.assign(support,{x:x-dir*155,y:y+20,down:false,stun:0,z:0,action:'idle',actionTimer:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});Object.assign(g.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false});g.clock=.1;const intent=carrier.aiFirstTouchTarget,dx=intent.x-carrier.x,dy=intent.y-carrier.y,len=Math.hypot(dx,dy),ahead=Math.max(42,Math.min(62,len*.66)),expected={x:carrier.x+dx/len*ahead,y:carrier.y+dy/len*ahead};g.driveAI(support,.016);g.driveAI(primary,.016);rows.push({defendingTeam,expected,support:support.aiTarget,primary:primary.aiTarget,carrier:{x:carrier.x,y:carrier.y}});}return {rows,teams:SupermagicFootball.teams.length};}""")
  assert result['teams']>=223,(kind,result)
  for row in result['rows']:
   assert row['support'] is not None and row['primary'] is not None,(kind,row)
   assert abs(row['support']['x']-row['expected']['x'])<2,(kind,row)
   assert abs(row['support']['y']-row['expected']['y'])<2,(kind,row)
   assert abs(row['primary']['x']-row['carrier']['x'])<4 and abs(row['primary']['y']-row['carrier']['y'])<4,(kind,row)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored first-touch contest, primary pressure and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
