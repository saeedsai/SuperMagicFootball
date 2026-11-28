#!/usr/bin/env python3
"""Verify the live CPU jump response to a Mace Sweep tell in desktop/touch contexts."""
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
   const defender=g.player(0,2),cpu=g.player(1,2);g.players=[defender,cpu];
   defender.src={...defender.src,role:'DF',superDefenceLevel:2,
    superAbility:{type:'defence',id:'maceSweep',level:2}};
   defender.x=400;defender.y=300;defender.maceSweepPending={remaining:.24,target:cpu};
   Object.assign(cpu,{z:0,vz:0,stun:0,fatigue:0,dashTimer:0,action:'run',actionTimer:0});
   const before=cpu.z;let frames=0;
   while(defender.maceSweepPending.remaining>1e-9&&frames<60&&cpu.action!=='jump'){
    g.reactToMaceSweep(cpu,1/60,.18);
    defender.maceSweepPending.remaining=Math.max(0,defender.maceSweepPending.remaining-1/60);
    frames++;
   }
   return {before,frames,z:cpu.z,vz:cpu.vz,action:cpu.action,
    reaction:cpu.aiMaceSweepReaction,warning:defender.maceSweepPending.remaining,
    actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert result['vz']>0 and result['action']=='jump',(label,'CPU failed to issue its jump counter',result)
  assert result['frames']<=15 and result['warning']>0,(label,'CPU response exceeded .24s tell',result)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  read_result=page.evaluate('''() => {
   const api=SupermagicFootball,g=api.game,rows=[];
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:0,mode:'quick'});g.matchState='paused';g.events.length=0;
    const face=side===0?1:-1,caster=g.player(side,2),target=g.player(1-side,2);
    if(!caster||!target)throw Error('Missing Mace Sweep read fixture players');
    Object.assign(caster,{x:1100,y:620,face,z:0,stun:0,action:'defenceSuper',actionTimer:.24});
    caster.src={...caster.src,role:'DF',dribbling:55,superAbility:{type:'defence',id:'maceSweep',level:2}};
    Object.assign(target,{x:1100+face*92,y:632,face:-face,dx:0,dy:0,moveVX:-face*180,moveVY:0,
     z:0,stun:0,invuln:0,dashTimer:0,action:'run',actionTimer:0,src:{...target.src,defence:80}});
    g.ball.owner=target;g.ball.x=target.x;g.ball.y=target.y;g.ball.z=0;
    caster.maceSweepPending={remaining:.24,target};
    const reacted=g.reactToMaceSweep(target,.016,.18);
    const jumped=target.action==='jump'||target.z>20;
    const resolved=g.resolveMaceSweep(caster);
    const outcome=g.events.filter(event=>event.type==='maceSweepResolved').at(-1);
    if(reacted||jumped||resolved||!outcome?.countered||outcome.counter!=='read'||
       g.ball.owner!==target||target.stun!==0)
     throw Error('Live closing momentum did not preserve the Mace Sweep read '+JSON.stringify({side,reacted,jumped,resolved,outcome}));
    rows.push({side,reacted,jumped,resolved,counter:outcome.counter,ballRetained:g.ball.owner===target});
   }
   return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(read_result['rows'])==2 and read_result['buttons']==4,(label,read_result)
  turn_result=page.evaluate('''() => {
   const api=SupermagicFootball,g=api.game,rows=[];
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:0,mode:'quick'});g.matchState='paused';g.events.length=0;
    const face=side===0?1:-1,caster=g.player(side,2),target=g.player(1-side,2);
    if(!caster||!target)throw Error('Missing vertical Mace Sweep read fixture players');
    Object.assign(caster,{x:1100,y:620,face,z:0,stun:0,action:'defenceSuper',actionTimer:.24,
     maceSweepPending:{remaining:.24,target}});
    caster.src={...caster.src,role:'DF',dribbling:55,superAbility:{type:'defence',id:'maceSweep',level:2}};
    Object.assign(target,{x:1100+face*60,y:650,face,dx:0,dy:-1,moveVX:0,moveVY:-180,
     z:0,stun:0,invuln:0,dashTimer:0,action:'run',actionTimer:0});
    target.src={...target.src,defence:80};g.players=[caster,target];
    g.ball.owner=target;g.ball.x=target.x;g.ball.y=target.y;g.ball.z=0;
    const reacted=g.reactToMaceSweep(target,.016,.18),resolved=g.resolveMaceSweep(caster);
    const outcome=g.events.filter(event=>event.type==='maceSweepResolved').at(-1);
    if(reacted||resolved||target.action==='jump'||!outcome?.countered||outcome.counter!=='read'||
       g.ball.owner!==target||target.stun!==0)
     throw Error('Live vertical approach did not preserve the 2D Mace Sweep read '+JSON.stringify({side,reacted,resolved,outcome}));
    rows.push({side,reacted,resolved,counter:outcome.counter,ballRetained:g.ball.owner===target});
   }
   return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(turn_result['rows'])==2 and turn_result['buttons']==4,(label,turn_result)

  recovery_result=page.evaluate('''() => {
   const api=SupermagicFootball,g=api.game,rows=[];
   const unavailable=[
    ['down',{down:true}],
    ['shotDown',{action:'shotDown',actionTimer:.4}],
    ['shotGetUp',{action:'shotGetUp',actionTimer:.4}],
    ['hurtRecovery',{action:'hurt',actionTimer:.25}],
    ['shotImpactPending',{shotImpactKnockdownPending:.2}]
   ];
   for(const side of [0,1])for(const [state,patch] of unavailable){
    g.init({home:0,away:9,humans:0,mode:'quick'});g.matchState='paused';g.events.length=0;
    const face=side===0?1:-1,caster=g.player(side,2),target=g.player(1-side,2);
    if(!caster||!target)throw Error('Missing Mace Sweep recovery fixture players');
    Object.assign(caster,{x:1100,y:620,face,z:0,stun:0,action:'defenceSuper',actionTimer:.24,
     maceSweepPending:{remaining:.24,target}});
    caster.src={...caster.src,role:'DF',dribbling:55,superAbility:{type:'defence',id:'maceSweep',level:2}};
    Object.assign(target,{x:1100+face*92,y:632,z:0,stun:0,invuln:0,dashTimer:0,down:false,
     action:'run',actionTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0},patch);
    g.players=[caster,target];g.ball.owner=target;g.ball.x=target.x;g.ball.y=target.y;
    g.ball.z=0;g.ball.vx=0;g.ball.vy=0;g.ball.vz=0;
    const resolved=g.resolveMaceSweep(caster);
    const outcome=g.events.filter(event=>event.type==='maceSweepResolved').at(-1);
    if(resolved||!outcome||outcome.hit||outcome.countered||g.ball.owner!==target||
       target.stun!==0||g.ball.vx!==0)
     throw Error('Mace Sweep hit a downed/recovering target '+JSON.stringify({side,state,resolved,outcome,owner:g.ball.owner===target,stun:target.stun,vx:g.ball.vx}));
    rows.push({side,state,hit:outcome.hit,countered:outcome.countered,ballRetained:g.ball.owner===target});
   }
   return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(recovery_result['rows'])==10 and recovery_result['buttons']==4,(label,recovery_result)
  print('MACE_SWEEP_RECOVERY_TARGET_BROWSER_PASS',label,recovery_result,flush=True)
  print('MACE_SWEEP_2D_LIVE_APPROACH_BROWSER_PASS',label,turn_result,flush=True)
  print('MACE_SWEEP_MOMENTUM_READ_BROWSER_PASS',label,read_result,flush=True)
  print('MACE_SWEEP_AI_COUNTER_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
