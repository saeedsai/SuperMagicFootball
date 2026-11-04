#!/usr/bin/env python3
"""UX26: portrait orientation guidance is an accessible, focus-contained dialog."""
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

    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(html, wait_until='load')
    open_quick(page)
    page.locator('[data-action="kickoff"]').click()
    dialog = page.locator('#rotate')
    action = page.locator('#dismissRotate')
    page.wait_for_function("!document.querySelector('#rotate').classList.contains('hidden')", timeout=5000)
    assert dialog.get_attribute('role') == 'dialog'
    assert dialog.get_attribute('aria-modal') == 'true'
    assert dialog.get_attribute('aria-labelledby') == 'rotateTitle'
    assert dialog.get_attribute('aria-describedby') == 'rotateDescription'
    assert page.locator('#rotateTitle').inner_text() == 'LANDSCAPE RECOMMENDED'
    assert 'still playable vertically' in page.locator('#rotateDescription').inner_text()
    assert page.evaluate('document.activeElement?.id') == 'dismissRotate', 'prompt did not receive focus'
    page.keyboard.press('Tab')
    assert page.evaluate('document.activeElement?.id') == 'dismissRotate', 'Tab escaped the prompt'
    page.keyboard.press('Shift+Tab')
    assert page.evaluate('document.activeElement?.id') == 'dismissRotate', 'Shift+Tab escaped the prompt'
    page.keyboard.press('Escape')
    assert 'hidden' in (dialog.get_attribute('class') or ''), 'Escape did not dismiss the prompt'
    assert page.evaluate('document.activeElement?.id') == 'pauseBtn', f'hidden Kickoff opener was focused after dismissal: {page.evaluate("({id:document.activeElement?.id,tag:document.activeElement?.tagName,cls:document.activeElement?.className,hidden:document.activeElement?.closest(\".hidden,[hidden]\")?.outerHTML?.slice(0,180),rects:document.activeElement?.getClientRects()?.length})")}'
    page.set_viewport_size({'width': 844, 'height': 390})
    page.wait_for_timeout(80)
    page.set_viewport_size({'width': 390, 'height': 844})
    page.wait_for_timeout(80)
    assert 'hidden' in (dialog.get_attribute('class') or ''), 'user dismissal did not persist through orientation changes'
    assert not errors, errors
    print('UX26_ROTATE_PROMPT_FOCUS_BROWSER_PASS simulated-touch dismissal, semantics, Tab containment', flush=True)
    context.close()

    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(html, wait_until='load')
    open_quick(page)
    page.locator('[data-action="kickoff"]').click()
    dialog = page.locator('#rotate')
    page.wait_for_function("!document.querySelector('#rotate').classList.contains('hidden')", timeout=5000)
    page.set_viewport_size({'width': 844, 'height': 390})
    page.wait_for_function("document.querySelector('#rotate').classList.contains('hidden')", timeout=5000)
    assert page.evaluate('document.activeElement?.id') == 'pauseBtn', 'landscape auto-hide left focus in hidden dialog'
    page.set_viewport_size({'width': 390, 'height': 844})
    page.wait_for_function("!document.querySelector('#rotate').classList.contains('hidden')", timeout=5000)
    assert page.evaluate('document.activeElement?.id') == 'dismissRotate', 'portrait re-entry did not focus the reopened prompt'
    page.locator('#dismissRotate').click()
    assert 'hidden' in (dialog.get_attribute('class') or '')
    assert page.evaluate('document.activeElement?.id') == 'pauseBtn', 'button dismissal did not restore visible game focus'
    assert not errors, errors
    print('UX26_ROTATE_PROMPT_FOCUS_BROWSER_PASS simulated-touch automatic orientation hide/reopen', flush=True)
    context.close()

    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=False, has_touch=False)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(html, wait_until='load')
    open_quick(page)
    page.locator('[data-action="kickoff"]').click()
    page.wait_for_timeout(120)
    assert 'hidden' in (page.locator('#rotate').get_attribute('class') or ''), 'desktop unexpectedly received the coarse-pointer prompt'
    assert not errors, errors
    print('UX26_ROTATE_PROMPT_FOCUS_BROWSER_PASS desktop unaffected', flush=True)
    context.close()
    browser.close()
