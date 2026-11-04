#!/usr/bin/env python3
"""Capture Spin Bumper's visual-only impact and recovery pose in eight views."""
from pathlib import Path
import base64
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build current modular browser fixture first'
html = fixture.read_text(encoding='utf8')
output = ROOT / 'tests/.generated/art102_spin_bumper_impact_gallery.png'

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    page = browser.new_page(viewport={'width': 1600, 'height': 1700}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(html, wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
    result = page.evaluate('''() => {
      const api=SupermagicFootball,g=api.game;
      g.init({home:0,away:9,humans:1,mode:'quick'});
      const p=g.player(0,2);
      p.src={...p.src,role:'DF',superDefenceLevel:3,
       superAbility:{type:'defence',id:'spinBumper',level:3}};
      const directions=[
       ['front',0,1],['frontRight',.5,.866],['right',1,0],['backRight',.5,-.866],
       ['back',0,-1],['backLeft',-.5,-.866],['left',-1,0],['frontLeft',-.5,.866]
      ];
      // Sample the full existing .28-second impact timer, leaving a positive
      // final sample so the production renderer still selects recovery.
      const remaining=[.28,.21,.14,.07,.001],canvas=document.createElement('canvas');
      canvas.width=1520;canvas.height=1640;const ctx=canvas.getContext('2d');
      const tile=document.createElement('canvas');tile.width=180;tile.height=190;const tileCtx=tile.getContext('2d');
      ctx.fillStyle='#233a36';ctx.fillRect(0,0,canvas.width,canvas.height);
      const physicsKeys=['x','y','dx','dy','vx','vy','z','stun','health','energy'];
      let cells=0,physicsUnchanged=true;const hashes=[];
      directions.forEach(([label,dx,dy],row)=>{
       ctx.fillStyle='#fff4cc';ctx.font='bold 17px sans-serif';ctx.textAlign='left';ctx.fillText(label,4,row*205+98);
       remaining.forEach((timer,col)=>{
        const x=145+col*190,y=row*205+8;
        // Identical, fixed-coordinate tile renders keep phase hashes sensitive
        // to the rendered pose instead of world position or background color.
        tileCtx.fillStyle='#324943';tileCtx.fillRect(0,0,tile.width,tile.height);
        p.x=90;p.y=174;p.dx=dx;p.dy=dy;p.face=dx<0?-1:1;p.visualFacing=null;
        // The existing telegraph expiry may already have idled the defender
        // before the impact tail is rendered, so exercise the normal idle state.
        p.action='idle';p.actionTimer=0;p.stun=0;p.z=0;p.preview=true;
        p.spinBumperPending=null;p.spinBumperImpactFx=timer;
        const before=Object.fromEntries(physicsKeys.map(key=>[key,p[key]]));
        api.renderer.drawPlayer(tileCtx,p,g);cells++;
        const after=Object.fromEntries(physicsKeys.map(key=>[key,p[key]]));
        physicsUnchanged=physicsUnchanged&&JSON.stringify(before)===JSON.stringify(after);
        ctx.drawImage(tile,x,y);
        const pixels=tileCtx.getImageData(0,0,tile.width,tile.height).data;let checksum=0;
        for(let i=0;i<pixels.length;i++)checksum=(checksum+pixels[i]*(i+1))%9007199254740881;
        hashes.push({row,col,checksum});
       });
      });
      const phaseCounts=directions.map((_,row)=>new Set(hashes.filter(h=>h.row===row).map(h=>h.checksum)).size);
      const headingCounts=remaining.map((_,col)=>new Set(hashes.filter(h=>h.col===col).map(h=>h.checksum)).size);
      return {cells,width:canvas.width,height:canvas.height,phaseCounts,headingCounts,
       physicsUnchanged,url:canvas.toDataURL('image/png')};
    }''')
    assert result['cells'] == 40 and (result['width'], result['height']) == (1520, 1640), result
    assert result['phaseCounts'] == [5] * 8, ('impact/recovery did not visibly progress in every heading', result['phaseCounts'])
    assert all(count >= 5 for count in result['headingCounts']), ('view gallery has duplicate silhouettes', result['headingCounts'])
    assert result['physicsUnchanged'], 'rendering changed gameplay state'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(base64.b64decode(result['url'].split(',', 1)[1]))
    assert not errors, errors
    print('ART102_SPIN_BUMPER_IMPACT_GALLERY_PASS', output, {key: value for key, value in result.items() if key != 'url'}, flush=True)
    browser.close()
