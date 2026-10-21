"""SD09: genuine modular Chromium gameplay smoke for the opt-in Spinning Bumper."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
SCRIPT=r"""() => {
 const g=window.SupermagicFootball?.game;
 if(!g)throw Error('Game initialization failed');
 const results=[];
 for(const side of [0,1]){
  g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,weather:'Clear'}});
  g.matchState='paused';g.cooldown=0;
  const p=g.players.find(q=>q.t===side&&!q.keeper&&q.src.role==='DF');
  const q=g.players.find(v=>v.t!==side&&!v.keeper);
  if(!p||!q)throw Error('Missing defenders or opponents');
  for(const other of g.players.filter(v=>v.t!==side&&v!==q)){other.x=4000;other.y=1800;other.stun=0;other.invuln=0;}
  p.src={...p.src,superAbility:{type:'defence',id:'spinBumper',name:'Spinning Bumper'},superDefenceLevel:3};
  Object.assign(p,{x:1280,y:700,keeper:false,z:0,stun:0,abilityCd:0,cd:0,fatigue:0});
  Object.assign(q,{x:1280+(side?-75:75),y:700,z:0,stun:0,invuln:0,dashTimer:0});
  g.ball.owner=q;
  const before=q.x;
  if(!g.activateDefence(p))throw Error('Spinning Bumper refused level-three defender');
  if(Math.abs(q.x-before)!==48||q.stun<=0||q.stun>.72||g.ball.owner!==null||p.abilityCd!==11||p.fatigue<=0)
   throw Error('Spinning Bumper physics mismatch '+JSON.stringify({side,x:q.x,old:before,stun:q.stun,cd:p.abilityCd,fatigue:p.fatigue}));
  const was=g.events?.some(e=>e.type==='defenceSuper'&&e.id==='spinBumper');
  if(!was)throw Error('No inspectable spinning ability event');
  p.abilityCd=0;p.fatigue=0;q.invuln=0;q.stun=0;q.x=before;q.z=48;g.ball.owner=q;
  if(g.activateDefence(p)||p.abilityCd!==0)throw Error('Airborne carrier should counter pulse for free');
  q.z=0;q.dashTimer=.25;
  if(g.activateDefence(p)||p.abilityCd!==0)throw Error('Dashing carrier should counter pulse for free');
  results.push({side,knockback:q.x-before,stunCapped:true,counters:2});
 }
 const controls=document.querySelectorAll('#touchButtons button[data-act]').length;
 if(controls!==4)throw Error('Four-button control layout changed: '+controls);
 return {results,controls};
}""";

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind,mobile in [('desktop',False),('simulated-touch',True)]:
  ctx=browser.new_context(viewport={'width':1280 if not mobile else 844,'height':720 if not mobile else 390},is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=30000)
  result=page.evaluate(SCRIPT)
  assert len(result['results'])==2 and result['controls']==4,(kind,result)
  assert not errors,(kind,errors)
  print('SPINNING_BUMPER_BROWSER_PASS',kind,result,flush=True)
  ctx.close()
 browser.close()
