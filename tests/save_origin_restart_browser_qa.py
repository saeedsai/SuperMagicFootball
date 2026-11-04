"""SAVE-103 app-server + persistent-browser restart acceptance.

Run after scripts/build.py. The test starts the built game on one HTTP origin,
stores Career/Cup vault fixtures, closes Chromium, stops the server, restarts it
on the same host/port, then opens Chromium again with the same persistent
profile. Browser localStorage and active-slot behavior must survive that cycle.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import tempfile
from threading import Thread

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
CONTINENTAL_MAPPING = json.loads(
    (ROOT / 'data/continental_mapping.json').read_text(encoding='utf8')
)
UEFA_TEAMS = CONTINENTAL_MAPPING['UEFA']


class ReusableHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def career(club, label):
    members = [club, 1]
    return {
        'club': club, 'season': 4, 'week': 3, 'members': members,
        'fixtures': [[[club, 1]]], 'history': [], 'lastResult': None,
        'roster': [
            {'id': f'{label}-{i}', 'name': f'{label} Player {i}', 'role': role, 'num': i + 1}
            for i, role in enumerate(['GK', 'GK', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW'])
        ],
        'table': {str(i): {'p': 0, 'w': 0, 'd': 0, 'l': 0, 'gf': 0, 'ga': 0, 'pts': 0} for i in members},
        'facilities': {'training': 1}, 'cup': {'stage': 0}, 'cash': 123456,
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
        # League save fixtures must cover the group; 55 clubs leave one bye.
        'rounds': [[pair[:] for pair in round_fixtures] for _ in range(3)], 'groups': [participants],
        'table': {str(team): dict(zero_row) for team in participants},
        'earned': 0, 'winner': None, 'knockout': None, 'label': label,
    }


def vault(active, slots):
    return {'schema': 1, 'active': active, 'slots': slots}


def career_slot(club, label):
    return {
        'name': label, 'savedAt': '2026-11-02T12:00:00.000Z',
        'career': career(club, label),
    }


def cup_slot(club, label):
    return {
        'name': label, 'savedAt': '2026-11-02T12:00:00.000Z',
        'tournament': cup(club, label),
    }


def start_server(port=0):
    server = ReusableHTTPServer(
        ('127.0.0.1', port), partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    )
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def stop_server(server, thread):
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)
    assert not thread.is_alive(), 'app server did not stop cleanly'


def open_context(pw, profile, mobile):
    return pw.chromium.launch_persistent_context(
        user_data_dir=str(profile),
        headless=True,
        viewport={'width': 844, 'height': 390} if mobile else {'width': 1360, 'height': 800},
        is_mobile=mobile,
        has_touch=mobile,
        service_workers='block',
    )


def click(page, action):
    page.locator(f'[data-action="{action}"]').first.click(timeout=30000, force=action == 'navCareer')


def seed(page, values):
    page.evaluate(
        "values => { for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value); }",
        values,
    )
    page.reload(wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)


def check_career(page, mode, expected_vault, expected_mirror):
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    if mode == 'occupied':
        click(page, 'navCareer')
        assert page.get_by_text('Continue Career', exact=True).count() == 1, 'occupied Career did not resume'
        click(page, 'manager')
        assert page.locator('.heading').inner_text() == 'MANAGER CAREER', 'occupied Career did not load'
    else:
        click(page, 'navCareer')
        assert page.get_by_text('Continue Career', exact=True).count() == 0, 'empty active Career resurrected a legacy mirror'
        click(page, 'manager')
        assert page.locator('#managerClub').count() == 1, 'empty active Career did not open new Career form'
    assert page.evaluate("localStorage.getItem('legend_careerSlots')") == expected_vault, 'Career vault bytes changed'
    assert page.evaluate("localStorage.getItem('legend_managerCareer')") == expected_mirror, 'Career legacy mirror bytes changed'
    assert not errors, errors


def check_cup(page, mode, expected_vault, expected_mirror):
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    if mode == 'occupied':
        click(page, 'navCups')
        click(page, 'navCupSlots')
        text = page.locator('#menu').inner_text()
        assert 'SLOT 5 · ACTIVE' in text and 'Restarted Cup' in text, text
    else:
        assert page.evaluate('window.SupermagicFootball.getContinental()') is None, 'empty active Cup resurrected a legacy mirror'
        click(page, 'navCups')
        click(page, 'navClubs')
        click(page, 'continents')
        assert page.get_by_text('Continue Saved Tournament', exact=True).count() == 0, 'empty active Cup shows Continue'
    assert page.evaluate("localStorage.getItem('legend_cupSlots')") == expected_vault, 'Cup vault bytes changed'
    assert page.evaluate("localStorage.getItem('legend_continentalRun')") == expected_mirror, 'Cup legacy mirror bytes changed'
    assert not errors, errors


def run_scenario(pw, origin, profile, mobile, kind, mode):
    page_url = origin + '/tests/.generated/play.html'
    if kind == 'career':
        club = 0
        legacy = career(club, 'Legacy Career Mirror')
        if mode == 'occupied':
            slots = [None] * 10
            slots[0] = career_slot(club, 'Restarted Career')
            active = 1
        else:
            slots = [None] * 10
            slots[1] = career_slot(club, 'Inactive Career')
            active = 4
        keys = {
            'legend_careerSlots': json.dumps(vault(active, slots), separators=(',', ':')),
            'legend_managerCareer': json.dumps(legacy, separators=(',', ':')),
        }
    else:
        club = UEFA_TEAMS[0]
        legacy = cup(club, 'Legacy Cup Mirror')
        if mode == 'occupied':
            slots = [None] * 10
            slots[4] = cup_slot(club, 'Restarted Cup')
            active = 5
        else:
            slots = [None] * 10
            slots[1] = cup_slot(club, 'Inactive Cup')
            active = 1
        keys = {
            'legend_cupSlots': json.dumps(vault(active, slots), separators=(',', ':')),
            'legend_continentalRun': json.dumps(legacy, separators=(',', ':')),
        }

    context = open_context(pw, profile, mobile)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(page_url, wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
    seed(page, keys)
    # Validate and snapshot post-startup bytes before the browser and app server
    # are shut down. Startup may legitimately canonicalize a legacy mirror.
    expected_vault = page.evaluate(
        "key => localStorage.getItem(key)", 'legend_careerSlots' if kind == 'career' else 'legend_cupSlots'
    )
    mirror_key = 'legend_managerCareer' if kind == 'career' else 'legend_continentalRun'
    expected_mirror = page.evaluate("key => localStorage.getItem(key)", mirror_key)
    assert expected_vault and expected_mirror, f'{kind} fixture did not initialize'
    assert not errors, errors
    context.close()
    return expected_vault, expected_mirror


def verify_restarted(pw, origin, profile, mobile, kind, mode, expected_vault, expected_mirror):
    context = open_context(pw, profile, mobile)
    page = context.new_page()
    page_errors = []
    page.on('pageerror', lambda error: page_errors.append(str(error)))
    page.goto(origin + '/tests/.generated/play.html', wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
    if kind == 'career':
        check_career(page, mode, expected_vault, expected_mirror)
    else:
        check_cup(page, mode, expected_vault, expected_mirror)
    assert not page_errors, page_errors
    print(
        'SAVE_ORIGIN_RESTART_PASS',
        'simulated-touch' if mobile else 'desktop', kind, mode,
        'same origin + server restart + persistent Chromium profile + exact vault/mirror bytes',
        flush=True,
    )
    context.close()


def main():
    with sync_playwright() as pw, tempfile.TemporaryDirectory(prefix='smf-save-restart-') as temporary:
        profile_root = Path(temporary)
        server, thread = start_server()
        origin = f'http://127.0.0.1:{server.server_port}'
        try:
            for mobile in (False, True):
                for kind, mode in (
                    ('career', 'occupied'), ('career', 'empty-active'),
                    ('cup', 'occupied'), ('cup', 'empty-active'),
                ):
                    profile = profile_root / f'{"touch" if mobile else "desktop"}-{kind}-{mode}'
                    expected_vault, expected_mirror = run_scenario(
                        pw, origin, profile, mobile, kind, mode
                    )
                    port = server.server_port
                    stop_server(server, thread)
                    # Keep host and port fixed so the persistent profile sees
                    # the exact same browser origin after the server restarts.
                    server, thread = start_server(port)
                    assert server.server_port == port, 'restart changed the app origin port'
                    verify_restarted(
                        pw, origin, profile, mobile, kind, mode,
                        expected_vault, expected_mirror,
                    )
            print('SAVE_ORIGIN_RESTART_SUMMARY_PASS 8 scenarios', flush=True)
        finally:
            stop_server(server, thread)


if __name__ == '__main__':
    main()
