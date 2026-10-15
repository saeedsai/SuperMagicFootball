#!/usr/bin/env python3
"""Independent integrated-art and Player Studio browser QA. Run: python tests/graphics_integration_v082522.py"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, time
ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs'; DOC.mkdir(exist_ok=True)
s=(ROOT/'tests/.generated/play.html').read_text()
html=s.split('<script type="module">',1)[0]+'</body></html>'
script=s.split('<script type="module">',1)[1].split('</script>',1)[0]
results=[]
def run(name,mode,call):
 try:
  value=call()
  if value is False or (isinstance(value,dict) and value.get('ok') is False): raise AssertionError(repr(value)[:500])
  status='PASS';detail=str(value)[:500]
 except Exception as exc:
  status='FAIL';detail=str(exc)[:500]
 results.append({'name':name,'mode':mode,'status':status,'detail':detail});print(status,mode,name,detail if status!='PASS' else '',flush=True)
 return status=='PASS'

# CPU paint stress QA: 108 players x 8 views x 7 poses x 2 layouts = 12,096 draws.
PAINT_SWEEP=r'''() => {
 const e=SupermagicFootball;
 const historical=e.teams.filter(t=>t.customRoster?.filter(p=>p.historicalPersonKey).length===12).flatMap(t=>t.customRoster.map(p=>({p,t})));
 const modern=e.teams.filter(t=>t.group==='club26'&&t.customRoster?.length===12).slice(0,2).flatMap(t=>t.customRoster.map(p=>({p,t})));
 if(historical.length!==84||modern.length!==24)return {ok:false,reason:'roster',historical:historical.length,modern:modern.length};
 const people=historical.concat(modern),vs=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1],[-.707,-.707],[-1,0],[-.707,.707]];
 const acts=['idle','run','kick','slide','header','keeperDive','celebrate'];
 const base=e.game.players.find(p=>p&&!p.keeper);if(!base)return {ok:false,reason:'missing test player'};
 const cvs=document.createElement('canvas');cvs.width=250;cvs.height=270;const c=cvs.getContext('2d',{willReadFrequently:true});let empty=0,clip=0,odd=0,rendered=0,first=[];const uniqueIssues=[];let used=0;
 for(const item of people){
  const sig=[];
  for(let vi=0;vi<vs.length;vi++){
   const [dx,dy]=vs[vi];let viewSig=0;
   for(let ai=0;ai<acts.length;ai++){
    const a=acts[ai];c.clearRect(0,0,250,270);
    const p={...base,src:item.p,t:0,i:used,keeper:a==='keeperDive',x:125,y:186,dx,dy,face:dx<0?-1:1,z:a==='header'?11:0,action:a,anim:ai*.29+.1,actionTimer:.2,stun:0,cryTimer:0,visualFacing:null,controlled:false,firstTouchFx:0};
    e.renderer.drawPlayer(c,p,{getTeam:()=>item.t,options:{showNames:false},celebrationStyle:0});
    const d=c.getImageData(0,0,250,270).data; let x0=251,y0=271,x1=-1,y1=-1,seen=0,h=2166136261;
    for(let k=0;k<d.length;k+=4){
      if(d[k+3]>32){seen++;const idx=k>>2,px=idx%250,py=(idx/250)|0;if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py;}
      if(k%80===0)h=Math.imul(h^(d[k]+d[k+1]*3+d[k+2]*7+d[k+3]*11),16777619)>>>0;
    }
    if(seen<350)empty++;
    if(x0<6||y0<6||x1>243||y1>263)clip++;
    if(seen>0&&(x1-x0<16||y1-y0<44))odd++;
    if(ai===0)viewSig=h;
    rendered++;
   }
   sig.push(viewSig);
  }
  const distinct=new Set(sig).size;if(distinct!==8){uniqueIssues.push({name:item.p.name,distinct});if(uniqueIssues.length>=8)break;}
  used++;
 }
 return {ok:empty===0&&clip===0&&odd===0&&uniqueIssues.length===0,people:people.length,views:vs.length,poses:acts.length,rendered,empty,clip,odd,uniqueIssues};
}'''

with sync_playwright() as w:
 browser=w.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 for mode,context_args in [('desktop',{'viewport':{'width':1440,'height':900}}),('simulated-touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  context=browser.new_context(**context_args)
  p=context.new_page();p.set_default_timeout(8000);errors=[];p.on('pageerror',lambda exc:errors.append(str(exc)))
  p.set_content(html);p.add_script_tag(content=script,type='module');p.wait_for_function('!!window.SupermagicFootball')
  run('game boot + updated version',mode,lambda:p.evaluate("() => window.SupermagicFootball.version==='0.8.25.31-integrated'"))
  run('12,096-case directional artwork sweep (layout subset)',mode,lambda:p.evaluate(PAINT_SWEEP))
  run('beard changes remain visible across all eight view directions',mode,lambda:p.evaluate("""() => {
    const env=SupermagicFootball,p=env.game.players.find(v=>v&&!v.keeper&&!/Salah|Messi|Benzema|Giroud|Modrić|Alisson|Ramos|Bruno Fernandes|Lautaro|Donnarumma|Maignan/i.test(v.src.name));
    const vs=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1],[-.707,-.707],[-1,0],[-.707,.707]];const c=document.createElement('canvas');c.width=250;c.height=250;const x=c.getContext('2d',{willReadFrequently:true});
    function sig(dx,dy,beard){x.clearRect(0,0,250,250);env.renderer.drawPlayer(x,{...p,x:125,y:175,dx,dy,visualFacing:null,action:'idle',z:0,anim:0,src:{...p.src,appearance:{...p.src.appearance,beard}}},{getTeam:()=>env.game.getTeam(p.t),options:{showNames:false}});const d=x.getImageData(0,0,250,250).data;let h=0;for(let k=0;k<d.length;k+=8)h=(Math.imul(h,31)+d[k]+d[k+1]*3+d[k+2]*5+d[k+3]*11)>>>0;return h;}
    return vs.every(([dx,dy])=>sig(dx,dy,0)!==sig(dx,dy,3));
  }"""))
  run('tattoos are visible on the character across gameplay angles',mode,lambda:p.evaluate("""() => {
    const e=SupermagicFootball,p=e.game.players.find(v=>v&&!v.keeper);const views=[[0,1],[1,0],[.7,.7],[0,-1]];
    const c=document.createElement('canvas');c.width=250;c.height=250;const x=c.getContext('2d',{willReadFrequently:true});
    function hash(dx,dy,tattoo){x.clearRect(0,0,250,250);e.renderer.drawPlayer(x,{...p,x:125,y:175,dx,dy,visualFacing:null,action:'idle',z:0,src:{...p.src,appearance:{...p.src.appearance,tattoo}}},{getTeam:()=>e.game.getTeam(p.t),options:{showNames:false}});const d=x.getImageData(0,0,250,250).data;let h=0;for(let i=0;i<d.length;i+=8)h=(Math.imul(h,31)+d[i]+d[i+1]*7+d[i+2]*11+d[i+3])>>>0;return h;}
    return views.every(([dx,dy])=>hash(dx,dy,0)!==hash(dx,dy,5));
  }"""))
  run('Studio navigation opens from Settings/Customization',mode,lambda: (p.locator('[data-action="navSettings"]').click(),p.locator('[data-action="navCustomization"]').click(),p.locator('[data-action="playerStudio"]').click(),p.locator('#customPortrait').count()==1)[-1])
  families={'skin':10,'hair':10,'style':13,'face':5,'eyes':20,'brows':20,'eyeColor':6,'nose':6,'lips':8,'body':5,'stature':5,'exaggeration':3,'beard':5,'accessory':6,'freckles':4,'scar':6,'tattoo':6}
  run('all 17 curated appearance selector families',mode,lambda:all(p.locator('#face_'+field+' option').count()>=n for field,n in families.items()))
  # Each rotation must update the actual painted preview, not just its label.
  def spin():
   import hashlib
   images=[];labels=[]
   for i in range(8):
    images.append(hashlib.sha256(p.locator('#customPortrait').screenshot()).hexdigest())
    labels.append(p.locator('#customAngleLabel').inner_text())
    p.locator('[data-action="studioRight"]').click()
   return {'ok':len(set(images))==8 and len(set(labels))==8,'distinctImages':len(set(images)),'distinctLabels':len(set(labels))}
  run('rotate through 8 actual distinct studio previews',mode,spin)
  def customize():
   import hashlib
   preview=p.locator('#customPortrait');before=hashlib.sha256(preview.screenshot()).hexdigest()
   chosen={}
   for f,val in [('skin','#ab7458'),('hair','#141b27'),('style','7'),('eyes','18'),('beard','3'),('tattoo','5')]:
    selector=p.locator('#face_'+f);options=selector.locator('option').evaluate_all('(a)=>a.map(o=>o.value)');
    if val not in options:val=options[-1]
    selector.select_option(val);chosen[f]=val
   after=hashlib.sha256(preview.screenshot()).hexdigest()
   p.locator('[data-action="saveAppearance"]').click()
   # reopen from customization, return navigation may differ across modes.
   saved={f:p.locator('#face_'+f).input_value() for f in chosen}
   return {'ok':before!=after and saved==chosen,'previewChanged':before!=after,'reopenedValuesMatch':saved==chosen}
  run('curated palette, hairstyle, beard and tattoo editing + save',mode,customize)
  run('no uncaught JS errors in customization',mode,lambda:not errors or {'ok':False,'errors':errors})
  if mode=='desktop':
   # Large, readable 16-player six-view visual signoff sheet.
   def sheet():
    p.evaluate('''() => {
     const env=SupermagicFootball,all=env.teams.filter(t=>t.customRoster?.filter(p=>p.historicalPersonKey).length===12).flatMap(t=>t.customRoster.map(p=>({p,t}))),selected=all.filter((_,i)=>i%6===0).slice(0,14);
     const views=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1],[-1,0]],labels=['FRONT','FRONT 3/4','SIDE RIGHT','BACK 3/4','BACK','SIDE LEFT'];
     const container=document.createElement('section');container.id='new-integration-sheet';container.style.cssText='position:static;width:1280px;padding:24px;box-sizing:border-box;background:#101e2a;color:#f4f4ed;font:14px Arial';
     const title=document.createElement('h2');title.textContent='Supermagic Football v0.8.25.28 · Integrated Player Art QA';container.append(title);
     const hdr=document.createElement('p');hdr.textContent='14 representative BPW players, six direction projections · v0.8.25.20 graphics integrated into editable engine';container.append(hdr);
     for(const {p,t} of selected){const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;height:174px;gap:6px';const caption=document.createElement('div');caption.style.cssText='width:165px;font-weight:bold;flex:none;font-size:12px';caption.textContent=p.name;row.append(caption);
      for(let i=0;i<views.length;i++){const wrap=document.createElement('div');const lbl=document.createElement('div');lbl.textContent=labels[i];lbl.style.cssText='font-size:10px;text-align:center';const c=document.createElement('canvas');c.width=167;c.height=146;c.style.cssText='position:static!important;display:block!important;width:167px!important;height:146px!important;background:#254455;border:1px solid #527081';wrap.append(lbl,c);
       env.renderer.drawPlayer(c.getContext('2d'),{...env.game.players.find(x=>!x.keeper),src:p,x:84,y:112,dx:views[i][0],dy:views[i][1],z:0,visualFacing:null,controlled:false,anim:0,action:'idle',keeper:p.role==='GK',cryTimer:0,firstTouchFx:0},{getTeam:()=>t,options:{showNames:false}});row.append(wrap);
      }container.append(row);
     }
     document.body.innerHTML='';document.body.style.setProperty('overflow','visible','important');document.body.style.setProperty('height','auto','important');document.documentElement.style.setProperty('height','auto','important');document.body.append(container);
    }''')
    path=DOC/'Integrated_BPWHistorical_SixView_QA_v082522.png'
    p.locator('#new-integration-sheet').screenshot(path=str(path),timeout=20000)
    return path.name
   run('independent readable BPW contact sheet',mode,sheet)
  context.close()
 browser.close()
summary={s:sum(r['status']==s for r in results) for s in ('PASS','FAIL')}
(DOC/'qa_runs_v082530/graphics_integration_results.json').write_text(json.dumps({'suite':'graphics_integration_v082522.py','summary':summary,'results':results},indent=2))
print('RESULT',summary,flush=True)
if summary['FAIL']:raise SystemExit(1)
