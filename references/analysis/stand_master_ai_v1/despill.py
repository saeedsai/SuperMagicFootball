from PIL import Image
from pathlib import Path
root=Path(r'D:\My Projects\Supermagic_Football\SuperMagicFootball\references\analysis\stand_master_ai_v1')
for folder in ('body/views_v3','heads/views_v3','hair/views_v3'):
    for p in (root/folder).glob('*.png'):
        im=Image.open(p).convert('RGBA'); pix=im.load(); removed=0
        for y in range(im.height):
            for x in range(im.width):
                r,g,b,a=pix[x,y]
                if a and g>r+18 and g>b+18:
                    pix[x,y]=(r,g,b,0); removed+=1
        im.save(p)
        print(p.name, 'green-spill pixels cleared:',removed)
