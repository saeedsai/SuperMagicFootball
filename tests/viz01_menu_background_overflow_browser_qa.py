"""VIZ-01/UX-101: background-only menu paint must not create scroll overflow."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/.generated/play.html'
assert FIXTURE.exists(), 'Build the modular browser fixture with scripts/build.py'
HTML = FIXTURE.read_text(encoding='utf-8')
SHOTS = ROOT / 'tests/.generated/ux101_menu_background_overflow'
SHOTS.mkdir(parents=True, exist_ok=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for label, width, height, mobile in [
        ('desktop', 1360, 800, False),
        ('phone390', 390, 844, True),
        ('narrow_phone', 320, 568, True),
    ]:
        context = browser.new_context(
            viewport={'width': width, 'height': height},
            is_mobile=mobile, has_touch=mobile, service_workers='block',
        )
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(HTML, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)

        def assert_menu_layout(screen):
            dimensions = page.locator('#menu').evaluate(
                """el=>{const r=el.getBoundingClientRect();return {
                  sw:el.scrollWidth,cw:el.clientWidth,sh:el.scrollHeight,ch:el.clientHeight,
                  overflow:Array.from(el.querySelectorAll('*')).map(n=>{const b=n.getBoundingClientRect();return {
                    tag:n.tagName,cls:String(n.className?.baseVal??n.className??'').slice(0,80),
                    action:n.getAttribute('data-action'),left:Math.round(b.left),right:Math.round(b.right),width:Math.round(b.width)
                  }}).filter(n=>n.right>r.left+el.clientWidth+1||n.left<r.left-1).slice(0,8)
                }}"""
            )
            assert dimensions['sw'] <= dimensions['cw'] + 1, (label, screen, 'no horizontal decorative scroll extent', dimensions)
            if not mobile:
                assert dimensions['sh'] <= dimensions['ch'] + 1, (label, screen, 'desktop menu fits viewport without decorative scroll', dimensions)
            # Mobile Home is intentionally a vertical page: the stadium/event
            # panel follows the menu and must remain reachable instead of being
            # clipped to one screen. Quick Match retains its own narrow-panel scroll.
            target = page.locator('.homeActionTiles [data-action="navSettings"]') if screen == 'home' else page.locator('#menu .navChoice').last
            target.scroll_into_view_if_needed()
            bounds = target.bounding_box()
            assert bounds and bounds['y'] >= -1 and bounds['y'] + bounds['height'] <= height + 1, (label, screen, 'final real control remains reachable', bounds)

        assert_menu_layout('home')
        page.screenshot(path=str(SHOTS / f'home_{label}.png'))
        page.locator('[data-action="navQuick"]').first.click()
        assert page.locator('.heading').inner_text() == 'QUICK MATCH'
        assert_menu_layout('quick-menu')
        page.screenshot(path=str(SHOTS / f'quick_{label}.png'))

        if label == 'narrow_phone':
            box = page.locator('#menu .menubox')
            before = box.evaluate('el=>el.scrollHeight-el.clientHeight')
            assert before > 0, (label, 'long phone menu remains internally vertically scrollable', before)
            last_choice = page.locator('#menu .navChoice').last
            last_choice.scroll_into_view_if_needed()
            bounds = last_choice.bounding_box()
            assert bounds['y'] >= 0 and bounds['y'] + bounds['height'] <= height, (label, 'last Quick Match route remains reachable', bounds)
            page.screenshot(path=str(SHOTS / f'quick_{label}_scrolled.png'))

        assert not errors, (label, errors)
        print('VIZ01_MENU_BACKGROUND_OVERFLOW_PASS', label,
              'viewport-only outer scroll; inner narrow-phone content remains reachable', flush=True)
        context.close()
    browser.close()
