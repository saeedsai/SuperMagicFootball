from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for kind,(w,h),mobile in [('desktop',(1366,800),False),('mobile',(844,390),True)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
        page=ctx.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.evaluate("""() => {const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v),removeItem:k=>delete d[k]}})}""")
        page.set_content((root/'play.html').read_text(),wait_until='load')
        page.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'")
        page.locator('[data-action="quick"]').first.click()
        page.locator('[data-action="kickoff"]').first.click()
        assert page.evaluate('SupermagicFootball.game.matchState')=='play',errors
        page.evaluate("""()=>{const g=SupermagicFootball.game,p=g.player(0,3),a=g.player(0,4),b=g.ball;
          g.cooldown=0;g.controlled[0]=3;p.x=1460;p.y=680;p.z=0;p.vz=0;p.cd=0;p.stun=0;p.fatigue=0;p.comboCooldown=0;
          a.x=1510;a.y=687;a.z=0;a.cd=0;a.stun=0;a.fatigue=0;
          b.owner=null;b.attacker=1;b.x=1900;b.y=780;b.z=30;b.vx=b.vy=b.vz=0;b.canCollect=.9;
          g.input.keys.clear();g.input.touchButtons.clear();g.input.reset();}""")
        if mobile:
            cdp=ctx.new_cdp_session(page)
            boxp=page.locator('[data-act="pass"]').bounding_box();boxj=page.locator('[data-act="jump"]').bounding_box()
            assert boxp and boxj,(boxp,boxj)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':1,'x':boxp['x']+boxp['width']/2,'y':boxp['y']+boxp['height']/2},{'id':2,'x':boxj['x']+boxj['width']/2,'y':boxj['y']+boxj['height']/2}]})
            page.wait_for_timeout(115)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:
            page.keyboard.down('k');page.keyboard.down('Space');page.wait_for_timeout(115);page.keyboard.up('Space');page.keyboard.up('k')
        launched=page.evaluate('SupermagicFootball.game.player(0,3).comboCooldown')
        assert launched>3.5,(kind,'launch failed',launched,errors)
        page.screenshot(path=str(root/'tests'/f'team_launch_{kind}.png'))
        # Simulate the timing at the apex, then press the real Special input.
        page.evaluate("""()=>{let g=SupermagicFootball.game,p=g.player(0,3),b=g.ball;
         g.cooldown=0;p.z=225;p.vz=45;p.cd=0;p.comboWindow=.9;p.comboActive=true;p.stun=0;p.specialCd=0;p.fatigue=.05;
         b.owner=null;b.attacker=1;b.x=p.x+19;b.y=p.y+3;b.z=244;b.vx=b.vy=b.vz=0;b.canCollect=.9;g.input.reset();}""")
        if mobile:
            box=page.locator('[data-act="shoot"]').bounding_box()
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'id':3,'x':box['x']+box['width']/2,'y':box['y']+box['height']/2}]})
            page.wait_for_timeout(72)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:
            page.keyboard.down('l');page.wait_for_timeout(72);page.keyboard.up('l')
        result=page.evaluate("""()=>{const g=SupermagicFootball.game;const p=g.player(0,3),b=g.ball;return {shot:b.shot?.id,attacker:b.attacker,action:p.action,pz:p.z,vz:p.vz,pcd:p.cd,pcw:p.comboWindow,pstun:p.stun,bz:b.z,bd:Math.hypot(b.x-p.x,b.y-p.y),bdz:Math.abs(b.z-(p.z+38)),owner:b.owner?.src.name,events:g.events.slice(-4).map(e=>e.type),controlled:g.controlled[0]} }""")
        assert result['shot'] and result['attacker']==0,(kind,'combo special failed',result,errors)
        page.screenshot(path=str(root/'tests'/f'combo_super_{kind}.png'))
        assert not errors,(kind,errors)
        print(kind,'PASS: true keyboard/touch teammate combo and apex transforming shot, no page errors')
        ctx.close()
    browser.close()
