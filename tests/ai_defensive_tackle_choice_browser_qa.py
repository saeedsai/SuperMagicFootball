#!/usr/bin/env python3
"""Desktop and simulated-touch acceptance for player-aware CPU slide choice."""
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
        page.wait_for_function('!!window.SupermagicFootball?.game?.cpuTackleSlideChance && !!window.SupermagicFootball?.game?.defensiveTackleSlideBallSideRead')
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game;
            const liveSlideAim=(team,agility,withLiveBall=true,carrierVY=200,slide=true,turnInput=true)=>{
                const match=new game.constructor({halfSeconds:120});
                match.init({home:0,away:1,mode:'quick',humans:0});
                const dir=team===0?1:-1,defender=match.player(team,3),carrier=match.player(1-team,3);
                Object.assign(defender,{x:1000,y:700,z:0,down:false,stun:0,invuln:0,cd:0,
                    moveVX:dir*220,moveVY:0,dx:dir,dy:0,face:dir});
                carrier.src={...(carrier.src||{}),agility};
                Object.assign(carrier,{x:1000+dir*55,y:700,z:0,down:false,stun:0,invuln:0,
                    moveVX:0,moveVY:carrierVY,dx:turnInput?dir:0,dy:0,action:'idle',actionTimer:0});
                Object.assign(match.ball,{owner:carrier,x:carrier.x-dir*17,y:carrier.y+20,z:12,
                    vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
                if(withLiveBall&&!match.defensivePokeBallSideRead(defender,carrier,match.ball))throw new Error('fixture ball must be exposed to the defender');
                match.spendStamina=()=>{};match.slideContact=()=>{};match.emit=()=>{};
                const originalRandom=Math.random;Math.random=()=>1;
                try{match.tackle(defender,slide,withLiveBall?match.ball:null);}
                finally{Math.random=originalRandom;}
                return slide?{x:defender.slideDX,y:defender.slideDY}:{x:defender.x-1000,y:defender.y-700};
            };
            const slideAgility={};
            for(const team of [0,1]){
                const elite=liveSlideAim(team,100),average=liveSlideAim(team,50),low=liveSlideAim(team,1);
                const missing=liveSlideAim(team,undefined),invalid=liveSlideAim(team,NaN);
                const bodyElite=liveSlideAim(team,100,false),bodyLow=liveSlideAim(team,1,false);
                const cappedElite=liveSlideAim(team,100,true,10000),cappedLow=liveSlideAim(team,1,true,10000);
                const elitePoke=liveSlideAim(team,100,true,200,false),lowPoke=liveSlideAim(team,1,true,200,false);
                const neutralElite=liveSlideAim(team,100,true,200,true,false),neutralLow=liveSlideAim(team,1,true,200,true,false);
                slideAgility[team]={elite,average,low,missing,invalid,bodyElite,bodyLow,cappedElite,cappedLow,elitePoke,lowPoke,neutralElite,neutralLow};
            }
            const slideRead=(team,agility,crossing=100,straight=false)=>{
                const dir=team===0?1:-1;
                const defender={t:team,x:1000,y:700,keeper:false,down:false,stun:0,invuln:0,z:0,
                    moveVX:dir*110,moveVY:0,dx:dir,dy:0,face:dir,src:{agility}};
                const carrier={t:1-team,x:1000+dir*60,y:700,keeper:false,down:false,stun:0,invuln:0,z:0,
                    moveVX:straight?dir*300:dir*40,moveVY:straight?0:crossing};
                const ball={owner:carrier,x:carrier.x-dir*17,y:carrier.y,z:12};
                return game.defensiveTackleSlideBallSideRead(defender,carrier,ball,160);
            };
            const profile=(defence,aggression,fatigue=0)=>({fatigue,src:{
                id:'slide-profile-'+defence+'-'+aggression,role:'DF',defence,aggression
            }});
            const neutral=game.cpuTackleSlideChance(profile(50,50,0),.5,.24,.4);
            const low=game.cpuTackleSlideChance(profile(20,20,0),.5,.24,.4);
            const high=game.cpuTackleSlideChance(profile(90,90,0),.5,.24,.4);
            const primary=game.cpuTackleSlideChance(profile(50,50,0),.5,.17,.35);
            const halfFatigue=game.cpuTackleSlideChance(profile(50,50,.5),.5,.24,.4);
            const fullFatigue=game.cpuTackleSlideChance(profile(50,50,1),.5,.24,.4);
            const primaryFullFatigue=game.cpuTackleSlideChance(profile(50,50,1),.5,.17,.35);
            const invalidFatigue=game.cpuTackleSlideChance(profile(50,50,NaN),.5,.24,.4);
            const boundedLow=game.cpuTackleSlideChance(profile(1,1),0,-5,-2);
            const boundedHigh=game.cpuTackleSlideChance(profile(100,100),1,2,2);
            const canonicalTeams=SupermagicFootball.teams.filter(team=>
                !['concept_demo','crown_royals_reference'].includes(team.group)).length;
            return {neutral,low,high,primary,halfFatigue,fullFatigue,primaryFullFatigue,invalidFatigue,boundedLow,boundedHigh,
                slideHighRight:slideRead(0,100),slideAverageRight:slideRead(0,50),slideLowRight:slideRead(0,20),
                slideHighLeft:slideRead(1,100),slideAverageLeft:slideRead(1,50),slideLowLeft:slideRead(1,20),
                slideLowWideCut:slideRead(0,1,120),slideMissingAgility:slideRead(0,undefined),
                slideInvalidAgility:slideRead(1,NaN),slideStraightLow:slideRead(0,1,0,true),slideAgility,
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:canonicalTeams};
        }""")
        assert abs(result['neutral']-.44)<1e-9,(kind,result)
        assert abs(result['primary']-.345)<1e-9,(kind,result)
        assert result['low']<result['neutral']<result['high'],(kind,result)
        assert result['halfFatigue']<result['neutral'] and result['fullFatigue']<result['halfFatigue'],(kind,result)
        assert abs(result['halfFatigue']-.4025)<1e-9 and abs(result['fullFatigue']-.365)<1e-9,(kind,result)
        assert abs(result['primaryFullFatigue']-.27)<1e-9,(kind,result)
        assert abs(result['invalidFatigue']-result['neutral'])<1e-9,(kind,result)
        assert result['boundedLow']==.12 and result['boundedHigh']==.76,(kind,result)
        assert result['slideHighRight'] and result['slideHighLeft'],(kind,result)
        assert not result['slideAverageRight'] and not result['slideAverageLeft'],(kind,result)
        assert not result['slideLowRight'] and not result['slideLowLeft'],(kind,result)
        assert result['slideLowWideCut'] and result['slideStraightLow'],(kind,result)
        assert not result['slideMissingAgility'] and not result['slideInvalidAgility'],(kind,result)
        for team,read in result['slideAgility'].items():
            assert read['elite']['y']<read['average']['y']<read['low']['y'],(kind,team,read)
            direction=1 if int(team)==0 else -1
            assert direction*read['elite']['x']>direction*read['average']['x']>direction*read['low']['x'],(kind,team,read)
            assert abs(read['neutralElite']['x']-read['neutralLow']['x'])<1e-12 and read['neutralElite']['y']<read['neutralLow']['y'],(kind,team,read)
            assert abs(read['missing']['y']-read['average']['y'])<1e-12,(kind,team,read)
            assert abs(read['invalid']['y']-read['average']['y'])<1e-12,(kind,team,read)
            assert abs(read['bodyElite']['y']-read['bodyLow']['y'])<1e-12,(kind,team,read)
            assert abs(read['cappedElite']['y']-read['cappedLow']['y'])<1e-12,(kind,team,read)
            assert abs(read['elitePoke']['y']-read['lowPoke']['y'])<1e-12,(kind,team,read)
        assert result['buttons']==4,(kind,result)
        assert result['teams']==223,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'player-aware slide choice, neutral baseline, bounds, four actions and 223 teams',flush=True)
        ctx.close()
    browser.close()
