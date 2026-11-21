#!/usr/bin/env python3
"""Desktop and simulated-touch acceptance for coordinated third-man support runs."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for kind in ('desktop','simulated-touch'):
        ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
            is_mobile=kind!='desktop',has_touch=kind!='desktop')
        page=ctx.new_page();errors=[]
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
            const game=SupermagicFootball.game,rows=[],field={x:150,y:155,w:2260.8,h:1220};
            for(const team of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});
                const dir=team===0?1:-1,carrier=game.player(team,3),primary=game.player(team,4),third=game.player(team,5);
                const x=field.x+field.w*.5,y=field.y+field.h*.5;
                for(const player of game.players)if(player!==carrier&&player!==primary&&player!==third&&!player.keeper){
                    player.down=true;player.stun=1;player.invuln=1.1;player.z=0;player.action='idle';player.actionTimer=0;
                }
                Object.assign(carrier,{x,y,down:false,stun:0,invuln:0,z:0,action:'idle',actionTimer:0});
                Object.assign(primary,{x:x+dir*40,y:y-110,homeY:y-112,down:false,stun:0,invuln:0,z:0,
                    action:'run',actionTimer:0,moveVX:0,moveVY:0});
                Object.assign(third,{x:x+dir*20,y,homeY:y,down:false,stun:0,invuln:0,z:0,
                    action:'run',actionTimer:0,moveVX:0,moveVY:0,aiTimer:1,aiTarget:{x:x+dir*20,y}});
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false});
                game.clock=5;game.driveAI(third,.016);
                rows.push({team,dir,carrier:{x,y},primary:{x:primary.x,y:primary.y},target:third.aiTarget});
            }
            return {rows,buttons:document.querySelectorAll('#touchButtons [data-act]').length};
        }""")
        assert result['buttons']==4,(kind,result)
        for row in result['rows']:
            assert row['target'] and row['target']['x'] is not None,(kind,row)
            assert row['dir']*(row['target']['x']-row['carrier']['x'])>=180,(kind,row)
            assert row['target']['y']>row['carrier']['y']+100,(kind,row)
            assert ((row['target']['y']-row['primary']['y'])**2+
                    (row['target']['x']-row['primary']['x'])**2)**.5>=130,(kind,row)
        assert not errors,(kind,errors)
        page.screenshot(path=str(ROOT/'tests'/f'ai_third_man_support_run_{kind}.png'))
        print('PASS',kind,'mirrored third-man support lane, four actions and no JavaScript errors',flush=True)
        ctx.close()
    browser.close()
