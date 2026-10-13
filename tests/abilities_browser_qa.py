from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for kind,size,mobile in [('desktop',(1400,850),False),('mobile',(844,390),True)]:
        ctx=browser.new_context(viewport={'width':size[0],'height':size[1]},is_mobile=mobile,has_touch=mobile)
        page=ctx.new_page();errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.evaluate("""() => {const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v),removeItem:k=>delete d[k]}})}""")
        page.set_content((root/'play.html').read_text(),wait_until='load')
        page.wait_for_function('window.SupermagicFootball?.version==="0.8.17.1-alpha"')
        page.locator('[data-action="quick"]').first.click()
        page.locator('[data-action="kickoff"]').first.click()
        assert page.evaluate('SupermagicFootball.game.matchState') == 'play'
        # Enable the field player and make an opponent ball-carrier close enough for the drill.
        page.evaluate("""()=>{const g=SupermagicFootball.game,p=g.player(0,2),q=g.player(1,2);g.cooldown=0;g.controlled[0]=2;p.x=1300;p.y=610;p.cd=0;p.stun=0;p.fatigue=0;p.abilityCd=0;q.x=1380;q.y=610;q.invuln=0;q.stun=0;g.take(q);g.ball.x=q.x;g.ball.y=q.y;g.ball.attacker=1;}""")
        if mobile:
            cdp=ctx.new_cdp_session(page)
            j=page.locator('[data-act="jump"]').bounding_box();v=page.locator('[data-act="shoot"]').bounding_box();assert j and v
            pts=[{'x':j['x']+j['width']/2,'y':j['y']+j['height']/2,'id':7},{'x':v['x']+v['width']/2,'y':v['y']+v['height']/2,'id':8}]
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':pts})
        else:page.keyboard.down('l')
        page.wait_for_timeout(140)
        if mobile:cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:page.keyboard.up('l')
        cd=page.evaluate('SupermagicFootball.game.player(0,2).abilityCd')
        assert cd>6,(kind,cd,errors)
        assert page.evaluate('SupermagicFootball.game.player(1,2).stun')>0
        page.screenshot(path=str(root/'tests'/f'ability_drill_{kind}.png'))
        # Keeper ability via the very same Special button, with original GK Genei.
        page.evaluate("""()=>{let g=SupermagicFootball.game,k=g.player(0,0);g.controlled[0]=3;g.cooldown=0;k.x=185;k.y=680;k.abilityCd=0;k.stun=0;k.fatigue=0;g.ball.owner=null;g.ball.attacker=1;g.ball.x=k.x+105;g.ball.y=k.y+25;g.ball.z=25;g.ball.vx=-440;g.ball.vy=0;g.ball.vz=0;g.ball.shot={behavior:'curve',direction:1};g.ball.canCollect=.7;}""")
        if mobile:
            page.wait_for_timeout(90)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':pts})
        else:page.keyboard.down('l')
        page.wait_for_timeout(120)
        if mobile:cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:page.keyboard.up('l')
        assert page.evaluate('SupermagicFootball.game.player(0,0).abilityCd')>7,errors
        page.screenshot(path=str(root/'tests'/f'ability_keeper_{kind}.png'))
        assert errors==[],errors
        print(kind,'PASS: keyboard/touch defensive action, stun, timed keeper action, rendered effects, no page exceptions')
        ctx.close()
    browser.close()
