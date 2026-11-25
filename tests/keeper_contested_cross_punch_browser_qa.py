#!/usr/bin/env python3
"""Desktop and simulated-touch real-engine acceptance for contested high-cross punches."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module');page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,field={x:150,y:155,w:2260.8,h:1220},rows=[];
   for(const state of ['grounded','airborne'])for(const team of [0,1]){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const dir=team===0?1:-1,liveKeeper=g.player(team,0),liveReceiver=g.player(1-team,3);
    for(const q of g.players)if(q!==liveKeeper&&q!==liveReceiver)Object.assign(q,{down:true,stun:1});
    const keeperX=dir===1?field.x+66:field.x+field.w-66,keeperY=field.y+field.h/2;
    Object.assign(liveKeeper,{x:keeperX,y:keeperY,z:0,stun:0,down:false,action:'idle',
     actionTimer:0,diveCooldown:0,diveIntentCooldown:0,diveIntentPending:false,keeperPunchFx:0,fatigue:.1});
    const ballX=liveKeeper.x-dir*8,ballY=liveKeeper.y+5;
    const airborne=state==='airborne';
    Object.assign(liveReceiver,{x:ballX+dir*90,y:ballY,z:airborne?55:0,vz:0,
     jumpCount:airborne?1:0,stun:0,down:false,action:airborne?'jump':'idle',
     actionTimer:0,slideTimer:0,moveVX:-dir*300,moveVY:0});
    Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,
     pass:true,passTarget:liveReceiver.src.id,x:ballX,y:ballY,z:70,vx:-dir*30,vy:0,
     vz:-20,age:.25,canCollect:0,shot:null,strike:null,ordinaryShot:false,power:0,trail:[]});
    g.updateBall(.016);
    const punch=g.events.filter(event=>event.type==='keeperPunch');
    const punched={punches:punch.length,owner:!!g.ball.owner,pass:g.ball.pass,
     lastTouchTeam:g.ball.lastTouchTeam,attacker:g.ball.attacker,vx:g.ball.vx,vz:g.ball.vz,
     action:liveKeeper.action,punchFx:liveKeeper.keeperPunchFx||0};
    Object.assign(liveReceiver,{down:true,action:'shotDown',actionTimer:1,stun:0});
    Object.assign(liveKeeper,{z:12,action:'keeperDive',actionTimer:.1,diveElapsed:.24,
     diveIntentPending:false,aiTimer:0,aiTarget:null,aiParryReboundTarget:false});
    Object.assign(g.ball,{owner:null,attacker:team,lastTouchTeam:team,
     // Keep this acceptance on a reachable near pocket; the dedicated parry-chase suite covers unreachable far pockets.
     x:liveKeeper.x+dir*8,y:liveKeeper.y+38,z:60,vx:dir*260,vy:30,vz:-110,
     shot:null,strike:null,ordinaryShot:false,pass:false,age:.6,canCollect:0});
    g.clock=.35;g.driveAI(liveKeeper,.016);
    const chase=liveKeeper.aiParryReboundTarget===true;
    const moving=dir*(liveKeeper.moveVX||0)>0;
    const target=liveKeeper.aiTarget?{x:liveKeeper.aiTarget.x,y:liveKeeper.aiTarget.y}:null;
    rows.push({team,state,dir,...punched,chase,moving,target});
   }
   const jumpRows=[];
   for(const profile of [{jumping:1,ballZ:92,expected:0},{jumping:50,ballZ:92,expected:0},
    {jumping:100,ballZ:92,expected:1},{jumping:1,ballZ:70,expected:1}])for(const team of [0,1]){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const dir=team===0?1:-1,liveKeeper=g.player(team,0),liveReceiver=g.player(1-team,3);
    for(const q of g.players)if(q!==liveKeeper&&q!==liveReceiver)Object.assign(q,{down:true,stun:1});
    const keeperX=dir===1?field.x+66:field.x+field.w-66,keeperY=field.y+field.h/2;
    Object.assign(liveKeeper,{x:keeperX,y:keeperY,z:0,stun:0,down:false,action:'idle',
     actionTimer:0,diveCooldown:0,diveIntentCooldown:0,diveIntentPending:false,keeperPunchFx:0,fatigue:.1});
    Object.assign(liveKeeper.src,{gkSkill:55,gkDiving:65});
    const ballX=liveKeeper.x-dir*8,ballY=liveKeeper.y+5;
    Object.assign(liveReceiver,{x:ballX+dir*90,y:ballY,z:0,vz:0,jumpCount:0,stun:0,down:false,
     action:'idle',actionTimer:0,slideTimer:0,moveVX:-dir*300,moveVY:0});
    Object.assign(liveReceiver.src,{jumping:profile.jumping});
    Object.assign(g.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,
     pass:true,passTarget:liveReceiver.src.id,x:ballX,y:ballY,z:profile.ballZ,vx:-dir*30,vy:0,
     vz:-20,age:.25,canCollect:0,shot:null,strike:null,ordinaryShot:false,power:0,trail:[]});
    g.updateBall(.016);
    jumpRows.push({team,jumping:profile.jumping,ballZ:profile.ballZ,expected:profile.expected,
     punches:g.events.filter(event=>event.type==='keeperPunch').length});
   }
   return {rows,jumpRows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
    teams:SupermagicFootball.teams.length};
  }""")
  assert result['buttons']==4,(kind,result)
  assert result['teams']>=223,(kind,result)
  for row in result['rows']:
   assert row['punches']==1,(kind,row)
   assert not row['owner'] and row['pass'] is False,(kind,row)
   assert row['lastTouchTeam']==row['team'] and row['attacker']==row['team'] and row['dir']*row['vx']>0 and row['vz']>0,(kind,row)
   assert row['action']=='keeperDive' and row['punchFx']>0,(kind,row)
   assert row['chase'] and row['moving'] and row['target'] is not None,(kind,row)
  for row in result['jumpRows']:
   assert row['punches']==row['expected'],(kind,row)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored contested-cross punch, safe rebound chase, readable keeper response and four actions',flush=True)
  ctx.close()
 browser.close()
