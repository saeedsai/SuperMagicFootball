"""SH06 live Chromium checks for bounded warp, ordinary phase contact and burrow recovery."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf8')
JS = r"""() => {
 const game=window.SupermagicFootball?.game;
 if(!game||typeof game.updateBall!=='function')throw Error('playable engine not available');
 const y0=765,results=[];
 function warpOffset(dir,t){const u=Math.max(0,Math.min(1,t/1.65));return dir*28*Math.sin(4*Math.PI*u)**3;}
 for(const dir of [-1,1])for(const fps of [30,60,120]){
  game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
  game.matchState='paused';game.wind={x:0,y:0};game.players=[];const b=game.ball;
  Object.assign(b,{x:1200,y:y0,z:0,vx:250,vy:0,vz:0,owner:null,age:0,canCollect:5,attacker:-1,ordinaryShot:false,pass:false,strike:null,trail:[],shot:{id:'omega',behavior:'warp',direction:dir,level:2}});
  let t=0;for(const end of [.2,.4,.8,1.2,1.65,1.9]){while(t<end-1e-9){const dt=Math.min(1/fps,end-t);game.updateBall(dt);t+=dt;}
   const expected=warpOffset(dir,end),offset=b.y-y0;
   if(Math.abs(offset-expected)>.0001||Math.abs(b.vy-(end<1.65?28*3*(4*Math.PI/1.65)*Math.sin(4*Math.PI*end/1.65)**2*Math.cos(4*Math.PI*end/1.65)*dir:0))>.0001)
    throw Error('Live Omega warp diverged '+JSON.stringify({dir,fps,end,offset,expected,vy:b.vy}));
  }
  if(Math.abs(b.y-y0)>.0001||Math.abs(b.vy)>.0001)throw Error('Warp retained lane drift '+JSON.stringify({dir,fps,y:b.y-y0,vy:b.vy}));
  results.push({kind:'warp',dir,fps});
 }
 const field={x:150,y:155,w:2260.8,h:1220},goalTop=620,goalBottom=910,center=(goalTop+goalBottom)/2;
 function launch(team,y,behavior,id,direction,dist=500){
  game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
  game.wind={x:0,y:0};game.players=[];const b=game.ball,toward=team===0?1:-1,goalX=team===0?field.x+field.w:field.x;
  Object.assign(b,{x:goalX-toward*dist,y,z:0,vx:toward*1250,vy:0,vz:0,owner:null,age:0,canCollect:5,attacker:-1,ordinaryShot:false,pass:false,strike:null,trail:[],shot:{id,behavior,direction,level:2}});
  for(let i=0;i<100&&game.score[0]+game.score[1]===0;i++)game.updateBall(1/120);
  return {score:game.score.slice(),events:game.events.map(e=>e.type),ball:{x:b.x,y:b.y,z:b.z}};
 }
 for(const team of [0,1]){const r=launch(team,center,'warp','omega',team===0?1:-1);if(r.score[team]!==1)throw Error('Omega warp goal-mouth score failed '+JSON.stringify({team,r}));}
 const warpMissLeft=launch(0,goalTop+11,'warp','omega',-1,225),warpMissRight=launch(1,goalBottom-11,'warp','omega',1,225);
 if(warpMissLeft.score[0]||warpMissRight.score[1])throw Error('Warp became a guaranteed goal at the frame edge '+JSON.stringify({warpMissLeft,warpMissRight}));
 results.push({kind:'warp-goal-and-edge-miss'});
 // Burrow keeps a real, shallow z lane, then the ordinary ball physics resumes.
 game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
 game.matchState='paused';game.wind={x:0,y:0};game.players=[];let b=game.ball;
 Object.assign(b,{x:1200,y:y0,z:0,vx:250,vy:0,vz:0,owner:null,age:0,canCollect:5,attacker:-1,ordinaryShot:false,pass:false,strike:null,trail:[],shot:{id:'mole',behavior:'burrow',direction:1,level:2}});
 for(let i=0;i<24;i++)game.updateBall(1/60);
 if(b.age<.35||b.z<3||b.z>9||Math.abs(b.vz)>8.34)throw Error('Mole burrow did not stay in its ground lane '+JSON.stringify({age:b.age,z:b.z,vz:b.vz}));
 for(let i=0;i<90&&b.shot;i++)game.updateBall(1/60);
 if(b.shot||!game.events.some(e=>e.type==='shotTransformEnd')||!Number.isFinite(b.z)||!Number.isFinite(b.vz))throw Error('Burrow failed to recover to ordinary flight '+JSON.stringify({age:b.age,z:b.z,vz:b.vz,shot:b.shot}));
 results.push({kind:'burrow-recovery',age:b.age,z:b.z});
 // Bitter Shot uses the unmodified real swept keeper contact path.
 for(const side of [0,1]){
  game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
  const keeper=game.player(side,0),toward=side===0?-1:1;keeper.x=side===0?220:3300;keeper.y=center;keeper.fatigue=0;keeper.diveCooldown=0;keeper.stun=0;
  b=game.ball;b.owner=null;b.attacker=1-side;b.x=keeper.x-toward*20;b.y=center;b.z=12;b.vx=toward*1100;b.vy=0;b.vz=0;b.age=.4;
  b.shot={id:'ghost',behavior:'phase',direction:1,level:2};const previous={x:b.x,y:b.y,z:b.z};b.x+=toward*60;
  if(!game.trySweptKeeperDive(previous)||!game.events.some(e=>e.type==='keeperContact')||b.shot)throw Error('Phase shot skipped ordinary keeper interception '+JSON.stringify({side,shot:b.shot}));
  results.push({kind:'phase-swept-save',side});
 }
 return {scenarios:results.length,warpHz:[30,60,120],warpGoals:2,warpEdgeMisses:2,burrowRecovered:true,phaseSweptSaves:2,results};
}"""

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto('file://' + str(ROOT / 'tests/.generated/play.html'))
        page.wait_for_function("typeof window.SupermagicFootball?.game?.updateBall==='function'", timeout=20000)
        result = page.evaluate(JS)
        assert result['scenarios'] == 10 and result['warpGoals'] == 2 and result['warpEdgeMisses'] == 2 and result['burrowRecovered'] and result['phaseSweptSaves'] == 2, result
        if errors:
            raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result, 'pageErrors': errors})

if __name__ == '__main__':
    main()
