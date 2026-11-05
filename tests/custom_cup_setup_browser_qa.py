"""Exercise Custom Cup setup and slot restore at desktop and touch sizes."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
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
            try:
                page.wait_for_function('!!window.SupermagicFootball?.game', timeout=10000)
            except Exception as error:
                raise AssertionError(f'{label}: game failed to initialize; {errors}') from error
            page.locator('[data-action="navCups"]').first.click()
            page.locator('[data-action="customCupSetup"]').click()
            assert page.get_by_role('heading', name='CUSTOM CUP').count() == 1

            available = page.locator('#customCupTeam option').evaluate_all('(items)=>items.slice(0,4).map(option=>option.value)')
            assert len(set(available)) == 4, (label, available)
            for value in available[:3]:
                page.locator('#customCupTeam').select_option(value=value)
                page.locator('[data-action="customCupAdd"]').click()
            assert page.locator('[data-action="customCupStart"]').is_disabled(), label
            page.locator('#customCupTeam').select_option(value=available[3])
            page.locator('[data-action="customCupAdd"]').click()
            assert page.locator('.customCupEntrant').count() == 4, label
            assert 'YOUR CLUB' in page.locator('.customCupEntrant').first.inner_text(), label
            page.locator('[data-action="customCupStart"]').click()
            page.wait_for_function('window.SupermagicFootball.getContinental()?.compId === "CUSTOM"')
            assert page.evaluate('window.SupermagicFootball.getContinental().participants.length') == 4
            assert page.locator('text=Custom single-match knockout').count() == 1
            assert page.evaluate('JSON.parse(localStorage.getItem("legend_cupSlots")).slots[0].tournament.compId') == 'CUSTOM'

            page.reload(wait_until='load')
            page.wait_for_function('window.SupermagicFootball?.getContinental()?.compId === "CUSTOM"', timeout=10000)
            assert page.evaluate('window.SupermagicFootball.getContinental().participants.length') == 4
            assert not errors, (label, errors)
            print('CUSTOM_CUP_SETUP_RESTORE_PASS', label, viewport, flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
