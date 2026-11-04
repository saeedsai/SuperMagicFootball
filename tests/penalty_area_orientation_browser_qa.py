#!/usr/bin/env python3
"""Check mirrored in-match penalty movement and presentation in Chromium."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current modular browser fixture first'
html=fixture.read_text(encoding='utf8')
world=json.loads((ROOT/'data/mechanics/gameplay.json').read_text(encoding='utf8'))['world']

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate('''({world}) => {
   const app=SupermagicFootball,g=app.game,r=app.renderer,F=world.field,cy=(world.goalTop+world.goalBottom)/2,out=[];
   for(const team of [0,1]){
    g.init({home:0,away:9,humans:1,mode:'quick'});g.inControl=()=>false;g.startPK(false,team);
    const sign=team===0?1:-1,goal=team===0?F.x+F.w:F.x,spot=team===0?F.x+F.w*.76:F.x+F.w*.24;
    g.pk.ready=0;g.pk.timer=8;g.updatePK(.04);const movedX=g.pk.ballX;
    g.pk.startX=spot;g.pk.ballX=spot;g.pk.shotTimer=.4;g.pk.shotMax=.8;g.updatePK(.04);const shotX=g.pk.ballX;
    g.pk.shotTimer=0;g.pk.ballX=spot;const draws=[];let ball=null,marker=null,oldDraw=r.drawPlayer,oldBall=r.drawSoccerBall;
    r.drawPlayer=(_ctx,p)=>draws.push(p);r.drawSoccerBall=(_ctx,x,y)=>{ball={x,y}};
    const ctx={beginPath(){},ellipse(x){marker=x},fill(){},arc(){},stroke(){}};r.drawPenaltyPlayers(ctx,g);r.drawPlayer=oldDraw;r.drawSoccerBall=oldBall;
    out.push({team,sign,goal,spot,movedX,shotX,kicker:draws[0],keeper:draws[1],ball,marker});
   }
   return {out,actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''',{'world':world})
  assert result['actions']==4,(label,'four-button grammar changed',result)
  for case in result['out']:
   sign=case['sign'];goal=case['goal'];spot=case['spot']
   assert (case['movedX']-spot)*sign>0,(label,'taker moved away from the attacking goal',case)
   assert (case['shotX']-spot)*sign>0,(label,'shot traveled away from the attacking goal',case)
   assert case['kicker']['face']==sign and abs(case['kicker']['x']-(spot-sign*72))<1e-6,(label,'kicker pose not mirrored',case)
   assert abs(case['keeper']['x']-(goal-sign*30))<1e-6 and case['keeper']['face']==-sign,(label,'keeper position not mirrored',case)
   assert abs(case['marker']-(goal-sign*12))<1e-6 and abs(case['ball']['x']-spot)<1e-6,(label,'ball/aim marker not mirrored',case)
  assert not errors,(label,errors)
  compact=[{key:case[key] for key in ('team','goal','spot','movedX','shotX','marker')} for case in result['out']]
  print('PENALTY_AREA_ORIENTATION_BROWSER_PASS',label,compact,'actions=',result['actions'],flush=True)
  context.close()
 browser.close()
