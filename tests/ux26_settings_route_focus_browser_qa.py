#!/usr/bin/env python3
"""UX26: focus enters Settings child routes and returns to their opener."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_settings

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build the current game fixture first'
html = fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
    browser = pw.chromium.launch(
        headless=True,
        executable_path='/usr/bin/chromium',
        args=['--no-sandbox', '--disable-dev-shm-usage'],
    )
    for device, viewport, touch in [
        ('desktop', {'width': 1280, 'height': 720}, False),
        ('simulated-touch', {'width': 844, 'height': 390}, True),
    ]:
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(html, wait_until='load')
        open_settings(page, 'game')
        heading = page.locator('.navScreen h1.heading')
        assert page.evaluate('document.activeElement === document.querySelector(".navScreen h1.heading")'), (device, 'Game Settings route did not move focus to its heading')
        assert heading.get_attribute('tabindex') == '-1', (device, 'route heading is not programmatically focusable')

        page.locator('[data-action="navSettings"]').last.click()
        opener = page.locator('[data-action="navGameSettings"]')
        assert opener.evaluate('(node)=>node===document.activeElement'), (device, 'Back did not restore focus to the selected Settings action')
        assert not errors, (device, errors)
        print('UX26_SETTINGS_ROUTE_FOCUS_BROWSER_PASS', device)
        context.close()
    browser.close()
