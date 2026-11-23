#!/usr/bin/env python3
"""Desktop and simulated-touch acceptance for lateral carrier-aware support cover."""
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
        page.wait_for_function('!!window.SupermagicFootball?.game?.defensiveCarrierSupportCoverTarget')
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game;
            const bounds={xMin:100,xMax:2000,yMin:100,yMax:1300};
            const player=(t,x,y,extra={})=>({t,x,y,keeper:false,down:false,stun:0,z:0,...extra});
            const down=game.defensiveCarrierSupportCoverTarget(
                player(0,850,800),player(1,1000,700,{moveVY:180}),bounds);
            const up=game.defensiveCarrierSupportCoverTarget(
                player(1,1150,800),player(0,1000,700,{moveVY:-180}),bounds);
            const capped=game.defensiveCarrierSupportCoverTarget(
                player(0,850,800),player(1,1000,700,{moveVY:2000}),bounds,.18);
            const runEngine=(team,carrierVY)=>{
                const dir=team===0?1:-1;
                game.init({home:0,away:1,mode:'quick',humans:0});
                const carrier=game.player(1-team,3);
                const primary=game.player(team,3);
                const support=game.player(team,4);
                for(const q of game.players)if(q!==carrier&&q!==primary&&q!==support){q.down=true;q.stun=1;}
                Object.assign(carrier,{x:1050,y:700,z:0,down:false,stun:0,invuln:0,action:'idle',
                    moveVX:0,moveVY:carrierVY,firstTouchPressure:0,firstTouchControlTimer:0});
                Object.assign(primary,{x:1050-dir*70,y:700,z:0,down:false,stun:0,invuln:0,cd:0,
                    action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
                Object.assign(support,{x:1050-dir*110,y:795,z:0,down:false,stun:0,invuln:0,cd:0,
                    aiTimer:0,aiTarget:null,aiDetour:null,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
                Object.assign(game.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,
                    pass:false,shot:null,strike:null,ordinaryShot:false});
                game.clock=10;
                game.driveAI(support,.016);
                return {target:support.aiTarget,expectedX:carrier.x-dir*110,
                    expectedY:Math.max(123,Math.min(1277,carrier.y+Math.max(-36,Math.min(36,carrierVY*.12))+95))};
            };
            const engineRows=[runEngine(0,180),runEngine(1,-180)];
            return {down,up,capped,engineRows,
                buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:SupermagicFootball.teams.filter(team=>
                    !['concept_demo','crown_royals_reference'].includes(team.group)).length};
        }""")
        assert abs(result['down']['y']-816.6)<1e-9,(kind,result)
        assert abs(result['up']['y']-773.4)<1e-9,(kind,result)
        assert result['capped']['y']==831,(kind,result)
        for row in result['engineRows']:
            assert abs(row['target']['x']-row['expectedX'])<1e-9,(kind,row)
            assert abs(row['target']['y']-row['expectedY'])<1e-9,(kind,row)
        assert result['buttons']==4 and result['teams']==223,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'lateral carrier cover, bounded projection, actual support assignment, 223 teams and four actions',flush=True)
        ctx.close()
    browser.close()
