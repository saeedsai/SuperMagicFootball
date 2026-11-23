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
     moveVX:300,moveVY:kind==='moving-away'?300:-300,
     aiAssistTarget:null,aiGiveAndGoRun:null,face:dir,dx:dir,dy:0});
    for(const q of g.players){
     if(q===carrier||q===runner||q===defender)continue;
     Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    }
    Object.assign(defender,{x:runner.x+44,y:138,down:false,stun:0,z:0,
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
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored projected support-pass arrival safety and fallback exclusion; four actions and no JavaScript errors',flush=True)
  ctx.close()
 browser.close()
