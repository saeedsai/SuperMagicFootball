from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf-8')
OUT = ROOT / 'docs/evidence/browser/ball_carrier_roll_012851.png'
OUT.parent.mkdir(parents=True, exist_ok=True)

MODELS = ['classic', 'meteor', 'ice', 'gold', 'retro']
HEADINGS = [
    ('E', 1, 0), ('SE', 1, 1), ('S', 0, 1), ('SW', -1, 1),
    ('W', -1, 0), ('NW', -1, -1), ('N', 0, -1), ('NE', 1, -1),
]

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    page = browser.new_page(viewport={'width': 1480, 'height': 760}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(HTML, wait_until='load', timeout=60000)
    page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawBall', timeout=30000)
    result = page.evaluate("""({models, headings}) => {
      const canvas=document.createElement('canvas');canvas.width=1480;canvas.height=760;canvas.style='position:fixed;inset:0;width:1480px;height:760px;z-index:99999';
      const ctx=canvas.getContext('2d');
      const bg=ctx.createLinearGradient(0,0,0,760);bg.addColorStop(0,'#07152c');bg.addColorStop(.52,'#123c32');bg.addColorStop(1,'#174c36');ctx.fillStyle=bg;ctx.fillRect(0,0,1480,760);
      ctx.fillStyle='#f7f4df';ctx.font='700 25px system-ui';ctx.fillText('PLAYER-CARRIED MATCH BALL · 17 UNIT GAME RADIUS',32,38);
      const renderer=SupermagicFootball.renderer, samples=[];
      const startX=118,startY=112,cellW=168,cellH=124,scale=1.72;
      models.forEach((model,row)=>{
        ctx.fillStyle='#f5f8ff';ctx.font='600 18px system-ui';ctx.textAlign='right';ctx.fillText(model.toUpperCase(),95,startY+row*cellH+37);
        headings.forEach(([label,moveVX,moveVY],col)=>{
          const x=startX+col*cellW,y=startY+row*cellH;
          ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
          const ball={x:0,y:0,z:0,vx:0,vy:0,vz:0,owner:{x:0,y:0,keeper:false,moveVX,moveVY,hideBallTimer:0},shot:null,trail:[],rollAngle:col*Math.PI/7};
          const options={ballModel:model,reducedFlash:false},before=JSON.stringify({ball,options});
          renderer.drawBall(ctx,{ball,options});
          const stateUnchanged=JSON.stringify({ball,options})===before;
          ctx.restore();ctx.fillStyle='#e4edfa';ctx.font='14px system-ui';ctx.textAlign='center';ctx.fillText(label,x,y+53);
          samples.push({model,heading:label,radius:17,roll:col*Math.PI/7,stateUnchanged});
        });
      });
      document.body.append(canvas);
      return {models:models.length,headings:headings.length,samples,canvas:{width:canvas.width,height:canvas.height}};
    }""", {'models': MODELS, 'headings': HEADINGS})
    page.screenshot(path=str(OUT), full_page=False)
    assert result['models'] == 5 and result['headings'] == 8 and len(result['samples']) == 40
    assert all(sample['radius'] == 17 and sample['stateUnchanged'] for sample in result['samples'])
    assert not errors, errors
    print('GAME_BALL_CARRIER_ROLL_BROWSER_PASS', {'samples': len(result['samples']), 'models': MODELS, 'headings': [h[0] for h in HEADINGS], 'errors': errors, 'screenshot': str(OUT)}, flush=True)
    browser.close()
