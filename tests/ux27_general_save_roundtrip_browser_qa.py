#!/usr/bin/env python3
"""UX27: general Export All Saves / Import Save roundtrip on desktop and touch."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
import tempfile
import time
from playwright.sync_api import sync_playwright
from menu_test_routes import open_settings

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/.generated/play.html'
assert FIXTURE.exists(), 'Build the current game fixture first'
FIXTURE_HTML = FIXTURE.read_bytes()
INITIAL_ROSTER = json.loads((ROOT / 'data/players/arcade.json').read_text(encoding='utf-8'))['japan']
INITIAL_ROSTER[0]['name'] = 'Saved Backup Athlete'
SEED = {'options': {'ballModel': 'tricolore'}, 'edits': {'japan': INITIAL_ROSTER},
        'tokenWallet': {'schema': 1, 'tokens': 245, 'unlocks': ['superShot:banana'], 'receipts': ['career-receipt-0001']}}
SAVE_KEYS = [
    'customClubs', 'managerCareer', 'careerSlots', 'cupSlots', 'continentalRun',
    'options', 'league', 'lineup', 'edits', 'teamPlans', 'controllerBindings',
    'kitSelections', 'audioOptions', 'tokenWallet',
]


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


def snapshot(page):
    return page.evaluate("""() => Object.fromEntries(
      Object.keys(localStorage).filter(key=>key.startsWith('legend_')).sort()
        .map(key=>[key,localStorage.getItem(key)])
    )""")

def wallet_snapshot(page):
    return page.evaluate("""async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('smf-token-wallet');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        const tx = db.transaction(['wallet', 'receipts'], 'readonly');
        const get = request => new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const [row, rows] = await Promise.all([
          get(tx.objectStore('wallet').get('main')),
          get(tx.objectStore('receipts').getAll()),
        ]);
        return {schema: 2, tokens: row.tokens, unlocks: row.unlocks, receipts: rows.map(x => x.id).sort()};
      } finally { db.close(); }
    }""")


def wait_for_dialog_count(page, events, count, device, filename):
    deadline = time.monotonic() + 8
    while len(events) < count and time.monotonic() < deadline:
        page.wait_for_timeout(50)
    assert len(events) >= count, (device, filename, 'timed out waiting for import dialog', events)


try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        for device, viewport, touch in [
            ('desktop', {'width': 1280, 'height': 800}, False),
            ('simulated-touch', {'width': 844, 'height': 390}, True),
        ]:
            context = browser.new_context(
                accept_downloads=True, viewport=viewport, is_mobile=touch, has_touch=touch
            )
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            dialog_events = []
            accept_dialogs = [True]

            def handle_dialog(dialog):
                dialog_events.append((dialog.type, dialog.message))
                dialog.accept() if accept_dialogs[0] else dialog.dismiss()

            page.on('dialog', handle_dialog)
            downloads = []
            page.on('download', lambda download: downloads.append(download.suggested_filename))
            seed_json = json.dumps(SEED, ensure_ascii=False)
            context.add_init_script(f"""(() => {{
              if (sessionStorage.getItem('__ux27SaveSeeded')) return;
              const seed={seed_json};
              for (const [key,value] of Object.entries(seed))
                localStorage.setItem('legend_'+key, JSON.stringify(value));
              sessionStorage.setItem('__ux27SaveSeeded','1');
            }})();""")
            page.goto(origin, wait_until='load')
            open_settings(page, 'save')

            assert page.locator('[data-action="exportSave"]').count() == 1
            assert page.locator('[data-action="importSave"]').count() == 1
            original_audio_raw = page.evaluate("localStorage.getItem('legend_audioOptions')")
            page.evaluate("localStorage.setItem('legend_audioOptions', '{broken')")
            dialog_events.clear()
            page.locator('[data-action="exportSave"]').click()
            assert any(kind == 'alert' and 'Could not export save' in message and 'audioOptions' in message
                       for kind, message in dialog_events), (device, dialog_events)
            assert not downloads, f'{device}: malformed storage produced a misleading backup download'
            assert page.evaluate("localStorage.getItem('legend_audioOptions')") == '{broken', \
                f'{device}: refusing export must leave the original malformed bytes untouched'
            page.evaluate("raw => raw === null ? localStorage.removeItem('legend_audioOptions') : localStorage.setItem('legend_audioOptions', raw)", original_audio_raw)
            with page.expect_download() as pending_download:
                page.locator('[data-action="exportSave"]').click()
            download = pending_download.value
            export_path = Path(download.path())
            exported = json.loads(export_path.read_text(encoding='utf-8'))
            assert exported['product'] == 'Supermagic Football'
            assert len(exported['version'].split('.')) == 4
            assert list(exported['data']) == SAVE_KEYS, (device, list(exported['data']))
            assert exported['data']['options']['ballModel'] == 'tricolore'
            assert exported['data']['edits']['japan'][0]['name'] == 'Saved Backup Athlete'
            assert exported['data']['tokenWallet'] == {
                'schema': 2, 'tokens': 245, 'unlocks': ['superShot:banana'],
                'receipts': ['career-receipt-0001'],
            }

            # Keep a saved selected option and one edited roster record so import
            # proves that player-facing and edited team data survive a real reload.
            before = snapshot(page)
            options_key = 'legend_options'
            edits_key = 'legend_edits'
            wallet_key = 'legend_tokenWallet'
            original_options = json.loads(before[options_key])
            original_edits = json.loads(before[edits_key])
            changed_options = {**original_options, 'ballModel': 'meteor'}
            changed_edits = json.loads(json.dumps(original_edits))
            changed_edits.setdefault('japan', [])[0]['name'] = 'Temporary Imported-Roundtrip Marker'
            changed_wallet = {'schema': 1, 'tokens': 3, 'unlocks': [], 'receipts': []}
            page.evaluate("""([options, edits, wallet]) => {
              localStorage.setItem('legend_options', JSON.stringify(options));
              localStorage.setItem('legend_edits', JSON.stringify(edits));
              localStorage.setItem('legend_tokenWallet', JSON.stringify(wallet));
            }""", [changed_options, changed_edits, changed_wallet])
            page.reload(wait_until='load')
            open_settings(page, 'save')
            before_cancel = snapshot(page)

            dialog_events.clear()
            accept_dialogs[0] = False
            page.locator('#saveImportFile').set_input_files({
                'name': 'saved-roundtrip.json', 'mimeType': 'application/json',
                'buffer': json.dumps(exported).encode('utf-8'),
            })
            wait_for_dialog_count(page, dialog_events, 1, device, 'cancelled import')
            assert any(kind == 'confirm' for kind, _ in dialog_events), (device, dialog_events)
            assert snapshot(page) == before_cancel, f'{device}: cancelling import changed localStorage'

            for name, content in [
                ('malformed.json', b'{"product":'),
                ('oversized.json', b' ' * (64 * 1024 * 1024 + 1)),
            ]:
                dialog_events.clear()
                accept_dialogs[0] = True
                if name == 'oversized.json':
                    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as oversized:
                        oversized.write(content)
                        oversized_path = Path(oversized.name)
                    try:
                        page.locator('#saveImportFile').set_input_files(str(oversized_path))
                    finally:
                        oversized_path.unlink(missing_ok=True)
                else:
                    page.locator('#saveImportFile').set_input_files({
                        'name': name, 'mimeType': 'application/json', 'buffer': content,
                    })
                wait_for_dialog_count(page, dialog_events, 1, device, name)
                assert any(kind == 'alert' and 'Could not import' in message
                           for kind, message in dialog_events), (device, name, dialog_events)
                assert not any(kind == 'confirm' for kind, _ in dialog_events), (device, name, dialog_events)
                assert snapshot(page) == before_cancel, f'{device}: {name} changed localStorage'

            dialog_events.clear()
            accept_dialogs[0] = True
            with page.expect_navigation(wait_until='load', timeout=8000):
                page.locator('#saveImportFile').set_input_files({
                    'name': 'saved-roundtrip.json', 'mimeType': 'application/json',
                    'buffer': json.dumps(exported).encode('utf-8'),
                })
            page.wait_for_function("Boolean(window.SupermagicFootball)", timeout=5000)
            restored = snapshot(page)
            assert json.loads(restored[options_key]) == original_options
            assert json.loads(restored[edits_key]) == original_edits
            assert json.loads(restored[wallet_key]) == SEED['tokenWallet']
            assert wallet_snapshot(page) == exported['data']['tokenWallet']
            assert page.evaluate("JSON.parse(localStorage.getItem('legend_options')).ballModel") == 'tricolore'
            assert page.evaluate("JSON.parse(localStorage.getItem('legend_edits')).japan[0].name") == 'Saved Backup Athlete'
            assert any(kind == 'confirm' for kind, _ in dialog_events), (device, dialog_events)
            assert any(kind == 'alert' and 'Save imported' in message
                       for kind, message in dialog_events), (device, dialog_events)
            assert not errors, (device, errors)
            print('UX27_GENERAL_SAVE_ROUNDTRIP_BROWSER_PASS', device)
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
