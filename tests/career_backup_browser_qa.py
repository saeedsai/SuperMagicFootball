"""SAVE-103 Career backup UI acceptance on desktop and simulated touch Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
TEAM_TWO_NAME = json.loads((ROOT / 'data/teams.json').read_text(encoding='utf8'))[2]['name']

def career(club, name):
    members = [club, 1]
    return {
        'club': club, 'season': 3, 'week': 2, 'members': members,
        'fixtures': [[[club, 1]]], 'history': [], 'lastResult': None,
        # Career UI startup builds a default tactical plan from the saved roster;
        # provide the game's required 2 GK / 3 DF / 4 MF / 3 FW roles here.
        'roster': [
            {'id': f'{name}-{i}', 'name': f'Player {i}', 'role': role, 'num': i + 1}
            for i, role in enumerate(['GK', 'GK', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW'])
        ],
        'table': {str(i): {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'pts': 0} for i in members},
        'facilities': {'training': 1}, 'cup': {'stage': 0}, 'cash': 100,
    }

def vault(active, slots):
    return {'schema': 1, 'active': active, 'slots': slots}

def career_slot(club, name):
    return {'name': name, 'savedAt': '2026-11-01T12:00:00.000Z', 'career': career(club, name)}

def backup(state):
    payload = json.dumps(state, separators=(',', ':'), ensure_ascii=False)
    checksum = 2166136261
    for char in payload:
        checksum ^= ord(char)
        checksum = (checksum * 16777619) & 0xffffffff
    envelope = {'format': 'smf-career-backup', 'version': 1, 'payload': payload, 'checksum': f'{checksum:08x}'}
    return json.dumps(envelope, separators=(',', ':'), ensure_ascii=False).encode('utf8')

local_state = vault(1, [career_slot(0, 'Local Career')] + [None] * 9)
external_state = vault(3, [None, None, career_slot(2, 'Restored Career')] + [None] * 7)
bad_state = vault(2, [None, career_slot(2, 'Bad Team Reference')] + [None] * 8)
bad_state['slots'][1]['career']['members'] = [2, 999]
external_bytes = backup(external_state)
bad_bytes = backup(bad_state)

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
origin = f'http://127.0.0.1:{server.server_port}'

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        for label, mobile in [('desktop', False), ('simulated-touch', True)]:
            context = browser.new_context(
                viewport={'width': 1360, 'height': 800} if not mobile else {'width': 844, 'height': 390},
                is_mobile=mobile, has_touch=mobile, accept_downloads=True,
            )
            context.add_init_script("localStorage.setItem('legend_careerSlots', "+json.dumps(json.dumps(local_state, separators=(',', ':')))+");")
            page = context.new_page()
            errors, confirms, alerts = [], [], []
            decision = {'accept': False}
            def handle_dialog(dialog):
                if dialog.type == 'confirm':
                    confirms.append(dialog.message)
                    if decision['accept']:
                        dialog.accept()
                    else:
                        dialog.dismiss()
                else:
                    alerts.append(dialog.message)
                    dialog.dismiss()
            page.on('dialog', handle_dialog)
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(origin + '/tests/.generated/play.html', wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)

            def click(action):
                page.locator('[data-action="' + action + '"]').first.click(timeout=30000)

            click('navSettings')
            click('navSaveManagement')
            assert page.locator('[data-action="careerBackupExport"]').count() == 1, (label, 'export control')
            assert page.locator('[data-action="careerBackupImport"]').count() == 1, (label, 'import control')

            with page.expect_download() as download_info:
                click('careerBackupExport')
            download = download_info.value
            assert download.suggested_filename.startswith('Supermagic_Career_Backup_'), (label, download.suggested_filename)
            exported = json.loads(Path(download.path()).read_text(encoding='utf8'))
            assert exported['format'] == 'smf-career-backup', (label, 'exported Career-only envelope')
            assert json.loads(exported['payload'])['slots'][0]['name'] == 'Local Career', (label, 'legacy/current slot included')

            before = page.evaluate("localStorage.getItem('legend_careerSlots')")
            decision['accept'] = False
            page.locator('#careerBackupImportFile').set_input_files({'name': 'Career_Backup.json', 'mimeType': 'application/json', 'buffer': external_bytes})
            page.wait_for_function("document.querySelector('#careerBackupPreview')?.textContent.includes('Import cancelled')", timeout=10000)
            assert len(confirms) == 1, (label, 'import asks for explicit overwrite')
            assert 'Import 1 Career saves? Active slot: 3' in confirms[-1], (label, confirms[-1])
            assert 'REPLACE all 1 local Career saves' in confirms[-1], (label, confirms[-1])
            preview = page.locator('#careerBackupPreview').inner_text()
            assert 'Restored Career' in preview and TEAM_TWO_NAME in preview, (label, preview)
            assert page.evaluate("localStorage.getItem('legend_careerSlots')") == before, (label, 'Cancel preserves all local slots')

            decision['accept'] = True
            page.locator('#careerBackupImportFile').set_input_files({'name': 'Career_Backup.json', 'mimeType': 'application/json', 'buffer': external_bytes})
            page.wait_for_function("document.querySelector('#careerBackupPreview')?.textContent.includes('Imported 1 Career saves')", timeout=10000)
            restored = json.loads(page.evaluate("localStorage.getItem('legend_careerSlots')"))
            assert restored['active'] == 3 and restored['slots'][0] is None, (label, 'ten-slot active selection imported')
            assert restored['slots'][2]['name'] == 'Restored Career', (label, 'restored vault data')
            mirrored = json.loads(page.evaluate("localStorage.getItem('legend_managerCareer')"))
            assert mirrored['club'] == 2, (label, 'legacy managerCareer mirror follows occupied active slot')

            before_invalid = page.evaluate("localStorage.getItem('legend_careerSlots')")
            confirm_count = len(confirms)
            alert_count = len(alerts)
            page.locator('#careerBackupImportFile').set_input_files({'name': 'Bad_Backup.json', 'mimeType': 'application/json', 'buffer': bad_bytes})
            page.wait_for_function("document.querySelector('#careerBackupImportFile').value === ''", timeout=10000)
            assert len(confirms) == confirm_count, (label, 'invalid team references rejected before confirm')
            assert len(alerts) == alert_count + 1 and 'unavailable teams' in alerts[-1], (label, alerts)
            assert page.evaluate("localStorage.getItem('legend_careerSlots')") == before_invalid, (label, 'invalid backup leaves vault unchanged')
            assert not errors, (label, errors)
            print('CAREER_BACKUP_BROWSER_PASS', label, 'export, preview, overwrite Cancel/accept, active slot + legacy mirror, invalid-team rejection', flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
