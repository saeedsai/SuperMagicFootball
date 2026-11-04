#!/usr/bin/env python3
"""Pixel-compare profile nose contours through the actual gameplay renderer."""
from __future__ import annotations

import base64
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'PLAYER_ART_PROFILE_NOSE_POLISH_20261103'
OUT.mkdir(parents=True, exist_ok=True)
html = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf-8')
shell = html.split('<script type="module">', 1)[0] + '</body></html>'
module = html.split('<script type="module">', 1)[1].split('</script>', 1)[0]

NEW_BLOCK = '''   const projectionBase=[3.3,4.1,5.2,4.6,6.4,4.0][s],projection=projectionBase*(angle==='side'?.86:.93),rise=[4,5,3,5,4,7][s];
   fill(c,p=>{p.moveTo(-3,-rise);p.quadraticCurveTo(.5,-rise*.6,2,-1.5);p.quadraticCurveTo(3.3,.15,projection+1.15,2.55);
    p.quadraticCurveTo(projection+2.35,3.1,projection+1.35,4.2);p.quadraticCurveTo(projection+.8,4.9,1.8,5);p.quadraticCurveTo(-1,3,-3,1.2)},grad(c,-3,-3,projection+2.35,5,[[0,hi],[.6,skin],[1,blend(skin,-.17)]]),null);
   stroke(c,[[1.9,4.4],[projection*.76+1.8,4]],ink(sh,.9),1.15);
   oval(c,projection*.78+.7,3.2,1,.67,sh);'''
OLD_BLOCK = '''   const projection=[3.3,4.1,5.2,4.6,6.4,4.0][s],rise=[4,5,3,5,4,7][s];
   fill(c,p=>{p.moveTo(-3,-rise);p.quadraticCurveTo(.5,-rise*.6,2,-1.5);p.quadraticCurveTo(2+projection*.55,1,projection+2,3);
    p.quadraticCurveTo(projection+3.2,5,1.8,5);p.quadraticCurveTo(-1,3,-3,1.2)},grad(c,-3,-3,projection+3,5,[[0,hi],[.6,skin],[1,blend(skin,-.17)]]),null);
   stroke(c,[[1.9,4.4],[projection+1.8,4]],ink(sh,.9),1.15);
   oval(c,projection+1.1,3.2,1,.67,sh);'''
if module.count(NEW_BLOCK) != 1:
    raise SystemExit('Current browser fixture does not contain exactly one new profile-nose block; build the fixture from source first.')
baseline_module = module.replace(NEW_BLOCK, OLD_BLOCK, 1)

