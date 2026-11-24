#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for keeper cutback runner arrival reads."""
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
            const game=SupermagicFootball.game;
            const targetY=(team,wing,mode)=>{
                game.init({home:0,away:1,mode:'quick',humans:0});
                const keeper=game.players.find(p=>p.t===team&&p.keeper);
                const attacking=1-team,attackDir=team===0?-1:1;
                const ownGoalX=team===0?game.world.field.x:game.world.field.x+game.world.field.w;
                const centerY=game.world.field.y+game.world.field.h/2;
                const carrier=game.players.find(p=>p.t===attacking&&p.i===3);
                const runner=game.players.find(p=>p.t===attacking&&p.i===4);
                const runner2=game.players.find(p=>p.t===attacking&&p.i===5);
                for(const p of game.players)if(p.t===attacking&&!p.keeper&&
                    p!==carrier&&p!==runner&&p!==runner2)p.down=true;
                Object.assign(keeper,{x:ownGoalX+(team===0?34:-34),y:centerY,z:0,
                    stun:0,down:false,action:'idle',actionTimer:0,diveCooldown:0,
                    diveIntentPending:false,aiTimer:0,aiTarget:null,aiAssistTarget:null,
                    moveVX:0,moveVY:0});
                Object.assign(carrier,{x:ownGoalX-attackDir*220,y:centerY+wing*300,z:0,
                    stun:0,down:false,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
                const runnerX=carrier.x-attackDir*150;
                Object.assign(runner,{x:runnerX,y:centerY-wing*40,z:0,stun:0,
                    down:mode==='alternative-only',action:'idle',actionTimer:0,slideTimer:0,
                    moveVX:attackDir*70,moveVY:-wing*180});
                Object.assign(runner2,{x:runnerX,y:centerY-wing*58,z:0,stun:0,
                    down:mode==='runner-only',action:'idle',actionTimer:0,slideTimer:0,
                    moveVX:attackDir*70,moveVY:wing*180});
                Object.assign(game.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,
                    vx:0,vy:0,vz:0,attacker:attacking,lastTouchTeam:attacking,
                    pass:false,passTarget:null,passTeam:null,shot:null,strike:null,ordinaryShot:false});
                keeper.aiTimer=0;keeper.aiTarget=null;game.clock=.2;
                game.driveAI(keeper,1/60);
                return keeper.aiTarget?.y??null;
            };
            const rows=[];
            for(const team of [0,1])for(const wing of [-1,1]){
                const movingOut=targetY(team,wing,'runner-only');
                const movingIn=targetY(team,wing,'alternative-only');
                const both=targetY(team,wing,'both');
                rows.push({team,wing,movingOut,movingIn,both});
            }
            return {rows,teams:SupermagicFootball.teams.length,
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
        }""")
        assert not errors,(kind,errors)
        assert result['teams']==223,(kind,result)
        assert result['buttons']==4,(kind,result)
        assert len(result['rows'])==4,(kind,result)
        for row in result['rows']:
            assert row['movingOut'] is not None and row['movingIn'] is not None and row['both'] is not None,(kind,row)
            assert abs(row['both']-row['movingIn'])<1e-7,(kind,row)
            assert abs(row['both']-row['movingOut'])>1.5,(kind,row)
        print('PASS',kind,'four mirrored keeper cutback arrival contests; four actions and 223 teams intact',flush=True)
        ctx.close()
    browser.close()
