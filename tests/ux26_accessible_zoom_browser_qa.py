#!/usr/bin/env python3
"""UX26: verify mobile browser pinch zoom remains available in the game shell."""
from pathlib import Path
from playwright.sync_api import sync_playwright

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
        page.set_content(html, wait_until='load')
        viewport_meta = page.locator('meta[name="viewport"]').get_attribute('content')
        assert 'user-scalable=no' not in viewport_meta.lower(), (device, viewport_meta)
        assert 'maximum-scale=1' not in viewport_meta.lower(), (device, viewport_meta)
        if touch:
            assert page.evaluate('window.visualViewport.scale') == 1, (device, 'unexpected initial mobile zoom')
        print('UX26_ACCESSIBLE_ZOOM_BROWSER_PASS', device)
        context.close()
    browser.close()
