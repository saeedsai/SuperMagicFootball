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
            const heightDefender=player(0,1000,700,{dx:1,dy:0,face:1,moveVX:240,moveVY:0});
            const heightCarrier=player(1,1055,700,{moveVX:340,moveVY:0});
            const heightBall=z=>({owner:heightCarrier,x:heightCarrier.x-17,y:heightCarrier.y+12,z});
            const ballHeightRows=[19.99,20,45,NaN,Infinity].map(z=>({
                heightLabel:String(z),
                poke:game.defensivePokeBallSideRead(heightDefender,heightCarrier,heightBall(z)),
                slide:game.defensiveTackleSlideBallSideRead(heightDefender,heightCarrier,heightBall(z),320)
            }));
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
            const runCloseContactPoke=(defendingTeam,exposed,ballZ=12)=>{
                const dir=defendingTeam===0?1:-1;
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';game.supernova=null;game.magicWall=null;game.spinBumper=null;game.maceSweep=null;game.lightning=null;game.hazards=[];
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                const x=1000,y=700;
                for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,aiTimer:0,aiTarget:null,aiDetour:null,
                    action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
                carrier.src={...carrier.src,magicTrick:null};carrier.dribbleHold=0;carrier.hideBallTimer=0;Object.assign(carrier,{x:x+dir*52,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
                Object.assign(game.ball,{owner:carrier,x:carrier.x+(exposed?-dir*17:dir*17),y:y+12,z:ballZ,
                    vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
                game.clock=.5;game.activateDefence=()=>false;
                const calls=[];game.tackle=(who,slide,slideBall)=>{calls.push({same:who?.t===defender.t&&who?.i===defender.i&&who?.src?.id===defender.src?.id,slide,
                     liveBall:!!slideBall&&slideBall.owner?.t===carrier.t&&slideBall.owner?.i===carrier.i&&slideBall.owner?.src?.id===carrier.src?.id,ballX:slideBall?.x,ballY:slideBall?.y});who.cd=.5;return true;};
                const originalRandom=Math.random;Math.random=()=>0;
                try{game.driveAI(defender,.016);}finally{Math.random=originalRandom;}
                return calls;
            };
            const closeContactEngineRows=[];
            for(const defendingTeam of [0,1])closeContactEngineRows.push({team:defendingTeam,
                exposed:runCloseContactPoke(defendingTeam,true),shielded:runCloseContactPoke(defendingTeam,false)});
            const runActualPokeAim=(defendingTeam,exposed)=>{
                const dir=defendingTeam===0?1:-1;
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';game.supernova=null;game.magicWall=null;game.spinBumper=null;game.maceSweep=null;game.lightning=null;game.hazards=[];
                game.tackle=Object.getPrototypeOf(game).tackle;
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                const x=1000,y=700;
                for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
                carrier.src={...carrier.src,magicTrick:null};carrier.dribbleHold=0;carrier.hideBallTimer=0;Object.assign(carrier,{x:x+dir*52,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0});
                const ballX=carrier.x+(exposed?-dir*17:dir*17),ballY=y+12;
                Object.assign(game.ball,{owner:carrier,x:ballX,y:ballY,z:12,vx:0,vy:0,vz:0,
                    pass:false,shot:null,strike:null,ordinaryShot:false});
                const expectedX=exposed?ballX-x:dir*52,expectedY=exposed?ballY-y:0;
                const length=Math.hypot(expectedX,expectedY);
                const originalRandom=Math.random;Math.random=()=>0;
                try{game.tackle(defender,false,game.ball);}finally{Math.random=originalRandom;}
                return {released:game.ball.owner===null,vx:game.ball.vx,vy:game.ball.vy,
                    expectedVx:expectedX/length*150,expectedVy:expectedY/length*150};
            };
            const actualPokeAimRows=[];
            for(const team of [0,1])actualPokeAimRows.push({team,
                exposed:runActualPokeAim(team,true),shielded:runActualPokeAim(team,false)});
            const runCpuSlide=(defendingTeam,exposed,range=55,firstTouch=false,ballZ=12)=>{
                const dir=defendingTeam===0?1:-1;
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';game.supernova=null;game.magicWall=null;game.spinBumper=null;game.maceSweep=null;game.lightning=null;game.hazards=[];
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                const x=1000,y=700,carrierX=x+dir*range;
                for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,aiTimer:0,aiTarget:null,aiDetour:null,
                    action:'idle',actionTimer:0,moveVX:dir*240,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
                carrier.src={...carrier.src,magicTrick:null};carrier.dribbleHold=0;carrier.hideBallTimer=0;Object.assign(carrier,{x:carrierX,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
                    moveVX:dir*(firstTouch?100:340),moveVY:0,
                    firstTouchControlTimer:firstTouch ? .16 : 0,firstTouchPressure:firstTouch ? .8 : 0});
                Object.assign(game.ball,{owner:carrier,x:carrier.x+(exposed?-dir*17:dir*17),y:y+12,z:ballZ,
                    vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
                game.clock=.5;game.activateDefence=()=>false;
                const calls=[];game.tackle=(who,slide,slideBall)=>{calls.push({same:who?.t===defender.t&&who?.i===defender.i&&who?.src?.id===defender.src?.id,slide,
                     liveBall:!!slideBall&&slideBall.owner?.t===carrier.t&&slideBall.owner?.src?.id===carrier.src?.id,ballX:slideBall?.x,ballY:slideBall?.y});who.cd=.5;return true;};
                const originalRandom=Math.random;Math.random=()=>0;
                try{game.driveAI(defender,.016);}finally{Math.random=originalRandom;}
                return calls;
            };
            const closeContactSlideRows=[],firstTouchSlideRows=[];
            for(const team of [0,1]){
                closeContactSlideRows.push({team,exposed:runCpuSlide(team,true,55,false),shielded:runCpuSlide(team,false,55,false)});
                firstTouchSlideRows.push({team,exposed:runCpuSlide(team,true,85,true),shielded:runCpuSlide(team,false,85,true)});
            }
            const airborneGroundChallengeRows=[];
            for(const team of [0,1])airborneGroundChallengeRows.push({team,
                closeContact20:runCloseContactPoke(team,true,20),
                closeContact45:runCloseContactPoke(team,true,45),
                ordinarySlide20:runCpuSlide(team,true,55,false,20),
                firstTouchSlide20:runCpuSlide(team,true,85,true,20)});
            const runApproachCommit=(defendingTeam,defenderSpeed,carrierSpeed=0,range=88)=>{
                const dir=defendingTeam===0?1:-1;
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';game.supernova=null;game.magicWall=null;game.spinBumper=null;game.maceSweep=null;game.lightning=null;game.hazards=[];game.magicHazards=[];game.tornado=null;
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                const x=1000,y=700;
                for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,aiTimer:0,
                    aiTarget:null,aiDetour:null,action:'idle',actionTimer:0,moveVX:dir*defenderSpeed,
                    moveVY:0,dx:0,dy:0,face:-dir,sprintCharge:0,dashTimer:0,magicReadCounterpressTimer:0});
                carrier.src={...carrier.src,magicTrick:null};carrier.dribbleHold=0;carrier.hideBallTimer=0;Object.assign(carrier,{x:x+dir*range,y,z:0,down:false,stun:0,invuln:0,
                    action:'idle',actionTimer:0,moveVX:dir*carrierSpeed,moveVY:0,firstTouchControlTimer:0,firstTouchPressure:0});
                Object.assign(game.ball,{owner:carrier,x:carrier.x-dir*17,y:y+12,z:12,
                    vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
                game.clock=.5;game.activateDefence=()=>false;
                const calls=[];game.tackle=(who,slide,slideBall)=>{
                    calls.push({same:who?.t===defender.t&&who?.i===defender.i&&who?.src?.id===defender.src?.id,slide,liveBall:!!slideBall&&slideBall.owner?.t===carrier.t&&slideBall.owner?.src?.id===carrier.src?.id});
                    who.cd=.5;return true;
                };
                const originalRandom=Math.random;Math.random=()=>0;
                try{game.driveAI(defender,.016);}finally{Math.random=originalRandom;}
                return {team:defendingTeam,defenderSpeed,carrierSpeed,range,calls};
            };
            const relativeApproachRows=[
                {name:'approach',...runApproachCommit(0,220,0,88)},
                {name:'mirrored',...runApproachCommit(1,220,0,88)},
                {name:'net-threshold',...runApproachCommit(0,220,100,78)},
                {name:'below-net-threshold',...runApproachCommit(0,220,110,88)},
                {name:'contact-boundary',...runApproachCommit(0,220,0,90)}
            ];
            const runTurnAwareCommit=(defendingTeam,agility,options={})=>{
                const dir=defendingTeam===0?1:-1;
                const input=options.input||'cut';
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';game.supernova=null;game.magicWall=null;game.spinBumper=null;game.maceSweep=null;game.lightning=null;game.hazards=[];
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                const x=1000,y=700;
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,
                    moveVX:dir*(options.defenderSpeed??200),moveVY:0,dx:dir,dy:0,face:dir,
                    src:{...(defender.src||{}),defence:50}});
                carrier.src={...carrier.src,magicTrick:null};carrier.dribbleHold=0;carrier.hideBallTimer=0;Object.assign(carrier,{x:x+dir*83,y,z:0,down:false,stun:0,invuln:0,
                    moveVX:dir*(options.carrierSpeed??110),moveVY:0,
                    dx:input==='cut'?0:input==='neutral'?0:NaN,
                    dy:input==='cut'?1:input==='neutral'?0:Infinity});
                carrier.src={...(carrier.src||{}),agility};
                Object.assign(game.ball,{owner:carrier,x:carrier.x-dir*17,y:y+12,z:12,
                    vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
                return game.defensivePokeCommitWindow(defender,carrier,options.ball===false?null:game.ball);
            };
            const turnAwareRows=[0,1].map(team=>({team,
                elite:runTurnAwareCommit(team,100),
                average:runTurnAwareCommit(team,50),
                low:runTurnAwareCommit(team,1),
                invalidAgility:runTurnAwareCommit(team,NaN),
                neutral:runTurnAwareCommit(team,100,{input:'neutral'}),
                invalidInput:runTurnAwareCommit(team,100,{input:'invalid'}),
                noBall:runTurnAwareCommit(team,100,{ball:false}),
                slow:runTurnAwareCommit(team,100,{carrierSpeed:60})
            }));
            const runHumanCommandAim=(defendingTeam,action,exposed)=>{
                const dir=defendingTeam===0?1:-1,x=1000,y=700;
                game.init({home:0,away:1,mode:'quick',humans:1});game.weather='Clear';
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
                carrier.src={...carrier.src,magicTrick:null};carrier.dribbleHold=0;carrier.hideBallTimer=0;Object.assign(carrier,{x:x+dir*52,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0});
                const ballX=carrier.x+(exposed?-dir*17:dir*17),ballY=y+12;
                Object.assign(game.ball,{owner:carrier,x:ballX,y:ballY,z:12,vx:0,vy:0,vz:0,
                    pass:false,shot:null,strike:null,ordinaryShot:false});
                game.slideContact=()=>{};
                game.command(defender,action);
                const targetX=exposed?ballX:carrier.x,targetY=exposed?ballY:carrier.y;
                const length=Math.hypot(targetX-x,targetY-y);
                return {team:defendingTeam,action,exposed,actionState:defender.action,
                    dx:defender.slideDX,dy:defender.slideDY,
                    expectedX:(targetX-x)/length,expectedY:(targetY-y)/length};
            };
            const humanCommandAimRows=[];
            for(const team of [0,1])for(const action of ['pass','shoot'])for(const exposed of [true,false])
                humanCommandAimRows.push(runHumanCommandAim(team,action,exposed));
            const runHumanBallArcSlide=(defendingTeam,action,exposed)=>{
                const dir=defendingTeam===0?1:-1,x=1000,y=700;
                game.init({home:0,away:1,mode:'quick',humans:1});game.weather='Clear';
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
                carrier.src={...carrier.src,magicTrick:null};carrier.dribbleHold=0;carrier.hideBallTimer=0;
                Object.assign(carrier,{x:x+dir*30,y:y+120,z:0,down:false,stun:0,invuln:0,
                    action:'idle',actionTimer:0,moveVX:0,moveVY:0});
                const ballX=carrier.x,ballY=carrier.y+(exposed?-10:10);
                Object.assign(game.ball,{owner:carrier,x:ballX,y:ballY,z:12,vx:0,vy:0,vz:0,
                    pass:false,shot:null,strike:null,ordinaryShot:false});
                game.slideContact=()=>{};
                game.command(defender,action);
                const expectedX=exposed?ballX-x:dir,expectedY=exposed?ballY-y:0,length=Math.hypot(expectedX,expectedY);
                return {team:defendingTeam,action,exposed,actionState:defender.action,dx:defender.slideDX,dy:defender.slideDY,
                    expectedX:expectedX/length,expectedY:expectedY/length,
                    bodyDot:dir*(carrier.x-x)/Math.hypot(carrier.x-x,carrier.y-y),
                    ballDot:dir*(ballX-x)/Math.hypot(ballX-x,ballY-y)};
            };
            const humanBallArcSlideRows=[];
            for(const team of [0,1])for(const action of ['pass','shoot'])for(const exposed of [true,false])
                humanBallArcSlideRows.push(runHumanBallArcSlide(team,action,exposed));
            const runHumanPokeBallArc=(defendingTeam,exposed,passLiveBall=true)=>{
                const dir=defendingTeam===0?1:-1,x=1000,y=700;
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                game.tackle=Object.getPrototypeOf(game).tackle;
                const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
                for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
                Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
                Object.assign(carrier,{x:x+dir*15,y:y+62,z:0,down:false,stun:0,invuln:0,
                    action:'idle',actionTimer:0,moveVX:0,moveVY:0});
                const ballX=exposed?carrier.x+dir*2:carrier.x+dir*12;
                const ballY=exposed?carrier.y-12:carrier.y;
                Object.assign(game.ball,{owner:carrier,x:ballX,y:ballY,z:12,vx:0,vy:0,vz:0,
                    pass:false,shot:null,strike:null,ordinaryShot:false});
                const sideRead=game.defensivePokeBallSideRead(defender,carrier,game.ball);
                const expectedX=ballX-x,expectedY=ballY-y,length=Math.hypot(expectedX,expectedY);
                const originalRandom=Math.random;Math.random=()=>0;
                try{game.tackle(defender,false,passLiveBall?game.ball:null);}finally{Math.random=originalRandom;}
                return {team:defendingTeam,exposed,passLiveBall,sideRead,released:game.ball.owner===null,
                    vx:game.ball.vx,vy:game.ball.vy,expectedVx:expectedX/length*150,expectedVy:expectedY/length*150,
                    dx:defender.dx,dy:defender.dy,
                    bodyDot:dir*(carrier.x-x)/Math.hypot(carrier.x-x,carrier.y-y),
                    ballDot:dir*(ballX-x)/Math.hypot(ballX-x,ballY-y)};
            };
            const humanPokeBallArcRows=[];
            for(const team of [0,1]){
                humanPokeBallArcRows.push(runHumanPokeBallArc(team,true,true));
                humanPokeBallArcRows.push(runHumanPokeBallArc(team,false,true));
                humanPokeBallArcRows.push(runHumanPokeBallArc(team,true,false));
            }
            const canonicalTeams=SupermagicFootball.teams.filter(team=>
                !['concept_demo','crown_royals_reference'].includes(team.group)).length;
            return {right,left,retreat,lateral,staleVelocity,low,high,sideOn,elite,weak,average,mirroredElite,relativeApproachRows,turnAwareRows,
                exposedBallRead,shieldedBallRead,leftExposedBallRead,leftShieldedBallRead,
                closeBallSideRows,ballHeightRows,closeContactEngineRows,actualPokeAimRows,closeContactSlideRows,firstTouchSlideRows,
                airborneGroundChallengeRows,humanCommandAimRows,humanBallArcSlideRows,humanPokeBallArcRows,
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:canonicalTeams};
        }""")
        for row in result['relativeApproachRows']:
            expected=row['name'] in ('approach','mirrored','net-threshold')
            assert len(row['calls'])==(1 if expected else 0),(kind,row)
            if expected:
                assert row['calls'][0]['same'] and row['calls'][0]['liveBall'],(kind,row)
        for row in result['turnAwareRows']:
            assert row['elite'] and not row['average'] and not row['low'],(kind,row)
            assert not row['invalidAgility'] and not row['neutral'] and not row['invalidInput'],(kind,row)
            assert not row['noBall'] and row['slow'],(kind,row)
        assert result['right'] and result['left'],(kind,result)
        assert not result['retreat'] and not result['lateral'] and not result['sideOn'] and not result['staleVelocity'],(kind,result)
        assert result['low'] and not result['high'],(kind,result)
        assert result['elite'] and not result['weak'] and result['average'] and result['mirroredElite'],(kind,result)
        assert result['exposedBallRead'] and not result['shieldedBallRead'],(kind,result)
        assert result['leftExposedBallRead'] and not result['leftShieldedBallRead'],(kind,result)
        for row in result['closeBallSideRows']:
            assert row['exposed'] and not row['shielded'],(kind,row)
        for row in result['ballHeightRows']:
            expected=row['heightLabel']=='19.99'
            assert row['poke']==expected and row['slide']==expected,(kind,row)
        for row in result['closeContactEngineRows']:
            assert row['exposed'] and all(call['same'] and not call['slide'] and call['liveBall'] for call in row['exposed']),(kind,row)
            assert row['shielded']==[],(kind,row)
        for row in result['actualPokeAimRows']:
            for profile in ('exposed','shielded'):
                sample=row[profile]
                assert sample['released'],(kind,row,profile)
                assert abs(sample['vx']-sample['expectedVx'])<1e-6,(kind,row,profile,sample)
                assert abs(sample['vy']-sample['expectedVy'])<1e-6,(kind,row,profile,sample)
        for row in result['closeContactSlideRows']:
            assert len(row['exposed'])==1 and row['exposed'][0]['same'] and row['exposed'][0]['slide'] and row['exposed'][0]['liveBall'],(kind,row)
            assert row['shielded']==[],(kind,row)
        for row in result['firstTouchSlideRows']:
            assert len(row['exposed'])==1 and row['exposed'][0]['same'] and row['exposed'][0]['slide'] and row['exposed'][0]['liveBall'],(kind,row)
            assert row['shielded']==[],(kind,row)
        for row in result['airborneGroundChallengeRows']:
            assert row['closeContact20']==[] and row['closeContact45']==[],(kind,row)
            assert row['ordinarySlide20']==[] and row['firstTouchSlide20']==[],(kind,row)
        for row in result['humanCommandAimRows']:
            assert row['actionState']=='slide',(kind,row)
            assert abs(row['dx']-row['expectedX'])<1e-6,(kind,row)
            assert abs(row['dy']-row['expectedY'])<1e-6,(kind,row)
        for row in result['humanBallArcSlideRows']:
            assert row['actionState']=='slide',(kind,row)
            if row['exposed']:
                assert row['bodyDot']<.25 and row['ballDot']>=.25,(kind,row)
                assert abs(row['dx']-row['expectedX'])<1e-6 and abs(row['dy']-row['expectedY'])<1e-6,(kind,row)
            else:
                assert row['bodyDot']<.25 and row['ballDot']<.25,(kind,row)
                assert abs(row['dx']-(1 if row['team']==0 else -1))<1e-6 and abs(row['dy'])<1e-6,(kind,row)
        for row in result['humanPokeBallArcRows']:
            if row['exposed'] and row['passLiveBall']:
                assert row['bodyDot']<.25 and row['ballDot']>.25 and row['sideRead'],(kind,row)
                assert row['released'],(kind,row)
                assert abs(row['vx']-row['expectedVx'])<1e-6 and abs(row['vy']-row['expectedVy'])<1e-6,(kind,row)
            else:
                assert not row['released'],(kind,row)
                assert row['sideRead']==row['exposed'],(kind,row)
                assert abs(row['dx']-(1 if row['team']==0 else -1))<1e-6 and abs(row['dy'])<1e-6,(kind,row)
        assert result['buttons']==4 and result['teams']==223,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'adaptive poke, exposed-ball CPU and human Pass/Shoot slides, exposed-ball short pokes, first-touch reads, airborne ground-challenge rejection, shielded-carrier counterplay, 223 teams and four actions',flush=True)
        ctx.close()
    browser.close()
