#!/usr/bin/env python3
"""VIZ-02 team-picker live result announcements in desktop and touch Chromium."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
from menu_test_routes import open_quick

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
        page.evaluate("""() => {
          const db = new Map();
          Object.defineProperty(window, 'localStorage', {configurable:true, value:{
            getItem:key=>db.get(key)||null, setItem:(key,value)=>db.set(key,String(value)),
            removeItem:key=>db.delete(key), clear:()=>db.clear()
          }});
        }""")
        page.set_content(html, wait_until='load')
        page.wait_for_function('!!window.NekketsuHD', timeout=60000)
        open_quick(page)

        toggle = page.locator('[data-team-browse="homeTeam"]')
        toggle.click()
        assert toggle.get_attribute('aria-expanded') == 'true', (device, 'picker did not open')
        status = page.locator('#homeTeamResultsStatus')
        initial = status.inner_text()
        assert re.fullmatch(r'\d+ teams found\. Showing the first 60; refine your search to narrow the list\.', initial), (device, initial)

        search = page.locator('#homeTeamSearch')
        search.fill('no-such-supermagic-team-xyz')
        assert status.inner_text() == 'No teams found.', (device, status.inner_text())
        assert page.locator('#homeTeamResults [role="option"]').count() == 0

        search.fill('')
        assert status.inner_text() == initial, (device, status.inner_text(), initial)
        options = page.locator('#homeTeamResults [role="option"]')
        assert options.count() > 0, (device, 'clearing search did not restore options')
        first = options.first
        team_id = first.get_attribute('data-team-id')
        search.focus()
        page.keyboard.press('ArrowDown')
        assert page.evaluate('document.activeElement?.getAttribute("data-team-id")') == team_id, (device, 'Down from search did not enter results')
        page.keyboard.press('Escape')
        assert toggle.evaluate('(node)=>node===document.activeElement'), (device, 'Escape did not restore picker focus')
        assert toggle.get_attribute('aria-expanded') == 'false', (device, 'Escape did not close picker')

        toggle.click()
        first = page.locator('#homeTeamResults [role="option"]').first
        team_id = first.get_attribute('data-team-id')
        first.click()
        assert page.locator('#homeTeam').input_value() == team_id, (device, 'selection did not update native team control')
        assert not errors, (device, errors)
        print('VIZ02_TEAM_PICKER_LIVE_STATUS_BROWSER_PASS', device)
        context.close()
    browser.close()

