from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
vs=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
def spans(im):
 p=im.load(); a=im.getchannel('A');bb=a.point(lambda z:255 if z>64 else 0).getbbox(); y0,y1=bb[1],bb[3]; hist=[0]*im.width
 for y in range(y0,y0+int((y1-y0)*.20)):
  for x in range(im.width):
   r,g,b,A=p[x,y]
   if A>64 and r>140 and g>70 and r>g*1.12 and b<110: hist[x]+=1
 runs=[];s=None
 for x,n in enumerate(hist+[0]):
  if n>=3 and s is None:s=x
  if n<3 and s is not None:runs.append((s,x-1,max(hist[s:x])));s=None
 return runs
for i,v in enumerate(vs,1):
 print(v)
 for label,p in [('stand',root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png'),('run1',root/'body'/'run_frames'/f'body_run_{v}_run_1.png'),('run2',root/'body'/'run_frames'/f'body_run_{v}_run_2.png')]:
  print(label,spans(Image.open(p).convert('RGBA')))
