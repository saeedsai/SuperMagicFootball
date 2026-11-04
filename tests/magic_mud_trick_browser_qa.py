#!/usr/bin/env python3
"""MAGIC-MUD-01: verify Mud gameplay and visible cue desktop/touch."""
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
   const caster=g.player(0,2),target=g.player(1,2);g.players=[caster,target];
   caster.src={...caster.src,role:'FW',magicTrick:'mud',shootAccuracy:85,shootPower:85,
    dribbling:90,speedRating:85,agility:85,heading:85,statsVerified:true};
   target.src={...target.src,defence:25};caster.x=200;caster.y=300;caster.face=1;
   target.x=240;target.y=300;target.face=-1;g.ball.owner=caster;g.clock=2;
   const speedBefore=g.playerSpeed(target),before={x:target.x,y:target.y};
   const activated=g.tryMagicTrick(caster),speedAfter=g.playerSpeed(target);
   const canvas=document.createElement('canvas');canvas.width=320;canvas.height=300;
   const ctx=canvas.getContext('2d');
   const draw=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);
    api.renderer.drawPlayer(ctx,{...target,x:160,y:170,controlled:false},g);
    const px=ctx.getImageData(0,0,canvas.width,canvas.height).data;let opaque=0;
    for(let i=3;i<px.length;i+=4)if(px[i]>0)opaque++;
    return opaque;};
   const withMud=draw();target.mudTrickFx=0;const withoutMud=draw();
   return {activated,slow:target.mudSlowTimer,slowdownRatio:speedAfter/speedBefore,
    displacement:Math.hypot(target.x-before.x,target.y-before.y),withMud,withoutMud,
    actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['activated'] is True,(label,'Mud did not activate',result)
  assert result['slow']==.52,(label,'Mud duration changed',result)
  assert abs(result['slowdownRatio']-.62)<1e-9,(label,'Mud speed multiplier changed',result)
  assert result['displacement']==0,(label,'Mud should slow without displacement',result)
  assert result['withMud']>result['withoutMud'],(label,'Mud cue was not rendered',result)
  assert result['actionButtons']==4,(label,'four-button action grammar changed',result)
  assert not errors,(label,errors)
  print('MAGIC_MUD_TRICK_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
