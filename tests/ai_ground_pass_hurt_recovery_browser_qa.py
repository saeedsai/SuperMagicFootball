#!/usr/bin/env python3
"""Desktop and simulated-touch actual-engine regression for CPU ground-pass recovery reads."""
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
  out=page.evaluate("""() => {
   const g=SupermagicFootball.game,F={x:150,y:155,w:2260.8,h:1220},cy=(F.y+24+F.y+F.h-24)/2,rows=[];
   function run(team,mode){const d=team===0?1:-1;g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';const c=g.player(team,3),r=g.player(team,4),k=g.player(1-team,0),b=g.player(1-team,3);for(const p of g.players)if(p!==c&&p!==r&&p!==k&&p!==b){p.down=true;p.stun=1;}
    Object.assign(c,{x:F.x+F.w/2+d*80,y:cy,z:0,stun:0,down:false,action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:d,dy:0,face:d,cd:0,trickCd:99,comboCooldown:99,abilityCd:99,dashCooldown:99,specialCd:99,aiTimer:0,aiTarget:null,aiAssistTarget:null,firstTouchControlTimer:0,firstTouchPressure:0,firstTouchOutletReadTimer:0,aiFirstTouchOutletUntil:0});
    Object.assign(r,{x:c.x+d*160,y:cy+112,z:0,stun:0,down:false,action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:0,dy:0,face:d,aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:0,slideTimer:0});
    Object.assign(k,{down:false,stun:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0});Object.assign(b,{down:true,stun:1,action:'idle',actionTimer:0,slideTimer:0});
    if(mode==='keeperRecover'||mode==='keeperIdle')Object.assign(k,{x:c.x+d*80,y:cy+56,z:0,stun:0,down:false,action:mode==='keeperRecover'?'keeperRecover':'idle',actionTimer:mode==='keeperRecover'?.34:0,diveIntentPending:false});
    else Object.assign(b,{x:c.x+d*80,y:cy+56,z:0,stun:0,down:false,action:mode==='slide'?'slide':'hurt',actionTimer:mode==='hurtRecover'?.34:0,slideTimer:mode==='slide'?.34:0});
    g.take(c);c.action='idle';c.actionTimer=0;c.cd=0;c.aiTimer=0;c.aiTarget=null;g.clock=.2;g.ball.pass=false;g.ball.passTarget=null;g.ball.shot=null;g.ball.strike=null;const old=Math.random;Math.random=()=>0;try{g.driveAI(c,.016);}finally{Math.random=old;}return {team,mode,pass:g.ball.pass===true,target:g.ball.passTarget,runner:r.src.id,owner:g.ball.owner===c};}
   for(const team of [0,1])for(const mode of ['keeperRecover','keeperIdle','hurtRecover','hurtFinished','slide'])rows.push(run(team,mode));return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert out['buttons']==4,(kind,out['buttons'])
  for team in (0,1):
   rows={x['mode']:x for x in out['rows'] if x['team']==team}
   for mode in ('keeperRecover','hurtRecover'):assert rows[mode]['pass'] and rows[mode]['target']==rows[mode]['runner'],(kind,rows[mode])
   for mode in ('keeperIdle','hurtFinished','slide'):assert not rows[mode]['pass'] and rows[mode]['owner'],(kind,rows[mode])
  assert not errors,(kind,errors)
  print('PASS',kind,'support pass ignores active keeper/hurt recovery, retains ready/slide blockers, both directions and four actions',flush=True)
  ctx.close()
 browser.close()
