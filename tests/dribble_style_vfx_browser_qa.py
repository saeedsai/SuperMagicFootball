from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf-8')
STYLES = ['sideStep', 'roulette', 'elastico', 'rainbow', 'swerve', 'dragBack', 'heelFlick', 'stepovers', 'nutmeg', 'lightningCut']
OUT = ROOT / 'docs/evidence/browser/dribble_style_vfx_012852.png'
OUT.parent.mkdir(parents=True, exist_ok=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    page = browser.new_page(viewport={'width': 1880, 'height': 700}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(HTML, wait_until='load', timeout=60000)
    page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer && !!window.SupermagicFootball?.game', timeout=30000)
    result = page.evaluate("""styles => {
      const canvas=document.createElement('canvas');canvas.width=1880;canvas.height=700;
      canvas.style='position:fixed;inset:0;width:1880px;height:700px;z-index:99999';
      const ctx=canvas.getContext('2d');ctx.fillStyle='#07152c';ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#f7f4df';ctx.font='700 26px system-ui';ctx.fillText('TEN DISTINCT DRIBBLE STYLE CONTACT CUES · EXISTING PLAYER RENDERER',28,38);
      const game=SupermagicFootball.game,renderer=SupermagicFootball.renderer,source=game.player(0,3);
      const before=JSON.stringify({players:game.players,ball:game.ball,options:game.options,clock:game.clock,score:game.score});
      const samples=[];
      styles.forEach((style,index)=>{
        const column=index%5,row=Math.floor(index/5),x=138+column*350,y=245+row*300;
        const player={...source,x:0,y:0,face:1,dx:0,dy:0,moveVX:0,moveVY:0,z:0,preview:false,action:'dribbleTrick',trickFx:.38,trickStyleId:style,controlled:false};
        ctx.save();ctx.translate(x,y);ctx.scale(1,1);renderer.drawPlayer(ctx,player,game);ctx.restore();
        ctx.fillStyle='#f4f7ff';ctx.font='600 18px system-ui';ctx.textAlign='center';ctx.fillText(style,x,y+112);
        samples.push({style,face:1,drawn:true});
        const mirrored={...player,face:-1};
        ctx.save();ctx.translate(x+165,y);ctx.scale(1,1);renderer.drawPlayer(ctx,mirrored,game);ctx.restore();
        samples.push({style,face:-1,drawn:true});
      });
      document.body.append(canvas);
      const after=JSON.stringify({players:game.players,ball:game.ball,options:game.options,clock:game.clock,score:game.score});
      return {styles:styles.length,samples,stateUnchanged:before===after,canvas:{width:canvas.width,height:canvas.height}};
    }""", STYLES)
    page.screenshot(path=str(OUT), full_page=False)
    assert result['styles'] == 10 and len(result['samples']) == 20 and result['stateUnchanged']
    assert not errors, errors
    print('DRIBBLE_STYLE_VFX_BROWSER_PASS', {'styles': STYLES, 'samples': len(result['samples']), 'stateUnchanged': result['stateUnchanged'], 'errors': errors, 'screenshot': str(OUT)}, flush=True)
    browser.close()
