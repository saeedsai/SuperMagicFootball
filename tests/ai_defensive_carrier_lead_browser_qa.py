#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for carrier-path interception."""
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
            const field={x:150,y:155,w:2260.8,h:1220};
            for(const defendingTeam of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
                const x=field.x+field.w*.55,y=field.y+field.h*.5;
                const carrier=game.player(attackingTeam,3),primary=game.player(defendingTeam,3),
                    support=game.player(defendingTeam,4);
                for(const q of game.players){
                    if(q===carrier||q===primary||q===support||q.keeper)continue;
                    q.down=true;q.stun=1;
                }
                Object.assign(carrier,{x,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
                    moveVX:dir*180,moveVY:60,vx:dir*180,vy:60,dribbleHold:0,firstTouchControlTimer:0});
                Object.assign(primary,{x:x-dir*110,y:y-20,z:0,down:false,stun:0,action:'idle',actionTimer:0,
                    slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,
                    shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null,
                    aiGiveAndGoRun:null,aiFirstTouchTarget:null,aiDetour:null});
                Object.assign(support,{x:x-dir*220,y:y+100,z:0,down:false,stun:0,action:'idle',actionTimer:0,
                    slideTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null});
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,
                    attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
                game.clock=2;
                game.driveAI(primary,.016);
                const target=primary.aiTarget;
                const leadX=target.x-carrier.x,leadY=target.y-carrier.y;
                const lead=Math.hypot(leadX,leadY);
                if(!(lead>0&&lead<=34.1&&leadX*dir>0&&leadY>0))
                    throw new Error('carrier intercept lead failed: '+JSON.stringify({defendingTeam,target,carrier:{x,y,moveVX:carrier.moveVX,moveVY:carrier.moveVY}}));
                Object.assign(carrier,{moveVX:0,moveVY:0,vx:0,vy:0});
                game.driveAI(primary,.016);
                if(Math.abs(primary.aiTarget.x-carrier.x)>1e-6||Math.abs(primary.aiTarget.y-carrier.y)>1e-6)
                    throw new Error('stationary carrier must retain direct pursuit: '+JSON.stringify(primary.aiTarget));
                rows.push({defendingTeam,lead,primaryTarget:target,carrier:{x,y}});
            }
            return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:SupermagicFootball.teams.length};
        }""")
        assert result['buttons']==4,(kind,result)
        assert result['teams']>=223,(kind,result)
        assert len(result['rows'])==2,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'mirrored moving-carrier intercept, stationary fallback, four actions and no JS errors',flush=True)
        ctx.close()
    browser.close()
