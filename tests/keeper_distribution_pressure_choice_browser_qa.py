#!/usr/bin/env python3
"""Chromium acceptance for safe short keeper outlets under moderate pressure."""
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
   const g=SupermagicFootball.game,rows=[];
   function run(side,offset){
    g.init({home:0,away:9,humans:0,mode:'quick',options:{...g.options,weather:'Clear'}});g.matchState='play';g.cooldown=0;
    const dir=side===0?1:-1,keeper=g.player(side,0),outlet=g.player(side,1),marker=g.player(1-side,3),keeperX=side===0?216:2344.8,keeperY=765;
    for(const p of g.players){
     Object.assign(p,{stun:0,down:false,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,vx:0,vy:0,shotImpactKnockdownTimer:0});
     if(p.t===side&&!p.keeper&&p!==outlet)Object.assign(p,{x:side===0?1700:800,y:210+(p.i%5)*25});
     if(p.t!==side&&!p.keeper)Object.assign(p,{x:side===0?1800:600,y:220+(p.i%5)*25});
    }
    Object.assign(keeper,{x:keeperX,y:keeperY,face:dir,keeper:true,stun:0,down:false,z:0,action:'idle',actionTimer:0,cd:0,keeperHold:.3});
    Object.assign(outlet,{x:keeperX+dir*430,y:keeperY,z:0,stun:0,down:false,action:'idle',actionTimer:0,moveVX:0,moveVY:0,shotImpactKnockdownTimer:0});
    Object.assign(marker,{x:keeperX+dir*offset.x,y:keeperY+offset.y,z:0,stun:0,down:false,action:'idle',actionTimer:0,moveVX:offset.vx||0,moveVY:offset.vy||0});
    const lane=g.keeperPassingLane(keeper,outlet,480),events=[];g.onEvent=event=>events.push(event);
    Object.assign(g.ball,{owner:keeper,x:keeper.x,y:keeper.y,z:0,vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
    const distributed=g.distributeKeeper(keeper,'auto'),event=events.find(item=>item.type==='keeperDistribution');
    return {distributed,laneClear:lane.clear,mode:event?.mode,pressured:event?.pressured,target:event?.target};
   }
   for(const side of [0,1])rows.push({side,moderate:run(side,{x:60,y:250}),immediate:run(side,{x:0,y:150}),blocked:run(side,{x:215,y:12})});
   return {rows,teams:SupermagicFootball.teams.length,actions:document.querySelectorAll('#touchButtons button[data-act]').length};
  }""")
  assert not errors,(kind,errors);assert result['teams']>=223,(kind,result);assert result['actions']==4,(kind,result);assert len(result['rows'])==2,(kind,result)
  for row in result['rows']:
   moderate=row['moderate'];assert moderate['laneClear'] and moderate['distributed'] and moderate['mode']=='short' and moderate['pressured'] is True,(kind,row)
   immediate=row['immediate'];assert immediate['laneClear'] and immediate['distributed'] and immediate['mode']=='long' and immediate['pressured'] is True,(kind,row)
   blocked=row['blocked'];assert blocked['laneClear'] is False and blocked['distributed'] and blocked['mode']=='long' and blocked['pressured'] is True,(kind,row)
  print('PASS',kind,'mirrored moderate-pressure short outlets, immediate-pressure and blocked-lane clearances',flush=True);ctx.close()
 browser.close()
