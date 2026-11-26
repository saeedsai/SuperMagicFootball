#!/usr/bin/env python3
"""Verify CPU shot lanes account for a defender arriving during the existing shot flight."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current modular browser fixture first'
HTML=fixture.read_text(encoding='utf8')
SCRIPT=r"""() => {
 const g=window.SupermagicFootball?.game;
 if(!g||typeof g.shoot!=='function')throw Error('Live game engine unavailable');
 const F={x:150,w:2260.8};
 function fire(team,moving,human=false){
  g.init({home:0,away:9,humans:1,mode:'quick',difficulty:3});
  const shooter=g.player(team,4);
  const keeper=g.players.find(q=>q&&q.t!==team&&q.keeper);
  const defender=g.players.find(q=>q&&q.t!==team&&!q.keeper);
  if(!shooter||!keeper||!defender)throw Error('Missing shot-lane fixture players');
  const goalX=team===0?F.x+F.w:F.x;
  shooter.x=goalX+(team===0?-300:300);shooter.y=765;
  shooter.src={...shooter.src,shootAccuracy:100,shootPower:100,agility:80};
  Object.assign(shooter,{dx:team===0?1:-1,dy:0,moveVX:0,moveVY:0,z:0,keeper:false,
   stun:0,down:false,invuln:0,cd:0,fatigue:0,morale:100,action:'idle',actionTimer:0});
  keeper.x=goalX+(team===0?-40:40);keeper.y=765;
  Object.assign(keeper,{moveVX:0,moveVY:0,vx:0,vy:0,stun:0,down:false,z:0,
   fatigue:0,action:'idle',actionTimer:0});
  defender.x=(shooter.x+goalX)/2;defender.y=783;
  defender.src={...defender.src,agility:95};
  Object.assign(defender,{dx:0,dy:moving?-1:0,moveVX:0,moveVY:moving?-265:0,
   stun:0,down:false,invuln:0,z:0,action:'idle',actionTimer:0});
  for(const q of g.players)if(q.t!==team&&!q.keeper&&q!==defender)q.stun=10;
  g.inControl=human?()=>true:()=>false;
  g.clock=10;g.ball.owner=shooter;g.ball.x=shooter.x;g.ball.y=shooter.y;g.ball.z=0;
  g.ball.vx=0;g.ball.vy=0;g.ball.vz=0;g.ball.canCollect=0;
  const oldRandom=Math.random;Math.random=()=>.5;
  try{if(!g.shoot(shooter,false))throw Error('CPU shot was not released');}
  finally{Math.random=oldRandom;}
  return g.ball.targetY;
 }
 const results=[];
 for(const team of [0,1]){
  const stationary=fire(team,false,false);
  const arriving=fire(team,true,false);
  const humanAim=fire(team,true,true);
  if(Math.abs(stationary-632)>2)throw Error('Stationary blocker changed the established open top lane '+JSON.stringify({team,stationary}));
  if(Math.abs(arriving-898)>2)throw Error('CPU failed to avoid the arriving top-lane defender '+JSON.stringify({team,arriving}));
  if(Math.abs(humanAim-632)>2)throw Error('Human shot aim was changed by CPU-only lane projection '+JSON.stringify({team,humanAim}));
  results.push({team,stationary,arriving,humanAim});
 }
 const buttons=document.querySelectorAll('#touchButtons button[data-act]').length;
 if(buttons!==4)throw Error('Expected exactly four gameplay actions; got '+buttons);
 return {results,buttons};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate(SCRIPT)
  assert len(result['results'])==2 and result['buttons']==4,result
  assert not errors,(label,errors)
  print('AI_SHOT_LANE_ARRIVAL_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
