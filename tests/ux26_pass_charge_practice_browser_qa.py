"""UX26 isolated PASS charge lesson on desktop and simulated touch Chromium."""
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
        practice = page.locator('[data-pass-charge-practice]')
        status = page.locator('#passChargePracticeStatus')
        elapsed = page.locator('#passChargePracticeElapsed')
        cross = page.locator('#guidedCrossStatus')
        assert practice.count() == 1, (device, 'PASS charge control')
        assert status.get_attribute('role') == 'status'
        assert status.get_attribute('aria-live') == 'polite'
        assert status.get_attribute('aria-atomic') == 'true'
        assert elapsed.get_attribute('aria-live') == 'off'
        assert '0 of 4 touch controls checked' in page.locator('#touchHelpPracticeStatus').inner_text()
        assert cross.inner_text() == 'Step 1 of 2: press JUMP, then PASS while airborne.'
        assert 'Hold and release to measure your PASS hold' in status.inner_text()

        if not touch:
            # Default P1 PASS is K; the lesson observes down/up without invoking gameplay.
            page.keyboard.down('k')
            assert 'practice started' in status.inner_text().lower()
            assert cross.inner_text() == 'Step 1 of 2: press JUMP, then PASS while airborne.', 'a held PASS charge must not falsely advance Cross practice'
            page.wait_for_timeout(250)
            visible_hold = elapsed.inner_text()
            assert float(visible_hold.split()[0]) > 0, (device, visible_hold)
            page.keyboard.up('k')
            assert 'practice complete' in status.inner_text().lower()
            assert 'No pass was sent here.' in status.inner_text()
            assert cross.inner_text() == 'Step 1 of 2: start with JUMP, then use PASS while airborne.', 'Cross feedback waits for PASS release'
            announced = float(status.inner_text().split('held for ')[1].split(' seconds')[0])
            rendered = float(elapsed.inner_text().split()[0])
            assert abs(announced - rendered) < 0.005, (device, announced, rendered)

            # Window focus loss aborts an active keyboard gesture and its later keyup cannot complete it.
            page.keyboard.down('k')
            page.evaluate("window.dispatchEvent(new Event('blur'))")
            assert status.inner_text() == 'PASS practice cancelled; no pass was sent.'
            page.keyboard.up('k')
            assert 'cancelled' in status.inner_text().lower()

            # Leaving Controls cancels the held lesson before its content is replaced.
            page.evaluate("window.__passPracticeMessages=[]; new MutationObserver(records=>window.__passPracticeMessages.push(...records.map(r=>r.target.textContent))).observe(document.querySelector('#passChargePracticeStatus'),{childList:true,characterData:true,subtree:true})")
            page.keyboard.down('k')
            back = page.locator('#menu .row.space [data-action]').first
            assert back.get_attribute('data-action') == 'navSettings', 'exercise the Help → Settings Back route through menuChoices/show'
            back.click()
            assert page.locator('#menu .heading').inner_text() == 'SETTINGS', 'Back must reach the settings menu'
            page.keyboard.up('k')
            messages = page.evaluate('window.__passPracticeMessages')
            assert any('practice cancelled' in message.lower() for message in messages), (device, messages)
            assert not any('practice complete' in message.lower() for message in messages), (device, messages)
            page.locator('[data-action="help"]').click()
            assert page.locator('#menu .heading').inner_text() == 'CONTROLS'
        else:
            # Dispatch a touch-flavoured pointer pair on the actual help control. It is
            # intentionally outside Input so no match action or queued pulse is produced.
            practice.evaluate("el => el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:41,pointerType:'touch',button:0,buttons:1}))")
            assert 'practice started' in status.inner_text().lower()
            page.wait_for_timeout(240)
            assert float(elapsed.inner_text().split()[0]) > 0, (device, elapsed.inner_text())
            practice.evaluate("el => el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:41,pointerType:'touch',button:0,buttons:0}))")
            assert 'practice complete' in status.inner_text().lower()
            assert 'No pass was sent here.' in status.inner_text()

            practice.evaluate("el => el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:42,pointerType:'touch',button:0,buttons:1}))")
            practice.evaluate("el => el.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:42,pointerType:'touch',button:0,buttons:0}))")
            assert status.inner_text() == 'PASS practice cancelled; no pass was sent.'

        assert page.locator('[data-action="kickoff"]').count() == 0, (device, 'practice never starts a match')
        assert page.locator('#menu .heading').inner_text() == 'CONTROLS'
        assert '0 of 4 touch controls checked' in page.locator('#touchHelpPracticeStatus').inner_text(), 'PASS lesson must not mark four-action touch checks'
        assert not errors, (device, errors)
        print('UX26_PASS_CHARGE_PRACTICE_BROWSER_PASS', device, 'measured hold, completion, cancellation, no gameplay action', flush=True)
        context.close()
    browser.close()
