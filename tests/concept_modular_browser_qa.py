#!/usr/bin/env python3
"""Capture actual desktop/touch game screenshots and compare modular pixels to legacy."""
import base64,io,json
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/qa_runs_concept_modular'
OUT.mkdir(parents=True,exist_ok=True)
raw=(ROOT/'tests/.generated/play.html').read_text()
shell=raw.split('<script type="module">',1)[0]+'</body></html>'
js=raw.split('<script type="module">',1)[1].split('</script>',1)[0]
results={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,opts in [('desktop',{'viewport':{'width':1400,'height':930}}),('touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  context=browser.new_context(**opts)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('about:blank?conceptModularPreview=1')
  page.set_content(shell)
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
  counts=page.evaluate("""() => {const t=SupermagicFootball.teams.find(t=>t.id==='demo_concept_royals');return [SupermagicFootball.teams.length,t.customRoster.filter(p=>p.renderModel==='concept_modular_v1').length,t.customRoster.filter(p=>p.renderModel==='concept_hero').length]}""")
  assert counts==[224,1,11],counts
  page.wait_for_function("typeof CONCEPT_MODULAR!=='undefined' && CONCEPT_MODULAR.status().loaded",timeout=15000)
  page.locator('[data-action=navQuick]').first.click()
  page.locator('[data-action=conceptDemo]').first.click()
  page.locator('[data-action=kickoff]').first.click()
  page.wait_for_function("SupermagicFootball.game.matchState==='play'",timeout=16000)
  page.wait_for_timeout(450)
  data=page.evaluate("""() => {
    const e=SupermagicFootball,g=e.game,t=e.teams.find(x=>x.id==='demo_concept_royals');
    const p=g.players.find(x=>x.t===0&&x.src?.renderModel==='concept_modular_v1')||g.players.find(x=>x.t===0&&!x.keeper);
    const src=t.customRoster[9];
    function draw(model,dy){
      const c=document.createElement('canvas');c.width=240;c.height=250;
      const x=c.getContext('2d',{willReadFrequently:true});x.translate(120,222);x.scale(1.5,1.5);
      e.renderer.drawPlayer(x,{...p,x:0,y:0,z:0,dx:0,dy,face:1,visualFacing:null,controlled:false,preview:true,action:'idle',anim:0,src:{...src,renderModel:model,appearance:{...src.appearance,renderModel:model}}},
        {getTeam:()=>g.getTeam(0),options:{showNames:false}});
      return c.toDataURL('image/png');
    }
    return {front:draw('concept_modular_v1',1),old:draw('concept_hero',1),back:draw('concept_modular_v1',-1),backOld:draw('concept_hero',-1),status:CONCEPT_MODULAR.status()};
  }""")
  def png(value):return Image.open(io.BytesIO(base64.b64decode(value.split(',',1)[1]))).convert('RGBA')
  f,o,b,bo=[png(data[k]) for k in ('front','old','back','backOld')]
  changed=sum(a!=z for a,z in zip(f.getdata(),o.getdata()))
  assert changed>=80,('Hair must alter real game pixels',changed)
  assert list(b.getdata())==list(bo.getdata()),'Incomplete back direction did not fall back'
  assert not errors,errors
  f.save(OUT/(device+'_front_modular.png'));o.save(OUT/(device+'_front_legacy.png'))
  page.screenshot(path=str(OUT/(device+'_actual_match.png')))
  results[device]={'status':'PASS','front_changed_pixels':changed,'back_legacy_identical':True,'page_errors':errors}
  context.close()
 browser.close()
(OUT/'qa_report.json').write_text(json.dumps(results,indent=2))
print('CONCEPT_MODULAR_BROWSER_PASS',json.dumps(results))
