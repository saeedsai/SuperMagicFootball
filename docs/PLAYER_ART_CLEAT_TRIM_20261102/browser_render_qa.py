#!/usr/bin/env python3
"""Render representative team trims through the actual gameplay renderer."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=True)
html = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf-8')
shell = html.split('<script type="module">', 1)[0] + '</body></html>'
module = html.split('<script type="module">', 1)[1].split('</script>', 1)[0]
render = r'''() => {
 const env=SupermagicFootball,p=env.game.players.find(v=>v&&!v.keeper);
 const palettes=[
  {label:'GREEN TRIM',primary:'#174b38',secondary:'#f1efe5',trim:'#30b56a'},
  {label:'RED TRIM',primary:'#a72e37',secondary:'#f3f3ea',trim:'#e25a53'},
  {label:'SILVER TRIM',primary:'#172a43',secondary:'#f3f3ea',trim:'#d8dbe2'}
 ];
 const root=document.createElement('main');root.id='cleat-trim-qa';
 root.style.cssText='position:static!important;display:grid!important;width:900px!important;padding:20px!important;background:#13263b!important;color:#f8f5ea!important;font:14px Arial!important;grid-template-columns:repeat(3,1fr)!important;gap:12px!important;z-index:999999!important';
 const errors=[];let nontransparent=0,edgePixels=0;
 for(const kit of palettes){
  const card=document.createElement('section');card.style.cssText='position:static!important;display:block!important;background:#203b53!important;padding:12px!important;border:1px solid #61798d!important;text-align:center!important';
  const h=document.createElement('strong');h.textContent=kit.label;h.style.cssText='position:static!important;display:block!important;margin-bottom:6px!important';card.append(h);
  const cv=document.createElement('canvas');cv.width=160;cv.height=160;cv.style.cssText='position:static!important;width:240px!important;height:240px!important;image-rendering:pixelated!important;background:#476b7e!important;display:block!important;margin:auto!important;visibility:visible!important';
  const ctx=cv.getContext('2d',{willReadFrequently:true});
  env.renderer.drawPlayer(ctx,{...p,src:{...p.src,appearance:{skin:'#dca27f',hair:'#503a2b',face:0,style:1,beard:0,eyes:6,brows:4,nose:2,lips:1,accessory:0}},
   x:80,y:132,dx:0,dy:1,visualFacing:null,z:0,action:'idle',anim:0,controlled:false,preview:true},
   {getTeam:()=>kit,options:{showNames:false}});
  const data=ctx.getImageData(0,0,160,160).data;let ink=0,edge=0;
  for(let i=0;i<data.length;i+=4)if(data[i+3]>40){ink++;const px=(i/4)%160,py=((i/4)/160)|0;if(px<2||px>157||py<2||py>157)edge++;}
  nontransparent+=ink;edgePixels+=edge;
  const crop=document.createElement('canvas');crop.width=160;crop.height=64;crop.style.cssText='position:static!important;width:240px!important;height:96px!important;image-rendering:pixelated!important;background:#476b7e!important;display:block!important;margin:8px auto 0!important;visibility:visible!important';
  crop.getContext('2d').imageSmoothingEnabled=false;crop.getContext('2d').drawImage(cv,0,90,160,64,0,0,160,64);
  card.append(cv,crop);root.append(card);
 }
 document.body.append(root);for(const sibling of document.body.children)if(sibling!==root)sibling.style.setProperty('display','none','important');
 document.body.style.cssText='margin:0!important;padding:0!important;background:#13263b!important;overflow:hidden!important';document.documentElement.style.cssText='height:auto!important;overflow:hidden!important';
 return {palettes:palettes.map(({label,trim})=>({label,trim})),sprites:palettes.length,nontransparent,edgePixels,pageErrors:errors};
}'''
with sync_playwright() as pw:
 browser = pw.chromium.launch(headless=True)
 page = browser.new_page(viewport={'width':960,'height':620}, device_scale_factor=1)
 errors=[]
 page.on('pageerror', lambda error: errors.append(str(error)))
 page.set_content(shell)
 page.add_script_tag(content=module, type='module')
 page.wait_for_function('!!window.SupermagicFootball', timeout=30000)
 result=page.evaluate(render)
 page.locator('#cleat-trim-qa').screenshot(path=str(OUT/'team_trim_cleats_160px.png'), timeout=30000)
 result['pageErrors']=errors
 result['ok']=not errors and result['nontransparent']>0 and result['edgePixels']==0
 (OUT/'browser_render_report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(result,sort_keys=True))
 browser.close()
 if not result['ok']:
  raise SystemExit(1)
