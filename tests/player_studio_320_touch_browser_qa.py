#!/usr/bin/env python3
"""VIZ-05 narrow-touch Player Studio controls and fieldset fit at 320x568."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/.generated/play.html'
assert FIXTURE.exists(), 'Build the current modular fixture first'
HTML = FIXTURE.read_text(encoding='utf-8')
SCREENSHOT = ROOT / 'tests/.generated/player_studio_320x568.png'

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox', '--disable-dev-shm-usage'])
    context = browser.new_context(viewport={'width': 320, 'height': 568}, is_mobile=True, has_touch=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(HTML, wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game')
    open_feature(page, 'playerStudio')

    groups = page.locator('.studioControlGroup')
    assert groups.count() == 4, 'Expected all four native Player Studio fieldsets'
    fields = page.locator('.avatarControls select[id^="face_"]')
    assert fields.count() == 17, 'Expected two palette selectors and all fifteen appearance selectors'
    for field in fields.all():
        label_name = field.get_attribute('aria-label') or field.evaluate(
            "el=>el.labels?.[0]?.firstChild?.textContent?.trim()||''"
        )
        assert label_name, (field.get_attribute('id'), 'select has no accessible name')
        named_control = page.get_by_role('combobox', name=label_name, exact=True)
        assert named_control.count() == 1, (field.get_attribute('id'), label_name, 'accessible name does not resolve uniquely')

        box = field.bounding_box()
        host = field.locator('xpath=ancestor::fieldset[1]').bounding_box()
        assert box and host, (field.get_attribute('id'), 'missing geometry')
        assert box['height'] >= 44, (field.get_attribute('id'), 'touch target below 44px', box)
        assert box['x'] >= host['x'] - 0.5 and box['y'] >= host['y'] - 0.5, (field.get_attribute('id'), 'field begins outside its group', box, host)
        assert box['x'] + box['width'] <= host['x'] + host['width'] + 1, (field.get_attribute('id'), 'field exceeds its group width', box, host)
        assert box['y'] + box['height'] <= host['y'] + host['height'] + 1, (field.get_attribute('id'), 'field exceeds its group height', box, host)

    page.locator('#face_skin').scroll_into_view_if_needed()
    page.screenshot(path=str(SCREENSHOT))
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'Document has horizontal page overflow'
    assert page.evaluate('document.body.scrollWidth <= innerWidth + 1'), 'Body has horizontal page overflow'
    assert page.locator('.menubox').evaluate('(e)=>e.scrollWidth <= e.clientWidth + 2'), 'Player Studio menu has horizontal overflow'
    assert not errors, errors
    print('PLAYER_STUDIO_320_TOUCH_PASS 320x568: 17 named selectors, >=44px targets, fieldset bounds, no horizontal overflow/errors')
    print('PLAYER_STUDIO_320_SCREENSHOT', SCREENSHOT)
    context.close()
    browser.close()
