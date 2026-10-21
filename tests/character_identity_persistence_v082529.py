#!/usr/bin/env python3
"""Chromium acceptance: eight-direction identities and save semantics.
Origin-based page reload and process restart are reported NOT EXECUTED if sandbox-blocked.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
import json
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'tests/.generated/play.html').read_text()
html=s.split('<script type="module">',1)[0]+'</body></html>'
js=s.split('<script type="module">',1)[1].split('</script>',1)[0]
records=[]
def check(name,fn):
 try:
  d=fn()
  if d is False or isinstance(d,dict) and d.get('ok') is False:raise AssertionError(str(d)[:1200])
  status='PASS';info=str(d)[:900]
 except PWTimeout as e: status='TIMEOUT';info=str(e)[:400]
 except Exception as e: status='FAIL';info=str(e)[:900]
 records.append({'name':name,'status':status,'detail':info});print(status,name,info if status!='PASS' else '',flush=True)
def skip(name,why):
 records.append({'name':name,'status':'NOT EXECUTED','detail':why});print('NOT EXECUTED',name,why,flush=True)

MEMORY='''() => {const values=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k),clear:()=>values.clear()}});}'''
DIRECTIONS=[[0,1],[.707,.707],[1,0],[.707,-.707],[0,-1],[-.707,-.707],[-1,0],[-.707,.707]]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for mode,options in [('desktop',{'viewport':{'width':1280,'height':840}}),('simulated-touch',{'viewport':{'width':844,'height':390},'is_mobile':True,'has_touch':True})]:
  ctx=browser.new_context(**options);p=ctx.new_page();p.set_default_timeout(20000);errs=[];p.on('pageerror',lambda ex:errs.append(str(ex)))
  p.set_content(html);p.evaluate(MEMORY);p.add_script_tag(content=js,type='module');p.wait_for_function('!!window.SupermagicFootball')
  check(mode+' generated QA fixture boots with modular JSON records',lambda:p.evaluate("() => SupermagicFootball.version==='0.9.0.0'"))
  check(mode+' all seven BPW squads preserved',lambda:p.evaluate('''() => {const e=SupermagicFootball,b=e.teams.filter(t=>t.group==='bpw_worldcup'||t.group==='bpw_alltime');return {ok:b.length===7&&b.every(t=>e.rosterFor(t.index).length===12),count:b.length}}'''))
  def matrix():
   return p.evaluate(r'''dirs => {
    const e=SupermagicFootball,b=e.game.players.find(x=>!x.keeper),t=e.game.getTeam(b.t),c=document.createElement('canvas');c.width=180;c.height=185;
    const x=c.getContext('2d',{willReadFrequently:true}),names=['Lionel Messi','Cristiano Ronaldo','Mohamed Salah','Erling Haaland','Kylian Mbappé','Sergio Ramos','Luka Modrić','Ronaldinho','Alisson','Rafael Leão'];
    let rendered=0,edge=0,blank=0;const faceCounts=[],hairCounts=[];
    function signature(face,style,dir,name){x.clearRect(0,0,180,185);const source={...b.src,name,appearance:{skin:'#dca27f',hair:'#503a2b',style,face,beard:0,eyes:6,brows:9,accessory:0}};
     e.renderer.drawPlayer(x,{...b,src:source,x:90,y:145,dx:dirs[dir][0],dy:dirs[dir][1],visualFacing:null,action:'idle',z:0,anim:0,controlled:false},{getTeam:()=>t,options:{showNames:false}});
     let hash=2166136261,ink=0,border=0;const data=x.getImageData(0,0,180,185).data;for(let i=0;i<data.length;i+=4){
      if(data[i+3]>28){ink++;let px=i/4%180,py=Math.floor(i/4/180);if(px<3||px>176||py<3||py>181)border++;}
      hash=Math.imul(hash^(data[i]+data[i+1]*3+data[i+2]*7+data[i+3]*11),16777619)>>>0;
     }rendered++;if(border)edge++;if(ink<350)blank++;return hash;
    }
    for(let di=0;di<8;di++){
     faceCounts.push(new Set(Array.from({length:5},(_,f)=>signature(f,1,di,'Standard Player'))).size);
     hairCounts.push(new Set(Array.from({length:13},(_,style)=>signature(1,style,di,'Standard Player'))).size);
     for(const name of names)signature(1,1,di,name);
    }
    return {ok:edge===0&&blank===0&&faceCounts.every(n=>n>=3)&&hairCounts[3]>=10&&hairCounts[4]>=10,
       rendered,edge,blank,faceCounts,hairCounts};
   }''',DIRECTIONS)
  check(mode+' 8-direction 10-player + 5-face + 13-hairstyle render matrix',matrix)
  if mode=='desktop':
   def sheet():
    p.evaluate('''dirs=>{const e=SupermagicFootball,b=e.game.players.find(x=>!x.keeper),t=e.game.getTeam(b.t);
      const names=['Lionel Messi','Cristiano Ronaldo','Mohamed Salah','Erling Haaland','Sergio Ramos','Ronaldinho','Alisson','Rafael Leão'];
      const root=document.createElement('main');root.id='new-view-matrix';root.style.cssText='position:static!important;width:1200px;background:#152e3e;padding:20px;font:13px Arial;color:#f4f6f4';
      const h=document.createElement('h2');h.textContent='v0.8.25.29 — eight-direction player graphics inspection';root.append(h);
      for(let n=0;n<names.length;n++){const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;height:174px;gap:3px';const label=document.createElement('strong');label.style.cssText='width:160px;flex:none';label.textContent=names[n];row.append(label);
       for(let di=0;di<8;di++){const c=document.createElement('canvas');c.width=125;c.height=166;c.style.cssText='position:static!important;width:125px;height:166px;background:#345c68;border:1px solid #739999';
        const av={skin:['#dca27f','#dca27f','#b57b56','#f1c6a1','#db9c74','#aa7959','#dbac83','#855b44'][n],hair:['#503a2b','#1b2024','#202125','#e7c36f','#27231e','#231f1d','#432e23','#1b1c1f'][n],style:[1,2,11,10,4,11,1,11][n],beard:[3,0,3,0,3,0,3,0][n],face:n%5,eyes:n*2,brows:n*2,accessory:0};
        e.renderer.drawPlayer(c.getContext('2d'),{...b,src:{...b.src,name:names[n],appearance:av},x:62,y:132,dx:dirs[di][0],dy:dirs[di][1],visualFacing:null,action:'idle',z:0,anim:0,controlled:false},{getTeam:()=>t,options:{showNames:false}});row.append(c)}root.append(row)}
      document.getElementById('app').style.display='none';document.body.append(root);document.documentElement.style.height='auto';document.body.style.cssText='height:auto;overflow:visible;background:#152e3e';
    }''',DIRECTIONS)
    target=ROOT/'docs/Character_Eight_Directions_v082529.png';p.locator('#new-view-matrix').screenshot(path=str(target),timeout=30000);return target.name
   check(mode+' eight-view contact-sheet generation for visual audit',sheet)
   # Changed document for sheet, reset to original UI in a new page in the same context.
   p.close();p=ctx.new_page();p.set_default_timeout(20000);p.on('pageerror',lambda ex:errs.append(str(ex)))
   p.set_content(html);p.evaluate(MEMORY);p.add_script_tag(content=js,type='module');p.wait_for_function('!!window.SupermagicFootball')
  def studio():
   for a in ['navSettings','navCustomization','playerStudio']:p.locator('[data-action="'+a+'"]').first.click()
   return p.locator('#customPortrait').count()==1
  check(mode+' Settings > Player Customization navigation',studio)
  target=p.evaluate("() => SupermagicFootball.teams.find(t=>t.customRoster?.some(p=>p.name==='Lionel Messi'))?.index")
  def save_appearance():
   assert target is not None
   p.locator('#customTeam').select_option(str(target))
   label=p.locator('#customPlayer option').filter(has_text='Lionel Messi').first.inner_text();p.locator('#customPlayer').select_option(label=label)
   p.locator('#face_beard').select_option('0');p.locator('#face_face').select_option('2')
   p.locator('#face_style').select_option('10');p.locator('#face_hair').select_option('#2c2421');p.locator('#face_tattoo').select_option('4')
   p.locator('[data-action="saveAppearance"]').click()
   return p.evaluate('''() => {const t=SupermagicFootball.teams.find(t=>t.customRoster?.some(p=>p.name==='Lionel Messi'));
    const av=JSON.parse(localStorage.getItem('legend_edits')||'{}')[t.id]?.find(x=>x.name==='Lionel Messi')?.appearance;
    return {ok:av?.beard===0&&av?.face===2&&av?.style===10&&av?.hair==='#2c2421'&&av?.tattoo===4,av};}''')
  check(mode+' real Studio form saves named player complete appearance to storage API',save_appearance)
  check(mode+' no uncaught JS errors',lambda:len(errs)==0)
  ctx.close()
 browser.close()
# Real origin navigation/restart is blocked by browser administrator, not a verified save failure.
skip('hosted-origin page reload verification','Localhost navigation blocked by browser administrator; injected DOM cannot certify persistent origin storage')
skip('real browser process restart persistence','Requires accessible hosted origin and persistent browser profile')
skip('on-device storage / touch and controller','No physical iOS, Android or connected controller available')
summary={k:sum(v['status']==k for v in records) for k in ['PASS','FAIL','TIMEOUT','NOT EXECUTED']}
(ROOT/'docs/qa_runs_v082530/character_identity_persistence_results.json').write_text(json.dumps({'version':'0.8.25.29','results':records,'summary':summary},indent=2,ensure_ascii=False))
print('SUMMARY',summary,flush=True)
if summary['FAIL'] or summary['TIMEOUT']:raise SystemExit(1)