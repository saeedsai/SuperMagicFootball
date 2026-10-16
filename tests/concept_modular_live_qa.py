#!/usr/bin/env python3
"""Hosted GitHub Pages: verify the actual opt-in modular model and capture live match."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
URL='https://saeedsai.github.io/SuperMagicFootball/'
OUT=Path('docs/qa_runs_live_concept_modular');OUT.mkdir(parents=True,exist_ok=True)
report={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,opts in [('desktop',{'viewport':{'width':1366,'height':860}}),('touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  context=browser.new_context(**opts,service_workers='block')
  page=context.new_page()
  page.set_default_timeout(18000)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  info=None
  for attempt in range(12):
   try:
    response=page.goto(URL+'?conceptModularPreview=1&ci-modular='+str(attempt),wait_until='domcontentloaded',timeout=50000)
    assert response and response.status==200,'Pages document HTTP status not 200'
    page.wait_for_function("!!window.SupermagicFootball?.conceptModularStatus",timeout=18000)
    page.wait_for_function("window.SupermagicFootball.conceptModularStatus().loaded",timeout=12000)
    info=page.evaluate("""async () => {
      const e=window.SupermagicFootball,c=e.teams.find(t=>t.id==='demo_concept_royals');
      const asset=await fetch('./assets/characters/concept_modular_v1/source/hair_front_front.svg?no-cache='+Date.now(),{cache:'no-store'});
      const source=await fetch('./src/modules/conceptmodular.js?no-cache='+Date.now(),{cache:'no-store'});
      const rear=await fetch('./assets/characters/concept_modular_v1/source/hair_back_back.svg?no-cache='+Date.now(),{cache:'no-store'});
      const face=await fetch('./assets/characters/concept_modular_v1/source/face_front_front.svg?no-cache='+Date.now(),{cache:'no-store'});
      const arm=await fetch('./assets/characters/concept_modular_v1/source/arm_near_front.svg?no-cache='+Date.now(),{cache:'no-store'});
      const farArm=await fetch('./assets/characters/concept_modular_v1/source/arm_far_front.svg?no-cache='+Date.now(),{cache:'no-store'});
      const moduleText=source.ok?await source.text():'';
      return {status:e.conceptModularStatus(),teams:e.teams.length,
        modular:c?.customRoster.filter(p=>p.renderModel==='concept_modular_v1').length,
        old:c?.customRoster.filter(p=>p.renderModel==='concept_hero').length,
        svgStatus:asset.status,rearSvgStatus:rear.status,faceSvgStatus:face.status,armSvgStatus:arm.status,farArmSvgStatus:farArm.status,moduleStatus:source.status,
        svg:asset.ok?(await asset.text()).includes('Royals painted swept chestnut fringe'):false,
        module:moduleText.includes('concept_modular_v1'),
        armIdleBlend:moduleText.includes('const armBlend=Math.min(1,Math.abs(phase)/.18);') && moduleText.includes('const armPhase=phase*armBlend*armBlend*(3-2*armBlend);'),
        rearSvg:rear.ok?(await rear.text()).includes('Royals painted chestnut nape and back hair'):false,
        faceSvg:face.ok?(await face.text()).includes('Royals painted front head and expression'):false,
        armSvg:arm.ok?(await arm.text()).includes('Royals front near arm'):false,
        farArmSvg:farArm.ok?(await farArm.text()).includes('Royals painted far-front arm and hand'):false};
    }""")
    assert info['teams']==224 and info['modular']==1 and info['old']==11,info
    assert info['svgStatus']==200 and info['rearSvgStatus']==200 and info['faceSvgStatus']==200 and info['armSvgStatus']==200 and info['farArmSvgStatus']==200 and info['moduleStatus']==200 and info['svg'] and info['rearSvg'] and info['faceSvg'] and info['armSvg'] and info['farArmSvg'] and info['module'],info
    assert info['armIdleBlend'],'Pages still serves an old visual arm-gait module: '+str(info)
    assert set(info['status']['authoredViews'])=={'front','back'},info
    assert info['status']['faceLoaded'] and 'face_front_front' in info['status']['authoredParts'],info
    assert info['status']['armLoaded'] and 'arm_near_front' in info['status']['authoredParts'],info
    assert info['status']['farArmLoaded'] and 'arm_far_front' in info['status']['authoredParts'],info
    assert info['status']['loaded'] and not info['status']['error'],info
    break
   except Exception as e:
    print('RETRY_HOSTED_MODULAR',device,attempt+1,str(e)[:170],flush=True)
    if attempt==11:raise
    page.wait_for_timeout(15000)
  page.locator('[data-action="navQuick"]').first.click()
  page.locator('[data-action="conceptDemo"]').first.click()
  page.locator('[data-action="kickoff"]').first.click()
  page.wait_for_function("SupermagicFootball.game.matchState==='play'",timeout=16000)
  page.wait_for_timeout(700)
  active=page.evaluate("() => SupermagicFootball.game.players.filter(p=>p.t===0&&p.src?.renderModel==='concept_modular_v1').length")
  assert active>=1,'Opt-in modular player not present in a real playable match'
  assert not errors,errors
  page.screenshot(path=str(OUT/(device+'_hosted_modular_match.png')))
  report[device]={**info,'activeModular':active,'pageErrors':errors,'result':'PASS'}
  print('HOSTED_MODULAR_PASS',device,json.dumps(report[device]),flush=True)
  context.close()
 browser.close()
(OUT/'report.json').write_text(json.dumps(report,indent=2))
