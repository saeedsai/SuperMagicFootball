"""SAVE-103 Cup empty-active-slot no-resurrection browser smoke (isolated same-origin fixtures)."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

def cup(club, label):
    participants = [club, 3, 4, 5]
    return {
        'id': 'cup_UEFA', 'compId': 'UEFA', 'club': club, 'participants': participants,
        'phase': 'league', 'roundIdx': 2, 'history': [], 'rounds': [], 'groups': [],
        'table': {str(team): {} for team in participants}, 'earned': 0, 'winner': None,
        'knockout': None, 'label': label,
    }

vault = {'schema': 1, 'active': 1, 'slots': [None] * 10}
legacy = cup(1, 'Legacy campaign')
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}'

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for label, mobile, viewport in [
            ('desktop', False, {'width': 1360, 'height': 800}),
            ('simulated-touch', True, {'width': 844, 'height': 390}),
        ]:
            context = browser.new_context(viewport=viewport, is_mobile=mobile, has_touch=mobile, service_workers='block')
            context.add_init_script(
                "localStorage.setItem('legend_cupSlots', " + json.dumps(json.dumps(vault, separators=(',', ':'))) + ");"
                "localStorage.setItem('legend_continentalRun', " + json.dumps(json.dumps(legacy, separators=(',', ':'))) + ");"
            )
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(origin + '/tests/.generated/play.html', wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
            assert page.evaluate('window.SupermagicFootball.getContinental()') is None, (label, 'empty active Cup slot must win over stale legacy mirror')
            legacy_bytes = page.evaluate("localStorage.getItem('legend_continentalRun')")
            assert json.loads(legacy_bytes)['label'] == 'Legacy campaign', (label, 'legacy bytes remain recoverable')
            page.locator('[data-action="navCups"]').first.click()
            page.locator('[data-action="navClubs"]').first.click()
            page.locator('[data-action="continents"]').first.click()
            assert page.get_by_text('Continue Saved Tournament', exact=True).count() == 0, (label, 'no stale continue control shown')
            page.reload(wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
            assert page.evaluate('window.SupermagicFootball.getContinental()') is None, (label, 'no resurrection after reload')
            assert page.evaluate("localStorage.getItem('legend_continentalRun')") == legacy_bytes, (label, 'legacy mirror remains untouched')
            assert not errors, (label, errors)
            print('CUP_EMPTY_ACTIVE_RESTORE_PASS', label, 'vault authoritative; stale legacy campaign hidden; mirror preserved', flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()

