#!/usr/bin/env python3
"""Continuous-play endline rebounds and goals, live engine on desktop/touch Chromium."""
from pathlib import Path
import json,os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build modular fixture first'
source=fixture.read_text(encoding='utf8')
html=source.split('<script type="module">',1)[0]+'</body></html>'
js=source.split('<script type="module">',1)[1].split('</script>',1)[0]
field=json.loads((ROOT/'data/mechanics/gameplay.json').read_text(encoding='utf8'))['world']['field']
CHECK="""({F}) => {
 const g=SupermagicFootball.game,out=[];
 function setup(){g.init({home:0,away:9,humans:1,mode:'quick',options:{...g.options,weather:'Clear'}});g.cooldown=0;g.events=[];g.kickoffCountdown=0;}
 function launch(x,y,z=0,vx=280){
  const b=g.ball;Object.assign(b,{owner:null,x,y,z,vx,vy:0,vz:0,age:.2,lastTouchTeam:0,attacker:-1,shot:null,strike:null,ordinaryShot:false,canCollect:1,trail:[],pass:false});
  g.updateBall(1/60);
  return {x:b.x,vx:b.vx,owner:b.owner,score:g.score.slice(),events:g.events.map(e=>e.type)};
 }
 setup();out.push({type:'right',...launch(F.x+F.w-4,F.y+8,0,280)});
 setup();out.push({type:'left',...launch(F.x+4,F.y+F.h-8,0,-280)});
 setup();out.push({type:'miss',...launch(F.x+F.w-4,F.y+F.h*.5,140,280)});
 setup();const b=g.ball;Object.assign(b,{owner:null,x:F.x+F.w-4,y:(WORLD.goalTop+WORLD.goalBottom)/2,z:20,vx:280,vy:0,vz:0,age:.2,lastTouchTeam:0,attacker:0,shot:null,strike:null,canCollect:1,trail:[]});g.updateBall(1/60);out.push({type:'goal',score:g.score.slice(),events:g.events.map(e=>e.type)});
 return out;
}"""
# WORLD is part of the production game fixture; use source-backed goal coordinates.
world=json.loads((ROOT/'data/mechanics/gameplay.json').read_text(encoding='utf8'))['world']
CHECK=CHECK.replace("WORLD.goalTop","GOAL_TOP").replace("WORLD.goalBottom","GOAL_BOTTOM").replace("GOAL_TOP",str(world['goalTop'])).replace("GOAL_BOTTOM",str(world['goalBottom']))
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,**({'executable_path':os.environ['SMF_CHROMIUM_PATH']} if os.environ.get('SMF_CHROMIUM_PATH') else {}))
 for label,touch in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':844,'height':390} if touch else {'width':1280,'height':720},has_touch=touch,is_mobile=touch)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html);page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
  rows=page.evaluate(CHECK,{'F':field});right,left,miss,goal=rows
  for case in rows:
   assert not any(e in case['events'] for e in ['cornerRestart','goalKickRestart','freeKickRestart','foul','toast']),(label,case)
  assert right['vx']<0 and left['vx']>0 and miss['vx']<0,(label,rows)
  assert goal['score']==[1,0] and 'goal' in goal['events'],(label,rows)
  assert not errors,(label,errors)
  print('CONTINUOUS_ENDLINE_PASS',label,flush=True)
  context.close()
 browser.close()
