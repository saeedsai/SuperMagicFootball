#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for arrival-aware CPU pressing."""
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
            const game=SupermagicFootball.game,rows=[],stationaryRows=[],turnRows=[],inputRows=[];
            const field={x:150,y:155,w:2260.8,h:1220};
            for(const defendingTeam of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
                const x=field.x+field.w*.55,y=field.y+field.h*.5;
                const carrier=game.player(attackingTeam,3),nearer=game.player(defendingTeam,3),
                    closing=game.player(defendingTeam,4);
                for(const q of game.players){
                    if(q===carrier||q===nearer||q===closing||q.keeper)continue;
                    q.down=true;q.stun=1;
                }
                Object.assign(carrier,{x,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
                    moveVX:dir*120,moveVY:0,vx:dir*120,vy:0,dribbleHold:0,
                    firstTouchControlTimer:0,firstTouchPressure:0});
                Object.assign(nearer,{x:x-dir*100,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
                    moveVX:-dir*220,moveVY:0,vx:-dir*220,vy:0,slideTimer:0,
                    shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
                    aiTarget:null,aiTimer:0,aiAssistTarget:null});
                Object.assign(closing,{x:x-dir*105,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
                    moveVX:dir*220,moveVY:0,vx:dir*220,vy:0,slideTimer:0,
                    shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
                    aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,
                    aiFirstTouchTarget:null,aiDetour:null});
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,
                    attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
                game.clock=2;
                game.driveAI(closing,.016);
                const target=closing.aiTarget;
                const lead=Math.hypot(target.x-carrier.x,target.y-carrier.y);
                if(!(lead<=34.1&&lead>0&&(target.x-carrier.x)*dir>0))
                    throw new Error('arrival-aware primary press was not assigned to the closing defender: '+JSON.stringify({defendingTeam,target,carrier:{x,y}}));
                if(game.ball.owner!==carrier)throw new Error('press assignment changed possession');
                rows.push({defendingTeam,lead,target});
            }
            for(const defendingTeam of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
                const x=field.x+field.w*.55,y=field.y+field.h*.5;
                const carrier=game.player(attackingTeam,3),nearer=game.player(defendingTeam,3),
                    closing=game.player(defendingTeam,4);
                for(const q of game.players){
                    if(q===carrier||q===nearer||q===closing||q.keeper)continue;
                    q.down=true;q.stun=1;
                }
                Object.assign(carrier,{x,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,vx:0,vy:0,firstTouchControlTimer:0,firstTouchPressure:0});
                Object.assign(nearer,{x:x-dir*100,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
                    moveVX:-dir*220,moveVY:0,vx:-dir*220,vy:0,slideTimer:0,
                    shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
                    aiTarget:null,aiTimer:0,aiAssistTarget:null});
                Object.assign(closing,{x:x-dir*105,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
                    moveVX:dir*220,moveVY:0,vx:dir*220,vy:0,slideTimer:0,
                    shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
                    aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,
                    aiFirstTouchTarget:null,aiDetour:null});
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,
                    attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
                game.clock=2;game.moveAgile=()=>{};game.driveAI(closing,.016);
                const target=closing.aiTarget;
                if(!(target&&Math.abs(target.x-x)<1e-6&&Math.abs(target.y-y)<1e-6))
                    throw new Error('stationary-carrier arrival read did not select the closing primary: '+JSON.stringify({defendingTeam,target,carrier:{x,y}}));
                if(game.ball.owner!==carrier)throw new Error('stationary-carrier press changed possession');
                stationaryRows.push({defendingTeam,target});
            }
            for(const defendingTeam of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
                const x=field.x+field.w*.55,y=field.y+field.h*.5;
                const carrier=game.player(attackingTeam,3),lowAgility=game.player(defendingTeam,3),steady=game.player(defendingTeam,4);
                for(const q of game.players){if(q===carrier||q===lowAgility||q===steady||q.keeper)continue;q.down=true;q.stun=1;}
                Object.assign(carrier,{x,y,z:0,down:false,stun:0,action:'run',actionTimer:0,moveVX:dir*120,moveVY:0,vx:dir*120,vy:0,firstTouchControlTimer:0,firstTouchPressure:0});
                Object.assign(lowAgility,{x:x-dir*90,y,z:0,down:false,stun:0,action:'run',actionTimer:0,moveVX:0,moveVY:60,vx:0,vy:60,slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null});
                lowAgility.src.agility=1;
                Object.assign(steady,{x:x-dir*92,y,z:0,down:false,stun:0,action:'run',actionTimer:0,moveVX:dir*1,moveVY:0,vx:dir*1,vy:0,slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null});
                steady.src.agility=50;
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
                game.clock=2;game.driveAI(steady,.016);
                const target=steady.aiTarget,gap=target?Math.hypot(target.x-carrier.x,target.y-carrier.y):Infinity;
                if(!(target&&gap<=34.1&&gap>0))throw new Error('Agility-aware cross-track press did not select the steady-arrival defender: '+JSON.stringify({defendingTeam,target,carrier:{x,y}}));
                if(game.ball.owner!==carrier)throw new Error('turn-aware press changed possession');
                turnRows.push({defendingTeam,gap,target});
            }
            for(const defendingTeam of [0,1]){
                for(const agility of [100,1]){
                    game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                    const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1,cutSign=defendingTeam===0?-1:1;
                    const x=field.x+field.w*.55,y=field.y+field.h*.5;
                    const carrier=game.player(attackingTeam,3),momentum=game.player(defendingTeam,3),
                        cut=game.player(defendingTeam,4);
                    for(const q of game.players){if(q===carrier||q===momentum||q===cut||q.keeper)continue;q.down=true;q.stun=1;}
                    Object.assign(carrier,{x,y,z:0,down:false,stun:0,invuln:0,action:'run',actionTimer:0,
                        moveVX:dir*220,moveVY:0,vx:dir*220,vy:0,dx:0,dy:cutSign,
                        firstTouchControlTimer:0,firstTouchPressure:0,dribbleHold:0});
                    carrier.src.agility=agility;
                    for(const [q,laneY] of [[momentum,y],[cut,y+cutSign*16]]){
                        Object.assign(q,{x:x-dir*80,y:laneY,z:0,down:false,stun:0,invuln:0,action:'run',actionTimer:0,
                            moveVX:dir*220,moveVY:0,vx:dir*220,vy:0,slideTimer:0,
                            shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
                            aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,
                            aiFirstTouchTarget:null,aiDetour:null});
                    }
                    Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,
                        attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
                    game.clock=2;game.moveAgile=()=>{};
                    const primary=agility>=50?cut:momentum;
                    game.driveAI(primary,.016);
                    const target=primary.aiTarget,laneShift=target?cutSign*(target.y-y):-Infinity;
                    if(!(target&&(agility>=50?laneShift>20:laneShift<14)))
                        throw new Error('carrier input turn did not shape the Agility-limited press lead: '+JSON.stringify({defendingTeam,agility,target,laneShift}));
                    if(game.ball.owner!==carrier)throw new Error('turn-aware press assignment changed possession');
                    inputRows.push({defendingTeam,agility,laneShift});
                }
            }
            return {rows,stationaryRows,turnRows,inputRows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:SupermagicFootball.teams.length};
        }""")
        assert result['buttons']==4,(kind,result)
        assert result['teams']>=223,(kind,result)
        assert len(result['rows'])==2,(kind,result)
        assert len(result['stationaryRows'])==2,(kind,result)
        assert len(result['turnRows'])==2,(kind,result)
        assert len(result['inputRows'])==4,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'moving/stationary arrival press and Agility-limited carrier-input turn lead, possession, four actions and no JS errors',flush=True)
        ctx.close()
    browser.close()
