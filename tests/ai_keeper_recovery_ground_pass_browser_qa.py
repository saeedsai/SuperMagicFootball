#!/usr/bin/env python3
"""Desktop and simulated-touch actual-engine acceptance for keeper recovery pass reads."""
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
  page=ctx.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const values=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{
   getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),
   removeItem:key=>values.delete(key),clear:()=>values.clear()}})}""")
  page.add_script_tag(content=js,type='module');page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,field={x:150,y:155,w:2260.8,h:1220};
   const center=(field.y+24+field.y+field.h-24)/2,rows=[];
   function run(team,keeperAction){
    const dir=team===0?1:-1;
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const carrier=g.player(team,3),runner=g.player(team,4),keeper=g.player(1-team,0);
    for(const q of g.players)if(q!==carrier&&q!==runner&&q!==keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:field.x+field.w/2+dir*80,y:center,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,cd:0,
     trickCd:99,comboCooldown:99,abilityCd:99,dashCooldown:99,specialCd:99,
     aiTimer:0,aiTarget:null,aiAssistTarget:null,firstTouchControlTimer:0,
     firstTouchPressure:0,firstTouchOutletReadTimer:0,aiFirstTouchOutletUntil:0});
    Object.assign(runner,{x:carrier.x+dir*160,y:center+112,z:0,stun:0,down:false,
     action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:0,dy:0,face:dir,
     aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:0,slideTimer:0});
    Object.assign(keeper,{x:carrier.x+dir*80,y:center+56,z:0,stun:0,down:false,
     action:keeperAction,actionTimer:keeperAction==='keeperRecover'?.34:0,
     moveVX:0,moveVY:0,slideTimer:0,diveIntentPending:false});
    g.take(carrier);carrier.action='idle';carrier.actionTimer=0;carrier.cd=0;
    carrier.aiTimer=0;carrier.aiTarget=null;g.clock=.2;
    g.ball.pass=false;g.ball.passTarget=null;g.ball.shot=null;g.ball.strike=null;
    const originalRandom=Math.random;Math.random=()=>0;
    try{g.driveAI(carrier,.016);}finally{Math.random=originalRandom;}
    return {team,keeperAction,pass:g.ball.pass===true,passTarget:g.ball.passTarget,
     runnerId:runner.src.id,owner:g.ball.owner===carrier};
   }
   for(const team of [0,1]){rows.push(run(team,'keeperRecover'));rows.push(run(team,'idle'));}
   return {rows,actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert result['actionButtons']==4,(kind,result['actionButtons'])
  for index in range(0,4,2):
   recover,active=result['rows'][index:index+2]
   assert recover['pass'] is True and recover['passTarget']==recover['runnerId'],(kind,recover)
   assert active['pass'] is False and active['owner'] is True,(kind,active)
  assert not errors,(kind,errors)
  print('PASS',kind,'CPU support pass releases past a recovering keeper but respects an active keeper, both directions and four actions',flush=True)
  ctx.close()
 browser.close()
