#!/usr/bin/env python3
"""Real-engine keeper distribution and rollout avoid defenders closing into an outlet."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop'
                          else {'width':844,'height':390},
                          is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[],marginRows=[],orientationRows=[],controlRows=[],settleRows=[],turnRows=[];
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='play';
    const keeper=g.player(side,0),blockedOutlet=g.player(side,1),clearOutlet=g.player(side,2);
    const dir=side===0?1:-1,keeperX=side===0?100:2300;
    const outletX=keeperX+dir*750,markerX=keeperX+dir*400;
    for(const p of g.players){
     Object.assign(p,{stun:0,down:false,z:0,action:'idle',actionTimer:0,
      moveVX:0,moveVY:0,vx:0,vy:0,shotImpactKnockdownTimer:0});
     if(p.t===side&&!p.keeper&&p!==blockedOutlet&&p!==clearOutlet)
      Object.assign(p,{x:side===0?1700:700,y:650});
     if(p.t!==side&&!p.keeper)Object.assign(p,{x:side===0?1800:600,y:650});
    }
    Object.assign(keeper,{x:keeperX,y:340,face:dir,keeper:true,stun:0,down:false,z:0,cd:0});
    Object.assign(blockedOutlet,{x:outletX,y:340,moveVX:0,moveVY:0});
    Object.assign(clearOutlet,{x:outletX,y:600,moveVX:0,moveVY:0});
    const marker=g.player(1-side,3);
    Object.assign(marker,{x:markerX,y:450,moveVX:0,moveVY:-300,vx:0,vy:-300,
      stun:0,down:false,z:0,action:'idle',actionTimer:0});
    const blocked=g.keeperPassingLane(keeper,blockedOutlet,480);
    const clear=g.keeperPassingLane(keeper,clearOutlet,480);
    const shortEvents=[];g.onEvent=event=>shortEvents.push(event);
    Object.assign(g.ball,{owner:keeper,x:keeper.x,y:keeper.y,z:0,vx:0,vy:0,vz:0});
    const distributed=g.distributeKeeper(keeper,'short');
    const shortEvent=shortEvents.find(item=>item.type==='keeperDistribution');
    keeper.action='idle';keeper.actionTimer=0;keeper.cd=0;keeper.keeperHold=0;
    const rollEvents=[];g.onEvent=event=>rollEvents.push(event);
    Object.assign(g.ball,{owner:keeper,x:keeper.x,y:keeper.y,z:0,vx:0,vy:0,vz:0});
    const rolled=g.rollKeeper(keeper);
    const rollEvent=rollEvents.find(item=>item.type==='keeperDistribution');
    rows.push({side,blocked:blocked.clear,clear:clear.clear,distributed,
      shortTarget:shortEvent?.target,expected:clearOutlet.src.name,shortMode:shortEvent?.mode,
      pressured:shortEvent?.pressured,rolled,rollTarget:rollEvent?.target,
      rollMode:rollEvent?.mode,passTarget:g.ball.passTarget});

    // Both routes are clear, but the nominally shorter outlet has only a
    // 110-unit interception margin. Prefer the slightly farther, wider lane.
    g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='play';
    const marginKeeper=g.player(side,0),tight=g.player(side,1),open=g.player(side,2);
    const marginMarker=g.player(1-side,3),marginKeeperX=side===0?100:2300;
    for(const p of g.players){
     Object.assign(p,{stun:0,down:false,z:0,action:'idle',actionTimer:0,
      moveVX:0,moveVY:0,vx:0,vy:0,shotImpactKnockdownTimer:0});
     if(p.t===side&&!p.keeper&&p!==tight&&p!==open)
      Object.assign(p,{x:side===0?1700:700,y:650});
     if(p.t!==side&&!p.keeper)
      Object.assign(p,{x:side===0?1800:600,y:650});
    }
    Object.assign(marginKeeper,{x:marginKeeperX,y:600,face:dir,keeper:true,stun:0,down:false,z:0,cd:0});
    Object.assign(tight,{x:marginKeeperX+dir*750,y:600});
    Object.assign(open,{x:marginKeeperX+dir*750,y:400});
    Object.assign(marginMarker,{x:marginKeeperX+dir*400,y:710,moveVX:0,moveVY:0,vx:0,vy:0,
      stun:0,down:false,z:0,action:'idle',actionTimer:0});
    const tightLane=g.keeperPassingLane(marginKeeper,tight,480);
    const openLane=g.keeperPassingLane(marginKeeper,open,480);
    const marginEvents=[];g.onEvent=event=>marginEvents.push(event);
    Object.assign(g.ball,{owner:marginKeeper,x:marginKeeper.x,y:marginKeeper.y,z:0,vx:0,vy:0,vz:0});
    const marginDistributed=g.distributeKeeper(marginKeeper,'short');
    const marginEvent=marginEvents.find(item=>item.type==='keeperDistribution');
    marginRows.push({side,tightClear:tightLane.clear,openClear:openLane.clear,
      marginDistributed,selected:marginEvent?.target,expected:open.src.name,
      mode:marginEvent?.mode,pressured:marginEvent?.pressured});
   }

   // Equal-distance/equal-safety short outlets should prefer the receiver facing the throw.
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='play';
    const dir=side===0?1:-1,keeper=g.player(side,0),toward=g.player(side,1),away=g.player(side,2),
     keeperX=side===0?100:2300;
    for(const p of g.players){
     Object.assign(p,{stun:0,down:false,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,vx:0,vy:0,
      shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
     if(p.t===side&&!p.keeper&&p!==toward&&p!==away)Object.assign(p,{x:keeperX+dir*1100,y:600});
     if(p.t!==side&&!p.keeper)Object.assign(p,{x:side===0?1800:400,y:1200});
    }
    Object.assign(keeper,{x:keeperX,y:600,face:dir,keeper:true,stun:0,down:false,z:0,cd:0});
    Object.assign(toward,{x:keeperX+dir*500,y:520,face:-dir,dx:0,dy:0});
    Object.assign(away,{x:keeperX+dir*500,y:680,face:dir,dx:0,dy:0});
    const towardLane=g.keeperPassingLane(keeper,toward,480),awayLane=g.keeperPassingLane(keeper,away,480);
    const events=[];g.onEvent=event=>events.push(event);
    Object.assign(g.ball,{owner:keeper,x:keeper.x,y:keeper.y,z:0,vx:0,vy:0,vz:0});
    const distributed=g.distributeKeeper(keeper,'short'),event=events.find(item=>item.type==='keeperDistribution');
    orientationRows.push({side,towardClear:towardLane.clear,awayClear:awayLane.clear,
     distributed,selected:event?.target,expected:toward.src.name,mode:event?.mode});
   }

   // Equal-distance, equally safe and equally facing outlets should favor better first-touch control.
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='play';
    const dir=side===0?1:-1,keeper=g.player(side,0),good=g.player(side,1),poor=g.player(side,2),
     keeperX=side===0?100:2300;
    for(const p of g.players){
     Object.assign(p,{stun:0,down:false,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,
      vx:0,vy:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
     if(p.t===side&&!p.keeper&&p!==good&&p!==poor)
      Object.assign(p,{x:keeperX+dir*1100,y:600});
     if(p.t!==side&&!p.keeper)Object.assign(p,{x:side===0?1800:400,y:1200});
    }
    Object.assign(keeper,{x:keeperX,y:600,face:dir,keeper:true,stun:0,down:false,z:0,cd:0});
    const goodLength=Math.hypot(500,70),poorLength=goodLength;
    Object.assign(good,{x:keeperX+dir*500,y:530,face:-dir,
     dx:-dir*500/goodLength,dy:70/goodLength});
    Object.assign(poor,{x:keeperX+dir*500,y:670,face:-dir,
     dx:-dir*500/poorLength,dy:-70/poorLength});
    good.src={...good.src,dribbling:90,agility:90};
    poor.src={...poor.src,dribbling:10,agility:10};
    const goodLane=g.keeperPassingLane(keeper,good,480),poorLane=g.keeperPassingLane(keeper,poor,480);
    const events=[];g.onEvent=event=>events.push(event);
    Object.assign(g.ball,{owner:keeper,x:keeper.x,y:keeper.y,z:0,vx:0,vy:0,vz:0});
    const distributed=g.distributeKeeper(keeper,'short'),event=events.find(item=>item.type==='keeperDistribution');
    controlRows.push({side,goodClear:goodLane.clear,poorClear:poorLane.clear,distributed,
     selected:event?.target,expected:good.src.name,mode:event?.mode});
   }
   // A high-control receiver still settling a previous pressured touch must not be selected for a new keeper throw or roll.
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='play';
    const dir=side===0?1:-1,keeper=g.player(side,0),settling=g.player(side,1),ready=g.player(side,2),keeperX=side===0?100:2300;
    for(const p of g.players){
     Object.assign(p,{stun:0,down:false,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,vx:0,vy:0,
      firstTouchControlTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
     if(p.t===side&&!p.keeper&&p!==settling&&p!==ready)Object.assign(p,{x:side===0?1700:700,y:650});
     if(p.t!==side&&!p.keeper)Object.assign(p,{x:side===0?1800:600,y:1200});
    }
    Object.assign(keeper,{x:keeperX,y:600,face:dir,keeper:true,stun:0,down:false,z:0,cd:0});
    Object.assign(settling,{x:keeperX+dir*500,y:530,face:-dir,dx:-dir,dy:0,firstTouchControlTimer:.16,
     src:{...settling.src,dribbling:100,agility:100}});
    Object.assign(ready,{x:keeperX+dir*500,y:670,face:-dir,dx:-dir,dy:0,firstTouchControlTimer:0,
     src:{...ready.src,dribbling:10,agility:10}});
    const events=[];g.onEvent=event=>events.push(event);
    Object.assign(g.ball,{owner:keeper,x:keeper.x,y:keeper.y,z:0,vx:0,vy:0,vz:0});
    const distributed=g.distributeKeeper(keeper,'short');
    const shortEvent=events.find(item=>item.type==='keeperDistribution');
    keeper.action='idle';keeper.actionTimer=0;keeper.cd=0;keeper.keeperHold=0;
    Object.assign(g.ball,{owner:keeper,x:keeper.x,y:keeper.y,z:0,vx:0,vy:0,vz:0});
    const rolled=g.rollKeeper(keeper);
    const rollEvent=events.find(item=>item.type==='keeperDistribution'&&item.mode==='roll');
    for(const p of g.players)if(p.t===side&&!p.keeper)p.down=true;
    settling.down=false;ready.down=true;settling.firstTouchControlTimer=.16;
    keeper.action='idle';keeper.actionTimer=0;keeper.cd=0;keeper.keeperHold=0;
    Object.assign(g.ball,{owner:keeper,x:keeper.x,y:keeper.y,z:0,vx:0,vy:0,vz:0});
    const fallbackEvents=[];g.onEvent=event=>fallbackEvents.push(event);
    const fallback=g.distributeKeeper(keeper,'short');
    const fallbackEvent=fallbackEvents.find(item=>item.type==='keeperDistribution');
    settleRows.push({side,distributed,shortTarget:shortEvent?.target,expected:ready.src.name,
     rolled,rollTarget:rollEvent?.target,rollExpected:ready.src.name,
     fallback,fallbackMode:fallbackEvent?.mode,fallbackEmptySpace:fallbackEvent?.emptySpace,
     settlingTimer:settling.firstTouchControlTimer,readyTimer:ready.firstTouchControlTimer});
   }
   function turnLane(side,agility,activeInput=true){
    g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='play';
    const dir=side===0?1:-1,origin=side===0?0:2400,keeper=g.player(side,0),marker=g.player(1-side,3);
    for(const p of g.players)Object.assign(p,{down:true,stun:1,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:0,dy:0});
    Object.assign(keeper,{x:origin,y:0,keeper:true,down:false,stun:0,z:0});
    Object.assign(marker,{x:origin+dir*230,y:120,keeper:false,down:false,stun:0,z:0,
     moveVX:-dir*220,moveVY:0,dx:activeInput?dir:0,dy:activeInput?-1:0,
     src:{...(marker.src||{}),agility}});
    const lane=g.keeperPassingLane(keeper,{x:origin+dir*500,y:0},480);
    return {clear:lane.clear,interception:lane.interception,endpoint:lane.endpoint};
   }
   for(const side of [0,1])turnRows.push({side,low:turnLane(side,1),high:turnLane(side,100),neutral:turnLane(side,100,false)});
   return {rows,marginRows,orientationRows,controlRows,settleRows,turnRows,teamCount:SupermagicFootball.teams.length,actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert not errors,(kind,errors)
  assert result['teamCount']>=223,(kind,result)
  assert len(result['rows'])==2,(kind,result)
  for row in result['rows']:
   assert row['blocked'] is False,(kind,row)
   assert row['clear'] is True,(kind,row)
   assert row['distributed'] is True,(kind,row)
   assert row['shortTarget']==row['expected'] and row['shortMode']=='short',(kind,row)
   assert row['pressured'] is False,(kind,row)
   assert row['rolled'] is True and row['rollTarget']==row['expected'],(kind,row)
   assert row['rollMode']=='roll' and row['passTarget'] is not None,(kind,row)
  assert len(result['marginRows'])==2,(kind,result['marginRows'])
  for row in result['marginRows']:
   assert row['tightClear'] is True and row['openClear'] is True,(kind,row)
   assert row['marginDistributed'] is True and row['mode']=='short',(kind,row)
   assert row['pressured'] is False and row['selected']==row['expected'],(kind,row)
  assert len(result['orientationRows'])==2,(kind,result['orientationRows'])
  for row in result['orientationRows']:
   assert row['towardClear'] is True and row['awayClear'] is True,(kind,row)
   assert row['distributed'] is True and row['mode']=='short',(kind,row)
   assert row['selected']==row['expected'],(kind,row)
  assert len(result['controlRows'])==2,(kind,result['controlRows'])
  for row in result['controlRows']:
   assert row['goodClear'] is True and row['poorClear'] is True,(kind,row)
   assert row['distributed'] is True and row['mode']=='short',(kind,row)
   assert row['selected']==row['expected'],(kind,row)
  assert len(result['turnRows'])==2,(kind,result['turnRows'])
  for row in result['turnRows']:
   assert row['low']['clear'] is True and row['low']['interception']>95,(kind,row)
   assert row['high']['clear'] is False and row['high']['interception']<95,(kind,row)
   assert row['neutral']['clear'] is True and row['neutral']['interception']>110,(kind,row)
  assert len(result['settleRows'])==2,(kind,result['settleRows'])
  for row in result['settleRows']:
   assert row['distributed'] is True and row['shortTarget']==row['expected'],(kind,row)
   assert row['rolled'] is True and row['rollTarget']==row['rollExpected'],(kind,row)
   assert row['fallback'] is True and row['fallbackMode']=='long' and row['fallbackEmptySpace'] is True,(kind,row)
   assert row['settlingTimer']>0 and row['readyTimer']==0,(kind,row)
  assert result['actions']==4,(kind,result)
  print('PASS',kind,'mirrored safe short/roll, wider-lane ranking, facing/control/settling-aware keeper outlets, and Agility turn-aware safety',flush=True)
  ctx.close()
 browser.close()
