#!/usr/bin/env python3
"""Keyboard-only Store smoke check against the already-built QA fixture."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests' / '.generated' / 'play.html'
assert FIXTURE.is_file(), 'Built QA fixture is missing; this script does not build it'
FIXTURE_HTML = FIXTURE.read_bytes()


class Handler(SimpleHTTPRequestHandler):
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


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}/'

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={'width': 1440, 'height': 1000})
        context.add_init_script("""localStorage.setItem('legend_tokenWallet', JSON.stringify({
          schema:1, tokens:1000, unlocks:[], receipts:[]
        }));""")
        page = context.new_page()
        errors = []
        failures = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        def check(condition, message):
            if not condition:
                failures.append(message)

        def tab_until(locator, description, limit=18):
            for _ in range(limit):
                if locator.evaluate('(e)=>e===document.activeElement'):
                    return True
                page.keyboard.press('Tab')
            failures.append(f'Tab order did not reach {description}')
            return False
        page.goto(origin, wait_until='load')

        # Home restores focus to Quick Match. Check the live-balance header
        # wallet through normal Shift+Tab stops from that card.
        assert page.locator('[data-action="navQuick"]').evaluate('(e)=>e===document.activeElement')
        for _ in range(3):
            page.keyboard.press('Shift+Tab')
        store_home_button = page.locator('.arcadeWallet[data-action="navStore"]')
        assert store_home_button.count() == 1, 'Home wallet should open the Store'
        assert store_home_button.evaluate('(e)=>e===document.activeElement'), 'Shift+Tab should reach the wallet from Quick Match'
        assert '1,000' in store_home_button.get_attribute('aria-label'), 'Wallet accessible name should expose the current balance'
        page.keyboard.press('Enter')

        heading = page.get_by_role('heading', name='STORE & TOKENS')
        assert heading.count() == 1
        assert heading.evaluate('(e)=>e===document.activeElement'), 'Entering Store should move focus to its heading'
        page.keyboard.press('Escape')
        assert page.locator('.navMainList').count() == 1, 'Escape should return from Store to Home'

        # The bottom Shop tile is also reachable through ordinary forward Tab order.
        page.locator('[data-action="navQuick"]').focus()
        shop_tile = page.locator('.homeActionTiles [data-action="navStore"]')
        assert tab_until(shop_tile, 'Shop tile')
        assert 'SHOP' in shop_tile.inner_text().upper(), 'Shop tile should retain a visible name'
        page.keyboard.press('Enter')
        heading = page.get_by_role('heading', name='STORE & TOKENS')
        assert heading.count() == 1
        assert heading.evaluate('(e)=>e===document.activeElement'), 'Shop tile should open the Store'
        page.keyboard.press('Tab')  # Back
        page.keyboard.press('Tab')  # Category
        category = page.get_by_role('combobox', name='Shop category')
        assert category.count() == 1, 'Category selector needs an accessible name'
        assert category.evaluate('(e)=>e===document.activeElement')
        assert category.locator('option').count() == 6
        assert category.locator('option').all_text_contents()[:2] == ['Super Shots', 'Magic Tricks']

        # Keep the default Super Shots page. Verify category/search/pager/card are
        # keyboard reachable in DOM order and that page controls retain focus.
        page.keyboard.press('Tab')
        search = page.get_by_role('searchbox', name='SEARCH SUPER SHOTS')
        assert search.count() == 1, 'Store search should be labelled by its category prompt'
        assert search.evaluate('(e)=>e===document.activeElement')
        page.keyboard.press('Tab')
        owned_filter = page.get_by_role('checkbox', name='SHOW OWNED ONLY')
        assert owned_filter.count() == 1, 'Owned-only filter needs an accessible name'
        assert owned_filter.evaluate('(e)=>e===document.activeElement'), 'Keyboard order should expose the owned-only filter'
        page.keyboard.press('Tab')
        next_page = page.get_by_role('button', name='NEXT →')
        assert next_page.count() == 1
        assert next_page.is_enabled()
        assert next_page.evaluate('(e)=>e===document.activeElement')
        page.keyboard.press('Enter')
        range_status = page.get_by_role('status').filter(has_text='Showing 13–')
        assert range_status.count() == 1, 'Next should advance the visible card range'
        check(next_page.evaluate('(e)=>e===document.activeElement'), 'Paging forward should restore focus to Next')

        previous_page = page.get_by_role('button', name='← PREVIOUS')
        assert previous_page.is_enabled()
        page.keyboard.press('Shift+Tab')
        assert previous_page.evaluate('(e)=>e===document.activeElement')
        page.keyboard.press('Enter')
        active_after_back = page.evaluate('''()=>({tag:document.activeElement?.tagName,
          id:document.activeElement?.id, disabled:document.activeElement?.disabled,
          action:document.activeElement?.getAttribute('data-action')})''')
        check(active_after_back['tag'] == 'BUTTON' and not active_after_back['disabled'],
              'Paging back should transfer focus from newly-disabled Previous to a usable control; got '
              + repr(active_after_back))
        # Recover strictly with Tab so the rest of the path still exercises a
        # real keyboard-only user journey after a focus-loss regression.
        assert tab_until(next_page, 'Next after returning to page one')
        page.keyboard.press('Tab')
        buy_button = page.locator('#tokenStoreCards button:not([disabled])').first
        check(buy_button.evaluate('(e)=>e===document.activeElement'), 'Tab order should reach a purchasable card')
        accessible_name = buy_button.get_attribute('aria-label') or ''
        assert accessible_name.startswith('Buy ') and accessible_name.endswith(' tokens'), f'Unexpected purchase accessible name: {accessible_name!r}'
        page.keyboard.press('Enter')

        notice = page.locator('#tokenStoreNotice')
        assert notice.get_attribute('role') == 'status'
        assert notice.get_attribute('aria-live') == 'polite'
        page.wait_for_function("() => (document.querySelector('#tokenStoreNotice')?.textContent || '').toLowerCase().includes('unlocked for')", timeout=5000)
        assert 'unlocked for' in notice.inner_text().lower(), 'Purchase result should be announced in the live region'
        active_after_purchase = page.evaluate('''()=>({tag:document.activeElement?.tagName,
          id:document.activeElement?.id, disabled:document.activeElement?.disabled,
          action:document.activeElement?.getAttribute('data-action')})''')
        check(active_after_purchase['tag'] == 'BUTTON' and not active_after_purchase['disabled'],
              'After a purchase, keyboard focus should remain on a usable control; got '
              + repr(active_after_purchase))
        assert not errors, f'Browser console page errors: {errors}'
        if failures:
            raise AssertionError('Keyboard Store QA failures:\n- ' + '\n- '.join(failures))
        print('TOKEN_STORE_KEYBOARD_PASS desktop: Home route, accessible controls, paging, purchase status and focus')
        context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
