#!/usr/bin/env python3
"""Actual-renderer carry-shield pose QA at desktop and simulated-touch game scale."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'tests/.generated/play.html'
OUT=ROOT/'docs/qa_runs_full_regression'
JS=r"""()=>{
 const {game,renderer}=window.SupermagicFootball||{};
 if(!game||!renderer?.drawPlayer)throw Error('actual player renderer unavailable');
 const carrierBase=game.player(0,3),defenderBase=game.player(1,3);
 if(!carrierBase?.src||!defenderBase?.src)throw Error('existing roster players unavailable');
 const old={players:game.players,ball:game.ball,inMatchDraw:renderer.inMatchDraw,time:renderer.time};
 const before=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.fatigue,p.breath]),
  ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 renderer.inMatchDraw=false;renderer.time=1.25;
 function paint(team,pressure,hold=.35,down=false){
  const face=team===0?1:-1;
  const carrier={...carrierBase,src:{...carrierBase.src},t:team,x:900,y:420,z:0,preview:false,controlled:false,
   action:'idle',actionTimer:0,stun:0,down:false,invuln:0,dribbleHold:hold,dx:0,dy:0,moveVX:0,moveVY:0,
   face,visualFacing:{kind:'front',side:face},anim:0};
  const defender={...defenderBase,src:{...defenderBase.src},t:1-team,x:team===0?840:960,y:420,z:0,
   preview:false,controlled:false,down,stun:0,invuln:0,slideTimer:0,action:'idle',actionTimer:0};
  game.players=pressure?[carrier,defender]:[carrier];
  game.ball={...old.ball,owner:carrier,x:carrier.x+face*17,y:carrier.y+12,z:0,vx:0,vy:0,vz:0,shot:null,strike:null};
  const canvas=document.createElement('canvas');canvas.width=180;canvas.height=190;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#101b28';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.save();ctx.translate(90,176);renderer.drawPlayer(ctx,carrier,game);ctx.restore();
  return {canvas,pixels:ctx.getImageData(0,0,canvas.width,canvas.height).data};
 }
 const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)
  if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;return n;};
 const gallery=document.createElement('canvas');gallery.id='carry-shield-gallery';gallery.width=720;gallery.height=230;
 const g=gallery.getContext('2d');g.fillStyle='#0c2131';g.fillRect(0,0,720,230);
 const rows=[];
 for(const team of [0,1]){
  const neutral=paint(team,false),pressured=paint(team,true,.35,false);
  const released=paint(team,true,0,false),downed=paint(team,true,.35,true);
  const changed=diff(neutral.pixels,pressured.pixels),releasedDiff=diff(neutral.pixels,released.pixels),
   downedDiff=diff(neutral.pixels,downed.pixels);
  if(changed<12)throw Error('team '+team+' pressure brace was not visible: '+changed+' changed pixels');
  if(releasedDiff!==0)throw Error('team '+team+' released DRIBBLE must restore the neutral pose: '+releasedDiff);
  if(downedDiff!==0)throw Error('team '+team+' downed defender must not trigger the brace: '+downedDiff);
  g.fillStyle='#e7f2ff';g.font='700 12px Arial';g.fillText(team===0?'HOME · NEUTRAL':'AWAY · NEUTRAL',team*360+8,17);
  g.drawImage(neutral.canvas,team*360+8,25,160,190);
  g.fillText(team===0?'HOME · SHIELD':'AWAY · SHIELD',team*360+180,17);
  g.drawImage(pressured.canvas,team*360+180,25,160,190);
  rows.push({team,changedPixels:changed,releasedFallbackPixels:releasedDiff,downedFallbackPixels:downedDiff});
 }
 document.body.append(gallery);
 game.players=old.players;game.ball=old.ball;renderer.inMatchDraw=old.inMatchDraw;renderer.time=old.time;
 const after=JSON.stringify({players:game.players.map(p=>[p.x,p.y,p.z,p.action,p.actionTimer,p.anim,p.fatigue,p.breath]),
  ball:[game.ball?.x,game.ball?.y,game.ball?.z,game.ball?.vx,game.ball?.vy]});
 if(before!==after)throw Error('carry-shield rendering mutated live match state');
 return {rows,liveStateUnchanged:true};
}"""
def main():
 if not HTML.exists():raise SystemExit('Run scripts/build.py first to generate the browser fixture')
 OUT.mkdir(parents=True,exist_ok=True)
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for label,viewport in [('desktop',{'width':1280,'height':720}),('simulated-touch',{'width':844,'height':390})]:
   context=browser.new_context(viewport=viewport,is_mobile=label!='desktop',has_touch=label!='desktop')
   page=context.new_page();errors=[];failed=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   page.on('console',lambda message:errors.append(message.text) if message.type=='error' else None)
   page.on('requestfailed',lambda request:failed.append(request.url))
   page.goto(HTML.as_uri(),wait_until='load',timeout=60000)
   page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer',timeout=30000)
   result=page.evaluate(JS)
   if errors or failed:raise AssertionError(f'{label} errors={errors} failed={failed}')
   path=OUT/f'player-carry-shield-01281355-{label}.png'
   page.locator('#carry-shield-gallery').screenshot(path=str(path),timeout=30000)
   print('PASS',label,result,'screenshot',path,flush=True)
   context.close()
  browser.close()
if __name__=='__main__':main()
