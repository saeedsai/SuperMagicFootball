from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
def collar(im):
 p=im.load(); a=im.getchannel('A'); b=a.point(lambda x:255 if x>=128 else 0).getbbox(); x0,y0,x1,y1=b; w=x1-x0; h=y1-y0
 # top-band horizontal center, robust to moving arms
 ys=range(y0,min(y1,y0+int(h*.12))); tx=[]
 for y in ys:
  for x in range(x0,x1):
   if p[x,y][3]>=128: tx.append(x)
 center=(min(tx)+max(tx))/2 if tx else (x0+x1)/2
 radius=max(22,int(w*.18)); choices=[]
 for y in range(y0,y0+int(h*.10)):
  xs=[]
  for x in range(max(x0,int(center-radius)),min(x1,int(center+radius)+1)):
   r,g,bv,al=p[x,y]
   if al>=128 and r>140 and g>70 and r>g*1.12 and bv<110: xs.append(x)
  if not xs:continue
  groups=[];s=last=xs[0]
  for x in xs[1:]:
   if x<=last+2:last=x
   else:groups.append((s,last));s=last=x
  groups.append((s,last))
  gs=[q for q in groups if q[1]-q[0]+1>=5]
  if gs:
   g=max(gs,key=lambda z:(z[1]-z[0]+1,-abs((z[0]+z[1])/2-center)))
   choices.append((g[1]-g[0]+1,(g[0]+g[1])/2,y,g[0],g[1]))
 if not choices:return None,b
 # prefer best width near x center, median of top widths for stable estimate
 choices.sort(key=lambda z:(z[0],-abs(z[1]-center)),reverse=True)
 return choices[0],b
for i,v in enumerate(views,1):
 ref=Image.open(root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png').convert('RGBA')
 cr,rb=collar(ref)
 print('\n',v,'stand collar',cr,'bbox',rb)
 for f in (1,2):
  p=root/'body'/'run_frames'/f'body_run_{v}_run_{f}.png'
  x,b=collar(Image.open(p).convert('RGBA'))
  print('current',f,'collar',x,'bbox',b)
 edit=root/'body'/'run_sources'/f'phase2_edit_{v}.png'
 if edit.exists():
  x,b=collar(Image.open(edit).convert('RGBA'))
  print('edit2 collar',x,'bbox',b,'scale from stand',cr[0]/x[0] if x else None)
