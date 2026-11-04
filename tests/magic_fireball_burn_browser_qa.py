#!/usr/bin/env python3
"""MAGIC-FIREBALL-BURN-01: visible short burn cue with existing controls, desktop/touch."""
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
   const caster=g.player(0,2),target=g.player(1,2),players=g.players;
   g.players=[caster,target];caster.src={...caster.src,magicTrick:'fireball',dribbling:90};
   target.src={...target.src,defence:30};caster.x=200;caster.y=300;caster.face=1;
   target.x=300;target.y=300;target.face=1;g.ball.owner=caster;g.clock=2;
   const activated=g.tryMagicTrick(caster),burn=target.fireballBurnFx;
   const canvas=document.createElement('canvas');canvas.width=320;canvas.height=300;
   const ctx=canvas.getContext('2d'),draw=timer=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    api.renderer.drawPlayer(ctx,{...target,x:160,y:170,controlled:false},g);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let colored=0;for(let i=0;i<pixels.length;i+=4)
     if(pixels[i]>230&&pixels[i+1]>130&&pixels[i+1]<230&&pixels[i+2]<150&&pixels[i+3]>0)colored++;
    return colored;
   };
   const withBurn=draw(burn);target.fireballBurnFx=0;const withoutBurn=draw(0);
   return {activated,burn,stun:target.stun,withBurn,withoutBurn,
    actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['activated'] is True and result['burn']==.48,(label,'successful Fireball did not start its short cue',result)
  assert result['stun']==.32,(label,'existing short stagger changed',result)
  assert result['withBurn']>result['withoutBurn'],(label,'burn cue was not painted',result)
  assert result['actionButtons']==4,(label,'action button grammar changed',result)
  assert not errors,(label,errors)
  print('MAGIC_FIREBALL_BURN_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
