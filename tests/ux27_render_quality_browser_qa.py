#!/usr/bin/env python3
"""UX27 High/Performance setting reload and logical-layout acceptance."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
url = f'http://127.0.0.1:{server.server_port}/index.html'

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            executable_path='/usr/bin/chromium',
            args=['--no-sandbox', '--disable-dev-shm-usage'],
        )
        for device, viewport, touch in [
            ('desktop', {'width': 1280, 'height': 720}, False),
            ('simulated-touch', {'width': 844, 'height': 390}, True),
        ]:
            context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(url, wait_until='load')
            try:
                page.wait_for_function('!!window.SupermagicFootball?.renderer', timeout=30000)
            except Exception as error:
                raise AssertionError(f'{device}: current source did not initialize; page errors={errors}') from error

            page.locator('[data-action="navSettings"]').first.click()
            page.locator('[data-action="navGraphics"]').first.click()
            quality = page.locator('#renderQuality')
            assert quality.input_value() == 'high', (device, 'new profile should default to High')
            high = page.evaluate('''() => {
              const r = window.SupermagicFootball.renderer;
              return { quality:r.renderQuality, dpr:r.dpr, width:r.screenW, height:r.screenH };
            }''')

            quality.select_option('performance')
            page.locator('[data-action="saveSettings"]').click()
            performance = page.evaluate('''() => {
              const r = window.SupermagicFootball.renderer;
              return { quality:r.renderQuality, dpr:r.dpr, width:r.screenW, height:r.screenH };
            }''')
            assert performance['quality'] == 'performance', (device, performance)
            assert abs(performance['dpr'] - high['dpr'] * .75) < .01, (device, high, performance)
            assert abs(performance['width'] - high['width']) < .01, (device, 'logical width changed', high, performance)
            assert abs(performance['height'] - high['height']) < .01, (device, 'logical height changed', high, performance)

            page.reload(wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.renderer', timeout=30000)
            page.locator('[data-action="navSettings"]').first.click()
            page.locator('[data-action="navGraphics"]').first.click()
            assert page.locator('#renderQuality').input_value() == 'performance', (device, 'Performance choice did not survive reload')
            restored = page.evaluate('''() => {
              const r = window.SupermagicFootball.renderer;
              return { quality:r.renderQuality, dpr:r.dpr, width:r.screenW, height:r.screenH };
            }''')
            assert restored['quality'] == 'performance', (device, restored)
            assert abs(restored['width'] - high['width']) < .01 and abs(restored['height'] - high['height']) < .01, (device, 'logical layout changed after reload', high, restored)

            page.locator('#renderQuality').select_option('high')
            page.locator('[data-action="saveSettings"]').click()
            page.reload(wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.renderer', timeout=30000)
            page.locator('[data-action="navSettings"]').first.click()
            page.locator('[data-action="navGraphics"]').first.click()
            assert page.locator('#renderQuality').input_value() == 'high', (device, 'High choice did not survive reload')
            final = page.evaluate('''() => {
              const r = window.SupermagicFootball.renderer;
              return { quality:r.renderQuality, dpr:r.dpr, width:r.screenW, height:r.screenH };
            }''')
            assert final['quality'] == 'high' and abs(final['dpr'] - high['dpr']) < .01, (device, high, final)
            assert abs(final['width'] - high['width']) < .01 and abs(final['height'] - high['height']) < .01, (device, high, final)
            assert not errors, (device, errors)
            print('UX27_RENDER_QUALITY_BROWSER_PASS', device, flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
