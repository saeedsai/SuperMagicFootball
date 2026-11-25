#!/usr/bin/env python3
"""Actual-engine desktop and simulated-touch QA for CPU ground-pass slide reads."""
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
  ctx=browser.new_context(
   viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
   is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {
   const values=new Map();
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
    getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),
    removeItem:key=>values.delete(key),clear:()=>values.clear()
   }});
  }""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,field={x:150,y:155,w:2260.8,h:1220};
   const center=field.y+field.h/2,rows=[];
   function run(team,slideDirection){
    const dir=team===0?1:-1;
    g.init({home:0,away:1,mode:'quick',humans:0});
    g.weather='Clear';
    const carrier=g.player(team,3),runner=g.player(team,4),slider=g.player(1-team,3);
    const carrierX=team===0?field.x+600:field.x+field.w-600;
    for(const q of g.players){
     if(q===carrier||q===runner||q===slider)continue;
     Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,
      moveVX:0,moveVY:0,aiAssistTarget:null,aiGiveAndGoRun:null});
    }
    Object.assign(carrier,{x:carrierX,y:center,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     slideTimer:0,moveVX:0,moveVY:0,face:dir,dx:dir,dy:0,cd:0,trickCd:99,
     comboCooldown:99,abilityCd:99,dashCooldown:99,specialCd:99,aiTimer:0,aiTarget:null,
     aiAssistTarget:null,firstTouchControlTimer:0,firstTouchPressure:0,
     firstTouchOutletReadTimer:0,aiFirstTouchOutletUntil:0,fatigue:0,breath:10});
    Object.assign(runner,{x:carrierX+dir*160,y:center+112,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,face:dir,dx:dir,dy:0,
     aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:0});
    Object.assign(slider,{x:carrierX+dir*105,y:center-35,z:0,stun:0,down:false,
     action:'slide',actionTimer:.16,slideTimer:.16,slideRemaining:120,slideSpeed:595,
     slideDX:0,slideDY:slideDirection,moveVX:0,moveVY:slideDirection*595,
     aiAssistTarget:null});
    Object.assign(g.ball,{owner:null,pass:false,passTeam:null,passTarget:null,attacker:team,
     lastTouchTeam:team,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,
     age:0,canCollect:0,shot:null,strike:null,ordinaryShot:false});
    g.take(carrier);
    Object.assign(carrier,{action:'idle',actionTimer:0,cd:0,trickCd:99,aiTimer:0,aiTarget:null,
     firstTouchControlTimer:0,firstTouchPressure:0,firstTouchOutletReadTimer:0,aiFirstTouchOutletUntil:0});
    g.matchState='play';g.clock=10;
    const originalRandom=Math.random;Math.random=()=>0;
    try{g.driveAI(carrier,.016);}finally{Math.random=originalRandom;}
    return {team,slideDirection,pass:g.ball.pass===true,target:g.ball.passTarget,
     runnerId:runner.src.id,owner:g.ball.owner===carrier};
   }
   for(const team of [0,1]){rows.push(run(team,1));rows.push(run(team,-1));}
   return {rows,teams:SupermagicFootball.teams.length,
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert result['teams']>=223,(kind,result)
  assert result['buttons']==4,(kind,result)
  for row in result['rows']:
   if row['slideDirection']>0:
    assert row['pass'] is False and row['owner'] is True,(kind,row)
   else:
    assert row['pass'] is True and row['target']==row['runnerId'],(kind,row)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored CPU support-pass lane rejects a live crossing slide and releases past a retreating slide; four actions, 223+ teams, no JS errors',flush=True)
  ctx.close()
 browser.close()
