#!/usr/bin/env python3
"""Crown Royals actual game-menu and match-engine Chromium smoke, not art certification."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
import base64,io,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/qa_runs_crown_royals';OUT.mkdir(parents=True,exist_ok=True)
raw=(ROOT/'tests/.generated/play.html').read_text()
shell=raw.split('<script type="module">',1)[0]+'</body></html>'
js=raw.split('<script type="module">',1)[1].split('</script>',1)[0]
report={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
  args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,opts in [('desktop',{'viewport':{'width':1400,'height':930}}),
  ('touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  context=browser.new_context(**opts);page=context.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(shell);page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
  state=page.evaluate("""() => {
   const e=SupermagicFootball,t=e.teams.find(t=>t.id==='demo_crown_royals_reference');
   return {old:e.teams.some(x=>x.id==='demo_concept_royals'),roster:t?.customRoster?.length,
    alex:t?.customRoster?.find(p=>p.id==='crown_royals_reference_alex')?.renderModel,
    leo:t?.customRoster?.find(p=>p.id==='crown_royals_reference_leo')?.renderModel,
    kwame:t?.customRoster?.find(p=>p.id==='crown_royals_reference_kwame')?.renderModel};
  }""")
  assert state=={'old':True,'roster':12,'alex':'crown_royals_reference','leo':'crown_royals_reference','kwame':'crown_royals_reference'},state
  page.locator('[data-action=navQuick]').first.click()
  page.locator('[data-action=navOnDevice]').first.click()
  page.locator('[data-action=quick]').first.click()
  page.locator('#homeGroup').select_option('all')
  index=page.evaluate("SupermagicFootball.teams.findIndex(t=>t.id==='demo_crown_royals_reference')")
  page.locator('#homeTeam').select_option(str(index))
  page.locator('[data-action=kickoff]').first.click()
  page.wait_for_function("SupermagicFootball.game.matchState==='play'",timeout=15000)
  assert page.evaluate("SupermagicFootball.game.getTeam(0).id") == 'demo_crown_royals_reference'
  assert page.evaluate("SupermagicFootball.game.players.some(p=>p.t===0&&p.src?.id==='crown_royals_reference_alex')"), 'Alex must be on the pitch, not just a roster entry'
  assert page.evaluate("SupermagicFootball.game.players.some(p=>p.t===0&&p.src?.id==='crown_royals_reference_leo')"), 'Leo must be on the pitch, not just a roster entry'
  assert page.evaluate("SupermagicFootball.game.players.some(p=>p.t===0&&p.src?.id==='crown_royals_reference_kwame')"), 'Kwame must appear on pitch'
  page.wait_for_timeout(450)
  images=page.evaluate("""() => {
   const e=SupermagicFootball,t=e.teams.find(t=>t.id==='demo_crown_royals_reference');
   const p=t.customRoster.find(p=>p.id==='crown_royals_reference_alex');
   const base=e.game.players[0];
   return [[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1]].map(([dx,dy])=>{
    const c=document.createElement('canvas');c.width=220;c.height=245;
    const ctx=c.getContext('2d');ctx.translate(110,213);ctx.scale(1.35,1.35);
    e.renderer.drawPlayer(ctx,{...base,src:p,t:0,i:9,x:0,y:0,z:0,
     preview:true,controlled:false,dx,dy,visualFacing:null,anim:0,action:'idle',
     stun:0,cryTimer:0},{getTeam:()=>t,options:{showNames:false}});
    return c.toDataURL('image/png');
   });
  }""")
  imgs=[Image.open(io.BytesIO(base64.b64decode(v.split(',',1)[1]))).convert('RGBA') for v in images]
  ink=[sum(1 for a in img.getchannel('A').getdata() if a>30) for img in imgs]
  assert min(ink)>1000,ink
  unique=len({hashlib.sha256(img.tobytes()).digest() for img in imgs})
  assert unique>=3,unique
  leo_images=page.evaluate("""() => {
   const e=SupermagicFootball,t=e.teams.find(t=>t.id==='demo_crown_royals_reference');
   const p=t.customRoster.find(p=>p.id==='crown_royals_reference_leo');
   const base=e.game.players[0];
   return [[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1]].map(([dx,dy])=>{
    const c=document.createElement('canvas');c.width=220;c.height=245;
    const ctx=c.getContext('2d');ctx.translate(110,213);ctx.scale(1.35,1.35);
    e.renderer.drawPlayer(ctx,{...base,src:p,t:0,i:9,x:0,y:0,z:0,
     preview:true,controlled:false,dx,dy,visualFacing:null,anim:0,action:'idle',
     stun:0,cryTimer:0},{getTeam:()=>t,options:{showNames:false}});
    return c.toDataURL('image/png');
   });
  }""")
  leo_imgs=[Image.open(io.BytesIO(base64.b64decode(v.split(',',1)[1]))).convert('RGBA') for v in leo_images]
  leo_ink=[sum(1 for a in img.getchannel('A').getdata() if a>30) for img in leo_imgs]
  assert min(leo_ink)>1000,leo_ink
  assert len({hashlib.sha256(img.tobytes()).digest() for img in leo_imgs})>=3
  assert any(not a.tobytes()==b.tobytes() for a,b in zip(imgs,leo_imgs)), 'Leo and Alex must not render identical pixels'
  kwame_images=page.evaluate("""() => {
   const e=SupermagicFootball,t=e.teams.find(t=>t.id==='demo_crown_royals_reference');
   const p=t.customRoster.find(p=>p.id==='crown_royals_reference_kwame');
   const base=e.game.players[0];
   return [[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1]].map(([dx,dy])=>{
    const c=document.createElement('canvas');c.width=220;c.height=245;
    const ctx=c.getContext('2d');ctx.translate(110,213);ctx.scale(1.35,1.35);
    e.renderer.drawPlayer(ctx,{...base,src:p,t:0,i:9,x:0,y:0,z:0,
     preview:true,controlled:false,dx,dy,visualFacing:null,anim:0,action:'idle',
     stun:0,cryTimer:0},{getTeam:()=>t,options:{showNames:false}});
    return c.toDataURL('image/png');
   });
  }""")
  kwame_imgs=[Image.open(io.BytesIO(base64.b64decode(v.split(',',1)[1]))).convert('RGBA') for v in kwame_images]
  kwame_ink=[sum(1 for a in img.getchannel('A').getdata() if a>30) for img in kwame_imgs]
  assert min(kwame_ink)>1000,kwame_ink
  assert len({hashlib.sha256(img.tobytes()).digest() for img in kwame_imgs})>=3
  assert any(not a.tobytes()==b.tobytes() for a,b in zip(imgs,kwame_imgs)), 'Kwame and Alex must not render identical pixels'
  assert any(not a.tobytes()==b.tobytes() for a,b in zip(leo_imgs,kwame_imgs)), 'Kwame and Leo must have different sprite pixels'
  if device=='desktop':
   page.screenshot(path=str(OUT/'alex_real_match.png'))
   sheet=Image.new('RGB',(1100,280),'#202941')
   for i,img in enumerate(imgs):
    tile=Image.new('RGBA',img.size,'#202941');tile.alpha_composite(img)
    sheet.paste(tile.convert('RGB'),(220*i,28))
   sheet.save(OUT/'alex_real_game_five_views.png')
   leo_sheet=Image.new('RGB',(1100,280),'#202941')
   for i,img in enumerate(leo_imgs):
    tile=Image.new('RGBA',img.size,'#202941');tile.alpha_composite(img)
    leo_sheet.paste(tile.convert('RGB'),(220*i,28))
   leo_sheet.save(OUT/'leo_real_game_five_views.png')
   page.screenshot(path=str(OUT/'leo_real_match.png'))
   kwame_sheet=Image.new('RGB',(1100,280),'#202941')
   for i,img in enumerate(kwame_imgs):
    tile=Image.new('RGBA',img.size,'#202941');tile.alpha_composite(img)
    kwame_sheet.paste(tile.convert('RGB'),(220*i,28))
   kwame_sheet.save(OUT/'kwame_real_game_five_views.png')
   page.screenshot(path=str(OUT/'kwame_real_match.png'))
  assert not errors,errors
  report[device]={'status':'PASS','alexPixelCounts':ink,'leoPixelCounts':leo_ink,'kwamePixelCounts':kwame_ink,'differentViews':unique,'errors':errors}
  context.close()
 browser.close()
(OUT/'match_report.json').write_text(json.dumps(report,indent=2))
print('CROWN ROYALS LIVE GAME MATCH QA',json.dumps(report))
