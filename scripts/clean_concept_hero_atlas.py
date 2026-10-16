#!/usr/bin/env python3
"""Erase only connected near-white background islands between the concept hero's legs.
Preserve the white shorts, numbers and boots. Idempotent for an already-clean atlas.
"""
from collections import deque
from pathlib import Path
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
ATLAS=ROOT/'assets/concept_hero/hero_atlas.webp'
MANIFEST=ROOT/'assets/concept_hero/hero_atlas_manifest.json'
GAP_SEEDS={'front':(57,225),'quarterFront':(61,231),'quarterBack':(61,228),'back':(56,228)}
def clean_image(image,regions):
    image=image.convert('RGBA')
    report={}
    for name,(rx,ry) in GAP_SEEDS.items():
        region=regions[name]
        x0=int(region['x']);width=int(region['w']);sx=x0+rx;sy=ry
        def pale(x,y):
            r,g,b,a=image.getpixel((x,y))
            return a>55 and min(r,g,b)>=222 and max(r,g,b)-min(r,g,b)<=31
        if image.getpixel((sx,sy))[3]<12:
            report[name]={'status':'already-transparent','cleared':0}
            continue
        if not pale(sx,sy):raise ValueError('invalid interleg seed: '+name)
        todo=deque([(sx,sy)]);visited={(sx,sy)}
        while todo:
            x,y=todo.popleft()
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)):
                xx,yy=x+dx,y+dy
                if x0<=xx<x0+width and 175<=yy<264 and (xx,yy) not in visited and pale(xx,yy):
                    visited.add((xx,yy));todo.append((xx,yy))
        if not 280<=len(visited)<=3500:raise ValueError('suspicious interleg mask '+name+': '+str(len(visited)))
        erased=set(visited)
        for x,y in visited:
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                xx,yy=x+dx,y+dy
                if not (x0<=xx<x0+width and 175<=yy<264):continue
                r,g,b,a=image.getpixel((xx,yy))
                if a>12 and min(r,g,b)>=219 and max(r,g,b)-min(r,g,b)<=42:
                    erased.add((xx,yy))
        for x,y in erased:
            r,g,b,_=image.getpixel((x,y));image.putpixel((x,y),(r,g,b,0))
        report[name]={'status':'cleared','cleared':len(visited),'feather':len(erased)-len(visited)}
    return image,report
def main():
    regions=json.loads(MANIFEST.read_text())['regions']
    with Image.open(ATLAS) as original:
        new,report=clean_image(original,regions)
    new.save(ATLAS,'WEBP',lossless=True,method=6)
    with Image.open(ATLAS) as verification:
        result=verification.convert('RGBA')
        for name,(x,y) in GAP_SEEDS.items():
            assert result.getpixel((regions[name]['x']+x,y))[3]==0,name
    print('Clean concept atlas:',json.dumps(report,sort_keys=True))
if __name__=='__main__':main()
