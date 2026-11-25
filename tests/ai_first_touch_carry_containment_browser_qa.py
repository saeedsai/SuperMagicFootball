#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for first-touch carry containment."""
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
        page.wait_for_function('!!window.SupermagicFootball?.game')
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game,rows=[];
            for(const defendingTeam of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});
                const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
                const carrier=game.player(attackingTeam,3),primary=game.player(defendingTeam,3),
                    support=game.player(defendingTeam,4),runner=game.player(attackingTeam,4),
                    passer=game.player(defendingTeam,2),intended=game.player(defendingTeam,5);
                const x=game.ball.x,y=game.ball.y;
                const keep=new Set([carrier,primary,support,runner,passer,intended]);
                for(const q of game.players)if(!keep.has(q)&&!q.keeper){q.down=true;q.stun=0;q.z=0;}
                Object.assign(carrier,{x,y,down:false,stun:0,z:0,face:dir,action:'idle',actionTimer:0,
                    moveVX:dir*80,moveVY:18,aiTimer:0,aiTarget:null,aiAssistTarget:null,
                    aiGiveAndGoRun:null,cd:0,trickCd:1});
                Object.assign(primary,{x:x+dir*55,y:y-78,down:false,stun:0,z:0,action:'idle',
                    actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
                Object.assign(support,{x:x-dir*150,y:y+20,down:false,stun:0,z:0,action:'idle',
                    actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
                Object.assign(runner,{x:x+dir*300,y:y+160,down:true,stun:0,z:0,action:'idle',
                    actionTimer:0,moveVX:dir*24,moveVY:0,aiTimer:0,aiTarget:null});
                Object.assign(passer,{x:x+dir*240,y:y-300,down:true,stun:0,z:0});
                Object.assign(intended,{x:x-dir*200,y:y+300,down:true,stun:0,z:0});
                Object.assign(game.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:defendingTeam,
                    passTarget:intended.src.id,attacker:defendingTeam,lastTouchTeam:defendingTeam,
                    x,y,z:8,vx:-dir*600,vy:0,vz:0,age:.18,canCollect:0,shot:null,strike:null,ordinaryShot:false});
                game.clock=10;game.take(carrier);
                Object.assign(carrier,{firstTouchControlTimer:0,firstTouchPressure:.8,firstTouchOutletReadTimer:.92,
                    aiFirstTouchTarget:null,aiFirstTouchOutletUntil:game.clock+.92,moveVX:dir*80,moveVY:0,
                    dx:dir*.5,dy:.8660254037844386,face:dir,aiTimer:0,aiTarget:null});
                game.driveAI(support,.016);game.driveAI(primary,.016);
                const target=support.aiTarget,primaryTarget=primary.aiTarget;
                const inputAlong=target?(target.x-x)*dir*.5+(target.y-y)*.8660254037844386:null;
                rows.push({team:defendingTeam,dir,carrier:{x:carrier.x,y:carrier.y},target,primaryTarget,inputAlong,
                    owner:game.ball.owner===carrier,buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
            }
            return {rows,teams:SupermagicFootball.teams.length};
        }""")
        assert result['teams']>=223,(kind,result)
        for row in result['rows']:
            assert row['target'] and row['primaryTarget'],(kind,row)
            assert row['dir']*(row['target']['x']-row['carrier']['x'])>34,(kind,row)
            gap=((row['target']['x']-row['carrier']['x'])**2+
                (row['target']['y']-row['carrier']['y'])**2)**.5
            assert 56<=gap<=132,(kind,row)
            primary_gap=((row['primaryTarget']['x']-row['carrier']['x'])**2+
                (row['primaryTarget']['y']-row['carrier']['y'])**2)**.5
            assert primary_gap<80,(kind,row)
            assert row['owner'],(kind,row)
            assert row['inputAlong']>72,(kind,row)
            assert row['buttons']==4,(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'mirrored carry-lane containment, primary pressure, four actions and no JS errors',flush=True)
        ctx.close()
    browser.close()
