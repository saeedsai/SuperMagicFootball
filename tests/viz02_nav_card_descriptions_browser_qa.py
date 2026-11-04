"""VIZ-02: child-route labels retain names and expose their existing descriptions."""
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
    ('Leagues & Cups', ['navCups']),
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


def check_dom_links(page, label, route, width):
    open_screen(page, route)
    cards = page.locator('.navScreen .navChoice')
    assert cards.count() > 0, (label, route)
    for card in [cards.nth(i) for i in range(cards.count())]:
        state = card.evaluate("""e => {
            const id=e.getAttribute('aria-describedby'), description=id&&document.getElementById(id);
            const r=e.getBoundingClientRect();
            return {name:e.getAttribute('aria-label'),descriptionId:id,
              description:description?.textContent?.trim(),action:e.dataset.action,
              left:r.left,right:r.right,iconHidden:e.querySelector('.navIcon')?.getAttribute('aria-hidden')};
        }""")
        assert state['name'] and state['descriptionId'] and state['description'], (label, route, state)
        # CSS intentionally uppercases the visible card title; compare the
        # accessible name and displayed text without making casing a mismatch.
        visible_label = card.locator('.navCopy strong').inner_text().strip()
        assert state['name'].casefold().startswith(visible_label.casefold()), (label, route, state)
        assert state['action'] and state['iconHidden'] == 'true', (label, route, state)
        assert state['left'] >= -1 and state['right'] <= width + 1, (label, route, state)
    return cards.count()


def main():
    assert HTML.exists(), 'Build the modular browser fixture first'
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        errors = []
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.on('pageerror', lambda err: errors.append(str(err)))
        page.set_content(HTML.read_text(encoding='utf-8'), wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
        cdp = page.context.new_cdp_session(page)
        seen = 0
        for label, route in SCREENS:
            count = check_dom_links(page, label, route, 1280)
            for index in range(count):
                object_id = cdp.send('Runtime.evaluate', {
                    'expression': f'document.querySelectorAll(".navScreen .navChoice")[{index}]',
                    'returnByValue': False,
                })['result']['objectId']
                nodes = cdp.send('Accessibility.getPartialAXTree', {
                    'objectId': object_id, 'fetchRelatives': False,
                })['nodes']
                ax = next((node for node in nodes if node.get('role', {}).get('value') == 'button'), None)
                assert ax is not None, (label, index, nodes)
                card = page.locator('.navScreen .navChoice').nth(index)
                expected_name = card.get_attribute('aria-label')
                expected_description = card.locator('.navCopy small').inner_text()
                assert ax.get('name', {}).get('value') == expected_name, (label, index, ax)
                assert ax.get('description', {}).get('value') == expected_description, (label, index, ax)
                seen += 1
        assert not errors, errors
        open_screen(page, ['navQuick'])
        page.screenshot(path=str(OUT / 'viz02_nav_descriptions_desktop.png'))
        page.keyboard.press('Enter')
        assert page.locator('.heading').inner_text() == 'ON DEVICE', 'keyboard activation route changed'
        print(f'desktop 1280x800: PASS {len(SCREENS)} menus, {seen} Chrome AX nodes preserve button names and expose descriptions; keyboard activation route unchanged')
        page.close()

        for label, viewport in [('touch-390x844', (390, 844)), ('touch-320x568', (320, 568))]:
            context = browser.new_context(viewport={'width': viewport[0], 'height': viewport[1]},
                                          is_mobile=True, has_touch=True)
            page = context.new_page()
            page.on('pageerror', lambda err: errors.append(str(err)))
            page.set_content(HTML.read_text(encoding='utf-8'), wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
            items = 0
            for name, route in SCREENS:
                items += check_dom_links(page, name, route, viewport[0])
            open_screen(page, ['navQuick'])
            if label == 'touch-320x568':
                page.screenshot(path=str(OUT / 'viz02_nav_descriptions_touch-320x568.png'))
            first = page.locator('.navScreen .navChoice').first
            bounds = first.evaluate("e=>{const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,top:r.top,bottom:r.bottom}}")
            assert 0 <= bounds['top'] and bounds['bottom'] <= viewport[1], (label, bounds)
            page.touchscreen.tap(bounds['x'], bounds['y'])
            assert page.locator('.heading').inner_text() == 'ON DEVICE', (label, 'touch route changed')
            assert not errors, (label, errors)
            print(f'{label}: PASS {len(SCREENS)} menu structure checks, {items} name/description links, touch activation unchanged')
            context.close()
        browser.close()


if __name__ == '__main__':
    main()