VIEWS = [
    {'name': 'Front', 'kind': 'front', 'dx': 0, 'dy': 1},
    {'name': '3/4 Front Left', 'kind': 'quarterFront', 'dx': -.707, 'dy': .707},
    {'name': '3/4 Front Right', 'kind': 'quarterFront', 'dx': .707, 'dy': .707},
    {'name': 'Left Profile', 'kind': 'side', 'dx': -1, 'dy': 0},
    {'name': 'Right Profile', 'kind': 'side', 'dx': 1, 'dy': 0},
]
RENDER = r'''views => {
 const env=window.SupermagicFootball,p=env?.game?.players?.find(v=>v&&!v.keeper);
 if(!env||!p)throw new Error('Gameplay player or renderer was not initialized');
 const team=env.game.getTeam(p.t),cases=[],sheet=document.createElement('main');
 sheet.id='profile-nose-gallery';sheet.style.cssText='position:static!important;display:block!important;width:1100px!important;padding:14px!important;background:#dce7ee!important;color:#172d42!important;font:14px Arial!important;overflow:visible!important';
 const title=document.createElement('h2');title.textContent='Profile nose comparison · actual gameplay renderer';title.style.cssText='position:static!important;display:block!important;margin:8px!important;font:700 20px Arial!important';sheet.append(title);
 for(const view of views){
  const row=document.createElement('section');row.style.cssText='position:static!important;display:grid!important;grid-template-columns:140px repeat(6,1fr)!important;gap:7px!important;align-items:start!important;margin:8px 0 14px!important;padding:8px!important;background:#cbdbe5!important';
  const heading=document.createElement('strong');heading.textContent=view.name;heading.style.cssText='position:static!important;display:block!important';row.append(heading);
  for(let nose=0;nose<6;nose++){
   const card=document.createElement('div');card.style.cssText='position:static!important;display:grid!important;justify-items:center!important;gap:2px!important;font:11px Arial!important';
   const label=document.createElement('span');label.textContent='NOSE '+nose;label.style.cssText='position:static!important;display:block!important';card.append(label);
   const cv=document.createElement('canvas');cv.width=230;cv.height=245;cv.style.cssText='position:static!important;display:block!important;width:130px!important;height:138px!important;background:#edf3f6!important;border:1px solid #8497a6!important';
   const ctx=cv.getContext('2d',{willReadFrequently:true});
   ctx.save();ctx.translate(11.5,16);ctx.scale(.9,.9);
   env.renderer.drawPlayer(ctx,{...p,src:{...p.src,appearance:{skin:'#b7835f',hair:'#282524',style:1,accessory:0,face:1,beard:0,eyes:8,eyeColor:2,brows:6,nose,lips:2}},
    x:115,y:178,dx:view.dx,dy:view.dy,visualFacing:null,anim:0,z:0,action:'idle',controlled:false,preview:true},
    {getTeam:()=>({primary:'#ed5834',secondary:'#f3f3ea',trim:'#f2bc46'}),options:{showNames:false}});
   ctx.restore();
   const full=ctx.getImageData(0,0,cv.width,cv.height).data;let ink=0,edge=0,hash=2166136261;
   for(let i=0;i<full.length;i+=4){if(full[i+3]>40){ink++;const pixel=i/4,x=pixel%cv.width,y=(pixel/cv.width)|0;if(x<2||x>cv.width-3||y<2||y>cv.height-3)edge++;}
    hash=Math.imul(hash^(full[i]+3*full[i+1]+7*full[i+2]+11*full[i+3]),16777619)>>>0;}
   const crop=ctx.getImageData(60,35,115,105).data;let binary='';for(let i=0;i<crop.length;i+=8192)binary+=String.fromCharCode(...crop.subarray(i,Math.min(i+8192,crop.length)));
   cases.push({view:view.name,kind:view.kind,nose,hash,ink,edge,cropB64:btoa(binary)});card.append(cv);row.append(card);
  }
  sheet.append(row);
 }
 document.body.replaceChildren(sheet);document.body.style.cssText='position:static!important;display:block!important;margin:0!important;background:#dce7ee!important';document.documentElement.style.cssText='position:static!important;display:block!important;height:auto!important';
 return cases;
}'''

