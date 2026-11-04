from PIL import Image
from pathlib import Path
r=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1\renders')
views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
for v in views:
 rows=[]
 for lab,file in [('stand',f'bodyonly_stand_{v}.png'),('run1',f'bodyonly_{v}_run_1.png'),('run2',f'bodyonly_{v}_run_2.png')]:
  im=Image.open(r/file).convert('RGBA');a=im.getchannel('A');bb=a.point(lambda x:255 if x>96 else 0).getbbox(); x0,y0,x1,y1=bb;h=y1-y0
  widths=[]
  for pct in (.08,.12,.18,.25,.32,.4,.5,.6,.75,.9):
   y=y0+int(h*pct); mask=a.crop((x0,y,x1,y+1)).point(lambda x:255 if x>96 else 0); b=mask.getbbox(); widths.append(b[2]-b[0] if b else 0)
  rows.append((lab,widths))
 print('\n',v)
 for lab,w in rows: print(lab,w)
