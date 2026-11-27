#!/usr/bin/env python3
"""Actual GameEngine directional Dribble feint QA on desktop and simulated touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
CHECK=r"""()=>{
 const g=SupermagicFootball.game;
 if(!g)throw Error('GameEngine unavailable');
 const run=(team,inputY,byAI=false)=>{
  g.init({home:0,away:1,mode:'quick',humans:byAI?0:1});
  const p=g.player(team,3),r=g.player(1-team,3);
  for(const q of g.players)if(q!==p&&q!==r){q.down=true;q.stun=1;}
  p.src={...p.src,dribbleType:'rainbow',dribbling:96,agility:96};
  Object.assign(p,{x:1000,y:700,z:0,face:team===0?1:-1,dx:0,dy:inputY,
   down:false,stun:0,cd:0,trickCd:0,dribbleCooldown:0,fatigue:0,breath:100});
  Object.assign(r,{x:1000,y:780,z:0,down:false,stun:0,invuln:0,cd:0,
   action:'idle',actionTimer:0,moveVX:0,moveVY:0,vx:0,vy:0});
  g.ball.owner=p;g.ball.x=p.x;g.ball.y=p.y;g.ball.z=0;
  const old=Math.random;Math.random=()=>0;
  let ok=false;try{ok=g.tryDribbleTrick(p,byAI);}finally{Math.random=old;}
  return {ok,dx:p.x-1000,dy:p.y-700,events:g.events.filter(e=>e.type==='dribbleTrick').length};
 };
 const rows=[];
 for(const team of [0,1])rows.push({team,down:run(team,1),up:run(team,-1),neutral:run(team,0),cpu:run(team,1,true)});
 return {rows,buttons:document.querySelectorAll('#touchButtons [data-act]').length,
  teams:SupermagicFootball.teams.filter(t=>!['concept_demo','crown_royals_reference'].includes(t.group)).length};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
  args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,mobile in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':1280,'height':720} if not mobile else {'width':844,'height':390},
   is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(HTML.read_text(encoding='utf-8'),wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate(CHECK)
  assert result['buttons']==4,(name,result)
  assert result['teams']==223,(name,result)
  for row in result['rows']:
   assert row['down']['ok'] and row['down']['dy']>0,(name,row)
   assert row['up']['ok'] and row['up']['dy']<0,(name,row)
   assert row['neutral']['ok'] and row['neutral']['dy']<0,(name,row)
   assert row['cpu']['ok'] and row['cpu']['dy']<0,(name,row)
  assert not errors,(name,errors)
  print('DIRECTIONAL_DRIBBLE_FEINT_PASS',name,flush=True)
  context.close()
 browser.close()
