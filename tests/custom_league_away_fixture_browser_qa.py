"""Verify scheduled-away Custom League matches use the real away side and persist club-perspective results."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
origin = f'http://127.0.0.1:{server.server_port}'

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        for label, mobile, viewport in [
            ('desktop', False, {'width': 1360, 'height': 800}),
            ('simulated-touch', True, {'width': 390, 'height': 844}),
        ]:
            context = browser.new_context(viewport=viewport, is_mobile=mobile, has_touch=mobile)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(origin + '/tests/.generated/play.html', wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game')
            fixture = page.evaluate("""async () => {
                const teams = SupermagicFootball.teams;
                const {createCustomLeague, customLeagueCurrent} = await import('/src/modules/custom_league.js');
                const participants = [0, 1, 2, 3, 4], club = 3;
                const campaign = createCustomLeague(club, participants, teams);
                campaign.teamKeys = Object.fromEntries(participants.map(id => [String(id), teams[id].id]));
                const scheduled = customLeagueCurrent(campaign);
                localStorage.setItem('legend_customLeague', JSON.stringify(campaign));
                return {club, opponent: scheduled.opponent, home: scheduled.home, round: scheduled.round};
            }""")
            assert fixture == {'club': 3, 'opponent': 2, 'home': False, 'round': 1}, (label, fixture)
            page.reload(wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game')
            page.locator('[data-action="navCups"]').first.click()
            page.locator('[data-action="customLeagueContinue"]').click()
            assert 'SCHEDULED AWAY' in page.locator('#menu').inner_text().upper(), label
            page.locator('[data-action="customLeagueKickoff"]').click()
            match = page.evaluate("""() => ({
                mode: SupermagicFootball.game.mode,
                teamIds: SupermagicFootball.game.teamIds,
                buttons: document.querySelectorAll('#touchButtons button[data-act]').length
            })""")
            assert match['mode'] == 'customLeague', (label, match)
            assert match['teamIds'] == [2, 3], (label, match)
            assert match['buttons'] == 4, (label, match)
            page.evaluate('SupermagicFootball.game.onEvent({type:"finished",score:[2,1]})')
            page.wait_for_function("document.querySelector('#menu h1')?.textContent.includes('CUSTOM LEAGUE RESULT')")
            saved = page.evaluate('JSON.parse(localStorage.getItem("legend_customLeague"))')
            result = next(row for row in saved['history'] if row['userControlled'])
            assert saved['roundIdx'] == 1, (label, saved['roundIdx'])
            assert [result['home'], result['away'], result['homeGoals'], result['awayGoals']] == [2, 3, 2, 1], (label, result)
            assert saved['table']['2']['gf'] == 2 and saved['table']['3']['gf'] == 1, (label, saved['table'])
            assert not errors, (label, errors)
            print('CUSTOM_LEAGUE_AWAY_FIXTURE_PASS', label, viewport, match, result, flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)
