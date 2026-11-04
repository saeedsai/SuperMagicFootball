#!/usr/bin/env python3
"""UX26: controls help practice buttons respond to keyboard and simulated touch."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

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
        ('portrait-touch', {'width': 390, 'height': 844}, True),
        ('narrow-touch', {'width': 320, 'height': 640}, True),
    ]:
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(html, wait_until='load')
        open_feature(page, 'help')
        checks = page.locator('[data-help-practice]')
        assert checks.count() == 4, (device, 'expected one practice button for each core action')
        status = page.locator('#touchHelpPracticeStatus')
        guided = page.locator('#guidedCrossStatus')
        assert status.get_attribute('aria-live') == 'polite'
        assert status.get_attribute('aria-atomic') == 'true'
        assert status.inner_text() == '0 of 4 touch controls checked.'
        assert guided.inner_text() == 'Step 1 of 2: press JUMP, then PASS while airborne.'
        layout = page.evaluate("""() => {
          const buttons=[...document.querySelectorAll('[data-help-practice]')];
          const rects=buttons.map(button=>{const r=button.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};});
          const overlaps=rects.some((a,i)=>rects.slice(i+1).some(b=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y));
          return {width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,rects,overlaps};
        }""")
        assert layout['scrollWidth'] <= layout['width'], (device, 'horizontal overflow', layout)
        assert not layout['overlaps'], (device, 'practice buttons overlap', layout)
        assert all(rect['w'] >= 44 and rect['h'] >= 44 for rect in layout['rects']), (device, 'undersized action target', layout)

        if touch:
            jump = page.locator('[data-help-practice="jump"]')
            pass_action = page.locator('[data-help-practice="pass"]')
            jump.tap()
            assert jump.get_attribute('aria-pressed') == 'true'
            assert 'JUMP registered. Step 2 of 2: PASS' in guided.inner_text()
            pass_action.tap()
            assert pass_action.get_attribute('aria-pressed') == 'true'
            assert guided.inner_text() == 'Cross practice complete. In a match, press JUMP, then PASS while airborne.'
            for action in ['shoot', 'dribble']:
                page.locator(f'[data-help-practice="{action}"]').tap()
            assert status.inner_text() == 'All 4 touch actions responded; touch input is ready.'
        else:
            page.keyboard.press('Space')
            assert 'JUMP registered. Step 2 of 2: PASS' in guided.inner_text()
            page.keyboard.press('k')
            assert guided.inner_text() == 'Cross practice complete. In a match, press JUMP, then PASS while airborne.'
            assert status.inner_text() == '0 of 4 touch controls checked.', 'keyboard practice must not claim touch buttons were tested'
        assert page.locator('[data-action="kickoff"]').count() == 0, (device, 'help check must not start a match')
        assert not errors, (device, errors)
        print('UX26_TOUCH_HELP_PRACTICE_BROWSER_PASS', device)
        context.close()
    browser.close()
