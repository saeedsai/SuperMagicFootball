#!/usr/bin/env python3
"""Inspect existing mouth choices at full and scaled gameplay render size."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
html=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
shell=html.split('<script type="module">',1)[0]+'</body></html>'
module=html.split('<script type="module">',1)[1].split('</script>',1)[0]
render=r'''() => {
 const env=SupermagicFootball,p=env.game.players.find(v=>!v.keeper),team=env.game.getTeam(p.t),root=document.createElement('main');root.id='mouth-scan';
 root.style.cssText='position:static!important;display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:10px!important;width:1320px!important;padding:16px!important;background:#13263b!important;color:#fff!important;font:14px Arial!important';
 let blank=0,clipped=0,checksums=[];
 for(let lips=0;lips<8;lips++){
  const card=document.createElement('section');card.style.cssText='position:static!important;display:block!important;background:#203b53!important;padding:9px!important;border:1px solid #61798d!important;text-align:center!important';
  const label=document.createElement('strong');label.textContent='MOUTH '+lips;label.style.cssText='display:block!important;margin-bottom:6px!important';card.append(label);
  const cv=document.createElement('canvas');cv.width=200;cv.height=220;cv.style.cssText='position:static!important;display:block!important;width:200px!important;height:220px!important;background:#476b7e!important;image-rendering:pixelated!important';
  const ctx=cv.getContext('2d',{willReadFrequently:true});
  const src={...p.src,appearance:{skin:'#b7835f',hair:'#282524',style:2,accessory:0,face:1,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips,freckles:0}};
  env.renderer.drawPlayer(ctx,{...p,src,x:100,y:196,dx:0,dy:1,visualFacing:null,anim:0,z:0,action:'idle',controlled:false,preview:true},{getTeam:()=>team,options:{showNames:false}});
  const pix=ctx.getImageData(0,0,200,220).data;let ink=0,edge=0,hash=2166136261;
  for(let i=0;i<pix.length;i+=4){if(pix[i+3]>40){ink++;const x=(i/4)%200,y=((i/4)/200)|0;if(x<1||x>198||y<1||y>218)edge++;}if(i%16===0)hash=Math.imul(hash^(pix[i]+3*pix[i+1]+7*pix[i+2]+11*pix[i+3]),16777619)>>>0;}
  if(ink<350)blank++;if(edge)clipped++;checksums.push(hash);
  const z=document.createElement('canvas');z.width=305;z.height=275;z.style.cssText='position:static!important;display:block!important;width:305px!important;height:275px!important;background:#476b7e!important;image-rendering:pixelated!important;margin-top:7px!important';
  const zc=z.getContext('2d');zc.imageSmoothingEnabled=false;zc.drawImage(cv,39,60,122,110,0,0,305,275);
  card.append(z);root.append(card);
 }
 document.body.append(root);for(const s of document.body.children)if(s!==root)s.style.setProperty('display','none','important');document.body.style.cssText='margin:0!important;padding:0!important;background:#13263b!important';
 return {mouths:8,blank,clipped,checksums,uniqueChecksums:new Set(checksums).size};
}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True);page=browser.new_page(viewport={'width':1360,'height':900})
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content(shell);page.add_script_tag(content=module,type='module');page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
 result=page.evaluate(render);result['pageErrors']=errors;page.locator('#mouth-scan').screenshot(path=str(OUT/'mouth_shapes_full_scale.png'),timeout=30000)
 result['ok']=not errors and result['blank']==0 and result['clipped']==0 and result['uniqueChecksums']==8
 (OUT/'gallery_report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,sort_keys=True));browser.close()
 if not result['ok']:raise SystemExit(1)
