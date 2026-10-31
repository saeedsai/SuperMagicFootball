from menu_test_routes import open_quick,open_settings
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'play.html').read_text()
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox','--disable-dev-shm-usage'])
    for mode,w,h in [('desktop',1280,720),('android',940,438)]:
        mobile=mode=='android'
        ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile,device_scale_factor=1)
        page=ctx.new_page();errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
        page.set_content(html,wait_until='load')
        page.wait_for_function("!!window.SupermagicFootball?.game")
        open_quick(page)
        page.locator('[data-action="kickoff"]').first.click()
        assert page.locator('#touchButtons [data-act]').count()==4
        # Pause the normal animation update so ultra-brief input events can be deliberately
        # queued between two engine polls. This is also a reproducible race-condition test.
        page.evaluate("""()=>{const {game:g,input}=SupermagicFootball;g.matchState='paused';g.cooldown=0;g.driveAI=()=>{};g.coordinateAiCombos=()=>{};input.keys.clear();input.reset();const p=g.player(0,3);g.controlled[0]=p.i;p.cd=0;p.stun=0;p.z=0;p.vz=0;g.take(p)}""")
        cdp=ctx.new_cdp_session(page) if mobile else None
        def tap(action,key):
            if mobile:
                bb=page.locator('[data-act="'+action+'"]').bounding_box();x=bb['x']+bb['width']/2;y=bb['y']+bb['height']/2
                cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':15,'x':x,'y':y}]})
                cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
                # CDP dispatch can resolve before the browser has run pointerup
                # listeners. Wait for the real completed tap to reach Input,
                # rather than falsely reporting a game-control failure.
                page.wait_for_function(
                    "(action) => (window.SupermagicFootball?.input?.touchPulsePending?.get(action)?.length || 0) > 0",
                    arg=action, timeout=5000)
            else:
                page.keyboard.down(key);page.keyboard.up(key)
                # Match the touch path: a keyboard tap is not ready until the
                # real DOM listeners have queued the completed press/release.
                # Waiting here preserves the gameplay assertion and prevents
                # a Chromium dispatch race from looking like failed switching.
                page.wait_for_function(
                    "(code) => (window.SupermagicFootball?.input?.keyPulsePending?.get(code)?.length || 0) > 0",
                    arg='Key'+key.upper(), timeout=5000)
        tap('pass','k')
        state=page.evaluate("""()=>{const {game:g,input}=SupermagicFootball;input.poll(false);const tap=input.just(0,'pass');g.updatePlayers(.016);input.poll(false);const release=!input.held(0,'pass');g.updatePlayers(.016);return {tap,release,owner:g.ball.owner?.src?.name||null}}""")
        assert state['tap'] and state['release'] and state['owner'] is None,(mode,'pass tap',state)
        # Defensive Dribble is Switch and is consumed exactly once per frame.
        page.evaluate("""()=>{let g=SupermagicFootball.game;g.ball.owner=g.player(1,3);g.controlled[0]=3;g.manualSwitchGrace[0]=0;g.cooldown=0;const p=g.player(0,3);p.stun=0;p.slideTimer=0;p.slideRemaining=0;p.cd=0;g.input.reset()}""")
        tap('dribble','i')
        state=page.evaluate("""()=>{let g=SupermagicFootball.game;g.input.poll(false);g.updatePlayers(.016);return {selected:g.controlled[0],events:g.events.filter(e=>e.type==='switch').length,grace:g.manualSwitchGrace[0]}}""")
        assert state['selected']!=3 and state['grace']>.3,(mode,'switch',state)
        # Automatic switch must not be disabled by steering.
        state=page.evaluate("""()=>{let g=SupermagicFootball.game,p=g.player(0,3),near=g.players.find(q=>q.t===0&&!q.keeper&&q!==p);g.controlled[0]=p.i;g.manualSwitchGrace[0]=0;g.matchState='play';g.ball.owner=null;g.ball.pass=null;g.ball.passTeam=null;g.ball.age=5;g.autoSwitchAccum[0]=0;g.ball.x=2900;g.ball.y=650;p.comboActive=false;p.ballLiftWindow=0;p.dashTimer=0;p.chase=0;p.x=1200;p.y=650;p.z=0;p.stun=0;near.x=2850;near.y=650;near.stun=0;for(const q of g.players.filter(q=>q.t===0&&!q.keeper&&q!==p&&q!==near)){q.x=1200;q.y=300;q.stun=0;}g.input.state[0]={x:1,y:0};let a=g.autoSwitch(0,.18),b=g.autoSwitch(0,.18);g.matchState='paused';return {a,b,selected:g.controlled[0],near:near.i}}""")
        assert not state['a'] and state['b'] and state['selected']==state['near'],(mode,'auto-switch',state)
        # Jump running with possession, while a short Jump tap still creates a jump.
        state=page.evaluate("""()=>{let g=SupermagicFootball.game,p=g.player(0,3);g.controlled[0]=p.i;g.manualSwitchGrace[0]=0;g.take(p);p.stun=0;p.z=0;p.vz=0;p.cd=0;p.jumpCount=0;p.fatigue=0;p.x=1700;p.y=720;p.moveVX=0;p.moveVY=0;g.cooldown=0;g.input.reset();g.input.state[0]={jump:1,x:1,y:0};g.input.pressed[0]={jump:true};for(let i=0;i<20;i++){g.updatePlayers(.016);g.input.pressed[0]={};}return {jumpCount:p.jumpCount,hold:p.jumpHold,x:p.x}}""")
        assert state['jumpCount']==0 and state['hold']>.25 and state['x']>1700,(mode,'hold Jump',state)
        assert not errors,(mode,errors)
        print(mode.upper(),'PASS: fast PASS taps, manual switch, steering auto-switch, Jump-run and four-button layout')
        ctx.close()
    browser.close()
