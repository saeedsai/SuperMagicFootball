"""Exercise Custom League setup, bye, persistence, and matchday flow in Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / 'docs/evidence/browser/candidate_012863'
OUT_DIR.mkdir(parents=True, exist_ok=True)
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
            context = browser.new_context(viewport=viewport, is_mobile=mobile, has_touch=mobile, service_workers='block')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(origin + '/tests/.generated/play.html', wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game')
            page.locator('[data-action="navCups"]').first.click()
            page.locator('[data-action="customLeagueSetup"]').click()
            assert page.get_by_role('heading', name='CUSTOM LEAGUE').count() == 1
            available = page.locator('#customLeagueTeam option').evaluate_all('(items)=>items.slice(0,5).map(option=>option.value)')
            assert len(set(available)) == 5, (label, available)
            for value in available:
                page.locator('#customLeagueTeam').select_option(value=value)
                page.locator('[data-action="customLeagueAdd"]').click()
            assert page.locator('.customCupEntrant').count() == 5, label
            assert 'YOUR CLUB' in page.locator('.customCupEntrant').first.inner_text(), label
            page.locator('[data-action="customLeagueStart"]').click()
            assert 'BYE' in page.locator('.fixture').inner_text(), label
            state = page.evaluate('JSON.parse(localStorage.getItem("legend_customLeague"))')
            assert state['participants'] == [int(value) for value in available], (label, state['participants'])
            assert state['club'] == int(available[0]) and state['roundIdx'] == 0, (label, state)

            stale_page = context.new_page()
            stale_errors = []
            stale_page.on('pageerror', lambda error: stale_errors.append(str(error)))
            stale_page.goto(origin + '/tests/.generated/play.html', wait_until='load')
            stale_page.wait_for_function('!!window.SupermagicFootball?.game')

            page.reload(wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game')
            page.locator('[data-action="navCups"]').first.click()
            page.locator('[data-action="customLeagueContinue"]').click()
            assert 'BYE' in page.locator('.fixture').inner_text(), label
            page.screenshot(path=str(OUT_DIR / f'custom_league_matchday_{label}.png'), full_page=True)
            page.locator('[data-action="customLeagueBye"]').click()
            state = page.evaluate('JSON.parse(localStorage.getItem("legend_customLeague"))')
            assert state['roundIdx'] == 1 and len(state['history']) == 2, (label, state['roundIdx'], len(state['history']))

            stale_page.on('dialog', lambda dialog: dialog.accept())
            stale_page.locator('[data-action="navCups"]').first.click()
            stale_page.locator('[data-action="customLeagueSetup"]').click()
            for value in available:
                stale_page.locator('#customLeagueTeam').select_option(value=value)
                stale_page.locator('[data-action="customLeagueAdd"]').click()
            stale_page.locator('[data-action="customLeagueStart"]').click()
            assert 'changed in another tab' in stale_page.locator('#menu').inner_text().lower(), label
            preserved = stale_page.evaluate('JSON.parse(localStorage.getItem("legend_customLeague"))')
            assert preserved['roundIdx'] == 1 and len(preserved['history']) == 2, label
            assert not stale_errors, (label, stale_errors)
            stale_page.close()

            page.locator('[data-action="customLeagueKickoff"]').click()
            assert page.evaluate('SupermagicFootball.game.mode') == 'customLeague', label
            page.evaluate('SupermagicFootball.game.onEvent({type:"finished",score:[2,1]})')
            page.wait_for_function("document.querySelector('#menu h1')?.textContent.includes('CUSTOM LEAGUE RESULT')")
            result = page.evaluate('JSON.parse(localStorage.getItem("legend_customLeague"))')
            assert result['roundIdx'] == 2 and len(result['history']) == 4, (label, result['roundIdx'], len(result['history']))
            assert page.locator('text=The full matchday result is saved locally.').count() == 1, label
            assert page.evaluate('localStorage.getItem("legend_managerCareer")') is None, label
            assert page.evaluate('localStorage.getItem("legend_cupSlots")') is None, label
            assert not errors, (label, errors)
            print('CUSTOM_LEAGUE_SETUP_RELOAD_MATCHDAY_PASS', label, viewport, flush=True)
            context.close()

        context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, service_workers='block')
        page = context.new_page()
        page.add_init_script("""(() => { const original=Storage.prototype.setItem; Storage.prototype.setItem=function(key,value){ if(key==='legend_customLeague')throw new DOMException('storage quota','QuotaExceededError'); return original.call(this,key,value); }; })();""")
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(origin + '/tests/.generated/play.html', wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game')
        page.locator('[data-action="navCups"]').first.click()
        page.locator('[data-action="customLeagueSetup"]').click()
        available = page.locator('#customLeagueTeam option').evaluate_all('(items)=>items.slice(0,4).map(option=>option.value)')
        for value in available:
            page.locator('#customLeagueTeam').select_option(value=value)
            page.locator('[data-action="customLeagueAdd"]').click()
        page.locator('[data-action="customLeagueStart"]').click()
        assert 'session-only' in page.locator('#menu').inner_text().lower(), page.locator('#menu').inner_text()
        assert page.evaluate('localStorage.getItem("legend_customLeague")') is None
        assert not errors, errors
        print('CUSTOM_LEAGUE_STORAGE_FALLBACK_PASS', flush=True)
        context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)
