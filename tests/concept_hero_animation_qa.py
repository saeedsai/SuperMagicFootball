#!/usr/bin/env python3
"""Verify the playable concept character's all-view running animation and transparent leg gaps."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
import base64,io,json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs'/'qa_runs_concept_hero'
OUT.mkdir(parents=True,exist_ok=True)
raw=(ROOT/'tests/.generated/play.html').read_text()
shell=raw.split('<script type="module">',1)[0]+'</body></html>'
script=raw.split('<script type="module">',1)[1].split('</script>',1)[0]+"\nwindow.__smf_concept_test=CONCEPT_HERO;\n"
MAN=json.loads((ROOT/'assets/concept_hero/hero_atlas_manifest.json').read_text())
from PIL import Image as PILImage
with PILImage.open(ROOT/'assets/concept_hero/hero_atlas.webp') as src:
    image=src.convert('RGBA')
    for name,(x,y) in {'front':(57,225),'quarterFront':(61,231),'quarterBack':(61,228),'back':(56,228)}.items():
        assert image.getpixel((MAN['regions'][name]['x']+x,y))[3]<12,name+' white backdrop remains'
CHECK=r'''async () => {
 const cHero=window.__smf_concept_test,p={src:{renderModel:'concept_hero'},action:'run',preview:false};
 const results=[];
 for(const kind of ['front','quarterFront','side','quarterBack','back']){
  const snaps=[],frames=[];
  for(const stride of [0,.95,-.95,.4]){
   const canvas=document.createElement('canvas');canvas.width=240;canvas.height=210;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.translate(120,180);ctx.scale(1.35,1.35);
   if(!cHero.draw(ctx,p,{kind,side:1},{run:stride}))return {ok:false,error:kind};
   snaps.push(canvas.toDataURL('image/png'));
   frames.push(canvas.getContext('2d').getImageData(0,0,240,210).data);
  }
  function diff(a,b){let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])+Math.abs(a[i+3]-b[i+3])>95)n++;return n;}
  results.push({kind,motion:diff(frames[1],frames[2]),idleVsRun:diff(frames[0],frames[1]),images:snaps});
 }
 return {ok:cHero.status().animatedViews===5&&results.every(r=>r.motion>140&&r.idleVsRun>140),results};
}'''
records={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,opts in [('desktop',{'viewport':{'width':1280,'height':840}}),('simulated-touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  context=browser.new_context(**opts);page=context.new_page()
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(shell);page.add_script_tag(content=script,type='module')
  page.wait_for_function('!!window.__smf_concept_test&&window.__smf_concept_test.status().loaded',timeout=30000)
  result=page.evaluate(CHECK)
  assert result['ok'] and not errors,(device,result,errors)
  records[device]={ 'result':'PASS','views':[{k:v for k,v in entry.items() if k!='images'} for entry in result['results']],'errors':errors }
  if device=='desktop':
   sheet=Image.new('RGB',(1020,920),'#e4eeee');painter=ImageDraw.Draw(sheet)
   painter.text((14,12),'GAME SPRITES — IDLE / RUN FORWARD / RUN BACK / MID STRIDE',fill='#122e43')
   for i,item in enumerate(result['results']):
    for j,png in enumerate(item['images']):
     sprite=Image.open(io.BytesIO(base64.b64decode(png.split(',',1)[1]))).convert('RGBA')
     tile=Image.new('RGBA',sprite.size,'#487e79');tile.alpha_composite(sprite)
     sheet.paste(tile.convert('RGB').resize((200,175)),(10+200*i,42+215*j))
     painter.text((13+200*i,25+215*j),item['kind']+' '+['idle','run +','run -','run mid'][j],fill='#122e43')
   sheet.save(OUT/'concept_running_animation_contact_sheet.png')
  print('Concept running',device,'PASS',records[device]['views'],flush=True)
  context.close()
 browser.close()
(OUT/'concept_running_animation_qa.json').write_text(json.dumps(records,indent=2))
