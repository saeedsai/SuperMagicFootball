#!/usr/bin/env python3
"""Real Chromium acceptance of concept art as actual playable game sprites.
  Uses built inline fixture because hosted origins are blocked in sandbox.
"""
from pathlib import Path
import base64, hashlib, io, json
from PIL import Image,ImageDraw,ImageFont
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/qa_runs_concept_hero'
OUT.mkdir(parents=True,exist_ok=True)
raw=(ROOT/'tests/.generated/play.html').read_text()
shell=raw.split('<script type="module">',1)[0]+'</body></html>'
js=raw.split('<script type="module">',1)[1].split('</script>',1)[0]
RENDER=r'''() => {
 const e=SupermagicFootball,g=e.game,p=g.players.find(p=>p.t===0&&!p.keeper),team=g.getTeam(0);
 const dirs=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1],[-.707,-.707],[-1,0],[-.707,.707]];
 return dirs.map(([dx,dy],di)=>{
  const c=document.createElement('canvas');c.width=276;c.height=280;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.save();ctx.translate(138,250);ctx.scale(1.5,1.5);
  e.renderer.drawPlayer(ctx,{...p,preview:true,controlled:false,x:0,y:0,dx,dy,z:0,visualFacing:null,action:'idle',anim:0,face:dx<0?-1:1},
  {getTeam:()=>team,options:{showNames:false}});ctx.restore();
  const d=ctx.getImageData(0,0,276,280).data;let ink=0;
  for(let i=3;i<d.length;i+=4)if(d[i]>20)ink++;
  return {view:di,ink,png:c.toDataURL('image/png')};
 });
}'''
results={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,ctx_opts in [('desktop',{'viewport':{'width':1400,'height':930}}),('touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  context=browser.new_context(**ctx_opts)
  page=context.new_page();page.set_default_timeout(10000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(shell);page.add_script_tag(content=js,type='module');page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
  info=page.evaluate("""() => {const e=SupermagicFootball,t=e.teams.find(t=>t.id==='demo_concept_royals');return {teams:e.teams.length,roster:t?.customRoster?.length,allConcept:t?.customRoster?.every(p=>p.renderModel==='concept_hero'),originalTeams:e.teams.filter(t=>t.id!=='demo_concept_royals').length};}""")
  assert info=={'teams':225,'roster':12,'allConcept':True,'originalTeams':224},info
  # Concept Hero's former shortcut was intentionally removed from Quick Match.
  # Exercise the supported menu path instead of requiring the retired button.
  page.locator('[data-action=navQuick]').first.click()
  assert page.locator('[data-action=conceptDemo]').count()==0
  page.locator('[data-action=navOnDevice]').first.click()
  page.locator('[data-action=quick]').first.click()
  page.locator('#homeGroup').select_option('all')
  page.locator('#homeTeam').select_option(str(info['teams']-1))
  assert 'Concept Royals FC' in page.locator('#homeTeam option:checked').inner_text()
  page.locator('[data-action=kickoff]').first.click()
  page.wait_for_function("SupermagicFootball.game.matchState==='play'",timeout=15000)
  page.wait_for_timeout(650)
  data=page.evaluate(RENDER)
  assert len(data)==8 and all(r['ink']>1800 for r in data),[(d['view'],d['ink']) for d in data]
  hashed=[hashlib.sha256(base64.b64decode(d['png'].split(',',1)[1])).hexdigest() for d in data]
  assert len(set(hashed))==8,'Eight directions must show different game pixels'
  concepts=page.evaluate("""() => SupermagicFootball.game.players.filter(p=>p.t===0).every(p=>p.src.renderModel==='concept_hero')""")
  assert concepts,'All six active demo players must use this single model'
  if device=='desktop':
   page.screenshot(path=str(OUT/'playable_concept_royals_match.png'))
   sheet=Image.new('RGB',(4*276,2*330),'#ecf2f6')
   drawer=ImageDraw.Draw(sheet)
   labels=['FRONT','FRONT 3/4','SIDE R','BACK 3/4','BACK','BACK 3/4 L','SIDE L','FRONT 3/4 L']
   for i,d in enumerate(data):
    png=Image.open(io.BytesIO(base64.b64decode(d['png'].split(',',1)[1]))).convert('RGBA');x=(i%4)*276;y=(i//4)*330
    tile=Image.new('RGBA',png.size,'#dce8ed');tile.alpha_composite(png)
    sheet.paste(tile.convert('RGB'),(x,y+30));drawer.text((x+10,y+9),labels[i],fill='#172c42')
   sheet.save(OUT/'concept_player_actual_eight_views.png')
  result={'status':'PASS','roster':info,'ink':[r['ink'] for r in data],'distinct_views':len(set(hashed)),'active_demo_model':concepts,'errors':errors}
  assert not errors,errors
  results[device]=result
  context.close()
 browser.close()
(OUT/'qa_report.json').write_text(json.dumps(results,indent=2))
print('CONCEPT HERO BROWSER QA PASS',json.dumps({k:{'views':v['distinct_views'],'roster':v['roster']['roster'],'errors':len(v['errors'])} for k,v in results.items()}))
