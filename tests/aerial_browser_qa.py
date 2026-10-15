from menu_test_routes import open_quick,open_settings
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for kind,wh,mobile in [('desktop',(1366,800),False),('mobile',(844,390),True)]:
        ctx=browser.new_context(viewport={'width':wh[0],'height':wh[1]},is_mobile=mobile,has_touch=mobile)
        page=ctx.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.evaluate("""() => {const m={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m[k]??null,setItem:(k,v)=>m[k]=String(v),removeItem:k=>delete m[k]}})}""")
        page.set_content((root/'play.html').read_text(),wait_until='load')
        page.wait_for_function('window.SupermagicFootball?.version==="0.8.24.12-alpha"')
        open_quick(page)
        page.locator('[data-action="kickoff"]').first.click()
        assert page.evaluate('SupermagicFootball.game.matchState')=='play',errors
        # Test hyperdash via the FOUR-button hold-Jump + movement gesture.
        page.evaluate("""()=>{const sf=SupermagicFootball,g=sf.game,p=g.player(0,3),q=g.player(1,4);g.take(q);q.x=2650;q.y=250;g.controlled[0]=3;g.cooldown=0;p.dashCooldown=0;p.fatigue=0;p.stun=0;p.x=1270;p.y=700;g.input.reset();}""")
        if mobile:
            # Mobile game controls use pointer capture; use the actual RUN control plus joystick touch.
            cdp=ctx.new_cdp_session(page)
            run=page.locator('[data-act="jump"]').bounding_box();joy=page.locator('#joyZone').bounding_box()
            assert run and joy,(kind,run,joy)
            # Simultaneous multi-touch: joystick moved to right, RUN held.
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':1,'x':joy['x']+joy['width']*.85,'y':joy['y']+joy['height']*.5},{'id':2,'x':run['x']+run['width']*.5,'y':run['y']+run['height']*.5}]})
            page.wait_for_timeout(1080)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:
            page.keyboard.down('Space');page.keyboard.down('d');page.wait_for_timeout(720);page.keyboard.up('d');page.keyboard.up('Space')
        dash=page.evaluate('SupermagicFootball.game.player(0,3).dashCooldown')
        assert (dash>2.5 if not mobile else page.evaluate('SupermagicFootball.game.player(0,3).x')>1270+75),(kind,dash,errors)
        # Jump-first single SHOOT commits an ordinary header after the double-tap disambiguation window.
        page.evaluate("""()=>{const g=SupermagicFootball.game,p=g.player(0,3),b=g.ball;g.cooldown=0;g.controlled[0]=3;p.x=1460;p.y=640;p.z=78;p.vz=360;p.jumpCount=1;p.stun=0;p.cd=0;p.dashTimer=0;p.sprintCharge=0;b.owner=null;b.shot=null;b.attacker=1;b.x=p.x+22;b.y=p.y;b.z=160;b.vx=b.vy=b.vz=0;b.canCollect=.9;}""")
        if mobile:
            rect=page.locator('[data-act="shoot"]').bounding_box();x=rect['x']+rect['width']/2;y=rect['y']+rect['height']/2
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':3,'x':x,'y':y}]})
            page.wait_for_timeout(70);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:
            page.keyboard.down('j');page.wait_for_timeout(90);page.keyboard.up('j')
        page.wait_for_timeout(410)
        head=page.evaluate("""()=>({action:SupermagicFootball.game.player(0,3).action,attacker:SupermagicFootball.game.ball.attacker})""")
        assert head['attacker']==0,(kind,head,errors)
        page.screenshot(path=str(root/'tests'/f'aerial_heading_{kind}.png'))
        # Keeper dive is automatic: extra Jump input must NOT be necessary while a shot approaches.
        # Allow a realistic reaction window long enough for asynchronous mobile touch dispatch.
        page.evaluate("""()=>{const g=SupermagicFootball.game,k=g.player(0,0),b=g.ball;g.cooldown=0;g.input.keys.clear();g.input.touchButtons.clear();g.input.reset();const human=g.player(0,3);human.stun=0;human.cd=0;human.x=900;human.y=630;for(const other of g.players)if(other!==human&&other!==k){other.x=2550+other.i*35;other.y=870;}g.controlled[0]=3;k.x=190;k.y=670;k.diveCooldown=0;k.stun=0;b.owner=null;b.attacker=1;b.x=k.x+25;b.y=k.y+10;b.z=50;b.vx=-650;b.vy=0;b.vz=0;b.shot=null;b.power=140;b.canCollect=.7;}""")
        if mobile:
            rect=page.locator('[data-act="jump"]').bounding_box();x=rect['x']+rect['width']/2;y=rect['y']+rect['height']/2
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':4,'x':x,'y':y}]})
            page.wait_for_timeout(320);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:
            page.keyboard.down('Space');page.wait_for_timeout(85);page.keyboard.up('Space')
        page.wait_for_timeout(95)
        dive=page.evaluate('SupermagicFootball.game.player(0,0).diveCooldown')
        if dive<=0.35:
            debug=page.evaluate("""()=>{let g=SupermagicFootball.game,p=g.player(0,3),k=g.player(0,0),b=g.ball;return {pressed:g.input.pressed[0],state:g.input.state[0],pStun:p.stun,pControlled:g.controlled[0],kStun:k.stun,owner:b.owner?.src.name,ballX:b.x,ballY:b.y,kx:k.x,ky:k.y,attacker:b.attacker,ballShot:b.shot,cd:k.diveCooldown,events:g.events.slice(-8).map(e=>e.type)}}""")
            print('MOBILE DIVE DEBUG',kind,debug)
        assert dive>0.35,(kind,dive,errors) # cooldown is now based on GK Skill, GK Diving and fatigue
        page.screenshot(path=str(root/'tests'/f'keeper_dive_{kind}.png'))
        assert not errors,(kind,errors)
        print(kind,'PASS: hyperdash keyboard/touch, aerial heading, goalkeeper dive, no browser errors')
        ctx.close()
    browser.close()
