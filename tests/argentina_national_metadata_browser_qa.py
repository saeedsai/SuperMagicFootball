#!/usr/bin/env python3
"""Argentina's sourced Messi and Martínez ages/heights reach the real playable roster."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Run python3 scripts/build.py to generate the current game'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 for device in ('desktop','simulated-touch'):
  mobile=device!='desktop'
  ctx=browser.new_context(viewport={'width':1280,'height':720} if not mobile
      else {'width':844,'height':390},is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game && !!window.SupermagicFootball?.rosterFor',timeout=60000)
  result=page.evaluate("""() => {
   const api=SupermagicFootball,team=api.teams.find(t=>t.id==='national26_1');
   if(!team||team.name!=='Argentina')throw Error('Argentina team identity changed');
   const raw=api.rosterFor(team.index),g=api.game;
   g.init({home:team.index,away:0,humans:0,mode:'quick'});
   const game=g.rosters[0],ids=['national26_1_gk_13','national26_1_9'];
   const pick=(list,id)=>{const p=list.find(x=>x.id===id);
     return p&&{id:p.id,name:p.name,role:p.role,num:p.num,age:p.age,
                heightCm:p.heightCm,rating:p.rating,fictional:p.fictional};};
   return {name:team.name,sourceCount:raw.length,gameCount:game.length,
     teamId:g.teamIds[0],expectedIndex:team.index,
     raw:ids.map(id=>pick(raw,id)),play:ids.map(id=>pick(game,id)),
     roles:Object.fromEntries(['GK','DF','MF','FW'].map(role=>[
      role,game.filter(x=>x.role===role).length])),
     ids:game.map(x=>x.id)};
  }""")
  assert result['teamId']==result['expectedIndex'],(device,result)
  assert result['sourceCount']==12 and result['gameCount']==12,(device,result)
  assert len(set(result['ids']))==12,(device,'duplicate identity',result)
  assert result['roles']=={'GK':2,'DF':3,'MF':4,'FW':3},(device,result)
  assert result['raw']==result['play'],(device,'source/play parity',result)
  assert result['play']==[
    {'id':'national26_1_gk_13','name':'Emiliano Martínez','role':'GK',
      'num':14,'age':34,'heightCm':195,'rating':95,'fictional':False},
    {'id':'national26_1_9','name':'Lionel Messi','role':'FW',
      'num':10,'age':39,'heightCm':170,'rating':93,'fictional':False},
  ],(device,'source backed metadata not in playable runtime',result)
  assert not errors,(device,'console errors',errors)
  print('ARGENTINA_NATIONAL_METADATA_PASS',device,
        'verified source/playable ages and heights, 12 players and stable 2-3-4-3 roles',flush=True)
  ctx.close()
 browser.close()
