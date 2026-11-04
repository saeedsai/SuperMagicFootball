#!/usr/bin/env python3
"""UX26: Escape from the Studio gallery restores focus to its opener."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

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
        open_feature(page, 'playerStudio')
        toggle = page.locator('[data-action="studioGalleryToggle"]')
        toggle.click()
        assert page.locator('#studioEightViewGallery').count() == 1, (device, 'gallery did not open')
        tile = page.locator('[data-studio-pick="7"]')
        tile.focus()
        assert tile.evaluate('(node)=>node===document.activeElement'), (device, 'gallery tile could not receive focus')
        page.keyboard.press('Escape')
        assert page.locator('#studioEightViewGallery').count() == 0, (device, 'Escape did not close gallery')
        assert toggle.evaluate('(node)=>node===document.activeElement'), (device, 'Escape did not return focus to gallery toggle')
        assert not errors, (device, errors)
        print('UX26_STUDIO_GALLERY_ESCAPE_FOCUS_PASS', device)
        context.close()
    browser.close()
