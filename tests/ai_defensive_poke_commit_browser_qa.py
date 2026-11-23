#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for the adaptive CPU poke window."""
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
        page.wait_for_function('!!window.SupermagicFootball?.game?.defensivePokeCommitWindow')
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game;
            const player=(t,x,y,extra={})=>({t,x,y,keeper:false,down:false,stun:0,invuln:0,z:0,dx:1,dy:0,face:1,...extra});
            const right=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1088,700,{moveVX:-240,moveVY:0}));
            const left=game.defensivePokeCommitWindow(player(1,1088,700,{dx:-1,face:-1}),player(0,1000,700,{moveVX:240,moveVY:0}));
            const retreat=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1088,700,{moveVX:240,moveVY:0}));
            const lateral=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1088,700,{moveVX:0,moveVY:240}));
            const staleVelocity=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1088,700,{moveVX:NaN,moveVY:NaN,vx:-300,vy:0}));
            const low=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1089,700,{moveVX:-240,moveVY:0}));
            const high=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1090,700,{moveVX:-240,moveVY:0}));
            const sideOn=game.defensivePokeCommitWindow(player(0,1000,700,{dx:0,dy:1}),player(1,1088,700,{moveVX:-240,moveVY:0}));
            const elite=game.defensivePokeCommitWindow(player(0,1000,700,{src:{defence:95}}),player(1,1083,700,{moveVX:-110,moveVY:0}));
            const weak=game.defensivePokeCommitWindow(player(0,1000,700,{src:{defence:20}}),player(1,1083,700,{moveVX:-110,moveVY:0}));
            const average=game.defensivePokeCommitWindow(player(0,1000,700,{src:{defence:50}}),player(1,1083,700,{moveVX:-120,moveVY:0}));
            const mirroredElite=game.defensivePokeCommitWindow(player(1,1083,700,{dx:-1,face:-1,src:{defence:95}}),player(0,1000,700,{moveVX:110,moveVY:0}));
            const canonicalTeams=SupermagicFootball.teams.filter(team=>
                !['concept_demo','crown_royals_reference'].includes(team.group)).length;
            return {right,left,retreat,lateral,staleVelocity,low,high,sideOn,elite,weak,average,mirroredElite,
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:canonicalTeams};
        }""")
        assert result['right'] and result['left'],(kind,result)
        assert not result['retreat'] and not result['lateral'] and not result['sideOn'] and not result['staleVelocity'],(kind,result)
        assert result['low'] and not result['high'],(kind,result)
        assert result['elite'] and not result['weak'] and result['average'] and result['mirroredElite'],(kind,result)
        assert result['buttons']==4 and result['teams']==223,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'adaptive closing poke, mirrored direction, contact bound, 223 teams and four actions',flush=True)
        ctx.close()
    browser.close()
