#!/usr/bin/env python3
"""Live Chromium Breath balance and selected-only ring, including same-frame swaps."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
if not fixture.exists():fixture=ROOT/'play.html'
assert fixture.exists(),'Build current modular browser fixture first'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                             ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,has_touch=touch,is_mobile=touch)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {
   const memory=new Map();
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
    getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),
    removeItem:k=>memory.delete(k),clear:()=>memory.clear()
   }});
  }""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.renderer && !!window.SupermagicFootball?.game',timeout=60000)
  outcome=page.evaluate("""() => {
   const {game:g,renderer:r}=window.SupermagicFootball;
   g.init({home:0,away:9,humans:1,mode:'quick'});
   g.matchState='paused';
   const first=g.controlledPlayer(0);
   const next=g.players.find(p=>p.t===0&&p!==first&&!p.keeper);
   const away=g.controlledPlayer(1);
   if(!first||!next||!away)throw Error('missing real players');
   const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=700;
   const ctx=canvas.getContext('2d');
   const original=ctx.ellipse.bind(ctx);
   let ringCount=0,outlineCount=0;
   ctx.ellipse=(x,y,rx,ry,...args)=>{
    if(x===0&&y===4&&rx===34&&ry===15)ringCount++;
    if(x===0&&y===5&&rx===28&&ry===12)outlineCount++;
    return original(x,y,rx,ry,...args);
   };
   const draw=p=>{const before=ringCount,outlineBefore=outlineCount;r.drawPlayer(ctx,p,g);return {breath:ringCount-before,outline:outlineCount-outlineBefore};};
   r.inMatchDraw=true;
   const initial=draw(first),unselected=draw(next),cpu=draw(away);
   // Switch without a physics tick: the old .controlled flag is deliberately stale.
   g.controlled[0]=next.i;first.controlled=true;next.controlled=false;
   const switched=draw(next),former=draw(first);
   // Local Versus has one selected human on each side.
   g.humans=2;away.controlled=false;
   const localAway=draw(away);
   // A network peer runs both teams as humans; its HUD belongs only to its own side.
   g.localBreathSide=0;const hostHome=draw(next),hostAway=draw(away);
   g.localBreathSide=1;const guestHome=draw(next),guestAway=draw(away);
   g.controlled[1]=g.players.find(p=>p.t===1&&p!==away&&!p.keeper).i;
   const guestFormer=draw(away),guestSwitched=draw(g.controlledPlayer(1));
   g.localBreathSide=null;
   g.humans=1;
   const soloAway=draw(away);
   next.preview=true;
   const preview=draw(next);
   next.preview=false;r.inMatchDraw=false;
   const menu=draw(next);
   r.inMatchDraw=false;
   // Real engine fitness method, at equal starting Breath.
   const initialBreath=first.breath;
   const staminaSamples=[];
   for(const stat of [1,50,100]){
    const p=first;
    p.src={...p.src,stamina:stat,stats:{...p.src.stats,stamina:stat}};
    const start=3+7*(stat-1)/99;
    p.breath=start;g.staminaTick(p,1,.6);const normal=p.breath;
    p.breath=start;g.staminaTick(p,1,1.5);const sprint=p.breath;
    p.breath=0;g.staminaTick(p,1,0);const idle=p.breath;
    staminaSamples.push({stat,start,normal,sprint,idle});
   }
   first.breath=initialBreath;
   // Exercise the actual controlled-player frame path, not a copied rate formula.
   // Holding DRIBBLE while moving normally must cost far less than JUMP sprint.
   const oldInput=g.input.state[0],oldAutoSwitch=g.autoSwitch,oldCooldown=g.cooldown;
   g.controlled[0]=first.i;g.autoSwitch=()=>{};g.cooldown=1;
   // Other AI players may stun or slide the runner between consecutive synthetic frames.
   // Each measurement starts from an equivalent active, grounded controlled player.
   const ready=()=>{first.stun=0;first.slideTimer=0;first.slideRemaining=0;first.z=0;first.vz=0;};
   g.input.state[0]={x:1,y:0,dribble:true,pass:false,shoot:false,jump:false};
   g.ball.owner=first;ready();
   first.breath=4;const beforeHold=first.breath;
   g.updatePlayers(.02);
   const holdLoss=beforeHold-first.breath;
   // Real engine update with ball: ordinary running is cheap; sustained JUMP sprint is costly.
   g.ball.owner=first;ready();first.breath=4;first.jumpHold=0;
   g.input.state[0]={x:1,y:0,dribble:false,pass:false,shoot:false,jump:false};
   g.updatePlayers(.02);const runLoss=4-first.breath;
   g.ball.owner=first;ready();first.breath=4;first.jumpHold=.22;
   g.input.state[0]={x:1,y:0,dribble:false,pass:false,shoot:false,jump:true};
   g.updatePlayers(.02);const sprintLoss=4-first.breath;
   first.jumpHold=0;
   // Slow analog walking with possession restores Breath.
   g.ball.owner=first;ready();first.breath=4;
   g.input.state[0]={x:.25,y:0,dribble:false,pass:false,shoot:false,jump:false};
   g.updatePlayers(.02);const analogWalk=first.breath;
   // Same real controlled-player path: stationary DRIBBLE must recover as if resting.
   g.ball.owner=first;ready();first.breath=4;
   g.input.state[0]={x:0,y:0,dribble:true,pass:false,shoot:false,jump:false};
   g.updatePlayers(.02);const stationaryHold=first.breath;
   g.ball.owner=first;ready();first.breath=4;
   g.input.state[0]={x:0,y:0,dribble:false,pass:false,shoot:false,jump:false};
   g.updatePlayers(.02);const stationaryRest=first.breath;
   g.input.state[0]=oldInput;g.autoSwitch=oldAutoSwitch;g.cooldown=oldCooldown;
   return {initial,unselected,cpu,switched,former,localAway,hostHome,hostAway,guestHome,guestAway,guestFormer,guestSwitched,soloAway,preview,menu,staminaSamples,holdLoss,runLoss,sprintLoss,analogWalk,stationaryHold,stationaryRest,
           actions:document.querySelectorAll('#touchButtons button[data-act]').length,
           players:g.players.length};
  }""")
  assert outcome['initial']=={'breath':2,'outline':1},(name,'initial selected ring and outline',outcome)
  assert outcome['unselected']=={'breath':0,'outline':0} and outcome['cpu']=={'breath':0,'outline':0},(name,'unselected/CPU ring',outcome)
  assert outcome['switched']=={'breath':2,'outline':1} and outcome['former']=={'breath':0,'outline':0},(name,'same-frame switch',outcome)
  assert outcome['localAway']=={'breath':2,'outline':1} and outcome['soloAway']=={'breath':0,'outline':0},(name,'two-human/solo',outcome)
  assert outcome['hostHome']=={'breath':2,'outline':1} and outcome['hostAway']=={'breath':0,'outline':0},(name,'network host ring scope',outcome)
  assert outcome['guestHome']=={'breath':0,'outline':0} and outcome['guestAway']=={'breath':2,'outline':1},(name,'network guest ring scope',outcome)
  assert outcome['guestFormer']=={'breath':0,'outline':0} and outcome['guestSwitched']=={'breath':2,'outline':1},(name,'network guest same-frame switch',outcome)
  assert outcome['preview']=={'breath':0,'outline':0} and outcome['menu']=={'breath':0,'outline':0},(name,'preview/menu',outcome)
  assert 0<outcome['holdLoss']<.01,(name,'actual held-dribble frame should have tiny positive Breath drain',outcome)
  assert 0<outcome['runLoss']<.01,(name,'actual ordinary run with ball must have tiny Breath drain',outcome)
  assert outcome['sprintLoss']>5*max(outcome['runLoss'],outcome['holdLoss']),(name,'actual sustained JUMP sprint must drain substantially more than ordinary ball movement',outcome)
  assert 4<outcome['analogWalk']<4.06,(name,'analog walking restores Breath',outcome)
  assert outcome['stationaryHold']>4,(name,'stationary held dribble must recharge',outcome)
  assert abs(outcome['stationaryHold']-outcome['stationaryRest'])<1e-6,(name,'stationary DRIBBLE must not drain extra Breath',outcome)
  assert outcome['actions']==4 and outcome['players']==12,(name,'control/roster invariants',outcome)
  for sample in outcome['staminaSamples']:
   assert sample['normal']>sample['start']-.2,(name,'normal run drains too much',sample)
   assert sample['sprint']<sample['start']-1.4,(name,'sprint drains too little',sample)
   assert sample['idle']>0,(name,'idle did not recharge',sample)
  assert not errors,(name,errors)
  print('BREATH_SELECTED_BROWSER_PASS',name,outcome['staminaSamples'],flush=True)
  context.close()
 browser.close()
