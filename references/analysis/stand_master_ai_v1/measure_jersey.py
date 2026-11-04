from PIL import Image
from pathlib import Path
r=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1\renders')
views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
def spans(im):
 p=im.load(); vals=[]
 for y in range(im.height):
  xs=[]
  for x in range(im.width):
   R,G,B,A=p[x,y]
   if A>96 and B>R*1.15 and B>G*1.5 and 20<R<150 and G<100: xs.append(x)
  if xs: vals.append((y,max(xs)-min(xs)+1))
 bb=im.getchannel('A').point(lambda a:255 if a>96 else 0).getbbox(); y0,y1=bb[1],bb[3]; h=y1-y0
 return sorted((w,y) for y,w in vals if y0+h*.08<=y<=y0+h*.52)[-5:]
for v in views:
 print('\n',v)
 for label,f in [('stand',f'bodyonly_stand_{v}.png'),('run1',f'bodyonly_{v}_run_1.png'),('run2',f'bodyonly_{v}_run_2.png')]: print(label,spans(Image.open(r/f).convert('RGBA')))
