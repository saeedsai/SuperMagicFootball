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
  for(const fps of [30,60,120]){
   g.init({home:0,away:9,humans:2,mode:'quick',options:{...g.options,weather:'Clear'}});
   g.matchState='paused';g.cooldown=0;
   const p=g.players.find(q=>q.t===side&&!q.keeper&&q.src.role==='DF');
   const q=g.players.find(v=>v.t!==side&&!v.keeper);
   if(!p||!q)throw Error('Missing defenders or opponents');
   g.controlled[side]=p.i;g.controlled[1-side]=q.i;g.autoSwitch=()=>{};g.driveAI=()=>{};
   for(const other of g.players.filter(v=>v.t!==side&&v!==q)){other.x=4000;other.y=1800;other.stun=0;other.invuln=0;}
   p.src={...p.src,superAbility:{type:'defence',id:'spinBumper',name:'Spinning Bumper'},superDefenceLevel:3};
   Object.assign(p,{x:1280,y:700,keeper:false,z:0,stun:0,abilityCd:0,cd:0,fatigue:0});
   Object.assign(q,{x:1280+(side?-75:75),y:700,z:0,stun:0,invuln:0,dashTimer:0});
   g.ball.owner=q;
   const before=q.x;
   if(!g.activateDefence(p))throw Error('Spinning Bumper refused level-three defender');
   if(q.x!==before||!p.spinBumperPending||!g.events.some(e=>e.type==='spinBumperTelegraph'&&e.seconds===.42))throw Error('Missing readable 0.42 second tell');
   if(side===0&&fps===30){const api=window.SupermagicFootball,renderer=api.renderer;const c=document.createElement('canvas');c.id='sd09-preview';c.width=340;c.height=300;c.style.cssText='display:block;position:fixed;z-index:999999;left:10px;top:10px;width:340px;height:300px;border:2px solid white';document.body.appendChild(c);const x=c.getContext('2d');x.fillStyle='#174b38';x.fillRect(0,0,c.width,c.height);renderer.drawPlayer(x,{...p,x:170,y:175,controlled:false},g);
    const stable=document.createElement('canvas');stable.width=220;stable.height=220;const s=stable.getContext('2d');g.options.reducedFlash=true;renderer.time=0;renderer.drawPlayer(s,{...p,x:110,y:130,controlled:false},g);const first=stable.toDataURL();s.clearRect(0,0,stable.width,stable.height);renderer.time=3;renderer.drawPlayer(s,{...p,x:110,y:130,controlled:false},g);if(first!==stable.toDataURL())throw Error('Reduced-flash spin warning must be steady across render times');g.options.reducedFlash=false;}
   let elapsed=0;while(p.spinBumperPending&&elapsed<.6){g.updatePlayers(1/fps);elapsed+=1/fps;}
   if(Math.abs(q.x-before)!==48||q.stun<=0||q.stun>.55||g.ball.owner!==null||Math.abs(p.abilityCd-(11-elapsed))>1e-6||p.fatigue<=0)
    throw Error('Spinning Bumper physics mismatch '+JSON.stringify({side,fps,x:q.x,old:before,stun:q.stun,ballOwner:g.ball.owner?.src?.id||null,cd:p.abilityCd,expectedCd:11-elapsed,fatigue:p.fatigue}));
   if(!g.events.some(e=>e.type==='defenceSuper'&&e.id==='spinBumper'&&e.hits===1))throw Error('No resolved pulse event');
   const knockback=q.x-before;
   p.abilityCd=0;p.fatigue=0;q.invuln=0;q.stun=0;q.x=before;q.z=48;g.ball.owner=q;
   if(g.activateDefence(p)||p.abilityCd!==0)throw Error('Airborne carrier should counter pulse for free');
   q.z=0;q.dashTimer=.25;
   if(g.activateDefence(p)||p.abilityCd!==0)throw Error('Dashing carrier should counter pulse for free');
   results.push({side,fps,knockback,stunCapped:true,counters:2,warningElapsed:+elapsed.toFixed(4)});
  }
 }
 const controls=document.querySelectorAll('#touchButtons button[data-act]').length;
 if(controls!==4)throw Error('Four-button control layout changed: '+controls);
 return {results,controls,preview:!!document.querySelector('#sd09-preview')};
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
  assert len(result['results'])==6 and result['controls']==4 and result['preview'],(kind,result)
  if not mobile:
   tell=page.locator('#sd09-preview');box=tell.bounding_box()
   assert box and box['width']==340 and box['height']==300,box
   tell.screenshot(path=str(ROOT/'tests/.generated/sd09_spin_bumper_tell.png'))
  assert not errors,(kind,errors)
  print('SPINNING_BUMPER_BROWSER_PASS',kind,result,flush=True)
  ctx.close()
 browser.close()
