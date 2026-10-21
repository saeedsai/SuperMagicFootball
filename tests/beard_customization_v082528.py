#!/usr/bin/env python3
"""Real-browser facial-hair QA: named overrides, palette, shape, pose and eight views."""
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
import json
R=Path(__file__).resolve().parents[1]
s=(R/'tests/.generated/play.html').read_text(encoding='utf8')
html=s.split('<script type="module">',1)[0]+'</body></html>'
js=s.split('<script type="module">',1)[1].split('</script>',1)[0]
res=[]
def check(mode,name,fn):
 try:
  value=fn()
  if value is False or (isinstance(value,dict) and not value.get('ok',True)):
   raise AssertionError(str(value)[:1500])
  stat='PASS';detail=str(value)[:650]
 except PlaywrightTimeout as exc:stat='TIMEOUT';detail=str(exc)[:650]
 except Exception as exc:stat='FAIL';detail=str(exc)[:650]
 res.append({'mode':mode,'name':name,'status':stat,'detail':detail})
 print(stat,mode,name,detail if stat!='PASS' else '',flush=True)

# A single test renders 5 faces × 5 beard options × 8 directions, plus comparisons
# against the same face's clean-shave baseline in the three face-visible views.
COMBOS=r'''() => {
 const e=SupermagicFootball,b=e.game.players.find(x=>!x.keeper),t=e.game.getTeam(b.t);
 const c=document.createElement('canvas');c.width=180;c.height=185;const ctx=c.getContext('2d',{willReadFrequently:true});
 const dirs=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1],[-.707,-.707],[-1,0],[-.707,.707]];
 let rendered=0,clip=0,empty=0,differenceFailures=0;const failures=[];
 const draw=(face,beard,dir)=>{
  ctx.clearRect(0,0,180,185);
  const src={...b.src,appearance:{...b.src.appearance,skin:'#ce986d',hair:'#4c3427',style:1,face,beard,accessory:0,scar:0,freckles:0}};
  e.renderer.drawPlayer(ctx,{...b,src,x:90,y:145,dx:dir[0],dy:dir[1],visualFacing:null,action:'idle',z:0,anim:.2,controlled:false},{getTeam:()=>t,options:{showNames:false}});
  const pix=ctx.getImageData(0,0,180,185).data; let touched=0,edge=0;
  for(let i=0;i<pix.length;i+=4){if(pix[i+3]<=28)continue;touched++;const px=(i>>2)%180,py=((i>>2)/180)|0;
   if(px<3||px>176||py<3||py>181)edge++;}
  return {pix,touched,edge};
 };
 for(let face=0;face<5;face++)for(let di=0;di<8;di++){
  const base=draw(face,0,dirs[di]);rendered++;if(base.edge)clip++;if(base.touched<350)empty++;
  for(let beard=1;beard<5;beard++){
   const cur=draw(face,beard,dirs[di]);rendered++;if(cur.edge)clip++;if(cur.touched<350)empty++;
   if(di===0||di===1||di===2||di===6||di===7){let delta=0;for(let i=0;i<cur.pix.length;i+=4){if(cur.pix[i]!==base.pix[i]||cur.pix[i+1]!==base.pix[i+1]||cur.pix[i+2]!==base.pix[i+2]||cur.pix[i+3]!==base.pix[i+3])delta++;}
    if(delta<2){differenceFailures++;failures.push({face,beard,di,delta});}
   }
  }
 }
 return {ok:rendered===200&&clip===0&&empty===0&&differenceFailures===0,rendered,clip,empty,differenceFailures,failures:failures.slice(0,8)};
}'''

NAMED=r'''() => {
 const e=SupermagicFootball,b=e.game.players.find(x=>!x.keeper),t=e.game.getTeam(b.t),c=document.createElement('canvas');c.width=200;c.height=200;const ctx=c.getContext('2d',{willReadFrequently:true});
 const names=['Lionel Messi','Mohamed Salah','Karim Benzema','Sergio Ramos','Alisson','Bruno Fernandes','Lautaro Martínez','Gianluigi Donnarumma','Mike Maignan'];
 const dirs=[[0,1],[.707,.707],[1,0]];let checked=0;const mismatches=[];
 function sig(name,beard,dir){ctx.clearRect(0,0,200,200);const av={hair:'#503a2b',skin:'#dca27f',style:1,beard,face:1,eyes:4,brows:9,eyeColor:4,nose:1,lips:4,body:1,stature:2,exaggeration:1,accessory:0,scar:0,freckles:0,tattoo:0};const src={...b.src,name,appearance:av};
  e.renderer.drawPlayer(ctx,{...b,src,x:100,y:154,dx:dir[0],dy:dir[1],visualFacing:null,action:'idle',z:0,anim:0,controlled:false},{getTeam:()=>t,options:{showNames:false}});
  const p=ctx.getImageData(0,0,200,200).data;let h=2166136261;for(let i=0;i<p.length;i+=16)h=Math.imul(h^(p[i]+p[i+1]*3+p[i+2]*7+p[i+3]*11),16777619)>>>0;return h;
 }
 for(const name of names){for(const d of dirs){const clean=sig(name,0,d),otherName=sig('Generic Footballer',0,d),full=sig(name,3,d);checked++;
   if(clean!==otherName||clean===full)mismatches.push({name,d,clean,otherName,full});}}
 return {ok:checked===27&&mismatches.length===0,checked,mismatches:mismatches.slice(0,8)};
}'''

