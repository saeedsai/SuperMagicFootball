#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for ball-aware CPU poke and slide decisions."""
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
        page.wait_for_function('!!window.SupermagicFootball?.game?.defensivePokeCommitWindow && !!window.SupermagicFootball?.game?.defensivePokeBallSideRead && !!window.SupermagicFootball?.game?.defensiveTackleSlideBallSideRead')
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game;
            const player=(t,x,y,extra={})=>({t,x,y,keeper:false,down:false,stun:0,invuln:0,z:0,dx:1,dy:0,face:1,...extra});
            const right=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1088,700,{moveVX:-240,moveVY:0}));
            const left=game.defensivePokeCommitWindow(player(1,1088,700,{dx:-1,face:-1}),player(0,1000,700,{moveVX:240,moveVY:0}));
            const retreat=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1088,700,{moveVX:240,moveVY:0}));
            const lateral=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1088,700,{moveVX:0,moveVY:240}));
            const staleVelocity=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1088,700,{moveVX:NaN,moveVY:NaN,vx:-300,vy:0}));
            const low=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1089,700,{moveVX:-240,moveVY:0}));
            const high=game.defensivePokeCommitWindow(player(0,1000,700),player(1,1090,700,{moveVX:-240,moveVY:0}));
            const sideOn=game.defensivePokeCommitWindow(player(0,1000,700,{dx:0,dy:1}),player(1,1088,700,{moveVX:-240,moveVY:0}));
            const elite=game.defensivePokeCommitWindow(player(0,1000,700,{src:{defence:95}}),player(1,1083,700,{moveVX:-110,moveVY:0}));
            const weak=game.defensivePokeCommitWindow(player(0,1000,700,{src:{defence:20}}),player(1,1083,700,{moveVX:-110,moveVY:0}));
            const average=game.defensivePokeCommitWindow(player(0,1000,700,{src:{defence:50}}),player(1,1083,700,{moveVX:-120,moveVY:0}));
            const mirroredElite=game.defensivePokeCommitWindow(player(1,1083,700,{dx:-1,face:-1,src:{defence:95}}),player(0,1000,700,{moveVX:110,moveVY:0}));
            const exposedCarrier=player(1,1088,700,{face:-1,moveVX:-240,moveVY:0});
            const exposedBall={owner:exposedCarrier,x:exposedCarrier.x-17,y:exposedCarrier.y+12,z:12};
            const shieldedCarrier=player(1,1088,700,{face:1,moveVX:-240,moveVY:0});
            const shieldedBall={owner:shieldedCarrier,x:shieldedCarrier.x+17,y:shieldedCarrier.y+12,z:12};
            const exposedBallRead=game.defensivePokeCommitWindow(player(0,1000,700),exposedCarrier,exposedBall);
            const shieldedBallRead=game.defensivePokeCommitWindow(player(0,1000,700),shieldedCarrier,shieldedBall);
            const leftExposedCarrier=player(0,1000,700,{face:1,moveVX:240,moveVY:0});
            const leftExposedBall={owner:leftExposedCarrier,x:leftExposedCarrier.x+17,y:leftExposedCarrier.y+12,z:12};
            const leftShieldedCarrier=player(0,1000,700,{face:-1,moveVX:240,moveVY:0});
            const leftShieldedBall={owner:leftShieldedCarrier,x:leftShieldedCarrier.x-17,y:leftShieldedCarrier.y+12,z:12};
            const leftDefender=player(1,1088,700,{dx:-1,dy:0,face:-1});
            const leftExposedBallRead=game.defensivePokeCommitWindow(leftDefender,leftExposedCarrier,leftExposedBall);
            const leftShieldedBallRead=game.defensivePokeCommitWindow(leftDefender,leftShieldedCarrier,leftShieldedBall);
            const closeBallSideRows=[];
            for(const defendingTeam of [0,1]){
                const dir=defendingTeam===0?1:-1;
                const defender=player(defendingTeam,1000,700,{dx:dir,dy:0,face:dir});
                const carrier=player(1-defendingTeam,1000+dir*52,700,{moveVX:0,moveVY:0});
                const exposed={owner:carrier,x:carrier.x-dir*17,y:carrier.y+12,z:12};
                const shielded={owner:carrier,x:carrier.x+dir*17,y:carrier.y+12,z:12};
                closeBallSideRows.push({team:defendingTeam,
                    exposed:game.defensivePokeBallSideRead(defender,carrier,exposed),
                    shielded:game.defensivePokeBallSideRead(defender,carrier,shielded)});
            }
            const runCloseContactPoke=(defendingTeam,exposed)=>{
                const dir=defendingTeam===0?1:-1;
                game.init({home:0,away:1,mode:'quick',humans:0});
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                const x=1000,y=700;
                for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,aiTimer:0,aiTarget:null,aiDetour:null,
                    action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
                Object.assign(carrier,{x:x+dir*52,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
                Object.assign(game.ball,{owner:carrier,x:carrier.x+(exposed?-dir*17:dir*17),y:y+12,z:12,
                    vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
                game.clock=.5;game.activateDefence=()=>false;
                const calls=[];game.tackle=(who,slide,slideBall)=>{calls.push({same:who===defender,slide,
                     liveBall:!!slideBall&&slideBall.owner===carrier,ballX:slideBall?.x,ballY:slideBall?.y});who.cd=.5;return true;};
                const originalRandom=Math.random;Math.random=()=>0;
                try{game.driveAI(defender,.016);}finally{Math.random=originalRandom;}
                return calls;
            };
            const closeContactEngineRows=[];
            for(const defendingTeam of [0,1])closeContactEngineRows.push({team:defendingTeam,
                exposed:runCloseContactPoke(defendingTeam,true),shielded:runCloseContactPoke(defendingTeam,false)});
            const runCpuSlide=(defendingTeam,exposed,range=55,firstTouch=false)=>{
                const dir=defendingTeam===0?1:-1;
                game.init({home:0,away:1,mode:'quick',humans:0});
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                const x=1000,y=700,carrierX=x+dir*range;
                for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,aiTimer:0,aiTarget:null,aiDetour:null,
                    action:'idle',actionTimer:0,moveVX:dir*240,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
                Object.assign(carrier,{x:carrierX,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
                    moveVX:dir*(firstTouch?100:340),moveVY:0,
                    firstTouchControlTimer:firstTouch ? .16 : 0,firstTouchPressure:firstTouch ? .8 : 0});
                Object.assign(game.ball,{owner:carrier,x:carrier.x+(exposed?-dir*17:dir*17),y:y+12,z:12,
                    vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
                game.clock=.5;game.activateDefence=()=>false;
                const calls=[];game.tackle=(who,slide,slideBall)=>{calls.push({same:who===defender,slide,
                     liveBall:!!slideBall&&slideBall.owner===carrier,ballX:slideBall?.x,ballY:slideBall?.y});who.cd=.5;return true;};
                const originalRandom=Math.random;Math.random=()=>0;
                try{game.driveAI(defender,.016);}finally{Math.random=originalRandom;}
                return calls;
            };
            const closeContactSlideRows=[],firstTouchSlideRows=[];
            for(const team of [0,1]){
                closeContactSlideRows.push({team,exposed:runCpuSlide(team,true,55,false),shielded:runCpuSlide(team,false,55,false)});
                firstTouchSlideRows.push({team,exposed:runCpuSlide(team,true,85,true),shielded:runCpuSlide(team,false,85,true)});
            }
            const canonicalTeams=SupermagicFootball.teams.filter(team=>
                !['concept_demo','crown_royals_reference'].includes(team.group)).length;
            return {right,left,retreat,lateral,staleVelocity,low,high,sideOn,elite,weak,average,mirroredElite,
                exposedBallRead,shieldedBallRead,leftExposedBallRead,leftShieldedBallRead,
                closeBallSideRows,closeContactEngineRows,closeContactSlideRows,firstTouchSlideRows,
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:canonicalTeams};
        }""")
        assert result['right'] and result['left'],(kind,result)
        assert not result['retreat'] and not result['lateral'] and not result['sideOn'] and not result['staleVelocity'],(kind,result)
        assert result['low'] and not result['high'],(kind,result)
        assert result['elite'] and not result['weak'] and result['average'] and result['mirroredElite'],(kind,result)
        assert result['exposedBallRead'] and not result['shieldedBallRead'],(kind,result)
        assert result['leftExposedBallRead'] and not result['leftShieldedBallRead'],(kind,result)
        for row in result['closeBallSideRows']:
            assert row['exposed'] and not row['shielded'],(kind,row)
        for row in result['closeContactEngineRows']:
            assert row['exposed'] and all(call['same'] and not call['slide'] for call in row['exposed']),(kind,row)
            assert row['shielded']==[],(kind,row)
        for row in result['closeContactSlideRows']:
            assert len(row['exposed'])==1 and row['exposed'][0]['same'] and row['exposed'][0]['slide'] and row['exposed'][0]['liveBall'],(kind,row)
            assert row['shielded']==[],(kind,row)
        for row in result['firstTouchSlideRows']:
            assert len(row['exposed'])==1 and row['exposed'][0]['same'] and row['exposed'][0]['slide'] and row['exposed'][0]['liveBall'],(kind,row)
            assert row['shielded']==[],(kind,row)
        assert result['buttons']==4 and result['teams']==223,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'adaptive poke, exposed-ball slide and first-touch reads, shielded-carrier counterplay, 223 teams and four actions',flush=True)
        ctx.close()
    browser.close()
