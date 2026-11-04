"""VIZ-02: menu Up/Down focus follows visible grid rows at desktop and touch sizes."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build the modular browser fixture with scripts/build.py'
html=fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                               args=['--no-sandbox','--disable-dev-shm-usage'])
    for label,viewport,mobile in [
        ('desktop',{'width':1280,'height':720},False),
        ('simulated-touch',{'width':390,'height':844},True),
    ]:
        context=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
        page=context.new_page();errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(html,wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
        assert page.evaluate("document.activeElement?.dataset.action")=='navQuick',(label,'home default focus')

        page.keyboard.press('ArrowDown')
        assert page.evaluate("document.activeElement?.dataset.action")=='navOnline',(label,'first row transition')
        page.keyboard.press('ArrowDown')
        expected='navCareer'
        assert page.evaluate("document.activeElement?.dataset.action")==expected,(label,'Down must follow the visible column',expected)

        if label=='desktop':
            page.keyboard.press('ArrowUp')
            assert page.evaluate("document.activeElement?.dataset.action")=='navOnline',(label,'Up must return to the row above')
            page.keyboard.press('ArrowDown')
            assert page.evaluate("document.activeElement?.dataset.action")=='navCareer'
            page.keyboard.press('Enter')
            assert page.locator('.heading').inner_text()=='CAREER',(label,'focused item activates')
        else:
            # In the one-column touch layout, verify an on-screen target can be tapped.
            career=page.locator('[data-action=navCareer]')
            rect=career.evaluate('(el)=>{const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,top:r.top,bottom:r.bottom}}')
            assert 0<=rect['top'] and rect['bottom']<=viewport['height'],(label,'Career target is reachable without horizontal overflow',rect)
            page.touchscreen.tap(rect['x'],rect['y'])
            assert page.locator('.heading').inner_text()=='CAREER',(label,'touch target activates')

        assert not errors,(label,errors)
        print('VIZ02_MENU_FOCUS_PASS',label,'screen-relative vertical focus, reachable category control',flush=True)
        context.close()
    browser.close()
