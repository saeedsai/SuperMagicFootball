"""Real Chromium keyboard and CDP touch re-press validation for four-button DRIBBLE."""
from pathlib import Path

from menu_test_routes import open_quick
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def state(page):
    return page.evaluate("""() => {
      const i=SupermagicFootball.game.input;
      return {just:i.just(0,'dribble'),held:i.held(0,'dribble'),
              release:i.released(0,'dribble'),
              pending:i.touchPending.has('dribble'),
              releases:i.touchReleasePending.has('dribble'),
              count:document.querySelectorAll('#touchButtons button[data-act]').length};
    }""")


def poll(page):
    page.evaluate("SupermagicFootball.game.input.poll()")
    return state(page)


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    for mode, mobile, width, height in [('desktop', False, 1280, 720),
                                       ('android-touch', True, 844, 390)]:
        ctx = browser.new_context(viewport={'width': width, 'height': height},
                                  is_mobile=mobile, has_touch=mobile)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.set_content((ROOT / 'play.html').read_text(), wait_until='load')
        page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'")
        open_quick(page)
        page.locator('[data-action="kickoff"]').first.click()
        # Disable automatic frame polling; explicit polls isolate the exact
        # release+repress-between-frames window without changing game controls.
        page.evaluate("""() => {
          const g=SupermagicFootball.game;
          g.matchState='paused';
          g.input.cancelAll();
          g.input.reset();
        }""")
        assert state(page)['count'] == 4, (mode, 'four-button contract')

        if mobile:
            rect = page.locator('#touchButtons button[data-act="dribble"]').bounding_box()
            assert rect, (mode, 'missing touch DRIBBLE button')
            x, y = rect['x'] + rect['width'] / 2, rect['y'] + rect['height'] / 2
            cdp = ctx.new_cdp_session(page)

            def down(n):
                cdp.send('Input.dispatchTouchEvent', {
                    'type': 'touchStart', 'touchPoints': [{'id': n, 'x': x, 'y': y}]})

            def up():
                cdp.send('Input.dispatchTouchEvent', {
                    'type': 'touchEnd', 'touchPoints': []})

            down(21)
            first = poll(page)
            assert first['just'] and first['held'], (mode, 'initial tap missing', first)

            # The first release and the second press occur before the next poll.
            up()
            down(22)
            edge = poll(page)
            assert edge['just'] and edge['held'], (mode, 'second tap edge lost', edge)
            held = poll(page)
            assert not held['just'] and held['held'], (mode, 'duplicate hold edge', held)
            up()
            released = poll(page)
            assert released['release'] and not released['just'], (
                mode, 'release missing', released)

            # Both rapid completed taps happen between polls: existing backlog
            # must dispatch both edges exactly once, not squash the second.
            down(23)
            up()
            down(24)
            up()
            assert poll(page)['just'], (mode, 'queued tap #1 missing')
            assert poll(page)['just'], (mode, 'queued tap #2 missing')
            assert not poll(page)['just'], (mode, 'queued taps repeated')
        else:
            page.keyboard.down('i')
            assert poll(page)['just'], (mode, 'keyboard press lost')
            assert not poll(page)['just'], (mode, 'keyboard repeat')
            page.keyboard.up('i')
            assert poll(page)['release'], (mode, 'keyboard release lost')
        assert not errors, (mode, errors)
        print(mode, 'PASS: four buttons, genuine input edges, no page errors', flush=True)
        ctx.close()
    browser.close()
