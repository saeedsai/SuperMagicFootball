#!/usr/bin/env python3
"""Desktop and simulated-touch actual-engine acceptance for turn-aware goalmouth square passes."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('desktop','simulated-touch'):
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
   is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,
   value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js+'\nwindow.__SMF_AI=AI;',type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game && !!window.__SMF_AI')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,AI=window.__SMF_AI;
   const field={x:150,y:155,w:2260.8,h:1220};
   const bounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
   const rows=[];
   for(const team of [0,1])for(const agility of [100,1]){
    g.init({home:0,away:1,mode:'quick',humans:0});g.weather='Clear';
    const dir=team===0?1:-1,goalX=team===0?field.x+field.w:field.x;
    const carrier=g.players.find(p=>p.t===team&&p.i===3);
    const runner=g.players.find(p=>p.t===team&&p.i===4);
    const carrierX=goalX-dir*430,centerY=600;
    Object.assign(carrier,{x:carrierX,y:centerY,homeX:carrierX,homeY:centerY,down:false,stun:0,z:0,
     action:'idle',actionTimer:0,slideTimer:0,cd:0,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0,
     fatigue:0,src:{...carrier.src,passing:100,shootAccuracy:0}});
    Object.assign(runner,{x:carrierX+dir*160,y:centerY,homeX:carrierX+dir*160,homeY:centerY-112,
     down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:340,
     dx:dir,dy:0,face:dir,aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:0});
    runner.src={...runner.src,agility};
    for(const q of g.players)if(q!==carrier&&q!==runner)
     Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
    const option=AI.attackingGoalmouthPass(g.players,team,carrier,bounds);
    if(!option){rows.push({team,agility,missing:true});continue;}
    Object.assign(g.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,
     pass:false,passTeam:null,passTarget:null,attacker:team,lastTouchTeam:team,
     shot:null,strike:null,ordinaryShot:false,age:0,canCollect:0});
    g.matchState='play';g.clock=10;
    const originalRandom=Math.random;Math.random=()=>.5;
    let ok=false;
    try{ok=g.pass(carrier,false,false,{preferredTarget:runner,supportRun:true,
     goalmouth:true,preferredPoint:option.target});}finally{Math.random=originalRandom;}
    const event=g.events.at(-1)||{};
    const expectedSlope=(option.target.y-carrier.y)/(option.target.x-carrier.x);
    const actualSlope=g.ball.vy/g.ball.vx;
    rows.push({team,agility,ok,mode:event.mode,loft:event.loft,target:g.ball.passTarget,
     expected:runner.src.id,expectedSlope,actualSlope,
     forward:(option.target.x-runner.x)*dir,lateral:option.target.y-runner.y});
   }
   return {rows,teams:SupermagicFootball.teams.length,
    buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert result['teams']>=223,(kind,result)
  assert result['buttons']==4,(kind,result)
  assert len(result['rows'])==4,(kind,result)
  for row in result['rows']:
   assert not row.get('missing'),(kind,row)
   assert row['ok'] and row['mode']=='goalmouth' and row['loft']=='goalmouth',(kind,row)
   assert row['target']==row['expected'],(kind,row)
   assert abs(row['actualSlope']-row['expectedSlope'])<1e-8,(kind,row)
  for team in [0,1]:
   profiles={row['agility']:row for row in result['rows'] if row['team']==team}
   assert profiles[100]['forward']>profiles[1]['forward']+8,(kind,profiles)
   assert profiles[100]['lateral']<profiles[1]['lateral'],(kind,profiles)
  assert not errors,(kind,errors)
  print('PASS',kind,'mirrored Agility-aware goalmouth pass target and actual launch, four actions and 223 teams',flush=True)
  ctx.close()
 browser.close()
