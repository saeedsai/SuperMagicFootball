#!/usr/bin/env python3
"""Compare standard player hands before/after at native game render scale."""
from pathlib import Path
import json
import re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
html=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
shell=html.split('<script type="module">',1)[0]+'</body></html>'
module=html.split('<script type="module">',1)[1].split('</script>',1)[0]
render=r'''() => {
 const env=SupermagicFootball,p=env.game.players.find(v=>!v.keeper),team=env.game.getTeam(p.t),root=document.createElement('main');root.id='elbow-scan';
 root.style.cssText='position:static!important;display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:10px!important;width:1300px!important;padding:16px!important;background:#13263b!important;color:#fff!important;font:14px Arial!important';
 let blank=0,clipped=0,checksums=[];
 const skins=['#b7835f','#dca27f','#8d5b40','#e6bd98'];
 for(let index=0;index<skins.length;index++){
  const card=document.createElement('section');card.style.cssText='position:static!important;display:block!important;background:#203b53!important;padding:9px!important;border:1px solid #61798d!important;text-align:center!important';
  const label=document.createElement('strong');label.textContent='IDLE PLAYER · '+skins[index];label.style.cssText='display:block!important;margin-bottom:6px!important';card.append(label);
  const cv=document.createElement('canvas');cv.width=220;cv.height=290;cv.style.cssText='position:static!important;display:block!important;width:220px!important;height:290px!important;background:#476b7e!important;image-rendering:pixelated!important';
  const ctx=cv.getContext('2d',{willReadFrequently:true});
  const src={...p.src,appearance:{skin:skins[index],hair:'#282524',style:2,accessory:0,face:1,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2,freckles:0}};
  env.renderer.drawPlayer(ctx,{...p,src,x:110,y:265,dx:0,dy:1,visualFacing:null,anim:0,z:0,action:'idle',controlled:false,preview:true},{getTeam:()=>team,options:{showNames:false}});
  const pix=ctx.getImageData(0,0,220,290).data;let ink=0,edge=0,hash=2166136261;
  for(let i=0;i<pix.length;i+=4){if(pix[i+3]>40){ink++;const x=(i/4)%220,y=((i/4)/220)|0;if(x<1||x>218||y<1||y>288)edge++;}if(i%16===0)hash=Math.imul(hash^(pix[i]+3*pix[i+1]+7*pix[i+2]+11*pix[i+3]),16777619)>>>0;}
  if(ink<350)blank++;if(edge)clipped++;checksums.push(hash);
  card.append(cv);
  const zoom=document.createElement('canvas');zoom.width=285;zoom.height=165;zoom.style.cssText='position:static!important;display:block!important;width:285px!important;height:165px!important;background:#476b7e!important;image-rendering:pixelated!important;margin-top:7px!important';
  const zc=zoom.getContext('2d');zc.imageSmoothingEnabled=false;zc.drawImage(cv,65,205,95,55,0,0,285,165);
  card.append(zoom);root.append(card);
 }
 document.body.append(root);for(const s of document.body.children)if(s!==root)s.style.setProperty('display','none','important');document.body.style.cssText='margin:0!important;padding:0!important;background:#13263b!important';
 return {players:skins.length,blank,clipped,checksums,uniqueChecksums:new Set(checksums).size};
}'''
before_module,removed=re.subn(r"  if\(near&&!p\.keeper\)\{\s*// A small inward elbow fold.*?\s*\}\n  const tattoo=",'  const tattoo=',module,count=1,flags=re.S)
if removed!=1:raise SystemExit('could not isolate the elbow fold for the controlled baseline')

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 def run_case(source,screenshot):
  page=browser.new_page(viewport={'width':1340,'height':900});errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(shell);page.add_script_tag(content=source,type='module');page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
  result=page.evaluate(render);result['pageErrors']=errors
  page.locator('#elbow-scan').screenshot(path=str(OUT/screenshot),timeout=30000)
  page.close();return result
 before=run_case(before_module,'elbows_before_game_size.png')
 after=run_case(module,'elbows_native_game_scale.png')
 after['beforeChecksums']=before['checksums']
 after['changedSkinVariants']=sum(a!=b for a,b in zip(before['checksums'],after['checksums']))
 after['ok']=all(not r['pageErrors'] and r['blank']==0 and r['clipped']==0 and r['uniqueChecksums']==4 for r in [before,after]) and after['changedSkinVariants']==4
 (OUT/'elbow_report.json').write_text(json.dumps({'before':before,'after':after},indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'blank':after['blank'],'clipped':after['clipped'],'pageErrors':after['pageErrors'],'uniqueChecksums':after['uniqueChecksums'],'changedSkinVariants':after['changedSkinVariants'],'ok':after['ok']},sort_keys=True))
 browser.close()
 if not after['ok']:raise SystemExit(1)
