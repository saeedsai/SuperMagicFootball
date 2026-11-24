#!/usr/bin/env python3
"""Real-engine desktop and simulated-touch acceptance for active CPU presser selection."""
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
            const game=SupermagicFootball.game,rows=[],momentumRows=[];
            const field={x:150,y:155,w:2260.8,h:1220};
            for(const team of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const dir=team===0?1:-1,primary=game.player(team,3),support=game.player(team,4),
                    airborne=game.player(team,5);
                const x=field.x+field.w*.5,y=field.y+field.h*.5;
                for(const p of game.players){
                    p.aiTarget=null;p.aiTimer=0;p.aiAssistTarget=null;p.aiGiveAndGoRun=null;
                    p.action='idle';p.actionTimer=0;p.z=0;p.down=true;p.stun=1;
                }
                for(const p of [primary,support])Object.assign(p,{
                    x:x-dir*18,y:y+(p===support?65:0),down:false,stun:0,z:0,
                    action:'idle',actionTimer:0,slideTimer:0,shotImpactKnockdownPending:0,
                    shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0
                });
                Object.assign(airborne,{x:x-dir*2,y:y+1,down:false,stun:0,z:88,
                    action:'jump',actionTimer:0,slideTimer:0,aiTarget:null,aiTimer:0});
                Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
                    x,y,z:0,vx:0,vy:0,vz:0,canCollect:0,age:2,lastTouchTeam:1-team,attacker:1-team});
                game.clock=5;
                game.driveAI(primary,.016);game.driveAI(support,.016);
                rows.push({team,dir,x,y,primary:primary.aiTarget,support:support.aiTarget});
                const flight=(-40+Math.sqrt(40*40+1000*54))/500;
                const landing={x:x+dir*260*flight,y};
                Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
                    x,y,z:54,vx:dir*260,vy:0,vz:-40,canCollect:0,age:0,lastTouchTeam:1-team,attacker:1-team});
                Object.assign(primary,{x:landing.x-dir*100,y,moveVX:-dir*220,moveVY:0,aiTarget:null,aiTimer:1,
                    down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0});
                Object.assign(support,{x:landing.x-dir*110,y,moveVX:dir*220,moveVY:0,aiTarget:null,aiTimer:1,
                    down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0});
                game.clock=5;game.moveAgile=()=>{};
                const nearBallDistance=Math.hypot(primary.x-x,primary.y-y);
                const closingBallDistance=Math.hypot(support.x-x,support.y-y);
                game.driveAI(primary,.016);game.driveAI(support,.016);
                momentumRows.push({team,dir,landing,cover:{x:landing.x-dir*26,y},
                    near:primary.aiTarget,closing:support.aiTarget,nearBallDistance,closingBallDistance});
            }
            return {rows,momentumRows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:SupermagicFootball.teams.length};
        }""")
        assert result['buttons']==4,(kind,result)
        assert result['teams']>=223,(kind,result)
        for row in result['rows']:
            assert row['primary'] and abs(row['primary']['x']-row['x'])<1e-6 and abs(row['primary']['y']-row['y'])<1e-6,(kind,row)
            assert row['support'] and abs(row['support']['x']-(row['x']-row['dir']*110))<1e-6,(kind,row)
            assert abs(row['support']['y']-(row['y']+95))<1e-6,(kind,row)
        for row in result['momentumRows']:
            assert row['nearBallDistance']<row['closingBallDistance'],(kind,row)
            assert row['closing'] and abs(row['closing']['x']-row['landing']['x'])<1e-6 and abs(row['closing']['y']-row['landing']['y'])<1e-6,(kind,row)
            assert row['near'] and abs(row['near']['x']-row['cover']['x'])<1e-6 and abs(row['near']['y']-row['cover']['y'])<1e-6,(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'grounded/airborne pressers, momentum-aware landing arrival, mirrored teams, four actions and no JS errors',flush=True)
        ctx.close()
    browser.close()
