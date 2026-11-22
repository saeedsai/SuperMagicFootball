#!/usr/bin/env python3
"""Real-engine desktop and simulated-touch acceptance for second-defender Magic Trick reads."""
from pathlib import Path
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
ARTIFACTS=ROOT/'docs/qa_runs_full_regression'
ARTIFACTS.mkdir(parents=True,exist_ok=True)
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
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game;
   function attempt(withScreen){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';g.clock=2;
    const carrier=g.player(0,3),nearest=g.player(1,3),screen=g.player(1,4);
    for(const q of g.players)if(q!==carrier&&q!==nearest&&q!==screen&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:1200,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,face:1,dx:1,dy:0,
     moveVX:180,moveVY:0,fatigue:0,breath:1,trickCd:0,dribbleCooldown:0,magicReadyAt:0,dribbleHold:1,firstTouchOutletReadTimer:.8,
     firstTouchControlTimer:0,firstTouchPressure:.6,hideBallTimer:0});
    Object.assign(carrier.src,{dribbling:95,agility:95,stamina:95,magicTrick:'hideBall'});
    Object.assign(nearest,{x:1170,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,face:-1,dx:0,dy:0,moveVX:0,moveVY:0});
    Object.assign(nearest.src,{defence:20,aggression:20});
    Object.assign(screen,{x:1270,y:765,z:0,stun:withScreen?0:1,down:!withScreen,action:'idle',actionTimer:0,
     face:-1,dx:0,dy:0,moveVX:0,moveVY:0});
    Object.assign(screen.src,{defence:95,aggression:95});
    Object.assign(g.ball,{owner:carrier,x:1217,y:777,z:12,pass:false,shot:null,strike:null,attacker:0,lastTouchTeam:0});
    const oldRandom=Math.random;Math.random=()=>.1;
    try{g.tryMagicTrick(carrier);}finally{Math.random=oldRandom;}
    if(withScreen){g.driveAI(screen,1/60);g.driveAI(nearest,1/60);}
    return {hidden:carrier.hideBallTimer>.4,owner:g.ball.owner===carrier,cooldown:carrier.magicReadyAt,fatigue:carrier.fatigue,
     readerCue:screen.magicReadCueTimer||0,counterpressTimer:screen.magicReadCounterpressTimer||0,
     readerTarget:screen.aiTarget,primaryTarget:nearest.aiTarget,readerAction:screen.action};
   }
   return {baseline:attempt(false),screened:attempt(true),buttons:document.querySelectorAll('#touchButtons button[data-act]').length,teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  assert result['baseline']['hidden'] is True,(kind,result)
  assert result['screened']['hidden'] is False,(kind,result)
  assert result['baseline']['readerCue']==0 and result['screened']['readerCue']>0,(kind,result)
  assert result['screened']['counterpressTimer']>0,(kind,result)
  target=result['screened']['readerTarget'];primary_target=result['screened']['primaryTarget']
  assert target is not None and 42<=(target['x']-1200)<=72,(kind,target)
  assert primary_target is not None and ((primary_target['x']-1200)**2+(primary_target['y']-765)**2)**.5<50,(kind,primary_target)
  assert result['screened']['readerAction']=='idle',(kind,result)
  assert result['baseline']['owner'] is True,(kind,result)
  assert result['screened']['owner'] is True,(kind,result)
  assert result['baseline']['cooldown']>0 and result['baseline']['cooldown']==result['screened']['cooldown'],(kind,result)
  assert abs(result['baseline']['fatigue']-result['screened']['fatigue'])<1e-9,(kind,result)
  shot_meta=page.evaluate("""() => {
   const g=SupermagicFootball.game,r=SupermagicFootball.renderer,reader=g.player(1,4);
   g.matchState='play';g.particles=[];g.shake=0;g.flash=0;g.options.showNames=false;g.options.camera='Normal';
   for(const p of g.players){p.moveVX=0;p.moveVY=0;p.dx=0;p.dy=0;p.action='idle';p.actionTimer=0;p.z=0;p.stun=0;p.down=false;}
   // Keep the cue subject at the center of the logical camera on both wide
   // desktop and portrait touch viewports; the old fixed camera clipped the
   // player's ground ring at the lower edge on simulated-touch devices.
   // Isolate the real reader so teammates cannot overdraw its cue at the narrower touch scale.
   g.players=g.players.filter(p=>p===reader);
   g.ball.owner=null;g.ball.x=reader.x;g.ball.y=reader.y;g.ball.vx=0;g.ball.vy=0;g.ball.z=2000;
   function paint(timer){reader.magicReadCueTimer=timer;g.options.reducedFlash=false;r.time=0;r.cameraX=reader.x-r.screenW/2;r.cameraY=reader.y-r.screenH/2;r.frame(g,0,false);return {x:reader.x,y:reader.y,scale:r.scale,offsetX:r.offsetX,offsetY:r.offsetY,screenW:r.screenW,screenH:r.screenH,zoom:r.cameraZoom};}
   return paint(.48);
  }""")
  base_path=ARTIFACTS/f'magic-trick-read-cue-{kind}-without.png'
  cue_path=ARTIFACTS/f'magic-trick-read-cue-{kind}-with.png'
  page.evaluate("""() => {const g=SupermagicFootball.game,r=SupermagicFootball.renderer,reader=g.player(1,4);reader.magicReadCueTimer=0;g.options.reducedFlash=false;r.time=0;r.cameraX=reader.x-r.screenW/2;r.cameraY=reader.y-r.screenH/2;r.frame(g,0,false);}""")
  page.locator('#field').screenshot(path=str(base_path))
  page.evaluate("""() => {const g=SupermagicFootball.game,r=SupermagicFootball.renderer,reader=g.player(1,4);reader.magicReadCueTimer=.48;g.options.reducedFlash=false;r.time=0;r.cameraX=reader.x-r.screenW/2;r.cameraY=reader.y-r.screenH/2;r.frame(g,0,false);}""")
  page.locator('#field').screenshot(path=str(cue_path))
  base_image=Image.open(base_path).convert('RGB');cue_image=Image.open(cue_path).convert('RGB')
  assert base_image.size==cue_image.size,(kind,base_image.size,cue_image.size)
  difference=ImageChops.difference(base_image,cue_image);changed=difference.getbbox()
  assert changed and changed[2]-changed[0]>=12 and changed[3]-changed[1]>=6,(kind,'READ! cue not visible in game-scale screenshot',changed)
  print('SCREEN_READ_CUE_SCREENSHOT',kind,str(cue_path.relative_to(ROOT)),cue_image.size,changed,flush=True)
  assert not errors,(kind,errors)
  print('PASS',kind,'secondary first-touch screen reads the named Magic Trick while a turned-away nearest marker alone does not',flush=True)
  ctx.close()
 browser.close()
