from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
views=['front','threeQuarterFrontLeft','left','threeQuarterBackLeft','back']
for i,v in enumerate(views,1):
    ref=Image.open(root/'body'/'views_v3'/f'headless_body_sheet_chroma_transparent_{i:02}.png').convert('RGBA')
    bb=ref.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    print(v,'stand bbox',bb,'size',bb[2]-bb[0],bb[3]-bb[1])
    for f in (1,2):
        p=root/'body'/'run_sources'/'split'/v/f'run_{f}'/f'phase{f}_{v}_01.png'
        im=Image.open(p).convert('RGBA')
        b=im.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
        print(' ',f,'src',im.size,'bbox',b,'extent',b[2]-b[0],b[3]-b[1])
