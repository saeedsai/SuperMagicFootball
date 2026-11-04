#!/usr/bin/env python3
"""Audit key menu routes for horizontal overflow at phone and desktop widths."""
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
    ('about', 'navAbout', 'ABOUT SUPERMAGIC FOOTBALL'),
    ('online', 'navOnline', 'ONLINE MATCHES'),
]
VIEWPORTS = [('narrow phone', 320, 568, True), ('phone', 390, 844, True),
             ('desktop', 1280, 800, False)]

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
            dimensions = page.evaluate('''() => ({
              viewport: innerWidth,
              body: document.body.scrollWidth,
              document: document.documentElement.scrollWidth,
              menu: document.querySelector('#menu').scrollWidth,
              menuClient: document.querySelector('#menu').clientWidth
            })''')
            assert dimensions['viewport'] == width, (label, name, dimensions)
            assert max(dimensions['body'], dimensions['document'], dimensions['menu']) <= width, (
                label, name, 'unexpected horizontal overflow', dimensions)
            unnamed = page.evaluate('''() => {
              const text = element => (element.innerText || element.textContent || '').trim();
              const visible = element => element.getClientRects().length &&
                getComputedStyle(element).visibility !== 'hidden' &&
                getComputedStyle(element).display !== 'none';
              return [...document.querySelectorAll('#menu button, #menu input:not([type=hidden]), #menu select, #menu textarea')]
                .filter(visible)
                .filter(element => {
                  const labelledBy = element.getAttribute('aria-labelledby');
                  const referenced = labelledBy && labelledBy.split(/\\s+/).map(id=>document.getElementById(id)).filter(Boolean).map(text).join(' ');
                  const imageText = [...element.querySelectorAll('img[alt]')].map(image=>image.alt).join(' ');
                  return !(element.getAttribute('aria-label') || referenced || text(element) || element.getAttribute('title') || imageText || element.labels?.length);
                })
                .map(element => ({tag:element.tagName,id:element.id,action:element.dataset.action||'',type:element.type||''}));
            }''')
            assert not unnamed, (label, name, 'visible control lacks an accessible name', unnamed)
            for _ in actions:
                page.keyboard.press('Escape')
        assert not page_errors, (label, page_errors)
        print(f'VIZ02_ROUTE_RESPONSIVE_PASS {label}: {len(ROUTES)} routes, no horizontal overflow, unlabeled controls, or page errors',
              flush=True)
        context.close()
    browser.close()
