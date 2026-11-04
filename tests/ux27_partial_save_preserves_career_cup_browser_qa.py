#!/usr/bin/env python3
"""UX27/SAVE-103: partial general imports preserve Career/Cup state on desktop and touch."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright
from menu_test_routes import open_settings

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/.generated/play.html'
assert FIXTURE.exists(), 'Build the current game fixture first'
FIXTURE_HTML = FIXTURE.read_bytes()
UEFA_TEAMS = json.loads((ROOT / 'data/continental_mapping.json').read_text(encoding='utf-8'))['UEFA']


def career(label):
    members = [0, 1]
    return {
        'club': 0, 'season': 4, 'week': 3, 'members': members,
        'fixtures': [[[0, 1]]], 'history': [], 'lastResult': None,
        'roster': [
            {'id': f'{label}-{i}', 'name': f'{label} Player {i}', 'role': role, 'num': i + 1}
            for i, role in enumerate(['GK', 'GK', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW'])
        ],
        'table': {str(i): {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'pts': 0} for i in members},
        'facilities': {'training': 1}, 'cup': {'stage': 0}, 'cash': 123456,
    }


def tournament(club):
    participants = UEFA_TEAMS
    opponent = participants[(participants.index(club) + 1) % len(participants)]
    row = {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'pts': 0}
    return {
        'id': 'cup_UEFA', 'compId': 'UEFA', 'club': club, 'participants': participants,
        'phase': 'league', 'roundIdx': 2, 'history': [],
        'rounds': [[[club, opponent]]] * 3, 'groups': [participants],
        'table': {str(team): dict(row) for team in participants},
        'earned': 0, 'winner': None, 'knockout': None,
    }


def save_envelope(data):
    return json.dumps({
        'product': 'Supermagic Football', 'version': '0.12.37.0',
        'exportedAt': '2026-11-02T00:00:00.000Z', 'data': data,
    }, separators=(',', ':')).encode('utf-8')


def seed_script():
    career_slot = {
        'name': 'Preserved Career', 'savedAt': '2026-11-02T00:00:00.000Z',
        'career': career('Preserved Career'),
    }
    career_vault = {'schema': 1, 'active': 1, 'slots': [career_slot] + [None] * 9}
    cup_slot = {
        'name': 'Preserved Cup', 'savedAt': '2026-11-02T00:00:00.000Z',
        'tournament': tournament(UEFA_TEAMS[0]),
    }
    cup_vault = {'schema': 1, 'active': 1, 'slots': [cup_slot] + [None] * 9}
    legacy_career = career('Legacy Career Mirror')
    legacy_cup = tournament(UEFA_TEAMS[0])
    values = {
        'legend_careerSlots': career_vault,
        'legend_managerCareer': legacy_career,
        'legend_cupSlots': cup_vault,
        'legend_continentalRun': legacy_cup,
    }
    return """(() => {
      if (sessionStorage.getItem('__ux27PartialCareerCupSeeded')) return;
      const values = %s;
      for (const [key, value] of Object.entries(values))
        localStorage.setItem(key, JSON.stringify(value));
      sessionStorage.setItem('__ux27PartialCareerCupSeeded', '1');
    })();""" % json.dumps(values, separators=(',', ':'))


class FixtureHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path in ('/', '/index.html'):
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(FIXTURE_HTML)))
            self.end_headers()
            self.wfile.write(FIXTURE_HTML)
            return
        super().do_GET()

    def log_message(self, *_args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(FixtureHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}/'
PRESERVED_KEYS = [
    'legend_careerSlots', 'legend_managerCareer',
    'legend_cupSlots', 'legend_continentalRun',
]
PARTIAL_IMPORTS = [
    # Vault sections are explicit null; their legacy mirrors are omitted.
    ('null-vaults-omitted-mirrors', {
        'careerSlots': None, 'cupSlots': None, 'options': {'ballModel': 'meteor'},
    }, 'meteor'),
    # Legacy mirror sections are explicit null; their slot vaults are omitted.
    ('omitted-vaults-null-mirrors', {
        'managerCareer': None, 'continentalRun': None, 'options': {'ballModel': 'classic'},
    }, 'classic'),
]


def snapshot(page):
    return page.evaluate('(keys) => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]))', PRESERVED_KEYS)


def run_device(browser, label, viewport, touch):
    context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
    context.add_init_script(seed_script())
    page = context.new_page()
    errors, dialogs = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def accept_dialog(dialog):
        dialogs.append((dialog.type, dialog.message))
        dialog.accept()

    page.on('dialog', accept_dialog)
    page.goto(origin, wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
    open_settings(page, 'save')
    assert page.locator('#saveImportFile').count() == 1, (label, 'general Import Save control missing')
    baseline = snapshot(page)
    assert all(isinstance(value, str) and value for value in baseline.values()), (label, 'fixture keys not initialized', baseline)

    for scenario, data, expected_ball in PARTIAL_IMPORTS:
        dialogs.clear()
        document_time_origin = page.evaluate('performance.timeOrigin')
        envelope = save_envelope(data)
        # The import must perform a real page reload. A fresh Navigation Timing
        # timeOrigin is independent of Playwright's load-event timing, which can
        # vary substantially for the several-megabyte fixture on touch Chromium.
        page.locator('#saveImportFile').set_input_files({
            'name': f'{scenario}.json', 'mimeType': 'application/json', 'buffer': envelope,
        })
        try:
            page.wait_for_function(
                '(before) => performance.timeOrigin > before',
                arg=document_time_origin, timeout=30000,
            )
        except Exception:
            state = page.evaluate("""() => ({timeOrigin:performance.timeOrigin,
              navigationType:performance.getEntriesByType('navigation')[0]?.type,
              game:!!window.SupermagicFootball?.game,
              heading:document.querySelector('.heading')?.textContent,
              fileInput:!!document.querySelector('#saveImportFile')})""")
            raise AssertionError((label, scenario, 'import did not trigger reload',
                                  document_time_origin, state, dialogs, errors))
        # Navigation has occurred; separately wait for the modular bundle to
        # finish executing before taking snapshots or importing the next case.
        page.wait_for_load_state('domcontentloaded', timeout=30000)
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
        after = snapshot(page)
        assert after == baseline, (label, scenario, 'omitted/null Career or Cup values changed stored bytes', baseline, after)
        assert page.evaluate("JSON.parse(localStorage.getItem('legend_options')).ballModel") == expected_ball, (label, scenario, 'partial import did not apply included section')
        assert any(kind == 'confirm' for kind, _ in dialogs), (label, scenario, 'valid partial import was not confirmed', dialogs)
        assert any(kind == 'alert' and message.startswith('Save imported') for kind, message in dialogs), (label, scenario, 'partial import did not report success', dialogs)
        open_settings(page, 'save')

    assert not errors, (label, errors)
    print('UX27_PARTIAL_CAREER_CUP_PRESERVE_PASS', label, flush=True)
    context.close()


try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True, executable_path='/usr/bin/chromium',
            args=['--no-sandbox', '--disable-dev-shm-usage'],
        )
        run_device(browser, 'desktop', {'width': 1280, 'height': 800}, False)
        run_device(browser, 'simulated-touch', {'width': 844, 'height': 390}, True)
        browser.close()
finally:
    server.shutdown()
    server.server_close()
