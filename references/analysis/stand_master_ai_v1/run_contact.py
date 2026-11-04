from PIL import Image,ImageDraw
from pathlib import Path
r=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1\renders')
vs=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back','threeQuarterBackRight','right','threeQuarterFrontRight']
o=Image.new('RGB',(8*160,2*210),(64,68,76));d=ImageDraw.Draw(o)
for i,v in enumerate(vs):
 for f in (1,2):
  im=Image.open(r/f'run_{v}_run_{f}.png').convert('RGBA'); im.thumbnail((160,180),Image.Resampling.LANCZOS)
  x=i*160+(160-im.width)//2;y=(f-1)*210+24+(180-im.height)//2;o.paste(im,(x,y),im);d.text((i*160+4,(f-1)*210+4),v+' '+str(f),fill='white')
p=r/'run_all_views_contact.png';o.save(p);print(p)
