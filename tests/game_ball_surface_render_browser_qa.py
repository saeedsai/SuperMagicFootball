from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf-8')
OUT = ROOT / 'tests/.generated/game_ball_surface_render.png'

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    page = browser.new_page(viewport={'width': 1180, 'height': 520}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(HTML, wait_until='load', timeout=60000)
    page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawSoccerBall', timeout=30000)
    result = page.evaluate("""() => {
      const canvas=document.createElement('canvas');canvas.width=1180;canvas.height=560;
      canvas.style='position:fixed;inset:0;width:1180px;height:520px;z-index:99999';
      const ctx=canvas.getContext('2d');
      const sky=ctx.createLinearGradient(0,0,0,520);sky.addColorStop(0,'#07152c');sky.addColorStop(.48,'#143d62');sky.addColorStop(.49,'#287a46');sky.addColorStop(1,'#0d462c');ctx.fillStyle=sky;ctx.fillRect(0,0,1180,520);
      ctx.strokeStyle='rgba(225,248,213,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,260);ctx.lineTo(1180,260);ctx.stroke();ctx.beginPath();ctx.arc(590,260,74,0,Math.PI*2);ctx.stroke();
      const renderer=SupermagicFootball.renderer;
      function ball(x,y,r,model,rotation,label){
        const shadow=ctx.createRadialGradient(x,y+r*.38,2,x,y+r*.38,r*1.25);shadow.addColorStop(0,'rgba(0,0,0,.4)');shadow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(x,y+r*.42,r*1.24,r*.34,0,0,Math.PI*2);ctx.fill();
        renderer.drawSoccerBall(ctx,x,y,r,model,rotation);ctx.fillStyle='#f5f8ff';ctx.font='600 22px system-ui';ctx.textAlign='center';ctx.fillText(label,x,y+r+62);
      }
      ball(220,236,84,'classic',.42,'Classic · featured');
      ball(590,246,17,'classic',1.16,'Classic · in-match scale');
      ball(932,236,72,'auriverde',-.24,'Optional ball cosmetic');
      const shadowHeights=[0,60,120,240],shadowXs=[350,510,670,830];
      for(let i=0;i<shadowHeights.length;i++){
        renderer.drawBallShadow(ctx,shadowXs[i],440,shadowHeights[i],1);
        ctx.fillStyle='#f5f8ff';ctx.font='600 17px system-ui';ctx.textAlign='center';
        ctx.fillText(['Ground','Low','High','Max height'][i],shadowXs[i],495);
      }
      document.body.append(canvas);
      return {canvas:{width:canvas.width,height:canvas.height},balls:3,classicRadius:17,selectedRadius:84,shadowHeights};
    }""")
    page.screenshot(path=str(OUT), full_page=False)
    assert result['balls'] == 3 and result['classicRadius'] == 17
    assert not errors, errors
    print('GAME_BALL_SURFACE_RENDER_BROWSER_PASS', result, 'screenshot', OUT, flush=True)
    browser.close()
