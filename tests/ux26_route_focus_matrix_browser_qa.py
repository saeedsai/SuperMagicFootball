#!/usr/bin/env python3
"""UX26: route entry and Back/Escape return focus across menu categories."""
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
        errors = []
        dialogs = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('dialog', lambda dialog: (dialogs.append(dialog.message), dialog.dismiss()))
        page.set_content(html, wait_until='load')

        settings = page.locator('.arcadeHomeHeader [data-action="navSettings"]')
        settings.click()
        for action, heading, focus_selector in [
            ('navGameSettings', 'GAME SETTINGS', 'h1.heading'),
            ('navGraphics', 'GRAPHICS', 'h1.heading'),
            ('navSound', 'SOUND', 'h1.heading'),
            ('navSaveManagement', 'SAVE MANAGEMENT', '.navChoice'),
        ]:
            opener = page.locator(f'[data-action="{action}"]')
            opener.click()
            destination = page.locator('h1.heading')
            assert destination.inner_text() == heading, (device, action, destination.inner_text())
            route_focus = page.locator(focus_selector).first
            assert route_focus.evaluate('(node)=>node===document.activeElement'), (device, action, 'route entry focus')
            page.keyboard.press('Escape')
            assert page.locator('.navScreen').count() == 1, (device, action, 'Escape did not return to Settings')
            assert opener.evaluate('(node)=>node===document.activeElement'), (device, action, 'Escape did not restore route opener')

        page.locator('[data-action="navCustomization"]').click()
        studio_opener = page.locator('[data-action="playerStudio"]')
        studio_opener.click()
        assert page.locator('h1.heading').inner_text() == 'PLAYER CUSTOMIZATION'
        assert page.locator('h1.heading').evaluate('(node)=>node===document.activeElement'), (device, 'Studio route entry focus')
        page.keyboard.press('Escape')
        assert not dialogs, (device, 'pristine Studio incorrectly prompted to discard edits', dialogs)
        assert page.locator('.navScreen h1.heading').inner_text() == 'PLAYER & TEAM CUSTOMIZATION'
        assert studio_opener.evaluate('(node)=>node===document.activeElement'), (device, 'Studio Escape did not restore its opener')
        studio_opener.click()
        page.locator('[data-action="navCustomization"]').first.click()
        assert not dialogs, (device, 'pristine Studio Back incorrectly prompted to discard edits', dialogs)
        assert studio_opener.evaluate('(node)=>node===document.activeElement'), (device, 'Studio Back did not restore its opener')

        assert not errors, (device, errors)
        print('UX26_ROUTE_FOCUS_MATRIX_BROWSER_PASS', device, 'Settings game/graphics/sound/save Escape, Player Studio Escape and Back', flush=True)
        context.close()
    browser.close()
