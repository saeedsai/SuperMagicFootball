#!/usr/bin/env python3
"""Exercise endline restarts in the actual modular game on desktop and touch."""
from pathlib import Path
import os
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build modular fixture first with python -X utf8 scripts/build.py'
field=json.loads((ROOT/'data/mechanics/gameplay.json').read_text(encoding='utf-8'))['world']['field']
html_src=fixture.read_text(encoding='utf-8')
html=html_src.split('<script type="module">',1)[0]+'</body></html>'
js=html_src.split('<script type="module">',1)[1].split('</script>',1)[0]
CHECK=r"""() => {
 const g=SupermagicFootball.game,results=[];
 function setup(){
  g.init({home:0,away:9,humans:1,mode:'quick',options:{...g.options,weather:'Clear'}});
  g.cooldown=0;g.matchState='play';g.events=[];
 }
 function out({x,y,z=0,lastTouchTeam,shot=null,attacker=-1}){
  const b=g.ball;Object.assign(b,{owner:null,x,y,z,vx:0,vy:0,vz:0,age:.2,lastTouchTeam,
   attacker,shot,strike:null,ordinaryShot:false,canCollect:1,trail:[],pass:false});
  g.updateBall(1/60);return b;
 }
 const F=FIELD_JSON;
 setup();
 let b=out({x:F.x+F.w-4,y:F.y+8,lastTouchTeam:1});
 const taker=g.rosters[0][g.teamPlans[0].corner];
 const first=g.events.find(e=>e.type==='cornerRestart');
 results.push({case:'right-top-corner',event:first?.type,team:first?.team,side:first?.side,
  owner:b.owner?.src?.id,configured:taker?.id,inside:b.x>F.x&&b.x<F.x+F.w&&b.y>F.y,
  controlled:g.controlled[0]===b.owner?.i,canPass:g.pass(b.owner,false,false,{human:true}),passReleased:g.ball.pass===true&&g.ball.owner===null});
 setup();b=out({x:F.x+4,y:F.y+F.h-8,lastTouchTeam:0});
 const mirrored=g.events.find(e=>e.type==='cornerRestart');
 results.push({case:'left-bottom-corner',event:mirrored?.type,team:mirrored?.team,side:mirrored?.side,
  inside:b.x>F.x&&b.x<F.x+F.w&&b.y<F.y+F.h});
 setup();b=out({x:F.x+F.w-4,y:F.y+F.h*.5,z:140,lastTouchTeam:0});
 const goalKick=g.events.find(e=>e.type==='goalKickRestart');
 results.push({case:'goal-kick',event:goalKick?.type,team:goalKick?.team,keeper:b.owner?.keeper});
 setup();b=out({x:F.x+F.w-4,y:F.y+F.h*.5,z:20,lastTouchTeam:0,attacker:0});
 results.push({case:'goal',score:g.score[0],restart:g.events.some(e=>/Restart/.test(e.type))});
 setup();b=out({x:F.x+F.w-4,y:F.y+8,lastTouchTeam:1,shot:{behavior:'ricochet',ricochetBounces:0},attacker:-1});
 results.push({case:'ricochet',restart:g.events.some(e=>/Restart/.test(e.type)),banks:b.shot?.ricochetBounces});
 return {results,controls:4};
}"""
CHECK=CHECK.replace('FIELD_JSON',json.dumps(field,separators=(',',':')))

with sync_playwright() as pw:
 browser_path=os.environ.get('SMF_CHROMIUM_PATH')
 browser=pw.chromium.launch(headless=True,**({'executable_path':browser_path} if browser_path else {}))
 for label,mobile in [('desktop',False),('simulated-touch',True)]:
  ctx=browser.new_context(viewport={'width':1280,'height':720} if not mobile else {'width':844,'height':390},
                          is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html)
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
  result=page.evaluate(CHECK)
  assert result['controls']==4
  assert len(result['results'])==5,result
  right,left,kick,goal,ricochet=result['results']
  assert (right['event'],right['team'],right['side'])==('cornerRestart',0,'top'),right
  assert right['owner']==right['configured'] and right['inside'] and right['controlled'],right
  assert right['canPass'] and right['passReleased'],right
  assert (left['event'],left['team'],left['side'])==('cornerRestart',1,'bottom') and left['inside'],left
  assert (kick['event'],kick['team'],kick['keeper'])==('goalKickRestart',1,True),kick
  assert goal['score']==1 and not goal['restart'],goal
  assert ricochet['restart'] is False and ricochet['banks']==1,ricochet
  assert not errors,(label,errors)
  print('PASS',label,result,flush=True)
  ctx.close()
 browser.close()
