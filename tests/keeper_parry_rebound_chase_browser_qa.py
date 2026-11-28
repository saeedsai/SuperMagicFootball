#!/usr/bin/env python3
"""Chromium acceptance for CPU keeper parry follow-through and rebound pursuit."""
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
   const g=SupermagicFootball.game,rows=[],turnRows=[];
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='paused';g.cooldown=0;g.clock=0;
    const k=g.player(side,0),b=g.ball,dir=side===0?1:-1,goalY=765;
    Object.assign(k,{x:side===0?255:2305,y:goalY,stun:0,down:false,z:0,
      action:'idle',actionTimer:0,diveCooldown:0,diveIntentCooldown:0,
      diveIntentPending:false,aiTimer:0,aiTarget:null,aiParryReboundTarget:false});
    for(const p of g.players){
     if(p===k||p.keeper)continue;
     if(p.t===side)Object.assign(p,{x:side===0?1750:810,y:205+p.i*8,z:0,stun:0,down:false,action:'idle',actionTimer:0});
     else Object.assign(p,{x:side===0?1900:660,y:1320-p.i*8,z:0,stun:0,down:false,action:'idle',actionTimer:0});
    }
    Object.assign(b,{owner:null,attacker:1-side,lastTouchTeam:1-side,
      x:k.x+dir*24,y:goalY,z:0,vx:-dir*2500,vy:0,vz:0,power:60,
      ordinaryShot:true,shot:null,strike:null,age:.2,canCollect:0,trail:[],pass:false});
    const parried=g.tryKeeperDive(k,false);
    Object.assign(k,{action:'keeperDive',actionTimer:.4,diveElapsed:.24,
      diveIntentPending:false,z:12,stun:0,down:false,aiTimer:0,aiTarget:null});
    Object.assign(b,{owner:null,attacker:side,lastTouchTeam:side,
      x:k.x+dir*24,y:goalY+38,z:60,vx:dir*260,vy:30,vz:-110,
      ordinaryShot:false,shot:null,strike:null,pass:false,age:.6,canCollect:0});
    g.clock=.2;
    g.driveAI(k,.016);
    const target=k.aiTarget?{x:k.aiTarget.x,y:k.aiTarget.y}:null;
    const chase=k.aiParryReboundTarget===true;
    const moving=dir*(k.moveVX||0)>0;
    const rival=g.player(1-side,3);
    Object.assign(rival,{x:target.x-dir*145,y:target.y,z:0,stun:0,down:false,
      action:'idle',actionTimer:0,moveVX:dir*500,moveVY:0});
    g.driveAI(k,.016);
    const yieldedToClosingRunner=k.aiParryReboundTarget===false;
    const teammate=g.player(side,3);
    g.take(teammate);
    const cleared=k.aiParryReboundTarget===false&&k.aiTarget===null;
    // Repeat a real parry with a distant landing pocket. The keeper must
    // stay goal-side when its speed/acceleration cannot cover the gap in time.
    Object.assign(k,{x:side===0?255:2305,y:goalY,action:'idle',actionTimer:0,
      stun:0,down:false,z:0,diveCooldown:0,diveIntentCooldown:0,
      diveIntentPending:false,aiTimer:0,aiTarget:null,aiParryReboundTarget:false,
      moveVX:0,moveVY:0});
    Object.assign(b,{owner:null,attacker:1-side,lastTouchTeam:1-side,
      x:k.x+dir*24,y:goalY,z:0,vx:-dir*2500,vy:0,vz:0,power:60,
      ordinaryShot:true,shot:null,strike:null,age:.2,canCollect:0,trail:[],pass:false});
    const farParried=g.tryKeeperDive(k,false);
    Object.assign(k,{action:'keeperDive',actionTimer:.4,diveElapsed:.24,
      diveIntentPending:false,z:12,stun:0,down:false,aiTimer:0,aiTarget:null,
      moveVX:0,moveVY:0});
    Object.assign(b,{owner:null,attacker:side,lastTouchTeam:side,
      x:k.x+dir*120,y:goalY+38,z:60,vx:dir*260,vy:30,vz:-110,
      ordinaryShot:false,shot:null,strike:null,pass:false,age:.6,canCollect:0});
    g.clock=.2;g.driveAI(k,.016);
    const farDeclined=k.aiParryReboundTarget===false;
    const farTarget=k.aiTarget?{x:k.aiTarget.x,y:k.aiTarget.y}:null;
    const staysGoalSide=!!farTarget&&dir*(farTarget.x-k.x)<0;
    rows.push({side,parried,chase,moving,target,yieldedToClosingRunner,cleared,
      farParried,farDeclined,staysGoalSide});
   }
   const reactionRows=[];
   for(const side of [0,1]){
    const run=(skill,fatigue,motion='stationary')=>{
     g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
     g.matchState='paused';g.cooldown=0;g.clock=0;
     const k=g.player(side,0),b=g.ball,dir=side===0?1:-1,goalY=765;
     Object.assign(k,{x:side===0?205:2355,y:goalY,stun:0,down:false,z:0,
      action:'idle',actionTimer:0,diveCooldown:0,diveIntentCooldown:0,
      diveIntentPending:false,aiTimer:0,aiTarget:null,aiParryReboundTarget:false,
      moveVX:0,moveVY:0,fatigue:0});
     for(const p of g.players){
      if(p===k||p.keeper)continue;
      if(p.t===side)Object.assign(p,{x:side===0?1750:810,y:235+p.i*8,z:0,
       stun:0,down:false,action:'idle',actionTimer:0});
      else Object.assign(p,{x:side===0?1900:660,y:1285-p.i*8,z:0,
       stun:0,down:false,action:'idle',actionTimer:0});
     }
     Object.assign(b,{owner:null,attacker:1-side,lastTouchTeam:1-side,
      x:k.x+dir*24,y:goalY,z:0,vx:-dir*2500,vy:0,vz:0,power:60,
      ordinaryShot:true,shot:null,strike:null,age:.2,canCollect:0,trail:[],pass:false});
     const parried=g.tryKeeperDive(k,false);
     if(!parried)throw new Error('reaction fixture shot was not parried for side '+side);
     Object.assign(k,{action:'keeperDive',actionTimer:.4,diveElapsed:.24,
      diveIntentPending:false,z:12,stun:0,down:false,aiTimer:0,aiTarget:null,
      aiParryReboundTarget:false,moveVX:0,moveVY:0,fatigue});
     Object.assign(k.src,{agility:50,gkSkill:skill});
     Object.assign(b,{owner:null,attacker:side,lastTouchTeam:side,
      x:k.x+dir*100,y:goalY+38,z:60,vx:dir*260,vy:30,vz:-110,
      ordinaryShot:false,shot:null,strike:null,pass:false,age:.6,canCollect:0});
     if(motion==='cross-track'){
      const flight=(b.vz+Math.sqrt(b.vz*b.vz+1000*b.z))/500;
      const horizon=Math.max(.12,Math.min(.60,flight));
      const targetX=b.x+Math.max(-110,Math.min(110,b.vx*horizon*.58));
      const targetY=b.y+Math.max(-100,Math.min(100,b.vy*horizon*.58));
      const dx=targetX-k.x,dy=targetY-k.y,gap=Math.hypot(dx,dy);
      k.moveVX=-dy/gap*200;k.moveVY=dx/gap*200;
     }
     g.clock=.2;g.cpuLevel=()=>2;g.playerSpeed=()=>300/.86;
     g.driveAI(k,.016);
     return {parried,chase:k.aiParryReboundTarget===true,motion};
    };
    reactionRows.push({side,neutral:run(50,0),low:run(0,0),elite:run(100,0),tired:run(50,1),crossTrack:run(50,0,'cross-track')});
   }
    const steeringRows=[];
    for(const side of [0,1]){
     const run=agility=>{
      g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
      g.matchState='paused';g.cooldown=0;g.clock=0;
      const k=g.player(side,0),b=g.ball,dir=side===0?1:-1,goalY=765;
      Object.assign(k,{x:side===0?205:2355,y:goalY,stun:0,down:false,z:0,action:'idle',actionTimer:0,
       diveCooldown:0,diveIntentCooldown:0,diveIntentPending:false,aiTimer:0,aiTarget:null,aiParryReboundTarget:false,
       moveVX:0,moveVY:0,dx:0,dy:0,fatigue:0});
      for(const p of g.players)if(p!==k&&!p.keeper)Object.assign(p,{down:true,stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,dx:0,dy:0});
      Object.assign(b,{owner:null,attacker:1-side,lastTouchTeam:1-side,x:k.x+dir*24,y:goalY,z:0,vx:-dir*2500,vy:0,vz:0,power:60,ordinaryShot:true,shot:null,strike:null,age:.2,canCollect:0,trail:[],pass:false});
      const parried=g.tryKeeperDive(k,false);if(!parried)throw new Error('steering fixture shot was not parried for side '+side);
      Object.assign(k,{action:'keeperDive',actionTimer:.4,diveElapsed:.24,diveIntentPending:false,z:12,stun:0,down:false,aiTimer:0,aiTarget:null,aiParryReboundTarget:false,fatigue:0});
      Object.assign(k.src,{agility,gkSkill:50});
      Object.assign(b,{owner:null,attacker:side,lastTouchTeam:side,x:k.x+dir*100,y:goalY+38,z:60,vx:dir*260,vy:30,vz:-110,ordinaryShot:false,shot:null,strike:null,pass:false,age:.6,canCollect:0});
      const flight=(b.vz+Math.sqrt(b.vz*b.vz+1000*b.z))/500,targetX=b.x+b.vx*flight*.58,targetY=b.y+b.vy*flight*.58;
      const dx=targetX-k.x,dy=targetY-k.y,gap=Math.hypot(dx,dy);
      k.moveVX=-dy/gap*200;k.moveVY=dx/gap*200;k.dx=dx/gap;k.dy=dy/gap;
      g.clock=.2;g.cpuLevel=()=>2;g.playerSpeed=()=>260/.86;g.driveAI(k,.016);
      return {parried,chase:k.aiParryReboundTarget===true};
     };
     steeringRows.push({side,elite:run(100),low:run(1)});
    }
    for(const side of [0,1])for(const role of ['opponent','teammate'])for(const agility of [100,1]){
     g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
     g.matchState='paused';g.cooldown=0;g.clock=0;
     const k=g.player(side,0),b=g.ball,dir=side===0?1:-1,goalY=765;
     Object.assign(k,{x:side===0?255:2305,y:goalY,stun:0,down:false,z:0,
      action:'idle',actionTimer:0,diveCooldown:0,diveIntentCooldown:0,
      diveIntentPending:false,aiTimer:0,aiTarget:null,aiParryReboundTarget:false,
      moveVX:0,moveVY:0,fatigue:0});
     for(const p of g.players)if(p!==k&&!p.keeper)
      Object.assign(p,{down:true,stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,
       moveVX:0,moveVY:0,dx:0,dy:0});
     Object.assign(b,{owner:null,attacker:1-side,lastTouchTeam:1-side,
      x:k.x+dir*24,y:goalY,z:0,vx:-dir*2500,vy:0,vz:0,power:60,
      ordinaryShot:true,shot:null,strike:null,age:.2,canCollect:0,trail:[],pass:false});
     const parried=g.tryKeeperDive(k,false);
     if(!parried)throw new Error('turn fixture shot was not parried for side '+side);
     Object.assign(k,{action:'keeperDive',actionTimer:.4,diveElapsed:.24,
      diveIntentPending:false,z:12,stun:0,down:false,aiTimer:0,aiTarget:null,
      aiParryReboundTarget:false});
     Object.assign(b,{owner:null,attacker:side,lastTouchTeam:side,
      x:k.x+dir*24,y:goalY+38,z:60,vx:dir*260,vy:30,vz:-110,
      ordinaryShot:false,shot:null,strike:null,pass:false,age:.6,canCollect:0});
     g.clock=.2;g.driveAI(k,.016);
     const target=k.aiTarget?{x:k.aiTarget.x,y:k.aiTarget.y}:null;
     if(!k.aiParryReboundTarget||!target)throw new Error('baseline keeper chase missing for side '+side);
     const rival=g.player(role==='opponent'?1-side:side,3);
     Object.assign(rival,{x:target.x-dir*70,y:target.y,z:0,down:false,stun:0,
      action:'run',actionTimer:0,slideTimer:0,moveVX:-dir*300,moveVY:0,dx:dir,dy:0});
     rival.src={...rival.src,agility};
     k.aiTimer=0;k.moveVX=0;k.moveVY=0;
     g.driveAI(k,.016);
     turnRows.push({side,role,agility,parried,chase:k.aiParryReboundTarget===true});
    }
   return {rows,reactionRows,steeringRows,turnRows,teams:SupermagicFootball.teams.length};
  }""")
  assert not errors,(kind,errors)
  assert result['teams']>=223,(kind,result)
  assert len(result['rows'])==2,(kind,result)
  assert len(result['reactionRows'])==2,(kind,result)
  assert len(result['steeringRows'])==2,(kind,result)
  for row in result['steeringRows']:
   assert row['elite']['parried'] and row['elite']['chase'],(kind,row)
   assert row['low']['parried'] and not row['low']['chase'],(kind,row)
  for row in result['reactionRows']:
   assert row['neutral']['parried'] and row['neutral']['chase'],(kind,row)
   assert row['low']['parried'] and not row['low']['chase'],(kind,row)
   assert row['elite']['parried'] and row['elite']['chase'],(kind,row)
   assert row['tired']['parried'] and not row['tired']['chase'],(kind,row)
   assert row['crossTrack']['parried'] and not row['crossTrack']['chase'],(kind,row)
  for side in [0,1]:
   for role in ['opponent','teammate']:
    profiles={row['agility']:row for row in result['turnRows']
     if row['side']==side and row['role']==role}
    assert profiles[100]['parried'] and not profiles[100]['chase'],(kind,side,role,profiles)
    assert profiles[1]['parried'] and profiles[1]['chase'],(kind,side,role,profiles)
  for row in result['rows']:
   assert row['parried'] and row['chase'] and row['moving'] and row['yieldedToClosingRunner'] and row['cleared'],(kind,row)
   assert row['target'] is not None,(kind,row)
   assert row['farParried'] and row['farDeclined'] and row['staysGoalSide'],(kind,row)
  print('PASS',kind,'both mirrored real-engine parry follow-throughs, keeper steering/Agility rebound turns, Agility-aware opponent/teammate rebound races, recovery-aware second-ball contests and possession cleanup',flush=True)
  ctx.close()
 browser.close()
