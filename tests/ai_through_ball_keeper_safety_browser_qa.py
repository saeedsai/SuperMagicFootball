#!/usr/bin/env python3
"""Desktop and simulated-touch real-engine acceptance for keeper-aware through balls."""
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
   const g=SupermagicFootball.game,field={x:150,y:155,w:2260.8,h:1220},rows=[];
   for(const team of [0,1])for(const kind of ['weak','elite']){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const dir=team===0?1:-1;
    const carrier=g.players.find(p=>p.t===team&&p.i===3);
    const runner=g.players.find(p=>p.t===team&&p.i===4);
    const keeper=g.players.find(p=>p.t===1-team&&p.keeper);
    const carrierX=1280;
    Object.assign(carrier,{x:carrierX,y:600,homeX:carrierX,homeY:600,down:false,stun:0,z:0,
     action:'idle',actionTimer:0,cd:0,aiTimer:0,aiTarget:null,comboActive:false,trickCd:10,
     dribbleHold:0,firstTouchControlTimer:0,firstTouchPressure:0,firstTouchOutletUntil:0,
     moveVX:0,moveVY:0,face:dir,dx:dir,dy:0,breath:1});
    Object.assign(runner,{x:carrierX+dir*120,y:600,homeX:carrierX+dir*160,homeY:488,
     down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:dir*200,moveVY:-200,
     aiAssistTarget:null,aiGiveAndGoRun:null,face:dir,dx:dir,dy:-1});
    for(const q of g.players){
     if(q===carrier||q===runner||q===keeper)continue;
     Object.assign(q,{x:team===0?field.x+field.w-35:field.x+35,y:field.y+40,down:true,
      stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    }
    const gap=Math.hypot(40,112),runSpeed=(200*40+200*112)/gap;
    const flightSeconds=Math.max(.12,Math.min(.35,Math.hypot(160,112)/1400));
    const leadDirX=dir*40/gap,leadDirY=-112/gap;
    const projection=(runner.x-carrierX)*leadDirX+(runner.y-600)*leadDirY;
    const perpendicularSquared=Math.max(0,120*120-projection*projection);
    const minimumLead=perpendicularSquared>=110*110?48:Math.max(48,-projection+Math.sqrt(110*110-perpendicularSquared));
    const lead=Math.max(minimumLead,Math.min(100,Math.min(gap-16,runSpeed*flightSeconds)));
    const lateralSpeed=runner.moveVX*(-leadDirY)+runner.moveVY*leadDirX;
    const lateralLead=Math.max(-32,Math.min(32,lateralSpeed*flightSeconds));
    const target={x:runner.x+leadDirX*lead-leadDirY*lateralLead,
     y:runner.y+leadDirY*lead+leadDirX*lateralLead};
    Object.assign(keeper,{x:target.x+dir*94,y:target.y+34,z:0,down:false,stun:0,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,fatigue:0,aiTimer:0,aiTarget:null});
    keeper.src={...keeper.src,gkSkill:kind==='elite'?100:1,gkDiving:kind==='elite'?100:1};
    Object.assign(g.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,
     pass:false,passTeam:null,passTarget:null,attacker:team,lastTouchTeam:team,
     shot:null,strike:null,ordinaryShot:false,age:0,canCollect:0});
    g.matchState='play';g.clock=10;
    const originalRandom=Math.random;Math.random=()=>0;
    try{g.driveAI(carrier,1/60);}finally{Math.random=originalRandom;}
    const event=g.events.at(-1)||{};
    rows.push({team,kind,mode:event.mode,target:g.ball.passTarget,expected:runner.src.id});
   }
   const turnRows=[];
   for(const team of [0,1])for(const agility of [100,50,1]){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const dir=team===0?1:-1,carrier=g.players.find(p=>p.t===team&&p.i===3),
     runner=g.players.find(p=>p.t===team&&p.i===4);
    const carrierX=1280;
    Object.assign(carrier,{x:carrierX,y:600,homeX:carrierX,homeY:600,down:false,stun:0,z:0,
     action:'idle',actionTimer:0,cd:0,aiTimer:0,aiTarget:null,comboActive:false,trickCd:10,
     dribbleHold:0,firstTouchControlTimer:0,firstTouchPressure:0,firstTouchOutletUntil:0,
     moveVX:0,moveVY:0,face:dir,dx:dir,dy:0,breath:1});
    Object.assign(runner,{x:carrierX+dir*120,y:600,homeX:carrierX+dir*160,homeY:488,
     down:false,stun:0,z:0,action:'run',actionTimer:0,slideTimer:0,
     moveVX:dir*340,moveVY:0,aiAssistTarget:null,aiGiveAndGoRun:null,face:dir,dx:0,dy:-1});
    runner.src={...runner.src,agility};
    for(const q of g.players){
     if(q===carrier||q===runner)continue;
     Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,
      moveVX:0,moveVY:0});
    }
    Object.assign(g.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,
     pass:false,passTeam:null,passTarget:null,attacker:team,lastTouchTeam:team,
     shot:null,strike:null,ordinaryShot:false,age:0,canCollect:0});
    g.matchState='play';g.clock=10;
    const originalRandom=Math.random;Math.random=()=>0;
    try{g.driveAI(carrier,1/60);}finally{Math.random=originalRandom;}
    const event=g.events.at(-1)||{},slope=g.ball.vy/g.ball.vx;
    turnRows.push({team,agility,mode:event.mode,target:g.ball.passTarget,
     expected:runner.src.id,turn:-dir*slope});
   }
   return {rows,turnRows,teams:SupermagicFootball.teams.length,
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert result['teams']>=223,(kind,result)
  assert result['buttons']==4,(kind,result)
  for row in result['rows']:
   expected='throughBall' if row['kind']=='weak' else 'supportRun'
   assert row['mode']==expected,(kind,row,expected)
   assert row['target']==row['expected'],(kind,row)
  for team in [0,1]:
   profiles={row['agility']:row for row in result['turnRows'] if row['team']==team}
   for agility in [100,50,1]:
    assert profiles[agility]['mode']=='throughBall',(kind,profiles[agility])
    assert profiles[agility]['target']==profiles[agility]['expected'],(kind,profiles[agility])
   assert profiles[100]['turn']>profiles[50]['turn']>profiles[1]['turn'],(kind,profiles)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored keeper-aware through-ball and safe support PASS fallback, four actions and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
