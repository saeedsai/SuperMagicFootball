from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
vs=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
def group(im,y,xcenter):
 p=im.load(); xs=[]
 for x in range(im.width):
  r,g,b,a=p[x,y]
  if a>96 and b>r*1.15 and b>g*1.35 and 20<r<140 and g<100: xs.append(x)
 if not xs:return []
 groups=[];s=last=xs[0]
 for x in xs[1:]:
  if x>last+1:groups.append((s,last));s=x
  last=x
 groups.append((s,last))
 groups.sort(key=lambda q:(0 if q[0]<=xcenter<=q[1] else 1,abs((q[0]+q[1])/2-xcenter)))
 return [(a,b,b-a+1) for a,b in groups[:3]]
for i,v in enumerate(vs,1):
 ref=Image.open(root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png').convert('RGBA')
 print('\n',v)
 for label,im,xc in [('stand',ref,ref.width/2)]+[(f'run{f}',Image.open(root/'body'/'run_frames'/f'body_run_{v}_run_{f}.png').convert('RGBA'),384) for f in (1,2)]:
  bb=im.getchannel('A').point(lambda a:255 if a>96 else 0).getbbox(); y0,y1=bb[1],bb[3];h=y1-y0
  print(label,[(pct,group(im,y0+int(h*pct),xc)) for pct in (.22,.27,.32,.37,.42,.47)])
