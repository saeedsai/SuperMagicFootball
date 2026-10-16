#!/usr/bin/env python3
"""GK-LUNGE-FAIRNESS: test actual AI + lunge (never replace driveAI with a stub).
24 mirrored keeper/fatigue/FPS scenarios over desktop and simulated touch.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]
run=r"""() => {
 const g=SupermagicFootball.game;
 const F=SupermagicFootball.world?.field||{x:150,w:2260.8};
 const rows=[];
 for(const fps of [30,60,120])for(const side of [0,1])for(const fatigue of [0,.9]){
  g.init({home:0,away:0,humans:0,mode:'quick',
    options:{...g.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
  g.matchState='paused';g.cooldown=0;g.wind={x:0,y:0};
  const k=g.player(side,0),ball=g.ball,toward=side===0?-1:1;
  k.x=side===0?F.x+105:F.x+F.w-105;k.y=765;k.z=0;k.vz=0;
  k.stun=0;k.diveCooldown=0;k.diveIntentCooldown=0;k.fatigue=fatigue;
  k.src={...k.src,gkDiving:88,gkSkill:82};
  // Force a stale AI target and inertia: the old implementation stacked the
  // target tracking with diveAdvanceTravel and exceeded the 28-unit cap.
  k.aiTarget={x:k.x,y:1150};k.aiTimer=10;
  k.moveVX=130;k.moveVY=240;
  for(const p of g.players.filter(p=>!p.keeper)){p.x=F.x+F.w*.5;p.y=220;p.stun=0;}
  Object.assign(ball,{owner:null,attacker:1-side,x:k.x-toward*225,y:865,z:15,
    vx:toward*950,vy:0,vz:0,shot:null,strike:null,ordinaryShot:true,
    power:30,age:.1,canCollect:1.4,trail:[],pass:false});
  const preBall=JSON.stringify({x:ball.x,y:ball.y,vx:ball.vx,vy:ball.vy,owner:ball.owner});
  const firstEvent=g.events.length,initialX=k.x,initialY=k.y;
  const started=g.tryKeeperDiveIntent(k);
  const count=Math.round(fps*.30);
  let maxY=initialY;
  for(let step=0;step<count;step++){
   g.updatePlayers(1/fps);maxY=Math.max(maxY,k.y);
  }
  const limit=Math.min(28,(9+88*.22)*(1-fatigue*.55));
  const traveled=k.y-initialY;
  const actual=k.diveAdvanceTravel||0;
  const earlyContacts=g.events.slice(firstEvent).filter(e=>e.type==='keeperContact'||e.type==='save').length;
  const noBallMutation=preBall===JSON.stringify({x:ball.x,y:ball.y,vx:ball.vx,vy:ball.vy,owner:ball.owner});
  // A diver must NOT continue chasing an outgoing shot during the remaining
  // active dive window, but normal AI mobility should resume afterward.
  const yBeforeAway=k.y;ball.vx=-toward*950;g.updatePlayers(1/fps);
  const noFollowup=k.y===yBeforeAway;
  k.diveIntentPending=false;k.action='idle';k.actionTimer=0;
  k.aiTarget={x:k.x,y:k.y+340};k.aiTimer=10;g.updatePlayers(1/fps);
  const regainedControl=k.y>yBeforeAway;
  rows.push({fps,side,fatigue,started,traveled,actual,limit,maxY,
    xStable:k.x===initialX,noBallMutation,earlyContacts,noFollowup,regainedControl});
 }
 return {rows,teams:SupermagicFootball.teams.length};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
    args=['--no-sandbox','--disable-dev-shm-usage'])
 for device in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if device=='desktop'
      else {'width':844,'height':390},is_mobile=device!='desktop',has_touch=device!='desktop')
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(html)
  page.evaluate("""() => {const x=new Map();Object.defineProperty(window,'localStorage',{
     configurable:true,value:{getItem:k=>x.get(k)||null,setItem:(k,v)=>x.set(k,String(v)),
     removeItem:k=>x.delete(k),clear:()=>x.clear()}})}""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  results=page.evaluate(run)
  assert not errors,(device,errors)
  rows=results['rows']
  assert len(rows)==12,(device,rows)
  for row in rows:
   assert row['started'] and row['traveled']>0,(device,row)
   assert abs(row['traveled']-row['actual'])<.002,(device,'double counted motion',row)
   assert row['traveled']<=row['limit']+.002,(device,'keeper traveled beyond cap',row)
   assert row['xStable'] and row['noBallMutation'] and row['earlyContacts']==0,(device,row)
   assert row['noFollowup'] and row['regainedControl'],(device,row)
  for fps in (30,60,120):
   for side in (0,1):
    fresh=next(row for row in rows if row['fps']==fps and row['side']==side and row['fatigue']==0)
    tired=next(row for row in rows if row['fps']==fps and row['side']==side and row['fatigue']==.9)
    assert fresh['traveled']>tired['traveled'],(device,fresh,tired)
  for fps in (30,60,120):
   for fatigue in (0,.9):
    left=next(row for row in rows if row['fps']==fps and row['side']==0 and row['fatigue']==fatigue)
    right=next(row for row in rows if row['fps']==fps and row['side']==1 and row['fatigue']==fatigue)
    assert abs(left['traveled']-right['traveled'])<.002,(device,'side bias',left,right)
  print('PASS',device,'12 real-AI goalkeeper cases, no stacked movement, capped fatigue/mirror fairness',flush=True)
  ctx.close()
 browser.close()
