#!/usr/bin/env python3
"""Verify verified-tier locks and safe legacy controls in desktop/touch Player Studio."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from threading import Thread
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'tests/.generated/play.html'
assert HTML.exists(), 'Run scripts/build.py before browser QA'
SOURCE = HTML.read_text(encoding='utf-8')
TEAM_ID = json.loads((ROOT / 'data/teams.json').read_text(encoding='utf-8'))[0]['id']
ROLES = ['GK', 'GK', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW']
FIELDS = ['stamina', 'strength', 'aggression', 'defence', 'speedRating', 'agility', 'dribbling',
          'shootPower', 'shootAccuracy', 'heading', 'passing', 'crossing', 'gkDiving', 'gkSkill']
FIXTURE = [{
    'id': f'verified-tier-ui-{i}', 'name': f'Tier UI Player {i}', 'role': role,
    'num': i + 1, 'rating': 100, 'statsVerified': False,
    **({'magicTrick': 'banana'} if i == 2 else {}),
    **{field: 100 for field in FIELDS},
} for i, role in enumerate(ROLES)]
STORAGE_VALUE = json.dumps({TEAM_ID: FIXTURE})
STORAGE_SEED = json.dumps(STORAGE_VALUE)
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{server.server_port}/tests/.generated/play.html'

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    for name, viewport, touch in (
        ('desktop', {'width': 1280, 'height': 720}, False),
        ('simulated-touch', {'width': 844, 'height': 390}, True),
    ):
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        context.add_init_script(f"localStorage.setItem('legend_edits', {STORAGE_SEED});")
        page.goto(URL, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        open_feature(page, 'playerStudio')
        assert page.locator('#studioKeeperDefAbility').count() == 1, (name, 'goalkeeper Super Defence panel missing')
        assert page.locator('#studioKeeperDefAbility option').evaluate_all("nodes => nodes.map(option => option.value)") == ['keep', 'none'], (
            name, 'unverified goalkeeper must retain safe keep/remove options without receiving a new move'
        )
        assert page.locator('[data-action="saveStudioKeeperDefence"]').is_disabled(), (name, 'unchanged unverified goalkeeper should not write')
        assert page.locator('#studioKeeperDefTierGuide').get_attribute('role') == 'status'
        assert page.locator('#studioKeeperDefTierGuide').get_attribute('aria-live') == 'polite'
        page.locator('#studioKeeperDefAbility').select_option('none')
        assert page.locator('[data-action="saveStudioKeeperDefence"]').is_disabled(), (name, 'removing a nonexistent move must remain a no-op')

        found_df = False
        for index in range(12):
            page.locator('#customPlayer').select_option(str(index))
            if page.locator('#studioDefAbility').count():
                found_df = True
                break
        assert found_df, (name, 'DF panel missing')
        assert page.locator('#studioKeeperDefAbility').count() == 0, (name, 'keeper specialization selector should be scoped to keeper players')
        assert page.locator('#studioDefAbility option[value="keep"]').count() == 1
        assert page.locator('#studioDefAbility option[value="none"]').count() == 1
        assert page.locator('#studioDefAbility option[value="drill"]').count() == 0, (name, 'unverified DF receives a new move')
        current_defence_tier = page.locator('#studioDefTier').input_value()
        for level in range(1, 6):
            if str(level) != current_defence_tier:
                assert page.locator(f'#studioDefTier option[value="{level}"]').evaluate('(option)=>option.disabled'), (name, 'unverified tier option should be locked', level)
        assert page.locator('#studioDribble option[value="sideStep"]').is_enabled(), (name, 'basic style remains available')
        assert page.locator('#studioDribble option[value="roulette"]').evaluate('(option)=>option.disabled'), (name, 'unverified unique dribble is locked')
        assert page.locator('#studioDribble option[value="keep"]').count() == 1
        assert page.locator('#studioDribble option[value="none"]').count() == 1
        assert page.locator('#studioMagic option[value="keep"]').count() == 1
        page.locator('#studioMagic').select_option('banana')
        assert page.locator('[data-action="saveStudioMagic"]').is_disabled(), (name, 'unverified old Magic Trick grant should be disabled')
        page.locator('#studioMagic').select_option('keep')

        found_shot = False
        for index in range(12):
            page.locator('#customPlayer').select_option(str(index))
            if page.locator('#studioShotAbility').count():
                found_shot = True
                break
        assert found_shot, (name, 'outfield Super Shot panel missing')
        assert page.locator('#studioShotAbility option[value="keep"]').count() == 1
        assert page.locator('#studioShotAbility option[value="none"]').count() == 1
        assert page.locator('#studioShotAbility option').count() == 2, (name, 'unverified player received a new shot choice')
        assert page.locator('[data-action="saveStudioShot"]').is_disabled(), (name, 'unchanged unverified shot should not save')
        assert json.loads(page.evaluate("localStorage.getItem('legend_edits')")) == {TEAM_ID: FIXTURE}, (name, 'preview changed saved roster')
        assert page.locator('#touchButtons [data-act]').count() == 4
        assert not errors, (name, errors)
        print('STUDIO_VERIFIED_TIER_BROWSER_PASS', name,
              'keeper equip locks, safe keep/remove, field/keeper selector scope, shot/defence locks, basic Dribble, unique Dribble lock, old Trick lock, no preview writes', flush=True)
        context.close()
    browser.close()
server.shutdown()
