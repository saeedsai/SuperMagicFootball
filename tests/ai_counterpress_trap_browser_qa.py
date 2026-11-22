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
            for(const team of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});
                const defending=1-team,dir=team===0?1:-1,field=SupermagicFootball.engine.WORLD.field;
                const carrier=game.player(team,3),primary=game.player(defending,3),support=game.player(defending,4);
                const x=field.x+field.w*.5,y=field.y+field.h*.5;
                for(const q of game.players)if(q!==carrier&&q!==primary&&q!==support){q.down=true;q.stun=0;q.z=0;}
                Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'run',actionTimer:0,
                    moveVX:dir*80,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,
                    firstTouchControlTimer:0,cd:1,trickCd:1});
                Object.assign(primary,{x:x-dir*65,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,cd:1});
                Object.assign(support,{x:x-dir*120,y:y+70,down:false,stun:0,z:0,action:'idle',actionTimer:0,
                    moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,cd:1});
                game.ball.owner=null;game.ball.lastTouchTeam=defending;game.ball.passTeam=null;
                game.ball.pass=false;game.ball.passTarget=null;game.ball.age=0;game.clock=10;
                game.take(carrier);game.driveAI(support,.016);
                const fresh={x:support.aiTarget?.x,y:support.aiTarget?.y};
                game.clock=10.8;game.driveAI(support,.016);
                rows.push({team,dir,carrierX:x,carrierY:y,fresh,expired:support.aiTarget,
                    buttons:document.querySelectorAll('#touchButtons button[data-act]').length});
            }
            return {rows,teams:SupermagicFootball.teams.length};
        }""")
        assert result['teams']>=223,(kind,result)
        assert len(result['rows'])==2,(kind,result)
        for row in result['rows']:
            assert row['buttons']==4,(kind,row)
            assert row['fresh'] and row['fresh']['x'] is not None,(kind,row)
            assert row['dir']*(row['fresh']['x']-row['carrierX'])>50,(kind,row)
            assert abs(row['fresh']['y']-row['carrierY'])<70,(kind,row)
            assert abs(row['expired']['y']-row['carrierY'])>70,(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'fresh turnover support trap, expiry, mirrored engine, four actions and no JS errors',flush=True)
        ctx.close()
    browser.close()
