#!/usr/bin/env python3
"""SD10 Mace Sweep: browser checks for the warning, defense counter, and HUD."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build current modular browser fixture first'
html=fixture.read_text(encoding='utf8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate('''() => {
   const api=SupermagicFootball,g=api.game;
   g.init({home:0,away:9,humans:1,mode:'quick'});g.matchState='paused';
   const p=g.player(0,2),q=g.player(1,2);
   g.players=[p,q];p.src={...p.src,role:'DF',superDefenceLevel:2,dribbling:55,
    aggression:70,defence:70,superAbility:{type:'defence',id:'maceSweep',level:2}};
   q.src={...q.src,role:'FW',strength:60,defence:40};
   p.x=400;p.y=300;p.face=1;p.z=0;p.stun=0;p.invuln=0;p.abilityCd=0;p.fatigue=0;
   q.x=492;q.y=312;q.z=0;q.stun=0;q.invuln=0;q.dashTimer=0;q.face=-1;q.dx=0;q.dy=0;
   g.ball.owner=q;g.ball.x=q.x;g.ball.y=q.y;g.clock=2;
   const activated=g.activateDefence(p),pending=p.maceSweepPending?.remaining;
   const canvas=document.createElement('canvas');canvas.width=360;canvas.height=360;
   const ctx=canvas.getContext('2d');
   const cue=()=>{ctx.clearRect(0,0,360,360);
    api.renderer.drawPlayer(ctx,{...p,x:180,y:220},g);
    const px=ctx.getImageData(0,0,360,360).data;let orange=0;
    for(let i=0;i<px.length;i+=4)if(px[i]>225&&px[i+1]>115&&px[i+1]<220&&px[i+2]<145&&px[i+3]>0)orange++;
    return orange;};
   const withCue=cue();p.maceSweepPending=null;const withoutCue=cue();
   p.maceSweepPending={remaining:.24,target:q};q.action='slide';q.actionTimer=.2;
   const counterResolved=g.updateMaceSweep(p,.24,false),counterEvent=g.events.at(-1);
   return {activated,pending,withCue,withoutCue,counterResolved,counterEvent:counterEvent?.type,
    countered:counterEvent?.countered,stun:q.stun,ballStillOwned:g.ball.owner===q,
    actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['activated'] is True and result['pending']==.24,(label,'no Mace Sweep telegraph',result)
  assert result['withCue']>result['withoutCue'],(label,'cue was not drawn',result)
  assert result['counterResolved'] is False and result['counterEvent']=='maceSweepResolved',(
   label,'grounded SHOOT-slide did not counter',result)
  assert result['countered'] is True and result['stun']==0 and result['ballStillOwned'],(
   label,'counter failed to preserve the target and possession',result)
  assert result['actionButtons']==4,(label,'four-button action grammar changed',result)
  assert not errors,(label,errors)
  print('MACE_SWEEP_TELEGRAPH_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
