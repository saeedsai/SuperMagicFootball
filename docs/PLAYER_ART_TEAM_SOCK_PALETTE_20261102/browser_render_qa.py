#!/usr/bin/env python3
"""Compare secondary-color socks through the actual gameplay renderer."""
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
  {label:'WHITE SECONDARY',primary:'#174b38',secondary:'#f3f3ea',trim:'#f2bc46'},
  {label:'RED SECONDARY',primary:'#172a43',secondary:'#df4149',trim:'#f2bc46'},
  {label:'GREEN SECONDARY',primary:'#172a43',secondary:'#329b65',trim:'#e1c357'},
  {label:'NAVY SECONDARY',primary:'#edf4f4',secondary:'#263c60',trim:'#df4149'}
 ];
 const root=document.createElement('main');root.id='team-sock-qa';
 root.style.cssText='position:static!important;display:grid!important;width:980px!important;padding:18px!important;background:#13263b!important;color:#f8f5ea!important;font:14px Arial!important;grid-template-columns:repeat(4,1fr)!important;gap:10px!important;z-index:9999999!important';
 let nontransparent=0,edgePixels=0;
 for(const kit of palettes){
  const card=document.createElement('section');card.style.cssText='position:static!important;display:block!important;background:#203b53!important;padding:9px!important;border:1px solid #61798d!important;text-align:center!important';
  const h=document.createElement('strong');h.textContent=kit.label;h.style.cssText='position:static!important;display:block!important;margin-bottom:6px!important';card.append(h);
  const cv=document.createElement('canvas');cv.width=160;cv.height=160;cv.style.cssText='position:static!important;width:210px!important;height:210px!important;image-rendering:pixelated!important;background:#476b7e!important;display:block!important;margin:auto!important;visibility:visible!important';
  const ctx=cv.getContext('2d',{willReadFrequently:true});
  env.renderer.drawPlayer(ctx,{...p,src:{...p.src,appearance:{skin:'#dca27f',hair:'#503a2b',face:0,style:1,beard:0,eyes:6,brows:4,nose:2,lips:1,accessory:0}},
   x:80,y:132,dx:0,dy:1,visualFacing:null,z:0,action:'idle',anim:0,controlled:false,preview:true},
   {getTeam:()=>kit,options:{showNames:false}});
  const data=ctx.getImageData(0,0,160,160).data;
  for(let i=0;i<data.length;i+=4)if(data[i+3]>40){nontransparent++;const px=(i/4)%160,py=((i/4)/160)|0;if(px<2||px>157||py<2||py>157)edgePixels++;}
  const crop=document.createElement('canvas');crop.width=160;crop.height=64;crop.style.cssText='position:static!important;width:210px!important;height:84px!important;image-rendering:pixelated!important;background:#476b7e!important;display:block!important;margin:7px auto 0!important;visibility:visible!important';
  const cx=crop.getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(cv,0,92,160,64,0,0,160,64);
  card.append(cv,crop);root.append(card);
 }
 document.body.append(root);for(const sibling of document.body.children)if(sibling!==root)sibling.style.setProperty('display','none','important');
 document.body.style.cssText='margin:0!important;padding:0!important;background:#13263b!important;overflow:hidden!important';document.documentElement.style.cssText='height:auto!important;overflow:hidden!important';
 return {palettes:palettes.map(({label,secondary})=>({label,secondary})),sprites:palettes.length,nontransparent,edgePixels};
}'''
with sync_playwright() as pw:
 browser = pw.chromium.launch(headless=True)
 page = browser.new_page(viewport={'width':1050,'height':480}, device_scale_factor=1)
 errors=[]
 page.on('pageerror', lambda error: errors.append(str(error)))
 page.set_content(shell)
 page.add_script_tag(content=module, type='module')
 page.wait_for_function('!!window.SupermagicFootball', timeout=30000)
 result=page.evaluate(render)
 page.locator('#team-sock-qa').screenshot(path=str(OUT/'secondary_socks_160px.png'), timeout=30000)
 result['pageErrors']=errors
 result['ok']=not errors and result['nontransparent']>0 and result['edgePixels']==0
 (OUT/'browser_render_report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(result,sort_keys=True))
 browser.close()
 if not result['ok']:
  raise SystemExit(1)
