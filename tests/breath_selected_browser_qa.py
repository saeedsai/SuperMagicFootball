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
   let ringCount=0;
   ctx.ellipse=(x,y,rx,ry,...args)=>{
    if(x===0&&y===4&&rx===34&&ry===15)ringCount++;
    return original(x,y,rx,ry,...args);
   };
   const draw=p=>{const before=ringCount;r.drawPlayer(ctx,p,g);return ringCount-before;};
   r.inMatchDraw=true;
   const initial=draw(first),unselected=draw(next),cpu=draw(away);
   // Switch without a physics tick: the old .controlled flag is deliberately stale.
   g.controlled[0]=next.i;first.controlled=true;next.controlled=false;
   const switched=draw(next),former=draw(first);
   // Local Versus has one selected human on each side.
   g.humans=2;away.controlled=false;
   const localAway=draw(away);
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
   return {initial,unselected,cpu,switched,former,localAway,soloAway,preview,menu,staminaSamples,
           actions:document.querySelectorAll('#touchButtons button[data-act]').length,
           players:g.players.length};
  }""")
  assert outcome['initial']==1,(name,'initial selected ring',outcome)
  assert outcome['unselected']==0 and outcome['cpu']==0,(name,'unselected/CPU ring',outcome)
  assert outcome['switched']==1 and outcome['former']==0,(name,'same-frame switch',outcome)
  assert outcome['localAway']==1 and outcome['soloAway']==0,(name,'two-human/solo',outcome)
  assert outcome['preview']==0 and outcome['menu']==0,(name,'preview/menu',outcome)
  assert outcome['actions']==4 and outcome['players']==12,(name,'control/roster invariants',outcome)
  for sample in outcome['staminaSamples']:
   assert sample['normal']>sample['start']-.2,(name,'normal run drains too much',sample)
   assert sample['sprint']<sample['start']-1.4,(name,'sprint drains too little',sample)
   assert sample['idle']>0,(name,'idle did not recharge',sample)
  assert not errors,(name,errors)
  print('BREATH_SELECTED_BROWSER_PASS',name,outcome['staminaSamples'],flush=True)
  context.close()
 browser.close()