HAIR=r'''() => {
 const e=SupermagicFootball,b=e.game.players.find(x=>!x.keeper),t=e.game.getTeam(b.t),c=document.createElement('canvas');c.width=200;c.height=200;const x=c.getContext('2d',{willReadFrequently:true});
 const dirs=[[0,1],[.707,.707],[1,0]], colors=['#1b2024','#a37e58','#d7b473','#963d29'];let samples=0,diffs=0;
 const sig=(color,d)=>{x.clearRect(0,0,200,200);const src={...b.src,appearance:{...b.src.appearance,face:2,beard:1,skin:'#dca27f',style:2,hair:color}};e.renderer.drawPlayer(x,{...b,src,x:100,y:154,dx:d[0],dy:d[1],z:0,visualFacing:null,anim:0,action:'idle',controlled:false},{getTeam:()=>t,options:{showNames:false}});const p=x.getImageData(0,0,200,200).data;let h=0;for(let i=0;i<p.length;i+=16)h=(Math.imul(h,31)+p[i]+p[i+1]*3+p[i+2]*7)>>>0;return h;};
 for(const d of dirs){const hashes=colors.map(color=>sig(color,d));samples+=hashes.length;if(new Set(hashes).size===colors.length)diffs++;}
 return {ok:samples===12&&diffs===3,samples,distinctViews:diffs};
}'''

with sync_playwright() as w:
 b=w.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 for mode,args in [('desktop',{'viewport':{'width':1440,'height':900}}),('simulated-touch',{'viewport':{'width':844,'height':390},'has_touch':True,'is_mobile':True})]:
  ctx=b.new_context(**args);p=ctx.new_page();p.set_default_timeout(20000);errors=[];p.on('pageerror',lambda ex:errors.append(str(ex)))
  p.set_content(html);p.add_script_tag(content=js,type='module');p.wait_for_function('!!window.SupermagicFootball')
  check(mode,'current release loads',lambda:p.evaluate("() => SupermagicFootball.version==='0.9.0.0'"))
  check(mode,'full 5 face × 5 beard × 8 direction pixel-matrix and framing',lambda:p.evaluate(COMBOS))
  check(mode,'named players respect Clean Shave without special-case forced beards',lambda:p.evaluate(NAMED))
  check(mode,'stubble and beard colour respond to natural hair palettes',lambda:p.evaluate(HAIR))
  check(mode,'browser runtime has no uncaught exceptions',lambda:len(errors)==0)
  if mode=='desktop':
   def sheet():
    p.evaluate('''() => {
     const e=SupermagicFootball,b=e.game.players.find(x=>!x.keeper),t=e.game.getTeam(b.t),dirs=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1]],labels=['FRONT','FRONT 3/4','SIDE','BACK 3/4','BACK'];
     const families=['ROUND','SQUARE','TRIANGLE','WIDE CHEEK','OVAL'],types=['CLEAN SHAVE','STUBBLE','SHORT','FULL','MOUSTACHE'];const root=document.createElement('section');root.id='beard-matrix28';root.style.cssText='position:static!important;width:1010px;padding:24px;background:#142b3d;color:#f7f8f7;font:13px Arial';
     const title=document.createElement('h2');title.textContent='Supermagic Football 0.8.25.28 — Facial hair and face geometry';root.append(title);
     const intro=document.createElement('p');intro.textContent='Five face shapes × five facial hair styles across front, three-quarter, side and back views. Same skin/hair preset; real in-game renderer.';root.append(intro);
     for(let face=0;face<5;face++){const header=document.createElement('h3');header.textContent=families[face];header.style.margin='16px 0 4px';root.append(header);
      for(let beard=0;beard<5;beard++){const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:6px;height:131px;margin-bottom:3px';const heading=document.createElement('div');heading.textContent=types[beard];heading.style.cssText='width:110px;flex:none;font-weight:bold';row.append(heading);
       for(let di=0;di<5;di++){const col=document.createElement('div');const label=document.createElement('div');label.textContent=labels[di];label.style.cssText='font-size:10px;text-align:center';const c=document.createElement('canvas');c.width=160;c.height=114;c.style.cssText='position:static!important;display:block!important;width:160px;height:114px;background:#315569;border:1px solid #668393';
       const src={...b.src,appearance:{...b.src.appearance,face,beard,skin:'#dca27f',hair:'#51392d',style:1,accessory:0,freckles:0,scar:0}};
       e.renderer.drawPlayer(c.getContext('2d'),{...b,src,x:80,y:100,dx:dirs[di][0],dy:dirs[di][1],visualFacing:null,action:'idle',z:0,anim:0,controlled:false},{getTeam:()=>t,options:{showNames:false}});col.append(label,c);row.append(col);}root.append(row);}}
     document.body.replaceChildren(root);document.documentElement.style.setProperty('height','auto','important');document.body.style.setProperty('overflow','visible','important');document.body.style.setProperty('height','auto','important');
    }''')
    dest=R/'docs/qa_runs_v082530/Beard_Face_Matrix_QA_v082530.png';p.locator('#beard-matrix28').screenshot(path=str(dest),timeout=30000);return str(dest.name)
   check(mode,'representative five-view × all-face/all-beard human-review matrix',sheet)
  ctx.close()
 b.close()
totals={k:sum(x['status']==k for x in res) for k in ['PASS','FAIL','TIMEOUT']}
(R/'docs/qa_runs_v082530/beard_customization_results.json').write_text(json.dumps({'version':'0.8.25.28','summary':totals,'results':res},indent=2),encoding='utf8')
print('RESULT',totals,flush=True)
if totals['FAIL'] or totals['TIMEOUT']:raise SystemExit(1)