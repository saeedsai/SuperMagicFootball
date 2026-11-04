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
 SupermagicFootball.renderer.drawBall(ctx,g);const held={gloves:ink(155,111),physics:ink(420,330)};
 k.action='keeperThrow';ctx.clearRect(0,0,c.width,c.height);SupermagicFootball.renderer.drawBall(ctx,g);
 const released={gloves:ink(155,111),physics:ink(420,330)};
 return {out,held,released};
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
  print('PASS',device,'18 keeper collection fixtures plus rendered catch/hold/release ball anchors at 30/60/120Hz',flush=True)
  ctx.close()
 browser.close()
