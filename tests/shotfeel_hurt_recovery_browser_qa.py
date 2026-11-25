#!/usr/bin/env python3
"""Actual-engine desktop and simulated-touch acceptance for hurt-recovery pass reads."""
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
   const g=SupermagicFootball.game,rows=[];
   function run(team,mode){
    const dir=team===0?1:-1;g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const carrier=g.player(team,3),direct=g.player(team,4),angled=g.player(team,5),defender=g.player(1-team,3),cx=1380,cy=765;
    for(const p of g.players)Object.assign(p,{down:true,stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,vx:0,vy:0});
    Object.assign(carrier,{x:cx,y:cy,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,cd:0,aiTimer:0});
    Object.assign(direct,{x:cx+dir*200,y:cy,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:dir*140,moveVY:0,vx:0,vy:0,dx:dir,dy:0,face:dir});
    Object.assign(angled,{x:cx+dir*200,y:cy+60,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,vx:0,vy:0,dx:dir,dy:0,face:dir});
    Object.assign(defender,{x:cx+dir*220,y:cy,down:false,stun:0,z:0,action:mode==='hurtRecover'?'hurt':'idle',actionTimer:mode==='hurtRecover'?.35:0,slideTimer:0,shotImpactKnockdownPending:mode==='impactPending'?.35:0,shotImpactKnockdownTimer:mode==='impactKnockdown'?.35:0,shotImpactRiseTimer:mode==='impactRise'?.35:0,moveVX:0,moveVY:0,vx:0,vy:0});
    g.take(carrier);g.matchState='play';g.clock=10;
    const kicked=g.performTeamPass(carrier,false,false,{x:dir,y:0},0);
    return {team,mode,kicked,pass:g.ball.pass===true,target:g.ball.passTarget,directId:direct.src.id,angledId:angled.src.id};
   }
   for(const team of [0,1])for(const mode of ['hurtRecover','hurtFinished','impactPending','impactKnockdown','impactRise','impactFinished'])rows.push(run(team,mode));
   return {rows,teams:SupermagicFootball.teams.length,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert result['teams']>=223,(kind,result);assert result['buttons']==4,(kind,result)
  for row in result['rows']:
   expected=row['directId'] if (row['mode']=='hurtRecover' or row['mode'] in ['impactPending','impactKnockdown','impactRise']) else row['angledId']
   assert row['kicked'] and row['pass'] and row['target']==expected,(kind,row,expected)
  assert not errors,(kind,errors)
  print('PASS',kind,'directed PASS ignores active hurt recovery and restores defender after recovery',flush=True)
  ctx.close()
 browser.close()
