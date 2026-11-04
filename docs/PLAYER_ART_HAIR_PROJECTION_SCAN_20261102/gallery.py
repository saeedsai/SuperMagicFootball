#!/usr/bin/env python3
"""Visually inspect the 13 existing fallback hair styles in five real views."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
html=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
shell=html.split('<script type="module">',1)[0]+'</body></html>'
module=html.split('<script type="module">',1)[1].split('</script>',1)[0]
render=r'''() => {
 const env=SupermagicFootball,p=env.game.players.find(v=>v&&!v.keeper),team=env.game.getTeam(p.t);
 const dirs=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1]],views=['FRONT','QTR FRONT','SIDE','QTR BACK','BACK'];
 const root=document.createElement('main');root.id='hair-projection-scan';
 root.style.cssText='position:static!important;display:block!important;width:850px!important;padding:12px!important;background:#13263b!important;color:#f8f5ea!important;font:12px Arial!important;z-index:2147483647!important';
 const header=document.createElement('h2');header.textContent='Existing Player Renderer · Hair Projection Scan';root.append(header);
 const rowHeader=document.createElement('div');rowHeader.style.cssText='display:grid;grid-template-columns:130px repeat(5,1fr);gap:3px;height:22px';
 rowHeader.append(document.createElement('span'));for(const v of views){const s=document.createElement('strong');s.textContent=v;s.style.textAlign='center';rowHeader.append(s)}root.append(rowHeader);
 let tested=0,blank=0,clipped=0;
 for(let style=0;style<13;style++){
  const row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:130px repeat(5,1fr);gap:3px;min-height:183px;border-top:1px solid #52687a';
  const label=document.createElement('strong');label.textContent='STYLE '+String(style).padStart(2,'0');label.style.cssText='align-self:center;padding-left:8px';row.append(label);
  for(let d=0;d<5;d++){
   const cv=document.createElement('canvas');cv.width=120;cv.height=180;cv.style.cssText='position:static!important;display:block!important;width:120px!important;height:180px!important;background:#476b7e!important;image-rendering:pixelated!important';
   const ctx=cv.getContext('2d',{willReadFrequently:true});
   env.renderer.drawPlayer(ctx,{...p,src:{...p.src,appearance:{skin:'#b7835f',hair:'#282524',style,accessory:0,face:1,beard:0,eyes:8,brows:6,nose:2,lips:2}},
    x:60,y:140,dx:dirs[d][0],dy:dirs[d][1],visualFacing:null,anim:0,z:0,action:'idle',controlled:false,preview:true},
    {getTeam:()=>team,options:{showNames:false}});
   const pix=ctx.getImageData(0,0,120,180).data;let ink=0,edge=0;
   for(let i=0;i<pix.length;i+=4)if(pix[i+3]>40){ink++;const x=(i/4)%120,y=((i/4)/120)|0;if(x<1||x>118||y<1||y>178)edge++;}
   tested++;if(ink<250)blank++;if(edge)clipped++;row.append(cv);
  }
  root.append(row);
 }
 document.body.append(root);for(const sib of document.body.children)if(sib!==root)sib.style.setProperty('display','none','important');
 document.body.style.cssText='margin:0!important;padding:0!important;background:#13263b!important';document.documentElement.style.cssText='height:auto!important';
 return {styles:13,views:views.length,tested,blank,clipped};
}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':900,'height':900},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content(shell);page.add_script_tag(content=module,type='module')
 page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
 result=page.evaluate(render);result['pageErrors']=errors
 page.locator('#hair-projection-scan').screenshot(path=str(OUT/'hair_13_styles_5_views.png'),timeout=30000)
 result['ok']=not errors and result['blank']==0 and result['clipped']==0
 (OUT/'gallery_report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(result,sort_keys=True));browser.close()
 if not result['ok']:raise SystemExit(1)
