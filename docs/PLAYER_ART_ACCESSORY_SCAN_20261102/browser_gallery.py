#!/usr/bin/env python3
"""Review explicit player accessories across four principal views."""
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
 const dirs=[[0,1],[.707,.707],[1,0],[0,-1]],views=['FRONT','QTR FRONT','SIDE','BACK'];
 const acc=['NONE','HEADBAND','EARRINGS','CHEEK TAPE','SPORTS GLASSES','SWEATBAND'];
 const root=document.createElement('main');root.id='accessory-gallery';root.style.cssText='position:static!important;display:block!important;width:700px!important;padding:12px!important;background:#13263b!important;color:#fff!important;font:12px Arial!important;z-index:2147483647!important';
 const header=document.createElement('div');header.style.cssText='display:grid;grid-template-columns:110px repeat(4,1fr);height:22px';header.append(document.createElement('span'));for(const v of views){let e=document.createElement('strong');e.textContent=v;e.style.textAlign='center';header.append(e)}root.append(header);
 let blank=0,clipped=0,tested=0;
 for(let a=0;a<acc.length;a++){
  const row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:110px repeat(4,1fr);gap:3px;min-height:163px;border-top:1px solid #52687a';
  const label=document.createElement('strong');label.textContent=acc[a];label.style.cssText='align-self:center;padding-left:8px';row.append(label);
  for(let d=0;d<views.length;d++){
   const cv=document.createElement('canvas');cv.width=130;cv.height=160;cv.style.cssText='position:static!important;display:block!important;width:130px!important;height:160px!important;background:#476b7e!important;image-rendering:pixelated!important';
   const ctx=cv.getContext('2d',{willReadFrequently:true});
   env.renderer.drawPlayer(ctx,{...p,src:{...p.src,appearance:{skin:'#b7835f',hair:'#282524',style:2,accessory:a,face:1,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2}},
    x:65,y:126,dx:dirs[d][0],dy:dirs[d][1],visualFacing:null,anim:0,z:0,action:'idle',controlled:false,preview:true},
    {getTeam:()=>team,options:{showNames:false}});
   const pix=ctx.getImageData(0,0,130,160).data;let ink=0,edge=0;
   for(let i=0;i<pix.length;i+=4)if(pix[i+3]>40){ink++;const x=(i/4)%130,y=((i/4)/130)|0;if(x<1||x>128||y<1||y>158)edge++;}
   tested++;if(ink<250)blank++;if(edge)clipped++;row.append(cv);
  }
  root.append(row);
 }
 document.body.append(root);for(const sib of document.body.children)if(sib!==root)sib.style.setProperty('display','none','important');
 document.body.style.cssText='margin:0!important;padding:0!important;background:#13263b!important';document.documentElement.style.cssText='height:auto!important';
 return {accessories:acc.length,views:views.length,tested,blank,clipped};
}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True);page=browser.new_page(viewport={'width':740,'height':1000})
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content(shell);page.add_script_tag(content=module,type='module');page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
 result=page.evaluate(render);result['pageErrors']=errors;page.locator('#accessory-gallery').screenshot(path=str(OUT/'accessories_4_views.png'),timeout=30000)
 result['ok']=not errors and result['blank']==0 and result['clipped']==0
 (OUT/'gallery_report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,sort_keys=True));browser.close()
 if not result['ok']:raise SystemExit(1)
