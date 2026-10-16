#!/usr/bin/env python3
"""Actual modular goalkeeper lateral lunge in both goals at 30/60/120Hz."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
fixture=(root/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]
script=r"""() => {
 const g=SupermagicFootball.game, oldDrive=g.driveAI, samples=[];
 const field=SupermagicFootball.world?.field||{x:150,w:2260.8};
 try {
  // Isolate the *extra* physical dive without conflating ordinary AI tracking.
  g.driveAI=()=>{};
  for(const fps of [30,60,120])for(const side of [0,1])for(const fatigue of [0,.9]){
   g.init({home:0,away:0,humans:0,mode:'quick',options:{...g.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
   g.matchState='paused';g.cooldown=0;
   const k=g.player(side,0),b=g.ball,dir=side===0?-1:1;
   k.x=side===0?field.x+105:field.x+field.w-105;k.y=765;
   k.fatigue=fatigue;k.stun=0;k.diveCooldown=0;k.diveIntentCooldown=0;
   k.src={...k.src,gkDiving:88,gkSkill:82};
   for(const p of g.players.filter(p=>!p.keeper)){p.x=field.x+field.w*.5;p.y=205;p.stun=0;}
   Object.assign(b,{owner:null,attacker:1-side,x:k.x-dir*225,y:865,z:15,
     vx:dir*950,vy:0,vz:0,ordinaryShot:true,shot:null,strike:null,power:30,
     canCollect:1.5,age:.1,trail:[]});
   const initialBall=JSON.stringify({x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy});
   const began=g.tryKeeperDiveIntent(k);
   if(!began)throw Error('credible early attempt denied '+side+'/'+fps);
   const initialY=k.y,initialX=k.x;
   g.updatePlayers(1/fps);
   const firstMove=Math.abs(k.y-initialY);
   const ballUnchanged=JSON.stringify({x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy})===initialBall;
   const noContactBeforePlane=!g.events.some(e=>e.type==='save'||e.type==='keeperContact')&&b.owner===null;
   g.updateBall(1/fps);
   const genuineBallFlight=b.x!==JSON.parse(initialBall).x;
   for(let i=0;i<10;i++)g.updatePlayers(1/fps);
   const traveled=k.diveAdvanceTravel||0,maxTravel=Math.min(28,(9+88*.22)*(1-fatigue*.55));
   const bounded=traveled<=maxTravel+1e-6&&k.x===initialX;
   const oldY=k.y,oldDistance=traveled;
   Object.assign(b,{vx:-dir*950});
   const awayStep=g.advanceKeeperDive(k,1/fps);
   const awayStable=awayStep===0&&k.y===oldY&&k.diveAdvanceTravel===oldDistance;
   samples.push({fps,side,fatigue,firstMove,traveled,began,ballUnchanged,
     noContactBeforePlane,genuineBallFlight,bounded,awayStable});
  }
 }finally{g.driveAI=oldDrive}
 return {samples,teams:SupermagicFootball.teams.length};
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop'
                          else {'width':844,'height':390},
                          is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html)
  page.evaluate("""() => {let v=new Map();Object.defineProperty(window,'localStorage',
    {configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),
    removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  data=page.evaluate(script)
  assert not errors,(kind,errors)
  assert len(data['samples'])==12,(kind,data)
  for row in data['samples']:
   assert row['began'] and row['firstMove']>0,(kind,row)
   assert row['ballUnchanged'] and row['noContactBeforePlane'],(kind,row)
   assert row['genuineBallFlight'] and row['bounded'] and row['awayStable'],(kind,row)
  for fps in (30,60,120):
   for side in (0,1):
    a=next(x for x in data['samples'] if x['fps']==fps and x['side']==side and x['fatigue']==0)
    tired=next(x for x in data['samples'] if x['fps']==fps and x['side']==side and x['fatigue']==.9)
    assert tired['traveled']<a['traveled'],(kind,'fatigue not limiting',a,tired)
  print('PASS',kind,'12 mirrored FPS/fatigue in-engine keeper lunges, capped travel, no phantom saves',flush=True)
  ctx.close()
 browser.close()
