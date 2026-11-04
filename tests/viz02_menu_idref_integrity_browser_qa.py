#!/usr/bin/env python3
"""Check ID uniqueness and ARIA/label ID references on core menu routes."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/.generated/play.html'
assert FIXTURE.exists(), 'Build the current browser fixture first'
HTML = FIXTURE.read_text(encoding='utf-8')
ROUTES = [
    ('quick', 'navQuick', 'QUICK MATCH'),
    ('device', 'navQuick,navOnDevice', 'ON DEVICE'),
    ('lan', 'navQuick,navLan', 'LOCAL NETWORK'),
    ('online-p2p', 'navQuick,navOnlineP2P', 'ONLINE P2P'),
    ('career', 'navCareer', 'CAREER'),
    ('cups', 'navCups', 'LEAGUES & CUPS'),
    ('international', 'navCups,navInternational', 'INTERNATIONAL'),
    ('clubs', 'navCups,navClubs', 'CLUB COMPETITIONS'),
    ('settings', 'navSettings', 'SETTINGS'),
    ('game-settings', 'navSettings,navGameSettings', 'GAME SETTINGS'),
    ('graphics', 'navSettings,navGraphics', 'GRAPHICS'),
    ('sound', 'navSettings,navSound', 'SOUND'),
    ('customization', 'navSettings,navCustomization', 'PLAYER & TEAM CUSTOMIZATION'),
    ('input', 'navSettings,navInput', 'INPUT SETTINGS'),
    ('saves', 'navSettings,navSaveManagement', 'SAVE MANAGEMENT'),
    ('controls', 'navSettings,help', 'CONTROLS'),
    ('about', 'navSettings,navAbout', 'ABOUT SUPERMAGIC FOOTBALL'),
    ('online', 'navOnline', 'ONLINE MATCHES'),
]
VIEWPORTS = [('narrow', 320, 568, True), ('phone', 390, 844, True),
             ('desktop', 1280, 800, False)]

SCAN = r'''() => {
  const duplicates = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('[id]')) {
    if (seen.has(el.id)) duplicates.push(el.id);
    seen.add(el.id);
  }
  const broken = [];
  const attrs = ['aria-labelledby','aria-describedby','aria-controls',
                 'aria-owns','aria-errormessage','aria-details'];
  for (const el of document.querySelectorAll('#menu *')) {
    for (const attr of attrs) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      for (const id of value.trim().split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id)) broken.push({id:el.id,attr,target:id});
      }
    }
    if (el.matches('label[for]')) {
      const target = document.getElementById(el.htmlFor);
      if (!target || !target.matches('button,input,select,textarea,output,meter,progress,fieldset,object')) {
        broken.push({id:el.id,attr:'for',target:el.htmlFor});
      }
    }
  }
  return {duplicates,broken};
}'''

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for label, width, height, mobile in VIEWPORTS:
        context = browser.new_context(viewport={'width': width, 'height': height},
                                      is_mobile=mobile, has_touch=mobile)
        page = context.new_page()
        page_errors = []
        page.on('pageerror', lambda error: page_errors.append(str(error)))
        page.set_content(HTML, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        for name, path, title in ROUTES:
            actions = path.split(',')
            for action in actions:
                page.locator(f'[data-action="{action}"]').first.click()
            page.wait_for_function(
                '(title)=>document.querySelector("#menu h1.heading")?.textContent===title',
                arg=title, timeout=10000)
            result = page.evaluate(SCAN)
            assert not result['duplicates'], (label, name, 'duplicate document IDs', result['duplicates'])
            assert not result['broken'], (label, name, 'broken menu ID reference', result['broken'])
            for _ in actions:
                page.keyboard.press('Escape')
        assert not page_errors, (label, page_errors)
        print(f'VIZ02_MENU_IDREFS_PASS {label}: {len(ROUTES)} routes', flush=True)
        context.close()
    browser.close()
