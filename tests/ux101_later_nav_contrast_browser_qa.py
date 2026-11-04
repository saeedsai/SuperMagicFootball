"""UX-101 contrast audit for planned entries in secondary navigation routes."""
from pathlib import Path
import re

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf-8')
COLOR_RE = re.compile(r'rgba?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)(?:,\s*([\d.]+))?\)')


def luminance(rgb):
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb]
    return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2]


def contrast(foreground, background):
    high, low = sorted((luminance(foreground), luminance(background)), reverse=True)
    return (high + .05) / (low + .05)


def rgb(color):
    match = COLOR_RE.fullmatch(color or '')
    assert match, ('expected computed RGB color', color)
    return tuple(float(match.group(i)) / 255 for i in (1, 2, 3))


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    for device, viewport, touch in (
        ('desktop', {'width': 1280, 'height': 800}, False),
        ('simulated-touch', {'width': 844, 'height': 390}, True),
    ):
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(HTML, wait_until='load')

        def ready():
            # The game's bootstrap is asynchronous after set_content. Waiting for
            # its public game object also guarantees the home controls are mounted.
            page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)

        ready()

        def click(action):
            page.locator(f'[data-action="{action}"]').first.click()

        def open_route(route):
            page.set_content(HTML, wait_until='load')
            ready()
            click('navCups')
            if route != 'cups':
                click('navInternational' if route == 'international' else 'navClubs')

        routes = ('online', 'cups', 'international', 'clubs')
        for route in routes:
            if route == 'online':
                page.set_content(HTML, wait_until='load')
                ready()
                click('navOnline')
            else:
                open_route(route)
            later = page.locator('.navLater').first
            assert later.count() == 1, (device, route, 'planned entry exists')
            status = later.locator('.navStatus')
            assert 'LATER' in status.inner_text().upper() or 'COMING LATER' in status.inner_text().upper(), (device, route, status.inner_text())

            if touch:
                # Force the browser's keyboard-focus-visible state on a touch viewport.
                page.evaluate('document.activeElement?.blur()')
                later.evaluate('(n)=>n.focus({focusVisible:true})')
                assert later.evaluate('(n)=>n===document.activeElement && n.matches(":focus-visible")'), (device, route, 'keyboard focus reaches planned card')
            else:
                later.hover()

            styles = page.evaluate('''() => {
              const button=document.querySelector('.navLater'), text=button.querySelector('.navStatus');
              const a=getComputedStyle(button), b=getComputedStyle(text);
              return {background:a.backgroundImage,opacity:a.opacity,color:b.color,focused:button.matches(':focus-visible'),hovered:button.matches(':hover')};
            }''')
            stops = [rgb_text for rgb_text in COLOR_RE.findall(styles['background'])]
            background_colors = [tuple(float(v) / 255 for v in stop[:3]) for stop in stops]
            foreground = rgb(styles['color'])
            ratios = [contrast(foreground, color) for color in background_colors]
            assert ratios and min(ratios) >= 4.5, (device, route, styles, ratios)
            assert styles['opacity'] == '1', (device, route, 'focused/hovered planned card should not dim its label', styles)
            assert styles['focused'] if touch else styles['hovered'], (device, route, 'interaction state applied', styles)
            print('UX101_LATER_NAV_CONTRAST_PASS', device, route, f'{min(ratios):.2f}:1', flush=True)
        assert not errors, (device, errors)
        context.close()
    browser.close()
