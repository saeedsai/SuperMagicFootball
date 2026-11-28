#!/usr/bin/env python3
"""Exercise the shipped CPU Lightning response in desktop and touch browser fixtures."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the current modular browser fixture first'
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
   const g=SupermagicFootball.game;
   g.init({home:0,away:9,humans:1,mode:'quick'});g.matchState='paused';
   const roster=g.players.slice();
   const cases=[];
   for(const side of [0,1])for(const hz of [30,60,120]){
    const caster=roster.find(p=>p.t===1-side&&!p.keeper),cpu=roster.find(p=>p.t===side&&!p.keeper&&p!==caster);
    Object.assign(cpu,{t:side,keeper:false,x:640+(side===0?40:-40),y:360,z:0,stun:0,action:'run',actionTimer:0,
     aiLightningThreat:null,aiLightningReaction:0});
    Object.assign(caster,{t:1-side,x:640+(side===0?-40:40),y:360,
     lightningPending:{remaining:.32,target:cpu}});
    g.players=[caster,cpu];let warning=.32,frames=0;
    while(warning>1e-9&&frames<hz&&cpu.action!=='jump'){
     warning=Math.max(0,warning-1/hz);caster.lightningPending.remaining=warning;
     g.reactToLightningTrick(cpu,1/hz,.18);
     frames++;
    }
    let z=cpu.z,vz=cpu.vz,left=warning;
    while(left>1e-9){const dt=Math.min(1/hz,left);z+=vz*dt;vz-=1080*dt;left-=dt;}
    cases.push({side,hz,frames,z:cpu.z,zAtResolve:z,action:cpu.action,warning,
     distance:Math.hypot(caster.x-cpu.x,caster.y-cpu.y)});
   }
   const backupCases=[];
   for(const side of [0,1])for(const fps of [30,60,120]){
    g.init({home:0,away:9,humans:2,mode:'quick'});
    const caster=g.players.find(v=>v.t===side&&!v.keeper);
    const defenders=g.players.filter(v=>v.t===1-side&&!v.keeper);
    const target=defenders.find(v=>v.i===3),backup=defenders.find(v=>v.i===4);
    if(!caster||!target||!backup)throw Error('Missing selected-human Lightning backup participants');
    for(const other of defenders)if(other!==target&&other!==backup){other.x=1000;other.y=1000;other.z=0;}
    Object.assign(caster,{x:640,y:360,dx:side===0?1:-1,dy:0,face:side===0?1:-1,z:0,stun:0,fatigue:0,magicReadyAt:0,lightningPending:null});
    caster.src={...caster.src,role:'FW',magicTrick:'lightning',statsVerified:true};
    for(const key of ['shootAccuracy','shootPower','dribbling','speedRating','agility','heading'])caster.src[key]=85;
    Object.assign(target,{x:640+(side===0?50:-50),y:360,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0,
     face:side===0?-1:1,dx:0,dy:0,moveVX:0,moveVY:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
    Object.assign(target.src,{defence:20});
    Object.assign(backup,{x:640+(side===0?70:-70),y:360,z:0,stun:0,down:false,invuln:0,action:'idle',actionTimer:0,
     face:side===0?-1:1,dx:0,dy:0,moveVX:0,moveVY:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
    Object.assign(backup.src,{defence:20});
    g.controlled[1-side]=target.i;g.ball.owner=caster;g.ball.x=caster.x;g.ball.y=caster.y;g.ball.z=0;g.clock=4;
    if(!g.tryMagicTrick(caster)||caster.lightningPending?.target!==target||caster.lightningPending?.backup!==backup)
     throw Error('Lightning did not preserve the selected human marker and assign its nearest CPU backup');
    if(target.lightningMark!==.32||backup.lightningMark)throw Error('Lightning warning mark moved off the selected human target');
    let warning=.32,frames=0;
    while(warning>1e-9&&frames<fps&&backup.action!=='jump'){
     const dt=1/fps;warning=Math.max(0,warning-dt);caster.lightningPending.remaining=warning;
     g.reactToLightningTrick(backup,dt,.18);frames++;
    }
    let z=backup.z,vz=backup.vz,left=warning;
    while(left>1e-9){const dt=Math.min(1/fps,left);z+=vz*dt;vz-=1080*dt;left-=dt;}
    backup.z=z;g.resolveLightningTrick(caster);
    const event=g.events.at(-1);
    if(backup.action!=='jump'||z<20||target.stun!==0||event?.countered!==true)
     throw Error('Lightning CPU backup failed to counter at '+fps+' Hz on side '+side+': '+JSON.stringify({z,action:backup.action,stun:target.stun,event}));
    backupCases.push({side,fps,frames,z,targetWasMarked:true,countered:event.countered});
   }
   return {cases,backupCases,actionButtons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }''')
  assert len(result['cases'])==6 and len(result['backupCases'])==6,(label,result)
  for case in result['cases']:
   assert case['distance']<95,(label,'Lightning warning fixture must stay inside the real cast radius',case)
   assert case['action']=='jump' and case['warning']>0,(label,'CPU failed to start its timely Lightning evasion',case)
   assert case['zAtResolve']>=20,(label,'CPU jump did not reach Lightning airborne-counter height before impact',case)
  assert result['actionButtons']==4,(label,'four-button grammar changed',result)
  assert not errors,(label,errors)
  print('MAGIC_LIGHTNING_AI_COUNTER_BROWSER_PASS',label,result,flush=True)
  context.close()
 browser.close()
