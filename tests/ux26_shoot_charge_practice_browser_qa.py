"""UX26 mapped Shoot-charge lesson: keyboard/touch measurement, cancellation, no match dispatch."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

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
        open_feature(page, 'help')
        practice = page.locator('[data-shoot-charge-practice]')
        status = page.locator('#shootChargePracticeStatus')
        elapsed = page.locator('#shootChargePracticeElapsed')
        pass_status = page.locator('#passChargePracticeStatus')
        assert practice.count() == 1
        assert status.get_attribute('role') == 'status'
        assert status.get_attribute('aria-live') == 'polite'
        assert status.get_attribute('aria-atomic') == 'true'
        assert elapsed.get_attribute('aria-live') == 'off'
        assert 'Hold and release to measure your SHOOT hold' in status.inner_text()
        initial_match_state = page.evaluate('SupermagicFootball.game.matchState')

        if not touch:
            # Default Player 1 SHOOT is J; this observes key edges but never calls Input/game.
            page.keyboard.down('j')
            assert 'practice started' in status.inner_text().lower()
            assert 'practice started' not in pass_status.inner_text().lower()
            page.wait_for_timeout(250)
            assert float(elapsed.inner_text().split()[0]) > 0
            page.keyboard.up('j')
            assert 'practice complete' in status.inner_text().lower()
            assert 'No shot was sent here.' in status.inner_text()
            duration = float(status.inner_text().split('held for ')[1].split(' seconds')[0])
            assert abs(duration - float(elapsed.inner_text().split()[0])) < 0.005

            page.keyboard.down('j')
            page.evaluate('window.dispatchEvent(new Event("blur"))')
            assert status.inner_text() == 'SHOOT practice cancelled; no shot was sent.'
            page.keyboard.up('j')

            # Route Back clears an active SHOOT lesson before replacing the help DOM.
            page.evaluate('window.__shootPracticeMessages=[]; new MutationObserver(records=>window.__shootPracticeMessages.push(...records.map(r=>r.target.textContent))).observe(document.querySelector("#shootChargePracticeStatus"),{childList:true,characterData:true,subtree:true})')
            page.keyboard.down('j')
            back = page.locator('#menu .row.space [data-action]').first
            assert back.get_attribute('data-action') == 'navSettings'
            back.click()
            assert page.locator('#menu .heading').inner_text() == 'SETTINGS'
            page.keyboard.up('j')
            messages = page.evaluate('window.__shootPracticeMessages')
            assert any('cancelled' in message.lower() for message in messages), messages
            assert not any('complete' in message.lower() for message in messages), messages
            page.locator('[data-action="help"]').click()
            assert page.locator('#menu .heading').inner_text() == 'CONTROLS'
        else:
            practice.evaluate("el => el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:51,pointerType:'touch',button:0,buttons:1}))")
            assert 'practice started' in status.inner_text().lower()
            page.wait_for_timeout(240)
            assert float(elapsed.inner_text().split()[0]) > 0
            practice.evaluate("el => el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:51,pointerType:'touch',button:0,buttons:0}))")
            assert 'practice complete' in status.inner_text().lower()
            assert 'No shot was sent here.' in status.inner_text()

            practice.evaluate("el => el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:52,pointerType:'touch',button:0,buttons:1}))")
            practice.evaluate("el => el.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:52,pointerType:'touch',button:0,buttons:0}))")
            assert status.inner_text() == 'SHOOT practice cancelled; no shot was sent.'

            practice.evaluate("el => el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:53,pointerType:'touch',button:0,buttons:1}))")
            practice.evaluate("el => el.dispatchEvent(new PointerEvent('lostpointercapture',{bubbles:true,pointerId:53,pointerType:'touch',button:0,buttons:0}))")
            assert status.inner_text() == 'SHOOT practice cancelled; no shot was sent.'

        assert page.evaluate('SupermagicFootball.game.matchState') == initial_match_state
        assert page.locator('[data-action="kickoff"]').count() == 0
        assert page.locator('#menu .heading').inner_text() == 'CONTROLS'
        assert not errors, (device, errors)
        print('UX26_SHOOT_CHARGE_PRACTICE_BROWSER_PASS', device, 'mapped hold, completion, cancellation, no match dispatch', flush=True)
        context.close()
    browser.close()
