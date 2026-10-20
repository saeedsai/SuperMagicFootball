"""Live Chromium desktop and simulated-touch Back-route check. No physical device claim."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf8')

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    for label, mobile in [('desktop', False), ('simulated-touch', True)]:
        context = browser.new_context(
            viewport={'width': 1360, 'height': 800} if not mobile else {'width': 844, 'height': 390},
            is_mobile=mobile, has_touch=mobile,
        )
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.set_content(HTML, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)

        def click(action):
            page.locator('[data-action="' + action + '"]').first.click(timeout=30000)

        click('navSettings')
        click('navCustomization')
        for route in ['playerStudio', 'clubs', 'editor', 'gallery', 'squad']:
            assert page.locator('.navScreen .heading').inner_text() == 'PLAYER & TEAM CUSTOMIZATION', (label, route, 'parent')
            click(route)
            assert page.locator('.row.space [data-action="navCustomization"]').count() == 1, (label, route, 'visible header Back')
            page.keyboard.press('Escape')
            assert page.locator('.navScreen .heading').inner_text() == 'PLAYER & TEAM CUSTOMIZATION', (label, route, 'keyboard Back')
        click('navSettings')
        click('navInput')
        click('controls')
        assert page.locator('.row.space [data-action="navInput"]').count() == 1, (label, 'mapping visible Back')
        page.keyboard.press('Backspace')
        assert page.locator('.navScreen .heading').inner_text() == 'INPUT SETTINGS', (label, 'mapping Backspace')
        assert not errors, (label, errors)
        print('UI_BACK_ROUTES_BROWSER_PASS', label, 'five customization routes, Input mapping, no JS errors', flush=True)
        context.close()
    browser.close()
