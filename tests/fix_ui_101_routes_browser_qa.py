"""FIX-UI-101 real UI route / unsaved-form acceptance in Chromium."""
from atexit import register
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_bytes()
FAMILIES=['skin','hair','style','face','eyes','brows','eyeColor','nose','lips','body','stature','exaggeration','beard','accessory','freckles','scar','tattoo']
WALLET={'schema':1,'tokens':0,'unlocks':[f'{category}:{family}:{index}' for category in ['appearance','accessory'] for family in FAMILIES for index in range(64)],'receipts':[]}

class FixtureHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path in ('/', '/index.html'):
            self.send_response(200); self.send_header('Content-Type','text/html; charset=utf-8')
            self.send_header('Content-Length',str(len(HTML))); self.end_headers(); self.wfile.write(HTML); return
        super().do_GET()
    def log_message(self,*_args): pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(FixtureHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
register(server.server_close); register(server.shutdown)
ORIGIN=f'http://127.0.0.1:{server.server_port}/'

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    for label, mobile in [('desktop', False), ('simulated-touch', True)]:
        context = browser.new_context(
            viewport={'width': 1360, 'height': 800} if not mobile else {'width': 844, 'height': 390},
            is_mobile=mobile, has_touch=mobile,
        )
        context.add_init_script('localStorage.setItem("legend_tokenWallet",'+json.dumps(json.dumps(WALLET))+');')
        context.add_init_script("""
          window.__qaPadB=false;
          Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[
            {buttons:Array.from({length:16},(_,i)=>({pressed:i===1&&window.__qaPadB})),axes:[0,0]}
          ]});
        """)
        page = context.new_page()
        errors = []
        dialogs = []
        dialog_policy = {'accept': False}
        def handle_dialog(dialog):
            dialogs.append(dialog.message)
            if dialog_policy['accept']:
                dialog.accept()
            else:
                dialog.dismiss()
        page.on('dialog', handle_dialog)
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(ORIGIN, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)

        def click(action):
            page.locator('[data-action="' + action + '"]').first.click(timeout=30000)

        def back_with_confirm(trigger, accept):
            dialog_policy['accept'] = accept
            count = len(dialogs)
            trigger()
            assert len(dialogs) == count + 1, (label, 'Back must warn before discarding')
            assert 'Discard unsaved changes' in dialogs[-1], (label, dialogs[-1])

        # Player customization: Escape closes the nested gallery first, preserving form edits.
        click('navSettings')
        click('navCustomization')
        click('playerStudio')
        click('studioGalleryToggle')
        page.keyboard.press('Escape')
        assert page.locator('#studioEightViewGallery').count() == 0, (label, 'Escape closes gallery layer')
        assert page.locator('.heading').inner_text() == 'PLAYER CUSTOMIZATION', (label, 'gallery keeps editor')
        skin = page.locator('#face_skin')
        prior = skin.input_value()
        changed = skin.locator('option').nth(1).get_attribute('value')
        if changed == prior:
            changed = skin.locator('option').nth(2).get_attribute('value')
        skin.select_option(changed)
        back_with_confirm(lambda: page.locator('.row.space [data-action="navCustomization"]').click(), False)
        assert page.locator('.heading').inner_text() == 'PLAYER CUSTOMIZATION', (label, 'cancel stays in Studio')
        assert page.locator('#face_skin').input_value() == changed, (label, 'cancel preserves selection')
        back_with_confirm(lambda: page.locator('.row.space [data-action="navCustomization"]').click(), True)
        assert page.locator('.navScreen .heading').inner_text() == 'PLAYER & TEAM CUSTOMIZATION', (label, 'accepted Back returns to parent')

        # The raw roster textarea gets the same guard even while it has keyboard focus.
        click('editor')
        roster = page.locator('#jsonRoster')
        original = roster.input_value()
        roster.fill(original + ' ')
        back_with_confirm(lambda: page.keyboard.press('Escape'), False)
        assert page.locator('#jsonRoster').input_value() == original + ' ', (label, 'Escape Cancel preserves editor text')
        back_with_confirm(lambda: page.keyboard.press('Escape'), True)
        assert page.locator('.navScreen .heading').inner_text() == 'PLAYER & TEAM CUSTOMIZATION', (label, 'Escape accepts parent route')

        # Club builder Back via a touch-visible route and gamepad B both protect unsaved fields.
        click('clubs')
        page.locator('#clubName').fill('Unsaved ' + label)
        page.locator('#clubCode').fill('UNS')
        back_with_confirm(lambda: page.locator('.row.space [data-action="navCustomization"]').click(), False)
        assert page.locator('#clubName').input_value() == 'Unsaved ' + label, (label, 'visible Back Cancel preserves club form')
        dialog_policy['accept'] = False
        count = len(dialogs)
        page.evaluate('window.__qaPadB=true')
        page.wait_for_function('window.__qaPadB===true')
        page.wait_for_timeout(150)
        assert len(dialogs) == count + 1, (label, 'gamepad Back warns')
        assert 'Discard unsaved changes' in dialogs[-1], (label, dialogs[-1])
        page.evaluate('window.__qaPadB=false')
        page.wait_for_timeout(200)
        assert page.locator('#clubName').input_value() == 'Unsaved ' + label, (label, 'gamepad Cancel preserves club form')
        dialog_policy['accept'] = True
        count = len(dialogs)
        page.evaluate('window.__qaPadB=true')
        page.wait_for_timeout(150)
        assert len(dialogs) == count + 1, (label, 'gamepad Back confirms')
        assert 'Discard unsaved changes' in dialogs[-1], (label, dialogs[-1])
        page.evaluate('window.__qaPadB=false')
        assert page.locator('.navScreen .heading').inner_text() == 'PLAYER & TEAM CUSTOMIZATION', (label, 'gamepad accepted route')

        # Pause tactics keep the match paused and the edited plan on Cancel.
        page.locator('.row.space [data-action="navSettings"]').click()
        assert page.locator('.navScreen .heading').inner_text() == 'SETTINGS', (label, 'settings parent')
        page.locator('.row.space [data-action="home"]').click()
        click('quick')
        click('kickoff')
        page.wait_for_timeout(100)
        page.locator('#pauseBtn').click()
        click('tacticHome')
        select = page.locator('#defenceStyle')
        current = select.input_value()
        other = select.locator('option').filter(has_text='Deep Block').get_attribute('value')
        if other == current:
            other = select.locator('option').first.get_attribute('value')
        select.select_option(other)
        back_with_confirm(lambda: page.keyboard.press('Escape'), False)
        assert page.locator('#defenceStyle').input_value() == other, (label, 'pause Cancel preserves plan')
        back_with_confirm(lambda: page.keyboard.press('Escape'), True)
        assert page.locator('.heading').inner_text() == 'PAUSED', (label, 'tactics Back returns to pause')
        assert not errors, (label, errors)
        print('FIX_UI_101_BROWSER_PASS', label, 'Studio/gallery/editor/club/pause routes; visible, Escape and simulated gamepad Back; unsaved Cancel keeps forms', flush=True)
        context.close()
    browser.close()
