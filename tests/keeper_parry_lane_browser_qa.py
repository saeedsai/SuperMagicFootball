#!/usr/bin/env python3
"""Real-engine keeper parry lane prediction: moving attackers, both goals, desktop and touch."""
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
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop'
                          else {'width':844,'height':390},
                          is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[];
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='paused';g.cooldown=0;
    const k=g.player(side,0),b=g.ball,dir=side===0?1:-1,goalY=765;
    Object.assign(k,{x:side===0?255:2305,y:goalY,stun:0,down:false,z:0,
      action:'idle',actionTimer:0,diveCooldown:0,diveIntentCooldown:0,
      diveIntentPending:false,moveVX:0,moveVY:0});
    for(const p of g.players){
     if(p===k||p.keeper)continue;
     if(p.t===1-side)Object.assign(p,{x:side===0?1900:660,y:1320-p.i*8,z:0,
       stun:0,down:false,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
     else Object.assign(p,{x:side===0?1750:810,y:205+p.i*8,z:0,
       stun:0,down:false,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
    }
    const marker=g.player(1-side,3);
    Object.assign(marker,{x:k.x+dir*50,y:goalY-90,z:0,stun:0,down:false,
      action:'idle',actionTimer:0,moveVX:0,moveVY:300,vx:0,vy:300});
    Object.assign(b,{owner:null,attacker:1-side,lastTouchTeam:1-side,
      x:k.x+dir*24,y:goalY,z:0,vx:-dir*2500,vy:0,vz:0,power:60,
      ordinaryShot:true,shot:null,strike:null,age:.2,canCollect:0,trail:[],pass:false});
    const parried=g.tryKeeperDive(k,false);
    rows.push({side,parried,vy:b.vy,markerX:marker.x,markerY:marker.y});
   }
   return {rows,teams:SupermagicFootball.teams.length};
  }""")
  assert not errors,(kind,errors)
  assert result['teams']>=223,(kind,result)
  assert len(result['rows'])==2,(kind,result)
  for row in result['rows']:
   assert row['parried'],(kind,row)
   assert row['vy']<0,(kind,row)
  print('PASS',kind,'both mirrored real-engine parries avoid a projected attacker in the preferred lane',flush=True)
  ctx.close()
 browser.close()
