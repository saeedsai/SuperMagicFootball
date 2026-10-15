#!/usr/bin/env python3
"""QA of the 20% longitudinal pitch extension in the real modular browser fixture."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
fixture=(root/'tests/.generated/play.html').read_text()
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
javascript=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]
for_display=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,options in [('desktop',{'viewport':{'width':1280,'height':720}}),('simulated-touch',{'viewport':{'width':844,'height':390},'is_mobile':True,'has_touch':True})]:
  context=browser.new_context(**options)
  page=context.new_page()
  exceptions=[]
  page.on('pageerror',lambda e:exceptions.append(str(e)))
  page.set_content(html)
  page.evaluate("""() => {const cache=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,String(v)),removeItem:k=>cache.delete(k),clear:()=>cache.clear()}})}""")
  page.add_script_tag(content=javascript,type='module')
  page.wait_for_function("!!window.SupermagicFootball")
  result=page.evaluate("""() => {
   const app=SupermagicFootball,g=app.game,r=app.renderer;
   g.init({home:0,away:9,mode:'quick',humans:1,options:g.options});
   g.matchState='paused';g.cooldown=0;
   const f={left:150,right:2410.8,center:1280.4,goalY:765},start=g.player(0,3).x;
   const initial={centerKickoff:Math.abs(start-(f.center-26))<.001,
    rightKeeper:g.player(1,0).x>f.right-340,
    leftKeeper:g.player(0,0).x<f.left+340,
    goalCentres:g.player(0,0).y>=155&&g.player(1,0).y<=1375};
   g.ball.owner=null;g.ball.x=f.right-50;g.ball.y=f.goalY;g.ball.vx=0;g.ball.vy=0;
   r.cameraX=0;r.frame(g,.05,false);r.frame(g,.05,false);r.frame(g,.05,false);
   const rightCamera=r.cameraX;
   g.ball.x=f.left+50;
   for(let k=0;k<10;k++)r.frame(g,.05,false);
   return {initial,rightCamera,leftCamera:r.cameraX,screen:r.screenW,errors:[],
      ok:Object.values(initial).every(Boolean)&&rightCamera>250&&r.cameraX<rightCamera};
  }""")
  assert result['ok'],(label,result)
  assert not exceptions,(label,exceptions)
  print(label,'PASS: kickoff center, mirrored keepers, longer right-side pitch and camera tracking',result,flush=True)
  context.close()
 browser.close()
