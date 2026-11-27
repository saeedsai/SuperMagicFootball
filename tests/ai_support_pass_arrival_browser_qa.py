#!/usr/bin/env python3
"""Desktop and simulated-touch real-engine acceptance for projected support-pass arrivals."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
   is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,
   value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[];
   for(const team of [0,1])for(const kind of ['moving-away','moving-into']){
    g.init({home:0,away:1,mode:'quick',humans:0});
    const dir=team===0?1:-1,carrier=g.players.find(p=>p.t===team&&p.i===3),
     runner=g.players.find(p=>p.t===team&&p.i===4),
     defender=g.players.find(p=>p.t===1-team&&!p.keeper),carrierX=team===0?600:1960;
    Object.assign(carrier,{x:carrierX,y:300,homeX:carrierX,homeY:300,down:false,stun:0,z:0,
     action:'idle',actionTimer:0,cd:0,aiTimer:0,aiTarget:null,comboActive:false,trickCd:10,
     firstTouchControlTimer:0,firstTouchPressure:0,firstTouchOutletUntil:0,
     moveVX:0,moveVY:0,face:dir,dx:dir,dy:0});
    Object.assign(runner,{x:carrierX+dir*170,y:188,homeX:carrierX+dir*160,homeY:188,
     down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
     moveVX:dir*300,moveVY:kind==='moving-away'?300:-300,
     aiAssistTarget:null,aiGiveAndGoRun:null,face:dir,dx:dir,dy:kind==='moving-away'?1:-1});
    for(const q of g.players){
     if(q===carrier||q===runner||q===defender)continue;
     Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    }
    Object.assign(defender,{x:runner.x+dir*44,y:138,down:false,stun:0,z:0,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    Object.assign(g.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,
     pass:false,passTeam:null,passTarget:null,attacker:team,lastTouchTeam:team,
     shot:null,strike:null,ordinaryShot:false,age:0,canCollect:0});
    g.matchState='play';g.clock=10;
    const originalRandom=Math.random;Math.random=()=>0;
    try{g.driveAI(carrier,1/60);}finally{Math.random=originalRandom;}
    const passEvent=g.events.filter(e=>e.mode==='supportRun'||e.mode==='ai').at(-1)||null;
    rows.push({team,kind,mode:passEvent?.mode||null,target:g.ball.passTarget,expected:runner.src.id});
   }
   return {rows,teams:SupermagicFootball.teams.length,
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert result['teams']>=223,(kind,result)
  assert result['buttons']==4,(kind,result)
  for row in result['rows']:
   if row['kind']=='moving-away':
    assert row['mode']=='supportRun' and row['target']==row['expected'],(kind,row)
   else:
    assert row['mode'] is None and row['target'] is None,(kind,row)
  lane_result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[],field={x:0,y:0,w:2260.8,h:1530};
   for(const team of [0,1])for(const agility of [1,100]){
    g.init({home:0,away:1,mode:'quick',humans:1});
    const dir=team===0?1:-1,carrier=g.player(team,3),near=g.player(team,4),
     open=g.player(team,5),defender=g.player(1-team,3),
     x=field.x+field.w*.5,y=field.y+field.h*.5,keep=new Set([carrier,near,open,defender]);
    for(const q of g.players)if(!keep.has(q))Object.assign(q,{down:true,stun:1,z:0,action:'idle',
     actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,
     dx:dir,dy:0,cd:0,firstTouchControlTimer:0});
    Object.assign(near,{x:x+dir*398,y:y+19,down:false,stun:0,z:0,action:'idle',actionTimer:0,
     moveVX:0,moveVY:0,dx:0,dy:0});
    Object.assign(open,{x:x+dir*422,y:y+77,down:false,stun:0,z:0,action:'idle',actionTimer:0,
     moveVX:0,moveVY:0,dx:0,dy:0});
    Object.assign(defender,{x:x+dir*170,y:y+20,down:false,stun:0,z:0,action:'idle',actionTimer:0,
     moveVX:0,moveVY:110,dx:-.1*dir,dy:-1});
    Object.assign(defender.src,{agility});
    Object.assign(g.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTeam:null,
     passTarget:null,attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false,age:0,canCollect:0});
    const originalRandom=Math.random;Math.random=()=>.5;
    let kicked=false;try{kicked=g.pass(carrier,false,false,{direction:{x:dir,y:0},human:true});}
    finally{Math.random=originalRandom;}
    rows.push({team,agility,kicked,target:g.ball.passTarget,near:near.src.id,open:open.src.id});
   }
   return {rows,teams:SupermagicFootball.teams.length,
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert lane_result['teams']>=223,(kind,lane_result)
  assert lane_result['buttons']==4,(kind,lane_result)
  for row in lane_result['rows']:
   assert row['kicked'],(kind,row)
   expected=row['open'] if row['agility']==100 else row['near']
   assert row['target']==expected,(kind,row,expected)

  turn_result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[],field={x:0,y:0,w:2260.8,h:1530};
   for(const team of [0,1])for(const agility of [1,100]){
    g.init({home:0,away:1,mode:'quick',humans:0});
    const dir=team===0?1:-1,carrier=g.player(team,3),runner=g.player(team,4);
    const carrierX=team===0?field.x+700:field.x+field.w-700;
    Object.assign(carrier,{x:carrierX,y:field.y+field.h/2,down:false,stun:0,z:0,
     action:'idle',actionTimer:0,cd:0,moveVX:0,moveVY:0,dx:dir,dy:0});
    Object.assign(runner,{x:carrierX+dir*170,y:carrier.y-112,down:false,stun:0,z:0,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:dir*300,moveVY:0,dx:0,dy:-1,
     src:{...runner.src,agility},aiAssistTarget:null,aiGiveAndGoRun:null});
    for(const q of g.players)if(q!==carrier&&q!==runner)
     Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    Object.assign(g.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,
     pass:false,passTeam:null,passTarget:null,attacker:team,lastTouchTeam:team,
     shot:null,strike:null,ordinaryShot:false,age:0,canCollect:0});
    const originalRandom=Math.random;Math.random=()=>.5;
    let kicked=false;try{kicked=g.pass(carrier,false,false,{preferredTarget:runner,supportRun:true});}
    finally{Math.random=originalRandom;}
    rows.push({team,agility,kicked,target:g.ball.passTarget,expected:runner.src.id,
     mode:g.events.at(-1)?.mode,slope:g.ball.vy/g.ball.vx});
   }
   return {rows,teams:SupermagicFootball.teams.length,
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert turn_result['teams']>=223,(kind,turn_result)
  assert turn_result['buttons']==4,(kind,turn_result)
  for team in (0,1):
   high=next(row for row in turn_result['rows'] if row['team']==team and row['agility']==100)
   low=next(row for row in turn_result['rows'] if row['team']==team and row['agility']==1)
   for row in (high,low):
    assert row['kicked'] and row['target']==row['expected'] and row['mode']=='supportRun',(kind,row)
   assert abs(high['slope'])>abs(low['slope']),(kind,team,high,low)
  print('PASS',kind,'actual support-run PASS follows receiver Agility turn for both teams; four actions and 223 teams',flush=True)
  assert not errors,(kind,errors)
  print('PASS',kind,'real directed PASS follows high/low Agility defender turn reads on both teams; four actions and no JavaScript errors',flush=True)
  print('PASS',kind,'mirrored projected support-pass arrival safety and fallback exclusion; four actions and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
