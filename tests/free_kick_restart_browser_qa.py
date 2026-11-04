#!/usr/bin/env python3
"""Verify direct free-kick play in the actual game build on desktop/touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build modular fixture first with python -X utf8 scripts/build.py'
html_src=fixture.read_text(encoding='utf-8')
html=html_src.split('<script type="module">',1)[0]+'</body></html>'
js=html_src.split('<script type="module">',1)[1].split('</script>',1)[0]
CHECK=r"""() => {
 const g=SupermagicFootball.game,events=[];
 g.init({home:0,away:9,humans:1,mode:'quick',options:{...g.options,weather:'Clear'}});
 g.cooldown=0;g.matchState='play';g.events=[];
 const carrier=g.player(0,3),tackler=g.player(1,2);
 carrier.x=900;carrier.y=600;carrier.z=0;carrier.stun=0;carrier.invuln=0;
 carrier.moveVX=100;carrier.moveVY=0;
 tackler.x=860;tackler.y=600;tackler.stun=0;tackler.slideTimer=.3;tackler.slideRemaining=80;
 g.ball.owner=carrier;g.ball.x=carrier.x;g.ball.y=carrier.y;g.ball.z=0;
 const prior=Math.random;Math.random=()=>0;
 try{g.slideContact(tackler);}finally{Math.random=prior;}
 const foul=g.events.find(e=>e.type==='foul'),restart=g.events.find(e=>e.type==='freeKickRestart');
 const owner=g.ball.owner,configured=g.rosters[0][g.teamPlans[0].freeKick];
 const initial={foul:!!foul,restart:restart?.type,owner:owner?.src?.id,configured:configured?.id,
  position:[restart?.x,restart?.y],cooldown:g.cooldown,slideStopped:tackler.slideTimer===0};
 g.cooldown=0; // the engine exposes the short restart lock separately; release it for action smoke.
 const kicked=g.pass(owner,false,false,{human:true});
 return {initial,kicked,ownerAfter:g.ball.owner===null,controls:4};
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True)
 for label,mobile in [('desktop',False),('simulated-touch',True)]:
  ctx=browser.new_context(viewport={'width':1280,'height':720} if not mobile else {'width':844,'height':390},
                          is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html);page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
  result=page.evaluate(CHECK);start=result['initial']
  assert start['foul'] and start['restart']=='freeKickRestart',result
  assert start['owner']==start['configured'],result
  assert start['position']==[900,600] and start['cooldown']>=.45 and start['slideStopped'],result
  assert result['kicked'] and result['ownerAfter'] and result['controls']==4,result
  assert not errors,(label,errors)
  print('PASS',label,result,flush=True);ctx.close()
 browser.close()
