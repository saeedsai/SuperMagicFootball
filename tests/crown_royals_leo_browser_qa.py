#!/usr/bin/env python3
"""Actual Crown Royals renderer screenshots in isolated Chromium; no network or fake approval."""
from pathlib import Path
from PIL import Image,ImageChops
from playwright.sync_api import sync_playwright
import base64,hashlib,io,json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/qa_runs_crown_royals';OUT.mkdir(parents=True,exist_ok=True)
html=(ROOT/'leo-visual-qa.html').read_text()
shell=html.split('<script type="module">',1)[0]+'</body></html>'
page_js=html.split('<script type="module">',1)[1].split('</script>',1)[0]
page_js=page_js.replace("import {CROWN_ROYALS} from './src/modules/crownroyals.js';",'')
module=(ROOT/'src/modules/crownroyals.js').read_text().replace('export {CROWN_ROYALS};','')
alex_sprite=base64.b64encode((ROOT/'assets/crown_royals/alex_three_views.png').read_bytes()).decode()
leo_sprite=base64.b64encode((ROOT/'assets/crown_royals/leo_three_views.png').read_bytes()).decode()
script='const CROWN_ROYALS_INLINE='+json.dumps(alex_sprite)+';\n'
leo_quarter=base64.b64encode((ROOT/'assets/crown_royals/leo_quarter_views.svg').read_bytes()).decode()
script+='const CROWN_ROYALS_LEO_INLINE='+json.dumps(leo_sprite)+';\n'
script+='const CROWN_ROYALS_LEO_QUARTER_INLINE='+json.dumps(leo_quarter)+';\n'+module+'\n'
script+='window.__leoQuarterStatus=()=>CROWN_ROYALS.status();\n'+page_js
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1400,'height':850},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank')
 page.set_content(shell)
 page.add_script_tag(content=script,type='module')
 page.wait_for_function("document.querySelector('#status').textContent.includes('Game renderer loaded')",timeout=15000)
 page.wait_for_function("window.__leoQuarterStatus && window.__leoQuarterStatus().leoQuarterLoaded",timeout=15000)
 assert page.evaluate("window.__leoQuarterStatus().leoQuarterError") is False
 # Inspect the actual decoded SVG pixels: no baked backdrop and genuinely
 # different front/rear quarter artwork, not just a successful network load.
 alpha=page.evaluate("""async (source) => {
  const image=new Image();image.src='data:image/svg+xml;base64,'+source;
  await image.decode();
  const canvas=document.createElement('canvas');canvas.width=96;canvas.height=90;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const data=ctx.getImageData(0,0,96,90).data;
  const pixel=(x,y)=>data[(y*96+x)*4+3];
  let visible=0,different=0;
  for(let y=0;y<90;y++)for(let x=0;x<48;x++){
   const a=(y*96+x)*4,b=(y*96+x+48)*4;
   if(data[a+3]>100)visible++;
   for(let channel=0;channel<4;channel++)if(Math.abs(data[a+channel]-data[b+channel])>20){different++;break;}
  }
  return {corners:[pixel(0,0),pixel(47,0),pixel(48,0),pixel(95,89)],visible,different};
 }""",leo_quarter)
 assert alpha['corners']==[0,0,0,0],f"opaque SVG background: {alpha}"
 assert alpha['visible']>100 and alpha['different']>100,f"missing or duplicated Leo art: {alpha}"
 frames={}
 for action in ['idle','run','jump','shoot','tackle']:
  page.click('#'+action)
  raw=page.eval_on_selector('#sheet',"(c)=>c.toDataURL('image/png').split(',')[1]")
  image=Image.open(io.BytesIO(base64.b64decode(raw))).convert('RGB')
  assert image.size==(1300,550)
  image.save(OUT/f'leo_{action}.png')
  frames[action]=image
 assert not errors,errors
 assert len(frames['idle'].getcolors(maxcolors=1000000) or [])>30
 assert 'Leo #2' in page.locator('h1').inner_text()
 assert 'crown_royals_reference_leo' in html and 'crown_royals_reference_alex' not in html
 for action in ['run','jump','shoot','tackle']:
  assert ImageChops.difference(frames['idle'],frames[action]).getbbox() is not None,action
 report={'status':'PASS renderer smoke only; NOT full animation acceptance','player':'Leo #2',
  'team':'Crown Royals (Art WIP)','true_views':['front','side','back'],
  'authored_quarter_views':['quarterFront','quarterBack'],
  'quarter_alpha_qa':alpha,
  'animation':['experimental run','jump transform','shoot transform','tackle transform'],
  'not_yet_verified':['12 unique players','bespoke action frames','reference consistency in side hair'],
  'screenshots':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in OUT.glob('leo_*.png')}}
 (OUT/'report.json').write_text(json.dumps(report,indent=2))
 print(json.dumps(report,indent=2));browser.close()
