#!/usr/bin/env python3
"""Desktop and simulated-touch acceptance for coordinated primary/support landing reads."""
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
            const game=SupermagicFootball.game,rows=[];
            const field={x:150,y:155,w:2260.8,h:1220};
            for(const team of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const dir=team===0?1:-1,primary=game.player(team,3),support=game.player(team,4);
                const x=field.x+field.w*.5,y=field.y+field.h*.5;
                for(const p of game.players){
                    p.aiTarget=null;p.aiTimer=0;p.aiAssistTarget=null;p.aiGiveAndGoRun=null;
                    p.action='idle';p.actionTimer=0;p.z=0;p.down=true;p.stun=1;
                }
                for(const p of [primary,support])Object.assign(p,{down:false,stun:0,invuln:0,
                    action:'idle',actionTimer:0,z:0,slideTimer:0,shotImpactKnockdownPending:0,
                    shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTimer:1});
                const scenarios=[
                    {name:'moving',z:54,vx:dir*260,vy:-80,vz:-40,canCollect:0,age:0,lastTouchTeam:1-team,cap:260},
                    {name:'vertical',z:54,vx:0,vy:0,vz:0,canCollect:0,age:0,lastTouchTeam:1-team,cap:260},
                    {name:'tackle-spill',z:23,vx:dir*150,vy:50,vz:115,canCollect:.15,age:0,lastTouchTeam:1-team,cap:150,friction:.986,terrain:'Grass'},
                    {name:'rolling-grass',z:0,vx:dir*180,vy:-60,vz:0,canCollect:0,age:.35,lastTouchTeam:1-team,cap:150,rolling:true,friction:.986,terrain:'Grass'},
                    {name:'rolling-wet',z:0,vx:dir*180,vy:-60,vz:0,canCollect:0,age:.35,lastTouchTeam:1-team,cap:150,rolling:true,friction:.96,terrain:'Grass',condition:'Wet'},
                    {name:'rolling-sand',z:0,vx:dir*180,vy:-60,vz:0,canCollect:0,age:.35,lastTouchTeam:1-team,cap:150,rolling:true,friction:.94,terrain:'Sand'}
                ];
                for(const scenario of scenarios){
                    Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
                        x,y,z:scenario.z,vx:scenario.vx,vy:scenario.vy,vz:scenario.vz,
                        canCollect:scenario.canCollect,age:scenario.age,lastTouchTeam:scenario.lastTouchTeam,
                        attacker:1-team});
                    game.clock=5;
                    game.terrain=scenario.terrain||'Grass';game.condition=scenario.condition||'Clear';
                    const horizon=scenario.rolling ?
                        (1-Math.pow(scenario.friction,.18*60))/(60*(1-scenario.friction)) :
                        (scenario.vz+Math.sqrt(scenario.vz*scenario.vz+1000*scenario.z))/500;
                    const clamp=value=>Math.max(-scenario.cap,Math.min(scenario.cap,value));
                    const landing={x:x+clamp(scenario.vx*horizon),y:y+clamp(scenario.vy*horizon)};
                    const expected={x:landing.x-dir*26,y:landing.y};
                    const supportX=Math.abs(landing.x-x)<1?landing.x-dir*55:x;
                    Object.assign(primary,{x:landing.x,y:landing.y,aiTarget:null,aiTimer:1});
                    Object.assign(support,{x:supportX,y:landing.y,aiTarget:null,aiTimer:1});
                    const currentBallDistancePrimary=Math.hypot(primary.x-x,primary.y-y);
                    const currentBallDistanceSupport=Math.hypot(support.x-x,support.y-y);
                    game.driveAI(primary,.016);game.driveAI(support,.016);
                    rows.push({team,dir,name:scenario.name,expected,landing,
                        primary:primary.aiTarget,support:support.aiTarget,
                        currentBallDistancePrimary,currentBallDistanceSupport,
                        primaryUsesLanding:true});
                }
            }
            const supportRows=[];
            for(const team of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';game.terrain='Grass';game.condition='Clear';
                const dir=team===0?1:-1,primary=game.player(team,3),
                    atPocket=game.player(team,4),closing=game.player(team,5);
                const x=field.x+field.w*.5,y=field.y+field.h*.5;
                for(const p of game.players){
                    p.aiTarget=null;p.aiTimer=0;p.aiAssistTarget=null;p.aiGiveAndGoRun=null;
                    p.action='idle';p.actionTimer=0;p.z=0;p.down=true;p.stun=1;
                }
                for(const p of [primary,atPocket,closing])Object.assign(p,{
                    x,y,down:false,stun:0,invuln:0,z:0,action:'idle',actionTimer:0,
                    slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,
                    shotImpactRiseTimer:0,aiTarget:null,aiTimer:1
                });
                Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
                    x,y,z:0,vx:dir*180,vy:-60,vz:0,canCollect:0,age:.35,
                    lastTouchTeam:1-team,attacker:1-team});
                game.clock=5;
                const flight=(1-Math.pow(.986,.18*60))/(60*(1-.986)),landing={x:x+dir*180*flight,y:y-60*flight},
                    cover={x:landing.x-dir*26,y:landing.y};
                Object.assign(primary,{x:landing.x,y:landing.y,moveVX:0,moveVY:0});
                Object.assign(atPocket,{x:cover.x,y:cover.y,moveVX:dir*220,moveVY:0});
                Object.assign(closing,{x:cover.x-dir*4,y:cover.y,moveVX:dir*33,moveVY:0});
                game.moveAgile=()=>{};
                game.driveAI(primary,.016);game.driveAI(atPocket,.016);game.driveAI(closing,.016);
                supportRows.push({team,landing,cover,primary:primary.aiTarget,
                    retreating:atPocket.aiTarget,closing:closing.aiTarget});
            }
            return {rows,supportRows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:SupermagicFootball.teams.length};
        }""")
        assert result['buttons']==4,(kind,result)
        assert result['teams']>=223,(kind,result)
        for row in result['rows']:
            assert row['support'] and abs(row['support']['x']-row['expected']['x'])<1e-6,(kind,row)
            assert abs(row['support']['y']-row['expected']['y'])<1e-6,(kind,row)
            assert row['primary'],(kind,row)
            gap=((row['primary']['x']-row['support']['x'])**2+
                (row['primary']['y']-row['support']['y'])**2)**.5
            if row['primaryUsesLanding']:
                assert abs(row['primary']['x']-row['landing']['x'])<1e-6,(kind,row)
                assert abs(row['primary']['y']-row['landing']['y'])<1e-6,(kind,row)
                assert abs(gap-26)<1e-6,(kind,row)
                if row['name']!='vertical':
                    assert row['currentBallDistanceSupport']<row['currentBallDistancePrimary'],(kind,row)
            else:
                assert gap>.5,(kind,row)
        for row in result['supportRows']:
            assert row['primary'] and abs(row['primary']['x']-row['landing']['x'])<1e-6,(kind,row)
            assert row['primary'] and abs(row['primary']['y']-row['landing']['y'])<1e-6,(kind,row)
            assert row['closing'] and abs(row['closing']['x']-row['cover']['x'])<1e-6,(kind,row)
            assert row['closing'] and abs(row['closing']['y']-row['cover']['y'])<1e-6,(kind,row)
            assert row['retreating'] and (abs(row['retreating']['x']-row['cover']['x'])>1e-6 or
                abs(row['retreating']['y']-row['cover']['y'])>1e-6),(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'landing-center primary, momentum-aware goal-side support, mirrored teams, four actions and no JS errors',flush=True)
        ctx.close()
    browser.close()
