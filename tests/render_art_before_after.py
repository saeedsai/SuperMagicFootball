#!/usr/bin/env python3
"""Pixel-faithful before/after screenshots produced by the actual two game renderers.
Before commit: 50c839aa5e8947176f00105dabab9582816823d9 (pre-characterart rework).
After: current dev checkout. Uses actual Canvas2D output, same roster records, same angles.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont, ImageChops
import base64, json, io, re, sys, zipfile
from datetime import datetime

HERE=Path(__file__).resolve().parents[1]
BEFORE=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else HERE.parent/'before-characterart'
OUT=HERE/'docs'/'qa_runs_current'/'before_after_player_art'
OUT.mkdir(parents=True,exist_ok=True)
PLAYERS=['Lionel Messi','Cristiano Ronaldo','Mohamed Salah','Erling Haaland','Vinícius Júnior']
DIRECTIONS=[('FRONT',0,1),('3/4 FRONT',.707,.707),('RIGHT SIDE',1,0),('3/4 BACK',.707,-.707),('BACK',0,-1)]
ROOT_SHA='50c839aa5e8947176f00105dabab9582816823d9'
fontroot=Path('/usr/share/fonts/truetype/dejavu')
def font(sz,bold=False):
 f=fontroot/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')
 return ImageFont.truetype(str(f),sz)

def load(page,fixture):
 html=fixture.read_text(encoding='utf-8')
 assert '<script type="module">' in html,fixture
 shell=html.split('<script type="module">',1)[0]+'</body></html>'
 script=html.split('<script type="module">',1)[1].split('</script>',1)[0]
 page.set_content(shell)
 page.add_script_tag(content=script,type='module')
 page.wait_for_function('!!window.SupermagicFootball',timeout=45000)

GET_PLAYERS=r"""names=>{
 const e=SupermagicFootball;
 return names.map(name=>{
  const pair=e.teams.map(t=>({team:t,player:t.customRoster?.find(p=>p.name===name)})).find(x=>x.player);
  if(!pair)throw Error('Actual roster player not found: '+name);
  const t=pair.team,p=pair.player;
  return {name,source:p,team:{primary:t.primary,secondary:t.secondary,trim:t.trim},
   rosterTeam:t.name,skin:p.appearance?.skin||p.avatar?.skin||null};
 });
}"""
RENDER=r"""({items,dirs})=>{
 const e=SupermagicFootball,base=e.game.players.find(p=>!p.keeper);
 if(!base)throw Error('No running preview player');
 const results=[];
 for(const item of items){
  const row={name:item.name,views:[]};
  for(const [label,dx,dy] of dirs){
   const cv=document.createElement('canvas');cv.width=250;cv.height=250;
   const ctx=cv.getContext('2d',{alpha:true});
   ctx.save();ctx.translate(125,194);ctx.scale(1.58,1.58);
   const p={...base,src:item.source,t:0,i:0,keeper:item.source.role==='GK',
     x:0,y:0,dx,dy,face:dx<0?-1:1,visualFacing:null,
     action:'idle',z:0,anim:0,controlled:false,preview:true,
     stun:0,cryTimer:0,firstTouchFx:0,turnLag:0};
   e.renderer.drawPlayer(ctx,p,{getTeam:()=>item.team,options:{showNames:false},celebrationStyle:0});
   ctx.restore();
   row.views.push(cv.toDataURL('image/png'));
  }
  results.push(row);
 }
 return results;
}"""
def decode(uri):
 assert uri.startswith('data:image/png;base64,')
 return Image.open(io.BytesIO(base64.b64decode(uri.split(',',1)[1]))).convert('RGBA')

PANEL=(225,236,249)
DARK=(20,34,55)
BLACK=(32,48,68)
ACCENT=(29,100,169)
GOLD=(240,171,62)

def sprite_on_panel(im):
 out=Image.new('RGB',(250,250),PANEL)
 out.paste(im,(0,0),im)
 return out

def write_player(index,person,before,after):
 W,H=1400,698
 sheet=Image.new('RGB',(W,H),(249,251,255))
 d=ImageDraw.Draw(sheet)
 d.rounded_rectangle((0,0,W,104),radius=0,fill=DARK)
 d.text((32,16),person['name'],font=font(30,True),fill='white')
 d.text((34,66),'ACTUAL GAME CANVAS • SAME PLAYER DATA, KIT & FACING DIRECTION',font=font(13),fill=(176,207,231))
 for r,(tag,samples,color) in enumerate([('BEFORE',before,(135,68,64)),('AFTER',after,(17,119,88))]):
  y=130+r*281
  d.rounded_rectangle((22,y,1378,y+263),radius=14,fill=(238,242,248))
  d.rounded_rectangle((27,y+7,125,y+44),radius=9,fill=color)
  d.text((36,y+15),tag,font=font(15,True),fill='white')
  for j,((label,_,_),uri) in enumerate(zip(DIRECTIONS,samples)):
   im=sprite_on_panel(decode(uri))
   x=135+j*248
   img=im.resize((220,220),Image.Resampling.LANCZOS)
   sheet.paste(img,(x,y+28))
   d.text((x+6,y+6),label,font=font(13,True),fill=BLACK)
 d.text((28,683),'BEFORE: dev '+ROOT_SHA[:9]+' • AFTER: latest dev checkout',font=font(11),fill=(96,107,117))
 target=OUT/('comparison_'+re.sub('[^a-z0-9]+','_',person['name'].lower()).strip('_')+'.png')
 sheet.save(target,optimize=True)
 return target

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 context=browser.new_context(viewport={'width':1500,'height':900})
 pa=context.new_page()
 load(pa,HERE/'tests/.generated/play.html')
 people=pa.evaluate(GET_PLAYERS,PLAYERS)
 after=pa.evaluate(RENDER,{'items':people,'dirs':DIRECTIONS})
 pa.close()
 pb=context.new_page()
 load(pb,BEFORE/'tests/.generated/play.html')
 before=pb.evaluate(RENDER,{'items':people,'dirs':DIRECTIONS})
 pb.close()
 browser.close()

images=[];stats=[]
for idx,(person,a,b) in enumerate(zip(people,after,before)):
 assert a['name']==b['name']==person['name']
 path=write_player(idx,person,b['views'],a['views'])
 images.append(path)
 for (label,_,_),bb,aa in zip(DIRECTIONS,b['views'],a['views']):
  A=sprite_on_panel(decode(bb))
  B=sprite_on_panel(decode(aa))
  difference=ImageChops.difference(A,B).convert('L')
  count=sum(1 for v in difference.getdata() if v>22)
  stats.append({'name':person['name'],'view':label,'changedPixels':count})
print('PER_PLAYER',json.dumps([{'player':q['name'],'team':q['rosterTeam']} for q in people],ensure_ascii=False),flush=True)
print('DIFFERENCES',json.dumps(stats,ensure_ascii=False),flush=True)
if any(x['changedPixels']<300 for x in stats):
 raise AssertionError('A player/view lacks a material before/after pixel change.')
# Main overview: 5 players x 3 representative angles; two columns of before and after.
tile_w,tile_h=168,180
overview=Image.new('RGB',(1250,1320),(247,250,253))
d=ImageDraw.Draw(overview)
d.rectangle((0,0,1250,95),fill=DARK)
d.text((30,18),'SUPER MAGIC FOOTBALL',font=font(28,True),fill='white')
d.text((31,61),'BEFORE vs AFTER  •  Original code screenshots, identical player inputs',font=font(15),fill=(180,210,231))
d.rounded_rectangle((276,109,652,151),radius=11,fill=(138,72,72))
d.rounded_rectangle((684,109,1060,151),radius=11,fill=(20,120,89))
d.text((408,120),'BEFORE',font=font(17,True),fill='white')
d.text((819,120),'AFTER',font=font(17,True),fill='white')
angles=[0,1,4]
for k,person in enumerate(people):
 y=171+k*226
 d.text((24,y+15),person['name'].replace(' Júnior',' Jr.'),font=font(18,True),fill=BLACK)
 d.text((24,y+52),person['rosterTeam'][:22],font=font(13),fill=(110,123,143))
 for col,samples in enumerate([before[k]['views'],after[k]['views']]):
  for j,angle in enumerate(angles):
   x=270+col*409+j*134
   im=sprite_on_panel(decode(samples[angle])).resize((128,128),Image.Resampling.LANCZOS)
   overview.paste(im,(x,y+32))
   d.text((x+1,y+5),DIRECTIONS[angle][0],font=font(10,True),fill=BLACK)
 d.line((24,y+199,1226,y+199),fill=(226,233,241),width=2)
overview_path=OUT/'overview_before_after_5_players.png'
overview.save(overview_path,optimize=True)
with zipfile.ZipFile(OUT/'all_before_after_images.zip','w',zipfile.ZIP_DEFLATED) as archive:
 archive.write(overview_path,overview_path.name)
 for file in images:archive.write(file,file.name)
(OUT/'comparison_report.json').write_text(json.dumps({'beforeCommit':ROOT_SHA,'players':people,'directions':DIRECTIONS,'changedPixelCounts':stats,'files':[x.name for x in images]},indent=2,ensure_ascii=False))
print('SUCCESS',len(images),'players',len(stats),'comparisons. Overview:',overview_path,flush=True)
