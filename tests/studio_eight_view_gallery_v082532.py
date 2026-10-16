#!/usr/bin/env python3
"""Browser regression for optional 8-view Studio gallery and rear hair distinctions.
Run after scripts/build.py; uses actual current modular renderer embedded by the QA builder.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'tests/.generated/play.html').read_text()
html=source.split('<script type="module">',1)[0]+'</body></html>'
js=source.split('<script type="module">',1)[1].split('</script>',1)[0]
checks=[]
def check(name,fn):
 try:
  evidence=fn()
  if evidence is False or (isinstance(evidence,dict) and evidence.get('ok') is False):raise AssertionError(str(evidence)[:700])
  status='PASS'
 except Exception as e:
  status='FAIL';evidence=str(e)[:700]
 checks.append({'name':name,'status':status,'detail':str(evidence)[:1200]});print(status,name,flush=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for mode,context_options in [('desktop',{'viewport':{'width':1280,'height':900}}),('simulated-touch',{'viewport':{'width':844,'height':390},'is_mobile':True,'has_touch':True})]:
  ctx=browser.new_context(**context_options)
  page=ctx.new_page();page.set_default_timeout(30000)
  errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html);page.evaluate('''() => {const values=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k),clear:()=>values.clear()}})}''');page.add_script_tag(content=js,type='module');page.wait_for_function('!!window.SupermagicFootball')
  check(mode+' current modular game boots',lambda:page.evaluate("() => SupermagicFootball.version==='0.8.25.32-integrated'"))
  def open_studio():
   for a in ['navSettings','navCustomization','playerStudio']:page.locator('[data-action="'+a+'"]').first.click()
   return page.locator('#customPortrait').count()==1
  check(mode+' Studio navigation and closed-by-default gallery',lambda:open_studio() and page.locator('#studioEightViewGallery').count()==0)
  def open_gallery():
   original=page.locator('#face_style').input_value()
   changed='10' if original!='10' else '5'
   page.locator('#face_style').select_option(changed)
   page.locator('[data-action="studioGalleryToggle"]').click()
   return {'ok':page.locator('#studioEightViewGallery canvas').count()==8 and page.locator('#face_style').input_value()==changed,'before':original,'selected':changed}
  check(mode+' gallery opens with eight canvases without discarding unsaved edits',open_gallery)
  def artwork():
   return page.evaluate('''() => {
    let signature=[];let empty=0,clipped=0;
    for(const c of document.querySelectorAll('#studioEightViewGallery canvas')){
     const d=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height).data;
     let hash=2166136261,ink=0;for(let i=0;i<d.length;i+=4){hash=Math.imul(hash^(d[i]+3*d[i+1]+7*d[i+2]+11*d[i+3]),16777619)>>>0;if(d[i+3]>20)ink++;}
     signature.push(hash);if(ink<1000)empty++;
    }
    return {ok:signature.length===8&&new Set(signature).size>=5&&empty===0,signature,empty,clipped};
   }''')
  check(mode+' all gallery views render nonblank directional artwork',artwork)
  def reactive():
   before=page.evaluate('''() => [...document.querySelectorAll('#studioEightViewGallery canvas')].map(c=>c.toDataURL())''')
   select=page.locator('#face_style');prev=select.input_value();select.select_option('10' if prev!='10' else '5');page.wait_for_timeout(200)
   after=page.evaluate('''() => [...document.querySelectorAll('#studioEightViewGallery canvas')].map(c=>c.toDataURL())''')
   return {'ok':len(after)==8 and all(a!=b for a,b in zip(before,after)),'changedViews':sum(a!=b for a,b in zip(before,after))}
  check(mode+' all eight directions update when selected hairstyle changes',reactive)
  def persist_no_write():
   return page.evaluate('''() => !localStorage.getItem('legend_edits')''')
  check(mode+' gallery preview does not persist unsaved appearance',persist_no_write)
  def rear_matrix():
   return page.evaluate('''() => {
    const e=SupermagicFootball,b=e.game.players.find(p=>!p.keeper),t=e.game.getTeam(b.t),c=document.createElement('canvas');c.width=180;c.height=185;const x=c.getContext('2d',{willReadFrequently:true});const all=[];let edge=0;
    for(let style=0;style<13;style++){
     x.clearRect(0,0,180,185);const src={...b.src,name:'Standard Player',appearance:{skin:'#dca27f',hair:'#503a2b',style,face:1,beard:0,eyes:6,brows:9,accessory:0}};
     e.renderer.drawPlayer(x,{...b,src,x:90,y:145,dx:0,dy:-1,visualFacing:null,action:'idle',z:0,anim:0,controlled:false},{getTeam:()=>t,options:{showNames:false}});
     const d=x.getImageData(0,0,180,185).data;let h=2166136261;
     for(let i=0;i<d.length;i+=4){h=Math.imul(h^(d[i]+d[i+1]*3+d[i+2]*7+d[i+3]*11),16777619)>>>0;if(d[i+3]>30&&(i/4%180<2||i/4%180>177||Math.floor(i/4/180)<2))edge++;}
     all.push(h);
    }return {ok:new Set(all).size===13&&edge===0,unique:new Set(all).size,edge};
   }''')
  check(mode+' rear hairstyle uniqueness: all thirteen styles distinguishable',rear_matrix)
  check(mode+' no uncaught JavaScript exceptions',lambda:len(errors)==0 or {'ok':False,'errors':errors})
  if mode=='desktop':
   page.locator('#studioEightViewGallery').screenshot(path=str(ROOT/'docs/Studio_Eight_Directions_v082532.png'))
  def gallery_close():
   selected=page.locator('#face_style').input_value()
   page.locator('[data-action="studioGalleryToggle"]').click()
   return page.locator('#studioEightViewGallery').count()==0 and page.locator('#face_style').input_value()==selected
  check(mode+' gallery closes without discarding unsaved edits',gallery_close)
  ctx.close()
 browser.close()
summary={kind:sum(c['status']==kind for c in checks) for kind in ['PASS','FAIL']}
out=ROOT/'docs/QA_STUDIO_GALLERY_v082532.json';out.write_text(json.dumps({'version':'0.8.25.32','summary':summary,'checks':checks},indent=2))
print('SUMMARY',summary)
if summary['FAIL']:raise SystemExit(1)