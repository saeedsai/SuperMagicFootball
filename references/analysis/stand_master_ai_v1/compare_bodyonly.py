from PIL import Image,ImageDraw
from pathlib import Path
r=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1\renders')
vs=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
o=Image.new('RGB',(5*270,3*310),(68,72,80));d=ImageDraw.Draw(o)
for i,v in enumerate(vs):
 for row,(kind,f) in enumerate([('stand','stand_1'),('run','run_1'),('run','run_2')]):
  p=r/(f'bodyonly_stand_{v}.png' if kind=='stand' else f'bodyonly_{v}_{f}.png')
  im=Image.open(p).convert('RGBA');bb=im.getchannel('A').point(lambda a:255 if a>64 else 0).getbbox()
  print(v,kind,f,'bbox',bb)
  if bb: im=im.crop(bb)
  im.thumbnail((260,270),Image.Resampling.LANCZOS); x=i*270+(270-im.width)//2;y=row*310+32+(270-im.height)//2;o.paste(im,(x,y),im)
  d.text((i*270+5,row*310+5),f'{v} {kind}',fill='white')
p=r/'bodyonly_compare.png';o.save(p);print(p)
