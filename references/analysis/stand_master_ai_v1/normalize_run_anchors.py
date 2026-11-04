from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
out=root/'body'/'run_frames_aligned';out.mkdir(parents=True,exist_ok=True)
def alpha_box(im,threshold=128): return im.getchannel('A').point(lambda z:255 if z>=threshold else 0).getbbox()
def collar(im):
 p=im.load(); bb=alpha_box(im,128); x0,y0,x1,y1=bb; w=x1-x0; h=y1-y0
 top_x=[]
 for y in range(y0,min(y1,y0+int(h*.12))):
  for x in range(x0,x1):
   if p[x,y][3]>=128:top_x.append(x)
 center=(min(top_x)+max(top_x))/2 if top_x else (x0+x1)/2
 radius=max(22,int(w*.18)); choices=[]
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
  groups.append((s,last))
  gs=[q for q in groups if q[1]-q[0]+1>=5]
  if gs:
   g=max(gs,key=lambda z:(z[1]-z[0]+1,-abs((z[0]+z[1])/2-center)))
   choices.append((g[1]-g[0]+1,(g[0]+g[1])/2,y))
 if not choices:raise RuntimeError('collar not found')
 return max(choices,key=lambda z:z[0]),bb
for i,v in enumerate(views,1):
 ref=Image.open(root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png').convert('RGBA')
 (tw,tx,ty),rb=collar(ref);target_bottom=rb[3]-1
 target_x=512+(tx-ref.width/2);target_y=450+(ty-ref.height/2);target_bottom_local=450+(target_bottom-ref.height/2)
 for f in (1,2):
  p=root/'body'/'run_frames'/f'body_run_{v}_run_{f}.png'
  im=Image.open(p).convert('RGBA');(sw,sx,sy),sb=collar(im);src_bottom=sb[3]-1
  scale_x=tw/sw;scale_y=(target_bottom_local-target_y)/(src_bottom-sy)
  crop=im.crop(sb);crop.putalpha(crop.getchannel('A').point(lambda a:0 if a<48 else a))
  nw=max(1,round(crop.width*scale_x));nh=max(1,round(crop.height*scale_y));crop=crop.resize((nw,nh),Image.Resampling.LANCZOS)
  px=round(target_x-(sx-sb[0])*scale_x);py=round(target_y-(sy-sb[1])*scale_y)
  canvas=Image.new('RGBA',(1024,900),(0,0,0,0));canvas.alpha_composite(crop,(px,py))
  dest=out/f'body_run_{v}_run_{f}.png';canvas.save(dest)
  cc,bb=collar(canvas)
  print(v,f,'scaleXY',round(scale_x,3),round(scale_y,3),'collar',cc,'bbox',alpha_box(canvas,128))
