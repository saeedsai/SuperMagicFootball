#!/usr/bin/env python3
"""Exhaustive directional avatar raster verification, for CI Chromium.
Build tests/.generated/play.html with scripts/build.py before execution.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs'/'qa_runs_current'
OUT.mkdir(parents=True,exist_ok=True)
html=(ROOT/'tests/.generated/play.html').read_text()
shell=html.split('<script type="module">',1)[0]+'</body></html>'
script=html.split('<script type="module">',1)[1].split('</script>',1)[0]
DIRECTIONS=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1],[-.707,-.707],[-1,0],[-.707,.707]]
MATRIX=r'''dirs => {
 const env=SupermagicFootball,p=env.game.players.find(v=>v&&!v.keeper),t=env.game.getTeam(p.t);
 const canvas=document.createElement('canvas');canvas.width=230;canvas.height=245;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 let tested=0,blank=0,clipped=0,checksum=2166136261;
 const beardMissing=[],styleCollisions=[],noseCollisions=[],lipCollisions=[];
 const base={skin:'#dca27f',hair:'#503a2b',face:0,style:1,beard:0,eyes:6,brows:4,nose:2,lips:1,accessory:0};
 function paint(d,av) {
  ctx.clearRect(0,0,230,245);
  env.renderer.drawPlayer(ctx,{...p,src:{...p.src,appearance:av},x:115,y:178,dx:dirs[d][0],dy:dirs[d][1],
   visualFacing:null,z:0,action:'idle',anim:.17,controlled:false,stun:0,cryTimer:0},
   {getTeam:()=>t,options:{showNames:false}});
  const pixels=ctx.getImageData(0,0,230,245).data;
  let h=2166136261,ink=0,edge=0;
  for(let i=0;i<pixels.length;i+=4){
   if(pixels[i+3]>40){ink++;const xy=i/4,x=xy%230,y=(xy/230)|0;if(x<=1||x>=228||y<=1||y>=243)edge++;}
   if(i%16===0)h=Math.imul(h^(pixels[i]+3*pixels[i+1]+7*pixels[i+2]+11*pixels[i+3]),16777619)>>>0;
  }
  tested++;if(ink<350)blank++;if(edge)clipped++;
  checksum=Math.imul(checksum^h,16777619)>>>0;
  return h;
 }
 // Each of 5 faces × 5 beards × 13 hairstyles × 8 directions.
 for(let f=0;f<5;f++)for(let b=0;b<5;b++)for(let s=0;s<13;s++)
  for(let d=0;d<8;d++)paint(d,{...base,face:f,beard:b,style:s});
 for(let f=0;f<5;f++)for(let d=0;d<8;d++)
  if(paint(d,{...base,face:f,beard:0})===paint(d,{...base,face:f,beard:3}))beardMissing.push([f,d]);
 for(let d=0;d<8;d++){
  const set=new Set();for(let s=0;s<13;s++)set.add(paint(d,{...base,style:s}));
  if(set.size!==13)styleCollisions.push([d,set.size]);
 }
 // Nose and lips are physically hidden at quarter-back/back.
 for(const d of [0,1,2,6,7]){
  const noses=new Set(),mouths=new Set();
  for(let n=0;n<6;n++)noses.add(paint(d,{...base,nose:n}));
  for(let m=0;m<8;m++)mouths.add(paint(d,{...base,lips:m}));
  if(noses.size!==6)noseCollisions.push([d,noses.size]);
  if(mouths.size!==8)lipCollisions.push([d,mouths.size]);
 }
 const colors=['#f4d3bf','#ab7458','#7a4d38'].map(skin=>paint(0,{...base,skin}));
 const hairs=['#202125','#dab96b','#b6492d'].map(hair=>paint(0,{...base,hair}));
 const ok=!blank&&!clipped&&!beardMissing.length&&!styleCollisions.length&&!noseCollisions.length&&!lipCollisions.length
  &&new Set(colors).size===3&&new Set(hairs).size===3;
 return {ok,tested,blank,clipped,beardMissing,styleCollisions,noseCollisions,lipCollisions,
  naturalSkinSamples:new Set(colors).size,hairColorSamples:new Set(hairs).size,checksum};
}'''
GALLERY=r'''dirs => {
 const env=SupermagicFootball,p=env.game.players.find(v=>v&&!v.keeper),t=env.game.getTeam(p.t);
 const cases=[
  {label:'Round / full beard / afro',face:4,beard:3,style:11,skin:'#996345',hair:'#202125'},
  {label:'Square / clean / headband',face:3,beard:0,style:8,skin:'#dca27f',hair:'#503a2b'},
  {label:'Oval / short beard / textured',face:0,beard:2,style:12,skin:'#ab7458',hair:'#2c2421'},
  {label:'Narrow / stubble / side pony',face:2,beard:1,style:10,skin:'#f4d3bf',hair:'#dab96b'},
  {label:'Wide / full beard / short',face:1,beard:3,style:1,skin:'#7a4d38',hair:'#202125'}
 ];
 const wrap=document.createElement('section');wrap.id='directional-qa-contact-sheet';
 wrap.style.cssText='position:static;width:1180px;background:#122c42;color:#fff;padding:16px;font:14px Arial';
 const h=document.createElement('h2');h.textContent='SuperMagicFootball · 8-direction player-art QA';wrap.append(h);
 for(const row of cases){
  const container=document.createElement('div');container.style.cssText='display:flex;gap:5px;align-items:center;min-height:165px';
  const label=document.createElement('strong');label.textContent=row.label;label.style.cssText='width:130px;flex:none;font-size:12px';container.append(label);
  for(let d=0;d<8;d++){
   const cv=document.createElement('canvas');cv.width=125;cv.height=162;
   cv.style.cssText='background:#386475;width:125px;height:162px;border:1px solid #6a8793';
   env.renderer.drawPlayer(cv.getContext('2d'),{...p,src:{...p.src,appearance:{...row,eyes:6,brows:3,nose:2,lips:2,accessory:0}},x:63,y:132,
    dx:dirs[d][0],dy:dirs[d][1],visualFacing:null,z:0,anim:.21,action:'idle',controlled:false},
    {getTeam:()=>t,options:{showNames:false}});
   container.append(cv);
  }
  wrap.append(container);
 }
 document.body.append(wrap);
 return true;
}'''
records={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for mode,args in [('desktop',{'viewport':{'width':1280,'height':850}}),('simulated-touch',{'viewport':{'width':844,'height':390},'is_mobile':True,'has_touch':True})]:
  context=browser.new_context(**args)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(shell)
  page.add_script_tag(content=script,type='module')
  page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
  result=page.evaluate(MATRIX,DIRECTIONS)
  if mode=='desktop':
   page.evaluate(GALLERY,DIRECTIONS)
   page.locator('#directional-qa-contact-sheet').screenshot(path=str(OUT/'player_art_eight_direction_contact_sheet.png'),timeout=30000)
  result['uncaught_errors']=errors
  result['ok']=result['ok'] and not errors
  records[mode]=result
  print(mode,json.dumps(result,sort_keys=True),flush=True)
  context.close()
 browser.close()
(OUT/'player_art_directional_report.json').write_text(json.dumps(records,indent=2)+'\n')
if not all(r['ok'] for r in records.values()):raise SystemExit(1)
