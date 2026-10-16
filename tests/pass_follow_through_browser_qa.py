#!/usr/bin/env python3
"""Pass action makes visible leg/lean follow-through in all eight headings: actual renderer."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Run python3 scripts/build.py before graphics browser regression'
html=fixture.read_text(encoding='utf8')

JS=r"""() => {
 const g=SupermagicFootball.game,r=SupermagicFootball.renderer,p=g.player(0,3);
 if(!p||!g||!r)throw Error('missing real game player/renderer');
 const originalBall=JSON.stringify({score:g.score,formation:g.formation,teamIds:g.teamIds});
 // A real teammate pass generates action='pass' without any new button.
 g.take(p);
 if(!g.pass(p,false,false,{human:true}))throw Error('real pass rejected');
 if(p.action!=='pass'||!g.ball.pass)throw Error('no actual pass action');
 const buttons=document.querySelectorAll('#touchButtons button[data-act]').length;
 const directions=Array.from({length:8},(_,n)=>n*Math.PI/4),results=[];
 for(const angle of directions){
  const dx=Math.cos(angle),dy=Math.sin(angle);
  const snapshot=(action,timer)=>{
   const canvas=document.createElement('canvas');canvas.width=400;canvas.height=310;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});
   const model={...p,x:200,y:245,dx,dy,z:0,face:dx<0?-1:1,action,actionTimer:timer,controlled:false,anim:0,preview:true};
   r.drawPlayer(ctx,model,g);
   return ctx.getImageData(0,0,400,310).data;
  };
  const idle=snapshot('idle',0),kick=snapshot('pass',.15),complete=snapshot('pass',0);
  let changed=0,finished=0;
  for(let i=0;i<idle.length;i+=4){
   if(Math.abs(idle[i]-kick[i])+Math.abs(idle[i+1]-kick[i+1])+Math.abs(idle[i+2]-kick[i+2])+Math.abs(idle[i+3]-kick[i+3])>48)changed++;
   if(Math.abs(idle[i]-complete[i])+Math.abs(idle[i+1]-complete[i+1])+Math.abs(idle[i+2]-complete[i+2])+Math.abs(idle[i+3]-complete[i+3])>48)finished++;
  }
  results.push({heading:Math.round(angle*180/Math.PI),changed,finished});
 }
 return {results,buttons,state:g.matchState,passing:p.action,realPass:g.ball.pass,
   scoreAndIdentityUnchanged:JSON.stringify({score:g.score,formation:g.formation,teamIds:g.teamIds})===originalBall};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
  args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,viewport,mobile in (('desktop',{'width':1280,'height':720},False),
                               ('simulated-touch',{'width':844,'height':390},True)):
  ctx=browser.new_context(viewport=viewport,has_touch=mobile,is_mobile=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator(f'[data-action="{action}"]').first.click()
  report=page.evaluate(JS)
  assert report['state']=='play' and report['passing']=='pass' and report['realPass'],(name,report)
  assert report['buttons']==4 and report['scoreAndIdentityUnchanged'],(name,report)
  assert len(report['results'])==8 and all(x['changed']>40 for x in report['results']),(name,report)
  assert not errors,(name,errors)
  print('PASS_FOLLOW_THROUGH',name,'8 directions, pixel-difference',report['results'],flush=True)
  ctx.close()
 browser.close()
