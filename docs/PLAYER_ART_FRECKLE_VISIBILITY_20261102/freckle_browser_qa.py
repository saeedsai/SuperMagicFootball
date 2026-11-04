#!/usr/bin/env python3
"""Compare Player Studio freckle settings in native and scaled game renders."""
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
 const cases=[0,1,2,3],root=document.createElement('main');root.id='freckle-qa';
 root.style.cssText='position:static!important;display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:10px!important;width:1320px!important;padding:16px!important;background:#13263b!important;color:#fff!important;font:14px Arial!important';
 let blank=0,clipped=0,inkTotal=0,checksums=[];
 for(const freckles of cases){
  const card=document.createElement('section');card.style.cssText='position:static!important;display:block!important;background:#203b53!important;padding:9px!important;border:1px solid #61798d!important;text-align:center!important';
  const label=document.createElement('strong');label.textContent='FRECKLES '+freckles;label.style.cssText='display:block!important;margin-bottom:6px!important';card.append(label);
  const native=document.createElement('canvas');native.width=200;native.height=220;native.style.cssText='position:static!important;display:block!important;width:200px!important;height:220px!important;background:#476b7e!important;image-rendering:pixelated!important';
  const c=native.getContext('2d',{willReadFrequently:true});
  const src={...p.src,appearance:{skin:'#b7835f',hair:'#282524',style:2,accessory:0,face:1,beard:0,eyes:8,eyeColor:2,brows:6,nose:2,lips:2,freckles}};
  env.renderer.drawPlayer(c,{...p,src,x:100,y:196,dx:0,dy:1,visualFacing:null,anim:0,z:0,action:'idle',controlled:false,preview:true},{getTeam:()=>team,options:{showNames:false}});
  const pix=c.getImageData(0,0,200,220).data;let ink=0,edge=0,hash=2166136261;
  for(let i=0;i<pix.length;i+=4){if(pix[i+3]>40){ink++;const x=(i/4)%200,y=((i/4)/200)|0;if(x<1||x>198||y<1||y>218)edge++;}if(i%16===0)hash=Math.imul(hash^(pix[i]+3*pix[i+1]+7*pix[i+2]+11*pix[i+3]),16777619)>>>0;}
  checksums.push({freckles,hash});
  if(ink<350)blank++;if(edge)clipped++;inkTotal+=ink;
  const game=document.createElement('canvas');game.width=100;game.height=110;game.style.cssText='position:static!important;display:block!important;width:200px!important;height:220px!important;background:#476b7e!important;image-rendering:pixelated!important;margin-top:7px!important';
  const g=game.getContext('2d',{willReadFrequently:true});g.scale(.5,.5);
  env.renderer.drawPlayer(g,{...p,src,x:100,y:196,dx:0,dy:1,visualFacing:null,anim:0,z:0,action:'idle',controlled:false,preview:true},{getTeam:()=>team,options:{showNames:false}});
  const z=document.createElement('canvas');z.width=305;z.height=275;z.style.cssText='position:static!important;display:block!important;width:305px!important;height:275px!important;background:#476b7e!important;image-rendering:pixelated!important;margin-top:7px!important';
  const zc=z.getContext('2d');zc.imageSmoothingEnabled=false;zc.drawImage(native,39,60,122,110,0,0,305,275);
  const title=document.createElement('small');title.textContent='Scaled game sprite above · face crop';title.style.cssText='display:block!important;margin-top:4px!important';
  card.append(game,title,z);root.append(card);
 }
 document.body.append(root);for(const sibling of document.body.children)if(sibling!==root)sibling.style.setProperty('display','none','important');
 document.body.style.cssText='margin:0!important;padding:0!important;background:#13263b!important';document.documentElement.style.cssText='height:auto!important';
 return {samples:cases.length,blank,clipped,inkTotal,checksums,sourceName:p.src?.name,inputFreckles:cases};
}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True);page=browser.new_page(viewport={'width':1360,'height':900})
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content(shell);page.add_script_tag(content=module,type='module');page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
 result=page.evaluate(render);result['pageErrors']=errors
 page.locator('#freckle-qa').screenshot(path=str(OUT/'freckles_native_and_game_scale.png'),timeout=30000)
 result['ok']=not errors and result['blank']==0 and result['clipped']==0
 (OUT/'browser_render_report.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,sort_keys=True));browser.close()
 if not result['ok']:raise SystemExit(1)
