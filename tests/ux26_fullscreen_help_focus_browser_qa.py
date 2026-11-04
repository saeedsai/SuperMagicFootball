#!/usr/bin/env python3
"""UX26: fullscreen guidance acts as a dismissible, focus-contained dialog."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_quick

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build the current game fixture first'
html = fixture.read_text(encoding='utf-8')

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
        page.set_content(html, wait_until='load')
        open_quick(page)
        page.evaluate("""() => {
          Object.defineProperty(Element.prototype, 'requestFullscreen', {configurable:true, value:undefined});
          Object.defineProperty(Element.prototype, 'webkitRequestFullscreen', {configurable:true, value:undefined});
        }""")
        # Change routes while the connected opener disappears. Closing the
        # global help dialog must land on the new route's visible heading.
        page.locator('#menu .fullscreenTool').click()
        dialog = page.locator('#fullscreenHelp')
        page.wait_for_function("!document.querySelector('#fullscreenHelp').classList.contains('hidden')", timeout=5000)
        page.locator('#menu [data-action="navOnDevice"]').evaluate('(el) => el.click()')
        page.wait_for_function("document.querySelector('#menu .heading')?.textContent.includes('ON DEVICE')", timeout=5000)
        page.locator('#fullscreenHelpClose').click()
        route_focus = page.evaluate("() => ({active: document.activeElement?.outerHTML, heading: document.querySelector('#menu .heading')?.outerHTML, menuClass: document.querySelector('#menu')?.className})")
        assert page.locator('#menu .heading').evaluate('(el) => document.activeElement === el'), (device, 'route-change fallback did not focus the new page heading', route_focus)
        open_quick(page)
        page.locator('[data-action="kickoff"]').click()
        opener = page.locator('#fullscreenMatch')
        opener.click()
        close = page.locator('#fullscreenHelpClose')
        page.wait_for_function("!document.querySelector('#fullscreenHelp').classList.contains('hidden')", timeout=5000)
        assert dialog.get_attribute('aria-modal') == 'true'
        assert page.evaluate('document.activeElement?.id') == 'fullscreenHelpClose', (device, 'dialog did not receive focus')
        page.keyboard.press('Tab')
        assert page.evaluate('document.activeElement?.id') == 'fullscreenHelpClose', (device, 'Tab escaped modal')
        page.keyboard.press('Shift+Tab')
        assert page.evaluate('document.activeElement?.id') == 'fullscreenHelpClose', (device, 'Shift+Tab escaped modal')
        page.keyboard.press('Escape')
        assert 'hidden' in (dialog.get_attribute('class') or ''), (device, 'Escape did not close modal')
        assert page.evaluate('document.activeElement?.id') == 'fullscreenMatch', (device, 'Escape did not restore focus')

        opener.click()
        page.wait_for_function("!document.querySelector('#fullscreenHelp').classList.contains('hidden')", timeout=5000)
        close.click()
        assert 'hidden' in (dialog.get_attribute('class') or ''), (device, 'close button did not dismiss modal')
        assert page.evaluate('document.activeElement?.id') == 'fullscreenMatch', (device, 'close button did not restore focus')

        # The opener can remain in the DOM while hidden or disabled after a
        # state change. Both cases must use the visible in-match pause control.
        for state in ['hidden', 'disabled']:
            opener.evaluate("(el, state) => { el.classList.remove('hidden'); el.disabled = false; if (state === 'hidden') el.classList.add('hidden'); else el.disabled = true; }", state)
            opener.evaluate('(el) => { el.classList.remove("hidden"); el.disabled = false; el.click(); }')
            page.wait_for_function("!document.querySelector('#fullscreenHelp').classList.contains('hidden')", timeout=5000)
            opener.evaluate("(el, state) => { if (state === 'hidden') el.classList.add('hidden'); else el.disabled = true; }", state)
            close.click()
            assert page.evaluate('document.activeElement?.id') == 'pauseBtn', (device, state, 'invalid opener should fall back to pause control')
            opener.evaluate('(el) => { el.classList.remove("hidden"); el.disabled = false; }')
        assert not errors, (device, errors)
        print('UX26_FULLSCREEN_HELP_FOCUS_BROWSER_PASS', device)
        context.close()
    browser.close()
