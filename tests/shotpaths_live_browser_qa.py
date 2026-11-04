"""SH01/SH02 live ball physics in actual Chromium desktop and simulated-touch fixtures."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf8')
JS = r"""() => {
  const game=window.SupermagicFootball?.game;
  if(!game || typeof game.updateBall!=='function')throw Error('playable engine not available');
  const profiles={books:{amplitude:28,frequency:10},serpent:{amplitude:45,frequency:15}};
  const initialY=765,results=[];
  function expected(id,dir,t){
    const p=profiles[id],age=Math.min(1.65,t),s=Math.sin(age*p.frequency);
    const fade=age>1.3?Math.pow((1.65-age)/.35,2)*(3-2*((1.65-age)/.35)):1;
    return dir*p.amplitude*s*s*s*fade;
  }
  for(const id of ['books','serpent'])for(const dir of [-1,1])for(const fps of [30,60,120]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    game.matchState='paused';game.wind={x:0,y:0};
    game.ball={...game.ball,x:1280,y:initialY,z:0,vx:250,vy:0,vz:0,owner:null,age:0,
      canCollect:5,attacker:-1,ordinaryShot:false,pass:false,strike:null,trail:[],
      shot:{id,behavior:'zigzag',direction:dir,zigzagAmplitude:profiles[id].amplitude,
        zigzagFrequency:profiles[id].frequency,aimY:initialY,level:2}};
    let t=0;const samples={};
    for(const end of [.2,.32,.8,1.65,1.9]){
      while(t<end-1e-9){
        const dt=Math.min(1/fps,end-t);
        game.updateBall(dt);t+=dt;
      }
      const b=game.ball,offset=b.y-initialY,target=expected(id,dir,end);
      if(!Number.isFinite(offset)||Math.abs(offset-target)>.0001)
        throw Error('Live zigzag not phase-correct '+JSON.stringify({id,dir,fps,end,offset,target}));
      if(!Number.isFinite(b.vx)||!Number.isFinite(b.vy)||Math.hypot(b.vx,b.vy)>900||b.vx>250.0001||b.vx<=0)
        throw Error('Live zigzag exceeded bounded flight speed '+JSON.stringify({id,dir,fps,end,vx:b.vx,vy:b.vy}));
      samples[String(end)]={offset,vy:b.vy};
    }
    if(Math.abs(samples['1.9'].offset)>.0001||Math.abs(samples['1.9'].vy)>.0001)
      throw Error('Zigzag retained sideways drift '+JSON.stringify({id,dir,fps,samples}));
    results.push({id,dir,fps,at20:samples['0.2'].offset,at32:samples['0.32'].offset});
  }
  if(Math.abs(results[0].at20)<5)throw Error('Books lateral bend not visible');
  // Exercise the actual keeper swept-contact path with each mirrored profile.
  // The segment crosses the keeper plane between endpoints, so endpoint-only
  // proximity checks would miss this save.
  for(const id of ['books','serpent'])for(const keeperSide of [0,1])for(const dir of [-1,1]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    const keeper=game.player(keeperSide,0),toward=keeperSide===0?-1:1;
    keeper.x=keeperSide===0?220:3300;keeper.y=initialY;keeper.fatigue=0;keeper.diveCooldown=0;keeper.stun=0;
    const b=game.ball,offset=expected(id,dir,.32);
    b.owner=null;b.attacker=1-keeperSide;b.x=keeper.x-toward*20;b.y=initialY+offset;b.z=12;
    b.vx=toward*1100;b.vy=0;b.vz=0;b.age=.32;
    b.shot={id,behavior:'zigzag',direction:dir,zigzagAmplitude:profiles[id].amplitude,zigzagFrequency:profiles[id].frequency,level:2};
    const previous={x:b.x,y:b.y,z:b.z};b.x+=toward*60;
    const caught=game.trySweptKeeperDive(previous);
    if(!caught||!game.events.some(e=>e.type==='keeperContact'))
      throw Error('Swept keeper contact failed '+JSON.stringify({id,keeperSide,dir,caught,keeper:{x:keeper.x,y:keeper.y},ball:{x:b.x,y:b.y,z:b.z}}));
    if(b.shot||(b.attacker!==keeperSide&&b.owner!==keeper))
      throw Error('Swept keeper contact did not resolve transformed shot '+JSON.stringify({id,keeperSide,dir,shot:b.shot,attacker:b.attacker}));
  }
  const curveAmplitude=38,curveDuration=1.65;
  function curveOffset(dir,t){return dir*curveAmplitude*Math.sin(2*Math.PI*Math.min(curveDuration,t)/curveDuration)**3;}
  // Live curve path at 30/60/120 Hz, mirrored for both launch directions.
  for(const dir of [-1,1])for(const fps of [30,60,120]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    game.matchState='paused';game.wind={x:0,y:0};game.players=[];
    const y0=765,b=game.ball;
    Object.assign(b,{x:1280,y:y0,z:0,vx:250,vy:0,vz:0,owner:null,age:0,canCollect:5,attacker:-1,
      ordinaryShot:false,pass:false,strike:null,trail:[],shot:{id:'banana',behavior:'curve',direction:dir,aimY:y0,level:2}});
    let t=0;for(const end of [.2,.4,.8,1.2,1.65,1.9]){
      while(t<end-1e-9){const dt=Math.min(1/fps,end-t);game.updateBall(dt);t+=dt;}
      const expected=curveOffset(dir,end),actual=b.y-y0;
      if(!Number.isFinite(actual)||Math.abs(actual-expected)>.0001)
        throw Error('Live curve path diverged '+JSON.stringify({dir,fps,end,actual,expected,vy:b.vy}));
    }
    if(Math.abs(b.y-y0)>.0001||Math.abs(b.vy)>.0001)throw Error('Curve retained lateral drift '+JSON.stringify({dir,fps,y:b.y-y0,vy:b.vy}));
  }
  // Goal-mouth scores and upper/lower crossbar misses use the actual score adjudicator.
  const field={x:150,y:155,w:2260.8,h:1220},goalTop=620,goalBottom=910,center=(goalTop+goalBottom)/2;
  function launch(goalTeam,y,direction,behavior='curve',homingOffset=0){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    game.wind={x:0,y:0};game.players=[];const b=game.ball;
    const toward=goalTeam===0?1:-1,goalX=goalTeam===0?field.x+field.w:field.x;
    Object.assign(b,{x:goalX-toward*500,y,z:0,vx:toward*1250,vy:0,vz:0,owner:null,age:0,canCollect:5,attacker:-1,
      ordinaryShot:false,pass:false,strike:null,trail:[],shot:{id:behavior==='spiral'?'tornado':behavior==='ricochet'?'nuts':behavior==='homing'?'target':'banana',behavior,direction,aimY:y,homingOffset,level:2}});
    for(let i=0;i<90&&game.score[0]+game.score[1]===0;i++)game.updateBall(1/120);
    return {score:game.score.slice(),ball:{x:b.x,y:b.y,vx:b.vx},events:game.events.map(e=>e.type)};
  }
  for(const team of [0,1]){
    const result=launch(team,center,team===0?1:-1);
    if(result.score[team]!==1)throw Error('Signed curve failed to score through goal mouth '+JSON.stringify({team,result}));
  }
  const topMiss=launch(0,goalTop+10,-1),bottomMiss=launch(1,goalBottom-10,1);
  if(topMiss.score[0]||bottomMiss.score[1]||topMiss.events.includes('goal')||bottomMiss.events.includes('goal'))
    throw Error('Curve incorrectly passed through upper/lower crossbar '+JSON.stringify({topMiss,bottomMiss}));
  for(const team of [0,1]){
    const result=launch(team,center,team===0?1:-1,'spiral');
    if(result.score[team]!==1)throw Error('Spiral failed to score through goal mouth '+JSON.stringify({team,result}));
  }
  const spiralTopMiss=launch(0,goalTop+10,-1,'spiral'),spiralBottomMiss=launch(1,goalBottom-10,1,'spiral');
  if(spiralTopMiss.score[0]||spiralBottomMiss.score[1]||spiralTopMiss.events.includes('goal')||spiralBottomMiss.events.includes('goal'))
    throw Error('Spiral incorrectly passed through upper/lower crossbar '+JSON.stringify({spiralTopMiss,spiralBottomMiss}));
  for(const team of [0,1]){
    const result=launch(team,center,team===0?1:-1,'ricochet');
    if(result.score[team]!==1)throw Error('Ricochet failed to score through goal mouth '+JSON.stringify({team,result}));
  }
  function homingSample(offset,t){const u=Math.min(1,Math.max(0,t/1.65));return {y:offset*u*u*(3-2*u),vy:offset*6*u*(1-u)/1.65};}
  for(const offset of [-60,60])for(const fps of [30,60,120]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    game.matchState='paused';game.wind={x:0,y:0};game.players=[];const b=game.ball,y0=765;
    Object.assign(b,{x:1280,y:y0,z:0,vx:250,vy:0,vz:0,owner:null,age:0,canCollect:5,attacker:-1,ordinaryShot:false,pass:false,strike:null,trail:[],
      shot:{id:'target',behavior:'homing',aimY:y0+offset,homingOffset:offset,level:2}});
    let t=0;for(const end of [.2,.4,.8,1.2,1.65,1.9]){
      while(t<end-1e-9){const dt=Math.min(1/fps,end-t);game.updateBall(dt);t+=dt;}
      const sample=homingSample(offset,end),actual=b.y-y0;
      if(Math.abs(actual-sample.y)>.0001||Math.abs(b.vy-sample.vy)>.0001||!Number.isFinite(actual))
        throw Error('Live homing correction diverged '+JSON.stringify({offset,fps,end,actual,vy:b.vy,sample}));
    }
  }
  for(const team of [0,1]){
    game.init({home:0,away:9,humans:1,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    const shooter=game.player(team,3);shooter.src.shot='target';shooter.src.superAbility={type:'shoot'};shooter.specialCd=0;game.ball.owner=shooter;
    if(!game.shoot(shooter,true))throw Error('Human/CPU homing launch failed '+team);
    if(!Number.isFinite(game.ball.shot.homingOffset)||Math.abs(game.ball.shot.homingOffset)>70||!Number.isFinite(game.ball.targetY))
      throw Error('Homing launch did not preserve a bounded selected aim '+JSON.stringify({team,shot:game.ball.shot,targetY:game.ball.targetY}));
  }
  for(const team of [0,1]){
    const result=launch(team,center,team===0?1:-1,'homing',team===0?40:-40);
    if(result.score[team]!==1)throw Error('Homing shot failed to score through goal mouth '+JSON.stringify({team,result}));
  }
  const homingTopMiss=launch(0,goalTop+6,-1,'homing',-70),homingBottomMiss=launch(1,goalBottom-6,1,'homing',70);
  if(homingTopMiss.score[0]||homingBottomMiss.score[1]||homingTopMiss.events.includes('goal')||homingBottomMiss.events.includes('goal'))
    throw Error('Homing became an unavoidable goal near the crossbar '+JSON.stringify({homingTopMiss,homingBottomMiss}));
  for(const keeperSide of [0,1])for(const sign of [-1,1]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    const keeper=game.player(keeperSide,0),toward=keeperSide===0?-1:1,lane=center+homingSample(sign*45,.4).y;
    keeper.x=keeperSide===0?220:3300;keeper.y=lane;keeper.fatigue=0;keeper.diveCooldown=0;keeper.stun=0;
    const b=game.ball;b.owner=null;b.attacker=1-keeperSide;b.x=keeper.x-toward*20;b.y=lane;b.z=12;b.vx=toward*1100;b.vy=0;b.vz=0;b.age=.4;
    b.shot={id:'target',behavior:'homing',direction:sign,aimY:lane+sign*45,homingOffset:sign*45,level:2};
    const previous={x:b.x,y:b.y,z:b.z};b.x+=toward*60;const caught=game.trySweptKeeperDive(previous);
    if(!caught||!game.events.some(e=>e.type==='keeperContact')||b.shot)throw Error('Keeper did not resolve bounded homing shot '+JSON.stringify({keeperSide,sign,caught,shot:b.shot}));
  }
  game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
  game.players=[];let rb=game.ball;Object.assign(rb,{x:1200,y:field.y+4,z:0,vx:0,vy:-1000,vz:0,owner:null,attacker:-1,age:.2,canCollect:5,
    ordinaryShot:false,pass:false,strike:null,shot:{id:'nuts',behavior:'ricochet',direction:1,level:2}});
  game.updateBall(.01);
  if(rb.shot.ricochetBounces!==1||rb.vy!==650||rb.shot.behavior!=='ricochet')throw Error('First ricochet bank was not counted '+JSON.stringify({shot:rb.shot,vy:rb.vy}));
  rb.y=field.y+4;rb.vy=-1000;game.updateBall(.01);
  if(rb.shot.ricochetBounces!==2||rb.vy!==650||rb.shot.behavior!=='normal')throw Error('Second bank did not cap transformed ricochet '+JSON.stringify({shot:rb.shot,vy:rb.vy}));
  rb.y=field.y+4;rb.vy=-1000;game.updateBall(.01);
  if(rb.shot.ricochetBounces!==2||rb.shot.behavior!=='normal')throw Error('Capped ricochet bank count increased '+JSON.stringify(rb.shot));
  game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
  game.players=[];rb=game.ball;Object.assign(rb,{x:field.x+field.w-7,y:goalTop-20,z:0,vx:300,vy:0,vz:0,owner:null,attacker:-1,age:.2,canCollect:5,
    ordinaryShot:false,pass:false,strike:null,shot:{id:'nuts',behavior:'ricochet',direction:1,level:2}});
  game.updateBall(.05);
  if(rb.shot.ricochetBounces!==1||rb.vx>=0||game.score[0]||game.score[1])throw Error('Missed goal-line bank failed '+JSON.stringify({shot:rb.shot,vx:rb.vx,score:game.score}));
  game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
  game.players=[];rb=game.ball;Object.assign(rb,{x:field.x+field.w-7,y:goalTop-20,z:0,vx:300,vy:0,vz:0,owner:null,attacker:-1,age:.2,canCollect:5,
    ordinaryShot:false,pass:false,strike:null,shot:null});
  game.updateBall(.05);
  if(rb.vx>=0)throw Error('Ordinary missed-goal rebound changed');
  game.resetKickoff(0);if(game.ball.shot||game.ball.shot?.ricochetBounces)throw Error('Ricochet state survived kickoff reset');
  for(const keeperSide of [0,1])for(const dir of [-1,1]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    const keeper=game.player(keeperSide,0),toward=keeperSide===0?-1:1;keeper.x=keeperSide===0?220:3300;keeper.y=center;keeper.fatigue=0;keeper.diveCooldown=0;keeper.stun=0;
    const b=game.ball;b.owner=null;b.attacker=1-keeperSide;b.x=keeper.x-toward*20;b.y=center;b.z=12;b.vx=toward*1100;b.vy=0;b.vz=0;b.age=.4;
    b.shot={id:'nuts',behavior:'ricochet',direction:dir,ricochetBounces:1,level:2};
    const previous={x:b.x,y:b.y,z:b.z};b.x+=toward*60;const caught=game.trySweptKeeperDive(previous);
    if(!caught||!game.events.some(e=>e.type==='keeperContact')||b.shot)throw Error('Ricochet keeper save failed to clear bank state '+JSON.stringify({keeperSide,dir,caught,shot:b.shot}));
  }
  // Direct swept-keeper plane contact at the curve's actual signed lane sample.
  for(const keeperSide of [0,1])for(const dir of [-1,1]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    const keeper=game.player(keeperSide,0),toward=keeperSide===0?-1:1,offset=curveOffset(dir,.4);
    keeper.x=keeperSide===0?220:3300;keeper.y=center+offset;keeper.fatigue=0;keeper.diveCooldown=0;keeper.stun=0;
    const b=game.ball;b.owner=null;b.attacker=1-keeperSide;b.x=keeper.x-toward*20;b.y=center+offset;b.z=12;
    b.vx=toward*1100;b.vy=0;b.vz=0;b.age=.4;b.shot={id:'banana',behavior:'curve',direction:dir,level:2};
    const previous={x:b.x,y:b.y,z:b.z};b.x+=toward*60;const caught=game.trySweptKeeperDive(previous);
    if(!caught||!game.events.some(e=>e.type==='keeperContact'))throw Error('Curve keeper-plane contact failed '+JSON.stringify({keeperSide,dir,caught}));
  }
  // Tornado Shot's actual ball path adds bounded lateral and height offsets
  // over the ordinary ballistic arc without accumulating at the transform end.
  function spiralSample(dir,t){const u=Math.min(1.65,t)/1.65,p=2*Math.PI*u,s=Math.sin(p),c=Math.cos(p),w=2*Math.PI/1.65;
    return {y:dir*42*s*s*s,vy:dir*42*3*w*s*s*c,z:28*s*s,vz:28*2*w*s*c};}
  for(const dir of [-1,1])for(const fps of [30,60,120]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    game.matchState='paused';game.wind={x:0,y:0};game.players=[];const b=game.ball,y0=765,z0=240,vz0=420;
    Object.assign(b,{x:1280,y:y0,z:z0,vx:250,vy:0,vz:vz0,owner:null,age:0,canCollect:5,attacker:-1,
      ordinaryShot:false,pass:false,strike:null,trail:[],shot:{id:'tornado',behavior:'spiral',direction:dir,aimY:y0,level:2}});
    let t=0,baseZ=z0,baseVz=vz0;
    for(const end of [.2,.4,.8,1.2,1.65,1.9]){
      while(t<end-1e-9){const dt=Math.min(1/fps,end-t);game.updateBall(dt);baseZ+=baseVz*dt;baseVz-=500*dt;t+=dt;}
      const sample=spiralSample(dir,end),actualY=b.y-y0,actualZ=b.z-baseZ,actualVy=b.vy,actualVz=b.vz-baseVz;
      if(Math.abs(actualY-sample.y)>.0002||Math.abs(actualVy-sample.vy)>.0002||Math.abs(actualZ-sample.z)>.0002||Math.abs(actualVz-sample.vz)>.0002)
        throw Error('Live spiral path diverged '+JSON.stringify({dir,fps,end,actualY,actualVy,actualZ,actualVz,sample}));
      if(!Number.isFinite(b.z)||b.z<0||b.z>520)throw Error('Spiral height escaped bounds '+JSON.stringify({dir,fps,end,z:b.z}));
    }
  }
  for(const keeperSide of [0,1])for(const dir of [-1,1]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    const keeper=game.player(keeperSide,0),toward=keeperSide===0?-1:1,offset=spiralSample(dir,.4).y;
    keeper.x=keeperSide===0?220:3300;keeper.y=center+offset;keeper.fatigue=0;keeper.diveCooldown=0;keeper.stun=0;
    const b=game.ball;b.owner=null;b.attacker=1-keeperSide;b.x=keeper.x-toward*20;b.y=center+offset;b.z=40;
    b.vx=toward*1100;b.vy=0;b.vz=0;b.age=.4;b.shot={id:'tornado',behavior:'spiral',direction:dir,level:2};
    const previous={x:b.x,y:b.y,z:b.z};b.x+=toward*60;const caught=game.trySweptKeeperDive(previous);
    if(!caught||!game.events.some(e=>e.type==='keeperContact'))throw Error('Spiral keeper-plane contact failed '+JSON.stringify({keeperSide,dir,caught}));
  }
  const count=document.querySelectorAll('#touchButtons button[data-act]').length;
  if(count!==4)throw Error('Original four-button controls changed '+count);
  return {scenarios:results.length,sweptKeeperScenarios:8,curveRateScenarios:6,curveGoalTeams:2,curveCrossbarMisses:2,curveKeeperScenarios:4,spiralRateScenarios:6,spiralGoalTeams:2,spiralCrossbarMisses:2,spiralKeeperScenarios:4,ricochetGoalTeams:2,ricochetBankCaps:2,ricochetEndlineBanks:1,ricochetKeeperSaves:4,ricochetReset:true,homingTurnScenarios:6,homingLaunches:2,homingGoals:2,homingCrossbarMisses:2,homingKeeperSaves:4,controls:count,books:results[0].at20,serpent:results[6].at32};
}"""

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    for label, mobile in [('desktop', False), ('simulated-touch', True)]:
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720} if not mobile else {'width': 844, 'height': 390},
            is_mobile=mobile, has_touch=mobile,
        )
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(HTML, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
        result = page.evaluate(JS)
        assert result['scenarios'] == 12 and result['sweptKeeperScenarios'] == 8 and result['curveRateScenarios'] == 6 and result['curveGoalTeams'] == 2 and result['curveCrossbarMisses'] == 2 and result['curveKeeperScenarios'] == 4 and result['spiralRateScenarios'] == 6 and result['spiralGoalTeams'] == 2 and result['spiralCrossbarMisses'] == 2 and result['spiralKeeperScenarios'] == 4 and result['ricochetGoalTeams'] == 2 and result['ricochetBankCaps'] == 2 and result['ricochetEndlineBanks'] == 1 and result['ricochetKeeperSaves'] == 4 and result['ricochetReset'] and result['homingTurnScenarios'] == 6 and result['homingLaunches'] == 2 and result['homingGoals'] == 2 and result['homingCrossbarMisses'] == 2 and result['homingKeeperSaves'] == 4 and result['controls'] == 4, (label, result)
        assert not errors, (label, errors)
        print('SH01_LIVE_ZIGZAG_BROWSER_PASS', label, result, flush=True)
        context.close()
    browser.close()
