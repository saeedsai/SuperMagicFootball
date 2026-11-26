"""Actual GameEngine acceptance for Agility-aware give-and-go return-pass reads."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]

SCENARIO=r"""() => {
 const g=window.SupermagicFootball?.game;
 if(!g||!Array.isArray(g.players)||!g.driveAI)throw Error('live GameEngine unavailable');
 const F={x:150,y:155,w:2260.8,h:1220},rows=[];
 for(const team of [0,1])for(const agility of [100,1]){
  g.init({home:0,away:1,mode:'quick',humans:0,options:{weather:'Clear'}});
  const dir=team===0?1:-1;
  const carrier=g.players.find(p=>p.t===team&&p.i===3);
  const runner=g.players.find(p=>p.t===team&&p.i===4);
  const marker=g.players.find(p=>p.t===1-team&&!p.keeper&&p.i===3);
  if(!carrier||!runner||!marker)throw Error('required players unavailable');
  const x=F.x+F.w*(team===0?.72:.28),y=F.y+F.h*.5;
  const target={x:x+dir*132,y:y+104},gap=Math.hypot(62,90);
  Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
   cd:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,trickCd:10,breath:1,
   firstTouchControlTimer:0,firstTouchOutletUntil:0,firstTouchOutletReadTimer:0,
   moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
  Object.assign(runner,{x:target.x,y:target.y,down:false,stun:0,z:0,action:'idle',
   actionTimer:0,slideTimer:0,moveVX:0,moveVY:0,dx:0,dy:0,
   aiAssistTarget:null,aiGiveAndGoRun:{receiverId:carrier.src.id,target,expires:3}});
  Object.assign(marker,{x:target.x-dir*62,y:target.y+90,down:false,stun:0,z:0,
   action:'idle',actionTimer:0,slideTimer:0,moveVX:dir*600,moveVY:0,
   dx:dir*62/gap,dy:-90/gap});
  marker.src={...marker.src,agility};
  for(const p of g.players){
   if(p===carrier||p===runner||p===marker)continue;
   Object.assign(p,{down:true,stun:0,z:0,action:'idle',actionTimer:0,
    slideTimer:0,moveVX:0,moveVY:0,aiAssistTarget:null});
  }
  Object.assign(g.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,
   passTeam:null,passTarget:null,attacker:team,lastTouchTeam:team,shot:null,
   strike:null,ordinaryShot:false,age:0,canCollect:0});
  g.clock=1;g.matchState='play';
  const eventStart=g.events.length,originalRandom=Math.random;
  try{Math.random=()=>.01;g.driveAI(carrier,1/60);}
  finally{Math.random=originalRandom;}
  const event=g.events.slice(eventStart).reverse().find(e=>e?.type==='passIntent');
  rows.push({team,agility,mode:event?.mode||null,passTarget:g.ball.passTarget,
   expected:runner.src.id});
 }
 for(const team of [0,1]){
  const high=rows.find(v=>v.team===team&&v.agility===100);
  const low=rows.find(v=>v.team===team&&v.agility===1);
  if(high?.mode==='giveAndGoReturn')throw Error('high-Agility marker did not close return lane '+JSON.stringify(high));
  if(low?.mode!=='giveAndGoReturn'||low.passTarget!==low.expected)
   throw Error('low-Agility fallback return pass missing '+JSON.stringify(low));
 }
 return {rows,teams:[0,1],agility:[100,1],actualEngine:true};
}"""

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 results=[]
 for kind in ('desktop','simulated-touch'):
  context=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
   is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=context.new_page();errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,
   value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  result=page.evaluate(SCENARIO)
  assert len(result['rows'])==4,result
  assert not errors,errors
  results.append({'profile':kind,**result,'pageErrors':errors})
  context.close()
 browser.close()
 print({'profiles':results})
