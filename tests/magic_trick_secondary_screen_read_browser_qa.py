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
   function attempt(withScreen,ballSide='exposed',dribbling=95,randomValue=.1,screenHeading='face',team=0,postReadDiagonal=false){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';g.clock=2;
    const dir=team===0?1:-1,carrier=g.player(team,3),nearest=g.player(1-team,3),screen=g.player(1-team,4);
    for(const q of g.players)if(q!==carrier&&q!==nearest&&q!==screen&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:1200,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,face:dir,dx:dir,dy:0,
     moveVX:dir*180,moveVY:0,fatigue:0,breath:1,trickCd:0,dribbleCooldown:0,magicReadyAt:0,dribbleHold:1,firstTouchOutletReadTimer:.8,
     firstTouchControlTimer:0,firstTouchPressure:.6,hideBallTimer:0});
    Object.assign(carrier.src,{dribbling,agility:95,stamina:95,magicTrick:'hideBall'});
    Object.assign(nearest,{x:1200-dir*30,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,face:-dir,dx:0,dy:0,moveVX:0,moveVY:0});
    Object.assign(nearest.src,{defence:20,aggression:20});
    Object.assign(screen,{x:1200+dir*70,y:765,z:0,stun:withScreen?0:1,down:!withScreen,action:'idle',actionTimer:0,
     face:-dir,dx:0,dy:0,moveVX:0,moveVY:0});
    if(screenHeading==='perpendicular'){screen.dx=0;screen.dy=1;}
    else if(screenHeading==='movement-perpendicular'){screen.moveVX=0;screen.moveVY=1;}
    else if(screenHeading==='diagonal-toward'){screen.dx=-dir;screen.dy=-.25;}
    Object.assign(screen.src,{defence:95,aggression:95});
    const ballOffset=ballSide==='shielded'?-dir*17:dir*17;
    Object.assign(g.ball,{owner:carrier,x:1200+ballOffset,y:777,z:12,pass:false,shot:null,strike:null,attacker:0,lastTouchTeam:team});
    const oldRandom=Math.random;Math.random=()=>randomValue;
    try{g.tryMagicTrick(carrier);}finally{Math.random=oldRandom;}
    // Isolate the earned read-screen fallback from the separate established
    // first-touch outlet/containment assignment tested below.
    if(withScreen)carrier.firstTouchOutletReadTimer=0;
    if(postReadDiagonal)Object.assign(carrier,{dx:dir*.8,dy:.6});
    if(withScreen){g.driveAI(screen,1/60);g.driveAI(nearest,1/60);}
    return {hidden:carrier.hideBallTimer>.4,owner:g.ball.owner===carrier,cooldown:carrier.magicReadyAt,fatigue:carrier.fatigue,
     readerCue:screen.magicReadCueTimer||0,counterpressTimer:screen.magicReadCounterpressTimer||0,
     readerTarget:screen.aiTarget,primaryTarget:nearest.aiTarget,readerAction:screen.action,
     readerFace:screen.face,readerTimer:screen.magicReadCounterpressTimer,
     humans:g.humans,awayInControl:g.inControl(1),carrierHideBallTimer:carrier.hideBallTimer};
   }
   function attemptMomentum(team,mode){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';g.clock=2;
    const dir=team===0?1:-1,carrier=g.player(team,3),defender=g.player(1-team,3);
    for(const q of g.players)if(q!==carrier&&q!==defender&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:1200,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     face:dir,dx:dir,dy:0,moveVX:dir*180,moveVY:0,firstTouchOutletReadTimer:0,
     firstTouchControlTimer:0,firstTouchPressure:0,hideBallTimer:0,magicReadyAt:0,fatigue:0});
    Object.assign(carrier.src,{dribbling:50,magicTrick:'hideBall'});
    const motion=mode==='approach'?{moveVX:dir*144,moveVY:-108}:
     mode==='retreat'?{moveVX:-dir*144,moveVY:108}:{moveVX:0,moveVY:0};
    Object.assign(defender,{x:1200-dir*50,y:795,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     face:dir,dx:0,dy:0,...motion});
    Object.assign(defender.src,{defence:95});
    Object.assign(g.ball,{owner:carrier,x:1200+dir*12,y:765,z:0,pass:false,passTarget:null,
     attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
    g.tryMagicTrick(carrier);
    return {team,mode,hidden:carrier.hideBallTimer>.4,owner:g.ball.owner===carrier,
     cooldown:carrier.magicReadyAt,fatigue:carrier.fatigue};
   }
   function attemptSecondDirectRead(team,mode){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';g.clock=2;
    const dir=team===0?1:-1,carrier=g.player(team,3),nearest=g.player(1-team,3),second=g.player(1-team,4);
    for(const q of g.players)if(q!==carrier&&q!==nearest&&q!==second&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:1200,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,face:dir,dx:dir,dy:0,
     moveVX:dir*180,moveVY:0,fatigue:0,magicReadyAt:0,firstTouchOutletReadTimer:0,
     firstTouchControlTimer:0,firstTouchPressure:0,hideBallTimer:0});
    Object.assign(carrier.src,{dribbling:50,magicTrick:'hideBall'});
    Object.assign(nearest,{x:1200-dir*25,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     face:-dir,dx:0,dy:0,moveVX:0,moveVY:0,magicReadCueTimer:0});
    Object.assign(nearest.src,{defence:20});
    const motion=mode==='approach'?{moveVX:dir*150,moveVY:-30}:
     mode==='retreat'?{moveVX:-dir*150,moveVY:30}:{moveVX:0,moveVY:0};
    Object.assign(second,{x:1200-dir*58,y:780,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     face:dir,dx:0,dy:0,magicReadCueTimer:0,...motion});
    Object.assign(second.src,{defence:95});
    Object.assign(g.ball,{owner:carrier,x:1200+dir*12,y:765,z:0,pass:false,passTarget:null,
     shot:null,strike:null,attacker:team,lastTouchTeam:team,ordinaryShot:false});
    g.tryMagicTrick(carrier);
    return {team,mode,hidden:carrier.hideBallTimer>.4,owner:g.ball.owner===carrier,
     cooldown:carrier.magicReadyAt,fatigue:carrier.fatigue,readerCue:second.magicReadCueTimer||0,
     nearestCue:nearest.magicReadCueTimer||0,counterpress:second.magicReadCounterpressTimer||0};
   }
   function attemptLightningMomentum(team,mode){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';g.clock=2;
    const dir=team===0?1:-1,carrier=g.player(team,3),defender=g.player(1-team,3);
    for(const q of g.players)if(q!==carrier&&q!==defender&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:1200,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     face:dir,dx:dir,dy:0,moveVX:dir*180,moveVY:0});
    Object.assign(carrier.src,{dribbling:50});
    const motion=mode==='approach'?{moveVX:dir*144,moveVY:-108}:
     mode==='retreat'?{moveVX:-dir*144,moveVY:108}:{moveVX:0,moveVY:0};
    Object.assign(defender,{x:1200-dir*50,y:795,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     dx:0,dy:0,face:dir,lightningMark:.32,...motion});
    Object.assign(defender.src,{defence:95});
    Object.assign(g.ball,{owner:carrier,x:1200+dir*12,y:765,z:0,pass:false,passTarget:null,
     attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
    carrier.lightningPending={remaining:.32,target:defender};
    const hit=g.resolveLightningTrick(carrier),event=g.events.at(-1);
    return {team,mode,hit,countered:event?.countered,stun:defender.stun,
     owner:g.ball.owner===carrier,pending:carrier.lightningPending===null,mark:defender.lightningMark};
   }
   function attemptDirectReadEligibility(team,mode){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';g.clock=2;
    const dir=team===0?1:-1,carrier=g.player(team,3),defender=g.player(1-team,3);
    for(const q of g.players)if(q!==carrier&&q!==defender&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:1200,y:765,z:0,down:false,stun:0,action:'idle',actionTimer:0,
     face:dir,dx:dir,dy:0,moveVX:dir*180,moveVY:0,firstTouchOutletReadTimer:0,
     firstTouchControlTimer:0,firstTouchPressure:0,hideBallTimer:0,magicReadyAt:0,fatigue:0});
    Object.assign(carrier.src,{dribbling:50,magicTrick:'hideBall'});
    Object.assign(defender,{x:1200-dir*58,y:780,z:0,down:false,stun:0,invuln:0,action:'idle',
     actionTimer:0,slideTimer:0,face:dir,dx:0,dy:0,moveVX:dir*150,moveVY:-30});
    const patches={
     down:{down:true},invulnerable:{invuln:.2},airborne:{z:24},slideTimer:{slideTimer:.2},
     slideRecovery:{action:'slide',actionTimer:.3},hurtRecovery:{action:'hurt',actionTimer:.3},
     impactPending:{shotImpactKnockdownPending:.2},impactDown:{shotImpactKnockdownTimer:.2},
     impactRise:{shotImpactRiseTimer:.2},shotDown:{action:'shotDown'},shotGetUp:{action:'shotGetUp'},
     glancing:{moveVX:dir*35,moveVY:95}
    };
    Object.assign(defender,patches[mode]);
    Object.assign(defender.src,{defence:95});
    Object.assign(g.ball,{owner:carrier,x:1200+dir*12,y:765,z:0,pass:false,passTarget:null,
     attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
    g.tryMagicTrick(carrier);
    return {team,mode,countered:g.events.at(-1)?.countered,hidden:carrier.hideBallTimer>.4,
     cue:defender.magicReadCueTimer||0,owner:g.ball.owner===carrier};
   }
   function attemptProjectedScreen(team,mode){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';g.clock=2;
    const dir=team===0?1:-1,carrier=g.player(team,3),screen=g.player(1-team,3);
    for(const q of g.players)if(q!==carrier&&q!==screen&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:1200,y:765,z:0,down:false,stun:0,action:'idle',actionTimer:0,
     face:dir,dx:dir,dy:0,moveVX:dir*180,moveVY:0,firstTouchOutletReadTimer:.8,
     firstTouchControlTimer:0,firstTouchPressure:.6,hideBallTimer:0,magicReadyAt:0,fatigue:0});
    Object.assign(carrier.src,{dribbling:50,magicTrick:'hideBall'});
    const motion=mode==='high-turn'||mode==='low-turn'?
     {dx:-dir,dy:-1,moveVX:dir*220,moveVY:0}:
     mode==='retreating'?{dx:0,dy:0,moveVX:0,moveVY:180}:{dx:-dir,dy:-1,moveVX:0,moveVY:0};
    Object.assign(screen,{x:1200+dir*68,y:840,z:0,down:false,stun:0,invuln:0,action:'idle',
     actionTimer:0,slideTimer:0,face:-dir,magicReadCueTimer:0,magicReadCounterpressTimer:0,...motion});
    Object.assign(screen.src,{defence:92,agility:mode==='low-turn'?1:100});
    Object.assign(g.ball,{owner:carrier,x:1200+dir*17,y:777,z:0,pass:false,passTarget:null,
     attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
    const original=Math.random;Math.random=()=>.1;
    try{g.tryMagicTrick(carrier);}finally{Math.random=original;}
    return {team,mode,countered:g.events.at(-1)?.countered,hidden:carrier.hideBallTimer>.4,
     cue:screen.magicReadCueTimer||0,counterpress:screen.magicReadCounterpressTimer||0,owner:g.ball.owner===carrier};
   }
   function attemptCoverPriority(team){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';g.clock=2;
    const dir=team===0?1:-1,carrier=g.player(team,3),primary=g.player(1-team,3),
     screen=g.player(1-team,4),runner=g.player(team,4);
    for(const q of g.players)if(q!==carrier&&q!==primary&&q!==screen&&q!==runner&&!q.keeper){q.down=true;q.stun=1;}
    Object.assign(carrier,{x:1200,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     face:dir,dx:dir,dy:0,moveVX:dir*180,moveVY:0,hideBallTimer:0,
     firstTouchOutletReadTimer:0,firstTouchControlTimer:0,firstTouchPressure:0});
    Object.assign(primary,{x:1200+dir*20,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     face:-dir,dx:0,dy:0,moveVX:0,moveVY:0});
    Object.assign(screen,{x:1200+dir*80,y:765,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     face:-dir,dx:0,dy:0,moveVX:0,moveVY:0,magicReadCounterpressTimer:.42,aiTimer:0});
    Object.assign(runner,{x:1200+dir*240,y:985,z:0,stun:0,down:false,action:'idle',actionTimer:0,
     dx:0,dy:0,moveVX:0,moveVY:0,
     aiGiveAndGoRun:{receiverId:carrier.src.id,target:{x:1200+dir*340,y:985},expires:g.clock+1}});
    Object.assign(g.ball,{owner:carrier,x:1200+dir*12,y:765,z:0,pass:false,passTarget:null,
     attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
    g.driveAI(screen,1/60);
    return {team,target:screen.aiTarget,
     expected:{x:1200+dir*(14.4+(340-14.4)*.56),y:765+220*.56},
     owner:g.ball.owner===carrier,timer:screen.magicReadCounterpressTimer||0};
   }
   const directCounters=[];
   for(const team of [0,1])for(const mode of ['approach','retreat','stationary'])directCounters.push(attemptSecondDirectRead(team,mode));
   const lightningMomentum=[];
   for(const team of [0,1])for(const mode of ['approach','retreat','stationary'])lightningMomentum.push(attemptLightningMomentum(team,mode));
   const momentum=[];
   for(const team of [0,1])for(const mode of ['approach','retreat','stationary'])momentum.push(attemptMomentum(team,mode));
   const directEligibility=[];
   for(const team of [0,1])for(const mode of ['down','invulnerable','airborne','slideTimer','slideRecovery','hurtRecovery',
    'impactPending','impactDown','impactRise','shotDown','shotGetUp','glancing'])
    directEligibility.push(attemptDirectReadEligibility(team,mode));
   const projectedScreens=[];
   for(const team of [0,1])for(const mode of ['high-turn','low-turn','stationary','retreating'])
    projectedScreens.push(attemptProjectedScreen(team,mode));
   return {baseline:attempt(false),screened:attempt(true),shielded:attempt(true,'shielded'),
    lowSkill:attempt(true,'exposed',1,.22),neutralSkill:attempt(true,'exposed',50,.22),eliteSkill:attempt(true,'exposed',100,.22),
    perpendicular:attempt(true,'exposed',95,.1,'perpendicular',0),
    perpendicularMirrored:attempt(true,'exposed',95,.1,'perpendicular',1),
    movementPerpendicular:attempt(true,'exposed',95,.1,'movement-perpendicular',0),
    diagonalCounterpress:[attempt(true,'exposed',95,.1,'face',0,true),attempt(true,'exposed',95,.1,'face',1,true)],
    momentum,directCounters,directEligibility,projectedScreens,lightningMomentum,coverPriority:[attemptCoverPriority(0),attemptCoverPriority(1)],
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length,teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  assert result['baseline']['hidden'] is True,(kind,result)
  assert result['screened']['hidden'] is False,(kind,result)
  assert result['baseline']['readerCue']==0 and result['screened']['readerCue']>0,(kind,result)
  assert result['screened']['counterpressTimer']>0,(kind,result)
  assert result['shielded']['hidden'] is True,(kind,result)
  assert result['shielded']['readerCue']==0 and result['shielded']['counterpressTimer']==0,(kind,result)
  assert result['lowSkill']['hidden'] is False and result['lowSkill']['readerCue']>0,(kind,result['lowSkill'])
  assert result['neutralSkill']['hidden'] is False and result['neutralSkill']['readerCue']>0,(kind,result['neutralSkill'])
  assert result['eliteSkill']['hidden'] is True and result['eliteSkill']['readerCue']==0,(kind,result['eliteSkill'])
  assert len(result['momentum'])==6,(kind,result)
  for row in result['momentum']:
   assert row['owner'] is True,(kind,row)
   assert row['cooldown']>2 and row['fatigue']>0,(kind,row)
   assert row['hidden'] is (row['mode']!='approach'),(kind,'residual approach should counter, retreat/stationary should not',row)
  assert len(result['diagonalCounterpress'])==2,(kind,result)
  for team,row in enumerate(result['diagonalCounterpress']):
   target=row['readerTarget']
   assert row['owner'] is True and row['readerAction']=='idle',(kind,row)
   assert target is not None and 42<=((target['x']-1200)*(1 if team==0 else -1))<=72,(kind,row)
   assert abs(target['y']-765)>20,(kind,'actual-engine counterpress must follow the post-read diagonal input, not old horizontal momentum',row)
  assert len(result['coverPriority'])==2,(kind,result)
  for row in result['coverPriority']:
   assert row['owner'] is True and row['timer']>0,(kind,row)
   assert row['target'] is not None,(kind,row)
   assert abs(row['target']['x']-row['expected']['x'])<1,(kind,'give-and-go cover must outrank temporary Magic Trick counterpress',row)
   assert abs(row['target']['y']-row['expected']['y'])<1,(kind,'give-and-go cover must retain its return-pass corridor',row)
  assert len(result['directCounters'])==6,(kind,result)
  for row in result['directCounters']:
   assert row['owner'] is True and row['cooldown']>0 and row['fatigue']>0,(kind,row)
   assert row['counterpress']==0,(kind,row)
   if row['mode']=='approach':
    assert row['hidden'] is False and row['readerCue']>0,(kind,row)
    assert row['nearestCue']==0,(kind,row)
   else:
    assert row['hidden'] is True and row['readerCue']==0,(kind,row)
   assert row['nearestCue']==0,(kind,row)
  assert len(result['directEligibility'])==24,(kind,result)
  for row in result['directEligibility']:
   assert row['countered'] is False and row['hidden'] is True,(kind,'only active, meaningfully closing defenders may read a named Trick',row)
   assert row['cue']==0 and row['owner'] is True,(kind,row)
  assert len(result['projectedScreens'])==8,(kind,result)
  for row in result['projectedScreens']:
   assert row['owner'] is True,(kind,row)
   if row['mode']=='high-turn':
    assert row['countered'] is True and row['hidden'] is False,(kind,'high-Agility second marker should reach the visible screen lane',row)
    assert row['cue']>0 and row['counterpress']>0,(kind,row)
   else:
    assert row['countered'] is False and row['hidden'] is True,(kind,'low-Agility, stationary and retreating markers must not gain the screen read',row)
    assert row['cue']==0 and row['counterpress']==0,(kind,row)
  assert len(result['lightningMomentum'])==6,(kind,result)
  for row in result['lightningMomentum']:
   expected=row['mode']=='approach'
   assert row['countered'] is expected,(kind,'Lightning residual-momentum read mismatch',row)
   assert row['hit'] is (not expected),(kind,'Lightning hit/counter result mismatch',row)
   assert row['stun']==(0 if expected else .32),(kind,'Lightning target stun mismatch',row)
   assert row['owner'] is True and row['pending'] is True and row['mark']==0,(kind,row)
  for key in ('perpendicular','perpendicularMirrored','movementPerpendicular'):
   assert result[key]['hidden'] is True,(kind,key,result[key])
   assert result[key]['readerCue']==0 and result[key]['counterpressTimer']==0,(kind,key,result[key])
   assert result[key]['owner'] is True,(kind,key,result[key])
  assert result['lowSkill']['cooldown']==result['neutralSkill']['cooldown']==result['eliteSkill']['cooldown'],(kind,result)
  assert abs(result['lowSkill']['fatigue']-result['eliteSkill']['fatigue'])<1e-9,(kind,result)
  target=result['screened']['readerTarget'];primary_target=result['screened']['primaryTarget']
  assert target is not None and 42<=(target['x']-1200)<=72,(kind,target,result['screened'])
  assert primary_target is not None and ((primary_target['x']-1200)**2+(primary_target['y']-765)**2)**.5<50,(kind,primary_target)
  assert result['screened']['readerAction']=='idle',(kind,result)
  assert result['baseline']['owner'] is True,(kind,result)
  assert result['screened']['owner'] is True,(kind,result)
  assert result['baseline']['cooldown']>0 and result['baseline']['cooldown']==result['screened']['cooldown'],(kind,result)
  assert abs(result['baseline']['fatigue']-result['screened']['fatigue'])<1e-9,(kind,result)
  base_path=ARTIFACTS/f'magic-trick-read-cue-{kind}-without.png'
  cue_path=ARTIFACTS/f'magic-trick-read-cue-{kind}-with.png'
  page.evaluate("""() => {
   const g=SupermagicFootball.game,r=SupermagicFootball.renderer,reader=g.player(1,4);
   if(!reader||!r?.drawPlayer||!r?.drawField)throw Error('production match renderer or READ subject unavailable');
   g.matchState='play';g.particles=[];g.shake=0;g.flash=0;g.options.showNames=false;g.options.camera='Normal';g.options.reducedFlash=false;
   const width=innerWidth,height=innerHeight,screenH=720,screenW=Math.max(1280,720*width/height),scale=Math.min(width/screenW,height/screenH);
   r.screenW=screenW;r.screenH=screenH;r.scale=scale;r.dpr=1;r.cameraZoom=1;r.time=0;r.frameDelta=0;r.inMatchDraw=false;
   for(const p of g.players){p.moveVX=0;p.moveVY=0;p.dx=0;p.dy=0;p.action='idle';p.actionTimer=0;p.z=0;p.stun=0;p.down=false;}
   g.ball.owner=null;g.ball.x=reader.x;g.ball.y=reader.y;g.ball.vx=0;g.ball.vy=0;g.ball.z=2000;
   function paint(timer,id){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.id=id;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#102b1e';ctx.fillRect(0,0,width,height);
    ctx.setTransform(scale,0,0,scale,width/2-reader.x*scale,height*.72-reader.y*scale);
    r.drawField(ctx,g);
    const subject={...reader,preview:false,controlled:false,action:'idle',actionTimer:0,z:0,stun:0,down:false,moveVX:0,moveVY:0,dx:0,dy:0,face:1,visualFacing:{kind:'front',side:1},magicReadCueTimer:timer};
    r.drawPlayer(ctx,subject,g);
    window.__smfReadCueCanvases=window.__smfReadCueCanvases||{};
    window.__smfReadCueCanvases[id]=canvas;
    return {scale,width,height,playerX:reader.x,playerY:reader.y};
   }
   return {base:paint(0,'smf-read-cue-capture-base'),cue:paint(.48,'smf-read-cue-capture-with')};
  }""")
  expected_width,expected_height=(1280,720) if kind=='desktop' else (844,390)
  def expose_capture(capture_id):
   page.evaluate("""id => {
    const canvas=window.__smfReadCueCanvases?.[id];
    if(!(canvas instanceof HTMLCanvasElement))throw new Error('isolated production-renderer canvas unavailable: '+id);
    canvas.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;display:block;z-index:2147483647;margin:0;padding:0;border:0;opacity:1;transform:none;pointer-events:none;visibility:visible;';
    document.body.appendChild(canvas);
    for(const child of document.body.children)if(child!==canvas)child.style.visibility='hidden';
   }""",capture_id)
   target=page.locator('#'+capture_id)
   assert target.count()==1,(kind,capture_id,'unique isolated canvas must exist')
   assert target.evaluate('(el)=>el.tagName')=='CANVAS',(kind,capture_id,'screenshot target must be a canvas')
   box=target.bounding_box()
   assert box and abs(box['x'])<1 and abs(box['y'])<1 and abs(box['width']-expected_width)<2 and abs(box['height']-expected_height)<2,(kind,capture_id,'canvas must cover the viewport',box)
   return target
  base_canvas=expose_capture('smf-read-cue-capture-base')
  base_canvas.screenshot(path=str(base_path))
  cue_canvas=expose_capture('smf-read-cue-capture-with')
  cue_canvas.screenshot(path=str(cue_path))
  base_image=Image.open(base_path).convert('RGB');cue_image=Image.open(cue_path).convert('RGB')
  assert base_image.size==cue_image.size,(kind,base_image.size,cue_image.size)
  difference=ImageChops.difference(base_image,cue_image);changed=difference.getbbox()
  assert changed and changed[2]-changed[0]>=12 and changed[3]-changed[1]>=6,(kind,'READ! cue not visible in game-scale screenshot',changed)
  print('SCREEN_READ_CUE_SCREENSHOT',kind,str(cue_path.relative_to(ROOT)),cue_image.size,changed,flush=True)
  assert not errors,(kind,errors)
  print('PASS',kind,'secondary screen reads and residual-momentum direct Magic Trick counters behave correctly',flush=True)
  ctx.close()
 browser.close()
