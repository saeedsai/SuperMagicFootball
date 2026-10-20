#!/usr/bin/env python3
"""Chromium pixel regression: actual Concept Hero JS + synthetic native left-facing atlas.
This isolated test supplements, not replaces, the full playable-game and Pages QA.
"""
from pathlib import Path
from io import BytesIO
import base64, json
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SRC=(ROOT/'src/modules/concepthero.js').read_text()
REGIONS={'front':(0,112),'quarterFront':(112,109),'side':(221,90),'quarterBack':(311,106),'back':(417,115)}
canvas=Image.new('RGBA',(532,265),(0,0,0,0))
draw=ImageDraw.Draw(canvas)
for kind,(left,width) in REGIONS.items():
 mid=left+width//2
 draw.rounded_rectangle((mid-20,106,mid+20,198),radius=8,fill=(25,92,205,255))
 draw.ellipse((mid-21,37,mid+19,101),fill=(222,160,108,255))
 draw.rectangle((mid-13,198,mid-2,253),fill=(12,35,90,255))
 draw.rectangle((mid+3,198,mid+13,253),fill=(12,35,90,255))
 if kind in ('side','quarterFront','quarterBack'):
  draw.polygon([(mid-16,69),(mid-38,78),(mid-16,86)],fill=(245,15,25,255))
 else:
  draw.ellipse((mid-5,73,mid+5,85),fill=(245,15,25,255))
stream=BytesIO();canvas.save(stream,format='WEBP',lossless=True)
b64=base64.b64encode(stream.getvalue()).decode('ascii')
results={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,settings in [('desktop',{'viewport':{'width':1200,'height':800}}),
                         ('touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  context=browser.new_context(**settings);page=context.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('about:blank')
  page.add_script_tag(content='window.CONCEPT_HERO_INLINE='+json.dumps(b64)+';')
  page.add_script_tag(content=SRC+'\nwindow.__hero=CONCEPT_HERO;',type='module')
  page.wait_for_function('window.__hero && window.__hero.status().loaded',timeout=15000)
  checks=page.evaluate("""() => {
    const result=[];
    for(const kind of ['side','quarterFront','quarterBack'])for(const side of [-1,1])for(const run of [0,.65]){
      const c=document.createElement('canvas');c.width=360;c.height=300;
      const ctx=c.getContext('2d',{willReadFrequently:true});
      ctx.translate(180,260);ctx.scale(1.5,1.5);ctx.scale(side,1);
      const rendered=window.__hero.draw(ctx,{src:{renderModel:'concept_hero'}},{kind,side},{run});
      const pix=ctx.getImageData(0,0,360,300).data;
      let total=0,sumX=0;
      for(let y=0;y<300;y++)for(let x=0;x<360;x++){
        const i=(y*360+x)*4;
        if(pix[i]>170&&pix[i+1]<75&&pix[i+2]<75&&pix[i+3]>170){total++;sumX+=x;}
      }
      result.push({kind,side,run,rendered,redPixels:total,noseX:total?sumX/total:0});
    }
    return result;
  }""")
  for c in checks:
   assert c['rendered'] and c['redPixels']>12,c
   if c['side']==1: assert c['noseX']>188,('right-facing nose not to right',c)
   else: assert c['noseX']<172,('left-facing nose not to left',c)
  assert not errors,errors
  results[device]={'checks':len(checks),'status':'PASS','pageErrors':errors}
  context.close()
 browser.close()
print('CONCEPT HERO DIRECTION BROWSER QA PASS',json.dumps(results))
