#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for first-touch outlet slide-sweep avoidance."""
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
                    intended=game.player(1-team,4),marker=game.player(1-team,5),
                    preferred=game.player(team,4),alternate=game.player(team,5),
                    slider=game.player(1-team,2);
                const keep=new Set([carrier,preferred,alternate,marker,slider]);
                for(const player of game.players)if(!keep.has(player)){
                    player.down=true;player.stun=0;player.z=0;player.action='idle';player.actionTimer=0;
                }
                Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,firstTouchControlTimer:0,firstTouchPressure:.8,
                    firstTouchOutletReadTimer:.68,aiFirstTouchTarget:null,aiAssistTarget:null,
                    aiGiveAndGoRun:null,aiTimer:0,aiTarget:null,cd:0,trickCd:99});
                Object.assign(marker,{x:x+dir*50,y:y+150,down:false,stun:0,z:0,action:'idle',
                    actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
                Object.assign(preferred,{x:x+dir*400,y,down:false,stun:0,z:0,action:'idle',
                    actionTimer:0,moveVX:0,moveVY:0,firstTouchControlTimer:0,slideTimer:0,
                    aiAssistTarget:null,aiGiveAndGoRun:null});
                Object.assign(alternate,{x:x+dir*300,y:y-250,down:false,stun:0,z:0,action:'idle',
                    actionTimer:0,moveVX:0,moveVY:0,firstTouchControlTimer:0,slideTimer:0,
                    aiAssistTarget:null,aiGiveAndGoRun:null});
                Object.assign(slider,{x:x+dir*280,y:y+120,down:false,stun:0,z:0,action:'slide',
                    actionTimer:.36,slideTimer:.36,slideRemaining:180,slideSpeed:500,
                    slideDX:0,slideDY:-1,moveVX:0,moveVY:0});
                Object.assign(passer,{down:true});Object.assign(intended,{down:true});
                game.take(carrier);
                game.clock=10.25;
                Object.assign(carrier,{firstTouchControlTimer:0,firstTouchPressure:.8,
                    firstTouchOutletReadTimer:.68,aiFirstTouchOutletUntil:game.clock+.92,
                    aiFirstTouchTarget:null,aiAssistTarget:null,aiGiveAndGoRun:null,
                    aiTimer:0,aiTarget:null,cd:0,trickCd:99});
                Object.assign(game.ball,{owner:carrier,pass:false,passTarget:null,attacker:team,
                    lastTouchTeam:team,x,y,z:0,vx:0,vy:0,vz:0,shot:null,strike:null,
                    ordinaryShot:false,canCollect:0});
                const originalRandom=Math.random;
                let intent=null;
                try{
                    Math.random=()=>0;
                    const start=game.events.length;
                    game.driveAI(carrier,.016);
                    intent=game.events.slice(start).find(event=>event.type==='passIntent')||null;
                }finally{Math.random=originalRandom;}
                rows.push({team,expected:alternate.src.id,actual:intent?.target||null,
                    pass:game.ball.pass,owner:game.ball.owner===carrier});
            }
            return {rows,teams:SupermagicFootball.teams.length,
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
        }""")
        assert result['teams']>=223,(kind,result)
        assert result['buttons']==4,(kind,result)
        for row in result['rows']:
            assert row['actual']==row['expected'],(kind,row)
            assert row['pass'] and not row['owner'],(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'mirrored actual-engine first-touch outlet avoids active slide sweep and passes to clear teammate',flush=True)
        context.close()
    browser.close()
print('First-touch outlet slide-sweep acceptance PASS — desktop and simulated touch')
