#!/usr/bin/env python3
"""Verify selected-human Spin Bump/Sand Trap backup counters in the live engine."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current modular browser fixture first'
HTML=fixture.read_text(encoding='utf8')
SCRIPT=r"""() => {
 const g=window.SupermagicFootball?.game;
 if(!g||typeof g.driveAI!=='function'||typeof g.tryMagicTrick!=='function')throw Error('Live game engine unavailable');
 function setup(team,trick,{humanCounter=null}={}){
  g.init({home:0,away:9,humans:2,mode:'quick',difficulty:3});
  const carrier=g.player(team,4),human=g.player(1-team,3),cpu=g.player(1-team,4),backup=g.player(1-team,5);
  if(!carrier||!human||!cpu||!backup)throw Error('Missing carrier/defender fixture');
  const dir=team===0?1:-1,role=trick==='spinBump'?'DF':'FW';
  const stats=role==='DF'
   ?{defence:85,strength:85,aggression:85,speedRating:85,heading:85,stamina:85}
   :{shootAccuracy:85,shootPower:85,dribbling:85,speedRating:85,agility:85,heading:85};
  carrier.src={...carrier.src,...stats,role,statsVerified:true,magicTrick:trick,dribbling:70};
  Object.assign(carrier,{x:640,y:360,dx:dir,dy:0,face:dir,z:0,keeper:false,stun:0,
   fatigue:.2,magicReadyAt:0,dribbleHold:.35,down:false});
  for(const q of g.players)if(q.t===1-team&&q!==human&&q!==cpu&&q!==backup&&!q.keeper)q.stun=10;
  Object.assign(human,{x:carrier.x+dir*45,y:carrier.y,dx:-dir,dy:0,face:-dir,z:0,keeper:false,
   stun:0,down:false,invuln:0,action:'idle',actionTimer:0,cd:0,src:{...human.src,defence:40}});
  Object.assign(cpu,{x:carrier.x+dir*70,y:carrier.y,dx:-dir,dy:0,face:-dir,z:0,keeper:false,
   stun:0,down:false,invuln:0,action:'idle',actionTimer:0,cd:0,src:{...cpu.src,defence:60}});
  Object.assign(backup,{x:carrier.x+dir*90,y:carrier.y,dx:-dir,dy:0,face:-dir,z:0,keeper:false,
   stun:10,down:false,invuln:0,action:'idle',actionTimer:0,cd:0,src:{...backup.src,defence:60}});
  if(humanCounter==='jump')Object.assign(human,{action:'jump',actionTimer:.3,z:22});
  if(humanCounter==='slide')Object.assign(human,{action:'slide',actionTimer:.3,z:0});
  g.controlled=[0,0];g.controlled[team]=carrier.i;g.controlled[1-team]=human.i;
  g.inControl=side=>side===1-team;
  g.manualSwitchGrace=[10,10];g.options.difficulty=3;g.matchState='play';g.clock=10;
  g.ball.owner=carrier;g.ball.x=carrier.x;g.ball.y=carrier.y;g.ball.z=0;
  return {carrier,human,cpu,backup};
 }
 const results=[];
 for(const trick of ['spinBump','sandTrap'])for(const team of [0,1]){
  const {carrier,human,cpu}=setup(team,trick);
  let hold=.35,steps=0;const dt=1/60;
  while(hold<.99&&cpu.action!=='jump'&&steps<80){
   carrier.dribbleHold=hold;g.driveAI(cpu,dt);hold=Math.min(.99,hold+dt);steps++;
  }
  if(cpu.action!=='jump'||!(cpu.actionTimer>0))throw Error('CPU backup did not JUMP before '+trick+' cast '+JSON.stringify({team,hold,steps,action:cpu.action}));
  if(g.controlled[human.t]!==human.i||human.action!=='idle')throw Error('Selected human lost marker control');
  // jump() has applied the live impulse; place the fixture at the existing
  // resolver's airborne threshold so this test isolates handoff plus resolution.
  cpu.z=22;carrier.dribbleHold=1;carrier.magicReadyAt=0;carrier.fatigue=.2;g.ball.owner=carrier;g.clock=10;
  const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
  if(!activated||event.countered!==true||g.ball.owner!==carrier)throw Error('Actual resolver rejected teammate JUMP '+JSON.stringify({trick,team,activated,event}));
  if(carrier.magicReadyAt!==16||Math.abs(carrier.fatigue-.245)>1e-9)throw Error('Counter changed existing caster cooldown/fatigue');
  results.push({trick,team,hold,steps,cpuAction:cpu.action,cpuHeight:cpu.z,humanSelected:g.controlled[human.t]===human.i,
   countered:event.countered,retainedPossession:g.ball.owner===carrier,cooldown:carrier.magicReadyAt-g.clock,cost:+(carrier.fatigue-.2).toFixed(3)});
 }
 const handoffs=[];
 for(const trick of ['spinBump','sandTrap'])for(const team of [0,1])for(const unavailable of ['down','invulnerable']){
  const {carrier,human,cpu,backup}=setup(team,trick),dir=team===0?1:-1;
  Object.assign(human,{x:carrier.x+dir*170,y:carrier.y,dx:-dir,dy:0,face:-dir,action:'idle',actionTimer:0});
  Object.assign(cpu,{x:carrier.x+dir*45,y:carrier.y,dx:-dir,dy:0,face:-dir,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0});
  Object.assign(backup,{x:carrier.x+dir*70,y:carrier.y,dx:-dir,dy:0,face:-dir,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0});
  if(unavailable==='down')cpu.down=true;else cpu.invuln=.4;
  let hold=.35,steps=0;const dt=1/60;
  while(hold<.99&&backup.action!=='jump'&&steps<80){carrier.dribbleHold=hold;g.driveAI(backup,dt);hold=Math.min(.99,hold+dt);steps++;}
  if(backup.action!=='jump'||!(backup.actionTimer>0))throw Error('Ready backup did not JUMP past '+unavailable+' nearest defender '+trick+' '+JSON.stringify({team,hold,steps,action:backup.action}));
  if(g.controlled[human.t]!==human.i||human.action!=='idle')throw Error('Unavailable nearest handoff changed selected-human control');
  if(cpu.action==='jump')throw Error('Unavailable nearest defender must not receive the counter');
  backup.z=22;carrier.dribbleHold=1;carrier.magicReadyAt=0;carrier.fatigue=.2;g.ball.owner=carrier;g.clock=10;
  const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
  if(!activated||event.countered!==true||g.ball.owner!==carrier)throw Error('Actual resolver rejected ready-backup JUMP '+JSON.stringify({trick,team,unavailable,activated,event}));
  if(carrier.magicReadyAt!==16||Math.abs(carrier.fatigue-.245)>1e-9)throw Error('Handoff changed existing caster cooldown/fatigue');
  handoffs.push({trick,team,unavailable,hold,steps,backupAction:backup.action,nearestDown:cpu.down,nearestInvulnerable:cpu.invuln>0,
   humanSelected:g.controlled[human.t]===human.i,countered:event.countered});
 }
 const duplicates=[];
 for(const trick of ['spinBump','sandTrap'])for(const team of [0,1])for(const state of ['jump','slide']){
  const {carrier,human,cpu}=setup(team,trick,{humanCounter:state});
  g.reactToSpinSandTrick(cpu,.2,.09);
  if(cpu.action==='jump')throw Error('CPU duplicated effective human '+state+' '+trick);
  // driveAI is used only to verify no duplicate CPU response. Re-establish the
  // selected human's already-active counter immediately before the resolver so
  // resolver acceptance is isolated from unrelated AI frame updates.
  if(state==='jump')Object.assign(human,{action:'jump',actionTimer:.3,z:22});
  else Object.assign(human,{action:'slide',actionTimer:.3,z:0});
  carrier.dribbleHold=1;carrier.magicReadyAt=0;carrier.fatigue=.2;g.ball.owner=carrier;g.clock=10;
  const activated=g.tryMagicTrick(carrier),event=g.events.at(-1)||{};
  if(!activated||event.countered!==true)throw Error('Existing human '+state+' did not counter '+trick);
  duplicates.push({trick,team,state,cpuAction:cpu.action,humanAction:human.action,countered:event.countered});
 }
 const controls=document.querySelectorAll('#touchButtons button[data-act]').length;
 if(controls!==4)throw Error('Expected exactly four gameplay actions; got '+controls);
 return {results,handoffs,duplicates,controls};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate(SCRIPT)
  assert len(result['results'])==4 and len(result['handoffs'])==8 and len(result['duplicates'])==8 and result['controls']==4,result
  assert not errors,(label,errors)
  print('MAGIC_SPIN_SAND_HUMAN_BACKUP_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
