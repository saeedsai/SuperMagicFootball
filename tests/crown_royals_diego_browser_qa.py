#!/usr/bin/env python3
"""Actual Crown Royals renderer screenshots in isolated Chromium; no network or fake approval."""
from pathlib import Path
from PIL import Image,ImageChops
from playwright.sync_api import sync_playwright
import base64,hashlib,io,json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/qa_runs_crown_royals';OUT.mkdir(parents=True,exist_ok=True)
html=(ROOT/'diego-visual-qa.html').read_text()
shell=html.split('<script type="module">',1)[0]+'</body></html>'
page_js=html.split('<script type="module">',1)[1].split('</script>',1)[0]
page_js=page_js.replace("import {CROWN_ROYALS} from './src/modules/crownroyals.js';",'')
module=(ROOT/'src/modules/crownroyals.js').read_text().replace('export {CROWN_ROYALS};','')
alex_sprite=base64.b64encode((ROOT/'assets/crown_royals/alex_three_views.png').read_bytes()).decode()
leo_sprite=base64.b64encode((ROOT/'assets/crown_royals/leo_three_views.png').read_bytes()).decode()
kwame_sprite=base64.b64encode((ROOT/'assets/crown_royals/kwame_three_views.png').read_bytes()).decode()
diego_sprite=base64.b64encode((ROOT/'assets/crown_royals/diego_three_views.png').read_bytes()).decode()
script='const CROWN_ROYALS_INLINE='+json.dumps(alex_sprite)+';\n'
script+='const CROWN_ROYALS_LEO_INLINE='+json.dumps(diego_sprite)+';\n'+module+'\n'+page_js
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1400,'height':850},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank')
 page.set_content(shell)
 page.add_script_tag(content=script,type='module')
 page.wait_for_function("document.querySelector('#status').textContent.includes('Game renderer loaded')",timeout=15000)
 frames={}
 for action in ['idle','run','jump','shoot','tackle']:
  page.click('#'+action)
  raw=page.eval_on_selector('#sheet',"(c)=>c.toDataURL('image/png').split(',')[1]")
  image=Image.open(io.BytesIO(base64.b64decode(raw))).convert('RGB')
  assert image.size==(1300,550)
  image.save(OUT/f'diego_{action}.png')
  frames[action]=image
 assert not errors,errors
 assert len(frames['idle'].getcolors(maxcolors=1000000) or [])>30
 assert 'Diego #4' in page.locator('h1').inner_text()
 assert 'crown_royals_reference_diego' in html and 'crown_royals_reference_alex' not in html
 for action in ['run','jump','shoot','tackle']:
  assert ImageChops.difference(frames['idle'],frames[action]).getbbox() is not None,action
 report={'status':'PASS renderer smoke only; NOT full animation acceptance','player':'Diego #4',
  'team':'Crown Royals (Art WIP)','true_views':['front','side','back'],
  'approximated_views':['quarterFront','quarterBack'],
  'animation':['experimental run','jump transform','shoot transform','tackle transform'],
  'not_yet_verified':['12 unique players','bespoke action frames','reference consistency in side hair'],
  'screenshots':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in OUT.glob('diego_*.png')}}
 (OUT/'report.json').write_text(json.dumps(report,indent=2))
 print(json.dumps(report,indent=2));browser.close()
