from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
vs=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
def info(im,center=None):
 p=im.load(); al=im.getchannel('A'); bb=al.point(lambda a:255 if a>64 else 0).getbbox(); x0,y0,x1,y1=bb; h=y1-y0; mid=center if center is not None else im.width/2; rad=min(120,im.width*.2)
 pts=[]
 for y in range(y0,min(y1,y0+int(.2*h))):
  for x in range(max(0,int(mid-rad)),min(im.width,int(mid+rad))):
   r,g,b,a=p[x,y]
   if a>64 and r>140 and g>70 and r>g*1.12 and b<110: pts.append((x,y))
 if pts: return (min(x for x,y in pts),max(x for x,y in pts),min(y for x,y in pts),max(y for x,y in pts),len(pts))
for i,v in enumerate(vs,1):
 ref=Image.open(root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png').convert('RGBA')
 print(v,'stand',info(ref,ref.width/2))
 for f in (1,2):
  im=Image.open(root/'body'/'run_frames'/f'body_run_{v}_run_{f}.png').convert('RGBA')
  print(' run',f,info(im,im.width/2))
