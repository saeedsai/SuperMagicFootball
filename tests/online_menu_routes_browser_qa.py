"""The Home Online route must expose the implemented Internet P2P and LAN matches."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf-8')
SHOTS = ROOT / 'tests/.generated/online_menu_routes'
SHOTS.mkdir(parents=True, exist_ok=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch(
        executable_path=shutil.which('chromium') or None,
        headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage'],
    )
    for label, viewport, mobile in [
        ('desktop', {'width': 1360, 'height': 850}, False),
        ('simulated-touch', {'width': 390, 'height': 844}, True),
    ]:
        page = browser.new_page(viewport=viewport, is_mobile=mobile, has_touch=mobile)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(HTML, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)

        online_home = page.locator('.navMainList [data-action="navOnline"]')
        assert online_home.count() == 1, (label, 'single Online home action')
        assert 'planned for later' not in online_home.inner_text().lower(), (label, 'accurate home description')
        assert online_home.locator('.navStatus').inner_text() != 'LATER', (label, 'enabled home action')
        page.screenshot(path=str(SHOTS / f'{label}_home.png'))
        online_home.click()

        assert page.locator('.heading').inner_text() == 'ONLINE MATCHES', (label, 'online submenu heading')
        page.screenshot(path=str(SHOTS / f'{label}_online_menu.png'))
        for action in ('navOnlineP2P', 'navLan'):
            choice = page.locator(f'[data-action="{action}"]')
            assert choice.count() == 1, (label, action, 'implemented match route')
            assert choice.locator('.navStatus').inner_text() == '›', (label, action, 'enabled match route')

        page.locator('[data-action="navOnlineP2P"]').click()
        assert page.locator('#autoHost').count() == 1, (label, 'Internet P2P host action')
        assert page.locator('#autoFind').count() == 1, (label, 'Internet P2P find action')
        page.keyboard.press('Escape')
        assert page.locator('.heading').inner_text() == 'ONLINE MATCHES', (label, 'back to online submenu')
        assert page.evaluate('document.activeElement?.dataset.action') == 'navOnlineP2P', (label, 'P2P selection focus restored')

        page.locator('[data-action="navLan"]').click()
        assert page.locator('#autoHost').count() == 1, (label, 'LAN host action')
        assert page.locator('#autoFind').count() == 1, (label, 'LAN find action')
        page.keyboard.press('Escape')
        assert page.locator('.heading').inner_text() == 'ONLINE MATCHES', (label, 'LAN back to online submenu')
        assert page.evaluate('document.activeElement?.dataset.action') == 'navLan', (label, 'LAN selection focus restored')

        page.locator('.navBack').click()
        page.locator('[data-action="navCustomization"]').click()
        page.locator('[data-action="editor"]').click()
        editor_text = page.locator('.panel').nth(1).inner_text()
        assert 'Playable features include offline matches, Career, LAN and Online P2P Quick Match.' in editor_text, (label, 'Player Data Editor matches implemented modes')
        assert 'Online play, the career economy' not in editor_text, (label, 'no stale unavailable-mode claim')
        assert not errors, (label, errors)
        print('ONLINE_MENU_ROUTES_PASS', label, 'Internet P2P and LAN are reachable; editor feature copy is accurate', flush=True)
        page.close()
    browser.close()
