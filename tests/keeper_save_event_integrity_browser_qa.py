#!/usr/bin/env python3
"""Regression for catch vs save events in the *actual modular match engine*."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
html_src=(root/'tests/.generated/play.html').read_text(encoding='utf-8')
html=html_src.split('<script type="module">',1)[0]+'</body></html>'
js=html_src.split('<script type="module">',1)[1].split('</script>',1)[0]
script=r"""() => {
 const g=SupermagicFootball.game,out=[];
 for(const fps of [30,60,120])for(const side of [0,1])
 for(const kind of ['opponentShot','deflectedRebound','opponentLoose']){
  g.init({home:0,away:0,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
  g.matchState='paused';g.cooldown=0;
  const k=g.player(side,0),b=g.ball;
  k.stun=0;k.diveCooldown=1;k.diveIntentPending=false;k.y=765;
  for(const p of g.players.filter(p=>!p.keeper)){p.x=1250;p.y=200;p.stun=0;}
  g.events=[]; // omit match-start/kickoff events from a single collection.
  const originalSave=kind==='deflectedRebound';
  if(originalSave)g.emit('save',{player:k,saveType:'dive',deflected:true});
  Object.assign(b,{owner:null,attacker:kind==='deflectedRebound'?side:1-side,
   x:k.x,y:k.y,z:0,vx:0,vy:0,vz:0,ordinaryShot:kind==='opponentShot',
   shot:null,strike:null,canCollect:0,age:.2,power:0,pass:false});
  const saveBefore=g.events.filter(e=>e.type==='save').length;
  g.updateBall(1/fps);
  const saves=g.events.filter(e=>e.type==='save');
  const catches=g.events.filter(e=>e.type==='keeperCatch');
  out.push({fps,side,kind,saveBefore,totalSaves:saves.length,
    newSaves:saves.length-saveBefore,ownerIsKeeper:b.owner===k,
    keeperCatches:catches.length,contactEvents:g.events.filter(e=>e.type==='keeperContact').length});
 }
 g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});g.matchState='paused';
 const k=g.player(0,0),b=g.ball,c=document.createElement('canvas');c.width=600;c.height=400;
 const ctx=c.getContext('2d');Object.assign(k,{x:150,y:170,action:'keeperHold',face:1,hideBallTimer:0});
 Object.assign(b,{owner:k,x:420,y:330,z:0,shot:null,trail:[],vx:0,vy:0,rollAngle:0});
 const ink=(x,y,r=19)=>{const pixels=ctx.getImageData(Math.max(0,x-r),Math.max(0,y-r),r*2,r*2).data;let count=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>24)count++;return count};
 const centroidY=()=>{const pixels=ctx.getImageData(0,0,c.width,c.height).data;let total=0,weighted=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const alpha=pixels[(y*c.width+x)*4+3];if(alpha>24){total+=alpha;weighted+=y*alpha;}}return total?weighted/total:NaN};
 SupermagicFootball.renderer.drawBall(ctx,g);const held={gloves:ink(155,111),physics:ink(420,330)},heldBallY=centroidY();
 k.action='keeperThrow';ctx.clearRect(0,0,c.width,c.height);SupermagicFootball.renderer.drawBall(ctx,g);
 const released={gloves:ink(155,111),physics:ink(420,330)};
 const catchBallYs=[];
 for(const remaining of [.46,.23,0]){
  k.action='keeperCatch';k.actionTimer=remaining;ctx.clearRect(0,0,c.width,c.height);
  SupermagicFootball.renderer.drawBall(ctx,g);catchBallYs.push(centroidY());
 }
 k.action='keeperHold';k.actionTimer=0;ctx.clearRect(0,0,c.width,c.height);
 SupermagicFootball.renderer.drawBall(ctx,g);const settledHoldY=centroidY();
 const poseCanvas=document.createElement('canvas');poseCanvas.width=720;poseCanvas.height=300;
 poseCanvas.id='keeper-catch-settle-gallery';
 poseCanvas.style.cssText='position:fixed;left:10px;top:10px;z-index:999999;background:#e8eef3';
 const poseCtx=poseCanvas.getContext('2d',{willReadFrequently:true}),catchPoseHashes=[];
 for(const [index,remaining] of [.46,.23,0].entries()){
  const sample={...k,x:120+index*240,y:220,z:0,face:1,dx:0,dy:0,keeper:true,
   action:'keeperCatch',actionTimer:remaining,preview:true,controlled:false,
   visualFacing:{kind:'front',side:1},stun:0,cryTimer:0};
  SupermagicFootball.renderer.drawPlayer(poseCtx,sample,{getTeam:()=>g.getTeam(k.t),
   options:{showNames:false,reducedFlash:false}});
  const pixels=poseCtx.getImageData(index*240,0,240,300).data;let hash=2166136261;
  for(let q=0;q<pixels.length;q+=4)hash=Math.imul(hash^pixels[q]^pixels[q+1]<<8^pixels[q+2]<<16^pixels[q+3],16777619)>>>0;
  catchPoseHashes.push(hash);
 }
 document.body.append(poseCanvas);
 const fatigueTrials=[];
 for(const side of [0,1])for(const [fatigueLevel,speed] of [[0,1900],[.5,1900],[1,1900],[0,1950],[.5,1950]]){
  g.init({home:0,away:1,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
  g.matchState='paused';g.cooldown=0;
  const k=g.player(side,0),b=g.ball,dir=side===0?1:-1;
  Object.assign(k,{y:765,action:'idle',actionTimer:0,stun:0,down:false,z:0,
   diveCooldown:0,diveIntentCooldown:0,diveIntentPending:false,fatigue:fatigueLevel});
  k.src={...k.src,gkSkill:50,gkDiving:50};
  for(const q of g.players)if(q!==k&&!q.keeper)
   Object.assign(q,{x:k.x-dir*500,y:200,z:0,stun:0,down:false,action:'idle',actionTimer:0});
  Object.assign(b,{owner:null,attacker:1-side,lastTouchTeam:1-side,
   x:k.x+dir*30,y:k.y+12,z:20,vx:-dir*speed,vy:0,vz:0,power:0,
   ordinaryShot:true,shot:null,strike:null,pass:false,age:.15,canCollect:0,trail:[]});
  g.events=[];
  const committed=g.tryKeeperDive(k,false),save=g.events.find(e=>e.type==='save');
  fatigueTrials.push({side,fatigueLevel,speed,committed,ownerIsKeeper:b.owner===k,
   deflected:save?.deflected===true,catchEvents:g.events.filter(e=>e.type==='keeperCatch').length});
 }
 return {out,held,released,heldBallY,catchBallYs,settledHoldY,catchPoseHashes,fatigueTrials};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for device in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if device=='desktop'
                          else {'width':844,'height':390},
                          is_mobile=device!='desktop',has_touch=device!='desktop')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)||null,setItem:(k,x)=>m.set(k,String(x)),removeItem:k=>m.delete(k),clear:()=>m.clear()}})}""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate(script)
  page.locator('#keeper-catch-settle-gallery').screenshot(path=str(root/'tests/.generated'/f'keeper_catch_settle_{device}.png'))
  rows=result['out']
  assert not errors,(device,errors)
  assert len(rows)==18,(device,len(rows))
  for r in rows:
   assert r['ownerIsKeeper'] and r['keeperCatches']==1,(device,r)
   assert r['contactEvents']==0,(device,r)
   expected=1 if r['kind']=='opponentShot' else 0
   assert r['newSaves']==expected,(device,r)
   assert r['totalSaves']==1 if r['kind']!='opponentLoose' else r['totalSaves']==0,(device,r)
  assert result['held']['gloves']>35 and result['held']['physics']==0,(device,'held ball must render at gloves without false ground shadow',result['held'])
  assert result['released']['gloves']==0 and result['released']['physics']>35,(device,'released ball must return to its physics point',result['released'])
  assert len(result['catchBallYs'])==3 and result['catchBallYs'][0]>result['catchBallYs'][1]>result['catchBallYs'][2],(device,'ball must settle smoothly into the gloves',result['catchBallYs'])
  assert abs(result['catchBallYs'][2]-result['heldBallY'])<.5 and abs(result['settledHoldY']-result['heldBallY'])<.5,(device,'catch and hold ball anchors must match',result)
  assert len(set(result['catchPoseHashes']))==3,(device,'early, middle and held keeper poses must be visually distinct',result['catchPoseHashes'])
  trials=result['fatigueTrials']
  assert len(trials)==10,(device,len(trials))
  for r in trials:
   should_deflect=(r['speed']==1900 and r['fatigueLevel']>=1) or (r['speed']==1950 and r['fatigueLevel']>=.5)
   assert r['committed'],(device,r)
   assert r['deflected']==should_deflect,(device,'fatigue-aware catch/parry decision',r)
   assert r['ownerIsKeeper']==(not should_deflect),(device,'catch ownership',r)
   assert r['catchEvents']==(0 if should_deflect else 1),(device,'catch event count',r)
  print('PASS',device,'18 keeper collection fixtures, fatigue-scaled catch/parry decisions on both goals, and rendered catch/hold/release anchors at 30/60/120Hz',flush=True)
  ctx.close()
 browser.close()
