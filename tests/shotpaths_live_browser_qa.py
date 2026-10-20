"""SH01 live ball physics in actual Chromium desktop and simulated-touch fixtures."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf8')
JS = r"""() => {
  const game=window.SupermagicFootball?.game;
  if(!game || typeof game.updateBall!=='function')throw Error('playable engine not available');
  const profiles={books:{amplitude:28,frequency:10},serpent:{amplitude:45,frequency:15}};
  const initialY=765,results=[];
  function expected(id,dir,t){
    const p=profiles[id],age=Math.min(1.65,t),s=Math.sin(age*p.frequency);
    const fade=age>1.3?Math.pow((1.65-age)/.35,2)*(3-2*((1.65-age)/.35)):1;
    return dir*p.amplitude*s*s*s*fade;
  }
  for(const id of ['books','serpent'])for(const dir of [-1,1])for(const fps of [30,60,120]){
    game.init({home:0,away:9,humans:2,mode:'quick',options:{...game.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
    game.matchState='paused';game.wind={x:0,y:0};
    game.ball={...game.ball,x:1280,y:initialY,z:0,vx:250,vy:0,vz:0,owner:null,age:0,
      canCollect:5,attacker:-1,ordinaryShot:false,pass:false,strike:null,trail:[],
      shot:{id,behavior:'zigzag',direction:dir,zigzagAmplitude:profiles[id].amplitude,
        zigzagFrequency:profiles[id].frequency,aimY:initialY,level:2}};
    let t=0;const samples={};
    for(const end of [.2,.32,.8,1.65,1.9]){
      while(t<end-1e-9){
        const dt=Math.min(1/fps,end-t);
        game.updateBall(dt);t+=dt;
      }
      const b=game.ball,offset=b.y-initialY,target=expected(id,dir,end);
      if(!Number.isFinite(offset)||Math.abs(offset-target)>.0001)
        throw Error('Live zigzag not phase-correct '+JSON.stringify({id,dir,fps,end,offset,target}));
      samples[String(end)]={offset,vy:b.vy};
    }
    if(Math.abs(samples['1.9'].offset)>.0001||Math.abs(samples['1.9'].vy)>.0001)
      throw Error('Zigzag retained sideways drift '+JSON.stringify({id,dir,fps,samples}));
    results.push({id,dir,fps,at20:samples['0.2'].offset,at32:samples['0.32'].offset});
  }
  if(Math.abs(results[0].at20)<5)throw Error('Books lateral bend not visible');
  const count=document.querySelectorAll('#touchButtons button[data-act]').length;
  if(count!==4)throw Error('Original four-button controls changed '+count);
  return {scenarios:results.length,controls:count,books:results[0].at20,serpent:results[6].at32};
}"""

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    for label, mobile in [('desktop', False), ('simulated-touch', True)]:
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720} if not mobile else {'width': 844, 'height': 390},
            is_mobile=mobile, has_touch=mobile,
        )
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(HTML, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=30000)
        result = page.evaluate(JS)
        assert result['scenarios'] == 12 and result['controls'] == 4, (label, result)
        assert not errors, (label, errors)
        print('SH01_LIVE_ZIGZAG_BROWSER_PASS', label, result, flush=True)
        context.close()
    browser.close()
