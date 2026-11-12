#!/usr/bin/env python3
"""No foul or free kick on behind-slide contacts in the live desktop/touch build."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build modular fixture first'
source=fixture.read_text(encoding='utf8')
html=source.split('<script type="module">',1)[0]+'</body></html>'
js=source.split('<script type="module">',1)[1].split('</script>',1)[0]
CHECK="""() => {
 const g=SupermagicFootball.game;
 g.init({home:0,away:9,humans:1,mode:'quick',options:{...g.options,weather:'Clear'}});
 g.cooldown=0;g.events=[];g.kickoffCountdown=0;
 const carrier=g.player(0,3),tackler=g.player(1,2);
 carrier.x=900;carrier.y=600;carrier.z=0;carrier.stun=0;carrier.invuln=0;carrier.moveVX=100;carrier.moveVY=0;
 tackler.x=860;tackler.y=600;tackler.stun=0;tackler.slideTimer=.3;tackler.slideRemaining=80;
 g.ball.owner=carrier;g.ball.x=carrier.x;g.ball.y=carrier.y;g.ball.z=0;
 const prior=Math.random;Math.random=()=>0;let hit=false;
 try{hit=g.slideContact(tackler);}finally{Math.random=prior;}
 return {hit,events:g.events.map(e=>e.type),state:g.matchState,owner:g.ball.owner?.src?.id||null,stopped:tackler.slideTimer===0,
  buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,**({'executable_path':os.environ['SMF_CHROMIUM_PATH']} if os.environ.get('SMF_CHROMIUM_PATH') else {}))
 for label,touch in [('desktop',False),('simulated-touch',True)]:
  context=browser.new_context(viewport={'width':844,'height':390} if touch else {'width':1280,'height':720},has_touch=touch,is_mobile=touch)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html);page.add_script_tag(content=js,type='module');page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
  r=page.evaluate(CHECK)
  assert r['hit'] and r['stopped'] and r['state']=='play' and r['owner'] is None,(label,r)
  assert r['events']==['tackleHit'] and r['buttons']==4,(label,r)
  assert not errors,(label,errors)
  print('CONTINUOUS_SLIDE_PASS',label,flush=True);context.close()
 browser.close()
