#!/usr/bin/env python3
"""Measure the four-action touch pad against the movement joystick on phones."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/.generated/play.html'
assert FIXTURE.exists(), 'Build the current browser fixture first'
HTML = FIXTURE.read_text(encoding='utf-8')
VIEWPORTS = [('320x568', 320, 568), ('390x844', 390, 844),
             ('844x390', 844, 390), ('568x320', 568, 320)]

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for label, width, height in VIEWPORTS:
        context = browser.new_context(viewport={'width': width, 'height': height},
                                      is_mobile=True, has_touch=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(HTML, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        geometry = page.evaluate('''() => {
          const mobile=document.querySelector('#mobile'),joy=document.querySelector('#joyZone'), pad=document.querySelector('#touchButtons');
          if(!joy||!pad)throw Error('touch movement and action controls are missing');
          mobile.classList.remove('hidden');
          const rect=element=>{const r=element.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
          const a=rect(joy),b=rect(pad);
          return {joy:a,pad:b,overlapX:Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),
            overlapY:Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))};
        }''')
        assert geometry['joy']['width'] > 0 and geometry['pad']['width'] > 0, (label, geometry)
        assert geometry['overlapX'] == 0 or geometry['overlapY'] == 0, (
            label, 'movement joystick overlaps action buttons', geometry)
        assert not errors, (label, errors)
        print(f'VIZ01_TOUCH_SEPARATION_PASS {label}: joystick and four-action pad do not overlap',
              flush=True)
        context.close()
    browser.close()
