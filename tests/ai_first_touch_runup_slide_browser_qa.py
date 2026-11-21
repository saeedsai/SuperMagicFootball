#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for first-touch run-up slide reads."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for kind in ('desktop','simulated-touch'):
        ctx=browser.new_context(
            viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
            is_mobile=kind!='desktop',has_touch=kind!='desktop')
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
        page.wait_for_function('!!window.SupermagicFootball?.game')
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game,rows=[],field={x:0,y:0,w:2260.8,h:1530};
            for(const team of [0,1]){
                const carrierTeam=1-team,attackDir=carrierTeam===0?1:-1;
                game.init({home:0,away:1,mode:'quick',humans:0});
                const carrier=game.player(carrierTeam,3),primary=game.player(team,3);
                const x=field.x+field.w*.52,y=field.y+field.h*.5;
                for(const player of game.players)
                    if(player!==carrier&&player!==primary&&!player.keeper){player.down=true;player.stun=1;player.invuln=1.1;player.z=0;}
                Object.assign(carrier,{x,y,face:attackDir,down:false,stun:0,invuln:0,z:0,
                    action:'receive',actionTimer:.2,moveVX:attackDir*160,moveVY:0,
                    firstTouchControlTimer:.20,firstTouchPressure:.9});
                Object.assign(primary,{x:x-attackDir*86,y,down:false,stun:0,invuln:0,z:0,cd:0,
                    action:'run',actionTimer:0,moveVX:attackDir*300,moveVY:0,dx:attackDir,dy:0,
                    face:attackDir,aiTimer:0,aiTarget:null,aiAssistTarget:null});
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false});
                game.clock=.1;
                const random=Math.random;
                try{Math.random=()=>0;game.driveAI(primary,.016);}
                finally{Math.random=random;}
                rows.push({team,action:primary.action,slideTimer:primary.slideTimer,
                    slideRemaining:primary.slideRemaining,slideDX:primary.slideDX,attackDir});
            }
            return {rows,teamCount:SupermagicFootball.teams.length};
        }""")
        # The runtime picker may append two local/custom slots; preflight independently
        # validates that the canonical built-in data file still contains exactly 223 teams.
        assert 223<=result['teamCount']<=225,(kind,result)
        for row in result['rows']:
            assert row['action']=='slide' and row['slideTimer']>0,(kind,row)
            assert row['slideRemaining']>0 and row['slideDX']*row['attackDir']>0,(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'mirrored first-touch run-up slide and no JavaScript errors',flush=True)
        ctx.close()
    browser.close()
