"""SD10: exercise Mace Sweep through the real browser GameEngine at both sides/rates."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf-8')
SCRIPT = r"""() => {
 const api=window.SupermagicFootball,g=api?.game;
 if(!g||typeof g.activateDefence!=='function')throw Error('GameEngine defense action unavailable');
 const results=[];
 const move=(side,fps,placement='forward')=>{
  g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,weather:'Clear'}});
  g.matchState='paused';g.cooldown=0;g.driveAI=()=>{};g.autoSwitch=()=>{};
  const face=side===0?1:-1;
  const p=g.players.find(player=>player.t===side&&!player.keeper&&player.src.role==='DF');
  const q=g.players.find(player=>player.t!==side&&!player.keeper);
  if(!p||!q)throw Error('Missing outfield defender or opponent');
  for(const other of g.players){
   if(other===p||other===q)continue;
   other.x=4000+other.i*40;other.y=1800;other.stun=0;other.invuln=0;
  }
  p.src={...p.src,role:'DF',superAbility:{type:'defence',id:'maceSweep',name:'MACE SWEEP',level:2}};
  Object.assign(p,{t:side,keeper:false,x:1280,y:700,face,z:0,stun:0,invuln:0,cd:0,abilityCd:0,fatigue:0,breath:100});
  let qx=1280+face*92,qy=712;
  if(placement==='rear')qx=1280-face*92;
  if(placement==='wide')qy=1280;
  if(placement==='airborne')Object.assign(q,{z:21});else q.z=0;
  if(placement==='dashing')q.dashTimer=.2;else q.dashTimer=0;
  Object.assign(q,{t:1-side,keeper:false,x:qx,y:qy,face:-face,dx:0,dy:0,stun:0,invuln:0,action:'idle',actionTimer:0});
  g.controlled[side]=p.i;g.controlled[1-side]=q.i;
  g.ball.owner=q;g.ball.x=q.x;g.ball.y=q.y;g.ball.z=0;g.ball.vx=0;g.ball.vy=0;g.events.length=0;
  return {p,q,face};
 };
 for(const side of [0,1])for(const fps of [30,60,120]){
  const {p,q,face}=move(side,fps);
  const before={x:q.x,y:q.y,owner:g.ball.owner,fatigue:p.fatigue,breath:p.breath};
  if(!g.activateDefence(p))throw Error('Mace Sweep rejected eligible grounded carrier '+JSON.stringify({side,fps}));
  if(!p.maceSweepPending||p.maceSweepPending.remaining!==.24||g.events.some(event=>event.type==='defenceSuper'&&event.id==='maceSweep'))
   throw Error('Mace Sweep must expose its .24 second tell before impact');
  if(!g.updateMaceSweep(p,.24))throw Error('Uncountered Mace Sweep did not resolve after its tell');
  const after={x:q.x,y:q.y};
  const hit=g.events.filter(event=>event.type==='defenceSuper'&&event.id==='maceSweep');
  const displacement=Math.hypot(after.x-before.x,after.y-before.y);
  if(hit.length!==1||hit[0].hits!==1)throw Error('Sweep did not emit one single-target defense hit');
  if(q.action!=='hurt'||q.stun<=0||q.stun>.58||q.invuln!==1.1)throw Error('Carrier stagger envelope changed');
  if(displacement<20||displacement>29||g.ball.owner!==null||g.ball.vx!==face*280)throw Error('Mace push or ball release changed');
  if(p.action!=='defenceSuper'||p.abilityCd!==10||p.fatigue<=before.fatigue||p.breath>=before.breath)throw Error('Mace cooldown/fatigue cost was not applied');
  const fatigueAfter=p.fatigue,breathAfter=p.breath,eventsAfter=g.events.length;
  if(g.activateDefence(p)||p.abilityCd!==10||p.fatigue!==fatigueAfter||p.breath!==breathAfter||g.events.length!==eventsAfter)
   throw Error('Cooldown retry spent another use or cost');
  for(let i=0;i<fps;i++)g.updatePlayers(1/fps);
  if(Math.abs(p.abilityCd-9)>.00001)throw Error('Cooldown rate differs at '+fps+' Hz: '+p.abilityCd);

  const invalid=[];
  for(const placement of ['rear','wide','airborne','dashing']){
   const target=move(side,fps,placement),beforeInvalid={x:target.q.x,y:target.q.y,owner:g.ball.owner,
    fatigue:target.p.fatigue,breath:target.p.breath,events:g.events.length};
   if(g.activateDefence(target.p))throw Error('Invalid '+placement+' target was hit');
   if(target.p.abilityCd!==0||target.p.fatigue!==beforeInvalid.fatigue||target.p.breath!==beforeInvalid.breath||
      target.q.stun!==0||g.ball.owner!==target.q||g.events.length!==beforeInvalid.events||
      target.q.x!==beforeInvalid.x||target.q.y!==beforeInvalid.y)
    throw Error('Invalid '+placement+' case consumed resources or changed match state');
   invalid.push(placement);
  }
  const {p:spent,q:spentTarget}=move(side,fps);
  spent.fatigue=.99;const spentBefore={fatigue:spent.fatigue,breath:spent.breath};
  if(g.activateDefence(spent)||spent.abilityCd!==0||spent.fatigue!==spentBefore.fatigue||spent.breath!==spentBefore.breath||
     spentTarget.stun!==0||g.ball.owner!==spentTarget)
   throw Error('Fatigue-limited activation should fail without cost');
  results.push({side,fps,hit:true,cooldownAfterOneSecond:+p.abilityCd.toFixed(4),invalid,highFatigueRejected:true,
   push:+displacement.toFixed(2),cost:+fatigueAfter.toFixed(4)});
 }
 const actions=[...document.querySelectorAll('#touchButtons button[data-act]')].map(button=>button.dataset.act).sort();
 if(JSON.stringify(actions)!==JSON.stringify(['dribble','jump','pass','shoot']))throw Error('Existing four-button grammar changed: '+actions.join(','));
 const bindings=api.input.getBindings();
 if(!Array.isArray(bindings.keyboard)||!Array.isArray(bindings.gamepad))throw Error('Existing keyboard/gamepad action bindings missing');
 return {results,actions,combinations:6,invalidCases:24};
}""";

with sync_playwright() as playwright:
 browser = playwright.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
  args=['--no-sandbox', '--disable-dev-shm-usage'])
 for label, mobile in [('desktop', False), ('simulated-touch', True)]:
  context = browser.new_context(viewport={'width':1280 if not mobile else 844,
   'height':800 if not mobile else 390}, is_mobile=mobile, has_touch=mobile)
  page = context.new_page(); errors=[]
  page.on('pageerror', lambda error: errors.append(str(error)))
  page.set_content(HTML, wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
  result = page.evaluate(SCRIPT)
  assert len(result['results']) == 6 and result['combinations'] == 6 and result['invalidCases'] == 24, (label,result)
  assert result['actions'] == ['dribble','jump','pass','shoot'], (label,result)
  assert not errors, (label,errors)
  print('SD10_MACE_SWEEP_BROWSER_PASS', label, result, flush=True)
  context.close()
 browser.close()
