from PIL import Image
import numpy as np, cv2
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
vs=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
def components(im):
 arr=np.array(im.convert('RGBA'));alpha=arr[:,:,3];h,w=alpha.shape
 ys,xs=np.where(alpha>=128); y0,y1=ys.min(),ys.max()+1;x0,x1=xs.min(),xs.max()+1
 top_h=int((y1-y0)*.16)
 r,g,b,a=arr[:,:,:].transpose(2,0,1)
 mask=((alpha>=128)&(r>140)&(g>70)&(r>g*1.12)&(b<110)&(np.indices((h,w))[0]>=y0)&(np.indices((h,w))[0]<y0+top_h)).astype(np.uint8)
 n,lbl,stats,cent=cv2.connectedComponentsWithStats(mask,8)
 comps=[]
 cx=(x0+x1)/2
 for k in range(1,n):
  x,y,bw,bh,area=stats[k]
  if area>8:comps.append((area,round(cent[k][0],1),round(cent[k][1],1),(x,y,bw,bh),round(abs(cent[k][0]-cx),1)))
 return sorted(comps,key=lambda z:(z[4],-z[0]))[:8]
for i,v in enumerate(vs,1):
 print('\n',v)
 for lab,p in [('stand',root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png'),('run1',root/'body'/'run_frames'/f'body_run_{v}_run_1.png'),('run2',root/'body'/'run_frames'/f'body_run_{v}_run_2.png')]:
  print(lab,components(Image.open(p)))
