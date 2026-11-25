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
        page.wait_for_function('!!window.SupermagicFootball?.game?.cpuTackleSlideChance && !!window.SupermagicFootball?.game?.defensiveTackleSlideBallSideRead')
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game;
            const slideRead=(team,agility,crossing=100,straight=false)=>{
                const dir=team===0?1:-1;
                const defender={t:team,x:1000,y:700,keeper:false,down:false,stun:0,invuln:0,z:0,
                    moveVX:dir*110,moveVY:0,dx:dir,dy:0,face:dir,src:{agility}};
                const carrier={t:1-team,x:1000+dir*60,y:700,keeper:false,down:false,stun:0,invuln:0,z:0,
                    moveVX:straight?dir*300:dir*40,moveVY:straight?0:crossing};
                const ball={owner:carrier,x:carrier.x-dir*17,y:carrier.y,z:12};
                return game.defensiveTackleSlideBallSideRead(defender,carrier,ball,160);
            };
            const profile=(defence,aggression,fatigue=0)=>({fatigue,src:{
                id:'slide-profile-'+defence+'-'+aggression,role:'DF',defence,aggression
            }});
            const neutral=game.cpuTackleSlideChance(profile(50,50,0),.5,.24,.4);
            const low=game.cpuTackleSlideChance(profile(20,20,0),.5,.24,.4);
            const high=game.cpuTackleSlideChance(profile(90,90,0),.5,.24,.4);
            const primary=game.cpuTackleSlideChance(profile(50,50,0),.5,.17,.35);
            const halfFatigue=game.cpuTackleSlideChance(profile(50,50,.5),.5,.24,.4);
            const fullFatigue=game.cpuTackleSlideChance(profile(50,50,1),.5,.24,.4);
            const primaryFullFatigue=game.cpuTackleSlideChance(profile(50,50,1),.5,.17,.35);
            const invalidFatigue=game.cpuTackleSlideChance(profile(50,50,NaN),.5,.24,.4);
            const boundedLow=game.cpuTackleSlideChance(profile(1,1),0,-5,-2);
            const boundedHigh=game.cpuTackleSlideChance(profile(100,100),1,2,2);
            const canonicalTeams=SupermagicFootball.teams.filter(team=>
                !['concept_demo','crown_royals_reference'].includes(team.group)).length;
            return {neutral,low,high,primary,halfFatigue,fullFatigue,primaryFullFatigue,invalidFatigue,boundedLow,boundedHigh,
                slideHighRight:slideRead(0,100),slideAverageRight:slideRead(0,50),slideLowRight:slideRead(0,20),
                slideHighLeft:slideRead(1,100),slideAverageLeft:slideRead(1,50),slideLowLeft:slideRead(1,20),
                slideLowWideCut:slideRead(0,1,120),slideMissingAgility:slideRead(0,undefined),
                slideInvalidAgility:slideRead(1,NaN),slideStraightLow:slideRead(0,1,0,true),
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:canonicalTeams};
        }""")
        assert abs(result['neutral']-.44)<1e-9,(kind,result)
        assert abs(result['primary']-.345)<1e-9,(kind,result)
        assert result['low']<result['neutral']<result['high'],(kind,result)
        assert result['halfFatigue']<result['neutral'] and result['fullFatigue']<result['halfFatigue'],(kind,result)
        assert abs(result['halfFatigue']-.4025)<1e-9 and abs(result['fullFatigue']-.365)<1e-9,(kind,result)
        assert abs(result['primaryFullFatigue']-.27)<1e-9,(kind,result)
        assert abs(result['invalidFatigue']-result['neutral'])<1e-9,(kind,result)
        assert result['boundedLow']==.12 and result['boundedHigh']==.76,(kind,result)
        assert result['slideHighRight'] and result['slideHighLeft'],(kind,result)
        assert not result['slideAverageRight'] and not result['slideAverageLeft'],(kind,result)
        assert not result['slideLowRight'] and not result['slideLowLeft'],(kind,result)
        assert result['slideLowWideCut'] and result['slideStraightLow'],(kind,result)
        assert not result['slideMissingAgility'] and not result['slideInvalidAgility'],(kind,result)
        assert result['buttons']==4,(kind,result)
        assert result['teams']==223,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'player-aware slide choice, neutral baseline, bounds, four actions and 223 teams',flush=True)
        ctx.close()
    browser.close()
