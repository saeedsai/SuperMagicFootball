#!/usr/bin/env python3
"""Desktop and simulated-touch acceptance for player-aware CPU slide choice."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
        args=['--no-sandbox','--disable-dev-shm-usage'])
    for kind in ('desktop','simulated-touch'):
        ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop'
            else {'width':844,'height':390},is_mobile=kind!='desktop',has_touch=kind!='desktop')
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda exc:errors.append(str(exc)))
        page.set_content(html)
        page.evaluate("""() => {
            const values=new Map();
            Object.defineProperty(window,'localStorage',{configurable:true,value:{
                getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),
                removeItem:key=>values.delete(key),clear:()=>values.clear()
            }});
        }""")
        page.add_script_tag(content=js,type='module')
        page.wait_for_function('!!window.SupermagicFootball?.game?.cpuTackleSlideChance')
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game;
            const profile=(defence,aggression)=>({src:{
                id:'slide-profile-'+defence+'-'+aggression,role:'DF',defence,aggression
            }});
            const neutral=game.cpuTackleSlideChance(profile(50,50),.5,.24,.4);
            const low=game.cpuTackleSlideChance(profile(20,20),.5,.24,.4);
            const high=game.cpuTackleSlideChance(profile(90,90),.5,.24,.4);
            const primary=game.cpuTackleSlideChance(profile(50,50),.5,.17,.35);
            const boundedLow=game.cpuTackleSlideChance(profile(1,1),0,-5,-2);
            const boundedHigh=game.cpuTackleSlideChance(profile(100,100),1,2,2);
            return {neutral,low,high,primary,boundedLow,boundedHigh,
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:SupermagicFootball.teams.length};
        }""")
        assert abs(result['neutral']-.44)<1e-9,(kind,result)
        assert abs(result['primary']-.345)<1e-9,(kind,result)
        assert result['low']<result['neutral']<result['high'],(kind,result)
        assert result['boundedLow']==.12 and result['boundedHigh']==.76,(kind,result)
        assert result['buttons']==4,(kind,result)
        assert result['teams']==223,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'player-aware slide choice, neutral baseline, bounds, four actions and 223 teams',flush=True)
        ctx.close()
    browser.close()
