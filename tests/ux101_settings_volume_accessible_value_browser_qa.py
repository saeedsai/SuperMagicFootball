#!/usr/bin/env python3
"""UX-101: Sound sliders announce their live percentage in desktop and touch Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_settings

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build the current game fixture first'
html = fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    for device, viewport, touch in [
        ('desktop', {'width': 1280, 'height': 720}, False),
        ('simulated-touch', {'width': 390, 'height': 844}, True),
    ]:
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(html, wait_until='load')
        open_settings(page, 'sound')
        slider = page.locator('#audio_master')
        assert slider.get_attribute('aria-valuetext') == slider.input_value() + '%', device
        assert slider.get_attribute('aria-label') == 'master volume', device
        assert slider.evaluate('(el) => el.getBoundingClientRect().width >= 240'), device
        slider.focus()
        page.keyboard.press('ArrowRight')
        value = slider.input_value() + '%'
        assert slider.get_attribute('aria-valuetext') == value, (device, 'range accessible value did not follow keyboard change')
        assert page.locator('#audio_masterValue').inner_text() == value, (device, 'visible value did not follow keyboard change')
        print('UX101_SETTINGS_VOLUME_ACCESSIBLE_VALUE_PASS', device, value)
        assert not errors, (device, errors)
        context.close()
    browser.close()
