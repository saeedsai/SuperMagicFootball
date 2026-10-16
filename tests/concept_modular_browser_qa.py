#!/usr/bin/env python3
"""Actual game browser captures: painted front and back hair, six-view fallback, run phases."""
import base64,io,json
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/qa_runs_concept_modular'
OUT.mkdir(parents=True,exist_ok=True)
raw=(ROOT/'tests/.generated/play.html').read_text()
shell=raw.split('<script type="module">',1)[0]+'</body></html>'
js=raw.split('<script type="module">',1)[1].split('</script>',1)[0]
results={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,opts in [('desktop',{'viewport':{'width':1400,'height':930}}),('touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  context=browser.new_context(**opts)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.goto('about:blank?conceptModularPreview=1')
  page.set_content(shell)
  page.add_script_tag(content=js,type='module')
  page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
  counts=page.evaluate("""() => {const t=SupermagicFootball.teams.find(t=>t.id==='demo_concept_royals');return [SupermagicFootball.teams.length,t.customRoster.filter(p=>p.renderModel==='concept_modular_v1').length,t.customRoster.filter(p=>p.renderModel==='concept_hero').length]}""")
  assert counts==[224,1,11],counts
  page.wait_for_function("window.SupermagicFootball?.conceptModularStatus?.().loaded",timeout=15000)
  page.locator('[data-action=navQuick]').first.click()
  page.locator('[data-action=conceptDemo]').first.click()
  page.locator('[data-action=kickoff]').first.click()
  page.wait_for_function("SupermagicFootball.game.matchState==='play'",timeout=16000)
  page.wait_for_timeout(450)
  data=page.evaluate("""() => {
    const e=SupermagicFootball,g=e.game,t=e.teams.find(x=>x.id==='demo_concept_royals');
    const p=g.players.find(x=>x.t===0&&x.src?.renderModel==='concept_modular_v1')||g.players.find(x=>x.t===0&&!x.keeper);
    const src=t.customRoster[9];
    function draw(model,dx,dy,anim=0){
      const c=document.createElement('canvas');c.width=240;c.height=250;
      const x=c.getContext('2d',{willReadFrequently:true});x.translate(120,222);x.scale(1.5,1.5);
      e.renderer.drawPlayer(x,{...p,i:0,x:0,y:0,z:0,dx,dy,anim,face:1,visualFacing:null,controlled:false,preview:true,action:'idle',src:{...src,renderModel:model,appearance:{...src.appearance,renderModel:model}}},
        {getTeam:()=>g.getTeam(0),options:{showNames:false}});
      return c.toDataURL('image/png');
    }
    return {front:draw('concept_modular_v1',0,1),frontOld:draw('concept_hero',0,1),
      back:draw('concept_modular_v1',0,-1),backOld:draw('concept_hero',0,-1),
      side:draw('concept_modular_v1',1,0),sideOld:draw('concept_hero',1,0),
      backRunA:draw('concept_modular_v1',0,-1,.09),backRunB:draw('concept_modular_v1',0,-1,.27),
      status:e.conceptModularStatus()};
  }""")
  def png(value):return Image.open(io.BytesIO(base64.b64decode(value.split(',',1)[1]))).convert('RGBA')
  images={key:png(value) for key,value in data.items() if key!='status'}
  diff=lambda x,y:sum(a!=b for a,b in zip(images[x].getdata(),images[y].getdata()))
  front_changed=diff('front','frontOld')
  back_changed=diff('back','backOld')
  assert front_changed>=80,('Front artwork not rendered',front_changed)
  assert back_changed>=80,('New rear artwork not rendered',back_changed)
  assert diff('side','sideOld')==0,'Unfinished side must preserve legacy renderer'
  assert diff('backRunA','backRunB')>150,'Run stride frames must differ visibly'
  assert set(data['status']['authoredViews'])=={'front','back'} and not data['status']['error']
  assert data['status']['faceLoaded'] and 'face_front_front' in data['status']['authoredParts']
  # Independent raw SVG alpha check in the same Chromium browser that paints the game.
  source=base64.b64encode((ROOT/'assets/characters/concept_modular_v1/source/face_front_front.svg').read_bytes()).decode('ascii')
  face_alpha=page.evaluate("""async svg => {
    const image=new Image(); image.src='data:image/svg+xml;base64,'+svg; await image.decode();
    const c=document.createElement('canvas');c.width=112;c.height=265;
    const x=c.getContext('2d');x.drawImage(image,0,0);
    const p=x.getImageData(0,0,112,265).data;
    let inside=0,outside=0,whiteMatte=0;
    for(let y=0;y<265;y++)for(let q=0;q<112;q++){
      const i=(y*112+q)*4,alpha=p[i+3];
      if(y>=120||y<37){if(alpha)outside++;}
      else {if(alpha)inside++;}
      if(alpha&&p[i]>248&&p[i+1]>248&&p[i+2]>248&&!(q>=33&&q<=85&&y>=61&&y<=86))whiteMatte++;
    }
    return {width:image.naturalWidth,height:image.naturalHeight,inside,outside,whiteMatte};
  }""",source)
  assert face_alpha['width']==112 and face_alpha['height']==265,face_alpha
  assert face_alpha['inside']>1600 and face_alpha['outside']==0,face_alpha
  assert face_alpha['whiteMatte']==0,face_alpha
  (OUT/(device+'_face_alpha.json')).write_text(json.dumps(face_alpha,indent=2))
  assert not errors,errors
  for direction in ('front','back'):
   for label,color in [('grass','#35884d'),('teal','#21636b'),('light','#e6eef3'),('dark','#111b2a')]:
    composite=Image.new('RGBA',images[direction].size,color)
    composite.alpha_composite(images[direction])
    composite.convert('RGB').save(OUT/(device+'_'+direction+'_on_'+label+'.png'))
  for key,img in images.items():img.save(OUT/(device+'_'+key+'.png'))
  page.screenshot(path=str(OUT/(device+'_actual_match.png')))
  results[device]={'status':'PASS','front_changed_pixels':front_changed,'back_changed_pixels':back_changed,
    'side_legacy_identical':True,'back_run_phases_distinct':True,'page_errors':errors,'front_face_loaded':True,'transparent_face_alpha':True}
  context.close()
 browser.close()
(OUT/'qa_report.json').write_text(json.dumps(results,indent=2))
print('CONCEPT_MODULAR_BROWSER_PASS',json.dumps(results))
