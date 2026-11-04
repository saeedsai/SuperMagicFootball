from PIL import Image
from pathlib import Path
import zipfile
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
renders=root/'renders'; views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back','threeQuarterBackRight','right','threeQuarterFrontRight']
rgba=[]
for v in views:
 for f in (1,2):
  im=Image.open(renders/f'run_{v}_run_{f}.png').convert('RGBA')
  if im.size!=(614,614): im=im.resize((614,614),Image.Resampling.NEAREST)
  rgba.append(im)
frames=[]
for im in rgba:
 alpha=im.getchannel('A'); rgb=Image.new('RGB',im.size,(0,0,0)); rgb.paste(im.convert('RGB'))
 q=rgb.quantize(colors=255,method=Image.Quantize.FASTOCTREE)
 pal=q.getpalette() or [0]*768
 pal=(pal+[0,0,0]*256)[:768]
 pal[765:768]=[0,0,0]
 idx=list(q.getdata()); al=list(alpha.getdata()); idx=[255 if a<128 else c for c,a in zip(idx,al)]
 q.putdata(idx);q.putpalette(pal);q.info['transparency']=255
 frames.append(q)
out=root/'running_turntable_360.gif'
frames[0].save(out,save_all=True,append_images=frames[1:],duration=125,loop=0,transparency=255,disposal=2,optimize=False)
# Convenient package of all eight AssetStudio per-view running GIFs.
zip_path=root/'gifs'/'running_animation_all_8_views.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted((root/'gifs').glob('run_*.gif')): z.write(p,p.name)
# Validate frame counts and GIF palette transparency.
print({'turntable':str(out),'turntable_frames':Image.open(out).n_frames,'turntable_size':Image.open(out).size,'turntable_transparency':Image.open(out).info.get('transparency')})
print({'views':{p.stem:Image.open(p).n_frames for p in sorted((root/'gifs').glob('run_*.gif'))},'zip':str(zip_path),'zip_bytes':zip_path.stat().st_size})
