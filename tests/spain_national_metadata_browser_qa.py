#!/usr/bin/env python3
"""Spain national sourced DOB/height reach real modular game: desktop and touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Run python3 scripts/build.py to generate modular game'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                           args=['--no-sandbox','--disable-dev-shm-usage'])
 for device in ['desktop','simulated-touch']:
  mobile=device!='desktop'
  ctx=browser.new_context(viewport={'width':1280,'height':720} if not mobile
     else {'width':844,'height':390},is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.rosterFor&&!!window.SupermagicFootball?.game',
                         timeout=60000)
  result=page.evaluate("""() => {
   const api=SupermagicFootball,team=api.teams.find(t=>t.id==='national26_0');
   if(!team||team.name!=='Spain'||team.index!==13)throw Error('Spain team mapping changed');
   const raw=api.rosterFor(team.index),g=api.game;
   g.init({home:team.index,away:0,humans:0,mode:'quick'});
   const runtime=g.rosters[0];
   const pick=(roster,id)=>{const p=roster.find(x=>x.id===id);return p&&({
     id:p.id,name:p.name,role:p.role,num:p.num,age:p.age,heightCm:p.heightCm,rating:p.rating
   });};
   return {team:team.name,size:raw.length,gameSize:runtime.length,raw:[
     pick(raw,'national26_0_11'),pick(raw,'national26_0_8')],runtime:[
     pick(runtime,'national26_0_11'),pick(runtime,'national26_0_8')],
     roleCount:Object.fromEntries(['GK','DF','MF','FW'].map(role=>[
       role,raw.filter(x=>x.role===role).length])),
     teamId:g.teamIds[0],matchState:g.matchState};
  }""")
  assert result['size']==12 and result['gameSize']==12,(device,result)
  assert result['teamId']==13,(device,result)
  assert result['roleCount']=={'GK':2,'DF':3,'MF':4,'FW':3},(device,result)
  assert result['raw']==result['runtime'],(device,'source and playable runtime differ',result)
  for player,id,name,age,num in zip(result['runtime'],
            ('national26_0_11','national26_0_8'),('Pedri','Gavi'),(23,22),(12,9)):
   assert player=={'id':id,'name':name,'role':'MF','num':num,'age':age,
                  'heightCm':174,'rating':97},(device,player)
  assert not errors,(device,errors)
  print('SPAIN_NATIONAL_METADATA_PASS',device,'12-player Spain runtime, Pedri 23/Gavi 22 and 174cm verified',flush=True)
  ctx.close()
 browser.close()
