"""Legacy Cup history must remain inert when imported scores contain markup."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
participants = [0, 1, 2, 3]
row = {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'pts': 0}
campaign = {
    'id': 'cup_UEFA', 'compId': 'UEFA', 'club': 0, 'participants': participants,
    'phase': 'league', 'roundIdx': 0,
    'history': [{'kind': 'league', 'a': 0, 'b': 1, 'round': 1,
                 'scoreA': '<img id="cup-score-xss" src=x onerror="window.__cupXss=1">', 'scoreB': 0}],
    'rounds': [[]], 'groups': [], 'table': {str(team): row for team in participants},
    'earned': 0, 'winner': None, 'knockout': None,
}

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}'

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        for label, mobile, viewport in [
            ('desktop', False, {'width': 1360, 'height': 800}),
            ('simulated-touch', True, {'width': 844, 'height': 390}),
        ]:
            context = browser.new_context(viewport=viewport, is_mobile=mobile, has_touch=mobile, service_workers='block')
            context.add_init_script(
                "window.__cupXss=0;localStorage.setItem('legend_continentalRun'," +
                json.dumps(json.dumps(campaign, separators=(',', ':'))) + ");"
            )
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(origin + '/tests/.generated/play.html', wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
            assert page.evaluate('Boolean(SupermagicFootball.getContinental())'), (label, 'legacy campaign was not restored')
            page.locator('[data-action="navCups"]').first.click()
            page.locator('[data-action="navClubs"]').first.click()
            page.locator('[data-action="continents"]').first.click()
            page.locator('[data-action="continentContinue"]').first.click()
            assert page.locator('#cup-score-xss').count() == 0, (label, 'score markup became an element')
            assert page.evaluate('window.__cupXss') == 0, (label, 'score markup executed')
            archive_text = page.locator('.scroll .stat').first.inner_text()
            assert '—–0' in archive_text, (label, archive_text)
            assert not errors, (label, errors)
            print('CUP_HISTORY_MARKUP_SAFE_PASS', label, archive_text, flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
