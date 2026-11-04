from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
out=root/'body'/'run_frames_final';out.mkdir(parents=True,exist_ok=True)
def bbox(im): return im.getchannel('A').point(lambda z:255 if z>=128 else 0).getbbox()
def collar(im):
 p=im.load();x0,y0,x1,y1=bbox(im);w=x1-x0;h=y1-y0
 tx=[]
 for y in range(y0,min(y1,y0+int(h*.12))):
  for x in range(x0,x1):
   if p[x,y][3]>=128:tx.append(x)
 center=(min(tx)+max(tx))/2 if tx else (x0+x1)/2
 radius=max(22,int(w*.18));choices=[]
 for y in range(y0,y0+int(h*.10)):
  xs=[]
  for x in range(max(x0,int(center-radius)),min(x1,int(center+radius)+1)):
   r,g,b,a=p[x,y]
   if a>=128 and r>140 and g>70 and r>g*1.12 and b<110:xs.append(x)
  if not xs:continue
  groups=[];s=last=xs[0]
  for x in xs[1:]:
   if x<=last+2:last=x
   else:groups.append((s,last));s=last=x
  groups.append((s,last));gs=[q for q in groups if q[1]-q[0]+1>=5]
  if gs:
   a0=max(gs,key=lambda z:(z[1]-z[0]+1,-abs((z[0]+z[1])/2-center)))
   choices.append((a0[1]-a0[0]+1,(a0[0]+a0[1])/2,y))
 if not choices:raise RuntimeError('no collar')
 return max(choices,key=lambda z:z[0])
for i,v in enumerate(views,1):
 ref=Image.open(root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png').convert('RGBA')
 (tw,tx,ty)=collar(ref)
 target_x=384+(tx-ref.width/2);target_y=ty
 for f in (1,2):
  src=Image.open(root/'body'/'run_frames'/f'body_run_{v}_run_{f}.png').convert('RGBA')
  sw,sx,sy=collar(src);dx=round(target_x-sx);dy=round(target_y-sy)
  canvas=Image.new('RGBA',(768,627),(0,0,0,0));canvas.alpha_composite(src,(dx,dy))
  dest=out/f'body_run_{v}_run_{f}.png';canvas.save(dest)
  fc=collar(canvas);print(v,f,'translate',(dx,dy),'collar',fc,'target',(tw,target_x,target_y),'bbox',bbox(canvas))
