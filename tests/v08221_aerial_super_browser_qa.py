"""v0.8.22.1 browser QA: packaged game, real input adapter state,
reworked aerial attacks and grounded double-jump, desktop + simulated Android.
Not a physical-device certification.
"""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
markup=(Path(__file__).resolve().parents[1]/'play.html').read_text()
JS=r'''() => {
 const {game:g,input:i}=SupermagicFootball;
 const results=[];
 const make=(kind,hasSuper=true,team=0)=>{
  g.init({home:0,away:9,options:{...g.options,weather:'Clear'}});
  g.humans=team?2:1;g.autoSwitch=()=>false;g.driveAI=()=>{};g.cooldown=0;
  const p=g.player(team,3);g.controlled[team]=p.i;
  p.src={...p.src,superAbility:hasSuper?p.src.superAbility:null};
  p.x=1660;p.y=770;p.cd=0;p.stun=0;p.fatigue=0;p.specialCd=0;
  for(const q of g.players)if(q!==p){q.x=q.t?3260:320;q.y=1100;}
  if(kind==='owned')g.take(p);
  else {g.ball.owner=null;g.ball.liftOwner=null;g.ball.x=p.x+24;g.ball.y=p.y;g.ball.z=155;g.ball.vx=g.ball.vy=g.ball.vz=0;g.ball.canCollect=3;}
  g.events.length=0;return p;
 };
 const step=(t,s={},press={},release={},n=1,dt=.016)=>{
  i.state[t]={x:0,y:0,...s};i.pressed[t]=press;i.releases[t]=release;
  for(let k=0;k<n;k++){g.updatePlayers(dt);i.pressed[t]={};i.releases[t]={};}
 };
 for(const [type,key,hasSuper,two] of [
  ['header','shoot',true,false],['header','shoot',true,true],
  ['bicycle','dribble',true,false],['bicycle','dribble',true,true],
  ['header','shoot',false,true],['bicycle','dribble',false,true]]){
  const p=make('loose',hasSuper),team=0;
  g.jump(p);step(team,{}, {},{},5,.018);
  step(team,{[key]:1},{[key]:true});step(team,{}, {},{[key]:true});
  if(two)step(team,{[key]:1},{[key]:true});
  else step(team,{}, {},{},24,.018);
  const expected=two?(type==='header'?'superHead':'superBicycle'):(type==='header'?'header':'bicycle');
  const ok=p.action===expected && !!g.ball.shot===(two&&hasSuper);
  results.push({type,hasSuper,two,action:p.action,expected,hasShape:!!g.ball.shot,ok});
 }
 for(const [jumps,hasSuper] of [[1,true],[2,true],[2,false]]){
  const p=make('owned',hasSuper);g.jump(p);step(0,{}, {},{},6,.02);
  if(jumps===2){p.vz=75;g.jump(p);}
  step(0,{shoot:1},{shoot:true});
  results.push({type:'ground',jumps,hasSuper,action:p.action,hasShape:!!g.ball.shot,
   ok:!!g.ball.shot===(jumps===2&&hasSuper)&&g.ball.z>0});
 }
 return results;
}'''
with sync_playwright() as pw:
 for name,mobile in [('Desktop Chromium',False),('Simulated Android',True)]:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  try:
   ctx=browser.new_context(viewport={'width':1380,'height':820} if not mobile else {'width':740,'height':410},is_mobile=mobile,has_touch=mobile)
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.set_content(markup,wait_until='load')
   page.wait_for_function("window.SupermagicFootball?.version==='0.8.22.1-alpha'",timeout=20000)
   assert sorted(page.locator('[data-act]').evaluate_all('(els)=>els.map(x=>x.dataset.act)'))==['dribble','jump','pass','shoot']
   page.locator('[data-action="help"]').first.click()
   helptext=page.locator('body').inner_text()
   for phrase in ['Super Header','Super Bicycle','Double JUMP','two DRIBBLE']:
    assert phrase.lower() in helptext.lower(),(name,phrase)
   results=page.evaluate(JS)
   assert len(results)==9 and all(x['ok'] for x in results),(name,results)
   assert not errors,(name,errors)
   print(f'PASS {name}: 9 normal/super aerial and grounded shot scenarios, specialist fallback, control help, 4 buttons',flush=True)
   ctx.close()
  finally:browser.close()
