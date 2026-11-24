#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for CPU first-touch slide-sweep avoidance."""
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
        context=browser.new_context(
            viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
            is_mobile=kind!='desktop',has_touch=kind!='desktop')
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(html,wait_until='load')
        page.evaluate("""() => {
            const values=new Map();
            Object.defineProperty(window,'localStorage',{configurable:true,value:{
                getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),
                removeItem:key=>values.delete(key),clear:()=>values.clear()
            }});
        }""")
        page.add_script_tag(content=js,type='module')
        page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game,rows=[];
            for(const team of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});
                const dir=team===0?1:-1,x=game.ball.x,y=game.ball.y;
                const carrier=game.player(team,3),passer=game.player(1-team,3),
                    intended=game.player(1-team,4),slider=game.player(1-team,2);
                const keep=new Set([carrier,passer,intended,slider]);
                for(const player of game.players)if(!keep.has(player)){
                    player.down=true;player.stun=0;player.z=0;player.action='idle';player.actionTimer=0;
                }
                Object.assign(carrier,{x,y,face:dir,down:false,stun:0,z:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,
                    firstTouchControlTimer:0,firstTouchPressure:0});
                Object.assign(passer,{x:x+dir*240,y:y+300,down:true,stun:0,z:0,action:'idle',actionTimer:0});
                Object.assign(intended,{x:x-dir*210,y:y+300,down:true,stun:0,z:0,action:'idle',actionTimer:0});
                Object.assign(slider,{x:x+dir*80,y,down:false,stun:0,z:0,action:'slide',actionTimer:.24,
                    slideTimer:.24,slideRemaining:30,slideSpeed:500,slideDX:-dir*.35,slideDY:.936657,
                    moveVX:0,moveVY:0});
                Object.assign(game.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:1-team,
                    passTarget:carrier.src.id,attacker:1-team,lastTouchTeam:1-team,
                    x,y,z:8,vx:-dir*600,vy:0,vz:0,age:.18,shot:null,strike:null,ordinaryShot:false,canCollect:0});
                game.clock=10;game.take(carrier);
                const expected=carrier.aiFirstTouchTarget&&{x:carrier.aiFirstTouchTarget.x,y:carrier.aiFirstTouchTarget.y};
                const timer=carrier.firstTouchControlTimer,pressure=carrier.firstTouchPressure;
                const start=game.events.length;
                game.driveAI(carrier,.016);
                const releases=game.events.slice(start).filter(event=>['passIntent','shotRelease','dribbleTrick'].includes(event.type));
                rows.push({team,dir,x,y,expected,actual:carrier.aiTarget&&{x:carrier.aiTarget.x,y:carrier.aiTarget.y},
                    owner:game.ball.owner===carrier,timer,pressure,releases});
            }
            return {rows,teams:SupermagicFootball.teams.length,
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
        }""")
        assert result['teams']>=223,(kind,result)
        assert result['buttons']==4,(kind,result)
        for row in result['rows']:
            assert row['timer']>0 and row['pressure']>0,(kind,row)
            assert row['expected'] and row['expected']['y']<row['y'],(kind,row)
            assert row['actual']==row['expected'],(kind,row)
            assert row['owner'] and row['releases']==[],(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'mirrored first-touch slide sweep, safe upper lane, retained possession, four actions',flush=True)
        context.close()
    browser.close()
print('AI first-touch slide-sweep avoidance PASS — desktop and simulated touch')
