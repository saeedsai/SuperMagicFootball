#!/usr/bin/env python3
"""UX26: About lives under Settings and returns focus through both parent menus."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build the current game fixture first'
html = fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
    browser = pw.chromium.launch(
        headless=True,
        executable_path=shutil.which('chromium') or None,
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
        settings = page.locator('.arcadeHomeHeader [data-action="navSettings"]')
        assert settings.count() == 1, (device, 'Settings gear is missing from Home')
        settings.click()
        about = page.locator('.navScreen [data-action="navAbout"]')
        assert about.count() == 1, (device, 'About opener is missing from Settings')
        about.click()
        assert page.locator('.heading').inner_text() == 'ABOUT SUPERMAGIC FOOTBALL'
        page.locator('button[data-action="navSettings"]').first.click()
        assert page.locator('.navScreen').count() == 1, (device, 'Back did not return to Settings')
        assert about.evaluate('(node)=>node===document.activeElement'), (device, 'Settings did not restore focus to About')
        page.locator('.navBack[data-action="home"]').click()
        assert page.locator('.navMainList').count() == 1, (device, 'Back did not return to Home')
        assert page.locator('.arcadeHomeHeader [data-action="navSettings"]').evaluate('(node)=>node===document.activeElement'), (device, 'Home did not restore focus to Settings')
        assert not errors, (device, errors)
        print('UX26_HOME_RETURN_FOCUS_BROWSER_PASS', device, flush=True)
        context.close()
    browser.close()