def load_bundle(browser, bundle, label):
    page = browser.new_page(viewport={'width': 1140, 'height': 980}, device_scale_factor=1)
    errors = []
    page.set_content(shell)
    page.add_script_tag(content=bundle, type='module')
    page.wait_for_function('!!window.SupermagicFootball', timeout=30000)
    # The app-only about:blank harness emits known startup null-classList errors;
    # monitor only actual renderer-gallery evaluation after module initialization.
    page.on('pageerror', lambda error: errors.append(str(error)))
    result = page.evaluate(RENDER, VIEWS)
    page.locator('#profile-nose-gallery').screenshot(path=str(OUT / f'{label}_game_scale.png'), timeout=30000)
    return page, result, errors

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    before_page, before, before_errors = load_bundle(browser, baseline_module, 'before')
    after_page, after, after_errors = load_bundle(browser, module, 'after')
    before_page.close(); after_page.close()

    by_key = {(case['view'], case['nose']): case for case in before}
    report = {'sampleCount': len(after), 'frontPixelIdentical': True, 'changedProfileSamples': 0,
              'blank': 0, 'clipped': 0, 'viewDistinctNoses': {}, 'pageErrors': before_errors + after_errors,
              'pixelChanges': []}
    comparison_rows = []
    for case in after:
        prev = by_key[(case['view'], case['nose'])]
        report['blank'] += int(case['ink'] < 350)
        report['clipped'] += int(case['edge'] != 0)
        before_raw, after_raw = base64.b64decode(prev['cropB64']), base64.b64decode(case['cropB64'])
        changed = sum(a != b for a, b in zip(before_raw, after_raw))
        if case['kind'] == 'front':
            report['frontPixelIdentical'] &= changed == 0
        else:
            report['changedProfileSamples'] += int(changed > 0)
        changed_pixels = sum(1 for i in range(0, len(before_raw), 4)
                             if before_raw[i:i+4] != after_raw[i:i+4])
        larger = 0
        for i in range(0, len(before_raw), 4):
            if max(abs(before_raw[i+j]-after_raw[i+j]) for j in range(3)) > 8:
                larger += 1
        report['pixelChanges'].append({'view': case['view'], 'nose': case['nose'], 'changedChannelsIn64pxHeadCrop': changed,
                                       'changedPixelsIn64pxHeadCrop': changed_pixels, 'pixelsWithRGBDeltaOver8': larger})
        comparison_rows.append({'view': case['view'], 'nose': case['nose'], 'before': prev['cropB64'], 'after': case['cropB64'], 'changedChannels': changed})
    for view in VIEWS:
        hashes = {case['hash'] for case in after if case['view'] == view['name']}
        report['viewDistinctNoses'][view['name']] = len(hashes)

    compare_page = browser.new_page(viewport={'width': 1120, 'height': 1000}, device_scale_factor=1)
    compare_page.set_content('<!doctype html><html><body></body></html>')
    compare_page.evaluate(r'''rows=>{
      const root=document.createElement('main');root.id='nose-before-after';root.style.cssText='position:static!important;display:block!important;width:1080px!important;padding:12px!important;background:#dce7ee!important;color:#172d42!important;font:12px Arial!important';
      const h=document.createElement('h2');h.textContent='Profile nose game-size pixels · before / after';h.style.cssText='position:static!important;display:block!important;font:700 20px Arial!important';root.append(h);
      const draw=(encoded,canvas)=>{const binary=atob(encoded),raw=Uint8ClampedArray.from(binary,c=>c.charCodeAt(0)),image=new ImageData(raw,115,105);canvas.width=115;canvas.height=105;canvas.getContext('2d').putImageData(image,0,0)};
      let current='';let row=null;
      for(const item of rows){if(item.view!==current){current=item.view;row=document.createElement('section');row.style.cssText='position:static!important;display:grid!important;grid-template-columns:130px repeat(12,1fr)!important;gap:4px!important;align-items:center!important;margin:6px 0!important;padding:5px!important;background:#cbdbe5!important';const label=document.createElement('strong');label.textContent=current;label.style.cssText='position:static!important;display:block!important';row.append(label);root.append(row)}
       const before=document.createElement('canvas'),after=document.createElement('canvas');draw(item.before,before);draw(item.after,after);
       for(const [caption,canvas] of [['B',before],['A',after]]){const card=document.createElement('div');card.style.cssText='position:static!important;display:grid!important;justify-items:center!important;gap:2px!important';const title=document.createElement('small');title.textContent='N'+item.nose+' '+caption;title.style.cssText='position:static!important;display:block!important';canvas.style.cssText='position:static!important;display:block!important;width:55px!important;height:50px!important;image-rendering:pixelated!important;background:#edf3f6!important;border:1px solid #8295a3!important';card.append(title,canvas);row.append(card)}
      }
      document.body.replaceChildren(root);document.body.style.cssText='position:static!important;display:block!important;margin:0!important;background:#dce7ee!important';document.documentElement.style.cssText='position:static!important;display:block!important;height:auto!important';
    }''', comparison_rows)
    compare_page.locator('#nose-before-after').screenshot(path=str(OUT / 'before_after_game_size_pixels.png'), timeout=30000)
    compare_page.close();browser.close()

    report['ok'] = (report['sampleCount'] == 30 and report['blank'] == 0 and report['clipped'] == 0
                    and report['frontPixelIdentical'] and report['changedProfileSamples'] == 24
                    and all(count == 6 for count in report['viewDistinctNoses'].values())
                    and before_errors == after_errors)
    (OUT / 'browser_render_report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'pixelChanges'}, sort_keys=True))
    if not report['ok']:
        raise SystemExit(1)
