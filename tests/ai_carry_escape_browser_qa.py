#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for momentum-aware carry escapes."""
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
            const run=(team,momentumY,markerOffset)=>{
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
                const carrier=game.player(team,3),marker=game.player(1-team,3);
                for(const q of game.players)if(q!==carrier&&q!==marker&&!q.keeper){
                    Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0});
                }
                Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'run',actionTimer:0,
                    moveVX:dir*60,moveVY:momentumY,aiTimer:0,aiTarget:null,
                    aiFirstTouchTarget:null,firstTouchControlTimer:0,cd:1,trickCd:1});
                Object.assign(marker,{x:x+dir*65,y:y+markerOffset,down:false,stun:0,z:0,
                    action:'idle',actionTimer:0,moveVX:-dir*30,moveVY:0});
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,
                    passTarget:null,attacker:team,lastTouchTeam:team,age:0,shot:null,strike:null,
                    ordinaryShot:false,hideBallTimer:0});
                // Acceleration deliberately preserves the existing lateral velocity for
                // a short moment. Hold the blocked-lane geometry steady while the
                // movement controller turns; assert the eventual chosen direction,
                // not an impossible instantaneous 16 ms reversal.
                for(let step=0;step<36;step++){
                    carrier.x=x;carrier.y=y;game.clock=1+step*.016;
                    game.driveAI(carrier,.016);
                }
                return {team,momentumY,markerOffset,dy:carrier.dy,moveVY:carrier.moveVY,
                    moveVX:carrier.moveVX};
            };
            const slideRows=[];
            const runSlide=(team,diagonal)=>{
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
                const carrier=game.player(team,3),marker=game.player(1-team,3);
                for(const q of game.players)if(q!==carrier&&q!==marker&&!q.keeper){
                    Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0});
                }
                const sx=diagonal?dir*Math.SQRT1_2:dir,sy=diagonal?Math.SQRT1_2:0;
                Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'run',actionTimer:0,
                    moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,
                    firstTouchControlTimer:0,cd:1,trickCd:1});
                Object.assign(marker,{x:x-dir*80,y:y+(diagonal?-80:0),down:false,stun:0,z:0,
                    action:'slide',actionTimer:.36,slideTimer:.24,slideRemaining:148,
                    slideSpeed:585,slideDX:sx,slideDY:sy,moveVX:sx*585,moveVY:sy*585});
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,
                    passTarget:null,attacker:team,lastTouchTeam:team,age:0,shot:null,strike:null,
                    ordinaryShot:false,hideBallTimer:0});
                for(let step=0;step<36;step++){
                    carrier.x=x;carrier.y=y;game.clock=1+step*.016;
                    game.driveAI(carrier,.016);
                }
                return {team,diagonal,dy:carrier.dy,moveVY:carrier.moveVY};
            };
            const skillRows=[];
            const runSkill=(team,dribbling)=>{
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
                const carrier=game.player(team,3),marker=game.player(1-team,3);
                for(const q of game.players)if(q!==carrier&&q!==marker&&!q.keeper){
                    Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0});
                }
                Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'run',actionTimer:0,
                    moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,
                    firstTouchControlTimer:0,cd:1,trickCd:1});
                Object.assign(carrier.src,{dribbling});
                Object.assign(marker,{x:x+dir*65,y,down:false,stun:0,z:0,
                    action:'idle',actionTimer:0,moveVX:-dir*30,moveVY:0});
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,
                    passTarget:null,attacker:team,lastTouchTeam:team,age:0,shot:null,strike:null,
                    ordinaryShot:false,hideBallTimer:0});
                const originalRandom=Math.random;
                try{
                    Math.random=()=>.99;
                    for(let step=0;step<36;step++){
                        carrier.x=x;carrier.y=y;game.clock=1+step*.016;
                        game.driveAI(carrier,.016);
                    }
                }finally{Math.random=originalRandom;}
                return {team,dribbling,dy:carrier.dy,moveVY:carrier.moveVY};
            };
            for(const team of [0,1]){
                rows.push(run(team,240,0));
                rows.push(run(team,-240,-70));
                slideRows.push(runSlide(team,false));
                slideRows.push(runSlide(team,true));
                skillRows.push(runSkill(team,1),runSkill(team,100));
            }
            return {rows,slideRows,skillRows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:SupermagicFootball.teams.length};
        }""")
        assert result['buttons']==4,(kind,result)
        assert result['teams']>=223,(kind,result)
        assert len(result['rows'])==4,(kind,result)
        for row in result['rows']:
            assert row['dy']>0 and row['moveVY']>0,(kind,row)
        assert len(result['slideRows'])==4,(kind,result)
        for row in result['slideRows']:
            if row['diagonal']:
                assert row['dy']<-.3,(kind,'carrier must choose the open upper diagonal against the upper-lane slide',row)
            else:
                assert abs(row['dy'])>.3,(kind,'carrier must leave a straight incoming slide lane',row)
        assert len(result['skillRows'])==4,(kind,result)
        for team in (0,1):
            low=next(row for row in result['skillRows'] if row['team']==team and row['dribbling']==1)
            high=next(row for row in result['skillRows'] if row['team']==team and row['dribbling']==100)
            assert abs(high['dy'])>abs(low['dy'])+.05,(kind,'higher Dribbling should produce the sharper actual-engine lateral cut',low,high)
            assert high['dy']*low['dy']>0,(kind,'both profiles must preserve the same open-side choice',low,high)
        assert not errors,(kind,errors)
        print('PASS',kind,'momentum-aware escape, live-slide avoidance, mirrored engine, four actions and no JS errors',flush=True)
        ctx.close()
    browser.close()
