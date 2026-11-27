#!/usr/bin/env python3
"""Exercise the held-Magic-Trick wind-up telegraph in the actual player renderer."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current modular browser fixture first'
html=fixture.read_text(encoding='utf8')
evidence=ROOT/'docs/qa_runs_full_regression'
evidence.mkdir(parents=True,exist_ok=True)

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game?.players?.length&&!!window.SupermagicFootball?.renderer',timeout=60000)
  result=page.evaluate('''() => {
   const app=SupermagicFootball,g=app.game,r=app.renderer,out=[],proto=CanvasRenderingContext2D.prototype;
   const original=proto.strokeText,labels=[];
   proto.strokeText=function(text,x,y){if(text==='TRICK!')labels.push({text,alpha:this.globalAlpha});return original.call(this,text,x,y);};
   const canvas=document.createElement('canvas');canvas.id='windupCapture';canvas.width=500;canvas.height=360;
   canvas.style.width='500px';canvas.style.height='360px';document.body.appendChild(canvas);
   const ctx=canvas.getContext('2d');
   function draw(team,hold,patch={},reduced=false){
    const p=g.player(team,4);
    Object.assign(p,{x:250,y:260,z:0,down:false,stun:0,keeper:false,preview:false,
     breath:1,dribbleHold:hold,magicReadyAt:0,magicHoldLatched:false,lightningPending:null,
     src:{...p.src,magicTrick:'fireball'}});
    g.clock=10;g.ball.owner=p;g.options.reducedFlash=reduced;
    g.input.state[team]={dribble:true,jump:false,shoot:false,pass:false};
    if(Object.hasOwn(patch,'owner'))g.ball.owner=patch.owner===false?null:p;
    if(patch.input)Object.assign(g.input.state[team],patch.input);
    for(const key of ['breath','magicReadyAt','magicHoldLatched','stun','down','preview'])if(Object.hasOwn(patch,key))p[key]=patch[key];
    labels.length=0;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#1b6047';ctx.fillRect(0,0,canvas.width,canvas.height);
    r.drawPlayer(ctx,p,g);
    return {visible:labels.length>0,alpha:labels[0]?.alpha??null,count:labels.length};
   }
   for(const team of [0,1]){
    g.init({home:0,away:9,humans:1,mode:'quick'});
    const valid=draw(team,.82);out.push({team,case:'valid',...valid});
    const early=draw(team,.61);out.push({team,case:'early',...early});
    const triggered=draw(team,1);out.push({team,case:'triggered',...triggered});
    const jump=draw(team,.82,{input:{jump:true}});out.push({team,case:'jump-conflict',...jump});
    const pass=draw(team,.82,{input:{pass:true}});out.push({team,case:'pass-conflict',...pass});
    const shoot=draw(team,.82,{input:{shoot:true}});out.push({team,case:'shoot-conflict',...shoot});
    const cooldown=draw(team,.82,{magicReadyAt:20});out.push({team,case:'cooldown',...cooldown});
    const breath=draw(team,.82,{breath:.79});out.push({team,case:'breath',...breath});
    const noBall=draw(team,.82,{owner:false});out.push({team,case:'no-possession',...noBall});
    const reduced=draw(team,.82,{},true);out.push({team,case:'reduced-flash',...reduced});
   }
   proto.strokeText=original;
   return {out,actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['actions']==4,(label,'gameplay action count changed',result)
  by_case={(item['team'],item['case']):item for item in result['out']}
  for team in [0,1]:
   assert by_case[(team,'valid')]['visible'],(label,'missing held-trick cue',team,result)
   assert by_case[(team,'early')]['visible'] is False,(label,'cue appeared before its bounded window',team)
   assert by_case[(team,'triggered')]['visible'] is False,(label,'cue remained after the one-second trigger',team)
   for case in ['jump-conflict','pass-conflict','shoot-conflict','cooldown','breath','no-possession']:
    assert by_case[(team,case)]['visible'] is False,(label,'false wind-up cue',team,case)
   assert by_case[(team,'reduced-flash')]['visible'],(label,'reduced-flash hid the steady warning',team)
   assert abs(by_case[(team,'reduced-flash')]['alpha']-.68)<1e-6,(label,'reduced-flash opacity',by_case[(team,'reduced-flash')])
  page.locator('#windupCapture').screenshot(path=str(evidence/f'magic_trick_windup_cue_{label}.png'))
  assert not errors,(label,errors)
  print('MAGIC_TRICK_WINDUP_CUE_BROWSER_PASS',label,result['out'],'actions=',result['actions'],flush=True)
  context.close()
 browser.close()
