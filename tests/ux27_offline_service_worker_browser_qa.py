#!/usr/bin/env python3
"""UX27: verify the real service worker serves the app shell after network loss."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
from threading import Thread

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
origin = f'http://127.0.0.1:{server.server_port}/'

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=shutil.which('chromium') or None,
            args=['--no-sandbox', '--disable-dev-shm-usage'],
        )
        for label, viewport, touch in [
            ('desktop', {'width': 1280, 'height': 800}, False),
            ('simulated-touch', {'width': 390, 'height': 844}, True),
        ]:
            context = browser.new_context(
                viewport=viewport, is_mobile=touch, has_touch=touch,
            )
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(origin, wait_until='load')
            page.wait_for_function(
                "navigator.serviceWorker?.controller && !!window.SupermagicFootball?.game",
                timeout=30000,
            )

            # App-shell precache must include the same-origin root/query route fallback.
            context.set_offline(True)
            for route in ('', '?route=career&offline=1'):
                page.goto(origin + route, wait_until='load', timeout=15000)
                page.wait_for_function('!!window.SupermagicFootball?.game', timeout=15000)
                assert page.locator('#menu').count() == 1, (label, route, 'app shell missing')

            hero = page.evaluate("""async () => {
              const response = await fetch('./assets/ui/home-hero-player.webp');
              if (!response.ok) return { ok: false, status: response.status };
              const blob = await response.blob();
              const bitmap = await createImageBitmap(blob);
              const canvas = document.createElement('canvas');
              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              const context = canvas.getContext('2d', { willReadFrequently: true });
              context.drawImage(bitmap, 0, 0);
              const alpha = context.getImageData(0, 0, 1, 1).data[3];
              const result = { ok: true, type: blob.type, bytes: blob.size,
                width: bitmap.width, height: bitmap.height, transparentCorner: alpha === 0 };
              bitmap.close();
              return result;
            }""")
            assert hero['ok'] and hero['type'] == 'image/webp' and hero['bytes'] > 1000, (label, 'cached Home hero unavailable offline', hero)
            assert hero['width'] > 0 and hero['height'] > 0 and hero['transparentCorner'], (label, 'hero cutout lost PNG alpha', hero)

            missing = page.evaluate("""async () => {
              try {
                const response = await fetch('./data/not-a-real-offline-resource.json');
                return { resolved: true, status: response.status, type: response.headers.get('content-type') };
              } catch (error) {
                return { resolved: false, message: String(error) };
              }
            }""")
            assert not missing['resolved'], (label, 'offline missing data must fail closed', missing)
            assert not errors, (label, errors)
            print('UX27_REAL_SW_OFFLINE_PASS', label, 'root + query navigation; Home hero WebP is cached with alpha; missing data fails closed', flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)
    assert not thread.is_alive(), 'test HTTP server did not stop cleanly'
