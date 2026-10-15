#!/usr/bin/env python3
"""Raster/visual inspection using the actual bundled gameplay renderer."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, sys
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/qa_runs_character_art_v3'; OUT.mkdir(exist_ok=True)
h=(ROOT/'tests/.generated/play.html').read_text()
shell=h.split('<script type="module">',1)[0]+'</body></html>'
source=h.split('<script type="module">',1)[1].split('</script>',1)[0]
code=r'''() => {
 const env=SupermagicFootball;
 const names=['Lionel Messi','Cristiano Ronaldo','Mohamed Salah','Erling Haaland','Vinícius Júnior','Kylian Mbappé','Jude Bellingham','Neymar','Luka Modrić','Raphinha','Son Heung-min','Sergio Ramos'];
 const dirs=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1],[-.707,-.707],[-1,0],[-.707,.707]];
 const labels=['FRONT','3/4 FRONT R','RIGHT','3/4 BACK R','BACK','3/4 BACK L','LEFT','3/4 FRONT L'];
 const root=document.createElement('main');root.id='art-v3-qa';root.style.cssText='position:static;display:block;width:1390px;padding:30px;background:#13253a;color:#f9f9ef;font:15px Arial';
 let h=document.createElement('h2');h.textContent='SUPER MAGIC FOOTBALL — CHARACTER ART III · REAL GAME RENDERER';root.append(h);
 let desc=document.createElement('p');desc.textContent='12 actual roster players × all eight facings · updated face, hair, body and kit drawing';root.append(desc);
 const envp=env.game.players.find(x=>!x.keeper);
 const meta=[];
 for(const name of names){
  const record=env.teams.map(t=>({t,p:t.customRoster?.find(p=>p.name===name)})).find(x=>x.p);
  if(!record)throw Error('Missing '+name);
  const outer=document.createElement('div');outer.style.cssText='display:flex;align-items:center;gap:3px;margin-top:10px';
  const caption=document.createElement('div');caption.style.cssText='width:160px;font-size:13px;flex:none';caption.textContent=name;outer.append(caption);
  for(let i=0;i<dirs.length;i++){
   const col=document.createElement('div');const lab=document.createElement('div');lab.textContent=labels[i];lab.style.cssText='font-size:9px;text-align:center;line-height:20px';
   const cv=document.createElement('canvas');cv.width=146;cv.height=191;cv.style.cssText='position:static!important;background:#d5e3ee;width:146px!important;height:191px!important;display:block!important;border-radius:4px;flex:none';
   const ctx=cv.getContext('2d');ctx.save();ctx.translate(73,161);ctx.scale(1.07,1.07);
   env.renderer.drawPlayer(ctx,{...envp,src:record.p,t:0,i:0,keeper:false,x:0,y:0,dx:dirs[i][0],dy:dirs[i][1],visualFacing:null,anim:0,z:0,action:'idle',controlled:false,preview:true},{getTeam:()=>record.t,options:{showNames:false}});
   ctx.restore();col.append(lab,cv);outer.append(col);
  }
  root.append(outer);meta.push({name,team:record.t.name,appearance:record.p.appearance||record.p.avatar});
 }
 document.body.append(root);document.documentElement.style.cssText='height:auto';document.body.style.cssText='height:auto!important;overflow:auto;background:#13253a';
 return {players:meta,version:env.version};
}'''
with sync_playwright() as w:
 browser=w.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1450,'height':1000},device_scale_factor=2)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(shell);page.add_script_tag(content=source,type='module');page.wait_for_function('!!window.SupermagicFootball',timeout=40000)
 result=page.evaluate(code)
 page.locator('#art-v3-qa').screenshot(path=str(OUT/'twelve_players_eight_directions.png'),timeout=40000)
 # An explicit visual no-headband regression sample, comparing accessory settings.
 special=r'''() => {
 const env=SupermagicFootball,p=env.game.players.find(x=>!x.keeper),t=env.game.getTeam(p.t);
 const root=document.createElement('section');root.id='headband-proof';root.style.cssText='position:static;width:900px;padding:20px;background:#173047;color:white;font:16px Arial';
 const names=['Layered Fringe (style 8), no accessory','Layered Fringe (style 8), headband accessory'];
 names.forEach((name,i)=>{const row=document.createElement('div');row.style.cssText='display:flex;align-items:center';
 const label=document.createElement('span');label.textContent=name;label.style.cssText='width:320px';row.append(label);
 [[0,1],[0,-1],[1,0]].forEach(([dx,dy])=>{const cv=document.createElement('canvas');cv.width=155;cv.height=205;
 cv.style.cssText='position:static!important;background:#d9e7f1;margin:4px;display:block!important;width:155px!important;height:205px!important';const c=cv.getContext('2d');c.save();c.translate(77,180);c.scale(1.12,1.12);
 env.renderer.drawPlayer(c,{...p,src:{...p.src,appearance:{skin:'#b7835f',hair:'#282524',style:8,accessory:i,face:1,beard:0,eyes:8,brows:6}},x:0,y:0,z:0,dx,dy,action:'idle',controlled:false,preview:true},{getTeam:()=>t,options:{showNames:false}});c.restore();row.append(cv)});
 root.append(row)});document.body.append(root);
 }'''
 page.evaluate(special)
 page.locator('#headband-proof').screenshot(path=str(OUT/'no_headband_unless_accessory.png'),timeout=30000)
 result['uncaught']=errors
 (OUT/'browser_visual_summary.json').write_text(json.dumps(result,indent=2,ensure_ascii=False))
 print(json.dumps({'screenshot':str(OUT/'twelve_players_eight_directions.png'),'playerCount':len(result['players']),'pageErrors':errors},ensure_ascii=False));browser.close()