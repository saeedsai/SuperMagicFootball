#!/usr/bin/env python3
"""Validate sourced Spain goalkeeper metadata reaches playable runtime on desktop/touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Run python3 scripts/build.py first'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for device in ('desktop','simulated-touch'):
  mobile=device!='desktop'
  ctx=browser.new_context(viewport={'width':1280,'height':720} if not mobile else {'width':844,'height':390},
                          is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.rosterFor&&!!window.SupermagicFootball?.game',timeout=60000)
  info=page.evaluate("""() => {
    const api=SupermagicFootball,spain=api.teams.find(t=>t.id==='national26_0');
    if(!spain||spain.name!=='Spain'||spain.index!==13)throw Error('Spain identity changed');
    const raw=api.rosterFor(spain.index),g=api.game;
    g.init({home:spain.index,away:0,humans:0,mode:'quick'});
    const runtime=g.rosters[0];
    const pick=(items,id)=>{const p=items.find(x=>x.id===id);
      return p&&{id:p.id,name:p.name,role:p.role,num:p.num,age:p.age,
                 heightCm:p.heightCm,rating:p.rating,fictional:p.fictional};};
    const ids=['national26_0_0','national26_0_gk_12'];
    return {teamId:g.teamIds[0],rawSize:raw.length,matchSize:runtime.length,
      raw:ids.map(id=>pick(raw,id)),play:ids.map(id=>pick(runtime,id)),
      quotas:Object.fromEntries(['GK','DF','MF','FW'].map(role=>[
        role,runtime.filter(p=>p.role===role).length])),
      unchangedMidfield:['national26_0_11','national26_0_8'].map(id=>
        {const p=runtime.find(p=>p.id===id);return {name:p.name,age:p.age,heightCm:p.heightCm}})};
  }""")
  assert info['teamId']==13 and info['rawSize']==12 and info['matchSize']==12,(device,info)
  assert info['raw']==info['play'],(device,'game input differs from source roster',info)
  assert info['quotas']=={'GK':2,'DF':3,'MF':4,'FW':3},(device,info)
  for p,id,name,age,height,num,rating in zip(
    info['play'],
    ('national26_0_0','national26_0_gk_12'),('David Raya','Unai Simón'),
    (31,29),(183,190),(1,13),(97,95)):
    assert p=={'id':id,'name':name,'role':'GK','num':num,
               'age':age,'heightCm':height,'rating':rating,'fictional':False},(device,p)
  assert info['unchangedMidfield']==[{'name':'Pedri','age':23,'heightCm':174},
                                  {'name':'Gavi','age':22,'heightCm':174}],(device,info)
  assert not errors,(device,errors)
  print('SPAIN_KEEPER_METADATA_PASS',device,'source/playable parity, correct ages and heights, quotas stable',flush=True)
  ctx.close()
 browser.close()
