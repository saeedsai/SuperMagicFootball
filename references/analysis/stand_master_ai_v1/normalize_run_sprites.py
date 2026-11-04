from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
out=root/'body'/'run_frames';out.mkdir(parents=True,exist_ok=True)
def bbox(im,threshold=96): return im.getchannel('A').point(lambda a:255 if a>=threshold else 0).getbbox()
def band_center(im,box=None):
    a=im.getchannel('A'); x0,y0,x1,y1=box or (0,0,im.width,im.height); h=y1-y0
    yA=y0+int(h*.06); yB=y0+int(h*.24)
    m=a.crop((x0,yA,x1,yB)).point(lambda p:255 if p>=128 else 0); b=m.getbbox()
    return ((x0+b[0]+x0+b[2])/2) if b else (x0+x1)/2
for i,v in enumerate(views,1):
    ref=Image.open(root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png').convert('RGBA')
    rb=bbox(ref,96); rh=rb[3]-rb[1]; rx=band_center(ref,rb); rel=rx-ref.width/2
    for f in (1,2):
        p=root/'body'/'run_sources'/'split'/v/f'run_{f}'/f'phase{f}_{v}_01.png'
        im=Image.open(p).convert('RGBA'); b=bbox(im,96)
        if not b: raise RuntimeError(f'No visible body in {p}')
        crop=im.crop(b); a=crop.getchannel('A').point(lambda q:0 if q<48 else q); crop.putalpha(a)
        scale=rh/crop.height; nw=max(1,round(crop.width*scale)); crop=crop.resize((nw,rh),Image.Resampling.LANCZOS)
        sx=band_center(crop); dstx=round(384+rel-sx); dsty=rb[1]
        canvas=Image.new('RGBA',(768,627),(0,0,0,0)); canvas.alpha_composite(crop,(dstx,dsty))
        dest=out/f'body_run_{v}_run_{f}.png'; canvas.save(dest)
        print(v,f,'src bbox',b,'target',rb,'resize',crop.size,'paste',(dstx,dsty),'file',dest.name)
