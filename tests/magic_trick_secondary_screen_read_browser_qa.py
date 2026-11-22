#!/usr/bin/env python3
"""Real-engine desktop and simulated-touch acceptance for second-defender Magic Trick reads."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module');page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game;
   function attempt(withScreen){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const carrier=g.player(0,3),nearest=g.player(1,3),screen=g.player(1,4);
    for(const q of g.players)if(q!==carrier&&q!==nearest&&q!==screen&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:1200,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,face:1,dx:1,dy:0,
     moveVX:180,moveVY:0,fatigue:0,breath:1,trickCd:0,dribbleCooldown:0,firstTouchOutletReadTimer:.8,
     firstTouchControlTimer:0,firstTouchPressure:.6,hideBallTimer:0});
    Object.assign(carrier.src,{dribbling:95,agility:95,stamina:95,dribbleType:'sideStep'});
    Object.assign(nearest,{x:1155,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,face:-1,dx:0,dy:0,moveVX:0,moveVY:0});
    Object.assign(nearest.src,{defence:20,aggression:20});
    Object.assign(screen,{x:1270,y:765,z:0,stun:withScreen?0:1,down:!withScreen,action:'idle',actionTimer:0,
     face:-1,dx:0,dy:0,moveVX:0,moveVY:0});
    Object.assign(screen.src,{defence:95,aggression:95});
    Object.assign(g.ball,{owner:carrier,x:1217,y:777,z:12,pass:false,shot:null,strike:null,attacker:0,lastTouchTeam:0});
    const before={x:carrier.x,y:carrier.y},oldRandom=Math.random;Math.random=()=>.8;
    try{g.tryDribbleTrick(carrier,true);}finally{Math.random=oldRandom;}
    return {success:carrier.trickFx>.4,owner:g.ball.owner===carrier,travel:Math.hypot(carrier.x-before.x,carrier.y-before.y)};
   }
   return {baseline:attempt(false),screened:attempt(true),buttons:document.querySelectorAll('#touchButtons button[data-act]').length,teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  assert result['baseline']['success'] is True,(kind,result)
  assert result['screened']['success'] is False,(kind,result)
  assert result['baseline']['owner'] is True,(kind,result)
  assert result['screened']['owner'] is False,(kind,result)
  assert result['baseline']['travel']>result['screened']['travel']*2,(kind,result)
  assert not errors,(kind,errors)
  print('PASS',kind,'secondary first-touch screen reads a Magic Trick while a turned-away nearest marker does not',flush=True)
  ctx.close()
 browser.close()
