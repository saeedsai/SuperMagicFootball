from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_quick

root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
        args=['--no-sandbox','--disable-dev-shm-usage'])
    for label,width,height,mobile in [
        ('desktop',1280,720,False),
        ('simulated-touch',844,390,True),
    ]:
        context=browser.new_context(viewport={'width':width,'height':height},
            is_mobile=mobile,has_touch=mobile)
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.evaluate("""() => {
            const data={};
            Object.defineProperty(window,'localStorage',{configurable:true,value:{
                getItem:key=>data[key]??null,
                setItem:(key,value)=>data[key]=String(value),
                removeItem:key=>delete data[key]
            }});
        }""")
        page.set_content((root/'play.html').read_text(),wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
        open_quick(page)
        page.locator('[data-action="kickoff"]').first.click()
        page.evaluate("""() => {
            const game=SupermagicFootball.game;
            if(game.matchState!=='play')throw Error('Match did not start');
            game.kickoffCountdown=0;
        }""")
        assert page.locator('#touchButtons button[data-act]').count()==4

        for team in [0,1]:
            result=page.evaluate("""({team}) => {
                const game=SupermagicFootball.game,dir=team===0?1:-1;
                const keeper=game.player(team,0),x=keeper.x,y=keeper.y;
                const mates=game.players.filter(q=>q.t===team&&!q.keeper);
                for(const q of game.players){
                    q.down=true;q.stun=0;q.z=0;q.action='idle';q.actionTimer=0;
                    q.slideTimer=0;q.shotImpactKnockdownPending=0;
                    q.shotImpactKnockdownTimer=0;q.shotImpactRiseTimer=0;
                }
                Object.assign(keeper,{down:false,stun:0,z:0,x,y,action:'idle',actionTimer:0});
                for(const q of game.players.filter(q=>q.t!==team&&!q.keeper))
                    Object.assign(q,{x:x+dir*700,y:y+250,down:true,stun:0});
                Object.assign(mates[0],{down:false,x:x+dir*180,y,action:'hurt',actionTimer:.4});
                const ready=mates[1];
                Object.assign(ready,{down:false,x:x+dir*390,y:y+90,action:'idle',actionTimer:0});
                game.take(keeper);
                Object.assign(keeper,{action:'keeperHold',actionTimer:0,keeperHold:1});
                game.events.length=0;
                const distributed=game.distributeKeeper(keeper);
                const event=game.events.find(e=>e.type==='keeperDistribution');
                return {distributed,event,expected:ready.src.name,
                    buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                    ownerCleared:game.ball.owner===null,pass:game.ball.pass===true};
            }""",{"team":team})
            assert result['distributed'] and result['event'],(label,team,result,errors)
            assert result['event']['mode']=='short',(label,team,result)
            assert result['event']['target']==result['expected'],(label,team,result)
            assert result['ownerCleared'] and result['pass'] and result['buttons']==4,(label,team,result)

            fallback=page.evaluate("""({team}) => {
                const game=SupermagicFootball.game,dir=team===0?1:-1;
                const keeper=game.player(team,0),x=keeper.x,y=keeper.y;
                const mates=game.players.filter(q=>q.t===team&&!q.keeper);
                for(const q of game.players){
                    q.down=true;q.stun=0;q.z=0;q.action='idle';q.actionTimer=0;
                    q.slideTimer=0;q.shotImpactKnockdownPending=0;
                    q.shotImpactKnockdownTimer=0;q.shotImpactRiseTimer=0;
                }
                Object.assign(keeper,{down:false,stun:0,z:0,x,y,action:'idle',actionTimer:0});
                for(const q of game.players.filter(q=>q.t!==team&&!q.keeper))
                    Object.assign(q,{x:x+dir*700,y:y+250,down:true,stun:0});
                Object.assign(mates[0],{down:false,z:42});
                Object.assign(mates[1],{down:false,action:'shotGetUp',actionTimer:.4});
                Object.assign(mates[2],{down:false,action:'slide',actionTimer:.4});
                Object.assign(mates[3],{down:false,action:'hurt',actionTimer:.4});
                Object.assign(mates[4],{down:false,shotImpactKnockdownTimer:.4});
                game.take(keeper);
                Object.assign(keeper,{action:'keeperHold',actionTimer:0,keeperHold:1});
                game.events.length=0;
                const distributed=game.distributeKeeper(keeper);
                const event=game.events.find(e=>e.type==='keeperDistribution');
                return {distributed,event,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                    ownerCleared:game.ball.owner===null};
            }""",{"team":team})
            assert fallback['distributed'] and fallback['event'],(label,team,fallback,errors)
            assert fallback['event']['mode']=='long' and fallback['event']['target'] is None and fallback['event']['emptySpace'],(label,team,fallback)
            assert fallback['ownerCleared'] and fallback['buttons']==4,(label,team,fallback)

        assert not errors,(label,errors)
        context.close()
    browser.close()
print('Keeper distribution readiness PASS — desktop and simulated-touch, both goal directions, unavailable-receiver rejection, open-turf fallback, four-action HUD')
