from PIL import Image,ImageDraw
from pathlib import Path
r=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1\body\run_frames')
vs=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
o=Image.new('RGB',(5*256,2*320),(65,68,75));d=ImageDraw.Draw(o)
for i,v in enumerate(vs):
 for f in (1,2):
  im=Image.open(r/f'body_run_{v}_run_{f}.png').convert('RGBA'); im.thumbnail((256,284),Image.Resampling.LANCZOS)
  x=i*256+(256-im.width)//2;y=(f-1)*320+30+(284-im.height)//2;o.paste(im,(x,y),im);d.text((i*256+4,(f-1)*320+6),v+' frame '+str(f),fill='white')
p=r/'run_frames_contact.png';o.save(p);print(p)
