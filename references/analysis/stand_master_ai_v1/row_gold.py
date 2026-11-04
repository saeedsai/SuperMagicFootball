from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
vs=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
def intervals(im,y,xc):
 p=im.load(); xs=[]
 for x in range(im.width):
  r,g,b,a=p[x,y]
  if a>96 and r>140 and g>70 and r>g*1.12 and b<110:xs.append(x)
 groups=[];s=None;last=None
 for x in xs:
  if s is None:s=last=x
  elif x<=last+2:last=x
  else:groups.append((s,last));s=last=x
 if s is not None:groups.append((s,last))
 return sorted(groups,key=lambda z:abs((z[0]+z[1])/2-xc))[:4]
for i,v in enumerate(vs,1):
 print('\n',v)
 for label,p in [('stand',root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png'),('run1',root/'body'/'run_frames'/f'body_run_{v}_run_1.png'),('run2',root/'body'/'run_frames'/f'body_run_{v}_run_2.png')]:
  im=Image.open(p).convert('RGBA');bb=im.getchannel('A').point(lambda a:255 if a>96 else 0).getbbox(); y0,y1=bb[1],bb[3]; xc=im.width/2
  print(label,'bbox',bb)
  for pct in (.00,.02,.04,.06,.08,.10,.12,.14):
   y=y0+int((y1-y0)*pct); print(pct,intervals(im,y,xc),end='; ')
  print()
