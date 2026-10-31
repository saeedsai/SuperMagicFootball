from menu_test_routes import open_quick,open_settings
"""Real Chromium input edge QA: sub-frame taps, overlapping touch buttons, quick Pass/Switch."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil
root=Path(__file__).resolve().parents[1]
markup=(root/'play.html').read_text()
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    for label,mobile,view in [('desktop',False,(1360,820)),('android',True,(900,420))]:
        context=browser.new_context(viewport={'width':view[0],'height':view[1]},is_mobile=mobile,has_touch=mobile)
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(markup,wait_until='load')
        page.wait_for_function("!!window.SupermagicFootball?.game")
        open_quick(page)
        page.locator('[data-action="kickoff"]').first.click()
        assert page.locator('#touchButtons [data-act]').count()==4
        page.evaluate('''()=>{let g=SupermagicFootball.game;g.matchState='paused';g.cooldown=0;g.input.reset();g.input.keys.clear();g.input.keyPending.clear();g.input.touchPending.clear();g.input.touchButtons.clear();g.input.touchPointers.clear();}''')
        if mobile:
            cdp=context.new_cdp_session(page)
            def pt(k,id):
                b=page.locator(f'#touchButtons [data-act="{k}"]').bounding_box()
                return {'id':id,'x':b['x']+b['width']/2,'y':b['y']+b['height']/2}
            def fast_tap(k,id):
                cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[pt(k,id)]})
                cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            fast_tap('pass',10)
        else:
            page.keyboard.down('k');page.keyboard.up('k')
        status=page.evaluate('''()=>{const i=SupermagicFootball.input;i.poll();let a={first:i.just(0,'pass'),held:i.held(0,'pass')};i.poll();a.second=i.held(0,'pass');return a}''')
        assert status=={'first':True,'held':True,'second':False},(label,'short pass lost',status,errors)
        # Ensure the action reaches the engine and does not merely change an input flag.
        page.evaluate('''()=>{let g=SupermagicFootball.game,p=g.player(0,3);g.cooldown=0;g.take(p);g.controlled[0]=p.i;p.cd=0;p.passHold=0;p.passUsed=false;p.stun=0;for(const q of g.players){if(q.t===1){q.x=3000;q.y=1100;}}}''')
        if mobile:fast_tap('pass',11)
        else:page.keyboard.down('k');page.keyboard.up('k')
        outcome=page.evaluate('''()=>{const g=SupermagicFootball.game,i=g.input;i.poll();g.updatePlayers(.016);i.poll();g.updatePlayers(.016);return {owner:!!g.ball.owner,passEvents:g.events.filter(e=>e.type==='pass').length}}''')
        assert not outcome['owner'],(label,'subframe pass action not executed',outcome,errors)
        # Simultaneous action presses, even if both released before the next frame.
        if mobile:
            j=pt('jump',12);d=pt('dribble',13)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[j,d]})
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:
            page.keyboard.down('Space');page.keyboard.down('i');page.keyboard.up('Space');page.keyboard.up('i')
        combination=page.evaluate('''()=>{const i=SupermagicFootball.input;i.poll();return {jump:i.just(0,'jump'),dribble:i.just(0,'dribble')}}''')
        assert combination=={'jump':True,'dribble':True},(label,'rapid chord lost',combination,errors)
        page.evaluate('''()=>{let i=SupermagicFootball.input;i.poll();let g=SupermagicFootball.game;g.ball.owner=null;g.cooldown=0;g.controlled[0]=3;g.player(0,3).stun=0;g.player(0,3).cd=0;}''')
        if mobile:fast_tap('dribble',14)
        else:page.keyboard.down('i');page.keyboard.up('i')
        switched=page.evaluate('''()=>{const g=SupermagicFootball.game,i=g.input;i.poll();g.updatePlayers(.016);return g.controlled[0]}''')
        assert switched!=3,(label,'defensive switch missed',switched,errors)
        assert not errors,(label,errors)
        page.screenshot(path=str(root/'tests'/f'v08162_controls_{label}.png'))
        print(label,'PASS: subframe Pass, action release, simultaneous button chords, manual switch, no page exceptions')
        context.close()
    browser.close()
