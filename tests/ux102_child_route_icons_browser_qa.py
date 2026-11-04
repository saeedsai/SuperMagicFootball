"""UX-102 regression for original child-route menu emblems."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import home

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'tests/.generated/play.html'
OUT = ROOT / 'tests/.generated'
SCREENS = [
    ('Quick Match', ['navQuick']),
    ('Online', ['navOnline']),
    ('Career', ['navCareer']),
    ('Leagues and Cups', ['navCups']),
    ('Settings', ['navSettings']),
    ('Customization', ['navSettings', 'navCustomization']),
    ('Input Settings', ['navSettings', 'navInput']),
    ('Save Management', ['navSettings', 'navSaveManagement']),
    ('Club Competitions', ['navCups', 'navClubs']),
    ('International', ['navCups', 'navInternational']),
]


def open_screen(page, route):
    home(page)
    for action in route:
        page.locator(f'[data-action="{action}"]').first.click()
    assert page.locator('.navScreen').count() == 1, route


def check_viewport(browser, name, config):
    page = browser.new_page(**config)
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.set_content(HTML.read_text(encoding='utf-8'), wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
    route_count = 0
    icon_count = 0
    for label, route in SCREENS:
        open_screen(page, route)
        cards = page.locator('.navScreen .navChoice')
        assert cards.count() > 0, (name, label)
        for card in [cards.nth(i) for i in range(cards.count())]:
            state = card.evaluate("""e => {
                const badge=e.querySelector('.navIcon'), svg=badge?.querySelector('svg');
                const r=badge?.getBoundingClientRect(), b=e.getBoundingClientRect();
                return {label:e.getAttribute('aria-label'),text:e.querySelector('.navCopy strong')?.textContent,
                  hidden:badge?.getAttribute('aria-hidden'),svgHidden:svg?.getAttribute('aria-hidden'),
                  focusable:svg?.getAttribute('focusable'),w:r?.width,h:r?.height,svgW:svg?.getBoundingClientRect().width,
                  left:b.left,right:b.right,action:e.dataset.action};
            }""")
            assert state['svgHidden'] == 'true' and state['focusable'] == 'false', (name, label, state)
            assert state['hidden'] == 'true' and state['svgW'] > 0, (name, label, state)
            assert state['w'] >= 29 and state['h'] >= 29, (name, label, state)
            assert state['label'].startswith(state['text']), (name, label, state)
            assert state['left'] >= -1 and state['right'] <= config['viewport']['width'] + 1, (name, label, state)
            icon_count += 1
        if route == ['navQuick']:
            page.screenshot(path=str(OUT / f'ux102_child_route_quick_{name}.png'))
        route_count += 1
    assert not errors, (name, errors)
    print(f'{name}: PASS {route_count} child menus, {icon_count} SVG badges, labels/routes intact, badges >=29px, no overflow/errors')
    page.close()
    return route_count, icon_count


def main():
    assert HTML.exists(), 'Build the current modular fixture first'
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        total_routes = total_icons = 0
        for name, config in [
            ('desktop-1280x800', {'viewport': {'width': 1280, 'height': 800}}),
            ('touch-390x844', {'viewport': {'width': 390, 'height': 844}, 'is_mobile': True, 'has_touch': True}),
            ('touch-320x568', {'viewport': {'width': 320, 'height': 568}, 'is_mobile': True, 'has_touch': True}),
        ]:
            routes, icons = check_viewport(browser, name, config)
            total_routes += routes
            total_icons += icons

        context = browser.new_context(viewport={'width': 1280, 'height': 800}, forced_colors='active')
        page = context.new_page()
        page.set_content(HTML.read_text(encoding='utf-8'), wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
        open_screen(page, ['navSettings', 'navCustomization'])
        badge = page.locator('.navScreen .navIcon').first.evaluate("""e => {
          const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor,border:s.borderTopColor,shadow:s.boxShadow};
        }""")
        assert badge['shadow'] == 'none' and badge['color'] and badge['background'] and badge['border'], badge
        print('forced-colors: PASS decorative child-route badge uses system colors with no shadow')
        context.close()

        context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True,
                                      has_touch=True, reduced_motion='reduce')
        page = context.new_page()
        page.set_content(HTML.read_text(encoding='utf-8'), wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
        open_screen(page, ['navQuick'])
        motion = page.locator('.navScreen .navIcon svg').first.evaluate("""e => ({
            media:matchMedia('(prefers-reduced-motion: reduce)').matches,
            animation:getComputedStyle(e).animationDuration,
            transition:getComputedStyle(e.closest('.navChoice')).transitionDuration
        })""")
        assert motion['media'] and float(motion['animation'][:-1]) <= .001 and float(motion['transition'][:-1]) == 0, motion
        print('reduced-motion: PASS child-route emblems remain static and card transition is disabled')
        context.close()
        browser.close()
    print(f'TOTAL: {total_routes} route/viewport checks, {total_icons} child-route SVG instances')


if __name__ == '__main__':
    main()
