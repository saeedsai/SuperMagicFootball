#!/usr/bin/env python3
"""LAN29 lobby: announce guest approval requests without stealing keyboard focus."""
import json
import re
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build the current game fixture first'
html = fixture.read_text(encoding='utf-8')
room_id = 'room_12345678'
signal = {}

with sync_playwright() as pw:
    browser = pw.chromium.launch(
        headless=True,
        executable_path=shutil.which('chromium') or None,
        args=['--no-sandbox', '--disable-dev-shm-usage'],
    )
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def on_socket(ws):
        signal['socket'] = ws

        def receive(message):
            packet = json.loads(message)
            if packet.get('type') == 'host':
                signal['room'] = packet['roomId']
                ws.send(json.dumps({'type': 'host-registered', 'roomId': packet['roomId']}))

        ws.on_message(receive)

    page.route_web_socket(re.compile(r'.*/lan-signal(?:\?.*)?$'), on_socket)
    page.set_content(html, wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
    page.locator('[data-action="navQuick"]').first.click()
    page.locator('[data-action="navLan"]').first.click()
    page.locator('#autoHost').wait_for()
    page.locator('#autoHost').click()
    page.wait_for_function("document.querySelector('#autoStatus')?.textContent.includes('Room registered')", timeout=10000)
    assert isinstance(signal.get('room'), str) and signal['room'].startswith('room_'), signal
    room_id = signal['room']

    # A new consent prompt must be announced by the existing live region while
    # leaving the host's current focus alone; the response controls follow it in tab order.
    active_before = page.evaluate('document.activeElement?.id')
    signal['socket'].send(json.dumps({
        'type': 'join-request', 'roomId': room_id,
        'requestId': 'request_12345678', 'guestName': 'Ada',
    }))
    status = page.locator('#autoStatus')
    status.wait_for()
    page.wait_for_function("document.querySelector('#autoStatus')?.textContent.includes('Ada wants to join')")
    assert status.get_attribute('role') == 'status'
    assert status.get_attribute('aria-live') == 'polite'
    assert status.get_attribute('aria-atomic') == 'true'
    assert status.inner_text() == 'Ada wants to join your match. Use Accept Guest or Reject to respond.'
    assert page.evaluate('document.activeElement?.id') == active_before == 'autoHost', 'incoming consent request must not steal focus'
    choices = page.locator('#autoApproval button')
    assert choices.count() == 2
    assert [choices.nth(i).inner_text() for i in range(2)] == ['ACCEPT GUEST', 'REJECT']
    for expected in ['autoFind', 'autoReset', 'lanManualFallback']:
        page.keyboard.press('Tab')
        actual = page.evaluate('document.activeElement?.id')
        assert actual == expected, ('keyboard tab order', expected, actual, page.evaluate('document.activeElement?.outerHTML'))
    page.keyboard.press('Tab')
    assert page.evaluate("document.activeElement?.textContent") == 'ACCEPT GUEST'
    page.keyboard.press('Tab')
    assert page.evaluate("document.activeElement?.textContent") == 'REJECT'
    assert not errors, errors
    print('LAN_AUTO_APPROVAL_ACCESSIBILITY_BROWSER_PASS', {
        'announcement': status.inner_text(), 'focusRetained': active_before,
        'nextTabTargets': ['autoFind', 'autoReset', 'ACCEPT GUEST'],
    })
    context.close()
    browser.close()
