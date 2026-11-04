#!/usr/bin/env python3
"""Inspect near/far eye contrast through the actual gameplay renderer."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
OUT.mkdir(parents=True,exist_ok=True)
html=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
shell=html.split('<script type="module">',1)[0]+'</body></html>'
module=html.split('<script type="module">',1)[1].split('</script>',1)[0]
render=r'''() => {
 const env=SupermagicFootball,p=env.game.players.find(v=>v&&!v.keeper),team=env.game.getTeam(p.t);
 const cases=[
  {label:'FRONT LEFT',kind:'front',dx:-.707,dy:.707},
  {label:'FRONT RIGHT',kind:'front',dx:.707,dy:.707},
  {label:'QUARTER FRONT LEFT',kind:'quarterFront',dx:-.707,dy:.707},
  {label:'QUARTER FRONT RIGHT',kind:'quarterFront',dx:.707,dy:.707}
 ];
 const kit={primary:'#123055',secondary:'#f3f3ea',trim:'#f2bc46'};
 const root=document.createElement('main');root.id='eye-depth-qa';
 root.style.cssText='position:static!important;display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:12px!important;width:980px!important;padding:16px!important;background:#13263b!important;color:#f8f5ea!important;font:14px Arial!important';
 let tested=0,blank=0,clipped=0;
 for(const item of cases){
  const card=document.createElement('section');card.style.cssText='position:static!important;display:grid!important;grid-template-columns:210px 240px!important;gap:8px!important;align-items:start!important;padding:8px!important;background:#203b53!important;border:1px solid #61798d!important';
  const label=document.createElement('strong');label.textContent=item.label;label.style.cssText='grid-column:1/-1!important';card.append(label);
  const cv=document.createElement('canvas');cv.width=200;cv.height=220;cv.style.cssText='position:static!important;display:block!important;width:200px!important;height:220px!important;background:#476b7e!important;image-rendering:pixelated!important';
  const ctx=cv.getContext('2d',{willReadFrequently:true});
  env.renderer.drawPlayer(ctx,{...p,src:{...p.src,appearance:{skin:'#b7835f',hair:'#282524',style:1,accessory:0,face:1,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2}},
   x:100,y:196,dx:item.dx,dy:item.dy,visualFacing:null,anim:0,z:0,action:'idle',controlled:false,preview:true},
   {getTeam:()=>kit,options:{showNames:false}});
  const pix=ctx.getImageData(0,0,200,220).data;let ink=0,edge=0;
  for(let i=0;i<pix.length;i+=4)if(pix[i+3]>40){ink++;const x=(i/4)%200,y=((i/4)/200)|0;if(x<1||x>198||y<1||y>218)edge++;}
  tested++;if(ink<350)blank++;if(edge)clipped++;
  const crop=document.createElement('canvas');crop.width=240;crop.height=220;crop.style.cssText='position:static!important;display:block!important;width:240px!important;height:220px!important;background:#476b7e!important;image-rendering:pixelated!important';
  const z=crop.getContext('2d');z.imageSmoothingEnabled=false;z.drawImage(cv,42,45,116,106,0,0,240,220);
  card.append(cv,crop);root.append(card);
 }
 document.body.append(root);for(const sibling of document.body.children)if(sibling!==root)sibling.style.setProperty('display','none','important');
 document.body.style.cssText='margin:0!important;padding:0!important;background:#13263b!important';document.documentElement.style.cssText='height:auto!important';
 return {sprites:tested,blank,clipped,cases:cases.map(x=>x.label)};
}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1020,'height':900},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content(shell);page.add_script_tag(content=module,type='module')
 page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
 result=page.evaluate(render);result['pageErrors']=errors
 page.locator('#eye-depth-qa').screenshot(path=str(OUT/'eye_near_far_game_size.png'),timeout=30000)
 result['ok']=not errors and result['blank']==0 and result['clipped']==0
 (OUT/'browser_render_report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(result,sort_keys=True));browser.close()
 if not result['ok']:raise SystemExit(1)
