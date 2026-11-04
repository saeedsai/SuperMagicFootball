from PIL import Image,ImageDraw
from pathlib import Path
d=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1\body\run_sources')
fs=sorted(d.glob('phase2_edit_*.png'));o=Image.new('RGB',(5*210,350),(65,69,76));dr=ImageDraw.Draw(o)
for i,p in enumerate(fs):
 im=Image.open(p).convert('RGBA'); im.thumbnail((200,310),Image.Resampling.LANCZOS);o.paste(im,(i*210+(210-im.width)//2,25),im);dr.text((i*210+4,5),p.stem.replace('phase2_edit_',''),fill='white')
p=d/'phase2_edit_contact.png';o.save(p);print(p)
