#!/usr/bin/env python3
"""Real-engine keeper distribution avoids a defender closing into a short outlet."""
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
  ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop'
                          else {'width':844,'height':390},
                          is_mobile=kind!='desktop',has_touch=kind!='desktop')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html)
  page.evaluate("""() => {const v=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>v.get(k)||null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),clear:()=>v.clear()}})}""")
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball?.game')
  result=page.evaluate("""() => {
   const g=SupermagicFootball.game,rows=[];
   for(const side of [0,1]){
    g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});
    g.matchState='play';
    const keeper=g.player(side,0),blockedOutlet=g.player(side,1),clearOutlet=g.player(side,2);
    const dir=side===0?1:-1,keeperX=side===0?100:2300;
    const outletX=keeperX+dir*750,markerX=keeperX+dir*400;
    for(const p of g.players){
     Object.assign(p,{stun:0,down:false,z:0,action:'idle',actionTimer:0,
      moveVX:0,moveVY:0,vx:0,vy:0,shotImpactKnockdownTimer:0});
     if(p.t===side&&!p.keeper&&p!==blockedOutlet&&p!==clearOutlet)
      Object.assign(p,{x:side===0?1700:700,y:650});
     if(p.t!==side&&!p.keeper)Object.assign(p,{x:side===0?1800:600,y:650});
    }
    Object.assign(keeper,{x:keeperX,y:340,face:dir,keeper:true,stun:0,down:false,z:0});
    Object.assign(blockedOutlet,{x:outletX,y:340,moveVX:0,moveVY:0});
    Object.assign(clearOutlet,{x:outletX,y:600,moveVX:0,moveVY:0});
    const marker=g.player(1-side,3);
    Object.assign(marker,{x:markerX,y:450,moveVX:0,moveVY:-300,vx:0,vy:-300,
      stun:0,down:false,z:0,action:'idle',actionTimer:0});
    const blocked=g.keeperPassingLane(keeper,blockedOutlet,480);
    const clear=g.keeperPassingLane(keeper,clearOutlet,480);
    const events=[];g.onEvent=event=>events.push(event);
    Object.assign(g.ball,{owner:keeper,x:keeper.x,y:keeper.y,z:0,vx:0,vy:0,vz:0});
    const distributed=g.distributeKeeper(keeper,'short');
    const event=events.find(item=>item.type==='keeperDistribution');
    rows.push({side,blocked:blocked.clear,clear:clear.clear,distributed,
      target:event?.target,expected:clearOutlet.src.name,mode:event?.mode,
      pressured:event?.pressured});
   }
   return {rows,teamCount:SupermagicFootball.teams.length};
  }""")
  assert not errors,(kind,errors)
  assert result['teamCount']>=223,(kind,result)
  assert len(result['rows'])==2,(kind,result)
  for row in result['rows']:
   assert row['blocked'] is False,(kind,row)
   assert row['clear'] is True,(kind,row)
   assert row['distributed'] is True,(kind,row)
   assert row['target']==row['expected'],(kind,row)
   assert row['mode']=='short' and row['pressured'] is False,(kind,row)
  print('PASS',kind,'both mirrored keepers choose the receiver whose projected outlet lane stays clear',flush=True)
  ctx.close()
 browser.close()
