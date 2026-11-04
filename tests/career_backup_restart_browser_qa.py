"""SAVE-103 restart acceptance using isolated same-origin localStorage and Chromium reloads."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CONTINENTAL_MAPPING = json.loads((ROOT / 'data/continental_mapping.json').read_text(encoding='utf8'))
UEFA_TEAMS = CONTINENTAL_MAPPING['UEFA']
IMPORTED_CUP_CLUB = UEFA_TEAMS[1]


def career(club, label):
    # Keep a valid second club even when the imported Career belongs to club 1.
    members = [club, 2 if club == 1 else 1]
    return {
        'club': club, 'season': 4, 'week': 3, 'members': members,
        'fixtures': [[[club, 1]]], 'history': [], 'lastResult': None,
        # Restart/import flows render the Career tactics UI after restore, so
        # use the supported 2 GK / 3 DF / 4 MF / 3 FW squad shape.
        'roster': [
            {'id': f'{label}-{i}', 'name': f'{label} Player {i}', 'role': role, 'num': i + 1}
            for i, role in enumerate(['GK', 'GK', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW'])
        ],
        'table': {str(i): {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'pts': 0} for i in members},
        'facilities': {'training': 1}, 'cup': {'stage': 0}, 'cash': 123456,
    }


def slot(club, label):
    return {'name': label, 'savedAt': '2026-11-01T12:00:00.000Z', 'career': career(club, label)}


def vault(active, slots):
    return {'schema': 1, 'active': active, 'slots': slots}


def backup(state):
    payload = json.dumps(state, separators=(',', ':'), ensure_ascii=False)
    checksum = 2166136261
    for char in payload:
        checksum ^= ord(char)
        checksum = (checksum * 16777619) & 0xffffffff
    return json.dumps({
        'format': 'smf-career-backup', 'version': 1, 'payload': payload,
        'checksum': f'{checksum:08x}',
    }, separators=(',', ':'), ensure_ascii=False).encode('utf8')


local_vault = vault(1, [slot(0, 'Local Career')] + [None] * 9)
legacy_career = career(0, 'Legacy Mirror')
occupied_import = vault(3, [None, None, slot(2, 'Reloaded Career')] + [None] * 7)
empty_active_import = vault(4, [None, slot(1, 'Inactive Saved Career')] + [None] * 8)
backups = {
    'occupied': backup(occupied_import),
    'empty-active': backup(empty_active_import),
}


def cup(club, label):
    participants = UEFA_TEAMS
    opponent = participants[(participants.index(club) + 1) % len(participants)]
    remaining = [team for team in participants if team not in (club, opponent)]
    round_fixtures = [[club, opponent]] + [
        [remaining[index], remaining[index + 1]]
        for index in range(0, len(remaining) - 1, 2)
    ]
    zero_row = {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'pts': 0}
    return {
        'id': 'cup_UEFA', 'compId': 'UEFA', 'club': club, 'participants': participants,
        'phase': 'league', 'roundIdx': 2, 'history': [],
        # Matchdays in a saved group campaign must contain every group fixture;
        # with an odd participant count, one team receives the round bye.
        'rounds': [[pair[:] for pair in round_fixtures] for _ in range(3)], 'groups': [participants],
        'table': {str(team): dict(zero_row) for team in participants},
        'earned': 0, 'winner': None, 'knockout': None,
    }


def cup_backup(state):
    payload = json.dumps(state, separators=(',', ':'), ensure_ascii=False)
    checksum = 2166136261
    for char in payload:
        checksum ^= ord(char)
        checksum = (checksum * 16777619) & 0xffffffff
    return json.dumps({
        'format': 'smf-cup-backup', 'version': 1, 'payload': payload,
        'checksum': f'{checksum:08x}',
    }, separators=(',', ':'), ensure_ascii=False).encode('utf8')


def cup_vault(active, slots):
    return {'schema': 1, 'active': active, 'slots': slots}


local_cup_vault = cup_vault(1, [{'name': 'Local Cup', 'savedAt': '2026-11-01T12:00:00.000Z', 'tournament': cup(UEFA_TEAMS[0], 'Local')}]+[None]*9)
legacy_cup_mirror = cup(UEFA_TEAMS[0], 'Legacy Cup Mirror')
imported_cup_vault = cup_vault(5, [None, None, None, None, {'name': 'Reloaded Cup', 'savedAt': '2026-11-01T12:00:00.000Z', 'tournament': cup(IMPORTED_CUP_CLUB, 'Reloaded')}]+[None]*5)
empty_active_cup_vault = cup_vault(7, [None, {'name': 'Inactive Saved Cup', 'savedAt': '2026-11-01T12:00:00.000Z', 'tournament': cup(UEFA_TEAMS[2], 'Inactive')}]+[None]*8)
cup_backups = {'occupied': cup_backup(imported_cup_vault), 'empty-active': cup_backup(empty_active_cup_vault)}

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}'


def run_scenario(browser, label, mobile, imported):
    context = browser.new_context(
        viewport={'width': 1360, 'height': 800} if not mobile else {'width': 844, 'height': 390},
        is_mobile=mobile, has_touch=mobile, accept_downloads=True,
    )
    context.add_init_script(
        "if (!localStorage.getItem('__career_restart_fixture')) {"
        "localStorage.setItem('__career_restart_fixture','1');"
        "localStorage.setItem('legend_careerSlots', " + json.dumps(json.dumps(local_vault, separators=(',', ':'))) + ");"
        "localStorage.setItem('legend_managerCareer', " + json.dumps(json.dumps(legacy_career, separators=(',', ':'))) + ");"
        "}"
    )
    page = context.new_page()
    page_errors = []
    dialogs = []
    page.on('pageerror', lambda error: page_errors.append(str(error)))

    def accept_overwrite(dialog):
        dialogs.append(dialog.message)
        if dialog.type == 'confirm':
            dialog.accept()
        else:
            dialog.dismiss()

    page.on('dialog', accept_overwrite)
    url = origin + '/tests/.generated/play.html'
    page.goto(url, wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)

    def click(action):
        page.locator('[data-action="' + action + '"]').first.click(timeout=30000, force=action == 'navCareer')

    click('navSettings')
    click('navSaveManagement')
    assert page.locator('[data-action="careerBackupImport"]').count() == 1, (label, imported, 'backup import UI')
    page.locator('#careerBackupImportFile').set_input_files({
        'name': f'{imported}-Career.json', 'mimeType': 'application/json', 'buffer': backups[imported],
    })
    try:
        page.wait_for_function("document.querySelector('#careerBackupPreview')?.textContent.includes('Imported')", timeout=10000)
    except Exception:
        preview = page.locator('#careerBackupPreview')
        print('CAREER_BACKUP_IMPORT_DIAGNOSTIC', label, imported,
              preview.inner_text() if preview.count() and preview.is_visible() else '(preview hidden)',
              dialogs, page_errors, flush=True)
        raise
    assert len(dialogs) == 1 and dialogs[0].startswith('Import '), (label, imported, dialogs)

    vault_before = page.evaluate("localStorage.getItem('legend_careerSlots')")
    mirror_before = page.evaluate("localStorage.getItem('legend_managerCareer')")
    parsed_vault = json.loads(vault_before)
    parsed_mirror = json.loads(mirror_before)
    assert parsed_vault['active'] == (3 if imported == 'occupied' else 4), (label, imported, parsed_vault['active'])

    if imported == 'occupied':
        assert parsed_vault['slots'][2]['name'] == 'Reloaded Career', (label, parsed_vault)
        assert parsed_mirror['roster'][0]['id'] == 'Reloaded Career-0', (label, parsed_mirror)
        assert parsed_mirror['club'] == 2, (label, parsed_mirror['club'])
    else:
        assert parsed_vault['slots'][3] is None and parsed_vault['slots'][1]['name'] == 'Inactive Saved Career', (label, parsed_vault)
        # Startup may first enrich a legacy mirror while migrating its tactics;
        # the import must preserve the exact bytes that existed immediately
        # before it ran, rather than matching the older fixture object.
        assert parsed_mirror == json.loads(mirror_before), (label, 'empty active slot must leave legacy mirror untouched')

    # A real browser reload starts a new document while retaining same-origin localStorage.
    page.reload(wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
    assert page.evaluate("localStorage.getItem('legend_careerSlots')") == vault_before, (label, imported, 'vault bytes survive reload')
    assert page.evaluate("localStorage.getItem('legend_managerCareer')") == mirror_before, (label, imported, 'legacy mirror bytes survive reload')
    click('navCareer')

    if imported == 'occupied':
        assert page.get_by_text('Continue Career', exact=True).count() == 1, (label, 'occupied active Career resumes')
        click('manager')
        assert page.locator('.heading').inner_text() == 'MANAGER CAREER', (label, 'active Career loads after restart')
        assert 'Reloaded Career' not in page.locator('#menu').inner_text(), (label, 'fixture label is slot metadata only')
    else:
        assert page.get_by_text('Continue Career', exact=True).count() == 0, (label, 'empty active slot must not expose Continue Career')
        click('manager')
        assert page.locator('.heading').inner_text() == 'MANAGER CAREER', (label, 'empty active slot starts at new Career form')
        assert page.locator('#managerClub').count() == 1, (label, 'legacy mirror was not resurrected as active career')
        assert json.loads(page.evaluate("localStorage.getItem('legend_careerSlots')"))['slots'][1]['name'] == 'Inactive Saved Career', (label, 'non-active imported save remains present')

    assert not page_errors, (label, imported, page_errors)
    print('CAREER_BACKUP_RESTART_PASS', label, imported,
          'same-origin import, browser reload, vault/active/mirror persistence, empty-active no-resurrection', flush=True)
    context.close()


def run_cup_scenario(browser, label, mobile, imported):
    context = browser.new_context(
        viewport={'width': 1360, 'height': 800} if not mobile else {'width': 844, 'height': 390},
        is_mobile=mobile, has_touch=mobile,
    )
    context.add_init_script(
        "if (!localStorage.getItem('__cup_restart_fixture')) {"
        "localStorage.setItem('__cup_restart_fixture','1');"
        "localStorage.setItem('legend_cupSlots', " + json.dumps(json.dumps(local_cup_vault, separators=(',', ':'))) + ");"
        "localStorage.setItem('legend_continentalRun', " + json.dumps(json.dumps(legacy_cup_mirror, separators=(',', ':'))) + ");"
        "}"
    )
    page = context.new_page()
    errors = []
    dialogs = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('dialog', lambda dialog: (dialogs.append(dialog.message), dialog.accept() if dialog.type == 'confirm' else dialog.dismiss()))
    url = origin + '/tests/.generated/play.html'
    page.goto(url, wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)

    def click(action):
        page.locator('[data-action="' + action + '"]').first.click(timeout=30000)

    click('navCups')
    click('navCupSlots')
    legacy_mirror_before = page.evaluate("localStorage.getItem('legend_continentalRun')")
    with page.expect_file_chooser() as chooser:
        click('cupBackupImport')
    chooser.value.set_files({
        'name': f'{imported}-Continental_Cup_Backup.json', 'mimeType': 'application/json', 'buffer': cup_backups[imported],
    })
    page.wait_for_timeout(300)
    expected_active = 5 if imported == 'occupied' else 7
    expected_name = 'Reloaded Cup' if imported == 'occupied' else 'Inactive Saved Cup'
    assert len(dialogs) == 1 and dialogs[0].startswith(f'Import 1 Cup slots? Active slot: {expected_active}'), (label, imported, dialogs, page.locator('#menu').inner_text(), errors)
    assert expected_name in dialogs[0], (label, imported, dialogs[0])

    cup_bytes_before = page.evaluate("localStorage.getItem('legend_cupSlots')")
    mirror_bytes_before = page.evaluate("localStorage.getItem('legend_continentalRun')")
    parsed = json.loads(cup_bytes_before)
    mirror = json.loads(mirror_bytes_before)
    assert parsed['active'] == expected_active, (label, imported, parsed)
    if imported == 'occupied':
        assert parsed['slots'][4]['name'] == 'Reloaded Cup', (label, parsed)
        assert mirror['club'] == IMPORTED_CUP_CLUB and mirror['roundIdx'] == 2, (label, mirror)
    else:
        assert parsed['slots'][6] is None and parsed['slots'][1]['name'] == 'Inactive Saved Cup', (label, parsed)
        assert mirror_bytes_before == legacy_mirror_before, (label, 'empty active Cup import must retain the old legacy mirror bytes')
        assert page.evaluate('window.SupermagicFootball.getContinental()') is None, (label, 'empty active Cup import must leave no campaign active')

    page.reload(wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
    assert page.evaluate("localStorage.getItem('legend_cupSlots')") == cup_bytes_before, (label, 'Cup vault survives reload')
    assert page.evaluate("localStorage.getItem('legend_continentalRun')") == mirror_bytes_before, (label, 'legacy Cup mirror survives reload')
    active_after_restart = page.evaluate('window.SupermagicFootball.getContinental()')
    assert (active_after_restart is None) if imported == 'empty-active' else (active_after_restart is not None), (label, imported, 'wrong active campaign after reload')
    click('navCups')
    click('navCupSlots')
    slot_text = page.locator('#menu').inner_text()
    assert f'SLOT {expected_active} · ACTIVE' in slot_text and expected_name in slot_text, (label, imported, slot_text)
    assert not errors, (label, errors)
    print('CUP_BACKUP_RESTART_PASS', label, 'same-origin Cup import, browser reload, active slot + legacy mirror persistence', flush=True)
    context.close()


try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        for label, mobile in [('desktop', False), ('simulated-touch', True)]:
            run_scenario(browser, label, mobile, 'occupied')
            run_scenario(browser, label, mobile, 'empty-active')
            run_cup_scenario(browser, label, mobile, 'occupied')
            run_cup_scenario(browser, label, mobile, 'empty-active')
        browser.close()
finally:
    server.shutdown()
    server.server_close()
