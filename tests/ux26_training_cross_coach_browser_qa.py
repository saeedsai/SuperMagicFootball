#!/usr/bin/env python3
"""UX26: the Training Arena Cross coach follows real match state and controls."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build the current game fixture first'
html = fixture.read_text(encoding='utf-8')
storage_mock = """<script>(() => {const data=new Map();window.__storageWrites=[];Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:key=>data.has(String(key))?data.get(String(key)):null,setItem:(key,value)=>{window.__storageWrites.push(String(key));data.set(String(key),String(value));},removeItem:key=>{window.__storageWrites.push(String(key));data.delete(String(key));},clear:()=>{window.__storageWrites.push('*');data.clear();},key:index=>[...data.keys()][index]??null,get length(){return data.size;}}});})();</script>"""
html = html.replace('<head>', '<head>' + storage_mock, 1)

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
        if device == 'desktop':
            # At compact desktop heights the Home Training card must remain an
            # actual hit target above the bottom utility dock.
            page.locator('[data-action="training"]').click()
            assert page.locator('.menubox .heading').first.inner_text() == 'TRAINING ARENA'
            page.set_content(html, wait_until='load')
            page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        writes_before = page.evaluate('window.__storageWrites.length')
        # Validate the coach through the same stable Quick Match path on both
        # devices after the compact-desktop Home shortcut assertion above.
        page.locator('[data-action="navQuick"]').click()
        page.locator('[data-action="navOnDevice"]').click()
        page.locator('[data-action="training"]').click()
        page.locator('[data-action="kickoff"]').click()
        coach = page.locator('#trainingCrossCoach')
        assert coach.get_attribute('role') == 'status'
        assert coach.get_attribute('aria-live') == 'polite'
        assert page.evaluate('SupermagicFootball.game.mode') == 'training'
        assert 'STEP 1' in coach.inner_text() and 'Space' in coach.inner_text()

        # Seed a valid airborne carrier so CPU pressure and kickoff cooldown do
        # not make this control-level acceptance flaky. The Cross itself is
        # still produced through the real mapped keyboard/touch Pass input.
        page.evaluate("""(() => {
          const game=SupermagicFootball.game, player=game.controlledPlayer(0);
          player.x=250; player.y=280; player.z=300; player.vz=0;
          player.stun=0; player.invuln=20; player.action='idle'; game.ball.owner=player; game.cooldown=0;
          game.humans=2;
          for(const foe of game.players.filter(candidate=>candidate.t===1)){foe.x=2200;foe.y=240+foe.i*115;}
        })();""")
        page.wait_for_function("document.querySelector('#trainingCrossCoach').textContent.includes('STEP 2')", timeout=4000)
        assert 'PASS' in coach.inner_text()

        if touch:
            page.locator('[data-act="pass"]').tap()
        else:
            page.keyboard.down('k')
            page.wait_for_timeout(80)
            page.keyboard.up('k')
        try:
            page.wait_for_function("document.querySelector('#trainingCrossCoach').textContent.includes('Cross complete!')", timeout=4000)
        except Exception as error:
            state = page.evaluate("""(() => {const g=SupermagicFootball.game,p=g.controlledPlayer(0);return {
              coach:document.querySelector('#trainingCrossCoach').textContent,
              player:{z:p?.z,stun:p?.stun,action:p?.action},owner:g.ball.owner?.src?.id,
              passEvents:g.events.filter(e=>e.type==='passIntent').map(e=>({team:e.team,loft:e.loft,mode:e.mode})).slice(-3)
            }})()""")
            raise AssertionError(f'{device}: Cross did not complete: {state}') from error
        page.screenshot(path=str(ROOT / f'tests/training_cross_coach_{device}.png'))
        assert page.evaluate('SupermagicFootball.game.matchState') == 'play'
        assert page.evaluate('window.__storageWrites.length') == writes_before, 'training practice must not write saves'
        assert page.locator('[data-act]').count() == 4, 'the four existing action controls remain'
        assert not errors, (device, errors)
        print('UX26_TRAINING_CROSS_COACH_BROWSER_PASS', device)
        context.close()
    browser.close()
