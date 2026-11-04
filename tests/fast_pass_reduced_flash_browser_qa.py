"""Actual Canvas renderer check for reduced-flash fast-pass presentation."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tests/.generated/fast_pass_reduced_flash.png'

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    page = browser.new_page(viewport={'width': 800, 'height': 400}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto((ROOT / 'tests/.generated/play.html').as_uri(), wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawBall', timeout=30000)
    result = page.evaluate("""() => {
      const canvas=document.createElement('canvas');canvas.width=800;canvas.height=400;
      canvas.style='position:fixed;left:0;top:0;width:800px;height:400px;z-index:99999';
      const ctx=canvas.getContext('2d'),renderer=SupermagicFootball.renderer;
      ctx.fillStyle='#102c47';ctx.fillRect(0,0,800,400);
      ctx.fillStyle='#357d4c';ctx.fillRect(0,42,800,358);
      ctx.strokeStyle='rgba(239,248,216,.22)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(0,210);ctx.lineTo(800,210);ctx.stroke();
      const rows=[{speed:284,y:108},{speed:286,y:205},{speed:420,y:302}];
      const samples=[];
      for(let i=0;i<rows.length;i++){
        const {speed,y}=rows[i];
        for(const [reducedFlash,x] of [[false,245],[true,555]]){
          ctx.fillStyle='#f2f6ff';ctx.font='600 16px system-ui';ctx.textAlign='center';
          ctx.fillText(`${speed} · ${reducedFlash?'REDUCED FLASH':'STANDARD'}`,x,y-38);
          const ball={x,y,z:0,vx:speed,vy:0,vz:0,owner:null,shot:null,trail:[],rollAngle:0};
          const before=JSON.stringify(ball);
          renderer.drawBall(ctx,{ball,options:{reducedFlash,ballModel:'classic'}});
          samples.push({speed,reducedFlash,stateUnchanged:before===JSON.stringify(ball),x,y});
        }
      }
      document.body.append(canvas);
      const pixel=(x,y)=>Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3);
      const normalCue=pixel(245-17,302),reducedCue=pixel(555-17,302);
      const normalTail=pixel(245-25,302),reducedTail=pixel(555-25,302),belowThreshold=pixel(245-25,108);
      return {canvas:{width:800,height:400},samples,normalCue,reducedCue,normalTail,reducedTail,belowThreshold};
    }""")
    page.locator('canvas').last.screenshot(path=str(OUT))
    assert len(result['samples']) == 6 and all(row['stateUnchanged'] for row in result['samples']), result
    assert result['normalCue'] != result['reducedCue'], result
    assert result['normalTail'] != [53,125,76], result
    assert result['reducedTail'] == [53,125,76] and result['belowThreshold'] == [53,125,76], result
    assert not errors, errors
    print('FAST_PASS_REDUCED_FLASH_BROWSER_PASS', result, 'screenshot', OUT, flush=True)
    browser.close()
